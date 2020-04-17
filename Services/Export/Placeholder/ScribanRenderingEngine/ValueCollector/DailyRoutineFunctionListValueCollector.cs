using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Services.Export.DailyRoutine;
using GoNorth.Services.Export.Data;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.RenderingFunctions;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.RenderingObjects;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.Util;
using Microsoft.Extensions.Localization;
using Scriban;
using Scriban.Runtime;

namespace GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.ValueCollector
{
    /// <summary>
    /// Class to collect daily routine function list data for Scriban value collectors
    /// </summary>
    public class DailyRoutineFunctionListValueCollector : BaseScribanValueCollector
    {
        /// <summary>
        /// Object key for the current function
        /// </summary>
        private const string CurrentFunctionObjectKey = "cur_function";

        /// <summary>
        /// Export template palceholder resolver
        /// </summary>
        private readonly IExportTemplatePlaceholderResolver _templatePlaceholderResolver;

        /// <summary>
        /// Gecachter Datenzugriff
        /// </summary>
        private readonly IExportCachedDbAccess _cachedDbAccess;

        /// <summary>
        /// Default template provider
        /// </summary>
        private readonly ICachedExportDefaultTemplateProvider _defaultTemplateProvider;

        /// <summary>
        /// Localizer Factory
        /// </summary>
        private readonly IStringLocalizerFactory _localizerFactory;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="templatePlaceholderResolver">Template placeholder resolver</param>
        /// <param name="cachedDbAccess">Gecachter Datenzugriff</param>
        /// <param name="defaultTemplateProvider">Default template provider</param>
        /// <param name="localizerFactory">Localizer Factory</param>
        public DailyRoutineFunctionListValueCollector(IExportTemplatePlaceholderResolver templatePlaceholderResolver, IExportCachedDbAccess cachedDbAccess,  ICachedExportDefaultTemplateProvider defaultTemplateProvider,
                                                      IStringLocalizerFactory localizerFactory)
        {
            _templatePlaceholderResolver = templatePlaceholderResolver;
            _cachedDbAccess = cachedDbAccess;
            _defaultTemplateProvider = defaultTemplateProvider;
            _localizerFactory = localizerFactory;
        }

        /// <summary>
        /// Returns true if the value collector is valid for a given template type
        /// </summary>
        /// <param name="templateType">Template type</param>
        /// <returns>True if the value collector is valid, else false</returns>
        public override bool IsValidForTemplateType(TemplateType templateType)
        {
            return templateType == TemplateType.ObjectDailyRoutineFunctionList;
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
            List<DailyRoutineFunction> inputFunction = data.ExportData[ExportConstants.ExportDataObject] as List<DailyRoutineFunction>;
            if(inputFunction == null)
            {
                return Task.CompletedTask;
            }
            
            List<ScribanExportDailyRoutineFunction> scribanFunctions = inputFunction.Select(i => new ScribanExportDailyRoutineFunction(i)).ToList();
            scriptObject.Add(ExportConstants.ScribanDailyRoutineFunctionListObjectKey, scribanFunctions);

            if(!scriptObject.ContainsKey(DailyRoutineEventFunctionRenderer.DailyRoutineEventFunctionName))
            {
                scriptObject.Add(DailyRoutineEventFunctionRenderer.DailyRoutineEventFunctionName, new DailyRoutineEventFunctionRenderer(_templatePlaceholderResolver, _cachedDbAccess, _defaultTemplateProvider, _errorCollection));
            }

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
            if(templateType != TemplateType.ObjectDailyRoutineFunctionList)
            {
                return exportPlaceholders;
            }

            IStringLocalizer localizer = _localizerFactory.Create(typeof(DailyRoutineFunctionListValueCollector));
            exportPlaceholders.Add(new ExportTemplatePlaceholder(ExportConstants.ScribanDailyRoutineFunctionListObjectKey, localizer["PlaceholderDesc_Functions", CurrentFunctionObjectKey]));
            exportPlaceholders.AddRange(ScribanPlaceholderGenerator.GetPlaceholdersForObject<ScribanExportDailyRoutineFunction>(_localizerFactory, CurrentFunctionObjectKey));
            exportPlaceholders.AddRange(DailyRoutineEventFunctionRenderer.GetPlaceholders(_localizerFactory));

            return exportPlaceholders;
        }

    }
}