{{-
    $questState = "QUEST_STATE_NOT_STARTED"
    if action.target_state == "InProgress"
        $questState = "QUEST_STATE_IN_PROGRESS"
    else if(action.target_state == "Success")
       $questState = "QUEST_STATE_SUCCESS"
    else if(action.target_state == "Failed")
       $questState = "QUEST_STATE_FAILED"
    end
-}}
BaseDialog_SetQuestState({{ action.quest.fields.Id.value }}, {{ $questState }})