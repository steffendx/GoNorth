using System.Collections.Generic;
using System.Text.RegularExpressions;

namespace GoNorth.Services.TaskManagement
{
    /// <summary>
    /// Class for parsing task images
    /// </summary>
    public class TaskImageParser : ITaskImageParser
    {
        /// <summary>
        /// Parses a task description for images
        /// </summary>
        /// <param name="description">Description to parse</param>
        /// <returns>List with all images in the description</returns>
        public List<string> ParseDescription(string description)
        {
            List<string> images = new List<string>();
            if(string.IsNullOrEmpty(description))
            {
                return images;
            }

            Regex imageRegex = new Regex("TaskImage\\?imageFile=([0-9A-F]{8}-([0-9A-F]{4}-){3}[0-9A-F]{12}\\..*?)\"", RegexOptions.IgnoreCase | RegexOptions.Multiline);

            MatchCollection imageMatches = imageRegex.Matches(description);
            foreach(Match curMatch in imageMatches)
            {
                if(!curMatch.Success)
                {
                    continue;
                }

                images.Add(curMatch.Groups[1].Value);
            }
            return images;
        }
    }
}