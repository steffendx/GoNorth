using System.Collections.Generic;
using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Data.FlexFieldDatabase;
using GoNorth.Services.Export.Data;
using GoNorth.Services.Export.Dialog.ActionRendering.ConfigObject;
using GoNorth.Services.Export.Dialog.ActionRendering.SharedRendering;
using GoNorth.Services.Export.Dialog.StepRenderers.ActionRenderer;
using GoNorth.Services.Export.LanguageKeyGeneration;
using GoNorth.Services.Export.Placeholder;
using GoNorth.Services.Export.Placeholder.LegacyRenderingEngine;
using Microsoft.Extensions.Localization;

namespace GoNorth.Services.Export.Dialog.ActionRendering.LegacyRenderingEngine
{
    /// <summary>
    /// Class for rendering a set quest state action
    /// </summary>
    public class SetQuestStateActionRenderer : BaseSetQuestStateActionRenderer
    {
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
        public SetQuestStateActionRenderer(ICachedExportDefaultTemplateProvider defaultTemplateProvider, IExportCachedDbAccess cachedDbAccess, ILanguageKeyGenerator languageKeyGenerator, IStringLocalizerFactory localizerFactory) : base(cachedDbAccess)
        {
            _localizer = localizerFactory.Create(typeof(SetQuestStateActionRenderer));
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
        /// Fills the placeholders
        /// </summary>
        /// <param name="template">Template to use</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <param name="parsedData">Parsed config data</param>
        /// <param name="valueObject">Value object</param>
        /// <param name="flexFieldObject">Flex field object to which the dialog belongs</param>
        /// <param name="curStep">Current step that is rendered</param>
        /// <param name="nextStep">Next step that is being rendered</param>
        /// <param name="exportSettings">Export Settings</param>
        /// <param name="stepRenderer">Action Step renderer</param>
        /// <returns>Filled placeholders</returns>
        protected override async Task<string> FillPlaceholders(ExportTemplate template, ExportPlaceholderErrorCollection errorCollection, SetQuestStateActionData parsedData, IFlexFieldExportable valueObject, FlexFieldObject flexFieldObject, 
                                                               ExportDialogData curStep, ExportDialogData nextStep, ExportSettings exportSettings, IActionStepRenderer stepRenderer)
        {
            string actionCode = ExportUtil.RenderPlaceholderIfTrue(template.Code, Placeholder_QuestState_NotStarted_Start, Placeholder_QuestState_NotStarted_End, parsedData.QuestState == SetQuestStateActionData.QuestState_NotStarted);
            actionCode = ExportUtil.RenderPlaceholderIfTrue(actionCode, Placeholder_QuestState_InProgress_Start, Placeholder_QuestState_InProgress_End, parsedData.QuestState == SetQuestStateActionData.QuestState_InProgress);
            actionCode = ExportUtil.RenderPlaceholderIfTrue(actionCode, Placeholder_QuestState_Success_Start, Placeholder_QuestState_Success_End, parsedData.QuestState == SetQuestStateActionData.QuestState_Success);
            actionCode = ExportUtil.RenderPlaceholderIfTrue(actionCode, Placeholder_QuestState_Failed_Start, Placeholder_QuestState_Failed_End, parsedData.QuestState == SetQuestStateActionData.QuestState_Failed);

            ExportObjectData flexFieldExportData = new ExportObjectData();
            flexFieldExportData.ExportData.Add(ExportConstants.ExportDataObject, valueObject);
            flexFieldExportData.ExportData.Add(ExportConstants.ExportDataObjectType, ExportConstants.ExportObjectTypeQuest);

            _flexFieldPlaceholderResolver.SetErrorMessageCollection(errorCollection);
            actionCode = _flexFieldPlaceholderResolver.FillPlaceholders(actionCode, flexFieldExportData).Result;

            return await stepRenderer.ReplaceBasePlaceholders(errorCollection, actionCode, curStep, nextStep, flexFieldObject);
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