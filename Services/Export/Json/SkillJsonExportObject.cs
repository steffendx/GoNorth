using System.Collections.Generic;
using GoNorth.Data.Evne;
using GoNorth.Data.Exporting;

namespace GoNorth.Services.Export.Json
{
    /// <summary>
    /// Skill Json Export Object
    /// </summary>
    public class SkillJsonExportObject : EvneSkill
    {
        /// <summary>
        /// Copy Constructor from Base skill
        /// </summary>
        /// <param name="baseSkill">Base Skill</param>
        public SkillJsonExportObject(EvneSkill baseSkill)
        {
            ExportSnippets = new List<ObjectExportSnippet>();
            
            JsonExportPropertyFill.FillBaseProperties(this, baseSkill);
        }

        /// <summary>
        /// Filled export snippets of the skill
        /// </summary>
        public List<ObjectExportSnippet> ExportSnippets { get; set; }
    }
}