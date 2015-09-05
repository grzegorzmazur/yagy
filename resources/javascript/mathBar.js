var selectMoreText = "more";
var functions;
var categories;

//VIF - Very Importatnt Function
function MathBar( outputID, options, button, callback ) {
    var self = this;
    
    numberOfVIF = options["VIF"];
    
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
        if ( text == undefined ){
            text = self.functions[i]["functionName"];
        }
        $input = $("<input>", { type: "radio", name: outputID, value: self.functions[i]["functionName"]})
        
        if ( i == 0 ) $input.prop( "checked", true );
        
        $input.click( function(){ self.optionClicked( this.value, true )});
        

        
        $span = $("<span>").append( text );
        
        $label = $("<label>");
        $label.append( $input );
        $label.append( $span );
        
        $functionsDiv.append( $label );
    }
    
    if ( i != self.functions.length ){

    
        var $functionsSelect = $("<select>");
        $option = $("<option>").append( selectMoreText );
        $option.attr( "disabled", true );
        $option.attr( "selected", true);
        $functionsSelect.append($option );
    
        for( var j = numberOfVIF; j < self.functions.length; j++){
            var text = self.functions[j]["text"];
            if ( text == undefined ){
                text = self.functions[j]["functionName"];
            }
            $functionsSelect.append( $("<option>", {name: self.functions[j]["functionName"]}).append( text ) );
        }
    
        $functionsDiv.append( $("<label>").append($functionsSelect ));
        
    }
    

    
    $submitButton = $("<button>", {class: "submitButton"} );
    $submitButton.click( function(){ self.Run() });
    
    
    $mathRow = $("<tr>");
    $mathRow.append( $("<td>", {class: "functions"}).append($functionsDiv) );
    $mathRow.append( $("<td>", {class: "separator"}));
    $mathRow.append( $("<td>", {class: "parameters"}).append( $("<div>", {class: "parameters"})));
    $mathRow.append( $("<td>", {class: "submitButton"}).append( $submitButton ));
    

    $mathBarTable = $("<table>").append( $mathRow );
    
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
    funcList = categories[ functionType ];
    for (var i = 0; i < funcList.length; i++){
        ff = functions[ funcList[i] ];
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
    
    if ( self.currentOptionVIF && functionName == selectMoreText ) return;
    self.currentOptionVIF = VIF;
    
    var $parametersElement = $(this.mathBarElement).find(".parameters");
    $parametersElement.html("");
    
    if ( functionName == selectMoreText ) return;

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
    var defaultValue;
    var text;
    
    var type = parameter["parameterType"];
    
    if( this.defaultParameters[parameter["parameterName"]] != undefined ){
        defaultValue = this.defaultParameters[parameter["parameterName"]];
    }else{
        defaultValue = parameter["defaultValue"];
    }
    
    if( parameter["text"] != undefined ){
        text = parameter["text"];
    }else{
        text = parameter["parameterName"];
    }
    
    if ( type == "select" ){
        if (defaultValue.length == 1 ){
            type = "label";
            defaultValue = defaultValue[0];
        }
    }

    if ( type == "label"){
        
        $span = $("<span>", {class: "parameter", name: parameter["parameterName"]});
        $span.append( defaultValue );
        
        $label.append( text );
        $label.append( $span );
    }
    
    
    
    if ( type == "edit"){
        
        $input = $("<input>", {type: "text", name: parameter["parameterName"]});
        $input.attr( "size", defaultValue.length*5 );
        $input.val( defaultValue );
        
        $label.append( text );
        $label.append( $input );
    }
    
    if ( type == "checkbox"){
        
        $input = $("<input>", {type: "checkbox", name: parameter["parameterName"] });
        $input.prop( "checked", defaultValue);
        $label.append( $input );
        $label.append( text);
    }
    
    if ( type == "condition"){
        $input = $("<input>", {type: "checkbox", name: parameter["parameterName"] });
        
        if ( defaultValue == "true" ){
            checked = true;
        }else{
            checked = false;
        }
        
        $input.change( function(){
                      $mathBarElement = $(this).parents(".MathBar:first");
                      if( $(this).is(":checked")){
                        MathBar.enableParameters( $mathBarElement, parameter["parameterName"] );
                      }else{
                        MathBar.disableParameters( $mathBarElement, parameter["parameterName"] );
                      }
                      });

        $input.prop( "checked", checked );
        $label.append( $input );
        $label.append( text );
        
        conditionalParameters = parameter["parameters"];
        var $outerlabel = $("<span>").append( $label );
        
        
        for ( var i = 0; i < conditionalParameters.length; i++ ){
            $condparLabel = this.getPropertyLabel( conditionalParameters[i]);
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
        
        for( var i = 0; i < defaultValue.length; i++){
            $select.append( $("<option>").append( defaultValue[i]) );
        }
        
        $label.append( text );
        $label.append( $select );
    }
    
    return $label;
};

 MathBar.disableParameters = function( $mathBarElement, parameterName ){
    $label =  $mathBarElement.find(".check_" + parameterName ).addClass( "labelDisabled" );
    $label.find("input").prop( "disabled", true );
    $label.find("select").selectmenu( "disable" );
}

MathBar.enableParameters = function( $mathBarElement, parameterName ){
    $label =  $mathBarElement.find(".check_" + parameterName ).removeClass( "labelDisabled" );
    $label.find("input").prop( "disabled", false );
    $label.find("select").selectmenu( "enable" );
}


MathBar.prototype.GetPropertyValue = function( parameter, outValues ){
    type = parameter["parameterType"];
    parameterName = parameter["parameterName"];
    
    
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
    result = window[parser](this.outputValue, outValues);
    
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
              functions = data["functions"];
              categories = data["categories"];
              });
}

MathBar.supportsExpressionType = function( expressionType, numberOfVariables ){
    if ( numberOfVariables > 0 ){
        expressionType += "_" + numberOfVariables;
    }
    
    if( categories[expressionType] != undefined ){
        return true;
    }
    return false;
}
