function load(){
    //$("#inputExpression").focus();
    $( "#inputExpression" ).autosize();
    
    $( window ).on( 'blur', function(){ if ( bluredEditable !== null ) $( bluredEditable ).click(); } );
    $( document ).on( 'click', function(){ bluredEditable = null; });
    $( window ).on( 'resize', function(){
        MathJax.Hub.Queue(["Rerender", MathJax.Hub]);
        w = $("body").innerWidth() - $("#Elements>tbody>tr>td:first-child").width() - 20; //Magic 20 is for some margins, TODO: make it right
        $( ".resizable" ).resizable( "option", "maxWidth", w );
        $( ".resizable" ).each( function(){ if ($(this).width() > w ) $(this).width(w); });
    });
    
    $(document).contextmenu({
                            delegate: ".Expression",
                            menu: [
                                   {title: "Copy TeX", cmd: "copyTeX"},
                                   {title: "Copy Yacas Expression", cmd: "copyYacasExpression"}
                                   ],
                            select: function(event, ui) {
                                parents = ui.target.parents(".Expression");
                            
                                if ( ui.cmd == "copyTeX"){
                                    result = $(parents[0]).children('script')[0].textContent;
                            
                                }else if ( ui.cmd == "copyYacasExpression"){
                                    result = $(parents)[0].yacasExpression;
                                }
                                yacas.copyToClipboard( result );
                            }
                            });
                            
    
}


function changeMathJaxScale( newScale ){
    MathJax.Hub.Config({ "HTML-CSS": {
                            scale: newScale }
                       });
    MathJax.Hub.Queue(["Rerender", MathJax.Hub]);

}

function changeMathJaxFont( newFont ){
    MathJax.Hub.Config({ "HTML-CSS": {
                           preferredFont: newFont }
                       });
    MathJax.Hub.Queue(["Rerender", MathJax.Hub]);

}

var currentExpression = 1;
var numberOfLines = 1;
var bluredEditable = null;

function updateInputNumber( updatedNumber) {
    $( "#inputCounter" ).html( "in " + updatedNumber + ":" );
}

function clearInput(){
    $( "#inputExpression" ).val("");
}


function submitenter( input, event ){
    if( event.which === 13 && event.shiftKey ){
        calculate( input.value );
        return false;
    }
    if( event.which === 38 && event.shiftKey ){
        if( !goUp( 0 ))
            return true;
    }
    
    return true;
}

function editableReset( element ){
    original = $(element).parents("span")[0].calculatedExpression;
    revert = $(element).parents("span")[0].revert;
    if ( original === revert ){
        $(element).parents("tbody").removeClass("Modified");
    }
}

function editableBlur( element ){
    bluredEditable = element;
    $(element).parents("tbody").addClass("NotToCalculate");
    $(element).children().submit();
} 

var EmptyEditableText = "Click to edit...";

function changeToEditable( elementID, number ){
    $( elementID ).editable(
                            function(value, settings) { return value; },
                            {
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
                                name    : number,
                                callback: function( value, settings ){
                                    processChange( value, settings.name, this  );
                                }
                            });
}

function addEditable( lineid, number, value, rootElementID ){

    var row = $( "<tr class='In'></tr>" );
    row.append( "<td>in&nbsp&nbsp"+ number + ":</td>" );
    row.append( "<td><span class='editable'>"+ value +"</span></td>" );
    $( rootElementID ).append( row );
    
    var editable = row.find(".editable");
    editable[0].calculatedExpression = value;
    
    changeToEditable( editable, lineid );
    return editable;
}


function addOutput( lineid, number, rootElementID ){
    outputID = "output_" + lineid;

    var row = $( "<tr class='Out'></tr>" );
    row.append( "<td>out "+ number + ":</td>"  );
    row.append( "<td><div id='" + outputID+ "' ></div></td>" );
    
    $( rootElementID ).append( row );
    $( "#" + outputID ).append( "<img src='img/progressbar.indicator.gif' width='20' ></img>");
}

function addSideEffects( number, side_effects, rootElementID ){
    var row = $( "<tr></tr>" ).insertBefore( rootElementID );
    row.append("<td></td>" );
    row.append("<td><span>" + side_effects + "</span></td>");
}

function printResults( result ){
    number = result["idx"];
    outputID = "output_" + number;
    
    var ExpressionElement = $("#expression_"+number);
    
    if( result.hasOwnProperty( "side_effects" ) ){
        var outRow = ExpressionElement.children(".Out");
        addSideEffects(number, result["side_effects"].replace(/\n/g, '<br />'), outRow);
    }
    
    var output = $("#" + outputID);
    
    output.addClass( result["type"] );
    
    ExpressionElement.addClass( result["type"]);
    ExpressionElement.removeClass("Modified");

    output.text("");
    
    if( result["type"] === "Expression" ){

        output.append( "$$" + result["tex_code"] + "$$" );
        renderOutput( outputID );
        output[0].yacasExpression = result["expression"];

    }else if( result["type"] === "Error" ){

        output.append( result["error_message"] );

    }else if( result["type"] === "Plot2D" ){

        $.plot(output, result["plot2d_data"] );

        var width = $("#" + outputID).parent().width();
        
        output.resizable({ maxWidth: width, minWidth: 200, minHeight: 200} );
        output.addClass( "resizable" );
        
    }else if( result["type"] === "Plot3D" ){

        var width = $("#" + outputID).parent().width();
        var height = 300;

        webGLEnabled = yacas.isWebGLEnabled();
        
        var plot3d = new Plot3D(result["plot3d_data"], width, height);
        
        plot3d.setRenderer( webGLEnabled );
        plot3d.addLegend("#" + outputID);
        
        output.append(plot3d.renderer.domElement);
        output[0].plot3D = plot3d;

        var controls = new THREE.TrackballControls(plot3d.camera, plot3d.renderer.domElement);
        controls.addEventListener( 'change', ControlsChanged );
        controls.enabled = false;
        output[0].controls = controls;
        plot3d.renderer.render(plot3d.scene, plot3d.camera);

        function render() {
            requestAnimationFrame(render);
            controls.update();
        }
        
        render();

        output.resizable({ maxWidth: width, minWidth: 200, minHeight: 200} );
        output.addClass( "resizable" );
        output.resize( function(){ Plot3dResized( this );});
        output.mouseout( function(event){ Plot3dMouseOut( this, event );});
        output.click( function(event){ Plot3dClicked( this, event );});
        
    }
}

function ControlsChanged( element, event ){
    plot3d = element.target.domElement.parentElement.plot3D;
    plot3d.renderer.render(plot3d.scene, plot3d.camera);
}

function Plot3dResized( output ){
    var height = $(output).height();
    var width = $(output).width();
    plot3d = output.plot3D;
    plot3d.resizePlot( width, height);
    plot3d.renderer.render(plot3d.scene, plot3d.camera);
}

function Plot3dMouseOut( output, event ){
    controls = output.controls;
    controls.enabled = false;
}

function Plot3dClicked( output, event ){
    controls = output.controls;
    controls.enabled = true;
}

function renderOutput( outputID ){
    MathJax.Hub.Queue( ["Typeset", MathJax.Hub, outputID] );
}

function removeOldResults( number ){
    $( "#expression_" + number ).remove();
}

function addExpressionCells( lineID, expressionid, value, rootElementID){
    
    $("<tbody id='expression_" + lineID + "' class='Modified'></tbody").insertBefore( rootElementID );
    addEditable( lineID, expressionid, value, "#expression_" + lineID);
    addOutput( lineID, expressionid, "#expression_" + lineID);
}

function calculate( value ){
    
    addExpressionCells( numberOfLines, currentExpression, value, "#expression_0");
    
    yacas.eval( numberOfLines, value );
    
    currentExpression++;
    numberOfLines++;
    
    clearInput();
}

function processChange( value, number, object ){
   var decodedValue = $("<div/>").html( value ).text();
    
    if ( $("#expression_"+number).hasClass("NotToCalculate")){
        $("#expression_"+number).removeClass("NotToCalculate");
        return;
    }
    
    addExpressionCells( numberOfLines, currentExpression, decodedValue, "#expression_" + number);
    
    yacas.eval( numberOfLines, decodedValue );
    
    currentExpression++;
    numberOfLines++;
    
    removeOldResults( number );

}

function evaluateCurrent(){
    var active = document.activeElement;
    if ( active.id === "inputExpression" && active.value != ""){
        calculate( active.value );
    }else{
        $(document.activeElement).parent().trigger("submit");
    }
}

function evaluateAll(){
    $(".editable").each( function() {
                              value = $(this).text();
                              
                              if ( value === "" ){
                                $(this).find("form:first").trigger("submit");
                              }else{
                              
                                if ( value === EmptyEditableText ) value = "";
                        
                                number = $(this).parents("tbody")[0].id.split("_")[1];
                                processChange( value, number, this );
                              }
                           });
    inputVal = $( "#inputExpression" ).val();
    if ( inputVal !== "" ) calculate( inputVal );
    $("#inputExpression").focus();
}

function getAllInputs(){
    var inputs = [];
    $(".editable").each( function() {
                              value = $(this).text();
                              
                              if ( value === "" ){
                                inputs.push( $(this).find("textarea:first").val() );
                              }else{
                              
                                if ( value === EmptyEditableText ) value = "";
                                inputs.push( value );
                              }
                              });
    inputVal = $( "#inputExpression" ).val();
    if ( inputVal !== "" ) inputs.push( inputVal );
    
    return inputs;
}

function findPreviousExpression( number ){
    var previous = $("#expression_"+ number).prev("tbody");
    if ( previous.length === 0 ) return null; //First row
    return previous[0].id.split("_")[1];
    
}

function findNextExpression( number ){
    var next = $("#expression_"+ number).next("tbody");
    if ( next.length === 0 ) return null; //First row
    return next[0].id.split("_")[1];
    
}

function previousCell() {
    var focused = $(':focus').parents("tbody");
    
    if (focused.length === 0 ){
        return;
    }
    
    var number = $(focused)[0].id.split("_")[1];
    goUp( number );
}

function nextCell() {
    var focused = $(':focus').parents("tbody");
    
    if (focused.length === 0 ){
        return;
    }
    
    var number = $(focused)[0].id.split("_")[1];
    goDown( number );
}

function goUp( number ){
    prev = findPreviousExpression( number );
    if ( prev === null ) return false;
    goto ( prev );
    return true;    
}

function goDown( number ){
    next = findNextExpression( number );
    if ( next === null ) return false;
    goto ( next );
    return true;
}

function goto( number ){
    if ( number === '0' ) $("#inputExpression").focus();
    else $("#expression_"+number).find(".editable").click();
    
}

function insertElement( whetherAfterOrBefore ){
    var focused = $(':focus').parents("tbody");
    
    if (focused.length === 0 ){
        return;
    }
    
    var element = $("<tbody id='expression_" + numberOfLines + "' class='New'></tbody");
    var value = "";
    var clickNew = true;
    
    //Special case when inserting after last input (expression_0)
    if ( whetherAfterOrBefore === "after" && $(focused)[0].id === "expression_0"){
        whetherAfterOrBefore = "before";
        value = $("#inputExpression").val();
        clearInput();
        clickNew = false;
    }
    
    if( whetherAfterOrBefore === "before"){
        element.insertBefore( focused );
    }else{
        element.insertAfter( focused );
    }
    
    var editable = addEditable(numberOfLines, "", value, "#expression_" + numberOfLines);
    
    if ( clickNew ){
        editable.click();
    }
    numberOfLines++;
}

function insertAfterCurrent(){
    insertElement( "after" );
}

function insertBeforeCurrent(){
    insertElement( "before" );
}

function deleteCurrent(){
    var focused = $(':focus').parents("tbody");
    
    if (focused.length === 0 ){
        return;
    }
    
    //Cannot delete last input (expression_0)
    if ( $(focused)[0].id === "expression_0"){
        return;
    }
    number = $(focused)[0].id.split("_")[1];
    goDown( number );
    $(focused).remove();

}

function contextHelp() {
    var e = document.activeElement;
    yacas.help(e.value, e.selectionStart);
}