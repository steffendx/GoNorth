using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using GoNorth.Data.FlexFieldDatabase;

namespace GoNorth.Controllers.Api
{
    /// <summary>
    /// Flex Field Api Util
    /// </summary>
    public static class FlexFieldApiUtil
    {
        /// <summary>
        /// Flex Field type folder
        /// </summary>        
        private const int FlexFieldTypeFolder = 100;

        /// <summary>
        /// Checks if duplicates exist
        /// </summary>
        /// <param name="flexFields">Flex fields to check</param>
        /// <returns>true if duplicated fields exist, else false</returns>
        public static bool HasDuplicateFieldNames(List<FlexField> flexFields)
        {
            return flexFields.GroupBy(f => f).Where(g => g.Count() > 1).Any();
        }

        /// <summary>
        /// Sets the field ids for new fields
        /// </summary>
        /// <param name="flexFields">Flex Fields</param>
        public static void SetFieldIdsForNewFields(List<FlexField> flexFields)
        {
            foreach(FlexField curField in flexFields)
            {
                if(string.IsNullOrEmpty(curField.Id))
                {
                    curField.Id = Guid.NewGuid().ToString();
                }
            }
        }

        /// <summary>
        /// Sets the field ids for new fields in folders
        /// </summary>
        /// <param name="flexFields">Flex Fields</param>
        /// <param name="templateObject">Template object from which fields are distributed at the moment, used to find the names of fields in folders</param>
        public static void SetFieldIdsForNewFieldsInFolders(List<FlexField> flexFields, FlexFieldObject templateObject = null)
        {
            foreach(FlexField curField in flexFields)
            {
                if(curField.FieldType != FlexFieldTypeFolder || string.IsNullOrEmpty(curField.Value))
                {
                    continue;
                }

                List<string> fieldIds = null;
                try
                {
                    fieldIds = JsonSerializer.Deserialize<List<string>>(curField.Value);
                }
                catch(Exception)
                {
                }

                if(fieldIds == null)
                {
                    continue;
                }

                // Fill ids for new fields
                bool anyChange = false;
                for(int curFieldIdIndex = 0; curFieldIdIndex < fieldIds.Count; ++curFieldIdIndex)
                {
                    string curFieldId = fieldIds[curFieldIdIndex];
                    Guid tempGuid;
                    if(Guid.TryParse(curFieldId, out tempGuid))
                    {
                        continue;
                    }

                    int fieldIndex = -1;
                    if(!int.TryParse(curFieldId, out fieldIndex))
                    {
                        continue;
                    }

                    if(templateObject == null)
                    {
                        if(fieldIndex < 0 || fieldIndex >= flexFields.Count)
                        {
                            continue;
                        }

                        fieldIds[curFieldIdIndex] = flexFields[fieldIndex].Id;
                    }
                    else
                    {
                        if(fieldIndex < 0 || fieldIndex >= templateObject.Fields.Count)
                        {
                            continue;
                        }

                        string fieldName = templateObject.Fields[fieldIndex].Name;
                        FlexField targetField = flexFields.FirstOrDefault(f => f.Name == fieldName);
                        if(targetField == null)
                        {
                            continue;
                        }

                        fieldIds[curFieldIdIndex] = targetField.Id;
                    }
                    anyChange = true;
                }

                if(anyChange) 
                {
                    curField.Value = JsonSerializer.Serialize(fieldIds);
                }
            }
        }
    }
}