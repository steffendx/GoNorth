using System.Text.RegularExpressions;
using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Data.Project;
using GoNorth.Services.Project;

namespace GoNorth.Services.Export.LanguageKeyGeneration
{
    /// <summary>
    /// Class for Language Key Generation
    /// </summary>
    public class LanguageKeyGenerator : ILanguageKeyGenerator
    {
        /// <summary>
        /// Language Key Reference
        /// </summary>
        private const string LangKeyRef_Name = "Name";


        /// <summary>
        /// Language Key Db Access
        /// </summary>
        private readonly ILanguageKeyDbAccess _languageKeyDbAccess;

        /// <summary>
        /// User project access
        /// </summary>
        private readonly IUserProjectAccess _userProjectAccess;

        /// <summary>
        /// Language key reference collector
        /// </summary>
        private readonly ILanguageKeyReferenceCollector _languageKeyReferenceCollector;

        /// <summary>
        /// Current Project
        /// </summary>
        private GoNorthProject _project;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="languageKeyDbAccess">Language Key Db Access</param>
        /// <param name="userProjectAccess">User project access</param>
        /// <param name="languageKeyReferenceCollector">Language key reference collector</param>
        public LanguageKeyGenerator(ILanguageKeyDbAccess languageKeyDbAccess, IUserProjectAccess userProjectAccess, ILanguageKeyReferenceCollector languageKeyReferenceCollector)
        {
            _languageKeyDbAccess = languageKeyDbAccess;
            _userProjectAccess = userProjectAccess;
            _languageKeyReferenceCollector = languageKeyReferenceCollector;
        }

        /// <summary>
        /// Returns the language key for a flex field object name
        /// </summary>
        /// <param name="objectId">Object Id</param>
        /// <param name="objectName">Object Name</param>
        /// <param name="objectPrefix">Object prefix (Npc, Item, Skill)</param>
        /// <returns>Language Key</returns>
        public async Task<string> GetFlexFieldNameKey(string objectId, string objectName, string objectPrefix)
        {
            return await GetLanguageKey(objectId, LangKeyRef_Name, objectPrefix + "_" + objectName + "_name", objectName);
        }

        /// <summary>
        /// Returns the language key for a flex field object name
        /// </summary>
        /// <param name="objectId">Object Id</param>
        /// <param name="objectName">Object Name</param>
        /// <param name="objectPrefix">Object prefix (Npc, Item, Skill)</param>
        /// <param name="fieldId">Field Id</param>
        /// <param name="fieldName">Field Name</param>
        /// <param name="value">Value</param>
        /// <returns>Language Key</returns>
        public async Task<string> GetFlexFieldFieldKey(string objectId, string objectName, string objectPrefix, string fieldId, string fieldName, string value)
        {
            return await GetLanguageKey(objectId, fieldId, objectPrefix + "_" + objectName + "_" + fieldName, value);
        }

        /// <summary>
        /// Returns the language key for a flex field object name
        /// </summary>
        /// <param name="objectId">Object Id</param>
        /// <param name="objectName">Object Name</param>
        /// <param name="textLineType">Text Line Type (Player Line, Npc Line, Choice)</param>
        /// <param name="nodeId">Field Id</param>
        /// <param name="value">Value</param>
        /// <returns>Language Key</returns>
        public async Task<string> GetDialogTextLineKey(string objectId, string objectName, string textLineType, string nodeId, string value)
        {
            return await GetLanguageKeyWithIncrementId(objectId, nodeId, objectName + "_" + textLineType + "_{0}", value);
        }

        /// <summary>
        /// Cleans the language key
        /// </summary>
        /// <param name="langKey">Language Key</param>
        /// <returns>Cleaned language key</returns>
        private string CleanLanguageKey(string langKey)
        {
            return Regex.Replace(langKey, "[^a-zA-Z\\d_]", "").ToLowerInvariant();
        }

        /// <summary>
        /// Returns a language key with an increment id
        /// </summary>
        /// <param name="groupId">Group Id</param>
        /// <param name="langKeyRef">Language Key reference</param>
        /// <param name="langKey">Lang Key</param>
        /// <param name="value">Value of the key</param>
        /// <returns>Language Key</returns>
        private async Task<string> GetLanguageKeyWithIncrementId(string groupId, string langKeyRef, string langKey, string value)
        {
            await EnsureProject();
            LanguageKey languageKey = await _languageKeyDbAccess.GetLanguageKey(_project.Id, groupId, langKeyRef);
            if(languageKey == null)
            {
                int newId = await _languageKeyDbAccess.GetNewLanguageKeyIdForGroup(_project.Id, groupId);
                langKey = string.Format(langKey, newId);
                languageKey = await SaveNewLanguageKey(groupId, langKeyRef, CleanLanguageKey(langKey), value);
            }  
            else
            {
                _languageKeyReferenceCollector.CheckUsedLanguageKey(languageKey);
                await _languageKeyDbAccess.UpdateLanguageKeyValue(languageKey.Id, value);
            }

            return languageKey.LangKey;          
        }

        /// <summary>
        /// Returns a language key
        /// </summary>
        /// <param name="groupId">Group Id</param>
        /// <param name="langKeyRef">Language Key reference</param>
        /// <param name="langKey">Lang Key</param>
        /// <param name="value">Value of the key</param>
        /// <returns>Language Key</returns>
        private async Task<string> GetLanguageKey(string groupId, string langKeyRef, string langKey, string value)
        {
            await EnsureProject();
            LanguageKey languageKey = await _languageKeyDbAccess.GetLanguageKey(_project.Id, groupId, langKeyRef);
            if(languageKey == null)
            {
                languageKey = await SaveNewLanguageKey(groupId, langKeyRef, CleanLanguageKey(langKey), value);
            }
            else
            {
                _languageKeyReferenceCollector.CheckUsedLanguageKey(languageKey);
                await _languageKeyDbAccess.UpdateLanguageKeyValue(languageKey.Id, value);
            }

            return languageKey.LangKey;
        }

        /// <summary>
        /// Saves a new language key
        /// </summary>
        /// <param name="groupId">Group Id</param>
        /// <param name="langKeyRef">Language Key Reference</param>
        /// <param name="langKey">Language Key</param>
        /// <param name="value">Value</param>
        /// <returns>New Language Key</returns>
        private async Task<LanguageKey> SaveNewLanguageKey(string groupId, string langKeyRef, string langKey, string value)
        {
            string uniqueLangKey = await EnsureUniqueLangKey(langKey);

            LanguageKey languageKey = new LanguageKey();
            languageKey.ProjectId = _project.Id;
            languageKey.GroupId = groupId;
            languageKey.LangKeyRef = langKeyRef;
            languageKey.LangKey = uniqueLangKey;
            languageKey.Value = value;

            _languageKeyReferenceCollector.CheckUsedLanguageKey(languageKey);
            await _languageKeyDbAccess.SaveNewLanguageKey(languageKey);

            return languageKey;
        }

        /// <summary>
        /// Ensures that the project is loaded
        /// </summary>
        /// <returns>Task</returns>
        private async Task EnsureProject()
        {
            if(_project == null)
            {
                _project = await _userProjectAccess.GetUserProject();
            }
        }

        /// <summary>
        /// Ensures a language key is unqiue
        /// </summary>
        /// <param name="langKey">Language Key</param>
        /// <returns>Unique language key</returns>
        private async Task<string> EnsureUniqueLangKey(string langKey)
        {
            int curPostFixNumber = 1;
            while(await _languageKeyDbAccess.GetLanguageKeyByKey(_project.Id, langKey) != null)
            {
                langKey += "_" + curPostFixNumber.ToString();
                ++curPostFixNumber;
            }

            return langKey;
        }

    }
}