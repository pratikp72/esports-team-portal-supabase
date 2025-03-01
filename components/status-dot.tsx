import React from 'react'

const StatusDot = ({ isAvailable }: { isAvailable: boolean }) => {
    return (
      <span
        className={`w-3 h-3 rounded-full ${
            isAvailable ? 'bg-green-500' : 'bg-red-500'
        }`}
      />
    );
  };

export default StatusDot