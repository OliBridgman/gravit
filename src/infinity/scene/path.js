(function (_) {

    /**
     * A path shape
     * @class GXPath
     * @extends GXPathBase
     * @constructor
     */
    function GXPath(closed, evenOdd, anchorPoints) {
        GXPathBase.call(this, closed, evenOdd, anchorPoints);
        this._setDefaultProperties(GXPath.GeometryProperties);
    }

    GXNode.inherit("path", GXPath, GXPathBase);

    /**
     * The geometry properties of a path with their default values
     */
    GXPath.GeometryProperties = {
        /** Closed or not */
        closed: false
    };

    /**
     * Return the anchor points of the path
     * @returns {GXPathBase.AnchorPoints}
     */
    GXPath.prototype.getAnchorPoints = function () {
        return this._firstChild;
    };

    /** @override */
    GXPath.prototype.store = function (blob) {
        if (GXPathBase.prototype.store.call(this, blob)) {
            this.storeProperties(blob, GXPath.GeometryProperties);

            // Store our anchor points
            blob.pts = this.getAnchorPoints().serialize();
            return true;
        }
        return false;
    };

    /** @override */
    GXPath.prototype.restore = function (blob) {
        if (GXPathBase.prototype.restore.call(this, blob)) {
            this.restoreProperties(blob, GXPath.GeometryProperties, true);

            // Restore our anchor points
            if (blob.hasOwnProperty('pts')) {
                this.getAnchorPoints().deserialize(blob.pts);
            }
            return true;
        }
        return false;
    };

    /** @override */
    GXPath.prototype.clone = function () {
        var clone = GXPathBase.prototype.clone.call(this);

        // Transfer selected anchor points as flags are not cloned
        var selectedAnchorPoints = this.getAnchorPoints().queryAll(':selected');
        for (var i = 0; i < selectedAnchorPoints.length; ++i) {
            var anchorPointIndex = this.getAnchorPoints().getIndexOfChild(selectedAnchorPoints[i]);
            var cloneAnchorPoint = clone.getAnchorPoints().getChildByIndex(anchorPointIndex);
            if (cloneAnchorPoint) {
                cloneAnchorPoint.setFlag(GXNode.Flag.Selected);
            }
        }

        return clone;
    };

    /** @override */
    GXPath.prototype._handleChange = function (change, args) {
        this._handleGeometryChangeForProperties(change, args, GXPath.GeometryProperties);
        this._handleGeometryChangeForProperties(change, args, GXPathBase.GeometryProperties);
        GXPathBase.prototype._handleChange.call(this, change, args);
    };

    /** @override */
    GXPath.prototype.toString = function () {
        return "[GXPath]";
    };

    _.GXPath = GXPath;
})(this);