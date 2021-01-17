using System.Collections.Generic;
using System.Threading.Tasks;
using GoNorth.Services.Export.Dialog.ActionRendering.ScribanRenderingEngine.RenderingObjects;
using GoNorth.Services.Export.Dialog.StepRenderers.RenderingObjects;
using GoNorth.Services.Export.LanguageKeyGeneration;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.RenderingFunctions;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.RenderingObjects;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.Util;
using Microsoft.Extensions.Localization;
using Scriban;
using Scriban.Runtime;
using Scriban.Syntax;

namespace GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.LanguageKeyGenerator
{
    /// <summary>
    /// Class for Scriban Language Key Generators
    /// </summary>
    public class ScribanLanguageKeyGenerator : ScribanBaseStringRenderingFunction<object>, IScribanLanguageKeyGenerator
    {
        /// <summary>
        /// Language Key Generator
        /// </summary>
        private readonly ILanguageKeyGenerator _languageKeyGenerator;

        /// <summary>
        /// Localizer Factory
        /// </summary>
        private readonly IStringLocalizerFactory _localizerFactory;

        /// <summary>
        /// Error Collection
        /// </summary>
        private ExportPlaceholderErrorCollection _errorCollection;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="languageKeyGenerator">Language Key Generator</param>
        /// <param name="localizerFactory">Localizer factory</param>
        public ScribanLanguageKeyGenerator(ILanguageKeyGenerator languageKeyGenerator, IStringLocalizerFactory localizerFactory)
        {
            _languageKeyGenerator = languageKeyGenerator;
            _localizerFactory = localizerFactory;
        }

        /// <summary>
        /// Sets the error collection
        /// </summary>
        /// <param name="errorCollection">Error collection to set</param>
        public void SetErrorCollection(ExportPlaceholderErrorCollection errorCollection)
        {
            // Ensure to use most outer error collection
            if(_errorCollection == null)
            {
                _errorCollection = errorCollection;
            }
        }

        /// <summary>
        /// Returns a language key
        /// </summary>
        /// <param name="templateContext">Template context</param>
        /// <param name="callerContext">Call context</param>
        /// <param name="arguments">Arguments</param>
        /// <returns>Language key</returns>
        private async ValueTask<object> GetLanguageKey(TemplateContext templateContext, ScriptNode callerContext, ScriptArray arguments)
        {
            ScriptFunctionCall functionCall = callerContext as ScriptFunctionCall;
            if(functionCall == null)
            {
                _errorCollection.AddCanNotGenerateLanguageKey(ScribanErrorUtil.FormatScribanSpan(callerContext.Span));
                return "<<USE NON PIPE NOTATION FOR LANGKEY>>";
            }

            if(functionCall.Arguments.Count != 1 || arguments.Count != 1)
            {
                _errorCollection.AddCanNotGenerateLanguageKey(ScribanErrorUtil.FormatScribanSpan(callerContext.Span));
                return "<<PASS IN EXACTLY ONE ARGUMENT FOR LANGKEY>>";
            }
            
            List<string> callHierarchy = ScribanParsingUtil.GetCallerHierarchy(functionCall.Arguments[0]);
            return await GenerateLanguageKeyFromCallHierarchy(templateContext, callerContext, callHierarchy);
        }

        /// <summary>
        /// Generates a language key from a call hierarchy
        /// </summary>
        /// <param name="templateContext">Template context</param>
        /// <param name="callerContext">Call context</param>
        /// <param name="callHierarchy">Call hierarchy</param>
        /// <returns>Language key</returns>
        private async ValueTask<object> GenerateLanguageKeyFromCallHierarchy(TemplateContext templateContext, ScriptNode callerContext, List<string> callHierarchy)
        {
            if(callHierarchy.Count < 2)
            {
                _errorCollection.AddCanNotGenerateLanguageKey(ScribanErrorUtil.FormatScribanSpan(callerContext.Span));
                return "<<INVALID ARGUMENTS FOR LANGKEY>>";
            }

            string objectNameValue = StandardMemberRenamer.Rename(nameof(ScribanFlexFieldObject.Name));
            string fieldValue = StandardMemberRenamer.Rename(nameof(ScribanFlexFieldField.Value));
            string unescapedFieldValue = StandardMemberRenamer.Rename(nameof(ScribanFlexFieldField.UnescapedValue));
            string textLineValue = StandardMemberRenamer.Rename(nameof(ScribanTextLine.TextLine));
            string choiceText = StandardMemberRenamer.Rename(nameof(ScribanChoiceOption.Text));
            string addQuestText = StandardMemberRenamer.Rename(nameof(ScribanAddQuestTextActionData.Text));
            string floatingTextData = StandardMemberRenamer.Rename(nameof(ScribanShowFloatingTextActionData.Text));
            if(callHierarchy[callHierarchy.Count - 1] == objectNameValue || callHierarchy[callHierarchy.Count - 1] == fieldValue || callHierarchy[callHierarchy.Count - 1] == unescapedFieldValue)
            {
                ScriptNode parentObjectExpression = BuildParentObjectValueScriptExpression(callHierarchy);
                object parentObject = templateContext.Evaluate(parentObjectExpression);
                if (parentObject == null)
                {
                    _errorCollection.AddCanNotGenerateLanguageKey(ScribanErrorUtil.FormatScribanSpan(callerContext.Span));
                    return "<<INVALID ARGUMENTS FOR LANGKEY>>";
                }

                if (parentObject is ScribanFlexFieldObject)
                {
                    ScribanFlexFieldObject langObject = (ScribanFlexFieldObject)parentObject;
                    return await _languageKeyGenerator.GetFlexFieldNameKey(langObject.Id, langObject.Name, langObject.ExportObjectType);
                }
                else if (parentObject is ScribanFlexFieldField)
                {
                    return await GenerateFlexFieldLanguageKey(callerContext, (ScribanFlexFieldField)parentObject);
                }
            }
            else if(callHierarchy[callHierarchy.Count - 1] == textLineValue)
            {
                ScriptNode parentObjectExpression = BuildParentObjectValueScriptExpression(callHierarchy);
                object parentObject = templateContext.Evaluate(parentObjectExpression);

                if (parentObject is ScribanTextLine)
                {
                    ScribanTextLine textLine = (ScribanTextLine)parentObject;
                    return await _languageKeyGenerator.GetDialogTextLineKey(textLine.NodeObject.Id, textLine.NodeObject.Name, textLine.IsPlayerLine ? ExportConstants.LanguageKeyTypePlayer : ExportConstants.LanguageKeyTypeNpc, 
                                                                            textLine.NodeId, textLine.UnescapedTextLine);
                }
            }
            else if(callHierarchy[callHierarchy.Count - 1] == choiceText || callHierarchy[callHierarchy.Count - 1] == addQuestText || callHierarchy[callHierarchy.Count - 1] == floatingTextData)
            {
                ScriptNode parentObjectExpression = BuildParentObjectValueScriptExpression(callHierarchy);
                object parentObject = templateContext.Evaluate(parentObjectExpression);

                if (parentObject is ScribanChoiceOption)
                {
                    ScribanChoiceOption choiceOption = (ScribanChoiceOption)parentObject;
                    return await _languageKeyGenerator.GetDialogTextLineKey(choiceOption.ParentChoice.NodeObject.Id, choiceOption.ParentChoice.NodeObject.Name, ExportConstants.LanguageKeyTypeChoice, 
                                                                            string.Format("{0}_{1}", choiceOption.ParentChoice.NodeId, choiceOption.Id), choiceOption.UnescapedText);
                }
                else if(parentObject is ScribanAddQuestTextActionData)
                {
                    ScribanAddQuestTextActionData addQuestTextData = (ScribanAddQuestTextActionData)parentObject;
                    return await _languageKeyGenerator.GetDialogTextLineKey(addQuestTextData.FlexFieldObject.Id, addQuestTextData.Quest.Name, ExportConstants.LanguageKeyTypeQuest, addQuestTextData.NodeStep.Id, 
                                                                            addQuestTextData.UnescapedText);
                }
                else if(parentObject is ScribanShowFloatingTextActionData)
                {
                    ScribanShowFloatingTextActionData showFloatingTextData = (ScribanShowFloatingTextActionData)parentObject;
                    string languageKeyType = ExportConstants.LanguageKeyTypeNpc;
                    if(showFloatingTextData.TargetNpc != null && showFloatingTextData.TargetNpc.IsPlayer)
                    {
                        languageKeyType = ExportConstants.LanguageKeyTypePlayer;
                    }
                    return await _languageKeyGenerator.GetDialogTextLineKey(showFloatingTextData.FlexFieldObject.Id, showFloatingTextData.FlexFieldObject.Name, languageKeyType, showFloatingTextData.NodeStep.Id, 
                                                                            showFloatingTextData.UnescapedText);
                }
            }

            _errorCollection.AddCanNotGenerateLanguageKey(ScribanErrorUtil.FormatScribanSpan(callerContext.Span));
            return "<<UNSUPPORTED PROPERTY FOR LANGKEY>>";
        }

        /// <summary>
        /// Builds a script expression to get a parent object
        /// </summary>
        /// <param name="callHierarchy">Call hierarchy</param>
        /// <returns>Script expression</returns>
        private ScriptNode BuildParentObjectValueScriptExpression(List<string> callHierarchy)
        {
            ScriptNode parentObjectExpression = null;
            if (callHierarchy.Count == 2)
            {
                parentObjectExpression = new ScriptVariableGlobal(callHierarchy[callHierarchy.Count - 2]);
            }
            else
            {
                ScriptExpressionStatement statement = new ScriptExpressionStatement();
                ScriptMemberExpression curMemberExpression = new ScriptMemberExpression();
                statement.Expression = curMemberExpression;
                for (int curHierarchEntry = callHierarchy.Count - 2; curHierarchEntry >= 0; --curHierarchEntry)
                {
                    curMemberExpression.Member = new ScriptVariableGlobal(callHierarchy[curHierarchEntry]);
                    if (curHierarchEntry > 1)
                    {
                        ScriptMemberExpression nextMemberExpression = new ScriptMemberExpression();
                        curMemberExpression.Target = nextMemberExpression;
                        curMemberExpression = nextMemberExpression;
                    }
                    else
                    {
                        curMemberExpression.Target = new ScriptVariableGlobal(callHierarchy[0]);
                        break;
                    }
                }

                parentObjectExpression = statement;
            }

            return parentObjectExpression;
        }

        /// <summary>
        /// Generates a language key for a flex field
        /// </summary>
        /// <param name="callerContext">Caller context</param>
        /// <param name="flexField">Flex field to generate the language key for</param>
        /// <returns>Language key</returns>
        private async ValueTask<object> GenerateFlexFieldLanguageKey(ScriptNode callerContext, ScribanFlexFieldField flexField)
        {
            if (!flexField.Exists)
            {
                string errorValue;
                ScribanMissingFlexFieldField missingField = flexField as ScribanMissingFlexFieldField;
                if(missingField != null)
                {
                    errorValue = missingField.ErrorValue;
                }
                else
                {
                    errorValue = flexField.Value != null ? flexField.Value.ToString() : string.Format("MISSING_FIELD_{0}", flexField.Name);
                }
                _errorCollection.AddCanNotGenerateLanguageKey(ScribanErrorUtil.FormatScribanSpan(callerContext.Span));
                return errorValue;
            }

            if (flexField.ParentObject == null)
            {
                _errorCollection.AddCanNotGenerateLanguageKey(ScribanErrorUtil.FormatScribanSpan(callerContext.Span));
                return "<<INVALID ARGUMENTS FOR LANGKEY>>";
            }
            return await _languageKeyGenerator.GetFlexFieldFieldKey(flexField.ParentObject.Id, flexField.ParentObject.Name, flexField.ParentObject.ExportObjectType, flexField.Id, flexField.Name, flexField.UnescapedValue.ToString());
        }

        /// <summary>
        /// Invokes the language key generation
        /// </summary>
        /// <param name="context">Template context</param>
        /// <param name="callerContext">Caller context</param>
        /// <param name="arguments">Arguments</param>
        /// <param name="blockStatement">Block Statement</param>
        /// <returns>Language Key</returns>
        public override object Invoke(TemplateContext context, ScriptNode callerContext, ScriptArray arguments, ScriptBlockStatement blockStatement)
        {
            return GetLanguageKey(context, callerContext, arguments).Result;
        }

        /// <summary>
        /// Invokes the language key generation async
        /// </summary>
        /// <param name="context">Template context</param>
        /// <param name="callerContext">Caller context</param>
        /// <param name="arguments">Arguments</param>
        /// <param name="blockStatement">Block Statement</param>
        /// <returns>Language Key</returns>
        public override ValueTask<object> InvokeAsync(TemplateContext context, ScriptNode callerContext, ScriptArray arguments, ScriptBlockStatement blockStatement)
        {
            return GetLanguageKey(context, callerContext, arguments);
        }

        /// <summary>
        /// Returns the Export Template Placeholders for the language key
        /// </summary>
        /// <param name="valuePlaceholdersDesc">Placeholder that is added in the key to describe the possible language keys</param>
        /// <returns>Export Template Placeholder</returns>
        public List<ExportTemplatePlaceholder> GetExportTemplatePlaceholders(string valuePlaceholdersDesc)
        {
            IStringLocalizer localizer = _localizerFactory.Create(typeof(ScribanLanguageKeyGenerator));

            return new List<ExportTemplatePlaceholder> {
                new ExportTemplatePlaceholder(string.Format("{0} <{1}>", ExportConstants.ScribanLanguageKeyName, valuePlaceholdersDesc), localizer["PlaceholderDesc_LangKey"])
            };
        }
    }
}