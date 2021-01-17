using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Data.Project;
using GoNorth.Services.Export.LanguageKeyGeneration;
using GoNorth.Services.Export.Placeholder;
using GoNorth.Services.Export.Script;
using GoNorth.Services.Project;

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
        /// User project access
        /// </summary>
        private readonly IUserProjectAccess _userProjectAccess;

        /// <summary>
        /// Language key reference collector
        /// </summary>
        private readonly ILanguageKeyReferenceCollector _languageKeyReferenceCollector;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="placeholderResolver">Pkaceholder Resolver</param>
        /// <param name="defaultTemplateProvider">Default Template Provider</param>
        /// <param name="exportSettingsDbAccess">Export Settings Db Accesss</param>
        /// <param name="userProjectAccess">User project access</param>
        /// <param name="languageKeyReferenceCollector">Language key reference collector</param>
        public LanguageExporter(IExportTemplatePlaceholderResolver placeholderResolver, IExportDefaultTemplateProvider defaultTemplateProvider, IExportSettingsDbAccess exportSettingsDbAccess, IUserProjectAccess userProjectAccess, 
                                ILanguageKeyReferenceCollector languageKeyReferenceCollector)
        {
            _placeholderResolver = placeholderResolver;
            _defaultTemplateProvider = defaultTemplateProvider;
            _exportSettingsDbAccess = exportSettingsDbAccess;
            _userProjectAccess = userProjectAccess;
            _languageKeyReferenceCollector = languageKeyReferenceCollector;

            _scriptExporter = new ScriptExporter(placeholderResolver, exportSettingsDbAccess, userProjectAccess);
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
            IFlexFieldExportable flexFieldObject = null;
            if(objectData.ExportData.ContainsKey(ExportConstants.ExportDataObject))
            {
                flexFieldObject = objectData.ExportData[ExportConstants.ExportDataObject] as IFlexFieldExportable;
            }
            
            if(flexFieldObject != null)
            {
                _languageKeyReferenceCollector.PrepareCollectionForGroup(flexFieldObject.Id);
            }
            else
            {
                _languageKeyReferenceCollector.PrepareCollectionForGroup(null);
            }

            await _scriptExporter.ExportObject(template, objectData);

            objectData.ExportData[ExportConstants.ExportDataReferencedLanguageIds] = _languageKeyReferenceCollector.GetReferencedLanguageKeys();

            // Export language keys
            GoNorthProject project = await _userProjectAccess.GetUserProject();
            ExportSettings exportSettings = await _exportSettingsDbAccess.GetExportSettings(project.Id);
            ExportTemplate exportTemplate = await _defaultTemplateProvider.GetDefaultTemplateByType(project.Id, TemplateType.LanguageFile);

            ExportObjectResult result = new ExportObjectResult();
            result.FileExtension = exportSettings.LanguageFileExtension;

            ExportPlaceholderFillResult filledResult = await _placeholderResolver.FillPlaceholders(TemplateType.LanguageFile, exportTemplate.Code, objectData, exportTemplate.RenderingEngine);
            result.Code = filledResult.Code;
            result.Errors = filledResult.Errors.ToErrorList();

            return result;
        }
    }
}