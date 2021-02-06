using System;
using GoNorth.Data.NodeGraph;
using GoNorth.Services.ImplementationStatusCompare;

namespace GoNorth.Data.StateMachines
{
    /// <summary>
    /// State machine state
    /// </summary>
    public class StateMachineState : BaseNode, ICloneable
    {
        /// <summary>
        /// Name of the state
        /// </summary>
        [ValueCompareAttribute]
        public string Name { get; set; }

        /// <summary>
        /// Description
        /// </summary>
        [ValueCompareAttribute]
        public string Description { get; set; }

        /// <summary>
        /// Script Type
        /// </summary>
        public int ScriptType { get; set; }

        /// <summary>
        /// Script name
        /// </summary>
        [ValueCompareAttribute]
        public string ScriptName { get; set; }
        
        /// <summary>
        /// Script node graph
        /// </summary>
        [ValueCompareAttribute(LabelKey = "", TextKey = "NodeSystemChanged")]
        public NodeGraphSnippet ScriptNodeGraph { get; set; }

        /// <summary>
        /// Script name
        /// </summary>
        [ValueCompareAttribute(LabelKey = "", TextKey = "ScriptCodeChanged")]
        public string ScriptCode { get; set; }

        /// <summary>
        /// True if the state must not be exported to script
        /// </summary>
        [ValueCompareAttribute]
        public bool DontExportToScript { get; set; }

        /// <summary>
        /// Clones the text node
        /// </summary>
        /// <returns>Cloned object</returns>
        public object Clone()
        {
            StateMachineState clonedObject = CloneObject<StateMachineState>();
            clonedObject.Name = Name;
            clonedObject.Description = Description;
            clonedObject.ScriptType = ScriptType;
            clonedObject.ScriptName = ScriptName;
            clonedObject.ScriptNodeGraph = ScriptNodeGraph != null ? (NodeGraphSnippet)ScriptNodeGraph.Clone() : null;
            clonedObject.ScriptCode = ScriptCode;
            clonedObject.DontExportToScript = DontExportToScript;

            return clonedObject;
        }
    }
}