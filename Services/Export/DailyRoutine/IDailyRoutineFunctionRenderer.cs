using System.Collections.Generic;
using System.Threading.Tasks;
using GoNorth.Data.FlexFieldDatabase;
using GoNorth.Data.Kortisto;
using GoNorth.Services.Export.NodeGraphExport;
using GoNorth.Services.Export.Placeholder;

namespace GoNorth.Services.Export.DailyRoutine
{
    /// <summary>
    /// Interface for generating Export Daily Routine Function Names
    /// </summary>
    public interface IDailyRoutineFunctionRenderer
    {
        /// <summary>
        /// Sets the error colllection
        /// </summary>
        /// <param name="errorCollection">Error collection</param>
        void SetErrorCollection(ExportPlaceholderErrorCollection errorCollection);
        
        /// <summary>
        /// Sets the export template placeholder resolver
        /// </summary>
        /// <param name="templatePlaceholderResolver">Template placeholder resolver</param>
        void SetExportTemplatePlaceholderResolver(IExportTemplatePlaceholderResolver templatePlaceholderResolver);

        /// <summary>
        /// Renders a list of daily routine functions
        /// </summary>
        /// <param name="dailyRoutineEvents">Daily routine events</param>
        /// <param name="flexFieldObject">Npc to which the events belong</param>
        /// <returns>List of daily routine functions</returns>
        Task<List<DailyRoutineFunction>> RenderDailyRoutineFunctions(List<KortistoNpcDailyRoutineEvent> dailyRoutineEvents, FlexFieldObject flexFieldObject);

    }
}