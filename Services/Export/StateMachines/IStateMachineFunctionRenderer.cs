using System.Collections.Generic;
using System.Threading.Tasks;
using GoNorth.Data.FlexFieldDatabase;
using GoNorth.Data.StateMachines;
using GoNorth.Services.Export.Placeholder;

namespace GoNorth.Services.Export.StateMachines
{
    /// <summary>
    /// Interface for rendering Export State Machine Function
    /// </summary>
    public interface IStateMachineFunctionRenderer
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
        /// Renders a list of state functions
        /// </summary>
        /// <param name="state">State to render</param>
        /// <param name="flexFieldObject">Npc to which the events belong</param>
        /// <returns>List of state functions</returns>
        Task<List<StateFunction>> RenderStateFunctions(StateMachineState state, FlexFieldObject flexFieldObject);

    }
}