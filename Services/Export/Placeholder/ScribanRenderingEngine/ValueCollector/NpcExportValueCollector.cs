using System.Collections.Generic;
using GoNorth.Data.Exporting;
using GoNorth.Data.Kortisto;
using GoNorth.Services.Export.Data;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.LanguageKeyGenerator;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.RenderingFunctions;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.RenderingObjects;
using Microsoft.Extensions.Localization;
using Scriban;
using Scriban.Runtime;

namespace GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.ValueCollector
{
    /// <summary>
    /// Class for NPC Scriban value collectors
    /// </summary>
    public class NpcExportValueCollector : BaseFlexFieldValueCollector<KortistoNpc, ScribanExportNpc>
    {
        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="templatePlaceholderResolver">Template placeholder resolver</param>
        /// <param name="exportCachedDbAccess">Export cached database access</param>
        /// <param name="defaultTemplateProvider">Default template provider</param>
        /// <param name="languageKeyGenerator">Language key generator</param>
        /// <param name="localizerFactory">Localizer Factory</param>
        public NpcExportValueCollector(IExportTemplatePlaceholderResolver templatePlaceholderResolver, IExportCachedDbAccess exportCachedDbAccess, ICachedExportDefaultTemplateProvider defaultTemplateProvider, 
                                       IScribanLanguageKeyGenerator languageKeyGenerator, IStringLocalizerFactory localizerFactory) : base(templatePlaceholderResolver, exportCachedDbAccess, defaultTemplateProvider, languageKeyGenerator, localizerFactory)
        {
        }

        /// <summary>
        /// Returns the object key for the object
        /// </summary>
        /// <returns>Object</returns>
        public override string GetObjectKey()
        {
            return ExportConstants.ScribanNpcObjectKey;
        }

        /// <summary>
        /// Returns the template type
        /// </summary>
        /// <returns>Template type</returns>
        public override TemplateType GetTemplateType()
        {
            return TemplateType.ObjectNpc;
        }
        
        /// <summary>
        /// Sets additional export object values
        /// </summary>
        /// <param name="exportObject">Export object</param>
        /// <param name="inputObject">Input object</param>
        protected override void SetAdditionalExportValues(ScribanExportNpc exportObject, KortistoNpc inputObject) 
        {
            exportObject.IsPlayer = inputObject.IsPlayerNpc;
        }

        /// <summary>
        /// Adds additional script object values
        /// </summary>
        /// <param name="templateType">Template type</param>
        /// <param name="parsedTemplate">Parsed scriban template</param>
        /// <param name="scriptObject">Scriban script object to fill</param>
        /// <param name="data">Export Data</param>
        protected override void AddAdditionalScriptObjectValues(TemplateType templateType, Template parsedTemplate, ScriptObject scriptObject, ExportObjectData data)
        {
            scriptObject.Add(InventoryListRenderer.InventoryListFunctionName, new InventoryListRenderer(_templatePlaceholderResolver, _exportCachedDbAccess, _defaultTemplateProvider, _errorCollection, data));
            scriptObject.Add(SkillListRenderer.SkillListFunctionName, new SkillListRenderer(_templatePlaceholderResolver, _exportCachedDbAccess, _defaultTemplateProvider, _errorCollection, data));
        }

        /// <summary>
        /// Returns a list of additional placeholders
        /// </summary>
        /// <returns>List of additional placeholders</returns>
        protected override List<ExportTemplatePlaceholder> GetAdditionalPlaceholders() 
        { 
            List<ExportTemplatePlaceholder> placeholders = new List<ExportTemplatePlaceholder>();

            placeholders.AddRange(InventoryListRenderer.GetPlaceholders(_localizerFactory));
            placeholders.AddRange(SkillListRenderer.GetPlaceholders(_localizerFactory));

            return placeholders;
        }
    }
}