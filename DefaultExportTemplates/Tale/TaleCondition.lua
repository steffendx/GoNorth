{{~ for cur_condition in condition.conditions ~}}
{{ if for.index > 0 }}else{{ end }}if({{ cur_condition.condition }}) then
    {{if cur_condition.child_node && cur_condition.child_node.node_step_function_name }}{{ cur_condition.child_node.node_step_function_name }}(this){{ end }}
{{~ end ~}}
{{~ if condition.else && condition.else.node_step_function_name ~}}
else
    {{if condition.else.node_step_function_name }}{{ condition.else.node_step_function_name }}(this){{ end }}
{{~ end ~}}
end