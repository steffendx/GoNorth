using GoNorth.Data.NodeGraph;
using GoNorth.Services.ImplementationStatusCompare;

namespace GoNorth.Data.Aika
{
    /// <summary>
    /// Aika Finish Node
    /// </summary>
    public class AikaFinish : BaseNode
    {

        /// <summary>
        /// Name of the finish
        /// </summary>
        [ValueCompareAttribute]
        public string Name { get; set; }

        /// <summary>
        /// Color of the finish
        /// </summary>
        public string Color { get; set; }
        
    }
}