using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using GoNorth.Data.FlexFieldDatabase;
using Microsoft.AspNetCore.Hosting;

namespace GoNorth.Data.Kortisto
{
    /// <summary>
    /// Class for Image Access on the file system for Kortisto Npcs
    /// </summary>
    public class KortistoFileSystemNpcImageAccess : FlexFieldObjectFileSystemImageAccess<KortistoNpc, IKortistoNpcDbAccess, IKortistoNpcTemplateDbAccess>, IKortistoNpcImageAccess
    {
        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="hostingEnvironment">Hosting Environment</param>
        /// <param name="npcDbAccess">Npc Db Access</param>
        /// <param name="templateDbAccess">Template Db Access</param>
        public KortistoFileSystemNpcImageAccess(IWebHostEnvironment hostingEnvironment, IKortistoNpcDbAccess npcDbAccess, IKortistoNpcTemplateDbAccess templateDbAccess) : base("NpcImages", hostingEnvironment, npcDbAccess, templateDbAccess)
        {
        }
    }
}