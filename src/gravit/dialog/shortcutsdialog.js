(function (_) {
    /**
     * A dialog showing shortcut map(s)
     * @class GUIShortcutsDialog
     * @extends GUIModal
     * @constructor
     * @version 1.0
     */
    function GUIShortcutsDialog() {
        GUIModal.call(this);
    };

    GObject.inherit(GUIShortcutsDialog, GUIModal);

    /**
     * Creates a shortcutmap from the platform's globally available actions
     */
    GUIShortcutsDialog.createMapFromAvailableActions = function () {
        var actions = gApp.getAvailableActions();
        var actionsMap = [];
        var lastActionCategory = null;
        var lastHint = null;
        for (var i = 0; i <= actions.length; ++i) {
            var action = null, category = null;

            if (i < actions.length) {
                action = actions[i];

                category = gLocale.get(action.getCategory());

                if (!category) {
                    continue;
                }
            }

            if (lastActionCategory != category || i >= actions.length) {
                if (lastHint) {
                    var actionHint = lastHint.asHtml();
                    if (actionHint && lastHint.getKeys()) {
                        actionsMap.push(lastHint);
                    }
                }

                if (i < actions.length) {
                    lastHint = new GUIHint();
                    lastHint.setTitle(action.getCategory());
                    lastActionCategory = category;
                }
            }

            if (i >= actions.length) {
                break;
            }

            var actionShortcut = gApp.getShortcut(action.getId());
            if (!actionShortcut) {
                continue;
            }

            lastHint.addKey(actionShortcut, action.getTitle());
        }

        if (actionsMap.length > 0) {
            return {
                // TODO : I18N
                title: 'Actions',
                map: actionsMap
            }
        } else {
            return null;
        }
    };

    // -----------------------------------------------------------------------------------------------------------------
    // GUIShortcutsDialog Class
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * @type {boolean}
     * @private
     */
    GUIShortcutsDialog.prototype._initialized = false;

    /**
     * @type {{title: GLocale.Key|String, map: Array<GUIHint>}}
     * @private
     */
    GUIShortcutsDialog.prototype._maps = null;

    /**
     * Return the shortcut maps
     * @return {Array<{{title: GLocale.Key|String, map: Array<GUIHint>}}>}
     */
    GUIShortcutsDialog.prototype.getMaps = function () {
        return this._maps;
    };

    /**
     * Assign shortcutmap maps
     * @param {Array<{{title: GLocale.Key|String, map: Array<GUIHint>}}>} maps
     */
    GUIShortcutsDialog.prototype.setMaps = function (maps) {
        this._maps = maps;
        this._initialized = false;
    };

    /** @override */
    GUIShortcutsDialog.prototype.open = function () {
        if (!this._initialized) {
            this._initialize();
            this._initialized = true;
        }
        GUIModal.prototype.open.call(this);
    };

    GUIShortcutsDialog.prototype._initialize = function () {
        if (this._maps) {
            var headerParts = [];
            var contentParts = [];

            for (var i = 0; i < this._maps.length; ++i) {
                var map = this._maps[i];
                if (!map) {
                    continue;
                }

                var content = null;
                for (var k = 0; k < map.map.length; ++k) {
                    var code = map.map[k].asHtml();
                    if (code) {
                        if (content) {
                            content += code;
                        } else {
                            content = code;
                        }
                    }
                }

                if (!content || content === "") {
                    continue;
                }

                if (headerParts.length > 0) {
                    headerParts.push($('<span>&nbsp;</span>'));
                }

                var self = this;
                headerParts.push($('<button></button>')
                    .text(map.title)
                    .attr('data-link', "section-" + i.toString())
                    .on('click', function () {
                        self.scrollToElement('[data-link="' + $(this).attr('data-link') + '"]');
                    }));


                contentParts.push($('<h2></h2>')
                    .attr('data-link', "section-" + i.toString())
                    .text(map.title));

                contentParts.push($(content));
            }

            this.setHeader($(headerParts).map(function () {
                return this.toArray();
            }));

            this.setContent($('<div></div>')
                .addClass('g-shortcuts-dialog')
                .append($(contentParts).map(function () {
                    return this.toArray();
                })));
        }
    };

    _.GUIShortcutsDialog = GUIShortcutsDialog;
})(this);
