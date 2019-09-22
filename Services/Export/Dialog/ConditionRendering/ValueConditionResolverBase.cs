using System;
using System.Collections.Generic;
using System.Linq;
using GoNorth.Data.Exporting;
using GoNorth.Data.FlexFieldDatabase;
using GoNorth.Data.Kortisto;
using GoNorth.Data.Project;
using GoNorth.Services.Export.Data;
using GoNorth.Services.Export.Dialog.ActionConditionShared;
using GoNorth.Services.Export.LanguageKeyGeneration;
using GoNorth.Services.Export.Placeholder;
using Microsoft.Extensions.Localization;

namespace GoNorth.Services.Export.Dialog.ConditionRendering
{
    /// <summary>
    /// Base Class for rendering a value condition
    /// </summary>
    public abstract class ValueConditionResolverBase :  BaseConditionRenderer<ValueConditionResolverBase.ValueFieldConditionData>
    {
        /// <summary>
        /// Value Field Condition Data
        /// </summary>
        public class ValueFieldConditionData
        {
            /// <summary>
            /// Field Id
            /// </summary>
            public string FieldId { get; set; }

            /// <summary>
            /// Field Name
            /// </summary>
            public string FieldName { get; set; }

            /// <summary>
            /// Operator for the condition data
            /// </summary>
            public string Operator { get; set; }

            /// <summary>
            /// Compare value
            /// </summary>
            public string CompareValue { get; set; }

            /// <summary>
            /// Selected Object Id
            /// </summary>
            public string SelectedObjectId { get; set; }
        }


        /// <summary>
        /// Value naame
        /// </summary>
        private const string Placeholder_ValueName = "Tale_Condition_ValueName";

        /// <summary>
        /// Operator placeholder
        /// </summary>
        private const string Placeholder_Operator = "Tale_Condition_ValueOperator";

        /// <summary>
        /// Placeholder for the start of content that will only be rendered if it is a primitive operator
        /// </summary>
        private const string Placeholder_IsOperatorPrimitiveStart = "Tale_Condition_ValueOperator_IsPrimitive_Start";

        /// <summary>
        /// Placeholder for the end of content that will only be rendered if it is a primitive operator
        /// </summary>
        private const string Placeholder_IsOperatorPrimitiveEnd = "Tale_Condition_ValueOperator_IsPrimitive_End";

        /// <summary>
        /// Placeholder for the start of content that will only be rendered if it is a non-primitive operator
        /// </summary>
        private const string Placeholder_IsOperatorNonPrimitiveStart = "Tale_Condition_ValueOperator_IsNonPrimitive_Start";

        /// <summary>
        /// Placeholder for the end of content that will only be rendered if it is a non-primitive operator
        /// </summary>
        private const string Placeholder_IsOperatorNonPrimitiveEnd = "Tale_Condition_ValueOperator_IsNonPrimitive_End";

        /// <summary>
        /// Placeholder for the start of content that will only be rendered if the field is a number field
        /// </summary>
        private const string Placeholder_ValueIsNumber_Start = "Tale_Condition_ValueIsNumber_Start";

        /// <summary>
        /// Placeholder for the end of content that will only be rendered if the field is a number field
        /// </summary>
        private const string Placeholder_ValueIsNumber_End = "Tale_Condition_ValueIsNumber_End";

        /// <summary>
        /// Placeholder for the start of content that will only be rendered if the field is a string field
        /// </summary>
        private const string Placeholder_ValueIsString_Start = "Tale_Condition_ValueIsString_Start";

        /// <summary>
        /// Placeholder for the end of content that will only be rendered if the field is a string field
        /// </summary>
        private const string Placeholder_ValueIsString_End = "Tale_Condition_ValueIsString_End";


 
        /// <summary>
        /// Placeholder for the start of the content that will only be rendered if the name of the value equals a certain value
        /// </summary>
        private const string Placeholder_ValueNameEquals_Start = "Tale_Condition_ValueName_Equals_(.*)_Start";
        
        /// <summary>
        /// Placeholder for the start of the content that will only be rendered if the name of the value equals a certain value friendly name
        /// </summary>
        private const string Placeholder_ValueNameEquals_Start_FriendlyName = "Tale_Condition_ValueName_Equals_NAME_OF_FIELD_Start";
        
        /// <summary>
        /// Placeholder for the end of the content that will only be rendered if the name of the value equals a certain value
        /// </summary>
        private const string Placeholder_ValueNameEquals_End = "Tale_Condition_ValueName_Equals_End";
        
        /// <summary>
        /// Placeholder for the start of the content that will only be rendered if the name of the value does not equal a certain value
        /// </summary>
        private const string Placeholder_ValueNameNotEquals_Start = "Tale_Condition_ValueName_NotEquals_(.*)_Start";
        
        /// <summary>
        /// Placeholder for the start of the content that will only be rendered if the name of the value does not equal a certain value friendly name
        /// </summary>
        private const string Placeholder_ValueNameNotEquals_Start_FriendlyName = "Tale_Condition_ValueName_NotEquals_NAME_OF_FIELD_Start";
        
        /// <summary>
        /// Placeholder for the end of the content that will only be rendered if the name of the value does not equal a certain value
        /// </summary>
        private const string Placeholder_ValueNameNotEquals_End = "Tale_Condition_ValueName_NotEquals_End";



        /// <summary>
        /// Compare value
        /// </summary>
        private const string Placeholder_CompareValue = "Tale_Condition_CompareValue";


        /// <summary>
        /// Default Template Provider
        /// </summary>
        protected readonly ICachedExportDefaultTemplateProvider _defaultTemplateProvider;

        /// <summary>
        /// Cached Db Access
        /// </summary>
        protected readonly IExportCachedDbAccess _cachedDbAccess;

        /// <summary>
        /// String Localizer
        /// </summary>
        private readonly IStringLocalizer _localizer;

        /// <summary>
        /// Resolver for flex field values
        /// </summary>
        private readonly FlexFieldExportTemplatePlaceholderResolver _flexFieldPlaceholderResolver;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="defaultTemplateProvider">Default Template Provider</param>
        /// <param name="cachedDbAccess">Cached Db Access</param>        
        /// <param name="languageKeyGenerator">Language Key Generator</param>
        /// <param name="localizerFactory">Localizer Factory</param>
        public ValueConditionResolverBase(ICachedExportDefaultTemplateProvider defaultTemplateProvider, IExportCachedDbAccess cachedDbAccess, ILanguageKeyGenerator languageKeyGenerator, IStringLocalizerFactory localizerFactory)
        {
            _defaultTemplateProvider = defaultTemplateProvider;
            _cachedDbAccess = cachedDbAccess;
            _localizer = localizerFactory.Create(typeof(ValueConditionResolverBase));
            _flexFieldPlaceholderResolver = new FlexFieldExportTemplatePlaceholderResolver(defaultTemplateProvider, cachedDbAccess, languageKeyGenerator, localizerFactory, GetFlexFieldPrefix());
        }

        /// <summary>
        /// Builds a condition element from parsed data
        /// </summary>
        /// <param name="parsedData">Parsed data</param>
        /// <param name="project">Project</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <param name="flexFieldObject">Flex field object to which the dialog belongs</param>
        /// <param name="exportSettings">Export Settings</param>
        /// <returns>Condition string</returns>
        public override string BuildConditionElementFromParsedData(ValueConditionResolverBase.ValueFieldConditionData parsedData, GoNorthProject project, ExportPlaceholderErrorCollection errorCollection, FlexFieldObject flexFieldObject, ExportSettings exportSettings)
        {
            ExportTemplate conditionTemplate = GetExportTemplate(project);
            IFlexFieldExportable valueObject = GetValueObject(parsedData, flexFieldObject, errorCollection);
            if(valueObject == null)
            {
                return string.Empty;
            }

            FlexField exportField = DialogFlexFieldUtil.GetFlexField(valueObject, parsedData.FieldId);
            if(exportField == null)
            {
                errorCollection.AddErrorFlexField(parsedData.FieldName, valueObject.Name);
                return string.Empty;
            }

            string conditionCode = conditionTemplate.Code;
            conditionCode = ExportUtil.RenderPlaceholderIfTrue(conditionCode, Placeholder_IsOperatorPrimitiveStart, Placeholder_IsOperatorPrimitiveEnd, IsOperatorPrimitiveOperator(parsedData.Operator));
            conditionCode = ExportUtil.RenderPlaceholderIfTrue(conditionCode, Placeholder_IsOperatorNonPrimitiveStart, Placeholder_IsOperatorNonPrimitiveEnd, !IsOperatorPrimitiveOperator(parsedData.Operator));
            conditionCode = ExportUtil.BuildPlaceholderRegex(Placeholder_ValueName).Replace(conditionCode, m => {
                return DialogFlexFieldUtil.GetFieldName(exportField, parsedData.FieldName, errorCollection);
            });
            conditionCode = ExportUtil.BuildPlaceholderRegex(Placeholder_Operator).Replace(conditionCode, GetOperatorFromTemplate(project, parsedData.Operator, errorCollection));
            conditionCode = ExportUtil.RenderPlaceholderIfTrue(conditionCode, Placeholder_ValueIsString_Start, Placeholder_ValueIsString_End, exportField.FieldType != ExportConstants.FlexFieldType_Number);
            conditionCode = ExportUtil.RenderPlaceholderIfTrue(conditionCode, Placeholder_ValueIsNumber_Start, Placeholder_ValueIsNumber_End, exportField.FieldType == ExportConstants.FlexFieldType_Number);
            conditionCode = ExportUtil.RenderPlaceholderIfFuncTrue(conditionCode, Placeholder_ValueNameEquals_Start, Placeholder_ValueNameEquals_End, m => {
                string searchedFieldName = m.Groups[1].Value;
                searchedFieldName = searchedFieldName.ToLowerInvariant();
                string fieldName = string.Empty;
                if(!string.IsNullOrEmpty(exportField.Name))
                {
                    fieldName = exportField.Name.ToLowerInvariant();
                }
                return fieldName == searchedFieldName;
            });
            conditionCode = ExportUtil.RenderPlaceholderIfFuncTrue(conditionCode, Placeholder_ValueNameNotEquals_Start, Placeholder_ValueNameNotEquals_End, m => {
                string searchedFieldName = m.Groups[1].Value;
                searchedFieldName = searchedFieldName.ToLowerInvariant();
                string fieldName = string.Empty;
                if(!string.IsNullOrEmpty(exportField.Name))
                {
                    fieldName = exportField.Name.ToLowerInvariant();
                }
                return fieldName != searchedFieldName;
            });
            conditionCode = ExportUtil.BuildPlaceholderRegex(Placeholder_CompareValue).Replace(conditionCode, m => {
                if(exportField.FieldType != ExportConstants.FlexFieldType_Number) 
                {
                    return ExportUtil.EscapeCharacters(parsedData.CompareValue, exportSettings.EscapeCharacter, exportSettings.CharactersNeedingEscaping, exportSettings.NewlineCharacter);
                }

                return parsedData.CompareValue;
            });

            ExportObjectData flexFieldExportData = new ExportObjectData();
            flexFieldExportData.ExportData.Add(ExportConstants.ExportDataObject, valueObject);
            flexFieldExportData.ExportData.Add(ExportConstants.ExportDataObjectType, GetFlexFieldExportObjectType());

            _flexFieldPlaceholderResolver.SetErrorMessageCollection(errorCollection);
            conditionCode = _flexFieldPlaceholderResolver.FillPlaceholders(conditionCode, flexFieldExportData).Result;

            return conditionCode;
        }


        /// <summary>
        /// Returns the flex field prefix
        /// </summary>
        /// <returns>Flex Field Prefix</returns>        
        protected abstract string GetFlexFieldPrefix();

        /// <summary>
        /// Returns the flex field export object type
        /// </summary>
        /// <returns>Flex field export object type</returns>
        protected abstract string GetFlexFieldExportObjectType();

        /// <summary>
        /// Returns the export template to use
        /// </summary>
        /// <param name="project">Project</param>
        /// <returns>Export template to use</returns>
        protected abstract ExportTemplate GetExportTemplate(GoNorthProject project);

        /// <summary>
        /// Returns the value object to use
        /// </summary>
        /// <param name="parsedData">Parsed data</param>
        /// <param name="flexFieldObject">Flex field object</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <returns>Value Object</returns>
        protected abstract IFlexFieldExportable GetValueObject(ValueFieldConditionData parsedData, FlexFieldObject flexFieldObject, ExportPlaceholderErrorCollection errorCollection);

        /// <summary>
        /// Returns the operator from the template of the condition
        /// </summary>
        /// <param name="project">Project</param>
        /// <param name="conditionOperator">Condition Operator</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <returns>Condition Operator</returns>
        private string GetOperatorFromTemplate(GoNorthProject project, string conditionOperator, ExportPlaceholderErrorCollection errorCollection)
        {
            switch(conditionOperator.ToLowerInvariant())
            {
            case "=":
                return _defaultTemplateProvider.GetDefaultTemplateByType(project.Id, TemplateType.GeneralCompareOperatorEqual).Result.Code;
            case "!=":
                return _defaultTemplateProvider.GetDefaultTemplateByType(project.Id, TemplateType.GeneralCompareOperatorNotEqual).Result.Code;
            case "<":
                return _defaultTemplateProvider.GetDefaultTemplateByType(project.Id, TemplateType.GeneralCompareOperatorLess).Result.Code;
            case "<=":
                return _defaultTemplateProvider.GetDefaultTemplateByType(project.Id, TemplateType.GeneralCompareOperatorLessOrEqual).Result.Code;
            case ">":
                return _defaultTemplateProvider.GetDefaultTemplateByType(project.Id, TemplateType.GeneralCompareOperatorBigger).Result.Code;
            case ">=":
                return _defaultTemplateProvider.GetDefaultTemplateByType(project.Id, TemplateType.GeneralCompareOperatorBiggerOrEqual).Result.Code;
            case "contains":
                return _defaultTemplateProvider.GetDefaultTemplateByType(project.Id, TemplateType.GeneralCompareOperatorContains).Result.Code;
            case "startswith":
                return _defaultTemplateProvider.GetDefaultTemplateByType(project.Id, TemplateType.GeneralCompareOperatorStartsWith).Result.Code;
            case "endswith":
                return _defaultTemplateProvider.GetDefaultTemplateByType(project.Id, TemplateType.GeneralCompareOperatorEndsWith).Result.Code;
            }

            errorCollection.AddDialogUnknownConditionOperator(conditionOperator);
            return string.Empty;
        }

        /// <summary>
        /// Returns true if a condition operator is a primitive operator or not
        /// </summary>
        /// <param name="conditionOperator">Operator</param>
        /// <returns>true if the operator is a primitive operator</returns>
        private bool IsOperatorPrimitiveOperator(string conditionOperator)
        {
            conditionOperator = conditionOperator.ToLowerInvariant();
            return conditionOperator != "contains" && conditionOperator != "startswith" && conditionOperator != "endswith";
        }


        /// <summary>
        /// Returns the Export Template Placeholders for a Template Type
        /// </summary>
        /// <param name="templateType">Template Type</param>
        /// <returns>Export Template Placeholder</returns>
        public override List<ExportTemplatePlaceholder> GetExportTemplatePlaceholdersForType(TemplateType templateType)
        {
            List<ExportTemplatePlaceholder> exportPlaceholders = new List<ExportTemplatePlaceholder> {
                ExportUtil.CreatePlaceHolder(Placeholder_ValueName, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_Operator, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_IsOperatorPrimitiveStart, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_IsOperatorPrimitiveEnd, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_IsOperatorNonPrimitiveStart, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_IsOperatorNonPrimitiveEnd, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_ValueIsNumber_Start, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_ValueIsNumber_End, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_ValueIsString_Start, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_ValueIsString_End, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_ValueNameEquals_Start_FriendlyName, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_ValueNameEquals_End, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_ValueNameNotEquals_Start_FriendlyName, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_ValueNameNotEquals_End, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_CompareValue, _localizer)
            };

            exportPlaceholders.AddRange(_flexFieldPlaceholderResolver.GetExportTemplatePlaceholdersForType(TemplateType.ObjectNpc));

            return exportPlaceholders;
        }
    }
}