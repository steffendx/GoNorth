using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Data.Project;
using GoNorth.Services.Export.Placeholder;
using GoNorth.Services.Export.Script;
using Microsoft.Extensions.Localization;

namespace GoNorth.Services.Export.LanguageExport
{
    /// <summary>
    /// Class for exporting objects to language format
    /// </summary>
    public class LanguageExporter : IObjectExporter
    {
        /// <summary>
        /// Placeholder Resolver
        /// </summary>
        private readonly IExportTemplatePlaceholderResolver _placeholderResolver;

        /// <summary>
        /// Script Exporter
        /// </summary>
        private readonly ScriptExporter _scriptExporter;

        /// <summary>
        /// Default Template Provider
        /// </summary>
        private readonly IExportDefaultTemplateProvider _defaultTemplateProvider;

        /// <summary>
        /// Export Settings Db Access
        /// </summary>
        private readonly IExportSettingsDbAccess _exportSettingsDbAccess;

        /// <summary>
        /// Project Db Access
        /// </summary>
        private readonly IProjectDbAccess _projectDbAccess;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="placeholderResolver">Pkaceholder Resolver</param>
        /// <param name="defaultTemplateProvider">Default Template Provider</param>
        /// <param name="projectDbAccess">Project Db Access</param>
        /// <param name="exportSettingsDbAccess">Export Settings Db Accesss</param>
        public LanguageExporter(IExportTemplatePlaceholderResolver placeholderResolver, IExportDefaultTemplateProvider defaultTemplateProvider, IProjectDbAccess projectDbAccess, IExportSettingsDbAccess exportSettingsDbAccess)
        {
            _placeholderResolver = placeholderResolver;
            _defaultTemplateProvider = defaultTemplateProvider;
            _projectDbAccess = projectDbAccess;
            _exportSettingsDbAccess = exportSettingsDbAccess;

            _scriptExporter = new ScriptExporter(placeholderResolver, projectDbAccess, exportSettingsDbAccess);
        }

        /// <summary>
        /// Exports an object
        /// </summary>
        /// <param name="template">Template to use</param>
        /// <param name="objectData">Object data</param>
        /// <returns>Export Result</returns>
        public async Task<ExportObjectResult> ExportObject(ExportTemplate template, ExportObjectData objectData)
        {
            // Run script export to refresh language keys
            await _scriptExporter.ExportObject(template, objectData);

            // Export language keys
            GoNorthProject project = await _projectDbAccess.GetDefaultProject();
            ExportSettings exportSettings = await _exportSettingsDbAccess.GetExportSettings(project.Id);
            ExportTemplate exportTemplate = await _defaultTemplateProvider.GetDefaultTemplateByType(project.Id, TemplateType.LanguageFile);

            ExportObjectResult result = new ExportObjectResult();
            result.FileExtension = exportSettings.LanguageFileExtension;

            ExportPlaceholderFillResult filledResult = await _placeholderResolver.FillPlaceholders(TemplateType.LanguageFile, exportTemplate.Code, objectData);
            result.Code = filledResult.Code;
            result.Errors = filledResult.Errors.ToErrorList();

            return result;
        }
    }
}