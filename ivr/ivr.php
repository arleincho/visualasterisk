<?php
//error_reporting(0);
error_reporting(E_ALL);

require dirname($_SERVER['PHP_SELF']) . '/includes/log4php/Logger.php';
require dirname($_SERVER['PHP_SELF']) . '/includes/io.php';


class IVR
{
    private $last_node = 'hangup';
    public function IVR()
    {
        date_default_timezone_set('Asia/Calcutta');
        Logger::configure(dirname($_SERVER['PHP_SELF']) . '/ivr.properties');
        $this->logger = Logger::getRootLogger();
        $this->io = IO::getInstance();
        $this->params = Params::getInstance();
    }
    public function run()
    {
        //OPEN IVR FILE
        //and get info
        //$this->logger->debug($this->params);
        $ivr_file = fopen($this->params->arg_2, 'rt');
        if ($ivr_file == false)
        {
            $this->logger->error("CANNOT OPEN FILE '{$this->params->arg_2}'");
            return false;
        }
        $conn_len = intval(fread($ivr_file, 10));
        $entities_len = intval(fread($ivr_file, 10));
        $vars_len = intval(fread($ivr_file, 10));

        $this->connections = json_decode(fread($ivr_file, $conn_len));
        $this->entities = json_decode(fread($ivr_file, $entities_len));
        $this->vars = json_decode(fread($ivr_file, $vars_len));

        $this->logger->debug($this->vars);

        fclose($ivr_file);

        $current_node = $this->get_parent_node();
        if($current_node === false)
        {
            $this->logger->error('NO ROOT NODE FOUND. APPLICATION MUST HAVE EITHER DIAL OR ANSWER NODES');
            return false;
            exit;
        }
        $this->take_action($current_node);

        $digit = '';
        while($this->entities->$current_node->action != $this->last_node)
        {
            $next_node =  $this->get_next_node($current_node, $digit);
            $this->logger->debug($next_node);
            //echo "$next_node\n";

            if(trim($next_node) == '')
                break;

            $digit = $this->take_action($next_node);
            $current_node = $next_node;
        }
    }
    public function get_parent_node()
    {
        foreach ($this->entities as $key => $entity)
        {
            $entity->action = trim($entity->action);
            if ($entity->action == 'dial' || $entity->action == 'answer')
            {
                return $key;
            }
        }
        return false;
    }
    public function get_next_node($node, $label = '')
    {
        for ($i = 0; $i < $this->connections->length; $i++)
        {
            if($label == '')
            {
                if ($this->connections->$i->sourceid == $node)
                    return $this->connections->$i->targetid;
            }
            else
            {
                if ($this->connections->$i->sourceid == $node && $this->connections->$i->label == $label)
                    return $this->connections->$i->targetid;
            }
        }
    }
    public function take_action($node)
    {
        $this->logger->debug($this->entities->$node);
        switch (trim($this->entities->$node->action))
        {
            case 'answer':
                $this->io->exec('answer');
                break;
            case 'dial':
                //$this->io->exec('answer');
                break;
            case 'prompt':
                $path = $this->replace_vars($this->entities->$node->path);
                $escape_digits = $this->replace_vars($this->entities->$node->escape_digits);
                $this->io->exec("stream file {$path} '{$escape_digits}'");
                break;
            case 'wait4digits':
                $this->logger->debug('->'. $this->entities->$node->path .'<-');
                $path = $this->replace_vars($this->entities->$node->path);
                $this->logger->debug($path);
                $expected_digits = $this->replace_vars($this->entities->$node->expected_digits);
                $retries = $this->replace_vars($this->entities->$node->retries);
                $retry_timeout = $this->replace_vars($this->entities->$node->retry_timeout);
                return $this->play_file($path, $expected_digits, $retries, $retry_timeout);
                //$result = $this->io->exec("stream file {$this->entities->$node->path} '{$this->entities->$node->expected_digits}'");
                //return chr($result['result']);
                break;
            case 'record':
                $record_path = $this->replace_vars($this->entities->$node->record_path);
                $escape_digits = $this->replace_vars($this->entities->$node->escape_digits);
                $timeout = $this->replace_vars($this->entities->$node->timeout);
                $this->io->exec("record file '{$record_path}' wav '{$escape_digits}' {$timeout}");
                break;
            case 'assign':
                $name = $this->entities->$node->name;
                $value = $this->replace_vars($this->entities->$node->value);
                $this->vars->$name = $value;
                break;
            case 'execute':
                $command = $this->replace_vars($this->entities->$node->command);
                $this->io->exec('exec ' . $command);
                break;
            case 'hangup':
                $this->io->exec('hangup');
                break;
            default:
                $this->logged->debug('unsupprted');
        }
        return '';
    }
    function play_file($file, $digits_expected = '', $retries = 3, $timeout = 5)
    {

        $this->logger->debug("file:$file, digits expected:$digits_expected, retries:$retries, timeout:$timeout");
        if($digits_expected == '')
            $retries = 0;

        for($retry_count = 0; ; $retry_count++)
        {
            $ret = $this->io->exec("stream file $file '0123456789*#'");
            //$this->logger->debug("return " . print_r($ret, true) . " retry count : $retry_count");

            if($ret['result'] == -1)
            {
                $this->logger->info("Error");
                //return "";
              //  $this->exit_routine();
                exit;
            }
            else if($ret['result'] == 0)
            {
                if($retries == 0)
                    return -1;

                $digit_pressed = $this->wait_for_digit($digits_expected, $timeout);
                if($digit_pressed >= 0)
                {
                    return $digit_pressed;
                }

                if($retry_count >= ($retries - 1))
                {
                    $ret = $this->io->exec("stream file " . PROMPTS . "retries_exceeded '0123456789*#'");
                    exit;
                }
                continue;
            }
            else
            {
                $digit_pressed = chr($ret['result']);

                if($digits_expected == '')
                {
                    //we expect no digit
                    //therefore just return
                    return $digit_pressed;
                }
                if(strpbrk($digit_pressed, $digits_expected) === false)
                {
                    //invalid digit pressed
                    $ret = $this->io->exec("stream file " . PROMPTS . "invalid_digit '0123456789*#'");
                    continue;
                }
                else
                {
                    return $digit_pressed;
                }
            }
        }
    }
    function wait_for_digit($digits_expected, $timeout)
    {
        $ret = $this->io->exec("wait for digit " . $timeout * 1000);
        //$this->logger->debug("return " . print_r($ret, true));

        if($ret['result'] == -1)
        {
            $this->logger->info("Error");
            exit;
        }
        else if($ret['result'] == 0)
        {
            return -1;
        }
        else
        {
            $digit_pressed = chr($ret['result']);
            if(strpbrk($digit_pressed, $digits_expected) === false)
            {
                //invalid digit pressed
                $ret = $this->io->exec("stream file " . PROMPTS . "invalid_digit '0123456789*#'");
            }
            else
            {
                return $digit_pressed;
            }
        }
    }
    function replace_vars($string)
    {
        $count  = preg_match_all('/{[^}]*}/', $string, $matches);
        if($count == 0)
        {
            return $string;
        }
        $count = count($matches[0]);
        $this->logger->debug(print_r($matches, true));
        for($i = 0; $i < $count; $i++)
        {
            $needle = trim($matches[0][$i], '{}');
            $string = str_replace($matches[0][$i], $this->vars->$needle,$string);
        }
        return $string;
    }
}

$ivr = new IVR();
$ivr->run();


