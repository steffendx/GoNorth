using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.AspNetCore.Mvc.ViewFeatures;

namespace GoNorth.Views
{
    /// <summary>
    /// Nav Pages Base
    /// </summary>
    public static class NavPagesBase
    {
        /// <summary>
        /// Active Page Key
        /// </summary>
        public static string ActivePageKey => "ActivePage";

        /// <summary>
        /// Returns the class for a navigation page based on the active state
        /// </summary>
        /// <param name="viewContext">View Context</param>
        /// <param name="page">Page</param>
        /// <returns>Nav Class</returns>
        public static string PageNavClass(ViewContext viewContext, string page)
        {
            string activePage = viewContext.ViewData["ActivePage"] as string;
            return string.Equals(activePage, page, StringComparison.OrdinalIgnoreCase) ? "active" : null;
        }

        /// <summary>
        /// Adds the active page
        /// </summary>
        /// <param name="viewData">View Date</param>
        /// <param name="activePage">Active Page</param>
        public static void AddActivePage(this ViewDataDictionary viewData, string activePage) => viewData[ActivePageKey] = activePage;
    }
}
