using System.Collections.Generic;
using GoNorth.Data.StateMachines;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.Util;

namespace GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.RenderingObjects
{
    /// <summary>
    /// Class to export states to Scriban
    /// </summary>
    public class ScribanExportState
    {
        /// <summary>
        /// Id of the state
        /// </summary>
        [ScribanExportValueLabel]
        public string Id { get; set; }

        /// <summary>
        /// Name of the state
        /// </summary>
        [ScribanExportValueLabel]
        public string Name { get; set; }

        /// <summary>
        /// Description of the state
        /// </summary>
        [ScribanExportValueLabel]
        public string Description { get; set; }

        /// <summary>
        /// true if the State is the first state
        /// </summary>
        [ScribanExportValueLabel]
        public bool IsInitialState { get; set; }

        /// <summary>
        /// true if the state has a connnection to an end state
        /// </summary>
        [ScribanExportValueLabel]
        public bool HasEndConnection { get; set; }

        /// <summary>
        /// Transitions to which this state can change
        /// </summary>
        [ScribanExportValueLabel]
        public List<ScribanExportStateTransition> Transitions { get; set; }

        /// <summary>
        /// Type of the script associated with the event
        /// </summary>
        [ScribanExportValueLabel]
        public string ScriptType { get; set; }
               
        /// <summary>
        /// Scriptname
        /// </summary>
        [ScribanExportValueLabel]
        public string ScriptName { get; set; }

        /// <summary>
        /// Initial state Function
        /// </summary>
        [ScribanExportValueLabel]
        public ScribanExportStateFunction InitialFunction { get; set; }

        /// <summary>
        /// Additional functions besides the initial state function
        /// </summary>
        [ScribanExportValueLabel]
        public List<ScribanExportStateFunction> AdditionalFunctions { get; set; }

        /// <summary>
        /// All state functions
        /// </summary>
        [ScribanExportValueLabel]
        public List<ScribanExportStateFunction> AllFunctions { get; set; }


        /// <summary>
        /// Original state this is based on
        /// </summary>
        public StateMachineState OriginalState { get; set; }
    }
}