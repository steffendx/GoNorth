using System.Collections.Generic;
using GoNorth.Data.Exporting;
using GoNorth.Data.Kortisto;
using GoNorth.Data.Project;
using GoNorth.Services.Export.Placeholder;
using Microsoft.Extensions.Localization;

namespace GoNorth.Services.Export.Dialog.ConditionRendering
{
    /// <summary>
    /// Class for rendering a value condition
    /// </summary>
    public class GroupConditionResolver : BaseConditionRenderer<GroupConditionResolver.GroupConditionData>
    {
        /// <summary>
        /// Group Condition Data
        /// </summary>
        public class GroupConditionData
        {
            /// <summary>
            /// Operator
            /// </summary>
            public int Operator { get; set; }

            /// <summary>
            /// Condition Elements
            /// </summary>
            public List<ParsedConditionData> ConditionElements { get; set; }
        }


        /// <summary>
        /// Group Operator for and
        /// </summary>
        private const int GroupOperator_And = 0;

        /// <summary>
        /// Group Operator for or
        /// </summary>
        private const int GroupOperator_Or = 1;

        
        /// <summary>
        /// Placeholder for the group content
        /// </summary>
        private const string Placeholder_GroupContent = "Logic_Group_Content";


        /// <summary>
        /// Condition Renderer
        /// </summary>
        private readonly IConditionRenderer _conditionRenderer;

        /// <summary>
        /// Default Template Provider
        /// </summary>
        private readonly ICachedExportDefaultTemplateProvider _defaultTemplateProvider;

        /// <summary>
        /// String Localizer
        /// </summary>
        private readonly IStringLocalizer _localizer;

        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="conditionRenderer">Condition Renderer</param>
        /// <param name="defaultTemplateProvider">Default Template Provider</param>
        /// <param name="localizerFactory">Localizer Factory</param>
        public GroupConditionResolver(IConditionRenderer conditionRenderer, ICachedExportDefaultTemplateProvider defaultTemplateProvider, IStringLocalizerFactory localizerFactory)
        {
            _conditionRenderer = conditionRenderer;
            _defaultTemplateProvider = defaultTemplateProvider;
            _localizer = localizerFactory.Create(typeof(GroupConditionResolver));
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
        public override string BuildConditionElementFromParsedData(GroupConditionResolver.GroupConditionData parsedData, GoNorthProject project, ExportPlaceholderErrorCollection errorCollection, KortistoNpc npc, ExportSettings exportSettings)
        {
            string groupContent = _defaultTemplateProvider.GetDefaultTemplateByType(project.Id, TemplateType.GeneralLogicGroup).Result.Code;
            string renderedConditionElements = _conditionRenderer.RenderConditionElements(project, parsedData.ConditionElements, GetOperatorFromTemplate(project, parsedData.Operator, errorCollection), errorCollection, npc, exportSettings);
            
            groupContent = ExportUtil.BuildPlaceholderRegex(Placeholder_GroupContent).Replace(groupContent, renderedConditionElements);
            return groupContent;
        }

        /// <summary>
        /// Returns the operator from the template of the condition
        /// </summary>
        /// <param name="project">Project</param>
        /// <param name="groupOperator">Group Operator</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <returns>Group Operator</returns>
        private string GetOperatorFromTemplate(GoNorthProject project, int groupOperator, ExportPlaceholderErrorCollection errorCollection)
        {
            switch(groupOperator)
            {
            case GroupOperator_And:
                return _defaultTemplateProvider.GetDefaultTemplateByType(project.Id, TemplateType.GeneralLogicAnd).Result.Code;
            case GroupOperator_Or:
                return _defaultTemplateProvider.GetDefaultTemplateByType(project.Id, TemplateType.GeneralLogicOr).Result.Code;
            }

            errorCollection.AddDialogUnknownGroupOperator(groupOperator);
            return "";
        }

        /// <summary>
        /// Returns if true the condition element renderer has placeholders for a template type
        /// </summary>
        /// <param name="templateType">Tempalte Type to check</param>
        /// <returns>true if the condition element renderer has placeholders for the template type</returns>
        public override bool HasPlaceholdersForTemplateType(TemplateType templateType)
        {
            return templateType == TemplateType.GeneralLogicGroup;
        }

        /// <summary>
        /// Returns the Export Template Placeholders for a Template Type
        /// </summary>
        /// <param name="templateType">Template Type</param>
        /// <returns>Export Template Placeholder</returns>
        public override List<ExportTemplatePlaceholder> GetExportTemplatePlaceholdersForType(TemplateType templateType)
        {
            return new List<ExportTemplatePlaceholder> {
                ExportUtil.CreatePlaceHolder(Placeholder_GroupContent, _localizer)
            };
        }
    }
}