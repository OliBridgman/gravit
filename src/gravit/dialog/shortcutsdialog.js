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
