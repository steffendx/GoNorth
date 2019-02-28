using System.Collections.Generic;
using GoNorth.Data.TaskManagement;
using Microsoft.Extensions.Localization;

namespace GoNorth.Services.TaskManagement
{
    /// <summary>
    /// Class for returning default task types if no task types exist in the database
    /// </summary>
    public class TaskTypeDefaultProvider : ITaskTypeDefaultProvider
    {
        /// <summary>
        /// String Localizer
        /// </summary>
        private readonly IStringLocalizer _localizer;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="localizerFactory">Localizer Factory</param>
        public TaskTypeDefaultProvider(IStringLocalizerFactory localizerFactory)
        {
            _localizer = localizerFactory.Create(typeof(TaskTypeDefaultProvider));
        }

        /// <summary>
        /// Returns the default task types for task groups
        /// </summary>
        /// <returns>Default Task types for task groups</returns>
        public List<GoNorthTaskType> GetDefaultTaskGroupTypes()
        {
            return new List<GoNorthTaskType> {
                new GoNorthTaskType {
                    Id = null,
                    Name = _localizer["TaskGroup"],
                    IsDefault = true,
                    Color = "#337AB7"
                }
            };
        }

        /// <summary>
        /// Returns the default task types for tasks
        /// </summary>
        /// <returns>Default Task types for tasks</returns>
        public List<GoNorthTaskType> GetDefaultTaskTypes()
        {
            return new List<GoNorthTaskType> {
                new GoNorthTaskType {
                    Id = null,
                    Name = _localizer["Task"],
                    IsDefault = true,
                    Color = "#F2CB1D"
                }
            };
        }
    }
}