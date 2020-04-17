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