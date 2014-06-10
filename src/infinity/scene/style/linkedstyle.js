(function (_) {

    /**
     * The linked style class
     * @class IFLinkedStyle
     * @extends IFAppliedStyle
     * @constructor
     */
    function IFLinkedStyle() {
        IFAppliedStyle.call(this);
        this._setDefaultProperties(IFLinkedStyle.GeometryProperties);
    }

    IFNode.inherit('lnStyle', IFLinkedStyle, IFAppliedStyle);

    /**
     * Geometry properties
     */
    IFLinkedStyle.GeometryProperties = {
        // The linked style reference id
        ref: null
    };

    /** @override */
    IFLinkedStyle.prototype.getActualStyle = function () {
        return this.$ref && this.isAttached() ? this.getScene().getReference(this.$ref) : null;
    };

    /** @override */
    IFLinkedStyle.prototype.store = function (blob) {
        if (IFAppliedStyle.prototype.store.call(this, blob)) {
            this.storeProperties(blob, IFLinkedStyle.GeometryProperties);
            return true;
        }
        return false;
    };

    /** @override */
    IFLinkedStyle.prototype.restore = function (blob) {
        if (IFAppliedStyle.prototype.restore.call(this, blob)) {
            this.restoreProperties(blob, IFLinkedStyle.GeometryProperties);
            return true;
        }
        return false;
    };

    /** @override */
    IFLinkedStyle.prototype._handleChange = function (change, args) {
        if (this._handleGeometryChangeForProperties(change, args, IFLinkedStyle.GeometryProperties)) {
            if (args.properties.indexOf('ls') >= 0) {
                var referencedStyle = this.getActualStyle();
                if (referencedStyle) {
                    switch (change) {
                        case IFNode._Change.BeforePropertiesChange:
                            this.getScene().unlink(referencedStyle, this);
                            break;
                        case IFNode._Change.AfterPropertiesChange:
                            this.getScene().link(referencedStyle, this);
                            break;
                    }
                }
            }
        }

        IFAppliedStyle.prototype._handleChange.call(this, change, args);
    };

    /** @override */
    IFLinkedStyle.prototype._setScene = function (scene) {
        if (scene !== this._scene) {
            if (scene) {
                var referencedStyle = scene.getReference(this.$ref);
                if (referencedStyle) {
                    scene.link(referencedStyle, this)
                }
            } else {
                var referencedStyle = this._scene.getReference(this.$ref);
                if (referencedStyle) {
                    this._scene.unlink(referencedStyle, this);
                }
            }
        }
        IFAppliedStyle.prototype._setScene.call(this, scene);
    };

    /** @override */
    IFLinkedStyle.prototype.toString = function () {
        return "[IFLinkedStyle]";
    };

    _.IFLinkedStyle = IFLinkedStyle;
})(this);