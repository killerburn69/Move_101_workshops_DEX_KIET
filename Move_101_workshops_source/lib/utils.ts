import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export const sliceAddress = (start: number, end: number, address: string): string => {
  // if (start >= end || start < 0 || end > address.length) {
  //   throw new Error('Invalid slice parameters');
  // }
  return `${address.slice(0, start)}...${address.slice(-end)}`;
}
