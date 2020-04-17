using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Data.FlexFieldDatabase;
using GoNorth.Services.Export.Data;
using GoNorth.Services.Export.ExportSnippets;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.RenderingFunctions;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.RenderingObjects;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.Util;
using Microsoft.Extensions.Localization;
using Scriban;
using Scriban.Runtime;

namespace GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.ValueCollector
{
    /// <summary>
    /// Class for export snippet Scriban value collectors
    /// </summary>
    public class ExportSnippetValueCollector : BaseScribanValueCollector
    {
        /// <summary>
        /// Object key used for snippet functions in the placeholder definition
        /// </summary>
        private const string SnippetFunctionObjectKey = "snippet_function";

        /// <summary>
        /// Template placeholder resolver
        /// </summary>
        private readonly IExportTemplatePlaceholderResolver _templatePlaceholderResolver;

        /// <summary>
        /// Export cached database access
        /// </summary>
        private readonly IExportCachedDbAccess _exportCachedDbAccess;

        /// <summary>
        /// Export snippet function renderer
        /// </summary>
        private readonly IExportSnippetFunctionRenderer _exportSnippetFunctionRenderer;

        /// <summary>
        /// Default template provider
        /// </summary>
        private readonly ICachedExportDefaultTemplateProvider _defaultTemplateProvider;

        /// <summary>
        /// Localizer Factory
        /// </summary>
        private readonly IStringLocalizerFactory _localizerFactory;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="templatePlaceholderResolver">Template placeholder resolver</param>
        /// <param name="exportCachedDbAccess">Export cached database access</param>
        /// <param name="exportSnippetFunctionRenderer">Export snippet function renderer</param>
        /// <param name="defaultTemplateProvider">Default template provider</param>
        /// <param name="localizerFactory">Localizer Factory</param>
        public ExportSnippetValueCollector(IExportTemplatePlaceholderResolver templatePlaceholderResolver, IExportCachedDbAccess exportCachedDbAccess, IExportSnippetFunctionRenderer exportSnippetFunctionRenderer, 
                                           ICachedExportDefaultTemplateProvider defaultTemplateProvider, IStringLocalizerFactory localizerFactory)
        {
            _templatePlaceholderResolver = templatePlaceholderResolver;
            _exportCachedDbAccess = exportCachedDbAccess;
            _exportSnippetFunctionRenderer = exportSnippetFunctionRenderer;
            _defaultTemplateProvider = defaultTemplateProvider;
            _localizerFactory = localizerFactory;
        }

        /// <summary>
        /// Returns true if the value collector is valid for a given template type
        /// </summary>
        /// <param name="templateType">Template type</param>
        /// <returns>True if the value collector is valid, else false</returns>
        public override bool IsValidForTemplateType(TemplateType templateType)
        {
            return templateType == TemplateType.ObjectNpc || templateType == TemplateType.ObjectItem || templateType == TemplateType.ObjectSkill;
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
            FlexFieldObject inputObject = data.ExportData[ExportConstants.ExportDataObject] as FlexFieldObject;
            if(inputObject == null)
            {
                return;
            }

            _exportSnippetFunctionRenderer.SetErrorCollection(_errorCollection);

            List<ObjectExportSnippet> exportSnippets = await _exportCachedDbAccess.GetObjectExportSnippetsByObject(inputObject.Id);
            Dictionary<string, ScribanExportSnippet> mappedSnippets = await MapExportSnippets(exportSnippets, inputObject);

            ScribanExportSnippetsData scribanExportSnippets = new ScribanExportSnippetsData();
            scribanExportSnippets.Snippets = new ScribanExportSnippetDictionary(mappedSnippets);
            scriptObject.Add(ExportConstants.ScribanExportSnippetsObjectKey, scribanExportSnippets);

            scriptObject.Add(ExportSnippetFunctionPipeRenderer.ExportSnippetFunctionName, new ExportSnippetFunctionPipeRenderer(_templatePlaceholderResolver, _exportCachedDbAccess, _defaultTemplateProvider, _errorCollection));
        }

        /// <summary>
        /// Maps a list of export snippets to a list of scriban snippets
        /// </summary>
        /// <param name="exportSnippets">Export snippets</param>
        /// <param name="inputObject">Input flex field object</param>
        /// <returns>List of export snippets</returns>
        private async Task<Dictionary<string, ScribanExportSnippet>> MapExportSnippets(List<ObjectExportSnippet> exportSnippets, FlexFieldObject inputObject)
        {
            Dictionary<string, ScribanExportSnippet> mappedSnippets = new Dictionary<string, ScribanExportSnippet>();

            foreach(ObjectExportSnippet curSnippet in exportSnippets)
            {
                List<ExportSnippetFunction> exportSnippetFunctions = await _exportSnippetFunctionRenderer.RenderExportSnippetFunctions(curSnippet, inputObject);

                ScribanExportSnippet exportSnippet = new ScribanExportSnippet();
                exportSnippet.Name = curSnippet.SnippetName;
                exportSnippet.Exists = true;
                exportSnippet.AllFunctions = exportSnippetFunctions.Select(e => new ScribanExportSnippetFunction(e)).ToList();
                exportSnippet.InitialFunction = exportSnippet.AllFunctions.FirstOrDefault();
                exportSnippet.AdditionalFunctions = exportSnippet.AllFunctions.Skip(1).ToList();

                mappedSnippets.Add(exportSnippet.Name, exportSnippet);
            }

            return mappedSnippets;
        }

        /// <summary>
        /// Returns the Export Template Placeholders for a Template Type
        /// </summary>
        /// <param name="templateType">Template Type</param>
        /// <returns>Export Template Placeholder</returns>
        public override List<ExportTemplatePlaceholder> GetExportTemplatePlaceholdersForType(TemplateType templateType)
        {
            List<ExportTemplatePlaceholder> exportPlaceholders = new List<ExportTemplatePlaceholder>();
            if(templateType != TemplateType.ObjectNpc && templateType != TemplateType.ObjectItem && templateType != TemplateType.ObjectSkill)
            {
                return exportPlaceholders;
            }

            exportPlaceholders.AddRange(ScribanPlaceholderGenerator.GetPlaceholdersForObject<ScribanExportSnippetsData>(_localizerFactory, ExportConstants.ScribanExportSnippetsObjectKey));
            exportPlaceholders.AddRange(ScribanPlaceholderGenerator.GetPlaceholdersForObject<ScribanExportSnippetFunction>(_localizerFactory, SnippetFunctionObjectKey));
            exportPlaceholders.AddRange(ExportSnippetFunctionPipeRenderer.GetPlaceholders(_localizerFactory));
            return exportPlaceholders;
        }
    }
}