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
    /// Export Template Mongo DB Access
    /// </summary>
    public class ExportTemplateMongoDbAccess : BaseMongoDbAccess, IExportTemplateDbAccess
    {
        /// <summary>
        /// Collection Name of the export templates
        /// </summary>
        public const string ExportTemplateCollectionName = "ExportTemplate";

        /// <summary>
        /// Collection Name of the export templates recycling bin
        /// </summary>
        public const string ExportTemplateRecyclingBinCollectionName = "ExportTemplateRecyclingBin";

        /// <summary>
        /// Template Collection
        /// </summary>
        private IMongoCollection<ExportTemplate> _TemplateCollection;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="configuration">Configuration</param>
        public ExportTemplateMongoDbAccess(IOptions<ConfigurationData> configuration) : base(configuration)
        {
            _TemplateCollection = _Database.GetCollection<ExportTemplate>(ExportTemplateCollectionName);
        }

        /// <summary>
        /// Returns a template by its Id
        /// </summary>
        /// <param name="id">Id of the template</param>
        /// <returns>Export Template</returns>
        public async Task<ExportTemplate> GetTemplateById(string id)
        {
            ExportTemplate template = await _TemplateCollection.Find(t => t.Id == id).FirstOrDefaultAsync();
            return template;
        }

        /// <summary>
        /// Returns all export templates by the category
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <param name="category">Template Category</param>
        /// <returns>List of export templates</returns>
        public async Task<List<ExportTemplate>> GetDefaultTemplatesByCategory(string projectId, TemplateCategory category)
        {
            List<ExportTemplate> templates = await _TemplateCollection.AsQueryable().Where(t => t.ProjectId == projectId && t.Category == category && string.IsNullOrEmpty(t.CustomizedObjectId)).Select(t => new ExportTemplate {
                Id = t.Id,
                CustomizedObjectId = t.CustomizedObjectId,
                Category = t.Category,
                TemplateType = t.TemplateType
            }).ToListAsync();
            return templates;
        }

        /// <summary>
        /// Returns the default export template by its type
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <param name="templateType">Template Type</param>
        /// <returns>Export Template, NULL if no saved template exists</returns>
        public async Task<ExportTemplate> GetDefaultTemplateByType(string projectId, TemplateType templateType)
        {
            ExportTemplate template = await _TemplateCollection.Find(t => t.ProjectId == projectId && t.TemplateType == templateType && string.IsNullOrEmpty(t.CustomizedObjectId)).FirstOrDefaultAsync();
            return template;
        }

        /// <summary>
        /// Returns the export templates that reference an include template
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <param name="includeTemplateId">Id of the include template that is searched</param>
        /// <returns>List of export templates that reference the include template</returns>
        public async Task<List<ExportTemplate>> GetTemplatesByReferencedIncludeTemplate(string projectId, string includeTemplateId)
        {
            List<ExportTemplate> templates = await _TemplateCollection.Find(t => t.ProjectId == projectId && t.UsedIncludeTemplates != null && t.UsedIncludeTemplates.Any(ui => ui.IncludeTemplateId == includeTemplateId)).ToListAsync();
            return templates;
        }

        /// <summary>
        /// Returns the export templates that reference a wrong template by name
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <param name="ignoreIncludeTemplateId">Id of the include template that is ignored in the search</param>
        /// <param name="templateName">Name of the template to search</param>
        /// <returns>List of export templates that reference the include template name by a wrong name</returns>
        public async Task<List<ExportTemplate>> GetTemplatesByWrongReferencedIncludeTemplate(string projectId, string ignoreIncludeTemplateId, string templateName)
        {
            List<ExportTemplate> templates = await _TemplateCollection.Find(t => t.ProjectId == projectId && t.UsedIncludeTemplates != null && t.UsedIncludeTemplates.Any(ui => ui.Name == templateName && ui.IncludeTemplateId != ignoreIncludeTemplateId)).ToListAsync();
            return templates;
        }

        /// <summary>
        /// Returns the customized export template by the object id
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <param name="customizedObjectId">Customized object id</param>
        /// <returns>Export Template, NULL if no template exists</returns>
        public async Task<ExportTemplate> GetTemplateByCustomizedObjectId(string projectId, string customizedObjectId)
        {
            ExportTemplate template = await _TemplateCollection.Find(t => t.ProjectId == projectId && t.CustomizedObjectId == customizedObjectId).FirstOrDefaultAsync();
            return template;
        }

        
        /// <summary>
        /// Returns all export templates for a template type which are associated to an object
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <param name="templateType">Template Type</param>
        /// <returns>Customized object export templates</returns>
        public async Task<List<ExportTemplate>> GetCustomizedObjectTemplatesByType(string projectId, TemplateType templateType)
        {
            List<ExportTemplate> templates = await _TemplateCollection.AsQueryable().Where(t => t.TemplateType == templateType && t.ProjectId == projectId && !string.IsNullOrEmpty(t.CustomizedObjectId)).Select(t => new ExportTemplate {
                Id = t.Id,
                CustomizedObjectId = t.CustomizedObjectId,
                TemplateType = t.TemplateType,
                Category = t.Category
            }).ToListAsync();

            return templates;
        }

        /// <summary>
        /// Creates a template
        /// </summary>
        /// <param name="template">Template to create</param>
        /// <returns>Created template, with filled id</returns>
        public async Task<ExportTemplate> CreateTemplate(ExportTemplate template)
        {
            template.Id = Guid.NewGuid().ToString();

            await _TemplateCollection.InsertOneAsync(template);

            return template;
        }

        /// <summary>
        /// Updates a template
        /// </summary>
        /// <param name="template">Template to update</param>
        /// <returns>Task</returns>
        public async Task UpdateTemplate(ExportTemplate template)
        {
            ReplaceOneResult result = await _TemplateCollection.ReplaceOneAsync(t => t.Id == template.Id, template);
            if(result.MatchedCount == 0)
            {
                throw new KeyNotFoundException();
            }
        }

        /// <summary>
        /// Deletes a template
        /// </summary>
        /// <param name="template">Template to delete</param>
        /// <returns>Task</returns>
        public async Task DeleteTemplate(ExportTemplate template)
        {
            ExportTemplate existingTemplate = await GetTemplateById(template.Id);
            if(existingTemplate == null)
            {
                throw new NullReferenceException();
            }

            IMongoCollection<ExportTemplate> recyclingBin = _Database.GetCollection<ExportTemplate>(ExportTemplateRecyclingBinCollectionName);
            await recyclingBin.InsertOneAsync(existingTemplate);

            DeleteResult result = await _TemplateCollection.DeleteOneAsync(t => t.Id == template.Id);
        }

        /// <summary>
        /// Deletes all templates of a project
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <returns>Task</returns>
        public async Task DeleteTemplatesForProject(string projectId)
        {
            await _TemplateCollection.DeleteManyAsync(t => t.ProjectId == projectId);
        }


        /// <summary>
        /// Returns all objects that were last modified by a given user
        /// </summary>
        /// <param name="userId">Id of the user</param>
        /// <returns>Objects</returns>
        public async Task<List<ExportTemplate>> GetExportTemplatesByModifiedUser(string userId)
        {
            return await _TemplateCollection.AsQueryable().Where(t => t.ModifiedBy == userId).ToListAsync();
        }
        
        /// <summary>
        /// Returns all recycle bin objects that were last modified by a given user
        /// </summary>
        /// <param name="userId">Id of the user</param>
        /// <returns>Objects</returns>
        public async Task<List<ExportTemplate>> GetRecycleBinExportTemplatesByModifiedUser(string userId)
        {
            IMongoCollection<ExportTemplate> recyclingBin = _Database.GetCollection<ExportTemplate>(ExportTemplateRecyclingBinCollectionName);
            return await recyclingBin.AsQueryable().Where(t => t.ModifiedBy == userId).ToListAsync();
        }
        
        /// <summary>
        /// Resets all recycle bin objects that were last modified by a given user
        /// </summary>
        /// <param name="userId">Id of the user</param>
        /// <returns>Objects</returns>
        public async Task ResetRecycleBinExportTemplatesByModifiedUser(string userId)
        {
            IMongoCollection<ExportTemplate> recyclingBin = _Database.GetCollection<ExportTemplate>(ExportTemplateRecyclingBinCollectionName);
            await recyclingBin.UpdateManyAsync(n => n.ModifiedBy == userId, Builders<ExportTemplate>.Update.Set(n => n.ModifiedBy, Guid.Empty.ToString()).Set(n => n.ModifiedOn, DateTimeOffset.UtcNow));
        }
    }
}