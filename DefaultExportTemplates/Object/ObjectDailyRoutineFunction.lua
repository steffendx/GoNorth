{{~ if daily_routine_function.parent_preview_text && daily_routine_function.parent_preview_text != "" ~}}
-- Parent Nodes: {{ daily_routine_function.parent_preview_text }}
{{~ end ~}}
function {{ daily_routine_function.function_name }}(this){{~ if daily_routine_function.code | string.contains "playerNpc" }}
    local playerManager = PlayerManager:new()
    local playerNpc = playerManager:get_local_player()
    {{~ end ~}}

    {{ daily_routine_function.code | indent_multiline }}
end

