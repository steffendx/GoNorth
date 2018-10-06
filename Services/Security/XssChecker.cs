using System;
using System.Text.RegularExpressions;
using Microsoft.Extensions.Logging;

namespace GoNorth.Services.Security
{
    /// <summary>
    /// Xss Checker class
    /// </summary>
    public class XssChecker : IXssChecker
    {
        /// <summary>
        /// Logger
        /// </summary>
        private readonly ILogger<XssChecker> _logger;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="logger">logger</param>
        public XssChecker(ILogger<XssChecker> logger)
        {
            _logger = logger;
        }

        /// <summary>
        /// Checks a text for xss
        /// </summary>
        /// <param name="text">Text to check</param>
        public void CheckXss(string text)
        {
            if(string.IsNullOrEmpty(text))
            {
                return;
            }

            Regex xssRegex = new Regex("<script[\\S\\s]*?>[\\S\\s]*?<\\/script>", RegexOptions.IgnoreCase | RegexOptions.Multiline);
            Match xssCheck = xssRegex.Match(text);
            if(xssCheck.Success)
            {
                _logger.LogWarning("Xss attack detected.");
                throw new Exception();
            }
        }
    }
}