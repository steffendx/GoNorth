using System.Collections.Generic;
using System.Threading.Tasks;
using GoNorth.Data.FlexFieldDatabase;

namespace GoNorth.Data.Styr
{
    /// <summary>
    /// Interface for Database Access for Styr Item Templates
    /// </summary>
    public interface IStyrItemTemplateDbAccess : IFlexFieldObjectDbAccess<StyrItem>
    {
    }
}