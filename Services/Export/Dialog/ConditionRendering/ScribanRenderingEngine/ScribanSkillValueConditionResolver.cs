using System.Threading.Tasks;
using GoNorth.Data.Evne;
using GoNorth.Data.Exporting;
using GoNorth.Data.FlexFieldDatabase;
using GoNorth.Data.Project;
using GoNorth.Services.Export.Data;
using GoNorth.Services.Export.Dialog.ConditionRendering.ConfigObject;
using GoNorth.Services.Export.Placeholder;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.LanguageKeyGenerator;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.RenderingObjects;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.Util;
using Microsoft.Extensions.Localization;

namespace GoNorth.Services.Export.Dialog.ConditionRendering.ScribanRenderingEngine
{
    /// <summary>
    /// Class for rendering a scriban skill value condition
    /// </summary>
    public class ScribanSkillValueConditionRenderer : ScribanValueConditionBaseRenderer
    {
        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="defaultTemplateProvider">Default Template Provider</param>
        /// <param name="cachedDbAccess">Cached database access</param>
        /// <param name="languageKeyGenerator">Scriban language key generator</param>
        /// <param name="localizerFactory">String Localizer Factory</param>
        public ScribanSkillValueConditionRenderer(ICachedExportDefaultTemplateProvider defaultTemplateProvider, IExportCachedDbAccess cachedDbAccess, IScribanLanguageKeyGenerator languageKeyGenerator, 
                                                  IStringLocalizerFactory localizerFactory) : base(defaultTemplateProvider, cachedDbAccess, languageKeyGenerator, localizerFactory)
        {
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
            EvneSkill skill = await _cachedDbAccess.GetSkillById(parsedData.SelectedObjectId);
            if(skill == null)
            {
                errorCollection.AddDialogSkillNotFoundError();
                return null;
            }

            return FlexFieldValueCollectorUtil.BuildFlexFieldValueObject<ScribanExportSkill>(null, null, skill, exportSettings, errorCollection);
        }

    }
}