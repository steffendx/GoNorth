using System.Collections.Generic;
using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Data.FlexFieldDatabase;
using GoNorth.Data.Kortisto;
using GoNorth.Services.Export.Data;
using GoNorth.Services.Export.Dialog.ActionRendering.ConfigObject;
using GoNorth.Services.Export.Dialog.ActionRendering.SharedRendering;
using GoNorth.Services.Export.Dialog.StepRenderers.ActionRenderer;
using GoNorth.Services.Export.LanguageKeyGeneration;
using GoNorth.Services.Export.Placeholder;
using GoNorth.Services.Export.Placeholder.LegacyRenderingEngine;
using Microsoft.Extensions.Localization;

namespace GoNorth.Services.Export.Dialog.ActionRendering.LegacyRenderingEngine
{
    /// <summary>
    /// Class for rendering a move npc action
    /// </summary>
    public class MoveNpcActionRenderer : BaseMoveNpcActionRenderer
    {
        /// <summary>
        /// Flex Field Npc Resolver Prefix
        /// </summary>
        private const string FlexField_Npc_Prefix = "Tale_Action_Npc";

        /// <summary>
        /// Placeholder for the Target Marker Name
        /// </summary>
        private const string Placeholder_TargetMarker_Name = "Tale_Action_TargetMarker_Name";

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
        /// Placeholder for for the start of the content that will only be rendered if the action has a movement state
        /// </summary>
        private const string Placeholder_HasMovementState_Start = "Tale_Action_HasMovementState_Start";

        /// <summary>
        /// Placeholder for for the end of the content that will only be rendered if the action has a movement state
        /// </summary>
        private const string Placeholder_HasMovementState_End = "Tale_Action_HasMovementState_End";
        
        /// <summary>
        /// Placeholder for for the start of the content that will only be rendered if the action has no movement state
        /// </summary>
        private const string Placeholder_HasNoMovementState_Start = "Tale_Action_HasNoMovementState_Start";

        /// <summary>
        /// Placeholder for for the end of the content that will only be rendered if the action has no movement state
        /// </summary>
        private const string Placeholder_HasNoMovementState_End = "Tale_Action_HasNoMovementState_End";
        
        /// <summary>
        /// Placeholder for for the movement state of the object
        /// </summary>
        private const string Placeholder_MovementState = "Tale_Action_MovementState";


        /// <summary>
        /// Resolver for flex field values
        /// </summary>
        private readonly FlexFieldExportTemplatePlaceholderResolver _flexFieldPlaceholderResolver;

        /// <summary>
        /// String Localizer
        /// </summary>
        private readonly IStringLocalizer _localizer;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="defaultTemplateProvider">Default Template Provider</param>
        /// <param name="cachedDbAccess">Cached Db Access</param>        
        /// <param name="languageKeyGenerator">Language Key Generator</param>
        /// <param name="localizerFactory">Localizer Factory</param>
        /// <param name="isTeleport">true if the movement is a teleporation, else false</param>
        /// <param name="isPlayer">true if the player is moved, else false</param>
        /// <param name="isPickedNpc">true if the npc was picked, else false</param>
        public MoveNpcActionRenderer(ICachedExportDefaultTemplateProvider defaultTemplateProvider, IExportCachedDbAccess cachedDbAccess, ILanguageKeyGenerator languageKeyGenerator, IStringLocalizerFactory localizerFactory, bool isTeleport, bool isPlayer, bool isPickedNpc) :
                                     base(cachedDbAccess, isTeleport, isPlayer, isPickedNpc)
        {
            _localizer = localizerFactory.Create(typeof(MoveNpcActionRenderer));
            _flexFieldPlaceholderResolver = new FlexFieldExportTemplatePlaceholderResolver(defaultTemplateProvider, cachedDbAccess, languageKeyGenerator, localizerFactory, FlexField_Npc_Prefix);
        }

        /// <summary>
        /// Sets the export template placeholder resolver
        /// </summary>
        /// <param name="templatePlaceholderResolver">Template placeholder resolver</param>
        public override void SetExportTemplatePlaceholderResolver(IExportTemplatePlaceholderResolver templatePlaceholderResolver) 
        {
            _flexFieldPlaceholderResolver.SetExportTemplatePlaceholderResolver(templatePlaceholderResolver);
        }

        /// <summary>
        /// Fills the placeholders
        /// </summary>
        /// <param name="template">Template to use</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <param name="parsedData">Parsed config data</param>
        /// <param name="npc">Npc to move</param>
        /// <param name="markerName">Target marker name</param>
        /// <param name="directContinueFunction">Direct continue function</param>
        /// <param name="flexFieldObject">Flex field object to which the dialog belongs</param>
        /// <param name="curStep">Current step that is rendered</param>
        /// <param name="nextStep">Next step that is being rendered</param>
        /// <param name="exportSettings">Export Settings</param>
        /// <param name="stepRenderer">Action Step renderer</param>
        /// <returns>Filled placeholders</returns>
        protected override async Task<string> FillPlaceholders(ExportTemplate template, ExportPlaceholderErrorCollection errorCollection, MoveNpcActionData parsedData, KortistoNpc npc, string markerName, string directContinueFunction, 
                                                               FlexFieldObject flexFieldObject, ExportDialogData curStep, ExportDialogData nextStep, ExportSettings exportSettings, IActionStepRenderer stepRenderer)
        {
            string actionCode = ExportUtil.BuildPlaceholderRegex(Placeholder_TargetMarker_Name).Replace(template.Code, markerName);

            if(!_isTeleport)
            {
                actionCode = BuildDirectContinueFunction(directContinueFunction, actionCode);
                actionCode = BuildMovementState(parsedData, actionCode);
            }

            ExportObjectData flexFieldExportData = new ExportObjectData();
            flexFieldExportData.ExportData.Add(ExportConstants.ExportDataObject, npc);
            flexFieldExportData.ExportData.Add(ExportConstants.ExportDataObjectType, ExportConstants.ExportObjectTypeNpc);

            _flexFieldPlaceholderResolver.SetErrorMessageCollection(errorCollection);
            actionCode = _flexFieldPlaceholderResolver.FillPlaceholders(actionCode, flexFieldExportData).Result;

            return await stepRenderer.ReplaceBasePlaceholders(errorCollection, actionCode, curStep, nextStep, flexFieldObject);
        }

        /// <summary>
        /// Builds the direct continue function 
        /// </summary>
        /// <param name="directContinueFunction">Direct continue function</param>
        /// <param name="actionCode">Action code to fill</param>
        /// <returns>Filled action code</returns>
        private string BuildDirectContinueFunction(string directContinueFunction, string actionCode)
        {
            actionCode = ExportUtil.RenderPlaceholderIfTrue(actionCode, Placeholder_HasDirectContinueFunction_Start, Placeholder_HasDirectContinueFunction_End, !string.IsNullOrEmpty(directContinueFunction));
            actionCode = ExportUtil.RenderPlaceholderIfTrue(actionCode, Placeholder_HasNoDirectContinueFunction_Start, Placeholder_HasNoDirectContinueFunction_End, string.IsNullOrEmpty(directContinueFunction));
            actionCode = ExportUtil.BuildPlaceholderRegex(Placeholder_DirectContinueFunction).Replace(actionCode, directContinueFunction);
            return actionCode;
        }

        /// <summary>
        /// Builds the movement state values
        /// </summary>
        /// <param name="data">Parsed Export Data</param>
        /// <param name="actionCode">Action code to fill</param>
        /// <returns>Filled action code</returns>
        private string BuildMovementState(MoveNpcActionData data, string actionCode)
        {
            actionCode = ExportUtil.RenderPlaceholderIfTrue(actionCode, Placeholder_HasMovementState_Start, Placeholder_HasMovementState_End, !string.IsNullOrEmpty(data.MovementState));
            actionCode = ExportUtil.RenderPlaceholderIfTrue(actionCode, Placeholder_HasNoMovementState_Start, Placeholder_HasNoMovementState_End, string.IsNullOrEmpty(data.MovementState));
            actionCode = ExportUtil.BuildPlaceholderRegex(Placeholder_MovementState).Replace(actionCode, data.MovementState != null ? data.MovementState : string.Empty);

            return actionCode;
        }

        /// <summary>
        /// Returns the Export Template Placeholders for a Template Type
        /// </summary>
        /// <param name="templateType">Template Type</param>
        /// <returns>Export Template Placeholder</returns>
        public override List<ExportTemplatePlaceholder> GetExportTemplatePlaceholdersForType(TemplateType templateType)
        {
            List<ExportTemplatePlaceholder> exportPlaceholders = new List<ExportTemplatePlaceholder> {
                ExportUtil.CreatePlaceHolder(Placeholder_TargetMarker_Name, _localizer)
            };

            if(!_isTeleport)
            {
                exportPlaceholders.Add(ExportUtil.CreatePlaceHolder(Placeholder_HasDirectContinueFunction_Start, _localizer));
                exportPlaceholders.Add(ExportUtil.CreatePlaceHolder(Placeholder_HasDirectContinueFunction_End, _localizer));
                exportPlaceholders.Add(ExportUtil.CreatePlaceHolder(Placeholder_HasNoDirectContinueFunction_Start, _localizer));
                exportPlaceholders.Add(ExportUtil.CreatePlaceHolder(Placeholder_HasNoDirectContinueFunction_End, _localizer));
                exportPlaceholders.Add(ExportUtil.CreatePlaceHolder(Placeholder_DirectContinueFunction, _localizer));
                exportPlaceholders.Add(ExportUtil.CreatePlaceHolder(Placeholder_HasMovementState_Start, _localizer));
                exportPlaceholders.Add(ExportUtil.CreatePlaceHolder(Placeholder_HasMovementState_End, _localizer));
                exportPlaceholders.Add(ExportUtil.CreatePlaceHolder(Placeholder_HasNoMovementState_Start, _localizer));
                exportPlaceholders.Add(ExportUtil.CreatePlaceHolder(Placeholder_HasNoMovementState_End, _localizer));
                exportPlaceholders.Add(ExportUtil.CreatePlaceHolder(Placeholder_MovementState, _localizer));
            }

            exportPlaceholders.AddRange(_flexFieldPlaceholderResolver.GetExportTemplatePlaceholdersForType(TemplateType.ObjectNpc));

            return exportPlaceholders;
        }
    }
}