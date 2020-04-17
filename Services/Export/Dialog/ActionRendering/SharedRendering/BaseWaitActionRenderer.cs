using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Data.FlexFieldDatabase;
using GoNorth.Data.Project;
using GoNorth.Services.Export.Dialog.ActionRendering.ConfigObject;
using GoNorth.Services.Export.Dialog.StepRenderers.ActionRenderer;
using GoNorth.Services.Export.Placeholder;

namespace GoNorth.Services.Export.Dialog.ActionRendering.SharedRendering
{
    /// <summary>
    /// Class for rendering a wait action
    /// </summary>
    public abstract class BaseWaitActionRenderer : BaseActionRenderer<WaitActionData>
    {
        /// <summary>
        /// Id of the direct continue node
        /// </summary>
        protected const int DirectContinueFunctionNodeId = 1;

        /// <summary>
        /// Builds an action from parsed data
        /// </summary>
        /// <param name="template">Template to export</param>
        /// <param name="parsedData">Parsed data</param>
        /// <param name="data">Dialog data</param>
        /// <param name="nextStep">Next step in the dialog</param>
        /// <param name="project">Project</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <param name="flexFieldObject">Flex field object to which the dialog belongs</param>
        /// <param name="exportSettings">Export Settings</param>
        /// <param name="stepRenderer">Action Step renderer</param>
        /// <returns>Action string</returns>
        public override async Task<string> BuildActionFromParsedData(ExportTemplate template, WaitActionData parsedData, ExportDialogData data, ExportDialogData nextStep, GoNorthProject project, ExportPlaceholderErrorCollection errorCollection, 
                                                                     FlexFieldObject flexFieldObject, ExportSettings exportSettings, IActionStepRenderer stepRenderer)
        {
            if(data.Children != null && data.Children.Count == 1 && data.Children[0].NodeChildId == DirectContinueFunctionNodeId)
            {
                errorCollection.AddWaitActionHasOnlyDirectContinueFunction();
            }
            
            string directContinueFunction = string.Empty;
            if(data.Children != null)
            {
                ExportDialogDataChild directStep = data.Children.FirstOrDefault(c => c.NodeChildId == DirectContinueFunctionNodeId);
                directContinueFunction = directStep != null ? directStep.Child.DialogStepFunctionName : string.Empty;
            }

            return await FillPlaceholders(template, errorCollection, parsedData, directContinueFunction, flexFieldObject, data, nextStep, stepRenderer);
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
        protected abstract Task<string> FillPlaceholders(ExportTemplate template, ExportPlaceholderErrorCollection errorCollection, WaitActionData parsedData, string directContinueFunction, FlexFieldObject flexFieldObject,
                                                         ExportDialogData curStep, ExportDialogData nextStep, IActionStepRenderer stepRenderer);

        /// <summary>
        /// Builds a preview text from parsed data
        /// </summary>
        /// <param name="parsedData">Parsed data</param>
        /// <param name="flexFieldObject">Flex field object to which the dialog belongs</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <param name="child">Child node</param>
        /// <param name="parent">Parent</param>
        /// <returns>Preview text</returns>
        public override Task<string> BuildPreviewTextFromParsedData(WaitActionData parsedData, FlexFieldObject flexFieldObject, ExportPlaceholderErrorCollection errorCollection, ExportDialogData child, ExportDialogData parent)
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
    }
}