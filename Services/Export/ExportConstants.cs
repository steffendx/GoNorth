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
        /// Key for the export data state machine
        /// </summary>
        public const string ExportDataStateMachine = "StateMachine";

        /// <summary>
        /// Key for referenced language ids
        /// </summary>
        public const string ExportDataReferencedLanguageIds = "ReferencedLanguageIds";


        /// <summary>
        /// Export Object Type for none
        /// </summary>
        public const string ExportObjectTypeNone = "none";

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
        /// Export Object Type for quests
        /// </summary>
        public const string ExportObjectTypeQuest = "quest";

        /// <summary>
        /// Export Object Type for wiki pages
        /// </summary>
        public const string ExportObjectTypeWikiPage = "wikipage";

        /// <summary>
        /// Export Object Type for map markers
        /// </summary>
        public const string ExportObjectTypeMapMarker = "mapmarker";

        /// <summary>
        /// Export Object Type for daily routine events
        /// </summary>
        public const string ExportObjectTypeDailyRoutineEvent = "npcdailyroutineevent";


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
        /// Scriban String Flex Field Type
        /// </summary>
        public const string Scriban_FlexFieldType_String = "string";

        /// <summary>
        /// Scriban Number Flex Field Type
        /// </summary>
        public const string Scriban_FlexFieldType_Number = "number";

        /// <summary>
        /// Scriban Option Flex Field Type
        /// </summary>
        public const string Scriban_FlexFieldType_Option = "option";

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
        /// Language key for a choice
        /// </summary>
        public const string LanguageKeyTypeChoice = "choice";

        /// <summary>
        /// Language key for quest
        /// </summary>
        public const string LanguageKeyTypeQuest = "quest";


        /// <summary>
        /// Name of the language key function in Scriban
        /// </summary>
        public const string ScribanLanguageKeyName = "langkey";


        /// <summary>
        /// Scriban Npc object key
        /// </summary>
        public const string ScribanNpcObjectKey = "npc";

        /// <summary>
        /// Scriban Npc inventory object key
        /// </summary>
        public const string ScribanNpcInventoryObjectKey = "inventory";
        
        /// <summary>
        /// Scriban Npc skill object key
        /// </summary>
        public const string ScribanNpcSkillsObjectKey = "skills";

        /// <summary>
        /// Scriban Dialog key
        /// </summary>
        public const string ScribanDialogKey = "dialog";

        /// <summary>
        /// Scriban Dialog function key
        /// </summary>
        public const string ScribanDialogFunctionKey = "dialog_function";

        /// <summary>
        /// Object key for choice options
        /// </summary>
        public const string ScribanChoiceOptionObjectKey = "cur_choice";

        /// <summary>
        /// Object key for condition entries
        /// </summary>
        public const string ScribanConditionEntryObjectKey = "cur_condition";

        /// <summary>
        /// Scriban Npc daily routine object key
        /// </summary>
        public const string ScribanDailyRoutineObjectKey = "daily_routine";
        
        /// <summary>
        /// Scriban Npc daily routine events object key
        /// </summary>
        public const string ScribanDailyRoutineEventsObjectKey = "daily_routine_events";
                
        /// <summary>
        /// Scriban Npc daily routine function object key
        /// </summary>
        public const string ScribanDailyRoutineFunctionObjectKey = "daily_routine_function";

        /// <summary>
        /// Scriban Npc daily routine functions object key
        /// </summary>
        public const string ScribanDailyRoutineFunctionListObjectKey = "daily_routine_functions";

        /// <summary>
        /// Current event object key for placeholders
        /// </summary>
        public const string DailyRoutineEventObjectKey = "cur_event";

        /// <summary>
        /// Scriban Npc state machine object key
        /// </summary>
        public const string ScribanStateMachineObjectKey = "state_machine";

        /// <summary>
        /// Scriban Npc state object key
        /// </summary>
        public const string ScribanStateObjectKey = "cur_state";

        /// <summary>
        /// Scriban Npc state function key
        /// </summary>
        public const string ScribanStateFunctionObjectKey = "state_function";

        /// <summary>
        /// Scriban Npc state transition key
        /// </summary>
        public const string ScribanStateTransitionObjectKey = "cur_state_transition";
        
        /// <summary>
        /// Scriban export snippets object key
        /// </summary>
        public const string ScribanExportSnippetsObjectKey = "export_snippets";
        
        /// <summary>
        /// Scriban export snippet function object key
        /// </summary>
        public const string ScribanExportSnippetFunctionObjectKey = "snippet_function";
        
        /// <summary>
        /// Scriban item object key
        /// </summary>
        public const string ScribanItemObjectKey = "item";

        /// <summary>
        /// Scriban Skill object key
        /// </summary>
        public const string ScribanSkillObjectKey = "skill";

        /// <summary>
        /// Scriban action object key
        /// </summary>
        public const string ScribanActionObjectKey = "action";


        /// <summary>
        /// Export Snippet Regex
        /// </summary>
        public const string ExportSnippetRegex = "CodeSnippet_(.*?)";


        /// <summary>
        /// Script Type none
        /// </summary>
        public const int ScriptType_None = -1;

        /// <summary>
        /// Script Type node graph
        /// </summary>
        public const int ScriptType_NodeGraph = 0;

        /// <summary>
        /// Script Type code
        /// </summary>
        public const int ScriptType_Code = 1;

        
        /// <summary>
        /// Group Operator for and
        /// </summary>
        public const int GroupOperator_And = 0;

        /// <summary>
        /// Group Operator for or
        /// </summary>
        public const int GroupOperator_Or = 1;
    }
}        