{{~ for item in inventory ~}}
this:add_item("{{ item.fields.ScriptName.value }}")
{{~ if item.quantity > 1 ~}}
this:get_item({{ for.index }}):set_value("Quantity", {{ item.quantity }})
{{~ end ~}}
{{~ if item.is_equipped ~}}
this:equip_item(this:get_item({{ for.index }}))
{{~ end ~}}
{{~ end ~}}