using System;
using System.IO;
using System.Security.Cryptography;
using System.Text;

namespace GoNorth.Services.Encryption
{
    /// <summary>
    /// AES Encryption Service
    /// </summary>
    public class AesEncryptionService : IEncryptionService
    {
        /// <summary>
        /// KeyBytes
        /// </summary>
        private readonly byte[] _KeyBytes = Encoding.UTF8.GetBytes("7@T4uuNR4uAg$L-z$uDSbMtxf^RG$j-K");

        /// <summary>
        /// Encrypts a string
        /// </summary>
        /// <param name="text">Text to encrypt</param>
        /// <returns>Encrypted string</returns>
        public string Encrypt(string text)
        {
            using(Aes aesAlg = Aes.Create())
            {
                using(ICryptoTransform encryptor = aesAlg.CreateEncryptor(_KeyBytes, aesAlg.IV))
                {
                    using (MemoryStream msEncrypt = new MemoryStream())
                    {
                        using (CryptoStream csEncrypt = new CryptoStream(msEncrypt, encryptor, CryptoStreamMode.Write))
                        {
                            using (StreamWriter swEncrypt = new StreamWriter(csEncrypt))
                            {
                                swEncrypt.Write(text);
                            }
                        }
                    
                        byte[] iv = aesAlg.IV;
                        byte[] encryptedContent = msEncrypt.ToArray();
                        byte[] result = new byte[iv.Length + encryptedContent.Length];

                        Buffer.BlockCopy(iv, 0, result, 0, iv.Length);
                        Buffer.BlockCopy(encryptedContent, 0, result, iv.Length, encryptedContent.Length);

                        return Convert.ToBase64String(result);
                    }
                }
            }
        }

        /// <summary>
        /// Decryptes a string
        /// </summary>
        /// <param name="cipherText">Cipher to decrypt</param>
        /// <returns>Decrypted string</returns>
        public string Decrypt(string cipherText)
        {
            byte[] fullCipher = Convert.FromBase64String(cipherText);
            byte[] iv = new byte[16];
            byte[] cipher = new byte[fullCipher.Length - 16];

            Buffer.BlockCopy(fullCipher, 0, iv, 0, iv.Length);
            Buffer.BlockCopy(fullCipher, iv.Length, cipher, 0, fullCipher.Length - 16);

            using (Aes aesAlg = Aes.Create())
            {
                using (ICryptoTransform decryptor = aesAlg.CreateDecryptor(_KeyBytes, iv))
                {
                    string result;
                    using (MemoryStream msDecrypt = new MemoryStream(cipher))
                    {
                        using (CryptoStream csDecrypt = new CryptoStream(msDecrypt, decryptor, CryptoStreamMode.Read))
                        {
                            using (StreamReader srDecrypt = new StreamReader(csDecrypt))
                            {
                                result = srDecrypt.ReadToEnd();
                            }
                        }
                    }

                    return result;
                }
            }
        }
    }
}
