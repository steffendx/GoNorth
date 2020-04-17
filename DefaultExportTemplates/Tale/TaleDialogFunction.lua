{{~ if dialog_function.parent_preview_text != "" ~}}
-- Parent Nodes: {{ dialog_function.parent_preview_text }}
{{~ end ~}}
function {{ dialog_function.function_name }}(this)
    {{~ if dialog_function.code | string.contains "dialogManager" ~}}
    local dialogManager = DialogManager:new()
    {{~ end ~}}
    {{~ if dialog_function.code | string.contains "playerNpc" ~}}
    local playerManager = PlayerManager:new()
    local playerNpc = playerManager:get_local_player():get_npc()
    {{~ end ~}}{{~ if (dialog_function.code | string.contains "dialogManager") || (dialog_function.code | string.contains "playerNpc") ~}}
    
    {{~ end ~}}
    {{ dialog_function.code | indent_multiline}}
end

