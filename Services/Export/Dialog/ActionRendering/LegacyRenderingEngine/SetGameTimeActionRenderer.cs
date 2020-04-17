using System.Collections.Generic;
using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Data.FlexFieldDatabase;
using GoNorth.Data.ProjectConfig;
using GoNorth.Services.Export.Data;
using GoNorth.Services.Export.Dialog.ActionRendering.ConfigObject;
using GoNorth.Services.Export.Dialog.ActionRendering.SharedRendering;
using GoNorth.Services.Export.Dialog.StepRenderers.ActionRenderer;
using GoNorth.Services.Export.Placeholder;
using Microsoft.Extensions.Localization;

namespace GoNorth.Services.Export.Dialog.ActionRendering.LegacyRenderingEngine
{
    /// <summary>
    /// Class for rendering a set game time action
    /// </summary>
    public class SetGameTimeActionRenderer : BaseSetGameTimeActionRenderer
    {
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
        /// String Localizer
        /// </summary>
        private readonly IStringLocalizer _localizer;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="cachedDbAccess">Cached Db Access</param>
        /// <param name="localizerFactory">Localizer Factory</param>
        public SetGameTimeActionRenderer(IExportCachedDbAccess cachedDbAccess, IStringLocalizerFactory localizerFactory) : base(cachedDbAccess)
        {
            _localizer = localizerFactory.Create(typeof(SetGameTimeActionRenderer));
        }

        /// <summary>
        /// Fills the placeholders
        /// </summary>
        /// <param name="template">Template to use</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <param name="parsedData">Parsed config data</param>
        /// <param name="projectConfig">Project config</param>
        /// <param name="flexFieldObject">Flex field object to which the dialog belongs</param>
        /// <param name="curStep">Current step that is rendered</param>
        /// <param name="nextStep">Next step that is being rendered</param>
        /// <param name="exportSettings">Export Settings</param>
        /// <param name="stepRenderer">Action Step renderer</param>
        /// <returns>Filled placeholders</returns>
        protected override async Task<string> FillPlaceholders(ExportTemplate template, ExportPlaceholderErrorCollection errorCollection, SetGameTimeActionData parsedData, MiscProjectConfig projectConfig, FlexFieldObject flexFieldObject, 
                                                               ExportDialogData curStep, ExportDialogData nextStep, ExportSettings exportSettings, IActionStepRenderer stepRenderer)
        {
            string actionCode = ExportUtil.BuildPlaceholderRegex(Placeholder_Hours).Replace(template.Code, parsedData.Hours.ToString());
            actionCode = ExportUtil.BuildPlaceholderRegex(Placeholder_Minutes).Replace(actionCode, parsedData.Minutes.ToString());
            actionCode = ExportUtil.BuildPlaceholderRegex(Placeholder_TotalMinutes).Replace(actionCode, (parsedData.Hours * projectConfig.MinutesPerHour + parsedData.Minutes).ToString());

            return await stepRenderer.ReplaceBasePlaceholders(errorCollection, actionCode, curStep, nextStep, flexFieldObject);
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