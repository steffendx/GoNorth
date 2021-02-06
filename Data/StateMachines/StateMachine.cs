using System;
using System.Collections.Generic;
using GoNorth.Data.ImplementationSnapshot;
using GoNorth.Services.ImplementationStatusCompare;

namespace GoNorth.Data.StateMachines
{
    /// <summary>
    /// State Machine
    /// </summary>
    public class StateMachine : IHasModifiedData, IImplementationComparable, IImplementationSnapshotable
    {
        /// <summary>
        /// Id of the state machine
        /// </summary>
        public string Id { get; set; }

        /// <summary>
        /// Id of the project to which the state machine belongs
        /// </summary>
        public string ProjectId { get; set; }

        /// <summary>
        /// Id of the object the state machine belongs to
        /// </summary>
        public string RelatedObjectId { get; set; }

        /// <summary>
        /// Start
        /// </summary>
        [ListCompareAttribute(LabelKey = "StartChanged")]

        public List<StateMachineStartEnd> Start { get; set; }

        /// <summary>
        /// End
        /// </summary>
        [ListCompareAttribute(LabelKey = "EndChanged")]

        public List<StateMachineStartEnd> End { get; set; }

        /// <summary>
        /// States
        /// </summary>
        [ListCompareAttribute(LabelKey = "StateChanged")]
        public List<StateMachineState> State { get; set; }

        /// <summary>
        /// Links
        /// </summary>
        [ListCompareAttribute(LabelKey = "NodeLinksChanged")]
        public List<StateTransition> Link { get; set; }

        /// <summary>
        /// Last modify Date
        /// </summary>
        public DateTimeOffset ModifiedOn { get; set; }

        /// <summary>
        /// Id of the user who last modified the state machine
        /// </summary>
        public string ModifiedBy { get; set; }
    }
}
