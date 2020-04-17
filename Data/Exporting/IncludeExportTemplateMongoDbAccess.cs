using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using GoNorth.Config;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using MongoDB.Driver.Linq;

namespace GoNorth.Data.Exporting
{
    /// <summary>
    /// Include Export Template Mongo DB Access
    /// </summary>
    public class IncludeExportTemplateMongoDbAccess : BaseMongoDbAccess, IIncludeExportTemplateDbAccess
    {
        /// <summary>
        /// Collection Name of the export templates
        /// </summary>
        public const string IncludeExportTemplateCollectionName = "IncludeExportTemplate";

        /// <summary>
        /// Collection Name of the export templates recycling bin
        /// </summary>
        public const string IncludeExportTemplateRecyclingBinCollectionName = "IncludeExportTemplateRecyclingBin";

        /// <summary>
        /// Template Collection
        /// </summary>
        private IMongoCollection<IncludeExportTemplate> _TemplateCollection;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="configuration">Configuration</param>
        public IncludeExportTemplateMongoDbAccess(IOptions<ConfigurationData> configuration) : base(configuration)
        {
            _TemplateCollection = _Database.GetCollection<IncludeExportTemplate>(IncludeExportTemplateCollectionName);
        }

        /// <summary>
        /// Checks if an include template with a given name already exists
        /// </summary>
        /// <param name="projectId">Id of the project to search</param>
        /// <param name="existingId">Id of the existing template</param>
        /// <param name="name">Name to search</param>
        /// <returns>true if a different template with the same name exists, else false</returns>
        public async Task<bool> DoesIncludeTemplateExist(string projectId, string existingId, string name)
        {
            return await _TemplateCollection.Find(t => t.ProjectId == projectId && t.Id != existingId && t.Name == name).AnyAsync();
        }

        /// <summary>
        /// Returns a template by its Id
        /// </summary>
        /// <param name="id">Id of the template</param>
        /// <returns>Export Template</returns>
        public async Task<IncludeExportTemplate> GetIncludeTemplateById(string id)
        {
            IncludeExportTemplate template = await _TemplateCollection.Find(t => t.Id == id).FirstOrDefaultAsync();
            return template;
        }

        /// <summary>
        /// Returns a template by name
        /// </summary>
        /// <param name="projectId">Id of the project</param>
        /// <param name="templateName">Template name</param>
        /// <returns>Export Template</returns>
        public async Task<IncludeExportTemplate> GetIncludeTemplateByName(string projectId, string templateName)
        {
            IncludeExportTemplate template = await _TemplateCollection.Find(t => t.ProjectId == projectId && t.Name == templateName).FirstOrDefaultAsync();
            return template;
        }

        /// <summary>
        /// Returns the include templates for a project
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <param name="start">Start of the page</param>
        /// <param name="pageSize">Page size to load</param>
        /// <param name="locale">Locale used for the collation</param>
        /// <returns>List of include export templates</returns>
        public async Task<List<IncludeExportTemplate>> GetIncludeTemplates(string projectId, int start, int pageSize, string locale)
        {
            List<IncludeExportTemplate> templates = await _TemplateCollection.Find(p => p.ProjectId == projectId, new FindOptions {
                Collation = new Collation(locale, null, CollationCaseFirst.Off, CollationStrength.Primary)
            }).SortBy(p => p.Name).Skip(start).Limit(pageSize).Project(t => new IncludeExportTemplate {
                Id = t.Id,
                Name = t.Name
            }).ToListAsync();
            return templates;
        }

        /// <summary>
        /// Returns the count of include templates for a project
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <returns>Count of include templates</returns>
        public async Task<int> GetIncludeTemplatesCount(string projectId)
        {
            return await _TemplateCollection.AsQueryable().Where(t => t.ProjectId == projectId).CountAsync();
        }

        /// <summary>
        /// Creates an include template
        /// </summary>
        /// <param name="template">Template to create</param>
        /// <returns>Created template, with filled id</returns>
        public async Task<IncludeExportTemplate> CreateIncludeTemplate(IncludeExportTemplate template)
        {
            template.Id = Guid.NewGuid().ToString();

            await _TemplateCollection.InsertOneAsync(template);

            return template;
        }

        /// <summary>
        /// Updates an include template
        /// </summary>
        /// <param name="template">Template to update</param>
        /// <returns>Task</returns>
        public async Task UpdateIncludeTemplate(IncludeExportTemplate template)
        {
            ReplaceOneResult result = await _TemplateCollection.ReplaceOneAsync(t => t.Id == template.Id, template);
            if(result.MatchedCount == 0)
            {
                throw new KeyNotFoundException();
            }
        }

        /// <summary>
        /// Deletes an include template
        /// </summary>
        /// <param name="template">Template to delete</param>
        /// <returns>Task</returns>
        public async Task DeleteIncludeTemplate(IncludeExportTemplate template)
        {
            IncludeExportTemplate existingTemplate = await GetIncludeTemplateById(template.Id);
            if(existingTemplate == null)
            {
                throw new NullReferenceException();
            }

            IMongoCollection<IncludeExportTemplate> recyclingBin = _Database.GetCollection<IncludeExportTemplate>(IncludeExportTemplateRecyclingBinCollectionName);
            await recyclingBin.InsertOneAsync(existingTemplate);

            DeleteResult result = await _TemplateCollection.DeleteOneAsync(t => t.Id == template.Id);
        }

        /// <summary>
        /// Deletes all include templates of a project
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <returns>Task</returns>
        public async Task DeleteIncludeTemplatesForProject(string projectId)
        {
            await _TemplateCollection.DeleteManyAsync(t => t.ProjectId == projectId);
        }


        /// <summary>
        /// Returns all objects that were last modified by a given user
        /// </summary>
        /// <param name="userId">Id of the user</param>
        /// <returns>Objects</returns>
        public async Task<List<IncludeExportTemplate>> GetIncludeTemplatesByModifiedUser(string userId)
        {
            return await _TemplateCollection.AsQueryable().Where(t => t.ModifiedBy == userId).ToListAsync();
        }
        
        /// <summary>
        /// Returns all recycle bin objects that were last modified by a given user
        /// </summary>
        /// <param name="userId">Id of the user</param>
        /// <returns>Objects</returns>
        public async Task<List<IncludeExportTemplate>> GetRecycleBinIncludeTemplatesByModifiedUser(string userId)
        {
            IMongoCollection<IncludeExportTemplate> recyclingBin = _Database.GetCollection<IncludeExportTemplate>(IncludeExportTemplateRecyclingBinCollectionName);
            return await recyclingBin.AsQueryable().Where(t => t.ModifiedBy == userId).ToListAsync();
        }
        
        /// <summary>
        /// Resets all recycle bin objects that were last modified by a given user
        /// </summary>
        /// <param name="userId">Id of the user</param>
        /// <returns>Objects</returns>
        public async Task ResetIncludeRecycleBinExportTemplatesByModifiedUser(string userId)
        {
            IMongoCollection<IncludeExportTemplate> recyclingBin = _Database.GetCollection<IncludeExportTemplate>(IncludeExportTemplateRecyclingBinCollectionName);
            await recyclingBin.UpdateManyAsync(n => n.ModifiedBy == userId, Builders<IncludeExportTemplate>.Update.Set(n => n.ModifiedBy, Guid.Empty.ToString()).Set(n => n.ModifiedOn, DateTimeOffset.UtcNow));
        }
    }
}