{{- if condition.is_operator_primitive -}}
this:get_value("{{ condition.selected_field.name }}") {{ condition.operator }} {{ if condition.selected_field.type != "number"}}"{{ end }}{{ condition.compare_value }}{{ if condition.selected_field.type != "number"}}"{{ end }}
{{- end -}}
{{- if !condition.is_operator_primitive -}}
{{ condition.operator }}(this:get_value("{{ condition.selected_field.name }}"), "{{ condition.compare_value }}")
{{- end -}}