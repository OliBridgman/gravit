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
    IFObject.inherit(GEffectProperties, GProperties);

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
            /*
            var scene = this._document.getScene();
            scene.removeEventListener(IFNode.AfterInsertEvent, this._afterNodeInsert, this);
            scene.removeEventListener(IFNode.BeforeRemoveEvent, this._beforeNodeRemove, this);
            scene.removeEventListener(IFNode.AfterPropertiesChangeEvent, this._afterPropertiesChange, this);
            this._document = null;
            */
        }

        var effectElements = [];
        for (var i = 0; i < elements.length; ++i) {
            if (elements[i].hasMixin(IFStylable) && elements[i].getStylePropertySets().indexOf(IFStylable.PropertySet.Effects) >= 0) {
                effectElements.push(elements[i]);
            }
        }

        if (effectElements.length === elements.length) {
            this._document = document;
            this._effectsPanel.gEffectPanel('elements', effectElements);
            /*

            var scene = this._document.getScene();
            scene.addEventListener(IFNode.AfterInsertEvent, this._afterNodeInsert, this);
            scene.addEventListener(IFNode.BeforeRemoveEvent, this._beforeNodeRemove, this);
            scene.addEventListener(IFNode.AfterPropertiesChangeEvent, this._afterPropertiesChange, this);
            */
            return true;
        } else {
            return false;
        }
    };

    /**
     * @param {IFNode.AfterInsertEvent} event
     * @private
     */
    GEffectProperties.prototype._afterNodeInsert = function (event) {
        if (event.node instanceof IFEffect && event.node.getOwnerStylable() === this._elements[0]) {
            this._insertEffect(event.node);
        }
    };

    /**
     * @param {IFNode.BeforeRemoveEvent} event
     * @private
     */
    GEffectProperties.prototype._beforeNodeRemove = function (event) {
        if (event.node instanceof IFEffect && event.node.getOwnerStylable() === this._elements[0]) {
            this._removeEffect(event.node);
        }
    };

    /**
     * @param {IFNode.AfterPropertiesChangeEvent} event
     * @private
     */
    GEffectProperties.prototype._afterPropertiesChange = function (event) {
        if (event.node instanceof IFEffect && event.node.getOwnerStylable() === this._elements[0]) {
            this._updateEffect(event.node);
        }
    };

    /** @override */
    GEffectProperties.prototype.toString = function () {
        return "[Object GEffectProperties]";
    };

    _.GEffectProperties = GEffectProperties;
})(this);