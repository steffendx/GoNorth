-- Event Script Name: {{DailyRoutine_ScriptName}}
-- Parent Nodes: {{DailyRoutine_Function_ParentPreview}}
function {{DailyRoutine_ScriptFunctionName}}(this)
    local playerManager = PlayerManager:new()
    local playerNpc = playerManager:get_local_player()

    {{DailyRoutine_ScriptContent}}
end

