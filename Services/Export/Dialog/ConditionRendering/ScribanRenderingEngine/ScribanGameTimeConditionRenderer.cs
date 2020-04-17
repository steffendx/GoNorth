using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Data.FlexFieldDatabase;
using GoNorth.Data.Project;
using GoNorth.Data.ProjectConfig;
using GoNorth.Services.Export.Data;
using GoNorth.Services.Export.Dialog.ConditionRendering.ConfigObject;
using GoNorth.Services.Export.Dialog.ConditionRendering.ScribanRenderingEngine.RenderingObjects;
using GoNorth.Services.Export.Dialog.ConditionRendering.Util;
using GoNorth.Services.Export.Placeholder;
using Microsoft.Extensions.Localization;

namespace GoNorth.Services.Export.Dialog.ConditionRendering.ScribanRenderingEngine
{
    /// <summary>
    /// Class for rendering a scriban game time condition
    /// </summary>
    public class ScribanGameTimeConditionRenderer : ScribanConditionBaseRenderer<GameTimeConditionData, ScribanGameTimeConditionData>
    {
        /// <summary>
        /// Default Template Provider
        /// </summary>
        private readonly ICachedExportDefaultTemplateProvider _defaultTemplateProvider;

        /// <summary>
        /// Cachaed database access
        /// </summary>
        private readonly IExportCachedDbAccess _cachedDbAccess;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="defaultTemplateProvider">Default Template Provider</param>
        /// <param name="cachedDbAccess">Cached Db Access</param>
        /// <param name="localizerFactory">String Localizer Factory</param>
        public ScribanGameTimeConditionRenderer(ICachedExportDefaultTemplateProvider defaultTemplateProvider, IExportCachedDbAccess cachedDbAccess, IStringLocalizerFactory localizerFactory) : base(cachedDbAccess, null, localizerFactory)
        {
            _defaultTemplateProvider = defaultTemplateProvider;
            _cachedDbAccess = cachedDbAccess;
        }


        /// <summary>
        /// Returns the value object to use for scriban exporting
        /// </summary>
        /// <param name="parsedData">Parsed data</param>
        /// <param name="project">Project</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <param name="flexFieldObject">Flex field object to which the dialog belongs</param>
        /// <param name="exportSettings">Export Settings</param>
        /// <returns>Value Object</returns>
        protected override async Task<ScribanGameTimeConditionData> GetExportObject(GameTimeConditionData parsedData, GoNorthProject project, ExportPlaceholderErrorCollection errorCollection, FlexFieldObject flexFieldObject, ExportSettings exportSettings)
        {
            MiscProjectConfig projectConfig = await _cachedDbAccess.GetMiscProjectConfig();

            ScribanGameTimeConditionData conditionData = new ScribanGameTimeConditionData();
            
            conditionData.Hours = parsedData.Hour;
            conditionData.Minutes = parsedData.Minutes;
            conditionData.TotalMinutes = parsedData.Hour * projectConfig.MinutesPerHour + parsedData.Minutes;
            conditionData.Operator = await ConditionRenderingUtil.GetGameTimeCompareOperatorFromTemplate(_defaultTemplateProvider, project, parsedData.Operator, errorCollection);
            conditionData.OriginalOperator = ConvertGameTimeOperator(parsedData.Operator);

            return conditionData;   
        }

        /// <summary>
        /// Converts a game time operator
        /// </summary>
        /// <param name="gameTimeOperator">Operator to convert</param>
        /// <returns>Converted npc alive state</returns>
        private string ConvertGameTimeOperator(int gameTimeOperator)
        {
            switch(gameTimeOperator)
            {
            case GameTimeConditionData.Operator_Before:
                return "Before";
            case GameTimeConditionData.Operator_After:
                return "After";
            }

            return "UNKNOWN_GAME_TIME_OPERATOR";
        }

        /// <summary>
        /// Returns the object key for scriban
        /// </summary>
        /// <returns>Object key</returns>
        protected override string GetObjectKey()
        {
            return "condition";
        }

    }
}