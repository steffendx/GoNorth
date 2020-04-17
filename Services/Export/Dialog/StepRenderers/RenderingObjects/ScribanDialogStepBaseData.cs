using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.RenderingObjects;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.Util;

namespace GoNorth.Services.Export.Dialog.StepRenderers.RenderingObjects
{
    /// <summary>
    /// Base Class for Rendering dialog steps
    /// </summary>
    public class ScribanDialogStepBaseData
    {
        /// <summary>
        /// Id of the node
        /// </summary>
        public string NodeId { get; set; }

        /// <summary>
        /// Unique index of the node
        /// </summary>
        [ScribanExportValueLabel]
        public int NodeIndex { get; set; }

        /// <summary>
        /// Type of the node
        /// </summary>
        [ScribanExportValueLabel]
        public string NodeType { get; set; }

        /// <summary>
        /// Function Name of the node step
        /// </summary>
        private string _NodeStepFunctionName;

        /// <summary>
        /// Function name of the node step
        /// </summary>
        [ScribanExportValueLabel]
        public string NodeStepFunctionName
        {
            get
            {
                NodeStepFunctionWasUsed = true;
                return _NodeStepFunctionName;
            }
            set
            {
                _NodeStepFunctionName = value;
            }
        }

        /// <summary>
        /// Function name of the node step that does not set the flag that the function was sued
        /// </summary>
        [ScribanExportValueLabel]
        public string NodeStepFunctionNameNoFlagSet
        {
            get
            {
                return _NodeStepFunctionName;
            }
            set
            {
                _NodeStepFunctionName = value;
            }
        }

        /// <summary>
        /// True if the function name of the node step was used, else false
        /// </summary>
        [ScribanExportValueLabel]
        public bool NodeStepFunctionWasUsed { get; set; }

        /// <summary>
        /// Flex Field Object to which the node belongs
        /// </summary>
        [ScribanExportValueObjectLabel]
        public ScribanFlexFieldObject NodeObject { get; set; }

        /// <summary>
        /// Constructor
        /// </summary>
        public ScribanDialogStepBaseData()
        {
            _NodeStepFunctionName = string.Empty;
            NodeStepFunctionWasUsed = false;
        }
    }
}