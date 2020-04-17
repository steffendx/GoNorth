using System;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace GoNorth.Extensions
{
    /// <summary>
    /// Regex Extensions
    /// </summary>
    public static class RegexExtensions
    {
        /// <summary>
        /// Replaces in a regex with an async callback function
        /// </summary>
        /// <param name="regex">Regex</param>
        /// <param name="input">Input to replace</param>
        /// <param name="replacementFn">Replacement functions</param>
        /// <returns>Result of the replace</returns>
        public static async Task<string> ReplaceAsync(this Regex regex, string input, Func<Match, Task<string>> replacementFn)
        {
            var stringBuilder = new StringBuilder();
            var lastIndex = 0;

            foreach (Match match in regex.Matches(input))
            {
                string updatedText = await replacementFn(match).ConfigureAwait(false);
                stringBuilder.Append(input, lastIndex, match.Index - lastIndex).Append(updatedText);

                lastIndex = match.Index + match.Length;
            }

            stringBuilder.Append(input, lastIndex, input.Length - lastIndex);
            return stringBuilder.ToString();
        }
    }
}