using System.Collections.Generic;
using System.Text.RegularExpressions;
using GoNorth.Data.Kirja;

namespace GoNorth.Services.Kirja
{
    /// <summary>
    /// Class to parse a kirja page for kirja images
    /// </summary>
    public class ImageKirjaParser : IKirjaParser
    {
        /// <summary>
        /// Parses a kirja page
        /// </summary>
        /// <param name="page">Page to parse</param>
        public void ParsePage(KirjaPage page)
        {
            Regex imageRegex = new Regex("KirjaImage\\?imageFile=([0-9A-F]{8}-([0-9A-F]{4}-){3}[0-9A-F]{12}\\..*?)\"", RegexOptions.IgnoreCase | RegexOptions.Multiline);
            List<string> images = new List<string>();

            MatchCollection imageMatches = imageRegex.Matches(page.Content);
            foreach(Match curMatch in imageMatches)
            {
                if(!curMatch.Success)
                {
                    continue;
                }

                images.Add(curMatch.Groups[1].Value);
            }
            page.UplodadedImages = images;
        }
    }
}