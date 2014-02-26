(function (_) {

    /**
     * @class GLocale
     * @extends GObject
     * @constructor
     * @version 1.0
     */
    function GLocale() {
        this._values = {};
        this._functions = {};

        // Try to setup default language using system
        if ("en" === gSystem.language) {
            this.setLanguage(GLocale.Language.English);
        } else if ("de" === gSystem.language) {
            this.setLanguage(GLocale.Language.German);
        }
    };
    GObject.inheritAndMix(GLocale, GObject);

    /**
     * Enumeration of supported languages
     * @enum
     */
    GLocale.Language = {
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
    // GLocale.Key Class
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * @param {Function|Object} clazz
     * @param {String} key
     * @class GLocale.Key
     * @constructor
     */
    GLocale.Key = function (clazz, key) {
        this._type_id = GObject.getTypeId(clazz);
        this._key = key;
    };


    // -----------------------------------------------------------------------------------------------------------------
    // GLocale Constants
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * Enumeration of builtin language constants
     * @enum
     */
    GLocale.Constant = {
        Create: new GLocale.Key(GLocale, "create"),
        Add: new GLocale.Key(GLocale, "add"),
        Edit: new GLocale.Key(GLocale, "edit"),
        Remove: new GLocale.Key(GLocale, "remove"),
        Delete: new GLocale.Key(GLocale, "delete"),
        Open: new GLocale.Key(GLocale, "open"),
        Save: new GLocale.Key(GLocale, "save"),
        Cancel: new GLocale.Key(GLocale, "cancel"),
        Ok: new GLocale.Key(GLocale, "ok"),
        Close: new GLocale.Key(GLocale, "close"),
        Loading: new GLocale.Key(GLocale, "loading"),
        LoadingOf: new GLocale.Key(GLocale, "loading_of"),
        Saving: new GLocale.Key(GLocale, "saving"),
        SavingOf: new GLocale.Key(GLocale, "saving_of"),
        Success: new GLocale.Key(GLocale, "success"),
        Failure: new GLocale.Key(GLocale, "failure"),
        Waiting: new GLocale.Key(GLocale, "waiting")
    };

    // -----------------------------------------------------------------------------------------------------------------
    // GLocale Class
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * @type {Number}
     * @private
     */
    GLocale.prototype._language = 0;

    /**
     * @type {{}}
     * @private
     */
    GLocale.prototype._values = null;

    /**
     * @type {{}}
     * @private
     */
    GLocale.prototype._functions = null;

    /**
     * Get the locale's current language
     * @returns {Number}
     * @version 1.0
     */
    GLocale.prototype.getLanguage = function () {
        return this._language;
    };

    /**
     * Set the locale's current language
     * @param {Number} language
     * @version 1.0
     */
    GLocale.prototype.setLanguage = function (language) {
        if (language != this._language) {
            this._language = language;
        }
    };

    /**
     * Get a localized value by using a given key. If the given key
     * is an instance of GLocale.Key then a lookup with the key takes
     * place. Otherwise, the key itself will be returned which allows
     * i.e. to provider either a string or a GLocale.Key to this function.
     * @param {GLocale.Key|*} key
     * @version 1.0
     */
    GLocale.prototype.get = function (key) {
        return key != null && key instanceof GLocale.Key ? this.getValueByKey(key) : key;
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
    GLocale.prototype.getValue = function (clazz, key, default_) {
        var type_id = GObject.getTypeId(clazz);

        var result = this._getValue(this._language, type_id, key);
        if (!result && this._language != GLocale.Language.Default/* && typeof default_ == 'undefined'*/) {
            result = this._getValue(GLocale.Language.Default, type_id, key);
        }
        if (!result && typeof default_ == 'undefined') {
            throw new Error("No value found for " + GObject.getName(clazz) + " and key " + key);
        } else if (!result) {
            return default_;
        }
        return result;
    };

    /**
     * Get a localized value by using a given key
     * @param {GLocale.Key} localeKey
     * @see getValue(clazz, key)
     * @version 1.0
     */
    GLocale.prototype.getValueByKey = function (localeKey) {
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
    GLocale.prototype.setValues = function (clazz, language, keys, values) {
        var typeId = GObject.getTypeId(clazz);

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
    GLocale.prototype._getValue = function (language, type_id, key) {
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
    GLocale.prototype.setFunction = function (language, key, func) {
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
    GLocale.prototype.getFunction = function (key) {
        var functions = this._functions[this._language];
        if (functions) {
            if (functions.hasOwnProperty(key)) {
                return functions[key];
            }
        }

        if (this._language != GLocale.Language.Default) {
            var functions = this._functions[GLocale.Language.Default];
            if (functions) {
                if (functions.hasOwnProperty(key)) {
                    return functions[key];
                }
            }
        }

        return null;
    };

    /** @override */
    GLocale.prototype.toString = function () {
        return "[Object GLocale]";
    };

    _.GLocale = GLocale;
    _.gLocale = new GLocale();
})(this);