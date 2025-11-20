
import React from 'react';

const LoadingSpinner: React.FC<{ size?: string }> = ({ size = 'h-5 w-5' }) => {
  return (
    <div className={`animate-spin rounded-full border-2 border-zinc-200 dark:border-zinc-800 border-t-primary-500 ${size}`} />
  );
};

export default LoadingSpinner;
