using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Data.FlexFieldDatabase;
using GoNorth.Data.Kortisto;
using GoNorth.Data.Project;
using GoNorth.Data.ProjectConfig;
using GoNorth.Services.Export.DailyRoutine;
using GoNorth.Services.Export.Data;
using GoNorth.Services.Export.Dialog.ConditionRendering.ConfigObject;
using GoNorth.Services.Export.LanguageKeyGeneration;
using GoNorth.Services.Export.Placeholder;
using GoNorth.Services.Export.Placeholder.LegacyRenderingEngine;
using Microsoft.Extensions.Localization;

namespace GoNorth.Services.Export.Dialog.ConditionRendering.LegacyRenderingEngine
{
    /// <summary>
    /// Class for rendering a daily routine event state condition resolver
    /// </summary>
    public class DailyRoutineEventStateConditionResolver :  BaseConditionRenderer<DailyRoutineEventStateConditionData>
    {

        /// <summary>
        /// Npc Placeholder Prefix
        /// </summary>
        private const string NpcPlaceholderPrefix = "Tale_Condition_Npc";


        /// <summary>
        /// Cached Db Access
        /// </summary>
        private readonly IExportCachedDbAccess _cachedDbAccess;

        /// <summary>
        /// Daily routine event placeholder resolver
        /// </summary>
        private readonly ILegacyDailyRoutineEventPlaceholderResolver _dailyRoutineEventPlaceholderResolver;

        /// <summary>
        /// Resolver for flex field values
        /// </summary>
        private readonly FlexFieldExportTemplatePlaceholderResolver _flexFieldPlaceholderResolver;


        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="defaultTemplateProvider">Default Template Provider</param>
        /// <param name="cachedDbAccess">Cached Db Access</param>
        /// <param name="dailyRoutineEventPlaceholderResolver">Daily routine event placeholder resolver</param>
        /// <param name="languageKeyGenerator">Language Key Generator</param>
        /// <param name="localizerFactory">Localizer Factory</param>
        public DailyRoutineEventStateConditionResolver(ICachedExportDefaultTemplateProvider defaultTemplateProvider, IExportCachedDbAccess cachedDbAccess, ILegacyDailyRoutineEventPlaceholderResolver dailyRoutineEventPlaceholderResolver, 
                                                       ILanguageKeyGenerator languageKeyGenerator, IStringLocalizerFactory localizerFactory)
        {
            _cachedDbAccess = cachedDbAccess;
            _dailyRoutineEventPlaceholderResolver = dailyRoutineEventPlaceholderResolver;
            _flexFieldPlaceholderResolver = new FlexFieldExportTemplatePlaceholderResolver(defaultTemplateProvider, cachedDbAccess, languageKeyGenerator, localizerFactory, NpcPlaceholderPrefix);
        }

        /// <summary>
        /// Builds a condition element from parsed data
        /// </summary>
        /// <param name="template">Export template to use</param>
        /// <param name="parsedData">Parsed data</param>
        /// <param name="project">Project</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <param name="flexFieldObject">Flex field object to which the dialog belongs</param>
        /// <param name="exportSettings">Export Settings</param>
        /// <returns>Condition string</returns>
        public override async Task<string> BuildConditionElementFromParsedData(ExportTemplate template, DailyRoutineEventStateConditionData parsedData, GoNorthProject project, ExportPlaceholderErrorCollection errorCollection, FlexFieldObject flexFieldObject, ExportSettings exportSettings)
        {
            KortistoNpc eventNpc = await _cachedDbAccess.GetNpcById(parsedData.NpcId);
            if(eventNpc == null)
            {
                return string.Empty;
            }

            KortistoNpcDailyRoutineEvent exportEvent = null;
            if(eventNpc.DailyRoutine != null)
            {
                exportEvent = eventNpc.DailyRoutine.FirstOrDefault(e => e.EventId == parsedData.EventId);
            }
            if(exportEvent == null)
            {
                errorCollection.AddDialogDailyRoutineEventNotFoundError(eventNpc.Name);
                return string.Empty;
            }

            MiscProjectConfig projectConfig = await _cachedDbAccess.GetMiscProjectConfig();

            string conditionCode = await _dailyRoutineEventPlaceholderResolver.ResolveDailyRoutineEventPlaceholders(template.Code, eventNpc, exportEvent);

            ExportObjectData flexFieldExportData = new ExportObjectData();
            flexFieldExportData.ExportData.Add(ExportConstants.ExportDataObject, eventNpc);
            flexFieldExportData.ExportData.Add(ExportConstants.ExportDataObjectType, ExportConstants.ExportObjectTypeNpc);

            _flexFieldPlaceholderResolver.SetErrorMessageCollection(errorCollection);
            conditionCode = await _flexFieldPlaceholderResolver.FillPlaceholders(conditionCode, flexFieldExportData);

            return conditionCode;
        }

        /// <summary>
        /// Returns the Export Template Placeholders for a Template Type
        /// </summary>
        /// <param name="templateType">Template Type</param>
        /// <returns>Export Template Placeholder</returns>
        public override List<ExportTemplatePlaceholder> GetExportTemplatePlaceholdersForType(TemplateType templateType)
        {
            List<ExportTemplatePlaceholder> exportPlaceholders = _dailyRoutineEventPlaceholderResolver.GetPlaceholders();
            exportPlaceholders.AddRange(_flexFieldPlaceholderResolver.GetExportTemplatePlaceholdersForType(TemplateType.ObjectNpc));

            return exportPlaceholders;
        }
    }
}