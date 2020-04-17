using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Data.FlexFieldDatabase;
using GoNorth.Data.Kortisto;
using GoNorth.Data.Project;
using GoNorth.Data.Styr;
using GoNorth.Services.Export.Data;
using GoNorth.Services.Export.Dialog.ConditionRendering.ConfigObject;
using GoNorth.Services.Export.Dialog.ConditionRendering.ScribanRenderingEngine.RenderingObjects;
using GoNorth.Services.Export.Dialog.ConditionRendering.Util;
using GoNorth.Services.Export.Placeholder;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.LanguageKeyGenerator;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.RenderingObjects;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.Util;
using Microsoft.Extensions.Localization;
using Scriban.Runtime;

namespace GoNorth.Services.Export.Dialog.ConditionRendering.ScribanRenderingEngine
{
    /// <summary>
    /// Class for rendering a scriban inventory condition
    /// </summary>
    public class ScribanInventoryConditionRenderer : ScribanConditionBaseRenderer<InventoryConditionData, ScribanInventoryConditionData>
    {
        /// <summary>
        /// Default template provider
        /// </summary>
        private readonly ICachedExportDefaultTemplateProvider _defaultTemplateProvider;

        /// <summary>
        /// Cached database access
        /// </summary>
        private readonly IExportCachedDbAccess _cachedDbAccess;

        /// <summary>
        /// true if the condition resolver is for the player, else false
        /// </summary>
        private readonly bool _isPlayer;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="defaultTemplateProvider">Default Template Provider</param>
        /// <param name="cachedDbAccess">Cached database access</param>
        /// <param name="languageKeyGenerator">Scriban language key generator</param>
        /// <param name="localizerFactory">String Localizer Factory</param>
        /// <param name="isPlayer">true if the condition resolver is for the player, else false</param>
        public ScribanInventoryConditionRenderer(ICachedExportDefaultTemplateProvider defaultTemplateProvider, IExportCachedDbAccess cachedDbAccess, IScribanLanguageKeyGenerator languageKeyGenerator, 
                                                 IStringLocalizerFactory localizerFactory, bool isPlayer) : base(cachedDbAccess, languageKeyGenerator, localizerFactory)
        {
            _defaultTemplateProvider = defaultTemplateProvider;
            _cachedDbAccess = cachedDbAccess;
            _isPlayer = isPlayer;
        }

        /// <summary>
        /// Returns the value object to use for scriban exporting
        /// </summary>
        /// <param name="parsedData">Parsed data</param>
        /// <param name="project">Project</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <param name="flexFieldObject">Flex field object to which the dialog belongs</param>
        /// <param name="exportSettings">Export Settings</param>
        /// <returns>Value Object</returns>
        protected override async Task<ScribanInventoryConditionData> GetExportObject(InventoryConditionData parsedData, GoNorthProject project, ExportPlaceholderErrorCollection errorCollection, FlexFieldObject flexFieldObject, ExportSettings exportSettings)
        {
            KortistoNpc npc = await ConditionRenderingUtil.GetExportNpc(_cachedDbAccess, project, flexFieldObject, errorCollection, _isPlayer);
            if(npc == null)
            {
                errorCollection.AddDialogNpcNotFoundError();
                return null;
            }

            StyrItem item = await _cachedDbAccess.GetItemById(parsedData.ItemId);
            if(item == null)
            {
                errorCollection.AddDialogItemNotFoundError();
                return null;
            }

            ScribanInventoryConditionData conditionData = new ScribanInventoryConditionData();
            ScribanExportNpc convertedNpc = FlexFieldValueCollectorUtil.BuildFlexFieldValueObject<ScribanExportNpc>(null, null, npc, exportSettings, errorCollection);
            convertedNpc.IsPlayer = npc.IsPlayerNpc;
            conditionData.Npc = convertedNpc;

            conditionData.SelectedItem = FlexFieldValueCollectorUtil.BuildFlexFieldValueObject<ScribanExportItem>(null, null, item, exportSettings, errorCollection);

            conditionData.OriginalOperator = parsedData.Operator == InventoryConditionData.CompareOperator_AtLeast ? "AtLeast" : "AtMaximum";
            conditionData.Operator = await ConditionRenderingUtil.GetItemCompareOperatorFromTemplate(_defaultTemplateProvider, project, parsedData.Operator, errorCollection);
            conditionData.Quantity = parsedData.Quantity;

            return conditionData;   
        }

        /// <summary>
        /// Returns the object key for scriban
        /// </summary>
        /// <returns>Object key</returns>
        protected override string GetObjectKey()
        {
            return "condition";
        }

        /// <summary>
        /// Returns the object key for scriban
        /// </summary>
        /// <returns>Object key</returns>
        protected override string GetLanguageKeyValueDesc() { 
            return string.Format("{0}.{1}.{2} | {0}.{3}.{2} | field.{4}", GetObjectKey(), StandardMemberRenamer.Rename(nameof(ScribanInventoryConditionData.Npc)), 
                                 StandardMemberRenamer.Rename(nameof(ScribanFlexFieldObject.Name)), StandardMemberRenamer.Rename(nameof(ScribanInventoryConditionData.SelectedItem)),
                                 StandardMemberRenamer.Rename(nameof(ScribanFlexFieldField.Value)));
        }

    }
}