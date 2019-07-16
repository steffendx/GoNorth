namespace GoNorth.Services.Export
{
    /// <summary>
    /// Export Constants
    /// </summary>
    public class ExportConstants
    {
        /// <summary>
        /// Brackets used for the start of a placeholder
        /// </summary>
        public const string PlaceholderBracketsStart = "{{";

        /// <summary>
        /// Brackets used for the start of a placeholder
        /// </summary>
        public const string PlaceholderBracketsEnd = "}}";


        /// <summary>
        /// Prefix for the List INdents
        /// </summary>
        public const string ListIndentPrefix = "([ \\t]*?)";
        

        /// <summary>
        /// Key for the export data object
        /// </summary>
        public const string ExportDataObject = "Object";

        /// <summary>
        /// Key for the export data object type
        /// </summary>
        public const string ExportDataObjectType = "ObjectType";

        /// <summary>
        /// Key for the export data dialog
        /// </summary>
        public const string ExportDataDialog = "Dialog";

        /// <summary>
        /// Key for referenced language ids
        /// </summary>
        public const string ExportDataReferencedLanguageIds = "ReferencedLanguageIds";


        /// <summary>
        /// Export Object Type for npcs
        /// </summary>
        public const string ExportObjectTypeNpc = "npc";

        /// <summary>
        /// Export Object Type for items
        /// </summary>
        public const string ExportObjectTypeItem = "item";

        /// <summary>
        /// Export Object Type for skills
        /// </summary>
        public const string ExportObjectTypeSkill = "skill";

        /// <summary>
        /// Export Object Type for skills
        /// </summary>
        public const string ExportObjectTypeQuest = "quest";


        /// <summary>
        /// String Flex Field Type
        /// </summary>
        public const int FlexFieldType_String = 0;

        /// <summary>
        /// Number Flex Field Type
        /// </summary>
        public const int FlexFieldType_Number = 2;

        /// <summary>
        /// Option Flex Field Type
        /// </summary>
        public const int FlexFieldType_Option = 3;

        /// <summary>
        /// Flex Field Additional Script Names Seperator
        /// </summary>
        public const string FlexFieldAdditionalScriptNamesSeperator = ",";


        /// <summary>
        /// Id of the condition else node child id
        /// </summary>
        public const int ConditionElseNodeChildId = -1;


        /// <summary>
        /// Language key for npc
        /// </summary>
        public const string LanguageKeyTypeNpc = "npc";

        /// <summary>
        /// Language key for player
        /// </summary>
        public const string LanguageKeyTypePlayer = "player";

        /// <summary>
        /// Language key for quest
        /// </summary>
        public const string LanguageKeyTypeQuest = "quest";
    }
}        