using System.Collections.Generic;
using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Data.FlexFieldDatabase;
using GoNorth.Data.Project;
using GoNorth.Extensions;
using GoNorth.Services.Export.Data;
using GoNorth.Services.Export.Dialog.ActionRendering.ConfigObject;
using GoNorth.Services.Export.Dialog.StepRenderers.ActionRenderer;
using GoNorth.Services.Export.LanguageKeyGeneration;
using GoNorth.Services.Export.Placeholder;
using GoNorth.Services.Export.Placeholder.LegacyRenderingEngine;
using Microsoft.Extensions.Localization;

namespace GoNorth.Services.Export.Dialog.ActionRendering.LegacyRenderingEngine
{
    /// <summary>
    /// Base Class for rendering a floating text above an object action
    /// </summary>
    public abstract class ShowFloatingTextAboveObjectActionRenderer : BaseActionRenderer<FloatingTextActionData>
    {
        /// <summary>
        /// Floating Text
        /// </summary>
        private const string Placeholder_FloatingText = "Tale_Action_FloatingText";
        
        /// <summary>
        /// Floating Text language key
        /// </summary>
        private const string Placeholder_FloatingText_LangKey = "Tale_Action_FloatingText_LangKey";


        /// <summary>
        /// Cached Db Access
        /// </summary>
        protected readonly IExportCachedDbAccess _cachedDbAccess;

        /// <summary>
        /// Language Key Generator
        /// </summary>
        private readonly ILanguageKeyGenerator _languageKeyGenerator;

        /// <summary>
        /// String Localizer
        /// </summary>
        protected readonly IStringLocalizer _localizer;

        /// <summary>
        /// Resolver for flex field values
        /// </summary>
        private readonly FlexFieldExportTemplatePlaceholderResolver _flexFieldPlaceholderResolver;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="defaultTemplateProvider">Default Template Provider</param>
        /// <param name="cachedDbAccess">Cached Db Access</param>        
        /// <param name="languageKeyGenerator">Language Key Generator</param>
        /// <param name="localizerFactory">Localizer Factory</param>
        public ShowFloatingTextAboveObjectActionRenderer(ICachedExportDefaultTemplateProvider defaultTemplateProvider, IExportCachedDbAccess cachedDbAccess, ILanguageKeyGenerator languageKeyGenerator, IStringLocalizerFactory localizerFactory)
        {
            _cachedDbAccess = cachedDbAccess;
            _languageKeyGenerator = languageKeyGenerator;
            _localizer = localizerFactory.Create(typeof(ShowFloatingTextAboveObjectActionRenderer));
            _flexFieldPlaceholderResolver = new FlexFieldExportTemplatePlaceholderResolver(defaultTemplateProvider, cachedDbAccess, languageKeyGenerator, localizerFactory, GetFlexFieldPrefix());
        }

        /// <summary>
        /// Sets the export template placeholder resolver
        /// </summary>
        /// <param name="templatePlaceholderResolver">Template placeholder resolver</param>
        public override void SetExportTemplatePlaceholderResolver(IExportTemplatePlaceholderResolver templatePlaceholderResolver) 
        {
            _flexFieldPlaceholderResolver.SetExportTemplatePlaceholderResolver(templatePlaceholderResolver);
        }

        /// <summary>
        /// Builds an action from parsed data
        /// </summary>
        /// <param name="template">Export template</param>
        /// <param name="parsedData">Parsed data</param>
        /// <param name="data">Dialog data</param>
        /// <param name="nextStep">Next step in the dialog</param>
        /// <param name="project">Project</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <param name="flexFieldObject">Flex field object to which the dialog belongs</param>
        /// <param name="exportSettings">Export Settings</param>
        /// <param name="stepRenderer">Action Step renderer</param>
        /// <returns>Action string</returns>
        public override async Task<string> BuildActionFromParsedData(ExportTemplate template, FloatingTextActionData parsedData, ExportDialogData data, ExportDialogData nextStep, GoNorthProject project, ExportPlaceholderErrorCollection errorCollection, 
                                                                     FlexFieldObject flexFieldObject, ExportSettings exportSettings, IActionStepRenderer stepRenderer)
        {
            IFlexFieldExportable valueObject = await GetValueObject(project, parsedData, flexFieldObject, errorCollection);
            if(valueObject == null)
            {
                return string.Empty;
            }

            string actionCode = template.Code;
            actionCode = ExportUtil.BuildPlaceholderRegex(Placeholder_FloatingText).Replace(actionCode, parsedData.FloatingText);
            actionCode = await ExportUtil.BuildPlaceholderRegex(Placeholder_FloatingText_LangKey).ReplaceAsync(actionCode, async m => {
                return await _languageKeyGenerator.GetDialogTextLineKey(flexFieldObject.Id, valueObject.Name, GetLanguageKeyType(), data.Id, parsedData.FloatingText);
            });

            ExportObjectData flexFieldExportData = new ExportObjectData();
            flexFieldExportData.ExportData.Add(ExportConstants.ExportDataObject, valueObject);
            flexFieldExportData.ExportData.Add(ExportConstants.ExportDataObjectType, GetFlexFieldExportObjectType());

            _flexFieldPlaceholderResolver.SetErrorMessageCollection(errorCollection);
            actionCode = await _flexFieldPlaceholderResolver.FillPlaceholders(actionCode, flexFieldExportData);

            return actionCode;
        }

        /// <summary>
        /// Builds a preview text from parsed data
        /// </summary>
        /// <param name="parsedData">Parsed data</param>
        /// <param name="flexFieldObject">Flex fieldo bject to which the dialog belongs</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <param name="child">Child node</param>
        /// <param name="parent">Parent</param>
        /// <returns>Preview text</returns>
        public override Task<string> BuildPreviewTextFromParsedData(FloatingTextActionData parsedData, FlexFieldObject flexFieldObject, ExportPlaceholderErrorCollection errorCollection, ExportDialogData child, ExportDialogData parent)
        {
            return Task<string>.FromResult(GetPreviewText());
        }


        /// <summary>
        /// Returns the flex field prefix
        /// </summary>
        /// <returns>Flex Field Prefix</returns>        
        protected abstract string GetFlexFieldPrefix();

        /// <summary>
        /// Returns the flex field export object type
        /// </summary>
        /// <returns>Flex field export object type</returns>
        protected abstract string GetFlexFieldExportObjectType();

        /// <summary>
        /// Returns the preview text
        /// </summary>
        /// <returns>Preview text</returns>
        protected abstract string GetPreviewText();

        /// <summary>
        /// Returns the value object to use
        /// </summary>
        /// <param name="project">Project</param>
        /// <param name="parsedData">Parsed data</param>
        /// <param name="flexFieldObject">Flex field object</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <returns>Value Object</returns>
        protected abstract Task<IFlexFieldExportable> GetValueObject(GoNorthProject project, FloatingTextActionData parsedData, FlexFieldObject flexFieldObject, ExportPlaceholderErrorCollection errorCollection);

        /// <summary>
        /// Returns the language key type
        /// </summary>
        /// <returns>Language key tpye</returns>
        protected abstract string GetLanguageKeyType();


        /// <summary>
        /// Returns the Export Template Placeholders for a Template Type
        /// </summary>
        /// <param name="templateType">Template Type</param>
        /// <returns>Export Template Placeholder</returns>
        public override List<ExportTemplatePlaceholder> GetExportTemplatePlaceholdersForType(TemplateType templateType)
        {
            List<ExportTemplatePlaceholder> exportPlaceholders = new List<ExportTemplatePlaceholder> {
                ExportUtil.CreatePlaceHolder(Placeholder_FloatingText, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_FloatingText_LangKey, _localizer)
            };

            exportPlaceholders.AddRange(_flexFieldPlaceholderResolver.GetExportTemplatePlaceholdersForType(TemplateType.ObjectNpc));

            return exportPlaceholders;
        }
    }
}