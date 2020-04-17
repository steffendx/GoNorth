using System.Collections.Generic;
using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Data.FlexFieldDatabase;
using GoNorth.Services.Export.Placeholder;
using Microsoft.Extensions.Localization;

namespace GoNorth.Services.Export.Dialog.StepRenderers.ActionRenderer
{
    /// <summary>
    /// Legacy class for Rendering Action steps
    /// </summary>
    public class LegacyActionStepRenderer : LegacyBaseStepRenderer, IActionStepRenderer
    {
        /// <summary>
        /// Action content
        /// </summary>
        private const string Placeholder_ActionContent = "Tale_Action_Content";

        /// <summary>
        /// String Localizer
        /// </summary>
        private readonly IStringLocalizer _localizer;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="errorCollection">Error Collection</param>
        /// <param name="localizerFactory">Localizer factory</param>
        public LegacyActionStepRenderer(ExportPlaceholderErrorCollection errorCollection, IStringLocalizerFactory localizerFactory) : base(errorCollection, localizerFactory)
        {
            _localizer = localizerFactory.Create(typeof(LegacyActionStepRenderer));
        }

        /// <summary>
        /// Renders an action step
        /// </summary>
        /// <param name="template">Export template</param>
        /// <param name="data">Dialog Step Data</param>
        /// <param name="nextStep">Next step in the dialog</param>
        /// <param name="flexFieldObject">Flex field object to which the dialog belongs</param>
        /// <param name="actionContent">Content of the action</param>
        /// <returns>Dialog Step Render Result</returns>
        public Task<ExportDialogStepRenderResult> RenderDialogStep(ExportTemplate template, ExportDialogData data, ExportDialogDataChild nextStep, FlexFieldObject flexFieldObject, string actionContent)
        {
            ExportDialogStepRenderResult renderResult = new ExportDialogStepRenderResult();
            renderResult.StepCode = ExportUtil.BuildPlaceholderRegex(Placeholder_ActionContent).Replace(template.Code, actionContent);
            renderResult.StepCode = ReplaceBaseStepPlaceholders(renderResult.StepCode, data, nextStep != null ? nextStep.Child : null);

            return Task.FromResult(renderResult);
        }

        /// <summary>
        /// Returns the placeholders for a template
        /// </summary>
        /// <param name="templateType">Template Type</param>
        /// <returns>List of template placeholders</returns>
        public List<ExportTemplatePlaceholder> GetPlaceholdersForTemplate(TemplateType templateType)
        {
            List<ExportTemplatePlaceholder> placeholders = GetBasePlaceholdersForTemplate();
            placeholders.Add(ExportUtil.CreatePlaceHolder(Placeholder_ActionContent, _localizer));
            
            return placeholders;
        }

        /// <summary>
        /// Resets the step rendering values
        /// </summary>
        public void ResetStepRenderingValues()
        {
            _childNodeFunctionWasUsed = false;
        }

        /// <summary>
        /// Returns true if the renderer returns a value object to render the placeholders
        /// </summary>
        /// <returns>true if the renderer returns a value object to render placeholders, else false</returns>
        public bool UsesValueObject() { return false; }

        /// <summary>
        /// Replaces the base placeholders
        /// </summary>
        /// <param name="errorCollection">Error collection</param>
        /// <param name="code">Code to fill</param>
        /// <param name="data">Dialog Step Data</param>
        /// <param name="nextStep">Next step in the dialog</param>
        /// <param name="flexFieldObject">Flex field object to which the dialog belongs</param>
        /// <returns>Base placeholders</returns>
        public Task<string> ReplaceBasePlaceholders(ExportPlaceholderErrorCollection errorCollection, string code, ExportDialogData data, ExportDialogData nextStep, FlexFieldObject flexFieldObject)
        {
            return Task.FromResult(ReplaceBaseStepPlaceholders(code, data, nextStep));
        }
        
        /// <summary>
        /// Returns the value object key
        /// </summary>
        /// <returns>Object key</returns>
        public string GetValueObjectKey() { return ""; }

        /// <summary>
        /// Returns the base placeholder value object
        /// </summary>
        /// <param name="data">Dialog Step Data</param>
        /// <param name="nextStep">Next step in the dialog</param>
        /// <param name="flexFieldObject">Flex field object to which the dialog belongs</param>
        /// <returns>Base placeholder value object</returns>
        public object GetValueObject(ExportDialogData data, ExportDialogData nextStep, FlexFieldObject flexFieldObject) { return null; }
    }
}