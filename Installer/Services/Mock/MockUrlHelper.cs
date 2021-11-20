using System.Reflection;
using System.Web;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Routing;

namespace Installer.Services.Mock
{
    /// <summary>
    /// Mock class for building urls
    /// </summary>
    public class MockUrlHelper : IUrlHelper
    {
        /// <summary>
        /// Action context
        /// </summary>
        /// <returns>Action context</returns>
        public ActionContext ActionContext => throw new System.NotImplementedException();

        /// <summary>
        /// Generates an action url
        /// </summary>
        /// <param name="actionContext">Action context</param>
        /// <returns>Url</returns>
        public string Action(UrlActionContext actionContext)
        {
            string url = string.Format("https://localhost:5001/{0}/{1}", actionContext.Controller, actionContext.Action);
        
            string parameters = string.Empty;
            if(actionContext.Values != null)
            {
                foreach (PropertyInfo prop in actionContext.Values.GetType().GetProperties())
                {
                    string value = prop.GetValue(actionContext.Values, null).ToString();

                    if(string.IsNullOrEmpty(parameters))
                    {
                        parameters += "?";
                    }
                    else
                    {
                        parameters += "&";
                    }
                    parameters += string.Format("{0}={1}", prop.Name, HttpUtility.UrlEncode(value));
                }
            }

            return url + parameters;
        }

        /// <summary>
        /// Returns a content url
        /// </summary>
        /// <param name="contentPath">Content path</param>
        /// <returns>Content url</returns>
        public string Content(string contentPath)
        {
            throw new System.NotImplementedException();
        }

        /// <summary>
        /// Checks if a url is a local url
        /// </summary>
        /// <param name="url">Url</param>
        /// <returns>True if the url is a local url, else false</returns>        
        public bool IsLocalUrl(string url)
        {
            throw new System.NotImplementedException();
        }

        /// <summary>
        /// Generates a link
        /// </summary>
        /// <param name="routeName">Route Name</param>
        /// <param name="values">Values</param>
        /// <returns>Generated link</returns>
        public string Link(string routeName, object values)
        {
            throw new System.NotImplementedException();
        }

        /// <summary>
        /// Generates a route
        /// </summary>
        /// <param name="routeContext">Route context</param>
        /// <returns>Route Url</returns>
        public string RouteUrl(UrlRouteContext routeContext)
        {
            throw new System.NotImplementedException();
        }
    }
}