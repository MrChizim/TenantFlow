import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNaira(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));
}

export function daysUntil(date: string | Date): number {
  const target = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function monthsUntil(date: string | Date): number {
  const target = new Date(date);
  const today = new Date();
  return (
    (target.getFullYear() - today.getFullYear()) * 12 +
    (target.getMonth() - today.getMonth())
  );
}

export type LeaseStatus = 'active' | 'expiring' | 'expired';

export function getLeaseStatus(endDate: string | Date): LeaseStatus {
  const days = daysUntil(endDate);
  if (days < 0) return 'expired';
  if (days <= 90) return 'expiring';
  return 'active';
}

export function getStatusLabel(status: LeaseStatus): string {
  return { active: 'Active', expiring: 'Expiring Soon', expired: 'Expired' }[status];
}
