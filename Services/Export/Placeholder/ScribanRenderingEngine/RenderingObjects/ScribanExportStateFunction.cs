using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.Util;
using GoNorth.Services.Export.StateMachines;

namespace GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.RenderingObjects
{
    /// <summary>
    /// Class to export state machine functions to Scriban
    /// </summary>
    public class ScribanExportStateFunction
    {
        /// <summary>
        /// Name of the function
        /// </summary>
        [ScribanExportValueLabel]
        public string FunctionName { get; set; }

        /// <summary>
        /// Code
        /// </summary>
        [ScribanExportValueLabel]
        public string Code { get; set; }

        /// <summary>
        /// Preview text of the parent node
        /// </summary>
        [ScribanExportValueLabel]
        public string ParentPreviewText { get; set; }


        /// <summary>
        /// Creates a export function based on an existing function
        /// </summary>
        /// <param name="stateFunction">Existing function</param>
        public ScribanExportStateFunction(StateFunction stateFunction)
        {
            this.FunctionName = stateFunction.FunctionName;
            this.Code = stateFunction.Code;
            this.ParentPreviewText = stateFunction.ParentPreviewText;
        }

        /// <summary>
        /// Converts the scriban state machine function to a state machine function
        /// </summary>
        /// <returns>State machine function</returns>
        public StateFunction ToStateFunction() 
        {
            return new StateFunction {
                FunctionName = FunctionName,
                Code = Code,
                ParentPreviewText = ParentPreviewText
            };
        }
    }
}