using System.Collections.Generic;
using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Data.FlexFieldDatabase;
using GoNorth.Data.Kortisto;
using GoNorth.Data.Project;
using GoNorth.Data.ProjectConfig;
using GoNorth.Services.Export.DailyRoutine;
using GoNorth.Services.Export.Data;
using GoNorth.Services.Export.Dialog.ActionRendering.ConfigObject;
using GoNorth.Services.Export.Dialog.ActionRendering.ScribanRenderingEngine.RenderingObjects;
using GoNorth.Services.Export.Dialog.ActionRendering.ScribanRenderingEngine.Util;
using GoNorth.Services.Export.Dialog.ActionRendering.SharedRendering;
using GoNorth.Services.Export.Dialog.StepRenderers.ActionRenderer;
using GoNorth.Services.Export.Placeholder;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.LanguageKeyGenerator;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.RenderingObjects;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.Util;
using Microsoft.Extensions.Localization;
using Scriban.Runtime;

namespace GoNorth.Services.Export.Dialog.ActionRendering.ScribanRenderingEngine
{
    /// <summary>
    /// Class for rendering a set daily routine event state action using scriban
    /// </summary>
    public class ScribanSetDailyRoutineEventState : BaseSetDailyRoutineEventState
    {
        /// <summary>
        /// Cached Db Access
        /// </summary>
        private readonly IExportCachedDbAccess _cachedDbAccess;

        /// <summary>
        /// Daily routine function name generator
        /// </summary>
        private readonly IDailyRoutineFunctionNameGenerator _dailyRoutineFunctionNameGenerator;

        /// <summary>
        /// Scriban Language Key generator
        /// </summary>
        private readonly IScribanLanguageKeyGenerator _scribanLanguageKeyGenerator;

        /// <summary>
        /// String Localizer factory
        /// </summary>
        private readonly IStringLocalizerFactory _localizerFactory;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="cachedDbAccess">Cached Db Access</param>
        /// <param name="dailyRoutineFunctionNameGenerator">Daily routine function name generator</param>
        /// <param name="localizerFactory">Localizer Factory</param>
        /// <param name="scribanLanguageKeyGenerator">Scriban language key generator</param>
        /// <param name="isDisable">true if the event is for a disable action</param>
        public ScribanSetDailyRoutineEventState(IExportCachedDbAccess cachedDbAccess, IDailyRoutineFunctionNameGenerator dailyRoutineFunctionNameGenerator, IScribanLanguageKeyGenerator scribanLanguageKeyGenerator, IStringLocalizerFactory localizerFactory, bool isDisable) : base(cachedDbAccess, isDisable)
        {
            _cachedDbAccess = cachedDbAccess;
            _dailyRoutineFunctionNameGenerator = dailyRoutineFunctionNameGenerator;
            _scribanLanguageKeyGenerator = scribanLanguageKeyGenerator;
            _localizerFactory = localizerFactory;
        }

        /// <summary>
        /// Fills the placeholders
        /// </summary>
        /// <param name="template">Template to use</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <param name="parsedData">Parsed config data</param>
        /// <param name="eventNpc">Npc to which the event belongs</param>
        /// <param name="exportEvent">Event to export</param>
        /// <param name="flexFieldObject">Flex field object to which the dialog belongs</param>
        /// <param name="curStep">Current step that is rendered</param>
        /// <param name="nextStep">Next step that is being rendered</param>
        /// <param name="project">Project</param>
        /// <param name="exportSettings">Export Settings</param>
        /// <param name="stepRenderer">Action Step renderer</param>
        /// <returns>Filled placeholders</returns>
        protected override async Task<string> FillPlaceholders(ExportTemplate template, ExportPlaceholderErrorCollection errorCollection, SetDailyRoutineEventStateData parsedData, KortistoNpc eventNpc, KortistoNpcDailyRoutineEvent exportEvent, 
                                                               FlexFieldObject flexFieldObject, ExportDialogData curStep, ExportDialogData nextStep, GoNorthProject project, ExportSettings exportSettings, IActionStepRenderer stepRenderer)
        {
            MiscProjectConfig projectConfig = await _cachedDbAccess.GetMiscProjectConfig();

            ScribanSetDailyRoutineEventStateActionData setDailyRoutineEventStateData = new ScribanSetDailyRoutineEventStateActionData();
            setDailyRoutineEventStateData.Npc = FlexFieldValueCollectorUtil.BuildFlexFieldValueObject<ScribanExportNpc>(null, null, eventNpc, exportSettings, errorCollection);
            setDailyRoutineEventStateData.Npc.IsPlayer = eventNpc.IsPlayerNpc;
            setDailyRoutineEventStateData.DailyRoutineEvent = await ScribanDailyRoutineEventUtil.ConvertDailyRoutineEvent(_dailyRoutineFunctionNameGenerator, eventNpc, exportEvent, project, projectConfig, exportSettings);
            
            return await ScribanActionRenderingUtil.FillPlaceholders(_cachedDbAccess, errorCollection, template.Code, setDailyRoutineEventStateData, flexFieldObject, curStep, nextStep, _scribanLanguageKeyGenerator, stepRenderer);
        }

        /// <summary>
        /// Returns the Export Template Placeholders for a Template Type
        /// </summary>
        /// <param name="templateType">Template Type</param>
        /// <returns>Export Template Placeholder</returns>
        public override List<ExportTemplatePlaceholder> GetExportTemplatePlaceholdersForType(TemplateType templateType)
        {
            string languageKeyValueDesc = string.Format("{0}.{1}.{2} | field.{3}", ExportConstants.ScribanActionObjectKey, StandardMemberRenamer.Rename(nameof(ScribanSetDailyRoutineEventStateActionData.Npc)), 
                                                        StandardMemberRenamer.Rename(nameof(ScribanSetDailyRoutineEventStateActionData.Npc.Name)), StandardMemberRenamer.Rename(nameof(ScribanFlexFieldField.Name)));
            return ScribanActionRenderingUtil.GetExportTemplatePlaceholdersForType<ScribanSetDailyRoutineEventStateActionData>(_localizerFactory, _scribanLanguageKeyGenerator, languageKeyValueDesc);
        }
    }
}