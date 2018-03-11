using System.Collections.Generic;
using System.Threading.Tasks;
using GoNorth.Data.FlexFieldDatabase;

namespace GoNorth.Data.Evne
{
    /// <summary>
    /// Interface for Database Access for Evne Skills
    /// </summary>
    public interface IEvneSkillDbAccess : IFlexFieldObjectDbAccess<EvneSkill>
    {
    }
}