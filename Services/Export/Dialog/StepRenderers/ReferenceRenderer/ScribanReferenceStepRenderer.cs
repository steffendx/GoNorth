using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using GoNorth.Data.Aika;
using GoNorth.Data.Evne;
using GoNorth.Data.Exporting;
using GoNorth.Data.FlexFieldDatabase;
using GoNorth.Data.Kortisto;
using GoNorth.Data.Project;
using GoNorth.Data.ProjectConfig;
using GoNorth.Data.Styr;
using GoNorth.Services.Export.DailyRoutine;
using GoNorth.Services.Export.Data;
using GoNorth.Services.Export.Dialog.StepRenderers.RenderingObjects;
using GoNorth.Services.Export.Placeholder;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.Include;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.LanguageKeyGenerator;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.RenderingObjects;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.Util;
using Microsoft.Extensions.Localization;
using Scriban;
using Scriban.Runtime;

namespace GoNorth.Services.Export.Dialog.StepRenderers.ReferenceRenderer
{
    /// <summary>
    /// Class for Rendering Reference Nodes using Scriban
    /// </summary>
    public class ScribanReferenceStepRenderer : ScribanBaseStepRenderer, IReferenceStepRenderer
    {
        /// <summary>
        /// Reference Key
        /// </summary>
        private const string ReferenceKey = "reference";
        
        /// <summary>
        /// Export cached Db access
        /// </summary>
        private readonly IExportCachedDbAccess _exportCachedDbAccess;

        /// <summary>
        /// Daily Routine Function Name Generator
        /// </summary>
        private readonly IDailyRoutineFunctionNameGenerator _dailyRoutineFunctionNameGenerator;

        /// <summary>
        /// Language key generator
        /// </summary>
        private readonly IScribanLanguageKeyGenerator _languageKeyGenerator;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="exportCachedDbAccess">Export cached Db access</param>
        /// <param name="dailyRoutineFunctionNameGenerator">Daily Routine Function Name Generator</param>
        /// <param name="exportSettings">Export Settings</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <param name="languageKeyGenerator">Language key generator</param>
        /// <param name="localizerFactory">Localizer Factory</param>
        public ScribanReferenceStepRenderer(IExportCachedDbAccess exportCachedDbAccess, IDailyRoutineFunctionNameGenerator dailyRoutineFunctionNameGenerator, ExportSettings exportSettings, ExportPlaceholderErrorCollection errorCollection, 
                                            IScribanLanguageKeyGenerator languageKeyGenerator, IStringLocalizerFactory localizerFactory) : base(errorCollection, exportSettings, localizerFactory)
        {
            _exportCachedDbAccess = exportCachedDbAccess;
            _dailyRoutineFunctionNameGenerator = dailyRoutineFunctionNameGenerator;
            _languageKeyGenerator = languageKeyGenerator;
        }

        /// <summary>
        /// Renders a dialog step
        /// </summary>
        /// <param name="template">Export template</param>
        /// <param name="data">Dialog Step Data</param>
        /// <param name="project">Project for which the epxort is running</param>
        /// <param name="referenceNodeData">Reference node data</param>
        /// <param name="flexFieldObject">Flex field object to which the dialog belongs</param>
        /// <returns>Dialog Step Render Result</returns>
        public async Task<ExportDialogStepRenderResult> RenderDialogStep(ExportTemplate template, ExportDialogData data, GoNorthProject project, ReferenceNodeData referenceNodeData, FlexFieldObject flexFieldObject)
        {
            ExportDialogStepRenderResult renderResult = new ExportDialogStepRenderResult();

            Template parsedTemplate = ScribanParsingUtil.ParseTemplate(template.Code, _errorCollection);
            if (parsedTemplate == null)
            {
                return renderResult;
            }

            MiscProjectConfig projectConfig = await _exportCachedDbAccess.GetMiscProjectConfig();
            
            _languageKeyGenerator.SetErrorCollection(_errorCollection);
            
            ScribanReferenceData referenceData = BuildDialogRenderObject<ScribanReferenceData>(data, data.Children.FirstOrDefault() != null ? data.Children.FirstOrDefault().Child : null, flexFieldObject);
            referenceData.ReferenceText = referenceNodeData.ReferenceText != null ? referenceNodeData.ReferenceText : string.Empty;
            referenceData.ObjectType = referenceNodeData.ObjectType;
            if(referenceNodeData.Npc != null)
            {
                referenceData.Npc = FlexFieldValueCollectorUtil.BuildFlexFieldValueObject<ScribanExportNpc>(null, null, referenceNodeData.Npc, _exportSettings, _errorCollection);
                referenceData.Npc.IsPlayer = referenceNodeData.Npc.IsPlayerNpc;
            }
            else
            {
                referenceData.Npc = null;
            }
            referenceData.Item = referenceNodeData.Item != null ? FlexFieldValueCollectorUtil.BuildFlexFieldValueObject<ScribanExportItem>(null, null, referenceNodeData.Item, _exportSettings, _errorCollection) : null;
            referenceData.Skill = referenceNodeData.Skill != null ? FlexFieldValueCollectorUtil.BuildFlexFieldValueObject<ScribanExportSkill>(null, null, referenceNodeData.Skill, _exportSettings, _errorCollection) : null;
            referenceData.Quest = referenceNodeData.Quest != null ? FlexFieldValueCollectorUtil.BuildFlexFieldValueObject<ScribanExportQuest>(null, null, referenceNodeData.Quest, _exportSettings, _errorCollection) : null;
            referenceData.WikiPage = referenceNodeData.WikiPage != null ? new ScribanExportWikiPage(referenceNodeData.WikiPage) : null;
            referenceData.DailyRoutineEvent = referenceNodeData.DailyRoutineEvent != null ? await ScribanDailyRoutineEventUtil.ConvertDailyRoutineEvent(_dailyRoutineFunctionNameGenerator, referenceNodeData.Npc, referenceNodeData.DailyRoutineEvent, project, projectConfig, _exportSettings) : null;
            referenceData.Marker = referenceNodeData.Marker != null ? new ScribanExportMapMarker(referenceNodeData.Marker) : null;

            TemplateContext context = BuildTemplateContext(referenceData);

            renderResult.StepCode = await parsedTemplate.RenderAsync(context);

            return renderResult;
        }

        /// <summary>
        /// Builds the template context for exporting
        /// </summary>
        /// <param name="referenceNodeData">Reference node data</param>
        /// <returns>Template context</returns>
        private TemplateContext BuildTemplateContext(ScribanReferenceData referenceNodeData)
        {
            ScriptObject exportObject = new ScriptObject();
            exportObject.Add(ReferenceKey, referenceNodeData);
            exportObject.Add(ExportConstants.ScribanLanguageKeyName, _languageKeyGenerator);
            TemplateContext context = new TemplateContext();
            context.TemplateLoader = new ScribanIncludeTemplateLoader(_exportCachedDbAccess, _errorCollection);
            context.PushGlobal(exportObject);
            return context;
        }

        /// <summary>
        /// Returns the placeholders for a template
        /// </summary>
        /// <param name="templateType">Template Type</param>
        /// <returns>List of template placeholders</returns>
        public List<ExportTemplatePlaceholder> GetPlaceholdersForTemplate(TemplateType templateType)
        {
            List<ExportTemplatePlaceholder> placeholders = GetNodePlaceholders<ScribanReferenceData>(ReferenceKey);
            placeholders.AddRange(_languageKeyGenerator.GetExportTemplatePlaceholders(string.Format("{0}.{1}.{2} | {0}.{3}.{4} | {0}.{5}.{6} | {0}.{7}.{8} | field.value", ReferenceKey, StandardMemberRenamer.Rename(nameof(ReferenceNodeData.Npc)), StandardMemberRenamer.Rename(nameof(KortistoNpc.Name)),
                                                                                                    StandardMemberRenamer.Rename(nameof(ReferenceNodeData.Item)), StandardMemberRenamer.Rename(nameof(StyrItem.Name)), StandardMemberRenamer.Rename(nameof(ReferenceNodeData.Skill)), 
                                                                                                    StandardMemberRenamer.Rename(nameof(EvneSkill.Name)), StandardMemberRenamer.Rename(nameof(ReferenceNodeData.Quest)), StandardMemberRenamer.Rename(nameof(AikaQuest.Name)))));

            return placeholders;
        }
    }
}