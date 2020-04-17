{{-
    $waitUnitMultiplyRealTime = null
    if action.wait_unit == "Seconds"
        $waitUnitMultiplyRealTime = 1000
    else if(action.wait_unit == "Minutes")
        $waitUnitMultiplyRealTime = 1000 * 60
    end
    
    $waitUnitMultiplyGameTime = null
    if action.wait_unit == "Hours"
        $waitUnitMultiplyGameTime = 60
    else if(action.wait_unit == "Days")
        $waitUnitMultiplyGameTime = 60 * 24
    end
-}}
{{~ if action_node.child_node && action_node.child_node.node_step_function_name != "" ~}}
{{~ if action.wait_type == "RealTime" ~}}this:set_timeout("{{ action_node.child_node.node_step_function_name }}", {{ action.wait_amount }}{{ if $waitUnitMultiplyRealTime }} * {{ $waitUnitMultiplyRealTime }}{{ end }}, false){{~ end ~}}
{{~ if action.wait_type == "GameTime" ~}}this:set_game_timeout("{{ action_node.child_node.node_step_function_name }}", {{ action.wait_amount }}{{ if $waitUnitMultiplyGameTime }} * {{ $waitUnitMultiplyGameTime }}{{ end }}, false){{~ end ~}}
{{~ end ~}}

{{~ if action.direct_continue_function ~}}{{ action.direct_continue_function }}(this){{~ end ~}}