using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Data.FlexFieldDatabase;
using GoNorth.Services.Export.Data;
using GoNorth.Services.Export.LanguageKeyGeneration;
using GoNorth.Services.Export.NodeGraphExport;
using Microsoft.Extensions.Localization;

namespace GoNorth.Services.Export.Placeholder
{
    /// <summary>
    /// Export Snippet Template Placeholder Resolver
    /// </summary>
    public class ExportSnippetTemplatePlaceholderResolver : BaseExportPlaceholderResolver, IExportTemplateTopicPlaceholderResolver
    {
        /// <summary>
        /// Friendly name for the placeholder of the content of a placeholder
        /// </summary>
        public const string Placeholder_ExportSnippet_FriendlyName = "CodeSnippet_NAME_OF_SNIPPET";

        /// <summary>
        /// Placeholder of the content of a placeholder
        /// </summary>
        public const string Placeholder_ExportSnippet_AdditionalFuntions = "CodeSnippetAdditionalFunctions_(.*)";

        /// <summary>
        /// Friendly name for the placeholder of the content of additional functions of a placeholder
        /// </summary>
        public const string Placeholder_ExportSnippe_AdditionalFuntions_FriendlyName = "CodeSnippetAdditionalFunctions_NAME_OF_SNIPPET";

        /// <summary>
        /// Placeholder for the start of the content that will only be rendered if a code snippet has additional functions
        /// </summary>
        public const string Placeholder_ExportSnippet_HasCodeSnippet_Additional_Functions_Start = "Has_CodeSnippetAdditionalFunctions_(.*)_Start";

        /// <summary>
        /// Friendly Name of the Placeholder for the start of the content that will only be rendered if a code snippet has additional functions
        /// </summary>
        public const string Placeholder_ExportSnippet_HasCodeSnippet_Additional_Functions_Start_FriendlyName = "Has_CodeSnippetAdditionalFunctions_NAME_OF_SNIPPET_Start";

        /// <summary>
        /// Placeholder for the end of the content that will only be rendered if a code snippet has additional functions
        /// </summary>
        public const string Placeholder_ExportSnippet_HasCodeSnippet_Additional_Functions_End = "Has_CodeSnippetAdditionalFunctions_End";

        /// <summary>
        /// Placeholder for the start of the content that will only be rendered if a code snippet has no additional functions
        /// </summary>
        public const string Placeholder_ExportSnippet_HasCodeSnippet_NoAdditional_Functions_Start = "Has_CodeSnippetNoAdditionalFunctions_(.*)_Start";

        /// <summary>
        /// Friendly Name of the Placeholder for the start of the content that will only be rendered if a code snippet has no additional functions
        /// </summary>
        public const string Placeholder_ExportSnippet_HasCodeSnippet_NoAdditional_Functions_Start_FriendlyName = "Has_CodeSnippetNoAdditionalFunctions_NAME_OF_SNIPPET_Start";

        /// <summary>
        /// Placeholder for the end of the content that will only be rendered if a code snippet has no additional functions
        /// </summary>
        public const string Placeholder_ExportSnippet_HasCodeSnippet_NoAdditional_Functions_End = "Has_CodeSnippetNoAdditionalFunctions_End";

        /// <summary>
        /// Start of the content that will only be rendered if a certain code snippet exists
        /// </summary>
        private const string Placeholder_HasCodeSnippet_Start = "HasCodeSnippet_(.*)_Start";

        /// <summary>
        /// Friendlyname of the start of the content that will only be rendered if a certain code snippet exists
        /// </summary>
        private const string Placeholder_HasCodeSnippet_Start_FriendlyName = "HasCodeSnippet_NAME_OF_SNIPPET_Start";

        /// <summary>
        /// End of the content that will only be rendered if a certain code snippet exists
        /// </summary>
        private const string Placeholder_HasCodeSnippet_End = "HasCodeSnippet_End";

        /// <summary>
        /// Start of the content that will only be rendered if a certain code snippet does not exists
        /// </summary>
        private const string Placeholder_HasNotCodeSnippet_Start = "HasNotCodeSnippet_(.*)_Start";

        /// <summary>
        /// Friendlyname of the start of the content that will only be rendered if a certain code snippet does not exists
        /// </summary>
        private const string Placeholder_HasNotCodeSnippet_Start_FriendlyName = "HasNotCodeSnippet_NAME_OF_SNIPPET_Start";

        /// <summary>
        /// End of the content that will only be rendered if a certain code snippet does not exists
        /// </summary>
        private const string Placeholder_HasNotCodeSnippet_End = "HasNotCodeSnippet_End";

        /// <summary>
        /// Start of the content that will only be rendered if any code snippet exists
        /// </summary>
        private const string Placeholder_HasAnyCodeSnippet_Start = "HasAnyCodeSnippet_Start";

        /// <summary>
        /// End of the content that will only be rendered if any code snippet exists
        /// </summary>
        private const string Placeholder_HasAnyCodeSnippet_End = "HasAnyCodeSnippet_End";
        
        /// <summary>
        /// Start of the content that will only be rendered if not any code snippet exists
        /// </summary>
        private const string Placeholder_HasNotAnyCodeSnippet_Start = "HasNotAnyCodeSnippet_Start";

        /// <summary>
        /// End of the content that will only be rendered if not any code snippet exists
        /// </summary>
        private const string Placeholder_HasNotAnyCodeSnippet_End = "HasNotAnyCodeSnippet_End";


        /// <summary>
        /// Node Graph Exporter
        /// </summary>
        private readonly INodeGraphExporter _nodeGraphExporter;

        /// <summary>
        /// Export Snippet Function name generator
        /// </summary>
        private readonly IExportSnippetNodeGraphFunctionGenerator _exportSnippetNodeGraphGenerator;

        /// <summary>
        /// Export Snippet Node Graph Renderer
        /// </summary>
        private readonly IExportSnippetNodeGraphRenderer _nodeGraphRenderer;

        /// <summary>
        /// Export default template provider
        /// </summary>
        private readonly ICachedExportDefaultTemplateProvider _defaultTemplateProvider;

        /// <summary>
        /// Export Cached Db Access
        /// </summary>
        private readonly IExportCachedDbAccess _cachedDbAccess;

        /// <summary>
        /// Language Key Generator
        /// </summary>
        private readonly ILanguageKeyGenerator _languageKeyGenerator;
        
        /// <summary>
        /// All node graphs that were rendered so far
        /// </summary>
        private Dictionary<string, ExportNodeGraphRenderResult> _renderedNodeGraphs;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="nodeGraphExporter">Node Graph Exporter</param>
        /// <param name="exportSnippetFunctionNameGenerator">Export Snippet node graph function name generator</param>
        /// <param name="nodeGraphRenderer">Node Graph Renderer</param>
        /// <param name="defaultTemplateProvider">Default Template Provider</param>
        /// <param name="cachedDbAccess">Cached Db Access</param>
        /// <param name="languageKeyGenerator">Language Key Generator</param>
        /// <param name="localizerFactory">Localizer Factory</param>
        public ExportSnippetTemplatePlaceholderResolver(INodeGraphExporter nodeGraphExporter, IExportSnippetNodeGraphFunctionGenerator exportSnippetFunctionNameGenerator, IExportSnippetNodeGraphRenderer nodeGraphRenderer,
                                                        ICachedExportDefaultTemplateProvider defaultTemplateProvider, IExportCachedDbAccess cachedDbAccess, ILanguageKeyGenerator languageKeyGenerator, 
                                                        IStringLocalizerFactory localizerFactory) 
                                                        : base(localizerFactory.Create(typeof(ExportSnippetTemplatePlaceholderResolver)))
        {
            _nodeGraphExporter = nodeGraphExporter;
            _exportSnippetNodeGraphGenerator = exportSnippetFunctionNameGenerator;
            _nodeGraphRenderer = nodeGraphRenderer;
            _defaultTemplateProvider = defaultTemplateProvider;
            _cachedDbAccess = cachedDbAccess;
            _languageKeyGenerator = languageKeyGenerator;
            _renderedNodeGraphs = new Dictionary<string, ExportNodeGraphRenderResult>();
        }

        /// <summary>
        /// Fills the placeholders of a code
        /// </summary>
        /// <param name="code">Code to fill</param>
        /// <param name="data">Export Data</param>
        /// <returns>Filled Code</returns>
        public async Task<string> FillPlaceholders(string code, ExportObjectData data)
        {
            // Check Data
            if(!data.ExportData.ContainsKey(ExportConstants.ExportDataObject))
            {
                return code;
            }

            IExportSnippetExportable exportObject = data.ExportData[ExportConstants.ExportDataObject] as IExportSnippetExportable; 
            if(exportObject == null)
            {
                return code;
            }

            // Replace Export Snippet Placeholders       
            FlexFieldObject flexFieldObject = data.ExportData[ExportConstants.ExportDataObject] as FlexFieldObject;
            return await FillExportSnippetPlaceholders(code, exportObject, flexFieldObject);
        }

        /// <summary>
        /// Fills the export snippet placeholders
        /// </summary>
        /// <param name="code">Code to fill</param>
        /// <param name="exportObject">Export object</param>
        /// <param name="flexFieldObject">Flex field object</param>
        /// <returns>Updated code</returns>
        private async Task<string> FillExportSnippetPlaceholders(string code, IExportSnippetExportable exportObject, FlexFieldObject flexFieldObject)
        {
            HashSet<string> usedExportSnippets = new HashSet<string>();
            List<ObjectExportSnippet> exportSnippets = await _cachedDbAccess.GetObjectExportSnippetsByObject(exportObject.Id);

            code = ExportUtil.RenderPlaceholderIfTrue(code, Placeholder_HasAnyCodeSnippet_Start, Placeholder_HasAnyCodeSnippet_End, exportSnippets.Count > 0);
            code = ExportUtil.RenderPlaceholderIfTrue(code, Placeholder_HasNotAnyCodeSnippet_Start, Placeholder_HasNotAnyCodeSnippet_End, exportSnippets.Count == 0);
            code = ExportUtil.RenderPlaceholderIfFuncTrue(code, Placeholder_HasCodeSnippet_Start, Placeholder_HasCodeSnippet_End, (m) =>
            {
                string snippetName = m.Groups[1].Value;
                snippetName = snippetName.ToLowerInvariant();

                return exportSnippets.Any(e => e.SnippetName.ToLowerInvariant() == snippetName);
            });
            code = ExportUtil.RenderPlaceholderIfFuncTrue(code, Placeholder_HasNotCodeSnippet_Start, Placeholder_HasNotCodeSnippet_End, (m) =>
            {
                string snippetName = m.Groups[1].Value;
                snippetName = snippetName.ToLowerInvariant();

                return !exportSnippets.Any(e => e.SnippetName.ToLowerInvariant() == snippetName);
            });

            code = ExportUtil.BuildPlaceholderRegex(ExportConstants.ExportSnippetRegex, ExportConstants.ListIndentPrefix).Replace(code, (m) =>
            {
                string snippetName = m.Groups[2].Value;
                snippetName = snippetName.ToLowerInvariant();

                if (!usedExportSnippets.Contains(snippetName))
                {
                    usedExportSnippets.Add(snippetName);
                }

                return ExportCodeSnippetContent(exportSnippets.FirstOrDefault(e => e.SnippetName.ToLowerInvariant() == snippetName), flexFieldObject, m.Groups[1].Value);
            });

            code = ExportUtil.RenderPlaceholderIfFuncTrue(code, Placeholder_ExportSnippet_HasCodeSnippet_Additional_Functions_Start, Placeholder_ExportSnippet_HasCodeSnippet_Additional_Functions_End, (m) =>
            {
                string snippetName = m.Groups[1].Value;
                snippetName = snippetName.ToLowerInvariant();

                return HasCodeSnippetAdditionalFunctions(exportSnippets.FirstOrDefault(e => e.SnippetName.ToLowerInvariant() == snippetName), flexFieldObject);
            });
            code = ExportUtil.RenderPlaceholderIfFuncTrue(code, Placeholder_ExportSnippet_HasCodeSnippet_NoAdditional_Functions_Start, Placeholder_ExportSnippet_HasCodeSnippet_NoAdditional_Functions_End, (m) =>
            {
                string snippetName = m.Groups[1].Value;
                snippetName = snippetName.ToLowerInvariant();

                return !HasCodeSnippetAdditionalFunctions(exportSnippets.FirstOrDefault(e => e.SnippetName.ToLowerInvariant() == snippetName), flexFieldObject);
            });
            code = ExportUtil.RenderPlaceholderIfFuncTrue(code, Placeholder_ExportSnippet_HasCodeSnippet_NoAdditional_Functions_Start, Placeholder_ExportSnippet_HasCodeSnippet_NoAdditional_Functions_End, (m) =>
            {
                string snippetName = m.Groups[1].Value;
                snippetName = snippetName.ToLowerInvariant();

                return HasCodeSnippetAdditionalFunctions(exportSnippets.FirstOrDefault(e => e.SnippetName.ToLowerInvariant() == snippetName), flexFieldObject);
            });
            code = ExportUtil.BuildPlaceholderRegex(Placeholder_ExportSnippet_AdditionalFuntions, ExportConstants.ListIndentPrefix).Replace(code, (m) =>
            {
                string snippetName = m.Groups[2].Value;
                snippetName = snippetName.ToLowerInvariant();

                return ExportCodeSnippetAdditionalFunctions(exportSnippets.FirstOrDefault(e => e.SnippetName.ToLowerInvariant() == snippetName), flexFieldObject, m.Groups[1].Value);
            });

            ValidateAllExportSnippetsUsed(usedExportSnippets, exportSnippets);

            return code;
        }

        /// <summary>
        /// validates that all export snippets were used
        /// </summary>
        /// <param name="usedExportSnippets">Export snippets that were used</param>
        /// <param name="exportSnippets">Export snippets</param>
        private void ValidateAllExportSnippetsUsed(HashSet<string> usedExportSnippets, List<ObjectExportSnippet> exportSnippets)
        {
            foreach (ObjectExportSnippet curSnippet in exportSnippets)
            {
                if (!usedExportSnippets.Contains(curSnippet.SnippetName.ToLowerInvariant()))
                {
                    try
                    {
                        _errorCollection.CurrentErrorContext = _localizer["ExportSnippetErrorContext", curSnippet.SnippetName].Value;
                        _errorCollection.AddExportSnippetMissingPlaceholder();
                    }
                    finally
                    {
                        _errorCollection.CurrentErrorContext = string.Empty;
                    }
                }
            }
        }

        /// <summary>
        /// Exports the code snippet content
        /// </summary>
        /// <param name="objectExportSnippet">Object export snippet to export</param>
        /// <param name="flexFieldObject">Flex field object</param>
        /// <param name="listIndent">Indent of the code</param>
        /// <returns>Result of the snippet render</returns>
        private string ExportCodeSnippetContent(ObjectExportSnippet objectExportSnippet, FlexFieldObject flexFieldObject, string listIndent)
        {
            if(objectExportSnippet == null)
            {
                return string.Empty;
            }

            if(objectExportSnippet.ScriptType == ExportConstants.ScriptType_NodeGraph)
            {
                return ExportUtil.IndentListTemplate(this.RenderNodeGraph(objectExportSnippet, flexFieldObject).StartStepCode, listIndent);
            }
            else if(objectExportSnippet.ScriptType == ExportConstants.ScriptType_Code)
            {
                return ExportUtil.IndentListTemplate(objectExportSnippet.ScriptCode != null ? objectExportSnippet.ScriptCode : string.Empty, listIndent);
            }

            return string.Empty;
        }

        /// <summary>
        /// Exports the code snippet additional functions
        /// </summary>
        /// <param name="objectExportSnippet">Object export snippet to export</param>
        /// <param name="flexFieldObject">Flex field object</param>
        /// <param name="listIndent">Indent of the code</param>
        /// <returns>Result of the snippet render</returns>
        private string ExportCodeSnippetAdditionalFunctions(ObjectExportSnippet objectExportSnippet, FlexFieldObject flexFieldObject, string listIndent)
        {
            if(objectExportSnippet == null)
            {
                return string.Empty;
            }

            if(objectExportSnippet.ScriptType == ExportConstants.ScriptType_NodeGraph)
            {
                return ExportUtil.IndentListTemplate(this.RenderNodeGraph(objectExportSnippet, flexFieldObject).AdditionalFunctionsCode, listIndent);
            }

            return string.Empty;
        }


        /// <summary>
        /// Returns true if an object export snippet has additional functions
        /// </summary>
        /// <param name="objectExportSnippet">Object export snippet to export</param>
        /// <param name="flexFieldObject">Flex field object</param>
        /// <returns>true if the snippet has additioanl functions</returns>
        private bool HasCodeSnippetAdditionalFunctions(ObjectExportSnippet objectExportSnippet, FlexFieldObject flexFieldObject)
        {
            if(objectExportSnippet == null)
            {
                return false;
            }

            if(objectExportSnippet.ScriptType == ExportConstants.ScriptType_NodeGraph)
            {
                return !string.IsNullOrWhiteSpace(this.RenderNodeGraph(objectExportSnippet, flexFieldObject).AdditionalFunctionsCode);
            }

            return false;
        }

        /// <summary>
        /// Renders a node graph system
        /// </summary>
        /// <param name="objectExportSnippet">Object export snippet</param>
        /// <param name="flexFieldObject">Flex field object</param>
        /// <returns>Node graph render result</returns>
        private ExportNodeGraphRenderResult RenderNodeGraph(ObjectExportSnippet objectExportSnippet, FlexFieldObject flexFieldObject)
        {
            if(objectExportSnippet == null || objectExportSnippet.ScriptNodeGraph == null)
            {
                return new ExportNodeGraphRenderResult();
            }

            if(_renderedNodeGraphs.ContainsKey(objectExportSnippet.Id))
            {
                return _renderedNodeGraphs[objectExportSnippet.Id];
            }

            ExportNodeGraphRenderResult renderResult;
            try
            {
                _errorCollection.CurrentErrorContext = _localizer["ExportSnippetErrorContext", objectExportSnippet.SnippetName].Value;
                _nodeGraphExporter.SetErrorCollection(_errorCollection);
                _nodeGraphExporter.SetNodeGraphFunctionGenerator(_exportSnippetNodeGraphGenerator);
                _nodeGraphExporter.SetNodeGraphRenderer(_nodeGraphRenderer);
                renderResult = _nodeGraphExporter.RenderNodeGraph(objectExportSnippet.ScriptNodeGraph, flexFieldObject).Result;
                _renderedNodeGraphs.Add(objectExportSnippet.Id, renderResult);
            }
            finally
            {
                _errorCollection.CurrentErrorContext = string.Empty;
            }
            return renderResult;
        }

        /// <summary>
        /// Returns if the placeholder resolver is valid for a template type
        /// </summary>
        /// <param name="templateType">Template Type</param>
        /// <returns>true if the template type is valid for the template type</returns>
        public bool IsValidForTemplateType(TemplateType templateType)
        {
            return templateType == TemplateType.ObjectNpc || templateType == TemplateType.ObjectItem || templateType == TemplateType.ObjectSkill || templateType == TemplateType.ObjectExportSnippetFunction;
        }

        /// <summary>
        /// Returns the Export Template Placeholders for a Template Type
        /// </summary>
        /// <param name="templateType">Template Type</param>
        /// <returns>Export Template Placeholder</returns>
        public List<ExportTemplatePlaceholder> GetExportTemplatePlaceholdersForType(TemplateType templateType)
        {
            if(templateType == TemplateType.ObjectExportSnippetFunction)
            {
                return _nodeGraphRenderer.GetExportTemplatePlaceholders();
            }

            List<ExportTemplatePlaceholder> exportPlaceholders = new List<ExportTemplatePlaceholder>();
            exportPlaceholders.AddRange(new List<ExportTemplatePlaceholder>() {
                CreatePlaceHolder(Placeholder_ExportSnippet_FriendlyName),
                CreatePlaceHolder(Placeholder_ExportSnippe_AdditionalFuntions_FriendlyName),
                CreatePlaceHolder(Placeholder_ExportSnippet_HasCodeSnippet_Additional_Functions_Start_FriendlyName),
                CreatePlaceHolder(Placeholder_ExportSnippet_HasCodeSnippet_Additional_Functions_End),
                CreatePlaceHolder(Placeholder_ExportSnippet_HasCodeSnippet_NoAdditional_Functions_Start_FriendlyName),
                CreatePlaceHolder(Placeholder_ExportSnippet_HasCodeSnippet_NoAdditional_Functions_End),
                CreatePlaceHolder(Placeholder_HasCodeSnippet_Start_FriendlyName),
                CreatePlaceHolder(Placeholder_HasCodeSnippet_End),
                CreatePlaceHolder(Placeholder_HasNotCodeSnippet_Start_FriendlyName),
                CreatePlaceHolder(Placeholder_HasNotCodeSnippet_End),
                CreatePlaceHolder(Placeholder_HasAnyCodeSnippet_Start),
                CreatePlaceHolder(Placeholder_HasAnyCodeSnippet_End),
                CreatePlaceHolder(Placeholder_HasNotAnyCodeSnippet_Start),
                CreatePlaceHolder(Placeholder_HasNotAnyCodeSnippet_End)
            });

            return exportPlaceholders;
        }
    }
}