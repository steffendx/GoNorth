using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using GoNorth.Config;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using MongoDB.Driver.Linq;

namespace GoNorth.Data.FlexFieldDatabase
{
    /// <summary>
    /// Flex Field Object Mongo DB Access
    /// </summary>
    public class FlexFieldObjectBaseMongoDbAccess<T> : BaseMongoDbAccess, IFlexFieldObjectDbAccess<T> where T:FlexFieldObject,new()
    {
        /// <summary>
        /// Collection Name of the recycling bin
        /// </summary>
        private readonly string _RecylingBinCollectionName;

        /// <summary>
        /// Object Collection
        /// </summary>
        protected IMongoCollection<T> _ObjectCollection;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="collectionName">Name of the object collection</param>
        /// <param name="recylingBinCollectionName">Name of the recyling bin object collection</param>
        /// <param name="configuration">Configuration</param>
        public FlexFieldObjectBaseMongoDbAccess(string collectionName, string recylingBinCollectionName, IOptions<ConfigurationData> configuration) : base(configuration)
        {
            _RecylingBinCollectionName = recylingBinCollectionName;
            _ObjectCollection = _Database.GetCollection<T>(collectionName);
        }

        /// <summary>
        /// Creates a Flex Field Object
        /// </summary>
        /// <param name="flexFieldObject">Flex Field object to create</param>
        /// <returns>Created flex field object, with filled id</returns>
        public async Task<T> CreateFlexFieldObject(T flexFieldObject)
        {
            flexFieldObject.Id = Guid.NewGuid().ToString();
            await _ObjectCollection.InsertOneAsync(flexFieldObject);

            return flexFieldObject;
        }

        /// <summary>
        /// Returns an Flex Field Object by id
        /// </summary>
        /// <param name="id">Id</param>
        /// <returns>Flex Field Object</returns>
        public async Task<T> GetFlexFieldObjectById(string id)
        {
            T flexFieldObject = await _ObjectCollection.Find(n => n.Id == id).FirstOrDefaultAsync();
            return flexFieldObject;
        }

        /// <summary>
        /// Returns the Flex Field Objects in the root folder
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <param name="start">Start of the query</param>
        /// <param name="pageSize">Page Size</param>
        /// <returns>Flex Field Objects</returns>
        public async Task<List<T>> GetFlexFieldObjectsInRootFolderForProject(string projectId, int start, int pageSize)
        {
            List<T> flexFieldObjects = await _ObjectCollection.AsQueryable().Where(n => n.ProjectId == projectId && string.IsNullOrEmpty(n.ParentFolderId)).OrderBy(n => n.Name).Skip(start).Take(pageSize).Select(c => new T() {
                Id = c.Id,
                Name = c.Name,
                ImageFile = c.ImageFile,
                ThumbnailImageFile = c.ThumbnailImageFile
            }).ToListAsync();
            return flexFieldObjects;
        }

        /// <summary>
        /// Returns the count of Flex Field Objects in the root folder
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <returns>Flex Field Object Count</returns>
        public async Task<int> GetFlexFieldObjectsInRootFolderCount(string projectId)
        {
            int count = (int)await _ObjectCollection.AsQueryable().Where(n => n.ProjectId == projectId && string.IsNullOrEmpty(n.ParentFolderId)).CountAsync();
            return count;
        }

        /// <summary>
        /// Returns all Flex Field Objects in a folder
        /// </summary>
        /// <param name="folderId">Folder Id</param>
        /// <param name="start">Start of the query</param>
        /// <param name="pageSize">Page Size</param>
        /// <returns>Flex Field Objects</returns>
        public async Task<List<T>> GetFlexFieldObjectsInFolder(string folderId, int start, int pageSize)
        {
            List<T> flexFieldObjects = await _ObjectCollection.AsQueryable().Where(n => n.ParentFolderId == folderId).OrderBy(n => n.Name).Skip(start).Take(pageSize).Select(c => new T() {
                Id = c.Id,
                Name = c.Name,
                ImageFile = c.ImageFile,
                ThumbnailImageFile = c.ThumbnailImageFile
            }).ToListAsync();
            return flexFieldObjects;
        }

        /// <summary>
        /// Returns the count of Flex Field Objects in a folder folder
        /// </summary>
        /// <param name="folderId">Folder Id</param>
        /// <returns>Flex Field Object Count</returns>
        public async Task<int> GetFlexFieldObjectsInFolderCount(string folderId)
        {
            int count = await _ObjectCollection.AsQueryable().Where(n => n.ParentFolderId == folderId).CountAsync();
            return count;
        }

        /// <summary>
        /// Returns all Flex Field Objects that are not yet implemented
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <param name="start">Start of the query</param>
        /// <param name="pageSize">Page Size</param>
        /// <returns>Flex Field Objects</returns>
        public async Task<List<T>> GetNotImplementedFlexFieldObjects(string projectId, int start, int pageSize)
        {
            List<T> flexFieldObjects = await _ObjectCollection.AsQueryable().Where(n => n.ProjectId == projectId && !n.IsImplemented).OrderBy(n => n.Name).Skip(start).Take(pageSize).Select(c => new T() {
                Id = c.Id,
                Name = c.Name
            }).ToListAsync();
            return flexFieldObjects;
        }

        /// <summary>
        /// Returns the count of all Flex Field Objects that are not yet implemented
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <returns>Flex Field Object Count</returns>
        public async Task<int> GetNotImplementedFlexFieldObjectsCount(string projectId)
        {
            int count = await _ObjectCollection.AsQueryable().Where(n => n.ProjectId == projectId && !n.IsImplemented).CountAsync();
            return count;
        }


        /// <summary>
        /// Builds a flex field object search queryable
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <param name="searchPattern">Search pattern</param>
        /// <returns>Flex Field Object Queryable</returns>
        private IMongoQueryable<T> BuildFlexFieldObjectSearchQueryable(string projectId, string searchPattern)
        {
            string regexPattern = ".";
            if(!string.IsNullOrEmpty(searchPattern))
            {
                string[] searchPatternParts = searchPattern.Split(" ");
                regexPattern = "(" + string.Join("|", searchPatternParts) + ")";
            }
            return _ObjectCollection.AsQueryable().Where(n => n.ProjectId == projectId && (Regex.IsMatch(n.Name, regexPattern, RegexOptions.IgnoreCase) || n.Tags.Any(t => Regex.IsMatch(t, regexPattern, RegexOptions.IgnoreCase))));
        }

        /// <summary>
        /// Searches Flex Field Objects
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <param name="searchPattern">Search pattern</param>
        /// <param name="start">Start of the query</param>
        /// <param name="pageSize">Page Size</param>
        /// <returns>Flex Field Objects</returns>
        public async Task<List<T>> SearchFlexFieldObjects(string projectId, string searchPattern, int start, int pageSize)
        {
            return await BuildFlexFieldObjectSearchQueryable(projectId, searchPattern).Skip(start).Take(pageSize).Select(c => new T() {
                Id = c.Id,
                Name = c.Name,
                ImageFile = c.ImageFile,
                ThumbnailImageFile = c.ThumbnailImageFile
            }).ToListAsync();
        }

        /// <summary>
        /// Returns the count of a search result
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <param name="searchPattern">Search pattern</param>
        /// <returns>Count of results</returns>
        public async Task<int> SearchFlexFieldObjectsCount(string projectId, string searchPattern)
        {
            return await BuildFlexFieldObjectSearchQueryable(projectId, searchPattern).CountAsync();
        }

        /// <summary>
        /// Returns the Flex Field Objects which are based on a certain template
        /// </summary>
        /// <param name="templateId">Template Id</param>
        /// <returns>Flex Field Objects</returns>
        public async Task<List<T>> GetFlexFieldObjectsByTemplate(string templateId)
        {
            return await _ObjectCollection.AsQueryable().Where(n => n.TemplateId == templateId).ToListAsync();
        }
        
        /// <summary>
        /// Returns all flex field objects that are not part of an id list. This means that they are not part of the list themselfs and or their template
        /// </summary>
        /// <param name="idList">List of ids</param>
        /// <returns>Flex field objects</returns>
        public async Task<List<T>> GetFlexFieldObjectsNotPartOfIdList(IEnumerable<string> idList)
        {
            return await _ObjectCollection.AsQueryable().Where(n => !idList.Contains(n.TemplateId) && !idList.Contains(n.Id)).Select(c => new T() {
                Id = c.Id,
                Name = c.Name,
            }).ToListAsync();
        }
        
        /// <summary>
        /// Returns all flex field objects that are part of an id list. This means that they are not part of the list themselfs and or their template
        /// </summary>
        /// <param name="idList">List of ids</param>
        /// <returns>Flex field objects</returns>
        public async Task<List<T>> GetFlexFieldObjectsPartOfIdList(IEnumerable<string> idList)
        {
            return await _ObjectCollection.AsQueryable().Where(n => idList.Contains(n.TemplateId) || idList.Contains(n.Id)).Select(c => new T() {
                Id = c.Id,
                Name = c.Name,
            }).ToListAsync();
        }

        /// <summary>
        /// Resolves the names for a list of Flex Field Objects
        /// </summary>
        /// <param name="flexFieldObjectIds">Flex Field Object Ids</param>
        /// <returns>Resolved Flex Field Objects with names</returns>
        public async Task<List<T>> ResolveFlexFieldObjectNames(List<string> flexFieldObjectIds)
        {
            return await  _ObjectCollection.AsQueryable().Where(n => flexFieldObjectIds.Contains(n.Id)).Select(c => new T() {
                Id = c.Id,
                Name = c.Name,
            }).ToListAsync();
        }

        /// <summary>
        /// Updates an Flex Field Object
        /// </summary>
        /// <param name="flexFieldObject">Flex Field Object to update</param>
        /// <returns>Task</returns>
        public async Task UpdateFlexFieldObject(T flexFieldObject)
        {
            ReplaceOneResult result = await _ObjectCollection.ReplaceOneAsync(n => n.Id == flexFieldObject.Id, flexFieldObject);
        }

        /// <summary>
        /// Moves an object to a folder
        /// </summary>
        /// <param name="objectId">Object to move</param>
        /// <param name="targetFolderId">Id of the folder to move the object to</param>
        /// <returns>Task</returns>
        public async Task MoveToFolder(string objectId, string targetFolderId)
        {
            await _ObjectCollection.UpdateOneAsync(Builders<T>.Filter.Eq(f => f.Id, objectId), 
                                                   Builders<T>.Update.Set(p => p.ParentFolderId, targetFolderId));
        }

        /// <summary>
        /// Deletes an Flex Field Object
        /// </summary>
        /// <param name="flexFieldObject">Flex Field Object to delete</param>
        /// <returns>Task</returns>
        public async Task DeleteFlexFieldObject(T flexFieldObject)
        {
            T existingFlexFieldObject = await GetFlexFieldObjectById(flexFieldObject.Id);
            if(existingFlexFieldObject == null)
            {
                throw new NullReferenceException();
            }

            IMongoCollection<T> recyclingBin = _Database.GetCollection<T>(_RecylingBinCollectionName);
            await recyclingBin.InsertOneAsync(existingFlexFieldObject);

            DeleteResult result = await _ObjectCollection.DeleteOneAsync(n => n.Id == flexFieldObject.Id);
        }

        /// <summary>
        /// Checks if any Flex Field Object use an image file
        /// </summary>
        /// <param name="imageFile">Image file</param>
        /// <returns>true if image file is used, else false</returns>
        public async Task<bool> AnyFlexFieldObjectUsingImage(string imageFile)
        {
            int count = (int)await _ObjectCollection.CountDocumentsAsync(Builders<T>.Filter.Eq(n => n.ImageFile, imageFile) | Builders<T>.Filter.Eq(n => n.ThumbnailImageFile, imageFile));
            return count > 0;
        }

        /// <summary>
        /// Checks if any Flex Field Object use a tag
        /// </summary>
        /// <param name="tag">Tag</param>
        /// <returns>true if tag is used, else false</returns>
        public async Task<bool> AnyFlexFieldObjectUsingTag(string tag)
        {
            tag = tag.ToLowerInvariant();
            return await _ObjectCollection.AsQueryable().Where(n => n.Tags.Any(s => s.ToLowerInvariant() == tag)).AnyAsync();
        }


        /// <summary>
        /// Returns all objects that were last modified by a given user
        /// </summary>
        /// <param name="userId">Id of the user</param>
        /// <returns>Objects</returns>
        public async Task<List<T>> GetFlexFieldObjectsByModifiedUser(string userId)
        {
            return await _ObjectCollection.AsQueryable().Where(n => n.ModifiedBy == userId).ToListAsync();
        }
    }
}