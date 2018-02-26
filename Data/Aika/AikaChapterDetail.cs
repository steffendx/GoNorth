using System;
using System.Collections.Generic;
using GoNorth.Data.NodeGraph;

namespace GoNorth.Data.Aika
{
    /// <summary>
    /// Aika Chapter
    /// </summary>
    public class AikaChapterDetail : IHasModifiedData
    {

        /// <summary>
        /// Id of the chapter detail
        /// </summary>
        public string Id { get; set; }

        /// <summary>
        /// Project Id of the Detail
        /// </summary>
        public string ProjectId { get; set; }

        /// <summary>
        /// Id of the chapter to which the detail belongs, "" if its not directly associated with a chapter 
        /// </summary>
        public string ChapterId { get; set; }

        /// <summary>
        /// Name of the Detail
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// Start
        /// </summary>
        public List<AikaStart> Start { get; set; }

        /// <summary>
        /// Details
        /// </summary>
        public List<AikaChapterDetailNode> Detail { get; set; }

        /// <summary>
        /// Quests
        /// </summary>
        public List<AikaQuestNode> Quest { get; set; }

        /// <summary>
        /// All Done Nodes
        /// </summary>
        public List<AikaAllDone> AllDone { get; set; }

        /// <summary>
        /// Finish Nodes
        /// </summary>
        public List<AikaFinish> Finish { get; set; }

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