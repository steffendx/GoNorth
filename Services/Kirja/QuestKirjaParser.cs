using System.Collections.Generic;
using System.Text.RegularExpressions;
using GoNorth.Data.Kirja;

namespace GoNorth.Services.Kirja
{
    /// <summary>
    /// Class to parse a kirja page for quests
    /// </summary>
    public class QuestKirjaParser : GuidKirjaParser, IKirjaParser
    {
        /// <summary>
        /// Parses a kirja page
        /// </summary>
        /// <param name="page">Page to parse</param>
        public void ParsePage(KirjaPage page)
        {
            page.MentionedQuests = ParseIds(page, "Quest");
        }
    }
}