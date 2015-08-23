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
    variable = parameters["Variable"];
    return "Integrate("+ variable +")" + outputValue;
}

function derivative_parser( outputValue, parameters ){
    console.log( "This is derivative parser");
    variable = parameters["Variable"];
    return "D("+ variable +")" + outputValue;
}

function plot_2d_parser( outputValue, parameters ){
    console.log( "This is Plot 2D parser");
    range = parameters["Range"];
    return "Plot2D(" + outputValue + "," + range + ")";
}