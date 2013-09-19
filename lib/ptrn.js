(function (root) {
    "use strict";

    var
        SEPERATOR_REGEX = /^\-\>/,
        TYPE_REGEX      = /^[A-z]+/,
        VALUE_REGEX     = /^#{(.+?)}/,

        consume = function (string) {
            var result = {
                type:   undefined,
                value:  undefined,
                left:   undefined
            },
            intermediateResult;

            intermediateResult = consumeType(string);
            string             = intermediateResult.left;
            result.type        = intermediateResult.result;

            intermediateResult = consumeValue(string);
            string             = intermediateResult.left;
            result.value       = intermediateResult.result;

            intermediateResult = consumeSeparator(string);
            string             = intermediateResult.left;

            result.left = string;

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
            var found = string.match(VALUE_REGEX);

            if (found) {
                return {
                    result: found[1],
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

                        if (consumeResult.value) {
                            if (!current["__values"]) {
                                current["__values"] = {};
                            }
                            current = (current["__values"][consumeResult.value] = {});
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

    root.ptrn = ptrn;
} (typeof window !== "undefined" ? window : module.exports));