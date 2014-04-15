/*
 * Autosize textarea for Jeditable dedicated for YAGY
 *
 *
 */
 
$.editable.addInputType('autogrow', {
    element : function(settings, original) {
        var textarea = $('<textarea />');
        if (settings.rows) {
            textarea.attr('rows', settings.rows);
        } else {
            textarea.height(settings.height);
        }
        if (settings.cols) {
            textarea.attr('cols', settings.cols);
        } else {
            textarea.width(settings.width);
        }
        $(this).append(textarea);
        return(textarea);
    },
    plugin : function(settings, original) {
        form = this;
        $('textarea', this).autosize();
        $('textarea', this).bind('keypress', function (e) {
                                 if( e.which == 13 && e.shiftKey ){
                                    form.submit();
                                 }
                                 if( e.which == 13 ){
                                    e.preventDefault();
                                 }
                                 });
    }
});
