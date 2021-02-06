using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Data.Tale;
using GoNorth.Extensions;
using GoNorth.Services.Export.DailyRoutine;
using GoNorth.Services.Export.Data;
using GoNorth.Services.Export.Dialog;
using GoNorth.Services.Export.ExportSnippets;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.Include;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.LanguageKeyGenerator;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.RenderingFunctions;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.Util;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.ValueCollector;
using GoNorth.Services.Export.StateMachines;
using Microsoft.Extensions.Localization;
using Scriban;
using Scriban.Runtime;

namespace GoNorth.Services.Export.Placeholder.ScribanRenderingEngine
{
    /// <summary>
    /// Scriban rendering class for export template placeholders
    /// </summary>
    public class ScribanExportTemplatePlaceholderRenderingEngine : IExportTemplatePlaceholderRenderingEngine
    {
        /// <summary>
        /// Export cached Db Access
        /// </summary>
        private readonly IExportCachedDbAccess _exportCachedDbAccess;

        /// <summary>
        /// Localizer Factory
        /// </summary>
        private readonly IStringLocalizerFactory _localizerFactory;

        /// <summary>
        /// Export value collectors
        /// </summary>
        private readonly List<IScribanExportValueCollector> _exportValueCollectors;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="exportTemplatePlaceholderResolver">Export template placeholder resolver</param>
        /// <param name="exportCachedDbAccess">Export cached database access</param>
        /// <param name="taleDbAccess">Dialog database access</param>
        /// <param name="defaultTemplateProvider">Default template provider</param>
        /// <param name="languageKeyGenerator">Language key generator</param>
        /// <param name="dialogParser">Dialog Parser</param>
        /// <param name="dialogFunctionGenerator">Dialog Function Generator</param>
        /// <param name="dialogRenderer">Dialog Renderer</param>
        /// <param name="dailyRoutineFunctionNameGenerator">Daily routine function name generator</param>
        /// <param name="dailyRoutineFunctionRenderer">Daily routine function renderer</param>
        /// <param name="exportSnippetFunctionRenderer">Export snippet function renderer</param>
        /// <param name="stateMachineFunctionNameGenerator">State machine function name generator</param>
        /// <param name="stateMachineFunctionRenderer">State machine function renderer</param>
        /// <param name="languageKeyDbAccess">Language key Database access</param>
        /// <param name="localizerFactory">Localizer Factory</param>
        public ScribanExportTemplatePlaceholderRenderingEngine(IExportTemplatePlaceholderResolver exportTemplatePlaceholderResolver, IExportCachedDbAccess exportCachedDbAccess, ITaleDbAccess taleDbAccess, 
                                                               ICachedExportDefaultTemplateProvider defaultTemplateProvider, IScribanLanguageKeyGenerator languageKeyGenerator, IExportDialogParser dialogParser,
                                                               IExportDialogFunctionGenerator dialogFunctionGenerator, IExportDialogRenderer dialogRenderer, IDailyRoutineFunctionNameGenerator dailyRoutineFunctionNameGenerator, 
                                                               IDailyRoutineFunctionRenderer dailyRoutineFunctionRenderer, IExportSnippetFunctionRenderer exportSnippetFunctionRenderer, 
                                                               IStateMachineFunctionNameGenerator stateMachineFunctionNameGenerator, IStateMachineFunctionRenderer stateMachineFunctionRenderer, ILanguageKeyDbAccess languageKeyDbAccess,
                                                               IStringLocalizerFactory localizerFactory)
        {
            _exportCachedDbAccess = exportCachedDbAccess;
            _localizerFactory = localizerFactory;

            _exportValueCollectors = new List<IScribanExportValueCollector> 
            {
                new NpcExportValueCollector(exportTemplatePlaceholderResolver, exportCachedDbAccess, defaultTemplateProvider, languageKeyGenerator, localizerFactory),
                new ItemExportValueCollector(exportTemplatePlaceholderResolver, exportCachedDbAccess, defaultTemplateProvider, languageKeyGenerator, localizerFactory),
                new SkillExportValueCollector(exportTemplatePlaceholderResolver, exportCachedDbAccess, defaultTemplateProvider, languageKeyGenerator, localizerFactory),
                new AttributeListValueCollector(exportCachedDbAccess, languageKeyGenerator, localizerFactory),
                new InventoryValueCollector(exportCachedDbAccess, languageKeyGenerator, localizerFactory),
                new NpcSkillValueCollector(exportCachedDbAccess, languageKeyGenerator, localizerFactory),
                new DialogValueCollector(exportTemplatePlaceholderResolver, exportCachedDbAccess, defaultTemplateProvider, taleDbAccess, languageKeyGenerator, dialogParser, dialogFunctionGenerator, dialogRenderer, localizerFactory),
                new DialogFunctionValueCollector(localizerFactory),
                new NpcDailyRoutineExportValueCollector(exportTemplatePlaceholderResolver, exportCachedDbAccess, dailyRoutineFunctionNameGenerator, dailyRoutineFunctionRenderer, defaultTemplateProvider, localizerFactory),
                new NpcStateMachineExportValueCollector(exportTemplatePlaceholderResolver, exportCachedDbAccess, stateMachineFunctionNameGenerator, stateMachineFunctionRenderer, defaultTemplateProvider, localizerFactory),
                new StateMachineFunctionValueCollector(localizerFactory),
                new DailyRoutineEventListValueCollector(exportCachedDbAccess, dailyRoutineFunctionNameGenerator, localizerFactory),
                new DailyRoutineFunctionValueCollector(localizerFactory),
                new DailyRoutineFunctionListValueCollector(exportTemplatePlaceholderResolver, exportCachedDbAccess, defaultTemplateProvider, localizerFactory),
                new ExportSnippetValueCollector(exportTemplatePlaceholderResolver, exportCachedDbAccess, exportSnippetFunctionRenderer, defaultTemplateProvider, localizerFactory),
                new ExportSnippetFunctionValueCollector(localizerFactory),
                new LanguageKeyValueCollector(exportCachedDbAccess, languageKeyDbAccess, localizerFactory)
            };
        }

        /// <summary>
        /// Validates a template code
        /// </summary>
        /// <param name="code">Code to validate</param>
        /// <returns>Validated template code</returns>
        public ExportTemplateValidationResult ValidateTemplate(string code)
        {
            ExportTemplateValidationResult validationResult = new ExportTemplateValidationResult();

            Template parsedTemplate = Template.Parse(code, "");
            validationResult.IsValid = !parsedTemplate.HasErrors;
            if(parsedTemplate.HasErrors)
            {
                validationResult.Errors = parsedTemplate.Messages.Select(m => m.ToString()).ToList();
            }

            return validationResult;
        }


        /// <summary>
        /// Builds the scriban script object
        /// </summary>
        /// <param name="templateType">Template Type</param>
        /// <param name="parsedTemplate">Parsed scriban template</param>
        /// <param name="data">Export Data</param>
        /// <param name="errorCollection">Error collection</param>
        /// <returns>Scriban script object</returns>
        private async Task<ScriptObject> BuildScriptObject(TemplateType templateType, Template parsedTemplate, ExportObjectData data, ExportPlaceholderErrorCollection errorCollection)
        {
            ScriptObject scriptObject = new ScriptObject();

            AddSharedScriptObjectValues(scriptObject);

            foreach(IScribanExportValueCollector curValueCollector in _exportValueCollectors)
            {
                if(curValueCollector.IsValidForTemplateType(templateType))
                {
                    try
                    {
                        curValueCollector.SetErrorCollection(errorCollection);
                        await curValueCollector.CollectValues(templateType, parsedTemplate, scriptObject, data);
                    }
                    catch(Exception ex)
                    {
                        errorCollection.AddException(ex);
                    }
                }
            }

            return scriptObject;
        }

        /// <summary>
        /// Adds all shared values to the export script object
        /// </summary>
        /// <param name="scriptObject">Script object to fill</param>
        private void AddSharedScriptObjectValues(ScriptObject scriptObject)
        {
            scriptObject.Add(IndentMultiLineRenderer.IndentMUltilineFunctionName, new IndentMultiLineRenderer());
        }

        /// <summary>
        /// Builds the template context
        /// </summary>
        /// <param name="exportObject">Export script object</param>
        /// <param name="errorCollection">Error collection</param>
        /// <returns>Template context</returns>
        private TemplateContext BuildTemplateContext(ScriptObject exportObject, ExportPlaceholderErrorCollection errorCollection)
        {
            TemplateContext context = new TemplateContext();
            context.TemplateLoader = new ScribanIncludeTemplateLoader(_exportCachedDbAccess, errorCollection);
            context.PushGlobal(exportObject);

            return context;
        }

        /// <summary>
        /// Fills the placeholders of a code
        /// </summary>
        /// <param name="templateType">Template Type</param>
        /// <param name="code">Code to fill</param>
        /// <param name="data">Export Data</param>
        /// <returns>Filled Code</returns>
        public async Task<ExportPlaceholderFillResult> FillPlaceholders(TemplateType templateType, string code, ExportObjectData data)
        {
            ExportPlaceholderErrorCollection errorCollection = new ExportPlaceholderErrorCollection(_localizerFactory);

            Template parsedTemplate = ScribanParsingUtil.ParseTemplate(code, errorCollection);

            if(parsedTemplate != null)
            {
                ScriptObject exportObject = await BuildScriptObject(templateType, parsedTemplate, data, errorCollection);
                TemplateContext context = BuildTemplateContext(exportObject, errorCollection);
                try
                {
                    code = await parsedTemplate.RenderAsync(context);
                }
                catch(Exception ex)
                {
                    errorCollection.AddException(ex);
                }
            }

            ExportPlaceholderFillResult result = new ExportPlaceholderFillResult();
            result.Code = code;
            result.Errors = errorCollection;
            return result;
        }


        /// <summary>
        /// Returns the Export Template Placeholders for a Template Type
        /// </summary>
        /// <param name="templateType">Template Type</param>
        /// <returns>Export Template Placeholder</returns>
        public List<ExportTemplatePlaceholder> GetExportTemplatePlaceholdersForType(TemplateType templateType)
        {
            List<ExportTemplatePlaceholder> placeholders = GetDefaultScribanPlaceholders();

            foreach(IScribanExportValueCollector curValueCollector in _exportValueCollectors)
            {
                placeholders.AddRange(curValueCollector.GetExportTemplatePlaceholdersForType(templateType));
            }

            placeholders = placeholders.DistinctBy(p => p.Name).ToList();

            return placeholders;
        }

        /// <summary>
        /// Returns a list of default scriban placeholder definitions
        /// </summary>
        /// <returns>List of default scriban placeholders</returns>
        private List<ExportTemplatePlaceholder> GetDefaultScribanPlaceholders()
        {
            IStringLocalizer localizer = _localizerFactory.Create(typeof(ScribanExportTemplatePlaceholderRenderingEngine));

            List<ExportTemplatePlaceholder> placeholders = new List<ExportTemplatePlaceholder> {
                new ExportTemplatePlaceholder("Scriban", localizer["PlaceholderDesc_ScribanLanguage"], true),
                new ExportTemplatePlaceholder("Scriban Builtins", localizer["PlaceholderDesc_ScribanBuiltins"], true),
                new ExportTemplatePlaceholder("include \"<TemplateName>\"", localizer["PlaceholderDesc_Include"], true)
            };
            placeholders.AddRange(IndentMultiLineRenderer.GetPlaceholders(_localizerFactory));

            return placeholders;
        }
    }
}