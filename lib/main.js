(function () {
    "use strict";

    var ptrn = require("./ptrn.js"),
        fib  = ptrn({
            'number#{0}': function () { return 0; },
            'number#{1}': function () { return 1; },
            'number': function (n) { return fib(n - 1) + fib(n - 2); }
        }),
        test = ptrn({
            'number#{0}->number#{10}': function (a, b) {
            }
        });

    test(0, 10);

    console.log(fib(11));
} ());