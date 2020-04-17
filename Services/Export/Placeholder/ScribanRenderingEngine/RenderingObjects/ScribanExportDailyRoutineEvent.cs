using GoNorth.Data.Kortisto;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.Util;

namespace GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.RenderingObjects
{
    /// <summary>
    /// Class to export Daily routine events to Scriban
    /// </summary>
    public class ScribanExportDailyRoutineEvent
    {
        /// <summary>
        /// Id of the event
        /// </summary>
        [ScribanExportValueLabel]
        public string EventId { get; set; }
        
        /// <summary>
        /// Earliest time
        /// </summary>
        [ScribanExportValueObjectLabel]
        public ScribanExportDailyRoutineEventTime EarliestTime { get; set; }

        /// <summary>
        /// Latest time
        /// </summary>
        [ScribanExportValueObjectLabel]
        public ScribanExportDailyRoutineEventTime LatestTime { get; set; }

        /// <summary>
        /// Movement target of the event, null if no movement target exists
        /// </summary>
        [ScribanExportValueLabel]
        public string MovementTarget { get; set; }

        /// <summary>
        /// Movement target of the event, null if no movement target exists. Escape settings will not be used here
        /// </summary>
        [ScribanExportValueLabel]
        public string UnescapedMovementTarget { get; set; }

        /// <summary>
        /// Export name of the movement target of the event, null if no movement target exists
        /// </summary>
        [ScribanExportValueLabel]
        public string MovementTargetExportName { get; set; }

        /// <summary>
        /// Export name of the movement target of the event, null if no movement target exists. Escape settings will not be used here
        /// </summary>
        [ScribanExportValueLabel]
        public string UnescapedMovementTargetExportName { get; set; }

        /// <summary>
        /// Export name of the movement target of the event. If the export name is empty the name will be used. If the movement target is empty it will also be null
        /// </summary>
        [ScribanExportValueLabel]
        public string MovementTargetExportNameOrName { get; set; }

        /// <summary>
        /// Export name of the movement target of the event. If the export name is empty the name will be used. If the movement target is empty it will also be null. Escape settings will not be used here
        /// </summary>
        [ScribanExportValueLabel]
        public string UnescapedMovementTargetExportNameOrName { get; set; }

        /// <summary>
        /// type of the script associated with the event
        /// </summary>
        [ScribanExportValueLabel]
        public string ScriptType { get; set; }
               
        /// <summary>
        /// Name of the script function
        /// </summary>
        [ScribanExportValueLabel]
        public string ScriptFunctionName { get; set; }
                        
        /// <summary>
        /// Name of the script
        /// </summary>
        [ScribanExportValueLabel]
        public string ScriptName { get; set; }

        /// <summary>
        /// Target state 
        /// </summary>
        [ScribanExportValueLabel]
        public string TargetState { get; set; }
                
        /// <summary>
        /// true if the event is enabled by default
        /// </summary>
        [ScribanExportValueLabel]
        public bool IsEnabledByDefault { get; set; }


        /// <summary>
        /// Original daily routine event this is based on
        /// </summary>
        public KortistoNpcDailyRoutineEvent OriginalEvent { get; set; }
    }
}