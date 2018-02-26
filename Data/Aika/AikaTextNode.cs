using GoNorth.Data.NodeGraph;
using GoNorth.Services.ImplementationStatusCompare;

namespace GoNorth.Data.Aika
{
    /// <summary>
    /// Aika Text Node
    /// </summary>
    public class AikaTextNode : BaseNode
    {
        /// <summary>
        /// Text of the Node
        /// </summary>
        [ValueCompareAttribute]
        public string Text { get; set; }
    }
}