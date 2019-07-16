using System.Collections.Generic;
using System.Linq;
using GoNorth.Data.Exporting;

namespace GoNorth.Services.Export.LanguageKeyGeneration
{
    /// <summary>
    /// Language Key Reference collector
    /// </summary>
    public class LanguageKeyReferenceCollector : ILanguageKeyReferenceCollector
    {
        /// <summary>
        /// Language keys that are used
        /// </summary>
        private List<LanguageKey> _languageKeys;

        /// <summary>
        /// Id of the group for which the language keys should be collected
        /// </summary>
        private string _groupIdToCollectFor;

        /// <summary>
        /// Constructor
        /// </summary>
        public LanguageKeyReferenceCollector()
        {
            _languageKeys = new List<LanguageKey>();
            _groupIdToCollectFor = null;
        }

        /// <summary>
        /// Group Id for which the keys are collected
        /// </summary>
        /// <param name="groupId">Group Id</param>
        public void PrepareCollectionForGroup(string groupId)
        {
            _languageKeys.Clear();
            _groupIdToCollectFor = groupId;
        }

        /// <summary>
        /// Checks if a language key is a referenced language key and if so adds it to the collection
        /// </summary>
        /// <param name="languageKey">Language key</param>
        public void CheckUsedLanguageKey(LanguageKey languageKey)
        {
            if(string.IsNullOrEmpty(_groupIdToCollectFor))
            {
                return;
            }

            if(!_languageKeys.Any(l => l.Id == languageKey.Id) && languageKey.GroupId != _groupIdToCollectFor)
            {
                _languageKeys.Add(languageKey);
            }
        }

        /// <summary>
        /// Returns all referenced language keys
        /// </summary>
        /// <returns>Language key</returns>
        public List<LanguageKey> GetReferencedLanguageKeys() 
        { 
            return _languageKeys; 
        }
    }
}