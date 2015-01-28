// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: http://codemirror.net/LICENSE

(function (mod) {
    if (typeof exports == "object" && typeof module == "object") // CommonJS
        mod(require("../../lib/codemirror"));
    else if (typeof define == "function" && define.amd) // AMD
        define(["../../lib/codemirror"], mod);
    else // Plain browser env
        mod(CodeMirror);
})(function (CodeMirror) {
    "use strict";

    CodeMirror.defineMode("yacas", function () {

        function wordRegexp(words) {
          return new RegExp("^((" + words.join(")|(") + "))\\b");
        }

        var builtins = wordRegexp([
          'Eval', 'Abs', 'ArcCos', 'Cos',
          'Exp', 'Log', 'Sum', 'Max', 'Min', 'Sign', 'Sin',
          'Sqrt'
        ]);

        var keywords = wordRegexp([
          'If', 'While', 'Until', 'For', 'ForEach', 'Local', 'LocalSymbols'
        ]);

        // tokenizers
        function tokenComment(stream, state) {
            while (!stream.eol()) {
                if (stream.next() === '*' && stream.peek() === '/') {
                    stream.next();
                    state.tokenize = tokenBase;
                    return 'comment';
                }
            }
            
            return 'comment';
        }
        
        
        
        function tokenBase(stream, state) {
            // whitespace
            if (stream.eatSpace())
                return null;

            // one line comment
            if (stream.match(/^\/\//)) {
                stream.skipToEnd();
                return 'comment';
            }
            
            // block comment
            if (stream.match(/^\/\*/)) {
                state.tokenize = tokenComment;
                return tokenComment(stream, state);
            }

            // number literal
            if (stream.match(/^[0-9\.+-]/, false)) {
                if (stream.match(/^[+-]?0x[0-9a-fA-F]+[ij]?/))
                    return 'number';
                if (stream.match(/^[+-]?\d*\.\d+([EeDd][+-]?\d+)?[ij]?/))
                    return 'number';
                if (stream.match(/^[+-]?\d+([EeDd][+-]?\d+)?[ij]?/))
                    return 'number';
            }
            
            // string
            if (stream.match(/^"(?:[^"\\]|\\.)*"/)) {
                return 'string';
            }

            // function or macro call
            if (stream.match(/^[a-zA-Z][a-zA-Z0-9]*\s*\(/, false)) {
                if (stream.match(keywords))
                    return 'keyword';
                if (stream.match(builtins))
                    return 'builtin';
                stream.match(/^[a-zA-Z][a-zA-Z0-9]*/);
                return null;
            }

            // operators
            if (stream.match(/^[\\+\\-\\*/\\^=<>]|(:=)|(<=)|(>=)|(==)/))
                return 'operator';

            // variables
            if (stream.match(/^[a-zA-Z][a-zA-Z0-9]*/)) {
                return 'variable';
            }

            // anything else
            stream.next();
            return null;
        }
        ;


        return {
            startState: function () {
                return {
                    tokenize: tokenBase,
                    scopes: []
                };
            },
            
            token: function (stream, state) {
                var style = state.tokenize(stream, state);
                return style;
            },

            lineComment: '',
            blockCommentStart: '',
            blockCommentEnd: '',
            fold: "indent",
            electricChars: "]}"
        };
    });

    CodeMirror.defineMIME("text/x-yacas", "yacas");

});
