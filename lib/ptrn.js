(function () {
    "use strict";

    var
        SEPERATOR_REGEX     = /^\-\>/,
        TYPE_REGEX          = /^[A-z]+/,
        VALUE_REGEX         = /^#{(.+?)}/,
        WHITESPACE_REGEX    = /^[\ \t]+/,

        consume = function (string) {
            var result = {
                type:   undefined,
                value:  undefined,
                left:   undefined
            },
            intermediateResult;

            //Consume leading whitespace
            string = consumeWhitespace(string).left;

            intermediateResult = consumeType(string);
            string             = intermediateResult.left;
            result.type        = intermediateResult.result;

            string = consumeWhitespace(string).left;

            intermediateResult = consumeValue(string);
            string             = intermediateResult.left;
            result.value       = intermediateResult.result;

            string = consumeWhitespace(string).left;
            intermediateResult = consumeSeparator(string);
            string             = intermediateResult.left;


            result.left = consumeWhitespace(string).left;


            return result;
        },

        consumeType = function (string) {
            var found = string.match(TYPE_REGEX);

            if (found) {
                return {
                    result: found[0],
                    consumed: found[0].length,
                    left: string.substring(found[0].length)
                };
            }

            return {
                result: undefined,
                consumed: 0,
                left: string
            };
        },

        consumeValue = function (string) {
            var found = string.match(VALUE_REGEX),
                value = undefined;

            if (found) {
                if (found[1] === "true" || found[1] === "false") {
                    value = found[1] === "true";
                }
                else if (!isNaN(parseInt(found[1], 10))) {
                    value = parseInt(found[1], 10);
                }
                else {
                    value = found[1];
                }

                return {
                    result: value,
                    consumed: found[0].length,
                    left: string.substring(found[0].length)
                };
            }

            return {
                result: undefined,
                consumed: 0,
                left: string
            };
        },

        consumeSeparator = function (string) {
            var found = string.match(SEPERATOR_REGEX);

            if (found) {
                return {
                    consumed: found[0].length,
                    left: string.substring(found[0].length)
                };
            }

            return {
                consumed: 0,
                left: string
            };
        },

        consumeWhitespace = function (string) {
            var found = string.match(WHITESPACE_REGEX);

            if (found) {
                return {
                    consumed: found[0].length,
                    left: string.substring(found[0].length)
                };
            }

            return {
                consumed: 0,
                left: string
            };
        },

        ptrn = function ptrn (hash) {
            var struct = {},
                k, i, types, match, current, consumeResult;

            for (k in hash) {
                if (hash.hasOwnProperty(k)) {
                    match   = k;
                    current = struct;

                    do {
                        consumeResult = consume(match);

                        if (consumeResult.type && !current[consumeResult.type]) {
                            current[consumeResult.type] = {};
                        }
                        current = current[consumeResult.type];

                        if (typeof consumeResult.value !== "undefined") {
                            if (typeof current["__values"] === "undefined") {
                                current["__values"] = {};
                            }

                            if (typeof current["__values"][consumeResult.value] === "undefined") {
                                current["__values"][consumeResult.value] = {};
                            }
                            current = current["__values"][consumeResult.value]
                        }
                        match = consumeResult.left;
                    } while(match.length != 0);

                    current["__fn"] = hash[k];
                }
            }

            return function () {
                var argc = arguments.length,
                    i,
                    arg,
                    type,
                    current = struct;

                for (i = 0; i < argc; i += 1) {
                    arg     = arguments[i];
                    type    = typeof arg;

                    if (current[type]) {
                        current = current[type];
                        if (current["__values"] && current["__values"][arg]) {
                            current = current["__values"][arg];
                        }
                    }
                    else {
                        return;
                    }
                }

                if (current["__fn"]) {
                    return current["__fn"].apply(this, arguments);
                }

                return;
            };
        };

    //root = function(hash) { return ptrn(hash); }

    if (module && module.exports) {
        module.exports = ptrn;
    }
    else if (window) {
        window.ptrn = ptrn;
    }


} ());