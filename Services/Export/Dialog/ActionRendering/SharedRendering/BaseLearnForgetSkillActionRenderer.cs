using System.Threading.Tasks;
using GoNorth.Data.Evne;
using GoNorth.Data.Exporting;
using GoNorth.Data.FlexFieldDatabase;
using GoNorth.Data.Project;
using GoNorth.Services.Export.Data;
using GoNorth.Services.Export.Dialog.ActionRendering.ConfigObject;
using GoNorth.Services.Export.Dialog.StepRenderers.ActionRenderer;
using GoNorth.Services.Export.Placeholder;

namespace GoNorth.Services.Export.Dialog.ActionRendering.SharedRendering
{
    /// <summary>
    /// Base class for rendering a learn/forget skill action
    /// </summary>
    public abstract class BaseLearnForgetSkillActionRenderer : BaseActionRenderer<LearnForgetSkillActionData>
    {
        /// <summary>
        /// Cached Db Access
        /// </summary>
        protected readonly IExportCachedDbAccess _cachedDbAccess;

        /// <summary>
        /// true if the renderer is for the player, else false
        /// </summary>
        private readonly bool _isPlayer;

        /// <summary>
        /// true if the renderer is for learning, false if it is for forgetting
        /// </summary>
        private readonly bool _isLearn;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="cachedDbAccess">Cached Db Access</param>        
        /// <param name="isPlayer">true if the renderer is for the player, else false</param>
        /// <param name="isLearn">true if the renderer is for learning, false if it is for forgetting</param>
        public BaseLearnForgetSkillActionRenderer(IExportCachedDbAccess cachedDbAccess, bool isPlayer, bool isLearn)
        {
            _cachedDbAccess = cachedDbAccess;
            _isPlayer = isPlayer;
            _isLearn = isLearn;
        }

        /// <summary>
        /// Builds an action from parsed data
        /// </summary>
        /// <param name="template">Template to export</param>
        /// <param name="parsedData">Parsed data</param>
        /// <param name="data">Dialog data</param>
        /// <param name="nextStep">Next step in the dialog</param>
        /// <param name="project">Project</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <param name="flexFieldObject">Flex field object to which the dialog belongs</param>
        /// <param name="exportSettings">Export Settings</param>
        /// <param name="stepRenderer">Action Step renderer</param>
        /// <returns>Action string</returns>
        public override async Task<string> BuildActionFromParsedData(ExportTemplate template, LearnForgetSkillActionData parsedData, ExportDialogData data, ExportDialogData nextStep, GoNorthProject project, ExportPlaceholderErrorCollection errorCollection, 
                                                                     FlexFieldObject flexFieldObject, ExportSettings exportSettings, IActionStepRenderer stepRenderer)
        {
            IFlexFieldExportable valueObject = await GetSkill(parsedData, errorCollection);
            if(valueObject == null)
            {
                return string.Empty;
            }
            
            return await FillPlaceholders(template, errorCollection, parsedData, valueObject, flexFieldObject, data, nextStep, exportSettings, stepRenderer);
        }

        /// <summary>
        /// Fills the placeholders
        /// </summary>
        /// <param name="template">Template to use</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <param name="parsedData">Parsed config data</param>
        /// <param name="valueObject">Value object to export</param>
        /// <param name="flexFieldObject">Flex field object to which the dialog belongs</param>
        /// <param name="curStep">Current step that is rendered</param>
        /// <param name="nextStep">Next step that is being rendered</param>
        /// <param name="exportSettings">Export Settings</param>
        /// <param name="stepRenderer">Action Step renderer</param>
        /// <returns>Filled placeholders</returns>
        protected abstract Task<string> FillPlaceholders(ExportTemplate template, ExportPlaceholderErrorCollection errorCollection, LearnForgetSkillActionData parsedData, IFlexFieldExportable valueObject, FlexFieldObject flexFieldObject, 
                                                         ExportDialogData curStep, ExportDialogData nextStep, ExportSettings exportSettings, IActionStepRenderer stepRenderer);

        /// <summary>
        /// Builds a preview text from parsed data
        /// </summary>
        /// <param name="parsedData">Parsed data</param>
        /// <param name="flexFieldObject">Flex field object to which the dialog belongs</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <param name="child">Child node</param>
        /// <param name="parent">Parent</param>
        /// <returns>Preview text</returns>
        public override async Task<string> BuildPreviewTextFromParsedData(LearnForgetSkillActionData parsedData, FlexFieldObject flexFieldObject, ExportPlaceholderErrorCollection errorCollection, ExportDialogData child, ExportDialogData parent)
        {
            IFlexFieldExportable valueObject = await GetSkill(parsedData, errorCollection);
            if(valueObject == null)
            {
                return string.Empty;
            }

            string label = _isPlayer ? "Npc" : "Player";
            label += _isLearn ? "Learn" : "Forget";

            return label + " (" + valueObject.Name + ")";
        }

        /// <summary>
        /// Returns the skill to use
        /// </summary>
        /// <param name="parsedData">Parsed data</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <returns>Value Object</returns>
        private async Task<IFlexFieldExportable> GetSkill(LearnForgetSkillActionData parsedData, ExportPlaceholderErrorCollection errorCollection)
        {
            EvneSkill skillToUse = await _cachedDbAccess.GetSkillById(parsedData.SkillId);
            if(skillToUse == null)
            {
                errorCollection.AddDialogSkillNotFoundError();
                return null;
            }

            return skillToUse;
        }
    }
}