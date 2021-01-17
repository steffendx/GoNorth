using GoNorth.Data.Aika;
using GoNorth.Data.Evne;
using GoNorth.Data.Karta;
using GoNorth.Data.Kirja;
using GoNorth.Data.Kortisto;
using GoNorth.Data.Styr;

namespace GoNorth.Services.Export.Dialog.StepRenderers.ReferenceRenderer
{
    /// <summary>
    /// Class to pass data for reference nodes
    /// </summary>
    public class ReferenceNodeData
    {
        /// <summary>
        /// Text of the reference
        /// </summary>
        public string ReferenceText { get; set; }

        /// <summary>
        /// Type of the object
        /// </summary>
        public string ObjectType { get; set; }

        /// <summary>
        /// Npc
        /// </summary>
        public KortistoNpc Npc { get; set; }

        /// <summary>
        /// Item
        /// </summary>
        public StyrItem Item { get; set; }

        /// <summary>
        /// Skill
        /// </summary>
        public EvneSkill Skill { get; set; }

        /// <summary>
        /// Quest
        /// </summary>
        public AikaQuest Quest { get; set; }

        /// <summary>
        /// Wiki page
        /// </summary>
        public KirjaPage WikiPage { get; set; }

        /// <summary>
        /// Marker
        /// </summary>
        public KartaMapNamedMarkerQueryResult Marker { get; set; }

        /// <summary>
        /// Daily Routine Event
        /// </summary>
        public KortistoNpcDailyRoutineEvent DailyRoutineEvent { get; set;}
    }
}