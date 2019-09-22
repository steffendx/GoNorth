using System.Collections.Generic;
using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Data.FlexFieldDatabase;
using GoNorth.Data.Karta;
using GoNorth.Data.Kortisto;
using GoNorth.Data.Project;
using GoNorth.Services.Export.Data;
using GoNorth.Services.Export.LanguageKeyGeneration;
using GoNorth.Services.Export.Placeholder;
using Microsoft.Extensions.Localization;

namespace GoNorth.Services.Export.Dialog.ActionRendering
{
    /// <summary>
    /// Base Class for rendering a spawn object action
    /// </summary>
    public abstract class SpawnObjectAtMarkerRendererBase : BaseActionRenderer<SpawnObjectAtMarkerRendererBase.SpawnObjectActionData>
    {
        /// <summary>
        /// Spawn object action data
        /// </summary>
        public class SpawnObjectActionData
        {
            /// <summary>
            /// Object Id
            /// </summary>
            public string ObjectId { get; set; }
            
            /// <summary>
            /// Map Id
            /// </summary>
            public string MapId { get; set; }
            
            /// <summary>
            /// Marker Id
            /// </summary>
            public string MarkerId { get; set; }
            
            /// <summary>
            /// Marker Type
            /// </summary>
            public string MarkerType { get; set; }
            
            /// <summary>
            /// Pitch
            /// </summary>
            public float Pitch { get; set; }
            
            /// <summary>
            /// Yaw
            /// </summary>
            public float Yaw { get; set; }
            
            /// <summary>
            /// Roll
            /// </summary>
            public float Roll { get; set; }
        }

        
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
        /// Cached Db Access
        /// </summary>
        protected readonly IExportCachedDbAccess _cachedDbAccess;

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
        public SpawnObjectAtMarkerRendererBase(ICachedExportDefaultTemplateProvider defaultTemplateProvider, IExportCachedDbAccess cachedDbAccess, ILanguageKeyGenerator languageKeyGenerator, IStringLocalizerFactory localizerFactory)
        {
            _defaultTemplateProvider = defaultTemplateProvider;
            _cachedDbAccess = cachedDbAccess;
            _localizer = localizerFactory.Create(typeof(SpawnObjectAtMarkerRendererBase));
            _flexFieldPlaceholderResolver = new FlexFieldExportTemplatePlaceholderResolver(defaultTemplateProvider, cachedDbAccess, languageKeyGenerator, localizerFactory, GetFlexFieldPrefix());
        }

        /// <summary>
        /// Builds an action from parsed data
        /// </summary>
        /// <param name="parsedData">Parsed data</param>
        /// <param name="data">Dialog data</param>
        /// <param name="project">Project</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <param name="flexFieldObject">Flex field object to which the dialog belongs</param>
        /// <param name="exportSettings">Export Settings</param>
        /// <returns>Action string</returns>
        public override async Task<string> BuildActionFromParsedData(SpawnObjectAtMarkerRendererBase.SpawnObjectActionData parsedData, ExportDialogData data, GoNorthProject project, ExportPlaceholderErrorCollection errorCollection, FlexFieldObject flexFieldObject, ExportSettings exportSettings)
        {
            ExportTemplate actionTemplate = await GetExportTemplate(project);
            IFlexFieldExportable valueObject = await GetValueObject(parsedData, flexFieldObject, errorCollection);
            if(valueObject == null)
            {
                return string.Empty;
            }

            KartaMapNamedMarkerQueryResult markerResult = await GetMarker(parsedData);
            if(markerResult == null)
            {
                errorCollection.AddDialogMarkerNotFoundError();
                return string.Empty;
            }

            string actionCode = ExportUtil.BuildPlaceholderRegex(Placeholder_TargetMarker_Name).Replace(actionTemplate.Code, markerResult.MarkerName);
            actionCode = ExportUtil.BuildPlaceholderRegex(Placeholder_Rotation_Pitch).Replace(actionCode, parsedData.Pitch.ToString());
            actionCode = ExportUtil.BuildPlaceholderRegex(Placeholder_Rotation_Yaw).Replace(actionCode, parsedData.Yaw.ToString());
            actionCode = ExportUtil.BuildPlaceholderRegex(Placeholder_Rotation_Roll).Replace(actionCode, parsedData.Roll.ToString());

            ExportObjectData flexFieldExportData = new ExportObjectData();
            flexFieldExportData.ExportData.Add(ExportConstants.ExportDataObject, valueObject);
            flexFieldExportData.ExportData.Add(ExportConstants.ExportDataObjectType, GetFlexFieldExportObjectType());

            _flexFieldPlaceholderResolver.SetErrorMessageCollection(errorCollection);
            actionCode = _flexFieldPlaceholderResolver.FillPlaceholders(actionCode, flexFieldExportData).Result;

            return actionCode;
        }

        /// <summary>
        /// Builds a preview text from parsed data
        /// </summary>
        /// <param name="parsedData">Parsed data</param>
        /// <param name="flexFieldObject">Flex field object to which the dialog belongs</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <param name="child">Child node</param>
        /// <param name="parent">Parent</param>
        /// <returns>Preview text</returns>
        public override async Task<string> BuildPreviewTextFromParsedData(SpawnObjectAtMarkerRendererBase.SpawnObjectActionData parsedData, FlexFieldObject flexFieldObject, ExportPlaceholderErrorCollection errorCollection, ExportDialogData child, ExportDialogData parent)
        {
            IFlexFieldExportable valueObject = await GetValueObject(parsedData, flexFieldObject, errorCollection);
            if(valueObject == null)
            {
                return string.Empty;
            }

            KartaMapNamedMarkerQueryResult markerResult = await GetMarker(parsedData);
            if(markerResult == null)
            {
                return string.Empty;
            }

            return GetPreviewPrefixText(valueObject.Name, markerResult.MarkerName);
        }

        /// <summary>
        /// Returns the valid marker
        /// </summary>
        /// <param name="parsedData">Parsed data</param>
        /// <returns>Marker</returns>
        private async Task<KartaMapNamedMarkerQueryResult> GetMarker(SpawnObjectAtMarkerRendererBase.SpawnObjectActionData parsedData)
        {
            return await _cachedDbAccess.GetMarkerById(parsedData.MapId, parsedData.MarkerId);
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
        /// Returns the export template to use
        /// </summary>
        /// <param name="project">Project</param>
        /// <returns>Export template to use</returns>
        protected abstract Task<ExportTemplate> GetExportTemplate(GoNorthProject project);

        /// <summary>
        /// Returns the preview prefix
        /// </summary>
        /// <param name="objectName">Object Name</param>
        /// <param name="markerName">Marker Name</param>
        /// <returns>Preview prefix</returns>
        protected abstract string GetPreviewPrefixText(string objectName, string markerName);

        /// <summary>
        /// Returns the value object to use
        /// </summary>
        /// <param name="parsedData">Parsed data</param>
        /// <param name="flexFieldObject">Flex field object</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <returns>Value Object</returns>
        protected abstract Task<IFlexFieldExportable> GetValueObject(SpawnObjectActionData parsedData, FlexFieldObject flexFieldObject, ExportPlaceholderErrorCollection errorCollection);


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