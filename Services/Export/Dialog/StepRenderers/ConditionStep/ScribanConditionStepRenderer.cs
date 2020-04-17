using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Data.FlexFieldDatabase;
using GoNorth.Data.NodeGraph;
using GoNorth.Data.Project;
using GoNorth.Services.Export.Data;
using GoNorth.Services.Export.Dialog.StepRenderers.RenderingObjects;
using GoNorth.Services.Export.Placeholder;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.Include;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.Util;
using Microsoft.Extensions.Localization;
using Scriban;
using Scriban.Runtime;

namespace GoNorth.Services.Export.Dialog.StepRenderers.ConditionStep
{
    /// <summary>
    /// Scriban class for Rendering Condition steps
    /// </summary>
    public class ScribanConditionStepRenderer : ScribanBaseStepRenderer, IConditionStepRenderer
    {
        /// <summary>
        /// Condition key
        /// </summary>
        private const string ConditionKey = "condition";

        /// <summary>
        /// Export cached Db access
        /// </summary>
        private readonly IExportCachedDbAccess _exportCachedDbAccess;

        /// <summary>
        /// Condition Renderer
        /// </summary>
        private readonly IConditionRenderer _conditionRenderer;

        /// <summary>
        /// Current Project
        /// </summary>
        private readonly GoNorthProject _project;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="exportCachedDbAccess">Export cached Db access</param>
        /// <param name="exportSettings">Export Settings</param>
        /// <param name="conditionRenderer">Condition Renderer</param>
        /// <param name="localizerFactory">Localizer Factory</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <param name="project">Project</param>
        public ScribanConditionStepRenderer(IExportCachedDbAccess exportCachedDbAccess, ExportSettings exportSettings, ExportPlaceholderErrorCollection errorCollection, IConditionRenderer conditionRenderer, IStringLocalizerFactory localizerFactory, GoNorthProject project) :
                                            base(errorCollection, exportSettings, localizerFactory)
        {
            _exportCachedDbAccess = exportCachedDbAccess;
            _conditionRenderer = conditionRenderer;
            _project = project;
        }

        /// <summary>
        /// Renders a condition step
        /// </summary>
        /// <param name="template">Export template</param>
        /// <param name="data">Dialog Step Data</param>
        /// <param name="flexFieldObject">Flex field object to which the dialog belongs</param>
        /// <param name="conditionNode">Condition node to render</param>
        /// <returns>Dialog Step Render Result</returns>
        public async Task<ExportDialogStepRenderResult> RenderDialogStep(ExportTemplate template, ExportDialogData data, FlexFieldObject flexFieldObject, ConditionNode conditionNode)
        {
            ExportDialogStepRenderResult renderResult = new ExportDialogStepRenderResult();

            Template parsedTemplate = ScribanParsingUtil.ParseTemplate(template.Code, _errorCollection);
            if (parsedTemplate == null)
            {
                return renderResult;
            }

            ScribanCondition conditionData = new ScribanCondition();
            SetRenderObjectBaseDataFromFlexFieldObject(conditionData, data, flexFieldObject);
            conditionData.AllConditions = await BuildAllConditions(data, flexFieldObject, conditionNode);
            conditionData.Conditions = conditionData.AllConditions.Where(c => c.ChildNode != null).ToList();
            conditionData.Else = BuildElsePart(data, flexFieldObject);

            TemplateContext context = BuildTemplateContext(conditionData);

            renderResult.StepCode = await parsedTemplate.RenderAsync(context);
            
            return renderResult;
        }

        /// <summary>
        /// Builds an array with all conditions
        /// </summary>
        /// <param name="data">Dialog Step Data</param>
        /// <param name="flexFieldObject">Flex field object to which the dialog belongs</param>
        /// <param name="conditionNode">Condition node</param>
        /// <returns>List of condition entries</returns>
        private async Task<List<ScribanConditionEntry>> BuildAllConditions(ExportDialogData data, FlexFieldObject flexFieldObject, ConditionNode conditionNode)
        {
            if(conditionNode.Conditions == null)
            {
                return new List<ScribanConditionEntry>();
            }

            List<ScribanConditionEntry> conditionEntries = new List<ScribanConditionEntry>();
            foreach(Condition curCondition in conditionNode.Conditions)
            {
                ScribanConditionEntry conditionEntry = await BuildConditionEntry(data.Children.FirstOrDefault(c => c.NodeChildId == curCondition.Id), flexFieldObject, curCondition);
                conditionEntries.Add(conditionEntry);
            }

            return conditionEntries;
        }

        /// <summary>
        /// Builds a condition entry
        /// </summary>
        /// <param name="childElement">Dialog child element</param>
        /// <param name="flexFieldObject">Flex field object to which the dialog belongs</param>
        /// <param name="condition">Condition to map</param>
        /// <returns>Mapped condition</returns>
        private async Task<ScribanConditionEntry> BuildConditionEntry(ExportDialogDataChild childElement, FlexFieldObject flexFieldObject, Condition condition)
        {
            ScribanConditionEntry conditionEntry = new ScribanConditionEntry();
            conditionEntry.Id = condition.Id;
            conditionEntry.Condition = await _conditionRenderer.RenderCondition(_project, condition, _errorCollection, flexFieldObject, _exportSettings);
            conditionEntry.ChildNode = null;
            if(childElement != null && childElement.Child != null)
            {
                ScribanDialogStepBaseData childData = new ScribanDialogStepBaseData();
                SetRenderObjectBaseDataFromFlexFieldObject(childData, childElement.Child, flexFieldObject);
                conditionEntry.ChildNode = childData;
            }

            return conditionEntry;
        }

        /// <summary>
        /// Builds the else part
        /// </summary>
        /// <param name="data">Dialog Step Data</param>
        /// <param name="flexFieldObject">Flex field object to which the dialog belongs</param>
        /// <returns>Mapped else part</returns>
        private ScribanDialogStepBaseData BuildElsePart(ExportDialogData data, FlexFieldObject flexFieldObject)
        {
            ExportDialogDataChild elseChild = data.Children.FirstOrDefault(c => c.NodeChildId == ExportConstants.ConditionElseNodeChildId);
            if(elseChild == null || elseChild.Child == null)
            {
                return null;
            }

            ScribanDialogStepBaseData childData = new ScribanDialogStepBaseData();
            SetRenderObjectBaseDataFromFlexFieldObject(childData, elseChild.Child, flexFieldObject);
            return childData;
        }

        /// <summary>
        /// Builds the template context for exporting
        /// </summary>
        /// <param name="conditionData">Condition data to export</param>
        /// <returns>Template context</returns>
        private TemplateContext BuildTemplateContext(ScribanCondition conditionData)
        {
            ScriptObject exportObject = new ScriptObject();
            exportObject.Add(ConditionKey, conditionData);
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
            List<ExportTemplatePlaceholder> placeholders = GetNodePlaceholders<ScribanCondition>(ConditionKey);

            return placeholders;
        }
    }
}