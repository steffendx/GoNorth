using System.Collections.Generic;
using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Data.Kortisto;
using GoNorth.Data.Project;
using GoNorth.Services.Export.Data;
using GoNorth.Services.Export.LanguageKeyGeneration;
using GoNorth.Services.Export.Placeholder;
using Microsoft.Extensions.Localization;

namespace GoNorth.Services.Export.Dialog.ActionRendering
{
    /// <summary>
    /// Class for rendering a set npc state action
    /// </summary>
    public class ChangeNpcStateActionRenderer : BaseActionRenderer<ChangeNpcStateActionRenderer.ChangeNpcStateActionData>
    {
        /// <summary>
        /// Change npc state action data
        /// </summary>
        public class ChangeNpcStateActionData
        {
            /// <summary>
            /// New State
            /// </summary>
            public string ObjectState { get; set; }
        }


        /// <summary>
        /// Placeholder for the new state
        /// </summary>
        private const string Placeholder_State = "Tale_Action_State";

        /// <summary>
        /// Flex Field Npc Resolver Prefix
        /// </summary>
        private const string FlexField_Npc_Prefix = "Tale_Action_Npc";


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
        private readonly FlexFieldExportTemplatePlaceholderResolver _flexFieldPlaceholderResolver;
        
        /// <summary>
        /// true if the renderer is for the player, else false
        /// </summary>
        private readonly bool _isPlayer;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="defaultTemplateProvider">Default Template Provider</param>
        /// <param name="cachedDbAccess">Cached Db Access</param>        
        /// <param name="languageKeyGenerator">Language Key Generator</param>
        /// <param name="localizerFactory">Localizer Factory</param>
        /// <param name="isPlayer">true if the renderer is for the player, else false</param>
        public ChangeNpcStateActionRenderer(ICachedExportDefaultTemplateProvider defaultTemplateProvider, IExportCachedDbAccess cachedDbAccess, ILanguageKeyGenerator languageKeyGenerator, IStringLocalizerFactory localizerFactory, bool isPlayer)
        {
            _defaultTemplateProvider = defaultTemplateProvider;
            _cachedDbAccess = cachedDbAccess;
            _localizer = localizerFactory.Create(typeof(ChangeNpcStateActionRenderer));
            _isPlayer = isPlayer;
            _flexFieldPlaceholderResolver = new FlexFieldExportTemplatePlaceholderResolver(defaultTemplateProvider, cachedDbAccess, languageKeyGenerator, localizerFactory, FlexField_Npc_Prefix);
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
        public override async Task<string> BuildActionFromParsedData(ChangeNpcStateActionRenderer.ChangeNpcStateActionData parsedData, ExportDialogData data, GoNorthProject project, ExportPlaceholderErrorCollection errorCollection, KortistoNpc npc, ExportSettings exportSettings)
        {
            ExportTemplate actionTemplate = await GetExportTemplate(project);
            IFlexFieldExportable valueObject = await GetNpc(npc, errorCollection);
            if(valueObject == null)
            {
                return string.Empty;
            }

            string actionCode = ExportUtil.BuildPlaceholderRegex(Placeholder_State).Replace(actionTemplate.Code, ExportUtil.EscapeCharacters(parsedData.ObjectState, exportSettings.EscapeCharacter, exportSettings.CharactersNeedingEscaping, exportSettings.NewlineCharacter));

            ExportObjectData flexFieldExportData = new ExportObjectData();
            flexFieldExportData.ExportData.Add(ExportConstants.ExportDataObject, valueObject);
            flexFieldExportData.ExportData.Add(ExportConstants.ExportDataObjectType, ExportConstants.ExportObjectTypeNpc);

            _flexFieldPlaceholderResolver.SetErrorMessageCollection(errorCollection);
            actionCode = _flexFieldPlaceholderResolver.FillPlaceholders(actionCode, flexFieldExportData).Result;

            return actionCode;
        }

        /// <summary>
        /// Builds a preview text from parsed data
        /// </summary>
        /// <param name="parsedData">Parsed data</param>
        /// <param name="npc">Npc to which the dialog belongs</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <returns>Preview text</returns>
        public override async Task<string> BuildPreviewTextFromParsedData(ChangeNpcStateActionRenderer.ChangeNpcStateActionData parsedData, KortistoNpc npc, ExportPlaceholderErrorCollection errorCollection)
        {
            IFlexFieldExportable valueObject = await GetNpc(npc, errorCollection);
            if(valueObject == null)
            {
                return string.Empty;
            }

            return "SetNpcState (" + valueObject.Name + ", " + ExportUtil.BuildTextPreview(parsedData.ObjectState) + ")";
        }


        /// <summary>
        /// Returns the export template to use
        /// </summary>
        /// <param name="project">Project</param>
        /// <returns>Export template to use</returns>
        private async Task<ExportTemplate> GetExportTemplate(GoNorthProject project)
        {
            return await _defaultTemplateProvider.GetDefaultTemplateByType(project.Id, _isPlayer ? TemplateType.TaleActionSetPlayerState : TemplateType.TaleActionSetNpcState);
        }

        /// <summary>
        /// Returns the npc to use
        /// </summary>
        /// <param name="npc">Npc to which the dialog belongs</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <returns>Value Object</returns>
        private async Task<IFlexFieldExportable> GetNpc(KortistoNpc npc, ExportPlaceholderErrorCollection errorCollection)
        {
            if(_isPlayer)
            {
                GoNorthProject curProject = await _cachedDbAccess.GetDefaultProject();
                npc = await _cachedDbAccess.GetPlayerNpc(curProject.Id);
                if(npc == null)
                {
                    errorCollection.AddNoPlayerNpcExistsError();
                    return null;
                }
            }

            return npc;
        }

        /// <summary>
        /// Returns true if the action renderer has placeholders for a template type
        /// </summary>
        /// <param name="templateType">Tempalte Type to check</param>
        /// <returns>true if the action renderer has placeholders for the template type</returns>
        public override bool HasPlaceholdersForTemplateType(TemplateType templateType)
        {
            return (_isPlayer && templateType == TemplateType.TaleActionSetPlayerState) || (!_isPlayer && templateType == TemplateType.TaleActionSetNpcState);
        }   

        /// <summary>
        /// Returns the Export Template Placeholders for a Template Type
        /// </summary>
        /// <param name="templateType">Template Type</param>
        /// <returns>Export Template Placeholder</returns>
        public override List<ExportTemplatePlaceholder> GetExportTemplatePlaceholdersForType(TemplateType templateType)
        {
            List<ExportTemplatePlaceholder> exportPlaceholders = new List<ExportTemplatePlaceholder> {
                ExportUtil.CreatePlaceHolder(Placeholder_State, _localizer)
            };

            exportPlaceholders.AddRange(_flexFieldPlaceholderResolver.GetExportTemplatePlaceholdersForType(TemplateType.ObjectNpc));

            return exportPlaceholders;
        }
    }
}