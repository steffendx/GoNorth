namespace GoNorth.Services.Export.Dialog.ActionRendering.Localization
{
    /// <summary>
    /// Interface for translating action types
    /// </summary>
    public interface IActionTranslator
    {
        /// <summary>
        /// Returns the translated displayname for an action
        /// </summary>
        /// <param name="actionType">Action Type to translate</param>
        string TranslateActionType(ActionType actionType);
    }
}