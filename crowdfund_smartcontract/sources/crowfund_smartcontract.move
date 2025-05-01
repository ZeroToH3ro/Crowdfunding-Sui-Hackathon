module crowfund_smartcontract::crowdfunding {
    // Added coin::split to imports
    use sui::coin::{Self, Coin, split};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::object::{Self, ID, UID};
    // Removed explicit import of balance::withdraw as it wasn't found
    use sui::balance::{Self, Balance};
    use sui::table::{Self, Table};
    use std::option::{Self, Option};
    use std::string::{Self, String};
    // Import SUI type for clarity
    use sui::sui::SUI;

    // ========= Constants =========

    // Custom error codes
    const ECAMPAIGN_NOT_ENDED: u64 = 1;
    const EGOAL_NOT_REACHED: u64 = 2;
    const EALREADY_CLAIMED: u64 = 3;
    const EINVALID_AMOUNT: u64 = 4; // Kept for potential future use
    const EDEADLINE_PASSED: u64 = 5;
    const ECREATOR_CAP_MISMATCH: u64 = 100;
    const EWRONG_CREATOR: u64 = 101;
    const EGOAL_REACHED_NO_REFUND: u64 = 102;
    const EREFUND_NOT_AVAILABLE_YET: u64 = 103;
    const ENO_DONATION_FOUND: u64 = 104;
    // const EALREADY_REFUNDED: u64 = 105; // Covered by EREFUND_AMOUNT_ZERO check
    const EREFUND_AMOUNT_ZERO: u64 = 106; // Explicit check for zero refund value


    // ========= Structs =========

    /// Represents a crowdfunding campaign
    public struct Campaign has key, store {
        id: UID,
        creator: address,
        goal: u64,
        deadline: u64, // Epoch timestamp
        raised_amount: Balance<SUI>, // Still tracks total balance, using SUI type alias
        claimed: bool,
        name: String,
        description: String,
        // Table tracks total u64 amount donated per address
        donations: Table<address, u64>,
    }

    /// Capability indicating ownership/creation rights
    public struct CreatorCap has key, store {
        id: UID,
        campaign_id: ID,
    }

    // ========= Public Functions =========

    /// Creates a new crowdfunding campaign
    public entry fun create_campaign(
        name: String,
        description: String,
        goal: u64,
        deadline_epochs: u64,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        let campaign_id = object::new(ctx);
        let current_epoch = tx_context::epoch(ctx);

        let campaign = Campaign {
            id: campaign_id,
            creator: sender,
            goal: goal,
            deadline: current_epoch + deadline_epochs,
            raised_amount: balance::zero<SUI>(), // Use SUI type alias
            claimed: false,
            name: name,
            description: description,
            donations: table::new<address, u64>(ctx),
        };

        let creator_cap = CreatorCap {
            id: object::new(ctx),
            campaign_id: object::id(&campaign)
        };
        transfer::public_transfer(creator_cap, sender);
        transfer::public_share_object(campaign);
    }

    /// Allows anyone to donate SUI to a specific campaign
    public entry fun donate(
        campaign: &mut Campaign,
        amount: Coin<SUI>, // Use SUI type alias
        ctx: &mut TxContext
    ) {
        let donor = tx_context::sender(ctx);
        assert!(tx_context::epoch(ctx) < campaign.deadline, EDEADLINE_PASSED);

        let donated_balance = coin::into_balance(amount);
        let donation_value = balance::value(&donated_balance);
        assert!(donation_value > 0, EINVALID_AMOUNT);

        balance::join(&mut campaign.raised_amount, donated_balance);

        if (table::contains(&campaign.donations, donor)) {
            let current_donation_ref = table::borrow_mut(&mut campaign.donations, donor);
            *current_donation_ref = *current_donation_ref + donation_value;
        } else {
            table::add(&mut campaign.donations, donor, donation_value);
        };
    }

    /// Allows the creator to claim the funds if the goal is reached and the deadline has passed
    public entry fun claim_funds(
        campaign: &mut Campaign,
        cap: &CreatorCap,
        ctx: &mut TxContext
    ) {
        assert!(object::id(campaign) == cap.campaign_id, ECREATOR_CAP_MISMATCH);
        assert!(tx_context::sender(ctx) == campaign.creator, EWRONG_CREATOR);
        assert!(tx_context::epoch(ctx) >= campaign.deadline, ECAMPAIGN_NOT_ENDED);
        assert!(balance::value(&campaign.raised_amount) >= campaign.goal, EGOAL_NOT_REACHED);
        assert!(!campaign.claimed, EALREADY_CLAIMED);

        campaign.claimed = true;

        let total_raised_balance = balance::withdraw_all(&mut campaign.raised_amount);

        // Specify SUI type for from_balance
        transfer::public_transfer(coin::from_balance<SUI>(total_raised_balance, ctx), campaign.creator);
    }


    /// Allows a donor to request a refund if the goal was NOT met after the deadline
    /// Uses coin::split approach as balance::withdraw was not found.
    public entry fun request_refund(
        campaign: &mut Campaign,
        ctx: &mut TxContext
    ) {
        let donor = tx_context::sender(ctx);

        assert!(tx_context::epoch(ctx) >= campaign.deadline, EREFUND_NOT_AVAILABLE_YET);
        assert!(balance::value(&campaign.raised_amount) < campaign.goal, EGOAL_REACHED_NO_REFUND);
        assert!(!campaign.claimed, EALREADY_CLAIMED);
        assert!(table::contains(&campaign.donations, donor), ENO_DONATION_FOUND);

        let refund_value = table::remove(&mut campaign.donations, donor);
        assert!(refund_value > 0, EREFUND_AMOUNT_ZERO);

        // --- Start coin::split refund logic ---
        // 1. Withdraw the entire balance from the campaign temporarily
        let total_balance = balance::withdraw_all(&mut campaign.raised_amount);

        // 2. Create a single Coin object from the total balance
        let mut total_coin = coin::from_balance<SUI>(total_balance, ctx);

        // 3. Split the required refund amount into a new Coin
        //    Requires importing coin::split
        let refund_coin = coin::split<SUI>(&mut total_coin, refund_value, ctx);

        // 4. Transfer the specific refund Coin to the donor
        transfer::public_transfer(refund_coin, donor);

        // 5. Put the remaining value in total_coin back into the campaign's balance
        let remaining_balance = coin::into_balance(total_coin);
        balance::join(&mut campaign.raised_amount, remaining_balance);
        // --- End coin::split refund logic ---
    }


    // --- Test Helper Function Removed ---


    // --- Getter Functions ---

    // Using SUI type alias for consistency
    public fun get_campaign_details(campaign: &Campaign): (address, u64, u64, u64, bool, String, String) {
        (
            campaign.creator,
            campaign.goal,
            balance::value(&campaign.raised_amount),
            campaign.deadline,
            campaign.claimed,
            campaign.name,
            campaign.description
        )
    }

    public fun get_goal(campaign: &Campaign): u64 { campaign.goal }
    public fun get_raised_amount(campaign: &Campaign): u64 { balance::value(&campaign.raised_amount) }
    public fun get_deadline(campaign: &Campaign): u64 { campaign.deadline }
    public fun is_claimed(campaign: &Campaign): bool { campaign.claimed }
    public fun get_creator(campaign: &Campaign): address { campaign.creator }
    public fun get_name(campaign: &Campaign): String { campaign.name }
    public fun get_description(campaign: &Campaign): String { campaign.description }

    public fun get_donation_by_address(campaign: &Campaign, donor: address): u64 {
        if (table::contains(&campaign.donations, donor)) {
            *table::borrow(&campaign.donations, donor)
        } else {
            0
        }
    }

    public fun get_donor_count(campaign: &Campaign): u64 {
        table::length(&campaign.donations)
    }
}
