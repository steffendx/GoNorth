local choice{{Tale_Node_Id}} = ChoiceDialogStep:new()
{{Tale_Choices_Start}}
{{Tale_Choice_HasCondition_Start}}if({{Tale_Choice_Condition}}) then
    {{Tale_Choice_HasCondition_End}}choice{{Tale_Node_Id}}:add_choice("{{Tale_ChildNode_HasFunction_Start}}{{Tale_ChildNode_Function}}{{Tale_ChildNode_HasFunction_End}}", "{{Tale_Choice_Text_LangKey}}"{{Tale_Choice_IsNotRepeatable_Start}}, {{Tale_Node_Id}}, {{Tale_Choice_Id}}{{Tale_Choice_IsNotRepeatable_End}})  -- {{Tale_Choice_Text_Preview}}{{Tale_Choice_HasCondition_Start}}
end{{Tale_Choice_HasCondition_End}}{{Tale_Choices_End}}
dialogManager:add_dialog_step(choice{{Tale_Node_Id}})
