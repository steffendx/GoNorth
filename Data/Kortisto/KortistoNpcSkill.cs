using System;
using System.Text.Json.Serialization;
using GoNorth.Services.ImplementationStatusCompare;

namespace GoNorth.Data.Kortisto
{
    /// <summary>
    /// Kortisto Npc Skill
    /// </summary>
    public class KortistoNpcSkill : IImplementationListComparable, ICloneable
    {
        /// <summary>
        /// Skill Id
        /// </summary>
        public string SkillId { get; set; }


        /// <summary>
        /// Id which is used in a list compare to detect deleted or new objects
        /// </summary>
        [JsonIgnore]
        public string ListComparableId { get { return SkillId; } }

        /// <summary>
        /// Value which is used in a list compare for display
        /// </summary>
        [JsonIgnore]
        public CompareDifferenceValue ListComparableValue { get { return new CompareDifferenceValue(SkillId, CompareDifferenceValue.ValueResolveType.ResolveSkillName); } }

        /// <summary>
        /// Clones the object
        /// </summary>
        /// <returns>Cloned object</returns>
        public object Clone()
        {
            return new KortistoNpcSkill {
                SkillId = this.SkillId
            };
        }
    }
}