using GoNorth.Services.ImplementationStatusCompare;

namespace GoNorth.Data.Karta.Marker
{
    /// <summary>
    /// Karta Map Marker Chapter Pixel Coordinats Modification Data
    /// </summary>
    public class MapMarkerChapterPixelCoords : IImplementationListComparable
    {
        /// <summary>
        /// Chapter Number
        /// </summary>
        public int ChapterNumber { get; set; }

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
        public string ListComparableId { get { return ChapterNumber.ToString(); } }

        /// <summary>
        /// Value which is used in a list compare for display
        /// </summary>
        public CompareDifferenceValue ListComparableValue { get { return new CompareDifferenceValue(ChapterNumber.ToString(), CompareDifferenceValue.ValueResolveType.None); } }        
    }
}