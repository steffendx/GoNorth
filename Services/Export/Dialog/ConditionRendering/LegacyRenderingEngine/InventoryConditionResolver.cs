using System.Collections.Generic;
using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Data.FlexFieldDatabase;
using GoNorth.Data.Project;
using GoNorth.Data.Styr;
using GoNorth.Services.Export.Data;
using GoNorth.Services.Export.Dialog.ConditionRendering.ConfigObject;
using GoNorth.Services.Export.Dialog.ConditionRendering.Util;
using GoNorth.Services.Export.LanguageKeyGeneration;
using GoNorth.Services.Export.Placeholder;
using GoNorth.Services.Export.Placeholder.LegacyRenderingEngine;
using Microsoft.Extensions.Localization;

namespace GoNorth.Services.Export.Dialog.ConditionRendering.LegacyRenderingEngine
{
    /// <summary>
    /// Class for rendering an inventory condition
    /// </summary>
    public class InventoryConditionResolver : BaseConditionRenderer<InventoryConditionData>
    {
        /// <summary>
        /// Placeholder for getting the operator from a template
        /// </summary>
        private const string Placeholder_Operator = "Tale_Condition_CompareOperator";

        /// <summary>
        /// Placeholder for the start of the content that is only rendered if the operator is at least
        /// </summary>
        private const string Placeholder_Operator_IsAtLeast_Start = "Tale_Condition_CompareOperatorIsAtLeast_Start";

        /// <summary>
        /// Placeholder for the end of the content that is only rendered if the operator is at least
        /// </summary>
        private const string Placeholder_Operator_IsAtLeast_End = "Tale_Condition_CompareOperatorIsAtLeast_End";

        /// <summary>
        /// Placeholder for the start of the content that is only rendered if the operator is at maximum
        /// </summary>
        private const string Placeholder_Operator_IsAtMaximum_Start = "Tale_Condition_CompareOperatorIsAtMaximum_Start";

        /// <summary>
        /// Placeholder for the end of the content that is only rendered if the operator is at maximum
        /// </summary>
        private const string Placeholder_Operator_IsAtMaximum_End = "Tale_Condition_CompareOperatorIsAtMaximum_End";

        /// <summary>
        /// Placeholder for the quantity for compare
        /// </summary>
        private const string Placeholder_Quantity = "Tale_Condition_Quantity";

        /// <summary>
        /// Flex Field Item Resolver Prefix
        /// </summary>
        private const string FlexField_Item_Prefix = "Tale_Condition_SelectedItem";


        /// <summary>
        /// Default Template Provider
        /// </summary>
        private readonly ICachedExportDefaultTemplateProvider _defaultTemplateProvider;

        /// <summary>
        /// Cached Db Access
        /// </summary>
        private readonly IExportCachedDbAccess _cachedDbAccess;

        /// <summary>
        /// String Localizer
        /// </summary>
        private readonly IStringLocalizer _localizer;

        /// <summary>
        /// Resolver for flex field items
        /// </summary>
        private readonly FlexFieldExportTemplatePlaceholderResolver _itemPlaceholderResolver;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="defaultTemplateProvider">Default Template Provider</param>
        /// <param name="cachedDbAccess">Cached Db Access</param>
        /// <param name="languageKeyGenerator">Language Key Generator</param>
        /// <param name="localizerFactory">Localizer Factory</param>
        public InventoryConditionResolver(ICachedExportDefaultTemplateProvider defaultTemplateProvider, IExportCachedDbAccess cachedDbAccess, ILanguageKeyGenerator languageKeyGenerator, IStringLocalizerFactory localizerFactory)
        {
            _defaultTemplateProvider = defaultTemplateProvider;
            _cachedDbAccess = cachedDbAccess;
            _localizer = localizerFactory.Create(typeof(InventoryConditionResolver));
            _itemPlaceholderResolver = new FlexFieldExportTemplatePlaceholderResolver(defaultTemplateProvider, cachedDbAccess, languageKeyGenerator, localizerFactory, FlexField_Item_Prefix);
        }
        
        /// <summary>
        /// Sets the export template placeholder resolver
        /// </summary>
        /// <param name="templatePlaceholderResolver">Template placeholder resolver</param>
        public override void SetExportTemplatePlaceholderResolver(IExportTemplatePlaceholderResolver templatePlaceholderResolver)
        {
            _itemPlaceholderResolver.SetExportTemplatePlaceholderResolver(templatePlaceholderResolver);
        }

        /// <summary>
        /// Builds a condition element from parsed data
        /// </summary>
        /// <param name="template">Export template to use</param>
        /// <param name="parsedData">Parsed data</param>
        /// <param name="project">Project</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <param name="flexFieldObject">Flex field object to which the dialog belongs</param>
        /// <param name="exportSettings">Export Settings</param>
        /// <returns>Condition string</returns>
        public override async Task<string> BuildConditionElementFromParsedData(ExportTemplate template, InventoryConditionData parsedData, GoNorthProject project, ExportPlaceholderErrorCollection errorCollection, FlexFieldObject flexFieldObject, ExportSettings exportSettings)
        {
            StyrItem item = await _cachedDbAccess.GetItemById(parsedData.ItemId);
            if(item == null)
            {
                errorCollection.AddDialogItemNotFoundError();
                return string.Empty;
            }

            ExportObjectData itemExportData = new ExportObjectData();
            itemExportData.ExportData.Add(ExportConstants.ExportDataObject, item);
            itemExportData.ExportData.Add(ExportConstants.ExportDataObjectType, ExportConstants.ExportObjectTypeItem);

            string conditionCode = ExportUtil.BuildPlaceholderRegex(Placeholder_Operator).Replace(template.Code, await ConditionRenderingUtil.GetItemCompareOperatorFromTemplate(_defaultTemplateProvider, project, parsedData.Operator, errorCollection));
            conditionCode = ExportUtil.BuildPlaceholderRegex(Placeholder_Quantity).Replace(conditionCode, parsedData.Quantity.ToString());
            conditionCode = ExportUtil.RenderPlaceholderIfTrue(conditionCode, Placeholder_Operator_IsAtLeast_Start, Placeholder_Operator_IsAtLeast_End, parsedData.Operator == InventoryConditionData.CompareOperator_AtLeast);
            conditionCode = ExportUtil.RenderPlaceholderIfTrue(conditionCode, Placeholder_Operator_IsAtMaximum_Start, Placeholder_Operator_IsAtMaximum_End, parsedData.Operator == InventoryConditionData.CompareOperator_AtMaximum);
            
            _itemPlaceholderResolver.SetErrorMessageCollection(errorCollection);
            conditionCode = await _itemPlaceholderResolver.FillPlaceholders(conditionCode, itemExportData);

            return conditionCode;
        }

        /// <summary>
        /// Returns the Export Template Placeholders for a Template Type
        /// </summary>
        /// <param name="templateType">Template Type</param>
        /// <returns>Export Template Placeholder</returns>
        public override List<ExportTemplatePlaceholder> GetExportTemplatePlaceholdersForType(TemplateType templateType)
        {
            List<ExportTemplatePlaceholder> exportPlaceholders = new List<ExportTemplatePlaceholder> {
                ExportUtil.CreatePlaceHolder(Placeholder_Operator, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_Operator_IsAtLeast_Start, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_Operator_IsAtLeast_End, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_Operator_IsAtMaximum_Start, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_Operator_IsAtMaximum_End, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_Quantity, _localizer)
            };

            exportPlaceholders.AddRange(_itemPlaceholderResolver.GetExportTemplatePlaceholdersForType(TemplateType.ObjectItem));

            return exportPlaceholders;
        }
    }
}