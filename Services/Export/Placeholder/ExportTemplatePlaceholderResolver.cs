using System.Collections.Generic;
using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Data.Tale;
using GoNorth.Services.Export.Data;
using GoNorth.Services.Export.Dialog;
using GoNorth.Services.Export.LanguageKeyGeneration;
using Microsoft.Extensions.Localization;

namespace GoNorth.Services.Export.Placeholder
{
    /// <summary>
    /// Export Template Placeholder Resolver
    /// </summary>
    public class ExportTemplatePlaceholderResolver : IExportTemplatePlaceholderResolver
    {
        /// <summary>
        /// Localizer Factory
        /// </summary>
        private readonly IStringLocalizerFactory _localizerFactory;


        /// <summary>
        /// Export Template Placeholder Resolvers
        /// </summary>
        private List<IExportTemplateTopicPlaceholderResolver> _exportTemplatePlaceholderResolvers;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="defaultTemplateProvider">Default Template Provider</param>
        /// <param name="cachedDbAccess">Cached Db Access</param>
        /// <param name="languageKeyGenerator">Language Key Generator</param>
        /// <param name="languageKeyDbAccess">Language Key Db Access</param>
        /// <param name="taleDbAccess">Dialog Db Access</param>
        /// <param name="dialogParser">Dialog Parser</param>
        /// <param name="dialogFunctionGenerator">Dialog Function Generator</param>
        /// <param name="dialogRenderer">Dialog Renderer</param>
        /// <param name="dailyRoutineEventPlaceholderResolver">Daily routine event placeholder resolver</param>
        /// <param name="dailyRoutineEventContentPlaceholderResolver">Daily routine event content placeholder resolver</param>
        /// <param name="localizerFactory">Localizer Factory</param>
        public ExportTemplatePlaceholderResolver(ICachedExportDefaultTemplateProvider defaultTemplateProvider, IExportCachedDbAccess cachedDbAccess, ILanguageKeyGenerator languageKeyGenerator, ILanguageKeyDbAccess languageKeyDbAccess, 
                                                 ITaleDbAccess taleDbAccess, IExportDialogParser dialogParser, IExportDialogFunctionGenerator dialogFunctionGenerator, IExportDialogRenderer dialogRenderer, 
                                                 IDailyRoutineEventPlaceholderResolver dailyRoutineEventPlaceholderResolver, IDailyRoutineEventContentPlaceholderResolver dailyRoutineEventContentPlaceholderResolver, IStringLocalizerFactory localizerFactory)
        {
            _localizerFactory = localizerFactory;


            _exportTemplatePlaceholderResolvers = new List<IExportTemplateTopicPlaceholderResolver>();

            // Order of exporting is determined by the order in which these are  added, thats why the order is important
            _exportTemplatePlaceholderResolvers.Add(new NpcInventoryExportTemplatePlaceholderResolver(defaultTemplateProvider, cachedDbAccess, languageKeyGenerator, localizerFactory));
            _exportTemplatePlaceholderResolvers.Add(new NpcSkillExportTemplatePlaceholderResolver(defaultTemplateProvider, cachedDbAccess, languageKeyGenerator, localizerFactory));
            _exportTemplatePlaceholderResolvers.Add(new NpcDailyRoutineExportPlaceholderResolver(defaultTemplateProvider, cachedDbAccess, dailyRoutineEventPlaceholderResolver, dailyRoutineEventContentPlaceholderResolver, languageKeyGenerator, localizerFactory));
            _exportTemplatePlaceholderResolvers.Add(new FlexFieldExportTemplatePlaceholderResolver(defaultTemplateProvider, cachedDbAccess, languageKeyGenerator, localizerFactory));
            _exportTemplatePlaceholderResolvers.Add(new DialogExportTemplatePlaceholderResolver(cachedDbAccess, languageKeyGenerator, taleDbAccess, dialogParser, dialogFunctionGenerator, dialogRenderer, localizerFactory));
            _exportTemplatePlaceholderResolvers.Add(new LanguageKeyTemplatePlaceholderResolver(defaultTemplateProvider, cachedDbAccess, languageKeyDbAccess, localizerFactory));
        }

        /// <summary>
        /// Fills the placeholders of a code
        /// </summary>
        /// <param name="templateType">Template Type</param>
        /// <param name="code">Code to fill</param>
        /// <param name="data">Export Data</param>
        /// <returns>Filled Code</returns>
        public async Task<ExportPlaceholderFillResult> FillPlaceholders(TemplateType templateType, string code, ExportObjectData data)
        {
            ExportPlaceholderErrorCollection errorCollection = new ExportPlaceholderErrorCollection(_localizerFactory);

            foreach(IExportTemplateTopicPlaceholderResolver curResolver in _exportTemplatePlaceholderResolvers)
            {
                if(curResolver.IsValidForTemplateType(templateType))
                {
                    curResolver.SetErrorMessageCollection(errorCollection);
                    code = await curResolver.FillPlaceholders(code, data);
                }
            }

            ExportPlaceholderFillResult result = new ExportPlaceholderFillResult();
            result.Code = code;
            result.Errors = errorCollection;
            return result;
        }

        /// <summary>
        /// Returns the Export Template Placeholders for a Template Type
        /// </summary>
        /// <param name="templateType">Template Type</param>
        /// <returns>Export Template Placeholder</returns>
        public List<ExportTemplatePlaceholder> GetExportTemplatePlaceholdersForType(TemplateType templateType)
        {
            List<ExportTemplatePlaceholder> placeholders = new List<ExportTemplatePlaceholder>();

            foreach(IExportTemplateTopicPlaceholderResolver curResolver in _exportTemplatePlaceholderResolvers)
            {
                if(curResolver.IsValidForTemplateType(templateType))
                {
                    placeholders.AddRange(curResolver.GetExportTemplatePlaceholdersForType(templateType));
                }
            }

            return placeholders;
        }
    }
}