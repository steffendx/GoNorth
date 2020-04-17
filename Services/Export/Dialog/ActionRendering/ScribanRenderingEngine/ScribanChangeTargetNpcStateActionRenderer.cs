using System.Collections.Generic;
using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Data.FlexFieldDatabase;
using GoNorth.Data.Project;
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
    /// Class for rendering a change target npc state action using scriban
    /// </summary>
    public class ScribanChangeTargetNpcStateActionRenderer : BaseChangeTargetNpcStateActionRenderer
    {
        /// <summary>
        /// Cached Db Access
        /// </summary>
        private readonly IExportCachedDbAccess _cachedDbAccess;

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
        /// <param name="scribanLanguageKeyGenerator">Scriban Language Key Generator</param>
        /// <param name="localizerFactory">Localizer Factory</param>
        public ScribanChangeTargetNpcStateActionRenderer(IExportCachedDbAccess cachedDbAccess, IScribanLanguageKeyGenerator scribanLanguageKeyGenerator, IStringLocalizerFactory localizerFactory)
        {
            _cachedDbAccess = cachedDbAccess;
            _scribanLanguageKeyGenerator = scribanLanguageKeyGenerator;
            _localizerFactory = localizerFactory;
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
        public override async Task<string> BuildActionFromParsedData(ExportTemplate template, ChangeTargetNpcStateActionData parsedData, ExportDialogData data, ExportDialogData nextStep, GoNorthProject project, ExportPlaceholderErrorCollection errorCollection, 
                                                                     FlexFieldObject flexFieldObject, ExportSettings exportSettings, IActionStepRenderer stepRenderer)
        {
            ScribanChangeTargetNpcStateActionData changeTargetNpcStateData = new ScribanChangeTargetNpcStateActionData();
            changeTargetNpcStateData.Skill = FlexFieldValueCollectorUtil.BuildFlexFieldValueObject<ScribanExportSkill>(null, null, flexFieldObject, exportSettings, errorCollection);
            changeTargetNpcStateData.TargetState = ExportUtil.EscapeCharacters(parsedData.ObjectState, exportSettings.EscapeCharacter, exportSettings.CharactersNeedingEscaping, exportSettings.NewlineCharacter);
            changeTargetNpcStateData.UnescapedTargetState = parsedData.ObjectState;
            
            return await ScribanActionRenderingUtil.FillPlaceholders(_cachedDbAccess, errorCollection, template.Code, changeTargetNpcStateData, flexFieldObject, data, nextStep, _scribanLanguageKeyGenerator, stepRenderer);
        }

        /// <summary>
        /// Returns the Export Template Placeholders for a Template Type
        /// </summary>
        /// <param name="templateType">Template Type</param>
        /// <returns>Export Template Placeholder</returns>
        public override List<ExportTemplatePlaceholder> GetExportTemplatePlaceholdersForType(TemplateType templateType)
        {
            string languageKeyValueDesc = string.Format("{0}.{1}.{2} | field.{3}", ExportConstants.ScribanActionObjectKey, StandardMemberRenamer.Rename(nameof(ScribanChangeTargetNpcStateActionData.Skill)), 
                                                        StandardMemberRenamer.Rename(nameof(ScribanChangeTargetNpcStateActionData.Skill.Name)), StandardMemberRenamer.Rename(nameof(ScribanFlexFieldField.Name)));
            return ScribanActionRenderingUtil.GetExportTemplatePlaceholdersForType<ScribanChangeTargetNpcStateActionData>(_localizerFactory, _scribanLanguageKeyGenerator, languageKeyValueDesc);
        }
    }
}