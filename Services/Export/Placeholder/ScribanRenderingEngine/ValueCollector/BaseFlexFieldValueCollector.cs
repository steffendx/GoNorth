using System.Collections.Generic;
using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Data.FlexFieldDatabase;
using GoNorth.Data.Project;
using GoNorth.Services.Export.Data;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.LanguageKeyGenerator;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.RenderingFunctions;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.RenderingObjects;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.Util;
using Microsoft.Extensions.Localization;
using Scriban;
using Scriban.Runtime;

namespace GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.ValueCollector
{
    /// <summary>
    /// Base class for Scriban flex field value collectors
    /// </summary>
    public abstract class BaseFlexFieldValueCollector<InputObject, ExportClass> : BaseScribanValueCollector where InputObject : FlexFieldObject where ExportClass : ScribanFlexFieldObject, new()
    {
        /// <summary>
        /// Template placeholder resolver
        /// </summary>
        protected readonly IExportTemplatePlaceholderResolver _templatePlaceholderResolver;

        /// <summary>
        /// Export cached database access
        /// </summary>
        protected readonly IExportCachedDbAccess _exportCachedDbAccess;

        /// <summary>
        /// Default template provider
        /// </summary>
        protected readonly ICachedExportDefaultTemplateProvider _defaultTemplateProvider;

        /// <summary>
        /// Language key generator
        /// </summary>
        protected readonly IScribanLanguageKeyGenerator _languageKeyGenerator;

        /// <summary>
        /// Localizer Factory
        /// </summary>
        protected readonly IStringLocalizerFactory _localizerFactory;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="templatePlaceholderResolver">Template placeholder resolver</param>
        /// <param name="exportCachedDbAccess">Export cached database access</param>
        /// <param name="defaultTemplateProvider">Default template provider</param>
        /// <param name="languageKeyGenerator">Language key generator</param>
        /// <param name="localizerFactory">Localizer Factory</param>

        public BaseFlexFieldValueCollector(IExportTemplatePlaceholderResolver templatePlaceholderResolver, IExportCachedDbAccess exportCachedDbAccess, ICachedExportDefaultTemplateProvider defaultTemplateProvider, 
                                           IScribanLanguageKeyGenerator languageKeyGenerator, IStringLocalizerFactory localizerFactory)
        {
            _templatePlaceholderResolver = templatePlaceholderResolver;
            _exportCachedDbAccess = exportCachedDbAccess;
            _defaultTemplateProvider = defaultTemplateProvider;
            _languageKeyGenerator = languageKeyGenerator;
            _localizerFactory = localizerFactory;
        }

        /// <summary>
        /// Returns the object key for the object
        /// </summary>
        /// <returns>Object</returns>
        public abstract string GetObjectKey();

        /// <summary>
        /// Returns the template type
        /// </summary>
        /// <returns>Template type</returns>
        public abstract TemplateType GetTemplateType();

        /// <summary>
        /// Sets additional export object values
        /// </summary>
        /// <param name="exportObject">Export object</param>
        /// <param name="inputObject">Input object</param>
        protected virtual void SetAdditionalExportValues(ExportClass exportObject, InputObject inputObject) {}

        /// <summary>
        /// Returns true if the value collector is valid for a given template type
        /// </summary>
        /// <param name="templateType">Template type</param>
        /// <returns>True if the value collector is valid, else false</returns>
        public override bool IsValidForTemplateType(TemplateType templateType)
        {
            return templateType == GetTemplateType();
        }

        /// <summary>
        /// Collects the values for an export
        /// </summary>
        /// <param name="templateType">Template type</param>
        /// <param name="parsedTemplate">Parsed scriban template</param>
        /// <param name="scriptObject">Scriban script object to fill</param>
        /// <param name="data">Export Data</param>
        /// <returns>Task</returns>
        public override async Task CollectValues(TemplateType templateType, Template parsedTemplate, ScriptObject scriptObject, ExportObjectData data)
        {
            InputObject inputObject = data.ExportData[ExportConstants.ExportDataObject] as InputObject;
            if(inputObject == null)
            {
                return;
            }

            _languageKeyGenerator.SetErrorCollection(_errorCollection);
            

            GoNorthProject project = await _exportCachedDbAccess.GetUserProject();
            ExportSettings exportSettings = await _exportCachedDbAccess.GetExportSettings(project.Id);

            ExportClass exportObject = BuildExportObject(parsedTemplate, inputObject, exportSettings);

            scriptObject.Add(GetObjectKey(), exportObject);
            scriptObject.Add(ExportConstants.ScribanLanguageKeyName, _languageKeyGenerator);
            scriptObject.Add(FlexFieldAttributeListRenderer.AttributeListFunctionName, new FlexFieldAttributeListRenderer(_templatePlaceholderResolver, _exportCachedDbAccess, _defaultTemplateProvider, _errorCollection, data));
            AddAdditionalScriptObjectValues(templateType, parsedTemplate, scriptObject, data);
        }

        /// <summary>
        /// Adds additional script object values
        /// </summary>
        /// <param name="templateType">Template type</param>
        /// <param name="parsedTemplate">Parsed scriban template</param>
        /// <param name="scriptObject">Scriban script object to fill</param>
        /// <param name="data">Export Data</param>
        protected virtual void AddAdditionalScriptObjectValues(TemplateType templateType, Template parsedTemplate, ScriptObject scriptObject, ExportObjectData data)
        {
        }

        /// <summary>
        /// Builds an export object from an input object
        /// </summary>
        /// <param name="parsedTemplate">Parsed scriban template</param>
        /// <param name="inputObject">Input object</param>
        /// <param name="exportSettings">Export settings</param>
        /// <returns>Export object</returns>
        private ExportClass BuildExportObject(Template parsedTemplate, InputObject inputObject, ExportSettings exportSettings)
        {
            ExportClass exportObject = FlexFieldValueCollectorUtil.BuildFlexFieldValueObject<ExportClass>(GetObjectKey(), parsedTemplate, inputObject, exportSettings, _errorCollection);
            SetAdditionalExportValues(exportObject, inputObject);

            return exportObject;
        }

        /// <summary>
        /// Returns the Export Template Placeholders for a Template Type
        /// </summary>
        /// <param name="templateType">Template Type</param>
        /// <returns>Export Template Placeholder</returns>
        public override List<ExportTemplatePlaceholder> GetExportTemplatePlaceholdersForType(TemplateType templateType)
        {
            List<ExportTemplatePlaceholder> exportPlaceholders = new List<ExportTemplatePlaceholder>();
            if(templateType != GetTemplateType())
            {
                return exportPlaceholders;
            }

            exportPlaceholders.AddRange(_languageKeyGenerator.GetExportTemplatePlaceholders(string.Format("{0}.name | field.value", GetObjectKey())));
            exportPlaceholders.AddRange(FlexFieldAttributeListRenderer.GetPlaceholders(_localizerFactory));
            exportPlaceholders.AddRange(ScribanPlaceholderGenerator.GetPlaceholdersForObject<ExportClass>(_localizerFactory, GetObjectKey()));
            exportPlaceholders.AddRange(GetAdditionalPlaceholders());

            return exportPlaceholders;
        }

        /// <summary>
        /// Returns a list of additional placeholders
        /// </summary>
        /// <returns>List of additional placeholders</returns>
        protected virtual List<ExportTemplatePlaceholder> GetAdditionalPlaceholders() 
        { 
            return new List<ExportTemplatePlaceholder>(); 
        }
    }
}