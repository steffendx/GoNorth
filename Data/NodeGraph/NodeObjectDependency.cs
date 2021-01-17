using System;
using System.Text.Json.Serialization;
using GoNorth.Services.ImplementationStatusCompare;

namespace GoNorth.Data.NodeGraph
{
    /// <summary>
    /// Node Object dependency
    /// </summary>
    public class NodeObjectDependency : ICloneable, IImplementationListComparable
    {
        /// <summary>
        /// Type of the object
        /// </summary>
        public string ObjectType { get; set; }

        /// <summary>
        /// Id of the object
        /// </summary>
        public string ObjectId { get; set; }

        /// <summary>
        /// Id which is used in a list compare to detect deleted or new objects
        /// </summary>
        [JsonIgnore]
        public string ListComparableId { get { return ObjectId; } }

        /// <summary>
        /// Value which is used in a list compare for display
        /// </summary>
        [JsonIgnore]
        public CompareDifferenceValue ListComparableValue { 
            get { 
                CompareDifferenceValue.ValueResolveType valueResolveType = CompareDifferenceValue.ValueResolveType.LanguageKey;
                if(ObjectType == "Npc")
                {
                    valueResolveType = CompareDifferenceValue.ValueResolveType.ResolveNpcName;
                }
                else if(ObjectType == "Item")
                {
                    valueResolveType = CompareDifferenceValue.ValueResolveType.ResolveItemName;
                }
                else if(ObjectType == "Skill")
                {
                    valueResolveType = CompareDifferenceValue.ValueResolveType.ResolveSkillName;
                }
                else if(ObjectType == "Quest")
                {
                    valueResolveType = CompareDifferenceValue.ValueResolveType.ResolveQuestName;
                }
                else if(ObjectType == "WikiPage")
                {
                    valueResolveType = CompareDifferenceValue.ValueResolveType.ResolveWikiPageName;
                }
                else if(ObjectType == "Map")
                {
                    valueResolveType = CompareDifferenceValue.ValueResolveType.ResolveMapName;
                }
                else if(ObjectType == "NpcDailyRoutineEvent" || ObjectType == "MapMarker")
                {
                    valueResolveType = CompareDifferenceValue.ValueResolveType.Ignore;
                }
                return new CompareDifferenceValue(ObjectId, valueResolveType); 
            } 
        }

        /// <summary>
        /// Clones the object
        /// </summary>
        /// <returns>Cloned object</returns>
        public object Clone()
        {
            return new NodeObjectDependency {
                ObjectType = this.ObjectType,
                ObjectId = this.ObjectId
            };
        }
    }
}
