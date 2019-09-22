using System.Collections.Generic;
using GoNorth.Data.Exporting;
using GoNorth.Data.Kortisto;
using GoNorth.Data.Tale;

namespace GoNorth.Services.Export.Json
{
    /// <summary>
    /// Npc Json Export Object
    /// </summary>
    public class NpcJsonExportObject : KortistoNpc
    {
        /// <summary>
        /// Copy Constructor from Base Npc
        /// </summary>
        /// <param name="baseNpc">Base Npc</param>
        public NpcJsonExportObject(KortistoNpc baseNpc)
        {
            ExportSnippets = new List<ObjectExportSnippet>();

            JsonExportPropertyFill.FillBaseProperties(this, baseNpc);
        }

        /// <summary>
        /// Dialog of the Npc
        /// </summary>
        public TaleDialog Dialog { get; set; }

        /// <summary>
        /// Filled export snippets of the Npc
        /// </summary>
        public List<ObjectExportSnippet> ExportSnippets { get; set; }
    }
}