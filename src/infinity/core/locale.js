(function (_) {

    /**
     * @class IFLocale
     * @extends IFObject
     * @constructor
     * @version 1.0
     */
    function IFLocale() {
        this._values = {};
        this._functions = {};

        // Try to setup default language using system
        if ("en" === IFSystem.language) {
            this.setLanguage(IFLocale.Language.English);
        } else if ("de" === IFSystem.language) {
            this.setLanguage(IFLocale.Language.German);
        }
    };
    IFObject.inheritAndMix(IFLocale, IFObject);

    /**
     * Enumeration of supported languages
     * @enum
     */
    IFLocale.Language = {
        /**
         * English language
         * @type {Number}
         * @version 1.0
         */
        English: 0,

        /**
         * German language
         * @type {Number}
         * @version 1.0
         */
        German: 1,

        /**
         * Default language (english)
         * @type {Number}
         * @version 1.0
         */
        Default: 0
    };

    // -----------------------------------------------------------------------------------------------------------------
    // IFLocale.Key Class
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * @param {Function|Object} clazz
     * @param {String} key
     * @class IFLocale.Key
     * @constructor
     */
    IFLocale.Key = function (clazz, key) {
        this._type_id = IFObject.getTypeId(clazz);
        this._key = key;
    };


    // -----------------------------------------------------------------------------------------------------------------
    // IFLocale Constants
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * Enumeration of builtin language constants
     * @enum
     */
    IFLocale.Constant = {
        Create: new IFLocale.Key(IFLocale, "create"),
        Add: new IFLocale.Key(IFLocale, "add"),
        Edit: new IFLocale.Key(IFLocale, "edit"),
        Remove: new IFLocale.Key(IFLocale, "remove"),
        Delete: new IFLocale.Key(IFLocale, "delete"),
        Open: new IFLocale.Key(IFLocale, "open"),
        Save: new IFLocale.Key(IFLocale, "save"),
        Cancel: new IFLocale.Key(IFLocale, "cancel"),
        Ok: new IFLocale.Key(IFLocale, "ok"),
        Close: new IFLocale.Key(IFLocale, "close"),
        Loading: new IFLocale.Key(IFLocale, "loading"),
        LoadingOf: new IFLocale.Key(IFLocale, "loading_of"),
        Saving: new IFLocale.Key(IFLocale, "saving"),
        SavingOf: new IFLocale.Key(IFLocale, "saving_of"),
        Success: new IFLocale.Key(IFLocale, "success"),
        Failure: new IFLocale.Key(IFLocale, "failure"),
        Waiting: new IFLocale.Key(IFLocale, "waiting")
    };

    // -----------------------------------------------------------------------------------------------------------------
    // IFLocale Class
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * @type {Number}
     * @private
     */
    IFLocale.prototype._language = 0;

    /**
     * @type {{}}
     * @private
     */
    IFLocale.prototype._values = null;

    /**
     * @type {{}}
     * @private
     */
    IFLocale.prototype._functions = null;

    /**
     * Get the locale's current language
     * @returns {Number}
     * @version 1.0
     */
    IFLocale.prototype.getLanguage = function () {
        return this._language;
    };

    /**
     * Set the locale's current language
     * @param {Number} language
     * @version 1.0
     */
    IFLocale.prototype.setLanguage = function (language) {
        if (language != this._language) {
            this._language = language;
        }
    };

    /**
     * Get a localized value by using a given key. If the given key
     * is an instance of IFLocale.Key then a lookup with the key takes
     * place. Otherwise, the key itself will be returned which allows
     * i.e. to provider either a string or a IFLocale.Key to this function.
     * @param {IFLocale.Key|*} key
     * @version 1.0
     */
    IFLocale.prototype.get = function (key) {
        return key != null && key instanceof IFLocale.Key ? this.getValueByKey(key) : key;
    };

    /**
     * Get a localized value for the current language.
     * If there's no localized value for the current language
     * available then this will try to return the default language's.
     * @param {*} clazz the class to gather a value for
     * @param {String} key the key of the value
     * @param {String} [default_] default value to be returned if key not found
     * @return {String} a localized value
     * @throws Error when the value was not found
     */
    IFLocale.prototype.getValue = function (clazz, key, default_) {
        var type_id = IFObject.getTypeId(clazz);

        var result = this._getValue(this._language, type_id, key);
        if (!result && this._language != IFLocale.Language.Default/* && typeof default_ == 'undefined'*/) {
            result = this._getValue(IFLocale.Language.Default, type_id, key);
        }
        if (!result && typeof default_ == 'undefined') {
            throw new Error("No value found for " + IFObject.getName(clazz) + " and key " + key);
        } else if (!result) {
            return default_;
        }
        return result;
    };

    /**
     * Get a localized value by using a given key
     * @param {IFLocale.Key} localeKey
     * @see getValue(clazz, key)
     * @version 1.0
     */
    IFLocale.prototype.getValueByKey = function (localeKey) {
        return this.getValue(localeKey._type_id, localeKey._key);
    };

    /**
     * Register one or more localized values
     * @param {*} clazz the class to register a value for
     * @param {Number} language the language to register a value for
     * @param {Array<String>} keys an array of keys to register
     * @param {Array<String>} values an array of values to register
     * @version 1.0
     */
    IFLocale.prototype.setValues = function (clazz, language, keys, values) {
        var typeId = IFObject.getTypeId(clazz);

        var locale = this._values[language];
        if (!locale) {
            locale = this._values[language] = {};
        }
        var vals = locale[typeId];
        if (!vals) {
            vals = locale[typeId] = {};
        }

        for (var i = 0; i < keys.length; ++i) {
            vals[keys[i]] = values[i];
        }
    };

    /**
     * @param {Number} language
     * @param {Number} type_id
     * @param {String} key
     * @return {String}
     * @private
     */
    IFLocale.prototype._getValue = function (language, type_id, key) {
        var locale = this._values[language];
        if (locale) {
            var vals = locale[type_id];
            if (vals) {
                return vals[key];
            }
        }
    };

    /**
     * Register a localized function
     * @param {Number} language the language to register a function for
     * @param {String} key the key of the function to register for
     * @param {Function} func the function to register
     * @version 1.0
     */
    IFLocale.prototype.setFunction = function (language, key, func) {
        var functions = this._functions[language];
        if (!functions) {
            functions = this._functions[language] = {};
        }
        functions[key] = func;
    };

    /**
     * Get a locale function for the current language, falling
     * back to the default language if none was found
     *
     * @param {String} key the key of the function to get
     * @return {Function}
     */
    IFLocale.prototype.getFunction = function (key) {
        var functions = this._functions[this._language];
        if (functions) {
            if (functions.hasOwnProperty(key)) {
                return functions[key];
            }
        }

        if (this._language != IFLocale.Language.Default) {
            var functions = this._functions[IFLocale.Language.Default];
            if (functions) {
                if (functions.hasOwnProperty(key)) {
                    return functions[key];
                }
            }
        }

        return null;
    };

    /** @override */
    IFLocale.prototype.toString = function () {
        return "[Object IFLocale]";
    };

    _.IFLocale = IFLocale;
    _.ifLocale = new IFLocale();
})(this);