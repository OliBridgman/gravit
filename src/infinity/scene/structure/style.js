(function (_) {
    /**
     * A style that can be shared and paint itself
     * @class IFStyle
     * @extends IFNode
     * @mixes IFNode.Properties
     * @mixes IFNode.Store
     * @mixes IFNode.Reference
     * @mixes IFStylable
     * @constructor
     */
    IFStyle = function () {
        IFNode.call(this);
        this._setDefaultProperties(IFStyle.MetaProperties);
        this._setStyleDefaultProperties();
    };
    IFNode.inheritAndMix('style', IFStyle, IFNode, [IFNode.Properties, IFNode.Store, IFNode.Reference, IFStylable]);

    /**
     * The meta properties of a style with their default values
     */
    IFStyle.MetaProperties = {
        /** Name of the style */
        name: null,
        /** Property-Sets of the style */
        ps: [
            IFStylable.PropertySet.Style,
            IFStylable.PropertySet.Effects,
            IFStylable.PropertySet.Fill,
            IFStylable.PropertySet.Border,
            IFStylable.PropertySet.Text,
            IFStylable.PropertySet.Paragraph
        ]
    };

    /**
     * Disconnect this style from all the ones it is linked to
     */
    IFStyle.prototype.disconnectStyle = function () {
        var scene = this.getScene();
        if (scene) {
            var self = this;
            scene.visitLinks(this, function (link) {
                if (link.hasMixin(IFElement.Stylable)) {
                    link.setProperty('sref', null);
                }
            });
        }
    };

    /** @override */
    IFStyle.prototype.getStylePropertySets = function () {
        return this.$ps;
    };

    /** @override */
    IFStyle.prototype.validateInsertion = function (parent, reference) {
        return parent instanceof IFScene.StyleCollection;
    };

    /** @private */
    IFStyle.prototype._stylePropertiesUpdated = function (properties, previousValues) {
        var scene = this.getScene();
        if (scene) {
            var diffProperties = {};
            for (var i = 0; i < properties.length; ++i) {
                diffProperties[properties[i]] = previousValues[i];
            }

            var self = this;
            scene.visitLinks(this, function (link) {
                if (link.hasMixin(IFStylable)) {
                    link.assignStyleFrom(self, diffProperties);
                }
            });
        }
    };

    /** @override */
    IFStyle.prototype._handleChange = function (change, args) {
        if (change === IFNode._Change.Store) {
            this.storeProperties(args, IFStyle.MetaProperties);
        } else if (change === IFNode._Change.Restore) {
            this.restoreProperties(args, IFStyle.MetaProperties);
        }

        this._handleStyleChange(change, args);

        IFNode.prototype._handleChange.call(this, change, args);

    };

    /** @override */
    IFStyle.prototype.toString = function () {
        return "[Mixin IFStyle]";
    };

    _.IFStyle = IFStyle;
})(this);