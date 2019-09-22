using System;
using System.Collections.Generic;
using System.Linq;
using GoNorth.Data.Exporting;
using GoNorth.Data.FlexFieldDatabase;
using GoNorth.Data.Kortisto;
using GoNorth.Data.Project;
using GoNorth.Data.Styr;
using GoNorth.Services.Export.Data;
using GoNorth.Services.Export.LanguageKeyGeneration;
using GoNorth.Services.Export.Placeholder;
using Microsoft.Extensions.Localization;

namespace GoNorth.Services.Export.Dialog.ConditionRendering
{
    /// <summary>
    /// Class for rendering an inventory condition
    /// </summary>
    public class InventoryConditionResolver : BaseConditionRenderer<InventoryConditionResolver.InventoryConditionData>
    {
        /// <summary>
        /// Inventory Condition Data
        /// </summary>
        public class InventoryConditionData
        {
            /// <summary>
            /// Item Id
            /// </summary>
            public string ItemId { get; set; }

            /// <summary>
            /// Compare Operator
            /// </summary>
            public int Operator { get; set; }

            /// <summary>
            /// Compare Quantity
            /// </summary>
            public int Quantity { get; set; }
        }

        
        /// <summary>
        /// Compare Operator for at least
        /// </summary>
        private const int CompareOperator_AtLeast = 0;

        /// <summary>
        /// Compare Operator for at maximum
        /// </summary>
        private const int CompareOperator_AtMaximum = 1;


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
        /// true if the condition resolver is for the player, else false
        /// </summary>
        private readonly bool _isPlayer;
        
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
        /// <param name="isPlayer">true if the condition resolver is for the player, else false</param>
        public InventoryConditionResolver(ICachedExportDefaultTemplateProvider defaultTemplateProvider, IExportCachedDbAccess cachedDbAccess, ILanguageKeyGenerator languageKeyGenerator, IStringLocalizerFactory localizerFactory, bool isPlayer)
        {
            _defaultTemplateProvider = defaultTemplateProvider;
            _cachedDbAccess = cachedDbAccess;
            _localizer = localizerFactory.Create(typeof(InventoryConditionResolver));
            _itemPlaceholderResolver = new FlexFieldExportTemplatePlaceholderResolver(defaultTemplateProvider, cachedDbAccess, languageKeyGenerator, localizerFactory, FlexField_Item_Prefix);
            _isPlayer = isPlayer;
        }

        /// <summary>
        /// Builds a condition element from parsed data
        /// </summary>
        /// <param name="parsedData">Parsed data</param>
        /// <param name="project">Project</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <param name="flexFieldObject">Flex field object to which the dialog belongs</param>
        /// <param name="exportSettings">Export Settings</param>
        /// <returns>Condition string</returns>
        public override string BuildConditionElementFromParsedData(InventoryConditionResolver.InventoryConditionData parsedData, GoNorthProject project, ExportPlaceholderErrorCollection errorCollection, FlexFieldObject flexFieldObject, ExportSettings exportSettings)
        {
            ExportTemplate conditionTemplate = _defaultTemplateProvider.GetDefaultTemplateByType(project.Id, _isPlayer ? TemplateType.TaleConditionPlayerInventory : TemplateType.TaleConditionNpcInventory).Result;

            StyrItem item = _cachedDbAccess.GetItemById(parsedData.ItemId).Result;
            if(item == null)
            {
                errorCollection.AddDialogItemNotFoundError();
                return string.Empty;
            }

            ExportObjectData itemExportData = new ExportObjectData();
            itemExportData.ExportData.Add(ExportConstants.ExportDataObject, item);
            itemExportData.ExportData.Add(ExportConstants.ExportDataObjectType, ExportConstants.ExportObjectTypeItem);

            string conditionCode = ExportUtil.BuildPlaceholderRegex(Placeholder_Operator).Replace(conditionTemplate.Code, GetOperatorFromTemplate(project, parsedData.Operator, errorCollection));
            conditionCode = ExportUtil.BuildPlaceholderRegex(Placeholder_Quantity).Replace(conditionCode, parsedData.Quantity.ToString());
            conditionCode = ExportUtil.RenderPlaceholderIfTrue(conditionCode, Placeholder_Operator_IsAtLeast_Start, Placeholder_Operator_IsAtLeast_End, parsedData.Operator == CompareOperator_AtLeast);
            conditionCode = ExportUtil.RenderPlaceholderIfTrue(conditionCode, Placeholder_Operator_IsAtMaximum_Start, Placeholder_Operator_IsAtMaximum_End, parsedData.Operator == CompareOperator_AtMaximum);
            
            _itemPlaceholderResolver.SetErrorMessageCollection(errorCollection);
            conditionCode = _itemPlaceholderResolver.FillPlaceholders(conditionCode, itemExportData).Result;

            return conditionCode;
        }

        /// <summary>
        /// Returns the operator from the template of the condition
        /// </summary>
        /// <param name="project">Project</param>
        /// <param name="compareOperator">Compare Operator</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <returns>Compare Operator</returns>
        private string GetOperatorFromTemplate(GoNorthProject project, int compareOperator, ExportPlaceholderErrorCollection errorCollection)
        {
            switch(compareOperator)
            {
            case CompareOperator_AtLeast:
                return _defaultTemplateProvider.GetDefaultTemplateByType(project.Id, TemplateType.GeneralCompareOperatorBiggerOrEqual).Result.Code;
            case CompareOperator_AtMaximum:
                return _defaultTemplateProvider.GetDefaultTemplateByType(project.Id, TemplateType.GeneralCompareOperatorLessOrEqual).Result.Code;
            }

            errorCollection.AddDialogUnknownConditionOperator(compareOperator.ToString());
            return "";
        }

        /// <summary>
        /// Returns if true the condition element renderer has placeholders for a template type
        /// </summary>
        /// <param name="templateType">Tempalte Type to check</param>
        /// <returns>true if the condition element renderer has placeholders for the template type</returns>
        public override bool HasPlaceholdersForTemplateType(TemplateType templateType)
        {
            return (templateType == TemplateType.TaleConditionPlayerInventory && _isPlayer) || (templateType == TemplateType.TaleConditionNpcInventory && !_isPlayer);
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