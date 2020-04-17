using System.Collections.Generic;
using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Data.FlexFieldDatabase;
using GoNorth.Data.Kortisto;
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
    /// Class for rendering a change npc state action using scriban
    /// </summary>
    public class ScribanChangeNpcStateActionRenderer : BaseChangeNpcStateActionRenderer
    {
        /// <summary>
        /// Scriban Language Key generator
        /// </summary>
        private readonly IScribanLanguageKeyGenerator _scribanLanguageKeyGenerator;

        /// <summary>
        /// String Localizer factory
        /// </summary>
        private readonly IStringLocalizerFactory _localizerFactory;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="cachedDbAccess">Cached Db Access</param>
        /// <param name="scribanLanguageKeyGenerator">Scriban Language Key Generator</param>
        /// <param name="localizerFactory">Localizer Factory</param>
        /// <param name="isPlayer">true if the renderer is for the player, else false</param>
        public ScribanChangeNpcStateActionRenderer(IExportCachedDbAccess cachedDbAccess, IScribanLanguageKeyGenerator scribanLanguageKeyGenerator, IStringLocalizerFactory localizerFactory, bool isPlayer) : base(cachedDbAccess, isPlayer)
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
        /// <param name="valueObject">Value object to export</param>
        /// <param name="flexFieldObject">Flex field object to which the dialog belongs</param>
        /// <param name="curStep">Current step that is rendered</param>
        /// <param name="nextStep">Next step that is being rendered</param>
        /// <param name="exportSettings">Export Settings</param>
        /// <param name="stepRenderer">Action Step renderer</param>
        /// <returns>Filled placeholders</returns>
        protected override async Task<string> FillPlaceholders(ExportTemplate template, ExportPlaceholderErrorCollection errorCollection, ChangeNpcStateActionData parsedData, IFlexFieldExportable valueObject, FlexFieldObject flexFieldObject, 
                                                               ExportDialogData curStep, ExportDialogData nextStep, ExportSettings exportSettings, IActionStepRenderer stepRenderer)
        {
            KortistoNpc npc = valueObject as KortistoNpc;
            if(npc == null)
            {
                errorCollection.AddDialogNpcNotFoundError();
                return string.Empty;
            }

            ScribanChangeNpcStateActionData changeNpcStateData = new ScribanChangeNpcStateActionData();
            changeNpcStateData.Npc = FlexFieldValueCollectorUtil.BuildFlexFieldValueObject<ScribanExportNpc>(null, null, npc, exportSettings, errorCollection);
            changeNpcStateData.Npc.IsPlayer = npc.IsPlayerNpc;
            changeNpcStateData.TargetState = ExportUtil.EscapeCharacters(parsedData.ObjectState, exportSettings.EscapeCharacter, exportSettings.CharactersNeedingEscaping, exportSettings.NewlineCharacter);
            changeNpcStateData.UnescapedTargetState = parsedData.ObjectState;
            
            return await ScribanActionRenderingUtil.FillPlaceholders(_cachedDbAccess, errorCollection, template.Code, changeNpcStateData, flexFieldObject, curStep, nextStep, _scribanLanguageKeyGenerator, stepRenderer);
        }

        /// <summary>
        /// Returns the Export Template Placeholders for a Template Type
        /// </summary>
        /// <param name="templateType">Template Type</param>
        /// <returns>Export Template Placeholder</returns>
        public override List<ExportTemplatePlaceholder> GetExportTemplatePlaceholdersForType(TemplateType templateType)
        {
            string languageKeyValueDesc = string.Format("{0}.{1}.{2} | field.{3}", ExportConstants.ScribanActionObjectKey, StandardMemberRenamer.Rename(nameof(ScribanChangeNpcStateActionData.Npc)), 
                                                        StandardMemberRenamer.Rename(nameof(ScribanChangeNpcStateActionData.Npc.Name)), StandardMemberRenamer.Rename(nameof(ScribanFlexFieldField.Name)));
            return ScribanActionRenderingUtil.GetExportTemplatePlaceholdersForType<ScribanChangeNpcStateActionData>(_localizerFactory, _scribanLanguageKeyGenerator, languageKeyValueDesc);
        }
    }
}