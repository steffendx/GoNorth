----- Includes ----------

include_file("_BaseNpc.lua")

include("Npc")

----- Init Functions ----

function OnInit(this)
    -- Values
    this:add_localized_string_value("Name", "{{FlexField_Name_LangKey}}")

    {{FlexField_UnusedFields}}

    -- Inventory
    {{Npc_Inventory}}

    -- Skills
    {{Npc_Skills}}

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