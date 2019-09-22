using System.Collections.Generic;
using System.Threading.Tasks;
using GoNorth.Data.Evne;
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
    /// Class for rendering a learn/forget skill action
    /// </summary>
    public class LearnForgetSkillActionRenderer : BaseActionRenderer<LearnForgetSkillActionRenderer.LearnForgetSkillActionData>
    {
        /// <summary>
        /// Learn forget action data
        /// </summary>
        public class LearnForgetSkillActionData
        {
            /// <summary>
            /// New State
            /// </summary>
            public string SkillId { get; set; }
        }


        /// <summary>
        /// Flex Field Skill Resolver Prefix
        /// </summary>
        private const string FlexField_Skill_Prefix = "Tale_Action_Skill";


        /// <summary>
        /// Default Template Provider
        /// </summary>
        protected readonly ICachedExportDefaultTemplateProvider _defaultTemplateProvider;

        /// <summary>
        /// Cached Db Access
        /// </summary>
        protected readonly IExportCachedDbAccess _cachedDbAccess;

        /// <summary>
        /// Resolver for flex field values
        /// </summary>
        private readonly FlexFieldExportTemplatePlaceholderResolver _flexFieldPlaceholderResolver;
        
        /// <summary>
        /// true if the renderer is for the player, else false
        /// </summary>
        private readonly bool _isPlayer;

        /// <summary>
        /// true if the renderer is for learning, false if it is for forgetting
        /// </summary>
        private readonly bool _isLearn;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="defaultTemplateProvider">Default Template Provider</param>
        /// <param name="cachedDbAccess">Cached Db Access</param>        
        /// <param name="languageKeyGenerator">Language Key Generator</param>
        /// <param name="localizerFactory">Localizer Factory</param>
        /// <param name="isPlayer">true if the renderer is for the player, else false</param>
        /// <param name="isLearn">true if the renderer is for learning, false if it is for forgetting</param>
        public LearnForgetSkillActionRenderer(ICachedExportDefaultTemplateProvider defaultTemplateProvider, IExportCachedDbAccess cachedDbAccess, ILanguageKeyGenerator languageKeyGenerator, IStringLocalizerFactory localizerFactory, 
                                              bool isPlayer, bool isLearn)
        {
            _defaultTemplateProvider = defaultTemplateProvider;
            _cachedDbAccess = cachedDbAccess;
            _isPlayer = isPlayer;
            _isLearn = isLearn;
            _flexFieldPlaceholderResolver = new FlexFieldExportTemplatePlaceholderResolver(defaultTemplateProvider, cachedDbAccess, languageKeyGenerator, localizerFactory, FlexField_Skill_Prefix);
        }

        /// <summary>
        /// Builds an action from parsed data
        /// </summary>
        /// <param name="parsedData">Parsed data</param>
        /// <param name="data">Dialog data</param>
        /// <param name="project">Project</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <param name="flexFieldObject">Flex field object to which the dialog belongs</param>
        /// <param name="exportSettings">Export Settings</param>
        /// <returns>Action string</returns>
        public override async Task<string> BuildActionFromParsedData(LearnForgetSkillActionRenderer.LearnForgetSkillActionData parsedData, ExportDialogData data, GoNorthProject project, ExportPlaceholderErrorCollection errorCollection, FlexFieldObject flexFieldObject, ExportSettings exportSettings)
        {
            ExportTemplate actionTemplate = await GetExportTemplate(project);
            IFlexFieldExportable valueObject = await GetSkill(parsedData, errorCollection);
            if(valueObject == null)
            {
                return string.Empty;
            }

            ExportObjectData flexFieldExportData = new ExportObjectData();
            flexFieldExportData.ExportData.Add(ExportConstants.ExportDataObject, valueObject);
            flexFieldExportData.ExportData.Add(ExportConstants.ExportDataObjectType, ExportConstants.ExportObjectTypeSkill);

            _flexFieldPlaceholderResolver.SetErrorMessageCollection(errorCollection);
            string actionCode = _flexFieldPlaceholderResolver.FillPlaceholders(actionTemplate.Code, flexFieldExportData).Result;

            return actionCode;
        }

        /// <summary>
        /// Builds a preview text from parsed data
        /// </summary>
        /// <param name="parsedData">Parsed data</param>
        /// <param name="flexFieldObject">Flex field object to which the dialog belongs</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <param name="child">Child node</param>
        /// <param name="parent">Parent</param>
        /// <returns>Preview text</returns>
        public override async Task<string> BuildPreviewTextFromParsedData(LearnForgetSkillActionRenderer.LearnForgetSkillActionData parsedData, FlexFieldObject flexFieldObject, ExportPlaceholderErrorCollection errorCollection, ExportDialogData child, ExportDialogData parent)
        {
            IFlexFieldExportable valueObject = await GetSkill(parsedData, errorCollection);
            if(valueObject == null)
            {
                return string.Empty;
            }

            string label = _isPlayer ? "Npc" : "Player";
            label += _isLearn ? "Learn" : "Forget";

            return label + " (" + valueObject.Name + ")";
        }


        /// <summary>
        /// Returns the export template to use
        /// </summary>
        /// <param name="project">Project</param>
        /// <returns>Export template to use</returns>
        private async Task<ExportTemplate> GetExportTemplate(GoNorthProject project)
        {
            if(_isPlayer)
            {
                return await _defaultTemplateProvider.GetDefaultTemplateByType(project.Id, _isLearn ? TemplateType.TaleActionPlayerLearnSkill : TemplateType.TaleActionPlayerForgetSkill);
            }

            return await _defaultTemplateProvider.GetDefaultTemplateByType(project.Id, _isPlayer ? TemplateType.TaleActionNpcLearnSkill : TemplateType.TaleActionNpcForgetSkill);
        }

        /// <summary>
        /// Returns the skill to use
        /// </summary>
        /// <param name="parsedData">Parsed data</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <returns>Value Object</returns>
        private async Task<IFlexFieldExportable> GetSkill(LearnForgetSkillActionRenderer.LearnForgetSkillActionData parsedData, ExportPlaceholderErrorCollection errorCollection)
        {
            EvneSkill skillToUse = await _cachedDbAccess.GetSkillById(parsedData.SkillId);
            if(skillToUse == null)
            {
                errorCollection.AddDialogSkillNotFoundError();
                return null;
            }

            return skillToUse;
        }

        /// <summary>
        /// Returns true if the action renderer has placeholders for a template type
        /// </summary>
        /// <param name="templateType">Tempalte Type to check</param>
        /// <returns>true if the action renderer has placeholders for the template type</returns>
        public override bool HasPlaceholdersForTemplateType(TemplateType templateType)
        {
            if(_isPlayer)
            {
                return (_isLearn && templateType == TemplateType.TaleActionPlayerLearnSkill) || (!_isLearn && templateType == TemplateType.TaleActionPlayerForgetSkill);
            }

            return (_isLearn && templateType == TemplateType.TaleActionNpcLearnSkill) || (!_isLearn && templateType == TemplateType.TaleActionNpcForgetSkill);
        }   

        /// <summary>
        /// Returns the Export Template Placeholders for a Template Type
        /// </summary>
        /// <param name="templateType">Template Type</param>
        /// <returns>Export Template Placeholder</returns>
        public override List<ExportTemplatePlaceholder> GetExportTemplatePlaceholdersForType(TemplateType templateType)
        {
            return _flexFieldPlaceholderResolver.GetExportTemplatePlaceholdersForType(TemplateType.ObjectSkill);
        }
    }
}