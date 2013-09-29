ptrn
====

For fun implementation of pattern matching in javascript.


Pattern Matching
----------------
Pattern matching is a programming paradigm which is common in functional programming languages such as Haskell and Erlang. The technique makes it possible to provide multiple definitions of functions which run in different scenarios based on what the arguments are. Matching is done on the arguments values, this is very useful when implementing recursive functions because the base case can be encoded as a specialisation of the function which keeps the function body free from logic.

Fibonacci in Haskell
```haskell
fib :: Int -> Int
fib 0 = 1 -- Pattern matched specialisation
fib 1 = 1 -- -- || -- || -- || -- || -- || --
fib n = fib (n - 1) + fib (n - 2) -- General case implementation
```


How it works
------------
ptrn exposes a single function called ptrn. Ptrn takes a single argument, a hash describing the function you want to define.

**Hello world!**

```javascript
	var hello = ptrn({
		'string': function (str) {
			return 'Hello, ' + str + '!';
		}
	});

	hello("world"); // "Hello, world!"
```

This doesn't really look that useful, it doesn't actually add anything. However as said above pattern matching is about providing multiple
function definitions, let's do that.


**Fibonacci**
```javascript
	var fib = ptrn({
		'number#{0}': 1, // Pattern matched specialisation
		'number#{1}': 1, // -- || -- || -- || -- || -- || --
		'number': function (n) { return fib(n - 1) + fib(n - 2);} // General case implementation
	});
```

Values inside of #{} are used to match values. Allowed value types are number, boolean and string. Also note that you aren't restricted to functions you can put anything as the result for a certain match.

Ptrn also supports matching on types instead of values, this enables the creation of functions with different implementations for different type of arguments. Conceptually this might not be the best feature because it might confuse the consumer of the function.

**Type matching**
The type matching is based on the internal types in javascript. It recognises number, boolean, function, object and string.

```javascript
	var log = ptrn({
		'string': console.log,
		'number': console.log,
		'boolean': console.log,
		'function': console.dir,
		'object': console.dir
	});
```

In this example things are logged based on their types. Objects and functions are better logged using console.dir instead of console.log.

**Wildcard matching**
Functions can also be matched by the number of arguments as follows.

```javascript
	var f = ptrn({
		'*': function (n) {...}, //Single argument
		'* -> *': function (a, b) {...}, //Dual argument
		'* -> * -> *': function (a, b, c) {...} //Tripple argument
	});
```

This can of course be combined with the normal types.

Syntax summery
--------------

##Types

* number
* string
* boolean
* function
* object
* \* `Matches everything`

##Values

* number#{x} `Matches a number of value x`
* string#{x} `Matches a string x`
* boolean#{x} `Matches a boolean with value x were x is "true" or "false"`


The grammar is defined like this `type[#{value]}]{1,} [-> type[#{value}]]*`

License
------
MIT



