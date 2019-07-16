using System.Collections.Generic;
using GoNorth.Data.Exporting;
using GoNorth.Data.Kortisto;

namespace GoNorth.Services.Export.Placeholder
{
    /// <summary>
    /// Interface for resolving the content placeholders for a daily routine event
    /// </summary>
    public interface IDailyRoutineEventContentPlaceholderResolver
    {
        /// <summary>
        /// Resolved the placeholders for a single daily routine event
        /// </summary>
        /// <param name="code">Code to resolve the placeholders in</param>
        /// <param name="npc">Npc to which the event belongs</param>
        /// <param name="dailyRoutineEvent">Daily routine to use for resolving the placeholders</param>
        /// <param name="errorCollection">Error collection</param>
        /// <returns>Code with resolved placeholders</returns>
        string ResolveDailyRoutineEventContentPlaceholders(string code, KortistoNpc npc, KortistoNpcDailyRoutineEvent dailyRoutineEvent, ExportPlaceholderErrorCollection errorCollection);

        /// <summary>
        /// Returns the placeholders that are available for a daily routine event
        /// </summary>
        /// <param name="templateType">Template Type</param>
        /// <returns>Placeholders</returns>
        List<ExportTemplatePlaceholder> GetPlaceholders(TemplateType templateType);
    }
}