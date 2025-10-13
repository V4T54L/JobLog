import React from 'react';
import { Application } from '../types';

interface StatusBadgeProps {
  status: Application['status'];
  className?: string;
}

export default function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const getStatusClass = (status: Application['status']) => {
    switch (status) {
      case 'Applied':
        return 'status-applied';
      case 'Interviewing':
        return 'status-interviewing';
      case 'Offer':
        return 'status-offer';
      case 'Rejected':
        return 'status-rejected';
      case 'Archived':
        return 'status-archived';
      default:
        return 'status-applied';
    }
  };

  return (
    <span className={`status-badge ${getStatusClass(status)} ${className}`}>
      {status}
    </span>
  );
}