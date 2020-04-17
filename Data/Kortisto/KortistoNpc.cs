using System;
using System.Collections.Generic;
using System.Linq;
using GoNorth.Data.FlexFieldDatabase;
using GoNorth.Services.Export.Placeholder;
using GoNorth.Services.ImplementationStatusCompare;

namespace GoNorth.Data.Kortisto
{
    /// <summary>
    /// Kortisto Npc
    /// </summary>
    public class KortistoNpc : FlexFieldObject, IExportSnippetExportable, ICloneable
    {

        /// <summary>
        /// true if the npc is a player npc, else false
        /// </summary>
        [ValueCompareAttribute]
        public bool IsPlayerNpc { get; set; }

        /// <summary>
        /// Template of the Name Gen
        /// </summary>
        public string NameGenTemplate { get; set; }

        /// <summary>
        /// Inventory Items
        /// </summary>
        [ListCompareAttribute(LabelKey = "InventoryChanged")]
        public List<KortistoInventoryItem> Inventory { get; set; }

        /// <summary>
        /// Skill
        /// </summary>
        [ListCompareAttribute(LabelKey = "SkillChanged")]
        public List<KortistoNpcSkill> Skills { get; set; }
        
        /// <summary>
        /// Daily Routine
        /// </summary>
        [ListCompareAttribute(LabelKey = "DailyRoutineChanged")]
        public List<KortistoNpcDailyRoutineEvent> DailyRoutine { get; set; }

        /// <summary>
        /// Clones the npc
        /// </summary>
        /// <returns>Cloned object</returns>
        public object Clone()
        {
            KortistoNpc clonedNpc = CloneObject<KortistoNpc>();
            clonedNpc.IsPlayerNpc = IsPlayerNpc;
            clonedNpc.NameGenTemplate = NameGenTemplate;
            clonedNpc.Inventory = Inventory != null ? Inventory.Select(i => i.Clone()).Cast<KortistoInventoryItem>().ToList() : null;
            clonedNpc.Skills = Skills != null ? Skills.Select(i => i.Clone()).Cast<KortistoNpcSkill>().ToList() : null;
            clonedNpc.DailyRoutine = DailyRoutine != null ? DailyRoutine.Select(i => i.Clone()).Cast<KortistoNpcDailyRoutineEvent>().ToList() : null;

            return clonedNpc;
        }
    }
}