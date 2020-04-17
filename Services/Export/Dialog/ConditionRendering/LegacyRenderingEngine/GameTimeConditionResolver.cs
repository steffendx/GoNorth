using System.Collections.Generic;
using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Data.FlexFieldDatabase;
using GoNorth.Data.Project;
using GoNorth.Data.ProjectConfig;
using GoNorth.Services.Export.Data;
using GoNorth.Services.Export.Dialog.ConditionRendering.ConfigObject;
using GoNorth.Services.Export.Dialog.ConditionRendering.Util;
using GoNorth.Services.Export.Placeholder;
using Microsoft.Extensions.Localization;

namespace GoNorth.Services.Export.Dialog.ConditionRendering.LegacyRenderingEngine
{
    /// <summary>
    /// Class for rendering a game time condition
    /// </summary>
    public class GameTimeConditionResolver :  BaseConditionRenderer<GameTimeConditionData>
    {
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
        /// Default Template Provider
        /// </summary>
        protected readonly ICachedExportDefaultTemplateProvider _defaultTemplateProvider;

        /// <summary>
        /// Cached Db Access
        /// </summary>
        private readonly IExportCachedDbAccess _cachedDbAccess;

        /// <summary>
        /// String Localizer
        /// </summary>
        private readonly IStringLocalizer _localizer;


        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="defaultTemplateProvider">Default Template Provider</param>
        /// <param name="cachedDbAccess">Cached Db Access</param>
        /// <param name="localizerFactory">Localizer Factory</param>
        public GameTimeConditionResolver(ICachedExportDefaultTemplateProvider defaultTemplateProvider, IExportCachedDbAccess cachedDbAccess, IStringLocalizerFactory localizerFactory)
        {
            _defaultTemplateProvider = defaultTemplateProvider;
            _cachedDbAccess = cachedDbAccess;
            _localizer = localizerFactory.Create(typeof(GameTimeConditionResolver));
        }

        /// <summary>
        /// Builds a condition element from parsed data
        /// </summary>
        /// <param name="template">Export template to use</param>
        /// <param name="parsedData">Parsed data</param>
        /// <param name="project">Project</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <param name="flexFieldObject">Flex field object to which the dialog belongs</param>
        /// <param name="exportSettings">Export Settings</param>
        /// <returns>Condition string</returns>
        public override async Task<string> BuildConditionElementFromParsedData(ExportTemplate template, GameTimeConditionData parsedData, GoNorthProject project, ExportPlaceholderErrorCollection errorCollection, FlexFieldObject flexFieldObject, ExportSettings exportSettings)
        {
            MiscProjectConfig projectConfig = await _cachedDbAccess.GetMiscProjectConfig();

            string conditionCode = ExportUtil.RenderPlaceholderIfTrue(template.Code, Placeholder_Operator_Is_Before_Start, Placeholder_Operator_Is_Before_End, parsedData.Operator == GameTimeConditionData.Operator_Before);
            conditionCode = ExportUtil.RenderPlaceholderIfTrue(conditionCode, Placeholder_Operator_Is_After_Start, Placeholder_Operator_Is_After_End, parsedData.Operator == GameTimeConditionData.Operator_After);
            conditionCode = ExportUtil.BuildPlaceholderRegex(Placeholder_Operator).Replace(conditionCode, await ConditionRenderingUtil.GetGameTimeCompareOperatorFromTemplate(_defaultTemplateProvider, project, parsedData.Operator, errorCollection));
            conditionCode = ExportUtil.BuildPlaceholderRegex(Placeholder_Hours).Replace(conditionCode, parsedData.Hour.ToString());
            conditionCode = ExportUtil.BuildPlaceholderRegex(Placeholder_Minutes).Replace(conditionCode, parsedData.Minutes.ToString());
            conditionCode = ExportUtil.BuildPlaceholderRegex(Placeholder_TotalMinutes).Replace(conditionCode, (parsedData.Hour * projectConfig.MinutesPerHour + parsedData.Minutes).ToString());

            return conditionCode;
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