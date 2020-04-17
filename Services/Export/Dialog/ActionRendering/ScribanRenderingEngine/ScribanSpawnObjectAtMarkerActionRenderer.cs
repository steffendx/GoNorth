using System.Collections.Generic;
using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Data.FlexFieldDatabase;
using GoNorth.Data.Karta;
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
    /// Class for rendering an skill value change action with scriban
    /// </summary>
    public abstract class ScribanSpawnObjectAtMarkerActionRenderer : BaseSpawnObjectAtMarkerRendererBase
    {
        /// <summary>
        /// Scriban language key generator
        /// </summary>
        private readonly IScribanLanguageKeyGenerator _scribanLanguageKeyGenerator;

        /// <summary>
        /// String localizer factory
        /// </summary>
        private readonly IStringLocalizerFactory _localizerFactory;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="cachedDbAccess">Cached Db Access</param>
        /// <param name="scribanLanguageKeyGenerator">Scriban Language Key Generator</param>
        /// <param name="localizerFactory">String localizer factor</param>
        public ScribanSpawnObjectAtMarkerActionRenderer(IExportCachedDbAccess cachedDbAccess, IScribanLanguageKeyGenerator scribanLanguageKeyGenerator, IStringLocalizerFactory localizerFactory) : base(cachedDbAccess)
        {
            _scribanLanguageKeyGenerator = scribanLanguageKeyGenerator;
            _localizerFactory = localizerFactory;
        }

        /// <summary>
        /// Fills the placeholders
        /// </summary>
        /// <param name="template">Template to use</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <param name="parsedData">Parsed config data</param>
        /// <param name="valueObject">Value object</param>
        /// <param name="marker">Marker at which to spawn the object</param>
        /// <param name="flexFieldObject">Flex field object to which the dialog belongs</param>
        /// <param name="curStep">Current step that is rendered</param>
        /// <param name="nextStep">Next step that is being rendered</param>
        /// <param name="exportSettings">Export Settings</param>
        /// <param name="stepRenderer">Action Step renderer</param>
        /// <returns>Filled placeholders</returns>
        protected override async Task<string> FillPlaceholders(ExportTemplate template, ExportPlaceholderErrorCollection errorCollection, SpawnObjectActionData parsedData, IFlexFieldExportable valueObject, KartaMapNamedMarkerQueryResult marker, 
                                                               FlexFieldObject flexFieldObject, ExportDialogData curStep, ExportDialogData nextStep, ExportSettings exportSettings, IActionStepRenderer stepRenderer)
        {
            ScribanSpawnObjectActionData spawnActionData = new ScribanSpawnObjectActionData();
            spawnActionData.Object = FlexFieldValueCollectorUtil.ConvertScribanFlexFieldObject(valueObject, exportSettings, errorCollection);
            spawnActionData.TargetMarkerName = ExportUtil.EscapeCharacters(marker.MarkerName, exportSettings.EscapeCharacter, exportSettings.CharactersNeedingEscaping, exportSettings.NewlineCharacter);
            spawnActionData.UnescapedTargetMarkerName = marker.MarkerName;
            spawnActionData.Pitch = parsedData.Pitch;
            spawnActionData.Yaw = parsedData.Yaw;
            spawnActionData.Roll = parsedData.Roll;

            return await ScribanActionRenderingUtil.FillPlaceholders(_cachedDbAccess, errorCollection, template.Code, spawnActionData, flexFieldObject, curStep, nextStep, _scribanLanguageKeyGenerator, stepRenderer);
        }

        
        /// <summary>
        /// Returns the Export Template Placeholders for a Template Type
        /// </summary>
        /// <param name="templateType">Template Type</param>
        /// <returns>Export Template Placeholder</returns>
        public override List<ExportTemplatePlaceholder> GetExportTemplatePlaceholdersForType(TemplateType templateType)
        {
            string languageKeyValueDesc = string.Format("{0}.{1}.{2} | field.{3}", ExportConstants.ScribanActionObjectKey, StandardMemberRenamer.Rename(nameof(ScribanSpawnObjectActionData.Object)), 
                                                        StandardMemberRenamer.Rename(nameof(ScribanSpawnObjectActionData.Object.Name)), StandardMemberRenamer.Rename(nameof(ScribanFlexFieldField.Value)));
            return ScribanActionRenderingUtil.GetExportTemplatePlaceholdersForType<ScribanSpawnObjectActionData>(_localizerFactory, _scribanLanguageKeyGenerator, languageKeyValueDesc);
        }

    }
}