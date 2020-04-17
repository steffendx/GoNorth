using System.Collections.Generic;
using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Data.FlexFieldDatabase;
using GoNorth.Data.Project;
using GoNorth.Services.Export.Data;
using GoNorth.Services.Export.Dialog.ConditionRendering.ConfigObject;
using GoNorth.Services.Export.LanguageKeyGeneration;
using GoNorth.Services.Export.Placeholder;
using GoNorth.Services.Export.Placeholder.LegacyRenderingEngine;
using Microsoft.Extensions.Localization;

namespace GoNorth.Services.Export.Dialog.ConditionRendering.LegacyRenderingEngine
{
    /// <summary>
    /// Class for rendering a quest state condition 
    /// </summary>
    public class QuestStateConditionResolver :  BaseConditionRenderer<QuestStateConditionData>
    {

        /// <summary>
        /// Placeholder for the start of the content to render if the quest state should be not started
        /// </summary>
        private const string Placeholder_QuestState_NotStarted_Start = "Tale_Condition_QuestState_Is_NotStarted_Start";
        
        /// <summary>
        /// Placeholder for the end of the content to render if the quest state should be not started
        /// </summary>
        private const string Placeholder_QuestState_NotStarted_End = "Tale_Condition_QuestState_Is_NotStarted_End";

        /// <summary>
        /// Placeholder for the start of the content to render if the quest state should be in progress
        /// </summary>
        private const string Placeholder_QuestState_InProgress_Start = "Tale_Condition_QuestState_Is_InProgress_Start";
        
        /// <summary>
        /// Placeholder for the end of the content to render if the quest state should be in progress
        /// </summary>
        private const string Placeholder_QuestState_InProgress_End = "Tale_Condition_QuestState_Is_InProgress_End";

        /// <summary>
        /// Placeholder for the start of the content to render if the quest state should be success
        /// </summary>
        private const string Placeholder_QuestState_Success_Start = "Tale_Condition_QuestState_Is_Success_Start";
        
        /// <summary>
        /// Placeholder for the end of the content to render if the quest state should be success
        /// </summary>
        private const string Placeholder_QuestState_Success_End = "Tale_Condition_QuestState_Is_Success_End";

        /// <summary>
        /// Placeholder for the start of the content to render if the quest state should be failed
        /// </summary>
        private const string Placeholder_QuestState_Failed_Start = "Tale_Condition_QuestState_Is_Failed_Start";
        
        /// <summary>
        /// Placeholder for the end of the content to render if the quest state should be failed
        /// </summary>
        private const string Placeholder_QuestState_Failed_End = "Tale_Condition_QuestState_Is_Failed_End";


        /// <summary>
        /// Flex Field Condition Quest prefix
        /// </summary>
        private const string FlexField_Quest_Prefix = "Tale_Condition_Quest";


        /// <summary>
        /// Cached Db Access
        /// </summary>
        protected readonly IExportCachedDbAccess _cachedDbAccess;

        /// <summary>
        /// String Localizer
        /// </summary>
        private readonly IStringLocalizer _localizer;

        /// <summary>
        /// Resolver for flex field values
        /// </summary>
        private readonly FlexFieldExportTemplatePlaceholderResolver _flexFieldPlaceholderResolver;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="defaultTemplateProvider">Default Template Provider</param>
        /// <param name="cachedDbAccess">Cached Db Access</param>        
        /// <param name="languageKeyGenerator">Language Key Generator</param>
        /// <param name="localizerFactory">Localizer Factory</param>
        public QuestStateConditionResolver(ICachedExportDefaultTemplateProvider defaultTemplateProvider, IExportCachedDbAccess cachedDbAccess, ILanguageKeyGenerator languageKeyGenerator, IStringLocalizerFactory localizerFactory)
        {
            _cachedDbAccess = cachedDbAccess;
            _localizer = localizerFactory.Create(typeof(QuestStateConditionResolver));
            _flexFieldPlaceholderResolver = new FlexFieldExportTemplatePlaceholderResolver(defaultTemplateProvider, cachedDbAccess, languageKeyGenerator, localizerFactory, FlexField_Quest_Prefix);
        }

        /// <summary>
        /// Sets the export template placeholder resolver
        /// </summary>
        /// <param name="templatePlaceholderResolver">Template placeholder resolver</param>
        public override void SetExportTemplatePlaceholderResolver(IExportTemplatePlaceholderResolver templatePlaceholderResolver)
        {
            _flexFieldPlaceholderResolver.SetExportTemplatePlaceholderResolver(templatePlaceholderResolver);
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
        public override async Task<string> BuildConditionElementFromParsedData(ExportTemplate template, QuestStateConditionData parsedData, GoNorthProject project, ExportPlaceholderErrorCollection errorCollection, FlexFieldObject flexFieldObject, ExportSettings exportSettings)
        {
            IFlexFieldExportable quest = await _cachedDbAccess.GetQuestById(parsedData.QuestId);
            if(quest == null)
            {
                errorCollection.AddDialogQuestNotFoundError();
                return string.Empty;
            }

            string conditionCode = ExportUtil.RenderPlaceholderIfTrue(template.Code, Placeholder_QuestState_NotStarted_Start, Placeholder_QuestState_NotStarted_End, parsedData.State == QuestStateConditionData.QuestState_NotStarted);
            conditionCode = ExportUtil.RenderPlaceholderIfTrue(conditionCode, Placeholder_QuestState_InProgress_Start, Placeholder_QuestState_InProgress_End, parsedData.State == QuestStateConditionData.QuestState_InProgress);
            conditionCode = ExportUtil.RenderPlaceholderIfTrue(conditionCode, Placeholder_QuestState_Success_Start, Placeholder_QuestState_Success_End, parsedData.State == QuestStateConditionData.QuestState_Success);
            conditionCode = ExportUtil.RenderPlaceholderIfTrue(conditionCode, Placeholder_QuestState_Failed_Start, Placeholder_QuestState_Failed_End, parsedData.State == QuestStateConditionData.QuestState_Failed);

            ExportObjectData flexFieldExportData = new ExportObjectData();
            flexFieldExportData.ExportData.Add(ExportConstants.ExportDataObject, quest);
            flexFieldExportData.ExportData.Add(ExportConstants.ExportDataObjectType, ExportConstants.ExportObjectTypeQuest);

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
            List<ExportTemplatePlaceholder> exportPlaceholders = new List<ExportTemplatePlaceholder> {
                ExportUtil.CreatePlaceHolder(Placeholder_QuestState_NotStarted_Start, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_QuestState_NotStarted_End, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_QuestState_InProgress_Start, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_QuestState_InProgress_End, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_QuestState_Success_Start, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_QuestState_Success_End, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_QuestState_Failed_Start, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_QuestState_Failed_End, _localizer),
            };

            exportPlaceholders.AddRange(_flexFieldPlaceholderResolver.GetExportTemplatePlaceholdersForType(TemplateType.ObjectNpc));

            return exportPlaceholders;
        }
    }
}