using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Data.Kortisto;
using GoNorth.Data.Project;
using GoNorth.Data.ProjectConfig;
using GoNorth.Services.Export.DailyRoutine;
using GoNorth.Services.Export.Data;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.RenderingFunctions;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.RenderingObjects;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.Util;
using GoNorth.Services.Export.Placeholder.Util;
using Microsoft.Extensions.Localization;
using Scriban;
using Scriban.Runtime;

namespace GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.ValueCollector
{
    /// <summary>
    /// Class to collect npc daily routines for Scriban value collectors
    /// </summary>
    public class NpcDailyRoutineExportValueCollector : BaseScribanValueCollector
    {
        /// <summary>
        /// Export template palceholder resolver
        /// </summary>
        private readonly IExportTemplatePlaceholderResolver _templatePlaceholderResolver;

        /// <summary>
        /// Gecachter Datenzugriff
        /// </summary>
        private readonly IExportCachedDbAccess _cachedDbAccess;

        /// <summary>
        /// Daily routine function name generator
        /// </summary>
        private readonly IDailyRoutineFunctionNameGenerator _dailyRoutineFunctionNameGenerator;

        /// <summary>
        /// Daily routine function renderer
        /// </summary>
        private readonly IDailyRoutineFunctionRenderer _dailyRoutineFunctionRenderer;

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
        /// <param name="dailyRoutineFunctionNameGenerator">Daily routine function name generator</param>
        /// <param name="dailyRoutineFunctionRenderer">Daily routine function renderer</param>
        /// <param name="defaultTemplateProvider">Default template provider</param>
        /// <param name="localizerFactory">Localizer Factory</param>
        public NpcDailyRoutineExportValueCollector(IExportTemplatePlaceholderResolver templatePlaceholderResolver, IExportCachedDbAccess cachedDbAccess, IDailyRoutineFunctionNameGenerator dailyRoutineFunctionNameGenerator, 
                                                   IDailyRoutineFunctionRenderer dailyRoutineFunctionRenderer, ICachedExportDefaultTemplateProvider defaultTemplateProvider, IStringLocalizerFactory localizerFactory)
        {
            _templatePlaceholderResolver = templatePlaceholderResolver;
            _cachedDbAccess = cachedDbAccess;
            _dailyRoutineFunctionNameGenerator = dailyRoutineFunctionNameGenerator;
            _dailyRoutineFunctionRenderer = dailyRoutineFunctionRenderer;
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
            return templateType == TemplateType.ObjectNpc;
        }

        /// <summary>
        /// Collects the values for an export
        /// </summary>
        /// <param name="templateType">Template type</param>
        /// <param name="parsedTemplate">Parsed scriban template</param>
        /// <param name="scriptObject">Scriban script object to fill</param>
        /// <param name="data">Export Data</param>
        /// <returns>Task</returns>
        public override async Task CollectValues(TemplateType templateType, Template parsedTemplate, ScriptObject scriptObject, ExportObjectData data)
        {
            KortistoNpc inputNpc = data.ExportData[ExportConstants.ExportDataObject] as KortistoNpc;
            if(inputNpc == null)
            {
                return;
            }

            SharedDailyRoutineExportUtil.SortDailyRoutine(inputNpc.DailyRoutine);

            ScribanExportDailyRoutine dailyRoutine = new ScribanExportDailyRoutine();
            dailyRoutine.Events = await ScribanDailyRoutineEventUtil.MapNpcDailyRoutineEvents(_cachedDbAccess, _dailyRoutineFunctionNameGenerator, inputNpc, inputNpc.DailyRoutine);
            dailyRoutine.EventFunctions = await BuildDailyRoutineFunctions(inputNpc, inputNpc.DailyRoutine);
            scriptObject.Add(ExportConstants.ScribanDailyRoutineObjectKey, dailyRoutine);

            scriptObject.Add(DailyRoutineEventListRenderer.DailyRoutineEventListFunctionName, new DailyRoutineEventListRenderer(_templatePlaceholderResolver, _cachedDbAccess, _defaultTemplateProvider, _errorCollection, data));
            scriptObject.Add(DailyRoutineEventFunctionRenderer.DailyRoutineEventFunctionName, new DailyRoutineEventFunctionRenderer(_templatePlaceholderResolver, _cachedDbAccess, _defaultTemplateProvider, _errorCollection));
            scriptObject.Add(DailyRoutineEventFunctionListRenderer.DailyRoutineEventFunctionListFunctionName, new DailyRoutineEventFunctionListRenderer(_templatePlaceholderResolver, _cachedDbAccess, _defaultTemplateProvider, _errorCollection));
        }

        /// <summary>
        /// Builds the daily routine functions
        /// </summary>
        /// <param name="inputNpc">Npc</param>
        /// <param name="dailyRoutine">Daily routine list</param>
        /// <returns>Function list</returns>
        private async Task<List<ScribanExportDailyRoutineFunction>> BuildDailyRoutineFunctions(KortistoNpc inputNpc, List<KortistoNpcDailyRoutineEvent> dailyRoutine)
        {
            if(dailyRoutine == null || !dailyRoutine.Any())
            {
                return new List<ScribanExportDailyRoutineFunction>();
            }

            _dailyRoutineFunctionRenderer.SetErrorCollection(_errorCollection);
            _dailyRoutineFunctionRenderer.SetExportTemplatePlaceholderResolver(_templatePlaceholderResolver);

            List<DailyRoutineFunction> functions = await _dailyRoutineFunctionRenderer.RenderDailyRoutineFunctions(dailyRoutine, inputNpc);
            return functions.Select(f => new ScribanExportDailyRoutineFunction(f)).ToList();
        }

        /// <summary>
        /// Returns the Export Template Placeholders for a Template Type
        /// </summary>
        /// <param name="templateType">Template Type</param>
        /// <returns>Export Template Placeholder</returns>
        public override List<ExportTemplatePlaceholder> GetExportTemplatePlaceholdersForType(TemplateType templateType)
        {
            List<ExportTemplatePlaceholder> exportPlaceholders = new List<ExportTemplatePlaceholder>();
            if(templateType != TemplateType.ObjectNpc)
            {
                return exportPlaceholders;
            }

            exportPlaceholders.AddRange(ScribanPlaceholderGenerator.GetPlaceholdersForObject<ScribanExportDailyRoutine>(_localizerFactory, ExportConstants.ScribanDailyRoutineObjectKey));
            exportPlaceholders.AddRange(ScribanPlaceholderGenerator.GetPlaceholdersForObject<ScribanExportDailyRoutineEvent>(_localizerFactory, ExportConstants.DailyRoutineEventObjectKey));
            exportPlaceholders.AddRange(DailyRoutineEventListRenderer.GetPlaceholders(_localizerFactory));
            exportPlaceholders.AddRange(DailyRoutineEventFunctionRenderer.GetPlaceholders(_localizerFactory));
            exportPlaceholders.AddRange(DailyRoutineEventFunctionListRenderer.GetPlaceholders(_localizerFactory));
            
            return exportPlaceholders;
        }

    }
}