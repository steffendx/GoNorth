using System.Collections.Generic;
using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Data.FlexFieldDatabase;
using GoNorth.Services.Export.Dialog.ActionRendering.ConfigObject;
using GoNorth.Services.Export.Dialog.ActionRendering.SharedRendering;
using GoNorth.Services.Export.Dialog.StepRenderers.ActionRenderer;
using GoNorth.Services.Export.Placeholder;
using Microsoft.Extensions.Localization;

namespace GoNorth.Services.Export.Dialog.ActionRendering.LegacyRenderingEngine
{
    /// <summary>
    /// Class for rendering a wait action
    /// </summary>
    public class WaitActionRenderer : BaseWaitActionRenderer
    {
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
        /// Placeholder for for the start of the content that will only be rendered if the wait has a direct continue function
        /// </summary>
        private const string Placeholder_HasDirectContinueFunction_Start = "Tale_Action_HasDirectContinueFunction_Start";

        /// <summary>
        /// Placeholder for for the end of the content that will only be rendered if the wait has a direct continue function
        /// </summary>
        private const string Placeholder_HasDirectContinueFunction_End = "Tale_Action_HasDirectContinueFunction_End";
                
        /// <summary>
        /// Placeholder for for the start of the content that will only be rendered if the wait has no direct continue function
        /// </summary>
        private const string Placeholder_HasNoDirectContinueFunction_Start = "Tale_Action_HasNoDirectContinueFunction_Start";

        /// <summary>
        /// Placeholder for for the end of the content that will only be rendered if the wait has no direct continue function
        /// </summary>
        private const string Placeholder_HasNoDirectContinueFunction_End = "Tale_Action_HasNoDirectContinueFunction_End";
        
        /// <summary>
        /// Placeholder for for the name of the function that will continue the dialog directly
        /// </summary>
        private const string Placeholder_DirectContinueFunction = "Tale_Action_DirectContinueFunction";


        /// <summary>
        /// String Localizer
        /// </summary>
        private readonly IStringLocalizer _localizer;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="localizerFactory">Localizer Factory</param>
        public WaitActionRenderer(IStringLocalizerFactory localizerFactory)
        {
            _localizer = localizerFactory.Create(typeof(WaitActionRenderer));
        }

        /// <summary>
        /// Fills the placeholders
        /// </summary>
        /// <param name="template">Template to use</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <param name="parsedData">Parsed config data</param>
        /// <param name="directContinueFunction">Direct continue function</param>
        /// <param name="flexFieldObject">Flex field object to which the dialog belongs</param>
        /// <param name="curStep">Current step that is rendered</param>
        /// <param name="nextStep">Next step that is being rendered</param>
        /// <param name="stepRenderer">Action Step renderer</param>
        /// <returns>Filled placeholders</returns>
        protected override async Task<string> FillPlaceholders(ExportTemplate template, ExportPlaceholderErrorCollection errorCollection, WaitActionData parsedData, string directContinueFunction, FlexFieldObject flexFieldObject, 
                                                         ExportDialogData curStep, ExportDialogData nextStep, IActionStepRenderer stepRenderer)
        {
            string actionCode = ExportUtil.BuildPlaceholderRegex(Placeholder_Wait_Amount).Replace(template.Code, parsedData.WaitAmount.ToString());
            actionCode = ExportUtil.RenderPlaceholderIfTrue(actionCode, Placeholder_WaitTypeIsRealTime_Start, Placeholder_WaitTypeIsRealTime_End, parsedData.WaitType == WaitActionData.WaitTypeRealTime);
            actionCode = ExportUtil.RenderPlaceholderIfTrue(actionCode, Placeholder_WaitTypeIsGameTime_Start, Placeholder_WaitTypeIsGameTime_End, parsedData.WaitType == WaitActionData.WaitTypeGameTime);
            actionCode = ExportUtil.RenderPlaceholderIfTrue(actionCode, Placeholder_WaitUnitIsMilliseconds_Start, Placeholder_WaitUnitIsMilliseconds_End, parsedData.WaitUnit == WaitActionData.WaitUnitMilliseconds);
            actionCode = ExportUtil.RenderPlaceholderIfTrue(actionCode, Placeholder_WaitUnitIsSeconds_Start, Placeholder_WaitUnitIsSeconds_End, parsedData.WaitUnit == WaitActionData.WaitUnitSeconds);
            actionCode = ExportUtil.RenderPlaceholderIfTrue(actionCode, Placeholder_WaitUnitIsMinutes_Start, Placeholder_WaitUnitIsMinutes_End, parsedData.WaitUnit == WaitActionData.WaitUnitMinutes);
            actionCode = ExportUtil.RenderPlaceholderIfTrue(actionCode, Placeholder_WaitUnitIsHours_Start, Placeholder_WaitUnitIsHours_End, parsedData.WaitUnit == WaitActionData.WaitUnitHours);
            actionCode = ExportUtil.RenderPlaceholderIfTrue(actionCode, Placeholder_WaitUnitIsDays_Start, Placeholder_WaitUnitIsDays_End, parsedData.WaitUnit == WaitActionData.WaitUnitDays);
            actionCode = ExportUtil.RenderPlaceholderIfTrue(actionCode, Placeholder_HasDirectContinueFunction_Start, Placeholder_HasDirectContinueFunction_End, !string.IsNullOrEmpty(directContinueFunction));
            actionCode = ExportUtil.RenderPlaceholderIfTrue(actionCode, Placeholder_HasNoDirectContinueFunction_Start, Placeholder_HasNoDirectContinueFunction_End, string.IsNullOrEmpty(directContinueFunction));
            actionCode = ExportUtil.BuildPlaceholderRegex(Placeholder_DirectContinueFunction).Replace(actionCode, directContinueFunction);

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
                ExportUtil.CreatePlaceHolder(Placeholder_WaitUnitIsDays_End, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_HasDirectContinueFunction_Start, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_HasDirectContinueFunction_End, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_HasNoDirectContinueFunction_Start, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_HasNoDirectContinueFunction_End, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_DirectContinueFunction, _localizer)
            };

            return exportPlaceholders;
        }
    }
}