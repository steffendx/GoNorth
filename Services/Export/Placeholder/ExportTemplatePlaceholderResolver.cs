using System.Collections.Generic;
using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Data.Tale;
using GoNorth.Services.Export.DailyRoutine;
using GoNorth.Services.Export.Data;
using GoNorth.Services.Export.Dialog;
using GoNorth.Services.Export.ExportSnippets;
using GoNorth.Services.Export.LanguageKeyGeneration;
using GoNorth.Services.Export.NodeGraphExport;
using GoNorth.Services.Export.Placeholder.LegacyRenderingEngine;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.LanguageKeyGenerator;
using Microsoft.Extensions.Localization;

namespace GoNorth.Services.Export.Placeholder
{
    /// <summary>
    /// Export Template Placeholder Resolver
    /// </summary>
    public class ExportTemplatePlaceholderResolver : IExportTemplatePlaceholderResolver
    {
        /// <summary>
        /// Rendering Engine
        /// </summary>
        private readonly Dictionary<ExportTemplateRenderingEngine, IExportTemplatePlaceholderRenderingEngine> _renderingEngine;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="defaultTemplateProvider">Default Template Provider</param>
        /// <param name="cachedDbAccess">Cached Db Access</param>
        /// <param name="languageKeyGenerator">Language Key Generator</param>
        /// <param name="languageKeyDbAccess">Language Key Db Access</param>
        /// <param name="scribanLanguageKeyGenerator">Scriban Language key generator</param>
        /// <param name="taleDbAccess">Dialog Db Access</param>
        /// <param name="dialogParser">Dialog Parser</param>
        /// <param name="dialogFunctionGenerator">Dialog Function Generator</param>
        /// <param name="dialogRenderer">Dialog Renderer</param>
        /// <param name="legacyDailyRoutineEventPlaceholderResolver">Legacy Daily routine event placeholder resolver</param>
        /// <param name="legacyDailyRoutineEventContentPlaceholderResolver">Legacy Daily routine event content placeholder resolver</param>
        /// <param name="dailyRoutineFunctionNameGenerator">Daily routine function name generator</param>
        /// <param name="dailyRoutineFunctionRenderer">Daily routine function renderer</param>
        /// <param name="nodeGraphExporter">Node Graph Exporter</param>
        /// <param name="exportSnippetFunctionRenderer">Export snippet function renderer</param>
        /// <param name="localizerFactory">Localizer Factory</param>
        public ExportTemplatePlaceholderResolver(ICachedExportDefaultTemplateProvider defaultTemplateProvider, IExportCachedDbAccess cachedDbAccess, ILanguageKeyGenerator languageKeyGenerator, IScribanLanguageKeyGenerator scribanLanguageKeyGenerator, 
                                                 ILanguageKeyDbAccess languageKeyDbAccess, ITaleDbAccess taleDbAccess, IExportDialogParser dialogParser, IExportDialogFunctionGenerator dialogFunctionGenerator, IExportDialogRenderer dialogRenderer, 
                                                 ILegacyDailyRoutineEventPlaceholderResolver legacyDailyRoutineEventPlaceholderResolver, ILegacyDailyRoutineEventContentPlaceholderResolver legacyDailyRoutineEventContentPlaceholderResolver, 
                                                 IDailyRoutineFunctionNameGenerator dailyRoutineFunctionNameGenerator, IDailyRoutineFunctionRenderer dailyRoutineFunctionRenderer, INodeGraphExporter nodeGraphExporter, 
                                                 IExportSnippetFunctionRenderer exportSnippetFunctionRenderer, IStringLocalizerFactory localizerFactory)
        {
            dialogRenderer.SetExportTemplatePlaceholderResolver(this);

            _renderingEngine = new Dictionary<ExportTemplateRenderingEngine, IExportTemplatePlaceholderRenderingEngine>();
            _renderingEngine.Add(ExportTemplateRenderingEngine.Legacy, new LegacyExportTemplatePlaceholderRenderingEngine(this, defaultTemplateProvider, cachedDbAccess, languageKeyGenerator, languageKeyDbAccess, taleDbAccess, dialogParser,
                                                                                                                          dialogFunctionGenerator, dialogRenderer, legacyDailyRoutineEventPlaceholderResolver, legacyDailyRoutineEventContentPlaceholderResolver,
                                                                                                                          dailyRoutineFunctionRenderer, nodeGraphExporter, exportSnippetFunctionRenderer, localizerFactory));
            _renderingEngine.Add(ExportTemplateRenderingEngine.Scriban, new ScribanExportTemplatePlaceholderRenderingEngine(this, cachedDbAccess, taleDbAccess, defaultTemplateProvider, scribanLanguageKeyGenerator, dialogParser, dialogFunctionGenerator, 
                                                                                                                            dialogRenderer, dailyRoutineFunctionNameGenerator, dailyRoutineFunctionRenderer, exportSnippetFunctionRenderer, languageKeyDbAccess,
                                                                                                                            localizerFactory));
        }

        /// <summary>
        /// Validates if a template is valid
        /// </summary>
        /// <param name="code">Code to validate</param>
        /// <param name="renderingEngine">Rendering engine that is used</param>
        /// <returns>Validated template</returns>
        public ExportTemplateValidationResult ValidateTemplate(string code, ExportTemplateRenderingEngine renderingEngine)
        {
            if(!_renderingEngine.ContainsKey(renderingEngine))
            {
                return new ExportTemplateValidationResult 
                {
                    IsValid = false
                };
            }

            return _renderingEngine[renderingEngine].ValidateTemplate(code);
        }

        /// <summary>
        /// Fills the placeholders of a code
        /// </summary>
        /// <param name="templateType">Template Type</param>
        /// <param name="code">Code to fill</param>
        /// <param name="data">Export Data</param>
        /// <param name="renderingEngine">Rendering Engine</param>
        /// <returns>Filled Code</returns>
        public async Task<ExportPlaceholderFillResult> FillPlaceholders(TemplateType templateType, string code, ExportObjectData data, ExportTemplateRenderingEngine renderingEngine)
        {
            if(!_renderingEngine.ContainsKey(renderingEngine))
            {
                throw new KeyNotFoundException(string.Format("Unknown rendering engine {0}", renderingEngine.ToString()));
            }

            return await _renderingEngine[renderingEngine].FillPlaceholders(templateType, code, data);
        }

        /// <summary>
        /// Returns the Export Template Placeholders for a Template Type
        /// </summary>
        /// <param name="templateType">Template Type</param>
        /// <param name="renderingEngine">Rendering Engine</param>
        /// <returns>Export Template Placeholder</returns>
        public List<ExportTemplatePlaceholder> GetExportTemplatePlaceholdersForType(TemplateType templateType, ExportTemplateRenderingEngine renderingEngine)
        {
            if(!_renderingEngine.ContainsKey(renderingEngine))
            {
                throw new KeyNotFoundException(string.Format("Unknown rendering engine {0}", renderingEngine.ToString()));
            }

            return _renderingEngine[renderingEngine].GetExportTemplatePlaceholdersForType(templateType);
        }
    }
}