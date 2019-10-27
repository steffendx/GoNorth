using System.Text.Encodings.Web;
using System.Text.Json;
using System.Threading.Tasks;
using GoNorth.Data.Evne;
using GoNorth.Data.Exporting;
using GoNorth.Data.Kortisto;
using GoNorth.Data.Styr;
using GoNorth.Data.Tale;

namespace GoNorth.Services.Export.Json
{
    /// <summary>
    /// Class for exporting objects to json format
    /// </summary>
    public class JsonExporter : IObjectExporter
    {
        /// <summary>
        /// Object export snippet db access
        /// </summary>
        private readonly IObjectExportSnippetDbAccess _objectExportSnippetDbAccess;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="objectExportSnippetDbAccess">Object export snippet db access</param>
        public JsonExporter(IObjectExportSnippetDbAccess objectExportSnippetDbAccess)
        {
            _objectExportSnippetDbAccess = objectExportSnippetDbAccess;
        }

        /// <summary>
        /// Exports an object
        /// </summary>
        /// <param name="template">Template to use</param>
        /// <param name="objectData">Object data</param>
        /// <returns>Export Result</returns>
        public async Task<ExportObjectResult> ExportObject(ExportTemplate template, ExportObjectData objectData)
        {
            ExportObjectResult result = new ExportObjectResult();
            result.FileExtension = "json";

            object exportResult = null;
            if(template.TemplateType == TemplateType.ObjectNpc)
            {
                NpcJsonExportObject exportObject = new NpcJsonExportObject((KortistoNpc)objectData.ExportData[ExportConstants.ExportDataObject]);
                exportObject.Dialog = objectData.ExportData[ExportConstants.ExportDataDialog] as TaleDialog;
                exportObject.ExportSnippets = await _objectExportSnippetDbAccess.GetExportSnippets(exportObject.Id);
                exportResult = exportObject;
            }
            else if(template.TemplateType == TemplateType.ObjectItem)
            {
                ItemJsonExportObject exportObject = new ItemJsonExportObject((StyrItem)objectData.ExportData[ExportConstants.ExportDataObject]);
                exportObject.ExportSnippets = await _objectExportSnippetDbAccess.GetExportSnippets(exportObject.Id);
                exportResult = exportObject;
            }
            else if(template.TemplateType == TemplateType.ObjectSkill)
            {
                SkillJsonExportObject exportObject = new SkillJsonExportObject((EvneSkill)objectData.ExportData[ExportConstants.ExportDataObject]);
                exportObject.ExportSnippets = await _objectExportSnippetDbAccess.GetExportSnippets(exportObject.Id);
                exportResult = exportObject;
            }
            else
            {
                exportResult = objectData.ExportData[ExportConstants.ExportDataObject];
            }

            JsonSerializerOptions options = new JsonSerializerOptions
            {
                WriteIndented = true,
                Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping
            };

            result.Code = JsonSerializer.Serialize(exportResult, options);
            return result;
        }
    }
}