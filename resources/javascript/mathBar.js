MathBar.selectMoreText = "more";
MathBar.functions;
MathBar.categories;

//VIF - Very Importatnt Function
function MathBar( outputID, options, button, callback ) {
    var self = this;
    var numberOfVIF = options["VIF"];
    
    self.outputID = outputID;
    self.functions = self.getFunctions( options["type"] );
    self.defaultParameters = options["defaultParameters"];
    self.button = button;
    self.currentOption = 0;
    self.currentOptionVIF = true;
    self.callback = callback;
    self.visible = false;
    self.outputValue = $("#" + outputID)[0].yacasExpression;
    
    var $mathBarElement = $( "<div>" , { class: "MathBar" } ).hide();
    var $functionsDiv = $("<div>", {class : "radio_group_horizontal styled_radio"});
    
    //In case number of all functions is 1 more than VIF do not display combobox with only one function
    //but treat all of them as VIFs
    
    if ( numberOfVIF > self.functions.length ) numberOfVIF = self.functions.length;
    
    if ( self.functions.length - numberOfVIF == 1 ){
        numberOfVIF++;
    }
    
    for( var i = 0; i < numberOfVIF; i++){
        var text = self.functions[i]["text"];
        if ( text == undefined ) text = self.functions[i]["functionName"];
        
        var $input = $("<input>", { type: "radio", name: outputID, value: self.functions[i]["functionName"]})
        
        if ( i == 0 ) $input.prop( "checked", true );
        
        $input.click( function(){ self.optionClicked( this.value, true )});
        
        $span = $("<span>").append( text );
        $label = $("<label>");
        $label.append( $input ).append( $span );
        
        $functionsDiv.append( $label );
    }
    
    if ( i != self.functions.length ){

        var $functionsSelect = $("<select>");
        var $option = $("<option>").append( MathBar.selectMoreText );
        $option.attr( "disabled", true );
        $option.attr( "selected", true);
        $functionsSelect.append($option );
    
        for( var j = numberOfVIF; j < self.functions.length; j++){
            var text = self.functions[j]["text"];
            if ( text == undefined ) text = self.functions[j]["functionName"];

            $functionsSelect.append( $("<option>", {name: self.functions[j]["functionName"]}).append( text ) );
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
    
    if ( numberOfVIF == self.functions.length ){
        $functionsDiv.parent().width( $functionsDiv.width() + 1 );
    }else{
        $functionsDiv.parent().width( $functionsDiv.width()  );
    }

    self.optionClicked( self.functions[0]["functionName"], true );
    
    if ( $functionsSelect ){
        $functionsSelect.selectmenu();
        $functionsSelect.on( "selectmenuselect", function( event, ui ) { self.optionClicked( $('option:selected', this).attr("name"), false )} );
    }

};

MathBar.prototype.getFunctions = function( functionType ){
    var func = [];
    var funcList = MathBar.categories[ functionType ];
    for (var i = 0; i < funcList.length; i++){
        var ff = MathBar.functions[ funcList[i] ];
        if ( ff == undefined ){
            console.error( "Function " + funcList[i] + " is not defined! (Function category: " +  functionType + ")");
            continue;
        }
        ff["functionName"] = funcList[i];
        func.push(ff);
    }
    return func;
}

MathBar.prototype.optionClicked = function( functionName, VIF ){

    console.log( "Option clicked: " + functionName ) ;
    
    if ( self.currentOptionVIF && functionName == MathBar.selectMoreText ) return;
    self.currentOptionVIF = VIF;
    
    var $parametersElement = $(this.mathBarElement).find(".parameters");
    $parametersElement.html("");
    
    if ( functionName == MathBar.selectMoreText ) return;

    if ( !VIF ){
        $(this.mathBarElement).find( "input:checked" ).prop("checked", false);
        $(this.mathBarElement).find( "select").parent().addClass("checked");
    }else{
        $(this.mathBarElement).find( "select").parent().removeClass("checked");
    }
    
    for( var i = 0; i < this.functions.length; i++ ){
        if( this.functions[i]["functionName"] == functionName ){
            var parameters = this.functions[i]["parameters"];
            break;
        }
    }
    this.currentOption = i;

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
    if( value == undefined ) value = "";

    var text = parameter["text"];
    if ( text == undefined ) text = parameter["parameterName"];
    
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
    
    
    if ( type == "label" ){
        outValues[ parameterName ] = this.mathBarElement.find( "[name='" + parameterName + "']:first" ).text();
    }
    
    if ( type == "edit" ){
        outValues[ parameterName ] = this.mathBarElement.find( "[name='" + parameterName + "']:first" ).val();
    }
    if ( type == "checkbox" ){
        outValues[ parameterName ] = this.mathBarElement.find( "[name='" + parameterName + "']:first" ).prop("checked");
    }
    
    if ( type == "condition" ){
        outValues[ parameterName ] = this.mathBarElement.find( "[name='" + parameterName + "']:first" ).prop("checked");
        conditionalParameters = parameter["parameters"];
        for ( var i = 0; i < conditionalParameters.length; i++ ){
          this.GetPropertyValue( conditionalParameters[i], outValues );
        }
    }
    
    if ( type == "select" ){
        $select = this.mathBarElement.find( "[name='" + parameterName + "']:first" );
        if ( $select.val() != ""){
            outValues[ parameterName ] = $select.val();
        }else{
            outValues[ parameterName ] = $select.text();
        }

    }
}

MathBar.prototype.Run = function(){
    
    var parameters = this.functions[this.currentOption]["parameters"];
    var outValues = [];
    
    for ( var i = 0; i < parameters.length; i++ ){
        this.GetPropertyValue( parameters[i], outValues );
    }
    
    var parser = this.functions[this.currentOption]["parser"];
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
