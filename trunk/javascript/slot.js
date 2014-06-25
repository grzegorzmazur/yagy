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
    if( event.which == 104 && event.ctrlKey ){
        yacas.help(input.value, input.selectionStart);
        return false;
    }
    if( event.which == 38 && event.shiftKey ){
        if( !goUp( 0 ))
            return true;
    }
    
    return true;
}

function editableReset( element ){
    original = $(element).parents("span")[0].calculatedExpression;
    revert = $(element).parents("span")[0].revert;
    if ( original == revert ){
        $(element).parents("tbody").removeClass("Modified");
    }
}

function editableBlur( element ){
    $(element).parents("tbody").addClass("NotToCalculate");
    $(element).children().submit();
}

var EmptyEditableText = "Click to edit...";

function changeToEditable( elementID ){
    elementID = "#" + elementID;
    $( elementID ).editable(
                            function(value, settings) { return value; },
                            {
                                //NOTE: if changed text on empty editable it is needed to update CalculateAll function
                                width   : '100%',
                                type    : "autogrow",
                                tooltip : EmptyEditableText,
                                style   : "width:100%",
                                onreset: function(value,settings){
                                    editableReset( this );
                                },
                                onblur  : function( value, setting){
                                    editableBlur ( this );
                                },
                                name    : elementID,
                                callback: function( value, settings ){
                                    processChange( value, settings, this  );
                                }
                            });
}

function addEditable( number, value, rootElementID ){
    newElementID = "editable_" + number;
    rowID = "tr_in_" + number;
    
    $( rootElementID ).append( "<tr id='" + rowID + "'></tr>" );
    $( "#" + rowID ).append( "<td id='td_in_" + number + "'>in "+ number + ":</td>" );
    $( "#" + rowID ).append( "<td><span id='" + newElementID+ "' class='editable'>"+ value +"</span></td>" );
    object =    $("#" + newElementID);
    $("#" + newElementID)[0].calculatedExpression = value;
    
    changeToEditable( newElementID );
}


function addOutput( number, rootElementID ){
    outputID = "output_" + number;
    rowID = "tr_out_" + number;

    $( rootElementID ).append( "<tr id='" + rowID + "'></tr>" );

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
    $("#expression_"+number).addClass( result["type"]);
    $("#expression_"+number).removeClass("Modified");

    $("#" + outputID).text("");
    
    if( result["type"] == "Expression" ){
        $("#" + outputID).append( "$$" + result["tex_code"] + "$$" );
        renderOutput( outputID );
    }else if( result["type"] == "Error" ){
        $("#" + outputID).append( result["error_message"] );
    }else if( result["type"] == "Plot2D" ){
        $.plot("#" + outputID, result["plot2d_data"] );

        $("#" + outputID).resizable({ maxWidth: $("#" + outputID).parent().width() });
        $("#" + outputID).resizable({ minWidth: 200 });
        $("#" + outputID).resizable({ minHeight: 200 });
    }else if( result["type"] == "Plot3D" ){

        var width = $("#" + outputID).parent().width();
        var height = 200;

        $("#" + outputID).resizable({ maxWidth: width });
        $("#" + outputID).resizable({ minWidth: 200 });
        $("#" + outputID).resizable({ minHeight: height });
        
        var plot3d = new Plot3D(result["plot3d_data"], width, height);
        
        $("#" + outputID).append(plot3d.renderer.domElement);

        var controls = new THREE.TrackballControls(plot3d.camera, plot3d.renderer.domElement);

        function render() {
            requestAnimationFrame(render);
            plot3d.renderer.render(plot3d.scene, plot3d.camera);
            controls.update();
        }

        render();
    }
}

function renderOutput( outputID ){
    MathJax.Hub.Queue( ["Typeset", MathJax.Hub, outputID] );
}

function removeOldResults( number ){
    $( "#expression_" + number ).remove();
}

function addExpressionCells( expressionid, value, rootElementID){
    
    $("<tbody id='expression_" + expressionid + "' class='Modified'></tbody").insertBefore( rootElementID );
    addEditable( expressionid, value, "#expression_" + expressionid);
    addOutput( expressionid, "#expression_" + expressionid);
    
}

function calculate( value ){
    
    addExpressionCells( currentExpression, value, "#expression_0");
    
    yacas.eval( currentExpression, value );
    
    updateInputNumber( ++currentExpression );
    clearInput();
}

function processChange( value, settings, object ){
    
    var number = object.id.split("_")[1];
    
    if ( $("#expression_"+number).hasClass("NotToCalculate")){
        $("#expression_"+number).removeClass("NotToCalculate");
        return;
    }
    
    addExpressionCells( currentExpression, value, "#expression_" + number);
    
    yacas.eval( currentExpression, value );
    
    updateInputNumber( ++currentExpression );
    removeOldResults( number );

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
                              
                                if ( value == EmptyEditableText ) value = "";
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
                              
                                if ( value == EmptyEditableText ) value = "";
                                inputs.push( value );
                              }
                              });
    inputVal = $( "#inputExpression" ).val();
    if ( inputVal != "" ) inputs.push( inputVal );
    
    return inputs;
}

function findPreviousExpression( number ){
    var previous = $("#expression_"+ number).prev("tbody");
    if ( previous.length == 0 ) return null; //First row
    return previous[0].id.split("_")[1];
    
}

function findNextExpression( number ){
    var previous = $("#expression_"+ number).next("tbody");
    if ( previous.length == 0 ) return null; //First row
    return previous[0].id.split("_")[1];
    
}

function goUp( number ){
    prev = findPreviousExpression( number );
    if ( prev == null ) return false;
    goto ( prev );
    return true;
    
}

function goDown( number ){
    next = findNextExpression( number );
    if ( next == null ) return false;
    goto ( next );
    return true;
}

function goto( number ){
    if ( number == 0 ) $("#inputExpression").focus();
    else $("#editable_"+number).click();
    
}

function insertBeforeCurrent(){
}

function insertAfterCurrent(){
}
