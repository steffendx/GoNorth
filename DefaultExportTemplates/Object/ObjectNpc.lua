----- Includes ----------

include_file("_BaseNpc.lua")

include("Npc")

----- Init Functions ----

function OnInit(this)
    -- Values
    this:add_localized_string_value("Name", "{{FlexField_Name_LangKey}}")

    {{FlexField_UnusedFields}}

    {{Npc_HasItems_Start}}-- Inventory
    {{Npc_Inventory}}
    {{Npc_HasItems_End}}
    {{Npc_HasSkills_Start}}-- Skills
    {{Npc_Skills}}
    {{Npc_HasSkills_End}}
    {{Npc_HasDailyRoutine_Start}}-- Daily Routine Events
    {{Npc_DailyRoutine_Events}}{{Npc_HasDailyRoutine_End}}

    {{Dialog_HasDialog_Start}}this:register_message_function("OnTalk", "DialogStart"){{Dialog_HasDialog_End}}
end

------ States -----------

{{Dialog_HasDialog_Start}}
------ Dialog -----------

function DialogStart(this)
    {{Dialog_Start}}
end

{{Dialog_Additional_Functions}}
{{Dialog_HasDialog_End}}

{{Npc_HasDailyRoutine_Start}}
------ Daily Routine ----
{{Npc_DailyRoutine_Functions}}
{{Npc_HasDailyRoutine_End}}