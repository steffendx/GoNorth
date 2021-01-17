using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Data.FlexFieldDatabase;
using GoNorth.Data.Project;
using GoNorth.Extensions;
using GoNorth.Services.Export.Data;
using GoNorth.Services.Export.ExportSnippets;
using GoNorth.Services.Export.LanguageKeyGeneration;
using GoNorth.Services.Export.NodeGraphExport;
using Microsoft.Extensions.Localization;

namespace GoNorth.Services.Export.Placeholder.LegacyRenderingEngine
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
        /// Placeholder for function name
        /// </summary>
        private const string Placeholder_FunctionName = "ExportSnippet_ScriptFunctionName";

        /// <summary>
        /// Placeholder for the parent preview of a placeholder
        /// </summary>
        private const string Placeholder_Function_ParentPreview = "ExportSnippet_Function_ParentPreview";

        /// <summary>
        /// Content of the function
        /// </summary>
        private const string Placeholder_FunctionContent = "ExportSnippet_ScriptContent";


        /// <summary>
        /// Export snippet function renderer
        /// </summary>
        private readonly IExportSnippetFunctionRenderer _snippetFunctionRenderer;

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
        /// Template placeholder resolver
        /// </summary>
        private IExportTemplatePlaceholderResolver _templatePlaceholderResolver;

        /// <summary>
        /// All node graphs that were rendered so far
        /// </summary>
        private Dictionary<string, ExportNodeGraphRenderResult> _renderedNodeGraphs;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="snippetFunctionRenderer">Snippet function renderer</param>
        /// <param name="defaultTemplateProvider">Default Template Provider</param>
        /// <param name="cachedDbAccess">Cached Db Access</param>
        /// <param name="languageKeyGenerator">Language Key Generator</param>
        /// <param name="localizerFactory">Localizer Factory</param>
        public ExportSnippetTemplatePlaceholderResolver(IExportSnippetFunctionRenderer snippetFunctionRenderer, ICachedExportDefaultTemplateProvider defaultTemplateProvider, IExportCachedDbAccess cachedDbAccess, 
                                                        ILanguageKeyGenerator languageKeyGenerator, IStringLocalizerFactory localizerFactory) : 
                                                        base(localizerFactory.Create(typeof(ExportSnippetTemplatePlaceholderResolver)))
        {
            _snippetFunctionRenderer = snippetFunctionRenderer;
            _defaultTemplateProvider = defaultTemplateProvider;
            _cachedDbAccess = cachedDbAccess;
            _languageKeyGenerator = languageKeyGenerator;
            _renderedNodeGraphs = new Dictionary<string, ExportNodeGraphRenderResult>();
        }

        /// <summary>
        /// Sets the export template placeholder resolver
        /// </summary>
        /// <param name="placeholderResolver">Placeholder Resolver</param>
        public void SetExportTemplatePlaceholderResolver(IExportTemplatePlaceholderResolver placeholderResolver)
        {
            _templatePlaceholderResolver = placeholderResolver;
            _snippetFunctionRenderer.SetExportTemplatePlaceholderResolver(placeholderResolver);
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

            if(data.ExportData[ExportConstants.ExportDataObject] is IExportSnippetExportable)
            {
                // Replace Export Snippet Placeholders       
                IExportSnippetExportable exportObject = (IExportSnippetExportable)data.ExportData[ExportConstants.ExportDataObject];
                FlexFieldObject flexFieldObject = data.ExportData[ExportConstants.ExportDataObject] as FlexFieldObject;
                return await FillExportSnippetPlaceholders(code, exportObject, flexFieldObject);
            }
            else if(data.ExportData[ExportConstants.ExportDataObject] is ExportSnippetFunction)
            {
                ExportSnippetFunction exportFunction = (ExportSnippetFunction)data.ExportData[ExportConstants.ExportDataObject];
                return FillFunctionPlaceholders(code, exportFunction);
            }

            return code;
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
            Dictionary<string, List<ExportSnippetFunction>> renderedFunctions = new Dictionary<string, List<ExportSnippetFunction>>();
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

            code = await ExportUtil.BuildPlaceholderRegex(ExportConstants.ExportSnippetRegex, ExportConstants.ListIndentPrefix).ReplaceAsync(code, async (m) =>
            {
                string snippetName = m.Groups[2].Value;
                snippetName = snippetName.ToLowerInvariant();

                if (!usedExportSnippets.Contains(snippetName))
                {
                    usedExportSnippets.Add(snippetName);
                }

                return await ExportCodeSnippetContent(renderedFunctions, exportSnippets.FirstOrDefault(e => e.SnippetName.ToLowerInvariant() == snippetName), flexFieldObject, m.Groups[1].Value);
            });

            code = await ExportUtil.RenderPlaceholderIfFuncTrueAsync(code, Placeholder_ExportSnippet_HasCodeSnippet_Additional_Functions_Start, Placeholder_ExportSnippet_HasCodeSnippet_Additional_Functions_End, async (m) =>
            {
                string snippetName = m.Groups[1].Value;
                snippetName = snippetName.ToLowerInvariant();

                return await HasCodeSnippetAdditionalFunctions(renderedFunctions, exportSnippets.FirstOrDefault(e => e.SnippetName.ToLowerInvariant() == snippetName), flexFieldObject);
            });
            code = await ExportUtil.RenderPlaceholderIfFuncTrueAsync(code, Placeholder_ExportSnippet_HasCodeSnippet_NoAdditional_Functions_Start, Placeholder_ExportSnippet_HasCodeSnippet_NoAdditional_Functions_End, async (m) =>
            {
                string snippetName = m.Groups[1].Value;
                snippetName = snippetName.ToLowerInvariant();

                return !(await HasCodeSnippetAdditionalFunctions(renderedFunctions, exportSnippets.FirstOrDefault(e => e.SnippetName.ToLowerInvariant() == snippetName), flexFieldObject));
            });
            code = await ExportUtil.BuildPlaceholderRegex(Placeholder_ExportSnippet_AdditionalFuntions, ExportConstants.ListIndentPrefix).ReplaceAsync(code, async (m) =>
            {
                string snippetName = m.Groups[2].Value;
                snippetName = snippetName.ToLowerInvariant();

                return await ExportCodeSnippetAdditionalFunctions(renderedFunctions, exportSnippets.FirstOrDefault(e => e.SnippetName.ToLowerInvariant() == snippetName), flexFieldObject, m.Groups[1].Value);
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
        /// Renders the function for an export snippet
        /// </summary>
        /// <param name="renderedFunctions">Rendered function cache</param>
        /// <param name="objectExportSnippet">Export snippet to render</param>
        /// <param name="flexFieldObject">Flex field object to which the snippets belong</param>
        /// <returns>Rendered function</returns>
        private async Task<List<ExportSnippetFunction>> RenderFunctions(Dictionary<string, List<ExportSnippetFunction>> renderedFunctions, ObjectExportSnippet objectExportSnippet, FlexFieldObject flexFieldObject)
        {
            if(renderedFunctions.ContainsKey(objectExportSnippet.SnippetName))
            {
                return renderedFunctions[objectExportSnippet.SnippetName];
            }

            _snippetFunctionRenderer.SetErrorCollection(_errorCollection);

            List<ExportSnippetFunction> functions = await _snippetFunctionRenderer.RenderExportSnippetFunctions(objectExportSnippet, flexFieldObject);
            renderedFunctions.Add(objectExportSnippet.SnippetName, functions);

            return functions;
        }

        /// <summary>
        /// Exports the code snippet content
        /// </summary>
        /// <param name="renderedFunctions">Rendered function cache</param>
        /// <param name="objectExportSnippet">Object export snippet to export</param>
        /// <param name="flexFieldObject">Flex field object</param>
        /// <param name="listIndent">Indent of the code</param>
        /// <returns>Result of the snippet render</returns>
        private async Task<string> ExportCodeSnippetContent(Dictionary<string, List<ExportSnippetFunction>> renderedFunctions, ObjectExportSnippet objectExportSnippet, FlexFieldObject flexFieldObject, string listIndent)
        {
            if(objectExportSnippet == null)
            {
                return string.Empty;
            }

            List<ExportSnippetFunction> functions = await RenderFunctions(renderedFunctions, objectExportSnippet, flexFieldObject);
            if(!functions.Any())
            {
                return string.Empty;
            }

            return ExportUtil.IndentListTemplate(functions.First().Code, listIndent);
        }

        /// <summary>
        /// Exports the code snippet additional functions
        /// </summary>
        /// <param name="renderedFunctions">Rendered function cache</param>
        /// <param name="objectExportSnippet">Object export snippet to export</param>
        /// <param name="flexFieldObject">Flex field object</param>
        /// <param name="listIndent">Indent of the code</param>
        /// <returns>Result of the snippet render</returns>
        private async Task<string> ExportCodeSnippetAdditionalFunctions(Dictionary<string, List<ExportSnippetFunction>> renderedFunctions, ObjectExportSnippet objectExportSnippet, FlexFieldObject flexFieldObject, string listIndent)
        {
            if(objectExportSnippet == null)
            {
                return string.Empty;
            }
            
            GoNorthProject project = await _cachedDbAccess.GetUserProject();
            ExportTemplate functionContentTemplate = await _defaultTemplateProvider.GetDefaultTemplateByType(project.Id, TemplateType.ObjectExportSnippetFunction);
            List<ExportSnippetFunction> functions = await RenderFunctions(renderedFunctions, objectExportSnippet, flexFieldObject);
            List<ExportSnippetFunction> additionalFunctions = functions.Skip(1).ToList();

            string functionList = string.Empty;
            foreach(ExportSnippetFunction curFunction in additionalFunctions)
            {
                functionList += await RenderExportSnippetFunction(functionContentTemplate, curFunction);
            }        

            return ExportUtil.IndentListTemplate(functionList, listIndent);
        }

        /// <summary>
        /// Renders an export snippet function
        /// </summary>
        /// <param name="functionTemplate">Function template</param>
        /// <param name="function"></param>
        /// <returns></returns>
        private async Task<string> RenderExportSnippetFunction(ExportTemplate functionTemplate, ExportSnippetFunction function)
        {
            ExportObjectData objectData = new ExportObjectData();
            objectData.ExportData.Add(ExportConstants.ExportDataObject, function);

            ExportPlaceholderFillResult fillResult = await _templatePlaceholderResolver.FillPlaceholders(TemplateType.ObjectExportSnippetFunction, functionTemplate.Code, objectData, functionTemplate.RenderingEngine);
            _errorCollection.Merge(fillResult.Errors);

            return fillResult.Code;
        }

        /// <summary>
        /// Fills the function placeholders
        /// </summary>
        /// <param name="code">Code to fill</param>
        /// <param name="snippetFunction">Snippet function to render</param>
        /// <returns>Filled function</returns>
        private string FillFunctionPlaceholders(string code, ExportSnippetFunction snippetFunction)
        {
            string functionContentCode = ExportUtil.BuildPlaceholderRegex(Placeholder_FunctionName).Replace(code, snippetFunction.FunctionName);
            functionContentCode = ExportUtil.BuildPlaceholderRegex(Placeholder_Function_ParentPreview).Replace(functionContentCode, snippetFunction.ParentPreviewText);
            functionContentCode = ExportUtil.BuildPlaceholderRegex(Placeholder_FunctionContent, ExportConstants.ListIndentPrefix).Replace(functionContentCode, m =>
            {
                return ExportUtil.TrimEmptyLines(ExportUtil.IndentListTemplate(snippetFunction.Code, m.Groups[1].Value));
            });

            return functionContentCode;
        }


        /// <summary>
        /// Returns true if an object export snippet has additional functions
        /// </summary>
        /// <param name="renderedFunctions">Rendered function cache</param>
        /// <param name="objectExportSnippet">Object export snippet to export</param>
        /// <param name="flexFieldObject">Flex field object</param>
        /// <returns>true if the snippet has additioanl functions</returns>
        private async Task<bool> HasCodeSnippetAdditionalFunctions(Dictionary<string, List<ExportSnippetFunction>> renderedFunctions, ObjectExportSnippet objectExportSnippet, FlexFieldObject flexFieldObject)
        {
            if(objectExportSnippet == null)
            {
                return false;
            }

            List<ExportSnippetFunction> functions = await RenderFunctions(renderedFunctions, objectExportSnippet, flexFieldObject);
            return functions.Count > 1;
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
                return new List<ExportTemplatePlaceholder> {
                    ExportUtil.CreatePlaceHolder(Placeholder_FunctionName, _localizer),
                    ExportUtil.CreatePlaceHolder(Placeholder_Function_ParentPreview, _localizer),
                    ExportUtil.CreatePlaceHolder(Placeholder_FunctionContent, _localizer),
                };
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