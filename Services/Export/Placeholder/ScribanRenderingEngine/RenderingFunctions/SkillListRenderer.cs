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
    /// Function to render a skill list
    /// </summary>
    public class SkillListRenderer : IScriptCustomFunction
    {
        /// <summary>
        /// Name of the function
        /// </summary>
        public const string SkillListFunctionName = "skill_list";

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
        public SkillListRenderer(IExportTemplatePlaceholderResolver templatePlaceholderResolver, IExportCachedDbAccess exportCachedDbAccess, ICachedExportDefaultTemplateProvider defaultTemplateProvider, 
                                     ExportPlaceholderErrorCollection errorCollection, ExportObjectData exportObjectData)
        {
            _templatePlaceholderResolver = templatePlaceholderResolver;
            _exportCachedDbAccess = exportCachedDbAccess;
            _defaultTemplateProvider = defaultTemplateProvider;
            _errorCollection = errorCollection;
            _exportObjectData = exportObjectData;
        }

        /// <summary>
        /// Renders an skill List
        /// </summary>
        /// <param name="context">Template context</param>
        /// <param name="callerContext">Caller context</param>
        /// <param name="arguments">Arguments to render the list with</param>
        /// <returns>Rendered skill list</returns>
        private async ValueTask<object> RenderSkillList(TemplateContext context, ScriptNode callerContext, ScriptArray arguments)
        {
            if(!_exportObjectData.ExportData.ContainsKey(ExportConstants.ExportDataObject) || !(_exportObjectData.ExportData[ExportConstants.ExportDataObject] is KortistoNpc))
            {
                _errorCollection.AddInvalidParameter(ScribanErrorUtil.FormatScribanSpan(callerContext.Span));
                return "<<NO VALID NPC CONTEXT>>";
            }

            List<ScribanExportSkill> skillList = ScribanParsingUtil.GetArrayFromScribanArgument<ScribanExportSkill>(arguments, 0);
            if(skillList == null)
            {
                _errorCollection.AddInvalidParameter(ScribanErrorUtil.FormatScribanSpan(callerContext.Span));
                return "<<DID NOT PROVIDE VALID SKILL LIST>>";
            }

            GoNorthProject curProject = await _exportCachedDbAccess.GetDefaultProject();
            ExportTemplate skillListTemplate = await _defaultTemplateProvider.GetDefaultTemplateByType(curProject.Id, TemplateType.ObjectSkillList);

            ExportObjectData objectData = _exportObjectData.Clone();
            ((KortistoNpc)objectData.ExportData[ExportConstants.ExportDataObject]).Skills = ConvertSkillsToKortistoNpcSkill(skillList);

            ExportPlaceholderFillResult fillResult = await _templatePlaceholderResolver.FillPlaceholders(TemplateType.ObjectSkillList, skillListTemplate.Code, objectData, skillListTemplate.RenderingEngine);
            _errorCollection.Merge(fillResult.Errors);

            return ScribanOutputUtil.IndentMultilineCode(context, fillResult.Code);
        }

        /// <summary>
        /// Converts a scriban skill list to a Kortisto skill list
        /// </summary>
        /// <param name="skillList">Scriban skill list</param>
        /// <returns>Kortisto skill list</returns>
        private List<KortistoNpcSkill> ConvertSkillsToKortistoNpcSkill(List<ScribanExportSkill> skillList)
        {
            return skillList.Select(s => new KortistoNpcSkill {
                SkillId = s.Id
            }).ToList();
        }

        /// <summary>
        /// Invokes the skill list generation
        /// </summary>
        /// <param name="context">Template context</param>
        /// <param name="callerContext">Caller context</param>
        /// <param name="arguments">Arguments</param>
        /// <param name="blockStatement">Block Statement</param>
        /// <returns>Rendered skill list</returns>
        public object Invoke(TemplateContext context, ScriptNode callerContext, ScriptArray arguments, ScriptBlockStatement blockStatement)
        {
            return RenderSkillList(context, callerContext, arguments).Result;
        }

        /// <summary>
        /// Invokes the skill list generation async
        /// </summary>
        /// <param name="context">Template context</param>
        /// <param name="callerContext">Caller context</param>
        /// <param name="arguments">Arguments</param>
        /// <param name="blockStatement">Block Statement</param>
        /// <returns>Rendered skill list</returns>
        public async ValueTask<object> InvokeAsync(TemplateContext context, ScriptNode callerContext, ScriptArray arguments, ScriptBlockStatement blockStatement)
        {
            return await RenderSkillList(context, callerContext, arguments);
        }


        /// <summary>
        /// Returns a list of supported placeholders
        /// </summary>
        /// <returns>List of supported placeholders</returns>
        public static List<ExportTemplatePlaceholder> GetPlaceholders(IStringLocalizerFactory localizerFactory)
        {
            IStringLocalizer localizer = localizerFactory.Create(typeof(SkillListRenderer));
            return new List<ExportTemplatePlaceholder> {
                new ExportTemplatePlaceholder(string.Format("<SKILL_LIST> | {0}", SkillListFunctionName), localizer["PlaceholderDesc_SkillList"])
            };
        }
    }
}