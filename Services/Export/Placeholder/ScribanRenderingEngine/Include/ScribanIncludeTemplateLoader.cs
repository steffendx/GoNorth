using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Data.Project;
using GoNorth.Services.Export.Data;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.Util;
using Scriban;
using Scriban.Parsing;
using Scriban.Runtime;

namespace GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.Include
{
    /// <summary>
    /// Scriban Include Template loader class
    /// </summary>
    public class ScribanIncludeTemplateLoader : ITemplateLoader
    {
        /// <summary>
        /// Export cached Db access
        /// </summary>
        private readonly IExportCachedDbAccess _cachedDbAccess;

        /// <summary>
        /// Error Collection
        /// </summary>
        private readonly ExportPlaceholderErrorCollection _errorCollection;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="cachedDbAccess">Cached database access</param>
        /// <param name="errorCollection">Export error collection</param>
        public ScribanIncludeTemplateLoader(IExportCachedDbAccess cachedDbAccess, ExportPlaceholderErrorCollection errorCollection)
        {
            _cachedDbAccess = cachedDbAccess;
            _errorCollection = errorCollection;
        }

        /// <summary>
        /// Returns the path to a 
        /// </summary>
        /// <param name="context">Template context</param>
        /// <param name="callerSpan">Caller</param>
        /// <param name="templateName">Template name to load</param>
        /// <returns>Path to the template</returns>
        public string GetPath(TemplateContext context, SourceSpan callerSpan, string templateName)
        {
            return templateName;
        }

        /// <summary>
        /// Loads a template
        /// </summary>
        /// <param name="templateName">Template name</param>
        /// <param name="callerSpan">Caller span</param>
        /// <returns>Code of the template</returns>
        private async Task<string> LoadTemplate(string templateName, SourceSpan callerSpan)
        {
            GoNorthProject project = await _cachedDbAccess.GetUserProject();
            IncludeExportTemplate includeExportTemplate = await _cachedDbAccess.GetIncludeTemplateByName(project.Id, templateName);
            if(includeExportTemplate == null)
            {
                _errorCollection.AddIncludeTemplateNotFoundError(templateName, ScribanErrorUtil.FormatScribanSpan(callerSpan));
                return "<<INCLUDE TEMPLATE NOT FOUND>>";
            }

            return includeExportTemplate.Code;
        }

        /// <summary>
        /// Loads a template
        /// </summary>
        /// <param name="context">Template context</param>
        /// <param name="callerSpan">Caller span</param>
        /// <param name="templatePath">Template name to load</param>
        /// <returns>Loaded template</returns>
        public string Load(TemplateContext context, SourceSpan callerSpan, string templatePath)
        {
            return LoadTemplate(templatePath, callerSpan).Result;
        }

        /// <summary>
        /// Loads a template async
        /// </summary>
        /// <param name="context">Template context</param>
        /// <param name="callerSpan">Caller span</param>
        /// <param name="templatePath">Template name to load</param>
        /// <returns>Loaded template</returns>
        public async ValueTask<string> LoadAsync(TemplateContext context, SourceSpan callerSpan, string templatePath)
        {
            return await LoadTemplate(templatePath, callerSpan);
        }
    }
}