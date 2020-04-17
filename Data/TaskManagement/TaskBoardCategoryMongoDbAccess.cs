using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using GoNorth.Config;
using Microsoft.Extensions.Options;
using MongoDB.Bson.Serialization;
using MongoDB.Driver;
using MongoDB.Driver.Linq;

namespace GoNorth.Data.TaskManagement
{
    /// <summary>
    /// Task Board Category Mongo DB Access
    /// </summary>
    public class TaskBoardCategoryMongoDbAccess : BaseMongoDbAccess, ITaskBoardCategoryDbAccess
    {
        /// <summary>
        /// Collection Name of the Task Boards
        /// </summary>
        public const string TaskBoardCategoryCollectionName = "TaskBoardCategory";

        /// <summary>
        /// Task Board Collection
        /// </summary>
        private IMongoCollection<TaskBoardCategory> _TaskBoardCategoryCollection;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="configuration">Configuration</param>
        public TaskBoardCategoryMongoDbAccess(IOptions<ConfigurationData> configuration) : base(configuration)
        {
            _TaskBoardCategoryCollection = _Database.GetCollection<TaskBoardCategory>(TaskBoardCategoryCollectionName);
        }

        /// <summary>
        /// Creates a new task board category
        /// </summary>
        /// <param name="category">Category to create</param>
        /// <returns>Created category, with filled id</returns>
        public async Task<TaskBoardCategory> CreateTaskBoardCategory(TaskBoardCategory category)
        {
            category.Id = Guid.NewGuid().ToString();
            await _TaskBoardCategoryCollection.InsertOneAsync(category);

            return category;
        }

        /// <summary>
        /// Gets a task board category by the id
        /// </summary>
        /// <param name="id">Board category Id</param>
        /// <returns>Board category</returns>
        public async Task<TaskBoardCategory> GetTaskBoardCategoryById(string id)
        {
            TaskBoardCategory category = await _TaskBoardCategoryCollection.Find(p => p.Id == id).FirstOrDefaultAsync();
            return category;
        }

        /// <summary>
        /// Returns the task board categories
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <returns>All task board categories</returns>
        public async Task<List<TaskBoardCategory>> GetTaskBoardCategories(string projectId)
        {
            List<TaskBoardCategory> categories = await _TaskBoardCategoryCollection.AsQueryable().Where(c => c.ProjectId == projectId).ToListAsync();
            categories = categories.OrderBy(c => c.Name).ToList();
            return categories;
        }

        /// <summary>
        /// Updates a task board category
        /// </summary>
        /// <param name="category">Task Board category</param>
        /// <returns>Task</returns>
        public async Task UpdateTaskBoardCategory(TaskBoardCategory category)
        {
            ReplaceOneResult result = await _TaskBoardCategoryCollection.ReplaceOneAsync(c => c.Id == category.Id, category);
        }

        /// <summary>
        /// Deletes a task board category
        /// </summary>
        /// <param name="category">Task Board category</param>
        /// <returns>Task</returns>
        public async Task DeleteTaskBoardCategory(TaskBoardCategory category)
        {
            DeleteResult result = await _TaskBoardCategoryCollection.DeleteOneAsync(c => c.Id == category.Id);
        }
        

        /// <summary>
        /// Returns all taskboard categories that were last modified by a user
        /// </summary>
        /// <param name="userId">User Id</param>
        /// <returns>List of Task Boards categories</returns>
        public async Task<List<TaskBoardCategory>> GetTaskBoardCategoriesByModifiedUser(string userId)
        {
            return await _TaskBoardCategoryCollection.AsQueryable().Where(b => b.ModifiedBy == userId).ToListAsync();
        }
    }
}