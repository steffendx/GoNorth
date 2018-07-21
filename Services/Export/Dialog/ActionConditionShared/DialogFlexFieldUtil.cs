using System;
using System.Linq;
using GoNorth.Data.FlexFieldDatabase;
using GoNorth.Services.Export.Placeholder;

namespace GoNorth.Services.Export.Dialog.ActionConditionShared
{
    /// <summary>
    /// Util Classes for flex field exporting
    /// </summary>
    public static class DialogFlexFieldUtil
    {
        /// <summary>
        /// Returns the flex field by id
        /// </summary>
        /// <param name="valueObject">Value object to export</param>
        /// <param name="fieldId">Field Id</param>
        /// <returns>Flex Field</returns>
        public static FlexField GetFlexField(IFlexFieldExportable valueObject, string fieldId)
        {
            FlexField field = valueObject.Fields.FirstOrDefault(f => f.Id == fieldId);
            return field;
        }
                
        /// <summary>
        /// Returns the field name
        /// </summary>
        /// <param name="exportField">Field to export</param>
        /// <param name="searchedFieldName">Searched field name</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <returns>Field Name</returns>
        public static string GetFieldName(FlexField exportField, string searchedFieldName, ExportPlaceholderErrorCollection errorCollection)
        {
            if(exportField.Name == searchedFieldName)
            {
                return exportField.Name;
            }

            if(string.IsNullOrEmpty(exportField.ScriptSettings.AdditionalScriptNames))
            {
                string[] additionalFieldNames = exportField.ScriptSettings.AdditionalScriptNames.Split(ExportConstants.FlexFieldAdditionalScriptNamesSeperator, StringSplitOptions.RemoveEmptyEntries);
                if(additionalFieldNames.Any(f => f.ToLowerInvariant() == searchedFieldName.ToLowerInvariant()))
                {
                    return searchedFieldName;
                }
            }

            errorCollection.AddDialogFlexFieldErrorNotFoundDefaultWillBeUsed(searchedFieldName, exportField.Name);
            return exportField.Name;
        }
    }
}