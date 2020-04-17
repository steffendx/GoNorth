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
    /// Class for rendering an inventory action using scriban
    /// </summary>
    public class ScribanInventoryActionChooseNpcRenderer : BaseInventoryActionChooseNpcRenderer
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
        /// <param name="scribanLanguageKeyGenerator">Scriban language key generator</param>
        /// <param name="localizerFactory">Localizer Factory</param>
        /// <param name="isRemoval">True if the action is for a removal, else false</param>
        public ScribanInventoryActionChooseNpcRenderer(IExportCachedDbAccess cachedDbAccess, IScribanLanguageKeyGenerator scribanLanguageKeyGenerator, IStringLocalizerFactory localizerFactory, bool isRemoval) : 
                                                       base(cachedDbAccess, isRemoval)
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
        /// <param name="itemObject">Item that was selected</param>
        /// <param name="npcObject">Npc that was selected</param>
        /// <param name="flexFieldObject">Flex field object to which the dialog belongs</param>
        /// <param name="curStep">Current step that is rendered</param>
        /// <param name="nextStep">Next step that is being rendered</param>
        /// <param name="exportSettings">Export Settings</param>
        /// <param name="stepRenderer">Action Step renderer</param>
        /// <returns>Filled placeholders</returns>
        protected override async Task<string> FillPlaceholders(ExportTemplate template, ExportPlaceholderErrorCollection errorCollection, InventoryChooseNpcActionData parsedData, IFlexFieldExportable itemObject, IFlexFieldExportable npcObject,
                                                               FlexFieldObject flexFieldObject, ExportDialogData curStep, ExportDialogData nextStep, ExportSettings exportSettings, IActionStepRenderer stepRenderer)
        {
            KortistoNpc npc = npcObject as KortistoNpc;
            if(npc == null)
            {
                errorCollection.AddDialogNpcNotFoundError();
                return string.Empty;
            }

            ScribanInventoryChooseNpcActionData codeActionData = new ScribanInventoryChooseNpcActionData();
            codeActionData.Npc = FlexFieldValueCollectorUtil.BuildFlexFieldValueObject<ScribanExportNpc>(null, null, npc, exportSettings, errorCollection);
            codeActionData.Npc.IsPlayer = npc.IsPlayerNpc;
            codeActionData.SelectedItem = FlexFieldValueCollectorUtil.BuildFlexFieldValueObject<ScribanExportItem>(null, null, itemObject, exportSettings, errorCollection);
            codeActionData.Quantity =  parsedData.Quantity.HasValue ? parsedData.Quantity.Value : 1;

            return await ScribanActionRenderingUtil.FillPlaceholders(_cachedDbAccess, errorCollection, template.Code, codeActionData, flexFieldObject, curStep, nextStep, _scribanLanguageKeyGenerator, stepRenderer);
        }

        /// <summary>
        /// Returns the Export Template Placeholders for a Template Type
        /// </summary>
        /// <param name="templateType">Template Type</param>
        /// <returns>Export Template Placeholder</returns>
        public override List<ExportTemplatePlaceholder> GetExportTemplatePlaceholdersForType(TemplateType templateType)
        {
            string languageKeyValueDesc = string.Format("{0}.{1}.{2} | {0}.{3}.{4} | field.{5}", ExportConstants.ScribanActionObjectKey, StandardMemberRenamer.Rename(nameof(ScribanInventoryChooseNpcActionData.Npc)), 
                                                        StandardMemberRenamer.Rename(nameof(ScribanInventoryChooseNpcActionData.Npc.Name)), StandardMemberRenamer.Rename(nameof(ScribanInventoryChooseNpcActionData.SelectedItem)), 
                                                        StandardMemberRenamer.Rename(nameof(ScribanInventoryChooseNpcActionData.SelectedItem.Name)), StandardMemberRenamer.Rename(nameof(ScribanFlexFieldField.Value)));
            return ScribanActionRenderingUtil.GetExportTemplatePlaceholdersForType<ScribanInventoryChooseNpcActionData>(_localizerFactory, _scribanLanguageKeyGenerator, languageKeyValueDesc);
        }
    }
}