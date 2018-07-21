namespace GoNorth.Services.Export.Dialog
{
    /// <summary>
    /// Interface for generating Export Dialog Function Names
    /// </summary>
    public interface IExportDialogFunctionNameGenerator
    {
        /// <summary>
        /// Returns a new dialog step function
        /// </summary>
        /// <param name="stepType">Stype type (Text, Choice)</param>
        /// <returns>New Dialog Step Function</returns>
        string GetNewDialogStepFunction(string stepType);
    }
}