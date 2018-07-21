using System.Threading.Tasks;

namespace GoNorth.Services.Export.LanguageKeyGeneration
{
    /// <summary>
    /// Interface for Language Key Generation
    /// </summary>
    public interface ILanguageKeyGenerator
    {
        /// <summary>
        /// Returns the language key for a flex field object name
        /// </summary>
        /// <param name="objectId">Object Id</param>
        /// <param name="objectName">Object Name</param>
        /// <param name="objectPrefix">Object prefix (Npc, Item, Skill)</param>
        /// <returns>Language Key</returns>
        Task<string> GetFlexFieldNameKey(string objectId, string objectName, string objectPrefix);

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
        Task<string> GetFlexFieldFieldKey(string objectId, string objectName, string objectPrefix, string fieldId, string fieldName, string value);

        /// <summary>
        /// Returns the language key for a flex field object name
        /// </summary>
        /// <param name="objectId">Object Id</param>
        /// <param name="objectName">Object Name</param>
        /// <param name="textLineType">Text Line Type (Player Line, Npc Line, Choice)</param>
        /// <param name="nodeId">Field Id</param>
        /// <param name="value">Value</param>
        /// <returns>Language Key</returns>
        Task<string> GetDialogTextLineKey(string objectId, string objectName, string textLineType, string nodeId, string value);
    }
}