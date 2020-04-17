{{ for cur_function in daily_routine_functions }}
{{ cur_function | daily_routine_event_function }}
{{ end }}