(function () {
    "use strict";

    var ptrn = require("../lib/ptrn.js");

    describe("Simple usage", function () {
        var spy, helper;

        beforeEach(function () {
            spy = {
                f: function () {}
            };
        });

        helper = function (type, value) {
            var args, longString, func, params;

            longString = '' + type + '->' + type + '->' + type;

            params = {};
            params[type] = function(n) {
                spy.f();
                expect(typeof n).toEqual(type);
            };
            params[longString] = function(a, b, c) {
                spy.f();
                args = Array.prototype.slice.call(arguments);
                args.map(function(a) {
                    expect(typeof a).toEqual(type);
                });
            };

            func = ptrn(params);

            spyOn(spy, 'f');
            func(value);
            func(value, value, value);
            expect(spy.f).toHaveBeenCalled();
            expect(spy.f.callCount).toEqual(2);
        };

        it("handles numbers", function () {
            helper("number", 10);
        });

        it("handles strings", function () {
            helper("string", "hello");
        });

        it("handles objects", function () {
            helper("object", {});
        });

        it("handles functions", function () {
            helper("function", function () {});
        });
    });

    describe("Value matching", function () {
        var spy;

        beforeEach(function () {
            spy = {
                f: function () {}
            };
        });

        it("handles simples value matching", function () {
            var func = ptrn({
                'number#{0}': function (n) {
                    spy.f();
                    expect(n).toEqual(0);
                },
                'string#{hello}': function (s) {
                    spy.f();
                    expect(s).toEqual("hello");
                }
            }),
            //Has caused call stack exploding previously
            fib  = ptrn({
                'number#{0}': function () { return 0; },
                'number#{1}': function () { return 1; },
                'number': function (n) { return fib(n - 1) + fib(n - 2); }
            });

            spyOn(spy, 'f');
            func(0);
            fib(10);
            func("hello");
            expect(spy.f).toHaveBeenCalled();
            expect(spy.f.callCount).toEqual(2);
        });

        it("handles nested value matching", function () {
            var func = ptrn({
                'number#{0}->number#{1}': function (a, b) {
                    spy.f();
                    expect(a).toEqual(0);
                    expect(b).toEqual(1);
                },
                'string#{hello}->string#{hejsan}': function (a, b) {
                    spy.f();
                    expect(a).toEqual("hello");
                    expect(b).toEqual("hejsan");
                }
            });

            spyOn(spy, 'f');
            func(0, 1);
            func("hello", "hejsan");
            expect(spy.f).toHaveBeenCalled();
            expect(spy.f.callCount).toEqual(2);
        });
    });

    describe("Whitespace support", function () {
        var spy;

        beforeEach(function () {
            spy = {
                f: function () {}
            };
        });

        it("supports whitespace before and after types", function () {
            var func = ptrn({
                ' number ': function (n) {
                    spy.f();
                    expect(typeof n).toEqual("number");
                },
                ' number -> number ': function (a, b) {
                    spy.f();
                    expect(typeof a).toEqual("number");
                    expect(typeof b).toEqual("number");
                }
            });

            spyOn(spy, 'f');
            func(1);
            func(1, 2);
            expect(spy.f).toHaveBeenCalled();
            expect(spy.f.callCount).toEqual(2);
        });

        it("supports whitespace with value matching", function () {
            var func = ptrn({
                'number#{0}': function (n) {
                    spy.f();
                    expect(n).toEqual(0);
                },
                ' number#{0} -> number#{1} ': function (a, b) {
                    spy.f();
                    expect(a).toEqual(0);
                    expect(b).toEqual(1);
                }
            });

            spyOn(spy, 'f');
            func(0);
            func(0, 1);
            expect(spy.f).toHaveBeenCalled();
            expect(spy.f.callCount).toEqual(2);
        });
    });

    describe("Non function return values", function () {
        it("supports numbers as direct values", function () {
            var func = ptrn({
                'number#{0}': 10,
                'number#{10}': 100
            });

            expect(func(0)).toEqual(10);
            expect(func(10)).toEqual(100);
        });

        it("supports string as direct values", function () {
            var word,
            func = ptrn({
                'number': word
            });

            expect(func(0)).toEqual(word);
        });

        it("supports objects as direct values", function () {
            var obj = {a: 10},
                arr = [10, 20, 30],

                func = ptrn({
                    'number#{0}': obj,
                    'number#{1}': arr
                });

            expect(func(0)).toEqual(obj);
            expect(func(1)).toEqual(arr);
        });
    });

    describe("Wildcard support", function () {
        var spy;

        beforeEach(function () {
            spy = {
                f: function () {}
            };
        });

        it("supports wildcards", function () {
            var
            ret  = ['a', 'b'],
            func = ptrn({
                '*': function () {
                    spy.f();

                    return ret[0];
                }
            }),
            func1 = ptrn({
                '*': ret[1]
            }),
            res = [];

            spyOn(spy, 'f');
            res[0]  = func('a single argument');
            res[1]  = func1(10);

            expect(res[0]).toEqual(ret[0]);
            expect(res[1]).toEqual(ret[1]);

            expect(spy.f).toHaveBeenCalled();
        });
    });
} ());