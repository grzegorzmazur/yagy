/**
 * This is run after the the web page has been rendered.
 * $(document).ready documented here:
 * http://docs.jquery.com/Tutorials:Introducing_$(document).ready()
 */


function load(){
    //$("#inputExpression").focus();
    $( "#inputExpression" ).autosize();
    
    $( window ).on( 'resize', function(){
        MathJax.Hub.Queue(["Rerender", MathJax.Hub]);
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
    if (event.which == 104 && event.ctrlKey ) {
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
                                width   : '100%',
                                type    : "autogrow",
                                tooltip : "Click to edit...",
                                style   : "width:100%",
                                onblur  : "nothing",
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
    $( "#" + outputID).append( "<img src='javascript/progressbar.indicator.gif' width='20' ></img>");
    
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
        addSideEffects(currentExpression, result["side_effects"].replace(/\n/g, '<br />'), rowID);
    
    $("#" + outputID).addClass( result["type"] );
    $("#" + outputID).text("");
    
    if( result["type"] == "Expression" ){
        $("#" + outputID).append( "$" + result["tex_code"] + "$" );
        renderOutput( outputID );
    }else if( result["type"] == "Error" ){
        $("#" + outputID).append( result["error_message"] );
    }else if( result["type"] == "Plot2D" ){         
        $.plot("#" + outputID, result["plot2d_data"] );
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

function processChange( value, settings, object ){

    var number = object.id.split("_")[1];

    addEditable( currentExpression, value, "#tr_out_"+number );
    addOutput( currentExpression, "#tr_out_"+number );
    

    yacas.eval( currentExpression, value );
    
    removeOldResults( number );
    
    updateInputNumber( ++currentExpression );    
}