using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Data.FlexFieldDatabase;
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
    /// Function to render a flex field attribute list
    /// </summary>
    public class FlexFieldAttributeListRenderer : ScribanBaseStringRenderingFunction<List<ScribanFlexFieldField>>
    {
        /// <summary>
        /// Name of the function
        /// </summary>
        public const string AttributeListFunctionName = "attribute_list";

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
        public FlexFieldAttributeListRenderer(IExportTemplatePlaceholderResolver templatePlaceholderResolver, IExportCachedDbAccess exportCachedDbAccess, ICachedExportDefaultTemplateProvider defaultTemplateProvider, 
                                              ExportPlaceholderErrorCollection errorCollection, ExportObjectData exportObjectData)
        {
            _templatePlaceholderResolver = templatePlaceholderResolver;
            _exportCachedDbAccess = exportCachedDbAccess;
            _defaultTemplateProvider = defaultTemplateProvider;
            _errorCollection = errorCollection;
            _exportObjectData = exportObjectData;
        }

        /// <summary>
        /// Renders an attribute List
        /// </summary>
        /// <param name="context">Template context</param>
        /// <param name="callerContext">Caller context</param>
        /// <param name="arguments">Arguments to render the list with</param>
        /// <returns>Rendered attribute list</returns>
        private async ValueTask<object> RenderAttributeList(TemplateContext context, ScriptNode callerContext, ScriptArray arguments)
        {
            List<ScribanFlexFieldField> fieldList = ScribanParsingUtil.GetArrayFromScribanArgument<ScribanFlexFieldField>(arguments, 0);
            if(fieldList == null)
            {
                _errorCollection.AddInvalidParameter(ScribanErrorUtil.FormatScribanSpan(callerContext.Span));
                return "<<DID NOT PROVIDE VALID ATTRIBUTE LIST>>";
            }

            GoNorthProject curProject = await _exportCachedDbAccess.GetUserProject();
            ExportTemplate attributeListTemplate = await _defaultTemplateProvider.GetDefaultTemplateByType(curProject.Id, TemplateType.ObjectAttributeList);

            ExportObjectData objectData = _exportObjectData.Clone();
            if(objectData.ExportData.ContainsKey(ExportConstants.ExportDataObject) && objectData.ExportData[ExportConstants.ExportDataObject] is IFlexFieldExportable)
            {
                ((IFlexFieldExportable)objectData.ExportData[ExportConstants.ExportDataObject]).Fields = ConvertListToFlexFieldList(fieldList);
            }

            ExportPlaceholderFillResult fillResult = await _templatePlaceholderResolver.FillPlaceholders(TemplateType.ObjectAttributeList, attributeListTemplate.Code, objectData, attributeListTemplate.RenderingEngine);
            _errorCollection.Merge(fillResult.Errors);

            return ScribanOutputUtil.IndentMultilineCode(context, fillResult.Code);
        }

        /// <summary>
        /// Converts a scriban flex field list to a flex field list
        /// </summary>
        /// <param name="fieldList">Field list</param>
        /// <returns>Flex field list</returns>
        private List<FlexField> ConvertListToFlexFieldList(List<ScribanFlexFieldField> fieldList)
        {
            return fieldList.Select(f => new FlexField {
                Id = f.Id,
                Name = f.Name,
                FieldType = FlexFieldValueCollectorUtil.ConvertScribanFieldTypeToFlexFieldType(f.Type),
                Value = f.UnescapedValue.ToString()
            }).ToList();
        }

        /// <summary>
        /// Invokes the attribute list generation
        /// </summary>
        /// <param name="context">Template context</param>
        /// <param name="callerContext">Caller context</param>
        /// <param name="arguments">Arguments</param>
        /// <param name="blockStatement">Block Statement</param>
        /// <returns>Attribute list</returns>
        public override object Invoke(TemplateContext context, ScriptNode callerContext, ScriptArray arguments, ScriptBlockStatement blockStatement)
        {
            return RenderAttributeList(context, callerContext, arguments).Result;
        }

        /// <summary>
        /// Invokes the attribute list generation async
        /// </summary>
        /// <param name="context">Template context</param>
        /// <param name="callerContext">Caller context</param>
        /// <param name="arguments">Arguments</param>
        /// <param name="blockStatement">Block Statement</param>
        /// <returns>Attribute list</returns>
        public override async ValueTask<object> InvokeAsync(TemplateContext context, ScriptNode callerContext, ScriptArray arguments, ScriptBlockStatement blockStatement)
        {
            return await RenderAttributeList(context, callerContext, arguments);
        }


        /// <summary>
        /// Returns a list of supported placeholders
        /// </summary>
        /// <returns>List of supported placeholders</returns>
        public static List<ExportTemplatePlaceholder> GetPlaceholders(IStringLocalizerFactory localizerFactory)
        {
            IStringLocalizer localizer = localizerFactory.Create(typeof(FlexFieldAttributeListRenderer));
            return new List<ExportTemplatePlaceholder> {
                new ExportTemplatePlaceholder(string.Format("<ATTRIBUTE_LIST> | {0}", AttributeListFunctionName), localizer["PlaceholderDesc_AttributeList"])
            };
        }
    }
}