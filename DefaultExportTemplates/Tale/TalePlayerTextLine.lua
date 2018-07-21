{{Tale_ChildNode_HasFunction_Start}}local textLine{{Tale_Node_Id}} = TextDialogStep:new(playerNpc, "{{Tale_TextLine_LangKey}}") -- {{Tale_TextLine_Preview}}
textLine{{Tale_Node_Id}}:set_npc_function_trigger("{{Tale_ChildNode_Function}}")
dialogManager:add_dialog_step(textLine{{Tale_Node_Id}}){{Tale_ChildNode_HasFunction_End}}{{Tale_ChildNode_HasNoFunction_Start}}dialogManager:add_dialog_step(TextDialogStep:new(playerNpc, "{{Tale_TextLine_LangKey}}")) -- {{Tale_TextLine_Preview}}{{Tale_ChildNode_HasNoFunction_End}}
