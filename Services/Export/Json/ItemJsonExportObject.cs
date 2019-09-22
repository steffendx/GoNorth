using System.Collections.Generic;
using GoNorth.Data.Exporting;
using GoNorth.Data.Styr;

namespace GoNorth.Services.Export.Json
{
    /// <summary>
    /// Item Json Export Object
    /// </summary>
    public class ItemJsonExportObject : StyrItem
    {
        /// <summary>
        /// Copy Constructor from Base item
        /// </summary>
        /// <param name="baseItem">Base Item</param>
        public ItemJsonExportObject(StyrItem baseItem)
        {
            ExportSnippets = new List<ObjectExportSnippet>();
            
            JsonExportPropertyFill.FillBaseProperties(this, baseItem);
        }

        /// <summary>
        /// Filled export snippets of the item
        /// </summary>
        public List<ObjectExportSnippet> ExportSnippets { get; set; }
    }
}