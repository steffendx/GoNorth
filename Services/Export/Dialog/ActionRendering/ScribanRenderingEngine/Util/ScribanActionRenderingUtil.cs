using System.Collections.Generic;
using System.Threading.Tasks;
using GoNorth.Data.FlexFieldDatabase;
using GoNorth.Services.Export.Data;
using GoNorth.Services.Export.Dialog.StepRenderers.ActionRenderer;
using GoNorth.Services.Export.Placeholder;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.Include;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.LanguageKeyGenerator;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.RenderingObjects;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.Util;
using Microsoft.Extensions.Localization;
using Scriban;
using Scriban.Runtime;

namespace GoNorth.Services.Export.Dialog.ActionRendering.ScribanRenderingEngine.Util
{
    /// <summary>
    /// Util Class for rendering a scriban action
    /// </summary>
    public class ScribanActionRenderingUtil
    {
        /// <summary>
        /// Fills the placeholders
        /// </summary>
        /// <param name="cachedDbAccess">Cached database access</param>
        /// <param name="errorCollection">Error collection</param>
        /// <param name="code">Code to fill</param>
        /// <param name="valueObject">Value object to use</param>
        /// <param name="flexFieldObject">Flex field object to which the dialog belongs</param>
        /// <param name="curStep">Current step that is rendered</param>
        /// <param name="nextStep">Next step that is being rendered</param>
        /// <param name="languageKeyGenerator">Language key generator, null to not use it</param>
        /// <param name="stepRenderer">Action Step renderer</param>
        /// <typeparam name="T">Value object type</typeparam>
        /// <returns>Filled placeholders</returns>
        public static async Task<string> FillPlaceholders<T>(IExportCachedDbAccess cachedDbAccess, ExportPlaceholderErrorCollection errorCollection, string code, T valueObject, FlexFieldObject flexFieldObject, ExportDialogData curStep, ExportDialogData nextStep, 
                                                             IScribanLanguageKeyGenerator languageKeyGenerator, IActionStepRenderer stepRenderer) where T : class
        {
            if(!stepRenderer.UsesValueObject())
            {
                code = await stepRenderer.ReplaceBasePlaceholders(errorCollection, code, curStep, nextStep, flexFieldObject);
            }

            Template parsedTemplate = ScribanParsingUtil.ParseTemplate(code, errorCollection);
            if (parsedTemplate == null)
            {
                return string.Empty;
            }

            if(languageKeyGenerator != null)
            {
                languageKeyGenerator.SetErrorCollection(errorCollection);
            }

            TemplateContext context = BuildTemplateContext(cachedDbAccess, errorCollection, valueObject, languageKeyGenerator, stepRenderer, flexFieldObject, curStep, nextStep);
            return await parsedTemplate.RenderAsync(context);
        }

        /// <summary>
        /// Builds the template context for exporting
        /// </summary>
        /// <param name="cachedDbAccess">Cached database access</param>
        /// <param name="errorCollection">Error collection</param>
        /// <param name="renderingObject">Rendering object to export</param>
        /// <param name="languageKeyGenerator">Language key generator, null to not use it</param>
        /// <param name="stepRenderer">Action Step renderer</param>
        /// <param name="flexFieldObject">Flex field object to which the dialog belongs</param>
        /// <param name="curStep">Current step that is rendered</param>
        /// <param name="nextStep">Next step that is being rendered</param>
        /// <returns>Template context</returns>
        private static TemplateContext BuildTemplateContext<T>(IExportCachedDbAccess cachedDbAccess, ExportPlaceholderErrorCollection errorCollection, T renderingObject, IScribanLanguageKeyGenerator languageKeyGenerator, IActionStepRenderer stepRenderer, 
                                                               FlexFieldObject flexFieldObject, ExportDialogData curStep, ExportDialogData nextStep) where T : class
        {
            ScriptObject exportObject = new ScriptObject();
            exportObject.Add(ExportConstants.ScribanActionObjectKey, renderingObject);

            if(languageKeyGenerator != null)
            {
                exportObject.Add(ExportConstants.ScribanLanguageKeyName, languageKeyGenerator);
            }

            if(stepRenderer != null && stepRenderer.UsesValueObject())
            {
                exportObject.Add(stepRenderer.GetValueObjectKey(), stepRenderer.GetValueObject(curStep, nextStep, flexFieldObject));
            }
            
            TemplateContext context = new TemplateContext();
            context.TemplateLoader = new ScribanIncludeTemplateLoader(cachedDbAccess, errorCollection);
            context.PushGlobal(exportObject);
            return context;
        }

        /// <summary>
        /// Returns the Export Template Placeholders for a rendering object
        /// </summary>
        /// <param name="localizerFactory">Localizer factor</param>
        /// <param name="languageKeyGenerator">Language key generator, null to not use it</param>
        /// <param name="languageKeyValueDesc">Description value for the language key to describe in which context this can be used</param>
        /// <returns>Export Template Placeholder</returns>
        public static List<ExportTemplatePlaceholder> GetExportTemplatePlaceholdersForType<T>(IStringLocalizerFactory localizerFactory, IScribanLanguageKeyGenerator languageKeyGenerator, string languageKeyValueDesc)
        {
            List<ExportTemplatePlaceholder> placeholders = new List<ExportTemplatePlaceholder>();
            if(languageKeyGenerator != null)
            {
                placeholders.AddRange(languageKeyGenerator.GetExportTemplatePlaceholders(languageKeyValueDesc));
            }
            placeholders.AddRange(ScribanPlaceholderGenerator.GetPlaceholdersForObject<T>(localizerFactory, ExportConstants.ScribanActionObjectKey));
            placeholders.RemoveAll(p => p.Name.EndsWith(string.Format(".{0}", StandardMemberRenamer.Rename(nameof(ScribanFlexFieldObject.UnusedFields)))));

            return placeholders;
        }
    }
}