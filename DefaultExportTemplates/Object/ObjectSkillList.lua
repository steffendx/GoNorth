{{~ for skill in skills ~}}
this:learn_skill("{{ skill.fields.ScriptName.value }}")
{{~ end ~}}