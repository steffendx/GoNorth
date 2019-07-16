using System.Collections.Generic;
using System.Threading.Tasks;
using GoNorth.Data.Kortisto;

namespace GoNorth.Services.Export.Placeholder
{
    /// <summary>
    /// Interface for resolving the placeholders for a daily routine event
    /// </summary>
    public interface IDailyRoutineEventPlaceholderResolver
    {
        /// <summary>
        /// Resolved the placeholders for a single daily routine event
        /// </summary>
        /// <param name="code">Code to resolve the placeholders in</param>
        /// <param name="npc">Npc to which the event belongs</param>
        /// <param name="dailyRoutineEvent">Daily routine to use for resolving the placeholders</param>
        /// <returns>Code with resolved placeholders</returns>
        Task<string> ResolveDailyRoutineEventPlaceholders(string code, KortistoNpc npc, KortistoNpcDailyRoutineEvent dailyRoutineEvent);

        /// <summary>
        /// Returns the placeholders that are available for a daily routine event
        /// </summary>
        /// <returns>Placeholders</returns>
        List<ExportTemplatePlaceholder> GetPlaceholders();
    }
}