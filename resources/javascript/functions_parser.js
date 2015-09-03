function square_root_parser( outputValue, parameters ){
    console.log( "This is squre root parser");
    return "Sqrt(" + outputValue + ")";
}

function simplify_parser( outputValue, parameters ){
    console.log( "This is simplify parser");
    return "Simplify(" + outputValue + ")";
}

function integrate_parser( outputValue, parameters ){
    console.log( "This is integrate parser");
    variable = parameters["variable"];
    
    definite = parameters["definite"];
    
    if ( definite ){
        to = parameters["to"];
        from = parameters["from"];
        return "Integrate("+ variable + "," + from + "," + to + ")" + outputValue;
    }else{
        return "Integrate("+ variable +")" + outputValue;
    }
}

function derivative_parser( outputValue, parameters ){
    console.log( "This is derivative parser");
    variable = parameters["variable"];
    return "D("+ variable +")" + outputValue;
}

function plot_2d_parser( outputValue, parameters ){
    console.log( "This is Plot 2D parser");
    
    from = parameters["from"];
    to = parameters["to"];
    
    
    return "Plot2D(" + outputValue + "," + from + ":" + to + ")";
}

function plot_3d_parser( outputValue, parameters ){
    console.log( "This is Plot 3D parser");
    return "Plot3DS(" + outputValue + ")";
}

