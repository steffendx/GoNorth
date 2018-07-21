using System.Collections.Generic;
using System.Threading.Tasks;
using GoNorth.Data.Exporting;

namespace GoNorth.Services.Export
{
    /// <summary>
    /// Interface for Object Exporters
    /// </summary>
    public interface IObjectExporter
    {
        /// <summary>
        /// Exports an object
        /// </summary>
        /// <param name="template">Template to use</param>
        /// <param name="objectData">Object data</param>
        /// <returns>Export Result</returns>
        Task<ExportObjectResult> ExportObject(ExportTemplate template, ExportObjectData objectData);
    }
}