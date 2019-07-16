using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using GoNorth.Data.Project;
using GoNorth.Data.ProjectConfig;
using GoNorth.Data.Tale;
using GoNorth.Data.User;
using GoNorth.Extensions;
using GoNorth.Services.ProjectConfig;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace GoNorth.Controllers.Api
{
    /// <summary>
    /// Project Config Api controller
    /// </summary>
    [Authorize(Roles = RoleNames.ProjectConfigManager + "," + RoleNames.Tale + "," + RoleNames.Kortisto)]
    [Route("/api/[controller]/[action]")]
    public class ProjectConfigApiController : Controller
    {
        /// <summary>
        /// Trimmed miscellaneous project config
        /// </summary>
        public class TrimmedMiscConfig
        {
            /// <summary>
            /// Hours per day
            /// </summary>
            public int HoursPerDay { get; set; }

            /// <summary>
            /// Minutes per hour
            /// </summary>
            public int MinutesPerHour { get; set; }
        }


        /// <summary>
        /// Project Config provider
        /// </summary>
        private readonly IProjectConfigProvider _projectConfigProvider;

        /// <summary>
        /// Project Config Db Access
        /// </summary>
        private readonly IProjectConfigDbAccess _projectConfigDbAccess;

        /// <summary>
        /// Project Db Service
        /// </summary>
        private readonly IProjectDbAccess _projectDbAccess;

        /// <summary>
        /// User Manager
        /// </summary>
        private readonly UserManager<GoNorthUser> _userManager;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="projectConfigProvider">Project config provider</param>
        /// <param name="projectConfigDbAccess">Project config Db Access</param>
        /// <param name="projectDbAccess">Project Db Access</param>
        /// <param name="userManager">User Manager</param>
        public ProjectConfigApiController(IProjectConfigProvider projectConfigProvider, IProjectConfigDbAccess projectConfigDbAccess, IProjectDbAccess projectDbAccess, UserManager<GoNorthUser> userManager)
        {
            _projectConfigProvider = projectConfigProvider;
            _projectConfigDbAccess = projectConfigDbAccess;
            _projectDbAccess = projectDbAccess;
            _userManager = userManager;
        }

        /// <summary>
        /// Returns a json config entry by key
        /// </summary>
        /// <param name="configKey">Config key</param>
        /// <returns>Config entry</returns>
        [Produces(typeof(string))]
        [HttpGet]
        public async Task<IActionResult> GetJsonConfigByKey(string configKey)
        {
            GoNorthProject project = await _projectDbAccess.GetDefaultProject();
            JsonConfigEntry configEntry = await _projectConfigDbAccess.GetJsonConfigByKey(project.Id, configKey);
            if(configEntry != null)
            {
                return Ok(configEntry.ConfigData);
            }
            else
            {
                return Ok(string.Empty);
            }
        }

        /// <summary>
        /// Saves a json config entry
        /// </summary>
        /// <param name="configKey">Config key</param>
        /// <returns>Save result</returns>
        [Authorize(Roles = RoleNames.ProjectConfigManager)]  
        [Produces(typeof(string))]
        [HttpPost]
        public async Task<IActionResult> SaveJsonConfigByKey(string configKey)
        {
            string configData = string.Empty;
            using (StreamReader reader = new StreamReader(Request.Body))
            {
                configData = reader.ReadToEnd();
            }

            GoNorthProject project = await _projectDbAccess.GetDefaultProject();
            JsonConfigEntry configEntry = await _projectConfigDbAccess.GetJsonConfigByKey(project.Id, configKey);
            if(configEntry != null)
            {
                await this.SetModifiedData(_userManager, configEntry);
                configEntry.ConfigData = configData;

                await _projectConfigDbAccess.UpdateJsonConfig(configEntry);
            }
            else
            {
                configEntry = new JsonConfigEntry();
                configEntry.ProjectId = project.Id;
                configEntry.Key = configKey;
                configEntry.ConfigData = configData;
                
                await this.SetModifiedData(_userManager, configEntry);
                
                await _projectConfigDbAccess.CreateJsonConfig(configEntry);
            }

            return Ok(configKey);
        }


        /// <summary>
        /// Returns the miscellaneous config entries for the current project
        /// </summary>
        /// <returns>Config entry</returns>
        [Produces(typeof(TrimmedMiscConfig))]
        [HttpGet]
        public async Task<IActionResult> GetMiscConfig()
        {
            GoNorthProject project = await _projectDbAccess.GetDefaultProject();
            MiscProjectConfig configEntry = await _projectConfigProvider.GetMiscConfig(project.Id);
            return Ok(StripMiscConfig(configEntry));
        }

        /// <summary>
        /// Strips the miscellaneous config entry for a project of additional informations
        /// </summary>
        /// <param name="configEntry">Config Entry to strip</param>
        /// <returns>Trimmed miscellaneous config entry</returns>
        private TrimmedMiscConfig StripMiscConfig(MiscProjectConfig configEntry)
        {
            TrimmedMiscConfig trimmedConfig = new TrimmedMiscConfig();
            trimmedConfig.HoursPerDay = configEntry.HoursPerDay;
            trimmedConfig.MinutesPerHour = configEntry.MinutesPerHour;

            return trimmedConfig;
        }

        /// <summary>
        /// Saves the miscellaneous config entry for a project
        /// </summary>
        /// <param name="configData">Config data</param>
        /// <returns>Save result</returns>
        [Authorize(Roles = RoleNames.ProjectConfigManager)]  
        [Produces(typeof(TrimmedMiscConfig))]
        [HttpPost]
        public async Task<IActionResult> SaveMiscConfig([FromBody]TrimmedMiscConfig configData)
        {
            if(configData.HoursPerDay <= 0 || configData.MinutesPerHour <= 0)
            {
                return BadRequest();
            }

            GoNorthProject project = await _projectDbAccess.GetDefaultProject();
            MiscProjectConfig configEntry = await _projectConfigDbAccess.GetMiscConfig(project.Id);
            if(configEntry != null)
            {
                await this.SetModifiedData(_userManager, configEntry);
                configEntry.HoursPerDay = configData.HoursPerDay;
                configEntry.MinutesPerHour = configData.MinutesPerHour;

                await _projectConfigDbAccess.UpdateMiscConfig(configEntry);
            }
            else
            {
                configEntry = new MiscProjectConfig();
                configEntry.ProjectId = project.Id;
                configEntry.HoursPerDay = configData.HoursPerDay;
                configEntry.MinutesPerHour = configData.MinutesPerHour;
                
                await this.SetModifiedData(_userManager, configEntry);
                
                await _projectConfigDbAccess.CreateMiscConfig(configEntry);
            }

            return Ok(configData);
        }
    }
}

