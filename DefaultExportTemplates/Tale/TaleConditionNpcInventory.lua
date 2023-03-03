{{- if condition.is_equipped_check -}}
BaseNpc_GetEquippedItemQuantityInInventory(this, "{{ condition.selected_item.fields.ScriptName.value }}") {{ condition.operator }} {{ condition.quantity }}
{{- else -}}
BaseNpc_GetItemQuantityInInventory(this, "{{ condition.selected_item.fields.ScriptName.value }}") {{ condition.operator }} {{ condition.quantity }}
{{- end -}}