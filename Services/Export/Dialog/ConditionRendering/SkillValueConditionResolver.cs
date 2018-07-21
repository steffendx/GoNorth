using GoNorth.Data.Evne;
using GoNorth.Data.Exporting;
using GoNorth.Data.Kortisto;
using GoNorth.Data.Project;
using GoNorth.Services.Export.Data;
using GoNorth.Services.Export.LanguageKeyGeneration;
using GoNorth.Services.Export.Placeholder;
using Microsoft.Extensions.Localization;

namespace GoNorth.Services.Export.Dialog.ConditionRendering
{
    /// <summary>
    /// Class for rendering a skill value condition
    /// </summary>
    public class SkillValueConditionResolver : ValueConditionResolverBase
    {
        /// <summary>
        /// true if the condition value resolver is for player skill values, else false
        /// </summary>
        private readonly bool _isPlayer;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="defaultTemplateProvider">Default Template Provider</param>
        /// <param name="cachedDbAccess">Cached Db Access</param>
        /// <param name="languageKeyGenerator">Language Key Generator</param>
        /// <param name="localizerFactory">Localizer Factory</param>
        /// <param name="isPlayer">true if the condition value resolver is for player skill values, else false</param> 
        public SkillValueConditionResolver(ICachedExportDefaultTemplateProvider defaultTemplateProvider, IExportCachedDbAccess cachedDbAccess, ILanguageKeyGenerator languageKeyGenerator, IStringLocalizerFactory localizerFactory, bool isPlayer) : 
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
            return "Tale_Condition_Skill";
        }

        /// <summary>
        /// Returns the flex field export object type
        /// </summary>
        /// <returns>Flex field export object type</returns>
        protected override string GetFlexFieldExportObjectType()
        {
            return ExportConstants.ExportObjectTypeSkill;
        }

        /// <summary>
        /// Returns the export template to use
        /// </summary>
        /// <param name="project">Project</param>
        /// <returns>Export template to use</returns>
        protected override ExportTemplate GetExportTemplate(GoNorthProject project)
        {
            return _defaultTemplateProvider.GetDefaultTemplateByType(project.Id, _isPlayer ? TemplateType.TaleConditionPlayerSkillValue : TemplateType.TaleConditionNpcSkillValue).Result;
        }

        /// <summary>
        /// Returns the value object to use
        /// </summary>
        /// <param name="parsedData">Parsed data</param>
        /// <param name="npc">Npc</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <returns>Value Object</returns>
        protected override IFlexFieldExportable GetValueObject(ValueFieldConditionData parsedData, KortistoNpc npc, ExportPlaceholderErrorCollection errorCollection)
        {
            EvneSkill skill = _cachedDbAccess.GetSkillById(parsedData.SelectedObjectId).Result;
            if(skill == null)
            {
                errorCollection.AddDialogSkillNotFoundError();
                return null;
            }

            return skill;
        }

        /// <summary>
        /// Returns if true the condition element renderer has placeholders for a template type
        /// </summary>
        /// <param name="templateType">Tempalte Type to check</param>
        /// <returns>true if the condition element renderer has placeholders for the template type</returns>
        public override bool HasPlaceholdersForTemplateType(TemplateType templateType)
        {
            return (templateType == TemplateType.TaleConditionPlayerSkillValue && _isPlayer) || (templateType == TemplateType.TaleConditionNpcSkillValue && !_isPlayer);
        }
    }
}