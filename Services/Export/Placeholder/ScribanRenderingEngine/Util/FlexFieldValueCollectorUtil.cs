using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text.RegularExpressions;
using GoNorth.Data.Aika;
using GoNorth.Data.Evne;
using GoNorth.Data.Exporting;
using GoNorth.Data.FlexFieldDatabase;
using GoNorth.Data.Kortisto;
using GoNorth.Data.Styr;
using GoNorth.Extensions;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.RenderingObjects;
using Scriban;
using Scriban.Runtime;
using Scriban.Syntax;

namespace GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.Util
{
    /// <summary>
    /// Util class for collecting flex field values
    /// </summary>
    public static class FlexFieldValueCollectorUtil
    {
        /// <summary>
        /// Builds a flex field value object
        /// </summary>
        /// <param name="objectPrefix">Prefix of the object during export</param>
        /// <param name="parsedTemplate">Parsed scriban template</param>
        /// <param name="valueObject">Value object to read from</param>
        /// <param name="exportSettings">Export settings</param>
        /// <param name="errorCollection">Error collection</param>
        /// <typeparam name="T">Type of the returned object</typeparam>
        /// <returns>Converted value</returns>
        public static T BuildFlexFieldValueObject<T>(string objectPrefix, Template parsedTemplate, IFlexFieldExportable valueObject, ExportSettings exportSettings, ExportPlaceholderErrorCollection errorCollection) where T : ScribanFlexFieldObject, new()
        {
            T resultObject = new T();
            resultObject.Id = valueObject.Id;
            resultObject.Name = valueObject.Name;
            resultObject.Fields = new ScribanFlexFieldDictionary(resultObject, errorCollection);
            resultObject.UsedFieldIds = new HashSet<string>();

            if(valueObject.Fields != null)
            {
                resultObject.Fields = new ScribanFlexFieldDictionary(resultObject, errorCollection, valueObject.Fields.Where(f => IsFlexFieldValidForExport(f, true)).SelectMany(f => ConvertFieldToExportField(resultObject, f, exportSettings)).DistinctBy(f => f.Name).ToDictionary(f => f.Name));
                if(!string.IsNullOrEmpty(objectPrefix) && parsedTemplate != null)
                {
                    resultObject.UsedFieldIds = CollectUsedFieldIds(objectPrefix, parsedTemplate, resultObject.Fields).ToHashSet();
                }
            }

            return resultObject;
        }

        /// <summary>
        /// Extracts a list of scriban fields
        /// </summary>
        /// <param name="exportable">Flex field exportable</param>
        /// <param name="exportSettings">Export settings</param>
        /// <param name="errorCollection">Error collection</param>
        /// <returns>Scriban Fields</returns>
        public static List<ScribanFlexFieldField> ExtractScribanFields(IFlexFieldExportable exportable, ExportSettings exportSettings, ExportPlaceholderErrorCollection errorCollection)
        {
            if (exportable == null || exportable.Fields == null)
            {
                return new List<ScribanFlexFieldField>();
            }

            ScribanFlexFieldObject flexFieldObject = ConvertScribanFlexFieldObject(exportable, exportSettings, errorCollection);
            return flexFieldObject.Fields.Values.ToList();
        }

        /// <summary>
        /// Builds a scriban flex field object from a flex field exportable
        /// </summary>
        /// <param name="exportable">Exportable</param>
        /// <param name="exportSettings">Export settings</param>
        /// <param name="errorCollection">Error collection</param>
        /// <returns>Scriban flex field object</returns>
        public static ScribanFlexFieldObject ConvertScribanFlexFieldObject(IFlexFieldExportable exportable, ExportSettings exportSettings, ExportPlaceholderErrorCollection errorCollection)
        {
            ScribanFlexFieldObject flexFieldObject = null;
            if (exportable is StyrItem)
            {
                flexFieldObject = new ScribanExportItem();
            }
            else if (exportable is EvneSkill)
            {
                flexFieldObject = new ScribanExportSkill();
            }
            else if (exportable is KortistoNpc)
            {
                flexFieldObject = new ScribanExportNpc();
            }
            else if (exportable is AikaQuest)
            {
                flexFieldObject = new ScribanExportQuest();
            }
            flexFieldObject.Id = exportable.Id;
            flexFieldObject.Name = exportable.Name;
            flexFieldObject.Fields = new ScribanFlexFieldDictionary(flexFieldObject, errorCollection, exportable.Fields.Where(f => IsFlexFieldValidForExport(f, true)).SelectMany(f => ConvertFieldToExportField(flexFieldObject, f, exportSettings)).DistinctBy(f => f.Name).ToDictionary(f => f.Name));
            flexFieldObject.UsedFieldIds = new HashSet<string>();
            return flexFieldObject;
        }

        /// <summary>
        /// Returns a flex field by id and name from a collection of fields
        /// </summary>
        /// <param name="fields">Fields to search</param>
        /// <param name="fieldId">Field Id</param>
        /// <param name="fieldName">Field Name</param>
        /// <returns>Flex field</returns>
        public static ScribanFlexFieldField GetFlexField(ICollection<ScribanFlexFieldField> fields, string fieldId, string fieldName)
        {
            if(!string.IsNullOrEmpty(fieldId))
            {
                fieldId = fieldId.ToLowerInvariant();
            }

            ScribanFlexFieldField fieldByName = fields.FirstOrDefault(f => f.Id.ToLowerInvariant() == fieldId && f.Name == fieldName);
            if(fieldByName != null)
            {
                return fieldByName;
            }
            
            if(!string.IsNullOrEmpty(fieldName))
            {
                fieldName = fieldName.ToLowerInvariant();
            }
            fieldByName = fields.FirstOrDefault(f => f.Id.ToLowerInvariant() == fieldId && f.Name.ToLowerInvariant() == fieldName);
            if(fieldByName != null)
            {
                return fieldByName;
            }

            return fields.FirstOrDefault(f => f.Id == fieldId);
        }

        /// <summary>
        /// Returns true if a flex field is valid for exporting
        /// </summary>
        /// <param name="field">Field to check</param>
        /// <param name="includeScriptExportIgnored">true if fields that should not be exported to script should be included, else false</param>
        /// <returns>True if the field is valid</returns>
        private static bool IsFlexFieldValidForExport(FlexField field, bool includeScriptExportIgnored)
        {
            if(!includeScriptExportIgnored && field.ScriptSettings != null && field.ScriptSettings.DontExportToScript)
            {
                return false;
            }

            return field.FieldType == ExportConstants.FlexFieldType_String || field.FieldType == ExportConstants.FlexFieldType_Number || field.FieldType == ExportConstants.FlexFieldType_Option;
        }
        
        /// <summary>
        /// Converts a flexfield to an export field
        /// </summary>
        /// <param name="parentObject">Parent object</param>
        /// <param name="field">Field to export</param>
        /// <param name="exportSettings">Export settings</param>
        /// <returns>Converted fields</returns>
        private static IEnumerable<ScribanFlexFieldField> ConvertFieldToExportField(ScribanFlexFieldObject parentObject, FlexField field, ExportSettings exportSettings)
        {
            if(field.ScriptSettings != null && !string.IsNullOrEmpty(field.ScriptSettings.AdditionalScriptNames))
            {
                string[] additionalScriptNames = field.ScriptSettings.AdditionalScriptNames.Split(ExportConstants.FlexFieldAdditionalScriptNamesSeperator, StringSplitOptions.RemoveEmptyEntries);
                foreach(string curAddtionalName in additionalScriptNames)
                {
                    yield return ConvertFieldWithName(parentObject, field, curAddtionalName, exportSettings);
                }
            }

            yield return ConvertFieldWithName(parentObject, field, field.Name, exportSettings);
        }

        /// <summary>
        /// Converts a single field to an export field with a given anme
        /// </summary>
        /// <param name="parentObject">Parent object</param>
        /// <param name="field">Field to convert</param>
        /// <param name="fieldName">Field name to use</param>
        /// <param name="exportSettings">Export settings</param>
        /// <returns>Converted field</returns>
        private static ScribanFlexFieldField ConvertFieldWithName(ScribanFlexFieldObject parentObject, FlexField field, string fieldName, ExportSettings exportSettings)
        {
            ScribanFlexFieldField convertedField = new ScribanFlexFieldField(parentObject);
            convertedField.Id = field.Id;
            convertedField.Name = fieldName;
            convertedField.Type = ConvertFieldTypeToScribanFieldType(field.FieldType);
            convertedField.UnescapedValue = ConvertFieldValue(field.FieldType, field.Value);
            convertedField.Value = convertedField.UnescapedValue;
            if(convertedField.Value is string)
            {
                convertedField.Value = ExportUtil.EscapeCharacters(convertedField.Value.ToString(), exportSettings.EscapeCharacter, exportSettings.CharactersNeedingEscaping, exportSettings.NewlineCharacter);
            }
            convertedField.DontExportToScript = field.ScriptSettings != null && field.ScriptSettings.DontExportToScript ? true : false;
            convertedField.Exists = true;

            return convertedField;
        }

        /// <summary>
        /// Converts a flex field type to an export field type
        /// </summary>
        /// <param name="fieldType">Field type to export</param>
        /// <returns>Converted field type</returns>
        public static string ConvertFieldTypeToScribanFieldType(int fieldType)
        {
            switch(fieldType)
            {
            case ExportConstants.FlexFieldType_String:
                return ExportConstants.Scriban_FlexFieldType_String;
            case ExportConstants.FlexFieldType_Number:
                return ExportConstants.Scriban_FlexFieldType_Number;
            case ExportConstants.FlexFieldType_Option:
                return ExportConstants.Scriban_FlexFieldType_Option;
            }

            return "UNKNOWN";
        }

        /// <summary>
        /// Converts a flex field type to an export field type
        /// </summary>
        /// <param name="fieldType">Field type to export</param>
        /// <returns>Converted field type</returns>
        public static int ConvertScribanFieldTypeToFlexFieldType(string fieldType)
        {
            switch(fieldType)
            {
            case ExportConstants.Scriban_FlexFieldType_String:
                return ExportConstants.FlexFieldType_String;
            case ExportConstants.Scriban_FlexFieldType_Number:
                return ExportConstants.FlexFieldType_Number;
            case ExportConstants.Scriban_FlexFieldType_Option:
                return ExportConstants.FlexFieldType_Option;
            }

            return -1;
        }
        
        /// <summary>
        /// Maps a value to a field value
        /// </summary>
        /// <param name="fieldData">Field for which the data is mapped</param>
        /// <param name="valueToMap">Value to map</param>
        /// <param name="exportSettings">Export settings</param>
        /// <returns>Mapped value</returns>
        public static object MapValueToFieldValue(ScribanFlexFieldField fieldData, string valueToMap, ExportSettings exportSettings)
        {
            if (fieldData != null && fieldData.Type == ExportConstants.Scriban_FlexFieldType_Number)
            {
                return FlexFieldValueCollectorUtil.ConvertFieldValue(ExportConstants.FlexFieldType_Number, valueToMap);
            }
            else
            {
                return ExportUtil.EscapeCharacters(valueToMap, exportSettings.EscapeCharacter, exportSettings.CharactersNeedingEscaping, exportSettings.NewlineCharacter);
            }
        }

        /// <summary>
        /// Converts a field value to an export field value
        /// </summary>
        /// <param name="fieldType">Type of the field</param>
        /// <param name="value">Value to convert</param>
        /// <returns>Converted value</returns>
        public static object ConvertFieldValue(int fieldType, string value)
        {
            if(fieldType == ExportConstants.FlexFieldType_Number)
            {
                float parsedValue = 0.0f;
                if(!float.TryParse(value, NumberStyles.Float, CultureInfo.InvariantCulture, out parsedValue))
                {
                    return "NaN";
                }

                return parsedValue;
            }

            return value;
        }

        /// <summary>
        /// Collects the ids of the fields that were referenced by name
        /// </summary>
        /// <param name="objectPrefix">Prefix of the object during export</param>
        /// <param name="parsedTemplate">Parsed scriban template</param>
        /// <param name="fields">Parsed fields</param>
        /// <returns>Ids of the used fields</returns>
        private static IEnumerable<string> CollectUsedFieldIds(string objectPrefix, Template parsedTemplate, ScribanFlexFieldDictionary fields)
        {
            string fieldsPrefix = string.Format("{0}.{1}.", objectPrefix, StandardMemberRenamer.Rename(nameof(ScribanFlexFieldObject.Fields)));
            Regex valueRegex = new Regex(string.Format("\\s?{0}([a-zA-Z\\d]*)", Regex.Escape(fieldsPrefix)));
            List<ScriptStatement> statements = ScribanStatementExtractor.ExtractPlainNonTextStatements(parsedTemplate);
            foreach(ScriptStatement curStatement in statements)
            {
                string statement = curStatement.ToString();
                Match valueMatch = valueRegex.Match(statement);
                if(valueMatch.Success)
                {
                    string fieldName = valueMatch.Groups[1].Value.Trim();
                    if(fields.ContainsKey(fieldName))
                    {
                        yield return fields[fieldName].Id;
                    }
                }
            }
        }
    }
}