/**
 * This is run after the the web page has been rendered.
 * $(document).ready documented here:
 * http://docs.jquery.com/Tutorials:Introducing_$(document).ready()
 */


function load() {
    //$("#inputExpression").focus();
    $("#inputExpression").autosize();
    
    $( window ).on( 'resize', function(){
        MathJax.Hub.Queue(["Rerender", MathJax.Hub]);
    });
};

var CurrentExpression = 1;

function updateLineNumber( currentNumber, updatedNumber ){    
    $( "#td_out_" + currentNumber).html( "out " + updatedNumber + ":");
    $( "#td_in_" + currentNumber).html( "in " + updatedNumber + ":");
};

function updateInputNumber( updatedNumber) {
    $( "#inputCounter" ).html( "in " + updatedNumber + ":");
};

function editableSubmitted( value, settings, object ){
    var number = object.id.split("_")[1];
    var outputID = "output_" + number;

    updateLineNumber( number, CurrentExpression);
    CurrentExpression++;
    updateInputNumber( CurrentExpression );
    
    result = yacas.eval( value );
    
    if ( result["type"] == "Expression" ){
        if ($( "#"+ outputID ).hasClass( "Expression" )){
            var math = MathJax.Hub.getAllJax(outputID)[0];
            MathJax.Hub.Queue(["Text",math,result["tex_code"]]);
        
        }else{
            $( "#" + outputID ).html( "$" + result["tex_code"] + "$" );
            $( "#" + outputID ).removeClass( "Error" );
            $( "#" + outputID ).addClass( "Expression" );
            MathJax.Hub.Queue(["Typeset",MathJax.Hub, outputID]);
        }
    }else{
        if ($( "#"+ outputID ).hasClass( "Expression" )){
            $( "#" + outputID ).text( result["error_message"]  );
            $( "#" + outputID ).addClass( "Error" );
            $( "#" + outputID ).removeClass( "Expression" );

        }else{
            $( "#" + outputID ).text( result["error_message"]);
        }
    }
    
    return value;
};


function submitenter( input ,event){
    if (event.which == 13 && event.shiftKey){
        calculate( input );
        return false;
    }
    if (event.which == 13 ) return false;
    return true;
};

function ChangeToEditable( elementID ){
    elementID = "#" + elementID;
    $( elementID ).editable(
                            function(value, settings) {
                            
                            return(editableSubmitted(value, settings, this));
                            }, {
                            width: '100%',
                            type      : "autogrow",
                            tooltip   : "Click to edit...",
                            style: "width:100%"
                            });
    $( elementID ).click(function(evt) {
                                     $(this).find('textarea').keydown(function(event) {
                                                                      
                                                                   if (event.which == 13 && event.shiftKey)
                                                                      $(this).closest('form').submit();
                                                                    if (event.which == 13 )
                                                                      return false;
                                                                   });
                                     });
};

function addErrorMessage( number, error_msg ){
    $( "<tr><td id='td_error_" + number + "'>error "+ number + ":</td><td><span id='error_" + number + "'>" + error_msg + "</span></td></tr>").insertBefore( "#tr_input");
}

function addSideEffects( number, side_effects ){
    $( "<tr><td id='td_side_" + number + "'></td><td><span id='side_effects_" + number + "'>" + side_effects + "</span></td></tr>").insertBefore( "#tr_input");
}

function addOutput( number, value, type ){
    outputID = "output_" + number;
    
    $( "<tr><td id='td_out_" + number + "'>out "+ number + ":</td><td><span class=" + type + " id='" + outputID+ "' >" + value + "</span></td></tr>").insertBefore( "#tr_input");

    if( type == "Expression"){
         MathJax.Hub.Queue(["Typeset",MathJax.Hub, outputID]);
    }
}


function addEditable( number, value ){
    newElementID = "editable_" + number;
    $( "<tr><td id='td_in_" + number + "'>in "+ number + ":</td><td><span id='" + newElementID+ "' class='editable'>"+ value +"</span></td></tr>").insertBefore( "#tr_input" );
    ChangeToEditable( newElementID);
}

function clearInput(){
    $( "#inputExpression").val("");
    
}

function calculate(object){
    result = yacas.eval(object.value);
    addEditable( CurrentExpression, object.value );
    
    if( result.hasOwnProperty( "side_effects" ) )
        addSideEffects(CurrentExpression, result["side_effects"].replace(/\n/g, '<br />'));
    
    if( result["type"] == "Expression" ){
        value = "$" + result["tex_code"] + "$";
    }else if ( result["type"] == "Error" ){
        value = result["error_message"];
    }
    
    addOutput( CurrentExpression, value, result["type"]);

    CurrentExpression++;
    clearInput();
    updateInputNumber( CurrentExpression );
};
