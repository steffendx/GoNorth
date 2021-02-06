using System.Collections.Generic;
using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.RenderingObjects;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.Util;
using GoNorth.Services.Export.StateMachines;
using Microsoft.Extensions.Localization;
using Scriban;
using Scriban.Runtime;

namespace GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.ValueCollector
{
    /// <summary>
    /// Class to collect state function data for Scriban value collectors
    /// </summary>
    public class StateMachineFunctionValueCollector : BaseScribanValueCollector
    {
        /// <summary>
        /// Localizer Factory
        /// </summary>
        private readonly IStringLocalizerFactory _localizerFactory;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="localizerFactory">Localizer Factory</param>
        public StateMachineFunctionValueCollector(IStringLocalizerFactory localizerFactory)
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
            return templateType == TemplateType.ObjectStateFunction;
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
            StateFunction inputFunction = data.ExportData[ExportConstants.ExportDataObject] as StateFunction;
            if(inputFunction == null)
            {
                return Task.CompletedTask;
            }
            
            scriptObject.AddOrUpdate(ExportConstants.ScribanStateFunctionObjectKey, new ScribanExportStateFunction(inputFunction));
            return Task.CompletedTask;
        }

        /// <summary>
        /// Returns the Export Template Placeholders for a Template Type
        /// </summary>
        /// <param name="templateType">Template Type</param>
        /// <returns>Export Template Placeholder</returns>
        public override List<ExportTemplatePlaceholder> GetExportTemplatePlaceholdersForType(TemplateType templateType)
        {
            List<ExportTemplatePlaceholder> exportPlaceholders = new List<ExportTemplatePlaceholder>();
            if(templateType != TemplateType.ObjectStateFunction)
            {
                return exportPlaceholders;
            }

            exportPlaceholders.AddRange(ScribanPlaceholderGenerator.GetPlaceholdersForObject<ScribanExportStateFunction>(_localizerFactory, ExportConstants.ScribanStateFunctionObjectKey));

            return exportPlaceholders;
        }

    }
}