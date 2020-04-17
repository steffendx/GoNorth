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
    /// Class for rendering a use item action
    /// </summary>
    public class ScribanUseItemActionRenderer : BaseUseItemActionRenderer
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
        /// <param name="scribanLanguageKeyGenerator">Language key generator</param>
        /// <param name="localizerFactory">Localizer Factory</param>
        /// <param name="isPlayer">True if the action is for the player, else false</param>
        /// <param name="isPickNpc">True if the action is for a pick npc, else false</param>
        public ScribanUseItemActionRenderer(IExportCachedDbAccess cachedDbAccess, IScribanLanguageKeyGenerator scribanLanguageKeyGenerator, IStringLocalizerFactory localizerFactory, bool isPlayer, bool isPickNpc) :
                                            base(cachedDbAccess, isPlayer, isPickNpc)
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
        /// <param name="valueItem">Item to export</param>
        /// <param name="valueNpc">Npc to export</param>
        /// <param name="flexFieldObject">Flex field object to which the dialog belongs</param>
        /// <param name="curStep">Current step that is rendered</param>
        /// <param name="nextStep">Next step that is being rendered</param>
        /// <param name="exportSettings">Export Settings</param>
        /// <param name="stepRenderer">Action Step renderer</param>
        /// <returns>Filled placeholders</returns>
        protected override async Task<string> FillPlaceholders(ExportTemplate template, ExportPlaceholderErrorCollection errorCollection, UseItemActionData parsedData, IFlexFieldExportable valueItem, IFlexFieldExportable valueNpc, 
                                                               FlexFieldObject flexFieldObject, ExportDialogData curStep, ExportDialogData nextStep, ExportSettings exportSettings, IActionStepRenderer stepRenderer)
        {
            ScribanUseItemActionData useItemActionData = new ScribanUseItemActionData();
            useItemActionData.Npc = FlexFieldValueCollectorUtil.BuildFlexFieldValueObject<ScribanExportNpc>(null, null, valueNpc, exportSettings, errorCollection);
            useItemActionData.SelectedItem = FlexFieldValueCollectorUtil.BuildFlexFieldValueObject<ScribanExportItem>(null, null, valueItem, exportSettings, errorCollection);

            return await ScribanActionRenderingUtil.FillPlaceholders(_cachedDbAccess, errorCollection, template.Code, useItemActionData, flexFieldObject, curStep, nextStep, _scribanLanguageKeyGenerator, stepRenderer);
        }

        /// <summary>
        /// Returns the Export Template Placeholders for a Template Type
        /// </summary>
        /// <param name="templateType">Template Type</param>
        /// <returns>Export Template Placeholder</returns>
        public override List<ExportTemplatePlaceholder> GetExportTemplatePlaceholdersForType(TemplateType templateType)
        {
            string languageKeyValueDesc = string.Format("{0}.{1}.{2} | {0}.{3}.{4} | field.{5}", ExportConstants.ScribanActionObjectKey, StandardMemberRenamer.Rename(nameof(ScribanUseItemActionData.Npc)), 
                                                        StandardMemberRenamer.Rename(nameof(ScribanUseItemActionData.Npc.Name)), StandardMemberRenamer.Rename(nameof(ScribanUseItemActionData.SelectedItem)),
                                                        StandardMemberRenamer.Rename(nameof(ScribanUseItemActionData.SelectedItem.Name)), StandardMemberRenamer.Rename(nameof(ScribanFlexFieldField.Value)));
            return ScribanActionRenderingUtil.GetExportTemplatePlaceholdersForType<ScribanUseItemActionData>(_localizerFactory, _scribanLanguageKeyGenerator, languageKeyValueDesc);
        }
    }
}