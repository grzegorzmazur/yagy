/**
 * This is run after the the web page has been rendered.
 * $(document).ready documented here:
 * http://docs.jquery.com/Tutorials:Introducing_$(document).ready()
 */


function load() {
    //$("#inputExpression").focus();
    $( "#inputExpression" ).autosize();
    
    $( window ).on( 'resize', function(){
        MathJax.Hub.Queue(["Rerender", MathJax.Hub]);
    });
}

var CurrentExpression = 1;


function updateInputNumber( updatedNumber) {
    $( "#inputCounter" ).html( "in " + updatedNumber + ":" );
}

function clearInput(){
    $( "#inputExpression" ).val("");
}


function submitenter( input ,event){
    if( event.which == 13 && event.shiftKey ){
        calculate( input );
        return false;
    }
    if( event.which == 13 ) return false;
    return true;
}

function ChangeToEditable( elementID ){
    elementID = "#" + elementID;
    $( elementID ).editable(
                            function(value, settings) { return value; },
                            {
                                width   : '100%',
                                type    : "autogrow",
                                tooltip : "Click to edit...",
                                style   : "width:100%",
                                callback: function( value, settings ){
                                    processChange( value, settings, this  );
                                },
                            });
}


function addSideEffects( number, side_effects, rootElementID ){
    rowID = "tr_side_" + number;
    $( "<tr id='" + rowID + "'></tr>" ).insertBefore( rootElementID );
    $( "#" + rowID ).append("<td id='td_side_" + number + "'></td>" );
    $( "#" + rowID ).append("<td><span id='side_effects_" + number + "'>" + side_effects + "</span></td>");
}

function addOutput( number, value, type, rootElementID ){
    outputID = "output_" + number;
    
    rowID = "tr_out_" + number;
    $( "<tr id='" + rowID + "'></tr>" ).insertBefore( rootElementID );
    $( "#" + rowID ).append( "<td id='td_out_" + number + "'>out "+ number + ":</td>"  );
    $( "#" + rowID ).append( "<td><span class=" + type + " id='" + outputID+ "' >" + value + "</span></td>" );

    if( type == "Expression" ){
        renderOutput( outputID );
    }
}

function renderOutput( outputID ){
    MathJax.Hub.Queue( ["Typeset", MathJax.Hub, outputID] );
}

function addEditable( number, value, rootElementID ){
    newElementID = "editable_" + number;
    rowID = "tr_in_" + number;
    
    $( "<tr id='" + rowID + "'></tr>" ).insertBefore( rootElementID );
    $( "#" + rowID ).append( "<td id='td_in_" + number + "'>in "+ number + ":</td>" );
    $( "#" + rowID ).append( "<td><span id='" + newElementID+ "' class='editable'>"+ value +"</span></td>" );
    
    ChangeToEditable( newElementID );
}

function printResults( result, rootElementID ){

    if( result.hasOwnProperty( "side_effects" ))
        addSideEffects(CurrentExpression, result["side_effects"].replace(/\n/g, '<br />'), rootElementID);

    if( result["type"] == "Expression" ){
        value = "$" + result["tex_code"] + "$";
    }else if ( result["type"] == "Error" ){
        value = result["error_message"];
    }

    addOutput( CurrentExpression, value, result["type"], rootElementID );
}


function removeOldResults( number ){
    $( "#tr_side_" + number ).remove();
    $( "#tr_out_" + number ).remove();
    $( "#tr_in_" + number ).remove();
}

function calculate( object ){
    result = yacas.eval( object.value );
    
    addEditable( CurrentExpression, object.value, "#tr_input" );
    printResults( result, "#tr_input" );

    CurrentExpression++;
    updateInputNumber( CurrentExpression );
    clearInput();
}

function processChange( value, settings, object ){
    
    var number = object.id.split("_")[1];
    result = yacas.eval( value );
    
    addEditable( CurrentExpression, value, "#tr_in_"+number );
    printResults( result, "#tr_out_"+number );
    removeOldResults( number );
    
    CurrentExpression++;
    updateInputNumber( CurrentExpression );
    
}
