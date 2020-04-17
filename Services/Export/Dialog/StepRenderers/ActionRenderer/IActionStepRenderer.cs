using System.Collections.Generic;
using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Data.FlexFieldDatabase;
using GoNorth.Services.Export.Placeholder;

namespace GoNorth.Services.Export.Dialog.StepRenderers.ActionRenderer
{
    /// <summary>
    /// Interface for Rendering Action steps
    /// </summary>
    public interface IActionStepRenderer
    {
        /// <summary>
        /// Renders an action step
        /// </summary>
        /// <param name="template">Export template</param>
        /// <param name="data">Dialog Step Data</param>
        /// <param name="nextStep">Next step in the dialog</param>
        /// <param name="flexFieldObject">Flex field object to which the dialog belongs</param>
        /// <param name="actionContent">Content of the action</param>
        /// <returns>Dialog Step Render Result</returns>
        Task<ExportDialogStepRenderResult> RenderDialogStep(ExportTemplate template, ExportDialogData data, ExportDialogDataChild nextStep, FlexFieldObject flexFieldObject, string actionContent);

        /// <summary>
        /// Returns the placeholders for a template
        /// </summary>
        /// <param name="templateType">Template Type</param>
        /// <returns>List of template placeholders</returns>
        List<ExportTemplatePlaceholder> GetPlaceholdersForTemplate(TemplateType templateType);

        /// <summary>
        /// Resets the step rendering values
        /// </summary>
        void ResetStepRenderingValues();

        /// <summary>
        /// Returns true if the renderer returns a value object to render the placeholders
        /// </summary>
        /// <returns>true if the renderer returns a value object to render placeholders, else false</returns>
        bool UsesValueObject();

        /// <summary>
        /// Replaces the base placeholders
        /// </summary>
        /// <param name="errorCollection">Error collection</param>
        /// <param name="code">Code to fill</param>
        /// <param name="data">Dialog Step Data</param>
        /// <param name="nextStep">Next step in the dialog</param>
        /// <param name="flexFieldObject">Flex field object to which the dialog belongs</param>
        /// <returns>Base placeholders</returns>
        Task<string> ReplaceBasePlaceholders(ExportPlaceholderErrorCollection errorCollection, string code, ExportDialogData data, ExportDialogData nextStep, FlexFieldObject flexFieldObject);
        
        /// <summary>
        /// Returns the value object key
        /// </summary>
        /// <returns>Object key</returns>
        string GetValueObjectKey();

        /// <summary>
        /// Returns the base placeholder value object
        /// </summary>
        /// <param name="data">Dialog Step Data</param>
        /// <param name="nextStep">Next step in the dialog</param>
        /// <param name="flexFieldObject">Flex field object to which the dialog belongs</param>
        /// <returns>Base placeholder value object</returns>
        object GetValueObject(ExportDialogData data, ExportDialogData nextStep, FlexFieldObject flexFieldObject);
    }
}