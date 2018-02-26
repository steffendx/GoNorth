using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.AspNetCore.Mvc.ViewFeatures;

namespace GoNorth.Views.Administration
{
    /// <summary>
    /// Administration Nav Pages
    /// </summary>
    public class AdministrationNavPages
    {
        /// <summary>
        /// Index
        /// </summary>
        public static string Index => "Index";

        /// <summary>
        /// Project
        /// </summary>
        public static string Project => "Project";

        /// <summary>
        /// Config Encryption
        /// </summary>
        public static string ConfigEncryption => "ConfigEncryption";

        /// <summary>
        /// Db Setup
        /// </summary>
        public static string DbSetup => "DbSetup";

        /// <summary>
        /// Index Nav Class
        /// </summary>
        /// <param name="viewContext">View Context</param>
        /// <returns>Nav Class</returns>
        public static string IndexNavClass(ViewContext viewContext) => NavPagesBase.PageNavClass(viewContext, Index);

        /// <summary>
        /// Project Nav Class
        /// </summary>
        /// <param name="viewContext">View Context</param>
        /// <returns>Nav Class</returns>
        public static string ProjectNavClass(ViewContext viewContext) => NavPagesBase.PageNavClass(viewContext, Project);

        /// <summary>
        /// Config Encryption Nav Class
        /// </summary>
        /// <param name="viewContext">View Context</param>
        /// <returns>Nav Class</returns>
        public static string ConfigEncryptionClass(ViewContext viewContext) => NavPagesBase.PageNavClass(viewContext, ConfigEncryption);

        /// <summary>
        /// Db Setup Nav Class
        /// </summary>
        /// <param name="viewContext">View Context</param>
        /// <returns>Nav Class</returns>
        public static string DbSetupNavClass(ViewContext viewContext) => NavPagesBase.PageNavClass(viewContext, DbSetup);
    }
}
