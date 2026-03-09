import { ethers } from 'ethers';

export function truncateAddress(address: string) {
  return `${address.slice(0, 5)}...${address.slice(address.length - 4, address.length)}`;
}

export function parseFloat(str: string, val: number) {
  str = str.toString();
  str = str.slice(0, str.indexOf('.') + val + 1);
  return Number(str);
}

export const isENS = (name = '') =>
  name.endsWith('.eth') || name.endsWith('.xyz');

export function parseBalance(value: bigint, decimals: number = 18): string {
  const balance = Number(ethers.formatUnits(value, decimals))
    ? parseFloat(Number(ethers.formatUnits(value, decimals)).toString(), 4)
    : 0;

  return balance.toString();
}

/**
 * Formats a balance for display: "0" when zero, otherwise up to 4 decimals with trailing zeros removed.
 */
export function formatBalanceDisplay(
  value: string | number | null | undefined
): string {
  if (value == null) return '0';
  const n = Number(value);
  if (!Number.isFinite(n) || n === 0) return '0';
  return n.toFixed(4).replace(/\.?0+$/, '') || '0';
}

// Utility function to multiply a value by 1e18 (for token amounts)
export function multiplyTo1e18(value: string | number): bigint {
  if (typeof value === 'string') {
    return BigInt(Math.round(Number(value) * 10 ** 18));
  }
  return BigInt(Math.round(value * 10 ** 18));
}

// Utility function to get the initials of a network name
export function networkInitials(name: string): string {
  const words = name.split(/\s+/);
  if (words.length >= 2) {
    return (words[0][0] ?? '') + (words[1][0] ?? '');
  }
  return name.slice(0, 2).toUpperCase();
}
