<?php

    $last_node = "hangup";

    $return = array();

    $connections = json_decode($_POST['connections']);
    $entities = json_decode($_POST['entities']);

    //print_r($connections);
    //print_r($entities);
    $program = "";

    $current_node = get_parent_node($entities);
    if($current_node === false)
    {
        echo json_encode($return);
        exit;
    }
    update_program($current_node);

    while($entities->$current_node->action != $last_node)
    {
        $next_node =  get_next_node($connections, $current_node);
        //echo "$next_node\n";


        if(trim($next_node) == '')
            break;

        update_program($next_node);
        $current_node = $next_node;
    }
    $return['program'] = $program;
    $return['result'] = 'success';

    echo json_encode($return);
    exit;

function get_parent_node($entities)
{
    global $return;
    foreach($entities as $key => $entity)
    {
        $entity->action = trim($entity->action);
        if($entity->action == 'dial' || $entity->action == 'answer')
        {
            return $key;
        }
    }
    $return['result'] = 'error';
    $return['error'] = "No root node found. Application must have either dial or answer nodes.";
    return false;
}
function get_next_node($connections, $node)
{
    for($i = 0; $i < $connections->length; $i++)
    {
        if($connections->$i->sourceid == $node)
            return $connections->$i->targetid;
    }
}
function update_program($node)
{
    global $program;
    global $entities;


    switch(trim($entities->$node->action))
    {
    case 'answer':
        $program .= "answer\n";
        break;
    case 'dial':
        $program .= "dial\n";
        break;
    case 'prompt':
        $program .= "stream file '{$entities->$node->path}' '{$entities->$node->escape_digits}'\n";
        break;
    case 'record':
        $program .= "record file '{$entities->$node->record_path}' wav '{$entities->$node->escape_digits}' {$entities->$node->timeout}\n";
        break;
    case 'hangup':
        $program .= "hangup\n";
        break;
    }
}

?>
