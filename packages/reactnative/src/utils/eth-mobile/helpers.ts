import { ethers } from 'ethers';
import moment from 'moment';

export function truncateAddress(address: string) {
  return `${address.slice(0, 5)}...${address.slice(address.length - 4, address.length)}`;
}

/**
 * Truncates string (in the middle) via given lenght value
 */
export function truncate(value: string, length: number) {
  if (value?.length <= length) {
    return value;
  }

  const separator = '...';
  const stringLength = length - separator.length;
  const frontLength = Math.ceil(stringLength / 2);
  const backLength = Math.floor(stringLength / 2);

  return (
    value.substring(0, frontLength) +
    separator +
    value.substring(value.length - backLength)
  );
}

export function parseFloat(str: string, val: number) {
  str = str.toString();
  str = str.slice(0, str.indexOf('.') + val + 1);
  return Number(str);
}

export const isENS = (name = '') =>
  name.endsWith('.eth') || name.endsWith('.xyz');

export const parseIPFS = (uri: string) =>
  uri.replace('ipfs://', 'https://api.universalprofile.cloud/ipfs/');

export function parseBalance(value: bigint, decimals: number = 18): string {
  const balance = Number(ethers.formatUnits(value, decimals))
    ? parseFloat(Number(ethers.formatUnits(value, decimals)).toString(), 4)
    : 0;

  return balance.toString();
}

/**
 * Converts a blockchain timestamp (BigInt) to a human-readable relative time format.
 *
 * @param timestamp - The UNIX timestamp in milliseconds (BigInt or number).
 * @returns A human-readable time string (e.g., "5 minutes ago").
 */
export function parseTimestamp(timestamp: bigint | number): string {
  const timestampInMs = Number(timestamp);
  return moment(timestampInMs).fromNow();
}

// Utility function to multiply a value by 1e18 (for token amounts)
export function multiplyTo1e18(value: string | number): bigint {
  if (typeof value === 'string') {
    return BigInt(Math.round(Number(value) * 10 ** 18));
  }
  return BigInt(Math.round(value * 10 ** 18));
}

// Utility function to calculate token price in ETH
export function getTokenPrice(
  tokenAmount: string | bigint,
  tokensPerEth: bigint | number
): bigint {
  const amount =
    typeof tokenAmount === 'string' ? Number(tokenAmount) : Number(tokenAmount);
  const rate =
    typeof tokensPerEth === 'bigint' ? Number(tokensPerEth) : tokensPerEth;

  if (rate === 0) return 0n;

  const ethAmount = amount / rate;
  return multiplyTo1e18(ethAmount);
}
