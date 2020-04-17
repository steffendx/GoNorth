using System.Collections.Generic;
using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Data.FlexFieldDatabase;
using GoNorth.Services.Export.Data;
using GoNorth.Services.Export.Dialog.ActionConditionShared;
using GoNorth.Services.Export.Dialog.ActionRendering.ConfigObject;
using GoNorth.Services.Export.Dialog.ActionRendering.SharedRendering;
using GoNorth.Services.Export.Dialog.StepRenderers.ActionRenderer;
using GoNorth.Services.Export.LanguageKeyGeneration;
using GoNorth.Services.Export.Placeholder;
using GoNorth.Services.Export.Placeholder.LegacyRenderingEngine;
using Microsoft.Extensions.Localization;

namespace GoNorth.Services.Export.Dialog.ActionRendering.LegacyRenderingEngine
{
    /// <summary>
    /// Base Class for rendering a value action
    /// </summary>
    public abstract class ValueActionRenderBase : BaseValueActionRenderer
    {
        /// <summary>
        /// Value naame
        /// </summary>
        private const string Placeholder_ValueName = "Tale_Action_ValueName";

        /// <summary>
        /// Operator placeholder
        /// </summary>
        private const string Placeholder_Operator = "Tale_Action_ValueOperator";

        /// <summary>
        /// Placeholder for the start of content that will only be rendered if the field is a number field
        /// </summary>
        private const string Placeholder_ValueIsNumber_Start = "Tale_Action_ValueIsNumber_Start";

        /// <summary>
        /// Placeholder for the end of content that will only be rendered if the field is a number field
        /// </summary>
        private const string Placeholder_ValueIsNumber_End = "Tale_Action_ValueIsNumber_End";

        /// <summary>
        /// Placeholder for the start of content that will only be rendered if the field is a string field
        /// </summary>
        private const string Placeholder_ValueIsString_Start = "Tale_Action_ValueIsString_Start";

        /// <summary>
        /// Placeholder for the end of content that will only be rendered if the field is a string field
        /// </summary>
        private const string Placeholder_ValueIsString_End = "Tale_Action_ValueIsString_End";

        /// <summary>
        /// Placeholder for the start of the content that will only be rendered if the operator is "set to"
        /// </summary>
        private const string Placeholder_OperatorIsSetTo_Start = "Tale_Action_OperatorIsSetTo_Start";

        /// <summary>
        /// Placeholder for the end of the content that will only be rendered if the operator is "set to"
        /// </summary>
        private const string Placeholder_OperatorIsSetTo_End = "Tale_Action_OperatorIsSetTo_End";
        
        /// <summary>
        /// Placeholder for the start of the content that will only be rendered if the operator is not "set to"
        /// </summary>
        private const string Placeholder_OperatorIsNotSetTo_Start = "Tale_Action_OperatorIsNotSetTo_Start";

        /// <summary>
        /// Placeholder for the end of the content that will only be rendered if the operator is not "set to"
        /// </summary>
        private const string Placeholder_OperatorIsNotSetTo_End = "Tale_Action_OperatorIsNotSetTo_End";

        /// <summary>
        /// Placeholder for the start of the content that will only be rendered if the operator is "add"
        /// </summary>
        private const string Placeholder_OperatorIsAdd_Start = "Tale_Action_OperatorIsAdd_Start";

        /// <summary>
        /// Placeholder for the end of the content that will only be rendered if the operator is "add"
        /// </summary>
        private const string Placeholder_OperatorIsAdd_End = "Tale_Action_OperatorIsAdd_End";
        
        /// <summary>
        /// Placeholder for the start of the content that will only be rendered if the operator is not "add"
        /// </summary>
        private const string Placeholder_OperatorIsNotAdd_Start = "Tale_Action_OperatorIsNotAdd_Start";

        /// <summary>
        /// Placeholder for the end of the content that will only be rendered if the operator is not "add"
        /// </summary>
        private const string Placeholder_OperatorIsNotAdd_End = "Tale_Action_OperatorIsNotAdd_End";

        /// <summary>
        /// Placeholder for the start of the content that will only be rendered if the operator is "Substract"
        /// </summary>
        private const string Placeholder_OperatorIsSubstract_Start = "Tale_Action_OperatorIsSubstract_Start";

        /// <summary>
        /// Placeholder for the end of the content that will only be rendered if the operator is "Substract"
        /// </summary>
        private const string Placeholder_OperatorIsSubstract_End = "Tale_Action_OperatorIsSubstract_End";
        
        /// <summary>
        /// Placeholder for the start of the content that will only be rendered if the operator is not "Substract"
        /// </summary>
        private const string Placeholder_OperatorIsNotSubstract_Start = "Tale_Action_OperatorIsNotSubstract_Start";

        /// <summary>
        /// Placeholder for the end of the content that will only be rendered if the operator is not "Substract"
        /// </summary>
        private const string Placeholder_OperatorIsNotSubstract_End = "Tale_Action_OperatorIsNotSubstract_End";

        /// <summary>
        /// Placeholder for the start of the content that will only be rendered if the operator is "multiply"
        /// </summary>
        private const string Placeholder_OperatorIsMultiply_Start = "Tale_Action_OperatorIsMultiply_Start";

        /// <summary>
        /// Placeholder for the end of the content that will only be rendered if the operator is "multiply"
        /// </summary>
        private const string Placeholder_OperatorIsMultiply_End = "Tale_Action_OperatorIsMultiply_End";
        
        /// <summary>
        /// Placeholder for the start of the content that will only be rendered if the operator is not "multiply"
        /// </summary>
        private const string Placeholder_OperatorIsNotMultiply_Start = "Tale_Action_OperatorIsNotMultiply_Start";

        /// <summary>
        /// Placeholder for the end of the content that will only be rendered if the operator is not "multiply"
        /// </summary>
        private const string Placeholder_OperatorIsNotMultiply_End = "Tale_Action_OperatorIsNotMultiply_End";

        /// <summary>
        /// Placeholder for the start of the content that will only be rendered if the operator is "divide"
        /// </summary>
        private const string Placeholder_OperatorIsDivide_Start = "Tale_Action_OperatorIsDivide_Start";

        /// <summary>
        /// Placeholder for the end of the content that will only be rendered if the operator is "divide"
        /// </summary>
        private const string Placeholder_OperatorIsDivide_End = "Tale_Action_OperatorIsDivide_End";
        
        /// <summary>
        /// Placeholder for the start of the content that will only be rendered if the operator is not "divide"
        /// </summary>
        private const string Placeholder_OperatorIsNotDivide_Start = "Tale_Action_OperatorIsNotDivide_Start";

        /// <summary>
        /// Placeholder for the end of the content that will only be rendered if the operator is not "divide"
        /// </summary>
        private const string Placeholder_OperatorIsNotDivide_End = "Tale_Action_OperatorIsNotDivide_End";

        /// <summary>
        /// Placeholder for the start of the content that will only be rendered if the name of the value equals a certain value
        /// </summary>
        private const string Placeholder_ValueNameEquals_Start = "Tale_Action_ValueName_Equals_(.*)_Start";
        
        /// <summary>
        /// Placeholder for the start of the content that will only be rendered if the name of the value equals a certain value friendly name
        /// </summary>
        private const string Placeholder_ValueNameEquals_Start_FriendlyName = "Tale_Action_ValueName_Equals_NAME_OF_FIELD_Start";
        
        /// <summary>
        /// Placeholder for the end of the content that will only be rendered if the name of the value equals a certain value
        /// </summary>
        private const string Placeholder_ValueNameEquals_End = "Tale_Action_ValueName_Equals_End";
        
        /// <summary>
        /// Placeholder for the start of the content that will only be rendered if the name of the value does not equal a certain value
        /// </summary>
        private const string Placeholder_ValueNameNotEquals_Start = "Tale_Action_ValueName_NotEquals_(.*)_Start";
        
        /// <summary>
        /// Placeholder for the start of the content that will only be rendered if the name of the value does not equal a certain value friendly name
        /// </summary>
        private const string Placeholder_ValueNameNotEquals_Start_FriendlyName = "Tale_Action_ValueName_NotEquals_NAME_OF_FIELD_Start";
        
        /// <summary>
        /// Placeholder for the end of the content that will only be rendered if the name of the value does not equal a certain value
        /// </summary>
        private const string Placeholder_ValueNameNotEquals_End = "Tale_Action_ValueName_NotEquals_End";

        /// <summary>
        /// Value change
        /// </summary>
        private const string Placeholder_ValueChange = "Tale_Action_ValueChange";


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
        public ValueActionRenderBase(ICachedExportDefaultTemplateProvider defaultTemplateProvider, IExportCachedDbAccess cachedDbAccess, ILanguageKeyGenerator languageKeyGenerator, IStringLocalizerFactory localizerFactory) :
                                     base(defaultTemplateProvider, cachedDbAccess)
        {
            _localizer = localizerFactory.Create(typeof(ValueActionRenderBase));
            _flexFieldPlaceholderResolver = new FlexFieldExportTemplatePlaceholderResolver(defaultTemplateProvider, cachedDbAccess, languageKeyGenerator, localizerFactory, GetFlexFieldPrefix());
        }

        /// <summary>
        /// Sets the export template placeholder resolver
        /// </summary>
        /// <param name="templatePlaceholderResolver">Template placeholder resolver</param>
        public override void SetExportTemplatePlaceholderResolver(IExportTemplatePlaceholderResolver templatePlaceholderResolver) 
        {
            _flexFieldPlaceholderResolver.SetExportTemplatePlaceholderResolver(templatePlaceholderResolver);
        }

        /// <summary>
        /// Fills the placeholders
        /// </summary>
        /// <param name="template">Template to use</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <param name="parsedData">Parsed config data</param>
        /// <param name="valueObject">Value object to use</param>
        /// <param name="actionOperator">Action operator to use</param>
        /// <param name="flexFieldObject">Flex field object to which the dialog belongs</param>
        /// <param name="curStep">Current step that is rendered</param>
        /// <param name="nextStep">Next step that is being rendered</param>
        /// <param name="exportSettings">Export Settings</param>
        /// <param name="stepRenderer">Action Step renderer</param>
        /// <returns>Filled placeholders</returns>
        protected override async Task<string> FillPlaceholders(ExportTemplate template, ExportPlaceholderErrorCollection errorCollection, ValueFieldActionData parsedData, IFlexFieldExportable valueObject, string actionOperator, 
                                                               FlexFieldObject flexFieldObject, ExportDialogData curStep, ExportDialogData nextStep, ExportSettings exportSettings, IActionStepRenderer stepRenderer)
        {
            FlexField exportField = DialogFlexFieldUtil.GetFlexField(valueObject, parsedData.FieldId);
            if(exportField == null)
            {
                errorCollection.AddErrorFlexField(parsedData.FieldName, valueObject.Name);
                return string.Empty;
            }

            string actionCode = template.Code;
            actionCode = ExportUtil.BuildPlaceholderRegex(Placeholder_ValueName).Replace(actionCode, m => {
                return DialogFlexFieldUtil.GetFieldName(exportField, parsedData.FieldName, errorCollection);
            });
            actionCode = ExportUtil.BuildPlaceholderRegex(Placeholder_Operator).Replace(actionCode, actionOperator);
            actionCode = ExportUtil.RenderPlaceholderIfTrue(actionCode, Placeholder_OperatorIsSetTo_Start, Placeholder_OperatorIsSetTo_End, parsedData.Operator == "=");
            actionCode = ExportUtil.RenderPlaceholderIfTrue(actionCode, Placeholder_OperatorIsNotSetTo_Start, Placeholder_OperatorIsNotSetTo_End, parsedData.Operator != "=");
            actionCode = ExportUtil.RenderPlaceholderIfTrue(actionCode, Placeholder_OperatorIsAdd_Start, Placeholder_OperatorIsAdd_End, parsedData.Operator == "+=");
            actionCode = ExportUtil.RenderPlaceholderIfTrue(actionCode, Placeholder_OperatorIsNotAdd_Start, Placeholder_OperatorIsNotAdd_End, parsedData.Operator != "+=");
            actionCode = ExportUtil.RenderPlaceholderIfTrue(actionCode, Placeholder_OperatorIsSubstract_Start, Placeholder_OperatorIsSubstract_End, parsedData.Operator == "-=");
            actionCode = ExportUtil.RenderPlaceholderIfTrue(actionCode, Placeholder_OperatorIsNotSubstract_Start, Placeholder_OperatorIsNotSubstract_End, parsedData.Operator != "-=");
            actionCode = ExportUtil.RenderPlaceholderIfTrue(actionCode, Placeholder_OperatorIsMultiply_Start, Placeholder_OperatorIsMultiply_End, parsedData.Operator == "*=");
            actionCode = ExportUtil.RenderPlaceholderIfTrue(actionCode, Placeholder_OperatorIsNotMultiply_Start, Placeholder_OperatorIsNotMultiply_End, parsedData.Operator != "*=");
            actionCode = ExportUtil.RenderPlaceholderIfTrue(actionCode, Placeholder_OperatorIsDivide_Start, Placeholder_OperatorIsDivide_End, parsedData.Operator == "/=");
            actionCode = ExportUtil.RenderPlaceholderIfTrue(actionCode, Placeholder_OperatorIsNotDivide_Start, Placeholder_OperatorIsNotDivide_End, parsedData.Operator != "/=");
            actionCode = ExportUtil.RenderPlaceholderIfTrue(actionCode, Placeholder_ValueIsString_Start, Placeholder_ValueIsString_End, exportField.FieldType != ExportConstants.FlexFieldType_Number);
            actionCode = ExportUtil.RenderPlaceholderIfTrue(actionCode, Placeholder_ValueIsNumber_Start, Placeholder_ValueIsNumber_End, exportField.FieldType == ExportConstants.FlexFieldType_Number);
            actionCode = ExportUtil.RenderPlaceholderIfFuncTrue(actionCode, Placeholder_ValueNameEquals_Start, Placeholder_ValueNameEquals_End, m => {
                string searchedFieldName = m.Groups[1].Value;
                searchedFieldName = searchedFieldName.ToLowerInvariant();
                string fieldName = string.Empty;
                if(!string.IsNullOrEmpty(exportField.Name))
                {
                    fieldName = exportField.Name.ToLowerInvariant();
                }
                return fieldName == searchedFieldName;
            });
            actionCode = ExportUtil.RenderPlaceholderIfFuncTrue(actionCode, Placeholder_ValueNameNotEquals_Start, Placeholder_ValueNameNotEquals_End, m => {
                string searchedFieldName = m.Groups[1].Value;
                searchedFieldName = searchedFieldName.ToLowerInvariant();
                string fieldName = string.Empty;
                if(!string.IsNullOrEmpty(exportField.Name))
                {
                    fieldName = exportField.Name.ToLowerInvariant();
                }
                return fieldName != searchedFieldName;
            });
            actionCode = ExportUtil.BuildPlaceholderRegex(Placeholder_ValueChange).Replace(actionCode, m => {
                if(exportField.FieldType != ExportConstants.FlexFieldType_Number) 
                {
                    return ExportUtil.EscapeCharacters(parsedData.ValueChange, exportSettings.EscapeCharacter, exportSettings.CharactersNeedingEscaping, exportSettings.NewlineCharacter);
                }

                return parsedData.ValueChange;
            });

            ExportObjectData flexFieldExportData = new ExportObjectData();
            flexFieldExportData.ExportData.Add(ExportConstants.ExportDataObject, valueObject);
            flexFieldExportData.ExportData.Add(ExportConstants.ExportDataObjectType, GetFlexFieldExportObjectType());

            _flexFieldPlaceholderResolver.SetErrorMessageCollection(errorCollection);
            actionCode = await _flexFieldPlaceholderResolver.FillPlaceholders(actionCode, flexFieldExportData);

            return await stepRenderer.ReplaceBasePlaceholders(errorCollection, actionCode, curStep, nextStep, flexFieldObject);
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
        /// Returns the Export Template Placeholders for a Template Type
        /// </summary>
        /// <param name="templateType">Template Type</param>
        /// <returns>Export Template Placeholder</returns>
        public override List<ExportTemplatePlaceholder> GetExportTemplatePlaceholdersForType(TemplateType templateType)
        {
            List<ExportTemplatePlaceholder> exportPlaceholders = new List<ExportTemplatePlaceholder> {
                ExportUtil.CreatePlaceHolder(Placeholder_ValueName, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_Operator, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_ValueIsNumber_Start, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_ValueIsNumber_End, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_ValueIsString_Start, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_ValueIsString_End, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_OperatorIsSetTo_Start, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_OperatorIsSetTo_End, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_OperatorIsNotSetTo_Start, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_OperatorIsNotSetTo_End, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_OperatorIsAdd_Start, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_OperatorIsAdd_End, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_OperatorIsNotAdd_Start, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_OperatorIsNotAdd_End, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_OperatorIsSubstract_Start, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_OperatorIsSubstract_End, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_OperatorIsNotSubstract_Start, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_OperatorIsNotSubstract_End, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_OperatorIsMultiply_Start, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_OperatorIsMultiply_End, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_OperatorIsNotMultiply_Start, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_OperatorIsNotMultiply_End, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_OperatorIsDivide_Start, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_OperatorIsDivide_End, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_OperatorIsNotDivide_Start, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_OperatorIsNotDivide_End, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_ValueNameEquals_Start_FriendlyName, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_ValueNameEquals_End, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_ValueNameNotEquals_Start_FriendlyName, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_ValueNameNotEquals_End, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_ValueChange, _localizer)
            };

            exportPlaceholders.AddRange(_flexFieldPlaceholderResolver.GetExportTemplatePlaceholdersForType(TemplateType.ObjectNpc));

            return exportPlaceholders;
        }
    }
}