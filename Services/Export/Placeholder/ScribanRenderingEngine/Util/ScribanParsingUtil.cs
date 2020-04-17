using System.Collections.Generic;
using System.Linq;
using Scriban;
using Scriban.Runtime;
using Scriban.Syntax;

namespace GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.Util
{
    /// <summary>
    /// Utility class to for Scriban parsing
    /// </summary>
    public static class ScribanParsingUtil
    {
        /// <summary>
        /// Parses a template
        /// </summary>
        /// <param name="code">Code of the template</param>
        /// <param name="errorCollection">Error collection</param>
        /// <returns>Parsed template</returns>
        public static Template ParseTemplate(string code, ExportPlaceholderErrorCollection errorCollection)
        {
            Template parsedTemplate = Template.Parse(code, "");
            if(parsedTemplate.HasErrors)
            {
                errorCollection.AddTemplateHasErrors();
                return null;
            }

            return parsedTemplate;
        }

        /// <summary>
        /// Returns the caller hierarchy
        /// </summary>
        /// <param name="scriptExpression">Script expression</param>
        /// <returns>Caller hierarchy</returns>
        public static List<string> GetCallerHierarchy(ScriptExpression scriptExpression)
        {
            List<string> hierarchy = new List<string>();

            ScriptMemberExpression memberExpression = scriptExpression as ScriptMemberExpression;
            while (memberExpression != null)
            {
                hierarchy.Add(memberExpression.Member.ToString());

                if(memberExpression.Target is ScriptMemberExpression)
                {
                    memberExpression = memberExpression.Target as ScriptMemberExpression;
                }
                else if(memberExpression.Target is ScriptVariable)
                {
                    ScriptVariable rootVariable = memberExpression.Target as ScriptVariable;
                    hierarchy.Add(rootVariable.Name);
                    break;
                }
                else
                {
                    break;
                }
            }
            
            hierarchy.Reverse();
            return hierarchy;
        }

        /// <summary>
        /// Parses a list from a scriban argument
        /// </summary>
        /// <param name="arguments">Scriban arguments</param>
        /// <param name="index">Index of the parameter to parse</param>
        /// <typeparam name="T">Type</typeparam>
        /// <returns>Parsed list</returns>
        public static List<T> GetArrayFromScribanArgument<T>(ScriptArray arguments, int index)
        {
            if(arguments.Count <= index)
            {
                return null;
            }

            object argumentValue = arguments[index];
            if(argumentValue == null)
            {
                return null;
            }

            if(argumentValue is List<T>)
            {
                return (List<T>)argumentValue;
            }

            if(argumentValue is ScriptArray)
            {
                ScriptArray argumentArray = (ScriptArray)argumentValue;
                if(!argumentArray.Any(a => !(a is T)))
                {
                    return argumentArray.Cast<T>().ToList();
                }
            }

            return null;
        }
    }
}