using System.Collections.Generic;
using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Data.Kortisto;
using GoNorth.Data.Project;
using GoNorth.Services.Export.Placeholder;
using Microsoft.Extensions.Localization;

namespace GoNorth.Services.Export.Dialog.ActionRendering
{
    /// <summary>
    /// Class for rendering a wait action
    /// </summary>
    public class WaitActionRenderer : BaseActionRenderer<WaitActionRenderer.WaitActionData>
    {
        /// <summary>
        /// Wait action data
        /// </summary>
        public class WaitActionData
        {
            /// <summary>
            /// Wait Amount
            /// </summary>
            public int WaitAmount { get; set; }

            /// <summary>
            /// Wait Type (Realtime or Gametime)
            /// </summary>
            public string WaitType { get; set; }

            /// <summary>
            /// Wait Unit
            /// </summary>
            public string WaitUnit { get; set; }
        }

        /// <summary>
        /// Placeholder for the Wait amount
        /// </summary>
        private const string Placeholder_Wait_Amount = "Tale_Action_WaitAmount";

        /// <summary>
        /// Placeholder for the start of content that will only be rendered if the wait type is real time
        /// </summary>
        private const string Placeholder_WaitTypeIsRealTime_Start = "Tale_Action_WaitType_RealTime_Start";

        /// <summary>
        /// Placeholder for the end of content that will only be rendered if the wait type is real time
        /// </summary>
        private const string Placeholder_WaitTypeIsRealTime_End = "Tale_Action_WaitType_RealTime_End";

        /// <summary>
        /// Placeholder for the start of content that will only be rendered if the wait type is game time
        /// </summary>
        private const string Placeholder_WaitTypeIsGameTime_Start = "Tale_Action_WaitType_GameTime_Start";

        /// <summary>
        /// Placeholder for the end of content that will only be rendered if the wait type is game time
        /// </summary>
        private const string Placeholder_WaitTypeIsGameTime_End = "Tale_Action_WaitType_GameTime_End";


        /// <summary>
        /// Placeholder for the start of content that will only be rendered if the wait unit is milliseconds
        /// </summary>
        private const string Placeholder_WaitUnitIsMilliseconds_Start = "Tale_Action_WaitUnit_Milliseconds_Start";

        /// <summary>
        /// Placeholder for the end of content that will only be rendered if the wait unit is milliseconds
        /// </summary>
        private const string Placeholder_WaitUnitIsMilliseconds_End = "Tale_Action_WaitUnit_Milliseconds_End";

        /// <summary>
        /// Placeholder for the start of content that will only be rendered if the wait unit is seconds
        /// </summary>
        private const string Placeholder_WaitUnitIsSeconds_Start = "Tale_Action_WaitUnit_Seconds_Start";

        /// <summary>
        /// Placeholder for the end of content that will only be rendered if the wait unit is seconds
        /// </summary>
        private const string Placeholder_WaitUnitIsSeconds_End = "Tale_Action_WaitUnit_Seconds_End";
        
        /// <summary>
        /// Placeholder for the start of content that will only be rendered if the wait unit is minutes
        /// </summary>
        private const string Placeholder_WaitUnitIsMinutes_Start = "Tale_Action_WaitUnit_Minutes_Start";

        /// <summary>
        /// Placeholder for the end of content that will only be rendered if the wait unit is minutes
        /// </summary>
        private const string Placeholder_WaitUnitIsMinutes_End = "Tale_Action_WaitUnit_Minutes_End";
                
        /// <summary>
        /// Placeholder for the start of content that will only be rendered if the wait unit is hours
        /// </summary>
        private const string Placeholder_WaitUnitIsHours_Start = "Tale_Action_WaitUnit_Hours_Start";

        /// <summary>
        /// Placeholder for the end of content that will only be rendered if the wait unit is hours
        /// </summary>
        private const string Placeholder_WaitUnitIsHours_End = "Tale_Action_WaitUnit_Hours_End";
                        
        /// <summary>
        /// Placeholder for the start of content that will only be rendered if the wait unit is hours
        /// </summary>
        private const string Placeholder_WaitUnitIsDays_Start = "Tale_Action_WaitUnit_Days_Start";

        /// <summary>
        /// Placeholder for the end of content that will only be rendered if the wait unit is hours
        /// </summary>
        private const string Placeholder_WaitUnitIsDays_End = "Tale_Action_WaitUnit_Days_End";


        /// <summary>
        /// Wait Type for Waiting in Real Time
        /// </summary>
        private const string WaitTypeRealTime = "0";

        /// <summary>
        /// Wait Type for Waiting in Game Time
        /// </summary>
        private const string WaitTypeGameTime = "1";


        /// <summary>
        /// Wait unit for milliseconds
        /// </summary>
        private const string WaitUnitMilliseconds = "0";

        /// <summary>
        /// Wait unit for seconds
        /// </summary>
        private const string WaitUnitSeconds = "1";
        
        /// <summary>
        /// Wait unit for minutes
        /// </summary>
        private const string WaitUnitMinutes = "2";

        /// <summary>
        /// Wait unit for hours
        /// </summary>
        private const string WaitUnitHours = "3";
        
        /// <summary>
        /// Wait unit for days
        /// </summary>
        private const string WaitUnitDays = "4";


        /// <summary>
        /// Default Template Provider
        /// </summary>
        private readonly ICachedExportDefaultTemplateProvider _defaultTemplateProvider;

        /// <summary>
        /// String Localizer
        /// </summary>
        private readonly IStringLocalizer _localizer;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="defaultTemplateProvider">Default Template Provider</param>
        /// <param name="localizerFactory">Localizer Factory</param>
        public WaitActionRenderer(ICachedExportDefaultTemplateProvider defaultTemplateProvider, IStringLocalizerFactory localizerFactory)
        {
            _defaultTemplateProvider = defaultTemplateProvider;
            _localizer = localizerFactory.Create(typeof(WaitActionRenderer));
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
        public override async Task<string> BuildActionFromParsedData(WaitActionRenderer.WaitActionData parsedData, ExportDialogData data, GoNorthProject project, ExportPlaceholderErrorCollection errorCollection, KortistoNpc npc, ExportSettings exportSettings)
        {
            ExportTemplate actionTemplate = await GetExportTemplate(project);

            string actionCode = ExportUtil.BuildPlaceholderRegex(Placeholder_Wait_Amount).Replace(actionTemplate.Code, parsedData.WaitAmount.ToString());
            actionCode = ExportUtil.RenderPlaceholderIfTrue(actionCode, Placeholder_WaitTypeIsRealTime_Start, Placeholder_WaitTypeIsRealTime_End, parsedData.WaitType == WaitTypeRealTime);
            actionCode = ExportUtil.RenderPlaceholderIfTrue(actionCode, Placeholder_WaitTypeIsGameTime_Start, Placeholder_WaitTypeIsGameTime_End, parsedData.WaitType == WaitTypeGameTime);
            actionCode = ExportUtil.RenderPlaceholderIfTrue(actionCode, Placeholder_WaitUnitIsMilliseconds_Start, Placeholder_WaitUnitIsMilliseconds_End, parsedData.WaitUnit == WaitUnitMilliseconds);
            actionCode = ExportUtil.RenderPlaceholderIfTrue(actionCode, Placeholder_WaitUnitIsSeconds_Start, Placeholder_WaitUnitIsSeconds_End, parsedData.WaitUnit == WaitUnitSeconds);
            actionCode = ExportUtil.RenderPlaceholderIfTrue(actionCode, Placeholder_WaitUnitIsMinutes_Start, Placeholder_WaitUnitIsMinutes_End, parsedData.WaitUnit == WaitUnitMinutes);
            actionCode = ExportUtil.RenderPlaceholderIfTrue(actionCode, Placeholder_WaitUnitIsHours_Start, Placeholder_WaitUnitIsHours_End, parsedData.WaitUnit == WaitUnitHours);
            actionCode = ExportUtil.RenderPlaceholderIfTrue(actionCode, Placeholder_WaitUnitIsDays_Start, Placeholder_WaitUnitIsDays_End, parsedData.WaitUnit == WaitUnitDays);

            return actionCode;
        }

        /// <summary>
        /// Builds a preview text from parsed data
        /// </summary>
        /// <param name="parsedData">Parsed data</param>
        /// <param name="npc">Npc to which the dialog belongs</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <returns>Preview text</returns>
        public override Task<string> BuildPreviewTextFromParsedData(WaitActionRenderer.WaitActionData parsedData, KortistoNpc npc, ExportPlaceholderErrorCollection errorCollection)
        {
            return Task.FromResult("Wait " + parsedData.WaitAmount);
        }


        /// <summary>
        /// Returns the export template to use
        /// </summary>
        /// <param name="project">Project</param>
        /// <returns>Export template to use</returns>
        private async Task<ExportTemplate> GetExportTemplate(GoNorthProject project)
        {
            return await _defaultTemplateProvider.GetDefaultTemplateByType(project.Id, TemplateType.TaleActionWait);
        }

        /// <summary>
        /// Returns true if the action renderer has placeholders for a template type
        /// </summary>
        /// <param name="templateType">Tempalte Type to check</param>
        /// <returns>true if the action renderer has placeholders for the template type</returns>
        public override bool HasPlaceholdersForTemplateType(TemplateType templateType)
        {
            return templateType == TemplateType.TaleActionWait;
        }   

        /// <summary>
        /// Returns the Export Template Placeholders for a Template Type
        /// </summary>
        /// <param name="templateType">Template Type</param>
        /// <returns>Export Template Placeholder</returns>
        public override List<ExportTemplatePlaceholder> GetExportTemplatePlaceholdersForType(TemplateType templateType)
        {
            List<ExportTemplatePlaceholder> exportPlaceholders = new List<ExportTemplatePlaceholder> {
                ExportUtil.CreatePlaceHolder(Placeholder_Wait_Amount, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_WaitTypeIsRealTime_Start, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_WaitTypeIsRealTime_End, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_WaitTypeIsGameTime_Start, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_WaitTypeIsGameTime_End, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_WaitUnitIsMilliseconds_Start, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_WaitUnitIsMilliseconds_End, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_WaitUnitIsSeconds_Start, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_WaitUnitIsSeconds_End, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_WaitUnitIsMinutes_Start, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_WaitUnitIsMinutes_End, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_WaitUnitIsHours_Start, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_WaitUnitIsHours_End, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_WaitUnitIsDays_Start, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_WaitUnitIsDays_End, _localizer)
            };

            return exportPlaceholders;
        }
    }
}