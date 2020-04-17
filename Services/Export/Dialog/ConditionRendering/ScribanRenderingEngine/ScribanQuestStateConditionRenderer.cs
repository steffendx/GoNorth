using System.Threading.Tasks;
using GoNorth.Data.Aika;
using GoNorth.Data.Exporting;
using GoNorth.Data.FlexFieldDatabase;
using GoNorth.Data.Project;
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
    /// Class for rendering a scriban quest state condition
    /// </summary>
    public class ScribanQuestStateConditionRenderer : ScribanConditionBaseRenderer<QuestStateConditionData, ScribanQuestStateConditionData>
    {
        /// <summary>
        /// Cached database access
        /// </summary>
        private readonly IExportCachedDbAccess _cachedDbAccess;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="cachedDbAccess">Cached database access</param>
        /// <param name="languageKeyGenerator">Scriban language key generator</param>
        /// <param name="localizerFactory">String Localizer Factory</param>
        public ScribanQuestStateConditionRenderer(IExportCachedDbAccess cachedDbAccess, IScribanLanguageKeyGenerator languageKeyGenerator, IStringLocalizerFactory localizerFactory) : base(cachedDbAccess, languageKeyGenerator, localizerFactory)
        {
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
        protected override async Task<ScribanQuestStateConditionData> GetExportObject(QuestStateConditionData parsedData, GoNorthProject project, ExportPlaceholderErrorCollection errorCollection, FlexFieldObject flexFieldObject, ExportSettings exportSettings)
        {
            AikaQuest quest = await _cachedDbAccess.GetQuestById(parsedData.QuestId);
            if(quest == null)
            {
                errorCollection.AddDialogQuestNotFoundError();
                return null;
            }

            ScribanQuestStateConditionData conditionData = new ScribanQuestStateConditionData();
            conditionData.Quest = FlexFieldValueCollectorUtil.BuildFlexFieldValueObject<ScribanExportQuest>(null, null, quest, exportSettings, errorCollection);
            conditionData.QuestState = ConvertQuestState(parsedData.State);

            return conditionData;   
        }

        /// <summary>
        /// Converts a quest state to an export quest state
        /// </summary>
        /// <param name="state">State to convert</param>
        /// <returns>Converted quest state</returns>
        private string ConvertQuestState(int state)
        {
            switch(state)
            {
            case QuestStateConditionData.QuestState_NotStarted:
                return "NotStarted";
            case QuestStateConditionData.QuestState_InProgress:
                return "InProgress";
            case QuestStateConditionData.QuestState_Success:
                return "Success";
            case QuestStateConditionData.QuestState_Failed:
                return "Failed";
            }

            return "UNKNOWN_STATE";
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
            return string.Format("{0}.{1}.{2} | field.{3}", GetObjectKey(), StandardMemberRenamer.Rename(nameof(ScribanQuestStateConditionData.Quest)), 
                                 StandardMemberRenamer.Rename(nameof(ScribanFlexFieldObject.Name)), StandardMemberRenamer.Rename(nameof(ScribanFlexFieldField.Value)));
        }

    }
}