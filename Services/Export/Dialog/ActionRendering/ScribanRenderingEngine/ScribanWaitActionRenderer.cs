using System.Collections.Generic;
using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Data.FlexFieldDatabase;
using GoNorth.Services.Export.Data;
using GoNorth.Services.Export.Dialog.ActionRendering.ConfigObject;
using GoNorth.Services.Export.Dialog.ActionRendering.ScribanRenderingEngine.RenderingObjects;
using GoNorth.Services.Export.Dialog.ActionRendering.ScribanRenderingEngine.Util;
using GoNorth.Services.Export.Dialog.ActionRendering.SharedRendering;
using GoNorth.Services.Export.Dialog.StepRenderers.ActionRenderer;
using GoNorth.Services.Export.Placeholder;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.Util;
using Microsoft.Extensions.Localization;

namespace GoNorth.Services.Export.Dialog.ActionRendering.ScribanRenderingEngine
{
    /// <summary>
    /// Class for rendering a wait action
    /// </summary>
    public class ScribanWaitActionRenderer : BaseWaitActionRenderer
    {
        /// <summary>
        /// Cached Db Access
        /// </summary>
        private readonly IExportCachedDbAccess _cachedDbAccess;

        /// <summary>
        /// String Localizer Factory
        /// </summary>
        private readonly IStringLocalizerFactory _localizerFactory;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="cachedDbAccess">Cached Db Access</param>
        /// <param name="localizerFactory">Localizer Factory</param>
        public ScribanWaitActionRenderer(IExportCachedDbAccess cachedDbAccess, IStringLocalizerFactory localizerFactory)
        {
            _cachedDbAccess = cachedDbAccess;
            _localizerFactory = localizerFactory;
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
            ScribanWaitActionData waitActionData = new ScribanWaitActionData();
            waitActionData.WaitAmount = parsedData.WaitAmount;
            waitActionData.WaitType = ConvertWaitType(parsedData.WaitType);
            waitActionData.WaitUnit = ConvertWaitUnit(parsedData.WaitUnit);
            waitActionData.DirectContinueFunction = !string.IsNullOrEmpty(directContinueFunction) ? directContinueFunction : null;

            return await ScribanActionRenderingUtil.FillPlaceholders(_cachedDbAccess, errorCollection, template.Code, waitActionData, flexFieldObject, curStep, nextStep, null, stepRenderer);
        }

        /// <summary>
        /// Converts the wait type
        /// </summary>
        /// <param name="waitType">Wait type to convert</param>
        /// <returns>Converted wait type</returns>
        private string ConvertWaitType(string waitType)
        {
            switch(waitType)
            {
            case WaitActionData.WaitTypeRealTime:
                return "RealTime";
            case WaitActionData.WaitTypeGameTime:
                return "GameTime";
            }

            return "UNKNOWN_WAIT_TYPE";
        }

        /// <summary>
        /// Converts the wait unit
        /// </summary>
        /// <param name="waitUnit">Wait unit to convert</param>
        /// <returns>Converted wait unit</returns>
        private string ConvertWaitUnit(string waitUnit)
        {
            switch(waitUnit)
            {
            case WaitActionData.WaitUnitMilliseconds:
                return "Milliseconds";
            case WaitActionData.WaitUnitSeconds:
                return "Seconds";
            case WaitActionData.WaitUnitMinutes:
                return "Minutes";
            case WaitActionData.WaitUnitHours:
                return "Hours";
            case WaitActionData.WaitUnitDays:
                return "Days";
            }

            return "UNKNOWN_WAIT_TYPE";
        }

        /// <summary>
        /// Returns the Export Template Placeholders for a Template Type
        /// </summary>
        /// <param name="templateType">Template Type</param>
        /// <returns>Export Template Placeholder</returns>
        public override List<ExportTemplatePlaceholder> GetExportTemplatePlaceholdersForType(TemplateType templateType)
        {
            return ScribanPlaceholderGenerator.GetPlaceholdersForObject<ScribanWaitActionData>(_localizerFactory, ExportConstants.ScribanActionObjectKey);
        }
    }
}