{{Inventory_Start}}this:add_item("{{CurItem_Value_ScriptName}}"){{CurItem_Quantity_Not_Equal_One_Start}}
this:get_item({{CurItem_Index}}):set_value("Quantity", {{CurItem_Quantity}}){{CurItem_Quantity_Not_Equal_One_End}}{{CurItem_Is_Equipped_Start}}
this:equip_item(this:get_item({{CurItem_Index}})){{CurItem_Is_Equipped_End}}
{{Inventory_End}}