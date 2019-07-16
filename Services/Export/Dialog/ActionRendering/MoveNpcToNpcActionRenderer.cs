using System.Collections.Generic;
using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Data.Karta;
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
            _localizer = localizerFactory.Create(typeof(MoveNpcActionRenderer));
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
        /// <param name="npc">Npc to which the dialog belongs</param>
        /// <param name="exportSettings">Export Settings</param>
        /// <returns>Action string</returns>
        public override async Task<string> BuildActionFromParsedData(MoveNpcToNpcActionRenderer.MoveNpcToNpcActionData parsedData, ExportDialogData data, GoNorthProject project, ExportPlaceholderErrorCollection errorCollection, KortistoNpc npc, ExportSettings exportSettings)
        {
            ExportTemplate actionTemplate = await GetExportTemplate(project);

            KortistoNpc foundNpc = await GetNpc(parsedData, npc);
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

            
            ExportObjectData flexFieldTargetExportData = new ExportObjectData();
            flexFieldTargetExportData.ExportData.Add(ExportConstants.ExportDataObject, targetResult);
            flexFieldTargetExportData.ExportData.Add(ExportConstants.ExportDataObjectType, ExportConstants.ExportObjectTypeNpc);

            _flexFieldTargetPlaceholderResolver.SetErrorMessageCollection(errorCollection);
            actionCode = _flexFieldTargetPlaceholderResolver.FillPlaceholders(actionCode, flexFieldTargetExportData).Result;

            return actionCode;
        }

        /// <summary>
        /// Builds a preview text from parsed data
        /// </summary>
        /// <param name="parsedData">Parsed data</param>
        /// <param name="npc">Npc to which the dialog belongs</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <returns>Preview text</returns>
        public override async Task<string> BuildPreviewTextFromParsedData(MoveNpcToNpcActionRenderer.MoveNpcToNpcActionData parsedData, KortistoNpc npc, ExportPlaceholderErrorCollection errorCollection)
        {
            string verb = "Move";
            if(_isTeleport)
            {
                verb = "Teleport";
            }

            string npcName = "npc";
            if(_isPickedNpc)
            {
                KortistoNpc foundNpc = await GetNpc(parsedData, npc);
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
        /// <param name="parsedData"></param>
        /// <param name="npc"></param>
        /// <returns></returns>
        private async Task<KortistoNpc> GetNpc(MoveNpcToNpcActionRenderer.MoveNpcToNpcActionData parsedData, KortistoNpc npc)
        {
            if(_isPickedNpc)
            {
                return await _cachedDbAccess.GetNpcById(parsedData.ObjectId);
            }

            return npc;
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

            exportPlaceholders.AddRange(_flexFieldPlaceholderResolver.GetExportTemplatePlaceholdersForType(TemplateType.ObjectNpc));
            exportPlaceholders.AddRange(_flexFieldTargetPlaceholderResolver.GetExportTemplatePlaceholdersForType(TemplateType.ObjectNpc));

            return exportPlaceholders;
        }
    }
}