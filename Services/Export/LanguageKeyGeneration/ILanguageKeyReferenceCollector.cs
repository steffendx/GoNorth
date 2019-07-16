using System.Collections.Generic;
using GoNorth.Data.Exporting;

namespace GoNorth.Services.Export.LanguageKeyGeneration
{
    /// <summary>
    /// Interface for Language Key Reference collectors
    /// </summary>
    public interface ILanguageKeyReferenceCollector
    {
        /// <summary>
        /// Group Id for which the keys are collected
        /// </summary>
        /// <param name="groupId">Group Id</param>
        void PrepareCollectionForGroup(string groupId);

        /// <summary>
        /// Checks if a language key is a referenced language key and if so adds it to the collection
        /// </summary>
        /// <param name="languageKey">Language key</param>
        void CheckUsedLanguageKey(LanguageKey languageKey);

        /// <summary>
        /// Returns all referenced language keys
        /// </summary>
        /// <returns>Language key</returns>
        List<LanguageKey> GetReferencedLanguageKeys();
    }
}