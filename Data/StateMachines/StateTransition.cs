using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json.Serialization;
using GoNorth.Data.NodeGraph;
using GoNorth.Services.ImplementationStatusCompare;

namespace GoNorth.Data.StateMachines
{
    /// <summary>
    /// State transition
    /// </summary>
    public class StateTransition : IImplementationListComparable, ICloneable
    {
        /// <summary>
        /// Label of the node
        /// </summary>
        [ValueCompareAttribute]
        public string Label { get; set; }

        /// <summary>
        /// Id of the source node
        /// </summary>
        public string SourceNodeId { get; set; }

        /// <summary>
        /// Id of the target node
        /// </summary>
        public string TargetNodeId { get; set; }

        /// <summary>
        /// Vertices of the link
        /// </summary>
        public List<NodeLinkVertex> Vertices { get; set; }


        /// <summary>
        /// Id which is used in a list compare to detect deleted or new objects
        /// </summary>
        [JsonIgnore]
        public string ListComparableId { get { return SourceNodeId + TargetNodeId; } }

        /// <summary>
        /// Value which is used in a list compare for display
        /// </summary>
        [JsonIgnore]
        public CompareDifferenceValue ListComparableValue { get { return new CompareDifferenceValue("NodeConnection", CompareDifferenceValue.ValueResolveType.LanguageKey); } }

        /// <summary>
        /// Clones the object
        /// </summary>
        /// <returns>Cloned object</returns>
        public object Clone()
        {
            return new StateTransition {
                Label = this.Label,
                SourceNodeId = this.SourceNodeId,
                TargetNodeId = this.TargetNodeId,
                Vertices = this.Vertices != null ? this.Vertices.Select(v => v.Clone()).Cast<NodeLinkVertex>().ToList() : null
            };
        }
    }
}
