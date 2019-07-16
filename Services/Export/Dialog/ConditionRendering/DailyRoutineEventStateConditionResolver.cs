using System.Collections.Generic;
using System.Linq;
using GoNorth.Data.Exporting;
using GoNorth.Data.Kortisto;
using GoNorth.Data.Project;
using GoNorth.Data.ProjectConfig;
using GoNorth.Services.Export.Data;
using GoNorth.Services.Export.LanguageKeyGeneration;
using GoNorth.Services.Export.Placeholder;
using Microsoft.Extensions.Localization;

namespace GoNorth.Services.Export.Dialog.ConditionRendering
{
    /// <summary>
    /// Class for rendering a daily routine event state condition resolver
    /// </summary>
    public class DailyRoutineEventStateConditionResolver :  BaseConditionRenderer<DailyRoutineEventStateConditionResolver.DailyRoutineEventStateConditionData>
    {
        /// <summary>
        /// Daily routine event state Condition Data
        /// </summary>
        public class DailyRoutineEventStateConditionData
        {
            /// <summary>
            /// Npc Id
            /// </summary>
            public string NpcId { get; set; }
            
            /// <summary>
            /// Event Id
            /// </summary>
            public string EventId { get; set; }
        }


        /// <summary>
        /// Npc Placeholder Prefix
        /// </summary>
        private const string NpcPlaceholderPrefix = "Tale_Condition_Npc";


        /// <summary>
        /// Default Template Provider
        /// </summary>
        protected readonly ICachedExportDefaultTemplateProvider _defaultTemplateProvider;

        /// <summary>
        /// Cached Db Access
        /// </summary>
        private readonly IExportCachedDbAccess _cachedDbAccess;

        /// <summary>
        /// Daily routine event placeholder resolver
        /// </summary>
        private readonly IDailyRoutineEventPlaceholderResolver _dailyRoutineEventPlaceholderResolver;

        /// <summary>
        /// Resolver for flex field values
        /// </summary>
        private readonly FlexFieldExportTemplatePlaceholderResolver _flexFieldPlaceholderResolver;

        /// <summary>
        /// true if the event is for a disable condition, else false
        /// </summary>
        private readonly bool _isDisabled;


        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="defaultTemplateProvider">Default Template Provider</param>
        /// <param name="cachedDbAccess">Cached Db Access</param>
        /// <param name="dailyRoutineEventPlaceholderResolver">Daily routine event placeholder resolver</param>
        /// <param name="languageKeyGenerator">Language Key Generator</param>
        /// <param name="localizerFactory">Localizer Factory</param>
        /// <param name="isDisabled">true if the condition is for disabled, else false</param>
        public DailyRoutineEventStateConditionResolver(ICachedExportDefaultTemplateProvider defaultTemplateProvider, IExportCachedDbAccess cachedDbAccess, IDailyRoutineEventPlaceholderResolver dailyRoutineEventPlaceholderResolver, 
                                                       ILanguageKeyGenerator languageKeyGenerator, IStringLocalizerFactory localizerFactory, bool isDisabled)
        {
            _defaultTemplateProvider = defaultTemplateProvider;
            _cachedDbAccess = cachedDbAccess;
            _dailyRoutineEventPlaceholderResolver = dailyRoutineEventPlaceholderResolver;
            _flexFieldPlaceholderResolver = new FlexFieldExportTemplatePlaceholderResolver(defaultTemplateProvider, cachedDbAccess, languageKeyGenerator, localizerFactory, NpcPlaceholderPrefix);
            _isDisabled = isDisabled;
        }

        /// <summary>
        /// Builds a condition element from parsed data
        /// </summary>
        /// <param name="parsedData">Parsed data</param>
        /// <param name="project">Project</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <param name="npc">Npc to which the dialog belongs</param>
        /// <param name="exportSettings">Export Settings</param>
        /// <returns>Condition string</returns>
        public override string BuildConditionElementFromParsedData(DailyRoutineEventStateConditionResolver.DailyRoutineEventStateConditionData parsedData, GoNorthProject project, ExportPlaceholderErrorCollection errorCollection, KortistoNpc npc, ExportSettings exportSettings)
        {
            ExportTemplate conditionTemplate = _defaultTemplateProvider.GetDefaultTemplateByType(project.Id, _isDisabled ? TemplateType.TaleConditionDailyRoutineEventDisabled : TemplateType.TaleConditionDailyRoutineEventEnabled).Result;
            
            KortistoNpc eventNpc = _cachedDbAccess.GetNpcById(parsedData.NpcId).Result;
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

            MiscProjectConfig projectConfig = _cachedDbAccess.GetMiscProjectConfig().Result;

            string conditionCode = _dailyRoutineEventPlaceholderResolver.ResolveDailyRoutineEventPlaceholders(conditionTemplate.Code, eventNpc, exportEvent).Result;

            ExportObjectData flexFieldExportData = new ExportObjectData();
            flexFieldExportData.ExportData.Add(ExportConstants.ExportDataObject, eventNpc);
            flexFieldExportData.ExportData.Add(ExportConstants.ExportDataObjectType, ExportConstants.ExportObjectTypeNpc);

            _flexFieldPlaceholderResolver.SetErrorMessageCollection(errorCollection);
            conditionCode = _flexFieldPlaceholderResolver.FillPlaceholders(conditionCode, flexFieldExportData).Result;

            return conditionCode;
        }

        /// <summary>
        /// Returns if true the condition element renderer has placeholders for a template type
        /// </summary>
        /// <param name="templateType">Tempalte Type to check</param>
        /// <returns>true if the condition element renderer has placeholders for the template type</returns>
        public override bool HasPlaceholdersForTemplateType(TemplateType templateType)
        {
            return (_isDisabled && templateType == TemplateType.TaleConditionDailyRoutineEventDisabled) || (!_isDisabled && templateType == TemplateType.TaleConditionDailyRoutineEventEnabled);
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