{{-
    $questState = "QUEST_STATE_NOT_STARTED"
    if condition.quest_state == "InProgress"
        $questState = "QUEST_STATE_IN_PROGRESS"
    else if(condition.quest_state == "Success")
       $questState = "QUEST_STATE_SUCCESS"
    else if(condition.quest_state == "Failed")
       $questState = "QUEST_STATE_FAILED"
    end
-}}
BaseDialog_GetQuestState({{ condition.quest.fields.Id.value }}) == {{ $questState }}