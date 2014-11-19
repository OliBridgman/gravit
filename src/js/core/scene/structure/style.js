(function (_) {
    /**
     * A style that can be shared and paint itself
     * @class GStyle
     * @extends GNode
     * @mixes GNode.Properties
     * @mixes GNode.Store
     * @mixes GNode.Reference
     * @mixes GStylable
     * @constructor
     */
    GStyle = function () {
        GNode.call(this);
        this._setDefaultProperties(GStyle.MetaProperties);
        this._setStyleDefaultProperties();
    };
    GNode.inheritAndMix('style', GStyle, GNode, [GNode.Properties, GNode.Store, GNode.Reference, GStylable]);

    /**
     * The meta properties of a style with their default values
     */
    GStyle.MetaProperties = {
        /** Name of the style */
        name: null,
        /** Property-Sets of the style */
        ps: [
            GStylable.PropertySet.Style,
            GStylable.PropertySet.Effects,
            GStylable.PropertySet.Fill,
            GStylable.PropertySet.Border,
            GStylable.PropertySet.Text,
            GStylable.PropertySet.Paragraph
        ]
    };

    /** @override */
    GStyle.prototype.assignStyleFrom = function (source, compare) {
        var scene = this.getScene();
        if (scene) {
            scene.visitLinks(this, function (link) {
                if (link !== source && link.hasMixin(GStylable)) {
                    link.assignStyleFrom(source, this);
                }
            }.bind(this));
        }

        this._beginBlockChanges([GNode._Change.BeforePropertiesChange, GNode._Change.AfterPropertiesChange]);
        try {
            GStylable.prototype.assignStyleFrom.call(this, source);
        } finally {
            this._endBlockChanges([GNode._Change.BeforePropertiesChange, GNode._Change.AfterPropertiesChange]);
        }
    };

    /**
     * Disconnect this style from all the ones it is linked to
     */
    GStyle.prototype.disconnectStyle = function () {
        var scene = this.getScene();
        if (scene) {
            scene.visitLinks(this, function (link) {
                if (link.hasMixin(GElement.Stylable)) {
                    link.setProperty('sref', null);
                }
            });
        }
    };

    /** @override */
    GStyle.prototype.getStylePropertySets = function () {
        return this.$ps;
    };

    /** @override */
    GStyle.prototype.validateInsertion = function (parent, reference) {
        return parent instanceof GScene.StyleCollection;
    };

    /** @private */
    GStyle.prototype._stylePropertiesUpdated = function (properties, previousValues) {
        var scene = this.getScene();
        if (scene) {
            scene.visitLinks(this, function (link) {
                if (link.hasMixin(GStylable)) {
                    link.assignStyleFrom(this);
                }
            }.bind(this));
        }
    };

    /** @override */
    GStyle.prototype._handleChange = function (change, args) {
        if (change === GNode._Change.Store) {
            this.storeProperties(args, GStyle.MetaProperties);
        } else if (change === GNode._Change.Restore) {
            this.restoreProperties(args, GStyle.MetaProperties);
        }

        this._handleStyleChange(change, args);

        GNode.prototype._handleChange.call(this, change, args);

    };

    /** @override */
    GStyle.prototype.toString = function () {
        return "[Mixin GStyle]";
    };

    _.GStyle = GStyle;
})(this);