using System.Reflection;
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
            PropertyInfo[] properties = baseNpc.GetType().GetProperties();
            foreach(PropertyInfo curProperty in properties)
            {
                PropertyInfo derivedProperty = this.GetType().GetProperty(curProperty.Name);
                if (derivedProperty != null)
                {
                    object value = curProperty.GetValue(baseNpc);
                    derivedProperty.SetValue(this, value);
                }
            }
        }

        /// <summary>
        /// Dialog of the Npc
        /// </summary>
        public TaleDialog Dialog { get; set; }
    }
}