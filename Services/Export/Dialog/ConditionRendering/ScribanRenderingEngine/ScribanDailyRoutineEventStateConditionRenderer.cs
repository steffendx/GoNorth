using System.Linq;
using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Data.FlexFieldDatabase;
using GoNorth.Data.Kortisto;
using GoNorth.Data.Project;
using GoNorth.Data.ProjectConfig;
using GoNorth.Services.Export.DailyRoutine;
using GoNorth.Services.Export.Data;
using GoNorth.Services.Export.Dialog.ConditionRendering.ConfigObject;
using GoNorth.Services.Export.Dialog.ConditionRendering.ScribanRenderingEngine.RenderingObjects;
using GoNorth.Services.Export.Placeholder;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.LanguageKeyGenerator;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.RenderingObjects;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.Util;
using Microsoft.Extensions.Localization;
using Scriban.Runtime;

namespace GoNorth.Services.Export.Dialog.ConditionRendering.ScribanRenderingEngine
{
    /// <summary>
    /// Class for rendering a scriban daily routine event state condition
    /// </summary>
    public class ScribanDailyRoutineEventStateConditionRenderer : ScribanConditionBaseRenderer<DailyRoutineEventStateConditionData, ScribanDailyRoutineEventStateConditionData>
    {
        /// <summary>
        /// Cached database access
        /// </summary>
        private readonly IExportCachedDbAccess _cachedDbAccess;

        /// <summary>
        /// Daily routine function name generator
        /// </summary>
        private readonly IDailyRoutineFunctionNameGenerator _dailyRoutineFunctionNameGenerator;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="cachedDbAccess">Cached database access</param>
        /// <param name="dailyRoutineFunctionNameGenerator">Daily routine function name generator</param>
        /// <param name="languageKeyGenerator">Scriban language key generator</param>
        /// <param name="localizerFactory">String Localizer Factory</param>
        public ScribanDailyRoutineEventStateConditionRenderer(IExportCachedDbAccess cachedDbAccess, IDailyRoutineFunctionNameGenerator dailyRoutineFunctionNameGenerator, IScribanLanguageKeyGenerator languageKeyGenerator, 
                                                              IStringLocalizerFactory localizerFactory) : base(cachedDbAccess, languageKeyGenerator, localizerFactory)
        {
            _cachedDbAccess = cachedDbAccess;
            _dailyRoutineFunctionNameGenerator = dailyRoutineFunctionNameGenerator;
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
        protected override async Task<ScribanDailyRoutineEventStateConditionData> GetExportObject(DailyRoutineEventStateConditionData parsedData, GoNorthProject project, ExportPlaceholderErrorCollection errorCollection, FlexFieldObject flexFieldObject, ExportSettings exportSettings)
        {
            KortistoNpc eventNpc = await _cachedDbAccess.GetNpcById(parsedData.NpcId);
            if(eventNpc == null)
            {
                errorCollection.AddDialogNpcNotFoundError();
                return null;
            }

            KortistoNpcDailyRoutineEvent exportEvent = null;
            if(eventNpc.DailyRoutine != null)
            {
                exportEvent = eventNpc.DailyRoutine.FirstOrDefault(e => e.EventId == parsedData.EventId);
            }
            if(exportEvent == null)
            {
                errorCollection.AddDialogDailyRoutineEventNotFoundError(eventNpc.Name);
                return null;
            }

            MiscProjectConfig projectConfig = await _cachedDbAccess.GetMiscProjectConfig();

            ScribanDailyRoutineEventStateConditionData conditionData = new ScribanDailyRoutineEventStateConditionData();
            conditionData.Npc = FlexFieldValueCollectorUtil.BuildFlexFieldValueObject<ScribanExportNpc>(null, null, eventNpc, exportSettings, errorCollection);
            conditionData.DailyRoutineEvent = await ScribanDailyRoutineEventUtil.ConvertDailyRoutineEvent(_dailyRoutineFunctionNameGenerator, eventNpc, exportEvent, project, projectConfig, exportSettings);

            return conditionData;   
        }

        /// <summary>
        /// Returns the object key for scriban
        /// </summary>
        /// <returns>Object key</returns>
        protected override string GetObjectKey()
        {
            return "condition";
        }

        /// <summary>
        /// Returns the object key for scriban
        /// </summary>
        /// <returns>Object key</returns>
        protected override string GetLanguageKeyValueDesc() { 
            return string.Format("{0}.{1}.{2} | field.{3}", GetObjectKey(), StandardMemberRenamer.Rename(nameof(ScribanDailyRoutineEventStateConditionData.Npc)), 
                                 StandardMemberRenamer.Rename(nameof(ScribanFlexFieldObject.Name)), StandardMemberRenamer.Rename(nameof(ScribanFlexFieldField.Value)));
        }

    }
}