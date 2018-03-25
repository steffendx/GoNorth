using System;
using System.Collections.Generic;
using GoNorth.Data.ImplementationSnapshot;
using GoNorth.Services.ImplementationStatusCompare;

namespace GoNorth.Data.Karta.Marker
{
    /// <summary>
    /// Karta Marker Geometry
    /// </summary>
    public class MarkerGeometryPosition : IImplementationComparable
    {
        /// <summary>
        /// Id
        /// </summary>
        public string Id { get; set; }

        /// <summary>
        /// X-Position on the map
        /// </summary>
        [ValueCompareAttribute]
        public float X { get; set; }
    
        /// <summary>
        /// Y-Position on the map
        /// </summary>
        [ValueCompareAttribute]
        public float Y { get; set; }


        /// <summary>
        /// Id which is used in a list compare to detect deleted or new objects
        /// </summary>
        public string ListComparableId { get { return Id; } }

        /// <summary>
        /// Value which is used in a list compare for display
        /// </summary>
        public CompareDifferenceValue ListComparableValue { get { return new CompareDifferenceValue("GeometryPosition", CompareDifferenceValue.ValueResolveType.LanguageKey); } }
    }
}