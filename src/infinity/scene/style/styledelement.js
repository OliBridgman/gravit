(function (_) {
    /**
     * Mixin to mark an element being styled
     * @class IFStyledElement
     * @extends IFStylable
     * @constructor
     * @mixin
     */
    IFStyledElement = function () {
    };
    IFObject.inherit(IFStyledElement, IFStylable);

    /**
     * Geometry properties
     */
    IFStyledElement.GeometryProperties = {
        // The linked style reference id if any
        sref: null
    };

    /** @override */
    IFStyledElement.prototype.assignStyleFrom = function (source) {
        if (source.hasMixin(IFStyledElement)) {
            this.setProperty('sref', source.getProperty('sref'));
        }
        IFStylable.prototype.assignStyleFrom.call(this, source);
    };

    /** @override */
    IFStyledElement.prototype._stylePrepareGeometryChange = function () {
        this._notifyChange(IFElement._Change.PrepareGeometryUpdate);
    };

    /** @override */
    IFStyledElement.prototype._styleFinishGeometryChange = function () {
        this._notifyChange(IFElement._Change.FinishGeometryUpdate);
    };

    /** @override */
    IFStyledElement.prototype._styleRepaint = function () {
        this._notifyChange(IFElement._Change.InvalidationRequest);
    };

    /** @override */
    IFStyledElement.prototype._handleStyleChange = function (change, args) {
        if (this.isAttached()) {
            if (((change === IFNode._Change.BeforePropertiesChange || change === IFNode._Change.AfterPropertiesChange) && args.properties.indexOf('sref') >= 0) ||
                change === IFNode._Change.Attached || change === IFNode._Change.Detach) {
                var scene = this.getScene();
                var referencedStyle = this.$sref ? scene.getReference(this.$sref) : null;
                if (referencedStyle) {
                    switch (change) {
                        case IFNode._Change.BeforePropertiesChange:
                        case IFNode._Change.Detach:
                            scene.unlink(referencedStyle, this);
                            break;
                        case IFNode._Change.AfterPropertiesChange:
                        case IFNode._Change.Attached:
                            scene.link(referencedStyle, this);
                            break;
                    }
                }
            }
        }

        if (change === IFNode._Change.Store) {
            if (this.$sref) {
                args.sref = this.$sref;
            }
        } else if (change === IFNode._Change.Restore) {
            this.$ref = args.sref;
        }

        IFStylable.prototype._handleStyleChange.call(this, change, args);
    };

    /** @override */
    IFStyledElement.prototype.toString = function () {
        return "[Mixin IFStyledElement]";
    };

    _.IFStyledElement = IFStyledElement;
})(this);