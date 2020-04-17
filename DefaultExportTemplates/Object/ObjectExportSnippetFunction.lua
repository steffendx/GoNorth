{{~ if snippet_function.parent_preview_text && snippet_function.parent_preview_text != "" ~}}
-- Parent Nodes: {{ snippet_function.parent_preview_text }} 
{{~ end ~}}
function {{ snippet_function.function_name }}(this){{~ if snippet_function.code | string.contains "playerNpc" }}
    local playerManager = PlayerManager:new()
    local playerNpc = playerManager:get_local_player()
    {{~ end ~}}

    {{ snippet_function.code | indent_multiline }}
end

