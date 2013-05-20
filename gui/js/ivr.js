$(function()
    {
        file_open = false;      //file being opened or not

        $(".icon").draggable({
            helper:'clone'
        });

        $("#gui").droppable({
            accept: ".icon",
            drop: function(event,ui){
                while($("#ok" + id).size() != 0)
                    id++;
                $(this).append($(ui.helper).clone().removeClass("icon").removeClass("ui-draggable").removeClass("ui-draggable-dragging").addClass("dropped_icon").attr("id", "ok" + id));

                $("#ok" + id).append("<div class='endpoint' id='" + 'ep_' + id + "'></div>");

                if($("#ok" + id).hasClass("source"))
                {
                    jsPlumb.makeSource('ep_' + id, {
                        //anchor:"BottomCenter",
                        parent: 'ok' + id,
                        anchor:"Continuous",
                        connector:[ "Flowchart", {  } ],
                        //connector:[ "Flowchart", { stub:[40, 60], gap:10 } ],
                        connectorStyle : {
                            strokeStyle:"#f00"
                            ,
                            lineWidth: 1
                        //,outlineWidth: 2
                        //,outlineColor:"#D2E0E6"
                        },
                        connectorHoverStyle : {
                            lineWidth:4,
                            strokeStyle:"#2e2aF8"
                        },
                        maxConnections:-1
                    });
                }
                if($("#ok" + id).hasClass("target"))
                {
                    jsPlumb.makeTarget('ok' + id, {
                        anchor:"Continuous",
                        connector:[ "Flowchart", {  } ],
                        //connector:[ "Flowchart", { stub:[40, 60], gap:10 } ],
                        maxConnections:-1
                    });
                }

                jsPlumb.draggable(jsPlumb.getSelector('#ok' + id), {
                    containment : "#gui"
                });


                if($("#ok" + id).hasClass("unique"))
                {
                    $(".icon[action='" + $("#ok" + id).attr("action") + "']").draggable('disable');
                }


                applyjs($("#ok" + id));
                id++;
            }
        });
        var id=1;

        jsPlumb.importDefaults({
            // default drag options
            DragOptions : {
                cursor: 'pointer',
                zIndex:2000
            },
            // default to blue at one end and green at the other
            PaintStyle : {
                strokeStyle:'#666'
            },
            EndpointStyles : [{
                fillStyle:'#225588'
            }, {
                fillStyle:'#558822'
            }],
            Endpoint : ["Dot", {
                radius:1
            }],
            ConnectionOverlays : [
            [ "Arrow", {
                location:0.3,
                foldback:0.8,
                width: 10,
                heigth: 4
            } ]
            /*,
            [ "Label", {
                location:0.8,
                id:"label",
                cssClass:"aLabel"
            }]*/
            ]
        });
        jsPlumb.bind("contextmenu", function(conn, originalEvent)
        {
            if (confirm("Delete this connection ?"))
            {
                delete_connection(conn);
            }
        });
        jsPlumb.bind("jsPlumbConnection", function(info, originalEvent)
        {
            /*
            //source and tagret ids should not be same
            if(info.connection.sourceId == info.connection.targetId)
            {
               // console.log ("source and target ids are same");
                jsPlumb.detach(info.connection);
            }*/
            if($('#' + info.connection.sourceId).attr('action') == "wait4digits")
            {
                current_connection = info.connection;

                if(file_open)
                {
                    info.connection.addOverlay([ "Label", {
                        location:0.1,
                        id:"label",
                        cssClass:"aLabel",
                        'label' : label
                    }]);
                    return;
                }
                $("#on_what_digit").dialog({
                    bgiframe: true,
                    modal: true,
                    width: 300,
                    height: 180,
                    title: 'On Digit Press...',
                    buttons :
                    {
                        'Cancel' : function()
                        {
                            $(this).dialog('close');
                        },
                        'Save' : function()
                        {
                            info.connection.addOverlay([ "Label", {
                                location:0.1,
                                id:"label",
                                cssClass:"aLabel",
                                label : $(this).find("input[name='digit']").val()
                            }]);
                            $(this).dialog('close');
                        }
                    }
                });
            }
        });

        $("#toolbar img").easyTooltip();


        $("#compile").click(function()
        {
            compile("compile");
        });

        $("#save").click(function()
        {
            compile("save");
        });

        $("#open").click(function()
        {
            $("input[name='open_file']").trigger('click');
        });

        $("input[name='open_file']").change(function(){
            open();
        });

        $("#new").click(function()
        {
            new_app();
        });

        $("#variables").click(function()
        {
            variables();
        });
        vars = {};
        vars.length = 0;

        $("#configure_database").click(function()
        {
            configure_database();
        });
    });
function addEntity(object, entity)
{
    eval( 'object.' + entity + "=Object()");
    eval( 'object.' + entity + ".id='" + entity + "'")
    eval( 'object.' + entity + ".class='" + $("#" + entity).attr("class") + "'")
    element = $("#" + entity);

    pos = element.position();
    eval( 'object.' + entity + ".x='" + pos.left + "'")
    eval( 'object.' + entity + ".y='" + pos.top + "'")

    action = element.attr("action");
    eval( 'object.' + entity + ".action='" + action + "'")
    if(action == "prompt")
    {
        if(element.attr("prompt_path") == undefined || element.attr("prompt_path") == '')
        {
            element.addClass("compile_error");
            alert("please define prompt path");
            return false;
        }
        eval( 'object.' + entity + ".path='" + element.attr("prompt_path") + "'");
        eval( 'object.' + entity + ".escape_digits='" + element.attr("escape_digits") + "'");
    }
    else if(action == "wait4digits")
    {
        if(element.attr("prompt_path") != undefined || element.attr("prompt_path") != '')
        {
            eval( 'object.' + entity + ".path='" + element.attr("prompt_path") + "'");
        }
        if(element.attr("expected_digits") == undefined || element.attr("expected_digits") == '')
        {
            element.addClass("compile_error");
            alert("please provide expected digits");
            return false;
        }
        if(element.attr("min_digits") == undefined || element.attr("min_digits") == '')
        {
            element.addClass("compile_error");
            alert("please provide min digits");
            return false;
        }
        if(element.attr("max_digits") == undefined || element.attr("max_digits") == '')
        {
            element.addClass("compile_error");
            alert("please provide max digits");
            return false;
        }
        if(element.attr("retries") == undefined || element.attr("retries") == '')
        {
            element.addClass("compile_error");
            alert("please provide no of retries");
            return false;
        }
        if(element.attr("retry_timeout") == undefined || element.attr("retry_timeout") == '')
        {
            element.addClass("compile_error");
            alert("please retry timeout");
            return false;
        }
        eval( 'object.' + entity + ".min_digits='" + element.attr("min_digits") + "'");
        eval( 'object.' + entity + ".max_digits='" + element.attr("max_digits") + "'");
        eval( 'object.' + entity + ".retries='" + element.attr("retries") + "'");
        eval( 'object.' + entity + ".retry_timeout='" + element.attr("retry_timeout") + "'");
        eval( 'object.' + entity + ".expected_digits='" + element.attr("expected_digits") + "'");
    }
    else if(action == "record")
    {
        if(element.attr("record_path") == undefined || element.attr("record_path") == '')
        {
            element.addClass("compile_error");
            alert("please provide record path");
            return false;
        }
        if(element.attr("escape_digits") == undefined || element.attr("escape_digits") == '')
        {
            element.addClass("compile_error");
            alert("please provide escape digits");
            return false;
        }
        if(element.attr("timeout") == undefined || element.attr("timeout") == '')
        {
            element.addClass("compile_error");
            alert("please provide timeout");
            return false;
        }


        eval( 'object.' + entity + ".record_path='" + element.attr("record_path") + "'");
        eval( 'object.' + entity + ".escape_digits='" + element.attr("escape_digits") + "'");
        eval( 'object.' + entity + ".timeout='" + element.attr("timeout") + "'");
    }
    else if(action == "execute")
    {
        if(element.attr("command") == undefined || element.attr("command") == '')
        {
            element.addClass("compile_error");
            alert("please provide command name");
            return false;
        }
        eval( 'object.' + entity + ".command='" + element.attr("command") + "'");
    }
    else if(action == "assign")
    {
        if(element.attr("name") == undefined || element.attr("name") == '')
        {
            element.addClass("compile_error");
            alert("please provide variable name");
            return false;
        }
        eval( 'object.' + entity + ".name='" + element.attr("name") + "'");
        eval( 'object.' + entity + ".value='" + element.attr("value") + "'");
    }
    return true;
}
function applyjs(element)
{
    element.bind("contextmenu", function(){
        if (confirm("Delete  this element ?"))
        {
            var source_conns = jsPlumb.getConnections({
                source:$(this).attr('id')
            });
            for(i = 0; i < source_conns.length; i++)
            {
                delete_connection(source_conns[i]);
            }
            var target_conns = jsPlumb.getConnections({
                target:$(this).attr('id')
            });
            for(i = 0; i < target_conns.length; i++)
            {
                delete_connection(target_conns[i]);
            }
            $(this).remove();
        }
    });
    if(element.attr("action") == "prompt")
    {
        prompt(element);
    }
    else if(element.attr("action") == "wait4digits")
    {
        wait4digits(element);
    }
    else if(element.attr("action") == "record")
    {
        record(element);
    }
    else if(element.attr("action") == "execute")
    {
        execute(element);
    }
    else if(element.attr("action") == "assign")
    {
        assign(element);
    }
}
function wait4digits(element)
{
    element.bind("dblclick", function ()
    {
        $("#wait4digits").attr("parentid", $(this).attr("id"));
        val = $(this).attr("prompt_path");
        if(val == undefined)
        {
            val = "";
        }
        $("#wait4digits").find("input[name='prompt_path']").val(val);

        val = $(this).attr("expected_digits");
        if(val == undefined)
        {
            val = "1234567890*#";
        }
        $("#wait4digits").find("input[name='expected_digits']").val(val);

        val = $(this).attr("min_digits");
        if(val == undefined)
        {
            val = "1";
        }
        $("#wait4digits").find("input[name='min_digits']").val(val);

        val = $(this).attr("max_digits");
        if(val == undefined)
        {
            val = "1";
        }
        $("#wait4digits").find("input[name='max_digits']").val(val);

        val = $(this).attr("retries");
        if(val == undefined)
        {
            val = "3";
        }
        $("#wait4digits").find("input[name='retries']").val(val);

        val = $(this).attr("retry_timeout");
        if(val == undefined)
        {
            val = "5";
        }
        $("#wait4digits").find("input[name='retry_timeout']").val(val);


        $("#wait4digits").dialog({
            bgiframe: true,
            modal: true,
            width: 600,
            height: 360,
            title: 'Prompt for digits properties ...',
            buttons :
            {
                'Cancel' : function()
                {
                    $(this).dialog('close');
                },
                'Save' : function()
                {
                    $("#" + $(this).attr("parentid")).attr("prompt_path", $(this).find("input[name='prompt_path']").val());
                    $("#" + $(this).attr("parentid")).attr("expected_digits", $(this).find("input[name='expected_digits']").val());
                    $("#" + $(this).attr("parentid")).attr("min_digits", $(this).find("input[name='min_digits']").val());
                    $("#" + $(this).attr("parentid")).attr("max_digits", $(this).find("input[name='max_digits']").val());
                    $("#" + $(this).attr("parentid")).attr("retries", $(this).find("input[name='retries']").val());
                    $("#" + $(this).attr("parentid")).attr("retry_timeout", $(this).find("input[name='retry_timeout']").val());

                    $(this).dialog('close');
                }
            }
        });
    });
}
function record(element)
{
    element.bind("dblclick", function ()
    {
        $("#record").attr("parentid", $(this).attr("id"));
        val = $(this).attr("record_path");
        if(val == undefined || val == '')
        {
            val = '';
        }
        $("#record").find("input[name='record_path']").val(val);

        val = $(this).attr("eescape_digits");
        if(val == undefined)
        {
            val = "1234567890*#";
        }
        $("#record").find("input[name='eescape_digits']").val(val);

        val = $(this).attr("timeout");
        if(val == undefined)
        {
            val = "30";
        }
        $("#record").find("input[name='timeout']").val(val);

        $("#record").dialog({
            bgiframe: true,
            modal: true,
            width: 500,
            height: 360,
            title: 'Record properties ...',
            buttons :
            {
                'Cancel' : function()
                {
                    $(this).dialog('close');
                },
                'Save' : function()
                {
                    $("#" + $(this).attr("parentid")).attr("record_path", $(this).find("input[name='record_path']").val());
                    $("#" + $(this).attr("parentid")).attr("escape_digits", $(this).find("input[name='escape_digits']").val());
                    $("#" + $(this).attr("parentid")).attr("timeout", $(this).find("input[name='timeout']").val());

                    $(this).dialog('close');
                }
            }
        });
    });
}
function prompt(element)
{
    element.bind("dblclick", function ()
    {
        $("#prompt_info").attr("parentid", $(this).attr("id"));
        val = $(this).attr("prompt_path");
        if(val == undefined)
        {
            val = "";
        }
        $("#prompt_info").find("input[name='prompt_path']").val(val);

        val = $(this).attr("escape_digits");
        if(val == undefined)
        {
            val = "1234567890*#";
        }
        $("#prompt_info").find("input[name='escape_digits']").val(val);

        $("#prompt_info").dialog({
            bgiframe: true,
            modal: true,
            width: 500,
            height: 230,
            title: 'Prompt properties ...',
            buttons :
            {
                'Cancel' : function()
                {
                    $(this).dialog('close');
                },
                'Save' : function()
                {
                    $("#" + $(this).attr("parentid")).attr("prompt_path", $(this).find("input[name='prompt_path']").val());
                    $("#" + $(this).attr("parentid")).attr("escape_digits", $(this).find("input[name='escape_digits']").val());

                    $(this).dialog('close');
                }
            }
        });
    });
}
function execute(element)
{
    element.bind("dblclick", function ()
    {
        $("#execute").attr("parentid", $(this).attr("id"));
        val = $(this).attr("command");
        if(val == undefined || val == '')
        {
            val = '';
        }
        $("#execute").find("input[name='command']").val(val);

        $("#execute").dialog({
            bgiframe: true,
            modal: true,
            width: 500,
            height: 360,
            title: 'Execute AGI Command ...',
            buttons :
            {
                'Cancel' : function()
                {
                    $(this).dialog('close');
                },
                'Save' : function()
                {
                    $("#" + $(this).attr("parentid")).attr("command", $(this).find("input[name='command']").val());
                    $(this).dialog('close');
                }
            }
        });
    });
}
function assign(element)
{
    element.bind("dblclick", function ()
    {
        $("#assign").attr("parentid", $(this).attr("id"));
        assign_name = $(this).attr("name");
        if(assign_name == undefined)
        {
            assign_name = '';
        }
        assign_value = $(this).attr("value");
        if(assign_value == undefined)
        {
            assign_value = '';
        }
        $("#assign").find("select[name='name']").html("");
        for(i = 0; i < vars.length; i++)
        {
            if(assign_name == eval("vars.name_" + i))
            {
                $("#assign").find("select[name='name']").append("<option selected='selected'>" + eval("vars.name_" + i) + "</option");
                if(assign_value == '')
                    $("#assign").find("input[name='value']").val(eval("vars.value_" + i));
                else
                    $("#assign").find("input[name='value']").val(assign_value);
            }
            else
            {
                $("#assign").find("select[name='name']").append("<option>" + eval("vars.name_" + i) + "</option");
            }
        }

        $("#assign").dialog({
            bgiframe: true,
            modal: true,
            width: 500,
            height: 360,
            title: 'Assign New value to a variable...',
            buttons :
            {
                'Cancel' : function()
                {
                    $(this).dialog('close');
                },
                'Save' : function()
                {
                    $("#" + $(this).attr("parentid")).attr("name", $(this).find("select[name='name']").val());
                    $("#" + $(this).attr("parentid")).attr("value", $(this).find("input[name='value']").val());
                    $(this).dialog('close');
                }
            }
        });
    });
}
function compile(action)
{
    $(".compile_error").removeClass("compile_error");
    var conns = jsPlumb.getConnections();

    if($(".dropped_icon").length == 0)
    {
        alert("ERROR : No elements exixsts\nPlease drag some elements into graph area and make connections between them");
        return false;
    }

    if(conns.length == 0)
    {
        alert("ERROR : No connection exixst\nPlease connect elements together");
        return false;
    }
    //var connections = Object();
    //connections.connection = Object();
    var connection=Object();
    var entities = Object();
    for(i = 0; i < conns.length; i++)
    {
        sourceid = conns[i].sourceId;
        targetid = conns[i].targetId;

        connection[i] = Object();
        connection[i].sourceid = sourceid;
        connection[i].targetid = targetid;


        if($('#' + sourceid).attr('action') == 'wait4digits')
        {
            connection[i].label = conns[i].overlays[1].getLabel();
        }


        if(eval('entities.' + sourceid) == undefined)
        {
            if(!addEntity(entities, sourceid))
                return false;
        }

        if(eval('entities.' + targetid) == undefined)
        {
            if(!addEntity(entities, targetid))
                return false;
        }
    }
    connection.length = conns.length;


    if(action == "save")
    {
        $("#save_form").find("input[name='connections']").val(JSON.stringify(connection));
        $("#save_form").find("input[name='entities']").val(JSON.stringify(entities));
        $("#save_form").find("input[name='vars']").val(JSON.stringify(vars));
        $("#save_form").submit();
        return true;
    }


    $.ajax({
        'url' : "compile.php",
        'data' : {
            'connections' : JSON.stringify(connection),
            'entities'    : JSON.stringify(entities),
            'variables'   : JSON.stringify(vars)
        },
        'dataType': "json",
        'type' : 'post',
        'success' : function(data)
        {
            if(data.result == 'success')
            {
                //alert (data.program);
                alert("success")
                return true;
            }
            if(data.result == 'error')
            {
                alert ("ERROR : " + data.error);
                return false;
            }
            return false;
        }
    });
    return true;
}
function new_app()
{
    $("#confirm_new").dialog({
        bgiframe: true,
        modal: true,
        width: 300,
        height: 200,
        title: 'Confirm New ...',
        buttons :
        {
            'Cancel' : function()
            {
                $(this).dialog('close');
            },
            'Create New' : function()
            {
                jsPlumb.removeEveryEndpoint();
                $(".dropped_icon").remove();
                $(".icon").draggable('enable');
                id=1;
                $(this).dialog('close');
            }
        }
    });
}
function open()
{
    if($("#open_file").val() == '')
        return;

    if($(".dropped_icon").length == 0)
    {
        open_file_ajax();
        return;
    }


    $("#confirm_open").dialog({
        bgiframe: true,
        modal: true,
        width: 300,
        height: 200,
        title: 'Confirm Open ...',
        buttons :
        {
            'Cancel' : function()
            {
                $("#open_file").val('');
                $(this).dialog('close');
            },
            'Open File' : function()
            {
                jsPlumb.removeEveryEndpoint();
                $(".dropped_icon").remove();
                $(".icon").draggable('enable');
                id=1;
                $(this).dialog('close');
                open_file_ajax();
            }
        }
    });
}
function open_file_ajax()
{
    $.ajaxFileUpload
    (
    {
        url:'open.php',
        secureuri:false,
        fileElementId: 'open_file',
        dataType: 'json',
        success: function (data, status)
        {
            $("#open_file").val('');
            $("input[name='open_file']").change(function(){
                open();
            });
            if(typeof(data.error) != 'undefined')
            {
                if(data.error != '')
                {
                    alert(data.error);
                }
                else
                {
                    $.each(data.entities, function(index, value)
                    {
                        id = index.toString().substr(2);
                        $("#gui").append(
                            $(".icon[action='"+ value.action +"']")
                            .clone()
                            .removeClass("icon")
                            .removeClass("ui-draggable")
                            .removeClass("ui-draggable-dragging")
                            .addClass("dropped_icon")
                            .attr("id", index)
                            .attr("style", "position: absolute; top: "+ value.y +"px; left: " + value.x + "px")
                            );
                        switch(value.action)
                        {
                            case 'prompt':
                                $("#" + index)
                                .attr("escape_digits", value.escape_digits)
                                .attr("prompt_path", value.path);
                                break;
                            case 'wait4digits':
                                $("#" + index).attr("prompt_path", value.path)
                                .attr("min_digits", value.min_digits)
                                .attr("max_digits", value.max_digits)
                                .attr("retries", value.retries)
                                .attr("retry_timeout", value.retry_timeout)
                                .attr("expected_digits", value.expected_digits);
                                break;
                            case 'execute':
                                $("#" + index)
                                .attr("command", value.command);
                                break;
                            case 'assign':
                                $("#" + index)
                                .attr("name", value.name)
                                .attr("value", value.value);
                                break;
                            case 'record':
                                $("#" + index)
                                .attr("record_path", value.record_path)
                                .attr("escape_digits", value.escape_digits)
                                .attr("timeout", value.timeout);
                                break;
                        }
                        $("#" + index).append("<div class='endpoint' id='" + 'ep_' + id + "'></div>");

                        if($("#" + index).hasClass("source"))
                        {

                            jsPlumb.makeSource('ep_' + id, {
                                //anchor:"BottomCenter",
                                parent: 'ok' + id,
                                anchor:"Continuous",
                                //connector:[ "Flowchart", { stub:[40, 60], gap:10 } ],
                                connector:[ "Flowchart", {  } ],
                                connectorStyle : {
                                    strokeStyle:"#f00"
                                    ,
                                    lineWidth: 1
                                //,outlineWidth: 2
                                //,outlineColor:"#D2E0E6"
                                },
                                connectorHoverStyle : {
                                    lineWidth:4,
                                    strokeStyle:"#2e2aF8"
                                },
                                maxConnections:-1
                            });
                        }
                        if($("#" + index).hasClass("target"))
                        {
                            jsPlumb.makeTarget('ok' + id, {
                                anchor:"Continuous",
                                connector:[ "Flowchart", {  } ],
                                //connector:[ "Flowchart", { stub:[40, 60], gap:10 } ],
                                maxConnections:-1
                            });
                        }

                        jsPlumb.draggable(jsPlumb.getSelector("#" + index), {
                            containment : "#gui"
                        });


                        if($("#" + index).hasClass("unique"))
                        {
                            $(".icon[action='" + $("#" + index).attr("action") + "']").draggable('disable');
                        }


                        applyjs($("#" + index));
                    });

                    file_open = true;
                    $.each(data.connections, function(index, value)
                    {
                        label = value.label;
                        jsPlumb.connect({
                            'source' : value.sourceid,
                            'target': value.targetid
                        });
                    });
                    file_open = false;

                    vars = data.vars;

                //alert(data.msg);
                }
            }
        },
        error: function (data, status, e)
        {
            $("#open_file").val('');
            $("input[name='open_file']").change(function(){
                open();
            });
            alert(e);
        }
    }
    )
}
function delete_connection(conn)
{
    jsPlumb.removeEndpoint(conn.endpoints[0].elementId, conn.endpoints[0]);
    jsPlumb.removeEndpoint(conn.endpoints[1].elementId, conn.endpoints[1]);
    jsPlumb.detach(conn);
}
function variables()
{
    $("#variables_dialog").html("");
    for(i = 0; i < vars.length; i++)
    {
        $("#variables_dialog").append("<div><input name='vars_name[]' value='" + eval("vars.name_" + i) + "'/>=<input name=vars_value[] value='" + eval("vars.value_" + i) + "'></div>");
    }

    for(i = 0; i < 5; i++)
        $("#variables_dialog").append("<div><input name='vars_name[]' value=''/>=<input name=vars_value[] value=''></div>");

    $("#variables_dialog").dialog({
        bgiframe: true,
        modal: true,
        width: 400,
        height: 400,
        title: 'Variables ...',
        buttons :
        {
            'Cancel' : function()
            {
                $(this).dialog('close');
            },
            'Save' : function()
            {
                vars.length = 0;

                variable_name = '';
                i = 0;
                $("#variables_dialog").find("input").each(function()
                {
                    if(i%2)
                    {
                        if(variable_name != '')
                        {
                            eval("vars.name_" + vars.length + " = '" + variable_name + "'");
                            eval("vars.value_" + vars.length + " = '" + $(this).val() + "'");
                            eval("vars." + variable_name + " = '" + $(this).val() + "'");
                            vars.length++;
                        }
                    }
                    else
                    {
                        variable_name = $(this).val();
                    }
                    i++;
                });
                $(this).dialog('close');
            }
        }
    });
}
function configure_database()
{
    $("#configure_database_dialog").dialog({
        bgiframe: true,
        modal: true,
        width: 600,
        height: 360,
        title: 'Configure Database ...',
        buttons :
        {
            'Cancel' : function()
            {
                $(this).dialog('close');
            },
            'Configure' : function()
            {
                $.ajax(
                    {
                        'url': 'ajax_helper.php',
                        'type': 'post',
                        'dataType' : 'json',
                        'data': {
                            'action' : 'configure_database',
                            'host' : $(this).find("input[name='host']").val(),
                            'username' : $(this).find("input[name='username']").val(),
                            'password' : $(this).find("input[name='password']").val(),
                            'database' : $(this).find("input[name='database']").val()
                        },
                        'success' : function(data)
                        {
                            if(data.result == 'success')
                            {
                               alert('Database configured');
                               $("#configure_database_dialog").dialog('close');
                            }
                            else
                            {
                               alert('Error : ' + data.message);
                            }
                        }
                    }
                );
            }
        }
    });
}