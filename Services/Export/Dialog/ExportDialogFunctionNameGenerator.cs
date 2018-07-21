using GoNorth.Data.Tale;
using GoNorth.Services.Export.Placeholder;

namespace GoNorth.Services.Export.Dialog
{
    /// <summary>
    /// Class for generating Export Dialog Function Names
    /// </summary>
    public class ExportDialogFunctionNameGenerator : IExportDialogFunctionNameGenerator
    {
        /// <summary>
        /// Template for the function
        /// </summary>
        private const string _functionTemplate = "DialogStep_{0}_{1}";

        /// <summary>
        /// current Function Count
        /// </summary>/
        private int _curFunctionCount = 0;

        /// <summary>
        /// Returns a new dialog step function
        /// </summary>
        /// <param name="stepType">Stype type (Text, Choice)</param>
        /// <returns>New Dialog Step Function</returns>
        public string GetNewDialogStepFunction(string stepType)
        {
            ++_curFunctionCount;

            return string.Format(_functionTemplate, _curFunctionCount, stepType);
        }
    }
}