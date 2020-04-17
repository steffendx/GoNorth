{{- if condition.npc_alive_state == "Alive" -}}
BaseNpc_IsAlive({{ condition.npc.fields.Id.value }})
{{- end -}}
{{- if condition.npc_alive_state == "Dead" -}}
BaseNpc_IsDead({{ condition.npc.fields.Id.value }})
{{- end -}}