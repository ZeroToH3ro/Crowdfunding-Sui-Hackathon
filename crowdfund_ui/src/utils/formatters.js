export const formatSUI = (mist) => {
    const amount = Number(mist || 0) / 1_000_000_000;
    return amount.toFixed(4);
};
  
export const calculateProgress = (raised, goal) => {
    const raisedNumber = Number(raised);
    const goalNumber = Number(goal);
    return goalNumber > 0 ? Math.min(100, Math.round((raisedNumber / goalNumber) * 100)) : 0;
};
  
export const truncateAddress = (address, length = 8) => {
    if (!address) return '';
    return `${address.substring(0, length)}...`;
};