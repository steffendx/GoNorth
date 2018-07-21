using System.Collections.Generic;
using System.Threading.Tasks;
using GoNorth.Data.Evne;
using GoNorth.Data.Exporting;
using GoNorth.Data.Kortisto;
using GoNorth.Data.Project;
using GoNorth.Services.Export.Data;
using GoNorth.Services.Export.LanguageKeyGeneration;
using Microsoft.Extensions.Localization;

namespace GoNorth.Services.Export.Placeholder
{
    /// <summary>
    /// Npc Skill Export Template Placeholder Resolver
    /// </summary>
    public class NpcSkillExportTemplatePlaceholderResolver : BaseExportPlaceholderResolver, IExportTemplateTopicPlaceholderResolver
    {
        /// <summary>
        /// Skills
        /// </summary>
        private const string Placeholder_Skills = "Npc_Skills";

        /// <summary>
        /// Start of the Skill List
        /// </summary>
        private const string Placeholder_Skill_Start = "Skills_Start";

        /// <summary>
        /// End of the Skill List
        /// </summary>
        private const string Placeholder_Skill_End = "Skills_End";

        /// <summary>
        /// Current Skill Index
        /// </summary>
        private const string Placeholder_CurSkill_Index = "CurSkill_Index";

        /// <summary>
        /// Flex Field Skill Resolver Prefix
        /// </summary>
        private const string FlexField_Skill_Prefix = "CurSkill";


        /// <summary>
        /// Export default template provider
        /// </summary>
        private readonly ICachedExportDefaultTemplateProvider _defaultTemplateProvider;

        /// <summary>
        /// Cached Db Access
        /// </summary>
        private readonly IExportCachedDbAccess _cachedDbAccess;

        /// <summary>
        /// Language Key Generator
        /// </summary>
        private readonly ILanguageKeyGenerator _languageKeyGenerator;

        /// <summary>
        /// Resolver for flex field skills
        /// </summary>
        private readonly FlexFieldExportTemplatePlaceholderResolver _skillPlaceholderResolver;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="defaultTemplateProvider">Default Template Provider</param>
        /// <param name="cachedDbAccess">Cached Db Access</param>
        /// <param name="languageKeyGenerator">Language Key Generator</param>
        /// <param name="localizerFactory">Localizer Factory</param>
        public NpcSkillExportTemplatePlaceholderResolver(ICachedExportDefaultTemplateProvider defaultTemplateProvider, IExportCachedDbAccess cachedDbAccess, ILanguageKeyGenerator languageKeyGenerator, IStringLocalizerFactory localizerFactory) : 
                                                         base(localizerFactory.Create(typeof(NpcSkillExportTemplatePlaceholderResolver)))
        {
            _defaultTemplateProvider = defaultTemplateProvider;
            _cachedDbAccess = cachedDbAccess;
            _languageKeyGenerator = languageKeyGenerator;
            _skillPlaceholderResolver = new FlexFieldExportTemplatePlaceholderResolver(defaultTemplateProvider, cachedDbAccess, languageKeyGenerator, localizerFactory, FlexField_Skill_Prefix);
        }

        /// <summary>
        /// Fills the placeholders of a code
        /// </summary>
        /// <param name="code">Code to fill</param>
        /// <param name="data">Export Data</param>
        /// <returns>Filled Code</returns>
        public async Task<string> FillPlaceholders(string code, ExportObjectData data)
        {
            // Check Data
            if(!data.ExportData.ContainsKey(ExportConstants.ExportDataObject))
            {
                return code;
            }

            KortistoNpc npc = data.ExportData[ExportConstants.ExportDataObject] as KortistoNpc;
            if(npc == null)
            {
                return code;
            }

            // Replace Skill Placeholders
            _skillPlaceholderResolver.SetErrorMessageCollection(_errorCollection);            
            return await FillSkillPlaceholders(code, npc);
        }

        /// <summary>
        /// Fills the skill placeholders
        /// </summary>
        /// <param name="code">Code</param>
        /// <param name="npc">Npc</param>
        /// <returns>Filled code</returns>
        private async Task<string> FillSkillPlaceholders(string code, KortistoNpc npc)
        {
            GoNorthProject project = await _cachedDbAccess.GetDefaultProject();
            ExportTemplate skillTemplate = await _defaultTemplateProvider.GetDefaultTemplateByType(project.Id, TemplateType.ObjectSkillList);

            code = ExportUtil.BuildPlaceholderRegex(Placeholder_Skills, ExportConstants.ListIndentPrefix).Replace(code, m => {
                return ExportUtil.IndentListTemplate(skillTemplate.Code, m.Groups[1].Value);
            });

            code = ExportUtil.BuildRangePlaceholderRegex(Placeholder_Skill_Start, Placeholder_Skill_End).Replace(code, m => {
                return ExportUtil.TrimEmptyLines(BuildSkills(m.Groups[1].Value, npc));
            });

            return code;
        }

        /// <summary>
        /// Builds the skills
        /// </summary>
        /// <param name="skillCode">Code for the skills to repeat</param>
        /// <param name="npc">Npc</param>
        /// <returns>Skills of the npc</returns>
        private string BuildSkills(string skillCode, KortistoNpc npc)
        {
            if(npc.Skills == null)
            {
                return string.Empty;
            }

            int skillIndex = 0;
            string skillListCode = string.Empty;
            foreach(KortistoNpcSkill curSkill in npc.Skills)
            {
                string curSkillCode = ExportUtil.BuildPlaceholderRegex(Placeholder_CurSkill_Index).Replace(skillCode, skillIndex.ToString());

                EvneSkill skill = _cachedDbAccess.GetSkillById(curSkill.SkillId).Result;
                if(skill != null)
                {
                    ExportObjectData skillExportData = new ExportObjectData();
                    skillExportData.ExportData.Add(ExportConstants.ExportDataObject, skill);
                    skillExportData.ExportData.Add(ExportConstants.ExportDataObjectType, ExportConstants.ExportObjectTypeSkill);
                    curSkillCode = _skillPlaceholderResolver.FillPlaceholders(curSkillCode, skillExportData).Result;
                }
                
                skillListCode += curSkillCode;
                ++skillIndex;
            }
            
            return skillListCode;
        }

        /// <summary>
        /// Returns if the placeholder resolver is valid for a template type
        /// </summary>
        /// <param name="templateType">Template Type</param>
        /// <returns>true if the template type is valid for the template type</returns>
        public bool IsValidForTemplateType(TemplateType templateType)
        {
            return templateType == TemplateType.ObjectNpc || templateType == TemplateType.ObjectSkillList;
        }

        /// <summary>
        /// Returns the Export Template Placeholders for a Template Type
        /// </summary>
        /// <param name="templateType">Template Type</param>
        /// <returns>Export Template Placeholder</returns>
        public List<ExportTemplatePlaceholder> GetExportTemplatePlaceholdersForType(TemplateType templateType)
        {
            List<ExportTemplatePlaceholder> exportPlaceholders = new List<ExportTemplatePlaceholder>();
            if(templateType == TemplateType.ObjectNpc)
            {
                exportPlaceholders.Add(CreatePlaceHolder(Placeholder_Skills));
            }

            exportPlaceholders.AddRange(new List<ExportTemplatePlaceholder>() {
                CreatePlaceHolder(Placeholder_Skill_Start),
                CreatePlaceHolder(Placeholder_Skill_End),
                CreatePlaceHolder(Placeholder_CurSkill_Index)
            });

            exportPlaceholders.AddRange(_skillPlaceholderResolver.GetExportTemplatePlaceholdersForType(TemplateType.ObjectSkill));

            return exportPlaceholders;
        }
    }
}