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

    /**
     * Return the referenced style if any
     * @returns {IFStyle}
     */
    IFStyledElement.prototype.getReferencedStyle = function () {
        return this.isAttached() && this.$sref ? this.getScene().getReference(this.$sref) : null;
    };

    /** @override */
    IFStyledElement.prototype.assignStyleFrom = function (source, diffProperties) {
        if (source.hasMixin(IFStyledElement)) {
            this.setProperty('sref', source.getProperty('sref'));
        }
        IFStylable.prototype.assignStyleFrom.call(this, source, diffProperties);
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
                var referencedStyle = this.getReferencedStyle();
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


            if (change === IFNode._Change.AfterPropertiesChange) {
                var styleBlendModeIdx = args.properties.indexOf('_sbl');
                if (styleBlendModeIdx >= 0 && args.values[styleBlendModeIdx] === 'mask' || this.$_sbl === 'mask') {
                    var myPage = this.getPage();
                    if (myPage) {
                        myPage._requestInvalidation();
                    }
                }
            }
        }

        if (change === IFNode._Change.Store) {
            if (this.$sref) {
                args.sref = this.$sref;
            }
        } else if (change === IFNode._Change.Restore) {
            this.$sref = args.sref;
        }

        IFStylable.prototype._handleStyleChange.call(this, change, args);
    };

    /** @override */
    IFStyledElement.prototype._getStyleMaskClipArea = function (context) {
        var myPage = this.getPage();
        if (myPage) {
            return myPage.getPageClipBBox();
        }
    };

    /** @override */
    IFStyledElement.prototype.toString = function () {
        return "[Mixin IFStyledElement]";
    };

    _.IFStyledElement = IFStyledElement;
})(this);