using System.Collections.Generic;
using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Data.Kortisto;
using GoNorth.Services.Export.DailyRoutine;

namespace GoNorth.Services.Export.Placeholder.LegacyRenderingEngine
{
    /// <summary>
    /// Interface for resolving the content placeholders for a daily routine event
    /// </summary>
    public interface ILegacyDailyRoutineEventContentPlaceholderResolver
    {
        /// <summary>
        /// Sets the export template placeholder resolver
        /// </summary>
        /// <param name="templatePlaceholderResolver">Template placeholder resolver</param>
        void SetExportTemplatePlaceholderResolver(IExportTemplatePlaceholderResolver templatePlaceholderResolver);

        /// <summary>
        /// Sets the error collection
        /// </summary>
        /// <param name="errorCollection">Error collection</param>
        void SetErrorCollection(ExportPlaceholderErrorCollection errorCollection);

        /// <summary>
        /// Resolved the placeholders for a single daily routine event
        /// </summary>
        /// <param name="code">Code to resolve the placeholders in</param>
        /// <param name="npc">Npc to which the event belongs</param>
        /// <param name="dailyRoutineEvent">Daily routine to use for resolving the placeholders</param>
        /// <param name="errorCollection">Error collection</param>
        /// <returns>Code with resolved placeholders</returns>
        Task<string> ResolveDailyRoutineEventContentPlaceholders(string code, KortistoNpc npc, KortistoNpcDailyRoutineEvent dailyRoutineEvent, ExportPlaceholderErrorCollection errorCollection);
        
        /// <summary>
        /// Replaces the event function
        /// </summary>
        /// <param name="code">Function code</param>
        /// <param name="function">Function to render</param>
        /// <param name="errorCollection">Error collection</param>
        /// <returns>Rendered event function</returns>
        Task<string> ReplaceEventFunction(string code, DailyRoutineFunction function, ExportPlaceholderErrorCollection errorCollection);

        /// <summary>
        /// Fills the function code for a daily routine
        /// </summary>
        /// <param name="code">Code to fill</param>
        /// <param name="function">Function data</param>
        /// <returns>Filled code</returns>
        string FillFunctionCode(string code, DailyRoutineFunction function);

        /// <summary>
        /// Returns the placeholders that are available for a daily routine event
        /// </summary>
        /// <param name="templateType">Template Type</param>
        /// <returns>Placeholders</returns>
        List<ExportTemplatePlaceholder> GetPlaceholders(TemplateType templateType);
    }
}