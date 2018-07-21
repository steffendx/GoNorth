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
        /// <param name="templateType">Template Type</param>
        /// <returns>Customized object export templates</returns>
        public async Task<List<ExportTemplate>> GetCustomizedObjectTemplatesByType(TemplateType templateType)
        {
            List<ExportTemplate> templates = await _TemplateCollection.AsQueryable().Where(t => t.TemplateType == templateType && !string.IsNullOrEmpty(t.CustomizedObjectId)).Select(t => new ExportTemplate {
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

    }
}