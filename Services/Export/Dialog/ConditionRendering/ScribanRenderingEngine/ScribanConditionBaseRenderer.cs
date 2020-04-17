using System.Collections.Generic;
using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Data.FlexFieldDatabase;
using GoNorth.Data.Project;
using GoNorth.Services.Export.Data;
using GoNorth.Services.Export.Placeholder;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.Include;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.LanguageKeyGenerator;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.RenderingObjects;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.Util;
using Microsoft.Extensions.Localization;
using Scriban;
using Scriban.Runtime;

namespace GoNorth.Services.Export.Dialog.ConditionRendering.ScribanRenderingEngine
{
    /// <summary>
    /// Base Class for rendering a scriban condition
    /// </summary>
    public abstract class ScribanConditionBaseRenderer<ConfigClass, ScribanRenderingClass> : BaseConditionRenderer<ConfigClass>
    {
        /// <summary>
        /// Export cached Db access
        /// </summary>
        protected readonly IExportCachedDbAccess _exportCachedDbAccess;

        /// <summary>
        /// Scriban Language key generator
        /// </summary>
        protected readonly IScribanLanguageKeyGenerator _languageKeyGenerator;

        /// <summary>
        /// String Localizer Factory
        /// </summary>
        protected readonly IStringLocalizerFactory _localizerFactory;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="exportCachedDbAccess">Export cached Db access</param>
        /// <param name="languageKeyGenerator">Scriban language key generator, can be null if language key generation is not needed</param>
        /// <param name="localizerFactory">String Localizer Factory</param>
        public ScribanConditionBaseRenderer(IExportCachedDbAccess exportCachedDbAccess, IScribanLanguageKeyGenerator languageKeyGenerator, IStringLocalizerFactory localizerFactory)
        {
            _exportCachedDbAccess = exportCachedDbAccess;
            _languageKeyGenerator = languageKeyGenerator;
            _localizerFactory = localizerFactory;
        }

        /// <summary>
        /// Builds a condition element from parsed data
        /// </summary>
        /// <param name="template">Export template to use</param>
        /// <param name="parsedData">Parsed data</param>
        /// <param name="project">Project</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <param name="flexFieldObject">Flex field object to which the dialog belongs</param>
        /// <param name="exportSettings">Export Settings</param>
        /// <returns>Condition string</returns>
        public override async Task<string> BuildConditionElementFromParsedData(ExportTemplate template, ConfigClass parsedData, GoNorthProject project, ExportPlaceholderErrorCollection errorCollection, FlexFieldObject flexFieldObject, ExportSettings exportSettings)
        {
            Template parsedTemplate = ScribanParsingUtil.ParseTemplate(template.Code, errorCollection);
            if (parsedTemplate == null)
            {
                return string.Empty;
            }

            if(_languageKeyGenerator != null)
            {
                _languageKeyGenerator.SetErrorCollection(errorCollection);
            }

            ScribanRenderingClass renderingObject = await GetExportObject(parsedData, project, errorCollection, flexFieldObject, exportSettings);
            if(renderingObject == null)
            {
                return string.Empty;
            }

            TemplateContext context = BuildTemplateContext(renderingObject, errorCollection);
            string conditionCode = await parsedTemplate.RenderAsync(context);

            return conditionCode;
        }

        /// <summary>
        /// Builds the template context for exporting
        /// </summary>
        /// <param name="renderingObject">Rendering object to export</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <returns>Template context</returns>
        private TemplateContext BuildTemplateContext(ScribanRenderingClass renderingObject, ExportPlaceholderErrorCollection errorCollection)
        {
            ScriptObject exportObject = new ScriptObject();
            exportObject.Add(GetObjectKey(), renderingObject);
            if(_languageKeyGenerator != null)
            {
                exportObject.Add(ExportConstants.ScribanLanguageKeyName, _languageKeyGenerator);
            }
            TemplateContext context = new TemplateContext();
            context.TemplateLoader = new ScribanIncludeTemplateLoader(_exportCachedDbAccess, errorCollection);
            context.PushGlobal(exportObject);
            return context;
        }

        /// <summary>
        /// Returns the value object to use for scriban exporting
        /// </summary>
        /// <param name="parsedData">Parsed data</param>
        /// <param name="project">Project</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <param name="flexFieldObject">Flex field object to which the dialog belongs</param>
        /// <param name="exportSettings">Export Settings</param>
        /// <returns>Value Object</returns>
        protected abstract Task<ScribanRenderingClass> GetExportObject(ConfigClass parsedData, GoNorthProject project, ExportPlaceholderErrorCollection errorCollection, FlexFieldObject flexFieldObject, ExportSettings exportSettings);

        /// <summary>
        /// Returns the object key for scriban
        /// </summary>
        /// <returns>Object key</returns>
        protected abstract string GetObjectKey();

        /// <summary>
        /// Returns the object key for scriban
        /// </summary>
        /// <returns>Object key</returns>
        protected virtual string GetLanguageKeyValueDesc() { return string.Empty; }

        /// <summary>
        /// Returns the Export Template Placeholders for a Template Type
        /// </summary>
        /// <param name="templateType">Template Type</param>
        /// <returns>Export Template Placeholder</returns>
        public override List<ExportTemplatePlaceholder> GetExportTemplatePlaceholdersForType(TemplateType templateType)
        {
            List<ExportTemplatePlaceholder> exportPlaceholders = new List<ExportTemplatePlaceholder>();

            if(_languageKeyGenerator != null)
            {
                exportPlaceholders.AddRange(_languageKeyGenerator.GetExportTemplatePlaceholders(GetLanguageKeyValueDesc()));
            }
            
            exportPlaceholders.AddRange(ScribanPlaceholderGenerator.GetPlaceholdersForObject<ScribanRenderingClass>(_localizerFactory, GetObjectKey()));
            exportPlaceholders.RemoveAll(p => p.Name.EndsWith(string.Format(".{0}", StandardMemberRenamer.Rename(nameof(ScribanFlexFieldObject.UnusedFields)))));

            return exportPlaceholders;
        }
    }
}