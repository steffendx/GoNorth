using System;
using System.Buffers.Text;
using System.Collections.Generic;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace GoNorth.Services.Export.Dialog
{
    /// <summary>
    /// Parser for Condition Data
    /// /// </summary>
    public class JsonConditionDataParser : JsonConverter<ParsedConditionData>
    {
        /// <summary>
        /// Reads the parsed condition data
        /// </summary>
        /// <param name="reader">Json Reader</param>
        /// <param name="typeToConvert">Type to convert</param>
        /// <param name="options">Serializer Options</param>
        /// <returns>Parsed Condition data</returns>
        public override ParsedConditionData Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
        {
            JsonConverter<JsonElement> converter = options.GetConverter(typeof(JsonElement)) as JsonConverter<JsonElement>;
            JsonElement conditionDataElement = converter.Read(ref reader, typeToConvert, options);

            string conditionTypeName = nameof(ParsedConditionData.ConditionType).ToLowerInvariant();
            string ConditionDataName = nameof(ParsedConditionData.ConditionData).ToLowerInvariant();
            JsonElement? conditionType = null;
            JsonElement? conditionData = null;
            foreach(JsonProperty curProperty in conditionDataElement.EnumerateObject())
            {
                string propertyName = curProperty.Name.ToLowerInvariant();
                if(propertyName == conditionTypeName)
                {
                    conditionType = curProperty.Value;
                }
                else if(propertyName == ConditionDataName)
                {
                    conditionData = curProperty.Value;
                }
            }

            if(!conditionType.HasValue || !conditionData.HasValue)
            {
                throw new KeyNotFoundException();
            }

            ParsedConditionData parsedConditionData = new ParsedConditionData();
            parsedConditionData.ConditionType = conditionType.Value.GetInt32();
            parsedConditionData.ConditionData = conditionData.Value;
            return parsedConditionData;
        }

        /// <summary>
        /// Writes the parsed condition data
        /// </summary>
        /// <param name="writer">Json Writer</param>
        /// <param name="value">value to write</param>
        /// <param name="options">Serializer Options</param>
        public override void Write(Utf8JsonWriter writer, ParsedConditionData value, JsonSerializerOptions options)
        {
        }
    }
}