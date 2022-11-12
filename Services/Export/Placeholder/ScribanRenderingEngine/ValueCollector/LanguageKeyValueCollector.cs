using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using GoNorth.Data.Aika;
using GoNorth.Data.Exporting;
using GoNorth.Data.NodeGraph;
using GoNorth.Data.Project;
using GoNorth.Data.Tale;
using GoNorth.Services.Export.Data;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.RenderingObjects;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.Util;
using Microsoft.Extensions.Localization;
using Scriban;
using Scriban.Runtime;

namespace GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.ValueCollector
{
    /// <summary>
    /// Class for Language key value collectors
    /// </summary>
    public class LanguageKeyValueCollector : BaseScribanValueCollector
    {
        /// <summary>
        /// Object key used for the language object data
        /// </summary>
        private const string LanguageObjectKey = "language";

        /// <summary>
        /// Object key for the current language key entry
        /// </summary>
        private const string LanguageKeyEntryObjectKey = "cur_key";
        
        /// <summary>
        /// Object key for the current language key entry
        /// </summary>
        private const string LanguageKeyRefObjectKey = "cur_obj";

        /// <summary>
        /// Export cached database access
        /// </summary>
        private readonly IExportCachedDbAccess _exportCachedDbAccess;

        /// <summary>
        /// Language key database access
        /// </summary>
        private readonly ILanguageKeyDbAccess _languageKeyDbAccess;

        /// <summary>
        /// Localizer Factory
        /// </summary>
        private readonly IStringLocalizerFactory _localizerFactory;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="exportCachedDbAccess">Export cached database access</param>
        /// <param name="languageKeyDbAccess">Language key database access</param>
        /// <param name="localizerFactory">Localizer Factory</param>
        public LanguageKeyValueCollector(IExportCachedDbAccess exportCachedDbAccess, ILanguageKeyDbAccess languageKeyDbAccess, IStringLocalizerFactory localizerFactory)
        {
            _exportCachedDbAccess = exportCachedDbAccess;
            _languageKeyDbAccess = languageKeyDbAccess;
            _localizerFactory = localizerFactory;
        }

        /// <summary>
        /// Returns true if the value collector is valid for a given template type
        /// </summary>
        /// <param name="templateType">Template type</param>
        /// <returns>True if the value collector is valid, else false</returns>
        public override bool IsValidForTemplateType(TemplateType templateType)
        {
            return templateType == TemplateType.LanguageFile;
        }

        /// <summary>
        /// Collects the values for an export
        /// </summary>
        /// <param name="templateType">Template type</param>
        /// <param name="parsedTemplate">Parsed scriban template</param>
        /// <param name="scriptObject">Scriban script object to fill</param>
        /// <param name="data">Export Data</param>
        /// <returns>Task</returns>
        public override async Task CollectValues(TemplateType templateType, Template parsedTemplate, ScriptObject scriptObject, ExportObjectData data)
        {
            IFlexFieldExportable flexFieldObject = data.ExportData[ExportConstants.ExportDataObject] as IFlexFieldExportable;
            if(flexFieldObject == null)
            {
                return;
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

            GoNorthProject project = await _exportCachedDbAccess.GetUserProject();
            List<LanguageKey> languageKeys = await _languageKeyDbAccess.GetLanguageKeysByGroupId(project.Id, flexFieldObject.Id);
            ExportSettings exportSettings = await _exportCachedDbAccess.GetExportSettings(project.Id);

            languageKeys = languageKeys.OrderBy(l => GetLanguageKeySortOrder(l, flexFieldObject)).ToList();

            ScribanExportLanguageFile languageFileData = new ScribanExportLanguageFile();
            languageFileData.Object = FlexFieldValueCollectorUtil.ConvertScribanFlexFieldObject(flexFieldObject, exportSettings, _errorCollection);
            languageFileData.LanguageKeys = ConvertLanguageKeysToScriban(languageKeys, exportSettings);
            languageFileData.ReferencedLanguageKeys = ConvertLanguageKeysToScriban(referencedLanguageKeys, exportSettings);

            languageFileData.DialogLanguageKeys = new List<ScribanExportLanguageKey>();
            languageFileData.DialogReferencedObjects = new List<ScribanExportLanguageObject>();
            if(data.ExportData.ContainsKey(ExportConstants.ExportDataDialog)) 
            {
                await CollectReferencedObjects(languageFileData, languageKeys, languageFileData.LanguageKeys, data.ExportData[ExportConstants.ExportDataDialog] as TaleDialog, exportSettings);
            }

            scriptObject.AddOrUpdate(LanguageObjectKey, languageFileData);
        }

        /// <summary>
        /// Returns a sort order for language keys.null This ranks name keys and field keys higher than dialog keys
        /// </summary>
        /// <param name="langKey">Language key</param>
        /// <param name="flexFieldExportable">Flex field exportable</param>
        /// <returns>Sort order</returns>
        private int GetLanguageKeySortOrder(LanguageKey langKey, IFlexFieldExportable flexFieldExportable)
        {
            if(langKey.LangKeyRef == "Name")
            {
                return 0;
            }

            if(flexFieldExportable.Fields != null && flexFieldExportable.Fields.Any(f => f.Id == langKey.LangKeyRef))
            {
                return 1;
            }

            return 2;
        }

        /// <summary>
        /// Collects referenced objects
        /// </summary>
        /// <param name="languageFileData">Language file data to fill</param>
        /// <param name="languageKeys">Language keys</param>
        /// <param name="scribanLanguageKeys">Scriban Language Keys</param>
        /// <param name="taleDialog">Dialog</param>
        /// <param name="exportSettings">Export settings</param>
        /// <returns>Task</returns>
        private async Task CollectReferencedObjects(ScribanExportLanguageFile languageFileData, List<LanguageKey> languageKeys, List<ScribanExportLanguageKey> scribanLanguageKeys, TaleDialog taleDialog, ExportSettings exportSettings)
        {
            if(taleDialog == null)
            {
                return;
            }

            foreach(LanguageKey curKey in languageKeys)
            {
                ScribanExportLanguageKey scribanKey = scribanLanguageKeys.FirstOrDefault(s => s.Key == curKey.LangKey);
                if(scribanKey == null)
                {
                    continue;
                }

                ActionNode targetActionNode = taleDialog.Action.FirstOrDefault(a => a.Id == curKey.LangKeyRef);
                if(targetActionNode != null && !string.IsNullOrEmpty(targetActionNode.ActionRelatedToObjectId))
                {
                    ScribanExportLanguageObject refObj = languageFileData.DialogReferencedObjects.FirstOrDefault(o => o.Object.Id == targetActionNode.ActionRelatedToObjectId);
                    if(refObj == null)
                    {
                        refObj = new ScribanExportLanguageObject();
                        if(targetActionNode.ActionRelatedToObjectType == "Quest")
                        {
                            AikaQuest quest = await _exportCachedDbAccess.GetQuestById(targetActionNode.ActionRelatedToObjectId);
                            refObj.Object = FlexFieldValueCollectorUtil.ConvertScribanFlexFieldObject(quest, exportSettings, _errorCollection);
                        }
                        else
                        {
                            languageFileData.DialogLanguageKeys.Add(scribanKey);
                            continue;
                        }

                        languageFileData.DialogReferencedObjects.Add(refObj);
                    }

                    refObj.LanguageKeys.Add(scribanKey);
                    continue;
                }

                languageFileData.DialogLanguageKeys.Add(scribanKey);
            }
        }

        /// <summary>
        /// Converts a list of language keys to scriban language keys
        /// </summary>
        /// <param name="languageKeys">Language keys</param>
        /// <param name="exportSettings">Export settings</param>
        /// <returns>Scriban language keys</returns>
        private List<ScribanExportLanguageKey> ConvertLanguageKeysToScriban(List<LanguageKey> languageKeys, ExportSettings exportSettings)
        {
            return languageKeys.Select(l => new ScribanExportLanguageKey {
                Key = l.LangKey,
                Text = ExportUtil.EscapeCharacters(l.Value, exportSettings.LanguageEscapeCharacter, exportSettings.LanguageCharactersNeedingEscaping, exportSettings.LanguageNewlineCharacter),
                UnescapedText = l.Value
            }).ToList();
        }

        /// <summary>
        /// Returns the Export Template Placeholders for a Template Type
        /// </summary>
        /// <param name="templateType">Template Type</param>
        /// <returns>Export Template Placeholder</returns>
        public override List<ExportTemplatePlaceholder> GetExportTemplatePlaceholdersForType(TemplateType templateType)
        {
            if(templateType != TemplateType.LanguageFile)
            {
                return new List<ExportTemplatePlaceholder>();
            }

            string unusedFieldsKey = string.Format(".{0}", StandardMemberRenamer.Rename(nameof(ScribanFlexFieldObject.UnusedFields)));

            List<ExportTemplatePlaceholder> languagePlaceholders = ScribanPlaceholderGenerator.GetPlaceholdersForObject<ScribanExportLanguageFile>(_localizerFactory, LanguageObjectKey);
            languagePlaceholders.RemoveAll(p => p.Name.EndsWith(unusedFieldsKey));

            languagePlaceholders.AddRange(ScribanPlaceholderGenerator.GetPlaceholdersForObject<ScribanExportLanguageKey>(_localizerFactory, LanguageKeyEntryObjectKey));
            languagePlaceholders.AddRange(ScribanPlaceholderGenerator.GetPlaceholdersForObject<ScribanExportLanguageObject>(_localizerFactory, LanguageKeyRefObjectKey));

            return languagePlaceholders;
        }
    }
}