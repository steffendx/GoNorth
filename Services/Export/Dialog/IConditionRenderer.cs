using System.Collections.Generic;
using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Data.FlexFieldDatabase;
using GoNorth.Data.NodeGraph;
using GoNorth.Data.Project;
using GoNorth.Services.Export.Placeholder;

namespace GoNorth.Services.Export.Dialog
{
    /// <summary>
    /// Interface for classes rendering conditions
    /// </summary>
    public interface IConditionRenderer
    {
        /// <summary>
        /// Sets the export template placeholder resolver
        /// </summary>
        /// <param name="templatePlaceholderResolver">Template placeholder resolver</param>
        void SetExportTemplatePlaceholderResolver(IExportTemplatePlaceholderResolver templatePlaceholderResolver);
        
        /// <summary>
        /// Renders a condition
        /// </summary>
        /// <param name="project">Project</param>
        /// <param name="condition">Condition render</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <param name="flexFieldObject">Flex field object to which the dialog belongs</param>
        /// <param name="exportSettings">Export Settings</param>
        /// <returns>Result of rendering the condition</returns>
        Task<string> RenderCondition(GoNorthProject project, Condition condition, ExportPlaceholderErrorCollection errorCollection, FlexFieldObject flexFieldObject, ExportSettings exportSettings);

        /// <summary>
        /// Renders a condition
        /// </summary>
        /// <param name="project">Project</param>
        /// <param name="conditionElements">Condition Elements</param>
        /// <param name="groupOperator">Grouping operator (and, or)</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <param name="flexFieldObject">Flex field object to which the dialog belongs</param>
        /// <param name="exportSettings">Export Settings</param>
        /// <returns>Result of rendering the condition</returns>
        Task<string> RenderConditionElements(GoNorthProject project, List<ParsedConditionData> conditionElements, string groupOperator, ExportPlaceholderErrorCollection errorCollection, FlexFieldObject flexFieldObject, ExportSettings exportSettings);

        /// <summary>
        /// Returns true if the condition renderer has placeholders for a template type
        /// </summary>
        /// <param name="templateType">Tempalte Type to check</param>
        /// <returns>true if the condition renderer has placeholders for the template type</returns>
        bool HasPlaceholdersForTemplateType(TemplateType templateType);

        /// <summary>
        /// Returns the Export Template Placeholders for a Template Type
        /// </summary>
        /// <param name="templateType">Template Type</param>
        /// <param name="renderingEngine">Rendering engine</param>
        /// <returns>Export Template Placeholder</returns>
        List<ExportTemplatePlaceholder> GetExportTemplatePlaceholdersForType(TemplateType templateType, ExportTemplateRenderingEngine renderingEngine);
    }
}