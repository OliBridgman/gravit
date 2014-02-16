(function (_) {

    /**
     * A rectangle shape
     * @class GXRectangle
     * @extends GXPathBase
     * @constructor
     */
    function GXRectangle() {
        GXPathBase.call(this);
        this.$closed = true; // rectangles are always closed
        this._setDefaultProperties(GXRectangle.GeometryProperties);
        this._invalidatePath(); // create unit path
    }

    GXNode.inherit("rectangle", GXRectangle, GXPathBase);

    /**
     * The geometry properties of a rectangle with their default values
     */
    GXRectangle.GeometryProperties = {
        /** Top-Left uniform, corner-type, x-shoulder-length, y-shoulder-length */
        tl_uf: true,
        tl_ct: GXPathBase.CornerType.Rounded,
        tl_sx: 0,
        tl_sy: 0,
        /** Top-Right uniform, corner-type, x-shoulder-length, y-shoulder-length */
        tr_uf: true,
        tr_ct: GXPathBase.CornerType.Rounded,
        tr_sx: 0,
        tr_sy: 0,
        /** Bottom-Right uniform, corner-type, x-shoulder-length, y-shoulder-length */
        br_uf: true,
        br_ct: GXPathBase.CornerType.Rounded,
        br_sx: 0,
        br_sy: 0,
        /** Bottom-Left uniform, corner-type, x-shoulder-length, y-shoulder-length */
        bl_uf: true,
        bl_ct: GXPathBase.CornerType.Rounded,
        bl_sx: 0,
        bl_sy: 0
    };

    /**
     * Returns the property-prefix for a rectangle side
     * @param {GRect.Side} side the side to get a prefix for
     * @returns {string} the prefix for the given side
     */
    GXRectangle.getGeometryPropertiesSidePrefix = function (side) {
        switch (side) {
            case GRect.Side.TOP_LEFT:
                return 'tl';
            case GRect.Side.TOP_RIGHT:
                return 'tr';
            case GRect.Side.BOTTOM_RIGHT:
                return 'br';
            case GRect.Side.BOTTOM_LEFT:
                return 'bl';
            default:
                throw new Error("Invalid side");
        }
    };

    /**
     * Rectangle sides in their correct order
     * @type {Array<GRect.Side>}
     */
    GXRectangle.SIDES = [GRect.Side.TOP_LEFT, GRect.Side.TOP_RIGHT, GRect.Side.BOTTOM_RIGHT, GRect.Side.BOTTOM_LEFT];

    /**
     * Iterate all segments of the rectangle
     * @param {Function(point: GPoint, side: GRect.Side, cornerType: GXPathBase.CornerType, xShoulderLength: Number, yShoulderLength: Number)} iterator
     * the iterator receiving the parameters. If this returns true then the iteration will be stopped.
     * @param {Boolean} [includeTransform] if true, includes the transformation of the rectangle
     * if any in the returned coordinates. Defaults to false.
     */
    GXRectangle.prototype.iterateSegments = function (iterator, includeTransform) {
        var transform = includeTransform ? this.$transform : null;

        for (var i = 0; i < GXRectangle.SIDES.length; ++i) {
            var side = GXRectangle.SIDES[i];
            var prefix = GXRectangle.getGeometryPropertiesSidePrefix(side);
            var point = null;

            switch (side) {
                case GRect.Side.TOP_LEFT:
                    point = new GPoint(0, 0);
                    break;
                case GRect.Side.TOP_RIGHT:
                    point = new GPoint(1, 0);
                    break;
                case GRect.Side.BOTTOM_RIGHT:
                    point = new GPoint(1, 1);
                    break;
                case GRect.Side.BOTTOM_LEFT:
                    point = new GPoint(0, 1);
                    break;
            }

            if (transform) {
                point = transform.mapPoint(point);
            }

            if (iterator(point, side, this['$' + prefix + '_ct'], this['$' + prefix + '_sx'], this['$' + prefix + '_sy']) === true) {
                break;
            }
        }
    };

    /**
     * Checks whether one side or all sides are uniform
     * @param {GRect.Side} [side] the side to check for, if not set to
     * a valid GRect.Side then returns whether all sides are uniform or not
     * @returns {Boolean} whether given side or all sides are uniform
     */
    GXRectangle.prototype.isUniformCorner = function (side) {
        if (typeof side != 'number') {
            for (var i = 0; i < GXRectangle.SIDES.length; ++i) {
                var side = GXRectangle.SIDES[i];
                var prefix = GXRectangle.getGeometryPropertiesSidePrefix(side);
                if (!this['$' + prefix + '_uf']) {
                    return false;
                }
            }
            return true;
        } else {
            var prefix = GXRectangle.getGeometryPropertiesSidePrefix(side);
            return this['$' + prefix + '_uf']
        }
    };

    /** @override */
    GXRectangle.prototype.store = function (blob) {
        if (GXPathBase.prototype.store.call(this, blob)) {
            if (this.isUniformCorner()) {
                blob.uf = true; // all uniform
                blob.ct = this.$tl_ct; // all corner type
                blob.sl = this.$tl_sx; // all shoulder length
            } else {
                for (var i = 0; i < GXRectangle.SIDES.length; ++i) {
                    var side = GXRectangle.SIDES[i];
                    var prefix = GXRectangle.getGeometryPropertiesSidePrefix(side);
                    blob[prefix + 'uf'] = this['$' + prefix + '_uf'];
                    blob[prefix + 'ct'] = this['$' + prefix + '_ct'];
                    blob[prefix + 'sl'] = [this['$' + prefix + '_sx'], this['$' + prefix + '_sy']];
                }
            }
            return true;
        }
        return false;
    };

    /** @override */
    GXRectangle.prototype.restore = function (blob) {
        if (GXPathBase.prototype.restore.call(this, blob)) {
            // We'll use our custom restore routine here as we can save optimized
            for (var i = 0; i < GXRectangle.SIDES.length; ++i) {
                var side = GXRectangle.SIDES[i];
                var prefix = GXRectangle.getGeometryPropertiesSidePrefix(side);
                this['$' + prefix + '_uf'] = blob.uf ? blob.uf : blob[prefix + 'uf'];
                this['$' + prefix + '_ct'] = blob.uf ? blob.ct : blob[prefix + 'ct'];
                this['$' + prefix + '_sx'] = blob.uf ? blob.sl : blob[prefix + 'sl'][0];
                this['$' + prefix + '_sy'] = blob.uf ? blob.sl : blob[prefix + 'sl'][1];
            }

            this._invalidatePath();
            return true;
        }
        return false;
    };

    /** @override */
    GXRectangle.prototype._handleChange = function (change, args) {
        if (this._handleGeometryChangeForProperties(change, args, GXRectangle.GeometryProperties) && change == GXNode._Change.AfterPropertiesChange) {
            var propertiesToSet = [];
            var valuesToSet = [];

            // Handle uniformity of properties
            for (var i = 0; i < GXRectangle.SIDES.length; ++i) {
                var side = GXRectangle.SIDES[i];
                var prefix = GXRectangle.getGeometryPropertiesSidePrefix(side);

                if (this.isUniformCorner()) {
                    propertiesToSet.push(prefix + '_ct');
                    valuesToSet.push(this.$tl_ct);
                    propertiesToSet.push(prefix + '_sx');
                    valuesToSet.push(this.$tl_sx);
                    propertiesToSet.push(prefix + '_sy');
                    valuesToSet.push(this.$tl_sy);
                } else if (this.isUniformCorner(side)) {
                    propertiesToSet.push(prefix + '_sy');
                    valuesToSet.push(this['$' + prefix + '_sx']);
                }
            }

            if (!this.setProperties(propertiesToSet, valuesToSet)) {
                this._invalidatePath();
            }
        }
        GXPathBase.prototype._handleChange.call(this, change, args);
    };

    /**
     * @private
     */
    GXRectangle.prototype._invalidatePath = function () {
        this.beginUpdate();
        this._firstChild.clearChildren();

        this.iterateSegments(function (point, side, cornerType, xShoulderLength, yShoulderLength) {
            var anchorPoint = new GXPathBase.AnchorPoint();
            anchorPoint.setProperties(['tp', 'x', 'y', 'cl', 'cr'], [cornerType, point.getX(), point.getY(), xShoulderLength, yShoulderLength]);
            this._firstChild.appendChild(anchorPoint, false);
        }.bind(this));
        this.endUpdate();
    };

    /** @override */
    GXRectangle.prototype.toString = function () {
        return "[GXRectangle]";
    };

    _.GXRectangle = GXRectangle;
})(this);