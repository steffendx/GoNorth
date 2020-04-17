using System.Collections.Generic;
using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Data.FlexFieldDatabase;
using GoNorth.Data.Karta;
using GoNorth.Services.Export.Data;
using GoNorth.Services.Export.Dialog.ActionRendering.ConfigObject;
using GoNorth.Services.Export.Dialog.ActionRendering.SharedRendering;
using GoNorth.Services.Export.Dialog.StepRenderers.ActionRenderer;
using GoNorth.Services.Export.LanguageKeyGeneration;
using GoNorth.Services.Export.Placeholder;
using GoNorth.Services.Export.Placeholder.LegacyRenderingEngine;
using Microsoft.Extensions.Localization;

namespace GoNorth.Services.Export.Dialog.ActionRendering.LegacyRenderingEngine
{
    /// <summary>
    /// Base Class for rendering a spawn object action
    /// </summary>
    public abstract class SpawnObjectAtMarkerRendererBase : BaseSpawnObjectAtMarkerRendererBase
    {
        /// <summary>
        /// Placeholder for the Target Marker Name
        /// </summary>
        private const string Placeholder_TargetMarker_Name = "Tale_Action_TargetMarker_Name";
        
        /// <summary>
        /// Placeholder for the rotation pitch
        /// </summary>
        private const string Placeholder_Rotation_Pitch = "Tale_Action_Rotation_Pitch";

        /// <summary>
        /// Placeholder for the rotation yaw
        /// </summary>
        private const string Placeholder_Rotation_Yaw = "Tale_Action_Rotation_Yaw";
        
        /// <summary>
        /// Placeholder for the rotation roll
        /// </summary>
        private const string Placeholder_Rotation_Roll = "Tale_Action_Rotation_Roll";


        /// <summary>
        /// Default Template Provider
        /// </summary>
        protected readonly ICachedExportDefaultTemplateProvider _defaultTemplateProvider;

        /// <summary>
        /// String Localizer
        /// </summary>
        private readonly IStringLocalizer _localizer;

        /// <summary>
        /// Resolver for flex field values
        /// </summary>
        private readonly FlexFieldExportTemplatePlaceholderResolver _flexFieldPlaceholderResolver;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="defaultTemplateProvider">Default Template Provider</param>
        /// <param name="cachedDbAccess">Cached Db Access</param>        
        /// <param name="languageKeyGenerator">Language Key Generator</param>
        /// <param name="localizerFactory">Localizer Factory</param>
        public SpawnObjectAtMarkerRendererBase(ICachedExportDefaultTemplateProvider defaultTemplateProvider, IExportCachedDbAccess cachedDbAccess, ILanguageKeyGenerator languageKeyGenerator, IStringLocalizerFactory localizerFactory) :
                                               base(cachedDbAccess)
        {
            _defaultTemplateProvider = defaultTemplateProvider;
            _localizer = localizerFactory.Create(typeof(SpawnObjectAtMarkerRendererBase));
            _flexFieldPlaceholderResolver = new FlexFieldExportTemplatePlaceholderResolver(defaultTemplateProvider, cachedDbAccess, languageKeyGenerator, localizerFactory, GetFlexFieldPrefix());
        }

        /// <summary>
        /// Sets the export template placeholder resolver
        /// </summary>
        /// <param name="templatePlaceholderResolver">Template placeholder resolver</param>
        public override void SetExportTemplatePlaceholderResolver(IExportTemplatePlaceholderResolver templatePlaceholderResolver) 
        {
            _flexFieldPlaceholderResolver.SetExportTemplatePlaceholderResolver(templatePlaceholderResolver);
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
            string actionCode = ExportUtil.BuildPlaceholderRegex(Placeholder_TargetMarker_Name).Replace(template.Code, marker.MarkerName);
            actionCode = ExportUtil.BuildPlaceholderRegex(Placeholder_Rotation_Pitch).Replace(actionCode, parsedData.Pitch.ToString());
            actionCode = ExportUtil.BuildPlaceholderRegex(Placeholder_Rotation_Yaw).Replace(actionCode, parsedData.Yaw.ToString());
            actionCode = ExportUtil.BuildPlaceholderRegex(Placeholder_Rotation_Roll).Replace(actionCode, parsedData.Roll.ToString());

            ExportObjectData flexFieldExportData = new ExportObjectData();
            flexFieldExportData.ExportData.Add(ExportConstants.ExportDataObject, valueObject);
            flexFieldExportData.ExportData.Add(ExportConstants.ExportDataObjectType, GetFlexFieldExportObjectType());

            _flexFieldPlaceholderResolver.SetErrorMessageCollection(errorCollection);
            actionCode = _flexFieldPlaceholderResolver.FillPlaceholders(actionCode, flexFieldExportData).Result;

            return await stepRenderer.ReplaceBasePlaceholders(errorCollection, actionCode, curStep, nextStep, flexFieldObject);
        }

        /// <summary>
        /// Returns the flex field prefix
        /// </summary>
        /// <returns>Flex Field Prefix</returns>        
        protected abstract string GetFlexFieldPrefix();

        /// <summary>
        /// Returns the flex field export object type
        /// </summary>
        /// <returns>Flex field export object type</returns>
        protected abstract string GetFlexFieldExportObjectType();

        /// <summary>
        /// Returns the Export Template Placeholders for a Template Type
        /// </summary>
        /// <param name="templateType">Template Type</param>
        /// <returns>Export Template Placeholder</returns>
        public override List<ExportTemplatePlaceholder> GetExportTemplatePlaceholdersForType(TemplateType templateType)
        {
            List<ExportTemplatePlaceholder> exportPlaceholders = new List<ExportTemplatePlaceholder> {
                ExportUtil.CreatePlaceHolder(Placeholder_TargetMarker_Name, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_Rotation_Pitch, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_Rotation_Yaw, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_Rotation_Roll, _localizer)
            };

            exportPlaceholders.AddRange(_flexFieldPlaceholderResolver.GetExportTemplatePlaceholdersForType(TemplateType.ObjectNpc));

            return exportPlaceholders;
        }
    }
}