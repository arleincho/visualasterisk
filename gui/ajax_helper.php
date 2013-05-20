<?php


//error_reporting(0);


$action = $_POST['action'];

switch($action)
{
    case 'configure_database':
        configure_database();
        break;
}

function configure_database()
{
    $result = array();
    extract($_POST);
    $db = mysql_connect($host, $username, $password);
    if($db === false)
    {
        $result['result'] = 'error';
        $result['message'] = mysql_error();

        echo json_encode($result);
        return;
    }
    if(!mysql_select_db($database))
    {
        $result['result'] = 'error';
        $result['message'] = mysql_error();
        mysql_close();
        echo json_encode($result);
        return;
    }
    $result['result'] = 'success';
    $result['message'] = 'successfully connected to database';
    mysql_close();
    echo json_encode($result);
}