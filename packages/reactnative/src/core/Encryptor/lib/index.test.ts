import {
  DERIVATION_OPTIONS_MINIMUM_OWASP2023,
  ENCRYPTION_LIBRARY,
  LEGACY_DERIVATION_OPTIONS
} from '../constants';
import {
  AesForkedLib,
  AesLib,
  getEncryptionLibrary,
  QuickCryptoLib
} from './index';

const mockPassword = 'mockPassword';
const mockSalt = '00112233445566778899001122334455';

describe('lib', () => {
  describe('getEncryptionLibrary', () => {
    it('returns the original library', () => {
      const lib = AesLib;

      expect(getEncryptionLibrary(ENCRYPTION_LIBRARY.original)).toBe(lib);
    });

    it('returns the quick-crypto library', () => {
      const lib = QuickCryptoLib;

      expect(getEncryptionLibrary(ENCRYPTION_LIBRARY.quickCrypto)).toBe(lib);
    });

    it('returns the forked library in any other case', () => {
      const lib = AesForkedLib;

      expect(getEncryptionLibrary('random-lib')).toBe(lib);
      // Some older vault might not have the `lib` field, so it is considered `undefined`
      expect(getEncryptionLibrary(undefined)).toBe(lib);
    });

    it.each([ENCRYPTION_LIBRARY.original, 'random-lib'])(
      'throws an error if the algorithm is not correct: %s',
      async _lib => {
        const lib = getEncryptionLibrary(_lib);

        await expect(
          lib.deriveKey(mockPassword, mockSalt, {
            ...LEGACY_DERIVATION_OPTIONS,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error - testing invalid algorithm
            algorithm: 'NotAValidKDFAlgorithm'
          })
        ).rejects.toThrow('Unsupported KDF algorithm');
      }
    );

    it('derives a key when using a forked lib with legacy parameters', async () => {
      const lib = getEncryptionLibrary('random-lib');

      await expect(
        lib.deriveKey(mockPassword, mockSalt, LEGACY_DERIVATION_OPTIONS)
      ).not.toBe(undefined);
    });

    it('throws an error when using forked lib with a different number of iterations than expected', async () => {
      const lib = getEncryptionLibrary('random-lib');

      await expect(
        lib.deriveKey(
          mockPassword,
          mockSalt,
          DERIVATION_OPTIONS_MINIMUM_OWASP2023
        )
      ).rejects.toThrow(
        `Invalid number of iterations, should be: ${LEGACY_DERIVATION_OPTIONS.params.iterations}`
      );
    });
  });
});
