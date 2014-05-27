(function (_) {

    /**
     * A rectangle shape
     * @class IFRectangle
     * @extends IFPathBase
     * @constructor
     */
    function IFRectangle() {
        IFPathBase.call(this);
        this.$closed = true; // rectangles are always closed
        this._setDefaultProperties(IFRectangle.GeometryProperties);
        this._invalidatePath(); // create unit path
    }

    IFNode.inherit("rectangle", IFRectangle, IFPathBase);

    /**
     * The geometry properties of a rectangle with their default values
     */
    IFRectangle.GeometryProperties = {
        /** All corners uniform */
        uf: true,
        /** Top-Left uniform, corner-type, x-shoulder-length, y-shoulder-length */
        tl_uf: true,
        tl_ct: IFPathBase.CornerType.Rounded,
        tl_sx: 0,
        tl_sy: 0,
        /** Top-Right uniform, corner-type, x-shoulder-length, y-shoulder-length */
        tr_uf: true,
        tr_ct: IFPathBase.CornerType.Rounded,
        tr_sx: 0,
        tr_sy: 0,
        /** Bottom-Right uniform, corner-type, x-shoulder-length, y-shoulder-length */
        br_uf: true,
        br_ct: IFPathBase.CornerType.Rounded,
        br_sx: 0,
        br_sy: 0,
        /** Bottom-Left uniform, corner-type, x-shoulder-length, y-shoulder-length */
        bl_uf: true,
        bl_ct: IFPathBase.CornerType.Rounded,
        bl_sx: 0,
        bl_sy: 0
    };

    /**
     * Returns the property-prefix for a rectangle side
     * @param {GRect.Side} side the side to get a prefix for
     * @returns {string} the prefix for the given side
     */
    IFRectangle.getGeometryPropertiesSidePrefix = function (side) {
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
    IFRectangle.SIDES = [GRect.Side.TOP_LEFT, GRect.Side.TOP_RIGHT, GRect.Side.BOTTOM_RIGHT, GRect.Side.BOTTOM_LEFT];

    /**
     * Iterate all segments of the rectangle
     * @param {Function(point: GPoint, side: GRect.Side, cornerType: IFPathBase.CornerType, leftShoulderLength: Number, rightShoulderLength: Number, idx: Number)} iterator
     * the iterator receiving the parameters. If this returns true then the iteration will be stopped.
     * @param {Boolean} [includeTransform] if true, includes the transformation of the rectangle
     * if any in the returned coordinates. Defaults to false.
     */
    IFRectangle.prototype.iterateSegments = function (iterator, includeTransform) {
        var transform = includeTransform ? this.$trf : null;

        for (var i = 0; i < IFRectangle.SIDES.length; ++i) {
            var side = IFRectangle.SIDES[i];
            var prefix = IFRectangle.getGeometryPropertiesSidePrefix(side);
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

    /** @override */
    IFRectangle.prototype.store = function (blob) {
        if (IFPathBase.prototype.store.call(this, blob)) {
            if (this.uf) {
                blob.uf = true; // all uniform
                blob.ct = this.$tl_ct; // all corner type
                blob.sl = this.$tl_sx; // all shoulder length
            } else {
                for (var i = 0; i < IFRectangle.SIDES.length; ++i) {
                    var side = IFRectangle.SIDES[i];
                    var prefix = IFRectangle.getGeometryPropertiesSidePrefix(side);
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
    IFRectangle.prototype.restore = function (blob) {
        if (IFPathBase.prototype.restore.call(this, blob)) {
            // We'll use our custom restore routine here as we can save optimized
            for (var i = 0; i < IFRectangle.SIDES.length; ++i) {
                var side = IFRectangle.SIDES[i];
                var prefix = IFRectangle.getGeometryPropertiesSidePrefix(side);
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

    /**
     * Return the anchor points of the rectangle
     * @returns {IFPathBase.AnchorPoints}
     */
    IFRectangle.prototype.getAnchorPoints = function () {
        return this._getAnchorPoints();
    };

    /** @override */
    IFRectangle.prototype._handleChange = function (change, args) {
        if (this._handleGeometryChangeForProperties(change, args, IFRectangle.GeometryProperties) && change == IFNode._Change.AfterPropertiesChange) {
            var propertiesToSet = [];
            var valuesToSet = [];

            var props = args.properties;
            var vals = args.values;

            if (this.$uf) {
                var newSVal = null;
                var newTVal = null;
                var sValAssigned = false;
                var tValAssigned = false;
                for (var i = 0; i < IFRectangle.SIDES.length && (!sValAssigned || !tValAssigned); ++i) {
                    var side = IFRectangle.SIDES[i];
                    var prefix = IFRectangle.getGeometryPropertiesSidePrefix(side);
                    if (!sValAssigned) {
                        var prop = prefix + '_sx';
                        var idx = props.indexOf(prop);
                        if (idx >= 0) {
                            newSVal = vals[idx];
                            sValAssigned = true;
                        } else {
                            var prop = prefix + '_sy';
                            var idx = props.indexOf(prop);
                            if (idx >= 0) {
                                newSVal = vals[idx];
                                sValAssigned = true;
                            }
                        }
                    }
                    if (!tValAssigned) {
                        var prop = prefix + '_ct';
                        var idx = props.indexOf(prop);
                        if (idx >= 0) {
                            newTVal = vals[idx];
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
                for (var i = 0; i < IFRectangle.SIDES.length; ++i) {
                    var side = IFRectangle.SIDES[i];
                    var prefix = IFRectangle.getGeometryPropertiesSidePrefix(side);
                    var newSVal = null;
                    var sValAssigned = false;

                    if (this['$' + prefix + '_uf']) {
                        var prop = prefix + '_sx';
                        var idx = props.indexOf(prop);
                        if (idx >= 0) {
                            newSVal = vals[idx];
                            sValAssigned = true;
                        } else {
                            var prop = prefix + '_sy';
                            var idx = props.indexOf(prop);
                            if (idx >= 0) {
                                newSVal = vals[idx];
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
        IFPathBase.prototype._handleChange.call(this, change, args);
    };

    /**
     * @private
     */
    IFRectangle.prototype._invalidatePath = function () {
        var anchorPoints = this._getAnchorPoints();

        this.beginUpdate();
        anchorPoints._beginBlockCompositeEvents(true, true, true);
        try {
            // Clear old path points
            anchorPoints.clearChildren();

            this.iterateSegments(function (point, side, cornerType, xShoulderLength, yShoulderLength) {
                var anchorPoint = new IFPathBase.AnchorPoint();
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
    IFRectangle.prototype.toString = function () {
        return "[IFRectangle]";
    };

    _.IFRectangle = IFRectangle;
})(this);