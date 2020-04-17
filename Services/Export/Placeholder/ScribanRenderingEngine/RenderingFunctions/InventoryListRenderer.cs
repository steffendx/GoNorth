using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Data.Kortisto;
using GoNorth.Data.Project;
using GoNorth.Services.Export.Data;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.RenderingObjects;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.Util;
using Microsoft.Extensions.Localization;
using Scriban;
using Scriban.Runtime;
using Scriban.Syntax;

namespace GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.RenderingFunctions
{
    /// <summary>
    /// Function to render a inventory list
    /// </summary>
    public class InventoryListRenderer : IScriptCustomFunction
    {
        /// <summary>
        /// Name of the function
        /// </summary>
        public const string InventoryListFunctionName = "inventory_list";

        /// <summary>
        /// Template placeholder resolver
        /// </summary>
        private readonly IExportTemplatePlaceholderResolver _templatePlaceholderResolver;

        /// <summary>
        /// Default template provider
        /// </summary>
        private readonly IExportCachedDbAccess _exportCachedDbAccess;

        /// <summary>
        /// Default template provider
        /// </summary>
        private readonly ICachedExportDefaultTemplateProvider _defaultTemplateProvider;

        /// <summary>
        /// Error collection
        /// </summary>
        private readonly ExportPlaceholderErrorCollection _errorCollection;

        /// <summary>
        /// Export object data
        /// </summary>
        private readonly ExportObjectData _exportObjectData;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="templatePlaceholderResolver">Template placeholder resolver</param>
        /// <param name="exportCachedDbAccess">Export cached database access</param>
        /// <param name="defaultTemplateProvider">Default template provider</param>
        /// <param name="errorCollection">Error collection</param>
        /// <param name="exportObjectData">Export object data</param>
        public InventoryListRenderer(IExportTemplatePlaceholderResolver templatePlaceholderResolver, IExportCachedDbAccess exportCachedDbAccess, ICachedExportDefaultTemplateProvider defaultTemplateProvider, 
                                     ExportPlaceholderErrorCollection errorCollection, ExportObjectData exportObjectData)
        {
            _templatePlaceholderResolver = templatePlaceholderResolver;
            _exportCachedDbAccess = exportCachedDbAccess;
            _defaultTemplateProvider = defaultTemplateProvider;
            _errorCollection = errorCollection;
            _exportObjectData = exportObjectData;
        }

        /// <summary>
        /// Renders an inventory List
        /// </summary>
        /// <param name="context">Template context</param>
        /// <param name="callerContext">Caller context</param>
        /// <param name="arguments">Arguments to render the list with</param>
        /// <returns>Rendered inventory list</returns>
        private async ValueTask<object> RenderInventoryList(TemplateContext context, ScriptNode callerContext, ScriptArray arguments)
        {
            if(!_exportObjectData.ExportData.ContainsKey(ExportConstants.ExportDataObject) || !(_exportObjectData.ExportData[ExportConstants.ExportDataObject] is KortistoNpc))
            {
                _errorCollection.AddInvalidParameter(ScribanErrorUtil.FormatScribanSpan(callerContext.Span));
                return "<<NO VALID NPC CONTEXT>>";
            }

            List<ScribanExportInventoryItem> itemList = ScribanParsingUtil.GetArrayFromScribanArgument<ScribanExportInventoryItem>(arguments, 0);
            if(itemList == null)
            {
                _errorCollection.AddInvalidParameter(ScribanErrorUtil.FormatScribanSpan(callerContext.Span));
                return "<<DID NOT PROVIDE VALID ITEM LIST>>";
            }

            GoNorthProject curProject = await _exportCachedDbAccess.GetDefaultProject();
            ExportTemplate inventoryTemplate = await _defaultTemplateProvider.GetDefaultTemplateByType(curProject.Id, TemplateType.ObjectInventory);

            ExportObjectData objectData = _exportObjectData.Clone();
            ((KortistoNpc)objectData.ExportData[ExportConstants.ExportDataObject]).Inventory = ConvertInventoryToKortistoInventory(itemList);

            ExportPlaceholderFillResult fillResult = await _templatePlaceholderResolver.FillPlaceholders(TemplateType.ObjectInventory, inventoryTemplate.Code, objectData, inventoryTemplate.RenderingEngine);
            _errorCollection.Merge(fillResult.Errors);

            return ScribanOutputUtil.IndentMultilineCode(context, fillResult.Code);
        }

        /// <summary>
        /// Converts a scriban inventory list to a Kortisto inventory list
        /// </summary>
        /// <param name="itemList">Scriban item list</param>
        /// <returns>Kortisto item list</returns>
        private List<KortistoInventoryItem> ConvertInventoryToKortistoInventory(List<ScribanExportInventoryItem> itemList)
        {
            return itemList.Select(i => new KortistoInventoryItem {
                ItemId = i.Id,
                Quantity = i.Quantity,
                IsEquipped = i.IsEquipped
            }).ToList();
        }

        /// <summary>
        /// Invokes the inventory list generation
        /// </summary>
        /// <param name="context">Template context</param>
        /// <param name="callerContext">Caller context</param>
        /// <param name="arguments">Arguments</param>
        /// <param name="blockStatement">Block Statement</param>
        /// <returns>Inventory list</returns>
        public object Invoke(TemplateContext context, ScriptNode callerContext, ScriptArray arguments, ScriptBlockStatement blockStatement)
        {
            return RenderInventoryList(context, callerContext, arguments).Result;
        }

        /// <summary>
        /// Invokes the inventory list generation async
        /// </summary>
        /// <param name="context">Template context</param>
        /// <param name="callerContext">Caller context</param>
        /// <param name="arguments">Arguments</param>
        /// <param name="blockStatement">Block Statement</param>
        /// <returns>Inventory list</returns>
        public async ValueTask<object> InvokeAsync(TemplateContext context, ScriptNode callerContext, ScriptArray arguments, ScriptBlockStatement blockStatement)
        {
            return await RenderInventoryList(context, callerContext, arguments);
        }


        /// <summary>
        /// Returns a list of supported placeholders
        /// </summary>
        /// <returns>List of supported placeholders</returns>
        public static List<ExportTemplatePlaceholder> GetPlaceholders(IStringLocalizerFactory localizerFactory)
        {
            IStringLocalizer localizer = localizerFactory.Create(typeof(InventoryListRenderer));
            return new List<ExportTemplatePlaceholder> {
                new ExportTemplatePlaceholder(string.Format("<ITEM_LIST> | {0}", InventoryListFunctionName), localizer["PlaceholderDesc_InventoryList"])
            };
        }
    }
}