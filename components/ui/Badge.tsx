import React from 'react';
import { ProductStatus, OrderStatus } from '../../types';

interface BadgeProps {
  status?: ProductStatus | OrderStatus | string;
  type?: 'success' | 'warning' | 'danger' | 'neutral' | 'info';
  size?: 'sm' | 'md' | 'lg';
  children?: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ status, type, size = 'sm', children, className = '' }) => {
  let colorClass = 'bg-gray-100 text-gray-800 border-transparent';

  // Soft pastel palette
  if (type) {
    switch (type) {
      case 'success': colorClass = 'bg-emerald-50 text-emerald-700 border-emerald-100'; break;
      case 'warning': colorClass = 'bg-amber-50 text-amber-700 border-amber-100'; break;
      case 'danger': colorClass = 'bg-rose-50 text-rose-700 border-rose-100'; break;
      case 'info': colorClass = 'bg-sky-50 text-sky-700 border-sky-100'; break;
      default: colorClass = 'bg-stone-100 text-stone-600 border-stone-200';
    }
  } else if (status) {
    switch (status) {
      // Product Statuses
      case ProductStatus.ACTIVE:
        colorClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
        break;
      case ProductStatus.SOLD_OUT:
        colorClass = 'bg-sky-50 text-sky-700 border-sky-200';
        break;
      case ProductStatus.EXPIRED:
        colorClass = 'bg-stone-100 text-stone-500 border-stone-200 line-through decoration-stone-400';
        break;
        
      // Order Statuses - Distinct Colors for easy recognition
      case OrderStatus.NEW:
        colorClass = 'bg-purple-50 text-purple-700 font-bold border-purple-200';
        break;
      case OrderStatus.PREPARING:
        colorClass = 'bg-amber-50 text-amber-700 font-bold border-amber-200';
        break;
      case OrderStatus.READY:
        colorClass = 'bg-emerald-50 text-emerald-700 font-bold border-emerald-200';
        break;
      case OrderStatus.COMPLETED:
        colorClass = 'bg-slate-100 text-slate-600 font-bold border-slate-200';
        break;
        
      default:
        colorClass = 'bg-stone-100 text-stone-600 border-stone-200';
    }
  }

  const sizeClasses = {
    sm: 'px-2.5 py-0.5 text-xs',
    md: 'px-3 py-1 text-xs',
    lg: 'px-4 py-1.5 text-sm',
  };

  return (
    <span className={`inline-flex items-center rounded-lg font-semibold border ${colorClass} ${sizeClasses[size]} ${className} shadow-sm`}>
      {children || status}
    </span>
  );
};