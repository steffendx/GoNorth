using System.Collections.Generic;
using System.Text.RegularExpressions;
using GoNorth.Data.Kirja;

namespace GoNorth.Services.Kirja
{
    /// <summary>
    /// Class to parse a kirja page for kirja pages
    /// </summary>
    public class KirjaPageKirjaParser : GuidKirjaParser, IKirjaParser
    {
        /// <summary>
        /// Parses a kirja page
        /// </summary>
        /// <param name="page">Page to parse</param>
        public void ParsePage(KirjaPage page)
        {
            page.MentionedKirjaPages = ParseIds(page, "Kirja");
        }
    }
}