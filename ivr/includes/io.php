<?php
define('AGIRES_OK', 200);
class Params
{
    private static $instance;
    private function __construct()
    {
        for($i = 0; $i < $argc; $i++)
        {
            $name = "arg_{$i}";
            $this->$name->$argv[$i];
        }
    }
    public static function getInstance()
    {
        if (!self::$instance)
        {
            self::$instance = new Params();
        }

        return self::$instance;
    }
};
class IO
{
    private $in = NULL;
    private $out = NULL;
    private $params = null;
    private static $instance;
    public static function getInstance()
    {
        if (!self::$instance)
        {
            self::$instance = new IO();
        }

        return self::$instance;
    }
    private function IO()
    {
        $this->in = fopen("php://stdin", "r");
        $this->out = fopen("php://stdout", "w");
        $this->logger = Logger::getRootLogger();
        $this->params = Params::getInstance();

        $this->read_params();
    }
    private function read_params()
    {
        $read_data = '';
        $str = fgets($this->in);
        while ($str != "\n")
        {
            $read_data .= $str;
            $str = fgets($this->in);
        }
        $this->logger->debug("RX-> $read_data");
        $lines = explode("\n", $read_data);


        //$this->logger->debug($lines);
        foreach ($lines as $line)
        {
            if ($line == '')
                continue;
            $keyvals = explode(': ', $line);
            $key = substr($keyvals[0], 4);
            $this->params->$key = $keyvals[1];
        }
        //$this->logger->debug($this->params);
    }
    public function read()
    {
        $data = fgets($this->in);
        $this->logger->debug("RX-> $data");
        return $data;
    }
    public function write($data)
    {
        $this->logger->debug("TX-> $data");
        $data .= "\n";
        fwrite($this->out, $data);
        fflush($this->out);
    }
    public function exec($cmd)
    {
        $broken = array('code' => 500, 'result' => -1, 'data' => '');

        $this->write($cmd);
        $str = $this->read();

        $ret['code'] = substr($str, 0, 3);
        $str = trim(substr($str, 3));

        $ret['data'] = '';
        if ($ret['code'] != AGIRES_OK) // some sort of error
        {
            $ret['data'] = $str;
        }
        else // normal AGIRES_OK response
        {
            $parse = explode(' ', trim($str));
            $in_token = false;
            foreach ($parse as $token)
            {
                if ($in_token) // we previously hit a token starting with ')' but not ending in ')'
                {
                    $ret['data'] .= ' ' . trim($token, '() ');
                    if ($token{strlen($token) - 1} == ')')
                        $in_token = false;
                }
                elseif ($token{0} == '(')
                {
                    if ($token{strlen($token) - 1} != ')')
                        $in_token = true;
                    $ret['data'] .= ' ' . trim($token, '() ');
                }
                elseif (strpos($token, '='))
                {
                    $token = explode('=', $token);
                    $ret[$token[0]] = $token[1];
                }
                elseif ($token != '')
                    $ret['data'] .= ' ' . $token;
            }
            $ret['data'] = trim($ret['data']);
        }

        // log some errors
        if ($ret['result'] < 0)
            $this->conlog("$command returned {$ret['result']}");

        return $ret;
    }
};
