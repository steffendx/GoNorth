using System.Collections.Generic;
using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Data.FlexFieldDatabase;
using GoNorth.Extensions;
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
    /// Class for rendering an add quest text action
    /// </summary>
    public class AddQuestTextRenderer : BaseAddQuestTextRenderer
    {
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
        public AddQuestTextRenderer(ICachedExportDefaultTemplateProvider defaultTemplateProvider, IExportCachedDbAccess cachedDbAccess, ILanguageKeyGenerator languageKeyGenerator, IStringLocalizerFactory localizerFactory) :
                                    base(cachedDbAccess)
        {
            _languageKeyGenerator = languageKeyGenerator;
            _localizer = localizerFactory.Create(typeof(AddQuestTextRenderer));
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
        /// <param name="flexFieldObject">Flex field object to which the dialog belongs</param>
        /// <param name="valueObject">Value object to export</param>
        /// <param name="curStep">Current step that is rendered</param>
        /// <param name="nextStep">Next step that is being rendered</param>
        /// <param name="exportSettings">Export Settings</param>
        /// <param name="stepRenderer">Action Step renderer</param>
        /// <returns>Filled placeholders</returns>
        protected override async Task<string> FillPlaceholders(ExportTemplate template, ExportPlaceholderErrorCollection errorCollection, AddQuestTextData parsedData, IFlexFieldExportable valueObject, FlexFieldObject flexFieldObject, 
                                                         ExportDialogData curStep, ExportDialogData nextStep, ExportSettings exportSettings, IActionStepRenderer stepRenderer)
        {
            string actionCode = ExportUtil.BuildPlaceholderRegex(Placeholder_QuestText).Replace(template.Code, ExportUtil.EscapeCharacters(parsedData.QuestText, exportSettings.EscapeCharacter, exportSettings.CharactersNeedingEscaping, exportSettings.NewlineCharacter));
            actionCode = ExportUtil.BuildPlaceholderRegex(Placeholder_QuestText_Preview).Replace(actionCode, ExportUtil.BuildTextPreview(parsedData.QuestText));
            actionCode = await ExportUtil.BuildPlaceholderRegex(Placeholder_QuestText_LangKey).ReplaceAsync(actionCode, async m => {
                return await _languageKeyGenerator.GetDialogTextLineKey(flexFieldObject.Id, valueObject.Name, ExportConstants.LanguageKeyTypeQuest, curStep.Id, parsedData.QuestText);
            });

            ExportObjectData flexFieldExportData = new ExportObjectData();
            flexFieldExportData.ExportData.Add(ExportConstants.ExportDataObject, valueObject);
            flexFieldExportData.ExportData.Add(ExportConstants.ExportDataObjectType, ExportConstants.ExportObjectTypeQuest);

            _flexFieldPlaceholderResolver.SetErrorMessageCollection(errorCollection);
            actionCode = await _flexFieldPlaceholderResolver.FillPlaceholders(actionCode, flexFieldExportData);

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
                ExportUtil.CreatePlaceHolder(Placeholder_QuestText, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_QuestText_LangKey, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_QuestText_Preview, _localizer)
            };

            exportPlaceholders.AddRange(_flexFieldPlaceholderResolver.GetExportTemplatePlaceholdersForType(TemplateType.ObjectNpc));

            return exportPlaceholders;
        }
    }
}