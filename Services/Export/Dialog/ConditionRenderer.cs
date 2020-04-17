using System;
using System.Collections.Generic;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Data.FlexFieldDatabase;
using GoNorth.Data.NodeGraph;
using GoNorth.Data.Project;
using GoNorth.Services.Export.DailyRoutine;
using GoNorth.Services.Export.Data;
using GoNorth.Services.Export.Dialog.ConditionRendering;
using GoNorth.Services.Export.Dialog.ConditionRendering.LegacyRenderingEngine;
using GoNorth.Services.Export.Dialog.ConditionRendering.Localization;
using GoNorth.Services.Export.Dialog.ConditionRendering.ScribanRenderingEngine;
using GoNorth.Services.Export.LanguageKeyGeneration;
using GoNorth.Services.Export.Placeholder;
using GoNorth.Services.Export.Placeholder.LegacyRenderingEngine;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.LanguageKeyGenerator;
using Microsoft.Extensions.Localization;

namespace GoNorth.Services.Export.Dialog
{
    /// <summary>
    /// Class for rendering conditions
    /// </summary>
    public class ConditionRenderer : IConditionRenderer
    {
        /// <summary>
        /// Default Template Provider
        /// </summary>
        private readonly ICachedExportDefaultTemplateProvider _defaultTemplateProvider;

        /// <summary>
        /// Condition translator
        /// </summary>
        private readonly IConditionTranslator _conditionTranslator;

        /// <summary>
        /// String localizer
        /// </summary>
        private readonly IStringLocalizer _localizer;

        /// <summary>
        /// Condition Element Renderers
        /// </summary>
        private Dictionary<ConditionType, ConditionRendererDispatcher> _elementRenderes;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="defaultTemplateProvider">Default Template Provider</param>
        /// <param name="cachedDbAccess">Cached Db Access</param>
        /// <param name="dailyRoutineFunctionNameGenerator">Daily routine function name generator</param>
        /// <param name="dailyRoutineEventPlaceholderResolver">Legacy Daily routine event placeholder resolver</param>
        /// <param name="scribanLanguageKeyGenerator">Scriban language key generator</param>
        /// <param name="languageKeyGenerator">Language Key Generator</param>
        /// <param name="conditionTranslator">Condition translator</param>
        /// <param name="localizerFactory">Localizer Factory</param>
        public ConditionRenderer(ICachedExportDefaultTemplateProvider defaultTemplateProvider, IExportCachedDbAccess cachedDbAccess, ILegacyDailyRoutineEventPlaceholderResolver dailyRoutineEventPlaceholderResolver, 
                                 IDailyRoutineFunctionNameGenerator dailyRoutineFunctionNameGenerator, IScribanLanguageKeyGenerator scribanLanguageKeyGenerator, ILanguageKeyGenerator languageKeyGenerator, 
                                 IConditionTranslator conditionTranslator, IStringLocalizerFactory localizerFactory)
        {
            _defaultTemplateProvider = defaultTemplateProvider;
            _conditionTranslator = conditionTranslator;
            _localizer = localizerFactory.Create(typeof(ConditionRenderer));

            _elementRenderes = new Dictionary<ConditionType, ConditionRendererDispatcher>();
            _elementRenderes.Add(ConditionType.Group, new ConditionRendererDispatcher(TemplateType.GeneralLogicGroup, defaultTemplateProvider, 
                                    new GroupConditionResolver(this, defaultTemplateProvider, localizerFactory), 
                                    new ScribanGroupConditionRenderer(this, defaultTemplateProvider, cachedDbAccess, localizerFactory)));
            _elementRenderes.Add(ConditionType.PlayerValueCondition, new ConditionRendererDispatcher(TemplateType.TaleConditionPlayerValue, defaultTemplateProvider, 
                                    new NpcValueConditionResolver(defaultTemplateProvider, cachedDbAccess, languageKeyGenerator, localizerFactory, true), 
                                    new ScribanNpcValueConditionRenderer(defaultTemplateProvider, cachedDbAccess, scribanLanguageKeyGenerator, localizerFactory, true)));
           _elementRenderes.Add(ConditionType.NpcValueCondition, new ConditionRendererDispatcher(TemplateType.TaleConditionNpcValue, defaultTemplateProvider,
                                    new NpcValueConditionResolver(defaultTemplateProvider, cachedDbAccess, languageKeyGenerator, localizerFactory, false),
                                    new ScribanNpcValueConditionRenderer(defaultTemplateProvider, cachedDbAccess, scribanLanguageKeyGenerator, localizerFactory, false)));
           _elementRenderes.Add(ConditionType.PlayerInventoryCondition, new ConditionRendererDispatcher(TemplateType.TaleConditionPlayerInventory, defaultTemplateProvider,
                                    new InventoryConditionResolver(defaultTemplateProvider, cachedDbAccess, languageKeyGenerator, localizerFactory),
                                    new ScribanInventoryConditionRenderer(defaultTemplateProvider, cachedDbAccess, scribanLanguageKeyGenerator, localizerFactory, true)));
           _elementRenderes.Add(ConditionType.NpcInventoryCondition, new ConditionRendererDispatcher(TemplateType.TaleConditionNpcInventory, defaultTemplateProvider,
                                    new InventoryConditionResolver(defaultTemplateProvider, cachedDbAccess, languageKeyGenerator, localizerFactory),
                                    new ScribanInventoryConditionRenderer(defaultTemplateProvider, cachedDbAccess, scribanLanguageKeyGenerator, localizerFactory, false)));
           _elementRenderes.Add(ConditionType.ChooseQuestValueCondition, new ConditionRendererDispatcher(TemplateType.TaleConditionQuestValue, defaultTemplateProvider,
                                    new QuestValueConditionResolver(defaultTemplateProvider, cachedDbAccess, languageKeyGenerator, localizerFactory),
                                    new ScribanQuestValueConditionRenderer(defaultTemplateProvider, cachedDbAccess, scribanLanguageKeyGenerator, localizerFactory)));
           _elementRenderes.Add(ConditionType.QuestStateCondition, new ConditionRendererDispatcher(TemplateType.TaleConditionQuestState, defaultTemplateProvider,
                                    new QuestStateConditionResolver(defaultTemplateProvider, cachedDbAccess, languageKeyGenerator, localizerFactory),
                                    new ScribanQuestStateConditionRenderer(cachedDbAccess, scribanLanguageKeyGenerator, localizerFactory)));
           _elementRenderes.Add(ConditionType.NpcAliveStateCondition, new ConditionRendererDispatcher(TemplateType.TaleConditionNpcAliveState, defaultTemplateProvider, 
                                    new NpcAliveStateConditionResolver(defaultTemplateProvider, cachedDbAccess, languageKeyGenerator, localizerFactory),
                                    new ScribanNpcAliveStateConditionRenderer(cachedDbAccess, scribanLanguageKeyGenerator, localizerFactory)));
           _elementRenderes.Add(ConditionType.CurrentSkillValueCondition, new ConditionRendererDispatcher(TemplateType.TaleConditionCurrentSkillValue, defaultTemplateProvider, 
                                    new CurrentSkillValueConditionResolver(defaultTemplateProvider, cachedDbAccess, languageKeyGenerator, localizerFactory),
                                    new ScribanCurrentSkillValueConditionRenderer(defaultTemplateProvider, cachedDbAccess, scribanLanguageKeyGenerator, localizerFactory)));
           _elementRenderes.Add(ConditionType.GameTimeCondition, new ConditionRendererDispatcher(TemplateType.TaleConditionGameTime, defaultTemplateProvider, 
                                    new GameTimeConditionResolver(defaultTemplateProvider, cachedDbAccess, localizerFactory),
                                    new ScribanGameTimeConditionRenderer(defaultTemplateProvider, cachedDbAccess, localizerFactory)));
           _elementRenderes.Add(ConditionType.PlayerSkillValueCondition, new ConditionRendererDispatcher(TemplateType.TaleConditionPlayerSkillValue, defaultTemplateProvider, 
                                    new SkillValueConditionResolver(defaultTemplateProvider, cachedDbAccess, languageKeyGenerator, localizerFactory),
                                    new ScribanSkillValueConditionRenderer(defaultTemplateProvider, cachedDbAccess, scribanLanguageKeyGenerator, localizerFactory)));
           _elementRenderes.Add(ConditionType.NpcSkillValueCondition, new ConditionRendererDispatcher(TemplateType.TaleConditionNpcSkillValue, defaultTemplateProvider, 
                                    new SkillValueConditionResolver(defaultTemplateProvider, cachedDbAccess, languageKeyGenerator, localizerFactory),
                                    new ScribanSkillValueConditionRenderer(defaultTemplateProvider, cachedDbAccess, scribanLanguageKeyGenerator, localizerFactory)));
           _elementRenderes.Add(ConditionType.PlayerLearnedSkillCondition, new ConditionRendererDispatcher(TemplateType.TaleConditionPlayerLearnedSkill, defaultTemplateProvider,
                                    new LearnedSkillConditionResolver(defaultTemplateProvider, cachedDbAccess, languageKeyGenerator, localizerFactory),
                                    new ScribanLearnedSkillConditionRenderer(defaultTemplateProvider, cachedDbAccess, scribanLanguageKeyGenerator, localizerFactory, true)));
           _elementRenderes.Add(ConditionType.PlayerNotLearnedSkillCondition, new ConditionRendererDispatcher(TemplateType.TaleConditionPlayerNotLearnedSkill, defaultTemplateProvider,
                                    new LearnedSkillConditionResolver(defaultTemplateProvider, cachedDbAccess, languageKeyGenerator, localizerFactory),
                                    new ScribanLearnedSkillConditionRenderer(defaultTemplateProvider, cachedDbAccess, scribanLanguageKeyGenerator, localizerFactory, true)));
           _elementRenderes.Add(ConditionType.NpcLearnedSkillCondition, new ConditionRendererDispatcher(TemplateType.TaleConditionNpcLearnedSkill, defaultTemplateProvider,
                                    new LearnedSkillConditionResolver(defaultTemplateProvider, cachedDbAccess, languageKeyGenerator, localizerFactory),
                                    new ScribanLearnedSkillConditionRenderer(defaultTemplateProvider, cachedDbAccess, scribanLanguageKeyGenerator, localizerFactory, false)));
           _elementRenderes.Add(ConditionType.NpcNotLearnedSkillCondition, new ConditionRendererDispatcher(TemplateType.TaleConditionNpcNotLearnedSkill, defaultTemplateProvider,
                                    new LearnedSkillConditionResolver(defaultTemplateProvider, cachedDbAccess, languageKeyGenerator, localizerFactory),
                                    new ScribanLearnedSkillConditionRenderer(defaultTemplateProvider, cachedDbAccess, scribanLanguageKeyGenerator, localizerFactory, false)));
           _elementRenderes.Add(ConditionType.RandomValueCondition, new ConditionRendererDispatcher(TemplateType.TaleConditionRandomValue, defaultTemplateProvider,
                                    new RandomValueConditionResolver(defaultTemplateProvider, localizerFactory),
                                    new ScribanRandomValueConditionRenderer(cachedDbAccess, defaultTemplateProvider, localizerFactory)));
           _elementRenderes.Add(ConditionType.DailyRoutineEventIsDisabledCondition, new ConditionRendererDispatcher(TemplateType.TaleConditionDailyRoutineEventDisabled, defaultTemplateProvider,
                                    new DailyRoutineEventStateConditionResolver(defaultTemplateProvider, cachedDbAccess, dailyRoutineEventPlaceholderResolver, languageKeyGenerator, localizerFactory),
                                    new ScribanDailyRoutineEventStateConditionRenderer(cachedDbAccess, dailyRoutineFunctionNameGenerator, scribanLanguageKeyGenerator, localizerFactory)));
           _elementRenderes.Add(ConditionType.DailyRoutineEventIsEnabledCondition, new ConditionRendererDispatcher(TemplateType.TaleConditionDailyRoutineEventEnabled, defaultTemplateProvider,
                                    new DailyRoutineEventStateConditionResolver(defaultTemplateProvider, cachedDbAccess, dailyRoutineEventPlaceholderResolver, languageKeyGenerator, localizerFactory),
                                    new ScribanDailyRoutineEventStateConditionRenderer(cachedDbAccess, dailyRoutineFunctionNameGenerator, scribanLanguageKeyGenerator, localizerFactory)));
           _elementRenderes.Add(ConditionType.CodeCondition, new ConditionRendererDispatcher(TemplateType.TaleConditionCode, defaultTemplateProvider,
                                    new CodeConditionResolver(localizerFactory),
                                    new ScribanCodeConditionRenderer(cachedDbAccess, localizerFactory)));
           _elementRenderes.Add(ConditionType.ItemValueCondition, new ConditionRendererDispatcher(TemplateType.TaleConditionItemValue, defaultTemplateProvider,
                                    new ItemValueConditionResolver(defaultTemplateProvider, cachedDbAccess, languageKeyGenerator, localizerFactory),
                                    new ScribanItemValueConditionRenderer(defaultTemplateProvider, cachedDbAccess, scribanLanguageKeyGenerator, localizerFactory)));
        }

        /// <summary>
        /// Sets the export template placeholder resolver
        /// </summary>
        /// <param name="templatePlaceholderResolver">Template placeholder resolver</param>
        public void SetExportTemplatePlaceholderResolver(IExportTemplatePlaceholderResolver templatePlaceholderResolver)
        {
            foreach(ConditionRendererDispatcher curElementRenderer in _elementRenderes.Values)
            {
                curElementRenderer.SetExportTemplatePlaceholderResolver(templatePlaceholderResolver);
            }
        }

        /// <summary>
        /// Renders a condition
        /// </summary>
        /// <param name="project">Project</param>
        /// <param name="condition">Condition render</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <param name="flexFieldObject">Flex Field object to which the dialog belongs</param>
        /// <param name="exportSettings">Export Settings</param>
        /// <returns>Result of rendering the condition</returns>
        public async Task<string> RenderCondition(GoNorthProject project, Condition condition, ExportPlaceholderErrorCollection errorCollection, FlexFieldObject flexFieldObject, ExportSettings exportSettings)
        {
            if(string.IsNullOrEmpty(condition.ConditionElements))
            {
                return string.Empty;
            }

            ExportTemplate andTemplate = await _defaultTemplateProvider.GetDefaultTemplateByType(project.Id, TemplateType.GeneralLogicAnd);

            JsonSerializerOptions jsonOptions = new JsonSerializerOptions();
            jsonOptions.Converters.Add(new JsonStringEnumConverter());
            jsonOptions.Converters.Add(new JsonConditionDataParser());
            jsonOptions.PropertyNameCaseInsensitive = true;

            List<ParsedConditionData> parsedConditionData = JsonSerializer.Deserialize<List<ParsedConditionData>>(condition.ConditionElements, jsonOptions);
            return await RenderConditionElements(project, parsedConditionData, andTemplate.Code, errorCollection, flexFieldObject, exportSettings);
        }

        /// <summary>
        /// Renders a condition based on condition elements
        /// </summary>
        /// <param name="project">Project</param>
        /// <param name="conditionElements">Condition Elements</param>
        /// <param name="groupOperator">Grouping operator (and, or)</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <param name="flexFieldObject">Flex field object to which the dialog belongs</param>
        /// <param name="exportSettings">Export Settings</param>
        /// <returns>Result of rendering the condition</returns>
        public async Task<string> RenderConditionElements(GoNorthProject project, List<ParsedConditionData> conditionElements, string groupOperator, ExportPlaceholderErrorCollection errorCollection, FlexFieldObject flexFieldObject, ExportSettings exportSettings)
        {
            string conditionResult = string.Empty;
            foreach(ParsedConditionData curCondition in conditionElements)
            {
                if(!string.IsNullOrEmpty(conditionResult))
                {
                    conditionResult += groupOperator;
                }

                conditionResult += await BuildSingleConditionElement(project, curCondition, errorCollection, flexFieldObject, exportSettings);
            }

            return conditionResult;
        }

        /// <summary>
        /// Builds a single condition element
        /// </summary>
        /// <param name="project">Project</param>
        /// <param name="condition">Current Condition</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <param name="flexFieldObject">FlexField to which the dialog belongs</param>
        /// <param name="exportSettings">Export Settings</param>
        /// <returns>Condition Build Result</returns>
        private async Task<string> BuildSingleConditionElement(GoNorthProject project, ParsedConditionData condition, ExportPlaceholderErrorCollection errorCollection, FlexFieldObject flexFieldObject, ExportSettings exportSettings)
        {
            ConditionType conditionType = (ConditionType)condition.ConditionType;
            if(!_elementRenderes.ContainsKey(conditionType))
            {
                errorCollection.AddDialogUnknownConditionTypeError(condition.ConditionType);
                return string.Empty;
            }

            string oldContext = errorCollection.CurrentErrorContext;
            errorCollection.CurrentErrorContext = _localizer["ErrorContextCondition", _conditionTranslator.TranslateConditionType(conditionType)];
            try
            {
                return await _elementRenderes[conditionType].BuildSingleConditionElement(condition, project, errorCollection, flexFieldObject, exportSettings);
            }
            catch(Exception ex)
            {
                errorCollection.AddException(ex);
                return "<<ERROR_RENDERING_CONDITION>>";
            }
            finally
            {
                errorCollection.CurrentErrorContext = oldContext;
            }
        }


        /// <summary>
        /// Returns true if the condition renderer has placeholders for a template type
        /// </summary>
        /// <param name="templateType">Tempalte Type to check</param>
        /// <returns>true if the condition renderer has placeholders for the template type</returns>
        public bool HasPlaceholdersForTemplateType(TemplateType templateType)
        {
            foreach(ConditionRendererDispatcher curRenderer in _elementRenderes.Values)
            {
                if(curRenderer.HasPlaceholdersForTemplateType(templateType))
                {
                    return true;
                }
            }

            return false;
        }

        /// <summary>
        /// Returns the Export Template Placeholders for a Template Type
        /// </summary>
        /// <param name="templateType">Template Type</param>
        /// <param name="renderingEngine">Rendering engine</param>
        /// <returns>Export Template Placeholder</returns>
        public List<ExportTemplatePlaceholder> GetExportTemplatePlaceholdersForType(TemplateType templateType, ExportTemplateRenderingEngine renderingEngine)
        {
            List<ExportTemplatePlaceholder> placeholders = new List<ExportTemplatePlaceholder>();
            foreach(ConditionRendererDispatcher curRenderer in _elementRenderes.Values)
            {
                if(curRenderer.HasPlaceholdersForTemplateType(templateType))
                {
                    placeholders.AddRange(curRenderer.GetExportTemplatePlaceholdersForType(templateType, renderingEngine));
                }
            }

            return placeholders;
        }
    }
}