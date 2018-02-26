using System;
using System.Collections.Generic;
using GoNorth.Data.NodeGraph;

namespace GoNorth.Data.Aika
{
    /// <summary>
    /// Kortisto Npc
    /// </summary>
    public class AikaChapterOverview : IHasModifiedData
    {

        /// <summary>
        /// Id of the overview
        /// </summary>
        public string Id { get; set; }

        /// <summary>
        /// Project Id of the Overview
        /// </summary>
        public string ProjectId { get; set; }

        /// <summary>
        /// Chapters
        /// </summary>
        public List<AikaChapter> Chapter { get; set; }

        /// <summary>
        /// Node Links
        /// </summary>
        public List<NodeLink> Link { get; set; }


        /// <summary>
        /// Last modify Date
        /// </summary>
        public DateTimeOffset ModifiedOn { get; set; }

        /// <summary>
        /// Id of the user who last modified the page
        /// </summary>
        public string ModifiedBy { get; set; }
    }
}