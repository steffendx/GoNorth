using System.Collections.Generic;
using System.Threading.Tasks;
using GoNorth.Data.Aika;
using GoNorth.Data.Exporting;
using GoNorth.Data.Kortisto;
using GoNorth.Data.Project;
using GoNorth.Services.Export.Data;
using GoNorth.Services.Export.LanguageKeyGeneration;
using GoNorth.Services.Export.Placeholder;
using Microsoft.Extensions.Localization;

namespace GoNorth.Services.Export.Dialog.ActionRendering
{
    /// <summary>
    /// Class for rendering a set quest state action
    /// </summary>
    public class SetQuestStateActionRenderer : BaseActionRenderer<SetQuestStateActionRenderer.SetQuestStateActionData>
    {
        /// <summary>
        /// Set quest state action data
        /// </summary>
        public class SetQuestStateActionData
        {
            /// <summary>
            /// Quest Id
            /// </summary>
            public string QuestId { get; set; }

            /// <summary>
            /// Quest State
            /// </summary>
            public string QuestState { get; set; }
        }


        /// <summary>
        /// Placeholder for the start of the content to render if the quest state should be set to not started
        /// </summary>
        private const string Placeholder_QuestState_NotStarted_Start = "Tale_Action_QuestState_Is_NotStarted_Start";
        
        /// <summary>
        /// Placeholder for the end of the content to render if the quest state should be set to not started
        /// </summary>
        private const string Placeholder_QuestState_NotStarted_End = "Tale_Action_QuestState_Is_NotStarted_End";

        /// <summary>
        /// Placeholder for the start of the content to render if the quest state should be set to in progress
        /// </summary>
        private const string Placeholder_QuestState_InProgress_Start = "Tale_Action_QuestState_Is_InProgress_Start";
        
        /// <summary>
        /// Placeholder for the end of the content to render if the quest state should be set to in progress
        /// </summary>
        private const string Placeholder_QuestState_InProgress_End = "Tale_Action_QuestState_Is_InProgress_End";

        /// <summary>
        /// Placeholder for the start of the content to render if the quest state should be set to success
        /// </summary>
        private const string Placeholder_QuestState_Success_Start = "Tale_Action_QuestState_Is_Success_Start";
        
        /// <summary>
        /// Placeholder for the end of the content to render if the quest state should be set to success
        /// </summary>
        private const string Placeholder_QuestState_Success_End = "Tale_Action_QuestState_Is_Success_End";

        /// <summary>
        /// Placeholder for the start of the content to render if the quest state should be set to failed
        /// </summary>
        private const string Placeholder_QuestState_Failed_Start = "Tale_Action_QuestState_Is_Failed_Start";
        
        /// <summary>
        /// Placeholder for the end of the content to render if the quest state should be set to failed
        /// </summary>
        private const string Placeholder_QuestState_Failed_End = "Tale_Action_QuestState_Is_Failed_End";

        /// <summary>
        /// Flex Field Quest Resolver Prefix
        /// </summary>
        private const string FlexField_Quest_Prefix = "Tale_Action_Quest";


        /// <summary>
        /// Quest State Not Started
        /// </summary>
        private const string QuestState_NotStarted = "0";

        /// <summary>
        /// Quest State In Progress
        /// </summary>
        private const string QuestState_InProgress = "1";

        /// <summary>
        /// Quest State Success
        /// </summary>
        private const string QuestState_Success = "2";

        /// <summary>
        /// Quest State Failed
        /// </summary>
        private const string QuestState_Failed = "3";


        /// <summary>
        /// Default Template Provider
        /// </summary>
        protected readonly ICachedExportDefaultTemplateProvider _defaultTemplateProvider;

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
        public SetQuestStateActionRenderer(ICachedExportDefaultTemplateProvider defaultTemplateProvider, IExportCachedDbAccess cachedDbAccess, ILanguageKeyGenerator languageKeyGenerator, IStringLocalizerFactory localizerFactory)
        {
            _defaultTemplateProvider = defaultTemplateProvider;
            _cachedDbAccess = cachedDbAccess;
            _localizer = localizerFactory.Create(typeof(SetQuestStateActionRenderer));
            _flexFieldPlaceholderResolver = new FlexFieldExportTemplatePlaceholderResolver(defaultTemplateProvider, cachedDbAccess, languageKeyGenerator, localizerFactory, FlexField_Quest_Prefix);
        }

        /// <summary>
        /// Builds an action from parsed data
        /// </summary>
        /// <param name="parsedData">Parsed data</param>
        /// <param name="data">Dialog data</param>
        /// <param name="project">Project</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <param name="npc">Npc to which the dialog belongs</param>
        /// <param name="exportSettings">Export Settings</param>
        /// <returns>Action string</returns>
        public override async Task<string> BuildActionFromParsedData(SetQuestStateActionRenderer.SetQuestStateActionData parsedData, ExportDialogData data, GoNorthProject project, ExportPlaceholderErrorCollection errorCollection, KortistoNpc npc, ExportSettings exportSettings)
        {
            ExportTemplate actionTemplate = await GetExportTemplate(project);
            IFlexFieldExportable valueObject = await GetQuest(parsedData, errorCollection);
            if(valueObject == null)
            {
                return string.Empty;
            }

            string actionCode = ExportUtil.RenderPlaceholderIfTrue(actionTemplate.Code, Placeholder_QuestState_NotStarted_Start, Placeholder_QuestState_NotStarted_End, parsedData.QuestState == QuestState_NotStarted);
            actionCode = ExportUtil.RenderPlaceholderIfTrue(actionCode, Placeholder_QuestState_InProgress_Start, Placeholder_QuestState_InProgress_End, parsedData.QuestState == QuestState_InProgress);
            actionCode = ExportUtil.RenderPlaceholderIfTrue(actionCode, Placeholder_QuestState_Success_Start, Placeholder_QuestState_Success_End, parsedData.QuestState == QuestState_Success);
            actionCode = ExportUtil.RenderPlaceholderIfTrue(actionCode, Placeholder_QuestState_Failed_Start, Placeholder_QuestState_Failed_End, parsedData.QuestState == QuestState_Failed);

            ExportObjectData flexFieldExportData = new ExportObjectData();
            flexFieldExportData.ExportData.Add(ExportConstants.ExportDataObject, valueObject);
            flexFieldExportData.ExportData.Add(ExportConstants.ExportDataObjectType, ExportConstants.ExportObjectTypeQuest);

            _flexFieldPlaceholderResolver.SetErrorMessageCollection(errorCollection);
            actionCode = _flexFieldPlaceholderResolver.FillPlaceholders(actionCode, flexFieldExportData).Result;

            return actionCode;
        }

        /// <summary>
        /// Builds a preview text from parsed data
        /// </summary>
        /// <param name="parsedData">Parsed data</param>
        /// <param name="npc">Npc to which the dialog belongs</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <returns>Preview text</returns>
        public override async Task<string> BuildPreviewTextFromParsedData(SetQuestStateActionRenderer.SetQuestStateActionData parsedData, KortistoNpc npc, ExportPlaceholderErrorCollection errorCollection)
        {
            IFlexFieldExportable valueObject = await GetQuest(parsedData, errorCollection);
            if(valueObject == null)
            {
                return string.Empty;
            }

            return "SetQuestState (" + valueObject.Name + ", " + parsedData.QuestState + ")";
        }


        /// <summary>
        /// Returns the export template to use
        /// </summary>
        /// <param name="project">Project</param>
        /// <returns>Export template to use</returns>
        private async Task<ExportTemplate> GetExportTemplate(GoNorthProject project)
        {
            return await _defaultTemplateProvider.GetDefaultTemplateByType(project.Id, TemplateType.TaleActionSetQuestState);
        }

        /// <summary>
        /// Returns the quest use
        /// </summary>
        /// <param name="parsedData">Parsed data</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <returns>Value Object</returns>
        private async Task<IFlexFieldExportable> GetQuest(SetQuestStateActionRenderer.SetQuestStateActionData parsedData, ExportPlaceholderErrorCollection errorCollection)
        {
            AikaQuest quest = await _cachedDbAccess.GetQuestById(parsedData.QuestId);
            if(quest == null) 
            {
                errorCollection.AddDialogQuestNotFoundError();
                return null;
            }

            return quest;
        }

        /// <summary>
        /// Returns true if the action renderer has placeholders for a template type
        /// </summary>
        /// <param name="templateType">Tempalte Type to check</param>
        /// <returns>true if the action renderer has placeholders for the template type</returns>
        public override bool HasPlaceholdersForTemplateType(TemplateType templateType)
        {
            return templateType == TemplateType.TaleActionSetQuestState;
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