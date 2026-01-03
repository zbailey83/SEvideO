import React from 'react';

const LoadingSpinner: React.FC<{ size?: string }> = ({ size = 'h-5 w-5' }) => {
  return (
    <div className={`animate-spin rounded-full border-2 border-stone-200 dark:border-stone-800 border-t-brand-gold ${size}`} />
  );
};

export default LoadingSpinner;