using GoNorth.Data.NodeGraph;
using GoNorth.Services.ImplementationStatusCompare;

namespace GoNorth.Data.Tale
{
    /// <summary>
    /// Tale Text Node
    /// </summary>
    public class TaleTextNode : BaseNode
    {
        /// <summary>
        /// Text of the Node
        /// </summary>
        [ValueCompareAttribute]
        public string Text { get; set; }
    }
}
