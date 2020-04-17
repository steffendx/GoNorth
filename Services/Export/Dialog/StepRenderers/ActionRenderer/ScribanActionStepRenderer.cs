using System.Collections.Generic;
using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Data.FlexFieldDatabase;
using GoNorth.Services.Export.Data;
using GoNorth.Services.Export.Dialog.StepRenderers.RenderingObjects;
using GoNorth.Services.Export.Placeholder;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.Include;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.Util;
using Microsoft.Extensions.Localization;
using Scriban;
using Scriban.Runtime;

namespace GoNorth.Services.Export.Dialog.StepRenderers.ActionRenderer
{
    /// <summary>
    /// Scriban class for Rendering Action steps
    /// </summary>
    public class ScribanActionStepRenderer : ScribanBaseStepRenderer, IActionStepRenderer
    {
        /// <summary>
        /// Action key
        /// </summary>
        private const string ActionKey = "action_node";

        /// <summary>
        /// Export cached Db Access
        /// </summary>
        private readonly IExportCachedDbAccess _exportCachedDbAccess;

        /// <summary>
        /// Returns the next step Node data
        /// </summary>
        private ScribanDialogStepBaseDataWithNextNode _nextStepNodeData = null;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="exportCachedDbAccess">Export cached Db access</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <param name="exportSettings">Export settings</param>
        /// <param name="localizerFactory">Localizer factory</param>
        public ScribanActionStepRenderer(IExportCachedDbAccess exportCachedDbAccess, ExportPlaceholderErrorCollection errorCollection, ExportSettings exportSettings, IStringLocalizerFactory localizerFactory) : 
                                         base(errorCollection, exportSettings, localizerFactory)
        {
            _exportCachedDbAccess = exportCachedDbAccess;
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
        public async Task<ExportDialogStepRenderResult> RenderDialogStep(ExportTemplate template, ExportDialogData data, ExportDialogDataChild nextStep, FlexFieldObject flexFieldObject, string actionContent)
        {
            ExportDialogStepRenderResult renderResult = new ExportDialogStepRenderResult();
            
            Template parsedTemplate = ScribanParsingUtil.ParseTemplate(template.Code, _errorCollection);
            if (parsedTemplate == null)
            {
                return renderResult;
            }

            ScribanAction actionData = BuildDialogRenderObject<ScribanAction>(data, nextStep != null ? nextStep.Child : null, flexFieldObject);
            actionData.Content = actionContent;

            if(_nextStepNodeData != null)
            {
                actionData.NodeStepFunctionWasUsed = _nextStepNodeData.NodeStepFunctionWasUsed;
                if(actionData.ChildNode != null && _nextStepNodeData.ChildNode != null)
                {
                    actionData.ChildNode.NodeStepFunctionWasUsed = _nextStepNodeData.ChildNode.NodeStepFunctionWasUsed;
                }
            }

            TemplateContext context = BuildTemplateContext(actionData);

            renderResult.StepCode = await parsedTemplate.RenderAsync(context);

            return renderResult;
        }

        /// <summary>
        /// Builds the template context for exporting
        /// </summary>
        /// <param name="actionData">Action data to export</param>
        /// <returns>Template context</returns>
        private TemplateContext BuildTemplateContext<T>(T actionData)
        {
            ScriptObject exportObject = new ScriptObject();
            exportObject.Add(ActionKey, actionData);
            TemplateContext context = new TemplateContext();
            context.TemplateLoader = new ScribanIncludeTemplateLoader(_exportCachedDbAccess, _errorCollection);
            context.PushGlobal(exportObject);
            return context;
        }

        /// <summary>
        /// Returns the placeholders for a template
        /// </summary>
        /// <param name="templateType">Template Type</param>
        /// <returns>List of template placeholders</returns>
        public List<ExportTemplatePlaceholder> GetPlaceholdersForTemplate(TemplateType templateType)
        {
            List<ExportTemplatePlaceholder> placeholders = GetNodePlaceholders<ScribanAction>(ActionKey);

            return placeholders;
        }
        
        /// <summary>
        /// Resets the step rendering values
        /// </summary>
        public void ResetStepRenderingValues()
        {
            _nextStepNodeData = null;
        }
        
        /// <summary>
        /// Returns true if the renderer returns a value object to render the placeholders
        /// </summary>
        /// <returns>true if the renderer returns a value object to render placeholders, else false</returns>
        public bool UsesValueObject() { return true; }

        /// <summary>
        /// Replaces the base placeholders
        /// </summary>
        /// <param name="errorCollection">Error collection</param>
        /// <param name="code">Code to fill</param>
        /// <param name="data">Dialog Step Data</param>
        /// <param name="nextStep">Next step in the dialog</param>
        /// <param name="flexFieldObject">Flex field object to which the dialog belongs</param>
        /// <returns>Base placeholders</returns>
        public async Task<string> ReplaceBasePlaceholders(ExportPlaceholderErrorCollection errorCollection, string code, ExportDialogData data, ExportDialogData nextStep, FlexFieldObject flexFieldObject)
        {
            Template parsedTemplate = ScribanParsingUtil.ParseTemplate(code, _errorCollection);
            if (parsedTemplate == null)
            {
                return code;
            }

            ScribanDialogStepBaseDataWithNextNode nodeData = GetBaseNodeData(data, nextStep, flexFieldObject); 
            TemplateContext context = BuildTemplateContext(nodeData);

            return await parsedTemplate.RenderAsync(context);
        }

        /// <summary>
        /// Returns the value object key
        /// </summary>
        /// <returns>Object key</returns>
        public string GetValueObjectKey() { return ActionKey; }

        /// <summary>
        /// Returns the base placeholder value object
        /// </summary>
        /// <param name="data">Dialog Step Data</param>
        /// <param name="nextStep">Next step in the dialog</param>
        /// <param name="flexFieldObject">Flex field object to which the dialog belongs</param>
        /// <returns>Base placeholder value object</returns>
        public object GetValueObject(ExportDialogData data, ExportDialogData nextStep, FlexFieldObject flexFieldObject) 
        { 
            return GetBaseNodeData(data, nextStep, flexFieldObject); 
        }

        /// <summary>
        /// Returns the node data to render the base data
        /// </summary>
        /// <param name="data">Dialog Step Data</param>
        /// <param name="nextStep">Next step in the dialog</param>
        /// <param name="flexFieldObject">Flex field object to which the dialog belongs</param>
        /// <returns>Node base data</returns>
        private ScribanDialogStepBaseDataWithNextNode GetBaseNodeData(ExportDialogData data, ExportDialogData nextStep, FlexFieldObject flexFieldObject) 
        {
            if(_nextStepNodeData == null)
            {
                _nextStepNodeData = BuildDialogRenderObject<ScribanDialogStepBaseDataWithNextNode>(data, nextStep, flexFieldObject);
            }

            return _nextStepNodeData;
        }
    }
}