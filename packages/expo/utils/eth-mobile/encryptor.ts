import Aes from 'react-native-aes-crypto';

export class Encryptor {
  generateKey = (
    password: string,
    salt: string,
    cost: number,
    length: number
  ) => Aes.pbkdf2(password, salt, cost, length, 'sha256');

  encrypt = async (data: string, password: string) => {
    const key = await this.generateKey(password, 'salt', 5000, 256);
    const iv = await Aes.randomKey(16);
    const cipher = await Aes.encrypt(data, key, iv, 'aes-256-cbc');
    return { cipher, iv };
  };

  decrypt = async (
    encryptedData: { cipher: string; iv: string },
    password: string
  ) => {
    const key = await this.generateKey(password, 'salt', 5000, 256);
    const decrypted = await Aes.decrypt(
      encryptedData.cipher,
      key,
      encryptedData.iv,
      'aes-256-cbc'
    );
    return decrypted;
  };
}
