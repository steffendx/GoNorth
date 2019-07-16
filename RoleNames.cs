using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;

namespace GoNorth
{
    /// <summary>
    /// Role Names
    /// </summary>
    public class RoleNames
    {
        /// <summary>
        /// Administrator role
        /// </summary>
        public const string Administrator = "Administrator";


        /// <summary>
        /// Task role
        /// </summary>
        public const string Task = "Task";
        
        /// <summary>
        /// Task Management Board role
        /// </summary>
        public const string TaskBoardManager = "TaskBoardManager";

        /// <summary>
        /// Task Board Category Management role
        /// </summary>
        public const string TaskBoardCategoryManager = "TaskBoardCategoryManager";
        
        /// <summary>
        /// Task Type Manager role
        /// </summary>
        public const string TaskTypeManager = "TaskTypeManager";


        /// <summary>
        /// Kortisto role
        /// </summary>
        public const string Kortisto = "Kortisto";

        /// <summary>
        /// Kortisto template manager role
        /// </summary>
        public const string KortistoTemplateManager = "KortistoTemplateManager";

        /// <summary>
        /// Kortisto player manager role
        /// </summary>
        public const string KortistoPlayerManager = "KortistoPlayerManager";


        /// <summary>
        /// Styr role
        /// </summary>
        public const string Styr = "Styr";

        /// <summary>
        /// Styr template manager role
        /// </summary>
        public const string StyrTemplateManager = "StyrTemplateManager";


        /// <summary>
        /// Evne role
        /// </summary>
        public const string Evne = "Evne";

        /// <summary>
        /// Evne template manager role
        /// </summary>
        public const string EvneTemplateManager = "EvneTemplateManager";


        /// <summary>
        /// Kirja role
        /// </summary>
        public const string Kirja = "Kirja";


        /// <summary>
        /// Karta role
        /// </summary>
        public const string Karta = "Karta";

        /// <summary>
        /// Karta map manager role
        /// </summary>
        public const string KartaMapManager = "KartaMapManager";


        /// <summary>
        /// Tale role
        /// </summary>
        public const string Tale = "Tale";


        /// <summary>
        /// Aika role
        /// </summary>
        public const string Aika = "Aika";

        
        /// <summary>
        /// Implementation status tracker role
        /// </summary>
        public const string ImplementationStatusTracker = "ImplementationStatusTracker";


        /// <summary>
        /// Export Objects
        /// </summary>
        public const string ExportObjects = "ExportObjects";

        /// <summary>
        /// Manage Export Templates
        /// </summary>
        public const string ManageExportTemplates = "ManageExportTemplates";


        /// <summary>
        /// Project config manager role
        /// </summary>
        public const string ProjectConfigManager = "ProjectConfigManager";


        /// <summary>
        /// Returns all Role Names
        /// </summary>
        /// <returns>All Role Names</returns>
        public static List<string> GetAllRoleNames()
        {
            List<string> roles = new List<string>();
            FieldInfo[] roleFields = typeof(RoleNames).GetFields(BindingFlags.Public | BindingFlags.Static);
            foreach(FieldInfo roleField in roleFields)
            {
                if(roleField.IsLiteral && !roleField.IsInitOnly)
                {
                    roles.Add(roleField.GetValue(null).ToString());
                }
            }

            return roles;
        }

        /// <summary>
        /// Returns the name of a role by the normalized name
        /// </summary>
        /// <param name="normalizedName">Normalized name</param>
        /// <returns>Normalized Name</returns>
        public static string GetRoleNameByNormalizedName(string normalizedName)
        {
            return GetAllRoleNames().FirstOrDefault(r => r.Equals(normalizedName, StringComparison.OrdinalIgnoreCase));
        }
    };
}