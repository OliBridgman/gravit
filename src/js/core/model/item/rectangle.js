(function (_) {

    /**
     * A rectangle shape
     * @class GRectangle
     * @extends GPathBase
     * @constructor
     */
    function GRectangle() {
        GPathBase.call(this);
        this.$closed = true; // rectangles are always closed
        this._setDefaultProperties(GRectangle.GeometryProperties);
        this._invalidatePath(); // create unit path
    }

    GNode.inherit("rectangle", GRectangle, GPathBase);

    /**
     * The geometry properties of a rectangle with their default values
     */
    GRectangle.GeometryProperties = {
        /** All corners uniform */
        uf: true,
        /** Top-Left uniform, corner-type, x-shoulder-length, y-shoulder-length */
        tl_uf: true,
        tl_ct: GPathBase.CornerType.Rounded,
        tl_sx: 0,
        tl_sy: 0,
        /** Top-Right uniform, corner-type, x-shoulder-length, y-shoulder-length */
        tr_uf: true,
        tr_ct: GPathBase.CornerType.Rounded,
        tr_sx: 0,
        tr_sy: 0,
        /** Bottom-Right uniform, corner-type, x-shoulder-length, y-shoulder-length */
        br_uf: true,
        br_ct: GPathBase.CornerType.Rounded,
        br_sx: 0,
        br_sy: 0,
        /** Bottom-Left uniform, corner-type, x-shoulder-length, y-shoulder-length */
        bl_uf: true,
        bl_ct: GPathBase.CornerType.Rounded,
        bl_sx: 0,
        bl_sy: 0
    };

    /**
     * Returns the property-prefix for a rectangle side
     * @param {GRect.Side} side the side to get a prefix for
     * @returns {string} the prefix for the given side
     */
    GRectangle.getGeometryPropertiesSidePrefix = function (side) {
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
    GRectangle.SIDES = [GRect.Side.TOP_LEFT, GRect.Side.TOP_RIGHT, GRect.Side.BOTTOM_RIGHT, GRect.Side.BOTTOM_LEFT];

    /**
     * Iterate all segments of the rectangle
     * @param {Function(point: GPoint, side: GRect.Side, cornerType: GPathBase.CornerType, leftShoulderLength: Number, rightShoulderLength: Number, idx: Number)} iterator
     * the iterator receiving the parameters. If this returns true then the iteration will be stopped.
     * @param {Boolean} [includeTransform] if true, includes the transformation of the rectangle
     * if any in the returned coordinates. Defaults to false.
     */
    GRectangle.prototype.iterateSegments = function (iterator, includeTransform) {
        var transform = includeTransform ? this.$trf : null;

        for (var i = 0; i < GRectangle.SIDES.length; ++i) {
            var side = GRectangle.SIDES[i];
            var prefix = GRectangle.getGeometryPropertiesSidePrefix(side);
            var point = null;

            switch (side) {
                case GRect.Side.TOP_LEFT:
                    point = new GPoint(-1, -1);
                    break;
                case GRect.Side.TOP_RIGHT:
                    point = new GPoint(1, -1);
                    break;
                case GRect.Side.BOTTOM_RIGHT:
                    point = new GPoint(1, 1);
                    break;
                case GRect.Side.BOTTOM_LEFT:
                    point = new GPoint(-1, 1);
                    break;
            }

            if (transform) {
                point = transform.mapPoint(point);
            }

            if (iterator(point, side, this['$' + prefix + '_ct'], this['$' + prefix + '_sx'], this['$' + prefix + '_sy'], i) === true) {
                break;
            }
        }
    };

    /**
     * Return the anchor points of the rectangle
     * @returns {GPathBase.AnchorPoints}
     */
    GRectangle.prototype.getAnchorPoints = function () {
        return this._getAnchorPoints();
    };

    /** @override */
    GRectangle.prototype._handleChange = function (change, args) {
        if (change === GNode._Change.Store) {
            if (this.$uf) {
                args.uf = true; // all uniform
                args.ct = this.$tl_ct; // all corner type
                args.sl = this.$tl_sx; // all shoulder length
            } else {
                for (var i = 0; i < GRectangle.SIDES.length; ++i) {
                    var side = GRectangle.SIDES[i];
                    var prefix = GRectangle.getGeometryPropertiesSidePrefix(side);
                    args[prefix + 'uf'] = this['$' + prefix + '_uf'];
                    args[prefix + 'ct'] = this['$' + prefix + '_ct'];
                    args[prefix + 'sl'] = [this['$' + prefix + '_sx'], this['$' + prefix + '_sy']];
                }
            }
        } else if (change === GNode._Change.Restore) {
            // We'll use our custom restore routine here as we can save optimized
            for (var i = 0; i < GRectangle.SIDES.length; ++i) {
                var side = GRectangle.SIDES[i];
                var prefix = GRectangle.getGeometryPropertiesSidePrefix(side);
                this.$uf = args.uf;
                this['$' + prefix + '_uf'] = args.uf ? args.uf : args[prefix + 'uf'];
                this['$' + prefix + '_ct'] = args.uf ? args.ct : args[prefix + 'ct'];
                this['$' + prefix + '_sx'] = args.uf ? args.sl : args[prefix + 'sl'][0];
                this['$' + prefix + '_sy'] = args.uf ? args.sl : args[prefix + 'sl'][1];
            }

            this._invalidatePath();
        }
        
        if (this._handleGeometryChangeForProperties(change, args, GRectangle.GeometryProperties) && change == GNode._Change.AfterPropertiesChange) {
            var propertiesToSet = [];
            var valuesToSet = [];

            var props = args.properties;

            if (this.$uf) {
                var newSVal = null;
                var newTVal = null;
                var sValAssigned = false;
                var tValAssigned = false;
                for (var i = 0; i < GRectangle.SIDES.length && (!sValAssigned || !tValAssigned); ++i) {
                    var side = GRectangle.SIDES[i];
                    var prefix = GRectangle.getGeometryPropertiesSidePrefix(side);
                    if (!sValAssigned) {
                        var prop = prefix + '_sx';
                        var idx = props.indexOf(prop);
                        if (idx >= 0) {
                            newSVal = this['$' + prop];
                            sValAssigned = true;
                        } else {
                            var prop = prefix + '_sy';
                            var idx = props.indexOf(prop);
                            if (idx >= 0) {
                                newSVal = this['$' + prop];
                                sValAssigned = true;
                            }
                        }
                    }
                    if (!tValAssigned) {
                        var prop = prefix + '_ct';
                        var idx = props.indexOf(prop);
                        if (idx >= 0) {
                            newTVal = this['$' + prop];
                            tValAssigned = true;
                        }
                    }
                }
                if (!sValAssigned) {
                    newSVal = this.getProperty('tl_sx');
                }
                if (!tValAssigned) {
                    newTVal = this.getProperty('tl_ct');
                }

                propertiesToSet.push('tl_uf', 'tr_uf', 'br_uf', 'bl_uf');
                valuesToSet.push(true, true, true, true);

                propertiesToSet.push('tl_sx', 'tl_sy', 'tr_sx', 'tr_sy', 'br_sx', 'br_sy', 'bl_sx', 'bl_sy');
                valuesToSet.push(newSVal, newSVal, newSVal, newSVal, newSVal, newSVal, newSVal, newSVal);

                propertiesToSet.push('tl_ct', 'tr_ct', 'br_ct', 'bl_ct');
                valuesToSet.push(newTVal, newTVal, newTVal, newTVal);
            } else {
                for (var i = 0; i < GRectangle.SIDES.length; ++i) {
                    var side = GRectangle.SIDES[i];
                    var prefix = GRectangle.getGeometryPropertiesSidePrefix(side);
                    var newSVal = null;
                    var sValAssigned = false;

                    if (this['$' + prefix + '_uf']) {
                        var prop = prefix + '_sx';
                        var idx = props.indexOf(prop);
                        if (idx >= 0) {
                            newSVal = this['$' + prop];
                            sValAssigned = true;
                        } else {
                            var prop = prefix + '_sy';
                            var idx = props.indexOf(prop);
                            if (idx >= 0) {
                                newSVal = this['$' + prop];
                                sValAssigned = true;
                            }
                        }
                        if (!sValAssigned) {
                            newSVal = this.getProperty(prefix + '_sx');
                        }

                        propertiesToSet.push(prefix + '_sx');
                        valuesToSet.push(newSVal);
                        propertiesToSet.push(prefix + '_sy');
                        valuesToSet.push(newSVal);
                    }
                }
            }

            if (!this.setProperties(propertiesToSet, valuesToSet)) {
                this._invalidatePath();
            }
        }
        
        GPathBase.prototype._handleChange.call(this, change, args);
    };

    /** @override */
    GRectangle.prototype._calculateOrigGeometryBBox = function () {
        return new GRect(-1, -1, 2, 2);
    };

    /**
     * @private
     */
    GRectangle.prototype._invalidatePath = function () {
        var anchorPoints = this._getAnchorPoints();

        this.beginUpdate();
        anchorPoints._beginBlockCompositeEvents(true, true, true);
        try {
            // Clear old path points
            anchorPoints.clearChildren();

            this.iterateSegments(function (point, side, cornerType, xShoulderLength, yShoulderLength) {
                var anchorPoint = new GPathBase.AnchorPoint();
                anchorPoint.setProperties(['tp', 'x', 'y', 'cl', 'cr', 'cu'],
                    [cornerType, point.getX(), point.getY(), xShoulderLength, yShoulderLength, false]);

                anchorPoints.appendChild(anchorPoint);
            }.bind(this));

        } finally {
            this.endUpdate();
            anchorPoints._endBlockCompositeEvents(true, true, true);
        }
    };

    /** @override */
    GRectangle.prototype.toString = function () {
        return "[GRectangle]";
    };

    _.GRectangle = GRectangle;
})(this);