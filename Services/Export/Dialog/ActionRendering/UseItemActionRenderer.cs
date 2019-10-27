using System.Collections.Generic;
using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Data.FlexFieldDatabase;
using GoNorth.Data.Kortisto;
using GoNorth.Data.Project;
using GoNorth.Data.Styr;
using GoNorth.Services.Export.Data;
using GoNorth.Services.Export.LanguageKeyGeneration;
using GoNorth.Services.Export.Placeholder;
using Microsoft.Extensions.Localization;

namespace GoNorth.Services.Export.Dialog.ActionRendering
{
    /// <summary>
    /// Class for rendering a use item action
    /// </summary>
    public class UseItemActionRenderer : BaseActionRenderer<UseItemActionRenderer.UseItemActionData>
    {
        /// <summary>
        /// Use Item action data
        /// </summary>
        public class UseItemActionData
        {
            /// <summary>
            /// Npc Id
            /// </summary>
            public string NpcId { get; set; }

            /// <summary>
            /// Item Id
            /// </summary>
            public string ItemId { get; set; }
        }


        /// <summary>
        /// Flex Field Npc Resolver Prefix
        /// </summary>
        private const string FlexField_Npc_Prefix = "Tale_Action_Npc";

        /// <summary>
        /// Flex Field Item Resolver Prefix
        /// </summary>
        private const string FlexField_Item_Prefix = "Tale_Action_SelectedItem";


        /// <summary>
        /// Default Template Provider
        /// </summary>
        protected readonly ICachedExportDefaultTemplateProvider _defaultTemplateProvider;

        /// <summary>
        /// Cached Db Access
        /// </summary>
        protected readonly IExportCachedDbAccess _cachedDbAccess;

        /// <summary>
        /// String Localizer
        /// </summary>
        private readonly IStringLocalizer _localizer;

        /// <summary>
        /// Resolver for flex field values
        /// </summary>
        private readonly FlexFieldExportTemplatePlaceholderResolver _flexFieldPlaceholderResolverNpc;

        /// <summary>
        /// Resolver for flex field values
        /// </summary>
        private readonly FlexFieldExportTemplatePlaceholderResolver _flexFieldPlaceholderResolverItem;

        /// <summary>
        /// true if the action renderer is for the player, else false
        /// </summary>
        private readonly bool _isPlayer;

        /// <summary>
        /// true if the action renderer is for a transfer, else false
        /// </summary>
        private readonly bool _isPickNpc;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="defaultTemplateProvider">Default Template Provider</param>
        /// <param name="cachedDbAccess">Cached Db Access</param>        
        /// <param name="languageKeyGenerator">Language Key Generator</param>
        /// <param name="localizerFactory">Localizer Factory</param>
        /// <param name="isPlayer">True if the action is for the player, else false</param>
        /// <param name="isPickNpc">True if the action is for a pick npc, else false</param>
        public UseItemActionRenderer(ICachedExportDefaultTemplateProvider defaultTemplateProvider, IExportCachedDbAccess cachedDbAccess, ILanguageKeyGenerator languageKeyGenerator, IStringLocalizerFactory localizerFactory,
                                       bool isPlayer, bool isPickNpc)
        {
            _defaultTemplateProvider = defaultTemplateProvider;
            _cachedDbAccess = cachedDbAccess;
            _localizer = localizerFactory.Create(typeof(UseItemActionRenderer));
            _flexFieldPlaceholderResolverNpc = new FlexFieldExportTemplatePlaceholderResolver(defaultTemplateProvider, cachedDbAccess, languageKeyGenerator, localizerFactory, FlexField_Npc_Prefix);
            _flexFieldPlaceholderResolverItem = new FlexFieldExportTemplatePlaceholderResolver(defaultTemplateProvider, cachedDbAccess, languageKeyGenerator, localizerFactory, FlexField_Item_Prefix);

            _isPlayer = isPlayer;
            _isPickNpc = isPickNpc;
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
        public override async Task<string> BuildActionFromParsedData(UseItemActionRenderer.UseItemActionData parsedData, ExportDialogData data, GoNorthProject project, ExportPlaceholderErrorCollection errorCollection, FlexFieldObject flexFieldObject, ExportSettings exportSettings)
        {
            ExportTemplate actionTemplate = await GetExportTemplate(project);
            IFlexFieldExportable valueItem = await GetItem(parsedData, errorCollection);
            IFlexFieldExportable valueNpc = await GetNpc(flexFieldObject, parsedData, errorCollection);
            if(valueItem == null || valueNpc == null)
            {
                return string.Empty;
            }

            string actionCode = actionTemplate.Code;

            ExportObjectData flexFieldExportDataItem = new ExportObjectData();
            flexFieldExportDataItem.ExportData.Add(ExportConstants.ExportDataObject, valueItem);
            flexFieldExportDataItem.ExportData.Add(ExportConstants.ExportDataObjectType, ExportConstants.ExportObjectTypeItem);
            _flexFieldPlaceholderResolverItem.SetErrorMessageCollection(errorCollection);
            actionCode = await _flexFieldPlaceholderResolverItem.FillPlaceholders(actionCode, flexFieldExportDataItem);
            
            ExportObjectData flexFieldExportDataNpc = new ExportObjectData();
            flexFieldExportDataNpc.ExportData.Add(ExportConstants.ExportDataObject, valueNpc);
            flexFieldExportDataNpc.ExportData.Add(ExportConstants.ExportDataObjectType, ExportConstants.ExportObjectTypeNpc);
            _flexFieldPlaceholderResolverNpc.SetErrorMessageCollection(errorCollection);
            actionCode = await _flexFieldPlaceholderResolverNpc.FillPlaceholders(actionCode, flexFieldExportDataNpc);

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
        public override async Task<string> BuildPreviewTextFromParsedData(UseItemActionRenderer.UseItemActionData parsedData, FlexFieldObject flexFieldObject, ExportPlaceholderErrorCollection errorCollection, ExportDialogData child, ExportDialogData parent)
        {
            IFlexFieldExportable valueItem = await GetItem(parsedData, errorCollection);
            IFlexFieldExportable valueNpc = await GetNpc(flexFieldObject, parsedData, errorCollection);
            if(valueItem == null || valueNpc == null)
            {
                return string.Empty;
            }

            return valueNpc.Name + " uses " + valueItem.Name;
        }


        /// <summary>
        /// Returns the export template to use
        /// </summary>
        /// <param name="project">Project</param>
        /// <returns>Export template to use</returns>
        private async Task<ExportTemplate> GetExportTemplate(GoNorthProject project)
        {
            if(_isPickNpc)
            {
                return await _defaultTemplateProvider.GetDefaultTemplateByType(project.Id, TemplateType.TaleActionChooseNpcUseItem);
            }
            else if(_isPlayer) 
            {
                return await _defaultTemplateProvider.GetDefaultTemplateByType(project.Id, TemplateType.TaleActionPlayerUseItem);
            }

            return await _defaultTemplateProvider.GetDefaultTemplateByType(project.Id, TemplateType.TaleActionNpcUseItem);
        }

        /// <summary>
        /// Returns the item use
        /// </summary>
        /// <param name="parsedData">Parsed data</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <returns>Value Object</returns>
        private async Task<IFlexFieldExportable> GetItem(UseItemActionRenderer.UseItemActionData parsedData, ExportPlaceholderErrorCollection errorCollection)
        {
            StyrItem item = await _cachedDbAccess.GetItemById(parsedData.ItemId);
            if(item == null) 
            {
                errorCollection.AddDialogItemNotFoundError();
                return null;
            }

            return item;
        }

        /// <summary>
        /// Returns the npc use
        /// </summary>
        /// <param name="flexFieldObject">Flex field object</param>
        /// <param name="parsedData">Parsed data</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <returns>Value Object</returns>
        private async Task<IFlexFieldExportable> GetNpc(FlexFieldObject flexFieldObject, UseItemActionRenderer.UseItemActionData parsedData, ExportPlaceholderErrorCollection errorCollection)
        {
            if(_isPickNpc)
            {
                KortistoNpc npc = await _cachedDbAccess.GetNpcById(parsedData.NpcId);
                if(npc == null) 
                {
                    errorCollection.AddDialogItemNotFoundError();
                    return null;
                }

                return npc;
            }
            else if(_isPlayer)
            {
                GoNorthProject curProject = await _cachedDbAccess.GetDefaultProject();
                KortistoNpc npc = await _cachedDbAccess.GetPlayerNpc(curProject.Id);
                if(npc == null)
                {
                    errorCollection.AddNoPlayerNpcExistsError();
                    return null;
                }

                return npc;
            }

            return flexFieldObject;
        }

        /// <summary>
        /// Returns true if the action renderer has placeholders for a template type
        /// </summary>
        /// <param name="templateType">Tempalte Type to check</param>
        /// <returns>true if the action renderer has placeholders for the template type</returns>
        public override bool HasPlaceholdersForTemplateType(TemplateType templateType)
        {
            return (_isPickNpc && templateType == TemplateType.TaleActionChooseNpcUseItem) || (_isPlayer && templateType == TemplateType.TaleActionPlayerUseItem) || (!_isPickNpc && !_isPlayer && templateType == TemplateType.TaleActionNpcUseItem);
        }   

        /// <summary>
        /// Returns the Export Template Placeholders for a Template Type
        /// </summary>
        /// <param name="templateType">Template Type</param>
        /// <returns>Export Template Placeholder</returns>
        public override List<ExportTemplatePlaceholder> GetExportTemplatePlaceholdersForType(TemplateType templateType)
        {
            List<ExportTemplatePlaceholder> exportPlaceholders = new List<ExportTemplatePlaceholder>();

            exportPlaceholders.AddRange(_flexFieldPlaceholderResolverItem.GetExportTemplatePlaceholdersForType(TemplateType.ObjectItem));
            exportPlaceholders.AddRange(_flexFieldPlaceholderResolverNpc.GetExportTemplatePlaceholdersForType(TemplateType.ObjectNpc));

            return exportPlaceholders;
        }
    }
}