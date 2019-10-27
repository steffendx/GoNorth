using System.Collections.Generic;
using System.Text.Json.Serialization;
using GoNorth.Data.NodeGraph;
using GoNorth.Services.ImplementationStatusCompare;

namespace GoNorth.Data.Kortisto
{
    /// <summary>
    /// Kortisto Npc Daily Routine Event
    /// </summary>
    public class KortistoNpcDailyRoutineEvent : IImplementationListComparable
    {
        /// <summary>
        /// Event Id
        /// </summary>
        public string EventId { get; set; }

        /// <summary>
        /// Event type
        /// </summary>
        public int EventType { get; set; }

        /// <summary>
        /// Earliest time at which the event can trigger
        /// </summary>
        [ValueCompareAttribute]
        public KortistoNpcDailyRoutineTime EarliestTime { get; set; }

        /// <summary>
        /// Latest time at which the event can trigger
        /// </summary>
        [ValueCompareAttribute]
        public KortistoNpcDailyRoutineTime LatestTime { get; set; }

        /// <summary>
        /// Movement target
        /// </summary>
        [ValueCompareAttribute]
        public KortistoNpcDailyRoutineMovementTarget MovementTarget { get; set; }

        /// <summary>
        /// Target state
        /// </summary>
        [ValueCompareAttribute]
        public string TargetState { get; set; }
        
        /// <summary>
        /// Script Type
        /// </summary>
        [ValueCompareAttribute]
        public int ScriptType { get; set; }

        /// <summary>
        /// Script name
        /// </summary>
        [ValueCompareAttribute]
        public string ScriptName { get; set; }
        
        /// <summary>
        /// Script node graph
        /// </summary>
        [ValueCompareAttribute]
        public NodeGraphSnippet ScriptNodeGraph { get; set; }

        /// <summary>
        /// Script name
        /// </summary>
        [ValueCompareAttribute(LabelKey = "", TextKey = "ScriptCodeChanged")]
        public string ScriptCode { get; set; }

        /// <summary>
        /// true if the event is enabled by default, else false
        /// </summary>
        [ValueCompareAttribute]
        public bool EnabledByDefault { get; set; }


        /// <summary>
        /// Id which is used in a list compare to detect deleted or new objects
        /// </summary>
        [JsonIgnore]
        public string ListComparableId { get { return EventId; } }

        /// <summary>
        /// Value which is used in a list compare for display
        /// </summary>
        [JsonIgnore]
        public CompareDifferenceValue ListComparableValue { get { 
            string languageKeyToUse = "DailyRoutineEntryNameSingleTime";
            List<string> argumentValues = new List<string>();
            if(EarliestTime != null) 
            {
                argumentValues.Add(EarliestTime.Hours.ToString().PadLeft(2, '0'));
                argumentValues.Add(EarliestTime.Minutes.ToString().PadLeft(2, '0'));
            }

            if(EarliestTime == null && LatestTime != null) 
            {
                argumentValues.Add(LatestTime.Hours.ToString().PadLeft(2, '0'));
                argumentValues.Add(LatestTime.Minutes.ToString().PadLeft(2, '0'));
            }

            if(EarliestTime != null && LatestTime != null && (EarliestTime.Hours != LatestTime.Hours || EarliestTime.Minutes != LatestTime.Minutes))
            {
                languageKeyToUse = "DailyRoutineEntryNameTwoTimes";
                argumentValues.Add(LatestTime.Hours.ToString().PadLeft(2, '0'));
                argumentValues.Add(LatestTime.Minutes.ToString().PadLeft(2, '0'));
            }

            return new CompareDifferenceValue(languageKeyToUse, CompareDifferenceValue.ValueResolveType.LanguageKey, argumentValues); } 
        }
    }
}