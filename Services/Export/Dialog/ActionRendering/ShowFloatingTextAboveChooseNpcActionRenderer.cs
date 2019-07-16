using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Data.Kortisto;
using GoNorth.Data.Project;
using GoNorth.Services.Export.Data;
using GoNorth.Services.Export.LanguageKeyGeneration;
using GoNorth.Services.Export.Placeholder;
using Microsoft.Extensions.Localization;

namespace GoNorth.Services.Export.Dialog.ActionRendering
{
    /// <summary>
    /// Base Class for rendering a floating text above an object action
    /// </summary>
    public class ShowFloatingTextAboveChooseNpcActionRenderer : ShowFloatingTextAboveObjectActionRenderer
    {
        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="defaultTemplateProvider">Default Template Provider</param>
        /// <param name="cachedDbAccess">Cached Db Access</param>        
        /// <param name="languageKeyGenerator">Language Key Generator</param>
        /// <param name="localizerFactory">Localizer Factory</param>
        public ShowFloatingTextAboveChooseNpcActionRenderer(ICachedExportDefaultTemplateProvider defaultTemplateProvider, IExportCachedDbAccess cachedDbAccess, ILanguageKeyGenerator languageKeyGenerator, IStringLocalizerFactory localizerFactory) :
                                                            base(defaultTemplateProvider, cachedDbAccess, languageKeyGenerator, localizerFactory)
        {
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
        /// Returns the export template to use
        /// </summary>
        /// <param name="project">Project</param>
        /// <returns>Export template to use</returns>
        protected override async Task<ExportTemplate> GetExportTemplate(GoNorthProject project)
        {
            return await _defaultTemplateProvider.GetDefaultTemplateByType(project.Id, TemplateType.TaleActionShowFloatingTextAboveChooseNpc);
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
        /// Returns the language key type
        /// </summary>
        /// <returns>Language key tpye</returns>
        protected override string GetLanguageKeyType() 
        {
            return ExportConstants.LanguageKeyTypeNpc;
        }

        /// <summary>
        /// Returns true if the action renderer has placeholders for a template type
        /// </summary>
        /// <param name="templateType">Tempalte Type to check</param>
        /// <returns>true if the action renderer has placeholders for the template type</returns>
        public override bool HasPlaceholdersForTemplateType(TemplateType templateType)
        {
            return templateType == TemplateType.TaleActionShowFloatingTextAboveChooseNpc;
        }

        /// <summary>
        /// Returns the value object to use
        /// </summary>
        /// <param name="project">Project</param>
        /// <param name="parsedData">Parsed data</param>
        /// <param name="npc">Npc</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <returns>Value Object</returns>
        protected override async Task<IFlexFieldExportable> GetValueObject(GoNorthProject project, ShowFloatingTextAboveObjectActionRenderer.FloatingTextActionData parsedData, KortistoNpc npc, ExportPlaceholderErrorCollection errorCollection)
        {
            if(string.IsNullOrEmpty(parsedData.NpcId))
            {
                return null;
            }

            return await _cachedDbAccess.GetNpcById(parsedData.NpcId);
        }
    }
}