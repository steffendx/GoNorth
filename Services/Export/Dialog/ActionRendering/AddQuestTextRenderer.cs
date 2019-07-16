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
    /// Class for rendering an add quest text action
    /// </summary>
    public class AddQuestTextRenderer : BaseActionRenderer<AddQuestTextRenderer.AddQuestTextData>
    {
        /// <summary>
        /// Add quest text action data
        /// </summary>
        public class AddQuestTextData
        {
            /// <summary>
            /// Quest Id
            /// </summary>
            public string QuestId { get; set; }

            /// <summary>
            /// Quest text
            /// </summary>
            public string QuestText { get; set; }
        }

        /// <summary>
        /// Placeholder for the Quest text
        /// </summary>
        private const string Placeholder_QuestText = "Tale_Action_QuestText";

        /// <summary>
        /// Placeholder for the Quest text language key
        /// </summary>
        private const string Placeholder_QuestText_LangKey = "Tale_Action_QuestText_LangKey";

        /// <summary>
        /// Placeholder for the Quest text preview
        /// </summary>
        private const string Placeholder_QuestText_Preview = "Tale_Action_QuestText_Preview";


        /// <summary>
        /// Flex Field Quest Resolver Prefix
        /// </summary>
        private const string FlexField_Quest_Prefix = "Tale_Action_Quest";


        /// <summary>
        /// Default Template Provider
        /// </summary>
        private readonly ICachedExportDefaultTemplateProvider _defaultTemplateProvider;

        /// <summary>
        /// Cached Db Access
        /// </summary>
        private readonly IExportCachedDbAccess _cachedDbAccess;

        /// <summary>
        /// Language key Generator
        /// </summary>
        private readonly ILanguageKeyGenerator _languageKeyGenerator;

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
        public AddQuestTextRenderer(ICachedExportDefaultTemplateProvider defaultTemplateProvider, IExportCachedDbAccess cachedDbAccess, ILanguageKeyGenerator languageKeyGenerator, IStringLocalizerFactory localizerFactory)
        {
            _defaultTemplateProvider = defaultTemplateProvider;
            _cachedDbAccess = cachedDbAccess;
            _languageKeyGenerator = languageKeyGenerator;
            _localizer = localizerFactory.Create(typeof(AddQuestTextRenderer));
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
        public override async Task<string> BuildActionFromParsedData(AddQuestTextRenderer.AddQuestTextData parsedData, ExportDialogData data, GoNorthProject project, ExportPlaceholderErrorCollection errorCollection, KortistoNpc npc, ExportSettings exportSettings)
        {
            ExportTemplate actionTemplate = await GetExportTemplate(project);
            IFlexFieldExportable valueObject = await GetQuest(parsedData, errorCollection);
            if(valueObject == null)
            {
                return string.Empty;
            }

            string actionCode = ExportUtil.BuildPlaceholderRegex(Placeholder_QuestText).Replace(actionTemplate.Code, ExportUtil.EscapeCharacters(parsedData.QuestText, exportSettings.EscapeCharacter, exportSettings.CharactersNeedingEscaping, exportSettings.NewlineCharacter));
            actionCode = ExportUtil.BuildPlaceholderRegex(Placeholder_QuestText_Preview).Replace(actionCode, ExportUtil.BuildTextPreview(parsedData.QuestText));
            actionCode = ExportUtil.BuildPlaceholderRegex(Placeholder_QuestText_LangKey).Replace(actionCode, m => {
                return _languageKeyGenerator.GetDialogTextLineKey(npc.Id, valueObject.Name, ExportConstants.LanguageKeyTypeQuest, data.Id, parsedData.QuestText).Result;
            });

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
        public override async Task<string> BuildPreviewTextFromParsedData(AddQuestTextRenderer.AddQuestTextData parsedData, KortistoNpc npc, ExportPlaceholderErrorCollection errorCollection)
        {
            IFlexFieldExportable valueObject = await GetQuest(parsedData, errorCollection);
            if(valueObject == null)
            {
                return string.Empty;
            }

            return "AddQuestText (" + valueObject.Name + ", " + ExportUtil.BuildTextPreview(parsedData.QuestText) + ")";
        }


        /// <summary>
        /// Returns the export template to use
        /// </summary>
        /// <param name="project">Project</param>
        /// <returns>Export template to use</returns>
        private async Task<ExportTemplate> GetExportTemplate(GoNorthProject project)
        {
            return await _defaultTemplateProvider.GetDefaultTemplateByType(project.Id, TemplateType.TaleActionAddQuestText);
        }

        /// <summary>
        /// Returns the quest use
        /// </summary>
        /// <param name="parsedData">Parsed data</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <returns>Value Object</returns>
        private async Task<IFlexFieldExportable> GetQuest(AddQuestTextRenderer.AddQuestTextData parsedData, ExportPlaceholderErrorCollection errorCollection)
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
            return templateType == TemplateType.TaleActionAddQuestText;
        }   

        /// <summary>
        /// Returns the Export Template Placeholders for a Template Type
        /// </summary>
        /// <param name="templateType">Template Type</param>
        /// <returns>Export Template Placeholder</returns>
        public override List<ExportTemplatePlaceholder> GetExportTemplatePlaceholdersForType(TemplateType templateType)
        {
            List<ExportTemplatePlaceholder> exportPlaceholders = new List<ExportTemplatePlaceholder> {
                ExportUtil.CreatePlaceHolder(Placeholder_QuestText, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_QuestText_LangKey, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_QuestText_Preview, _localizer)
            };

            exportPlaceholders.AddRange(_flexFieldPlaceholderResolver.GetExportTemplatePlaceholdersForType(TemplateType.ObjectNpc));

            return exportPlaceholders;
        }
    }
}