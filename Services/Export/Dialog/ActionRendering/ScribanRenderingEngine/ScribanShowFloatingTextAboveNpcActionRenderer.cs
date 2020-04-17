using System.Threading.Tasks;
using GoNorth.Data.FlexFieldDatabase;
using GoNorth.Data.Kortisto;
using GoNorth.Data.Project;
using GoNorth.Services.Export.Data;
using GoNorth.Services.Export.Dialog.ActionRendering.ConfigObject;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.LanguageKeyGenerator;
using Microsoft.Extensions.Localization;

namespace GoNorth.Services.Export.Dialog.ActionRendering.ScribanRenderingEngine
{
    /// <summary>
    /// Scriban Class for rendering a floating text above a choosen npc action
    /// </summary>
    public class ScribanShowFloatingTextAboveChooseNpcActionRenderer : ScribanShowFloatingTextAboveObjectActionRenderer
    {
        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="cachedDbAccess">Cached Db Access</param>        
        /// <param name="scribanLanguageKeyGenerator">Scriban Language Key Generator</param>
        /// <param name="localizerFactory">Localizer Factory</param>
        public ScribanShowFloatingTextAboveChooseNpcActionRenderer(IExportCachedDbAccess cachedDbAccess, IScribanLanguageKeyGenerator scribanLanguageKeyGenerator, IStringLocalizerFactory localizerFactory) :
                                                                   base(cachedDbAccess, scribanLanguageKeyGenerator, localizerFactory)
        {
        }


        /// <summary>
        /// Returns the preview text
        /// </summary>
        /// <returns>Preview text</returns>
        protected override string GetPreviewText()
        {
            return "ShowTextAboveChooseNpc";
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
            if(string.IsNullOrEmpty(parsedData.NpcId))
            {
                return null;
            }

            return await _cachedDbAccess.GetNpcById(parsedData.NpcId);
        }
    }
}