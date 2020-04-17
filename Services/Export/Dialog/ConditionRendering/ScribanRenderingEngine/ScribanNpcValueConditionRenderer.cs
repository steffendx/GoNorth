using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Data.FlexFieldDatabase;
using GoNorth.Data.Kortisto;
using GoNorth.Data.Project;
using GoNorth.Services.Export.Data;
using GoNorth.Services.Export.Dialog.ConditionRendering.ConfigObject;
using GoNorth.Services.Export.Dialog.ConditionRendering.Util;
using GoNorth.Services.Export.Placeholder;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.LanguageKeyGenerator;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.RenderingObjects;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.Util;
using Microsoft.Extensions.Localization;

namespace GoNorth.Services.Export.Dialog.ConditionRendering.ScribanRenderingEngine
{
    /// <summary>
    /// Class for rendering a scriban npc value condition
    /// </summary>
    public class ScribanNpcValueConditionRenderer : ScribanValueConditionBaseRenderer
    {
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
        public ScribanNpcValueConditionRenderer(ICachedExportDefaultTemplateProvider defaultTemplateProvider, IExportCachedDbAccess cachedDbAccess, IScribanLanguageKeyGenerator languageKeyGenerator, 
                                                IStringLocalizerFactory localizerFactory, bool isPlayer) : base(defaultTemplateProvider, cachedDbAccess, languageKeyGenerator, localizerFactory)
        {
            _isPlayer = isPlayer;
        }

        /// <summary>
        /// Returns the scriban flex field object for the export
        /// </summary>
        /// <param name="parsedData">Parsed condition</param>
        /// <param name="project">Project</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <param name="flexFieldObject">Flex field object to which the dialog belongs</param>
        /// <param name="exportSettings">Export Settings</param>
        /// <returns>Scriban export object</returns>
        protected override async Task<ScribanFlexFieldObject> GetScribanFlexFieldObject(ValueFieldConditionData parsedData, GoNorthProject project, ExportPlaceholderErrorCollection errorCollection, FlexFieldObject flexFieldObject, ExportSettings exportSettings)
        {
            KortistoNpc npc = await ConditionRenderingUtil.GetExportNpc(_cachedDbAccess, project, flexFieldObject, errorCollection, _isPlayer);
            if(npc == null)
            {
                return null;
            }

            ScribanExportNpc convertedNpc = FlexFieldValueCollectorUtil.BuildFlexFieldValueObject<ScribanExportNpc>(null, null, npc, exportSettings, errorCollection);
            convertedNpc.IsPlayer = npc.IsPlayerNpc;
            return convertedNpc;
        }

    }
}