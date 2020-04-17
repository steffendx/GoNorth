using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Data.FlexFieldDatabase;
using GoNorth.Services.Export.Data;
using GoNorth.Services.Export.Dialog.ActionRendering.ConfigObject;
using GoNorth.Services.Export.Dialog.ActionRendering.ScribanRenderingEngine.RenderingObjects;
using GoNorth.Services.Export.Dialog.ActionRendering.ScribanRenderingEngine.Util;
using GoNorth.Services.Export.Dialog.ActionRendering.SharedRendering;
using GoNorth.Services.Export.Dialog.StepRenderers.ActionRenderer;
using GoNorth.Services.Export.Placeholder;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.LanguageKeyGenerator;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.Util;
using Microsoft.Extensions.Localization;
using Scriban.Runtime;

namespace GoNorth.Services.Export.Dialog.ActionRendering.ScribanRenderingEngine
{
    /// <summary>
    /// Base Class for rendering a value action with scriban
    /// </summary>
    public abstract class ScribanValueActionRenderBase : BaseValueActionRenderer
    {
        /// <summary>
        /// Scriban language key generator
        /// </summary>
        protected readonly IScribanLanguageKeyGenerator _scribanLanguageKeyGenerator;

        /// <summary>
        /// String Localizer
        /// </summary>
        protected readonly IStringLocalizerFactory _localizerFactory;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="defaultTemplateProvider">Default Template Provider</param>
        /// <param name="cachedDbAccess">Cached Db Access</param>        
        /// <param name="languageKeyGenerator">Language Key Generator, can be null if no language key generator is needed</param>
        /// <param name="localizerFactory">Localizer Factory</param>
        public ScribanValueActionRenderBase(ICachedExportDefaultTemplateProvider defaultTemplateProvider, IExportCachedDbAccess cachedDbAccess, IScribanLanguageKeyGenerator languageKeyGenerator, IStringLocalizerFactory localizerFactory) :
                                            base(defaultTemplateProvider, cachedDbAccess)
        {
            _scribanLanguageKeyGenerator = languageKeyGenerator;
            _localizerFactory = localizerFactory;
        }

        /// <summary>
        /// Fills the placeholders
        /// </summary>
        /// <param name="template">Template to use</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <param name="parsedData">Parsed config data</param>
        /// <param name="valueObject">Value object to use</param>
        /// <param name="actionOperator">Action operator to use</param>
        /// <param name="flexFieldObject">Flex field object to which the dialog belongs</param>
        /// <param name="curStep">Current step that is rendered</param>
        /// <param name="nextStep">Next step that is being rendered</param>
        /// <param name="exportSettings">Export Settings</param>
        /// <param name="stepRenderer">Action Step renderer</param>
        /// <returns>Filled placeholders</returns>
        protected override async Task<string> FillPlaceholders(ExportTemplate template, ExportPlaceholderErrorCollection errorCollection, ValueFieldActionData parsedData, IFlexFieldExportable valueObject, string actionOperator, 
                                                               FlexFieldObject flexFieldObject, ExportDialogData curStep, ExportDialogData nextStep, ExportSettings exportSettings, IActionStepRenderer stepRenderer)
        {
            ScribanValueActionData valueData = new ScribanValueActionData();
            valueData.ValueObject = FlexFieldValueCollectorUtil.ConvertScribanFlexFieldObject(valueObject, exportSettings, errorCollection);
            valueData.TargetField = FlexFieldValueCollectorUtil.GetFlexField(valueData.ValueObject.Fields.Values, parsedData.FieldId, parsedData.FieldName);
            if(valueData.TargetField == null)
            {
                errorCollection.AddErrorFlexField(parsedData.FieldName, valueObject.Name);
                return string.Empty;
            }

            valueData.Operator = actionOperator;
            valueData.OriginalOperator = parsedData.Operator;
            valueData.ValueChange = FlexFieldValueCollectorUtil.MapValueToFieldValue(valueData.TargetField, parsedData.ValueChange, exportSettings);

            return await ScribanActionRenderingUtil.FillPlaceholders(_cachedDbAccess, errorCollection, template.Code, valueData, flexFieldObject, curStep, nextStep, _scribanLanguageKeyGenerator, stepRenderer);
        }

        /// <summary>
        /// Returns the Export Template Placeholders for a Template Type
        /// </summary>
        /// <param name="templateType">Template Type</param>
        /// <returns>Export Template Placeholder</returns>
        public override List<ExportTemplatePlaceholder> GetExportTemplatePlaceholdersForType(TemplateType templateType)
        {
            string languageKeyValueDesc = string.Format("{0}.{1}.{2} | {0}.{3}.{4}", ExportConstants.ScribanActionObjectKey, StandardMemberRenamer.Rename(nameof(ScribanValueActionData.ValueObject)), 
                                                        StandardMemberRenamer.Rename(nameof(ScribanValueActionData.ValueObject.Name)), StandardMemberRenamer.Rename(nameof(ScribanValueActionData.TargetField)), 
                                                        StandardMemberRenamer.Rename(nameof(ScribanValueActionData.TargetField.Value)));
            return ScribanActionRenderingUtil.GetExportTemplatePlaceholdersForType<ScribanValueActionData>(_localizerFactory, _scribanLanguageKeyGenerator, languageKeyValueDesc);
        }
    }
}