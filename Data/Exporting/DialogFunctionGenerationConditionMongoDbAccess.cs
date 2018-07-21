using System;
using System.Threading.Tasks;
using GoNorth.Config;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using MongoDB.Driver.Linq;

namespace GoNorth.Data.Exporting
{
    /// <summary>
    /// Dialog Function Generation Condition Mongo DB Access
    /// </summary>
    public class DialogFunctionGenerationConditionMongoDbAccess : BaseMongoDbAccess, IDialogFunctionGenerationConditionDbAccess
    {
        /// <summary>
        /// Collection Name of the dialog function generation condition
        /// </summary>
        public const string DialogFunctionGenerationConditionCollectionName = "DialogFunctionGenerationCondition";

        /// <summary>
        /// Dialog function generation condition Collection
        /// </summary>
        private IMongoCollection<DialogFunctionGenerationConditionCollection> _DialogFunctionGenerationConditionCollection;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="configuration">Configuration</param>
        public DialogFunctionGenerationConditionMongoDbAccess(IOptions<ConfigurationData> configuration) : base(configuration)
        {
            _DialogFunctionGenerationConditionCollection = _Database.GetCollection<DialogFunctionGenerationConditionCollection>(DialogFunctionGenerationConditionCollectionName);
        }

        /// <summary>
        /// Returns the dialog node function generation conditions
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <returns>Dialog node function generation condition collection</returns>
        public async Task<DialogFunctionGenerationConditionCollection> GetDialogFunctionGenerationConditions(string projectId)
        {
            DialogFunctionGenerationConditionCollection generationCondition = await _DialogFunctionGenerationConditionCollection.Find(t => t.ProjectId == projectId).FirstOrDefaultAsync();
            return generationCondition;
        }

        /// <summary>
        /// Saves the dialog function generation condition
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <param name="dialogFunctionGenerationCondition">Dialog function generation condition</param>
        /// <returns>Task</returns>
        public async Task SaveDialogFunctionGenerationCondition(string projectId, DialogFunctionGenerationConditionCollection dialogFunctionGenerationCondition)
        {
            bool isNew = true;
            DialogFunctionGenerationConditionCollection existingCondition = await GetDialogFunctionGenerationConditions(projectId);
            if(existingCondition != null)
            {
                dialogFunctionGenerationCondition.Id = existingCondition.Id;
                isNew = false;
            }
            else
            {
                dialogFunctionGenerationCondition.Id = Guid.NewGuid().ToString();
            }
            dialogFunctionGenerationCondition.ProjectId = projectId;

            if(isNew)
            {
                await _DialogFunctionGenerationConditionCollection.InsertOneAsync(dialogFunctionGenerationCondition);
            }
            else
            {
                await _DialogFunctionGenerationConditionCollection.ReplaceOneAsync(s => s.Id == dialogFunctionGenerationCondition.Id, dialogFunctionGenerationCondition);
            }
        }

    }
}