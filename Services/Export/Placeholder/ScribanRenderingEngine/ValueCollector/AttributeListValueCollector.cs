using System.Collections.Generic;
using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Data.Project;
using GoNorth.Services.Export.Data;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.LanguageKeyGenerator;
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
    public class AttributeListValueCollector : BaseScribanValueCollector
    {
        /// <summary>
        /// Object key for the fields
        /// </summary>
        private const string ObjectKey = "fields";

        /// <summary>
        /// Object key for the current field
        /// </summary>
        private const string CurFieldKey = "cur_field";

        /// <summary>
        /// Cached Db Access
        /// </summary>
        private readonly IExportCachedDbAccess _cachedDbAccess;

        /// <summary>
        /// Language key generator
        /// </summary>
        private readonly IScribanLanguageKeyGenerator _languageKeyGenerator;

        /// <summary>
        /// Localizer Factory
        /// </summary>
        private readonly IStringLocalizerFactory _localizerFactory;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="cachedDbAccess">Cached Db Access</param>
        /// <param name="languageKeyGenerator">Language key generator</param>
        /// <param name="localizerFactory">Localizer Factory</param>
        public AttributeListValueCollector(IExportCachedDbAccess cachedDbAccess, IScribanLanguageKeyGenerator languageKeyGenerator, IStringLocalizerFactory localizerFactory)
        {
            _cachedDbAccess = cachedDbAccess;
            _languageKeyGenerator = languageKeyGenerator;
            _localizerFactory = localizerFactory;
        }

        /// <summary>
        /// Returns true if the value collector is valid for a given template type
        /// </summary>
        /// <param name="templateType">Template type</param>
        /// <returns>True if the value collector is valid, else false</returns>
        public override bool IsValidForTemplateType(TemplateType templateType)
        {
            return templateType == TemplateType.ObjectAttributeList;
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
            IFlexFieldExportable exportable = data.ExportData[ExportConstants.ExportDataObject] as IFlexFieldExportable;
            if(exportable == null)
            {
                return;
            }

            _languageKeyGenerator.SetErrorCollection(_errorCollection);
            
            GoNorthProject project = await _cachedDbAccess.GetUserProject();
            ExportSettings exportSettings = await _cachedDbAccess.GetExportSettings(project.Id);
            
            scriptObject.AddOrUpdate(ObjectKey, FlexFieldValueCollectorUtil.ExtractScribanFields(exportable, exportSettings, _errorCollection));
            scriptObject.AddOrUpdate(ExportConstants.ScribanLanguageKeyName, _languageKeyGenerator);
        }

        /// <summary>
        /// Returns the Export Template Placeholders for a Template Type
        /// </summary>
        /// <param name="templateType">Template Type</param>
        /// <returns>Export Template Placeholder</returns>
        public override List<ExportTemplatePlaceholder> GetExportTemplatePlaceholdersForType(TemplateType templateType)
        {
            List<ExportTemplatePlaceholder> exportPlaceholders = new List<ExportTemplatePlaceholder>();
            if(templateType != TemplateType.ObjectAttributeList)
            {
                return exportPlaceholders;
            }

            IStringLocalizer localizer = _localizerFactory.Create(typeof(AttributeListValueCollector));

            exportPlaceholders.AddRange(_languageKeyGenerator.GetExportTemplatePlaceholders("field.value"));
            exportPlaceholders.Add(new ExportTemplatePlaceholder(ObjectKey, localizer["PlaceholderDesc_Fields", CurFieldKey]));
            exportPlaceholders.AddRange(ScribanPlaceholderGenerator.GetPlaceholdersForObject<ScribanFlexFieldField>(_localizerFactory, CurFieldKey));

            return exportPlaceholders;
        }
    }
}