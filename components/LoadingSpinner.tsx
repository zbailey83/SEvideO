
import React from 'react';

const LoadingSpinner: React.FC<{ size?: string }> = ({ size = 'h-8 w-8' }) => {
  return (
    <div className={`animate-spin rounded-full border-4 border-t-4 border-gray-600 border-t-indigo-500 ${size}`} />
  );
};

export default LoadingSpinner;
