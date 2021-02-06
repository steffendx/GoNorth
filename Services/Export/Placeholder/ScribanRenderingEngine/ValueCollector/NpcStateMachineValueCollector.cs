using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Data.Kortisto;
using GoNorth.Data.StateMachines;
using GoNorth.Services.Export.Data;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.RenderingFunctions;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.RenderingObjects;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.Util;
using GoNorth.Services.Export.StateMachines;
using Microsoft.Extensions.Localization;
using Scriban;
using Scriban.Runtime;

namespace GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.ValueCollector
{
    /// <summary>
    /// Class to collect npc state machines for Scriban value collectors
    /// </summary>
    public class NpcStateMachineExportValueCollector : BaseScribanValueCollector
    {
        /// <summary>
        /// Export template palceholder resolver
        /// </summary>
        private readonly IExportTemplatePlaceholderResolver _templatePlaceholderResolver;

        /// <summary>
        /// Gecachter Datenzugriff
        /// </summary>
        private readonly IExportCachedDbAccess _cachedDbAccess;

        /// <summary>
        /// State Machine function name generator
        /// </summary>
        private readonly IStateMachineFunctionNameGenerator _stateMachineFunctionNameGenerator;

        /// <summary>
        /// State machine function renderer
        /// </summary>
        private readonly IStateMachineFunctionRenderer _stateMachineFunctionRenderer;

        /// <summary>
        /// Default template provider
        /// </summary>
        private readonly ICachedExportDefaultTemplateProvider _defaultTemplateProvider;

        /// <summary>
        /// Localizer Factory
        /// </summary>
        private readonly IStringLocalizerFactory _localizerFactory;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="templatePlaceholderResolver">Template placeholder resolver</param>
        /// <param name="cachedDbAccess">Gecachter Datenzugriff</param>
        /// <param name="stateMachineFunctionNameGenerator">State machine function name generator</param>
        /// <param name="stateMachineFunctionRenderer">State machine function renderer</param>
        /// <param name="defaultTemplateProvider">Default template provider</param>
        /// <param name="localizerFactory">Localizer Factory</param>
        public NpcStateMachineExportValueCollector(IExportTemplatePlaceholderResolver templatePlaceholderResolver, IExportCachedDbAccess cachedDbAccess, IStateMachineFunctionNameGenerator stateMachineFunctionNameGenerator, 
                                                   IStateMachineFunctionRenderer stateMachineFunctionRenderer, ICachedExportDefaultTemplateProvider defaultTemplateProvider, IStringLocalizerFactory localizerFactory)
        {
            _templatePlaceholderResolver = templatePlaceholderResolver;
            _cachedDbAccess = cachedDbAccess;
            _stateMachineFunctionNameGenerator = stateMachineFunctionNameGenerator;
            _stateMachineFunctionRenderer = stateMachineFunctionRenderer;
            _defaultTemplateProvider = defaultTemplateProvider;
            _localizerFactory = localizerFactory;
        }

        /// <summary>
        /// Returns true if the value collector is valid for a given template type
        /// </summary>
        /// <param name="templateType">Template type</param>
        /// <returns>True if the value collector is valid, else false</returns>
        public override bool IsValidForTemplateType(TemplateType templateType)
        {
            return templateType == TemplateType.ObjectNpc;
        }

        /// <summary>
        /// Collects the values for an export
        /// </summary>
        /// <param name="templateType">Template type</param>
        /// <param name="parsedTemplate">Parsed scriban template</param>
        /// <param name="scriptObject">Scriban script object to fill</param>
        /// <param name="data">Export Data</param>
        /// <returns>Task</returns>
        public override async Task CollectValues(TemplateType templateType, Template parsedTemplate, ScriptObject scriptObject, ExportObjectData data)
        {
            KortistoNpc inputNpc = data.ExportData[ExportConstants.ExportDataObject] as KortistoNpc;
            if(inputNpc == null)
            {
                return;
            }

            StateMachine inputStateMachine = null;
            if(data.ExportData.ContainsKey(ExportConstants.ExportDataStateMachine))
            {
                inputStateMachine = data.ExportData[ExportConstants.ExportDataStateMachine] as StateMachine;
            }

            ScribanExportStateMachine stateMachine = new ScribanExportStateMachine();
            stateMachine.States = await BuildStateMachineFunctions(inputNpc, inputStateMachine);
            scriptObject.AddOrUpdate(ExportConstants.ScribanStateMachineObjectKey, stateMachine);
            
            scriptObject.AddOrUpdate(StateMachineFunctionPipeRenderer.StateMachineFunctionName, new StateMachineFunctionPipeRenderer(_templatePlaceholderResolver, _cachedDbAccess, _defaultTemplateProvider, _errorCollection));
        }

        /// <summary>
        /// Builds the state machine functions
        /// </summary>
        /// <param name="inputNpc">Npc</param>
        /// <param name="stateMachine">State machine</param>
        /// <returns>Function list</returns>
        private async Task<List<ScribanExportState>> BuildStateMachineFunctions(KortistoNpc inputNpc, StateMachine stateMachine)
        {
            if(stateMachine == null || stateMachine.State == null ||!stateMachine.State.Any())
            {
                return new List<ScribanExportState>();
            }

            _stateMachineFunctionRenderer.SetErrorCollection(_errorCollection);
            _stateMachineFunctionRenderer.SetExportTemplatePlaceholderResolver(_templatePlaceholderResolver);

            List<StateTransition> transitions = stateMachine.Link != null ? stateMachine.Link : new List<StateTransition>();
            List<StateMachineStartEnd> endNodes = stateMachine.End != null ? stateMachine.End : new List<StateMachineStartEnd>();
            string startId = stateMachine.Start.Any() ? stateMachine.Start.FirstOrDefault().Id : string.Empty;

            List<ScribanExportState> exportStates = new List<ScribanExportState>();
            foreach(StateMachineState curState in stateMachine.State)
            {
                if (curState.DontExportToScript)
                {
                    continue;
                }

                ScribanExportState exportState = ConvertState(curState, transitions, endNodes, startId);
                await GenerateStateFunctions(exportState, inputNpc, curState);

                exportState.OriginalState = curState;

                exportStates.Add(exportState);
            }

            SetTransitions(transitions, exportStates, endNodes);

            return exportStates;
        }

        /// <summary>
        /// Converts a state for scriban
        /// </summary>
        /// <param name="state">State</param>
        /// <param name="transitions">Transitions</param>
        /// <param name="endNodes">End nodes</param>
        /// <param name="startId">Id of the start node</param>
        /// <returns>Converted state</returns>
        private static ScribanExportState ConvertState(StateMachineState state, List<StateTransition> transitions, List<StateMachineStartEnd> endNodes, string startId)
        {
            ScribanExportState exportState = new ScribanExportState();
            exportState.Id = state.Id;
            exportState.Name = state.Name;
            exportState.Description = state.Description;
            exportState.IsInitialState = transitions.Any(l => l.TargetNodeId == state.Id && l.SourceNodeId == startId);
            exportState.HasEndConnection = transitions.Any(l => l.SourceNodeId == state.Id && endNodes.Any(e => e.Id == l.TargetNodeId));
            exportState.ScriptType = ScribanScriptUtil.ConvertScriptType(state.ScriptType);
            exportState.ScriptName = state.ScriptName;
            return exportState;
        }

        /// <summary>
        /// Generates the state functions
        /// </summary>
        /// <param name="exportState">Export state to fill</param>
        /// <param name="inputNpc">Input npcs</param>
        /// <param name="state">State</param>
        /// <returns>Task</returns>
        private async Task GenerateStateFunctions(ScribanExportState exportState, KortistoNpc inputNpc, StateMachineState state)
        {
            List<ScribanExportStateFunction> functions = (await _stateMachineFunctionRenderer.RenderStateFunctions(state, inputNpc)).Select(f => new ScribanExportStateFunction(f)).ToList();
            exportState.InitialFunction = functions.FirstOrDefault();
            exportState.AdditionalFunctions = functions.Skip(1).ToList();
            exportState.AllFunctions = functions;
        }

        /// <summary>
        /// Sets the transitions for a state
        /// </summary>
        /// <param name="transitions">Transitions</param>
        /// <param name="exportStates">Scriban Export states</param>
        /// <param name="endNodes">End nodes</param>
        private void SetTransitions(List<StateTransition> transitions, List<ScribanExportState> exportStates, List<StateMachineStartEnd> endNodes)
        {
            foreach(ScribanExportState curState in exportStates)
            {
                List<StateTransition> validTransitions = transitions.Where(t => t.SourceNodeId == curState.Id).ToList();
                curState.Transitions = validTransitions.Select(t => new ScribanExportStateTransition {
                    Label = t.Label,
                    IsConnectedToEnd = endNodes.Any(e => e.Id == t.TargetNodeId),
                    TargetState = exportStates.FirstOrDefault(e => e.Id == t.TargetNodeId)
                }).ToList();
            }
        }

        /// <summary>
        /// Returns the Export Template Placeholders for a Template Type
        /// </summary>
        /// <param name="templateType">Template Type</param>
        /// <returns>Export Template Placeholder</returns>
        public override List<ExportTemplatePlaceholder> GetExportTemplatePlaceholdersForType(TemplateType templateType)
        {
            List<ExportTemplatePlaceholder> exportPlaceholders = new List<ExportTemplatePlaceholder>();
            if(templateType != TemplateType.ObjectNpc)
            {
                return exportPlaceholders;
            }

            exportPlaceholders.AddRange(ScribanPlaceholderGenerator.GetPlaceholdersForObject<ScribanExportStateMachine>(_localizerFactory, ExportConstants.ScribanStateMachineObjectKey));
            exportPlaceholders.AddRange(ScribanPlaceholderGenerator.GetPlaceholdersForObject<ScribanExportState>(_localizerFactory, ExportConstants.ScribanStateObjectKey));
            exportPlaceholders.AddRange(ScribanPlaceholderGenerator.GetPlaceholdersForObject<ScribanExportStateFunction>(_localizerFactory, ExportConstants.ScribanStateFunctionObjectKey));
            exportPlaceholders.AddRange(ScribanPlaceholderGenerator.GetPlaceholdersForObject<ScribanExportStateTransition>(_localizerFactory, ExportConstants.ScribanStateTransitionObjectKey));
            exportPlaceholders.AddRange(StateMachineFunctionPipeRenderer.GetPlaceholders(_localizerFactory));
            
            return exportPlaceholders;
        }

    }
}