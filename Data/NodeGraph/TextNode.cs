using System;
using GoNorth.Services.ImplementationStatusCompare;

namespace GoNorth.Data.NodeGraph
{
    /// <summary>
    /// Text Node
    /// </summary>
    public class TextNode : BaseNode, ICloneable
    {
        /// <summary>
        /// Text of the Node
        /// </summary>
        [ValueCompareAttribute]
        public string Text { get; set; }

        /// <summary>
        /// Clones the text node
        /// </summary>
        /// <returns>Cloned object</returns>
        public object Clone()
        {
            TextNode clonedObject = CloneObject<TextNode>();
            clonedObject.Text = Text;

            return clonedObject;
        }
    }
}