using GoNorth.Data.NodeGraph;

namespace GoNorth.Data.Aika
{
    /// <summary>
    /// Aika Chapter
    /// </summary>
    public class AikaChapter : BaseNode
    {

        /// <summary>
        /// Detail View Id of the chapter
        /// </summary>
        public string DetailViewId { get; set; }

        /// <summary>
        /// Number of the chapter
        /// </summary>
        public int ChapterNumber { get; set; }

        /// <summary>
        /// Name of the Chapter
        /// </summary>
        public string Name { get; set; }

    }
}