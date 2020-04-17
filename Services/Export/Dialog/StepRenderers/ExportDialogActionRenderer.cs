using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Data.FlexFieldDatabase;
using GoNorth.Data.NodeGraph;
using GoNorth.Data.Project;
using GoNorth.Services.Export.DailyRoutine;
using GoNorth.Services.Export.Data;
using GoNorth.Services.Export.Dialog.ActionRendering;
using GoNorth.Services.Export.Dialog.ActionRendering.LegacyRenderingEngine;
using GoNorth.Services.Export.Dialog.ActionRendering.Localization;
using GoNorth.Services.Export.Dialog.ActionRendering.ScribanRenderingEngine;
using GoNorth.Services.Export.Dialog.ActionRendering.SharedRendering;
using GoNorth.Services.Export.Dialog.StepRenderers.ActionRenderer;
using GoNorth.Services.Export.LanguageKeyGeneration;
using GoNorth.Services.Export.Placeholder;
using GoNorth.Services.Export.Placeholder.LegacyRenderingEngine;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.LanguageKeyGenerator;
using Microsoft.Extensions.Localization;

namespace GoNorth.Services.Export.Dialog.StepRenderers
{
    /// <summary>
    /// Class for Rendering Actions
    /// </summary>
    public class ExportDialogActionRenderer : ExportDialogBaseStepRenderer, IExportDialogStepRenderer
    {
        /// <summary>
        /// Export default template provider
        /// </summary>
        private readonly ICachedExportDefaultTemplateProvider _defaultTemplateProvider;

        /// <summary>
        /// Action translator
        /// </summary>
        private readonly IActionTranslator _actionTranslator;

        /// <summary>
        /// Export Settings
        /// </summary>
        private readonly ExportSettings _exportSettings;

        /// <summary>
        /// Current Project
        /// </summary>
        private readonly GoNorthProject _project;

        /// <summary>
        /// Error collection
        /// </summary>
        private readonly ExportPlaceholderErrorCollection _errorCollection;

        /// <summary>
        /// Action Renderers
        /// </summary>
        private readonly Dictionary<ActionType, ActionRendererDispatcher> _actionRenderes;

        /// <summary>
        /// Renderers for the choice
        /// </summary>
        private readonly Dictionary<ExportTemplateRenderingEngine, IActionStepRenderer> _renderers;

        /// <summary>
        /// Localizer
        /// </summary>
        private readonly IStringLocalizer _localizer;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="errorCollection">Error Collection</param>
        /// <param name="defaultTemplateProvider">Default Template Provider</param>
        /// <param name="cachedDbAccess">Cached Db Access</param>
        /// <param name="legacyDailyRoutineEventPlaceholderResolver">Legacy daily routine event placeholder resolver</param>
        /// <param name="dailyRoutineFunctionNameGenerator">Daily routine function name generator</param>
        /// <param name="languageKeyGenerator">Language Key Generator</param>
        /// <param name="scribanLanguageKeyGenerator">Scriban language key generator</param>
        /// <param name="localizerFactory">Localizer Factory</param>
        /// <param name="actionTranslator">Action translator</param>
        /// <param name="exportSettings">Export Settings</param>
        /// <param name="project">Project</param>
        public ExportDialogActionRenderer(ExportPlaceholderErrorCollection errorCollection, ICachedExportDefaultTemplateProvider defaultTemplateProvider, IExportCachedDbAccess cachedDbAccess, ILegacyDailyRoutineEventPlaceholderResolver legacyDailyRoutineEventPlaceholderResolver,
                                          IDailyRoutineFunctionNameGenerator dailyRoutineFunctionNameGenerator, ILanguageKeyGenerator languageKeyGenerator, IScribanLanguageKeyGenerator scribanLanguageKeyGenerator, IStringLocalizerFactory localizerFactory, 
                                          IActionTranslator actionTranslator, ExportSettings exportSettings, GoNorthProject project)
        {
            _errorCollection = errorCollection;
            _defaultTemplateProvider = defaultTemplateProvider;
            _actionTranslator = actionTranslator;
            _exportSettings = exportSettings;
            _project = project;
            _localizer = localizerFactory.Create(typeof(ExportDialogActionRenderer));

            _actionRenderes = new Dictionary<ActionType, ActionRendererDispatcher>();
            _actionRenderes.Add(ActionType.ChangePlayerValue, new ActionRendererDispatcher(TemplateType.TaleActionChangePlayerValue, defaultTemplateProvider,  
                                    new NpcValueChangeRenderer(defaultTemplateProvider, cachedDbAccess, languageKeyGenerator, localizerFactory, true),
                                    new ScribanNpcValueChangeRenderer(defaultTemplateProvider, cachedDbAccess, scribanLanguageKeyGenerator, localizerFactory, true)));
            _actionRenderes.Add(ActionType.ChangeNpcValue, new ActionRendererDispatcher(TemplateType.TaleActionChangeNpcValue, defaultTemplateProvider,  
                                    new NpcValueChangeRenderer(defaultTemplateProvider, cachedDbAccess, languageKeyGenerator, localizerFactory, false),
                                    new ScribanNpcValueChangeRenderer(defaultTemplateProvider, cachedDbAccess, scribanLanguageKeyGenerator, localizerFactory, false)));
            _actionRenderes.Add(ActionType.SpawnItemInPlayerInventory, new ActionRendererDispatcher(TemplateType.TaleActionSpawnItemForPlayer, defaultTemplateProvider,
                                    new InventoryActionRenderer(defaultTemplateProvider, cachedDbAccess, languageKeyGenerator, localizerFactory, true, false, false),
                                    new ScribanInventoryActionRenderer(cachedDbAccess, scribanLanguageKeyGenerator, localizerFactory, true, false, false)));
            _actionRenderes.Add(ActionType.TransferItemToPlayerInventory, new ActionRendererDispatcher(TemplateType.TaleActionTransferItemToPlayer, defaultTemplateProvider,
                                    new InventoryActionRenderer(defaultTemplateProvider, cachedDbAccess, languageKeyGenerator, localizerFactory, true, true, false),
                                    new ScribanInventoryActionRenderer(cachedDbAccess, scribanLanguageKeyGenerator, localizerFactory, true, true, false)));
            _actionRenderes.Add(ActionType.RemoveItemFromPlayerInventory, new ActionRendererDispatcher(TemplateType.TaleActionRemoveItemFromPlayer, defaultTemplateProvider,
                                    new InventoryActionRenderer(defaultTemplateProvider, cachedDbAccess, languageKeyGenerator, localizerFactory, true, false, true),
                                    new ScribanInventoryActionRenderer(cachedDbAccess, scribanLanguageKeyGenerator, localizerFactory, true, false, true)));
            _actionRenderes.Add(ActionType.SpawnItemInNpcInventory, new ActionRendererDispatcher(TemplateType.TaleActionSpawnItemForNpc, defaultTemplateProvider,
                                    new InventoryActionRenderer(defaultTemplateProvider, cachedDbAccess, languageKeyGenerator, localizerFactory, false, false, false),
                                    new ScribanInventoryActionRenderer(cachedDbAccess, scribanLanguageKeyGenerator, localizerFactory, false, false, false)));
            _actionRenderes.Add(ActionType.TransferItemToNpcInventory, new ActionRendererDispatcher(TemplateType.TaleActionTransferItemToNpc, defaultTemplateProvider,
                                    new InventoryActionRenderer(defaultTemplateProvider, cachedDbAccess, languageKeyGenerator, localizerFactory, false, true, false),
                                    new ScribanInventoryActionRenderer(cachedDbAccess, scribanLanguageKeyGenerator, localizerFactory, false, true, false)));
            _actionRenderes.Add(ActionType.RemoveItemFromNpcInventory, new ActionRendererDispatcher(TemplateType.TaleActionRemoveItemFromNpc, defaultTemplateProvider,
                                    new InventoryActionRenderer(defaultTemplateProvider, cachedDbAccess, languageKeyGenerator, localizerFactory, false, false, true),
                                    new ScribanInventoryActionRenderer(cachedDbAccess, scribanLanguageKeyGenerator, localizerFactory, false, false, true)));
            _actionRenderes.Add(ActionType.ChangeQuestValue, new ActionRendererDispatcher(TemplateType.TaleActionChangeQuestValue, defaultTemplateProvider,
                                    new QuestValueChangeRenderer(defaultTemplateProvider, cachedDbAccess, languageKeyGenerator, localizerFactory),
                                    new ScribanQuestValueChangeRenderer(defaultTemplateProvider, cachedDbAccess, scribanLanguageKeyGenerator, localizerFactory)));
            _actionRenderes.Add(ActionType.ChangeQuestState, new ActionRendererDispatcher(TemplateType.TaleActionSetQuestState, defaultTemplateProvider,
                                    new SetQuestStateActionRenderer(defaultTemplateProvider, cachedDbAccess, languageKeyGenerator, localizerFactory),
                                    new ScribanSetQuestStateActionRenderer(cachedDbAccess, scribanLanguageKeyGenerator, localizerFactory)));
            _actionRenderes.Add(ActionType.AddQuestText, new ActionRendererDispatcher(TemplateType.TaleActionAddQuestText, defaultTemplateProvider, 
                                    new AddQuestTextRenderer(defaultTemplateProvider, cachedDbAccess, languageKeyGenerator, localizerFactory),
                                    new ScribanAddQuestTextActionRenderer(cachedDbAccess, scribanLanguageKeyGenerator, localizerFactory)));
            _actionRenderes.Add(ActionType.ChangeCurrentSkillValue, new ActionRendererDispatcher(TemplateType.TaleActionChangeCurrentSkillValue, defaultTemplateProvider,  
                                    new CurrentSkillValueChangeRenderer(defaultTemplateProvider, cachedDbAccess, languageKeyGenerator, localizerFactory),
                                    new ScribanCurrentSkillValueChangeRenderer(defaultTemplateProvider, cachedDbAccess, scribanLanguageKeyGenerator, localizerFactory)));
            _actionRenderes.Add(ActionType.Wait, new ActionRendererDispatcher(TemplateType.TaleActionWait, defaultTemplateProvider, 
                                    new WaitActionRenderer(localizerFactory),
                                    new ScribanWaitActionRenderer(cachedDbAccess, localizerFactory)));
            _actionRenderes.Add(ActionType.ChangePlayerState, new ActionRendererDispatcher(TemplateType.TaleActionSetPlayerState, defaultTemplateProvider, 
                                    new ChangeNpcStateActionRenderer(defaultTemplateProvider, cachedDbAccess, languageKeyGenerator, localizerFactory, true),
                                    new ScribanChangeNpcStateActionRenderer(cachedDbAccess, scribanLanguageKeyGenerator, localizerFactory, true)));
            _actionRenderes.Add(ActionType.ChangeNpcState, new ActionRendererDispatcher(TemplateType.TaleActionSetNpcState, defaultTemplateProvider, 
                                    new ChangeNpcStateActionRenderer(defaultTemplateProvider, cachedDbAccess, languageKeyGenerator, localizerFactory, false),
                                    new ScribanChangeNpcStateActionRenderer(cachedDbAccess, scribanLanguageKeyGenerator, localizerFactory, false)));
            _actionRenderes.Add(ActionType.ChangeTargetNpcState, new ActionRendererDispatcher(TemplateType.TaleActionSetTargetNpcState, defaultTemplateProvider,
                                    new ChangeTargetNpcStateActionRenderer(defaultTemplateProvider, cachedDbAccess, languageKeyGenerator, localizerFactory),
                                    new ScribanChangeTargetNpcStateActionRenderer(cachedDbAccess, scribanLanguageKeyGenerator, localizerFactory)));
            _actionRenderes.Add(ActionType.PlayerLearnSkill, new ActionRendererDispatcher(TemplateType.TaleActionPlayerLearnSkill, defaultTemplateProvider,
                                    new LearnForgetSkillActionRenderer(defaultTemplateProvider, cachedDbAccess, languageKeyGenerator, localizerFactory, true, true),
                                    new ScribanLearnForgetSkillActionRenderer(cachedDbAccess, scribanLanguageKeyGenerator, localizerFactory, true, true)));
            _actionRenderes.Add(ActionType.PlayerForgetSkill, new ActionRendererDispatcher(TemplateType.TaleActionPlayerForgetSkill, defaultTemplateProvider,
                                    new LearnForgetSkillActionRenderer(defaultTemplateProvider, cachedDbAccess, languageKeyGenerator, localizerFactory, true, false),
                                    new ScribanLearnForgetSkillActionRenderer(cachedDbAccess, scribanLanguageKeyGenerator, localizerFactory, true, false)));
            _actionRenderes.Add(ActionType.NpcLearnSkill, new ActionRendererDispatcher(TemplateType.TaleActionNpcLearnSkill, defaultTemplateProvider,
                                    new LearnForgetSkillActionRenderer(defaultTemplateProvider, cachedDbAccess, languageKeyGenerator, localizerFactory, false, true),
                                    new ScribanLearnForgetSkillActionRenderer(cachedDbAccess, scribanLanguageKeyGenerator, localizerFactory, false, true)));
            _actionRenderes.Add(ActionType.NpcForgetSkill, new ActionRendererDispatcher(TemplateType.TaleActionNpcForgetSkill, defaultTemplateProvider,
                                    new LearnForgetSkillActionRenderer(defaultTemplateProvider, cachedDbAccess, languageKeyGenerator, localizerFactory, false, false),
                                    new ScribanLearnForgetSkillActionRenderer(cachedDbAccess, scribanLanguageKeyGenerator, localizerFactory, false, false)));
            _actionRenderes.Add(ActionType.ChangePlayerSkillValue, new ActionRendererDispatcher(TemplateType.TaleActionChangePlayerSkillValue, defaultTemplateProvider,  
                                    new SkillValueChangeRenderer(defaultTemplateProvider, cachedDbAccess, languageKeyGenerator, localizerFactory, true),
                                    new ScribanSkillValueChangeRenderer(defaultTemplateProvider, cachedDbAccess, scribanLanguageKeyGenerator, localizerFactory, true)));
            _actionRenderes.Add(ActionType.ChangeNpcSkillValue, new ActionRendererDispatcher(TemplateType.TaleActionChangeNpcSkillValue, defaultTemplateProvider, 
                                    new SkillValueChangeRenderer(defaultTemplateProvider, cachedDbAccess, languageKeyGenerator, localizerFactory, false),
                                    new ScribanSkillValueChangeRenderer(defaultTemplateProvider, cachedDbAccess, scribanLanguageKeyGenerator, localizerFactory, false)));
            _actionRenderes.Add(ActionType.PersistDialogState, new ActionRendererDispatcher(TemplateType.TaleActionPersistDialogState, defaultTemplateProvider,
                                    new PersistDialogStateActionRenderer(),
                                    new ScribanPersistDialogStateActionRenderer(cachedDbAccess)));
            _actionRenderes.Add(ActionType.OpenShop, new ActionRendererDispatcher(TemplateType.TaleActionOpenShop, defaultTemplateProvider,
                                    new OpenShopActionRenderer(),
                                    new ScribanOpenShopActionRenderer(cachedDbAccess)));
            _actionRenderes.Add(ActionType.PlayNpcAnimation, new ActionRendererDispatcher(TemplateType.TaleActionNpcPlayAnimation, defaultTemplateProvider,   
                                    new PlayAnimationActionRenderer(defaultTemplateProvider, cachedDbAccess, languageKeyGenerator, localizerFactory, false),
                                    new ScribanPlayAnimationActionRenderer(cachedDbAccess, localizerFactory, false)));
            _actionRenderes.Add(ActionType.PlayPlayerAnimation, new ActionRendererDispatcher(TemplateType.TaleActionPlayerPlayAnimation, defaultTemplateProvider,   
                                    new PlayAnimationActionRenderer(defaultTemplateProvider, cachedDbAccess, languageKeyGenerator, localizerFactory, true),
                                    new ScribanPlayAnimationActionRenderer(cachedDbAccess, localizerFactory, true)));
            _actionRenderes.Add(ActionType.CodeAction, new ActionRendererDispatcher(TemplateType.TaleActionCodeAction, defaultTemplateProvider, 
                                    new CodeActionRenderer(localizerFactory),
                                    new ScribanCodeActionRenderer(cachedDbAccess, localizerFactory)));
            _actionRenderes.Add(ActionType.ShowFloatingTextAboveNpc, new ActionRendererDispatcher(TemplateType.TaleActionShowFloatingTextAboveNpc, defaultTemplateProvider, 
                                    new ShowFloatingTextAboveNpcActionRenderer(defaultTemplateProvider, cachedDbAccess, languageKeyGenerator, localizerFactory, false),
                                    new ScribanShowFloatingTextAboveNpcActionRenderer(cachedDbAccess, scribanLanguageKeyGenerator, localizerFactory, false)));
            _actionRenderes.Add(ActionType.ShowFloatingTextAbovePlayer, new ActionRendererDispatcher(TemplateType.TaleActionShowFloatingTextAbovePlayer, defaultTemplateProvider, 
                                    new ShowFloatingTextAboveNpcActionRenderer(defaultTemplateProvider, cachedDbAccess, languageKeyGenerator, localizerFactory, true),
                                    new ScribanShowFloatingTextAboveNpcActionRenderer(cachedDbAccess, scribanLanguageKeyGenerator, localizerFactory, true)));
            _actionRenderes.Add(ActionType.ShowFloatingTextAboveChooseNpc, new ActionRendererDispatcher(TemplateType.TaleActionShowFloatingTextAboveChooseNpc, defaultTemplateProvider, 
                                    new ShowFloatingTextAboveChooseNpcActionRenderer(defaultTemplateProvider, cachedDbAccess, languageKeyGenerator, localizerFactory),
                                    new ScribanShowFloatingTextAboveChooseNpcActionRenderer(cachedDbAccess, scribanLanguageKeyGenerator, localizerFactory)));
            _actionRenderes.Add(ActionType.FadeToBlack, new ActionRendererDispatcher(TemplateType.TaleActionFadeToBlack, defaultTemplateProvider,   
                                    new FadeToFromBlackRenderer(localizerFactory, true),
                                    new ScribanFadeToFromBlackRenderer(cachedDbAccess, localizerFactory, true)));
            _actionRenderes.Add(ActionType.FadeFromBlack, new ActionRendererDispatcher(TemplateType.TaleActionFadeFromBlack, defaultTemplateProvider,   
                                    new FadeToFromBlackRenderer(localizerFactory, false),
                                    new ScribanFadeToFromBlackRenderer(cachedDbAccess, localizerFactory, false)));
            _actionRenderes.Add(ActionType.SetGameTime, new ActionRendererDispatcher(TemplateType.TaleActionSetGameTime, defaultTemplateProvider, 
                                    new SetGameTimeActionRenderer(cachedDbAccess, localizerFactory),
                                    new ScribanSetGameTimeActionRenderer(cachedDbAccess, localizerFactory)));
            _actionRenderes.Add(ActionType.DisableDailyRoutineEvent, new ActionRendererDispatcher(TemplateType.TaleActionDisableDailyRoutineEvent, defaultTemplateProvider, 
                                    new SetDailyRoutineEventState(defaultTemplateProvider, cachedDbAccess, legacyDailyRoutineEventPlaceholderResolver, languageKeyGenerator, localizerFactory, true),
                                    new ScribanSetDailyRoutineEventState(cachedDbAccess, dailyRoutineFunctionNameGenerator, scribanLanguageKeyGenerator, localizerFactory, true)));
            _actionRenderes.Add(ActionType.EnableDailyRoutineEvent, new ActionRendererDispatcher(TemplateType.TaleActionEnableDailyRoutineEvent, defaultTemplateProvider,
                                    new SetDailyRoutineEventState(defaultTemplateProvider, cachedDbAccess, legacyDailyRoutineEventPlaceholderResolver, languageKeyGenerator, localizerFactory, false),
                                    new ScribanSetDailyRoutineEventState(cachedDbAccess, dailyRoutineFunctionNameGenerator, scribanLanguageKeyGenerator, localizerFactory, false)));
            _actionRenderes.Add(ActionType.TeleportNpc, new ActionRendererDispatcher(TemplateType.TaleActionTeleportNpc, defaultTemplateProvider,
                                    new MoveNpcActionRenderer(defaultTemplateProvider, cachedDbAccess, languageKeyGenerator, localizerFactory, true, false, false),
                                    new ScribanMoveNpcActionRenderer(cachedDbAccess, scribanLanguageKeyGenerator, localizerFactory, true, false, false)));
            _actionRenderes.Add(ActionType.TeleportPlayer, new ActionRendererDispatcher(TemplateType.TaleActionTeleportPlayer, defaultTemplateProvider,
                                    new MoveNpcActionRenderer(defaultTemplateProvider, cachedDbAccess, languageKeyGenerator, localizerFactory, true, true, false),
                                    new ScribanMoveNpcActionRenderer(cachedDbAccess, scribanLanguageKeyGenerator, localizerFactory, true, true, false)));
            _actionRenderes.Add(ActionType.TeleportChooseNpc, new ActionRendererDispatcher(TemplateType.TaleActionTeleportChooseNpc, defaultTemplateProvider,
                                    new MoveNpcActionRenderer(defaultTemplateProvider, cachedDbAccess, languageKeyGenerator, localizerFactory, true, false, true),
                                    new ScribanMoveNpcActionRenderer(cachedDbAccess, scribanLanguageKeyGenerator, localizerFactory, true, false, true)));
            _actionRenderes.Add(ActionType.WalkNpcToMarker, new ActionRendererDispatcher(TemplateType.TaleActionWalkNpc, defaultTemplateProvider,
                                    new MoveNpcActionRenderer(defaultTemplateProvider, cachedDbAccess, languageKeyGenerator, localizerFactory, false, false, false),
                                    new ScribanMoveNpcActionRenderer(cachedDbAccess, scribanLanguageKeyGenerator, localizerFactory, false, false, false)));
            _actionRenderes.Add(ActionType.WalkChooseNpcToMarker, new ActionRendererDispatcher(TemplateType.TaleActionWalkChooseNpc, defaultTemplateProvider,
                                    new MoveNpcActionRenderer(defaultTemplateProvider, cachedDbAccess, languageKeyGenerator, localizerFactory, false, false, true),
                                    new ScribanMoveNpcActionRenderer(cachedDbAccess, scribanLanguageKeyGenerator, localizerFactory, false, false, true)));
            _actionRenderes.Add(ActionType.TeleportNpcToNpc, new ActionRendererDispatcher(TemplateType.TaleActionTeleportNpcToNpc, defaultTemplateProvider,
                                    new MoveNpcToNpcActionRenderer(defaultTemplateProvider, cachedDbAccess, languageKeyGenerator, localizerFactory, true, false),
                                    new ScribanMoveNpcToNpcActionRenderer(cachedDbAccess, scribanLanguageKeyGenerator, localizerFactory, true, false)));
            _actionRenderes.Add(ActionType.TeleportChooseNpcToNpc, new ActionRendererDispatcher(TemplateType.TaleActionTeleportChooseNpcToNpc, defaultTemplateProvider,
                                    new MoveNpcToNpcActionRenderer(defaultTemplateProvider, cachedDbAccess, languageKeyGenerator, localizerFactory, true, true),
                                    new ScribanMoveNpcToNpcActionRenderer(cachedDbAccess, scribanLanguageKeyGenerator, localizerFactory, true, true)));
            _actionRenderes.Add(ActionType.WalkNpcToNpc, new ActionRendererDispatcher(TemplateType.TaleActionWalkNpcToNpc, defaultTemplateProvider,
                                    new MoveNpcToNpcActionRenderer(defaultTemplateProvider, cachedDbAccess, languageKeyGenerator, localizerFactory, false, false),
                                    new ScribanMoveNpcToNpcActionRenderer(cachedDbAccess, scribanLanguageKeyGenerator, localizerFactory, false, false)));
            _actionRenderes.Add(ActionType.WalkChooseNpcToNpc, new ActionRendererDispatcher(TemplateType.TaleActionWalkChooseNpcToNpc, defaultTemplateProvider,
                                    new MoveNpcToNpcActionRenderer(defaultTemplateProvider, cachedDbAccess, languageKeyGenerator, localizerFactory, false, true),
                                    new ScribanMoveNpcToNpcActionRenderer(cachedDbAccess, scribanLanguageKeyGenerator, localizerFactory, false, true)));
            _actionRenderes.Add(ActionType.SpawnNpcAtMarker, new ActionRendererDispatcher(TemplateType.TaleActionSpawnNpcAtMarker, defaultTemplateProvider,
                                    new SpawnNpcAtMarkerRender(defaultTemplateProvider, cachedDbAccess, languageKeyGenerator, localizerFactory),
                                    new ScribanSpawnNpcActionRenderer(cachedDbAccess, scribanLanguageKeyGenerator, localizerFactory)));
            _actionRenderes.Add(ActionType.SpawnItemAtMarker, new ActionRendererDispatcher(TemplateType.TaleActionSpawnItemAtMarker, defaultTemplateProvider,
                                    new SpawnItemAtMarkerRender(defaultTemplateProvider, cachedDbAccess, languageKeyGenerator, localizerFactory),
                                    new ScribanSpawnItemActionRenderer(cachedDbAccess, scribanLanguageKeyGenerator, localizerFactory)));
            _actionRenderes.Add(ActionType.ChangeItemValue, new ActionRendererDispatcher(TemplateType.TaleActionChangeItemValue, defaultTemplateProvider,  
                                    new ItemValueChangeRenderer(defaultTemplateProvider, cachedDbAccess, languageKeyGenerator, localizerFactory),
                                    new ScribanItemValueChangeRenderer(defaultTemplateProvider, cachedDbAccess, scribanLanguageKeyGenerator, localizerFactory)));
            _actionRenderes.Add(ActionType.SpawnItemInChooseNpcInventory, new ActionRendererDispatcher(TemplateType.TaleActionSpawnItemForChooseNpc, defaultTemplateProvider,  
                                    new InventoryActionChooseNpcRenderer(defaultTemplateProvider, cachedDbAccess, languageKeyGenerator, localizerFactory, false),
                                    new ScribanInventoryActionChooseNpcRenderer(cachedDbAccess, scribanLanguageKeyGenerator, localizerFactory, false)));
            _actionRenderes.Add(ActionType.RemoveItemFromChooseNpcInventory, new ActionRendererDispatcher(TemplateType.TaleActionRemoveItemFromChooseNpc, defaultTemplateProvider,  
                                    new InventoryActionChooseNpcRenderer(defaultTemplateProvider, cachedDbAccess, languageKeyGenerator, localizerFactory, true),
                                    new ScribanInventoryActionChooseNpcRenderer(cachedDbAccess, scribanLanguageKeyGenerator, localizerFactory, true)));
            _actionRenderes.Add(ActionType.NpcUseItem, new ActionRendererDispatcher(TemplateType.TaleActionNpcUseItem, defaultTemplateProvider,  
                                    new UseItemActionRenderer(defaultTemplateProvider, cachedDbAccess, languageKeyGenerator, localizerFactory, false, false),
                                    new ScribanUseItemActionRenderer(cachedDbAccess, scribanLanguageKeyGenerator, localizerFactory, false, false)));
            _actionRenderes.Add(ActionType.PlayerUseItem, new ActionRendererDispatcher(TemplateType.TaleActionPlayerUseItem, defaultTemplateProvider,  
                                    new UseItemActionRenderer(defaultTemplateProvider, cachedDbAccess, languageKeyGenerator, localizerFactory, true, false),
                                    new ScribanUseItemActionRenderer(cachedDbAccess, scribanLanguageKeyGenerator, localizerFactory, true, false)));
            _actionRenderes.Add(ActionType.ChooseNpcUseItem, new ActionRendererDispatcher(TemplateType.TaleActionChooseNpcUseItem, defaultTemplateProvider,  
                                    new UseItemActionRenderer(defaultTemplateProvider, cachedDbAccess, languageKeyGenerator, localizerFactory, false, true),
                                    new ScribanUseItemActionRenderer(cachedDbAccess, scribanLanguageKeyGenerator, localizerFactory, false, true)));

            _renderers = new Dictionary<ExportTemplateRenderingEngine, IActionStepRenderer> {
                { ExportTemplateRenderingEngine.Legacy, new LegacyActionStepRenderer(errorCollection,localizerFactory) },
                { ExportTemplateRenderingEngine.Scriban, new ScribanActionStepRenderer(cachedDbAccess, errorCollection, exportSettings,localizerFactory) }
            };
        }

        /// <summary>
        /// Sets the export template placeholder resolver
        /// </summary>
        /// <param name="templatePlaceholderResolver">Template placeholder resolver</param>
        public override void SetExportTemplatePlaceholderResolver(IExportTemplatePlaceholderResolver templatePlaceholderResolver)
        {
            foreach(ActionRendererDispatcher curActionRenderer in _actionRenderes.Values)
            {
                curActionRenderer.SetExportTemplatePlaceholderResolver(templatePlaceholderResolver);
            }
        }

        /// <summary>
        /// Renders a dialog step
        /// </summary>
        /// <param name="data">Dialog Step Data</param>
        /// <param name="flexFieldObject">Flex Field to which the dialog belongs</param>
        /// <returns>Dialog Step Render Result</returns>
        public async Task<ExportDialogStepRenderResult> RenderDialogStep(ExportDialogData data, FlexFieldObject flexFieldObject)
        {
            ActionNode actionNode = data.Action;
            if(actionNode == null)
            {
                return null;
            }
            
            ActionRendererDispatcher actionRenderer = GetActionRenderForNode(actionNode);

            ExportDialogDataChild nextStep = null;
            if(data.Children != null)
            {
                if(actionRenderer != null)
                {
                    nextStep = actionRenderer.GetNextStep(data.Children);
                }
                else
                {
                    nextStep = data.Children.FirstOrDefault();
                }
            }

            ExportTemplate template = await _defaultTemplateProvider.GetDefaultTemplateByType(_project.Id, TemplateType.TaleAction);
            if(!_renderers.ContainsKey(template.RenderingEngine))
            {
                throw new KeyNotFoundException(string.Format("Unknown rendering engine {0} for ActionNode", template.RenderingEngine.ToString()));   
            }

            IActionStepRenderer stepRenderer = _renderers[template.RenderingEngine];
            stepRenderer.ResetStepRenderingValues();
            
            string oldContext = _errorCollection.CurrentErrorContext;
            _errorCollection.CurrentErrorContext = _localizer["ErrorContextAction", _actionTranslator.TranslateActionType((ActionType)actionNode.ActionType)];
            try
            {
                string actionContent = await BuildActionContent(actionRenderer, actionNode, data, flexFieldObject, stepRenderer);
                return await stepRenderer.RenderDialogStep(template, data, nextStep, flexFieldObject, actionContent);
            }
            catch(Exception ex)
            {
                _errorCollection.AddException(ex);
                return new ExportDialogStepRenderResult {
                    StepCode = "<<ERROR_RENDERING_ACTION>>"
                };
            }
            finally
            {
                _errorCollection.CurrentErrorContext = oldContext;
            }
        }

        /// <summary>
        /// Returns the valid action renderer for a node
        /// </summary>
        /// <param name="actionNode">Action Node</param>
        /// <returns>Action renderer</returns>
        private ActionRendererDispatcher GetActionRenderForNode(ActionNode actionNode)
        {
            ActionType actionType = (ActionType)actionNode.ActionType;
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
        /// <param name="actionRenderer">Action Renderer</param>
        /// <param name="actionNode">Action Node</param>
        /// <param name="data">Dialog data</param>
        /// <param name="flexFieldObject">Flex field object to which the dialog belongs</param>
        /// <param name="stepRenderer">Action Step renderer</param>
        /// <returns>Action content</returns>
        private async Task<string> BuildActionContent(ActionRendererDispatcher actionRenderer, ActionNode actionNode, ExportDialogData data, FlexFieldObject flexFieldObject, IActionStepRenderer stepRenderer)
        {
            if(actionRenderer == null)
            {
                return string.Empty;
            }

            return await actionRenderer.BuildActionElement(actionNode, data, _project, _errorCollection, flexFieldObject, _exportSettings, stepRenderer);
        }
    
        /// <summary>
        /// Builds a parent text preview for the a dialog step
        /// </summary>
        /// <param name="child">Child node</param>
        /// <param name="parent">Parent</param>
        /// <param name="flexFieldObject">Flex Field to which the dialog belongs</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <returns>Parent text preview for the dialog step</returns>
        public async Task<string> BuildParentTextPreview(ExportDialogData child, ExportDialogData parent, FlexFieldObject flexFieldObject, ExportPlaceholderErrorCollection errorCollection)
        {
            ActionNode actionNode = parent.Action;
            if(actionNode == null)
            {
                return null;
            }

            ActionRendererDispatcher actionRenderer = GetActionRenderForNode(actionNode);
            if(actionRenderer == null)
            {
                return string.Empty;
            }

            return await actionRenderer.BuildPreviewText(actionNode, flexFieldObject, errorCollection, child, parent);
        }

        /// <summary>
        /// Returns if the dialog renderer has placeholders for a template type
        /// </summary>
        /// <param name="templateType">Tempalte Type to check</param>
        /// <returns>true if the dialog renderer has placeholders for the template type</returns>
        public bool HasPlaceholdersForTemplateType(TemplateType templateType)
        {
            foreach(ActionRendererDispatcher curRenderer in _actionRenderes.Values)
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
        /// <param name="renderingEngine">Rendering engine</param>
        /// <returns>List of template placeholders</returns>
        public List<ExportTemplatePlaceholder> GetPlaceholdersForTemplate(TemplateType templateType, ExportTemplateRenderingEngine renderingEngine)
        {
            if (!HasPlaceholdersForTemplateType(templateType))
            {
                return new List<ExportTemplatePlaceholder>();
            }

            if (templateType == TemplateType.TaleAction)
            {
                if (!_renderers.ContainsKey(renderingEngine))
                {
                    throw new KeyNotFoundException(string.Format("Unknown rendering engine {0} for ActionNode", renderingEngine.ToString()));
                }

                return _renderers[renderingEngine].GetPlaceholdersForTemplate(templateType);
            }

            return GetPlaceholdersForAction(templateType, renderingEngine);
        }

        /// <summary>
        /// Returns the placeholders for an action
        /// </summary>
        /// <param name="templateType">Template type</param>
        /// <param name="renderingEngine">Rendering engine</param>
        /// <returns>Placeholders</returns>
        private List<ExportTemplatePlaceholder> GetPlaceholdersForAction(TemplateType templateType, ExportTemplateRenderingEngine renderingEngine)
        {
            List<ExportTemplatePlaceholder> placeholders = new List<ExportTemplatePlaceholder>();

            // Read template type for base placeholders from template rendering engine to allow mixed mode
            ExportTemplate template = _defaultTemplateProvider.GetDefaultTemplateByType(_project.Id, TemplateType.TaleAction).Result;
            if (!_renderers.ContainsKey(template.RenderingEngine))
            {
                throw new KeyNotFoundException(string.Format("Unknown rendering engine {0} for ActionNode", renderingEngine.ToString()));
            }

            placeholders.AddRange(_renderers[template.RenderingEngine].GetPlaceholdersForTemplate(templateType));

            foreach (ActionRendererDispatcher curRenderer in _actionRenderes.Values)
            {
                if (curRenderer.HasPlaceholdersForTemplateType(templateType))
                {
                    placeholders.AddRange(curRenderer.GetExportTemplatePlaceholdersForType(templateType, renderingEngine));
                }
            }

            return placeholders;
        }
    }
}