{{ action_node.content }}
{{~ if action_node.child_node && !action_node.child_node.node_step_function_was_used && action_node.child_node.node_step_function_name != "" ~}}{{ action_node.child_node.node_step_function_name }}(this){{~ end ~}}