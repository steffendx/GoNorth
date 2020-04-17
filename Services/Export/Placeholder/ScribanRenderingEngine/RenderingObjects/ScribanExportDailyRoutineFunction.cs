using GoNorth.Services.Export.DailyRoutine;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.Util;

namespace GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.RenderingObjects
{
    /// <summary>
    /// Class to export Daily routine functions to Scriban
    /// </summary>
    public class ScribanExportDailyRoutineFunction
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
        /// <param name="dailyRoutineFunction">Existing function</param>
        public ScribanExportDailyRoutineFunction(DailyRoutineFunction dailyRoutineFunction)
        {
            this.FunctionName = dailyRoutineFunction.FunctionName;
            this.Code = dailyRoutineFunction.Code;
            this.ParentPreviewText = dailyRoutineFunction.ParentPreviewText;
        }

        /// <summary>
        /// Converts the scriban daily routine function to a daily routine function
        /// </summary>
        /// <returns>Daily routine function</returns>
        public DailyRoutineFunction ToDailyRoutineFunction() 
        {
            return new DailyRoutineFunction {
                FunctionName = FunctionName,
                Code = Code,
                ParentPreviewText = ParentPreviewText
            };
        }
    }
}