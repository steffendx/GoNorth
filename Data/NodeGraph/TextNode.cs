using GoNorth.Data.NodeGraph;
using GoNorth.Services.ImplementationStatusCompare;

namespace GoNorth.Data.NodeGraph
{
    /// <summary>
    /// Text Node
    /// </summary>
    public class TextNode : BaseNode
    {
        /// <summary>
        /// Text of the Node
        /// </summary>
        [ValueCompareAttribute]
        public string Text { get; set; }
    }
}