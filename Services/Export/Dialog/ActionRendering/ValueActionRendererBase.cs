using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Data.FlexFieldDatabase;
using GoNorth.Data.Kortisto;
using GoNorth.Data.Project;
using GoNorth.Services.Export.Data;
using GoNorth.Services.Export.Dialog.ActionConditionShared;
using GoNorth.Services.Export.LanguageKeyGeneration;
using GoNorth.Services.Export.Placeholder;
using Microsoft.Extensions.Localization;

namespace GoNorth.Services.Export.Dialog.ActionRendering
{
    /// <summary>
    /// Base Class for rendering a value action
    /// </summary>
    public abstract class ValueActionRenderBase : BaseActionRenderer<ValueActionRenderBase.ValueFieldActionData>
    {
        /// <summary>
        /// Value field action data
        /// </summary>
        public class ValueFieldActionData
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
            /// Operator for the action data
            /// </summary>
            public string Operator { get; set; }

            /// <summary>
            /// Compare value
            /// </summary>
            public string ValueChange { get; set; }

            /// <summary>
            /// Selected Object Id
            /// </summary>
            public string ObjectId { get; set; }
        }


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
        /// Value change
        /// </summary>
        private const string Placeholder_ValueChange = "Tale_Action_ValueChange";


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
        public ValueActionRenderBase(ICachedExportDefaultTemplateProvider defaultTemplateProvider, IExportCachedDbAccess cachedDbAccess, ILanguageKeyGenerator languageKeyGenerator, IStringLocalizerFactory localizerFactory)
        {
            _defaultTemplateProvider = defaultTemplateProvider;
            _cachedDbAccess = cachedDbAccess;
            _localizer = localizerFactory.Create(typeof(ValueActionRenderBase));
            _flexFieldPlaceholderResolver = new FlexFieldExportTemplatePlaceholderResolver(defaultTemplateProvider, cachedDbAccess, languageKeyGenerator, localizerFactory, GetFlexFieldPrefix());
        }

        /// <summary>
        /// Builds an action from parsed data
        /// </summary>
        /// <param name="parsedData">Parsed data</param>
        /// <param name="data">Dialog data</param>
        /// <param name="project">Project</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <param name="npc">Npc to which the dialog belongs</param>
        /// <param name="exportSettings">Export Settings</param>
        /// <returns>Action string</returns>
        public override async Task<string> BuildActionFromParsedData(ValueActionRenderBase.ValueFieldActionData parsedData, ExportDialogData data, GoNorthProject project, ExportPlaceholderErrorCollection errorCollection, KortistoNpc npc, ExportSettings exportSettings)
        {
            ExportTemplate actionTemplate = await GetExportTemplate(project);
            IFlexFieldExportable valueObject = await GetValueObject(parsedData, npc, errorCollection);
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

            string actionCode = actionTemplate.Code;
            actionCode = ExportUtil.BuildPlaceholderRegex(Placeholder_ValueName).Replace(actionCode, m => {
                return DialogFlexFieldUtil.GetFieldName(exportField, parsedData.FieldName, errorCollection);
            });
            actionCode = ExportUtil.BuildPlaceholderRegex(Placeholder_Operator).Replace(actionCode, GetOperatorFromTemplate(project, parsedData.Operator, errorCollection));
            actionCode = ExportUtil.RenderPlaceholderIfTrue(actionCode, Placeholder_OperatorIsSetTo_Start, Placeholder_OperatorIsSetTo_End, parsedData.Operator == "=");
            actionCode = ExportUtil.RenderPlaceholderIfTrue(actionCode, Placeholder_OperatorIsNotSetTo_Start, Placeholder_OperatorIsNotSetTo_End, parsedData.Operator != "=");
            actionCode = ExportUtil.RenderPlaceholderIfTrue(actionCode, Placeholder_ValueIsString_Start, Placeholder_ValueIsString_End, exportField.FieldType != ExportConstants.FlexFieldType_Number);
            actionCode = ExportUtil.RenderPlaceholderIfTrue(actionCode, Placeholder_ValueIsNumber_Start, Placeholder_ValueIsNumber_End, exportField.FieldType == ExportConstants.FlexFieldType_Number);
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
            actionCode = _flexFieldPlaceholderResolver.FillPlaceholders(actionCode, flexFieldExportData).Result;

            return actionCode;
        }

        /// <summary>
        /// Builds a preview text from parsed data
        /// </summary>
        /// <param name="parsedData">Parsed data</param>
        /// <param name="npc">Npc to which the dialog belongs</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <returns>Preview text</returns>
        public override async Task<string> BuildPreviewTextFromParsedData(ValueActionRenderBase.ValueFieldActionData parsedData, KortistoNpc npc, ExportPlaceholderErrorCollection errorCollection)
        {
            IFlexFieldExportable valueObject = await GetValueObject(parsedData, npc, errorCollection);
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

            string fieldName = DialogFlexFieldUtil.GetFieldName(exportField, parsedData.FieldName, errorCollection);

            return GetPreviewPrefix() + " (" + fieldName + ")";
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
        protected abstract Task<ExportTemplate> GetExportTemplate(GoNorthProject project);

        /// <summary>
        /// Returns the preview prefix
        /// </summary>
        /// <returns>Preview prefix</returns>
        protected abstract string GetPreviewPrefix();

        /// <summary>
        /// Returns the value object to use
        /// </summary>
        /// <param name="parsedData">Parsed data</param>
        /// <param name="npc">Npc</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <returns>Value Object</returns>
        protected abstract Task<IFlexFieldExportable> GetValueObject(ValueFieldActionData parsedData, KortistoNpc npc, ExportPlaceholderErrorCollection errorCollection);


        /// <summary>
        /// Returns the operator from the template of the action
        /// </summary>
        /// <param name="project">Project</param>
        /// <param name="actionOperator">Action Operator</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <returns>Action Operator</returns>
        private string GetOperatorFromTemplate(GoNorthProject project, string actionOperator, ExportPlaceholderErrorCollection errorCollection)
        {
            switch(actionOperator.ToLowerInvariant())
            {
            case "=":
                return _defaultTemplateProvider.GetDefaultTemplateByType(project.Id, TemplateType.GeneralChangeOperatorAssign).Result.Code;
            case "+=":
                return _defaultTemplateProvider.GetDefaultTemplateByType(project.Id, TemplateType.GeneralChangeOperatorAddTo).Result.Code;
            case "-=":
                return _defaultTemplateProvider.GetDefaultTemplateByType(project.Id, TemplateType.GeneralChangeOperatorSubstractFrom).Result.Code;
            case "*=":
                return _defaultTemplateProvider.GetDefaultTemplateByType(project.Id, TemplateType.GeneralChangeOperatorMultiply).Result.Code;
            case "/=":
                return _defaultTemplateProvider.GetDefaultTemplateByType(project.Id, TemplateType.GeneralChangeOperatorDivide).Result.Code;
            }

            errorCollection.AddDialogUnknownActionOperator(actionOperator);
            return string.Empty;
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
                ExportUtil.CreatePlaceHolder(Placeholder_ValueIsNumber_Start, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_ValueIsNumber_End, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_ValueIsString_Start, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_ValueIsString_End, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_OperatorIsSetTo_Start, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_OperatorIsSetTo_End, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_OperatorIsNotSetTo_Start, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_OperatorIsNotSetTo_End, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_ValueChange, _localizer)
            };

            exportPlaceholders.AddRange(_flexFieldPlaceholderResolver.GetExportTemplatePlaceholdersForType(TemplateType.ObjectNpc));

            return exportPlaceholders;
        }
    }
}