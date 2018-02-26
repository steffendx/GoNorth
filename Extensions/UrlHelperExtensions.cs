using System.Text.RegularExpressions;
using GoNorth.Config;
using GoNorth.Controllers;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace GoNorth.Extensions
{
    /// <summary>
    /// Url Helper Extensions
    /// </summary>
    public static class UrlHelperExtensions
    {
        /// <summary>
        /// Url Replace Regex
        /// </summary>
        private const string UrlReplaceRegex = "(http|https):\\/\\/.*?\\/";

        /// <summary>
        /// Builds the link for and email confirmation
        /// </summary>
        /// <param name="urlHelper">Url Helper</param>
        /// <param name="userId">User Id</param>
        /// <param name="code">Code</param>
        /// <param name="scheme">Scheme</param>
        /// <param name="configuration">Configuration data</param>
        /// <returns>Link</returns>
        public static string EmailConfirmationLink(this IUrlHelper urlHelper, string userId, string code, string scheme, ConfigurationData configuration)
        {
            return ReplaceLocalhostToExternalUrl(urlHelper.Action(
                action: nameof(AccountController.ConfirmEmail),
                controller: "Account",
                values: new { userId, code },
                protocol: scheme), configuration);
        }

        /// <summary>
        /// Builds the link for a password reset callback link
        /// </summary>
        /// <param name="urlHelper">Url Helper</param>
        /// <param name="userId">User Id</param>
        /// <param name="code">Code</param>
        /// <param name="scheme">Scheme</param>
        /// <param name="configuration">Configuration data</param>
        /// <returns>Link</returns>
        public static string ResetPasswordCallbackLink(this IUrlHelper urlHelper, string userId, string code, string scheme, ConfigurationData configuration)
        {
            return ReplaceLocalhostToExternalUrl(urlHelper.Action(
                action: nameof(AccountController.ResetPassword),
                controller: "Account",
                values: new { userId, code },
                protocol: scheme), configuration);
        }

        /// <summary>
        /// Replace the localhost to external url for reverse proxy hosting
        /// </summary>
        /// <param name="url">Url</param>
        /// <param name="configuration">Configuration data</param>
        /// <returns>Updated url</returns>
        private static string ReplaceLocalhostToExternalUrl(string url, ConfigurationData configuration) 
        {
            return Regex.Replace(url, UrlReplaceRegex, configuration.Misc.ExternalUrl);
        }
    }
}
