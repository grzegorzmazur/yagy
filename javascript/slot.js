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
    


    updateLineNumber( number, CurrentExpression);
    CurrentExpression++;
    updateInputNumber( CurrentExpression );
    
    var outputID = "output_" + number;
    var math = MathJax.Hub.getAllJax(outputID)[0];
    result = yacas.eval( value );
    MathJax.Hub.Queue(["Text",math,result["tex_code"]]);
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

function addSideEffects( number, side_effects ){
    $( "<tr><td id='td_side_" + number + "'>side "+ number + ":</td><td><span id='side_effects_" + number + "'>" + side_effects + "</span></td></tr>").insertBefore( "#tr_input");
}

function addOutput( number, value ){
    outputID = "output_" + number;

    $( "<tr><td id='td_out_" + number + "'>out "+ number + ":</td><td><span id='" + outputID+ "' >$$" + value + "$$</span></td></tr>").insertBefore( "#tr_input");
    MathJax.Hub.Queue(["Typeset",MathJax.Hub, outputID]);
    
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
        addSideEffects(CurrentExpression, result["side_effects"]);
    addOutput( CurrentExpression, result["tex_code"]);
    CurrentExpression++;
    clearInput();
    updateInputNumber( CurrentExpression );
};
