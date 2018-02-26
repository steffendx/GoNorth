using System.Collections.Generic;
using System.Threading.Tasks;
using GoNorth.Data.FlexFieldDatabase;

namespace GoNorth.Data.Kortisto
{
    /// <summary>
    /// Interface for Database Access for Kortisto Npc Templates
    /// </summary>
    public interface IKortistoNpcTemplateDbAccess : IFlexFieldObjectDbAccess<KortistoNpc>
    {
    }
}