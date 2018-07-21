using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;

namespace GoNorth.Data.Exporting
{
    /// <summary>
    /// Cached Export Default Template Provider
    /// </summary>
    public class CachedExportDefaultTemplateProvider : ICachedExportDefaultTemplateProvider
    {
        /// <summary>
        /// Default Template Provider
        /// </summary>
        private readonly IExportDefaultTemplateProvider _defaultTemplateProvider;

        /// <summary>
        /// Cached export templates
        /// </summary>
        private Dictionary<TemplateType, ExportTemplate> _cachedExportTemplates;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="defaultTemplateProvider">Default Template Provider</param>
        public CachedExportDefaultTemplateProvider(IExportDefaultTemplateProvider defaultTemplateProvider)
        {
            _defaultTemplateProvider = defaultTemplateProvider;
            _cachedExportTemplates = new Dictionary<TemplateType, ExportTemplate>();
        }

        /// <summary>
        /// Returns the default export template by its type
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <param name="templateType">Template Type</param>
        /// <returns>Export Template, NULL if no saved template exists</returns>
        public async Task<ExportTemplate> GetDefaultTemplateByType(string projectId, TemplateType templateType)
        {
            if(_cachedExportTemplates.ContainsKey(templateType))
            {
                return _cachedExportTemplates[templateType];
            }

            ExportTemplate exportTemplate = await _defaultTemplateProvider.GetDefaultTemplateByType(projectId, templateType);
            _cachedExportTemplates.Add(templateType, exportTemplate);
            return exportTemplate;
        }

    }
}