/**
 * IFSelector - Selector Engine for GNodes
 * Based on
 * Sly v1.0rc2 <http://sly.digitarald.com> - (C) 2009 Harald Kirschner <http://digitarald.de> - Open source under MIT License
 */


var IFSelector = (function () {

    var cache = {};

    /**
     * IFSelector::constructor
     *
     * Acts also as shortcut for IFSelector::search if context argument is given.
     */
    var IFSelector = function (text, context, results, options) {
        // normalise
        text = (typeof(text) == 'string') ? text.replace(/^\s+|\s+$/g, '') : '';

        var cls = cache[text] || (cache[text] = new IFSelector.initialize(text));
        return (context == null) ? cls : cls.search(context, results, options);
    };

    IFSelector.initialize = function (text) {
        this.text = text;
    };

    var proto = IFSelector.initialize.prototype = IFSelector.prototype;

    var locateFast = function () {
        return true;
    };

    /**
     * IFSelector::queryAll
     */
    proto.queryAll = function (context, results, options) {
        options = options || {};

        var iterate, i, item;

        if (!context || !(context instanceof IFNode)) {
            throw new Error("Missing context or invalid context");
        } else if (!(context instanceof IFNode)) {
            if (typeof(context) == 'string') {
                context = IFSelector.queryAll(context);
                iterate = true;
            } else if (Object.prototype.toString.call(context) == '[object Array]' || (typeof(context.length) == 'number' && context.item)) { // simple isArray
                var filtered = [];
                for (i = 0; (item = context[i]); i++) {
                    if (item instanceof IFNode) filtered.push(item);
                }
                iterate = (filtered.length > 1);
                context = (iterate) ? filtered : filtered[0];
            }
        }

        var mixed, // results need to be sorted, comma
            combined, // found nodes from one iteration process
            nodes, // context nodes from one iteration process
            all = {}, // unique ids for overall result
            state = {}; // matchers temporary state
        var current = all; // unique ids for one iteration process

        // unifiers
        var getUid = IFSelector.getUid;
        var locateCurrent = function (node) {
            var uid = getUid(node);
            return (current[uid]) ? null : (current[uid] = true);
        };

        if (results && results.length) { // fills unique ids, does not alter the given results
            for (i = 0; (item = results[i]); i++) locateCurrent(item);
        }

        var parsed = this.parse();
        if (!parsed.length) return [];

        for (var i = 0, selector; (selector = parsed[i]); i++) {

            var locate = locateCurrent;

            if (selector.first) {
                if (!results) locate = locateFast;
                else mixed = true;
                if (iterate) nodes = context;
                else if (selector.combinator) nodes = [context]; // allows combinators before selectors
            }

            if (selector.last && results) {
                current = all;
                combined = results;
            } else {
                // default stack
                current = {};
                combined = [];
            }

            if (!selector.combinator && !iterate) {
                // without prepended combinator
                combined = selector.combine(combined, context, selector, state, locate, !(combined.length));
            } else {
                // with prepended combinators
                for (var k = 0, l = nodes.length; k < l; k++) {
                    combined = selector.combine(combined, nodes[k], selector, state, locate);
                }
            }

            if (selector.last) {
                if (combined.length) results = combined;
            } else {
                nodes = combined;
            }
        }

        return results || [];
    };

    /**
     * IFSelector::querySingle
     */
    proto.querySingle = function (context, results, options) {
        return this.queryAll(context, results, options)[0];
    };


    /**
     * IFSelector::match
     */
    proto.match = function (node, parent) {
        var parsed = this.parse();
        if (parsed.length == 1) return !!(this.parse()[0].match(node, {}));
        if (!parent) {
            parent = node;
            while (parent.getParent()) {
                parent = parent.getParent();
            }
        }
        var found = this.queryAll(parent), i = found.length;
        while (i--) {
            if (found[i] == node) return true;
        }
        return false;
    };


    /**
     * IFSelector::filter
     */
    proto.filter = function (nodes) {
        var results = [], parsed = this.parse();
        for (var i = 0, node; (node = nodes[i]); i++) {
            for (var k = 0; k < parsed.length; ++k) {
                var match = parsed[k].match;
                if (match(node)) results.push(node);
            }
        }
        return results;
    };


    /**
     * IFSelector.recompile()
     */
    var pattern;

    IFSelector.recompile = function () {

        var key, combList = [','], operList = ['!'];

        for (key in combinators) {
            if (key != ' ') {
                combList[(key.length > 1) ? 'unshift' : 'push'](IFSelector.escapeRegExp(key));
            }
        }
        for (key in propertyOperators) operList.push(key);

        /**
         The regexp is a group of every possible selector part including combinators.
         "|" separates the possible selectors.

         Capturing parentheses:
         1 - Combinator (only requires to allow multiple-character combinators)
         2 - Property name
         3 - Property operator
         4, 5, 6 - The value
         7 - Pseudo name
         8, 9, 10 - The value
         */

        pattern = new RegExp(
            // A nodeName
            '[\\w\\u00a1-\\uFFFF][\\w\\u00a1-\\uFFFF-]*|' +

                // An id or the tag
                '[#.](?:[\\w\\u00a1-\\uFFFF-]|\\\\:|\\\\.)+|' +

                // Whitespace (descendant combinator)
                '[ \\t\\r\\n\\f](?=[\\w\\u00a1-\\uFFFF*#.[:])|' +

                // Other combinators and the comma
                '[ \\t\\r\\n\\f]*(' + combList.join('|') + ')[ \\t\\r\\n\\f]*|' +

                // A property, with the various and optional value formats ([name], [name=value], [name="value"], [name='value']
                '\\[([\\w\\u00a1-\\uFFFF-]+)[ \\t\\r\\n\\f]*(?:([' + operList.join('') + ']?=)[ \\t\\r\\n\\f]*(?:"([^"]*)"|\'([^\']*)\'|([^\\]]*)))?]|' +

                // A pseudo-class, with various formats
                ':([-\\w\\u00a1-\\uFFFF]+)(?:\\((?:"([^"]*)"|\'([^\']*)\'|([^)]*))\\))?|' +

                // The universial selector, not process
                '\\*|(.+)', 'g'
        );
    };


// I prefer it outside, not sure if this is faster
    var create = function (combinator) {
        return {
            ident: [],
            tags: [],
            properties: [],
            pseudos: [],
            combinator: combinator
        };
    };

    var blank = function ($0) {
        return $0;
    };

    /**
     * IFSelector::parse
     *
     * Returns an array with one object for every selector:
     *
     * {
     *   nodeName: (String) Node-name (defaults to null for universal *)
     *   id: (String) Id
     *   tags: (Array) Tagnames
     *   properties: (Array) Properties objects with "name", "operator" and "value"
     *   pseudos: (Array) Pseudo objects with "name" and "value"
     *   operator: (Char) The prepended operator (not comma)
     *   first: (Boolean) true if it is the first selector or the first after a comma
     *   last: (Boolean) true if it is the last selector or the last before a comma
     *   ident: (Array) All parsed matches, can be used as cache identifier.
     * }
     */
    proto.parse = function (plain) {
        var save = (plain) ? 'plain' : 'parsed';
        if (this[save]) return this[save];

        var text = this.text;
        var compute = (plain) ? blank : this.compute;

        var parsed = [], current = create(null);
        current.first = true;

        var refresh = function (combinator) {
            parsed.push(compute(current));
            current = create(combinator);
        };

        pattern.lastIndex = 0; // to fix some weird behavior
        var match, $0;

        while ((match = pattern.exec(text))) {

            if (match[11]) {
                if (IFSelector.verbose) throw SyntaxError('Syntax error, "' + $0 + '" unexpected at #' + pattern.lastIndex + ' in "' + text + '"');
                return (this[save] = []);
            }

            $0 = match[0];

            switch ($0.charAt(0)) {
                case '.':
                    current.tags.push($0.slice(1).replace(/\\/g, ''));
                    break;
                case '#':
                    current.id = $0.slice(1).replace(/\\/g, '');
                    break;
                case '[':
                    current.properties.push({
                        name: match[2],
                        operator: match[3] || null,
                        value: match[4] || match[5] || match[6] || null
                    });
                    break;
                case ':':
                    current.pseudos.push({
                        name: match[7],
                        value: match[8] || match[9] || match[10] || null
                    });
                    break;
                case ' ':
                case '\t':
                case '\r':
                case '\n':
                case '\f':
                    match[1] = match[1] || ' ';
                default:
                    var combinator = match[1];
                    if (combinator) {
                        if (combinator == ',') {
                            current.last = true;
                            refresh(null);
                            current.first = true;
                            continue;
                        }
                        if (current.first && !current.ident.length) current.combinator = combinator;
                        else refresh(combinator);
                    } else {
                        if ($0 != '*') current.nodeName = $0;
                    }
            }
            current.ident.push($0);
        }

        current.last = true;
        parsed.push(compute(current));

        return (this[save] = parsed);
    };


// chains two given functions

    function chain(prepend, append, aux, unshift) {
        return (prepend) ? ((unshift) ? function (node, state) {
            return append(node, aux, state) && prepend(node, state);
        } : function (node, state) {
            return prepend(node, state) && append(node, aux, state);
        }) : function (node, state) {
            return append(node, aux, state);
        };
        // fn.$slyIndex = (prepend) ? (prepend.$slyIndex + 1) : 0;
    };


// prepared match comperators, probably needs namespacing
    var empty = function () {
        return true;
    };

    var matchId = function (node, id) {
        if (node.hasMixin(IFNode.Identity)) {
            return (id === node.getId());
        }
        return false;
    };

    var matchNodeName = function (node, nodeName) {
        return (node.getNodeName().toUpperCase() == nodeName.toUpperCase());
    };

    var prepareTag = function (name) {
        return (new RegExp('(?:^|[ \\t\\r\\n\\f])' + name + '(?:$|[ \\t\\r\\n\\f])'));
    };

    var matchTag = function (node, expr) {
        if (node.hasMixin(IFNode.Tag)) {
            var tags = node.getTags();
            return tags && expr.test(tags);
        }
        return false;
    };

    var prepareProperty = function (prop) {
        if (!prop.operator || !prop.value) return prop;
        var parser = propertyOperators[prop.operator];
        if (parser) { // @todo: Allow functions, not only regex
            prop.escaped = IFSelector.escapeRegExp(prop.value);
            prop.pattern = new RegExp(parser(prop.value, prop.escaped, prop));
        }
        return prop;
    };

    var matchProperty = function (node, prop) {
        // TODO : Support user properties as well
        var read = node.hasMixin(IFNode.Properties) ? node.getProperty(prop.name) : null;
        switch (prop.operator) {
            case null:
                return read;
            case '=':
                return (read == prop.value);
            case '!=':
                return (read != prop.value);
        }
        if (!read && prop.value) return false;
        return prop.pattern.test(read);
    };


    /**
     * IFSelector::compute
     *
     * Attaches the following methods to the selector object:
     *
     * {
     *   search: Uses the most convinient properties (id, nodeName and/or tag) of the selector as search.
     *   matchAux: If search does not contain all selector properties, this method matches an element against the rest.
     *   match: Matches an element against all properties.
     *   simple: Set when matchAux is not needed.
     *   combine: The callback for the combinator
     * }
     */
    proto.compute = function (selector) {
        var i, item, match, search, matchSearch, named,
            nodeName = selector.nodeName,
            id = selector.id,
            tags = selector.tags;

        if (id) {
            named = true;

            matchSearch = chain(null, matchId, id);

            search = function (context) {
                var node = context._scene.getById(id);
                return (node && (!nodeName || matchNodeName(node, nodeName))) ? [node] : [];
            };
        }

        if (tags.length > 0) {

            if (!search && tags.length == 1) { // optimised for typical .one-tag-only

                named = true;

                var expr = prepareTag(tags[0]);
                matchSearch = chain(matchSearch, matchTag, expr);

                search = function (context) {
                    var query = context.getNodesByName(nodeName || '*');
                    var found = [];
                    for (var i = 0, node; (node = query[i]); i++) {
                        if (matchTag(node, tags[0])) found.push(node);
                    }
                    return found;
                };

            } else {

                for (i = 0; (item = tags[i]); i++) {
                    match = chain(match, matchTag, prepareTag(item));
                }

            }
        }

        if (nodeName) {

            if (!search) {
                matchSearch = chain(matchSearch, matchNodeName, nodeName);

                search = function (context) {
                    return context.getNodesByName(nodeName);
                };
            } else if (!named) { // search does not filter by name yet
                match = chain(match, matchNodeName, nodeName);
            }

        } else if (!search) { // default engine

            search = function (context) {
                return context.getNodesByName('*');
            };

        }

        for (i = 0; (item = selector.pseudos[i]); i++) {

            if (item.name == 'not') { // optimised :not(), fast as possible
                var not = IFSelector(item.value);
                match = chain(match, function (node, not) {
                    return !not.match(node);
                }, (not.parse().length == 1) ? not.parsed[0] : not);
            } else {
                var parser = pseudos[item.name];
                if (parser) match = chain(match, parser, item.value);
            }

        }

        for (i = 0; (item = selector.properties[i]); i++) {
            match = chain(match, matchProperty, prepareProperty(item));
        }

        if ((selector.simple = !(match))) {
            selector.matchAux = empty;
        } else {
            selector.matchAux = match;
            matchSearch = chain(matchSearch, match);
        }

        selector.match = matchSearch || empty;

        selector.combine = IFSelector.combinators[selector.combinator || ' '];

        selector.search = search;

        return selector;
    };

// Combinators/Pseudos partly from MooTools 1.2-pre, (c) 2006-2009 Valerio Proietti, MIT License

    /**
     * Combinators
     */
    var combinators = IFSelector.combinators = {

        ' ': function (combined, context, selector, state, locate, fast) {
            var nodes = selector.search(context);
            if (fast && selector.simple) return IFSelector.toArray(nodes);
            for (var i = 0, node, aux = selector.matchAux; (node = nodes[i]); i++) {
                if (locate(node) && aux(node, state)) combined.push(node);
            }
            return combined;
        },

        '>': function (combined, context, selector, state, locate) {
            var nodes = selector.search(context);
            for (var i = 0, node; (node = nodes[i]); i++) {
                if (node.getParent() == context && locate(node) && selector.matchAux(node, state)) combined.push(node);
            }
            return combined;
        },

        '+': function (combined, context, selector, state, locate) {
            while ((context = context.getNext())) {
                if (locate(context) && selector.match(context, state)) combined.push(context);
                break;
            }
            return combined;
        },

        '~': function (combined, context, selector, state, locate) {
            while ((context = context.getNext())) {
                if (!locate(context)) break;
                if (selector.match(context, state)) combined.push(context);
            }
            return combined;
        },

        // Returns all matched parent nodes
        '<': function (combined, context, selector, state, locate) {
            while ((context = context.getParent()) && !(context instanceof IFScene)) {
                if (locate(context) && selector.match(context, state)) combined.push(context);
            }
            return combined;
        },

        // Returns the first matched descendant children
        '^': function (combined, context, selector, state, locate) {
            if ((context = context.getFirstChild())) {
                if (locate(context) && selector.match(context, state)) combined.push(context);
                else combined = IFSelector.combinators['+'](combined, context, selector, context, state);
            }
            return combined;
        },

        // Returns all matched next slibings
        '++': function (combined, context, selector, state, locate) {
            while ((context = context.getNext())) {
                if (locate(context) && this.match(context, state)) combined.push(context);
            }
            return combined;
        },

        // Returns all matched previous slibings
        '--': function (combined, context, selector, state, locate) {
            while ((context = context.getPrevious())) {
                if (locate(context) && this.match(context, state)) combined.push(context);
            }
            return combined;
        }

    };


    /**
     * Pseudo-Classes
     */
    var pseudos = IFSelector.pseudos = {

        // w3c pseudo classes

        'first-child': function (node) {
            return pseudos.index(node, 0);
        },

        'last-child': function (node) {
            return node.getNext() == null;
        },

        'only-child': function (node) {
            return node.getPrevious() == null && node.getNext() == null;
        },

        'nth-child': function (node, value, state) {
            var parsed = IFSelector.parseNth(value || 'n');
            if (parsed.special != 'n') return pseudos[parsed.special](node, parsed.a, state);
            state = state || {}; // just to be sure
            state.positions = state.positions || {};
            var uid = IFSelector.getUid(node);
            if (!state.positions[uid]) {
                var count = 0;
                while ((node = node.getPrevious())) {
                    count++;
                    var position = state.positions[IFSelector.getUid(node)];
                    if (position != undefined) {
                        count = position + count;
                        break;
                    }
                }
                state.positions[uid] = count;
            }
            return (state.positions[uid] % parsed.a == parsed.b);
        },

        'empty': function (node) {
            // TODO : Support this - for text elements and for regular elements (no children)
            //return !(node.innerText || node.textContent || '').length;
            return false;
        },

        'contains': function (node, text) {
            // TODO : Support this for text elements
            //return (node.innerText || node.textContent || '').indexOf(text) != -1;
            return false;
        },

        'index': function (node, index) {
            var count = 1;
            while ((node = node.getPrevious())) {
                if (++count > index) return false;
            }
            return (count == index);
        },

        'even': function (node, value, state) {
            return pseudos['nth-child'](node, '2n+1', state);
        },

        'odd': function (node, value, state) {
            return pseudos['nth-child'](node, '2n', state);
        },

        // Custom selectors

        // Matches elements which contain at least one element that matches the specified selector.
        'has': function (node, argument) {
            return IFSelector.querySingle(argument, node);
        },

        // Flag selectors

        // Matches all nodes that are selected.
        'active': function (node) {
            return (node.hasFlag(IFNode.Flag.Active));
        },

        // Matches all nodes that are selected.
        'selected': function (node) {
            return (node.hasFlag(IFNode.Flag.Selected));
        },

        // Matches all elements that are hidden.
        'hidden': function (node) {
            return (node instanceof IFElement && node.hasFlag(IFElement.Flag.Hidden));
        },

        // Matches all elements that are visible.
        'visible': function (node) {
            return (node instanceof IFElement && !node.hasFlag(IFElement.Flag.Hidden));
        }
    };

    pseudos.first = pseudos['first-child'];
    pseudos.last = pseudos['last-child'];
    pseudos.nth = pseudos['nth-child'];
    pseudos.eq = pseudos.index;


    /**
     * Property operators
     */
    var propertyOperators = IFSelector.propertyOperators = {

        '*=': function (value, escaped) {
            return escaped;
        },

        '^=': function (value, escaped) {
            return '^' + escaped;
        },

        '$=': function (value, escaped) {
            return value + '$';
        },

        '~=': function (value, escaped) {
            return '(?:^|[ \\t\\r\\n\\f])' + escaped + '(?:$|[ \\t\\r\\n\\f])';
        },

        '|=': function (value, escaped) {
            return '(?:^|\\|)' + escaped + '(?:$|\\|)';
        },

        // Matches the property value against the given regexp, flags are not possible yet
        '/=': function (value, escaped) {
            return value;
        }

    };

    /**
     * IFSelector.toArray
     */
    var toArray = Array.slice || function (nodes) {
        return Array.prototype.slice.call(nodes);
    };

    try {
        toArray(scene.sceneElement.childNodes);
    } catch (e) {
        toArray = function (nodes) {
            if (nodes instanceof Array) return nodes;
            var i = nodes.length, results = new Array(i);
            while (i--) results[i] = nodes[i];
            return results;
        };
    }

    IFSelector.toArray = toArray;

    /**
     * IFSelector.getUid
     */
    var nextUid = 1;

    IFSelector.getUid = (window.ActiveXObject) ? function (node) {
        return (node.__slyUid || (node.__slyUid = {id: nextUid++})).id;
    } : function (node) {
        return node.__slyUid || (node.__slyUid = nextUid++);
    };


    var nthCache = {};

    IFSelector.parseNth = function (value) {
        if (nthCache[value]) return nthCache[value];

        var parsed = value.match(/^([+-]?\d*)?([a-z]+)?([+-]?\d*)?$/);
        if (!parsed) return false;

        var a = parseInt(parsed[1], 10), b = (parseInt(parsed[3], 10) || 0) - 1;

        if ((a = (isNaN(a)) ? 1 : a)) {
            while (b < 1) b += a;
            while (b >= a) b -= a;
        }
        switch (parsed[2]) {
            case 'n':
                parsed = {a: a, b: b, special: 'n'};
                break;
            case 'odd':
                parsed = {a: 2, b: 0, special: 'n'};
                break;
            case 'even':
                parsed = {a: 2, b: 1, special: 'n'};
                break;
            case 'first':
                parsed = {a: 0, special: 'index'};
                break;
            case 'last':
                parsed = {special: 'last-child'};
                break;
            case 'only':
                parsed = {special: 'only-child'};
                break;
            default:
                parsed = {a: (a) ? (a - 1) : b, special: 'index'};
        }

        return (nthCache[value] = parsed);
    };


    IFSelector.escapeRegExp = function (text) {
        return text.replace(/[-.*+?^${}()|[\]\/\\]/g, '\\$&');
    };


// generic accessors

    IFSelector.generise = function (name) {
        IFSelector[name] = function (text) {
            var cls = IFSelector(text);
            return cls[name].apply(cls, Array.prototype.slice.call(arguments, 1));
        }
    };

    var generics = ['parse', 'queryAll', 'querySingle', 'match', 'filter'];
    for (var i = 0; generics[i]; i++) IFSelector.generise(generics[i]);


// compile pattern for the first time

    IFSelector.recompile();

// FIN

    return IFSelector;
})();