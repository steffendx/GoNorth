using System.Collections.Generic;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace GoNorth.Services.Export.Dialog
{
    /// <summary>
    /// Util class to parse conditions
    /// </summary>
    public static class ConditionParsingUtil
    {
        /// <summary>
        /// Parses conditions elements
        /// </summary>
        /// <param name="conditionElements">Condition elements to parse</param>
        /// <returns>Parsed condition elements</returns>
        public static List<ParsedConditionData> ParseConditionElements(string conditionElements)
        {
            JsonSerializerOptions jsonOptions = new JsonSerializerOptions();
            jsonOptions.Converters.Add(new JsonStringEnumConverter());
            jsonOptions.Converters.Add(new JsonConditionDataParser());
            jsonOptions.PropertyNameCaseInsensitive = true;

            return JsonSerializer.Deserialize<List<ParsedConditionData>>(conditionElements, jsonOptions);
        }
    }
}