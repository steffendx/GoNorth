using System;
using System.Collections.Generic;
using GoNorth.Data.ImplementationSnapshot;
using GoNorth.Services.ImplementationStatusCompare;

namespace GoNorth.Data.Karta.Marker
{
    /// <summary>
    /// Karta Marker Geometry
    /// </summary>
    public class MarkerGeometry : IImplementationListComparable
    {
        /// <summary>
        /// Id
        /// </summary>
        public string Id { get; set; }


        /// <summary>
        /// Type of the geometry
        /// </summary>
        public MarkerGeometryType GeoType { get; set; }

        /// <summary>
        /// Data of the geometry
        /// </summary>
        [ListCompareAttribute(LabelKey = "PositionsChanged")]
        public List<MarkerGeometryPosition> Positions { get; set; }

        /// <summary>
        /// Color of the geometry
        /// </summary>
        public string Color { get; set; }


        /// <summary>
        /// Id which is used in a list compare to detect deleted or new objects
        /// </summary>
        public string ListComparableId { get { return Id; } }

        /// <summary>
        /// Value which is used in a list compare for display
        /// </summary>
        public CompareDifferenceValue ListComparableValue { get { return new CompareDifferenceValue("Geometry" + GeoType.ToString(), CompareDifferenceValue.ValueResolveType.LanguageKey); } }
    
    }
}