{{- if condition.is_operator_primitive -}}
playerNpc:get_value("{{ condition.selected_field.name }}") {{ condition.operator }} {{ if condition.selected_field.type != "number"}}"{{ end }}{{ condition.compare_value }}{{ if condition.selected_field.type != "number"}}"{{ end }}
{{- end -}}
{{- if !condition.is_operator_primitive -}}
{{ condition.operator }}(playerNpc:get_value("{{ condition.selected_field.name }}"), "{{ condition.compare_value }}")
{{- end -}}