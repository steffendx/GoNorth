using System.Threading.Tasks;
using GoNorth.Data.FlexFieldDatabase;
using GoNorth.Data.Kortisto;
using GoNorth.Data.Project;
using GoNorth.Services.Export.Data;
using GoNorth.Services.Export.Dialog.ActionRendering.ConfigObject;
using GoNorth.Services.Export.Placeholder;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.LanguageKeyGenerator;
using Microsoft.Extensions.Localization;

namespace GoNorth.Services.Export.Dialog.ActionRendering.ScribanRenderingEngine
{
    /// <summary>
    /// Scriban Class for rendering a floating text above an npc action
    /// </summary>
    public class ScribanShowFloatingTextAboveNpcActionRenderer : ScribanShowFloatingTextAboveObjectActionRenderer
    {
        /// <summary>
        /// true if the action renderer is for the player, else false
        /// </summary>
        private readonly bool _isPlayer;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="cachedDbAccess">Cached Db Access</param>        
        /// <param name="scribanLanguageKeyGenerator">Scriban Language Key Generator</param>
        /// <param name="localizerFactory">Localizer Factory</param>
        /// <param name="isPlayer">true if the action is rendered for the player, else false</param>
        public ScribanShowFloatingTextAboveNpcActionRenderer(IExportCachedDbAccess cachedDbAccess, IScribanLanguageKeyGenerator scribanLanguageKeyGenerator, IStringLocalizerFactory localizerFactory, bool isPlayer) :
                                                             base(cachedDbAccess, scribanLanguageKeyGenerator, localizerFactory)
        {
            _isPlayer = isPlayer;
        }


        /// <summary>
        /// Returns the preview text
        /// </summary>
        /// <returns>Preview text</returns>
        protected override string GetPreviewText()
        {
            return _isPlayer ? "ShowTextAbovePlayer" : "ShowTextAboveNpc";
        }

        /// <summary>
        /// Returns the value object to use
        /// </summary>
        /// <param name="project">Project</param>
        /// <param name="parsedData">Parsed data</param>
        /// <param name="flexFieldObject">Flex field object</param>
        /// <returns>Value Object</returns>
        protected override async Task<KortistoNpc> GetValueObject(GoNorthProject project, FloatingTextActionData parsedData, FlexFieldObject flexFieldObject)
        {
            if(_isPlayer) 
            {
                return await _cachedDbAccess.GetPlayerNpc(project.Id);
            }
            
            return flexFieldObject as KortistoNpc;
        }
    }
}