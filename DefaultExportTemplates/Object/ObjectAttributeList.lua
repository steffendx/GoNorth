{{~ for cur_field in fields ~}}
{{~ if cur_field.type == "number" ~}}
this:add_number_value("{{ cur_field.name }}", {{ cur_field.value }})
{{~ else ~}}
this:add_localized_string_value("{{ cur_field.name }}", "{{ langkey cur_field.value }}")
{{~ end ~}}
{{~ end ~}}