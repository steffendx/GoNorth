using System.Collections.Generic;
using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Data.Kortisto;
using GoNorth.Data.Project;
using GoNorth.Services.Export.Data;
using GoNorth.Services.Export.LanguageKeyGeneration;
using GoNorth.Services.Export.Placeholder;
using Microsoft.Extensions.Localization;

namespace GoNorth.Services.Export.Dialog.ActionRendering
{
    /// <summary>
    /// Base Class for rendering a floating text above an object action
    /// </summary>
    public abstract class ShowFloatingTextAboveObjectActionRenderer : BaseActionRenderer<ShowFloatingTextAboveObjectActionRenderer.FloatingTextActionData>
    {
        /// <summary>
        /// Floating text action data
        /// </summary>
        public class FloatingTextActionData
        {
            /// <summary>
            /// Floating text
            /// </summary>
            public string FloatingText { get; set; }

            /// <summary>
            /// Npc Id
            /// </summary>
            public string NpcId { get; set; }
        }


        /// <summary>
        /// Floating Text
        /// </summary>
        private const string Placeholder_FloatingText = "Tale_Action_FloatingText";
        
        /// <summary>
        /// Floating Text language key
        /// </summary>
        private const string Placeholder_FloatingText_LangKey = "Tale_Action_FloatingText_LangKey";


        /// <summary>
        /// Default Template Provider
        /// </summary>
        protected readonly ICachedExportDefaultTemplateProvider _defaultTemplateProvider;

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
            _defaultTemplateProvider = defaultTemplateProvider;
            _cachedDbAccess = cachedDbAccess;
            _languageKeyGenerator = languageKeyGenerator;
            _localizer = localizerFactory.Create(typeof(ShowFloatingTextAboveObjectActionRenderer));
            _flexFieldPlaceholderResolver = new FlexFieldExportTemplatePlaceholderResolver(defaultTemplateProvider, cachedDbAccess, languageKeyGenerator, localizerFactory, GetFlexFieldPrefix());
        }

        /// <summary>
        /// Builds an action from parsed data
        /// </summary>
        /// <param name="parsedData">Parsed data</param>
        /// <param name="data">Dialog data</param>
        /// <param name="project">Project</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <param name="npc">Npc to which the dialog belongs</param>
        /// <param name="exportSettings">Export Settings</param>
        /// <returns>Action string</returns>
        public override async Task<string> BuildActionFromParsedData(ShowFloatingTextAboveObjectActionRenderer.FloatingTextActionData parsedData, ExportDialogData data, GoNorthProject project, ExportPlaceholderErrorCollection errorCollection, KortistoNpc npc, ExportSettings exportSettings)
        {
            ExportTemplate actionTemplate = await GetExportTemplate(project);
            IFlexFieldExportable valueObject = await GetValueObject(project, parsedData, npc, errorCollection);
            if(valueObject == null)
            {
                return string.Empty;
            }

            string actionCode = actionTemplate.Code;
            actionCode = ExportUtil.BuildPlaceholderRegex(Placeholder_FloatingText).Replace(actionCode, parsedData.FloatingText);
            actionCode = ExportUtil.BuildPlaceholderRegex(Placeholder_FloatingText_LangKey).Replace(actionCode, m => {
                return _languageKeyGenerator.GetDialogTextLineKey(npc.Id, valueObject.Name, GetLanguageKeyType(), data.Id, parsedData.FloatingText).Result;
            });

            ExportObjectData flexFieldExportData = new ExportObjectData();
            flexFieldExportData.ExportData.Add(ExportConstants.ExportDataObject, valueObject);
            flexFieldExportData.ExportData.Add(ExportConstants.ExportDataObjectType, GetFlexFieldExportObjectType());

            _flexFieldPlaceholderResolver.SetErrorMessageCollection(errorCollection);
            actionCode = _flexFieldPlaceholderResolver.FillPlaceholders(actionCode, flexFieldExportData).Result;

            return actionCode;
        }

        /// <summary>
        /// Builds a preview text from parsed data
        /// </summary>
        /// <param name="parsedData">Parsed data</param>
        /// <param name="npc">Npc to which the dialog belongs</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <returns>Preview text</returns>
        public override Task<string> BuildPreviewTextFromParsedData(ShowFloatingTextAboveObjectActionRenderer.FloatingTextActionData parsedData, KortistoNpc npc, ExportPlaceholderErrorCollection errorCollection)
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
        /// Returns the export template to use
        /// </summary>
        /// <param name="project">Project</param>
        /// <returns>Export template to use</returns>
        protected abstract Task<ExportTemplate> GetExportTemplate(GoNorthProject project);

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
        /// <param name="npc">Npc</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <returns>Value Object</returns>
        protected abstract Task<IFlexFieldExportable> GetValueObject(GoNorthProject project, ShowFloatingTextAboveObjectActionRenderer.FloatingTextActionData parsedData, KortistoNpc npc, ExportPlaceholderErrorCollection errorCollection);

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