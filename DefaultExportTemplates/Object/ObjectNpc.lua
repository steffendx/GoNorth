----- Includes ----------

include_file("_BaseNpc.lua")

include("Npc")

----- Init Functions ----

function OnInit(this)
    -- Values
    this:add_localized_string_value("Name", "{{ langkey npc.name }}")
    {{ npc.unused_fields | attribute_list }}
    {{~ if !inventory.empty? ~}}
    
    -- Inventory
    {{ inventory | inventory_list }}
    {{~ end ~}}
    {{~ if !skills.empty? ~}}
    
    -- Skills
    {{ skills | skill_list }}
    {{~ end ~}}
    {{~ if !daily_routine.events.empty? ~}}
    
    -- Daily routine
    {{ daily_routine.events | daily_routine_event_list }}
    {{~ end ~}}

    this:push_state("Idle")
    {{~ if dialog ~}}
    this:set_dialog_entry_function("{{ dialog.initial_function.function_name }}")
    {{~ end ~}}
end

{{~ if state_machine && state_machine.states && state_machine.states.size > 0 ~}}
------ States -----------
{{~ for cur_state in state_machine.states
    if cur_state.initial_function == null 
        continue
    end
}}
function {{ if cur_state.script_name != null && cur_state.script_name != "" 
        cur_state.script_name 
    else 
        cur_state.name 
    end}}(this)
    {{~ if cur_state.initial_function.code | string.contains "playerNpc" ~}}
    local playerManager = PlayerManager:new()
    local playerNpc = playerManager:get_local_player()
    
    {{~ end ~}}
    {{ cur_state.initial_function.code | indent_multiline }}
end
{{~ for state_function in cur_state.additional_functions ~}}

{{ state_function | state_machine_function }}
{{~ end ~}}

{{~ end ~}}
{{~ end ~}}

{{~ if dialog ~}}
------ Dialog -----------

{{~ for curFunction in dialog.all_functions ~}}

{{ curFunction | dialog_function }}

{{~ end ~}}
{{~ end ~}}

{{~ if !daily_routine.event_functions.empty? ~}}
------ Daily routine -----------

{{ daily_routine.event_functions | daily_routine_event_function_list }}
{{~ end ~}}