using System.Collections.Generic;
using GoNorth.Services.Export.Placeholder;
using Microsoft.Extensions.Localization;

namespace GoNorth.Services.Export.Dialog.StepRenderers
{
    /// <summary>
    /// Legacy Base Class for Rendering Dialog Steps
    /// </summary>
    public abstract class LegacyBaseStepRenderer
    {
        /// <summary>
        /// Placeholder for node id
        /// </summary>
        private const string Placeholder_NodeId = "Tale_Node_Id";

        /// <summary>
        /// Placeholder for the child node function
        /// </summary>
        private const string Placeholder_ChildNodeFunction = "Tale_ChildNode_Function";

        /// <summary>
        /// Placeholder for the start of content that will only be rendered if the child node has a function
        /// </summary>
        private const string Placeholder_ChildNode_HasFunction_Start = "Tale_ChildNode_HasFunction_Start";

        /// <summary>
        /// Placeholder for the end of content that will only be rendered if the child node has a function
        /// </summary>
        private const string Placeholder_ChildNode_HasFunction_End = "Tale_ChildNode_HasFunction_End";

        /// <summary>
        /// Placeholder for the start of content that will only be rendered if the child node has a function that was not used before
        /// </summary>
        private const string Placeholder_ChildNode_HasUnusedFunction_Start = "Tale_ChildNode_HasUnusedFunction_Start";

        /// <summary>
        /// Placeholder for the end of content that will only be rendered if the child node has a function was not used before
        /// </summary>
        private const string Placeholder_ChildNode_HasUnusedFunction_End = "Tale_ChildNode_HasUnusedFunction_End";

        /// <summary>
        /// Placeholder for the child node unused function
        /// </summary>
        private const string Placeholder_ChildNodeUnusedFunction = "Tale_ChildNode_Unused_Function";

        /// <summary>
        /// Placeholder for the start of content that will only be rendered if the child node has no function
        /// </summary>
        private const string Placeholder_ChildNode_HasNoFunction_Start = "Tale_ChildNode_HasNoFunction_Start";

        /// <summary>
        /// Placeholder for the end of content that will only be rendered if the child node has no function
        /// </summary>
        private const string Placeholder_ChildNode_HasNoFunction_End = "Tale_ChildNode_HasNoFunction_End";

        /// <summary>
        /// Placeholder for the start of the check if the current step has a child node
        /// </summary>
        private const string Placeholder_HasChild_Start = "Tale_HasChild_Start";

        /// <summary>
        /// Placeholder for the end of the check if the current step has a child node
        /// </summary>
        private const string Placeholder_HasChild_End = "Tale_HasChild_End";

        /// <summary>
        /// Placeholder for the start of the check if the current step has no child node
        /// </summary>
        private const string Placeholder_HasNoChild_Start = "Tale_HasNoChild_Start";

        /// <summary>
        /// Placeholder for the end of the check if the current step has no child node
        /// </summary>
        private const string Placeholder_HasNoChild_End = "Tale_HasNoChild_End";

        /// <summary>
        /// Placeholder for the start of the check if child node is of a specific type (PlayerLine, TextLine, Choice, Action, Condition)
        /// </summary>
        private const string Placeholder_IsChildNodeOfType_Start = "Tale_IsChildNodeOfType\\((.*?)\\)_Start";

        /// <summary>
        /// Placeholder for the start of the check if child node is of a specific type (PlayerLine, TextLine, Choice, Action, Condition)
        /// </summary>
        private const string Placeholder_IsChildNodeOfType_Start_FriendlyName = "Tale_IsChildNodeOfType(<<TypeName>>)_Start";

        /// <summary>
        /// Placeholder for the start of the check if child node is of a specific type (PlayerLine, TextLine, Choice, Action, Condition)
        /// </summary>
        private const string Placeholder_IsChildNodeOfType_End = "Tale_IsChildNodeOfType_End";

        /// <summary>
        /// Placeholder for the start of the check if child node is not of a specific type (PlayerLine, TextLine, Choice, Action, Condition)
        /// </summary>
        private const string Placeholder_IsChildNodeNotOfType_Start = "Tale_IsChildNodeNotOfType\\((.*?)\\)_Start";

        /// <summary>
        /// Placeholder for the start of the check if child node is not of a specific type (PlayerLine, TextLine, Choice, Action, Condition)
        /// </summary>
        private const string Placeholder_IsChildNodeNotOfType_Start_FriendlyName = "Tale_IsChildNodeNotOfType(<<TypeName>>)_Start";

        /// <summary>
        /// Placeholder for the start of the check if child node is not of a specific type (PlayerLine, TextLine, Choice, Action, Condition)
        /// </summary>
        private const string Placeholder_IsChildNodeNotOfType_End = "Tale_IsChildNodeNotOfType_End";

        /// <summary>
        /// Error Collection
        /// </summary>
        protected readonly ExportPlaceholderErrorCollection _errorCollection;

        /// <summary>
        /// Base Renderer Localizer
        /// </summary>
        private readonly IStringLocalizer _baseLocalizer;

        /// <summary>
        /// true if the child node function was used
        /// </summary>
        protected bool _childNodeFunctionWasUsed;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="errorCollection">Error Collection</param>
        /// <param name="localizerFactory">Localizer Factor</param>
        public LegacyBaseStepRenderer(ExportPlaceholderErrorCollection errorCollection, IStringLocalizerFactory localizerFactory)
        {
            _errorCollection = errorCollection;
            _baseLocalizer = localizerFactory.Create(typeof(LegacyBaseStepRenderer));
            _childNodeFunctionWasUsed = false;
        }

        /// <summary>
        /// Sets the export template placeholder resolver
        /// </summary>
        /// <param name="templatePlaceholderResolver">Template placeholder resolver</param>
        public virtual void SetExportTemplatePlaceholderResolver(IExportTemplatePlaceholderResolver templatePlaceholderResolver) { }

        /// <summary>
        /// Replaces the node id
        /// </summary>
        /// <param name="code">Code to update</param>
        /// <param name="curStep">Cur Step</param>
        /// <returns>Updated</returns>
        public string ReplaceNodeId(string code, ExportDialogData curStep)
        {
            code = ExportUtil.BuildPlaceholderRegex(Placeholder_NodeId).Replace(code, curStep.NodeIndex.ToString());
            return code;
        }

        /// <summary>
        /// Renders a dialog step
        /// </summary>
        /// <param name="code">Code to update</param>
        /// <param name="curStep">Current Step</param>
        /// <param name="nextStep">Next step</param>
        /// <returns>Updated code</returns>
        public string ReplaceBaseStepPlaceholders(string code, ExportDialogData curStep, ExportDialogData nextStep)
        {
            code = ReplaceNodeId(code, curStep);
            code = ExportUtil.RenderPlaceholderIfTrue(code, Placeholder_HasChild_Start, Placeholder_HasChild_End, nextStep != null);
            code = ExportUtil.RenderPlaceholderIfTrue(code, Placeholder_HasNoChild_Start, Placeholder_HasNoChild_End, nextStep == null);
            code = ExportUtil.RenderPlaceholderIfFuncTrue(code, Placeholder_IsChildNodeOfType_Start, Placeholder_IsChildNodeOfType_End, m => {
                return m.Groups[1].Value.ToLowerInvariant() == GetStepType(nextStep);
            });
            code = ExportUtil.RenderPlaceholderIfFuncTrue(code, Placeholder_IsChildNodeNotOfType_Start, Placeholder_IsChildNodeNotOfType_End, m => {
                return m.Groups[1].Value.ToLowerInvariant() != GetStepType(nextStep);
            });
            bool hasChildFunction = nextStep != null && !string.IsNullOrEmpty(nextStep.DialogStepFunctionName);
            code = ExportUtil.RenderPlaceholderIfTrue(code, Placeholder_ChildNode_HasFunction_Start, Placeholder_ChildNode_HasFunction_End, hasChildFunction);
            code = ExportUtil.RenderPlaceholderIfTrue(code, Placeholder_ChildNode_HasNoFunction_Start, Placeholder_ChildNode_HasNoFunction_End, !hasChildFunction);
            code = ExportUtil.BuildPlaceholderRegex(Placeholder_ChildNodeFunction).Replace(code, m => {
                _childNodeFunctionWasUsed = true;
                if(nextStep == null)
                {
                    _errorCollection.AddNodeHasNoChildForFunction();
                    return string.Empty;
                }

                return nextStep.DialogStepFunctionName;
            });
            code = ExportUtil.RenderPlaceholderIfTrue(code, Placeholder_ChildNode_HasUnusedFunction_Start, Placeholder_ChildNode_HasUnusedFunction_End, !_childNodeFunctionWasUsed && hasChildFunction);
            code = ExportUtil.BuildPlaceholderRegex(Placeholder_ChildNodeUnusedFunction).Replace(code, m => {
                if(nextStep == null)
                {
                    _errorCollection.AddNodeHasNoChildForFunction();
                    return string.Empty;
                }

                return nextStep.DialogStepFunctionName;
            });

            return code;
        }

        /// <summary>
        /// Returns the stept type
        /// </summary>
        /// <param name="nextStep">Next Step</param>
        /// <returns>Step Type</returns>
        private string GetStepType(ExportDialogData nextStep)
        {
            if(nextStep == null)
            {
                return string.Empty;
            }

            return nextStep.GetNodeType().ToLowerInvariant();
        }

        /// <summary>
        /// Returns the base placeholders
        /// </summary>
        /// <returns>List of template placeholders</returns>
        public List<ExportTemplatePlaceholder> GetBasePlaceholdersForTemplate()
        {
            return new List<ExportTemplatePlaceholder> {
                ExportUtil.CreatePlaceHolder(Placeholder_ChildNodeFunction, _baseLocalizer),
                ExportUtil.CreatePlaceHolder(Placeholder_ChildNode_HasFunction_Start, _baseLocalizer),
                ExportUtil.CreatePlaceHolder(Placeholder_ChildNode_HasFunction_End, _baseLocalizer),
                ExportUtil.CreatePlaceHolder(Placeholder_ChildNode_HasNoFunction_Start, _baseLocalizer),
                ExportUtil.CreatePlaceHolder(Placeholder_ChildNode_HasNoFunction_End, _baseLocalizer),
                ExportUtil.CreatePlaceHolder(Placeholder_ChildNodeUnusedFunction, _baseLocalizer),
                ExportUtil.CreatePlaceHolder(Placeholder_ChildNode_HasUnusedFunction_Start, _baseLocalizer),
                ExportUtil.CreatePlaceHolder(Placeholder_ChildNode_HasUnusedFunction_End, _baseLocalizer),
                ExportUtil.CreatePlaceHolder(Placeholder_NodeId, _baseLocalizer),
                ExportUtil.CreatePlaceHolder(Placeholder_HasChild_Start, _baseLocalizer),
                ExportUtil.CreatePlaceHolder(Placeholder_HasChild_End, _baseLocalizer),
                ExportUtil.CreatePlaceHolder(Placeholder_HasNoChild_Start, _baseLocalizer),
                ExportUtil.CreatePlaceHolder(Placeholder_HasNoChild_End, _baseLocalizer),
                ExportUtil.CreatePlaceHolder(Placeholder_IsChildNodeOfType_Start_FriendlyName, _baseLocalizer),
                ExportUtil.CreatePlaceHolder(Placeholder_IsChildNodeOfType_End, _baseLocalizer),
                ExportUtil.CreatePlaceHolder(Placeholder_IsChildNodeNotOfType_Start_FriendlyName, _baseLocalizer),
                ExportUtil.CreatePlaceHolder(Placeholder_IsChildNodeNotOfType_End, _baseLocalizer)
            };
        }
    }
}