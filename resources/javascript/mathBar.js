MathBar.selectMoreText = "more";
MathBar.functions;
MathBar.categories;

//VIF - Very Importatnt Function
function MathBar( outputID, options, button, callback ) {
    var self = this;
    var numberOfVIF = options["VIF"];
    
    self.outputID = outputID;
    self.defaultParameters = options["defaultParameters"];
    self.button = button;
    self.currentOption = "";
    self.currentOptionVIF = true;
    self.callback = callback;
    self.visible = false;
    self.categories = MathBar.categories[ options["type"] ];
    self.outputValue = $("#" + outputID)[0].yacasExpression;
    
    var $mathBarElement = $( "<div>" , { class: "MathBar" } ).hide();
    var $functionsDiv = $("<div>", {class : "radio_group_horizontal styled_radio"});
    
    //In case number of all functions is 1 more than VIF do not display combobox with only one function
    //but treat all of them as VIFs
    
    if ( numberOfVIF > self.categories.length ) numberOfVIF = self.categories.length;
    
    if ( self.categories.length - numberOfVIF == 1 ){
        numberOfVIF++;
    }
    
    var i;
    for( i = 0; i < numberOfVIF; i++){

        var func = MathBar.functions[self.categories[i]];
        var text = func["text"];
        
        var $input = $("<input>", { type: "radio", name: outputID, value: self.categories[i]})
        
        if ( i == 0 ) $input.prop( "checked", true );
        
        $input.click( function(){ self.optionClicked( this.value, true )});
        
        $span = $("<span>").append( text );
        $label = $("<label>");
        $label.append( $input ).append( $span );
        
        $functionsDiv.append( $label );
    }
    
    if ( i != self.categories.length ){
        
        var $functionsSelect = $("<select>");
        var $option = $("<option>").append( MathBar.selectMoreText );
        $option.attr( "disabled", true );
        $option.attr( "selected", true);
        $functionsSelect.append($option );
    
        for( var j = numberOfVIF; j < self.categories.length; j++){
            var func = MathBar.functions[self.categories[j]];
            var text = func["text"];
            $functionsSelect.append( $("<option>", {name: self.categories[j]}).append( text ) );
        }
    
        $functionsDiv.append( $("<label>").append($functionsSelect ));
        
    }
    
    var $submitButton = $("<button>", {class: "submitButton"} );
    $submitButton.click( function(){ self.Run() });
    
    var $mathRow = $("<tr>");
    $mathRow.append( $("<td>", {class: "functions"}).append($functionsDiv) );
    $mathRow.append( $("<td>", {class: "separator"}));
    $mathRow.append( $("<td>", {class: "parameters"}).append( $("<div>", {class: "parameters"})));
    $mathRow.append( $("<td>", {class: "submitButton"}).append( $submitButton ));
    

    var $mathBarTable = $("<table>").append( $mathRow );
    
    $( "#" + self.outputID ).after( $mathBarElement.append( $mathBarTable ));

    self.mathBarElement = $mathBarElement;
    self.Show();
    
    if ( numberOfVIF == self.categories.length ){
        $functionsDiv.parent().width( $functionsDiv.width() + 1 );
    }else{
        $functionsDiv.parent().width( $functionsDiv.width()  );
    }

    self.optionClicked( self.categories[0], true );
    
    if ( $functionsSelect ){
        $functionsSelect.selectmenu();
        $functionsSelect.on( "selectmenuselect", function( event, ui ) { self.optionClicked( $('option:selected', this).attr("name"), false )} );
    }

};

MathBar.ParseFunctions = function(){
    var keys = Object.keys( MathBar.categories );
    for ( var j = 0; j < keys.length; j++ ){
        var funcList = MathBar.categories[ keys[j] ];
        for (var i = 0; i < funcList.length; i++){
            var ff = MathBar.functions[ funcList[i] ];
            if ( ff == undefined ){
                console.error( "Function " + funcList[i] + " is not defined! (Function category: " +  functionType + ")");
            }
        }
    }
    var keys = Object.keys( MathBar.functions );
    for ( var j = 0; j < keys.length; j++ ){
        var func = MathBar.functions[ keys[j]];
        if ( func["text"] == undefined ){
            func["text"] = keys[j];
        }
        var parameters = func["parameters"];
        if ( parameters == undefined ){
            func["parameters"] = [];
        }
        for ( var i = 0; i < parameters.length; i++ ){
            MathBar.ParseParameter( parameters[i] );
        }
        if ( func["parser"] == undefined ){
            console.error( "Parser for function: " + keys[j] + " is undefined");
        }else{
            if( window[func["parser"]] == undefined ){
                console.error( "Parser: " + func["parser"] + " is undefined");
            }
        }
    }
}

MathBar.ParseParameter = function( parameter ){
    console.log( parameter );
    if ( parameter["parameterName"] == undefined ){
        console.error( "Name of parameter is undefined: " + parameter);
        parameter["parameterName"] = "undefined";
    }
    
    if ( parameter["text"] == undefined ){
        parameter["text"] = parameter["parameterName"];
    }
    
    if ( parameter["parameterType"] == undefined ){
        parameter["parameterType"] = "edit";
        console.warning( "Lack of type of parameter: " + parameter["parameterName"] );
    }
    
    if ( parameter["defaultValue"] == undefined ){
        switch( parameter["parameterType"] ){
            case "label":
                parameter["defaultValue"] = "";
                break;
            case "edit":
                parameter["defaultValue"] = "";
                break;
            case "checkbox":
                parameter["defaultValue"] = false;
                break;
            case "condition":
                parameter["defaultValue"] = false;
                break;
            case "select":
                parameter["defaultValue"] = [];
                break;
            default:
                console.error( "This paramter type is not implemented: "+ type + "!");
        }
        
    }
    
    var parameters = parameter["parameters"];
    if ( parameters != undefined ){
        for ( var i = 0; i < parameters.length; i++ ){
            MathBar.ParseParameter( parameters[i] );
        }
    }

}

MathBar.prototype.optionClicked = function( functionName, VIF ){

    console.log( "Option clicked: " + functionName ) ;
    
    if ( this.currentOptionVIF && functionName == MathBar.selectMoreText ) return;
    this.currentOptionVIF = VIF;
    this.currentOption = functionName;
    
    
    var $parametersElement = $(this.mathBarElement).find(".parameters");
    $parametersElement.html("");
    
    if ( functionName == MathBar.selectMoreText ) return;

    if ( !VIF ){
        $(this.mathBarElement).find( "input:checked" ).prop("checked", false);
        $(this.mathBarElement).find( "select").parent().addClass("checked");
    }else{
        $(this.mathBarElement).find( "select").parent().removeClass("checked");
    }
    
    var func = MathBar.functions[ functionName ];
    var parameters = func["parameters"];
    
    for ( var i = 0; i < parameters.length; i++ ){
        $parametersElement.append( this.getPropertyLabel( parameters[i]) );
    }
    
    $parametersElement.find("select").selectmenu();
};

MathBar.prototype.getPropertyLabel = function( parameter ){
    var $label = $("<label>");
    var type = parameter["parameterType"];

    var value = this.defaultParameters[parameter["parameterName"]];
    if( value == undefined ) value = parameter["defaultValue"];

    var text = parameter["text"];
    
    if ( type == "select" ){
        if ( value.length == 1 ){
            type = "label";
            value = value[0];
        }
    }

    if ( type == "label"){
        var $span = $("<span>", {class: "parameter", name: parameter["parameterName"]});
        $span.append( value );
        $label.append( text ).append( $span );
    }
    
    if ( type == "edit"){
        var $input = $("<input>", {type: "text", name: parameter["parameterName"]});
        $input.attr( "size", value.length*5 );
        $input.val( value );
        $label.append( text ).append( $input );
    }
    
    if ( type == "checkbox"){
        var $input = $("<input>", {type: "checkbox", name: parameter["parameterName"] });
        $input.prop( "checked", value);
        $label.append( $input ).append( text);
    }
    
    if ( type == "condition"){
        var $input = $("<input>", {type: "checkbox", name: parameter["parameterName"] });
        
        checked = value == "true" ;
        
        $input.change( function(){
                      $mathBarElement = $(this).parents(".MathBar:first");
                      MathBar.toggleParameters( $mathBarElement, parameter["parameterName"], !$(this).is(":checked"));
                    });

        $input.prop( "checked", checked );
        $label.append( $input ).append( text );
        
        var conditionalParameters = parameter["parameters"];
        var $outerlabel = $("<span>").append( $label );
        
        for ( var i = 0; i < conditionalParameters.length; i++ ){
            var $condparLabel = this.getPropertyLabel( conditionalParameters[i]);
            $condparLabel.addClass( "check_" + parameter["parameterName"]);
            
            if ( !checked ){
                $condparLabel.addClass( "labelDisabled" );
                $condparLabel.find("input").prop( "disabled", true );
                $condparLabel.find("select").prop( "disabled", true );
            }
            
            $outerlabel.append( $condparLabel );
        }
        
        $label = $outerlabel;
    }
    
   if ( type == "select"){
        
        var $select = $("<select>", { name: parameter["parameterName"] });
        
        for( var i = 0; i < value.length; i++){
            $select.append( $("<option>").append( value[i]) );
        }
        
        $label.append( text ).append( $select );
    }
    
    return $label;
};

MathBar.toggleParameters = function( $mathBarElement, parameterName, disabled ){
    $label =  $mathBarElement.find(".check_" + parameterName ).toggleClass( "labelDisabled", disabled );
    $label.find("input").prop( "disabled", disabled );
    if ( disabled )
        $label.find("select").selectmenu( "disable" );
    else
        $label.find("select").selectmenu( "enable" );
}

MathBar.prototype.GetPropertyValue = function( parameter, outValues ){
    var type = parameter["parameterType"];
    var parameterName = parameter["parameterName"];
    
    var $element = this.mathBarElement.find( "[name='" + parameterName + "']:first" );
    
    switch( type ){
        case "label":
            outValues[ parameterName ] = $element.text();
            break;
        case "edit":
            outValues[ parameterName ] = $element.val();
            break;
        case "checkbox":
            outValues[ parameterName ] = $element.prop("checked");
            break;
        case "condition":
            outValues[ parameterName ] = $element.prop("checked");
        
            conditionalParameters = parameter["parameters"];
            for ( var i = 0; i < conditionalParameters.length; i++ ){
                this.GetPropertyValue( conditionalParameters[i], outValues );
            }
            break;
        case "select":
            if ( $element.val() != "") outValues[ parameterName ] = $element.val();
            else outValues[ parameterName ] = $element.text();
            break;
        default:
            console.error( "This paramter type is not implemented: "+ type + "!");
    }
}

MathBar.prototype.Run = function(){
    
    var func = MathBar.functions[this.currentOption];
    
    var parameters = func["parameters"];
    var outValues = [];
    
    for ( var i = 0; i < parameters.length; i++ ){
        this.GetPropertyValue( parameters[i], outValues );
    }
    
    var parser = func["parser"];
    var result = window[parser](this.outputValue, outValues);
    
    this.callback( result );
    this.Hide();
}

MathBar.prototype.Remove = function(){
    this.button.mathBar = null;
    this.mathBarElement.slideUp(300, function(){ this.remove() ;} );
    $(this.button).removeClass("up");
}

MathBar.prototype.Show = function(){
    this.visible = true;
    this.mathBarElement.slideDown(300);
    $(this.button).addClass("up");
}

MathBar.prototype.Hide = function(){
    this.visible = false;
    this.mathBarElement.slideUp(300);
    $(this.button).removeClass("up");
}

MathBar.prototype.Toggle = function(){
    if ( this.visible ) this.Hide();
    else this.Show();
    
}

MathBar.initializeFunctions = function(jsonfile){    
    $.getJSON( "javascript/functions.json", function( data ) {
              MathBar.functions = data["functions"];
              MathBar.categories = data["categories"];
              MathBar.ParseFunctions();
              });
}

MathBar.supportsExpressionType = function( expressionType, numberOfVariables ){
    if ( numberOfVariables > 0 ){
        expressionType += "_" + numberOfVariables;
    }
    
    if( MathBar.categories[expressionType] != undefined ){
        return true;
    }
    return false;
}
