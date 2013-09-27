(function () {
    "use strict";

    var ptrn = require("../lib/ptrn.js").ptrn;

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
            });

            spyOn(spy, 'f');
            func(0);
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
} ());