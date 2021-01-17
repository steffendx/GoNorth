using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Data.Project;
using GoNorth.Services.Export.Data;
using Microsoft.Extensions.Localization;

namespace GoNorth.Services.Export.Placeholder.LegacyRenderingEngine
{
    /// <summary>
    /// Language Key Template Placeholder Resolver
    /// </summary>
    public class LanguageKeyTemplatePlaceholderResolver : BaseExportPlaceholderResolver, IExportTemplateTopicPlaceholderResolver
    {
        /// <summary>
        /// Object Name
        /// </summary>
        private const string Placeholder_ObjectName = "Object_Name";

        /// <summary>
        /// Start of the content for the language keys
        /// </summary>
        private const string Placeholder_LanguageKeys_Start = "LanguageKeys_Start";

        /// <summary>
        /// End of the content for the language keys
        /// </summary>
        private const string Placeholder_LanguageKeys_End = "LanguageKeys_End";

        /// <summary>
        /// Start of the content for the referenced language keys
        /// </summary>
        private const string Placeholder_Referenced_LanguageKeys_Start = "Referenced_LanguageKeys_Start";

        /// <summary>
        /// End of the content for the referenced language keys
        /// </summary>
        private const string Placeholder_Referenced_LanguageKeys_End = "Referenced_LanguageKeys_End";

        /// <summary>
        /// Start of the content that is only rendered if the object has referenced language keys
        /// </summary>
        private const string Placeholder_Has_Referenced_LanguageKeys_Start = "Has_Referenced_LanguageKeys_Start";

        /// <summary>
        /// End of the content that is only rendered if the object has referenced language keys
        /// </summary>
        private const string Placeholder_Has_Referenced_LanguageKeys_End = "Has_Referenced_LanguageKeys_End";


        /// <summary>
        /// Start of the content that is only rendered if it is the first key
        /// </summary>
        private const string Placeholder_LanguageKeys_IsFirst_Start = "LanguageKeys_IsFirst_Start";

        /// <summary>
        /// End of the content that is only rendered if it is the first key
        /// </summary>
        private const string Placeholder_LanguageKeys_IsFirst_End = "LanguageKeys_IsFirst_End";
        
        /// <summary>
        /// Start of the content that is only rendered if it is not the first key
        /// </summary>
        private const string Placeholder_LanguageKeys_IsNotFirst_Start = "LanguageKeys_IsNotFirst_Start";

        /// <summary>
        /// End of the content that is only rendered if it is not the first key
        /// </summary>
        private const string Placeholder_LanguageKeys_IsNotFirst_End = "LanguageKeys_IsNotFirst_End";

        /// <summary>
        /// Start of the content that is only rendered if it is the last key
        /// </summary>
        private const string Placeholder_LanguageKeys_IsLast_Start = "LanguageKeys_IsLast_Start";

        /// <summary>
        /// End of the content that is only rendered if it is the last key
        /// </summary>
        private const string Placeholder_LanguageKeys_IsLast_End = "LanguageKeys_IsLast_End";
        
        /// <summary>
        /// Start of the content that is only rendered if it is not the last key
        /// </summary>
        private const string Placeholder_LanguageKeys_IsNotLast_Start = "LanguageKeys_IsNotLast_Start";

        /// <summary>
        /// End of the content that is only rendered if it is not the last key
        /// </summary>
        private const string Placeholder_LanguageKeys_IsNotLast_End = "LanguageKeys_IsNotLast_End";

        /// <summary>
        /// Placeholder for the language key key
        /// </summary>
        private const string Placeholder_LanguageKey_Key = "LanguageKey_Key";
        
        /// <summary>
        /// Placeholder for the language key text
        /// </summary>
        private const string Placeholder_LanguageKey_Text = "LanguageKey_Text";


        /// <summary>
        /// Default Template Provider
        /// </summary>
        private readonly ICachedExportDefaultTemplateProvider _defaultTemplateProvider;

        /// <summary>
        /// Language Key Db Access
        /// </summary>
        private readonly ILanguageKeyDbAccess _languageKeyDbAccess;

        /// <summary>
        /// Cached Db Access
        /// </summary>
        private readonly IExportCachedDbAccess _cachedDbAccess;


        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="defaultTemplateProvider">Default Template Provider</param>
        /// <param name="cachedDbAccess">Cached Db Access</param>
        /// <param name="languageKeyDbAccess">Language Key Db Access</param>
        /// <param name="localizerFactory">Localizer Factory</param>
        public LanguageKeyTemplatePlaceholderResolver(ICachedExportDefaultTemplateProvider defaultTemplateProvider, IExportCachedDbAccess cachedDbAccess, ILanguageKeyDbAccess languageKeyDbAccess, 
                                                      IStringLocalizerFactory localizerFactory) : base(localizerFactory.Create(typeof(LanguageKeyTemplatePlaceholderResolver)))
        {
            _defaultTemplateProvider = defaultTemplateProvider;
            _cachedDbAccess = cachedDbAccess;
            _languageKeyDbAccess = languageKeyDbAccess;
        }

        /// <summary>
        /// Sets the export template placeholder resolver
        /// </summary>
        /// <param name="placeholderResolver">Placeholder Resolver</param>
        public void SetExportTemplatePlaceholderResolver(IExportTemplatePlaceholderResolver placeholderResolver)
        {
        }

        /// <summary>
        /// Fills the placeholders of a code
        /// </summary>
        /// <param name="code">Code to fill</param>
        /// <param name="data">Export Data</param>
        /// <returns>Filled Code</returns>
        public Task<string> FillPlaceholders(string code, ExportObjectData data)
        {
            // Check Data
            if(!data.ExportData.ContainsKey(ExportConstants.ExportDataObject))
            {
                return Task.FromResult(code);
            }

            IFlexFieldExportable flexFieldObject = data.ExportData[ExportConstants.ExportDataObject] as IFlexFieldExportable;
            if(flexFieldObject == null)
            {
                return Task.FromResult(code);
            }

            List<LanguageKey> referencedLanguageKeys = null;
            if(data.ExportData.ContainsKey(ExportConstants.ExportDataReferencedLanguageIds))
            {
                referencedLanguageKeys = data.ExportData[ExportConstants.ExportDataReferencedLanguageIds] as List<LanguageKey>;
            }

            if(referencedLanguageKeys == null)
            {
                referencedLanguageKeys = new List<LanguageKey>();
            }

            // Replace Language Key Placeholders
            return FillLanguageKeyPlaceholders(code, flexFieldObject, referencedLanguageKeys);
        }

        /// <summary>
        /// Fills the language key Placeholders
        /// </summary>
        /// <param name="code">Code to fill</param>
        /// <param name="flexFieldObject">Flex Field Object</param>
        /// <param name="referencedLanguageKeys">Referenced language keys</param>
        /// <returns>Filled Code</returns>
        private async Task<string> FillLanguageKeyPlaceholders(string code, IFlexFieldExportable flexFieldObject, List<LanguageKey> referencedLanguageKeys)
        {
            GoNorthProject project = await _cachedDbAccess.GetUserProject();
            List<LanguageKey> languageKeys = await _languageKeyDbAccess.GetLanguageKeysByGroupId(project.Id, flexFieldObject.Id);
            ExportSettings exportSettings = await _cachedDbAccess.GetExportSettings(project.Id);

            code = ExportUtil.RenderPlaceholderIfTrue(code, Placeholder_Has_Referenced_LanguageKeys_Start, Placeholder_Has_Referenced_LanguageKeys_End, referencedLanguageKeys != null && referencedLanguageKeys.Any());
            code = ExportUtil.BuildPlaceholderRegex(Placeholder_ObjectName).Replace(code, flexFieldObject.Name);
            code = ExportUtil.BuildRangePlaceholderRegex(Placeholder_LanguageKeys_Start, Placeholder_LanguageKeys_End).Replace(code, m => {
                return BuildLanguageKeyList(m.Groups[1].Value, languageKeys, exportSettings);
            });
            code = ExportUtil.BuildRangePlaceholderRegex(Placeholder_Referenced_LanguageKeys_Start, Placeholder_Referenced_LanguageKeys_End).Replace(code, m => {
                return BuildLanguageKeyList(m.Groups[1].Value, referencedLanguageKeys, exportSettings);
            });

            return code;
        }

        /// <summary>
        /// Builds the language key list
        /// </summary>
        /// <param name="languageKeyTemplate">Template for a language key</param>
        /// <param name="languageKeys">Language keys</param>
        /// <param name="exportSettings">Export Settings</param>
        /// <returns>Language Key list</returns>
        private string BuildLanguageKeyList(string languageKeyTemplate, List<LanguageKey> languageKeys, ExportSettings exportSettings)
        {
            string listContent = string.Empty;
            for(int curLanguagekey = 0; curLanguagekey < languageKeys.Count; ++curLanguagekey)
            {
                LanguageKey languageKey = languageKeys[curLanguagekey];

                string keyCode = ExportUtil.RenderPlaceholderIfTrue(languageKeyTemplate, Placeholder_LanguageKeys_IsFirst_Start, Placeholder_LanguageKeys_IsFirst_End, curLanguagekey == 0);
                keyCode = ExportUtil.RenderPlaceholderIfTrue(keyCode, Placeholder_LanguageKeys_IsNotFirst_Start, Placeholder_LanguageKeys_IsNotFirst_End, curLanguagekey != 0);
                keyCode = ExportUtil.RenderPlaceholderIfTrue(keyCode, Placeholder_LanguageKeys_IsLast_Start, Placeholder_LanguageKeys_IsLast_End, curLanguagekey >= languageKeys.Count - 1);
                keyCode = ExportUtil.RenderPlaceholderIfTrue(keyCode, Placeholder_LanguageKeys_IsNotLast_Start, Placeholder_LanguageKeys_IsNotLast_End, curLanguagekey < languageKeys.Count - 1);

                keyCode = ExportUtil.BuildPlaceholderRegex(Placeholder_LanguageKey_Key).Replace(keyCode, languageKey.LangKey);
                string escapedText = ExportUtil.EscapeCharacters(languageKey.Value, exportSettings.LanguageEscapeCharacter, exportSettings.LanguageCharactersNeedingEscaping, exportSettings.LanguageNewlineCharacter);
                keyCode = ExportUtil.BuildPlaceholderRegex(Placeholder_LanguageKey_Text).Replace(keyCode, escapedText);

                listContent += keyCode;
            }

            return listContent;
        }


        /// <summary>
        /// Returns if the placeholder resolver is valid for a template type
        /// </summary>
        /// <param name="templateType">Template Type</param>
        /// <returns>true if the template type is valid for the template type</returns>
        public bool IsValidForTemplateType(TemplateType templateType)
        {
            return templateType == TemplateType.LanguageFile;
        }

        /// <summary>
        /// Returns the Export Template Placeholders for a Template Type
        /// </summary>
        /// <param name="templateType">Template Type</param>
        /// <returns>Export Template Placeholder</returns>
        public List<ExportTemplatePlaceholder> GetExportTemplatePlaceholdersForType(TemplateType templateType)
        {
            if(templateType == TemplateType.LanguageFile)
            {
                return new List<ExportTemplatePlaceholder>() {
                    CreatePlaceHolder(Placeholder_ObjectName),
                    CreatePlaceHolder(Placeholder_LanguageKeys_Start),
                    CreatePlaceHolder(Placeholder_LanguageKeys_End),
                    CreatePlaceHolder(Placeholder_Has_Referenced_LanguageKeys_Start),
                    CreatePlaceHolder(Placeholder_Has_Referenced_LanguageKeys_End),
                    CreatePlaceHolder(Placeholder_Referenced_LanguageKeys_Start),
                    CreatePlaceHolder(Placeholder_Referenced_LanguageKeys_End),
                    CreatePlaceHolder(Placeholder_LanguageKeys_IsFirst_Start),
                    CreatePlaceHolder(Placeholder_LanguageKeys_IsFirst_End),
                    CreatePlaceHolder(Placeholder_LanguageKeys_IsNotFirst_Start),
                    CreatePlaceHolder(Placeholder_LanguageKeys_IsNotFirst_End),
                    CreatePlaceHolder(Placeholder_LanguageKeys_IsLast_Start),
                    CreatePlaceHolder(Placeholder_LanguageKeys_IsLast_End),
                    CreatePlaceHolder(Placeholder_LanguageKeys_IsNotLast_Start),
                    CreatePlaceHolder(Placeholder_LanguageKeys_IsNotLast_End),
                    CreatePlaceHolder(Placeholder_LanguageKey_Key),
                    CreatePlaceHolder(Placeholder_LanguageKey_Text)
                };
            }

            return new List<ExportTemplatePlaceholder>();
        }
    }
}