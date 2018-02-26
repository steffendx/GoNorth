using System.Collections.Generic;
using System.Threading.Tasks;
using GoNorth.Data.FlexFieldDatabase;

namespace GoNorth.Data.Styr
{
    /// <summary>
    /// Interface for Database Access for Styr Items
    /// </summary>
    public interface IStyrItemDbAccess : IFlexFieldObjectDbAccess<StyrItem>
    {
    }
}