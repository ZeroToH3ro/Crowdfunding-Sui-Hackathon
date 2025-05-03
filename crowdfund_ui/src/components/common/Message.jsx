/* eslint-disable react/prop-types */
import React from 'react';

export default function Message({ loading, error, successMessage }) {
  return (
    <>
      {loading && (
        <div className="mb-4 p-3 text-center bg-yellow-100 text-yellow-700 rounded-lg">
          Processing transaction...
        </div>
      )}
      {error && (
        <div className="mb-4 p-3 text-center bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="mb-4 p-3 text-center bg-green-100 text-green-700 rounded-lg">
          {successMessage}
        </div>
      )}
    </>
  );
}