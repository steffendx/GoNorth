local choice{{ choice.node_index }} = ChoiceDialogStep:new()
{{~ for curChoice in choice.choices }}
{{- if curChoice.condition -}}
if({{ curChoice.condition }}) then
    {{ end ~}}choice{{ choice.node_index }}:add_choice("{{ if curChoice.child_node && curChoice.child_node.node_step_function_name }}{{ curChoice.child_node.node_step_function_name }}{{ end }}", "{{ langkey curChoice.text }}"{{ if !curChoice.is_repeatable }}, {{ choice.node_index }}, {{ curChoice.id }}{{ end }})  -- {{ curChoice.text_preview }}
{{~ if curChoice.condition -}}
end
{{~ end ~}}
{{~ end ~}}
dialogManager:add_dialog_step(choice{{ choice.node_index }})