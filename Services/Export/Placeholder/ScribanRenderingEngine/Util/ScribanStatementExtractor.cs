using System.Collections.Generic;
using System.Linq;
using Scriban;
using Scriban.Syntax;

namespace GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.Util
{
    /// <summary>
    /// Utility class to extract scriban statements
    /// </summary>
    public static class ScribanStatementExtractor
    {
        /// <summary>
        /// Extracts a list of non text statements from a template
        /// </summary>
        /// <param name="template">Scriban template</param>
        /// <returns>Template statements</returns>
        public static List<ScriptStatement> ExtractPlainNonTextStatements(Template template)
        {
            return ExtractStatementsFromList(template.Page.Body.Statements);
        }

        /// <summary>
        /// Extracts a list of non text statements from a list of statements
        /// </summary>
        /// <param name="statements">Statement list</param>
        /// <returns>Script statement list</returns>
        private static List<ScriptStatement> ExtractStatementsFromList(ScriptList<ScriptStatement> statements)
        {
            List<ScriptStatement> scriptStatements = new List<ScriptStatement>();
            if(statements == null || !statements.Any())
            {
                return scriptStatements;
            }

            foreach(ScriptStatement curStatement in statements)
            {
                ExtractStatement(scriptStatements, curStatement);
            }

            return scriptStatements;
        }

        /// <summary>
        /// Extracts a statement
        /// </summary>
        /// <param name="scriptStatements">Statement list to fill</param>
        /// <param name="statement">Statement to check</param>
        private static void ExtractStatement(List<ScriptStatement> scriptStatements, ScriptStatement statement)
        {
            if (!(statement is ScriptRawStatement))
            {
                scriptStatements.Add(statement);
            }

            if (statement is ScriptLoopStatementBase)
            {
                ScriptLoopStatementBase loopStatement = (ScriptLoopStatementBase)statement;
                foreach(ScriptNode curChild in loopStatement.Children)
                {
                    ScriptStatement curStatement = curChild as ScriptStatement;
                    if(curStatement != null)
                    {
                        ExtractStatement(scriptStatements, curStatement);
                    }
                }
            }
            else if (statement is ScriptIfStatement)
            {
                ScriptIfStatement ifStatement = (ScriptIfStatement)statement;
                if (ifStatement.Then != null)
                {
                    scriptStatements.AddRange(ExtractStatementsFromList(ifStatement.Then.Statements));
                }

                if(ifStatement.Else != null)
                {
                    ExtractStatement(scriptStatements, ifStatement.Else);
                }
            }
            else if (statement is ScriptElseStatement)
            {
                ScriptElseStatement elseStatement = (ScriptElseStatement)statement;
                if (elseStatement.Body != null)
                {
                    scriptStatements.AddRange(ExtractStatementsFromList(elseStatement.Body.Statements));
                }
            }
            else if (statement is ScriptCaptureStatement)
            {
                ScriptCaptureStatement captureStatement = (ScriptCaptureStatement)statement;
                if (captureStatement.Body != null)
                {
                    scriptStatements.AddRange(ExtractStatementsFromList(captureStatement.Body.Statements));
                }
            }
            else if (statement is ScriptCaseStatement)
            {
                ScriptCaseStatement caseStatement = (ScriptCaseStatement)statement;
                if (caseStatement.Body != null)
                {
                    scriptStatements.AddRange(ExtractStatementsFromList(caseStatement.Body.Statements));
                }
            }
            else if (statement is ScriptFunction)
            {
                ScriptFunction functionStatement = (ScriptFunction)statement;
                if (functionStatement.Body != null)
                {
                    ExtractStatement(scriptStatements, functionStatement.Body);
                }
            }
            else if (statement is ScriptWhenStatement)
            {
                ScriptWhenStatement whenStatement = (ScriptWhenStatement)statement;
                if (whenStatement.Body != null)
                {
                    scriptStatements.AddRange(ExtractStatementsFromList(whenStatement.Body.Statements));
                }
            }
            else if (statement is ScriptWithStatement)
            {
                ScriptWithStatement withStatement = (ScriptWithStatement)statement;
                if (withStatement.Body != null)
                {
                    scriptStatements.AddRange(ExtractStatementsFromList(withStatement.Body.Statements));
                }
            }
            else if (statement is ScriptWrapStatement)
            {
                ScriptWrapStatement wrapStatement = (ScriptWrapStatement)statement;
                if (wrapStatement.Body != null)
                {
                    scriptStatements.AddRange(ExtractStatementsFromList(wrapStatement.Body.Statements));
                }
            }
            else if (statement is ScriptBlockStatement)
            {
                ScriptBlockStatement blockStatement = (ScriptBlockStatement)statement;
                scriptStatements.AddRange(ExtractStatementsFromList(blockStatement.Statements));
            }
        }
    }
}