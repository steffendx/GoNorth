using System;
using System.Linq;
using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Data.FlexFieldDatabase;
using GoNorth.Data.Project;
using GoNorth.Services.Export.Data;
using GoNorth.Services.Export.Dialog.ConditionRendering.ConfigObject;
using GoNorth.Services.Export.Dialog.ConditionRendering.ScribanRenderingEngine.RenderingObjects;
using GoNorth.Services.Export.Dialog.ConditionRendering.Util;
using GoNorth.Services.Export.Placeholder;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.LanguageKeyGenerator;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.RenderingObjects;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.Util;
using Microsoft.Extensions.Localization;
using Scriban.Runtime;

namespace GoNorth.Services.Export.Dialog.ConditionRendering.ScribanRenderingEngine
{
    /// <summary>
    /// Base Class for rendering a scriban value condition
    /// </summary>
    public abstract class ScribanValueConditionBaseRenderer : ScribanConditionBaseRenderer<ValueFieldConditionData, ScribanValueConditionData>
    {
        /// <summary>
        /// Default template provider
        /// </summary>
        protected readonly ICachedExportDefaultTemplateProvider _defaultTemplateProvider;

        /// <summary>
        /// Cached database access
        /// </summary>
        protected readonly IExportCachedDbAccess _cachedDbAccess;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="defaultTemplateProvider">Default Template Provider</param>
        /// <param name="cachedDbAccess">Cached database access</param>
        /// <param name="languageKeyGenerator">Scriban language key generator</param>
        /// <param name="localizerFactory">String Localizer Factory</param>
        public ScribanValueConditionBaseRenderer(ICachedExportDefaultTemplateProvider defaultTemplateProvider, IExportCachedDbAccess cachedDbAccess, IScribanLanguageKeyGenerator languageKeyGenerator, 
                                                 IStringLocalizerFactory localizerFactory) : base(cachedDbAccess, languageKeyGenerator, localizerFactory)
        {
            _defaultTemplateProvider = defaultTemplateProvider;
            _cachedDbAccess = cachedDbAccess;
        }

        /// <summary>
        /// Returns the scriban flex field object for the export
        /// </summary>
        /// <param name="parsedData">Parsed condition</param>
        /// <param name="project">Project</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <param name="flexFieldObject">Flex field object to which the dialog belongs</param>
        /// <param name="exportSettings">Export Settings</param>
        /// <returns>Scriban export object</returns>
        protected abstract Task<ScribanFlexFieldObject> GetScribanFlexFieldObject(ValueFieldConditionData parsedData, GoNorthProject project, ExportPlaceholderErrorCollection errorCollection, FlexFieldObject flexFieldObject, ExportSettings exportSettings);

        /// <summary>
        /// Returns the value object to use for scriban exporting
        /// </summary>
        /// <param name="parsedData">Parsed data</param>
        /// <param name="project">Project</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <param name="flexFieldObject">Flex field object to which the dialog belongs</param>
        /// <param name="exportSettings">Export Settings</param>
        /// <returns>Value Object</returns>
        protected override async Task<ScribanValueConditionData> GetExportObject(ValueFieldConditionData parsedData, GoNorthProject project, ExportPlaceholderErrorCollection errorCollection, FlexFieldObject flexFieldObject, ExportSettings exportSettings)
        {
            ScribanFlexFieldObject exportObject = await GetScribanFlexFieldObject(parsedData, project, errorCollection, flexFieldObject, exportSettings);
            if(exportObject == null)
            {
                return null;
            }

            ScribanValueConditionData conditionData = new ScribanValueConditionData();
            conditionData.ValueObject = exportObject;

            conditionData.SelectedField = null;
            if(parsedData.FieldId != null)
            {
                conditionData.SelectedField = FlexFieldValueCollectorUtil.GetFlexField(conditionData.ValueObject.Fields.Values, parsedData.FieldId, parsedData.FieldName);
            }
            conditionData.IsOperatorPrimitive = ConditionRenderingUtil.IsConditionOperatorPrimitiveOperator(parsedData.Operator);
            conditionData.OriginalOperator = parsedData.Operator;
            conditionData.Operator = await ConditionRenderingUtil.GetCompareOperatorFromTemplate(_defaultTemplateProvider, project, parsedData.Operator, errorCollection);
            conditionData.CompareValue = FlexFieldValueCollectorUtil.MapValueToFieldValue(conditionData.SelectedField, parsedData.CompareValue, exportSettings);

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
            return string.Format("{0}.{1}.{2} | {0}.{3}.{2} | field.{4}", GetObjectKey(), StandardMemberRenamer.Rename(nameof(ScribanValueConditionData.ValueObject)), 
                                 StandardMemberRenamer.Rename(nameof(ScribanFlexFieldObject.Name)), StandardMemberRenamer.Rename(nameof(ScribanValueConditionData.SelectedField)),
                                 StandardMemberRenamer.Rename(nameof(ScribanFlexFieldField.Value)));
        }
    }
}