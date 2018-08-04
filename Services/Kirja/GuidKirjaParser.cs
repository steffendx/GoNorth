using System.Collections.Generic;
using System.Text.RegularExpressions;
using GoNorth.Data.Kirja;

namespace GoNorth.Services.Kirja
{
    /// <summary>
    /// Base Class for kirja parsers which parse guids
    /// </summary>
    public class GuidKirjaParser
    {
        /// <summary>
        /// Parses a kirja page
        /// </summary>
        /// <param name="page">Page to parse</param>
        /// <param name="pageName">Name of the page in the link to search for</param>
        /// <returns>Found ids</returns>
        public List<string> ParseIds(KirjaPage page, string pageName)
        {
            // Support both query and hash notation for backwards comaptibility of links
            Regex guidLinkRegex = new Regex("/" + pageName + "[#|?]id=([0-9A-F]{8}-([0-9A-F]{4}-){3}[0-9A-F]{12})", RegexOptions.IgnoreCase | RegexOptions.Multiline);
            List<string> ids = new List<string>();

            MatchCollection itemLinkMatches = guidLinkRegex.Matches(page.Content);
            foreach(Match curMatch in itemLinkMatches)
            {
                if(!curMatch.Success)
                {
                    continue;
                }

                ids.Add(curMatch.Groups[1].Value);
            }
            return ids;
        }
    }
}