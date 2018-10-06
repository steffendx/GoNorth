using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using GoNorth.Config;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using MongoDB.Driver.Linq;

namespace GoNorth.Data.Project
{
    /// <summary>
    /// Project Mongo DB Access
    /// </summary>
    public class ProjectMongoDbAccess : BaseMongoDbAccess, IProjectDbAccess
    {
        /// <summary>
        /// Collection Name of the projects
        /// </summary>
        public const string ProjectCollectionName = "Project";

        /// <summary>
        /// Project Collection
        /// </summary>
        private IMongoCollection<GoNorthProject> _ProjectCollection;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="configuration">Configuration</param>
        public ProjectMongoDbAccess(IOptions<ConfigurationData> configuration) : base(configuration)
        {
            _ProjectCollection = _Database.GetCollection<GoNorthProject>(ProjectCollectionName);
        }

        /// <summary>
        /// Creates a new project
        /// </summary>
        /// <param name="project">Project to create</param>
        /// <returns>Created project, with filled id</returns>
        public async Task<GoNorthProject> CreateProject(GoNorthProject project)
        {
            if(project.IsDefault)
            {
                await SetAllProjectsAsNonDefault();
            }

            project.Id = Guid.NewGuid().ToString();
            await _ProjectCollection.InsertOneAsync(project);

            return project;
        }

        /// <summary>
        /// Gets a project by it Id
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <returns>Project</returns>
        public async Task<GoNorthProject> GetProjectById(string projectId)
        {
            GoNorthProject project = await _ProjectCollection.Find(p => p.Id == projectId).FirstOrDefaultAsync();
            return project;
        }

        /// <summary>
        /// Returns all projects
        /// </summary>
        /// <returns>Projects</returns>
        public async Task<List<GoNorthProject>> GetProjects()
        {
            List<GoNorthProject> projects = await _ProjectCollection.AsQueryable().ToListAsync();
            return projects;
        }

        /// <summary>
        /// Gets the default project
        /// </summary>
        /// <returns>Default project</returns>
        public async Task<GoNorthProject> GetDefaultProject()
        {
            GoNorthProject project = await _ProjectCollection.Find(p => p.IsDefault).FirstOrDefaultAsync();
            return project;
        }

        /// <summary>
        /// Updates a project
        /// </summary>
        /// <param name="project">Project</param>
        /// <returns>Task</returns>
        public async Task UpdateProject(GoNorthProject project)
        {
            if(project.IsDefault)
            {
                await SetAllProjectsAsNonDefault();
            }
            ReplaceOneResult result = await _ProjectCollection.ReplaceOneAsync(p => p.Id == project.Id, project);
        }

        /// <summary>
        /// Deletes a project
        /// </summary>
        /// <param name="project">Project</param>
        /// <returns>Task</returns>
        public async Task DeleteProject(GoNorthProject project)
        {
            DeleteResult result = await _ProjectCollection.DeleteOneAsync(p => p.Id == project.Id);
        }

        /// <summary>
        /// Sets all projects as non default
        /// </summary>
        /// <returns>Task</returns>
        private async Task SetAllProjectsAsNonDefault()
        {
            await _ProjectCollection.UpdateManyAsync(FilterDefinition<GoNorthProject>.Empty, Builders<GoNorthProject>.Update.Set(p => p.IsDefault, false));
        }
    }
}