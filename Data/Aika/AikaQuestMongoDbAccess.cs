using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using GoNorth.Config;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using MongoDB.Driver.Linq;

namespace GoNorth.Data.Aika
{
    /// <summary>
    /// Aika Quest Mongo DB Access
    /// </summary>
    public class AikaQuestMongoDbAccess : BaseMongoDbAccess, IAikaQuestDbAccess
    {
        /// <summary>
        /// Collection Name of the aika quests
        /// </summary>
        public const string AikaQuestCollectionName = "AikaQuest";

        /// <summary>
        /// Collection Name of the aika quest recycling bin
        /// </summary>
        public const string AikaQuestRecyclingBinCollectionName = "AikaQuestRecyclingBin";

        /// <summary>
        /// Quest Collection
        /// </summary>
        private IMongoCollection<AikaQuest> _QuestCollection;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="configuration">Configuration</param>
        public AikaQuestMongoDbAccess(IOptions<ConfigurationData> configuration) : base(configuration)
        {
            _QuestCollection = _Database.GetCollection<AikaQuest>(AikaQuestCollectionName);
        }

        /// <summary>
        /// Returns a quest by the id
        /// </summary>
        /// <param name="id">Id of the quest</param>
        /// <returns>Quest</returns>
        public async Task<AikaQuest> GetQuestById(string id)
        {
            AikaQuest quest = await _QuestCollection.Find(q => q.Id == id).FirstOrDefaultAsync();
            return quest;
        }

        /// <summary>
        /// Builds a quest search  by project id queryable
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <param name="locale">Locale used for the collation</param>
        /// <returns>Quest Queryable</returns>
        private IFindFluent<AikaQuest, AikaQuest> BuildQuestByProjectIdQueryable(string projectId, string locale)
        {
            return _QuestCollection.Find(q => q.ProjectId == projectId, new FindOptions {
                Collation = new Collation(locale, null, CollationCaseFirst.Off, CollationStrength.Primary)
            });
        }

        /// <summary>
        /// Returns the quests for a project with reduced informations
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <param name="start">Start of the query</param>
        /// <param name="pageSize">Page Size</param>
        /// <param name="locale">Locale used for the collation</param>
        /// <returns>Quests</returns>
        public async Task<List<AikaQuest>> GetQuestsByProjectId(string projectId, int start, int pageSize, string locale)
        {
            List<AikaQuest> quests = await BuildQuestByProjectIdQueryable(projectId, locale).SortBy(q => q.Name).Skip(start).Limit(pageSize).Project(q => new AikaQuest() {
                Id = q.Id,
                Name = q.Name,
                IsMainQuest = q.IsMainQuest
            }).ToListAsync();
            return quests;
        }

        /// <summary>
        /// Returns the count of quests for a project
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <param name="locale">Locale used for the collation</param>
        /// <returns>Quest Count</returns>
        public async Task<int> GetQuestsByProjectIdCount(string projectId, string locale)
        {
            int count = (int)await BuildQuestByProjectIdQueryable(projectId, locale).CountDocumentsAsync();
            return count;
        }

        /// <summary>
        /// Builds a quest search queryable
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <param name="searchPattern">Search pattern</param>
        /// <param name="locale">Locale used for the collation</param>
        /// <returns>Quest Queryable</returns>
        private IFindFluent<AikaQuest, AikaQuest> BuildQuestSearchQueryable(string projectId, string searchPattern, string locale)
        {
            string regexPattern = ".";
            if(!string.IsNullOrEmpty(searchPattern))
            {
                string[] searchPatternParts = searchPattern.Split(" ").Select(s => Regex.Escape(s)).ToArray();
                regexPattern = "(" + string.Join("|", searchPatternParts) + ")";
            }
            return _QuestCollection.Find(q => q.ProjectId == projectId && (Regex.IsMatch(q.Name, regexPattern, RegexOptions.IgnoreCase) || Regex.IsMatch(q.Description, regexPattern, RegexOptions.IgnoreCase)), new FindOptions {
                Collation = new Collation(locale, null, CollationCaseFirst.Off, CollationStrength.Primary)
            });
        }

        /// <summary>
        /// Searches Quests with reduced informations
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <param name="searchPattern">Search pattern</param>
        /// <param name="start">Start of the query</param>
        /// <param name="pageSize">Page Size</param>
        /// <param name="locale">Locale used for the collation</param>
        /// <returns>Quests</returns>
        public async Task<List<AikaQuest>> SearchQuests(string projectId, string searchPattern, int start, int pageSize, string locale)
        {
            List<AikaQuest> quests = await BuildQuestSearchQueryable(projectId, searchPattern, locale).SortBy(q => q.Name).Skip(start).Limit(pageSize).Project(q => new AikaQuest() {
                Id = q.Id,
                Name = q.Name,
                IsMainQuest = q.IsMainQuest
            }).ToListAsync();
            return quests;
        }

        /// <summary>
        /// Returns the count of a search result
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <param name="searchPattern">Search pattern</param>
        /// <param name="locale">Locale used for the collation</param>
        /// <returns>Count of results</returns>
        public async Task<int> SearchQuestsCount(string projectId, string searchPattern, string locale)
        {
            int count = (int)await BuildQuestSearchQueryable(projectId, searchPattern, locale).CountDocumentsAsync();
            return count;
        }

        /// <summary>
        /// Builds a quest searchable for not implemented quests
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <param name="locale">Locale used for the collation</param>
        /// <returns>Quest Queryable</returns>
        private IFindFluent<AikaQuest, AikaQuest> BuildNotImplementedQueryable(string projectId, string locale)
        {
            return _QuestCollection.Find(q => q.ProjectId == projectId && !q.IsImplemented, new FindOptions {
                Collation = new Collation(locale, null, CollationCaseFirst.Off, CollationStrength.Primary)
            });
        }


        /// <summary>
        /// Returns all quests that are not yet implemented
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <param name="start">Start of the query</param>
        /// <param name="pageSize">Page Size</param>
        /// <param name="locale">Locale used for the collation</param>
        /// <returns>Quest Objects</returns>
        public async Task<List<AikaQuest>> GetNotImplementedQuests(string projectId, int start, int pageSize, string locale)
        {
            List<AikaQuest> quests = await BuildNotImplementedQueryable(projectId, locale).SortBy(q => q.Name).Skip(start).Limit(pageSize).Project(q => new AikaQuest() {
                Id = q.Id,
                Name = q.Name,
                IsMainQuest = q.IsMainQuest
            }).ToListAsync();
            return quests; 
        }

        /// <summary>
        /// Returns the count of all quests that are not yet implemented
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <param name="locale">Locale used for the collation</param>
        /// <returns>Quest Count</returns>
        public async Task<int> GetNotImplementedQuestsCount(string projectId, string locale)
        {
            int count = (int)await BuildNotImplementedQueryable(projectId, locale).CountDocumentsAsync();
            return count; 
        }

        /// <summary>
        /// Returns all quests an object is referenced in
        /// </summary>
        /// <param name="objectId">Object Id</param>
        /// <returns>All Quests object is referenced in without detail information</returns>
        public async Task<List<AikaQuest>> GetQuestsObjectIsReferenced(string objectId)
        {
            List<AikaQuest> quests = await _QuestCollection.AsQueryable().Where(q => q.Action.Any(a => a.ActionRelatedToObjectId == objectId || (a.ActionRelatedToAdditionalObjects != null && a.ActionRelatedToAdditionalObjects.Any(e => e.ObjectId == objectId))) || q.Condition.Any(c => c.Conditions.Any(ce => ce.DependsOnObjects.Any(o => o.ObjectId == objectId)))).Select(q => new AikaQuest() {
                Id = q.Id,
                Name = q.Name,
                IsMainQuest = q.IsMainQuest
            }).ToListAsync();

            quests = quests.OrderBy(q => q.Name).ToList();
            return quests;
        }
        
        /// <summary>
        /// Resolves the names for a list of Quests
        /// </summary>
        /// <param name="questIds">Quest Ids</param>
        /// <returns>Resolved Quests with names</returns>
        public async Task<List<AikaQuest>> ResolveQuestNames(List<string> questIds)
        {
            return await  _QuestCollection.AsQueryable().Where(q => questIds.Contains(q.Id)).Select(q => new AikaQuest() {
                Id = q.Id,
                Name = q.Name
            }).ToListAsync();
        }

        /// <summary>
        /// Creates a new quest
        /// </summary>
        /// <param name="quest">Quest</param>
        /// <returns>Quest filled with data</returns>
        public async Task<AikaQuest> CreateQuest(AikaQuest quest)
        {
            quest.Id = Guid.NewGuid().ToString();
            await _QuestCollection.InsertOneAsync(quest);

            return quest;
        }

        /// <summary>
        /// Updates a quest
        /// </summary>
        /// <param name="quest">Quest to update</param>
        /// <returns>Task</returns>
        public async Task UpdateQuest(AikaQuest quest)
        {
            ReplaceOneResult result = await _QuestCollection.ReplaceOneAsync(q => q.Id == quest.Id, quest);
        }

        /// <summary>
        /// Deletes a quest
        /// </summary>
        /// <param name="quest">Quest to delete</param>
        /// <returns>Task</returns>
        public async Task DeleteQuest(AikaQuest quest)
        {
            AikaQuest existingQuest = await GetQuestById(quest.Id);
            if(existingQuest == null)
            {
                throw new NullReferenceException();
            }

            IMongoCollection<AikaQuest> recyclingBin = _Database.GetCollection<AikaQuest>(AikaQuestRecyclingBinCollectionName);
            await recyclingBin.InsertOneAsync(existingQuest);

            DeleteResult result = await _QuestCollection.DeleteOneAsync(q => q.Id == quest.Id);
        }


        /// <summary>
        /// Returns all quests that were last modified by a given user
        /// </summary>
        /// <param name="userId">Id of the user</param>
        /// <returns>Quests</returns>
        public async Task<List<AikaQuest>> GetQuestsByModifiedUser(string userId)
        {
            return await _QuestCollection.AsQueryable().Where(q => q.ModifiedBy == userId).ToListAsync();
        }
                
        /// <summary>
        /// Returns all quests in the recycle bin that were last modified by a given user
        /// </summary>
        /// <param name="userId">Id of the user</param>
        /// <returns>Quest</returns>
        public async Task<List<AikaQuest>> GetRecycleBinQuestsByModifiedUser(string userId)
        {
            IMongoCollection<AikaQuest> recyclingBin = _Database.GetCollection<AikaQuest>(AikaQuestRecyclingBinCollectionName);
            return await recyclingBin.AsQueryable().Where(q => q.ModifiedBy == userId).ToListAsync();
        }
        
        /// <summary>
        /// Returns all quests in the recycle bin that were last modified by a given user
        /// </summary>
        /// <param name="userId">Id of the user</param>
        /// <returns>Task</returns>
        public async Task ResetRecycleBinQuestByModifiedUser(string userId)
        {
            IMongoCollection<AikaQuest> recyclingBin = _Database.GetCollection<AikaQuest>(AikaQuestRecyclingBinCollectionName);
            await recyclingBin.UpdateManyAsync(n => n.ModifiedBy == userId, Builders<AikaQuest>.Update.Set(n => n.ModifiedBy, Guid.Empty.ToString()).Set(n => n.ModifiedOn, DateTimeOffset.UtcNow));
        }
    }
}