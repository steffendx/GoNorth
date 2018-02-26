namespace GoNorth.Services.Encryption
{
    /// <summary>
    /// Interface for Encryption Service
    /// </summary>
    public interface IEncryptionService
    {
        /// <summary>
        /// Encrypts a string
        /// </summary>
        /// <param name="text">Text to encrypt</param>
        /// <returns>Encrypted string</returns>
        string Encrypt(string text);

        /// <summary>
        /// Decryptes a string
        /// </summary>
        /// <param name="text">Text to decrypt</param>
        /// <returns>Decrypted string</returns>
        string Decrypt(string text); 
    }
}