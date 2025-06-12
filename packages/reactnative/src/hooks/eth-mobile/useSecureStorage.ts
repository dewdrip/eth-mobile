import { useCallback, useState } from 'react';
import * as Keychain from 'react-native-keychain';

/**
 * Type for useSecureStorage return object.
 */
interface UseSecureStorageReturn {
  saveItem: <T>(key: string, value: T) => Promise<void>;
  saveItemWithBiometrics: <T>(key: string, value: T) => Promise<void>;
  getItem: (key: string) => Promise<string | null>;
  removeItem: (key: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

/**
 * A custom React hook for interacting with react-native-keychain.
 * It provides methods to securely store, retrieve, and remove sensitive data.
 *
 * @returns {UseSecureStorageReturn} The functions and states for secure storage.
 */
export function useSecureStorage(): UseSecureStorageReturn {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Save a key-value pair to Keychain.
   *
   * @template T - The type of the value being stored.
   * @param {string} key - The key to store the value under.
   * @param {T} value - The value to store (will be stringified if an object).
   * @returns {Promise<void>} - A promise that resolves when the operation is complete.
   */
  const saveItem = useCallback(
    async <T>(key: string, value: T): Promise<void> => {
      try {
        setLoading(true);
        setError(null);
        const stringValue =
          typeof value === 'object' ? JSON.stringify(value) : String(value);

        await Keychain.setGenericPassword(key, stringValue, {
          service: key,
          accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED
        });
      } catch (err) {
        setError((err as Error).message || 'Failed to save item.');
        console.error('useSecureStorage saveItem error:', err);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Save a key-value pair to Keychain with biometrics.
   *
   * @template T - The type of the value being stored.
   * @param {string} key - The key to store the value under.
   * @param {T} value - The value to store (will be stringified if an object).
   * @returns {Promise<void>} - A promise that resolves when the operation is complete.
   */
  const saveItemWithBiometrics = useCallback(
    async <T>(key: string, value: T): Promise<void> => {
      setLoading(true);
      setError(null);
      const stringValue =
        typeof value === 'object' ? JSON.stringify(value) : String(value);

      await Keychain.setGenericPassword(key, stringValue, {
        service: key,
        accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET,
        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED,
        authenticationPrompt: {
          title: 'Authenticate'
        }
      });
    },
    []
  );

  /**
   * Retrieve a value by key from EncryptedStorage.
   *
   * @template T - The expected type of the stored value.
   * @param {string} key - The key of the value to retrieve.
   * @returns {Promise<T | null>} - A promise resolving to the retrieved value (parsed if JSON) or null if not found.
   */
  const getItem = useCallback(async (key: string): Promise<string | null> => {
    try {
      setLoading(true);
      setError(null);
      const credentials = await Keychain.getGenericPassword({
        service: key,
        authenticationPrompt: {
          title: 'Authenticate'
        }
      });
      if (!credentials) return null;
      const value = credentials.password;

      try {
        return value; // Attempt to parse JSON
      } catch {
        return value; // Return as a plain string if parsing fails
      }
    } catch (err) {
      setError((err as Error).message || 'Failed to retrieve item.');
      console.error('useSecureStorage getItem error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Remove a value by key from EncryptedStorage.
   *
   * @param {string} key - The key of the value to remove.
   * @returns {Promise<void>} - A promise that resolves when the operation is complete.
   */
  const removeItem = useCallback(async (key: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      await Keychain.resetGenericPassword({
        service: key
      });
    } catch (err) {
      setError((err as Error).message || 'Failed to remove item.');
      console.error('useSecureStorage removeItem error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    saveItem,
    saveItemWithBiometrics,
    getItem,
    removeItem,
    loading,
    error
  };
}
