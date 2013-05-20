<html>
    <head>
        <title>IVR Builder</title>
        <link href="js/libs/jquery-ui-1.8.21.custom/css/great/jquery-ui-1.8rc3.custom.css" rel="stylesheet" type="text/css" />
        <link href="css/ivr.css" rel="stylesheet" type="text/css" />
        <script type="text/javascript" src="js/libs/jquery-ui-1.8.21.custom/js/jquery-1.7.2.min.js"></script>
        <script type="text/javascript" src="js/libs/ajaxfileupload.js"></script>
        <script type="text/javascript" src="js/libs/jquery-ui-1.8.21.custom/js/jquery-ui-1.8.21.custom.min.js"></script>
        <script type="text/javascript" src="js/libs/easyTooltip.js"></script>
        <script type="text/javascript" src="js/libs/jquery.jsPlumb-1.3.10-all.js"></script>
        <script type="text/javascript" src="js/ivr.js"></script>
    </head>
    <body>
        <div id="ivr_body">
            <div id="toolbar">
                <div action="answer" class="icon source unique"><img src="images/answer.png" title="answer"/></div>
                <div action="dial"   class="icon source unique"><img src="images/dial.png" title="dial"/></div>
                <div action="hangup" class="icon target unique"><img src="images/hangup.png" title="hangup"/></div>
                <div action="prompt" class="icon source target"><img src="images/prompt.png" title="prompt"/></div>
                <div action="record" class="icon source target"><img src="images/record.png" title="record"/></div>
                <div action="wait4digits" class="icon source target"><img src="images/wait4digit.png" title="prompt for digits"/></div>
                <div action="execute" class="icon source target"><img src="images/execute.png" title="Execute AGI Command"/></div>
                <div action="assign" class="icon source target"><img src="images/assign.png" title="Assign new value to a variable"/></div>
                <!-- <div action="group" class="icon source target"><img src="images/wait4digit.png" title="noop"/></div> -->
                <div id="new"><img src="images/new.png" title="new"/></div>
                <div id="open"><img src="images/open.png" title="open"/></div>
                <div id="save"><img src="images/save.png" title="save"/></div>
                <div id="compile"><img src="images/compile.png" title="compile"/></div>
                <div id="variables"><img src="images/variables.png" title="define variables"/></div>
                <div id="configure_database"><img src="images/database.png" title="Configure Database"/></div>
            </div>
            <div id="gui">
            </div>
        </div>
        <div style="position:absolute; left:-9999px;">
                <input type="file" id="open_file" name="open_file">
           <?php /* <form name="form" action="" method="POST" enctype="multipart/form-data">
            </form> */ ?>
        <div>
        <div id="prompt_info" class="hidden dialog">
            <div>Prompt File Path</div>
            <div><input type="text" name="prompt_path" /></div>
            <br>
            <div>Escpae Digits</div>
            <div><input type="text" name="escape_digits" /></div>
        </div>
        <div id="confirm_new" class="hidden dialog">
            There may be unsaved data.<br>
            All your unsaved data will be lost.<br>
            Are you sure about this?
        </div>
        <div id="confirm_open" class="hidden dialog">
            Are you sure about this? <br>All your unsaved data will be lost.
        </div>
        <div id="wait4digits" class="hidden dialog">
            <div>Prompt File Path (optional)</div>
            <div><input type="text" name="prompt_path" /></div>
            <br>
            <div>Min no of digits expected</div>
            <div><input type="text" name="min_digits" /></div>
            <br>
            <div>Max no of digits expected</div>
            <div><input type="text" name="max_digits" /></div>
            <br>
            <div>Expected Digits</div>
            <div><input type="text" name="expected_digits" /></div>
            <br>
            <div>Retries</div>
            <div><input type="text" name="retries" /></div>
            <br>
            <div>Retry timeout (in seconds)</div>
            <div><input type="text" name="retry_timeout" /></div>
        </div>
        <div id="record" class="hidden dialog">
            <div>Record File Path</div>
            <div><input type="text" name="record_path" /></div>
            <br>
            <div>Escape digits</div>
            <div><input type="text" name="escape_digits" /></div>
            <br>
            <div>Timeout (in seconds)</div>
            <div><input type="text" name="timeout" /></div>
        </div>
        <div id="execute" class="hidden dialog">
            <div>Command with Parameters</div>
            <div><input type="text" name="command" /></div>
            <br>
        </div>
        <div id="on_what_digit" class="hidden dialog">
            <div>Digit</div>
            <div><input type="text" name="digit" /></div>
        </div>
        <div id="assign" class="hidden dialog">
            <select name='name'></select>
            <div><input type="text" name="value" /></div>
        </div>
        <div class="hidden">
            <form id ="save_form" method="post" action="save.php">
                <input type="text" name="connections" />
                <input type="text" name="entities" />
                <input type="text" name="vars" />
            </form>
        </div>
        <div id="variables_dialog" class="hidden">
        </div>
        <div id="configure_database_dialog" class="hidden dialog">
            <div>HOST</div>
            <div><input name="host" /></div>
            <div>USER NAME</div>
            <div><input name="username" /></div>
            <div>PASSWORD</div>
            <div><input name="password" /></div>
            <div>DATABASE</div>
            <div><input name="database" /></div>
        </div>
    </body>
</html>

