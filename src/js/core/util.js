(function (_) {

    /**
     * @class GUtil
     * @constructor
     * @version 1.0
     */
    function GUtil() {
    };

    /**
     * Code to merge all properties from source that
     * do not exist on target into the target and
     * returns the target
     * @param {*} target
     * @param {*} source
     * @return {*} the target
     */
    GUtil.mergeObjects = function (target, source) {
        for (var prop in source) {
            if (source.hasOwnProperty(prop) && !target.hasOwnProperty(prop)) {
                target[prop] = source[prop];
            }
        }
        return target;
    };

    /**
     * This is equal to the Array.indexOf function except that for
     * comparing the values in the array, the GUtil.equals function
     * is used instead
     * @param {Array} array the array to get an index for an element
     * @param {*} element the element to get the index for
     * @param {Boolean} [objectByValue] if set, objects are compared by their value and
     * not by their reference. Defaults to false if not provided.
     * @return {Number} a value less than zero if element is not found or
     * the index of the given element in the given array
     */
    GUtil.indexOfEquals = function (array, element, objectByValue) {
        for (var i = 0; i < array.length; ++i) {
            if (GUtil.equals(array[i], element, objectByValue)) {
                return i;
            }
        }
        return -1;
    };

    /**
     * Compare two objects for equality by their values. Also takes care of null parameters.
     * If the function can not compare the type by value then it'll return false as if
     * the two parameters wouldn't be equal.
     * Currently supported types: Object, Boolean, Number, String, Array, Date, GRect, GPoint, GTransform.
     * For objects this will iterate only the object's own properties to an unnested deepness so
     * take care in using this function for highly complex object structures.
     * For numbers, the epsilon comparison will be used so that very small differences in numbers
     * are considered equal to compensate for any floating point errors
     * @param {*} left left side of comparison
     * @param {*} right right side of comparison
     * @param {Boolean} [objectByValue] if set, objects are compared by their value and
     * not by their reference. Defaults to false if not provided.
     * @return {Boolean} true if left and right are equal (also if they're null!)
     */
    GUtil.equals = function (left, right, objectByValue) {
        if (!left && left === right) {
            return true;
        } else if (left && right) {
            // Check for special 'equals' function
            if (left.constructor.equals || right.constructor.equals) {
                if (left.constructor === right.constructor) {
                    return left.constructor.equals(left, right);
                } else {
                    return false;
                }
            } else if (left instanceof Date || right instanceof Date) {
                return left instanceof Date && right instanceof Date ? (+left == +right) : false;
            } else if (left instanceof Array || right instanceof Array) {
                if (left instanceof Array && right instanceof Array) {
                    if (left.length !== right.length) {
                        return false;
                    }

                    for (var i = 0; i < left.length; ++i) {
                        if (!GUtil.equals(left[i], right[i], objectByValue)) {
                            return false;
                        }
                    }

                    return true;
                } else {
                    return false;
                }
            } else {
                var leftType = typeof left;
                var rightType = typeof right;

                if (leftType !== rightType) {
                    return false;
                }

                if (leftType === 'number') {
                    if (isNaN(left) || isNaN(right)) {
                        return isNaN(left) && isNaN(right);
                    } else {
                        return GMath.isEqualEps(left, right);
                    }
                } else if (leftType === 'string') {
                    return left.localeCompare(right) === 0;
                } else if (leftType === 'boolean') {
                    return (+left == +right);
                } else if (leftType === 'object') {
                    if (!objectByValue) {
                        return left === right;
                    } else {
                        var leftKeys = Object.keys(left);
                        var rightKeys = Object.keys(right);

                        if (!GUtil.equals(leftKeys, rightKeys, objectByValue)) {
                            return false;
                        }

                        for (var i = 0; i < leftKeys.length; ++i) {
                            if (!GUtil.equals(left[leftKeys[i]], right[leftKeys[i]]), objectByValue) {
                                return false;
                            }
                        }

                        return true;
                    }
                } else {
                    return false;
                }
            }
        } else {
            return false;
        }
    };

    /**
     * Checks if a given array contains at least one key
     * of a given object
     * @param {Array<*>} array
     * @param {*} object
     */
    GUtil.containsObjectKey = function (array, object) {
        for (var key in object) {
            if (array.indexOf(key) >= 0) {
                return true;
            }
        }
        return false;
    };

    GUtil.dictionaryContainsValue = function (dictionary, value) {
        for (var key in dictionary) {
            if (dictionary[key] === value) {
                return true;
            }
        }
        return false;
    };

    var CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');

    /**
     * Generate an unique id
     * @param {Number} [len] the desired length of the uid, defaults to 32
     * @returns {String} more or less unique id depending on the desired length
     */
    GUtil.uuid = function (len) {
        var chars = CHARS, uuid = [], i;
        var radix = chars.length;
        var len = len ? len : 32;
        for (i = 0; i < len; i++) {
            uuid[i] = chars[0 | Math.random() * radix];
        }
        return uuid.join('');
    };

    /**
     * Replace all occurrences of a string with another string
     * @param {String} string the string to replace within
     * @param {String} what_ the string to look for
     * @param {String} with_ the string to replace with
     * @returns {String}
     */
    GUtil.replaceAll = function (string, what_, with_) {
        var result = string;
        while (result.indexOf(what_) >= 0) {
            result = result.replace(what_, with_);
        }
        return result;
    };

    // Makes unique sort of array elements, leaving only the elements from [a,b] segment
    // New array is written into newnums
    GUtil.uSortSegment = function (a, b, nums, newnums) {
        var nElms = 0;
        nums.sort(function (s, k) {
            return s - k;
        });

        if (nums[0] >= a && nums[0] <= b) {
            newnums[0] = nums[0];
            nElms = 1;

            if (nums.length == 1) {
                return nElms;
            }
        }

        for (var i = 1; i < nums.length; i++) {
            if (nums[i] != nums[i - 1] && nums[i] >= a && nums[i] <= b) {
                newnums.push(nums[i]);
                ++nElms;
            }
        }

        return nElms;
    };

    /**
     * Escape an unescaped html string
     * @param {String} html
     * @returns {String}
     */
    GUtil.escape = function (html) {
        return html.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
    };

    /**
     * Unscape an escaped html string
     * @param {String} html
     * @returns {String}
     */
    GUtil.unescape = function (html) {
        var result = GUtil.replaceAll(html, "&lt;", '<');
        result = GUtil.replaceAll(result, "&gt;", '>');
        result = GUtil.replaceAll(result, "&quot;", '"');
        result = GUtil.replaceAll(result, "&#039;", "'");
        result = GUtil.replaceAll(result, "&amp;", '&');
        return result;
    };

    /**
     * Checks and returns whether a given string is numeric or not
     * @param {string} string
     * @returns {boolean}
     */
    GUtil.isNumeric = function (string) {
        // parseFloat NaNs numeric-cast false positives (null|true|false|"")
        // ...but misinterprets leading-number strings, particularly hex literals ("0x...")
        // subtraction forces infinities to NaN
        return string - parseFloat(string) >= 0;
    };

    /**
     * Format a number into a string
     * @param {Number} number the number to format
     * @param {Number} [decimalPlaces] the number of decimal places,
     * defaults to 3
     * @param {String} [decimalSeparator] the decimal separator to use,
     * if not provided defaults to ','
     * @returns {string}
     */
    GUtil.formatNumber = function (number, decimalPlaces, decimalSeparator) {
        decimalSeparator = decimalSeparator || ',';
        decimalPlaces = typeof decimalPlaces === 'number' ? decimalPlaces : 3;
        return GMath.round(number, false, decimalPlaces).toString().replace('.', decimalSeparator);
    };

    /**
     * Parses a string into a number
     * @param {string} the string to be parsed as number
     * @returns {Number}
     */
    GUtil.parseNumber = function (string) {
        var parseString = "";
        var foundDecSep = false;
        for (var i = string.length; i >= 0; --i) {
            var char = string.charAt(i);
            if (char === ',' && !foundDecSep) {
                parseString = '.' + parseString;
            } else if (GUtil.isNumeric(char) || char === '-' || char === '+') {
                parseString = char + parseString;
            }
        }
        return parseFloat(parseString);
    };

    _.GUtil = GUtil;

    // Jquery extensions
    /**
     * Register ajax transports for blob send/recieve and array buffer send/receive via XMLHttpRequest Level 2
     * within the comfortable framework of the jquery ajax request, with full support for promises.
     *
     * Notice the +* in the dataType string? The + indicates we want this transport to be prepended to the list
     * of potential transports (so it gets first dibs if the request passes the conditions within to provide the
     * ajax transport, preventing the standard transport from hogging the request), and the * indicates that
     * potentially any request with any dataType might want to use the transports provided herein.
     *
     * Remember to specify 'processData:false' in the ajax options when attempting to send a blob or arraybuffer -
     * otherwise jquery will try (and fail) to convert the blob or buffer into a query string.
     */
    $.ajaxTransport("+*", function(options, originalOptions, jqXHR){
        // Test for the conditions that mean we can/want to send/receive blobs or arraybuffers - we need XMLHttpRequest
        // level 2 (so feature-detect against window.FormData), feature detect against window.Blob or window.ArrayBuffer,
        // and then check to see if the dataType is blob/arraybuffer or the data itself is a Blob/ArrayBuffer
        if (window.FormData && ((options.dataType && (options.dataType == 'blob' || options.dataType == 'arraybuffer'))
            || (options.data && ((window.Blob && options.data instanceof Blob)
            || (window.ArrayBuffer && options.data instanceof ArrayBuffer)))
            ))
        {
            return {
                /**
                 * Return a transport capable of sending and/or receiving blobs - in this case, we instantiate
                 * a new XMLHttpRequest and use it to actually perform the request, and funnel the result back
                 * into the jquery complete callback (such as the success function, done blocks, etc.)
                 *
                 * @param headers
                 * @param completeCallback
                 */
                send: function(headers, completeCallback){
                    var xhr = new XMLHttpRequest(),
                        url = options.url || window.location.href,
                        type = options.type || 'GET',
                        dataType = options.dataType || 'text',
                        data = options.data || null,
                        async = options.async || true;

                    xhr.addEventListener('load', function(){
                        var res = {};

                        res[dataType] = xhr.response;
                        completeCallback(xhr.status, xhr.statusText, res, xhr.getAllResponseHeaders());
                    });

                    xhr.open(type, url, async);
                    xhr.responseType = dataType;
                    xhr.send(data);
                },
                abort: function(){
                    jqXHR.abort();
                }
            };
        }
    });

    $.loadImage = function(url) {
        // Define a "worker" function that should eventually resolve or reject the deferred object.
        var loadImage = function(deferred) {
            var image = new Image();

            // Set up event handlers to know when the image has loaded
            // or fails to load due to an error or abort.
            image.onload = loaded;
            image.onerror = errored; // URL returns 404, etc
            image.onabort = errored; // IE may call this if user clicks "Stop"

            // Setting the src property begins loading the image.
            image.src = url;

            function loaded() {
                unbindEvents();
                // Calling resolve means the image loaded sucessfully and is ready to use.
                deferred.resolve(image);
            }
            function errored() {
                unbindEvents();
                // Calling reject means we failed to load the image (e.g. 404, server offline, etc).
                deferred.reject(image);
            }
            function unbindEvents() {
                // Ensures the event callbacks only get called once.
                image.onload = null;
                image.onerror = null;
                image.onabort = null;
            }
        };

        // Create the deferred object that will contain the loaded image.
        // We don't want callers to have access to the resolve() and reject() methods,
        // so convert to "read-only" by calling `promise()`.
        return $.Deferred(loadImage).promise();
    };
})(this);