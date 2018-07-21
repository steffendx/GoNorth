using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Data.Project;
using GoNorth.Services.Export.Placeholder;

namespace GoNorth.Services.Export.Script
{
    /// <summary>
    /// Class for exporting objects to Script format
    /// </summary>
    public class ScriptExporter : IObjectExporter
    {
        /// <summary>
        /// Placeholder Resolver
        /// </summary>
        private readonly IExportTemplatePlaceholderResolver _placeholderResolver;

        /// <summary>
        /// Project Db Access
        /// </summary>
        private readonly IProjectDbAccess _projectDbAccess;

        /// <summary>
        /// Export Settings Db Access
        /// </summary>
        private readonly IExportSettingsDbAccess _exportSettingsDbAccess;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="placeholderResolver">Pkaceholder Resolver</param>
        /// <param name="projectDbAccess">Project Db Access</param>
        /// <param name="exportSettingsDbAccess">Export Settings Db Accesss</param>
        public ScriptExporter(IExportTemplatePlaceholderResolver placeholderResolver, IProjectDbAccess projectDbAccess, IExportSettingsDbAccess exportSettingsDbAccess)
        {
            _projectDbAccess = projectDbAccess;
            _placeholderResolver = placeholderResolver;
            _exportSettingsDbAccess = exportSettingsDbAccess;
        }

        /// <summary>
        /// Exports an object
        /// </summary>
        /// <param name="template">Template to use</param>
        /// <param name="objectData">Object data</param>
        /// <returns>Export Result</returns>
        public async Task<ExportObjectResult> ExportObject(ExportTemplate template, ExportObjectData objectData)
        {
            GoNorthProject project = await _projectDbAccess.GetDefaultProject();
            ExportSettings exportSettings = await _exportSettingsDbAccess.GetExportSettings(project.Id);

            ExportObjectResult result = new ExportObjectResult();
            result.FileExtension = exportSettings.ScriptExtension;

            ExportPlaceholderFillResult filledResult = await _placeholderResolver.FillPlaceholders(template.TemplateType, template.Code, objectData);

            result.Code = filledResult.Code;
            result.Errors = filledResult.Errors.ToErrorList();

            return result;
        }
    }
}