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
    /// Class for rendering a move npc to npc action
    /// </summary>
    public class ScribanMoveNpcToNpcActionRenderer : BaseMoveNpcToNpcActionRenderer
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
        /// <param name="isTeleport">true if the movement is a teleporation, else false</param>
        /// <param name="isPickedNpc">true if the npc was picked, else false</param>
        public ScribanMoveNpcToNpcActionRenderer(IExportCachedDbAccess cachedDbAccess, IScribanLanguageKeyGenerator scribanLanguageKeyGenerator, IStringLocalizerFactory localizerFactory, bool isTeleport, bool isPickedNpc) : 
                                                 base(cachedDbAccess, isTeleport, isPickedNpc)
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
        /// <param name="npc">Npc to move</param>
        /// <param name="targetNpc">Target npc</param>
        /// <param name="directContinueFunction">Direct continue function</param>
        /// <param name="flexFieldObject">Flex field object to which the dialog belongs</param>
        /// <param name="curStep">Current step that is rendered</param>
        /// <param name="nextStep">Next step that is being rendered</param>
        /// <param name="exportSettings">Export Settings</param>
        /// <param name="stepRenderer">Action Step renderer</param>
        /// <returns>Filled placeholders</returns>
        protected override async Task<string> FillPlaceholders(ExportTemplate template, ExportPlaceholderErrorCollection errorCollection, MoveNpcToNpcActionData parsedData, KortistoNpc npc, KortistoNpc targetNpc, string directContinueFunction, 
                                                               FlexFieldObject flexFieldObject, ExportDialogData curStep, ExportDialogData nextStep, ExportSettings exportSettings, IActionStepRenderer stepRenderer)
        {
            ScribanMoveNpcToNpcActionBaseData actionData;
            if(_isTeleport)
            {
                actionData = new ScribanMoveNpcToNpcActionBaseData();
            }
            else
            {
                ScribanMoveNpcToNpcActionData walkData = new ScribanMoveNpcToNpcActionData();
                walkData.MovementState = !string.IsNullOrEmpty(parsedData.MovementState) ? ExportUtil.EscapeCharacters(parsedData.MovementState, exportSettings.EscapeCharacter, exportSettings.CharactersNeedingEscaping, exportSettings.NewlineCharacter) : null;
                walkData.UnescapedMovementState = parsedData.MovementState;
                walkData.DirectContinueFunction = !string.IsNullOrEmpty(directContinueFunction) ? directContinueFunction : null;

                actionData = walkData;
            }
            actionData.Npc = FlexFieldValueCollectorUtil.BuildFlexFieldValueObject<ScribanExportNpc>(null, null, npc, exportSettings, errorCollection);
            actionData.Npc.IsPlayer = npc.IsPlayerNpc;
            actionData.TargetNpc = FlexFieldValueCollectorUtil.BuildFlexFieldValueObject<ScribanExportNpc>(null, null, targetNpc, exportSettings, errorCollection);
            actionData.TargetNpc.IsPlayer = targetNpc.IsPlayerNpc;

            return await ScribanActionRenderingUtil.FillPlaceholders(_cachedDbAccess, errorCollection, template.Code, actionData, flexFieldObject, curStep, nextStep, _scribanLanguageKeyGenerator, stepRenderer);
        }

        /// <summary>
        /// Returns the Export Template Placeholders for a Template Type
        /// </summary>
        /// <param name="templateType">Template Type</param>
        /// <returns>Export Template Placeholder</returns>
        public override List<ExportTemplatePlaceholder> GetExportTemplatePlaceholdersForType(TemplateType templateType)
        {
            string languageKeyValueDesc = string.Format("{0}.{1}.{2} | {0}.{3}.{4} | field.{5}", ExportConstants.ScribanActionObjectKey, StandardMemberRenamer.Rename(nameof(ScribanMoveNpcToNpcActionBaseData.Npc)), 
                                                        StandardMemberRenamer.Rename(nameof(ScribanMoveNpcToNpcActionBaseData.Npc.Name)), StandardMemberRenamer.Rename(nameof(ScribanMoveNpcToNpcActionBaseData.TargetNpc)), 
                                                        StandardMemberRenamer.Rename(nameof(ScribanMoveNpcToNpcActionBaseData.TargetNpc.Name)),StandardMemberRenamer.Rename(nameof(ScribanFlexFieldField.Value)));
            if(_isTeleport)
            {
                return ScribanActionRenderingUtil.GetExportTemplatePlaceholdersForType<ScribanMoveNpcToNpcActionBaseData>(_localizerFactory, _scribanLanguageKeyGenerator, languageKeyValueDesc);
            }
            else
            {
                return ScribanActionRenderingUtil.GetExportTemplatePlaceholdersForType<ScribanMoveNpcToNpcActionData>(_localizerFactory, _scribanLanguageKeyGenerator, languageKeyValueDesc);
            }
        }
    }
}