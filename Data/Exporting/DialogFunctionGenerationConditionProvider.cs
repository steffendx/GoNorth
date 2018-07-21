using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Newtonsoft.Json;

namespace GoNorth.Data.Exporting
{
    /// <summary>
    /// Class for reading dialog node function generation conditions
    /// </summary>
    public class DialogFunctionGenerationConditionProvider : IDialogFunctionGenerationConditionProvider
    {
        /// <summary>
        /// Default Condition Rules Folder
        /// </summary>
        private const string DefaultConditionRulesFolder = "DefaultExportTemplates";

        /// <summary>
        /// Default Condition Rules Files
        /// </summary>
        private const string DefaultConditionRulesFile = "DefaultNodeFunctionMapping.json";

        /// <summary>
        /// Hosting Environment
        /// </summary>
        private readonly IHostingEnvironment _hostingEnvironment;

        /// <summary>
        /// Dialog Function Condition Db Access
        /// </summary>
        private readonly IDialogFunctionGenerationConditionDbAccess _dialogFunctionConditionDbAccess;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="hostingEnvironment">Hosting Environment</param>
        /// <param name="dialogFunctionConditionDbAccess">Dialog Function Condition Db Access</param>
        public DialogFunctionGenerationConditionProvider(IHostingEnvironment hostingEnvironment, IDialogFunctionGenerationConditionDbAccess dialogFunctionConditionDbAccess)
        {
            _hostingEnvironment = hostingEnvironment;
            _dialogFunctionConditionDbAccess = dialogFunctionConditionDbAccess;
        }

        /// <summary>
        /// Returns the dialog node function generation conditions
        /// </summary>
        /// <param name="projectId">Project Id</param>
        /// <returns>Dialog node function generation condition collection</returns>
        public async Task<DialogFunctionGenerationConditionCollection> GetDialogFunctionGenerationConditions(string projectId)
        {
            DialogFunctionGenerationConditionCollection existingCollection = await _dialogFunctionConditionDbAccess.GetDialogFunctionGenerationConditions(projectId);
            if(existingCollection != null)
            {
                return existingCollection;
            }

            string conditionConfig = await LoadDefaultTemplateCode();
            DialogFunctionGenerationConditionCollection collection = JsonConvert.DeserializeObject<DialogFunctionGenerationConditionCollection>(conditionConfig);
            return collection;
        }

        /// <summary>
        /// Loads the default condition rules
        /// </summary>
        /// <returns>Default condition rules</returns>
        private async Task<string> LoadDefaultTemplateCode()
        {
            string scriptFile = Path.Combine(_hostingEnvironment.ContentRootPath, DefaultConditionRulesFolder, DefaultConditionRulesFile);
            
            using(FileStream fileStream = new FileStream(scriptFile, FileMode.Open))
            {
                using (StreamReader reader = new StreamReader(fileStream))
                {
                    return await reader.ReadToEndAsync();
                }
            }
        }
    }
}