using System.Threading.Tasks;
using GoNorth.Data.Aika;
using GoNorth.Data.Exporting;
using GoNorth.Data.FlexFieldDatabase;
using GoNorth.Services.Export.Data;
using GoNorth.Services.Export.Dialog.ActionRendering.ConfigObject;
using GoNorth.Services.Export.Placeholder;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.LanguageKeyGenerator;
using Microsoft.Extensions.Localization;

namespace GoNorth.Services.Export.Dialog.ActionRendering.ScribanRenderingEngine
{
    /// <summary>
    /// Class for rendering an quest value change action with scriban
    /// </summary>
    public class ScribanQuestValueChangeRenderer : ScribanValueActionRenderBase
    {
        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="defaultTemplateProvider">Default Template Provider</param>
        /// <param name="cachedDbAccess">Cached Db Access</param>
        /// <param name="scribanLanguageKeyGenerator">Scriban Language Key Generator</param>
        /// <param name="localizerFactory">Localizer Factory</param>
        public ScribanQuestValueChangeRenderer(ICachedExportDefaultTemplateProvider defaultTemplateProvider, IExportCachedDbAccess cachedDbAccess, IScribanLanguageKeyGenerator scribanLanguageKeyGenerator, IStringLocalizerFactory localizerFactory) : 
                                               base(defaultTemplateProvider, cachedDbAccess, scribanLanguageKeyGenerator, localizerFactory)
        {
        }

        /// <summary>
        /// Returns the preview prefix
        /// </summary>
        /// <returns>Preview prefix</returns>
        protected override string GetPreviewPrefix()
        {
            return "Quest value";
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
            AikaQuest quest = await _cachedDbAccess.GetQuestById(parsedData.ObjectId);
            if(quest == null) 
            {
                errorCollection.AddDialogQuestNotFoundError();
                return null;
            }

            return quest;
        }

    }
}