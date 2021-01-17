using System;
using System.Threading.Tasks;
using Scriban;
using Scriban.Runtime;
using Scriban.Syntax;

namespace GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.RenderingFunctions
{
    /// <summary>
    /// Base rendering class for scriban string functions
    /// </summary>
    public abstract class ScribanBaseStringRenderingFunction<ParameterType> : IScriptCustomFunction
    {
        /// <summary>
        /// Returns the required parameter count
        /// </summary>
        public int RequiredParameterCount => 1;

        /// <summary>
        /// Parameter count
        /// </summary>
        public int ParameterCount => 1;
        
        /// <summary>
        /// Returns the parameter kind
        /// </summary>
        public ScriptVarParamKind VarParamKind => ScriptVarParamKind.Direct;

        /// <summary>
        /// Returns the return type
        /// </summary>
        public Type ReturnType => typeof(string);

        /// <summary>
        /// Returns the parameter info
        /// </summary>
        /// <param name="index">Index</param>
        /// <returns>Script Parameter info</returns>
        public ScriptParameterInfo GetParameterInfo(int index)
        {
            return new ScriptParameterInfo(typeof(ParameterType), "value");
        }

        /// <summary>
        /// Invokes the daily routine function list generation
        /// </summary>
        /// <param name="context">Template context</param>
        /// <param name="callerContext">Caller context</param>
        /// <param name="arguments">Arguments</param>
        /// <param name="blockStatement">Block Statement</param>
        /// <returns>Daily routine function list</returns>
        public abstract object Invoke(TemplateContext context, ScriptNode callerContext, ScriptArray arguments, ScriptBlockStatement blockStatement);

        /// <summary>
        /// Invokes the daily routine function list generation async
        /// </summary>
        /// <param name="context">Template context</param>
        /// <param name="callerContext">Caller context</param>
        /// <param name="arguments">Arguments</param>
        /// <param name="blockStatement">Block Statement</param>
        /// <returns>Daily routine function list</returns>
        public abstract ValueTask<object> InvokeAsync(TemplateContext context, ScriptNode callerContext, ScriptArray arguments, ScriptBlockStatement blockStatement);
    }
}