using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Data.FlexFieldDatabase;
using GoNorth.Data.NodeGraph;
using GoNorth.Data.Project;
using GoNorth.Services.Export.DailyRoutine;
using GoNorth.Services.Export.Data;
using GoNorth.Services.Export.Dialog.StepRenderers.ReferenceRenderer;
using GoNorth.Services.Export.Placeholder;
using GoNorth.Services.Export.Placeholder.ScribanRenderingEngine.LanguageKeyGenerator;
using Microsoft.Extensions.Localization;

namespace GoNorth.Services.Export.Dialog.StepRenderers
{
    /// <summary>
    /// Class for Rendering Reference Nodes
    /// </summary>
    public class ExportReferenceRenderer : ExportDialogBaseStepRenderer, IExportDialogStepRenderer
    {
        /// <summary>
        /// Time Format
        /// </summary>
        private const string TimeFormat = "hh:mm";

        /// <summary>
        /// Error collection
        /// </summary>
        private readonly ExportPlaceholderErrorCollection _errorCollection;

        /// <summary>
        /// Export default template provider
        /// </summary>
        private readonly ICachedExportDefaultTemplateProvider _defaultTemplateProvider;

        /// <summary>
        /// Export Cached Data Access
        /// </summary>
        private readonly IExportCachedDbAccess _exportCachedDbAccess;
        
        /// <summary>
        /// String localizer
        /// </summary>
        private readonly IStringLocalizer _localizer;

        /// <summary>
        /// Current Project
        /// </summary>
        private readonly GoNorthProject _project;

        /// <summary>
        /// Renderers for the references steps
        /// </summary>
        private readonly Dictionary<ExportTemplateRenderingEngine, IReferenceStepRenderer> _renderers;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="exportCachedDbAccess">Export cached Db access</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <param name="defaultTemplateProvider">Default Template Provider</param>
        /// <param name="dailyRoutineFunctionNameGenerator">Daily routine function name generator</param>
        /// <param name="scribanLanguageKeyGenerator">Scriban Language key generator</param>
        /// <param name="localizerFactory">Localizer Factory</param>
        /// <param name="exportSettings">Export Settings</param>
        /// <param name="project">Project</param>
        public ExportReferenceRenderer(IExportCachedDbAccess exportCachedDbAccess, ExportPlaceholderErrorCollection errorCollection, ICachedExportDefaultTemplateProvider defaultTemplateProvider, IDailyRoutineFunctionNameGenerator dailyRoutineFunctionNameGenerator, 
                                       IScribanLanguageKeyGenerator scribanLanguageKeyGenerator, IStringLocalizerFactory localizerFactory, ExportSettings exportSettings, GoNorthProject project)
        {
            _errorCollection = errorCollection;
            _defaultTemplateProvider = defaultTemplateProvider;
            _exportCachedDbAccess = exportCachedDbAccess;
            _localizer = localizerFactory.Create(typeof(ExportReferenceRenderer));
            _project = project;

            _renderers = new Dictionary<ExportTemplateRenderingEngine, IReferenceStepRenderer> {
                { ExportTemplateRenderingEngine.Scriban, new ScribanReferenceStepRenderer(exportCachedDbAccess, dailyRoutineFunctionNameGenerator, exportSettings, errorCollection, scribanLanguageKeyGenerator, localizerFactory) }
            };
        }

        /// <summary>
        /// Renders a dialog step
        /// </summary>
        /// <param name="data">Dialog Step Data</param>
        /// <param name="flexFieldObject">Flex field object to which the dialog belongs</param>
        /// <returns>Dialog Step Render Result</returns>
        public async Task<ExportDialogStepRenderResult> RenderDialogStep(ExportDialogData data, FlexFieldObject flexFieldObject)
        {
            if(data.Reference == null)
            {
                return null;
            }
            
            ReferenceNodeData referenceNode = await GetReferenceNodeData(data.Reference);
            if(referenceNode == null)
            {
                return null;
            }
            
            ExportTemplate template = await _defaultTemplateProvider.GetDefaultTemplateByType(_project.Id, TemplateType.ReferenceNode);
            if(!_renderers.ContainsKey(template.RenderingEngine))
            {
                throw new KeyNotFoundException(string.Format("Unknown rendering engine {0} for ReferenceNode", template.RenderingEngine.ToString()));   
            }

            string oldContext = _errorCollection.CurrentErrorContext;
            _errorCollection.CurrentErrorContext = _localizer["ErrorContextReference"];
            try
            {
                return await _renderers[template.RenderingEngine].RenderDialogStep(template, data, _project, referenceNode, flexFieldObject);
            }
            catch(Exception ex)
            {
                _errorCollection.AddException(ex);
                return new ExportDialogStepRenderResult {
                    StepCode = "<<ERROR_RENDERING_REFERENCE_NODE>>"
                };
            }
            finally
            {
                _errorCollection.CurrentErrorContext = oldContext;
            }
        }

        /// <summary>
        /// Builds a parent text preview for the a dialog step
        /// </summary>
        /// <param name="child">Child node</param>
        /// <param name="parent">Parent</param>
        /// <param name="flexFieldObject">Flex field to which the dialog belongs</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <returns>Parent text preview for the dialog step</returns>
        public async Task<string> BuildParentTextPreview(ExportDialogData child, ExportDialogData parent, FlexFieldObject flexFieldObject, ExportPlaceholderErrorCollection errorCollection)
        {
            if(parent.Reference == null)
            {
                return null;
            }

            ReferenceNodeData referenceNode = await GetReferenceNodeData(parent.Reference);
            if(referenceNode == null)
            {
                return null;
            }

            string referencedObjectName = "<<UNKNOWN REFERENCE OBJECT>>";
            switch(referenceNode.ObjectType.ToLowerInvariant())
            {
            case ExportConstants.ExportObjectTypeNpc:
                referencedObjectName = referenceNode.Npc.Name;
                break;
            case ExportConstants.ExportObjectTypeItem:
                referencedObjectName = referenceNode.Item.Name;
                break;
            case ExportConstants.ExportObjectTypeSkill:
                referencedObjectName = referenceNode.Skill.Name;
                break;
            case ExportConstants.ExportObjectTypeQuest:
                referencedObjectName = referenceNode.Quest.Name;
                break;
            case ExportConstants.ExportObjectTypeWikiPage:
                referencedObjectName = referenceNode.WikiPage.Name;
                break;
            case ExportConstants.ExportObjectTypeMapMarker:
                referencedObjectName = string.Format("{0} ({1})", referenceNode.Marker.MarkerName, referenceNode.Marker.MapName);
                break;
            case ExportConstants.ExportObjectTypeDailyRoutineEvent:
                string formattedTime;
                if(referenceNode.DailyRoutineEvent.EarliestTime.Hours != referenceNode.DailyRoutineEvent.LatestTime.Hours ||
                   referenceNode.DailyRoutineEvent.EarliestTime.Minutes != referenceNode.DailyRoutineEvent.LatestTime.Minutes)
                {
                    formattedTime = string.Format("{0} - {1}", referenceNode.DailyRoutineEvent.EarliestTime.ToString(TimeFormat), referenceNode.DailyRoutineEvent.LatestTime.ToString(TimeFormat));
                }
                else
                {
                    formattedTime = referenceNode.DailyRoutineEvent.EarliestTime.ToString(TimeFormat);
                }
                referencedObjectName = string.Format("{0} ({1})", formattedTime, referenceNode.Npc.Name);
                break;
            }

            return ExportUtil.BuildTextPreview(string.Format("Reference Node ({0})", referencedObjectName));
        }

        /// <summary>
        /// Loads the reference node data
        /// </summary>
        /// <param name="referenceNode">Reference node</param>
        /// <returns>Reference node data</returns>
        private async Task<ReferenceNodeData> GetReferenceNodeData(ReferenceNode referenceNode)
        {
            ReferenceNodeData referenceNodeData = new ReferenceNodeData();
            referenceNodeData.ReferenceText = referenceNode.ReferenceText;
            referenceNodeData.ObjectType = referenceNode.ReferencedObjects[0].ObjectType;
            switch(referenceNodeData.ObjectType.ToLowerInvariant())
            {
            case ExportConstants.ExportObjectTypeNpc:
                referenceNodeData.Npc = await _exportCachedDbAccess.GetNpcById(referenceNode.ReferencedObjects[0].ObjectId);
                break;
            case ExportConstants.ExportObjectTypeItem:
                referenceNodeData.Item = await _exportCachedDbAccess.GetItemById(referenceNode.ReferencedObjects[0].ObjectId);
                break;
            case ExportConstants.ExportObjectTypeSkill:
                referenceNodeData.Skill = await _exportCachedDbAccess.GetSkillById(referenceNode.ReferencedObjects[0].ObjectId);
                break;
            case ExportConstants.ExportObjectTypeQuest:
                referenceNodeData.Quest = await _exportCachedDbAccess.GetQuestById(referenceNode.ReferencedObjects[0].ObjectId);
                break;
            case ExportConstants.ExportObjectTypeWikiPage:
                referenceNodeData.WikiPage = await _exportCachedDbAccess.GetWikiPageById(referenceNode.ReferencedObjects[0].ObjectId);
                break;
            case ExportConstants.ExportObjectTypeMapMarker:
                referenceNodeData.Marker = await _exportCachedDbAccess.GetMarkerById(referenceNode.ReferencedObjects[1].ObjectId, referenceNode.ReferencedObjects[0].ObjectId);
                break;
            case ExportConstants.ExportObjectTypeDailyRoutineEvent:
                referenceNodeData.Npc = await _exportCachedDbAccess.GetNpcById(referenceNode.ReferencedObjects[1].ObjectId);
                referenceNodeData.DailyRoutineEvent = referenceNodeData.Npc.DailyRoutine != null ? referenceNodeData.Npc.DailyRoutine.FirstOrDefault(d => d.EventId == referenceNode.ReferencedObjects[0].ObjectId) : null;
                break;
            }

            return referenceNodeData;
        }

        /// <summary>
        /// Returns if the dialog renderer has placeholders for a template type
        /// </summary>
        /// <param name="templateType">Tempalte Type to check</param>
        /// <returns>true if the dialog renderer has placeholders for the template type</returns>
        public bool HasPlaceholdersForTemplateType(TemplateType templateType)
        {
            return templateType == TemplateType.ReferenceNode;
        }

        /// <summary>
        /// Returns the placeholders for a template
        /// </summary>
        /// <param name="templateType">Template Type</param>
        /// <param name="renderingEngine">Rendering engine</param>
        /// <returns>List of template placeholders</returns>
        public List<ExportTemplatePlaceholder> GetPlaceholdersForTemplate(TemplateType templateType, ExportTemplateRenderingEngine renderingEngine)
        {
            if(!HasPlaceholdersForTemplateType(templateType))
            {
                return new List<ExportTemplatePlaceholder>();
            }

            if(!_renderers.ContainsKey(renderingEngine))
            {
                throw new KeyNotFoundException(string.Format("Unknown rendering engine {0} for ReferenceNode", renderingEngine.ToString()));   
            }

            return _renderers[renderingEngine].GetPlaceholdersForTemplate(templateType);
        }
    }
}