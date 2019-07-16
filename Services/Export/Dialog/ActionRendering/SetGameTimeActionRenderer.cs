using System.Collections.Generic;
using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Data.Kortisto;
using GoNorth.Data.Project;
using GoNorth.Data.ProjectConfig;
using GoNorth.Services.Export.Data;
using GoNorth.Services.Export.Placeholder;
using Microsoft.Extensions.Localization;

namespace GoNorth.Services.Export.Dialog.ActionRendering
{
    /// <summary>
    /// Class for rendering a set game time action
    /// </summary>
    public class SetGameTimeActionRenderer : BaseActionRenderer<SetGameTimeActionRenderer.SetGameTimeActionData>
    {
        /// <summary>
        /// Set game time action data
        /// </summary>
        public class SetGameTimeActionData
        {
            /// <summary>
            /// Hours to set the time to
            /// </summary>
            public int Hours { get; set; }
            
            /// <summary>
            /// Minutes to set the time to
            /// </summary>
            public int Minutes { get; set; }
        }

        /// <summary>
        /// Placeholder for the hours
        /// </summary>
        private const string Placeholder_Hours = "Tale_Action_Time_Hours";
        
        /// <summary>
        /// Placeholder for the minutes
        /// </summary>
        private const string Placeholder_Minutes = "Tale_Action_Time_Minutes";
        
        /// <summary>
        /// Placeholder for the total minutes
        /// </summary>
        private const string Placeholder_TotalMinutes = "Tale_Action_Time_TotalMinutes";


        /// <summary>
        /// Default Template Provider
        /// </summary>
        private readonly ICachedExportDefaultTemplateProvider _defaultTemplateProvider;

        /// <summary>
        /// Cached Db Access
        /// </summary>
        private readonly IExportCachedDbAccess _cachedDbAccess;

        /// <summary>
        /// String Localizer
        /// </summary>
        private readonly IStringLocalizer _localizer;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="defaultTemplateProvider">Default Template Provider</param>
        /// <param name="cachedDbAccess">Cached Db Access</param>
        /// <param name="localizerFactory">Localizer Factory</param>
        public SetGameTimeActionRenderer(ICachedExportDefaultTemplateProvider defaultTemplateProvider, IExportCachedDbAccess cachedDbAccess, IStringLocalizerFactory localizerFactory)
        {
            _defaultTemplateProvider = defaultTemplateProvider;
            _cachedDbAccess = cachedDbAccess;
            _localizer = localizerFactory.Create(typeof(SetGameTimeActionRenderer));
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
        public override async Task<string> BuildActionFromParsedData(SetGameTimeActionRenderer.SetGameTimeActionData parsedData, ExportDialogData data, GoNorthProject project, ExportPlaceholderErrorCollection errorCollection, KortistoNpc npc, ExportSettings exportSettings)
        {
            ExportTemplate actionTemplate = await GetExportTemplate(project);

            MiscProjectConfig projectConfig = await _cachedDbAccess.GetMiscProjectConfig();

            string actionCode = ExportUtil.BuildPlaceholderRegex(Placeholder_Hours).Replace(actionTemplate.Code, parsedData.Hours.ToString());
            actionCode = ExportUtil.BuildPlaceholderRegex(Placeholder_Minutes).Replace(actionCode, parsedData.Minutes.ToString());
            actionCode = ExportUtil.BuildPlaceholderRegex(Placeholder_TotalMinutes).Replace(actionCode, (parsedData.Hours * projectConfig.MinutesPerHour + parsedData.Minutes).ToString());

            return actionCode;
        }

        /// <summary>
        /// Builds a preview text from parsed data
        /// </summary>
        /// <param name="parsedData">Parsed data</param>
        /// <param name="npc">Npc to which the dialog belongs</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <returns>Preview text</returns>
        public override Task<string> BuildPreviewTextFromParsedData(SetGameTimeActionRenderer.SetGameTimeActionData parsedData, KortistoNpc npc, ExportPlaceholderErrorCollection errorCollection)
        {
            return Task.FromResult(string.Format("SetGameTime {0}:{1}", parsedData.Hours, parsedData.Minutes));
        }


        /// <summary>
        /// Returns the export template to use
        /// </summary>
        /// <param name="project">Project</param>
        /// <returns>Export template to use</returns>
        private async Task<ExportTemplate> GetExportTemplate(GoNorthProject project)
        {
            return await _defaultTemplateProvider.GetDefaultTemplateByType(project.Id, TemplateType.TaleActionSetGameTime);
        }

        /// <summary>
        /// Returns true if the action renderer has placeholders for a template type
        /// </summary>
        /// <param name="templateType">Tempalte Type to check</param>
        /// <returns>true if the action renderer has placeholders for the template type</returns>
        public override bool HasPlaceholdersForTemplateType(TemplateType templateType)
        {
            return templateType == TemplateType.TaleActionSetGameTime;
        }   

        /// <summary>
        /// Returns the Export Template Placeholders for a Template Type
        /// </summary>
        /// <param name="templateType">Template Type</param>
        /// <returns>Export Template Placeholder</returns>
        public override List<ExportTemplatePlaceholder> GetExportTemplatePlaceholdersForType(TemplateType templateType)
        {
            List<ExportTemplatePlaceholder> exportPlaceholders = new List<ExportTemplatePlaceholder> {
                ExportUtil.CreatePlaceHolder(Placeholder_Hours, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_Minutes, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_TotalMinutes, _localizer)
            };

            return exportPlaceholders;
        }
    }
}