using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Data.FlexFieldDatabase;
using GoNorth.Data.Project;
using GoNorth.Services.Export.Data;
using GoNorth.Services.Export.Dialog.ActionRendering.ConfigObject;
using GoNorth.Services.Export.LanguageKeyGeneration;
using GoNorth.Services.Export.Placeholder;
using Microsoft.Extensions.Localization;

namespace GoNorth.Services.Export.Dialog.ActionRendering.LegacyRenderingEngine
{
    /// <summary>
    /// Class for rendering an npc value change action
    /// </summary>
    public class NpcValueChangeRenderer : ValueActionRenderBase
    {
        /// <summary>
        /// true if the action renderer is for the player, else false
        /// </summary>
        private readonly bool _isPlayer;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="defaultTemplateProvider">Default Template Provider</param>
        /// <param name="cachedDbAccess">Cached Db Access</param>
        /// <param name="languageKeyGenerator">Language Key Generator</param>
        /// <param name="localizerFactory">Localizer Factory</param>
        /// <param name="isPlayer">true if the action renderer is for the player, else false</param>
        public NpcValueChangeRenderer(ICachedExportDefaultTemplateProvider defaultTemplateProvider, IExportCachedDbAccess cachedDbAccess, ILanguageKeyGenerator languageKeyGenerator, IStringLocalizerFactory localizerFactory, bool isPlayer) : 
                                    base(defaultTemplateProvider, cachedDbAccess, languageKeyGenerator, localizerFactory)
        {
            _isPlayer = isPlayer;
        }

        /// <summary>
        /// Returns the flex field prefix
        /// </summary>
        /// <returns>Flex Field Prefix</returns>        
        protected override string GetFlexFieldPrefix()
        {
            return "Tale_Action_Npc";
        }

        /// <summary>
        /// Returns the flex field export object type
        /// </summary>
        /// <returns>Flex field export object type</returns>
        protected override string GetFlexFieldExportObjectType()
        {
            return ExportConstants.ExportObjectTypeNpc;
        }
        
        /// <summary>
        /// Returns the preview prefix
        /// </summary>
        /// <returns>Preview prefix</returns>
        protected override string GetPreviewPrefix()
        {
            return _isPlayer ? "Player value" : "Npc value";
        }

        /// <summary>
        /// Returns the value object to use
        /// </summary>
        /// <param name="parsedData">Parsed data</param>
        /// <param name="flexFieldObject">Flex field object</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <returns>Value Object</returns>
        protected override async Task<IFlexFieldExportable> GetValueObject(ValueFieldActionData parsedData, FlexFieldObject flexFieldObject, ExportPlaceholderErrorCollection errorCollection)
        {
            if(_isPlayer)
            {
                GoNorthProject curProject = await _cachedDbAccess.GetUserProject();
                flexFieldObject = await _cachedDbAccess.GetPlayerNpc(curProject.Id);
                if(flexFieldObject == null)
                {
                    errorCollection.AddNoPlayerNpcExistsError();
                    return null;
                }
            }

            return flexFieldObject;
        }

    }
}