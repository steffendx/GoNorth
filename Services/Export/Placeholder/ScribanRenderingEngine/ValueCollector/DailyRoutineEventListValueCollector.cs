using System.Collections.Generic;
using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Data.Kortisto;
using GoNorth.Services.Export.DailyRoutine;
using GoNorth.Services.Export.Data;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.RenderingObjects;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.Util;
using GoNorth.Services.Export.Placeholder.Util;
using Microsoft.Extensions.Localization;
using Scriban;
using Scriban.Runtime;

namespace GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.ValueCollector
{
    /// <summary>
    /// Class to collect daily routine event list for Scriban value collectors
    /// </summary>
    public class DailyRoutineEventListValueCollector : BaseScribanValueCollector
    {
        /// <summary>
        /// Gecachter Datenzugriff
        /// </summary>
        private readonly IExportCachedDbAccess _cachedDbAccess;

        /// <summary>
        /// Daily routine function name generator
        /// </summary>
        private readonly IDailyRoutineFunctionNameGenerator _dailyRoutineFunctionNameGenerator;

        /// <summary>
        /// Localizer Factory
        /// </summary>
        private readonly IStringLocalizerFactory _localizerFactory;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="cachedDbAccess">Gecachter Datenzugriff</param>
        /// <param name="dailyRoutineFunctionNameGenerator">Daily routine function name generator</param>
        /// <param name="localizerFactory">Localizer Factory</param>
        public DailyRoutineEventListValueCollector(IExportCachedDbAccess cachedDbAccess, IDailyRoutineFunctionNameGenerator dailyRoutineFunctionNameGenerator, IStringLocalizerFactory localizerFactory)
        {
            _cachedDbAccess = cachedDbAccess;
            _dailyRoutineFunctionNameGenerator = dailyRoutineFunctionNameGenerator;
            _localizerFactory = localizerFactory;
        }

        /// <summary>
        /// Returns true if the value collector is valid for a given template type
        /// </summary>
        /// <param name="templateType">Template type</param>
        /// <returns>True if the value collector is valid, else false</returns>
        public override bool IsValidForTemplateType(TemplateType templateType)
        {
            return templateType == TemplateType.ObjectDailyRoutineEventList;
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

            List<ScribanExportDailyRoutineEvent> events = await ScribanDailyRoutineEventUtil.MapNpcDailyRoutineEvents(_cachedDbAccess, _dailyRoutineFunctionNameGenerator, inputNpc, inputNpc.DailyRoutine);

            scriptObject.AddOrUpdate(ExportConstants.ScribanDailyRoutineEventsObjectKey, events);
        }

        /// <summary>
        /// Returns the Export Template Placeholders for a Template Type
        /// </summary>
        /// <param name="templateType">Template Type</param>
        /// <returns>Export Template Placeholder</returns>
        public override List<ExportTemplatePlaceholder> GetExportTemplatePlaceholdersForType(TemplateType templateType)
        {
            List<ExportTemplatePlaceholder> exportPlaceholders = new List<ExportTemplatePlaceholder>();
            if(templateType != TemplateType.ObjectDailyRoutineEventList)
            {
                return exportPlaceholders;
            }

            IStringLocalizer localizer = _localizerFactory.Create(typeof(DailyRoutineEventListValueCollector));
            exportPlaceholders.Add(new ExportTemplatePlaceholder(ExportConstants.ScribanDailyRoutineEventsObjectKey, localizer["PlaceholderDesc_Events", ExportConstants.DailyRoutineEventObjectKey]));
            exportPlaceholders.AddRange(ScribanPlaceholderGenerator.GetPlaceholdersForObject<ScribanExportDailyRoutineEvent>(_localizerFactory, ExportConstants.DailyRoutineEventObjectKey));

            return exportPlaceholders;
        }

    }
}