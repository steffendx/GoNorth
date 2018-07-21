using System.Collections.Generic;
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
    /// Class for rendering an learned skill condition
    /// </summary>
    public class LearnedSkillConditionResolver : BaseConditionRenderer<LearnedSkillConditionResolver.LearnedSkillConditionData>
    {
        /// <summary>
        /// Learned Skill Condition Data
        /// </summary>
        public class LearnedSkillConditionData
        {
            /// <summary>
            /// Skill Id
            /// </summary>
            public string SelectedSkillId { get; set; }
        }

        /// <summary>
        /// Flex Field Skil Resolver Prefix
        /// </summary>
        private const string FlexField_Skill_Prefix = "Tale_Condition_Skill";


        /// <summary>
        /// Default Template Provider
        /// </summary>
        private readonly ICachedExportDefaultTemplateProvider _defaultTemplateProvider;

        /// <summary>
        /// Cached Db Access
        /// </summary>
        private readonly IExportCachedDbAccess _cachedDbAccess;

        /// <summary>
        /// Resolver for flex field skills
        /// </summary>
        private readonly FlexFieldExportTemplatePlaceholderResolver _skillPlaceholderResolver;

        /// <summary>
        /// true if the condition resolver is for the player, else false
        /// </summary>
        private readonly bool _isPlayer;

        /// <summary>
        /// true if the condition resolver is for the character having learned the skill, or not
        /// </summary>
        private readonly bool _isLearned;
        
        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="defaultTemplateProvider">Default Template Provider</param>
        /// <param name="cachedDbAccess">Cached Db Access</param>
        /// <param name="languageKeyGenerator">Language Key Generator</param>
        /// <param name="localizerFactory">Localizer Factory</param>
        /// <param name="isPlayer">true if the condition resolver is for the player, else false</param>
        /// <param name="isLearned">true if the condition resolver is for having the skill learned, else false</param>
        public LearnedSkillConditionResolver(ICachedExportDefaultTemplateProvider defaultTemplateProvider, IExportCachedDbAccess cachedDbAccess, ILanguageKeyGenerator languageKeyGenerator, IStringLocalizerFactory localizerFactory, bool isPlayer, bool isLearned)
        {
            _defaultTemplateProvider = defaultTemplateProvider;
            _cachedDbAccess = cachedDbAccess;
            _skillPlaceholderResolver = new FlexFieldExportTemplatePlaceholderResolver(defaultTemplateProvider, cachedDbAccess, languageKeyGenerator, localizerFactory, FlexField_Skill_Prefix);
            _isPlayer = isPlayer;
            _isLearned = isLearned;
        }

        /// <summary>
        /// Builds a condition element from parsed data
        /// </summary>
        /// <param name="parsedData">Parsed data</param>
        /// <param name="project">Project</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <param name="npc">Npc to which the dialog belongs</param>
        /// <param name="exportSettings">Export Settings</param>
        /// <returns>Condition string</returns>
        public override string BuildConditionElementFromParsedData(LearnedSkillConditionResolver.LearnedSkillConditionData parsedData, GoNorthProject project, ExportPlaceholderErrorCollection errorCollection, KortistoNpc npc, ExportSettings exportSettings)
        {
            ExportTemplate conditionTemplate = _defaultTemplateProvider.GetDefaultTemplateByType(project.Id, GetTemplateType()).Result;

            EvneSkill skill = _cachedDbAccess.GetSkillById(parsedData.SelectedSkillId).Result;
            if(skill == null)
            {
                errorCollection.AddDialogSkillNotFoundError();
                return string.Empty;
            }

            ExportObjectData skillExportData = new ExportObjectData();
            skillExportData.ExportData.Add(ExportConstants.ExportDataObject, skill);
            skillExportData.ExportData.Add(ExportConstants.ExportDataObjectType, ExportConstants.ExportObjectTypeSkill);

            _skillPlaceholderResolver.SetErrorMessageCollection(errorCollection);
            string conditionCode = _skillPlaceholderResolver.FillPlaceholders(conditionTemplate.Code, skillExportData).Result;

            return conditionCode;
        }

        /// <summary>
        /// Returns the template type to use
        /// </summary>
        /// <returns>Template Type to use</returns>
        private TemplateType GetTemplateType()
        {
            if(_isPlayer)
            {
                return _isLearned ? TemplateType.TaleConditionPlayerLearnedSkill : TemplateType.TaleConditionPlayerNotLearnedSkill;
            }
            
            return _isLearned ? TemplateType.TaleConditionNpcLearnedSkill : TemplateType.TaleConditionNpcNotLearnedSkill;
        }

        /// <summary>
        /// Returns if true the condition element renderer has placeholders for a template type
        /// </summary>
        /// <param name="templateType">Tempalte Type to check</param>
        /// <returns>true if the condition element renderer has placeholders for the template type</returns>
        public override bool HasPlaceholdersForTemplateType(TemplateType templateType)
        {
            return GetTemplateType() == templateType;
        }

        /// <summary>
        /// Returns the Export Template Placeholders for a Template Type
        /// </summary>
        /// <param name="templateType">Template Type</param>
        /// <returns>Export Template Placeholder</returns>
        public override List<ExportTemplatePlaceholder> GetExportTemplatePlaceholdersForType(TemplateType templateType)
        {
            return _skillPlaceholderResolver.GetExportTemplatePlaceholdersForType(TemplateType.ObjectSkill);
        }
    }
}