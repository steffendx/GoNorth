using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Data.FlexFieldDatabase;
using GoNorth.Data.Project;
using GoNorth.Services.Export.Data;
using GoNorth.Services.Export.LanguageKeyGeneration;
using Microsoft.Extensions.Localization;

namespace GoNorth.Services.Export.Placeholder
{
    /// <summary>
    /// Flex Field Export Template Placeholder Resolver
    /// </summary>
    public class FlexFieldExportTemplatePlaceholderResolver : BaseExportPlaceholderResolver, IExportTemplateTopicPlaceholderResolver
    {
        /// <summary>
        /// Default Flex Field Placeholder Prefix
        /// </summary>
        private const string FlexField_Default_Placeholder_Prefix = "FlexField";

        /// <summary>
        /// Flex Field Name
        /// </summary>
        private const string Placeholder_Name = "Name";

        /// <summary>
        /// Flex Field Name Language Key
        /// </summary>
        private const string Placeholder_Name_LangKey = "Name_LangKey";

        /// <summary>
        /// Flex Field Value
        /// </summary>
        private const string Placeholder_Field_Value = "Value_(.*?)";

        /// <summary>
        /// Flex Field Value Friendly Name
        /// </summary>
        private const string Placeholder_Field_Value_FriendlyName = "Value_NAME_OF_FIELD";

        /// <summary>
        /// Flex Field Language Key
        /// </summary>
        private const string Placeholder_Field_LangKey = "LangKey_(.*?)";

        /// <summary>
        /// Flex Field Language Key Friendly Name
        /// </summary>
        private const string Placeholder_Field_LangKey_FriendlyName = "LangKey_NAME_OF_FIELD";

        /// <summary>
        /// Flex Field Fields List Start
        /// </summary>
        private const string Placeholder_Field_List_Start = "Field_List_Start";

        /// <summary>
        /// Flex Field Fields List End
        /// </summary>
        private const string Placeholder_Field_List_End = "Field_List_End";

        /// <summary>
        /// Flex Field Unused Fields List
        /// </summary>
        private const string Placeholder_UnusedFields = "UnusedFields";

        /// <summary>
        /// Flex Field Unused Fields Start
        /// </summary>
        private const string Placeholder_UnusedFields_Start = "UnusedFields_Start";

        /// <summary>
        /// Flex Field Unused Fields End
        /// </summary>
        private const string Placeholder_UnusedFields_End = "UnusedFields_End";

        /// <summary>
        /// Flex Field all Fields
        /// </summary>
        private const string Placeholder_AllFields = "AllFields";

        /// <summary>
        /// Flex Field all Fields Start
        /// </summary>
        private const string Placeholder_AllFields_Start = "AllFields_Start";

        /// <summary>
        /// Flex Field all Fields End
        /// </summary>
        private const string Placeholder_AllFields_End = "AllFields_End";

        /// <summary>
        /// Flex Field Name in a Flex Field List
        /// </summary>
        private const string Placeholder_FlexField_Field_Name = "Field_Name";

        /// <summary>
        /// Flex Field Value in a Flex Field List
        /// </summary>
        private const string Placeholder_FlexField_Field_Value = "Field_Value";

        /// <summary>
        /// Flex Field Language Key in a Flex Field List
        /// </summary>
        private const string Placeholder_FlexField_Field_LangKey = "Field_LangKey";

        /// <summary>
        /// Flex Field Field is a number field start
        /// </summary>
        private const string Placeholder_FlexField_Field_IsNumberField_Start = "Field_IsNumberField_Start";

        /// <summary>
        /// Flex Field Field is a number field end
        /// </summary>
        private const string Placeholder_FlexField_Field_IsNumberField_End = "Field_IsNumberField_End";

        /// <summary>
        /// Flex Field Field is a string field start
        /// </summary>
        private const string Placeholder_FlexField_Field_IsStringField_Start = "Field_IsStringField_Start";

        /// <summary>
        /// Flex Field Field is a string field end
        /// </summary>
        private const string Placeholder_FlexField_Field_IsStringField_End = "Field_IsStringField_End";


        /// <summary>
        /// Export default template provider
        /// </summary>
        private readonly ICachedExportDefaultTemplateProvider _defaultTemplateProvider;

        /// <summary>
        /// Export Cached Db Access
        /// </summary>
        private readonly IExportCachedDbAccess _exportCachedDbAccess;

        /// <summary>
        /// Language Key Generator
        /// </summary>
        private readonly ILanguageKeyGenerator _languageKeyGenerator;

        /// <summary>
        /// Placeholder Prefix
        /// </summary>
        private readonly string _placeholderPrefix;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="defaultTemplateProvider">Default Template Provider</param>
        /// <param name="exportCachedDbAccess">Export Cached Db Access</param>
        /// <param name="languageKeyGenerator">Language Key Generator</param>
        /// <param name="localizerFactory">Localizer Factory</param>
        /// <param name="placeholderPrefix">Placeholder Prefix</param>
        public FlexFieldExportTemplatePlaceholderResolver(ICachedExportDefaultTemplateProvider defaultTemplateProvider, IExportCachedDbAccess exportCachedDbAccess, ILanguageKeyGenerator languageKeyGenerator, IStringLocalizerFactory localizerFactory, string placeholderPrefix = FlexField_Default_Placeholder_Prefix) :
                                                          base(localizerFactory.Create(typeof(FlexFieldExportTemplatePlaceholderResolver)))
        {
            _defaultTemplateProvider = defaultTemplateProvider;
            _exportCachedDbAccess = exportCachedDbAccess;
            _languageKeyGenerator = languageKeyGenerator;
            _placeholderPrefix = placeholderPrefix;
        }

        /// <summary>
        /// Fills the placeholders of a code
        /// </summary>
        /// <param name="code">Code to fill</param>
        /// <param name="data">Export Data</param>
        /// <returns>Filled Code</returns>
        public Task<string> FillPlaceholders(string code, ExportObjectData data)
        {
            // Check Data
            if(!data.ExportData.ContainsKey(ExportConstants.ExportDataObject))
            {
                return Task.FromResult(code);
            }

            IFlexFieldExportable flexFieldObject = data.ExportData[ExportConstants.ExportDataObject] as IFlexFieldExportable;
            if(flexFieldObject == null)
            {
                return Task.FromResult(code);
            }

            // Replace Flex Field Placeholders
            return FillFlexFieldPlaceholders(code, flexFieldObject, data.ExportData[ExportConstants.ExportDataObjectType].ToString());
        }

        /// <summary>
        /// Concats a placeholder with a prefix
        /// </summary>
        /// <param name="prefix">Prefix to use</param>
        /// <param name="placeholder">Placeholder</param>
        /// <returns>Concated placeholder</returns>
        private string ConcatPlaceholder(string prefix, string placeholder)
        {
            return prefix + "_" + placeholder; 
        }

        /// <summary>
        /// Builds a final placeholder
        /// </summary>
        /// <param name="placeholder">Placeholder</param>
        /// <returns>Final Placeholder</returns>
        private string BuildFinalPlaceholder(string placeholder)
        {
            return ConcatPlaceholder(_placeholderPrefix, placeholder);
        }

        /// <summary>
        /// Fills the Flex Field Placeholders
        /// </summary>
        /// <param name="code">Code to fill</param>
        /// <param name="flexFieldObject">Flex Field Object</param>
        /// <param name="objectType">Object Type</param>
        /// <returns>Filled Code</returns>
        private async Task<string> FillFlexFieldPlaceholders(string code, IFlexFieldExportable flexFieldObject, string objectType)
        {
            GoNorthProject project = await _exportCachedDbAccess.GetDefaultProject();
            ExportSettings exportSettings = await _exportCachedDbAccess.GetExportSettings(project.Id);
            ExportTemplate attributeListTemplate = await _defaultTemplateProvider.GetDefaultTemplateByType(project.Id, TemplateType.ObjectAttributeList);

            HashSet<string> usedFields = new HashSet<string>();
            code = ExportUtil.BuildPlaceholderRegex(BuildFinalPlaceholder(Placeholder_Name)).Replace(code, flexFieldObject.Name);
            code = ExportUtil.BuildPlaceholderRegex(BuildFinalPlaceholder(Placeholder_Name_LangKey)).Replace(code, m => {
                // Run in function to only create language key if required
                string key = _languageKeyGenerator.GetFlexFieldNameKey(flexFieldObject.Id, flexFieldObject.Name, objectType).Result;
                return key;
            }); 
            code = ExportUtil.BuildPlaceholderRegex(BuildFinalPlaceholder(Placeholder_Field_Value)).Replace(code, m => {
                string fieldName = m.Groups[1].Value;
                FlexField field = FindFlexField(flexFieldObject, fieldName);
                if(field != null)
                {
                    usedFields.Add(field.Id);
                    return EscapedFieldValue(field, exportSettings);
                }

                _errorCollection.AddErrorFlexField(fieldName, flexFieldObject.Name);
                return "<<" + flexFieldObject.Name + "[" + fieldName + "] MISSING>>";
            });
            code = ExportUtil.BuildPlaceholderRegex(BuildFinalPlaceholder(Placeholder_Field_LangKey)).Replace(code, m => {
                string fieldName = m.Groups[1].Value;
                FlexField field = FindFlexField(flexFieldObject, fieldName);
                if(field != null && (field.FieldType == ExportConstants.FlexFieldType_String || field.FieldType == ExportConstants.FlexFieldType_Option))
                {
                    usedFields.Add(field.Id);
                    return BuildFlexFieldLangKey(flexFieldObject, field, objectType);
                }

                _errorCollection.AddErrorFlexField(fieldName, flexFieldObject.Name);
                return "<<" + flexFieldObject.Name + "[" + fieldName + "] MISSING>>";
            });

            code = ExportUtil.BuildPlaceholderRegex(BuildFinalPlaceholder(Placeholder_UnusedFields), ExportConstants.ListIndentPrefix).Replace(code, m => {
                return BuildFlexFieldListTemplate(attributeListTemplate.Code, Placeholder_UnusedFields_Start, Placeholder_UnusedFields_End, m.Groups[1].Value);
            });
            code = ExportUtil.BuildPlaceholderRegex(BuildFinalPlaceholder(Placeholder_AllFields), ExportConstants.ListIndentPrefix).Replace(code, m => {
                return BuildFlexFieldListTemplate(attributeListTemplate.Code, Placeholder_AllFields_Start, Placeholder_AllFields_End, m.Groups[1].Value);
            });
            code = ExportUtil.BuildRangePlaceholderRegex(BuildFinalPlaceholder(Placeholder_UnusedFields_Start), BuildFinalPlaceholder(Placeholder_UnusedFields_End)).Replace(code, m => {
                List<FlexField> fieldsToUse = flexFieldObject.Fields.Where(f => !usedFields.Contains(f.Id)).ToList();
                return BuildFlexFieldList(m.Groups[1].Value, fieldsToUse, flexFieldObject, exportSettings, objectType); 
            });
            code = ExportUtil.BuildRangePlaceholderRegex(BuildFinalPlaceholder(Placeholder_AllFields_Start), BuildFinalPlaceholder(Placeholder_AllFields_End)).Replace(code, m => {
                return BuildFlexFieldList(m.Groups[1].Value, flexFieldObject.Fields, flexFieldObject, exportSettings, objectType); 
            });

            return code;
        }

        /// <summary>
        /// Builds the flex field attribute list
        /// </summary>
        /// <param name="code">Code</param>
        /// <param name="placeholderStart">Placeholder for the start</param>
        /// <param name="placeholderEnd">Placeholder for the end</param>
        /// <param name="lineIndent">Line Indent</param>
        /// <returns>Attribute template list</returns>
        private string BuildFlexFieldListTemplate(string code, string placeholderStart, string placeholderEnd, string lineIndent)
        {
            code = ExportUtil.BuildPlaceholderRegex(ConcatPlaceholder(FlexField_Default_Placeholder_Prefix, Placeholder_Field_List_Start)).Replace(code, ExportUtil.WrapPlaceholderWithBrackets(ConcatPlaceholder(FlexField_Default_Placeholder_Prefix, placeholderStart)));
            code = ExportUtil.BuildPlaceholderRegex(ConcatPlaceholder(FlexField_Default_Placeholder_Prefix, Placeholder_Field_List_End)).Replace(code, ExportUtil.WrapPlaceholderWithBrackets(ConcatPlaceholder(FlexField_Default_Placeholder_Prefix, placeholderEnd)));
            
            if(_placeholderPrefix != FlexField_Default_Placeholder_Prefix)
            {
                Regex placeholderPrefixReplaceRegex = new Regex(ExportConstants.PlaceholderBracketsStart + FlexField_Default_Placeholder_Prefix, RegexOptions.Multiline);
                code = placeholderPrefixReplaceRegex.Replace(code, ExportConstants.PlaceholderBracketsStart + _placeholderPrefix);
            }
            
            return ExportUtil.IndentListTemplate(code, lineIndent);
        }

        /// <summary>
        /// Builds the flex field language key
        /// </summary>
        /// <param name="flexFieldObject">Flex Field Object</param>
        /// <param name="field">Field</param>
        /// <param name="objectType">Objcet type</param>
        /// <returns>Language Key</returns>
        private string BuildFlexFieldLangKey(IFlexFieldExportable flexFieldObject, FlexField field, string objectType)
        {
            return _languageKeyGenerator.GetFlexFieldFieldKey(flexFieldObject.Id, flexFieldObject.Name, objectType, field.Id, field.Name, field.Value).Result;
        }

        /// <summary>
        /// Finds a flex field
        /// </summary>
        /// <param name="flexFieldObject">Flex field object to search</param>
        /// <param name="fieldName">Name of the field</param>
        /// <returns>Found field, null if field does not exist</returns>
        private FlexField FindFlexField(IFlexFieldExportable flexFieldObject, string fieldName)
        {
            fieldName = fieldName.ToLowerInvariant();
            FlexField field = flexFieldObject.Fields.FirstOrDefault(f => f.Name.ToLowerInvariant() == fieldName || 
                                                                    (f.ScriptSettings != null && !string.IsNullOrEmpty(f.ScriptSettings.AdditionalScriptNames) && 
                                                                        f.ScriptSettings.AdditionalScriptNames.Split(ExportConstants.FlexFieldAdditionalScriptNamesSeperator).Any(name => name.ToLowerInvariant() == fieldName)));

            return field;
        }

        /// <summary>
        /// Builds a list of flex field values
        /// </summary>
        /// <param name="attributeTemplate">Attribute Template</param>
        /// <param name="fields">List of fields</param>
        /// <param name="flexFieldObject">Flex Field object</param>
        /// <param name="exportSettings">Export Settings</param>
        /// <param name="objectType">Object Type</param>
        /// <returns>Flex Field list</returns>
        private string BuildFlexFieldList(string attributeTemplate, List<FlexField> fields, IFlexFieldExportable flexFieldObject, ExportSettings exportSettings, string objectType)
        {
            string fieldContent = string.Empty;
            foreach(FlexField curField in fields)
            {
                if(curField.ScriptSettings != null && curField.ScriptSettings.DontExportToScript)
                {
                    continue;
                }

                if(curField.FieldType != ExportConstants.FlexFieldType_Number && curField.FieldType != ExportConstants.FlexFieldType_String && curField.FieldType != ExportConstants.FlexFieldType_Option)
                {
                    continue;
                }

                string fieldCode = FillFlexFieldTemplate(attributeTemplate, curField.Name, curField, flexFieldObject, exportSettings, objectType);
                if(curField.ScriptSettings != null && !string.IsNullOrEmpty(curField.ScriptSettings.AdditionalScriptNames))
                {
                    string[] additionalScriptNames = curField.ScriptSettings.AdditionalScriptNames.Split(ExportConstants.FlexFieldAdditionalScriptNamesSeperator, StringSplitOptions.RemoveEmptyEntries);
                    foreach(string curAdditionalName in additionalScriptNames)
                    {
                        fieldCode += FillFlexFieldTemplate(attributeTemplate, curAdditionalName, curField, flexFieldObject, exportSettings, objectType);
                    }
                }

                fieldContent += fieldCode;
            }

            return fieldContent;
        }

        /// <summary>
        /// Fills a flex field template
        /// </summary>
        /// <param name="code">Code</param>
        /// <param name="name">Name to use</param>
        /// <param name="field">Field</param>
        /// <param name="flexFieldObject">Flex Field object</param>
        /// <param name="exportSettings">Export Settings</param>
        /// <param name="objectType">Object Type</param>
        /// <returns>Filled template</returns>
        private string FillFlexFieldTemplate(string code, string name, FlexField field, IFlexFieldExportable flexFieldObject, ExportSettings exportSettings, string objectType)
        {
            code = ExportUtil.RenderPlaceholderIfTrue(code, BuildFinalPlaceholder(Placeholder_FlexField_Field_IsNumberField_Start), BuildFinalPlaceholder(Placeholder_FlexField_Field_IsNumberField_End), field.FieldType == ExportConstants.FlexFieldType_Number);
            code = ExportUtil.RenderPlaceholderIfTrue(code, BuildFinalPlaceholder(Placeholder_FlexField_Field_IsStringField_Start), BuildFinalPlaceholder(Placeholder_FlexField_Field_IsStringField_End), field.FieldType == ExportConstants.FlexFieldType_String || field.FieldType == ExportConstants.FlexFieldType_Option);

            code = ExportUtil.BuildPlaceholderRegex(BuildFinalPlaceholder(Placeholder_FlexField_Field_Name)).Replace(code, name);
            code = ExportUtil.BuildPlaceholderRegex(BuildFinalPlaceholder(Placeholder_FlexField_Field_Value)).Replace(code, EscapedFieldValue(field, exportSettings));
            if(field.FieldType == ExportConstants.FlexFieldType_String || field.FieldType == ExportConstants.FlexFieldType_Option)
            {
                code = ExportUtil.BuildPlaceholderRegex(BuildFinalPlaceholder(Placeholder_FlexField_Field_LangKey)).Replace(code, m => {
                    // Run in function to only create needed language keys
                    return BuildFlexFieldLangKey(flexFieldObject, field, objectType);
                });
            }
            return code;
        }

        /// <summary>
        /// Returns the escaped field value
        /// </summary>
        /// <param name="field">Field</param>
        /// <param name="exportSettings">Export settings</param>
        /// <returns>Escaped Field Value</returns>
        private string EscapedFieldValue(FlexField field, ExportSettings exportSettings)
        {
            if(field.FieldType == ExportConstants.FlexFieldType_Number)
            {
                return field.Value;
            }

            return ExportUtil.EscapeCharacters(field.Value, exportSettings.EscapeCharacter, exportSettings.CharactersNeedingEscaping, exportSettings.NewlineCharacter);
        }

        /// <summary>
        /// Returns if the placeholder resolver is valid for a template type
        /// </summary>
        /// <param name="templateType">Template Type</param>
        /// <returns>true if the template type is valid for the template type</returns>
        public bool IsValidForTemplateType(TemplateType templateType)
        {
            return templateType == TemplateType.ObjectItem || templateType == TemplateType.ObjectNpc || templateType == TemplateType.ObjectSkill ||
                   templateType == TemplateType.ObjectAttributeList;
        }

        /// <summary>
        /// Returns the Export Template Placeholders for a Template Type
        /// </summary>
        /// <param name="templateType">Template Type</param>
        /// <returns>Export Template Placeholder</returns>
        public List<ExportTemplatePlaceholder> GetExportTemplatePlaceholdersForType(TemplateType templateType)
        {
            if(templateType == TemplateType.ObjectNpc || templateType == TemplateType.ObjectItem || templateType == TemplateType.ObjectSkill)
            {
                return new List<ExportTemplatePlaceholder>() {
                    CreateFlexFieldPlaceHolder(Placeholder_Name),
                    CreateFlexFieldPlaceHolder(Placeholder_Name_LangKey),
                    CreateFlexFieldPlaceHolder(Placeholder_Field_Value_FriendlyName),
                    CreateFlexFieldPlaceHolder(Placeholder_Field_LangKey_FriendlyName),
                    CreateFlexFieldPlaceHolder(Placeholder_UnusedFields),
                    CreateFlexFieldPlaceHolder(Placeholder_UnusedFields_Start),
                    CreateFlexFieldPlaceHolder(Placeholder_UnusedFields_End),
                    CreateFlexFieldPlaceHolder(Placeholder_AllFields),
                    CreateFlexFieldPlaceHolder(Placeholder_AllFields_Start),
                    CreateFlexFieldPlaceHolder(Placeholder_AllFields_End),
                    CreateFlexFieldPlaceHolder(Placeholder_FlexField_Field_Name),
                    CreateFlexFieldPlaceHolder(Placeholder_FlexField_Field_Value),
                    CreateFlexFieldPlaceHolder(Placeholder_FlexField_Field_LangKey),
                    CreateFlexFieldPlaceHolder(Placeholder_FlexField_Field_IsNumberField_Start),
                    CreateFlexFieldPlaceHolder(Placeholder_FlexField_Field_IsNumberField_End),
                    CreateFlexFieldPlaceHolder(Placeholder_FlexField_Field_IsStringField_Start),
                    CreateFlexFieldPlaceHolder(Placeholder_FlexField_Field_IsStringField_End)
                };
            }
            else if(templateType == TemplateType.ObjectAttributeList)
            {
                return new List<ExportTemplatePlaceholder>() {
                    CreateFlexFieldPlaceHolder(Placeholder_Field_List_Start),
                    CreateFlexFieldPlaceHolder(Placeholder_Field_List_End),
                    CreateFlexFieldPlaceHolder(Placeholder_FlexField_Field_Name),
                    CreateFlexFieldPlaceHolder(Placeholder_FlexField_Field_Value),
                    CreateFlexFieldPlaceHolder(Placeholder_FlexField_Field_LangKey),
                    CreateFlexFieldPlaceHolder(Placeholder_FlexField_Field_IsNumberField_Start),
                    CreateFlexFieldPlaceHolder(Placeholder_FlexField_Field_IsNumberField_End),
                    CreateFlexFieldPlaceHolder(Placeholder_FlexField_Field_IsStringField_Start),
                    CreateFlexFieldPlaceHolder(Placeholder_FlexField_Field_IsStringField_End)
                };
            }

            return new List<ExportTemplatePlaceholder>();
        }

        /// <summary>
        /// Creates a new flex field placeholder
        /// </summary>
        /// <param name="placeholderName">Placeholder Name</param>
        /// <returns>Export Template Placeholder</returns>
        protected ExportTemplatePlaceholder CreateFlexFieldPlaceHolder(string placeholderName)
        {
            return new ExportTemplatePlaceholder {
                Name = BuildFinalPlaceholder(placeholderName),
                Description = _localizer["PlaceholderDesc_" + ConcatPlaceholder(FlexField_Default_Placeholder_Prefix, placeholderName)].Value
            };
        }
    }
}