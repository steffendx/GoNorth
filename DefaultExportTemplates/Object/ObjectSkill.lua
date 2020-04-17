----- Includes ----------

include_file("_BaseSkill.lua")

include("Skill")

----- Init Functions ----

function OnInit(this)
    -- Values
    this:add_string_value("Name", "{{ langkey skill.name }}")
    {{ skill.unused_fields | attribute_list }}
end