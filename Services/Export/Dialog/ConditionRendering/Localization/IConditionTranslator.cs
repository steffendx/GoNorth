namespace GoNorth.Services.Export.Dialog.ConditionRendering.Localization
{
    /// <summary>
    /// Interface for translating condition types
    /// </summary>
    public interface IConditionTranslator
    {
        /// <summary>
        /// Returns the translated displayname for a condition
        /// </summary>
        /// <param name="conditionType">Condition Type to translate</param>
        string TranslateConditionType(ConditionType conditionType);
    }
}