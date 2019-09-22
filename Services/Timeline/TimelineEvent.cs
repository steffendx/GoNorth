namespace GoNorth.Services.Timeline
{
    /// <summary>
    /// Timeline Event
    /// </summary>
    public enum TimelineEvent
    {
        /// <summary>
        /// New User was added
        /// </summary>
        NewUser = 0,

        /// <summary>
        /// User was deleted
        /// </summary>
        UserDeleted = 1,

        /// <summary>
        /// User Roles were set
        /// </summary>
        UserRolesSet = 2,


        /// <summary>
        /// A project was created
        /// </summary>
        ProjectCreated = 3,

        /// <summary>
        /// A Project was deleted
        /// </summary>
        ProjectDeleted = 4,

        /// <summary>
        /// A project was updated
        /// </summary>
        ProjectUpdated = 5,


        /// <summary>
        /// A new Kortisto Folder was created
        /// </summary>
        KortistoFolderCreated = 6,

        /// <summary>
        /// A Kortisto Folder was deleted
        /// </summary>
        KortistoFolderDeleted = 7,

        /// <summary>
        /// A Kortisto Folder was updated
        /// </summary>
        KortistoFolderUpdated = 8,
        
        /// <summary>
        /// An Kortisto Folder was moved to a folder
        /// </summary>
        KortistoFolderMovedToFolder = 96,

        /// <summary>
        /// An Kortisto Folder was moved to root level
        /// </summary>
        KortistoFolderMovedToRootFolder = 97,


        /// <summary>
        /// A Kortisto Npc Template was created
        /// </summary>
        KortistoNpcTemplateCreated = 9,

        /// <summary>
        /// A Kortisto Npc Template was deleted
        /// </summary>
        KortistoNpcTemplateDeleted = 10,

        /// <summary>
        /// A Kortisto Npc Template was updated
        /// </summary>
        KortistoNpcTemplateUpdated = 11,

        /// <summary>
        /// An image was added to a Npc Template 
        /// </summary>
        KortistoNpcTemplateImageUpload = 12,

        /// <summary>
        /// The fields of a npc template were distributed
        /// </summary>
        KortistoNpcTemplateFieldsDistributed = 26,


        /// <summary>
        /// A Kortisto Npc was created
        /// </summary>
        KortistoNpcCreated = 13,

        /// <summary>
        /// A Kortisto Npc was deleted
        /// </summary>
        KortistoNpcDeleted = 14,

        /// <summary>
        /// A Kortisto Npc was updated
        /// </summary>
        KortistoNpcUpdated = 15,

        /// <summary>
        /// An Image was added to an npc
        /// </summary>
        KortistoNpcImageUpload = 16,

        /// <summary>
        /// An Kortisto Npc was moved to a folder
        /// </summary>
        KortistoNpcMovedToFolder = 102,

        /// <summary>
        /// An Kortisto Npc was moved to root level
        /// </summary>
        KortistoNpcMovedToRoot = 103,
        
        /// <summary>
        /// A Kortisto Npc Export Snippet was changed
        /// </summary>
        KortistoNpcExportSnippetChanged = 106,
        
        /// <summary>
        /// A Kortisto Npc Export Snippet was deleted
        /// </summary>
        KortistoNpcExportSnippetDeleted = 109,


        /// <summary>
        /// A new Styr Folder was created
        /// </summary>
        StyrFolderCreated = 27,

        /// <summary>
        /// A Styr Folder was deleted
        /// </summary>
        StyrFolderDeleted = 28,

        /// <summary>
        /// A Styr Folder was updated
        /// </summary>
        StyrFolderUpdated = 29,

        /// <summary>
        /// An Styr Folder was moved to a folder
        /// </summary>
        StyrFolderMovedToFolder = 98,

        /// <summary>
        /// An Styr Folder was moved to root level
        /// </summary>
        StyrFolderMovedToRootFolder = 99,


        /// <summary>
        /// A Styr Item Template was created
        /// </summary>
        StyrItemTemplateCreated = 30,

        /// <summary>
        /// A Styr Item Template was deleted
        /// </summary>
        StyrItemTemplateDeleted = 31,

        /// <summary>
        /// A Styr Item Template was updated
        /// </summary>
        StyrItemTemplateUpdated = 32,

        /// <summary>
        /// An image was added to a Styr Item Template
        /// </summary>
        StyrItemTemplateImageUpload = 33,

        /// <summary>
        /// The fields of a Styr Item template were distributed
        /// </summary>
        StyrItemTemplateFieldsDistributed = 34,


        /// <summary>
        /// A Styr Item was created
        /// </summary>
        StyrItemCreated = 35,

        /// <summary>
        /// A Styr Item was deleted
        /// </summary>
        StyrItemDeleted = 36,

        /// <summary>
        /// A Styr Item was updated
        /// </summary>
        StyrItemUpdated = 37,

        /// <summary>
        /// An Image was added to a Styr Item
        /// </summary>
        StyrItemImageUpload = 38,
        
        /// <summary>
        /// A Styr Item was moved to a folder
        /// </summary>
        StyrItemMovedToFolder = 104,

        /// <summary>
        /// An Styr Item was moved to root level
        /// </summary>
        StyrItemMovedToRoot = 105,
        
        /// <summary>
        /// A Styr Item Export Snippet was changed
        /// </summary>
        StyrItemExportSnippetChanged = 107,
        
        /// <summary>
        /// A Styr Item Export Snippet was deleted
        /// </summary>
        StyrItemExportSnippetDeleted = 110,


        /// <summary>
        /// A new Evne Folder was created
        /// </summary>
        EvneFolderCreated = 65,

        /// <summary>
        /// An Evne Folder was deleted
        /// </summary>
        EvneFolderDeleted = 66,

        /// <summary>
        /// An Evne Folder was updated
        /// </summary>
        EvneFolderUpdated = 67,

        /// <summary>
        /// An Evne Folder was moved to a folder
        /// </summary>
        EvneFolderMovedToFolder = 94,

        /// <summary>
        /// An Evne Folder was moved to root level
        /// </summary>
        EvneFolderMovedToRootFolder = 95,


        /// <summary>
        /// An Evne Skill Template was created
        /// </summary>
        EvneSkillTemplateCreated = 68,

        /// <summary>
        /// An Evne Skill Template was deleted
        /// </summary>
        EvneSkillTemplateDeleted = 69,

        /// <summary>
        /// An Evne Skill Template was updated
        /// </summary>
        EvneSkillTemplateUpdated = 70,

        /// <summary>
        /// An image was added to a Evne Skill Template
        /// </summary>
        EvneSkillTemplateImageUpload = 71,

        /// <summary>
        /// The fields of an Evne Skill template were distributed
        /// </summary>
        EvneSkillTemplateFieldsDistributed = 72,


        /// <summary>
        /// An Evne Skill was created
        /// </summary>
        EvneSkillCreated = 73,

        /// <summary>
        /// An Evne SKill was deleted
        /// </summary>
        EvneSkillDeleted = 74,

        /// <summary>
        /// An Evne SKill was updated
        /// </summary>
        EvneSkillUpdated = 75,

        /// <summary>
        /// An Image was added to an Evne Skill
        /// </summary>
        EvneSkillImageUpload = 76,

        /// <summary>
        /// An Evne Skill was moved to a folder
        /// </summary>
        EvneSkillMovedToFolder = 100,

        /// <summary>
        /// An Evne Skill was moved to root level
        /// </summary>
        EvneSkillMovedToRoot = 101,
        
        /// <summary>
        /// An Evne Skill Export Snippet was changed
        /// </summary>
        EvneSkillExportSnippetChanged = 108,
        
        /// <summary>
        /// An Evne Skill Export Snippet was deleted
        /// </summary>
        EvneSkillExportSnippetDeleted = 111,


        /// <summary>
        /// A Kirja page was created
        /// </summary>
        KirjaPageCreated = 17,

        /// <summary>
        /// A Kirja page was deleted
        /// </summary>
        KirjaPageDeleted = 18,

        /// <summary>
        /// A Kirja page was updated
        /// </summary>
        KirjaPageUpdated = 19,

        /// <summary>
        /// A Kirja attachment was added
        /// </summary>
        KirjaAttachmentAdded = 63,
        
        /// <summary>
        /// A Kirja attachment was deleted
        /// </summary>
        KirjaAttachmentDeleted = 64,


        /// <summary>
        /// A Karta Map was created
        /// </summary>
        KartaMapCreated = 20,

        /// <summary>
        /// A Karta map was deleted
        /// </summary>
        KartaMapDeleted = 21,

        /// <summary>
        /// A Karta Map was updated
        /// </summary>
        KartaMapUpdated = 22,

        /// <summary>
        /// A marker for a Karta Map was updated
        /// </summary>
        KartaMapMarkerUpdated = 23,

        /// <summary>
        /// A Marker for a Karta Map was deleted
        /// </summary>
        KartaMapMarkerDeleted = 62,


        /// <summary>
        /// A dialog was created in Tale
        /// </summary>
        TaleDialogCreated = 24,

        /// <summary>
        /// A dialog was updated in Tale
        /// </summary>
        TaleDialogUpdated = 25,


        /// <summary>
        /// Aika Chapter Overview updated
        /// </summary>
        AikaChapterOverviewUpdated = 39,

        /// <summary>
        /// Aika Chapter Detail created
        /// </summary>
        AikaChapterDetailCreated = 40,

        /// <summary>
        /// Aika Chapter Detail updated
        /// </summary>
        AikaChapterDetailUpdated = 41,

        /// <summary>
        /// Aika Chapter Detail deleted
        /// </summary>
        AikaChapterDetailDeleted = 42,

        /// <summary>
        /// Aika Quest created
        /// </summary>
        AikaQuestCreated = 43,

        /// <summary>
        /// Aika Quest updated
        /// </summary>
        AikaQuestUpdated = 44,

        /// <summary>
        /// Aika Quest deleted
        /// </summary>
        AikaQuestDeleted = 45,


        /// <summary>
        /// Task Board created
        /// </summary>
        TaskBoardCreated = 46,

        /// <summary>
        /// Task Board updated
        /// </summary>
        TaskBoardUpdated = 47,

        /// <summary>
        /// Task Board closed
        /// </summary>
        TaskBoardClosed = 48,

        /// <summary>
        /// Task Board reopened
        /// </summary>
        TaskBoardReopened = 49,

        /// <summary>
        /// Task Board deleted
        /// </summary>
        TaskBoardDeleted = 50,

        
        /// <summary>
        /// Task group type created
        /// </summary>
        TaskGroupTypeCreated = 88,

        /// <summary>
        /// Task group type updated
        /// </summary>
        TaskGroupTypeUpdated = 89,
        
        /// <summary>
        /// Task group type deleted
        /// </summary>
        TaskGroupTypeDeleted = 90,


        /// <summary>
        /// Task Type created
        /// </summary>
        TaskTypeCreated = 91,

        /// <summary>
        /// Task Type updated
        /// </summary>
        TaskTypeUpdated = 92,
        
        /// <summary>
        /// Task Type deleted
        /// </summary>
        TaskTypeDeleted = 93,

        
        /// <summary>
        /// Task Board category created
        /// </summary>
        TaskBoardCategoryCreated = 83,

        /// <summary>
        /// Task Board category updated
        /// </summary>
        TaskBoardCategoryUpdated = 84,

        /// <summary>
        /// Task Board category deleted
        /// </summary>
        TaskBoardCategoryDeleted = 85,


        /// <summary>
        /// Task Group created
        /// </summary>
        TaskGroupCreated = 51,

        /// <summary>
        /// Task Group updated
        /// </summary>
        TaskGroupUpdated = 52,

        /// <summary>
        /// A task group was moved to a different board
        /// </summary>
        TaskGroupMoved = 86,

        /// <summary>
        /// Task Group deleted
        /// </summary>
        TaskGroupDeleted = 53,


        /// <summary>
        /// Task created
        /// </summary>
        TaskCreated = 54,

        /// <summary>
        /// Task updated
        /// </summary>
        TaskUpdated = 55,

        /// <summary>
        /// A task was moved to a different board
        /// </summary>
        TaskMoved = 87,

        /// <summary>
        /// Task deleted
        /// </summary>
        TaskDeleted = 56,

        
        /// <summary>
        /// Implemented Npc
        /// </summary>
        ImplementedNpc = 57,

        /// <summary>
        /// Implemented Item
        /// </summary>
        ImplementedItem = 58,

        /// <summary>
        /// Implemented Skill
        /// </summary>
        ImplementedSkill = 77,

        /// <summary>
        /// Implemented Quest
        /// </summary>
        ImplementedQuest = 59,

        /// <summary>
        /// Implemented Dialog
        /// </summary>
        ImplementedDialog = 60,

        /// <summary>
        /// Implemented Marker
        /// </summary>
        ImplementedMarker = 61,


        /// <summary>
        /// Default Export Template Updated
        /// </summary>
        ExportDefaultTemplateUpdated = 78,

        /// <summary>
        /// Object Export Template Updated
        /// </summary>
        ExportObjectTemplateUpdated = 79,
        
        /// <summary>
        /// Object Export Template Deleted
        /// </summary>
        ExportObjectTemplateDeleted = 80,
                
        /// <summary>
        /// Object Export Settings Updated
        /// </summary>
        ExportSettingsUpdated = 81,

        /// <summary>
        /// Export Dialog Function generation conditions updated
        /// </summary>
        ExportDialogFunctionGenerationConditionsUpdated = 82
    };
}