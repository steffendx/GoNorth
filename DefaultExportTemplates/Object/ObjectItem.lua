----- Includes ----------

include_file("_BaseItem.lua")

include("GameItem")

----- Init Functions ----

function OnInit(this)
    -- Values
    this:add_localized_string_value("Name", "{{ langkey item.name }}")
    {{ item.unused_fields | attribute_list }}
    {{- if !inventory.empty? ~}}
    
    -- Inventory
    {{~ for cur_inventory_item in inventory ~}}
    this:add_item("{{ cur_inventory_item.fields.ScriptName.value }}")
    {{~ if cur_inventory_item.quantity > 1 ~}}
    this:get_item({{ for.index }}):set_value("Quantity", {{ cur_inventory_item.quantity }})
    {{~ end ~}}
    {{~ if cur_inventory_item.role ~}}
    this:get_item({{ for.index }}):set_role("{{ cur_inventory_item.role }}")
    {{~ end ~}}
    {{~ end ~}}
    {{~ end ~}}
end