using System.Collections.Generic;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Data.FlexFieldDatabase;
using GoNorth.Data.NodeGraph;
using GoNorth.Data.Project;
using GoNorth.Services.Export.Data;
using GoNorth.Services.Export.Dialog.ConditionRendering;
using GoNorth.Services.Export.LanguageKeyGeneration;
using GoNorth.Services.Export.Placeholder;
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
        /// Condition Element Renderers
        /// </summary>
        private Dictionary<ConditionType, IConditionElementRenderer> _elementRenderes;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="defaultTemplateProvider">Default Template Provider</param>
        /// <param name="cachedDbAccess">Cached Db Access</param>
        /// <param name="dailyRoutineEventPlaceholderResolver">Daily routine event placeholder resolver</param>
        /// <param name="languageKeyGenerator">Language Key Generator</param>
        /// <param name="localizerFactory">Localizer Factory</param>
        public ConditionRenderer(ICachedExportDefaultTemplateProvider defaultTemplateProvider, IExportCachedDbAccess cachedDbAccess, IDailyRoutineEventPlaceholderResolver dailyRoutineEventPlaceholderResolver, ILanguageKeyGenerator languageKeyGenerator, IStringLocalizerFactory localizerFactory)
        {
            _defaultTemplateProvider = defaultTemplateProvider;

            _elementRenderes = new Dictionary<ConditionType, IConditionElementRenderer>();
            _elementRenderes.Add(ConditionType.Group, new GroupConditionResolver(this, defaultTemplateProvider, localizerFactory));
            _elementRenderes.Add(ConditionType.PlayerValueCondition, new NpcValueConditionResolver(defaultTemplateProvider, cachedDbAccess, languageKeyGenerator, localizerFactory, true));
            _elementRenderes.Add(ConditionType.NpcValueCondition, new NpcValueConditionResolver(defaultTemplateProvider, cachedDbAccess, languageKeyGenerator, localizerFactory, false));
            _elementRenderes.Add(ConditionType.PlayerInventoryCondition, new InventoryConditionResolver(defaultTemplateProvider, cachedDbAccess, languageKeyGenerator, localizerFactory, true));
            _elementRenderes.Add(ConditionType.NpcInventoryCondition, new InventoryConditionResolver(defaultTemplateProvider, cachedDbAccess, languageKeyGenerator, localizerFactory, false));
            _elementRenderes.Add(ConditionType.ChooseQuestValueCondition, new QuestValueConditionResolver(defaultTemplateProvider, cachedDbAccess, languageKeyGenerator, localizerFactory));
            _elementRenderes.Add(ConditionType.QuestStateCondition, new QuestStateConditionResolver(defaultTemplateProvider, cachedDbAccess, languageKeyGenerator, localizerFactory));
            _elementRenderes.Add(ConditionType.NpcAliveStateCondition, new NpcAliveStateConditionResolver(defaultTemplateProvider, cachedDbAccess, languageKeyGenerator, localizerFactory));
            _elementRenderes.Add(ConditionType.CurrentSkillValueCondition, new CurrentSkillValueConditionResolver(defaultTemplateProvider, cachedDbAccess, languageKeyGenerator, localizerFactory));
            _elementRenderes.Add(ConditionType.GameTimeCondition, new GameTimeConditionResolver(defaultTemplateProvider, cachedDbAccess, localizerFactory));
            _elementRenderes.Add(ConditionType.PlayerSkillValueCondition, new SkillValueConditionResolver(defaultTemplateProvider, cachedDbAccess, languageKeyGenerator, localizerFactory, true));
            _elementRenderes.Add(ConditionType.NpcSkillValueCondition, new SkillValueConditionResolver(defaultTemplateProvider, cachedDbAccess, languageKeyGenerator, localizerFactory, false));
            _elementRenderes.Add(ConditionType.PlayerLearnedSkillCondition, new LearnedSkillConditionResolver(defaultTemplateProvider, cachedDbAccess, languageKeyGenerator, localizerFactory, true, true));
            _elementRenderes.Add(ConditionType.PlayerNotLearnedSkillCondition, new LearnedSkillConditionResolver(defaultTemplateProvider, cachedDbAccess, languageKeyGenerator, localizerFactory, true, false));
            _elementRenderes.Add(ConditionType.NpcLearnedSkillCondition, new LearnedSkillConditionResolver(defaultTemplateProvider, cachedDbAccess, languageKeyGenerator, localizerFactory, false, true));
            _elementRenderes.Add(ConditionType.NpcNotLearnedSkillCondition, new LearnedSkillConditionResolver(defaultTemplateProvider, cachedDbAccess, languageKeyGenerator, localizerFactory, false, false));
            _elementRenderes.Add(ConditionType.RandomValueCondition, new RandomValueConditionResolver(defaultTemplateProvider, localizerFactory));
            _elementRenderes.Add(ConditionType.DailyRoutineEventIsDisabledCondition, new DailyRoutineEventStateConditionResolver(defaultTemplateProvider, cachedDbAccess, dailyRoutineEventPlaceholderResolver, languageKeyGenerator, localizerFactory, true));
            _elementRenderes.Add(ConditionType.DailyRoutineEventIsEnabledCondition, new DailyRoutineEventStateConditionResolver(defaultTemplateProvider, cachedDbAccess, dailyRoutineEventPlaceholderResolver, languageKeyGenerator, localizerFactory, false));
            _elementRenderes.Add(ConditionType.CodeCondition, new CodeConditionResolver(defaultTemplateProvider, localizerFactory));
            _elementRenderes.Add(ConditionType.ItemValueCondition, new ItemValueConditionResolver(defaultTemplateProvider, cachedDbAccess, languageKeyGenerator, localizerFactory));
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
            return RenderConditionElements(project, parsedConditionData, andTemplate.Code, errorCollection, flexFieldObject, exportSettings);
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
        public string RenderConditionElements(GoNorthProject project, List<ParsedConditionData> conditionElements, string groupOperator, ExportPlaceholderErrorCollection errorCollection, FlexFieldObject flexFieldObject, ExportSettings exportSettings)
        {
            string conditionResult = string.Empty;
            foreach(ParsedConditionData curCondition in conditionElements)
            {
                if(!string.IsNullOrEmpty(conditionResult))
                {
                    conditionResult += groupOperator;
                }

                conditionResult += BuildSingleConditionElement(project, curCondition, errorCollection, flexFieldObject, exportSettings);
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
        private string BuildSingleConditionElement(GoNorthProject project, ParsedConditionData condition, ExportPlaceholderErrorCollection errorCollection, FlexFieldObject flexFieldObject, ExportSettings exportSettings)
        {
            ConditionType conditionType = (ConditionType)condition.ConditionType;
            if(!_elementRenderes.ContainsKey(conditionType))
            {
                errorCollection.AddDialogUnknownConditionTypeError(condition.ConditionType);
                return string.Empty;
            }

            return _elementRenderes[conditionType].BuildSingleConditionElement(condition, project, errorCollection, flexFieldObject, exportSettings);
        }


        /// <summary>
        /// Returns true if the condition renderer has placeholders for a template type
        /// </summary>
        /// <param name="templateType">Tempalte Type to check</param>
        /// <returns>true if the condition renderer has placeholders for the template type</returns>
        public bool HasPlaceholdersForTemplateType(TemplateType templateType)
        {
            foreach(IConditionElementRenderer curRenderer in _elementRenderes.Values)
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
        /// <returns>Export Template Placeholder</returns>
        public List<ExportTemplatePlaceholder> GetExportTemplatePlaceholdersForType(TemplateType templateType)
        {
            List<ExportTemplatePlaceholder> placeholders = new List<ExportTemplatePlaceholder>();
            foreach(IConditionElementRenderer curRenderer in _elementRenderes.Values)
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