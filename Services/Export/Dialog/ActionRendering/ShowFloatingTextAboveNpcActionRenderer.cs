using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Data.FlexFieldDatabase;
using GoNorth.Data.Kortisto;
using GoNorth.Data.Project;
using GoNorth.Services.Export.Data;
using GoNorth.Services.Export.LanguageKeyGeneration;
using GoNorth.Services.Export.Placeholder;
using Microsoft.Extensions.Localization;

namespace GoNorth.Services.Export.Dialog.ActionRendering
{
    /// <summary>
    /// Class for rendering an action above an npc
    /// </summary>
    public class ShowFloatingTextAboveNpcActionRenderer : ShowFloatingTextAboveObjectActionRenderer
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
        /// <param name="isPlayer">true if the action is rendered for the player, else false</param>
        public ShowFloatingTextAboveNpcActionRenderer(ICachedExportDefaultTemplateProvider defaultTemplateProvider, IExportCachedDbAccess cachedDbAccess, ILanguageKeyGenerator languageKeyGenerator, IStringLocalizerFactory localizerFactory, bool isPlayer) :
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
        /// Returns the export template to use
        /// </summary>
        /// <param name="project">Project</param>
        /// <returns>Export template to use</returns>
        protected override async Task<ExportTemplate> GetExportTemplate(GoNorthProject project)
        {
            TemplateType templateType = _isPlayer ? TemplateType.TaleActionShowFloatingTextAbovePlayer : TemplateType.TaleActionShowFloatingTextAboveNpc;
            return await _defaultTemplateProvider.GetDefaultTemplateByType(project.Id, templateType);
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
        /// Returns the language key type
        /// </summary>
        /// <returns>Language key tpye</returns>
        protected override string GetLanguageKeyType() 
        {
            return _isPlayer ? ExportConstants.LanguageKeyTypePlayer : ExportConstants.LanguageKeyTypeNpc;
        }

        /// <summary>
        /// Returns true if the action renderer has placeholders for a template type
        /// </summary>
        /// <param name="templateType">Tempalte Type to check</param>
        /// <returns>true if the action renderer has placeholders for the template type</returns>
        public override bool HasPlaceholdersForTemplateType(TemplateType templateType)
        {
            return (templateType == TemplateType.TaleActionShowFloatingTextAbovePlayer && _isPlayer) || (templateType == TemplateType.TaleActionShowFloatingTextAboveNpc && !_isPlayer);
        }

        /// <summary>
        /// Returns the value object to use
        /// </summary>
        /// <param name="project">Project</param>
        /// <param name="parsedData">Parsed data</param>
        /// <param name="flexFieldObject">Flex field object</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <returns>Value Object</returns>
        protected override async Task<IFlexFieldExportable> GetValueObject(GoNorthProject project, ShowFloatingTextAboveObjectActionRenderer.FloatingTextActionData parsedData, FlexFieldObject flexFieldObject, ExportPlaceholderErrorCollection errorCollection)
        {
            if(_isPlayer) 
            {
                return await _cachedDbAccess.GetPlayerNpc(project.Id);
            }
            
            return flexFieldObject;
        }
    }
}