using System.Collections.Generic;
using GoNorth.Data.Exporting;
using GoNorth.Data.FlexFieldDatabase;
using GoNorth.Data.Kortisto;
using GoNorth.Data.Project;
using GoNorth.Services.Export.Placeholder;
using Microsoft.Extensions.Localization;

namespace GoNorth.Services.Export.Dialog.ConditionRendering
{
    /// <summary>
    /// Class for rendering a random value condition
    /// </summary>
    public class RandomValueConditionResolver :  BaseConditionRenderer<RandomValueConditionResolver.RandomValueConditionData>
    {
        /// <summary>
        /// Random value Condition Data
        /// </summary>
        public class RandomValueConditionData
        {
            /// <summary>
            /// Compare Operator
            /// </summary>
            public string Operator { get; set; }

            /// <summary>
            /// Min Value
            /// </summary>
            public float MinValue { get; set; }
            
            /// <summary>
            /// Max Value
            /// </summary>
            public int MaxValue { get; set; }
            
            /// <summary>
            /// Compare Value
            /// </summary>
            public int CompareValue { get; set; }
        }


        /// <summary>
        /// Placeholder for the compare operator of the random value condition
        /// </summary>
        private const string Placeholder_Operator = "Tale_Condition_RandomValue_Operator";

        /// <summary>
        /// Placeholder for the min value
        /// </summary>
        private const string Placeholder_MinValue = "Tale_Condition_RandomValue_MinValue";

        /// <summary>
        /// Placeholder for the max value
        /// </summary>
        private const string Placeholder_MaxValue = "Tale_Condition_RandomValue_MaxValue";

        /// <summary>
        /// Placeholder for the compare value
        /// </summary>
        private const string Placeholder_CompareValue = "Tale_Condition_RandomValue_CompareValue";


        /// <summary>
        /// Default Template Provider
        /// </summary>
        protected readonly ICachedExportDefaultTemplateProvider _defaultTemplateProvider;

        /// <summary>
        /// String Localizer
        /// </summary>
        private readonly IStringLocalizer _localizer;


        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="defaultTemplateProvider">Default Template Provider</param>
        /// <param name="localizerFactory">Localizer Factory</param>
        public RandomValueConditionResolver(ICachedExportDefaultTemplateProvider defaultTemplateProvider, IStringLocalizerFactory localizerFactory)
        {
            _defaultTemplateProvider = defaultTemplateProvider;
            _localizer = localizerFactory.Create(typeof(RandomValueConditionResolver));
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
        public override string BuildConditionElementFromParsedData(RandomValueConditionResolver.RandomValueConditionData parsedData, GoNorthProject project, ExportPlaceholderErrorCollection errorCollection, FlexFieldObject flexFieldObject, ExportSettings exportSettings)
        {
            ExportTemplate conditionTemplate = _defaultTemplateProvider.GetDefaultTemplateByType(project.Id, TemplateType.TaleConditionRandomValue).Result;
            
            string conditionCode = ExportUtil.BuildPlaceholderRegex(Placeholder_Operator).Replace(conditionTemplate.Code, GetOperatorFromTemplate(project, parsedData.Operator, errorCollection));
            conditionCode = ExportUtil.BuildPlaceholderRegex(Placeholder_MinValue).Replace(conditionCode, parsedData.MinValue.ToString());
            conditionCode = ExportUtil.BuildPlaceholderRegex(Placeholder_MaxValue).Replace(conditionCode, parsedData.MaxValue.ToString());
            conditionCode = ExportUtil.BuildPlaceholderRegex(Placeholder_CompareValue).Replace(conditionCode, parsedData.CompareValue.ToString());

            return conditionCode;
        }

        /// <summary>
        /// Returns the operator from the template of the condition
        /// </summary>
        /// <param name="project">Project</param>
        /// <param name="conditionOperator">Condition Operator</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <returns>Condition Operator</returns>
        private string GetOperatorFromTemplate(GoNorthProject project, string conditionOperator, ExportPlaceholderErrorCollection errorCollection)
        {
            switch(conditionOperator)
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
            }

            errorCollection.AddDialogUnknownConditionOperator(conditionOperator);
            return string.Empty;
        }

        /// <summary>
        /// Returns if true the condition element renderer has placeholders for a template type
        /// </summary>
        /// <param name="templateType">Tempalte Type to check</param>
        /// <returns>true if the condition element renderer has placeholders for the template type</returns>
        public override bool HasPlaceholdersForTemplateType(TemplateType templateType)
        {
            return templateType == TemplateType.TaleConditionRandomValue;
        }

        /// <summary>
        /// Returns the Export Template Placeholders for a Template Type
        /// </summary>
        /// <param name="templateType">Template Type</param>
        /// <returns>Export Template Placeholder</returns>
        public override List<ExportTemplatePlaceholder> GetExportTemplatePlaceholdersForType(TemplateType templateType)
        {
            return new List<ExportTemplatePlaceholder> {
                ExportUtil.CreatePlaceHolder(Placeholder_Operator, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_MinValue, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_MaxValue, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_CompareValue, _localizer)
            };
        }
    }
}