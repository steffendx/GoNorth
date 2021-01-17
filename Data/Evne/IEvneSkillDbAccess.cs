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
        /// <summary>
        /// Returns all skills an object is referenced in
        /// </summary>
        /// <param name="objectId">Object Id</param>
        /// <returns>All kills the object is referenced in without detail information and the entrie with relatedobjectid = itself</returns>
        Task<List<EvneSkill>> GetSkillsObjectIsReferencedIn(string objectId);
    }
}