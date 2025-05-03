import { useState } from 'react';

export default function useMessages() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const showMessage = (msg, isError = false) => {
    if (isError) {
      setError(msg);
      setSuccessMessage(null);
    } else {
      setSuccessMessage(msg);
      setError(null);
    }
    
    // Clear message after some time
    setTimeout(() => {
      setError(null);
      setSuccessMessage(null);
    }, 5000);
  };

  return {
    loading,
    setLoading,
    error,
    setError,
    successMessage,
    setSuccessMessage,
    showMessage
  };
}