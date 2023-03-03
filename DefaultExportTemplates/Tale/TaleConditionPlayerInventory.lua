{{- if condition.is_equipped_check -}}
BaseNpc_GetEquippedItemQuantityInInventory(playerNpc, "{{ condition.selected_item.fields.ScriptName.value }}") {{ condition.operator }} {{ condition.quantity }}
{{- else -}}
BaseNpc_GetItemQuantityInInventory(playerNpc, "{{ condition.selected_item.fields.ScriptName.value }}") {{ condition.operator }} {{ condition.quantity }}
{{- end -}}