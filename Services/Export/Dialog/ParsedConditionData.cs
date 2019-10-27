using System.Text.Json;

namespace GoNorth.Services.Export.Dialog
{
    /// <summary>
    /// Parsed Condition data
    /// </summary>
    public class ParsedConditionData
    {
        /// <summary>
        /// Condition Type
        /// </summary>
        public int ConditionType { get; set; }

        /// <summary>
        /// Condition Data
        /// </summary>
        public JsonElement ConditionData { get; set; }
    }
}