using System.Collections.Generic;
using GoNorth.Data.Exporting;
using GoNorth.Data.Kortisto;
using GoNorth.Services.Export.NodeGraphExport;
using Microsoft.Extensions.Localization;

namespace GoNorth.Services.Export.Placeholder
{
    /// <summary>
    /// Class for resolving the content for a single daily routine event
    /// </summary>
    public class DailyRoutineEventContentPlaceholderResolver : IDailyRoutineEventContentPlaceholderResolver
    {
        /// <summary>
        /// Placeholder for the content of the script
        /// </summary>
        private const string Placeholder_ScriptContent = "DailyRoutine_ScriptContent";

        /// <summary>
        /// Placeholder for the parent preview of a placeholder
        /// </summary>
        private const string Placeholder_Function_ParentPreview = "DailyRoutine_Function_ParentPreview";

        /// <summary>
        /// Start of the content that will only be rendered if the daily routine function has additional script functions
        /// </summary>
        private const string Placeholder_HasAdditionalScriptFunctions_Start = "DailyRoutine_HasAdditionalScriptFunctions_Start";
        
        /// <summary>
        /// End of the content that will only be rendered if the daily routine function has additional script functions
        /// </summary>
        private const string Placeholder_HasAdditionalScriptFunctions_End = "DailyRoutine_HasAdditionalScriptFunctions_End";
        
        /// <summary>
        /// Start of the content that will only be rendered if the daily routine function has no additional script functions
        /// </summary>
        private const string Placeholder_HasNoAdditionalScriptFunctions_Start = "DailyRoutine_HasNoAdditionalScriptFunctions_Start";
        
        /// <summary>
        /// End of the content that will only be rendered if the daily routine function has no additional script functions
        /// </summary>
        private const string Placeholder_HasNoAdditionalScriptFunctions_End = "DailyRoutine_HasNoAdditionalScriptFunctions_End";


        /// <summary>
        /// Placeholder for the additional script functions
        /// </summary>
        private const string Placeholder_AdditionalScriptFunctions = "DailyRoutine_AdditionalScriptFunctions";


        /// <summary>
        /// Script Type none
        /// </summary>
        private const int ScriptType_None = -1;

        /// <summary>
        /// Script Type none
        /// </summary>
        private const int ScriptType_NodeGraph = 0;

        /// <summary>
        /// Script Type none
        /// </summary>
        private const int ScriptType_Code = 1;


        /// <summary>
        /// Node graph exporter
        /// </summary>
        private readonly INodeGraphExporter _nodeGraphExporter;

        /// <summary>
        /// Daily routine node graph function generator
        /// </summary>
        private readonly IDailyRoutineNodeGraphFunctionGenerator _dailyRoutineNodeGraphFunctionGenerator;

        /// <summary>
        /// Daily routine node graph renderer
        /// </summary>
        private readonly IDailyRoutineNodeGraphRenderer _dailyRoutineNodeGraphRenderer;

        /// <summary>
        /// String Localizer
        /// </summary>
        private readonly IStringLocalizer _localizer;

        /// <summary>
        /// All events that were rendered so far
        /// </summary>
        private Dictionary<string, ExportNodeGraphRenderResult> _renderedEvents;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="nodeGraphExporter">Node graph exporter</param>
        /// <param name="dailyRoutineNodeGraphFunctionGenerator">Daily routine node graph function generator</param>
        /// <param name="dailyRoutineNodeGraphRenderer">Daily routine node graph renderer</param>
        /// <param name="localizerFactory">Localizer factory</param>
        public DailyRoutineEventContentPlaceholderResolver(INodeGraphExporter nodeGraphExporter, IDailyRoutineNodeGraphFunctionGenerator dailyRoutineNodeGraphFunctionGenerator, IDailyRoutineNodeGraphRenderer dailyRoutineNodeGraphRenderer, IStringLocalizerFactory localizerFactory)
        {
            _nodeGraphExporter = nodeGraphExporter;
            _dailyRoutineNodeGraphFunctionGenerator = dailyRoutineNodeGraphFunctionGenerator;
            _dailyRoutineNodeGraphRenderer = dailyRoutineNodeGraphRenderer;
            _renderedEvents = new Dictionary<string, ExportNodeGraphRenderResult>();
            _localizer = localizerFactory.Create(typeof(DailyRoutineEventContentPlaceholderResolver));
        }

        /// <summary>
        /// Resolved the placeholders for a single daily routine event
        /// </summary>
        /// <param name="code">Code to resolve the placeholders in</param>
        /// <param name="npc">Npc to which the event belongs</param>
        /// <param name="dailyRoutineEvent">Daily routine to use for resolving the placeholders</param>
        /// <param name="errorCollection">Error collection</param>
        /// <returns>Code with resolved placeholders</returns>
        public string ResolveDailyRoutineEventContentPlaceholders(string code, KortistoNpc npc, KortistoNpcDailyRoutineEvent dailyRoutineEvent, ExportPlaceholderErrorCollection errorCollection)
        {
            code = ExportUtil.RenderPlaceholderIfFuncTrue(code, Placeholder_HasAdditionalScriptFunctions_Start, Placeholder_HasAdditionalScriptFunctions_End, m => {
                if(dailyRoutineEvent.ScriptType == ScriptType_NodeGraph)
                {
                    return !string.IsNullOrEmpty(this.RenderNodeGraph(dailyRoutineEvent, npc, errorCollection).AdditionalFunctionsCode);
                }

                return false;
            });

            code = ExportUtil.RenderPlaceholderIfFuncTrue(code, Placeholder_HasNoAdditionalScriptFunctions_Start, Placeholder_HasNoAdditionalScriptFunctions_End, m => {
                if(dailyRoutineEvent.ScriptType == ScriptType_NodeGraph)
                {
                    return string.IsNullOrEmpty(this.RenderNodeGraph(dailyRoutineEvent, npc, errorCollection).AdditionalFunctionsCode);
                }

                return true;
            });

            code = ExportUtil.BuildPlaceholderRegex(Placeholder_ScriptContent, ExportConstants.ListIndentPrefix).Replace(code, m => {
                if(dailyRoutineEvent.ScriptType == ScriptType_NodeGraph)
                {
                    return ExportUtil.IndentListTemplate(this.RenderNodeGraph(dailyRoutineEvent, npc, errorCollection).StartStepCode, m.Groups[1].Value);
                }
                else if(dailyRoutineEvent.ScriptType == ScriptType_Code)
                {
                    return ExportUtil.IndentListTemplate(dailyRoutineEvent.ScriptCode != null ? dailyRoutineEvent.ScriptCode : string.Empty, m.Groups[1].Value);
                }

                return string.Empty;
            });

            code = ExportUtil.BuildPlaceholderRegex(Placeholder_AdditionalScriptFunctions, ExportConstants.ListIndentPrefix).Replace(code, m => {
                if(dailyRoutineEvent.ScriptType == ScriptType_NodeGraph)
                {
                    return ExportUtil.IndentListTemplate(this.RenderNodeGraph(dailyRoutineEvent, npc, errorCollection).AdditionalFunctionsCode, m.Groups[1].Value);
                }

                return string.Empty;
            });
            
            code = ExportUtil.BuildPlaceholderRegex(Placeholder_Function_ParentPreview).Replace(code, "None");

            return code;
        }

        /// <summary>
        /// Renders a node graph system
        /// </summary>
        /// <param name="dailyRoutineEvent">Daily routine event</param>
        /// <param name="npc">Npc</param>
        /// <param name="errorCollection">Error collection</param>
        /// <returns>Node graph render result</returns>
        private ExportNodeGraphRenderResult RenderNodeGraph(KortistoNpcDailyRoutineEvent dailyRoutineEvent, KortistoNpc npc, ExportPlaceholderErrorCollection errorCollection)
        {
            if(dailyRoutineEvent == null || dailyRoutineEvent.ScriptNodeGraph == null)
            {
                return new ExportNodeGraphRenderResult();
            }

            if(_renderedEvents.ContainsKey(dailyRoutineEvent.EventId))
            {
                return _renderedEvents[dailyRoutineEvent.EventId];
            }

            _nodeGraphExporter.SetErrorCollection(errorCollection);
            _nodeGraphExporter.SetNodeGraphFunctionGenerator(_dailyRoutineNodeGraphFunctionGenerator);
            _nodeGraphExporter.SetNodeGraphRenderer(_dailyRoutineNodeGraphRenderer);
            ExportNodeGraphRenderResult renderResult = _nodeGraphExporter.RenderNodeGraph(dailyRoutineEvent.ScriptNodeGraph, npc).Result;
            _renderedEvents.Add(dailyRoutineEvent.EventId, renderResult);
            return renderResult;
        }

        /// <summary>
        /// Returns the placeholders that are available for a daily routine event
        /// </summary>
        /// <returns>Placeholders</returns>
        public List<ExportTemplatePlaceholder> GetPlaceholders(TemplateType templateType)
        {
            List<ExportTemplatePlaceholder> exportPlaceholders = new List<ExportTemplatePlaceholder> {
                ExportUtil.CreatePlaceHolder(Placeholder_ScriptContent, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_Function_ParentPreview, _localizer)
            };

            if(templateType != TemplateType.ObjectDailyRoutineFunction)
            {
                exportPlaceholders.Add(ExportUtil.CreatePlaceHolder(Placeholder_HasAdditionalScriptFunctions_Start, _localizer));
                exportPlaceholders.Add(ExportUtil.CreatePlaceHolder(Placeholder_HasAdditionalScriptFunctions_End, _localizer));
                exportPlaceholders.Add(ExportUtil.CreatePlaceHolder(Placeholder_HasNoAdditionalScriptFunctions_Start, _localizer));
                exportPlaceholders.Add(ExportUtil.CreatePlaceHolder(Placeholder_HasNoAdditionalScriptFunctions_End, _localizer));
                exportPlaceholders.Add(ExportUtil.CreatePlaceHolder(Placeholder_AdditionalScriptFunctions, _localizer));
            }

            return exportPlaceholders;
        }
    }
}