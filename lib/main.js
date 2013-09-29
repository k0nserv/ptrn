(function() {
    "use strict";

    var ptrn = require("./ptrn.js");

    var hello = ptrn({
        'string': function(str) {
            return 'Hello, ' + str + '!';
        }
    });

    console.log(hello("world")); // "Hello, world!"

    var fib = ptrn({
        'number#{0}': 1, // Pattern matched specialisation
        'number#{1}': 1, // -- || -- || -- || -- || -- || --
        'number': function(n) { // General case implementation
            return fib(n - 1) + fib(n - 2);
        }
    });

    console.log(fib(5)); //8

    var log = ptrn({
        'string': console.log,
        'number': console.log,
        'boolean': console.log,
        'function': console.dir,
        'object': console.dir
    });

    log(10);
    log(function() {
        return 10;
    });

    var f = ptrn({
        '*': function(n) { //Single argument
            return 'Single';
        },
        '* -> *': function(a, b) { //Dual argument
            return "Dual";
        },
        '* -> * -> *': function(a, b, c) { //Tripple argument
            return "Tripple";
        }
    });

    console.log(f(1));
    console.log(f(1, 2));
    console.log(f(1, 2, 3));
}());