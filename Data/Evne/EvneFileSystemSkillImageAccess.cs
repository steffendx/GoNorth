using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using GoNorth.Data.FlexFieldDatabase;
using Microsoft.AspNetCore.Hosting;

namespace GoNorth.Data.Evne
{
    /// <summary>
    /// Class for Image Access on the file system for Evne Skill
    /// </summary>
    public class EvneFileSystemSkillImageAccess : FlexFieldObjectFileSystemImageAccess<EvneSkill, IEvneSkillDbAccess, IEvneSkillTemplateDbAccess>, IEvneSkillImageAccess
    {
        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="hostingEnvironment">Hosting Environment</param>
        /// <param name="skillDbAccess">Skill Db Access</param>
        /// <param name="templateDbAccess">Template Db Access</param>
        public EvneFileSystemSkillImageAccess(IWebHostEnvironment hostingEnvironment, IEvneSkillDbAccess skillDbAccess, IEvneSkillTemplateDbAccess templateDbAccess) : base("SkillImages", hostingEnvironment, skillDbAccess, templateDbAccess)
        {
        }
    }
}