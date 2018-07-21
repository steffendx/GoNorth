using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Data.Kortisto;
using GoNorth.Data.NodeGraph;
using GoNorth.Data.Project;
using GoNorth.Data.Tale;
using GoNorth.Services.Export.Data;
using GoNorth.Services.Export.Dialog.ActionRendering;
using GoNorth.Services.Export.LanguageKeyGeneration;
using GoNorth.Services.Export.Placeholder;
using Microsoft.Extensions.Localization;

namespace GoNorth.Services.Export.Dialog
{
    /// <summary>
    /// Class for Rendering Actions
    /// </summary>
    public class ExportDialogActionRenderer : ExportDialogBaseStepRenderer, IExportDialogStepRenderer
    {
        /// <summary>
        /// Action content
        /// </summary>
        private const string Placeholder_ActionContent = "Tale_Action_Content";


        /// <summary>
        /// Export default template provider
        /// </summary>
        private readonly ICachedExportDefaultTemplateProvider _defaultTemplateProvider;

        /// <summary>
        /// Language Key Generator
        /// </summary>
        private readonly ILanguageKeyGenerator _languageKeyGenerator;

        /// <summary>
        /// String Localizer
        /// </summary>
        private readonly IStringLocalizer _localizer;

        /// <summary>
        /// Export Settings
        /// </summary>
        private ExportSettings _exportSettings;

        /// <summary>
        /// Current Project
        /// </summary>
        private GoNorthProject _project;

        /// <summary>
        /// Action Renderers
        /// </summary>
        private Dictionary<ActionType, IActionRenderer> _actionRenderes;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="errorCollection">Error Collection</param>
        /// <param name="defaultTemplateProvider">Default Template Provider</param>
        /// <param name="cachedDbAccess">Cached Db Access</param>
        /// <param name="languageKeyGenerator">Language Key Generator</param>
        /// <param name="localizerFactory">Localizer Factory</param>
        /// <param name="exportSettings">Export Settings</param>
        /// <param name="project">Project</param>
        public ExportDialogActionRenderer(ExportPlaceholderErrorCollection errorCollection, ICachedExportDefaultTemplateProvider defaultTemplateProvider, IExportCachedDbAccess cachedDbAccess,
                                          ILanguageKeyGenerator languageKeyGenerator, IStringLocalizerFactory localizerFactory, ExportSettings exportSettings, GoNorthProject project) : 
                                          base(errorCollection, localizerFactory)
        {
            _defaultTemplateProvider = defaultTemplateProvider;
            _languageKeyGenerator = languageKeyGenerator;
            _localizer = localizerFactory.Create(typeof(ExportDialogActionRenderer));
            _exportSettings = exportSettings;
            _project = project;

            _actionRenderes = new Dictionary<ActionType, IActionRenderer>();
            _actionRenderes.Add(ActionType.ChangePlayerValue, new NpcValueChangeRenderer(defaultTemplateProvider, cachedDbAccess, languageKeyGenerator, localizerFactory, true));
            _actionRenderes.Add(ActionType.ChangeNpcValue, new NpcValueChangeRenderer(defaultTemplateProvider, cachedDbAccess, languageKeyGenerator, localizerFactory, false));
            _actionRenderes.Add(ActionType.SpawnItemInPlayerInventory, new InventoryActionRenderer(defaultTemplateProvider, cachedDbAccess, languageKeyGenerator, localizerFactory, true, false));
            _actionRenderes.Add(ActionType.TransferItemToPlayerInventory, new InventoryActionRenderer(defaultTemplateProvider, cachedDbAccess, languageKeyGenerator, localizerFactory, true, true));
            _actionRenderes.Add(ActionType.SpawnItemInNpcInventory, new InventoryActionRenderer(defaultTemplateProvider, cachedDbAccess, languageKeyGenerator, localizerFactory, false, false));
            _actionRenderes.Add(ActionType.TransferItemToNpcInventory, new InventoryActionRenderer(defaultTemplateProvider, cachedDbAccess, languageKeyGenerator, localizerFactory, false, true));
            _actionRenderes.Add(ActionType.ChangeQuestValue, new QuestValueChangeRenderer(defaultTemplateProvider, cachedDbAccess, languageKeyGenerator, localizerFactory));
            _actionRenderes.Add(ActionType.ChangeQuestState, new SetQuestStateActionRenderer(defaultTemplateProvider, cachedDbAccess, languageKeyGenerator, localizerFactory));
            _actionRenderes.Add(ActionType.AddQuestText, new AddQuestTextRenderer(defaultTemplateProvider, cachedDbAccess, languageKeyGenerator, localizerFactory));
            _actionRenderes.Add(ActionType.Wait, new WaitActionRenderer(defaultTemplateProvider, localizerFactory));
            _actionRenderes.Add(ActionType.ChangePlayerState, new ChangeNpcStateActionRenderer(defaultTemplateProvider, cachedDbAccess, languageKeyGenerator, localizerFactory, true));
            _actionRenderes.Add(ActionType.ChangeNpcState, new ChangeNpcStateActionRenderer(defaultTemplateProvider, cachedDbAccess, languageKeyGenerator, localizerFactory, false));
            _actionRenderes.Add(ActionType.PlayerLearnSkill, new LearnForgetSkillActionRenderer(defaultTemplateProvider, cachedDbAccess, languageKeyGenerator, localizerFactory, true, true));
            _actionRenderes.Add(ActionType.PlayerForgetSkill, new LearnForgetSkillActionRenderer(defaultTemplateProvider, cachedDbAccess, languageKeyGenerator, localizerFactory, true, false));
            _actionRenderes.Add(ActionType.NpcLearnSkill, new LearnForgetSkillActionRenderer(defaultTemplateProvider, cachedDbAccess, languageKeyGenerator, localizerFactory, false, true));
            _actionRenderes.Add(ActionType.NpcForgetSkill, new LearnForgetSkillActionRenderer(defaultTemplateProvider, cachedDbAccess, languageKeyGenerator, localizerFactory, false, false));
            _actionRenderes.Add(ActionType.ChangePlayerSkillValue, new SkillValueChangeRenderer(defaultTemplateProvider, cachedDbAccess, languageKeyGenerator, localizerFactory, true));
            _actionRenderes.Add(ActionType.ChangeNpcSkillValue, new SkillValueChangeRenderer(defaultTemplateProvider, cachedDbAccess, languageKeyGenerator, localizerFactory, false));
            _actionRenderes.Add(ActionType.PersistDialogState, new PersistDialogStateActionRenderer(defaultTemplateProvider));
            _actionRenderes.Add(ActionType.OpenShop, new OpenShopActionRenderer(defaultTemplateProvider));
        }

        /// <summary>
        /// Renders a dialog step
        /// </summary>
        /// <param name="data">Dialog Step Data</param>
        /// <param name="npc">Npc to which the dialog belongs</param>
        /// <returns>Dialog Step Render Result</returns>
        public async Task<ExportDialogStepRenderResult> RenderDialogStep(ExportDialogData data, KortistoNpc npc)
        {
            ActionNode actionNode = data.Action;
            if(actionNode == null)
            {
                return null;
            }
            
            string actionContent = await BuildActionContent(actionNode, data, npc);

            ExportTemplate template = await _defaultTemplateProvider.GetDefaultTemplateByType(_project.Id, TemplateType.TaleAction);

            ExportDialogStepRenderResult renderResult = new ExportDialogStepRenderResult();
            renderResult.StepCode = ExportUtil.BuildPlaceholderRegex(Placeholder_ActionContent).Replace(template.Code, actionContent);
            renderResult.StepCode = ReplaceBaseStepPlaceholders(renderResult.StepCode, data, data.Children.FirstOrDefault() != null ? data.Children.FirstOrDefault().Child : null);

            return renderResult;
        }

        /// <summary>
        /// Returns the valid action renderer for a node
        /// </summary>
        /// <param name="actionNode">Action Node</param>
        /// <returns>Action renderer</returns>
        private IActionRenderer GetActionRenderForNode(ActionNode actionNode)
        {
            int parsedActionType = 0;
            if(!int.TryParse(actionNode.ActionType, out parsedActionType))
            {
                _errorCollection.AddDialogUnknownActionTypeError(actionNode.ActionType);
                return null;
            }

            ActionType actionType = (ActionType)parsedActionType;
            if(!_actionRenderes.ContainsKey(actionType))
            {
                _errorCollection.AddDialogUnknownActionTypeError(actionNode.ActionType);
                return null;
            }

            return _actionRenderes[actionType];
        }

        /// <summary>
        /// Builds the action content
        /// </summary>
        /// <param name="actionNode">Action Node</param>
        /// <param name="data">Dialog data</param>
        /// <param name="npc">Npc to which the dialog belongs</param>
        /// <returns>Action content</returns>
        private async Task<string> BuildActionContent(ActionNode actionNode, ExportDialogData data, KortistoNpc npc)
        {
            IActionRenderer actionRenderer = GetActionRenderForNode(actionNode);
            if(actionRenderer == null)
            {
                return string.Empty;
            }

            return await actionRenderer.BuildActionElement(actionNode, data, _project, _errorCollection, npc, _exportSettings);
        }
    
        /// <summary>
        /// Builds a parent text preview for the a dialog step
        /// </summary>
        /// <param name="child">Child node</param>
        /// <param name="parent">Parent</param>
        /// <param name="npc">Npc to which the dialog belongs</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <returns>Parent text preview for the dialog step</returns>
        public async Task<string> BuildParentTextPreview(ExportDialogData child, ExportDialogData parent, KortistoNpc npc, ExportPlaceholderErrorCollection errorCollection)
        {
            ActionNode actionNode = parent.Action;
            if(actionNode == null)
            {
                return null;
            }

            IActionRenderer actionRenderer = GetActionRenderForNode(actionNode);
            if(actionRenderer == null)
            {
                return string.Empty;
            }

            return await actionRenderer.BuildPreviewText(actionNode, npc, errorCollection);
        }

        /// <summary>
        /// Returns if the dialog renderer has placeholders for a template type
        /// </summary>
        /// <param name="templateType">Tempalte Type to check</param>
        /// <returns>true if the dialog renderer has placeholders for the template type</returns>
        public bool HasPlaceholdersForTemplateType(TemplateType templateType)
        {
            foreach(IActionRenderer curRenderer in _actionRenderes.Values)
            {
                if(curRenderer.HasPlaceholdersForTemplateType(templateType))
                {
                    return true;
                }
            }

            return templateType == TemplateType.TaleAction;
        }

        /// <summary>
        /// Returns the placeholders for a template
        /// </summary>
        /// <param name="templateType">Template Type</param>
        /// <returns>List of template placeholders</returns>
        public List<ExportTemplatePlaceholder> GetPlaceholdersForTemplate(TemplateType templateType)
        {
            if(!HasPlaceholdersForTemplateType(templateType))
            {
                return new List<ExportTemplatePlaceholder>();
            }

            List<ExportTemplatePlaceholder> placeholders = GetBasePlaceholdersForTemplate();
            if(templateType == TemplateType.TaleAction)
            {
                placeholders.AddRange(new List<ExportTemplatePlaceholder> {
                    ExportUtil.CreatePlaceHolder(Placeholder_ActionContent, _localizer)
                });
            }

            foreach(IActionRenderer curRenderer in _actionRenderes.Values)
            {
                if(curRenderer.HasPlaceholdersForTemplateType(templateType))
                {
                    placeholders.AddRange(curRenderer.GetExportTemplatePlaceholdersForType(templateType));
                }
            }

            return placeholders;
        }
    }
}