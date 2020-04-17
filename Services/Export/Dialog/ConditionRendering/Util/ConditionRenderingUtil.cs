using System.Threading.Tasks;
using GoNorth.Data.Exporting;
using GoNorth.Data.FlexFieldDatabase;
using GoNorth.Data.Kortisto;
using GoNorth.Data.Project;
using GoNorth.Services.Export.Data;
using GoNorth.Services.Export.Dialog.ConditionRendering.ConfigObject;
using GoNorth.Services.Export.Placeholder;

namespace GoNorth.Services.Export.Dialog.ConditionRendering.Util
{
    /// <summary>
    /// Util class for rendering conditions
    /// </summary>
    public static class ConditionRenderingUtil
    {
        /// <summary>
        /// Returns the group operator from the template of the condition
        /// </summary>
        /// <param name="defaultTemplateProvider">Default template provider</param>
        /// <param name="project">Project</param>
        /// <param name="groupOperator">Group Operator</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <returns>Group Operator</returns>
        public static async Task<string> GetGroupOperatorFromTemplate(ICachedExportDefaultTemplateProvider defaultTemplateProvider, GoNorthProject project, int groupOperator, ExportPlaceholderErrorCollection errorCollection)
        {
            switch(groupOperator)
            {
            case ExportConstants.GroupOperator_And:
                return (await defaultTemplateProvider.GetDefaultTemplateByType(project.Id, TemplateType.GeneralLogicAnd)).Code;
            case ExportConstants.GroupOperator_Or:
                return (await defaultTemplateProvider.GetDefaultTemplateByType(project.Id, TemplateType.GeneralLogicOr)).Code;
            }

            errorCollection.AddDialogUnknownGroupOperator(groupOperator);
            return "";
        }

        /// <summary>
        /// Returns the compare operator from the template of the condition
        /// </summary>
        /// <param name="defaultTemplateProvider">Default template provider</param>
        /// <param name="project">Project</param>
        /// <param name="conditionOperator">Condition Operator</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <returns>Condition Operator</returns>
        public static async Task<string> GetCompareOperatorFromTemplate(ICachedExportDefaultTemplateProvider defaultTemplateProvider, GoNorthProject project, string conditionOperator, ExportPlaceholderErrorCollection errorCollection)
        {
            switch(conditionOperator.ToLowerInvariant())
            {
            case "=":
                return (await defaultTemplateProvider.GetDefaultTemplateByType(project.Id, TemplateType.GeneralCompareOperatorEqual)).Code;
            case "!=":
                return (await defaultTemplateProvider.GetDefaultTemplateByType(project.Id, TemplateType.GeneralCompareOperatorNotEqual)).Code;
            case "<":
                return (await defaultTemplateProvider.GetDefaultTemplateByType(project.Id, TemplateType.GeneralCompareOperatorLess)).Code;
            case "<=":
                return (await defaultTemplateProvider.GetDefaultTemplateByType(project.Id, TemplateType.GeneralCompareOperatorLessOrEqual)).Code;
            case ">":
                return (await defaultTemplateProvider.GetDefaultTemplateByType(project.Id, TemplateType.GeneralCompareOperatorBigger)).Code;
            case ">=":
                return (await defaultTemplateProvider.GetDefaultTemplateByType(project.Id, TemplateType.GeneralCompareOperatorBiggerOrEqual)).Code;
            case "contains":
                return (await defaultTemplateProvider.GetDefaultTemplateByType(project.Id, TemplateType.GeneralCompareOperatorContains)).Code;
            case "startswith":
                return (await defaultTemplateProvider.GetDefaultTemplateByType(project.Id, TemplateType.GeneralCompareOperatorStartsWith)).Code;
            case "endswith":
                return (await defaultTemplateProvider.GetDefaultTemplateByType(project.Id, TemplateType.GeneralCompareOperatorEndsWith)).Code;
            }

            errorCollection.AddDialogUnknownConditionOperator(conditionOperator);
            return string.Empty;
        }

        /// <summary>
        /// Returns the item compare operator from the template of the condition
        /// </summary>
        /// <param name="defaultTemplateProvider">Default template provider</param>
        /// <param name="project">Project</param>
        /// <param name="compareOperator">Compare Operator</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <returns>Condition Operator</returns>
        public static async Task<string> GetItemCompareOperatorFromTemplate(ICachedExportDefaultTemplateProvider defaultTemplateProvider, GoNorthProject project, int compareOperator, ExportPlaceholderErrorCollection errorCollection)
        {
            switch(compareOperator)
            {
            case InventoryConditionData.CompareOperator_AtLeast:
                return (await defaultTemplateProvider.GetDefaultTemplateByType(project.Id, TemplateType.GeneralCompareOperatorBiggerOrEqual)).Code;
            case InventoryConditionData.CompareOperator_AtMaximum:
                return (await defaultTemplateProvider.GetDefaultTemplateByType(project.Id, TemplateType.GeneralCompareOperatorLessOrEqual)).Code;
            }

            errorCollection.AddDialogUnknownConditionOperator(compareOperator.ToString());
            return "";
        }

        /// <summary>
        /// Returns the item compare operator from the template of the condition
        /// </summary>
        /// <param name="defaultTemplateProvider">Default template provider</param>
        /// <param name="project">Project</param>
        /// <param name="conditionOperator">Condition Operator</param>
        /// <param name="errorCollection">Error Collection</param>
        /// <returns>Condition Operator</returns>
        public static async Task<string> GetGameTimeCompareOperatorFromTemplate(ICachedExportDefaultTemplateProvider defaultTemplateProvider, GoNorthProject project, int conditionOperator, ExportPlaceholderErrorCollection errorCollection)
        {
            switch(conditionOperator)
            {
            case GameTimeConditionData.Operator_Before:
                return (await defaultTemplateProvider.GetDefaultTemplateByType(project.Id, TemplateType.GeneralCompareOperatorLess)).Code;
            case GameTimeConditionData.Operator_After:
                return (await defaultTemplateProvider.GetDefaultTemplateByType(project.Id, TemplateType.GeneralCompareOperatorBigger)).Code;
            }

            errorCollection.AddDialogUnknownConditionOperator(conditionOperator.ToString());
            return "";
        }

        /// <summary>
        /// Returns true if a condition operator is a primitive operator or not
        /// </summary>
        /// <param name="conditionOperator">Operator</param>
        /// <returns>true if the operator is a primitive operator</returns>
        public static bool IsConditionOperatorPrimitiveOperator(string conditionOperator)
        {
            conditionOperator = conditionOperator.ToLowerInvariant();
            return conditionOperator != "contains" && conditionOperator != "startswith" && conditionOperator != "endswith";
        }

        /// <summary>
        /// Loads the npc
        /// </summary>
        /// <param name="cachedDbAccess">Cached database access</param>
        /// <param name="project">Project</param>
        /// <param name="flexFieldObject">Flex field object to which the dialog belongs</param>
        /// <param name="errorCollection">Export settings</param>
        /// <param name="isPlayer">true if the condition resolver is for the player, else false</param>
        /// <returns>Loaded npc, null if no npc could be found</returns>
        public static async Task<KortistoNpc> GetExportNpc(IExportCachedDbAccess cachedDbAccess, GoNorthProject project, FlexFieldObject flexFieldObject, ExportPlaceholderErrorCollection errorCollection, bool isPlayer)
        {
            if(isPlayer)
            {
                flexFieldObject = await cachedDbAccess.GetPlayerNpc(project.Id);
                if(flexFieldObject == null)
                {
                    errorCollection.AddNoPlayerNpcExistsError();
                    return null;
                }
            }

            return flexFieldObject as KortistoNpc;
        }

    }
}