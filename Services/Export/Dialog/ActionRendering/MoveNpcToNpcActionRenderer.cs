using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Data.FlexFieldDatabase;
using GoNorth.Data.Kortisto;
using GoNorth.Data.Project;
using GoNorth.Services.Export.Data;
using GoNorth.Services.Export.LanguageKeyGeneration;
using GoNorth.Services.Export.Placeholder;
using Microsoft.Extensions.Localization;

namespace GoNorth.Services.Export.Dialog.ActionRendering
{
    /// <summary>
    /// Class for rendering a move npc to npc action
    /// </summary>
    public class MoveNpcToNpcActionRenderer : BaseActionRenderer<MoveNpcToNpcActionRenderer.MoveNpcToNpcActionData>
    {
        /// <summary>
        /// Move npc to npc action data
        /// </summary>
        public class MoveNpcToNpcActionData
        {
            /// <summary>
            /// Object id
            /// </summary>
            public string ObjectId { get; set; }
            
            /// <summary>
            /// Npc id
            /// </summary>
            public string NpcId { get; set; }

            /// <summary>
            /// Movement State
            /// </summary>
            public string MovementState { get; set; }
        }


        /// <summary>
        /// Flex Field Npc Resolver Prefix
        /// </summary>
        private const string FlexField_Npc_Prefix = "Tale_Action_Npc";

        /// <summary>
        /// Placeholder for the Target Npc
        /// </summary>
        private const string FlexField_TargetNpc_Prefix = "Tale_Action_TargetNpc";

        
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
        /// Default Template Provider
        /// </summary>
        private readonly ICachedExportDefaultTemplateProvider _defaultTemplateProvider;

        /// <summary>
        /// Cached Db Access
        /// </summary>
        private readonly IExportCachedDbAccess _cachedDbAccess;

        /// <summary>
        /// Resolver for flex field values
        /// </summary>
        private readonly FlexFieldExportTemplatePlaceholderResolver _flexFieldPlaceholderResolver;
        
        /// <summary>
        /// Resolver for flex field values
        /// </summary>
        private readonly FlexFieldExportTemplatePlaceholderResolver _flexFieldTargetPlaceholderResolver;

        /// <summary>
        /// String Localizer
        /// </summary>
        private readonly IStringLocalizer _localizer;


        /// <summary>
        /// Id of the direct continue node
        /// </summary>
        private const int DirectContinueFunctionNodeId = 1;


        /// <summary>
        /// true if a teleportation happens, false if its a movement
        /// </summary>
        private readonly bool _isTeleport;

        /// <summary>
        /// true if an npc was picked, else false
        /// </summary>
        private readonly bool _isPickedNpc;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="defaultTemplateProvider">Default Template Provider</param>
        /// <param name="cachedDbAccess">Cached Db Access</param>        
        /// <param name="languageKeyGenerator">Language Key Generator</param>
        /// <param name="localizerFactory">Localizer Factory</param>
        /// <param name="isTeleport">true if the movement is a teleporation, else false</param>
        /// <param name="isPickedNpc">true if the npc was picked, else false</param>
        public MoveNpcToNpcActionRenderer(ICachedExportDefaultTemplateProvider defaultTemplateProvider, IExportCachedDbAccess cachedDbAccess, ILanguageKeyGenerator languageKeyGenerator, IStringLocalizerFactory localizerFactory, bool isTeleport, bool isPickedNpc)
        {
            _defaultTemplateProvider = defaultTemplateProvider;
            _cachedDbAccess = cachedDbAccess;
            _localizer = localizerFactory.Create(typeof(MoveNpcToNpcActionRenderer));
            _flexFieldPlaceholderResolver = new FlexFieldExportTemplatePlaceholderResolver(defaultTemplateProvider, cachedDbAccess, languageKeyGenerator, localizerFactory, FlexField_Npc_Prefix);
            _flexFieldTargetPlaceholderResolver = new FlexFieldExportTemplatePlaceholderResolver(defaultTemplateProvider, cachedDbAccess, languageKeyGenerator, localizerFactory, FlexField_TargetNpc_Prefix);

            _isTeleport = isTeleport;
            _isPickedNpc = isPickedNpc;
        }

        /// <summary>
        /// Builds an action from parsed data
        /// </summary>
        /// <param name="parsedData">Parsed data</param>
        /// <param name="data">Dialog data</param>
        /// <param name="project">Project</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <param name="flexFieldObject">Flex field object to which the dialog belongs</param>
        /// <param name="exportSettings">Export Settings</param>
        /// <returns>Action string</returns>
        public override async Task<string> BuildActionFromParsedData(MoveNpcToNpcActionRenderer.MoveNpcToNpcActionData parsedData, ExportDialogData data, GoNorthProject project, ExportPlaceholderErrorCollection errorCollection, FlexFieldObject flexFieldObject, ExportSettings exportSettings)
        {
            ExportTemplate actionTemplate = await GetExportTemplate(project);

            KortistoNpc foundNpc = await GetNpc(parsedData, flexFieldObject);
            if(foundNpc == null)
            {
                errorCollection.AddDialogNpcNotFoundError();
                return string.Empty;
            }
            
            KortistoNpc targetResult = await GetTargetNpc(parsedData);
            if(targetResult == null)
            {
                errorCollection.AddDialogNpcNotFoundError();
                return string.Empty;
            }

            ExportObjectData flexFieldExportData = new ExportObjectData();
            flexFieldExportData.ExportData.Add(ExportConstants.ExportDataObject, foundNpc);
            flexFieldExportData.ExportData.Add(ExportConstants.ExportDataObjectType, ExportConstants.ExportObjectTypeNpc);

            _flexFieldPlaceholderResolver.SetErrorMessageCollection(errorCollection);
            string actionCode = _flexFieldPlaceholderResolver.FillPlaceholders(actionTemplate.Code, flexFieldExportData).Result;

            if(!_isTeleport)
            {
                actionCode = BuildDirectContinueFunction(data, actionCode);
                actionCode = BuildMovementState(parsedData, actionCode);
            }
            
            ExportObjectData flexFieldTargetExportData = new ExportObjectData();
            flexFieldTargetExportData.ExportData.Add(ExportConstants.ExportDataObject, targetResult);
            flexFieldTargetExportData.ExportData.Add(ExportConstants.ExportDataObjectType, ExportConstants.ExportObjectTypeNpc);

            _flexFieldTargetPlaceholderResolver.SetErrorMessageCollection(errorCollection);
            actionCode = _flexFieldTargetPlaceholderResolver.FillPlaceholders(actionCode, flexFieldTargetExportData).Result;

            return actionCode;
        }

        /// <summary>
        /// Builds the direct continue function 
        /// </summary>
        /// <param name="data">Export Data</param>
        /// <param name="actionCode">Action code to fill</param>
        /// <returns>Filled action code</returns>
        private string BuildDirectContinueFunction(ExportDialogData data, string actionCode)
        {
            string directContinueFunction = string.Empty;
            if (data.Children != null)
            {
                ExportDialogDataChild directStep = data.Children.FirstOrDefault(c => c.NodeChildId == DirectContinueFunctionNodeId);
                directContinueFunction = directStep != null ? directStep.Child.DialogStepFunctionName : string.Empty;
            }
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
        private string BuildMovementState(MoveNpcToNpcActionRenderer.MoveNpcToNpcActionData data, string actionCode)
        {
            actionCode = ExportUtil.RenderPlaceholderIfTrue(actionCode, Placeholder_HasMovementState_Start, Placeholder_HasMovementState_End, string.IsNullOrEmpty(data.MovementState));
            actionCode = ExportUtil.RenderPlaceholderIfTrue(actionCode, Placeholder_HasNoMovementState_Start, Placeholder_HasNoMovementState_End, !string.IsNullOrEmpty(data.MovementState));
            actionCode = ExportUtil.BuildPlaceholderRegex(Placeholder_MovementState).Replace(actionCode, data.MovementState != null ? data.MovementState : string.Empty);

            return actionCode;
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
        public override async Task<string> BuildPreviewTextFromParsedData(MoveNpcToNpcActionRenderer.MoveNpcToNpcActionData parsedData, FlexFieldObject flexFieldObject, ExportPlaceholderErrorCollection errorCollection, ExportDialogData child, ExportDialogData parent)
        {
            string verb = "Move";
            if(_isTeleport)
            {
                verb = "Teleport";
            }

            if(!_isTeleport && parent != null && parent.Children != null && child != null)
            {
                ExportDialogDataChild actionChild = parent.Children.FirstOrDefault(c => c.Child.Id == child.Id);
                if(actionChild != null && actionChild.NodeChildId == DirectContinueFunctionNodeId)
                {
                    verb = "Direct Continue On Move";
                }
            }

            string npcName = "npc";
            if(_isPickedNpc)
            {
                KortistoNpc foundNpc = await GetNpc(parsedData, flexFieldObject);
                if(foundNpc == null)
                {
                    errorCollection.AddDialogNpcNotFoundError();
                    return string.Empty;
                }

                npcName = foundNpc.Name;
            }

            KortistoNpc targetNpc = await GetTargetNpc(parsedData);
            return string.Format("{0} {1} to {2}", verb, npcName, targetNpc.Name);
        }


        /// <summary>
        /// Returns the valid template type for the renderer
        /// </summary>
        /// <returns>Template Type</returns>
        private TemplateType GetValidTemplateType()
        {
            if(_isTeleport)
            {
                if(_isPickedNpc)
                {
                    return TemplateType.TaleActionTeleportChooseNpcToNpc;
                }
                else
                {
                    return TemplateType.TaleActionTeleportNpcToNpc;
                }
            }
            else
            {
                if(_isPickedNpc)
                {
                    return TemplateType.TaleActionWalkChooseNpcToNpc;
                }
                else
                {
                    return TemplateType.TaleActionWalkNpcToNpc;
                }
            }
        }

        /// <summary>
        /// Returns the export template to use
        /// </summary>
        /// <param name="project">Project</param>
        /// <returns>Export template to use</returns>
        private async Task<ExportTemplate> GetExportTemplate(GoNorthProject project)
        {
            return await _defaultTemplateProvider.GetDefaultTemplateByType(project.Id, GetValidTemplateType());
        }

        /// <summary>
        /// Returns the currently valid npc for the action
        /// </summary>
        /// <param name="parsedData">Parsed data</param>
        /// <param name="flexFieldObject">Flex field object</param>
        /// <returns>Npc</returns>
        private async Task<KortistoNpc> GetNpc(MoveNpcToNpcActionRenderer.MoveNpcToNpcActionData parsedData, FlexFieldObject flexFieldObject)
        {
            if(_isPickedNpc)
            {
                return await _cachedDbAccess.GetNpcById(parsedData.ObjectId);
            }

            return flexFieldObject as KortistoNpc;
        }

        /// <summary>
        /// Returns the target npc
        /// </summary>
        /// <param name="parsedData">Parsed data</param>
        /// <returns>Npc</returns>
        private async Task<KortistoNpc> GetTargetNpc(MoveNpcToNpcActionRenderer.MoveNpcToNpcActionData parsedData)
        {
            return await _cachedDbAccess.GetNpcById(parsedData.NpcId);
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

        /// <summary>
        /// Returns true if the action renderer has placeholders for a template type
        /// </summary>
        /// <param name="templateType">Template Type to check</param>
        /// <returns>true if the action renderer has placeholders for the template type</returns>
        public override bool HasPlaceholdersForTemplateType(TemplateType templateType)
        {
            return templateType == GetValidTemplateType();
        }   

        /// <summary>
        /// Returns the Export Template Placeholders for a Template Type
        /// </summary>
        /// <param name="templateType">Template Type</param>
        /// <returns>Export Template Placeholder</returns>
        public override List<ExportTemplatePlaceholder> GetExportTemplatePlaceholdersForType(TemplateType templateType)
        {
            List<ExportTemplatePlaceholder> exportPlaceholders = new List<ExportTemplatePlaceholder>();

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
            exportPlaceholders.AddRange(_flexFieldTargetPlaceholderResolver.GetExportTemplatePlaceholdersForType(TemplateType.ObjectNpc));

            return exportPlaceholders;
        }
    }
}