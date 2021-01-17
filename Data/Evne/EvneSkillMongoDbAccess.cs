using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using GoNorth.Config;
using GoNorth.Data.FlexFieldDatabase;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using MongoDB.Driver.Linq;

namespace GoNorth.Data.Evne
{
    /// <summary>
    /// Evne Skill Mongo DB Access
    /// </summary>
    public class EvneSkillMongoDbAccess : FlexFieldObjectBaseMongoDbAccess<EvneSkill>, IEvneSkillDbAccess
    {
        /// <summary>
        /// Collection Name of the evne skills
        /// </summary>
        public const string EvneSkillCollectionName = "EvneSkill";

        /// <summary>
        /// Collection Name of the evne skill recycling bin
        /// </summary>
        public const string EvneSkillRecyclingBinCollectionName = "EvneSkillRecyclingBin";

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="configuration">Configuration</param>
        public EvneSkillMongoDbAccess(IOptions<ConfigurationData> configuration) : base(EvneSkillCollectionName, EvneSkillRecyclingBinCollectionName, configuration)
        {
        }

        /// <summary>
        /// Returns all skills an object is referenced in
        /// </summary>
        /// <param name="objectId">Object Id</param>
        /// <returns>All kills the object is referenced in without detail information and the entrie with relatedobjectid = itself</returns>
        public async Task<List<EvneSkill>> GetSkillsObjectIsReferencedIn(string objectId)
        {
            List<EvneSkill> skills = await _ObjectCollection.AsQueryable().Where(o => o.Id != objectId && (o.Action.Any(a => a.ActionRelatedToObjectId == objectId || (a.ActionRelatedToAdditionalObjects != null && a.ActionRelatedToAdditionalObjects.Any(e => e.ObjectId == objectId))) || o.Condition.Any(c => c.Conditions.Any(co => co.DependsOnObjects.Any(doo => doo.ObjectId == objectId))) ||
                                                                                    o.Reference.Any(a => a.ReferencedObjects.Any(r => r.ObjectId == objectId)))).Select(o => new EvneSkill {
                                                                                        Id = o.Id,
                                                                                        Name = o.Name
                                                                                    }).ToListAsync();

            return skills;
        }

    }
}