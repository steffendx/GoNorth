using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using GoNorth.Data.Evne;
using GoNorth.Data.Exporting;
using GoNorth.Data.FlexFieldDatabase;
using GoNorth.Data.Kortisto;
using GoNorth.Data.Project;
using GoNorth.Data.Styr;
using GoNorth.Data.Tale;
using GoNorth.Data.User;
using GoNorth.Extensions;
using GoNorth.Services.Export;
using GoNorth.Services.Export.Json;
using GoNorth.Services.Export.Script;
using GoNorth.Services.Export.Placeholder;
using GoNorth.Services.Timeline;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Localization;
using Microsoft.Extensions.Logging;
using GoNorth.Services.Export.LanguageExport;

namespace GoNorth.Controllers.Api
{
    /// <summary>
    /// Export Api controller
    /// </summary>
    [Authorize(Roles = RoleNames.ExportObjects)]
    [Route("/api/[controller]/[action]")]
    public class ExportApiController : Controller
    {
        /// <summary>
        /// Translated Template Category
        /// </summary>
        public class TranslatedTemplateCategory
        {
            /// <summary>
            /// Template Category
            /// </summary>
            public TemplateCategory Category { get; set; }

            /// <summary>
            /// Label of the Category
            /// </summary>
            public string Label { get; set; }
        }

        /// <summary>
        /// Translated Export Template
        /// </summary>
        public class TranslatedExportTemplate
        {
            /// <summary>
            /// Export Template
            /// </summary>
            public ExportTemplate Template { get; set; }

            /// <summary>
            /// Label of the Tempalte
            /// </summary>
            public string Label { get; set; }
        };

        /// <summary>
        /// Object Export Template return value
        /// </summary>
        public class ObjectExportTemplate
        {
            /// <summary>
            /// true if the default template code was loaded because no customized template exists
            /// </summary>
            public bool IsDefaultCode { get; set; }

            /// <summary>
            /// Export Template Data
            /// </summary>
            public TranslatedExportTemplate ExportTemplate { get; set; }
        }

        /// <summary>
        /// Object Template Exists Check Result
        /// </summary>
        public class ObjectTemplateExistsResult
        {
            /// <summary>
            /// Flag indicating if a template exists or not
            /// </summary>
            public bool DoesTemplateExist { get; set; }
        }

        /// <summary>
        /// Object using a template query result
        /// </summary>
        public class ObjectUsingTemplate
        {
            /// <summary>
            /// Object Id
            /// </summary>
            public string ObjectId { get; set; }

            /// <summary>
            /// true if the object is a template, else false
            /// </summary>
            public bool IsObjectTemplate { get; set; }

            /// <summary>
            /// Object name
            /// </summary>
            public string ObjectName { get; set; }
        }
            
        /// <summary>
        /// Result of an export template by object id query
        /// </summary>
        private class ExportTemplateByObjectIdResult
        {
            /// <summary>
            /// Found Template
            /// </summary>
            public ExportTemplate Template { get; set; }

            /// <summary>
            /// True if its a default template, false if a customized template exists
            /// </summary>
            public bool IsDefault { get; set; }
        }

        /// <summary>
        /// Export Default Template Provider
        /// </summary>
        private readonly IExportDefaultTemplateProvider _defaultTemplateProvider;

        /// <summary>
        /// Export Template Db Access
        /// </summary>
        private readonly IExportTemplateDbAccess _exportTemplateDbAccess;

        /// <summary>
        /// Export Settings Db Access
        /// </summary>
        private readonly IExportSettingsDbAccess _exportSettingsDbAccess;

        /// <summary>
        /// Project Db Access
        /// </summary>
        private readonly IProjectDbAccess _projectDbAccess;

        /// <summary>
        /// Npc Db Access
        /// </summary>
        private readonly IKortistoNpcDbAccess _npcDbAccess; 
        
        /// <summary>
        /// Npc Template Db Access
        /// </summary>
        private readonly IKortistoNpcTemplateDbAccess _npcTemplateDbAccess;

        /// <summary>
        /// Dialog Db Access
        /// </summary>
        private readonly ITaleDbAccess _dialogDbAccess;

        /// <summary>
        /// Item Db Access
        /// </summary>
        private readonly IStyrItemDbAccess _itemDbAccess; 
        
        /// <summary>
        /// Item Template Db Access
        /// </summary>
        private readonly IStyrItemTemplateDbAccess _itemTemplateDbAccess;

        /// <summary>
        /// Skill Db Access
        /// </summary>
        private readonly IEvneSkillDbAccess _skillDbAccess; 
        
        /// <summary>
        /// Skill Template Db Access
        /// </summary>
        private readonly IEvneSkillTemplateDbAccess _skillTemplateDbAccess;

        /// <summary>
        /// Template Placeholder Resolver
        /// </summary>
        private readonly IExportTemplatePlaceholderResolver _templatePlaceholderResolver;

        /// <summary>
        /// Dialog Function Generation Condition Provider
        /// </summary>
        private readonly IDialogFunctionGenerationConditionProvider _dialogFunctionGenerationConditionProvider;

        /// <summary>
        /// Dialog Function Db Access
        /// </summary>
        private readonly IDialogFunctionGenerationConditionDbAccess _dialogFunctionDbAccess;

        /// <summary>
        /// Language Key Db Access
        /// </summary>
        private readonly ILanguageKeyDbAccess _languageKeyDbAccess;

        /// <summary>
        /// Timeline Service
        /// </summary>
        private readonly ITimelineService _timelineService;

        /// <summary>
        /// User Manager
        /// </summary>
        private readonly UserManager<GoNorthUser> _userManager;

        /// <summary>
        /// Logger
        /// </summary>
        private readonly ILogger<ExportApiController> _logger;

        /// <summary>
        /// Localizer
        /// </summary>
        private readonly IStringLocalizer _localizer;

        /// <summary>
        /// Exporters
        /// </summary>
        private readonly Dictionary<string, IObjectExporter> _exporters;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="defaultTemplateProvider">Default Template Provider</param>
        /// <param name="exportTemplateDbAccess">Export Template Db Access</param>
        /// <param name="exportSettingsDbAccess">Export Settings Db Access</param>
        /// <param name="projectDbAccess">Project Db Access</param>
        /// <param name="npcDbAccess">Npc Db Access</param>
        /// <param name="npcTemplateDbAccess">Npc Template Db Access</param>
        /// <param name="dialogDbAccess">Dialog Db Access</param>
        /// <param name="itemDbAccess">Item Db Access</param>
        /// <param name="itemTemplateDbAccess">Item Template Db Access</param>
        /// <param name="skillDbAccess">Skill Db Access</param>
        /// <param name="skillTemplateDbAccess">Skill Template Db Access</param>
        /// <param name="templatePlaceholderResolver">Template Placeholder Resolver</param>
        /// <param name="dialogFunctionDbAccess">Dialog Function Db Access</param>
        /// <param name="dialogFunctionGenerationConditionProvider">Dialog Function Generation Condition Provider</param>
        /// <param name="languageKeyDbAccess">Language Key Db Access</param>
        /// <param name="timelineService">Timeline Service</param>
        /// <param name="userManager">User Manager</param>
        /// <param name="logger">Logger</param>
        /// <param name="localizerFactory">Localizer Factory</param>
        public ExportApiController(IExportDefaultTemplateProvider defaultTemplateProvider, IExportTemplateDbAccess exportTemplateDbAccess, IExportSettingsDbAccess exportSettingsDbAccess, IProjectDbAccess projectDbAccess, 
                                   IKortistoNpcDbAccess npcDbAccess, IKortistoNpcTemplateDbAccess npcTemplateDbAccess, ITaleDbAccess dialogDbAccess, IStyrItemDbAccess itemDbAccess, IStyrItemTemplateDbAccess itemTemplateDbAccess, 
                                   IEvneSkillDbAccess skillDbAccess, IEvneSkillTemplateDbAccess skillTemplateDbAccess, IExportTemplatePlaceholderResolver templatePlaceholderResolver, IDialogFunctionGenerationConditionDbAccess dialogFunctionDbAccess,
                                   IDialogFunctionGenerationConditionProvider dialogFunctionGenerationConditionProvider, ILanguageKeyDbAccess languageKeyDbAccess, ITimelineService timelineService, UserManager<GoNorthUser> userManager, ILogger<ExportApiController> logger, 
                                   IStringLocalizerFactory localizerFactory) 
        {
            _defaultTemplateProvider = defaultTemplateProvider;
            _exportTemplateDbAccess = exportTemplateDbAccess;
            _exportSettingsDbAccess = exportSettingsDbAccess;
            _projectDbAccess = projectDbAccess;
            _npcDbAccess = npcDbAccess;
            _npcTemplateDbAccess = npcTemplateDbAccess;
            _dialogDbAccess = dialogDbAccess;
            _itemDbAccess = itemDbAccess;
            _itemTemplateDbAccess = itemTemplateDbAccess;
            _skillDbAccess = skillDbAccess;
            _skillTemplateDbAccess = skillTemplateDbAccess;
            _templatePlaceholderResolver = templatePlaceholderResolver;
            _dialogFunctionDbAccess = dialogFunctionDbAccess;
            _dialogFunctionGenerationConditionProvider = dialogFunctionGenerationConditionProvider;
            _languageKeyDbAccess = languageKeyDbAccess;
            _timelineService = timelineService;
            _userManager = userManager;
            _logger = logger;
            _localizer = localizerFactory.Create(this.GetType());

            _exporters = new Dictionary<string, IObjectExporter>();
            _exporters.Add("script", new ScriptExporter(templatePlaceholderResolver, projectDbAccess, exportSettingsDbAccess));
            _exporters.Add("json", new JsonExporter());
            _exporters.Add("languagefile", new LanguageExporter(templatePlaceholderResolver, defaultTemplateProvider, projectDbAccess, exportSettingsDbAccess));
        }

        /// <summary>
        /// Returns the template categories
        /// </summary>
        /// <returns>Result</returns>
        [Produces(typeof(List<TranslatedTemplateCategory>))]
        [Authorize(Roles = RoleNames.ManageExportTemplates)]
        [HttpGet]
        public IActionResult GetTemplateCategories()
        {
            List<TranslatedTemplateCategory> templateCategories = new List<TranslatedTemplateCategory>();

            Array categories = Enum.GetValues(typeof(TemplateCategory));
            foreach(object category in categories)
            {
                TranslatedTemplateCategory translatedCategory = new TranslatedTemplateCategory();
                translatedCategory.Category = (TemplateCategory)category;
                translatedCategory.Label = _localizer["TemplateCategory" + translatedCategory.Category.ToString()].Value;
                templateCategories.Add(translatedCategory);
            }

            return Ok(templateCategories);
        }

        /// <summary>
        /// Returns the default templates for a category
        /// </summary>
        /// <param name="category">Category to query</param>
        /// <returns>Default Templates by Category</returns>
        [Produces(typeof(List<TranslatedExportTemplate>))]
        [Authorize(Roles = RoleNames.ManageExportTemplates)]
        [HttpGet]
        public async Task<IActionResult> GetDefaultTemplatesByCategory(TemplateCategory category)
        {
            GoNorthProject project = await _projectDbAccess.GetDefaultProject();

            List<ExportTemplate> templates = await _defaultTemplateProvider.GetDefaultTemplatesByCategory(project.Id, category);
            return Ok(templates.Select(t => TranslateTemplateLabel(t)).ToList());
        }

        /// <summary>
        /// Returns the default template for a template type
        /// </summary>
        /// <param name="templateType">Default Template Type</param>
        /// <returns>Default Template</returns>
        [Produces(typeof(TranslatedExportTemplate))]
        [Authorize(Roles = RoleNames.ManageExportTemplates)]
        [HttpGet]
        public async Task<IActionResult> GetDefaultTemplateByType(TemplateType templateType)
        {
            GoNorthProject project = await _projectDbAccess.GetDefaultProject();

            ExportTemplate template = await _defaultTemplateProvider.GetDefaultTemplateByType(project.Id, templateType);
            return Ok(TranslateTemplateLabel(template));
        }

        /// <summary>
        /// Returns if an export template exists for an object id
        /// </summary>
        /// <param name="id">Id of the object for which to check the export template</param>
        /// <returns>Object indicating if an export template exists or not</returns>
        [Produces(typeof(ObjectTemplateExistsResult))]
        [Authorize(Roles = RoleNames.Kortisto + "," + RoleNames.Evne + "," + RoleNames.Styr)]
        [HttpGet]
        public async Task<IActionResult> DoesExportTemplateExistForObjectId(string id)
        {
            GoNorthProject project = await _projectDbAccess.GetDefaultProject();
            ExportTemplate template = await _exportTemplateDbAccess.GetTemplateByCustomizedObjectId(project.Id, id);
            ObjectTemplateExistsResult result = new ObjectTemplateExistsResult();
            result.DoesTemplateExist = template != null;

            return Ok(result);
        }

        /// <summary>
        /// Returns the export template by its object id
        /// </summary>
        /// <param name="id">Id of the object for which to read the export template</param>
        /// <param name="templateType">Template Type</param>
        /// <returns>Export Template, Default Template for the export type if no overwritten template exists</returns>
        [Produces(typeof(ObjectExportTemplate))]
        [Authorize(Roles = RoleNames.ManageExportTemplates)]
        [HttpGet]
        public async Task<IActionResult> GetExportTemplateByObjectId(string id, TemplateType templateType)
        {
            ExportTemplateByObjectIdResult template = await GetValidExportTemplateByIdAndType(id, templateType);
            
            ObjectExportTemplate exportTemplate = new ObjectExportTemplate();
            exportTemplate.IsDefaultCode = template.IsDefault;
            exportTemplate.ExportTemplate = TranslateTemplateLabel(template.Template);
            string objectName = await GetObjectNameByType(id, templateType);

            if(!string.IsNullOrEmpty(objectName))
            {
                exportTemplate.ExportTemplate.Label = objectName + " (" + exportTemplate.ExportTemplate.Label + ")";
            }

            return Ok(exportTemplate);
        }

        /// <summary>
        /// Returns the object name by type
        /// </summary>
        /// <param name="id">Id of the obejct</param>
        /// <param name="templateType">Template Type</param>
        /// <returns>Object Name</returns>
        private async Task<string> GetObjectNameByType(string id, TemplateType templateType)
        {
            if(templateType == TemplateType.ObjectNpc)
            {
                return await GetObjectName(id, _npcDbAccess, _npcTemplateDbAccess);
            }
            else if(templateType == TemplateType.ObjectItem)
            {
                return await GetObjectName(id, _itemDbAccess, _itemTemplateDbAccess);
            }
            else if(templateType == TemplateType.ObjectSkill)
            {
                return await GetObjectName(id, _skillDbAccess, _skillTemplateDbAccess);
            }

            return string.Empty;
        }

        /// <summary>
        /// Returns the valid export template by object id and template type
        /// </summary>
        /// <param name="id">Object Id</param>
        /// <param name="templateType">Template Type</param>
        /// <returns>Valid Export Template</returns>
        private async Task<ExportTemplateByObjectIdResult> GetValidExportTemplateByIdAndType(string id, TemplateType templateType)
        {
            ExportTemplateByObjectIdResult result = new ExportTemplateByObjectIdResult();
            result.IsDefault = false;

            GoNorthProject project = await _projectDbAccess.GetDefaultProject();

            ExportTemplate template = await _exportTemplateDbAccess.GetTemplateByCustomizedObjectId(project.Id, id);

            if(template == null)
            {
                result.IsDefault = true;

                FlexFieldObject flexFieldObject = null;
                if(templateType == TemplateType.ObjectNpc)
                {
                    flexFieldObject = await _npcDbAccess.GetFlexFieldObjectById(id);
                }
                else if(templateType == TemplateType.ObjectItem)
                {
                    flexFieldObject = await _itemDbAccess.GetFlexFieldObjectById(id);
                }
                else if(templateType == TemplateType.ObjectSkill)
                {
                    flexFieldObject = await _skillDbAccess.GetFlexFieldObjectById(id);
                }

                if(flexFieldObject != null)
                {
                    template = await _exportTemplateDbAccess.GetTemplateByCustomizedObjectId(project.Id, flexFieldObject.TemplateId);
                }

                if(template == null)
                {
                    template = await _defaultTemplateProvider.GetDefaultTemplateByType(project.Id, templateType);
                }
            }

            result.Template = template;
            return result;
        }

        /// <summary>
        /// Returns the object name for an id
        /// </summary>
        /// <param name="id">Id of the object</param>
        /// <param name="objectDbAccess">Object Db Access</param>
        /// <param name="templateDbAccess">Template Db Access</param>
        /// <typeparam name="T">Type of the object</typeparam>
        /// <returns>Name of the object</returns>
        private async Task<string> GetObjectName<T>(string id, IFlexFieldObjectDbAccess<T> objectDbAccess, IFlexFieldObjectDbAccess<T> templateDbAccess) where T : FlexFieldObject
        {
            T template = await templateDbAccess.GetFlexFieldObjectById(id);
            if(template != null)
            {
                return template.Name;
            }

            T obj = await objectDbAccess.GetFlexFieldObjectById(id);
            if(obj != null)
            {
                return obj.Name;
            }

            return string.Empty;
        }

        /// <summary>
        /// Translates an export template label
        /// </summary>
        /// <param name="template">Template to translate</param>
        /// <returns>Translated export template</returns>
        private TranslatedExportTemplate TranslateTemplateLabel(ExportTemplate template)
        {
            if(template == null)
            {
                return null;
            }

            TranslatedExportTemplate translatedTemplate = new TranslatedExportTemplate();
            translatedTemplate.Template = template;
            translatedTemplate.Label = _localizer["TemplateType" + template.TemplateType];
            
            return translatedTemplate;
        }

        /// <summary>
        /// Saves a default export template
        /// </summary>
        /// <param name="templateType">Template Type</param>
        /// <param name="code">Code to save</param>
        /// <returns>Result</returns>
        [Produces(typeof(ExportTemplate))]
        [Authorize(Roles = RoleNames.ManageExportTemplates)]
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> SaveDefaultExportTemplate(TemplateType templateType, [FromBody]string code)
        {
            GoNorthProject project = await _projectDbAccess.GetDefaultProject();

            ExportTemplate template = await _defaultTemplateProvider.GetDefaultTemplateByType(project.Id, templateType);
            template = await SaveExportTemplate(project, template, code);

            await _timelineService.AddTimelineEntry(TimelineEvent.ExportDefaultTemplateUpdated, ((int)templateType).ToString());

            return Ok(template);
        }

        /// <summary>
        /// Saves an export template by its related object id
        /// </summary>
        /// <param name="id">Id of the object</param>
        /// <param name="templateType">Template Type</param>
        /// <param name="code">Code to save</param>
        /// <returns>Result</returns>
        [Produces(typeof(ExportTemplate))]
        [Authorize(Roles = RoleNames.ManageExportTemplates)]
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> SaveExportTemplateByObjectId(string id, TemplateType templateType, [FromBody]string code)
        {
            GoNorthProject project = await _projectDbAccess.GetDefaultProject();

            ExportTemplate template = await _exportTemplateDbAccess.GetTemplateByCustomizedObjectId(project.Id, id);
            if(template == null)
            {
                template = await _defaultTemplateProvider.GetDefaultTemplateByType(project.Id, templateType);

                template.Id = string.Empty;
                template.CustomizedObjectId = id;
            }
            template = await SaveExportTemplate(project, template, code);

            await _timelineService.AddTimelineEntry(TimelineEvent.ExportObjectTemplateUpdated, ((int)templateType).ToString(), id);

            return Ok(template);
        }

        /// <summary>
        /// Saves an export template
        /// </summary>
        /// <param name="project">Project</param>
        /// <param name="template">Template to save</param>
        /// <param name="code">Code to save</param>
        /// <returns>Updated Template</returns>
        private async Task<ExportTemplate> SaveExportTemplate(GoNorthProject project, ExportTemplate template, string code)
        {
            template.ProjectId = project.Id;

            template.Code = code;
            
            await this.SetModifiedData(_userManager, template);

            if(string.IsNullOrEmpty(template.Id))
            {
                template = await _exportTemplateDbAccess.CreateTemplate(template);
            }
            else
            {
                await _exportTemplateDbAccess.UpdateTemplate(template);
            }

            _logger.LogInformation("Template was updated");

            return template;
        }

        /// <summary>
        /// Deletes an export template by its related object id
        /// </summary>
        /// <param name="id">Id of the object</param>
        /// <returns>Result</returns>
        [Produces(typeof(string))]
        [Authorize(Roles = RoleNames.ManageExportTemplates)]
        [HttpDelete]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteExportTemplateByObjectId(string id)
        {
            GoNorthProject project = await _projectDbAccess.GetDefaultProject();

            ExportTemplate template = await _exportTemplateDbAccess.GetTemplateByCustomizedObjectId(project.Id, id);
            if(template == null)
            {
                return StatusCode((int)HttpStatusCode.NotFound);
            }

            await _exportTemplateDbAccess.DeleteTemplate(template);
            
            await _timelineService.AddTimelineEntry(TimelineEvent.ExportObjectTemplateDeleted);

            return Ok(id);
        }


        /// <summary>
        /// Returns the export settings
        /// </summary>
        /// <returns>Result</returns>
        [Produces(typeof(ExportSettings))]
        [Authorize(Roles = RoleNames.ManageExportTemplates)]
        [HttpGet]
        public async Task<IActionResult> GetExportSettings()
        {
            GoNorthProject project = await _projectDbAccess.GetDefaultProject();
            ExportSettings loadedExportSettings = await _exportSettingsDbAccess.GetExportSettings(project.Id);

            return Ok(loadedExportSettings);
        }

        /// <summary>
        /// Saves the export settings
        /// </summary>
        /// <param name="exportSettings">Export Settings</param>
        /// <returns>Result</returns>
        [Authorize(Roles = RoleNames.ManageExportTemplates)]
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> SaveExportSettings([FromBody]ExportSettings exportSettings)
        {
            GoNorthProject project = await _projectDbAccess.GetDefaultProject();
            ExportSettings loadedExportSettings = await _exportSettingsDbAccess.GetExportSettings(project.Id);

            loadedExportSettings.ScriptExtension = exportSettings.ScriptExtension;
            loadedExportSettings.ScriptLanguage = exportSettings.ScriptLanguage;
            loadedExportSettings.EscapeCharacter = exportSettings.EscapeCharacter;
            loadedExportSettings.CharactersNeedingEscaping = exportSettings.CharactersNeedingEscaping;
            loadedExportSettings.NewlineCharacter = exportSettings.NewlineCharacter;

            loadedExportSettings.LanguageFileExtension = exportSettings.LanguageFileExtension;
            loadedExportSettings.LanguageFileLanguage = exportSettings.LanguageFileLanguage;
            loadedExportSettings.LanguageEscapeCharacter = exportSettings.LanguageEscapeCharacter;
            loadedExportSettings.LanguageCharactersNeedingEscaping = exportSettings.LanguageCharactersNeedingEscaping;
            loadedExportSettings.LanguageNewlineCharacter = exportSettings.LanguageNewlineCharacter;

            await this.SetModifiedData(_userManager, loadedExportSettings);

            await _exportSettingsDbAccess.SaveExportSettings(project.Id, loadedExportSettings);

            await _timelineService.AddTimelineEntry(TimelineEvent.ExportSettingsUpdated);

            return Ok();
        }


        /// <summary>
        /// Returns the dialog function generation conditions
        /// </summary>
        /// <returns>Result</returns>
        [Produces(typeof(DialogFunctionGenerationConditionCollection))]
        [Authorize(Roles = RoleNames.ManageExportTemplates)]
        [HttpGet]
        public async Task<IActionResult> GetDialogFunctionGenerationConditions()
        {
            GoNorthProject project = await _projectDbAccess.GetDefaultProject();
            DialogFunctionGenerationConditionCollection dialogFunctionGenerationConditionCollection = await _dialogFunctionGenerationConditionProvider.GetDialogFunctionGenerationConditions(project.Id);

            return Ok(dialogFunctionGenerationConditionCollection);
        }

        /// <summary>
        /// Saves the dialog function generation conditions
        /// </summary>
        /// <param name="functionGenerationConditionCollection">Function Generation Condition Collection</param>
        /// <returns>Result</returns>
        [Authorize(Roles = RoleNames.ManageExportTemplates)]
        [HttpPost]
        public async Task<IActionResult> SaveDialogFunctionGenerationConditions([FromBody]DialogFunctionGenerationConditionCollection functionGenerationConditionCollection)
        {
            GoNorthProject project = await _projectDbAccess.GetDefaultProject();

            await this.SetModifiedData(_userManager, functionGenerationConditionCollection);

            await _dialogFunctionDbAccess.SaveDialogFunctionGenerationCondition(project.Id, functionGenerationConditionCollection);

            await _timelineService.AddTimelineEntry(TimelineEvent.ExportDialogFunctionGenerationConditionsUpdated);

            return Ok();
        }


        /// <summary>
        /// Returns the customized export templates for objects for a template type
        /// </summary>
        /// <param name="templateType">Template Type</param>
        /// <returns>Result</returns>
        [Produces(typeof(List<ExportTemplate>))]
        [Authorize(Roles = RoleNames.ManageExportTemplates)]
        [HttpGet]
        public async Task<IActionResult> GetCustomizedTemplatesByType(TemplateType templateType)
        {
            List<ExportTemplate> exportTemplates = await _exportTemplateDbAccess.GetCustomizedObjectTemplatesByType(templateType);
            List<ObjectUsingTemplate> objectsUsingTemplate = new List<ObjectUsingTemplate>();

            if(templateType == TemplateType.ObjectNpc)
            {
                objectsUsingTemplate = await GetObjectsUsingTemplates(exportTemplates, _npcDbAccess, _npcTemplateDbAccess);
            }
            else if(templateType == TemplateType.ObjectItem)
            {
                objectsUsingTemplate = await GetObjectsUsingTemplates(exportTemplates, _itemDbAccess, _itemTemplateDbAccess);
            }
            else if(templateType == TemplateType.ObjectSkill)
            {
                objectsUsingTemplate = await GetObjectsUsingTemplates(exportTemplates, _skillDbAccess, _skillTemplateDbAccess);
            }

            return Ok(objectsUsingTemplate);
        }

        /// <summary>
        /// Returns the object name for an id
        /// </summary>
        /// <param name="exportTemplates">Id of the object</param>
        /// <param name="objectDbAccess">Object Db Access</param>
        /// <param name="templateDbAccess">Template Db Access</param>
        /// <typeparam name="T">Type of the object</typeparam>
        /// <returns>Objects using template</returns>
        private async Task<List<ObjectUsingTemplate>> GetObjectsUsingTemplates<T>(List<ExportTemplate> exportTemplates, IFlexFieldObjectDbAccess<T> objectDbAccess, IFlexFieldObjectDbAccess<T> templateDbAccess) where T : FlexFieldObject
        {
            List<string> objectIds = exportTemplates.Select(t => t.CustomizedObjectId).ToList();
            List<T> templateNames = await templateDbAccess.ResolveFlexFieldObjectNames(objectIds);
            List<ObjectUsingTemplate> objectsUsingTemplate = templateNames.Select(o => new ObjectUsingTemplate {
                ObjectId = o.Id,
                IsObjectTemplate = true,
                ObjectName = o.Name
            }).ToList();

            List<string> objectIdsWithoutTemplate = objectIds.Where(i => !objectsUsingTemplate.Any(ou => ou.ObjectId == i)).ToList();
            if(objectIdsWithoutTemplate != null && objectIdsWithoutTemplate.Count > 0)
            {
                List<T> objectNames = await objectDbAccess.ResolveFlexFieldObjectNames(objectIdsWithoutTemplate);
                objectsUsingTemplate.AddRange(objectNames.Select(o => new ObjectUsingTemplate {
                    ObjectId = o.Id,
                    IsObjectTemplate = false,
                    ObjectName = o.Name
                }).ToList());
            }

            return objectsUsingTemplate;
        }

        /// <summary>
        /// Returns the customized export templates for objects for a template type
        /// </summary>
        /// <param name="customizedObjectId">Customized object id</param>
        /// <param name="templateType">Template Type</param>
        /// <returns>Result</returns>
        [Produces(typeof(List<ObjectUsingTemplate>))]
        [Authorize(Roles = RoleNames.ManageExportTemplates)]
        [HttpGet]
        public async Task<IActionResult> GetCustomizedTemplatesByParentObject(string customizedObjectId, TemplateType templateType)
        {
            List<ExportTemplate> exportTemplates = await _exportTemplateDbAccess.GetCustomizedObjectTemplatesByType(templateType);
            List<FlexFieldObject> childObjects = new List<FlexFieldObject>();
            if(templateType == TemplateType.ObjectNpc)
            {
                childObjects = (await _npcDbAccess.GetFlexFieldObjectsByTemplate(customizedObjectId)).Cast<FlexFieldObject>().ToList();
            }
            else if(templateType == TemplateType.ObjectItem)
            {
                childObjects = (await _itemDbAccess.GetFlexFieldObjectsByTemplate(customizedObjectId)).Cast<FlexFieldObject>().ToList();
            }
            else if(templateType == TemplateType.ObjectSkill)
            {
                childObjects = (await _skillDbAccess.GetFlexFieldObjectsByTemplate(customizedObjectId)).Cast<FlexFieldObject>().ToList();
            }

            List<ObjectUsingTemplate> objectsUsingTemplate = childObjects.Where(c => exportTemplates.Any(t => t.CustomizedObjectId == c.Id)).Select(c => new ObjectUsingTemplate {
                ObjectId = c.Id,
                ObjectName = c.Name,
                IsObjectTemplate = false
            }).ToList();

            return Ok(objectsUsingTemplate);
        }


        /// <summary>
        /// Returns the possible placeholders for a template type
        /// </summary>
        /// <param name="templateType">Template Type</param>
        /// <returns>Result</returns>
        [Produces(typeof(List<ExportTemplatePlaceholder>))]
        [Authorize(Roles = RoleNames.ManageExportTemplates)]
        [HttpGet]
        public IActionResult GetTemplatePlaceholders(TemplateType templateType)
        {
            List<ExportTemplatePlaceholder> placeholders = _templatePlaceholderResolver.GetExportTemplatePlaceholdersForType(templateType);

            return Ok(placeholders);
        } 


        /// <summary>
        /// Exports an object
        /// </summary>
        /// <param name="exportFormat">Format to export (Script, JSON or LanguageFile)</param>
        /// <param name="id">Id of the object to export</param>
        /// <param name="templateType">Template type</param>
        /// <returns>Export result</returns>
        [Produces(typeof(ExportObjectResult))]
        [HttpGet]
        public async Task<IActionResult> ExportObject(string exportFormat, string id, TemplateType templateType)
        {
            ExportObjectResult exportResult = null;
            try
            {
                exportResult = await RunExportObject(exportFormat, id, templateType);
            }
            catch(InvalidOperationException ex)
            {
                return StatusCode((int)HttpStatusCode.BadRequest, ex.Message);
            }
            catch(KeyNotFoundException)
            {
                return StatusCode((int)HttpStatusCode.NotFound);
            }
            catch(UnauthorizedAccessException)
            {
                return StatusCode((int)HttpStatusCode.Unauthorized);
            }

            return Ok(exportResult);
        }

        /// <summary>
        /// Exports an object for download
        /// </summary>
        /// <param name="exportFormat">Format to export (Script, JSON or LanguageFile)</param>
        /// <param name="id">Id of the object to export</param>
        /// <param name="templateType">Template type</param>
        /// <returns>Export result</returns>
        [Produces(typeof(string))]
        [HttpGet]
        public async Task<IActionResult> ExportObjectDownload(string exportFormat, string id, TemplateType templateType)
        {
            ExportObjectResult exportResult = null;
            try
            {
                exportResult = await RunExportObject(exportFormat, id, templateType);
            }
            catch(InvalidOperationException ex)
            {
                return StatusCode((int)HttpStatusCode.BadRequest, ex.Message);
            }
            catch(KeyNotFoundException)
            {
                return StatusCode((int)HttpStatusCode.NotFound);
            }
            catch(UnauthorizedAccessException)
            {
                return StatusCode((int)HttpStatusCode.Unauthorized);
            }

            return File(Encoding.UTF8.GetBytes(exportResult.Code), "text/plain", exportResult.ObjectFilename + "." + exportResult.FileExtension);
        }

        /// <summary>
        /// Exports an object
        /// </summary>
        /// <param name="exportFormat">Format to export (Script, JSON or LanguageFile)</param>
        /// <param name="id">Id of the object to export</param>
        /// <param name="templateType">Template type</param>
        /// <returns>Export result</returns>
        private async Task<ExportObjectResult> RunExportObject(string exportFormat, string id, TemplateType templateType)
        {
            // Check Access
            if((templateType == TemplateType.ObjectNpc && !User.IsInRole(RoleNames.Kortisto)) ||
               (templateType == TemplateType.ObjectItem && !User.IsInRole(RoleNames.Styr)) ||
               (templateType == TemplateType.ObjectSkill && !User.IsInRole(RoleNames.Evne)))
            {
                throw new UnauthorizedAccessException();
            }

            // Get Exporter
            string exporterKey = exportFormat.ToLowerInvariant();
            if(!_exporters.ContainsKey(exporterKey))
            {
                throw new InvalidOperationException("Unknown Export Format");
            }
            IObjectExporter exporter = _exporters[exporterKey];

            // Get Objects
            bool objectFound = false;
            ExportObjectData objectData = new ExportObjectData();
            if(templateType == TemplateType.ObjectNpc)
            {
                KortistoNpc npc = await _npcDbAccess.GetFlexFieldObjectById(id);
                if(npc != null)
                {
                    objectData.ExportData.Add(ExportConstants.ExportDataObject, npc);
                    objectData.ExportData.Add(ExportConstants.ExportDataObjectType, ExportConstants.ExportObjectTypeNpc);
                    
                    TaleDialog dialog = await _dialogDbAccess.GetDialogByRelatedObjectId(id);
                    objectData.ExportData.Add(ExportConstants.ExportDataDialog, dialog);

                    objectFound = true;
                }

            }
            else if(templateType == TemplateType.ObjectItem)
            {
                StyrItem item = await _itemDbAccess.GetFlexFieldObjectById(id);
                if(item != null)
                {
                    objectData.ExportData.Add(ExportConstants.ExportDataObject, item);
                    objectData.ExportData.Add(ExportConstants.ExportDataObjectType, ExportConstants.ExportObjectTypeItem);
                    objectFound = true;
                }
            }
            else if(templateType == TemplateType.ObjectSkill)
            {
                EvneSkill skill = await _skillDbAccess.GetFlexFieldObjectById(id);
                if(skill != null)
                {
                    objectData.ExportData.Add(ExportConstants.ExportDataObject, skill);
                    objectData.ExportData.Add(ExportConstants.ExportDataObjectType, ExportConstants.ExportObjectTypeSkill);
                    objectFound = true;
                }
            }
            else
            {
                throw new InvalidOperationException("Template Type not supported for exporting");
            }

            if(!objectFound)
            {
                throw new KeyNotFoundException();
            }

            // Get Template
            ExportTemplateByObjectIdResult template = await GetValidExportTemplateByIdAndType(id, templateType);

            // Run Export
            ExportObjectResult result = await exporter.ExportObject(template.Template, objectData);
            result.ObjectFilename = ((FlexFieldObject)objectData.ExportData[ExportConstants.ExportDataObject]).Name;
            string regexSearch = Regex.Escape(new string(Path.GetInvalidFileNameChars()));
            Regex illegalCharRegex = new Regex(string.Format("[{0}]", regexSearch));
            result.ObjectFilename = illegalCharRegex.Replace(result.ObjectFilename, string.Empty);
            return result;
        }


        /// <summary>
        /// Deletes all language keys for a group id
        /// </summary>
        /// <param name="groupId">Group Id</param>
        /// <returns>Result</returns>
        [Produces(typeof(string))]
        [ValidateAntiForgeryToken]
        [HttpDelete]
        public async Task<IActionResult> DeleteLanguageKeysByGroupId(string groupId)
        {
            GoNorthProject project = await _projectDbAccess.GetDefaultProject();

            await _languageKeyDbAccess.DeleteAllLanguageKeysInGroup(project.Id, groupId);

            return Ok(groupId);
        }
        
    }
}