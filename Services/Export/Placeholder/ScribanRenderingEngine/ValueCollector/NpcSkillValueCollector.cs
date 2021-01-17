using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using GoNorth.Data.Evne;
using GoNorth.Data.Exporting;
using GoNorth.Data.Kortisto;
using GoNorth.Data.Project;
using GoNorth.Services.Export.Data;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.LanguageKeyGenerator;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.RenderingObjects;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.Util;
using Microsoft.Extensions.Localization;
using Scriban;
using Scriban.Runtime;

namespace GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.ValueCollector
{
    /// <summary>
    /// Class to collect npc skills for Scriban value collectors
    /// </summary>
    public class NpcSkillValueCollector : BaseScribanValueCollector
    {
        /// <summary>
        /// Prefix used for skills in the placeholder definition
        /// </summary>
        private const string SkillPlaceholderDefintionPrefix = "skill";

        /// <summary>
        /// Export cached database access
        /// </summary>
        private readonly IExportCachedDbAccess _exportCachedDbAccess;

        /// <summary>
        /// Language key generator
        /// </summary>
        private readonly IScribanLanguageKeyGenerator _languageKeyGenerator;

        /// <summary>
        /// Localizer Factory
        /// </summary>
        private readonly IStringLocalizerFactory _localizerFactory;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="exportCachedDbAccess">Export cached database access</param>
        /// <param name="languageKeyGenerator">Language key generator</param>
        /// <param name="localizerFactory">Localizer Factory</param>
        public NpcSkillValueCollector(IExportCachedDbAccess exportCachedDbAccess, IScribanLanguageKeyGenerator languageKeyGenerator, 
                                      IStringLocalizerFactory localizerFactory)
        {
            _exportCachedDbAccess = exportCachedDbAccess;
            _languageKeyGenerator = languageKeyGenerator;
            _localizerFactory = localizerFactory;
        }

        /// <summary>
        /// Returns true if the value collector is valid for a given template type
        /// </summary>
        /// <param name="templateType">Template type</param>
        /// <returns>True if the value collector is valid, else false</returns>
        public override bool IsValidForTemplateType(TemplateType templateType)
        {
            return templateType == TemplateType.ObjectNpc || templateType == TemplateType.ObjectSkillList;
        }

        /// <summary>
        /// Collects the values for an export
        /// </summary>
        /// <param name="templateType">Template type</param>
        /// <param name="parsedTemplate">Parsed scriban template</param>
        /// <param name="scriptObject">Scriban script object to fill</param>
        /// <param name="data">Export Data</param>
        /// <returns>Task</returns>
        public override async Task CollectValues(TemplateType templateType, Template parsedTemplate, ScriptObject scriptObject, ExportObjectData data)
        {
            KortistoNpc inputNpc = data.ExportData[ExportConstants.ExportDataObject] as KortistoNpc;
            if(inputNpc == null)
            {
                return;
            }

            _languageKeyGenerator.SetErrorCollection(_errorCollection);
            
            List<ScribanExportSkill> skills = await LoadSkills(parsedTemplate, inputNpc); 
            scriptObject.AddOrUpdate(ExportConstants.ScribanNpcSkillsObjectKey, skills);
            scriptObject.AddOrUpdate(ExportConstants.ScribanLanguageKeyName, _languageKeyGenerator);
        }

        /// <summary>
        /// Loads the skills
        /// </summary>
        /// <param name="parsedTemplate">Parsed scriban template</param>
        /// <param name="inputNpc">Input npc</param>
        /// <returns>List of skills</returns>
        private async Task<List<ScribanExportSkill>> LoadSkills(Template parsedTemplate, KortistoNpc inputNpc)
        {
            if(inputNpc.Skills == null || !inputNpc.Skills.Any())
            {
                return new List<ScribanExportSkill>();
            }
            
            GoNorthProject project = await _exportCachedDbAccess.GetUserProject();
            ExportSettings exportSettings = await _exportCachedDbAccess.GetExportSettings(project.Id);

            List<EvneSkill> skills = await _exportCachedDbAccess.GetSkillsById(inputNpc.Skills.Select(i => i.SkillId).ToList());
            return skills.Select(s => FlexFieldValueCollectorUtil.BuildFlexFieldValueObject<ScribanExportSkill>(null, parsedTemplate, s, exportSettings, _errorCollection)).ToList();
        }

        /// <summary>
        /// Returns the Export Template Placeholders for a Template Type
        /// </summary>
        /// <param name="templateType">Template Type</param>
        /// <returns>Export Template Placeholder</returns>
        public override List<ExportTemplatePlaceholder> GetExportTemplatePlaceholdersForType(TemplateType templateType)
        {
            List<ExportTemplatePlaceholder> exportPlaceholders = new List<ExportTemplatePlaceholder>();
            if(templateType != TemplateType.ObjectNpc && templateType != TemplateType.ObjectSkillList)
            {
                return exportPlaceholders;
            }

            if(templateType == TemplateType.ObjectSkillList)
            {
                exportPlaceholders.AddRange(_languageKeyGenerator.GetExportTemplatePlaceholders(string.Format("{0}.name || {0}.field.name", SkillPlaceholderDefintionPrefix)));
            }

            IStringLocalizer stringLocalizer = _localizerFactory.Create(typeof(NpcSkillValueCollector));
            exportPlaceholders.Add(new ExportTemplatePlaceholder(ExportConstants.ScribanNpcSkillsObjectKey, stringLocalizer["PlaceholderDesc_Skills"]));

            List<ExportTemplatePlaceholder> skillPlaceholders = ScribanPlaceholderGenerator.GetPlaceholdersForObject<ScribanExportSkill>(_localizerFactory, SkillPlaceholderDefintionPrefix);
            skillPlaceholders.RemoveAll(p => p.Name == string.Format("{0}.{1}", SkillPlaceholderDefintionPrefix, StandardMemberRenamer.Rename(nameof(ScribanExportSkill.UnusedFields))));
            exportPlaceholders.AddRange(skillPlaceholders);

            return exportPlaceholders;
        }
    }
}