using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Data.FlexFieldDatabase;
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
        /// Id of the direct continue node
        /// </summary>
        private const int DirectContinueFunctionNodeId = 1;


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
        /// <param name="flexFieldObject">Flex field object to which the dialog belongs</param>
        /// <param name="exportSettings">Export Settings</param>
        /// <returns>Action string</returns>
        public override async Task<string> BuildActionFromParsedData(WaitActionRenderer.WaitActionData parsedData, ExportDialogData data, GoNorthProject project, ExportPlaceholderErrorCollection errorCollection, FlexFieldObject flexFieldObject, ExportSettings exportSettings)
        {
            if(data.Children != null && data.Children.Count == 1 && data.Children[0].NodeChildId == DirectContinueFunctionNodeId)
            {
                errorCollection.AddWaitActionHasOnlyDirectContinueFunction();
            }

            ExportTemplate actionTemplate = await GetExportTemplate(project);

            string actionCode = ExportUtil.BuildPlaceholderRegex(Placeholder_Wait_Amount).Replace(actionTemplate.Code, parsedData.WaitAmount.ToString());
            actionCode = ExportUtil.RenderPlaceholderIfTrue(actionCode, Placeholder_WaitTypeIsRealTime_Start, Placeholder_WaitTypeIsRealTime_End, parsedData.WaitType == WaitTypeRealTime);
            actionCode = ExportUtil.RenderPlaceholderIfTrue(actionCode, Placeholder_WaitTypeIsGameTime_Start, Placeholder_WaitTypeIsGameTime_End, parsedData.WaitType == WaitTypeGameTime);
            actionCode = ExportUtil.RenderPlaceholderIfTrue(actionCode, Placeholder_WaitUnitIsMilliseconds_Start, Placeholder_WaitUnitIsMilliseconds_End, parsedData.WaitUnit == WaitUnitMilliseconds);
            actionCode = ExportUtil.RenderPlaceholderIfTrue(actionCode, Placeholder_WaitUnitIsSeconds_Start, Placeholder_WaitUnitIsSeconds_End, parsedData.WaitUnit == WaitUnitSeconds);
            actionCode = ExportUtil.RenderPlaceholderIfTrue(actionCode, Placeholder_WaitUnitIsMinutes_Start, Placeholder_WaitUnitIsMinutes_End, parsedData.WaitUnit == WaitUnitMinutes);
            actionCode = ExportUtil.RenderPlaceholderIfTrue(actionCode, Placeholder_WaitUnitIsHours_Start, Placeholder_WaitUnitIsHours_End, parsedData.WaitUnit == WaitUnitHours);
            actionCode = ExportUtil.RenderPlaceholderIfTrue(actionCode, Placeholder_WaitUnitIsDays_Start, Placeholder_WaitUnitIsDays_End, parsedData.WaitUnit == WaitUnitDays);

            string directContinueFunction = string.Empty;
            if(data.Children != null)
            {
                ExportDialogDataChild directStep = data.Children.FirstOrDefault(c => c.NodeChildId == DirectContinueFunctionNodeId);
                directContinueFunction = directStep != null ? directStep.Child.DialogStepFunctionName : string.Empty;
            }
            actionCode = ExportUtil.RenderPlaceholderIfTrue(actionCode, Placeholder_HasDirectContinueFunction_Start, Placeholder_HasDirectContinueFunction_End, !string.IsNullOrEmpty(directContinueFunction));
            actionCode = ExportUtil.RenderPlaceholderIfTrue(actionCode, Placeholder_HasNoDirectContinueFunction_Start, Placeholder_HasNoDirectContinueFunction_End, string.IsNullOrEmpty(directContinueFunction));
            actionCode = ExportUtil.BuildPlaceholderRegex(Placeholder_DirectContinueFunction).Replace(actionCode, directContinueFunction);

            return actionCode;
        }

        /// <summary>
        /// Builds a preview text from parsed data
        /// </summary>
        /// <param name="parsedData">Parsed data</param>
        /// <param name="flexFieldObject">Flex field object to which the dialog belongs</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <param name="child">Child node</param>
        /// <param name="parent">Parent</param>
        /// <returns>Preview text</returns>
        public override Task<string> BuildPreviewTextFromParsedData(WaitActionRenderer.WaitActionData parsedData, FlexFieldObject flexFieldObject, ExportPlaceholderErrorCollection errorCollection, ExportDialogData child, ExportDialogData parent)
        {
            string previewPrefixText = "Wait";
            if(parent != null && parent.Children != null && child != null)
            {
                ExportDialogDataChild actionChild = parent.Children.FirstOrDefault(c => c.Child.Id == child.Id);
                if(actionChild != null && actionChild.NodeChildId == DirectContinueFunctionNodeId)
                {
                    previewPrefixText = "Direct Continue On Wait";
                }
            }
            return Task.FromResult(string.Format("{0} {1}", previewPrefixText, parsedData.WaitAmount));
        }

        
        /// <summary>
        /// Returns the next step from a list of children
        /// </summary>
        /// <param name="children">Children to read</param>
        /// <returns>Next Step</returns>
        public override ExportDialogDataChild GetNextStep(List<ExportDialogDataChild> children)
        {
            return children.FirstOrDefault(c => c.NodeChildId != DirectContinueFunctionNodeId);
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