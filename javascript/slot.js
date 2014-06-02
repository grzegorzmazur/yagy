function Plot3D(series, w, h) {
    var self = this;
    
    var data = series[0]["data"];

    self.xmin = data[0][0];
    self.xmax = data[0][0];

    self.ymin = data[0][1];
    self.ymax = data[0][1];

    self.zmin = data[0][2];
    self.zmax = data[0][2];

    for (var i = 1; i < data.length; ++i) {
        if (data[i][0] < self.xmin)
            self.xmin = data[i][0];
        if (data[i][0] > self.xmax)
            self.xmax = data[i][0];
        if (data[i][1] < self.ymin)
            self.ymin = data[i][1];
        if (data[i][1] > self.ymax)
            self.ymax = data[i][1];
        if (data[i][2] < self.zmin)
            self.zmin = data[i][2];
        if (data[i][2] > self.zmax)
            self.zmax = data[i][2];
    }

    self.size = 500;

    self.xscale = self.size / (self.xmax - self.xmin);
    self.yscale = self.size / (self.ymax - self.ymin);
    self.zscale = self.size / (self.zmax - self.zmin);

    self.xoffset = -self.size / 2;
    self.yoffset = -self.size / 2;
    self.zoffset = -self.size / 2;

    self.scene = new THREE.Scene();

    self.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 2000);
    self.camera.position.z = 1000;

    var geometry = new THREE.Geometry();

    for (var i = 0; i < data.length - 2; ++i) {
        var p0 = data[i];
        var p1 = data[i + 1];

        if (p0[0] !== p1[0])
            continue;

        var p2 = null;
        var p3 = null;

        for (var j = i + 2; j < data.length; ++j) {
            if (p2 === null && data[j][1] == p0[1])
                p2 = data[j];

            if (p3 === null && data[j][1] == p1[1])
                p3 = data[j];

            if (p2 !== null && p3 !== null)
                break;
        }

        if (p2 === null)
            continue;

        geometry.vertices.push(self.g2w(p0[0], p0[1], p0[2]));
        geometry.vertices.push(self.g2w(p1[0], p1[1], p1[2]));
        geometry.vertices.push(self.g2w(p2[0], p2[1], p2[2]));

        geometry.faces.push(new THREE.Face3(geometry.vertices.length - 3, geometry.vertices.length - 2, geometry.vertices.length - 1));

        if (p3 === null)
            continue;

        geometry.vertices.push(self.g2w(p3[0], p3[1], p3[2]));

        // note: the orientation of the face is opposite to the previous one
        geometry.faces.push(new THREE.Face3(geometry.vertices.length - 3, geometry.vertices.length - 2, geometry.vertices.length - 1));
    }

    var material = new THREE.MeshBasicMaterial({
        color: 0xff0000,
        wireframe: true,
        side: THREE.DoubleSide
    });
    var mesh = new THREE.Mesh(geometry, material);

    self.scene.add(mesh);

    material = new THREE.LineBasicMaterial({color: 0x000000});
    geometry = new THREE.Geometry();

    geometry.vertices.push(new THREE.Vector3(-self.size / 2, -self.size / 2, -self.size / 2));
    geometry.vertices.push(new THREE.Vector3(self.size / 2, -self.size / 2, -self.size / 2));

    var line = new THREE.Line(geometry, material);

    self.scene.add(line);

    geometry = new THREE.Geometry();

    geometry.vertices.push(new THREE.Vector3(-self.size / 2, -self.size / 2, -self.size / 2));
    geometry.vertices.push(new THREE.Vector3(-self.size / 2, self.size / 2, -self.size / 2));

    line = new THREE.Line(geometry, material);

    self.scene.add(line);

    geometry = new THREE.Geometry();

    geometry.vertices.push(new THREE.Vector3(-self.size / 2, -self.size / 2, -self.size / 2));
    geometry.vertices.push(new THREE.Vector3(-self.size / 2, -self.size / 2, self.size / 2));

    var line = new THREE.Line(geometry, material);

    self.scene.add(line);

    var x_params = self.axis_params(self.xmin, self.xmax);

    for (var t = x_params.b; t <= x_params.e; t += x_params.d) {
        var tb = self.g2w(t, self.ymin, self.zmin);
        tb.y = -self.size / 2;
        tb.z = -self.size / 2;
        var te = tb.clone();
        te.y += self.size / 50;
        geometry = new THREE.Geometry();
        geometry.vertices.push(tb);
        geometry.vertices.push(te);
        te = tb.clone();
        te.z += self.size / 50;
        geometry.vertices.push(tb);
        geometry.vertices.push(te);
        var line = new THREE.Line(geometry, material);
        self.scene.add(line);

        var tn = new Number(t);
        var l = self.label(tn.toFixed(2));
        l.position.set(tb.x, -self.size / 2, -self.size / 2);
        self.scene.add(l);
    }

    var y_params = self.axis_params(self.ymin, self.ymax);

    for (var t = y_params.b; t <= y_params.e; t += y_params.d) {
        var tb = self.g2w(self.xmin, t, self.zmin);
        tb.x = -self.size / 2;
        tb.z = -self.size / 2;
        var te = tb.clone();
        te.x += self.size / 50;
        geometry = new THREE.Geometry();
        geometry.vertices.push(tb);
        geometry.vertices.push(te);
        te = tb.clone();
        te.z += self.size / 50;
        geometry.vertices.push(tb);
        geometry.vertices.push(te);
        var line = new THREE.Line(geometry, material);
        self.scene.add(line);

        if (t != y_params.b) {
            var tn = new Number(t);
            var l = self.label(tn.toFixed(2));
            l.position.set(-self.size / 2, tb.y, -self.size / 2);
            self.scene.add(l);
        }
    }

    var z_params = self.axis_params(self.zmin, self.zmax);

    for (var t = z_params.b; t <= z_params.e; t += z_params.d) {
        var tb = self.g2w(self.xmin, self.ymin, t);
        tb.x = -self.size / 2;
        tb.y = -self.size / 2;
        var te = tb.clone();
        te.x += self.size / 50;
        geometry = new THREE.Geometry();
        geometry.vertices.push(tb);
        geometry.vertices.push(te);
        te = tb.clone();
        te.y += self.size / 50;
        geometry.vertices.push(tb);
        geometry.vertices.push(te);
        var line = new THREE.Line(geometry, material);
        self.scene.add(line);

        var tn = new Number(t);
        var l = self.label(tn.toFixed(2));
        l.position.set(-self.size / 2, -self.size / 2, tb.z + 40);
        self.scene.add(l);
    }

    self.renderer = new THREE.WebGLRenderer();
    self.renderer.setClearColor(0xffffff, 1);
    self.renderer.setSize(w, h);
}

Plot3D.prototype.g2w = function (x, y, z) {
    return new THREE.Vector3((x - this.xmin) * this.xscale + this.xoffset,  (y - this.ymin) * this.yscale + this.yoffset, (z - this.zmin) * this.zscale + this.zoffset);
}


Plot3D.prototype.axis_params = function (min, max) {
    var delta = max - min;

    var scale = Math.pow(10, Math.floor((Math.round(Math.log(delta) / Math.LN10 * 1e6) / 1e6) - 1));
    var b = Math.ceil(min / scale) * scale;
    var e = Math.floor(max / scale) * scale;
    var d = Math.floor((e - b) / (10 * scale)) * scale;

    return { b: b, e: e, d: d };
}

Plot3D.prototype.label = function (text) {
    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');
    var font_size = 256;
    context.font = "normal " + font_size + "px Arial";

    var text_width = context.measureText(text).width;
    var text_height = 200;

    canvas.width = text_width;

    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillStyle = "#000000";
    context.fillText(text, text_width / 2, text_height / 2);

    var texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;

    var material = new THREE.SpriteMaterial({
        map: texture,
        useScreenCoordinates: false,
        transparent: true
    });

    var sprite = new THREE.Sprite(material);
    sprite.scale.set(text_width / text_height * font_size, font_size, 1);

    return sprite;
}

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
