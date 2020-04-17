using GoNorth.Services.Export.ExportSnippets;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.Util;

namespace GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.RenderingObjects
{
    /// <summary>
    /// Class to export export snippet function to Scriban
    /// </summary>
    public class ScribanExportSnippetFunction
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
        /// Constructor
        /// </summary>
        public ScribanExportSnippetFunction()
        {
            this.FunctionName = string.Empty;
            this.Code = string.Empty;
            this.ParentPreviewText = string.Empty;
        }

        /// <summary>
        /// Creates a export function based on an existing function
        /// </summary>
        /// <param name="exportSnippetFunction">Existing function</param>
        public ScribanExportSnippetFunction(ExportSnippetFunction exportSnippetFunction)
        {
            this.FunctionName = exportSnippetFunction.FunctionName;
            this.Code = exportSnippetFunction.Code;
            this.ParentPreviewText = exportSnippetFunction.ParentPreviewText;
        }

        /// <summary>
        /// Converts the scriban export snippet function to an export snippet function
        /// </summary>
        /// <returns>Export snippet function</returns>
        public ExportSnippetFunction ToExportSnippetFunction() 
        {
            return new ExportSnippetFunction {
                FunctionName = FunctionName,
                Code = Code,
                ParentPreviewText = ParentPreviewText
            };
        }
    }
}