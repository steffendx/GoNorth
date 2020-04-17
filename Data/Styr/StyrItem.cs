using System;
using GoNorth.Data.FlexFieldDatabase;
using GoNorth.Services.Export.Placeholder;

namespace GoNorth.Data.Styr
{
    /// <summary>
    /// Styr Item
    /// </summary>
    public class StyrItem : FlexFieldObject, IExportSnippetExportable, ICloneable
    {
        /// <summary>
        /// Clones the item
        /// </summary>
        /// <returns>Cloned item</returns>
        public object Clone()
        {
            return CloneObject<StyrItem>();
        }
    }
}