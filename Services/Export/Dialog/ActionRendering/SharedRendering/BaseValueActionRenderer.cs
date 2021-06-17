using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Data.FlexFieldDatabase;
using GoNorth.Data.Project;
using GoNorth.Services.Export.Data;
using GoNorth.Services.Export.Dialog.ActionConditionShared;
using GoNorth.Services.Export.Dialog.ActionRendering.ConfigObject;
using GoNorth.Services.Export.Dialog.StepRenderers.ActionRenderer;
using GoNorth.Services.Export.Placeholder;

namespace GoNorth.Services.Export.Dialog.ActionRendering.SharedRendering
{
    /// <summary>
    /// Base Class for rendering a value action
    /// </summary>
    public abstract class BaseValueActionRenderer : BaseActionRenderer<ValueFieldActionData>
    {
        /// <summary>
        /// Default Template Provider
        /// </summary>
        protected readonly ICachedExportDefaultTemplateProvider _defaultTemplateProvider;

        /// <summary>
        /// Cached Db Access
        /// </summary>
        protected readonly IExportCachedDbAccess _cachedDbAccess;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="defaultTemplateProvider">Default Template Provider</param>
        /// <param name="cachedDbAccess">Cached Db Access</param>        
        public BaseValueActionRenderer(ICachedExportDefaultTemplateProvider defaultTemplateProvider, IExportCachedDbAccess cachedDbAccess)
        {
            _defaultTemplateProvider = defaultTemplateProvider;
            _cachedDbAccess = cachedDbAccess;
        }

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
        public override async Task<string> BuildActionFromParsedData(ExportTemplate template, ValueFieldActionData parsedData, ExportDialogData data, ExportDialogData nextStep, GoNorthProject project, ExportPlaceholderErrorCollection errorCollection, 
                                                                     FlexFieldObject flexFieldObject, ExportSettings exportSettings, IActionStepRenderer stepRenderer)
        {
            IFlexFieldExportable valueObject = await GetValueObject(parsedData, flexFieldObject, errorCollection);
            if(valueObject == null)
            {
                return string.Empty;
            }

            string actionOperator = await GetOperatorFromTemplate(project, parsedData.Operator, errorCollection);
            return await FillPlaceholders(template, errorCollection, parsedData, valueObject, actionOperator, flexFieldObject, data, nextStep, exportSettings, stepRenderer);
        }

        /// <summary>
        /// Fills the placeholders
        /// </summary>
        /// <param name="template">Template to use</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <param name="parsedData">Parsed config data</param>
        /// <param name="valueObject">Value object to use</param>
        /// <param name="actionOperator">Action operator to use</param>
        /// <param name="flexFieldObject">Flex field object to which the dialog belongs</param>
        /// <param name="curStep">Current step that is rendered</param>
        /// <param name="nextStep">Next step that is being rendered</param>
        /// <param name="exportSettings">Export Settings</param>
        /// <param name="stepRenderer">Action Step renderer</param>
        /// <returns>Filled placeholders</returns>
        protected abstract Task<string> FillPlaceholders(ExportTemplate template, ExportPlaceholderErrorCollection errorCollection, ValueFieldActionData parsedData, IFlexFieldExportable valueObject, string actionOperator, 
                                                         FlexFieldObject flexFieldObject, ExportDialogData curStep, ExportDialogData nextStep, ExportSettings exportSettings, IActionStepRenderer stepRenderer);

       
        /// <summary>
        /// Returns the operator from the template of the action
        /// </summary>
        /// <param name="project">Project</param>
        /// <param name="actionOperator">Action Operator</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <returns>Action Operator</returns>
        private async Task<string> GetOperatorFromTemplate(GoNorthProject project, string actionOperator, ExportPlaceholderErrorCollection errorCollection)
        {
            if(actionOperator == null)
            {
                actionOperator = string.Empty;
            }

            switch(actionOperator.ToLowerInvariant())
            {
            case "=":
                return (await _defaultTemplateProvider.GetDefaultTemplateByType(project.Id, TemplateType.GeneralChangeOperatorAssign)).Code;
            case "+=":
                return (await _defaultTemplateProvider.GetDefaultTemplateByType(project.Id, TemplateType.GeneralChangeOperatorAddTo)).Code;
            case "-=":
                return (await _defaultTemplateProvider.GetDefaultTemplateByType(project.Id, TemplateType.GeneralChangeOperatorSubstractFrom)).Code;
            case "*=":
                return (await _defaultTemplateProvider.GetDefaultTemplateByType(project.Id, TemplateType.GeneralChangeOperatorMultiply)).Code;
            case "/=":
                return (await _defaultTemplateProvider.GetDefaultTemplateByType(project.Id, TemplateType.GeneralChangeOperatorDivide)).Code;
            }

            errorCollection.AddDialogUnknownActionOperator(actionOperator);
            return string.Empty;
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
        public override async Task<string> BuildPreviewTextFromParsedData(ValueFieldActionData parsedData, FlexFieldObject flexFieldObject, ExportPlaceholderErrorCollection errorCollection, ExportDialogData child, ExportDialogData parent)
        {
            IFlexFieldExportable valueObject = await GetValueObject(parsedData, flexFieldObject, errorCollection);
            if(valueObject == null)
            {
                return string.Empty;
            }

            FlexField exportField = DialogFlexFieldUtil.GetFlexField(valueObject, parsedData.FieldId);
            if(exportField == null)
            {
                errorCollection.AddErrorFlexField(parsedData.FieldName, valueObject.Name);
                return string.Empty;
            }

            string fieldName = DialogFlexFieldUtil.GetFieldName(exportField, parsedData.FieldName, errorCollection);

            return GetPreviewPrefix() + " (" + fieldName + ")";
        }

        /// <summary>
        /// Returns the preview prefix
        /// </summary>
        /// <returns>Preview prefix</returns>
        protected abstract string GetPreviewPrefix();

        /// <summary>
        /// Returns the value object to use
        /// </summary>
        /// <param name="parsedData">Parsed data</param>
        /// <param name="flexFieldObject">Flex Field object</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <returns>Value Object</returns>
        protected abstract Task<IFlexFieldExportable> GetValueObject(ValueFieldActionData parsedData, FlexFieldObject flexFieldObject, ExportPlaceholderErrorCollection errorCollection);

    }
}