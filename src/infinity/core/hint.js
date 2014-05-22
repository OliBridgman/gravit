(function (_) {

    /**
     * @class GUIHint
     * @constructor
     * @version 1.0
     */
    function GUIHint() {
    };

    /**
     * @type {IFLocale.Key}
     * @private
     */
    GUIHint.prototype._title = null;

    /**
     * @type {Array<Array<*>>}
     * @private
     */
    GUIHint.prototype._shortcuts = null;

    /**
     * @type {IFLocale.Key}
     * @private
     */
    GUIHint.prototype._introduction = null;

    /**
     * @type {Array<{{shortcut: String, description: IFLocale.Key, pressed: Boolean}}>}
     * @private
     */
    GUIHint.prototype._keys = null;

    /**
     * Get the title of the hint
     * @return {IFLocale.Key} title
     * @version 1.0
     */
    GUIHint.prototype.getTitle = function () {
        return this._title;
    };

    /**
     * Assign a title for the hint
     * @param {IFLocale.Key} title
     * @return {GUIHint} this pointer
     * @version 1.0
     */
    GUIHint.prototype.setTitle = function (title) {
        this._title = title;
        return this;
    };

    /**
     * Assign an introduction for the hint
     * @param {IFLocale.Key} introduction
     * @return {GUIHint} this pointer
     * @version 1.0
     */
    GUIHint.prototype.setIntroduction = function (introduction) {
        this._introduction = introduction;
        return this;
    };

    /**
     * Return the shortcuts of this hint
     * @returns {Array.<Array.<*>>}
     */
    GUIHint.prototype.getShortcuts = function () {
        return this._shortcuts;
    };

    /**
     * Assign shortcut(s) for the hint
     * @param {Array<Array<*>>} shortcuts
     * @return {GUIHint} this pointer
     * @version 1.0
     */
    GUIHint.prototype.setShortcuts = function (shortcuts) {
        this._shortcuts = shortcuts;
        return this;
    };

    /**
     * Add a shortcut description for the hint
     * @param {Number|String|Array} key the key or an array of key-combination
     * @param {IFLocale.Key} description description of the shortcut
     * @param {Boolean} [pressed] if true, the shortcut needs to be pressed
     * to take action (visually hinted). Defaults to false.
     * @return {GUIHint} this pointer
     * @see IFKey.Constant
     * @version 1.0
     */
    GUIHint.prototype.addKey = function (key, description, pressed) {
        if (!this._keys) {
            this._keys = [];
        }
        this._keys.push({key: key, description: description, pressed: pressed ? true : false});
        return this;
    };

    /**
     * Return the registered keys, may return null if there're none registered
     * @returns {null|*}
     */
    GUIHint.prototype.getKeys = function () {
        return this._keys;
    };

    /**
     * Convert this hint into html code and return it
     * @return {String}
     * @version 1.0
     */
    GUIHint.prototype.asHtml = function () {
        var result = "";
        if (this._title) {
            result += '<div class="title">' + ifLocale.get(this._title);
            var shortcuts = "";
            if (this._shortcuts) {
                for (var i = 0; i < this._shortcuts.length; ++i) {
                    if (shortcuts != "") {
                        shortcuts += ", ";
                    }
                    shortcuts += ifKey.shortcutToString(this._shortcuts[i]);
                }
            }
            if (shortcuts) {
                result += "&nbsp;(" + shortcuts + ")";
            }
            result += '</div>';
        }
        if (this._introduction) {
            result += '<div class="introduction">' + ifLocale.get(this._introduction) + '</div>';
        }
        if (this._keys && this._keys.length > 0) {
            result += '<table class="shortcuts" cellspacing="0" borderspacing="0">';
            for (var i = 0; i < this._keys.length; ++i) {
                var key = this._keys[i];
                var keys = key.key instanceof Array ? key.key : [key.key];
                var keyCode = "";
                for (var k = 0; k < keys.length; ++k) {
                    if (k > 0) {
                        keyCode += '<span class="shortcut-divider">+</span>';
                    }

                    keyCode += '<span class="shortcut' + (key.pressed ? ' pressed' : '') + '">';

                    if (typeof keys[k] == 'number') {
                        keyCode += ifKey.toLocalizedShort(keys[k]);
                    } else {
                        // Return uppercase chars
                        keyCode += ifKey.toSystemShortcut(keys[k]);
                    }

                    keyCode += '</span>';
                }

                result += '<tr>';
                result += '<td>' + keyCode + '</td>';
                result += '<td>&nbsp;&nbsp;</td>';
                result += '<td>' + ifLocale.get(key.description) + '</td>';
                result += '</tr>';
            }
            result += '</table>';
        }
        return result && result !== "" ? ('<div class="g-hint">' + result + '</div>') : result;
    };

    _.GUIHint = GUIHint;
})(this);