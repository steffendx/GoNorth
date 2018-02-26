using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using GoNorth.Data.FlexFieldDatabase;
using Microsoft.AspNetCore.Hosting;

namespace GoNorth.Data.Styr
{
    /// <summary>
    /// Class for Image Access on the file system for Styr Items
    /// </summary>
    public class StyrFileSystemItemImageAccess : FlexFieldObjectFileSystemImageAccess<StyrItem, IStyrItemDbAccess, IStyrItemTemplateDbAccess>, IStyrItemImageAccess
    {
        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="hostingEnvironment">Hosting Environment</param>
        /// <param name="itemDbAccess">Item Db Access</param>
        /// <param name="templateDbAccess">Template Db Access</param>
        public StyrFileSystemItemImageAccess(IHostingEnvironment hostingEnvironment, IStyrItemDbAccess itemDbAccess, IStyrItemTemplateDbAccess templateDbAccess) : base("ItemImages", hostingEnvironment, itemDbAccess, templateDbAccess)
        {
        }
    }
}