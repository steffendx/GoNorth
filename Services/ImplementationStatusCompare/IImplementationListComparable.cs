using System.Collections.Generic;
using System.Threading.Tasks;
using GoNorth.Data.Kortisto;

namespace GoNorth.Services.ImplementationStatusCompare
{
    /// <summary>
    /// Interface for Comparable objects in a list
    /// </summary>
    public interface IImplementationListComparable : IImplementationComparable
    {
        /// <summary>
        /// Id which is used in a list compare to detect deleted or new objects
        /// </summary>
        string ListComparableId { get; }

        /// <summary>
        /// Value which is used in a list compare for display
        /// </summary>
        CompareDifferenceValue ListComparableValue { get; }
    }
}