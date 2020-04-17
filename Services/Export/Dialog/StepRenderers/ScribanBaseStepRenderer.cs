using System.Collections.Generic;
using GoNorth.Data.Exporting;
using GoNorth.Data.FlexFieldDatabase;
using GoNorth.Services.Export.Dialog.StepRenderers.RenderingObjects;
using GoNorth.Services.Export.Placeholder;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.RenderingObjects;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.Util;
using Microsoft.Extensions.Localization;
using Scriban;
using Scriban.Runtime;

namespace GoNorth.Services.Export.Dialog.StepRenderers
{
    /// <summary>
    /// Base Class for Rendering Dialog Steps with Scriban
    /// </summary>
    public abstract class ScribanBaseStepRenderer
    {
        /// <summary>
        /// Error Collection
        /// </summary>
        protected readonly ExportPlaceholderErrorCollection _errorCollection;

        /// <summary>
        /// Export Settings
        /// </summary>
        protected readonly ExportSettings _exportSettings;

        /// <summary>
        /// String Localizer Factory
        /// </summary>
        protected readonly IStringLocalizerFactory _localizerFactory;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="errorCollection">Error Collection</param>
        /// <param name="exportSettings">Export settings</param>
        /// <param name="localizerFactory">Localizer Factor</param>
        public ScribanBaseStepRenderer(ExportPlaceholderErrorCollection errorCollection, ExportSettings exportSettings, IStringLocalizerFactory localizerFactory)
        {
            _errorCollection = errorCollection;
            _exportSettings = exportSettings;
            _localizerFactory = localizerFactory;
        }

        /// <summary>
        /// Sets the export template placeholder resolver
        /// </summary>
        /// <param name="templatePlaceholderResolver">Template placeholder resolver</param>
        public virtual void SetExportTemplatePlaceholderResolver(IExportTemplatePlaceholderResolver templatePlaceholderResolver) { }

        /// <summary>
        /// Renders a dialog step
        /// </summary>
        /// <param name="curStep">Current Step</param>
        /// <param name="nextStep">Next step</param>
        /// <param name="flexFieldObject">Flexfield object to which the dialog belongs</param>
        /// <returns>Updated code</returns>
        public T BuildDialogRenderObject<T>(ExportDialogData curStep, ExportDialogData nextStep, FlexFieldObject flexFieldObject) where T : ScribanDialogStepBaseDataWithNextNode, new()
        {
            ScribanExportNpc exportNpc = FlexFieldValueCollectorUtil.BuildFlexFieldValueObject<ScribanExportNpc>(null, null, flexFieldObject, _exportSettings, _errorCollection);

            T renderObject = new T();
            SetRenderObjectBaseData(renderObject, curStep, exportNpc);
            renderObject.ChildNode = null;
            if (nextStep != null)
            {
                renderObject.ChildNode = new ScribanDialogStepBaseData();
                SetRenderObjectBaseData(renderObject.ChildNode, nextStep, exportNpc);
            }
            return renderObject;
        }

        /// <summary>
        /// Sets the render object base data
        /// </summary>
        /// <param name="renderObject">Render object to fill</param>
        /// <param name="stepData">Step data</param>
        /// <param name="flexFieldObject">Flexfield object to which the dialog belongs</param>
        public void SetRenderObjectBaseDataFromFlexFieldObject(ScribanDialogStepBaseData renderObject, ExportDialogData stepData, FlexFieldObject flexFieldObject)
        {
            ScribanFlexFieldObject exportObject = FlexFieldValueCollectorUtil.ConvertScribanFlexFieldObject(flexFieldObject, _exportSettings, _errorCollection);
            SetRenderObjectBaseData(renderObject, stepData, exportObject);
        }


        /// <summary>
        /// Sets the render object base data
        /// </summary>
        /// <param name="renderObject">Render object to fill</param>
        /// <param name="stepData">Step data</param>
        /// <param name="exportNpc">Npc to export</param>
        public void SetRenderObjectBaseData(ScribanDialogStepBaseData renderObject, ExportDialogData stepData, ScribanFlexFieldObject exportNpc)
        {
            renderObject.NodeId = stepData.Id;
            renderObject.NodeIndex = stepData.NodeIndex;
            renderObject.NodeType = stepData.GetNodeType();
            renderObject.NodeStepFunctionName = stepData.DialogStepFunctionName;
            renderObject.NodeObject = exportNpc;
        }

        /// <summary>
        /// Returns the base placeholders
        /// </summary>
        /// <returns>List of template placeholders</returns>
        public List<ExportTemplatePlaceholder> GetNodePlaceholders<T>(string objectKey)
        {
            List<ExportTemplatePlaceholder> placeholders = new List<ExportTemplatePlaceholder>();

            placeholders.AddRange(ScribanPlaceholderGenerator.GetPlaceholdersForObject<T>(_localizerFactory, objectKey));
            placeholders.RemoveAll(p => p.Name.EndsWith(string.Format(".{0}", StandardMemberRenamer.Rename(nameof(ScribanExportNpc.UnusedFields)))));

            return placeholders;
        }
    }
}