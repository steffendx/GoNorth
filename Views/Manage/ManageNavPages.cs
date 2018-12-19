using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.AspNetCore.Mvc.ViewFeatures;

namespace GoNorth.Views.Manage
{
    /// <summary>
    /// Manage Nav Pages
    /// </summary>
    public static class ManageNavPages
    {
        /// <summary>
        /// Index
        /// </summary>
        public static string Index => "Index";

        /// <summary>
        /// Change Password
        /// </summary>
        public static string ChangePassword => "ChangePassword";

        /// <summary>
        /// Preferences
        /// </summary>
        public static string Preferences => "Preferences";

        /// <summary>
        /// Personal data
        /// </summary>
        public static string PersonalData => "PersonalData";

        /// <summary>
        /// Index Nav Class
        /// </summary>
        /// <param name="viewContext">View Context</param>
        /// <returns>Nav Class</returns>
        public static string IndexNavClass(ViewContext viewContext) => NavPagesBase.PageNavClass(viewContext, Index);

        /// <summary>
        /// Change Password Nav Class
        /// </summary>
        /// <param name="viewContext">View Context</param>
        /// <returns>Nav Class</returns>
        public static string ChangePasswordNavClass(ViewContext viewContext) => NavPagesBase.PageNavClass(viewContext, ChangePassword);
        
        /// <summary>
        /// Preferences Nav Class
        /// </summary>
        /// <param name="viewContext">View Context</param>
        /// <returns>Nav Class</returns>
        public static string PreferencesNavClass(ViewContext viewContext) => NavPagesBase.PageNavClass(viewContext, Preferences);
        
        /// <summary>
        /// Personal data Nav Class
        /// </summary>
        /// <param name="viewContext">View Context</param>
        /// <returns>Nav Class</returns>
        public static string PersonalDataNavClass(ViewContext viewContext) => NavPagesBase.PageNavClass(viewContext, PersonalData);
    }
}
