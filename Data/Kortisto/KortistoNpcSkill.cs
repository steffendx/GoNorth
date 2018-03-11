using System;
using System.Collections.Generic;
using GoNorth.Data.FlexFieldDatabase;
using GoNorth.Services.ImplementationStatusCompare;

namespace GoNorth.Data.Kortisto
{
    /// <summary>
    /// Kortisto Npc Skill
    /// </summary>
    public class KortistoNpcSkill : IImplementationListComparable
    {
        /// <summary>
        /// Skill Id
        /// </summary>
        public string SkillId { get; set; }


        /// <summary>
        /// Id which is used in a list compare to detect deleted or new objects
        /// </summary>
        public string ListComparableId { get { return SkillId; } }

        /// <summary>
        /// Value which is used in a list compare for display
        /// </summary>
        public CompareDifferenceValue ListComparableValue { get { return new CompareDifferenceValue(SkillId, CompareDifferenceValue.ValueResolveType.ResolveSkillName); } }
    }
}