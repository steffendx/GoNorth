using System.Collections.Generic;
using GoNorth.Data.FlexFieldDatabase;

namespace GoNorth.Services.Export.Placeholder
{
    /// <summary>
    /// Interface for objects that can be exported as flex field
    /// </summary>
    public interface IFlexFieldExportable
    {
        /// <summary>
        /// Id
        /// </summary>
        string Id { get; set; }

        /// <summary>
        /// Name
        /// </summary>
        string Name { get; set; }

        /// <summary>
        /// Fields
        /// </summary>
        List<FlexField> Fields { get; set; }
    }
}