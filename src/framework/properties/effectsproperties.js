(function (_) {
    /**
     * Effects properties panel
     * @class GEffectProperties
     * @extends GProperties
     * @constructor
     */
    function GEffectProperties() {
        this._elements = [];
    };
    GObject.inherit(GEffectProperties, GProperties);

    /**
     * @type {JQuery}
     * @private
     */
    GEffectProperties.prototype._panel = null;

    /**
     * @type {GDocument}
     * @private
     */
    GEffectProperties.prototype._document = null;

    /**
     * @type {Array<JQuery>}
     * @private
     */
    GEffectProperties.prototype._effectsPanel = null;

    /** @override */
    GEffectProperties.prototype.init = function (panel) {
        this._panel = panel;

        this._effectsPanel = $('<div></div>')
            .css({
                'position': 'absolute',
                'top': '5px',
                'left': '5px',
                'right': '5px',
                'bottom': '5px'
            })
            .gEffectPanel();

        panel
            .css('width', '175px')
            .append(this._effectsPanel);
    };

    /** @override */
    GEffectProperties.prototype.update = function (document, elements) {
        if (this._document) {
            this._effectsPanel.gEffectPanel('elements', null);
        }

        var effectElements = [];
        for (var i = 0; i < elements.length; ++i) {
            if (elements[i].hasMixin(GStylable) && elements[i].getStylePropertySets().indexOf(GStylable.PropertySet.Effects) >= 0) {
                effectElements.push(elements[i]);
            }
        }

        if (effectElements.length === elements.length) {
            this._document = document;
            this._effectsPanel.gEffectPanel('elements', effectElements);
            return true;
        } else {
            return false;
        }
    };

    /** @override */
    GEffectProperties.prototype.toString = function () {
        return "[Object GEffectProperties]";
    };

    _.GEffectProperties = GEffectProperties;
})(this);