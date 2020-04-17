----- Includes ----------

include_file("_BaseItem.lua")

include("GameItem")

----- Init Functions ----

function OnInit(this)
    -- Values
    this:add_localized_string_value("Name", "{{ langkey item.name }}")
    {{ item.unused_fields | attribute_list }}
end