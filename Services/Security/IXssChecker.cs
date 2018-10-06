namespace GoNorth.Services.Security
{
    /// <summary>
    /// Xss Checker Interface
    /// </summary>
    public interface IXssChecker
    {
        /// <summary>
        /// Checks a text for xss
        /// </summary>
        /// <param name="text">Text to check</param>
        void CheckXss(string text);
    }
}