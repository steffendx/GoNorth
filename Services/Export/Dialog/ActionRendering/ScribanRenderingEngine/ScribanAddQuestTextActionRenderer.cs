using System.Collections.Generic;
using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Data.FlexFieldDatabase;
using GoNorth.Services.Export.Data;
using GoNorth.Services.Export.Dialog.ActionRendering.ConfigObject;
using GoNorth.Services.Export.Dialog.ActionRendering.ScribanRenderingEngine.RenderingObjects;
using GoNorth.Services.Export.Dialog.ActionRendering.ScribanRenderingEngine.Util;
using GoNorth.Services.Export.Dialog.ActionRendering.SharedRendering;
using GoNorth.Services.Export.Dialog.StepRenderers.ActionRenderer;
using GoNorth.Services.Export.Placeholder;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.LanguageKeyGenerator;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.RenderingObjects;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.Util;
using Microsoft.Extensions.Localization;
using Scriban.Runtime;

namespace GoNorth.Services.Export.Dialog.ActionRendering.ScribanRenderingEngine
{
    /// <summary>
    /// Class for rendering a add quest text action
    /// </summary>
    public class ScribanAddQuestTextActionRenderer : BaseAddQuestTextRenderer
    {
        /// <summary>
        /// Scriban language key generator
        /// </summary>
        private readonly IScribanLanguageKeyGenerator _scribanLanguageKeyGenerator;

        /// <summary>
        /// String Localizer Factory
        /// </summary>
        private readonly IStringLocalizerFactory _localizerFactory;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="cachedDbAccess">Cached Db Access</param>
        /// <param name="scribanLanguageKeyGenerator">Scriban language key generator</param>
        /// <param name="localizerFactory">Localizer Factory</param>
        public ScribanAddQuestTextActionRenderer(IExportCachedDbAccess cachedDbAccess, IScribanLanguageKeyGenerator scribanLanguageKeyGenerator, IStringLocalizerFactory localizerFactory) : base(cachedDbAccess)
        {
            _scribanLanguageKeyGenerator = scribanLanguageKeyGenerator;
            _localizerFactory = localizerFactory;
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
            ScribanAddQuestTextActionData actionData = new ScribanAddQuestTextActionData();
            actionData.Quest = FlexFieldValueCollectorUtil.BuildFlexFieldValueObject<ScribanExportQuest>(null, null, valueObject, exportSettings, errorCollection);
            actionData.Text = ExportUtil.EscapeCharacters(parsedData.QuestText, exportSettings.EscapeCharacter, exportSettings.CharactersNeedingEscaping, exportSettings.NewlineCharacter);
            actionData.UnescapedText = parsedData.QuestText;
            actionData.TextPreview = ExportUtil.BuildTextPreview(parsedData.QuestText);
            actionData.FlexFieldObject = flexFieldObject;
            actionData.NodeStep = curStep;

            return await ScribanActionRenderingUtil.FillPlaceholders(_cachedDbAccess, errorCollection, template.Code, actionData, flexFieldObject, curStep, nextStep, _scribanLanguageKeyGenerator, stepRenderer);
        }

        /// <summary>
        /// Returns the Export Template Placeholders for a Template Type
        /// </summary>
        /// <param name="templateType">Template Type</param>
        /// <returns>Export Template Placeholder</returns>
        public override List<ExportTemplatePlaceholder> GetExportTemplatePlaceholdersForType(TemplateType templateType)
        {
            string languageKeyValueDesc = string.Format("{0}.{1}.{2} | {0}.{3} | field.{4}", ExportConstants.ScribanActionObjectKey, StandardMemberRenamer.Rename(nameof(ScribanAddQuestTextActionData.Quest)), 
                                                        StandardMemberRenamer.Rename(nameof(ScribanExportQuest.Name)), StandardMemberRenamer.Rename(nameof(ScribanAddQuestTextActionData.Text)),
                                                        StandardMemberRenamer.Rename(nameof(ScribanFlexFieldField.Value)));
            return ScribanActionRenderingUtil.GetExportTemplatePlaceholdersForType<ScribanAddQuestTextActionData>(_localizerFactory, _scribanLanguageKeyGenerator, languageKeyValueDesc);
        }
    }
}