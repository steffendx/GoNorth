----- Includes ----------

include_file("_BaseItem.lua")

include("GameItem")

----- Init Functions ----

function OnInit(this)
    -- Values
    this:add_string_value("Name", "{{FlexField_Name_LangKey}}")

    {{FlexField_UnusedFields}}
end