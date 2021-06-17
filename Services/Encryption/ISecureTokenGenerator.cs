namespace GoNorth.Services.Encryption
{
    /// <summary>
    /// Interface for Secure Token generator
    /// </summary>
    public interface ISecureTokenGenerator
    {
        /// <summary>
        /// Generates a secure token
        /// </summary>
        /// <param name="length">Length of the token to generate</param>
        /// <returns>Generated token</returns>
        string GenerateSecureToken(int length);
    }
}