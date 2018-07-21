using System.Collections.Generic;
using GoNorth.Data.Exporting;
using GoNorth.Data.Kortisto;
using GoNorth.Data.Project;
using GoNorth.Services.Export.Data;
using GoNorth.Services.Export.LanguageKeyGeneration;
using GoNorth.Services.Export.Placeholder;
using Microsoft.Extensions.Localization;

namespace GoNorth.Services.Export.Dialog.ConditionRendering
{
    /// <summary>
    /// Class for rendering a game time condition
    /// </summary>
    public class GameTimeConditionResolver :  BaseConditionRenderer<GameTimeConditionResolver.GameTimeConditionData>
    {
        /// <summary>
        /// Game Time Condition Data
        /// </summary>
        public class GameTimeConditionData
        {
            /// <summary>
            /// Compare Operator
            /// </summary>
            public int Operator { get; set; }

            /// <summary>
            /// Hour
            /// </summary>
            public int Hour { get; set; }
            
            /// <summary>
            /// Minutes
            /// </summary>
            public int Minutes { get; set; }
        }


        /// <summary>
        /// Placeholder for the compare operator of the time
        /// </summary>
        private const string Placeholder_Operator = "Tale_Condition_Time_Operator";

        /// <summary>
        /// Placeholder for the start of the content that will only be rendered if the operator is before
        /// </summary>
        private const string Placeholder_Operator_Is_Before_Start = "Tale_Condition_Time_Operator_Is_Before_Start";

        /// <summary>
        /// Placeholder for the end of the content that will only be rendered if the operator is before
        /// </summary>
        private const string Placeholder_Operator_Is_Before_End = "Tale_Condition_Time_Operator_Is_Before_End";
        
        /// <summary>
        /// Placeholder for the start of the content that will only be rendered if the operator is before
        /// </summary>
        private const string Placeholder_Operator_Is_After_Start = "Tale_Condition_Time_Operator_Is_After_Start";

        /// <summary>
        /// Placeholder for the end of the content that will only be rendered if the operator is before
        /// </summary>
        private const string Placeholder_Operator_Is_After_End = "Tale_Condition_Time_Operator_Is_After_End";

        /// <summary>
        /// Placeholder for Hours
        /// </summary>
        private const string Placeholder_Hours = "Tale_Condition_Time_Hours";

        /// <summary>
        /// Placeholder for Minutes
        /// </summary>
        private const string Placeholder_Minutes = "Tale_Condition_Time_Minutes";

        /// <summary>
        /// Placeholder for the total minutes
        /// </summary>
        private const string Placeholder_TotalMinutes = "Tale_Condition_Time_TotalMinutes";


        /// <summary>
        /// Operator Before
        /// </summary>
        private const int Operator_Before = 0;

        /// <summary>
        /// Operator After
        /// </summary>
        private const int Operator_After = 1;


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
        public GameTimeConditionResolver(ICachedExportDefaultTemplateProvider defaultTemplateProvider, IStringLocalizerFactory localizerFactory)
        {
            _defaultTemplateProvider = defaultTemplateProvider;
            _localizer = localizerFactory.Create(typeof(GameTimeConditionResolver));
        }

        /// <summary>
        /// Builds a condition element from parsed data
        /// </summary>
        /// <param name="parsedData">Parsed data</param>
        /// <param name="project">Project</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <param name="npc">Npc to which the dialog belongs</param>
        /// <param name="exportSettings">Export Settings</param>
        /// <returns>Condition string</returns>
        public override string BuildConditionElementFromParsedData(GameTimeConditionResolver.GameTimeConditionData parsedData, GoNorthProject project, ExportPlaceholderErrorCollection errorCollection, KortistoNpc npc, ExportSettings exportSettings)
        {
            ExportTemplate conditionTemplate = _defaultTemplateProvider.GetDefaultTemplateByType(project.Id, TemplateType.TaleConditionGameTime).Result;
            
            string conditionCode = ExportUtil.RenderPlaceholderIfTrue(conditionTemplate.Code, Placeholder_Operator_Is_Before_Start, Placeholder_Operator_Is_Before_End, parsedData.Operator == Operator_Before);
            conditionCode = ExportUtil.RenderPlaceholderIfTrue(conditionCode, Placeholder_Operator_Is_After_Start, Placeholder_Operator_Is_After_End, parsedData.Operator == Operator_After);
            conditionCode = ExportUtil.BuildPlaceholderRegex(Placeholder_Operator).Replace(conditionCode, GetOperatorFromTemplate(project, parsedData.Operator, errorCollection));
            conditionCode = ExportUtil.BuildPlaceholderRegex(Placeholder_Hours).Replace(conditionCode, parsedData.Hour.ToString());
            conditionCode = ExportUtil.BuildPlaceholderRegex(Placeholder_Minutes).Replace(conditionCode, parsedData.Minutes.ToString());
            conditionCode = ExportUtil.BuildPlaceholderRegex(Placeholder_TotalMinutes).Replace(conditionCode, (parsedData.Hour * 60 + parsedData.Minutes).ToString());

            return conditionCode;
        }

        /// <summary>
        /// Returns the operator from the template of the condition
        /// </summary>
        /// <param name="project">Project</param>
        /// <param name="conditionOperator">Condition Operator</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <returns>Condition Operator</returns>
        private string GetOperatorFromTemplate(GoNorthProject project, int conditionOperator, ExportPlaceholderErrorCollection errorCollection)
        {
            switch(conditionOperator)
            {
            case Operator_Before:
                return _defaultTemplateProvider.GetDefaultTemplateByType(project.Id, TemplateType.GeneralCompareOperatorLess).Result.Code;
            case Operator_After:
                return _defaultTemplateProvider.GetDefaultTemplateByType(project.Id, TemplateType.GeneralCompareOperatorBigger).Result.Code;
            }

            errorCollection.AddDialogUnknownConditionOperator(conditionOperator.ToString());
            return "";
        }

        /// <summary>
        /// Returns if true the condition element renderer has placeholders for a template type
        /// </summary>
        /// <param name="templateType">Tempalte Type to check</param>
        /// <returns>true if the condition element renderer has placeholders for the template type</returns>
        public override bool HasPlaceholdersForTemplateType(TemplateType templateType)
        {
            return templateType == TemplateType.TaleConditionGameTime;
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
                ExportUtil.CreatePlaceHolder(Placeholder_Operator_Is_Before_Start, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_Operator_Is_Before_End, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_Operator_Is_After_Start, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_Operator_Is_After_End, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_Hours, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_Minutes, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_TotalMinutes, _localizer)
            };
        }
    }
}