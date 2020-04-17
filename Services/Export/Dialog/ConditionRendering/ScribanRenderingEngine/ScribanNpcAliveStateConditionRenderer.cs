using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Data.FlexFieldDatabase;
using GoNorth.Data.Kortisto;
using GoNorth.Data.Project;
using GoNorth.Services.Export.Data;
using GoNorth.Services.Export.Dialog.ConditionRendering.ConfigObject;
using GoNorth.Services.Export.Dialog.ConditionRendering.ScribanRenderingEngine.RenderingObjects;
using GoNorth.Services.Export.Placeholder;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.LanguageKeyGenerator;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.RenderingObjects;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.Util;
using Microsoft.Extensions.Localization;
using Scriban.Runtime;

namespace GoNorth.Services.Export.Dialog.ConditionRendering.ScribanRenderingEngine
{
    /// <summary>
    /// Class for rendering a scriban npc alive state condition
    /// </summary>
    public class ScribanNpcAliveStateConditionRenderer : ScribanConditionBaseRenderer<NpvAliveStateConditionData, ScribanNpcAliveStateConditionData>
    {
        /// <summary>
        /// Cached database access
        /// </summary>
        private readonly IExportCachedDbAccess _cachedDbAccess;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="cachedDbAccess">Cached database access</param>
        /// <param name="languageKeyGenerator">Scriban language key generator</param>
        /// <param name="localizerFactory">String Localizer Factory</param>
        public ScribanNpcAliveStateConditionRenderer(IExportCachedDbAccess cachedDbAccess, IScribanLanguageKeyGenerator languageKeyGenerator, IStringLocalizerFactory localizerFactory) : base(cachedDbAccess, languageKeyGenerator, localizerFactory)
        {
            _cachedDbAccess = cachedDbAccess;
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
        protected override async Task<ScribanNpcAliveStateConditionData> GetExportObject(NpvAliveStateConditionData parsedData, GoNorthProject project, ExportPlaceholderErrorCollection errorCollection, FlexFieldObject flexFieldObject, ExportSettings exportSettings)
        {
            KortistoNpc npc = await _cachedDbAccess.GetNpcById(parsedData.NpcId);
            if(npc == null)
            {
                errorCollection.AddDialogNpcNotFoundError();
                return null;
            }

            ScribanNpcAliveStateConditionData conditionData = new ScribanNpcAliveStateConditionData();
            conditionData.Npc = FlexFieldValueCollectorUtil.BuildFlexFieldValueObject<ScribanExportNpc>(null, null, npc, exportSettings, errorCollection);
            conditionData.NpcAliveState = ConvertNpcAliveState(parsedData.State);

            return conditionData;   
        }

        /// <summary>
        /// Converts a npc alive state to an export npc alive state
        /// </summary>
        /// <param name="state">State to convert</param>
        /// <returns>Converted npc alive state</returns>
        private string ConvertNpcAliveState(int state)
        {
            switch(state)
            {
            case NpvAliveStateConditionData.State_Alive:
                return "Alive";
            case NpvAliveStateConditionData.State_Dead:
                return "Dead";
            }

            return "UNKNOWN_ALIVE_STATESTATE";
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
            return string.Format("{0}.{1}.{2} | field.{3}", GetObjectKey(), StandardMemberRenamer.Rename(nameof(ScribanNpcAliveStateConditionData.Npc)), 
                                 StandardMemberRenamer.Rename(nameof(ScribanFlexFieldObject.Name)), StandardMemberRenamer.Rename(nameof(ScribanFlexFieldField.Value)));
        }

    }
}