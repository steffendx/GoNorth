{{~ for cur_event in daily_routine_events
    if !cur_event.is_enabled_by_default
        continue
    end
~}}
{{~ if cur_event.movement_target_export_name_or_name ~}}
this:add_game_time_event_position({{ cur_event.earliest_time.hours }}, {{ cur_event.earliest_time.minutes }}, {{ cur_event.latest_time.hours }}, {{ cur_event.latest_time.minutes }}, "{{ cur_event.movement_target_export_name_or_name }}", "SlowWalk", "{{ if cur_event.target_state }}{{ cur_event.target_state }}{{ else }}Idle{{ end }}"{{ if cur_event.script_function_name }}, "{{ cur_event.script_function_name }}"{{ end }})
{{~ else if cur_event.script_function_name ~}}
this:add_game_time_event_script_function({{ cur_event.earliest_time.hours }}, {{ cur_event.earliest_time.minutes }}, {{ cur_event.latest_time.hours }}, {{ cur_event.latest_time.minutes }}, "{{ cur_event.script_function_name }}", false)
{{~ end ~}}
{{~ end ~}}