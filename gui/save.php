<?php
    $connections = $_POST['connections'];
    $entities = $_POST['entities'];
    $vars     = $_POST['vars'];

    $connection_len = strlen($connections);
    $entities_len = strlen($entities);
    $vars_len   = strlen($vars);


    $file =  str_pad($connection_len, 10);
    $file .= str_pad($entities_len,   10);
    $file .= str_pad($vars_len,   10);
    $file .= $connections;
    $file .= $entities;
    $file .= $vars;

    header("Content-Type: text/plain");
    header("Content-disposition: attachment; filename=flow.ivr");
    header("Content-Transfer-Encoding: binary");
    header("Pragma: no-cache");
    header("Expires: 0");

    echo $file;
    exit;