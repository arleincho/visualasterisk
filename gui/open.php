<?php


    $result = array();
	$result['error'] = "";
	$result['msg'] = "";


	$fileElementName = 'open_file';
	if(!empty($_FILES[$fileElementName]['error']))
	{
		switch($_FILES[$fileElementName]['error'])
		{

			case '1':
				$result['error'] = 'The uploaded file exceeds the upload_max_filesize directive in php.ini';
				break;
			case '2':
				$result['error'] = 'The uploaded file exceeds the MAX_FILE_SIZE directive that was specified in the HTML form';
				break;
			case '3':
				$result['error'] = 'The uploaded file was only partially uploaded';
				break;
			case '4':
				$result['error'] = 'No file was uploaded.';
				break;

			case '6':
				$result['error'] = 'Missing a temporary folder';
				break;
			case '7':
				$result['error'] = 'Failed to write file to disk';
				break;
			case '8':
				$result['error'] = 'File upload stopped by extension';
				break;
			case '999':
			default:
				$result['error'] = 'No error code avaiable';
		}
	}
    elseif(empty($_FILES[$fileElementName]['tmp_name']) || $_FILES[$fileElementName]['tmp_name'] == 'none')
	{
		$result['error'] = 'No file was uploaded..';
	}
    else
	{
			$result['msg'] .= " File Name: " . $_FILES[$fileElementName]['name'] . ", ";
			$result['msg'] .= " File Size: " . @filesize($_FILES[$fileElementName]['tmp_name']);


            $ivr_file = fopen($_FILES[$fileElementName]['tmp_name'], 'rt');
            if ($ivr_file == false)
            {
                $result['error'] = "CANNOT OPEN FILE";
                return false;
            }
            $conn_len = intval(fread($ivr_file, 10));
            $entities_len = intval(fread($ivr_file, 10));
            $vars_len = intval(fread($ivr_file, 10));

            $result['connections'] = json_decode(fread($ivr_file, $conn_len));
            $result['entities'] = json_decode(fread($ivr_file, $entities_len));
            $result['vars'] = json_decode(fread($ivr_file, $vars_len));

            fclose($ivr_file);


			//for security reason, we force to remove all uploaded file
			@unlink($_FILES[$fileElementName]);
	}
    echo json_encode($result);

