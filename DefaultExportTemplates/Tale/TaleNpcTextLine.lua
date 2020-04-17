{{~ if text_line.child_node && text_line.child_node.node_step_function_name != "" ~}}
local textLine{{ text_line.node_index }} = TextDialogStep:new(this, "{{ langkey text_line.text_line }}") -- {{ text_line.text_line_preview }}
textLine{{ text_line.node_index }}:set_npc_function_trigger("{{ text_line.child_node.node_step_function_name }}")
dialogManager:add_dialog_step(textLine{{ text_line.node_index }})
{{~ else ~}}
dialogManager:add_dialog_step(TextDialogStep:new(this, "{{ langkey text_line.text_line }}")) -- {{ text_line.text_line_preview }}
{{~ end ~}}