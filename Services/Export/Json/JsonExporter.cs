using System;
using System.Collections.Generic;
using System.Reflection;
using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Data.FlexFieldDatabase;
using GoNorth.Data.Kortisto;
using GoNorth.Data.Tale;
using Newtonsoft.Json;

namespace GoNorth.Services.Export.Json
{
    /// <summary>
    /// Class for exporting objects to json format
    /// </summary>
    public class JsonExporter : IObjectExporter
    {
        /// <summary>
        /// Exports an object
        /// </summary>
        /// <param name="template">Template to use</param>
        /// <param name="objectData">Object data</param>
        /// <returns>Export Result</returns>
        public Task<ExportObjectResult> ExportObject(ExportTemplate template, ExportObjectData objectData)
        {
            ExportObjectResult result = new ExportObjectResult();
            result.FileExtension = "json";

            object exportResult = null;
            if(template.TemplateType == TemplateType.ObjectNpc)
            {
                NpcJsonExportObject exportObject = new NpcJsonExportObject((KortistoNpc)objectData.ExportData[ExportConstants.ExportDataObject]);
                exportObject.Dialog = objectData.ExportData[ExportConstants.ExportDataDialog] as TaleDialog;
                exportResult = exportObject;
            }
            else
            {
                exportResult = objectData.ExportData[ExportConstants.ExportDataObject];
            }

            JsonSerializerSettings serializerSettings = new JsonSerializerSettings();
            serializerSettings.ContractResolver = new JsonExportContractResolver();
            serializerSettings.Formatting = Formatting.Indented;

            result.Code = JsonConvert.SerializeObject(exportResult, serializerSettings);
            return Task.FromResult(result);
        }
    }
}