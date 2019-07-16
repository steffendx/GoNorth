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
    /// Class for rendering a fade to / from black action
    /// </summary>
    public class FadeToFromBlackRenderer : BaseActionRenderer<FadeToFromBlackRenderer.FadeToFromBlackActionData>
    {
        /// <summary>
        /// Fade to / from black action data
        /// </summary>
        public class FadeToFromBlackActionData
        {
            /// <summary>
            /// Fade Time
            /// </summary>
            public int FadeTime { get; set; }
        }


        /// <summary>
        /// Placeholder for the fade time
        /// </summary>
        private const string Placeholder_FadeTime = "Tale_Action_FadeTime";


        /// <summary>
        /// Default Template Provider
        /// </summary>
        protected readonly ICachedExportDefaultTemplateProvider _defaultTemplateProvider;

        /// <summary>
        /// String Localizer
        /// </summary>
        private readonly IStringLocalizer _localizer;

        /// <summary>
        /// true if the renderer is for an action fading to black, false for an action fading back from black
        /// </summary>
        private readonly bool _isFadingToBlack;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="defaultTemplateProvider">Default Template Provider</param>
        /// <param name="localizerFactory">Localizer Factory</param>
        /// <param name="isFadingToBlack">true if the renderer is for an action fading to black, false for an action fading back from black</param>
        public FadeToFromBlackRenderer(ICachedExportDefaultTemplateProvider defaultTemplateProvider, IStringLocalizerFactory localizerFactory, bool isFadingToBlack)
        {
            _defaultTemplateProvider = defaultTemplateProvider;
            _localizer = localizerFactory.Create(typeof(FadeToFromBlackRenderer));
            _isFadingToBlack = isFadingToBlack;
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
        public override async Task<string> BuildActionFromParsedData(FadeToFromBlackRenderer.FadeToFromBlackActionData parsedData, ExportDialogData data, GoNorthProject project, ExportPlaceholderErrorCollection errorCollection, KortistoNpc npc, ExportSettings exportSettings)
        {
            ExportTemplate actionTemplate = await GetExportTemplate(project);

            string actionCode = ExportUtil.BuildPlaceholderRegex(Placeholder_FadeTime).Replace(actionTemplate.Code, parsedData.FadeTime.ToString());

            return actionCode;
        }

        /// <summary>
        /// Builds a preview text from parsed data
        /// </summary>
        /// <param name="parsedData">Parsed data</param>
        /// <param name="npc">Npc to which the dialog belongs</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <returns>Preview text</returns>
        public override Task<string> BuildPreviewTextFromParsedData(FadeToFromBlackRenderer.FadeToFromBlackActionData parsedData, KortistoNpc npc, ExportPlaceholderErrorCollection errorCollection)
        {
            string label = _isFadingToBlack ? "FadeToBlack" : "FadeFromBlack";
            return Task.FromResult(label + " (" + parsedData.FadeTime.ToString() + ")");
        }


        /// <summary>
        /// Returns the export template to use
        /// </summary>
        /// <param name="project">Project</param>
        /// <returns>Export template to use</returns>
        private async Task<ExportTemplate> GetExportTemplate(GoNorthProject project)
        {
            return await _defaultTemplateProvider.GetDefaultTemplateByType(project.Id, _isFadingToBlack ? TemplateType.TaleActionFadeToBlack : TemplateType.TaleActionFadeFromBlack);
        }

        /// <summary>
        /// Returns true if the action renderer has placeholders for a template type
        /// </summary>
        /// <param name="templateType">Tempalte Type to check</param>
        /// <returns>true if the action renderer has placeholders for the template type</returns>
        public override bool HasPlaceholdersForTemplateType(TemplateType templateType)
        {
            return (_isFadingToBlack && templateType == TemplateType.TaleActionFadeToBlack) || (!_isFadingToBlack && templateType == TemplateType.TaleActionFadeFromBlack);
        }   

        /// <summary>
        /// Returns the Export Template Placeholders for a Template Type
        /// </summary>
        /// <param name="templateType">Template Type</param>
        /// <returns>Export Template Placeholder</returns>
        public override List<ExportTemplatePlaceholder> GetExportTemplatePlaceholdersForType(TemplateType templateType)
        {
            List<ExportTemplatePlaceholder> exportPlaceholders = new List<ExportTemplatePlaceholder> {
                ExportUtil.CreatePlaceHolder(Placeholder_FadeTime, _localizer)
            };

            return exportPlaceholders;
        }
    }
}