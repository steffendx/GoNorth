{{~ if state_function.parent_preview_text && state_function.parent_preview_text != "" ~}}
-- Parent Nodes: {{ state_function.parent_preview_text }}
{{~ end ~}}
function {{ state_function.function_name }}(this){{~ if state_function.code | string.contains "playerNpc" }}
    local playerManager = PlayerManager:new()
    local playerNpc = playerManager:get_local_player()
    {{~ end ~}}

    {{ state_function.code | indent_multiline }}
end

