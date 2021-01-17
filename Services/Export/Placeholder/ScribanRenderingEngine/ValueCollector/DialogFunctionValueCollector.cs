using System.Collections.Generic;
using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Services.Export.Dialog;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.RenderingObjects;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.Util;
using Microsoft.Extensions.Localization;
using Scriban;
using Scriban.Runtime;

namespace GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.ValueCollector
{
    /// <summary>
    /// Class for Dialog Function Scriban value collectors
    /// </summary>
    public class DialogFunctionValueCollector : BaseScribanValueCollector
    {
        /// <summary>
        /// Localizer Factory
        /// </summary>
        private readonly IStringLocalizerFactory _localizerFactory;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="localizerFactory">Localizer Factory</param>
        public DialogFunctionValueCollector(IStringLocalizerFactory localizerFactory)
        {
            _localizerFactory = localizerFactory;
        }

        /// <summary>
        /// Returns true if the value collector is valid for a given template type
        /// </summary>
        /// <param name="templateType">Template type</param>
        /// <returns>True if the value collector is valid, else false</returns>
        public override bool IsValidForTemplateType(TemplateType templateType)
        {
            return templateType == TemplateType.TaleDialogFunction;
        }

        /// <summary>
        /// Collects the values for an export
        /// </summary>
        /// <param name="templateType">Template type</param>
        /// <param name="parsedTemplate">Parsed scriban template</param>
        /// <param name="scriptObject">Scriban script object to fill</param>
        /// <param name="data">Export Data</param>
        /// <returns>Task</returns>
        public override Task CollectValues(TemplateType templateType, Template parsedTemplate, ScriptObject scriptObject, ExportObjectData data)
        {
            ExportDialogFunctionCode inputFunction = data.ExportData[ExportConstants.ExportDataObject] as ExportDialogFunctionCode;
            if (inputFunction == null)
            {
                return Task.CompletedTask;
            }

            scriptObject.AddOrUpdate(ExportConstants.ScribanDialogFunctionKey, new ScribanExportDialogFunction(inputFunction));
            return Task.CompletedTask;
        }

        /// <summary>
        /// Returns the Export Template Placeholders for a Template Type
        /// </summary>
        /// <param name="templateType">Template Type</param>
        /// <returns>Export Template Placeholder</returns>
        public override List<ExportTemplatePlaceholder> GetExportTemplatePlaceholdersForType(TemplateType templateType)
        {
            if(templateType != TemplateType.TaleDialogFunction)
            {
                return new List<ExportTemplatePlaceholder>();
            }

            return ScribanPlaceholderGenerator.GetPlaceholdersForObject<ScribanExportDialogFunction>(_localizerFactory, ExportConstants.ScribanDialogFunctionKey);
        }
    }
}