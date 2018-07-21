using System;
using System.Collections.Generic;
using System.Linq;
using GoNorth.Data.Exporting;
using GoNorth.Data.FlexFieldDatabase;
using GoNorth.Data.Kortisto;
using GoNorth.Data.Project;
using GoNorth.Data.Styr;
using GoNorth.Services.Export.Data;
using GoNorth.Services.Export.LanguageKeyGeneration;
using GoNorth.Services.Export.Placeholder;
using Microsoft.Extensions.Localization;

namespace GoNorth.Services.Export.Dialog.ConditionRendering
{
    /// <summary>
    /// Class for rendering a npc alive state condition
    /// </summary>
    public class NpcAliveStateConditionResolver : BaseConditionRenderer<NpcAliveStateConditionResolver.NpvAliveStateConditionData>
    {
        /// <summary>
        /// Npc Alive  State Condition Data
        /// </summary>
        public class NpvAliveStateConditionData
        {
            /// <summary>
            /// Npc Id
            /// </summary>
            public string NpcId { get; set; }

            /// <summary>
            /// Npc State
            /// </summary>
            public int State { get; set; }
        }

        
        /// <summary>
        /// Alive state
        /// </summary>
        private const int State_Alive = 0;

        /// <summary>
        /// Dead state
        /// </summary>
        private const int State_Dead = 1;


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
        /// Default Template Provider
        /// </summary>
        private readonly ICachedExportDefaultTemplateProvider _defaultTemplateProvider;

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
            _defaultTemplateProvider = defaultTemplateProvider;
            _cachedDbAccess = cachedDbAccess;
            _localizer = localizerFactory.Create(typeof(NpcAliveStateConditionResolver));
            _npcPlaceholderResolver = new FlexFieldExportTemplatePlaceholderResolver(defaultTemplateProvider, cachedDbAccess, languageKeyGenerator, localizerFactory, FlexField_Npc_Prefix);
        }

        /// <summary>
        /// Builds a condition element from parsed data
        /// </summary>
        /// <param name="parsedData">Parsed data</param>
        /// <param name="project">Project</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <param name="npc">Npc to which the dialog belongs</param>
        /// <param name="exportSettings">Export Settings</param>
        /// <returns>Condition string</returns>
        public override string BuildConditionElementFromParsedData(NpcAliveStateConditionResolver.NpvAliveStateConditionData parsedData, GoNorthProject project, ExportPlaceholderErrorCollection errorCollection, KortistoNpc npc, ExportSettings exportSettings)
        {
            ExportTemplate conditionTemplate = _defaultTemplateProvider.GetDefaultTemplateByType(project.Id, TemplateType.TaleConditionNpcAliveState).Result;

            KortistoNpc selectedNpc = _cachedDbAccess.GetNpcById(parsedData.NpcId).Result;
            if(selectedNpc == null)
            {
                errorCollection.AddDialogItemNotFoundError();
                return string.Empty;
            }

            ExportObjectData npcExportData = new ExportObjectData();
            npcExportData.ExportData.Add(ExportConstants.ExportDataObject, selectedNpc);
            npcExportData.ExportData.Add(ExportConstants.ExportDataObjectType, ExportConstants.ExportObjectTypeNpc);

            string conditionCode = ExportUtil.RenderPlaceholderIfTrue(conditionTemplate.Code, Placeholder_State_Alive_Start, Placeholder_State_Alive_End, parsedData.State == State_Alive);
            conditionCode = ExportUtil.RenderPlaceholderIfTrue(conditionCode, Placeholder_State_Dead_Start, Placeholder_State_Dead_End, parsedData.State == State_Dead);
            
            _npcPlaceholderResolver.SetErrorMessageCollection(errorCollection);
            conditionCode = _npcPlaceholderResolver.FillPlaceholders(conditionCode, npcExportData).Result;

            return conditionCode;
        }

        /// <summary>
        /// Returns if true the condition element renderer has placeholders for a template type
        /// </summary>
        /// <param name="templateType">Tempalte Type to check</param>
        /// <returns>true if the condition element renderer has placeholders for the template type</returns>
        public override bool HasPlaceholdersForTemplateType(TemplateType templateType)
        {
            return templateType == TemplateType.TaleConditionNpcAliveState;
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