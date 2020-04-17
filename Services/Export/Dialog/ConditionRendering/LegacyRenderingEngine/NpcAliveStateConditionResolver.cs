using System.Collections.Generic;
using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Data.FlexFieldDatabase;
using GoNorth.Data.Kortisto;
using GoNorth.Data.Project;
using GoNorth.Services.Export.Data;
using GoNorth.Services.Export.Dialog.ConditionRendering.ConfigObject;
using GoNorth.Services.Export.LanguageKeyGeneration;
using GoNorth.Services.Export.Placeholder;
using GoNorth.Services.Export.Placeholder.LegacyRenderingEngine;
using Microsoft.Extensions.Localization;

namespace GoNorth.Services.Export.Dialog.ConditionRendering.LegacyRenderingEngine
{
    /// <summary>
    /// Class for rendering a npc alive state condition
    /// </summary>
    public class NpcAliveStateConditionResolver : BaseConditionRenderer<NpvAliveStateConditionData>
    {
        /// <summary>
        /// Placeholder for the start of the content that is only rendered if the state is alive
        /// </summary>
        private const string Placeholder_State_Alive_Start = "Tale_Condition_State_Alive_Start";

        /// <summary>
        /// Placeholder for the end of the content that is only rendered if the state is alive
        /// </summary>
        private const string Placeholder_State_Alive_End = "Tale_Condition_State_Alive_End";

        /// <summary>
        /// Placeholder for the start of the content that is only rendered if the state is dead
        /// </summary>
        private const string Placeholder_State_Dead_Start = "Tale_Condition_State_Dead_Start";

        /// <summary>
        /// Placeholder for the end of the content that is only rendered if the state is dead
        /// </summary>
        private const string Placeholder_State_Dead_End = "Tale_Condition_State_Dead_End";

        /// <summary>
        /// Flex Field Item Resolver Prefix
        /// </summary>
        private const string FlexField_Npc_Prefix = "Tale_Condition_Npc";


        /// <summary>
        /// Cached Db Access
        /// </summary>
        private readonly IExportCachedDbAccess _cachedDbAccess;

        /// <summary>
        /// String Localizer
        /// </summary>
        private readonly IStringLocalizer _localizer;

        /// <summary>
        /// Resolver for flex field items
        /// </summary>
        private readonly FlexFieldExportTemplatePlaceholderResolver _npcPlaceholderResolver;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="defaultTemplateProvider">Default Template Provider</param>
        /// <param name="cachedDbAccess">Cached Db Access</param>
        /// <param name="languageKeyGenerator">Language Key Generator</param>
        /// <param name="localizerFactory">Localizer Factory</param>
        public NpcAliveStateConditionResolver(ICachedExportDefaultTemplateProvider defaultTemplateProvider, IExportCachedDbAccess cachedDbAccess, ILanguageKeyGenerator languageKeyGenerator, IStringLocalizerFactory localizerFactory)
        {
            _cachedDbAccess = cachedDbAccess;
            _localizer = localizerFactory.Create(typeof(NpcAliveStateConditionResolver));
            _npcPlaceholderResolver = new FlexFieldExportTemplatePlaceholderResolver(defaultTemplateProvider, cachedDbAccess, languageKeyGenerator, localizerFactory, FlexField_Npc_Prefix);
        }

        /// <summary>
        /// Sets the export template placeholder resolver
        /// </summary>
        /// <param name="templatePlaceholderResolver">Template placeholder resolver</param>
        public override void SetExportTemplatePlaceholderResolver(IExportTemplatePlaceholderResolver templatePlaceholderResolver)
        {
            _npcPlaceholderResolver.SetExportTemplatePlaceholderResolver(templatePlaceholderResolver);
        }

        /// <summary>
        /// Builds a condition element from parsed data
        /// </summary>
        /// <param name="template">Export template to use</param>
        /// <param name="parsedData">Parsed data</param>
        /// <param name="project">Project</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <param name="flexFieldObject">Flex field object to which the dialog belongs</param>
        /// <param name="exportSettings">Export Settings</param>
        /// <returns>Condition string</returns>
        public override async Task<string> BuildConditionElementFromParsedData(ExportTemplate template, NpvAliveStateConditionData parsedData, GoNorthProject project, ExportPlaceholderErrorCollection errorCollection, FlexFieldObject flexFieldObject, ExportSettings exportSettings)
        {
            KortistoNpc selectedNpc = await _cachedDbAccess.GetNpcById(parsedData.NpcId);
            if(selectedNpc == null)
            {
                errorCollection.AddDialogItemNotFoundError();
                return string.Empty;
            }

            ExportObjectData npcExportData = new ExportObjectData();
            npcExportData.ExportData.Add(ExportConstants.ExportDataObject, selectedNpc);
            npcExportData.ExportData.Add(ExportConstants.ExportDataObjectType, ExportConstants.ExportObjectTypeNpc);

            string conditionCode = ExportUtil.RenderPlaceholderIfTrue(template.Code, Placeholder_State_Alive_Start, Placeholder_State_Alive_End, parsedData.State == NpvAliveStateConditionData.State_Alive);
            conditionCode = ExportUtil.RenderPlaceholderIfTrue(conditionCode, Placeholder_State_Dead_Start, Placeholder_State_Dead_End, parsedData.State == NpvAliveStateConditionData.State_Dead);
            
            _npcPlaceholderResolver.SetErrorMessageCollection(errorCollection);
            conditionCode = await _npcPlaceholderResolver.FillPlaceholders(conditionCode, npcExportData);

            return conditionCode;
        }

        /// <summary>
        /// Returns the Export Template Placeholders for a Template Type
        /// </summary>
        /// <param name="templateType">Template Type</param>
        /// <returns>Export Template Placeholder</returns>
        public override List<ExportTemplatePlaceholder> GetExportTemplatePlaceholdersForType(TemplateType templateType)
        {
            List<ExportTemplatePlaceholder> exportPlaceholders = new List<ExportTemplatePlaceholder> {
                ExportUtil.CreatePlaceHolder(Placeholder_State_Alive_Start, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_State_Alive_End, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_State_Dead_Start, _localizer),
                ExportUtil.CreatePlaceHolder(Placeholder_State_Dead_End, _localizer)
            };

            exportPlaceholders.AddRange(_npcPlaceholderResolver.GetExportTemplatePlaceholdersForType(TemplateType.ObjectItem));

            return exportPlaceholders;
        }
    }
}