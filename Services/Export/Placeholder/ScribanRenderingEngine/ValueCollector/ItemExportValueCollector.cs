using GoNorth.Data.Exporting;
using GoNorth.Data.Styr;
using GoNorth.Services.Export.Data;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.LanguageKeyGenerator;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.RenderingObjects;
using Microsoft.Extensions.Localization;

namespace GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.ValueCollector
{
    /// <summary>
    /// Class for Item Scriban value collectors
    /// </summary>
    public class ItemExportValueCollector : BaseFlexFieldValueCollector<StyrItem, ScribanExportItem>
    {
        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="templatePlaceholderResolver">Template placeholder resolver</param>
        /// <param name="exportCachedDbAccess">Export cached database access</param>
        /// <param name="defaultTemplateProvider">Default template provider</param>
        /// <param name="languageKeyGenerator">Language key generator</param>
        /// <param name="localizerFactory">Localizer Factory</param>
        public ItemExportValueCollector(IExportTemplatePlaceholderResolver templatePlaceholderResolver, IExportCachedDbAccess exportCachedDbAccess, ICachedExportDefaultTemplateProvider defaultTemplateProvider, 
                                        IScribanLanguageKeyGenerator languageKeyGenerator, IStringLocalizerFactory localizerFactory) : base(templatePlaceholderResolver, exportCachedDbAccess, defaultTemplateProvider, languageKeyGenerator, localizerFactory)
        {
        }

        /// <summary>
        /// Returns the object key for the object
        /// </summary>
        /// <returns>Object</returns>
        public override string GetObjectKey()
        {
            return ExportConstants.ScribanItemObjectKey;
        }

        /// <summary>
        /// Returns the template type
        /// </summary>
        /// <returns>Template type</returns>
        public override TemplateType GetTemplateType()
        {
            return TemplateType.ObjectItem;
        }
    }
}