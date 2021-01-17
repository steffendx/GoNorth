using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Services.Export.Data;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.Util;
using Scriban;
using Scriban.Syntax;

namespace GoNorth.Services.Export.TemplateParsing
{
    /// <summary>
    /// Class for parsing scriban export snippets
    /// </summary>
    public class ScribanIncludeTemplateRefParser : IScribanIncludeTemplateRefParser
    {
        /// <summary>
        /// Cached Database access
        /// </summary>
        private readonly IExportCachedDbAccess _cachedDbAccess;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="cachedDbAccess">Cached database access</param>
        public ScribanIncludeTemplateRefParser(IExportCachedDbAccess cachedDbAccess)
        {
            _cachedDbAccess = cachedDbAccess;
        }

        /// <summary>
        /// Parses an export template for export snippets
        /// </summary>
        /// <param name="template">Template to parse</param>
        public async Task ParseExportTemplate(ExportTemplate template)
        {
            if(template == null || template.RenderingEngine != ExportTemplateRenderingEngine.Scriban || string.IsNullOrEmpty(template.Code))
            {
                return;
            }

            template.UsedIncludeTemplates = await ParseIncludeTemplates(template);
        }

        /// <summary>
        /// Parses the referenced include templates from a template
        /// </summary>
        /// <param name="template">Template to parse</param>
        /// <returns>List of referenced include</returns>
        private async Task<List<IncludeExportTemplateReference>> ParseIncludeTemplates(ExportTemplate template)
        {
            Template parsedTemplate = Template.Parse(template.Code);
            
            List<IncludeExportTemplateReference> includeTemplateRefs = new List<IncludeExportTemplateReference>();
            List<ScriptStatement> statementsToCheck = ScribanStatementExtractor.ExtractPlainNonTextStatements(parsedTemplate);
            foreach(ScriptStatement curStatement in statementsToCheck)
            {
                if(!(curStatement is ScriptExpressionStatement))
                {
                    continue;
                }

                ScriptExpressionStatement expressionStatement = (ScriptExpressionStatement)curStatement;
                if(expressionStatement.Expression == null || !(expressionStatement.Expression is ScriptFunctionCall))
                {
                    continue;
                }

                ScriptFunctionCall functionCall = (ScriptFunctionCall)expressionStatement.Expression;
                if(functionCall.Target == null || functionCall.Target.ToString() != "include")
                {
                    continue;
                }

                if(functionCall.Arguments.Count < 1)
                {
                    continue;
                }

                string templateName = functionCall.Arguments[0].ToString().Trim('\"').Trim('\'');
                IncludeExportTemplate existingTemplate = await _cachedDbAccess.GetIncludeTemplateByName(template.ProjectId, templateName);
                if(existingTemplate != null && !includeTemplateRefs.Any(e => e.IncludeTemplateId == existingTemplate.Id))
                {
                    includeTemplateRefs.Add(new IncludeExportTemplateReference {
                        IncludeTemplateId = existingTemplate.Id,
                        Name = existingTemplate.Name
                    });
                }
            }

            return includeTemplateRefs;
        }
    }
}