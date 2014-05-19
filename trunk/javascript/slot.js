
function load(){
    //$("#inputExpression").focus();
    $( "#inputExpression" ).autosize();
    
    $( window ).on( 'resize', function(){
        MathJax.Hub.Queue(["Rerender", MathJax.Hub]);
        w = $(".Plot2D").first().parent().width();
        $( ".Plot2D" ).resizable( "option", "maxWidth", w );
        $( ".Plot2D" ).each( function(){ if ($(this).width() > w ) $(this).width(w); })
    });
    
}

var currentExpression = 1;


function updateInputNumber( updatedNumber) {
    $( "#inputCounter" ).html( "in " + updatedNumber + ":" );
}

function clearInput(){
    $( "#inputExpression" ).val("");
}


function submitenter( input, event ){
    if( event.which == 13 && event.shiftKey ){
        calculate( input.value );
        return false;
    }
    if ( event.which == 104 && event.ctrlKey ){
        yacas.help(input.value, input.selectionStart);
        return false;
    }
    return true;
}

function changeToEditable( elementID ){
    elementID = "#" + elementID;
    $( elementID ).editable(
                            function(value, settings) { return value; },
                            {
                                //NOTE: if changed text on empty editable it is needed to update CalculateAll function
                                width   : '100%',
                                type    : "autogrow",
                                tooltip : "Click to edit...",
                                style   : "width:100%",
                                onblur  : "nothing",
                            name    : elementID,
                                callback: function( value, settings ){
                                    processChange( value, settings, this  );
                                }
                            });
}

function addEditable( number, value, rootElementID ){
    newElementID = "editable_" + number;
    rowID = "tr_in_" + number;
    
    $( "<tr id='" + rowID + "'></tr>" ).insertBefore( rootElementID );
    $( "#" + rowID ).append( "<td id='td_in_" + number + "'>in "+ number + ":</td>" );
    $( "#" + rowID ).append( "<td><span id='" + newElementID+ "' class='editable'>"+ value +"</span></td>" );
    
    changeToEditable( newElementID );
}


function addOutput( number, rootElementID ){
    outputID = "output_" + number;
    rowID = "tr_out_" + number;

    $( "<tr id='" + rowID + "'></tr>" ).insertBefore( rootElementID );
    $( "#" + rowID ).append( "<td>out "+ number + ":</td>"  );
    $( "#" + rowID ).append( "<td><div id='" + outputID+ "' ></div></td>" );
    $( "#" + outputID).append( "<img src='img/progressbar.indicator.gif' width='20' ></img>");
    
}

function addSideEffects( number, side_effects, rootElementID ){
    rowID = "tr_side_" + number;
    $( "<tr id='" + rowID + "'></tr>" ).insertBefore( rootElementID );
    $( "#" + rowID ).append("<td id='td_side_" + number + "'></td>" );
    $( "#" + rowID ).append("<td><span id='side_effects_" + number + "'>" + side_effects + "</span></td>");
}

function printResults( result ){
    number = result["idx"];
    outputID = "output_" + number;
    rowID = "#tr_out_" + number;
    
    if( result.hasOwnProperty( "side_effects" ) )
        addSideEffects(number, result["side_effects"].replace(/\n/g, '<br />'), rowID);
    
    $("#" + outputID).addClass( result["type"] );
    $("#" + outputID).text("");
    
    if( result["type"] == "Expression" ){
        $("#" + outputID).append( "$" + result["tex_code"] + "$" );
        renderOutput( outputID );
    }else if( result["type"] == "Error" ){
        $("#" + outputID).append( result["error_message"] );
    }else if( result["type"] == "Plot2D" ){
        $.plot("#" + outputID, result["plot2d_data"] );

        $("#" + outputID).resizable({ maxWidth: $("#" + outputID).parent().width() });
        $("#" + outputID).resizable({ minWidth: 200 });
        $("#" + outputID).resizable({ minHeight: 200 });
    }else if( result["type"] == "Plot3D" ){
        
        var data = result["plot3d_data"][0]["data"]; 
        
        var xmin = data[0][0];
        var xmax = data[0][0];
        
        var ymin = data[0][1];
        var ymax = data[0][1];

        var zmin = data[0][2];
        var zmax = data[0][2];
        
        for (var i = 1; i < data.length; ++i) {
            if (data[i][0] < xmin)
                xmin = data[i][0];
            if (data[i][0] > xmax)
                xmax = data[i][0];
            if (data[i][1] < ymin)
                ymin = data[i][1];
            if (data[i][1] > ymax)
                ymax = data[i][1];
            if (data[i][2] < zmin)
                zmin = data[i][2];
            if (data[i][2] > zmax)
                zmax = data[i][2];
        }

        var size = 500;

        var xscale = size / (xmax - xmin);
        var yscale = size / (ymax - ymin);
        var zscale = size / (zmax - zmin);

        xoffset = -size / 2;
        yoffset = -size / 2;
        zoffset = -size / 2;

        var scene, camera, renderer;
        var controls;

        init();
        render();

        function init() {

            scene = new THREE.Scene();

            var axisHelper = new THREE.AxisHelper( 300 );
            scene.add( axisHelper );

            camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1000 );
            camera.position.z = 1000;
            
            controls = new THREE.TrackballControls( camera );

            var geometry = new THREE.Geometry();
            
            for (var i = 0; i < data.length - 2; ++i) {
                var p0 = data[i];
                var p1 = data[i + 1];
                
                if (p0[0] != p1[0])
                    continue;
                
                var p2 = undefined;
                
                for (var j = i + 2; j < data.length; ++j) {
                    if (data[j][1] == p0[1]) {
                       p2 = data[j];
                       break;
                    }
                }
                
                if (p2 === undefined)
                    break;

                geometry.vertices.push( new THREE.Vector3( (p0[0] - xmin) * xscale + xoffset,  (p0[1] - ymin) * yscale + yoffset, (p0[2] - zmin) * zscale + zoffset ) );
                geometry.vertices.push( new THREE.Vector3( (p1[0] - xmin) * xscale + xoffset,  (p1[1] - ymin) * yscale + yoffset, (p1[2] - zmin) * zscale + zoffset ) );
                geometry.vertices.push( new THREE.Vector3( (p2[0] - xmin) * xscale + xoffset,  (p2[1] - ymin) * yscale + yoffset, (p2[2] - zmin) * zscale + zoffset ) );

                geometry.faces.push( new THREE.Face3( geometry.vertices.length - 3, geometry.vertices.length - 2, geometry.vertices.length - 1 ) );
            }

            for (var i = 1; i < data.length; ++i) {
                var p0 = data[i];
                var p1 = data[i - 1];
                
                if (p0[0] != p1[0])
                    continue;
                
                var p2 = undefined;
                for (var j = i - 2; j >= 0; --j) {
                    if (data[j][1] == p0[1]) {
                       p2 = data[j];
                       break;
                    }
                }

                if (p2 === undefined)
                    continue;

                geometry.vertices.push( new THREE.Vector3( (p0[0] - xmin) * xscale + xoffset,  (p0[1] - ymin) * yscale + yoffset, (p0[2] - zmin) * zscale + zoffset ) );
                geometry.vertices.push( new THREE.Vector3( (p1[0] - xmin) * xscale + xoffset,  (p1[1] - ymin) * yscale + yoffset, (p1[2] - zmin) * zscale + zoffset ) );
                geometry.vertices.push( new THREE.Vector3( (p2[0] - xmin) * xscale + xoffset,  (p2[1] - ymin) * yscale + yoffset, (p2[2] - zmin) * zscale + zoffset ) );

                geometry.faces.push( new THREE.Face3( geometry.vertices.length - 3, geometry.vertices.length - 2, geometry.vertices.length - 1 ) );
            }

            geometry.computeBoundingSphere();

            var material = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe: true } );
            var mesh = new THREE.Mesh( geometry, material );

            scene.add( mesh );

            renderer = new THREE.WebGLRenderer();
            
            renderer.setClearColor(0xffffff, 1);
            
            renderer.setSize( $("#" + outputID).parent().width(), 200 );
            $("#" + outputID).resizable({ maxWidth: $("#" + outputID).parent().width() });
            $("#" + outputID).resizable({ minWidth: 200 });
            $("#" + outputID).resizable({ minHeight: 200 });
            $("#" + outputID).append(renderer.domElement);
        }

        function render() {
            requestAnimationFrame( render );
            renderer.render( scene, camera );
            controls.update();
        }
    }
}

function renderOutput( outputID ){
    MathJax.Hub.Queue( ["Typeset", MathJax.Hub, outputID] );
}

function removeOldResults( number ){
    $( "#tr_side_" + number ).remove();
    $( "#tr_out_" + number ).remove();
    $( "#tr_in_" + number ).remove();
}

function calculate( value ){
    addEditable( currentExpression, value, "#tr_input" );
    addOutput( currentExpression, "#tr_input");
    
    yacas.eval( currentExpression, value );
    
    updateInputNumber( ++currentExpression );

    clearInput();
}

function evaluateCurrent(){
    var active = document.activeElement;
    if ( active.id == "inputExpression" && active.value != ""){
        calculate( active.value );
    }else{
        $(document.activeElement).parent().trigger("submit");
    }
}

function evaluateAll(){
    $("[id^=editable_]").each( function() {
                              value = $(this).text()
                              
                              if ( value == "" ){
                                $(this).find("form:first").trigger("submit");
                              }else{
                                //if editable is empty it's value is "Click to edit"
                                if ( value == "Click to edit" ) value = "";
                                processChange( value, null, this );
                              }
                           });
    inputVal = $( "#inputExpression" ).val();
    if ( inputVal != "" ) calculate( inputVal );
    $("#inputExpression").focus();
}

function getAllInputs(){
    var inputs = [];
    $("[id^=editable_]").each( function() {
                              value = $(this).text()
                              
                              if ( value == "" ){
                                inputs.push( $(this).find("textarea:first").val() );
                              }else{
                                //if editable is empty it's value is "Click to edit"
                                if ( value == "Click to edit" ) value = "";
                                inputs.push( value );
                              }
                              });
    inputVal = $( "#inputExpression" ).val();
    if ( inputVal != "" ) inputs.push( inputVal );
    
    return inputs;
}

function processChange( value, settings, object ){

    var number = object.id.split("_")[1];

    addEditable( currentExpression, value, "#tr_out_"+number );
    addOutput( currentExpression, "#tr_out_"+number );
    
    yacas.eval( currentExpression, value );
    
    removeOldResults( number );
    
    updateInputNumber( ++currentExpression );    
}
