(function (_) {

    /**
     * The base for all path based shapes
     * @class GPathBase
     * @extends GShape
     * @constructor
     */
    function GPathBase(evenOdd, anchorPoints) {
        GShape.call(this);

        this._setDefaultProperties(GPathBase.VisualProperties);
        if (!!evenOdd) {
            this.$evenodd = evenOdd;
        }

        // Add anchor points
        this._anchorPoints = anchorPoints ? anchorPoints : new GPathBase.AnchorPoints();
        this._anchorPoints._setParent(this);
        this._anchorPoints._removalAllowed = false;

        this._vertices = new GVertexContainer();
        this._verticesDirty = true;
    }

    GObject.inherit(GPathBase, GShape);

    /**
     * @enum
     */
    GPathBase.CornerType = {
        /**
         * A rounded corner
         */
        Rounded: 'R',

        /**
         * An inverse rounded corner
         */
        InverseRounded: 'U',

        /**
         * A beveled corner
         */
        Bevel: 'B',

        /**
         * An inset corner
         */
        Inset: 'I',

        /**
         * A fancy corner
         */
        Fancy: 'F'
    };

    GPathBase.isCornerType = function (tp) {
        for (var key in GPathBase.CornerType) {
            if (GPathBase[key] === tp) {
                return true;
            }
        }
        return false;
    };

    /**
     * The visual properties of a path base with their default values
     */
    GPathBase.VisualProperties = {
        /** Even-Odd fill */
        evenodd: false
    };

    /**
     * Creates a new path from a given vertex source.
     * @param {GVertexSource} source
     * @return {GPath|GCompoundPath}
     */
    GPathBase.createPathFromVertexSource = function (source) {
        var vertex = new GVertex();
        var pathes = [];
        var path = null;
        var anchorPoints = null;
        var anchorPoint = null;
        var done = false;
        source.rewindVertices(0);
        while (!done && source.readVertex(vertex)) {
            switch (vertex.command) {
                case GVertex.Command.Move:
                    if (path && anchorPoints && anchorPoints.getFirstChild() != anchorPoints.getLastChild()) {
                        path.correctClosedAttribute();
                        pathes.push(path);
                    }
                    path = new GPath();
                    anchorPoints = path.getAnchorPoints();
                    anchorPoint = new GPathBase.AnchorPoint();
                    anchorPoint.setProperties(['x', 'y'], [vertex.x, vertex.y]);
                    anchorPoints.appendChild(anchorPoint);
                    break;
                case GVertex.Command.Line:
                    anchorPoint = new GPathBase.AnchorPoint();
                    anchorPoint.setProperties(['x', 'y'], [vertex.x, vertex.y]);
                    anchorPoints.appendChild(anchorPoint);
                    break;
                case GVertex.Command.Curve:
                    anchorPoint = new GPathBase.AnchorPoint();
                    var vertex2 = new GVertex();
                    if (source.readVertex(vertex2)) {
                        anchorPoint.setProperties(['x', 'y', 'hlx', 'hly'], [vertex.x, vertex.y, vertex2.x, vertex2.y]);
                        anchorPoints.appendChild(anchorPoint);
                    } else {
                        anchorPoint.setProperties(['x', 'y'], [vertex.x, vertex.y]);
                        anchorPoints.appendChild(anchorPoint);
                        done = true;
                        path.setProperty('closed', true);
                    }
                    break;
                case GVertex.Command.Curve2:
                    var vertex2 = new GVertex();
                    if (source.readVertex(vertex2)) {
                        if (anchorPoint) {
                            anchorPoint.setProperties(['hrx', 'hry'], [vertex2.x, vertex2.y]);
                        }
                        if (source.readVertex(vertex2)) {
                            anchorPoint = new GPathBase.AnchorPoint();
                            anchorPoint.setProperties(['x', 'y', 'hlx', 'hly'], [vertex.x, vertex.y, vertex2.x, vertex2.y]);
                            anchorPoints.appendChild(anchorPoint);
                        } else {
                            anchorPoint = new GPathBase.AnchorPoint();
                            anchorPoint.setProperties(['x', 'y'], [vertex.x, vertex.y]);
                            anchorPoints.appendChild(anchorPoint);
                            done = true;
                            path.setProperty('closed', true);
                        }
                    } else {
                        anchorPoint = new GPathBase.AnchorPoint();
                        anchorPoint.setProperties(['x', 'y'], [vertex.x, vertex.y]);
                        anchorPoints.appendChild(anchorPoint);
                        done = true;
                        path.setProperty('closed', true);
                    }
                    break;
                case GVertex.Command.Close:
                    path.setProperty('closed', true);
                    break;
                default:
                    break;
            }
        }

        if (path && anchorPoints && anchorPoints.getFirstChild() != anchorPoints.getLastChild()) {
            path.correctClosedAttribute();
            pathes.push(path);
        }

        if (pathes.length === 1) {
            return pathes[0];
        } else if (pathes.length > 1) {
            var compound = new GCompoundPath();
            for (var i = 0; i < pathes.length; ++i) {
                compound.getPaths().appendChild(pathes[i]);
            }
            return compound;
        } else {
            return null;
        }
    };

    // -----------------------------------------------------------------------------------------------------------------
    // GPathBase.AnchorPoint Class
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * @class GPathBase.AnchorPoint
     * @extends GNode
     * @mixes GNode.Properties
     * @constructor
     */
    GPathBase.AnchorPoint = function () {
        this._setDefaultProperties(GPathBase.AnchorPoint.GeometryProperties);
        this._leadHr = false;
    };
    GObject.inheritAndMix(GPathBase.AnchorPoint, GNode, [GNode.Properties]);

    /**
     * Take care not to clanch values with GPathBase.CornerType!
     * @enum
     */
    GPathBase.AnchorPoint.Type = {
        /**
         * Control points are completely independent of each other.
         */
        Asymmetric: 'TA',

        /**
         * Distance between the control points and the main point is independent, but they do mirror each other.
         */
        Symmetric: 'TS',

        /**
         * Control points mirror each other; they are opposite each other and at the same distance from the main point.
         */
        Mirror: 'TM',

        /**
         * Ensures that the handles defining a curve always stay aligned with the direction of its straight pathes.
         */
        Connector: 'TC'
    };

    /**
     * Geometrical properties of an anchor point
     */
    GPathBase.AnchorPoint.GeometryProperties = {
        /** The type of the anchor point */
        tp: GPathBase.AnchorPoint.Type.Asymmetric,
        /** The x position */
        x: 0,
        /** The y position */
        y: 0,
        /** The left handle's x position */
        hlx: null,
        /** The left handle's y position */
        hly: null,
        /** The right handle's x position */
        hrx: null,
        /** The right handle's y position */
        hry: null,
        /** Whether handles are auto-calculated or not */
        ah: false,
        /** Whether corner lengths are uniform or not */
        cu: true,
        /** The left corner length */
        cl: 0,
        /** The right corner length */
        cr: 0
    };

    /**
     * Constant used for approximating circle arcs with cubic bezier curve
     * @type {Number}
     */
    GPathBase.AnchorPoint.BEST_CIRCLE_COEFF = 0.55191502; // http://spencermortensen.com/articles/bezier-circle/

    /**
     * Coefficient, meaning the relevant length of handle in relevance to the distance between points,
     * when handle length should be calculated automatically
     * @type {number}
     */
    GPathBase.AnchorPoint.HANDLE_COEFF = 0.39026286; // 0.551915024494 / sqrt(2)

    /** @override */
    GPathBase.AnchorPoint.prototype.validateInsertion = function (parent, reference) {
        return parent instanceof GPathBase.AnchorPoints;
    };

    /**
     * Serializes this point into a stream array
     * @return {Array<*>}
     */
    GPathBase.AnchorPoint.prototype.serialize = function () {
        var stream = [];

        // Encoding: TYPE | AH | X | Y | 'h' | HLX | HLY | 'H' | HRX | HRY | 'C' | CL | CR
        if (this.$tp !== null && this.$tp !== GPathBase.AnchorPoint.GeometryProperties.tp) {
            stream.push(this.$tp);
        }

        if (this.$ah && this.$ah !== GPathBase.AnchorPoint.GeometryProperties.ah) {
            stream.push(this.$ah);
        }

        // Lets always serialize x,y properties, as it is a very rare case, when the value is the default (0,0).
        // Just waist of time for check if differ from default, and then again the check on restoring
        stream.push(this.$x);
        stream.push(this.$y);

        // If auto handles are not calculated automatically then save our handles if any
        if (!this.$ah) {
            // If handles are not null, save them even if they have default values,
            // as default value may be not the same as null, and we will need to differ this when deserializing.
            // Also currently the situation of default values is almost impossible for handles (possible only
            // in the case of some error somewhere in the code), so should be no waist of space for storing them
            if (this.$hlx !== null || this.$hly !== null) {
                stream.push('h');
                stream.push(this.$hlx);
                stream.push(this.$hly);
            }
            if (this.$hrx !== null || this.$hry !== null) {
                stream.push('H');
                stream.push(this.$hrx);
                stream.push(this.$hry);
            }
        }

        // Corner shoulder
        if ((this.$cl !== null && !GMath.isEqualEps(this.$cl, GPathBase.AnchorPoint.GeometryProperties.cl)) ||
            (this.$cr !== null && !GMath.isEqualEps(this.$cr, GPathBase.AnchorPoint.GeometryProperties.cr))) {
            stream.push('C');
            stream.push(this.$cl);
            stream.push(this.$cr);
        }

        return stream;
    };

    /**
     * Deserializes this point from a stream array
     * @param {Array<*>} stream
     */
    GPathBase.AnchorPoint.prototype.deserialize = function (stream) {
        var index = 0;

        // Read our Type if any
        if (stream.length > 0 && typeof stream[0] === 'string') {
            this.$tp = stream[0];
            index++;
        }

        // Read our auto-handles if any
        if (stream.length > index && typeof stream[index] === 'boolean') {
            this.$ah = stream[index];
            index++;
        }

        // Read coordinates of anchor point
        if (index + 1 < stream.length) {
            this.$x = stream[index];
            this.$y = stream[index + 1];
            index += 2;
        }

        // check of 'index + 2' is needed here, as both x and y are read in one cycle
        while (index + 2 < stream.length) {
            if (stream[index] === 'h') {
                this.$hlx = stream[index + 1];
                this.$hly = stream[index + 2];
            } else if (stream[index] === 'H') {
                this.$hrx = stream[index + 1];
                this.$hry = stream[index + 2];
            } else if (stream[index] === 'C') {
                this.$cl = stream[index + 1];
                this.$cr = stream[index + 2];
            }
            index += 3;
        }
    };

    /**
     * Returns a transformed copy of an anchor point. Only the point coordinates and handles are transformed,
     * but not the shoulders lengths
     * @param {GTransform} transform - a transform to apply
     * @returns {GPathBase.AnchorPoint} - a transformed copy of an anchor point
     * @private
     */
    GPathBase.AnchorPoint.prototype._getTransformedCopy = function (transform) {
        var pt = new GPathBase.AnchorPoint();

        var leftH = this.$hlx !== null ? transform.mapPoint(new GPoint(this.$hlx, this.$hly)) : null;
        var rightH = this.$hrx !== null ? transform.mapPoint(new GPoint(this.$hrx, this.$hry)) : null;
        var coord = transform.mapPoint(new GPoint(this.$x, this.$y));
        pt.$x = coord.getX();
        pt.$y = coord.getY();
        pt.$hlx = leftH ? leftH.getX() : null;
        pt.$hly = leftH ? leftH.getY() : null;
        pt.$hrx = rightH ? rightH.getX() : null;
        pt.$hry = rightH ? rightH.getY() : null;
        pt.$cl = this.$cl;
        pt.$cr = this.$cr;
        pt.$ah = this.$ah;
        pt.$tp = this.$tp;

        return pt;
    };

    /**
     * Returns a left shoulder point for points with set shoulder lengths, or null otherwise
     * @param {Boolean} fictiveCorner - if true, shoulder point will be calculated even
     * if there is no real corner due to absence of right shoulder
     * @returns {GPoint} a left shoulder point
     */
    GPathBase.AnchorPoint.prototype.getLeftShoulderPoint = function (fictiveCorner) {
        if (this.getPath() && this.$cl && (fictiveCorner || this.$cr)) {
            var prevPt = this._parent.getPreviousPoint(this);
            return this._parent._getLeftShoulderPoint(this, prevPt);
        } else {
            return null;
        }
    };

    /**
     * Returns a left shoulder point for points with set shoulder lengths, or null otherwise
     * Apply a passed transform to points before calculating shoulder point
     * @param {GTransform} transform - transform to apply
     * @param {Boolean} fictiveCorner - if true, shoulder point will be calculated even
     * if there is no real corner due to absence of right shoulder
     * @returns {GPoint} a left shoulder point
     */
    GPathBase.AnchorPoint.prototype.getLeftShoulderPointTransformed = function (transform, fictiveCorner) {
        var shoulderPt = null;

        if (this.getPath() && this.$cl && (fictiveCorner || this.$cr)) {
            var prevPt = this._parent.getPreviousPoint(this);
            var curPtTr = this._getTransformedCopy(transform);
            var prevPtTr = prevPt._getTransformedCopy(transform);
            shoulderPt = this._parent._getLeftShoulderPoint(curPtTr, prevPtTr);
        }

        return shoulderPt;
    };

    /**
     * Returns a right shoulder point for points with set shoulder lengths, or null otherwise
     * @param {Boolean} fictiveCorner - if true, shoulder point will be calculated even
     * if there is no real corner due to absence of left shoulder
     * @returns {GPoint} a right shoulder point
     */
    GPathBase.AnchorPoint.prototype.getRightShoulderPoint = function (fictiveCorner) {
        if (this.getPath() && this.$cr && (fictiveCorner || this.$cl)) {
            var nextPt = this._parent.getNextPoint(this);
            return this._parent._getRightShoulderPoint(this, nextPt);
        } else {
            return null;
        }
    };

    /**
     * Returns a right shoulder point for points with set shoulder lengths, or null otherwise
     * Apply a passed transform to points before calculating shoulder point
     * @param {GTransform} transform - transform to apply
     * @param {Boolean} fictiveCorner - if true, shoulder point will be calculated even
     * if there is no real corner due to absence of left shoulder
     * @returns {GPoint} a right shoulder point
     */
    GPathBase.AnchorPoint.prototype.getRightShoulderPointTransformed = function (transform, fictiveCorner) {
        var shoulderPt = null;

        if (this.getPath() && this.$cr && (fictiveCorner || this.$cl)) {
            var nextPt = this._parent.getNextPoint(this);
            var curPtTr = this._getTransformedCopy(transform);
            var nextPtTr = nextPt._getTransformedCopy(transform);
            shoulderPt = this._parent._getRightShoulderPoint(curPtTr, nextPtTr);
        }

        return shoulderPt;
    };

    /**
     * Returns a point until which left shoulder may be extended.
     * @returns {GPoint}
     */
    GPathBase.AnchorPoint.prototype.getLeftShoulderLimitPoint = function () {
        var limitPt = null;
        if (this.getPath()) {
            var prevPt = this._parent.getPreviousPoint(this);
            if (prevPt) {
                limitPt = this._parent._getLeftShoulderPoint(this, prevPt, true);
            }
        }
        return limitPt;
    };

    /**
     * Returns a point until which right shoulder may be extended.
     * @returns {GPoint}
     */
    GPathBase.AnchorPoint.prototype.getRightShoulderLimitPoint = function () {
        var limitPt = null;
        if (this.getPath()) {
            var nextPt = this._parent.getNextPoint(this);
            if (nextPt) {
                limitPt = this._parent._getRightShoulderPoint(this, nextPt, true);
            }
        }
        return limitPt;
    };

    /**
     * Flips the anchor point
     */
    GPathBase.AnchorPoint.prototype.flip = function () {
        this.setProperties(['hlx', 'hly', 'hrx', 'hry', 'cl', 'cr'],
            [this.$hrx, this.$hry, this.$hlx, this.$hly, this.$cr, this.$cl]);

    };

    /** @override */
    GPathBase.AnchorPoint.prototype._handleChange = function (change, args) {
        var path = this.getPath();
        if (change == GNode._Change.BeforePropertiesChange || change == GNode._Change.AfterPropertiesChange) {
            if (GUtil.containsObjectKey(args.properties, GPathBase.AnchorPoint.GeometryProperties)) {
                if (change === GNode._Change.BeforePropertiesChange) {
                    // Handle uniformity of corner lengths
                    var cuIndex = args.properties.indexOf('cu');
                    var cu = cuIndex >= 0 ? args.values[cuIndex] : this.$cu;
                    if (cu) {
                        var clIndex = args.properties.indexOf('cl');
                        var crIndex = args.properties.indexOf('cr');
                        if (clIndex >= 0) {
                            var newVal = args.values[clIndex];
                            if (this.$cr != newVal) {
                                if (crIndex >= 0) {
                                    args.values[crIndex] = newVal;
                                } else {
                                    args.properties.push('cr');
                                    args.values.push(newVal);
                                }
                            }
                        } else if (crIndex >= 0) {
                            var newVal = args.values[crIndex];
                            if (this.$cl != newVal) {
                                args.properties.push('cl');
                                args.values.push(newVal);
                            }
                        }
                    }

                    // If we have a path, prepare it's geometrical change
                    if (path) {
                        path._notifyChange(GElement._Change.PrepareGeometryUpdate);
                    }
                } else if (change === GNode._Change.AfterPropertiesChange) {
                    if (this.$tp == GPathBase.AnchorPoint.Type.Symmetric && !this.$ah && this.$hlx != null && this.$hrx != null ||
                        this.$tp == GPathBase.AnchorPoint.Type.Mirror && !this.$ah && (this.$hlx != null || this.$hrx != null)) {

                        if ((args.properties.indexOf('hrx') >= 0 ||
                            args.properties.indexOf('hry') >= 0) &&
                            args.properties.indexOf('hlx') < 0 &&
                            args.properties.indexOf('hly') < 0 ||
                            args.properties.indexOf('tp') >= 0 &&
                                args.properties.indexOf('hlx') < 0 &&
                                args.properties.indexOf('hly') < 0 &&
                                this.$hrx != null) {
                            this._leadHr = true;
                        } else {
                            this._leadHr = false;
                        }
                    }

                    if (path || // For Smooth point recalculate handles properly, even if point is not inserted yet
                        this.$tp == GPathBase.AnchorPoint.Type.Symmetric && !this.$ah && this.$hlx != null && this.$hrx != null ||
                        this.$tp == GPathBase.AnchorPoint.Type.Mirror && !this.$ah && (this.$hlx != null || this.$hrx != null)) {

                        this._invalidateCalculations();
                    }

                    if (path) {
                        // Changes in properties should have the following effect for neighbour points:
                        // handles change - no effect
                        // auto handles flag change - no effect
                        // type change - one point from each side should be updated,
                        //      if it has auto-handles or connector type
                        // coordinate change - one point from each side should be updated,
                        //      if it has auto-handles or connector type, and
                        //      in the case, when the nearest point is smooth, the second point from the side of smooth
                        //      point also should be updated if it has auto-handles

                        if (this._parent) {
                            if (args.properties.indexOf('x') >= 0 ||
                                args.properties.indexOf('y') >= 0) {

                                this._parent._invalidateLeft(this._parent.getPreviousPoint(this));
                                this._parent._invalidateRight(this._parent.getNextPoint(this));
                            } else if (args.properties.indexOf('tp') >= 0) {
                                var prevPt = this._parent.getPreviousPoint(this);
                                if (prevPt && (prevPt.$ah || prevPt.$tp == GPathBase.AnchorPoint.Type.Connector )) {
                                    prevPt._invalidateCalculations();
                                }
                                var nextPt = this._parent.getNextPoint(this);
                                if (nextPt && (nextPt.$ah || nextPt.$tp == GPathBase.AnchorPoint.Type.Connector )) {
                                    nextPt._invalidateCalculations();
                                }
                            }
                        }
                        path._verticesDirty = true;
                        path._notifyChange(GElement._Change.FinishGeometryUpdate);
                    }
                }
            }
        }
        GNode.prototype._handleChange.call(this, change, args);
    };

    /**
     * @returns {GPathBase}
     * @private
     */
    GPathBase.AnchorPoint.prototype.getPath = function () {
        return this._parent ? this._parent._parent : null;
    };

    /**
     * Invalidate auto-calculated properties depending on type and other settings
     * Properties have the following priority
     * Connector > Auto > Smooth, Corner
     * @private
     */
    GPathBase.AnchorPoint.prototype._invalidateCalculations = function () {
        var points = this._parent;

        if (points && this.$tp == GPathBase.AnchorPoint.Type.Connector) {
            this._calculateConnectorPoint();
        } else if (this.$tp == GPathBase.AnchorPoint.Type.Symmetric && !this.$ah) {
            // recalculate Smooth even if !points
            this._calculateSmoothPoint();
        } else if (this.$tp == GPathBase.AnchorPoint.Type.Mirror && !this.$ah) {
            // recalculate Mirror even if !points
            this._calculateMirrorPoint();
        } else if (points && this.$ah) {
            this._calculateAutoHandles();
        }
    };

    GPathBase.AnchorPoint.prototype._calculateConnectorPoint = function () {
        var points = this._parent;
        if (points) {

            var prevPt = points.getPreviousPoint(this);
            var nextPt = points.getNextPoint(this);
            var dirLenPrev = 0;
            var dirLenNext = 0;

            if (nextPt) {
                dirLenNext = Math.sqrt(GMath.ptSqrDist(this.$x, this.$y, nextPt.$x, nextPt.$y));
            }

            if (prevPt) {
                dirLenPrev = Math.sqrt(GMath.ptSqrDist(this.$x, this.$y, prevPt.$x, prevPt.$y));
            }

            var hLen;
            var hx, hy;
            if (this.$ah) {
                if (nextPt && prevPt && (nextPt.$tp == GPathBase.AnchorPoint.Type.Symmetric ||
                    nextPt.$tp == GPathBase.AnchorPoint.Type.Mirror) && !GMath.isEqualEps(dirLenNext, 0) && !GMath.isEqualEps(dirLenPrev, 0)) {

                    hLen = dirLenNext * GPathBase.AnchorPoint.HANDLE_COEFF;
                    hx = this.$x + (this.$x - prevPt.$x) / dirLenPrev * hLen;
                    hy = this.$y + (this.$y - prevPt.$y) / dirLenPrev * hLen;
                    this.setProperties(['hrx', 'hry'], [hx, hy]);
                } else {
                    this.setProperties(['hrx', 'hry'], [null, null]);
                }
                if (prevPt && nextPt && (prevPt.$tp == GPathBase.AnchorPoint.Type.Symmetric ||
                    prevPt.$tp == GPathBase.AnchorPoint.Type.Mirror) && !GMath.isEqualEps(dirLenNext, 0) && !GMath.isEqualEps(dirLenPrev, 0)) {

                    hLen = dirLenPrev * GPathBase.AnchorPoint.HANDLE_COEFF;
                    hx = this.$x + (this.$x - nextPt.$x) / dirLenNext * hLen;
                    hy = this.$y + (this.$y - nextPt.$y) / dirLenNext * hLen;
                    this.setProperties(['hlx', 'hly'], [hx, hy]);
                } else {
                    this.setProperties(['hlx', 'hly'], [null, null]);
                }
            } else {
                if (this.$hlx != null && nextPt && !GMath.isEqualEps(dirLenNext, 0)) {
                    // Use rotation if handle is already set
                    hLen = Math.sqrt(GMath.ptSqrDist(this.$x, this.$y, this.$hlx, this.$hly));
                    hx = this.$x + (this.$x - nextPt.$x) / dirLenNext * hLen;
                    hy = this.$y + (this.$y - nextPt.$y) / dirLenNext * hLen;
                    // TODO: use projection in editor when modifying handle
                    //var hnd = GMath.getPositiveProjection(this.$x, this.$y,
                    //    this.$x + (this.$x - nextPt.$x), this.$y + (this.$y - nextPt.$y), this.$hlx, this.$hly);
                    this.setProperties(['hlx', 'hly'], [hx, hy]);
                }

                if (this.$hrx != null && prevPt && !GMath.isEqualEps(dirLenPrev, 0)) {
                    // Use rotation if handle is already set
                    hLen = Math.sqrt(GMath.ptSqrDist(this.$x, this.$y, this.$hrx, this.$hry));
                    hx = this.$x + (this.$x - prevPt.$x) / dirLenPrev * hLen;
                    hy = this.$y + (this.$y - prevPt.$y) / dirLenPrev * hLen;
                    // TODO: use projection in editor when modifying handle
                    //var hnd = GMath.getPositiveProjection(this.$x, this.$y,
                    //   this.$x + (this.$x - prevPt.$x), this.$y + (this.$y - prevPt.$y), this.$hrx, this.$hry);
                    this.setProperties(['hrx', 'hry'], [hx, hy]);
                }
            }
        }
    };

    GPathBase.AnchorPoint.prototype._calculateSmoothPoint = function () {
        var hLen, dirLen;
        var hx, hy;

        // we have two handles, and we need to rotate one of them to be in line with the other
        if (this.$hlx != null && this.$hrx != null) {
            if (this._leadHr) { // the left handle shall be rotated to be in line with the right one
                dirLen = Math.sqrt(GMath.ptSqrDist(this.$x, this.$y, this.$hrx, this.$hry));
                if (!GMath.isEqualEps(dirLen, 0)) {
                    hLen = Math.sqrt(GMath.ptSqrDist(this.$x, this.$y, this.$hlx, this.$hly));
                    hx = this.$x + (this.$x - this.$hrx) / dirLen * hLen;
                    hy = this.$y + (this.$y - this.$hry) / dirLen * hLen;
                    this.setProperties(['hlx', 'hly'], [hx, hy]);
                }
            } else { // the right handle shall be rotated to be in line with the left one
                dirLen = Math.sqrt(GMath.ptSqrDist(this.$x, this.$y, this.$hlx, this.$hly));
                if (!GMath.isEqualEps(dirLen, 0)) {
                    hLen = Math.sqrt(GMath.ptSqrDist(this.$x, this.$y, this.$hrx, this.$hry));
                    hx = this.$x + (this.$x - this.$hlx) / dirLen * hLen;
                    hy = this.$y + (this.$y - this.$hly) / dirLen * hLen;
                    this.setProperties(['hrx', 'hry'], [hx, hy]);
                }
            }
        }
    };

    /** Calculate handles for point of type Mirror */
    GPathBase.AnchorPoint.prototype._calculateMirrorPoint = function () {
        // we need to set one of handles to be in line with the other and have the same length
        if (this._leadHr && this.$hrx != null) { // the left handle shall be rotated to be in line with the right one
            var hx = this.$x + (this.$x - this.$hrx);
            var hy = this.$y + (this.$y - this.$hry);
            if (this.$hlx != hx || this.$hly != hy) {
                this.setProperties(['hlx', 'hly'], [hx, hy]);
            }
        } else if (!this._leadHr && this.$hlx != null) { // the right handle shall be rotated to be in line with the left one
            var hx = this.$x + (this.$x - this.$hlx);
            var hy = this.$y + (this.$y - this.$hly);
            if (this.$hrx != hx || this.$hry != hy) {
                this.setProperties(['hrx', 'hry'], [hx, hy]);
            }
        }
    };

    GPathBase.AnchorPoint.prototype._calculateAutoHandles = function () {
        var points = this._parent;
        if (points) {

            var prevPt = points.getPreviousPoint(this);
            var nextPt = points.getNextPoint(this);

            var hx, hy;
            var dirLen, hLen;
            var offs = GPathBase.AnchorPoint.HANDLE_COEFF;
            var ccntr;
            var dx, dy;
            var px, py;

            if (this.$tp == GPathBase.AnchorPoint.Type.Symmetric || this.$tp == GPathBase.AnchorPoint.Type.Mirror) {
                if (!nextPt && !prevPt) {
                    return;
                } else if (nextPt && !prevPt ||
                    nextPt && this.$x == prevPt.$x && this.$y == prevPt.$y) {

                    hx = this.$x + (nextPt.$x - this.$x) * offs;
                    hy = this.$y + (nextPt.$y - this.$y) * offs;
                    this.setProperties(['hlx', 'hly', 'hrx', 'hry'],
                        [this.$x + this.$x - hx, this.$y + this.$y - hy, hx, hy]);
                } else if (prevPt && !nextPt ||
                    prevPt && this.$x == nextPt.$x && this.$y == nextPt.$y) {

                    hx = this.$x + (prevPt.$x - this.$x) * offs;
                    hy = this.$y + (prevPt.$y - this.$y) * offs;
                    this.setProperties(['hlx', 'hly', 'hrx', 'hry'],
                        [hx, hy, this.$x + this.$x - hx, this.$y + this.$y - hy]);
                } else if (prevPt && nextPt) {
                    // calculate handles to be tangent circle(triag(prevPt, this, nextPt))
                    ccntr = GMath.getCircumcircleCenter(
                        prevPt.$x, prevPt.$y, this.$x, this.$y, nextPt.$x, nextPt.$y);

                    if (ccntr == null) { // prev and next points are the same, make handles to be perpendicular
                        dx = (this.$y - prevPt.$y) * offs;
                        dy = (prevPt.$x - this.$x) * offs;
                        this.setProperties(['hlx', 'hly', 'hrx', 'hry'],
                            [this.$x - dx, this.$y - dy, this.$x + dx, this.$y + dy]);
                    }
                    else {
                        dirLen = Math.sqrt(GMath.ptSqrDist(this.$x, this.$y, ccntr.getX(), ccntr.getY()));
                        // no need to check dirLen for 0, as ccntr != this
                        dx = (this.$y - ccntr.getY()) / dirLen;
                        dy = (ccntr.getX() - this.$x) / dirLen;

                        // check handles side
                        px = (prevPt.$x + nextPt.$x) / 2;
                        py = (prevPt.$y + nextPt.$y) / 2;
                        if (GMath.segmentSide(this.$x, this.$y, px, py, prevPt.$x, prevPt.$y) !=
                            GMath.segmentSide(this.$x, this.$y, px, py, this.$x - dx, this.$y - dy)) {
                            dx = -dx;
                            dy = -dy;
                        }

                        hLen = Math.sqrt(GMath.ptSqrDist(this.$x, this.$y, prevPt.$x, prevPt.$y)) * offs;
                        this.setProperties(['hlx', 'hly'], [this.$x - dx * hLen, this.$y - dy * hLen]);

                        hLen = Math.sqrt(GMath.ptSqrDist(this.$x, this.$y, nextPt.$x, nextPt.$y)) * offs;
                        this.setProperties(['hrx', 'hry'], [this.$x + dx * hLen, this.$y + dy * hLen]);
                    }
                }
            } else { // type != Smooth && type != Connector as this method should not be called for connector
                if (prevPt && (prevPt.$x != this.$x || prevPt.$y != this.$y)) {
                    if (prevPt.$tp == GPathBase.AnchorPoint.Type.Symmetric ||
                        prevPt.$tp == GPathBase.AnchorPoint.Type.Mirror) {

                        var prevprevPt = points.getPreviousPoint(prevPt);
                        if (!prevprevPt || (prevPt.$x == prevprevPt.$x && prevPt.$y == prevprevPt.$y)) {
                            hx = this.$x + (prevPt.$x - this.$x) * offs;
                            hy = this.$y + (prevPt.$y - this.$y) * offs;
                            this.setProperties(['hlx', 'hly'], [hx, hy]);
                        } else {
                            // calculate left handle to be tangent circle(triag(this, prevPt, prevprevPt))
                            ccntr = GMath.getCircumcircleCenter(
                                this.$x, this.$y, prevPt.$x, prevPt.$y, prevprevPt.$x, prevprevPt.$y);

                            if (ccntr == null) { // this and prevprev points are the same, make handle to be perpendicular
                                dx = (this.$y - prevPt.$y) * offs;
                                dy = (prevPt.$x - this.$x) * offs;
                                this.setProperties(['hlx', 'hly'], [this.$x - dx, this.$y - dy]);
                            }
                            else {
                                dirLen = Math.sqrt(GMath.ptSqrDist(this.$x, this.$y, ccntr.getX(), ccntr.getY()));
                                // no need to check dirLen for 0, as ccntr != this
                                dx = (this.$y - ccntr.getY()) / dirLen;
                                dy = (ccntr.getX() - this.$x) / dirLen;

                                // check handle side
                                px = (prevPt.$x + prevprevPt.$x) / 2;
                                py = (prevPt.$y + prevprevPt.$y) / 2;
                                if (GMath.segmentSide(this.$x, this.$y, px, py, prevPt.$x, prevPt.$y) !=
                                    GMath.segmentSide(this.$x, this.$y, px, py, this.$x - dx, this.$y - dy)) {
                                    dx = -dx;
                                    dy = -dy;
                                }

                                hLen = Math.sqrt(GMath.ptSqrDist(this.$x, this.$y, prevPt.$x, prevPt.$y)) * offs;
                                this.setProperties(['hlx', 'hly'], [this.$x - dx * hLen, this.$y - dy * hLen]);
                            }
                        }
                    } else { // prevPt.$tp != GPathBase.AnchorPoint.Type.Symmetric || Mirror
                        this.setProperties(['hlx', 'hly'], [null, null]);
                    }
                }

                if (nextPt && (nextPt.$x != this.$x || nextPt.$y != this.$y)) {
                    if (nextPt.$tp == GPathBase.AnchorPoint.Type.Symmetric ||
                        nextPt.$tp == GPathBase.AnchorPoint.Type.Mirror) {

                        var nextnextPt = points.getNextPoint(nextPt);
                        if (!nextnextPt || (nextPt.$x == nextnextPt.$x && nextPt.$y == nextnextPt.$y)) {
                            hx = this.$x + (nextPt.$x - this.$x) * offs;
                            hy = this.$y + (nextPt.$y - this.$y) * offs;
                            this.setProperties(['hrx', 'hry'], [hx, hy]);
                        } else {
                            // calculate right handle to be tangent circle(triag(this, nextPt, nextnextPt))
                            ccntr = GMath.getCircumcircleCenter(
                                this.$x, this.$y, nextPt.$x, nextPt.$y, nextnextPt.$x, nextnextPt.$y);

                            if (ccntr == null) { // this and nextnext points are the same, make handle to be perpendicular
                                dx = (this.$y - nextPt.$y) * offs;
                                dy = (nextPt.$x - this.$x) * offs;
                                this.setProperties(['hrx', 'hry'], [this.$x - dx, this.$y - dy]);
                            }
                            else {
                                dirLen = Math.sqrt(GMath.ptSqrDist(this.$x, this.$y, ccntr.getX(), ccntr.getY()));
                                // no need to check dirLen for 0, as ccntr != this
                                dx = (this.$y - ccntr.getY()) / dirLen;
                                dy = (ccntr.getX() - this.$x) / dirLen;

                                // check handle side
                                px = (nextPt.$x + nextnextPt.$x) / 2;
                                py = (nextPt.$y + nextnextPt.$y) / 2;
                                if (GMath.segmentSide(this.$x, this.$y, px, py, nextPt.$x, nextPt.$y) !=
                                    GMath.segmentSide(this.$x, this.$y, px, py, this.$x + dx, this.$y + dy)) {
                                    dx = -dx;
                                    dy = -dy;
                                }

                                hLen = Math.sqrt(GMath.ptSqrDist(this.$x, this.$y, nextPt.$x, nextPt.$y)) * offs;
                                this.setProperties(['hrx', 'hry'], [this.$x + dx * hLen, this.$y + dy * hLen]);
                            }
                        }
                    } else {
                        this.setProperties(['hrx', 'hry'], [null, null]);
                    }
                }
            }
        }
    };

    /** @override */
    GPathBase.AnchorPoint.prototype.toString = function () {
        return "[Object GPathBase.AnchorPoint]";
    };

    // -----------------------------------------------------------------------------------------------------------------
    // GPathBase.AnchorPoints Class
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * @class GPathBase.AnchorPoints
     * @extends GNode
     * @mixes GNode.Container
     * @constructor
     */
    GPathBase.AnchorPoints = function () {
    };
    GObject.inheritAndMix(GPathBase.AnchorPoints, GNode, [GNode.Container]);

    /**
     * Used for internal calculations.
     * When a point is being removed from container, save here the link to the previous point
     * to invalidate it after removal
     * @type {GPathBase.AnchorPoint}
     * @private
     */
    GPathBase.AnchorPoints.prototype._dirtyPrev = null;

    /**
     * Used for internal calculations.
     * When a point is being removed from container, save here the link to the next point
     * to invalidate it after removal
     * @type {GPathBase.AnchorPoint}
     * @private
     */
    GPathBase.AnchorPoints.prototype._dirtyNext = null;

    /**
     * Used to disallow anchor points removal
     * @type {Boolean}
     * @private
     */
    GPathBase.AnchorPoints.prototype._removalAllowed = false;

    /** @override */
    GPathBase.AnchorPoints.prototype.validateInsertion = function (parent, reference) {
        return parent instanceof GPathBase;
    };

    /** @override */
    GPathBase.AnchorPoints.prototype.validateRemoval = function () {
        return this._removalAllowed ? this._removalAllowed : false;
    };

    /**
     * Serializes all points into a stream array
     * @param {GTransform} transformation to be applied to the anchor points before serialization
     * @return {Array<*>}
     */
    GPathBase.AnchorPoints.prototype.serialize = function (transform) {
        var trf = transform && !transform.isIdentity() ? transform : null;

        var stream = [];
        for (var pt = this.getFirstChild(); pt !== null; pt = pt.getNext()) {
            if (trf) {
                stream.push(pt._getTransformedCopy(trf).serialize());
            } else {
                stream.push(pt.serialize());
            }
        }
        return stream;
    };

    /**
     * Deserializes all points from a stream array
     * @param {Array<*>} stream
     */
    GPathBase.AnchorPoints.prototype.deserialize = function (stream) {
        for (var i = 0; i < stream.length; ++i) {
            var pt = new GPathBase.AnchorPoint();
            pt.deserialize(stream[i]);
            this.appendChild(pt);
        }
    };

    /**
     * Called when the coordinates of the point at right from the passed point have been changed.
     * Then recalculate carefully the passed point, and the point at left from it if needed.
     * @param {GPathBase.AnchorPoint} [anchorPt] - the passed point to start recalculations from
     * @private
     */
    GPathBase.AnchorPoints.prototype._invalidateLeft = function (anchorPt) {
        if (!anchorPt) {
            return;
        }
        // the point should be recalculated if it has auto-handles or connector type.
        // In the case, when it has a smooth type, the left point also should be updated if it has auto-handles
        if (anchorPt.$ah || anchorPt.$tp == GPathBase.AnchorPoint.Type.Connector) {
            anchorPt._invalidateCalculations();
        }

        if (anchorPt.$tp == GPathBase.AnchorPoint.Type.Symmetric || anchorPt.$tp == GPathBase.AnchorPoint.Type.Mirror) {
            var leftPt = this.getPreviousPoint(anchorPt);
            if (leftPt && leftPt.$ah) {
                leftPt._invalidateCalculations();
            }
        }
    };

    /**
     * Called when the coordinates of the point at left from the passed point have been changed.
     * Then recalculate carefully the passed point, and the point at right from it if needed.
     * @param {GPathBase.AnchorPoint} [anchorPt] - the passed point to start recalculations from
     * @private
     */
    GPathBase.AnchorPoints.prototype._invalidateRight = function (anchorPt) {
        if (!anchorPt) {
            return;
        }
        // the point should be recalculated if it has auto-handles or connector type.
        // In the case, when it has a smooth type, the right point also should be updated if it has auto-handles
        if (anchorPt.$ah || anchorPt.$tp == GPathBase.AnchorPoint.Type.Connector) {
            anchorPt._invalidateCalculations();
        }

        if (anchorPt.$tp == GPathBase.AnchorPoint.Type.Symmetric || anchorPt.$tp == GPathBase.AnchorPoint.Type.Mirror) {
            var rightPt = this.getNextPoint(anchorPt);
            if (rightPt && rightPt.$ah) {
                rightPt._invalidateCalculations();
            }
        }
    };

    /**
     * Called to generate vertices from this anchor points
     * @param {GVertexContainer} target the target vertex container to put vertices into
     * @param {GTransform} transform the transformation used for vertice generation, might be null
     * @param {Boolean} styled - indicates if vertices should be calculated for path with styled corners
     * @private
     */
    GPathBase.AnchorPoints.prototype._generateVertices = function (target, transform, styled) {
        var i;
        var pt;
        var startPtX, startPtY;
        var ap;

        // First vertex
        // Do not process first anchor point corner here,
        // just calculate a path starting point on the way to the next anchor point
        ap = this.getFirstChild();
        if (!ap) {
            return;
        }

        var path = this._parent;
        var aptmp;
        if (!styled ||
            ap.$tp == GPathBase.AnchorPoint.Type.Asymmetric ||
            ap.$tp == GPathBase.AnchorPoint.Type.Connector ||
            ap.$tp == GPathBase.AnchorPoint.Type.Symmetric ||
            ap.$tp == GPathBase.AnchorPoint.Type.Mirror || !path || !path.$closed ||
            ap == this.getLastChild()) {

            if (transform) {
                aptmp = ap._getTransformedCopy(transform);
            } else {
                aptmp = ap;
            }
            startPtX = aptmp.$x;
            startPtY = aptmp.$y;
        } else {
            pt = this._getPathStartPt(transform);
            startPtX = pt.getX();
            startPtY = pt.getY();
        }

        target.addVertex(GVertex.Command.Move, startPtX, startPtY);
        if (ap == this.getLastChild()) {
            return;
        }

        // Add all the vertices (including corners for the last point and the first point for closed path),
        // except the vertices for the last point of open path
        var prevPt = ap;
        ap = ap.getNext();
        var firstPt = ap;
        var processingStarted = false;
        var nextPt = this.getNextPoint(ap);
        var prevPttmp, nextPttmp;
        if (transform) {
            aptmp = ap._getTransformedCopy(transform);
            prevPttmp = prevPt._getTransformedCopy(transform);
        }
        while (nextPt && (ap != firstPt || !processingStarted)) {
            processingStarted = true;
            if (transform) {
                nextPttmp = nextPt._getTransformedCopy(transform);

                this._addMiddleVertices(
                    target, aptmp, prevPttmp, nextPttmp, styled);

                prevPttmp = aptmp;
                aptmp = nextPttmp;
            } else {
                this._addMiddleVertices(
                    target, ap, prevPt, nextPt, styled);
            }

            prevPt = ap;
            ap = nextPt;
            nextPt = this.getNextPoint(nextPt);
        }

        // the last point, !path.$closed
        if (!nextPt) {
            this._addPathEndVertices(target, transform);
        } else {
            target.addVertex(GVertex.Command.Close, 0, 0);
        }
    };

    /**
     * Calculates and return the first vertex of the path, from which movement to the next point starts
     * Takes into account corner type
     * This function is supposed to be called only when the path is closed
     * @param {GTransform} transform - a transformation to apply to anchor points before generating vertices
     * @returns {GPoint} starting point of the path
     * @private
     */
    GPathBase.AnchorPoints.prototype._getPathStartPt = function (transform) {
        var ap = this.getFirstChild();
        var prevPt = this.getPreviousPoint(ap);
        var nextPt = this.getNextPoint(ap);

        if (transform) {
            ap = ap._getTransformedCopy(transform);
            nextPt = nextPt._getTransformedCopy(transform);
            prevPt = prevPt._getTransformedCopy(transform);
        }

        // no second corner shoulder
        if (!ap.$cl || !ap.$cr ||
            // specific corner type is not set
            ap.$tp == GPathBase.AnchorPoint.Type.Asymmetric ||
            // the point is connector or smooth, no corner here
            ap.$tp == GPathBase.AnchorPoint.Type.Connector ||
            ap.$tp == GPathBase.AnchorPoint.Type.Symmetric ||
            ap.$tp == GPathBase.AnchorPoint.Type.Mirror || !prevPt ||
            prevPt.$tp == GPathBase.AnchorPoint.Type.Connector && prevPt.$x == ap.$x && prevPt.$y == ap.$y) {

            return new GPoint(ap.$x, ap.$y);
        }

        return this._getRightShoulderPoint(ap, nextPt);
    };

    /**
     * Calculates the point at which styled corner shoulder should finish or start, taken into account that
     * near points may have total shoulders length more than the distance between points
     * @param {Number} [pt1x] - x-coordinate of the first point
     * @param {Number} [pt1y] - y-coordinate of the first point
     * @param {Number} [pt1s] - shoulder of the first point
     * @param {Number} [pt2x] - x-coordinate of the second point
     * @param {Number} [pt2y] - y-coordinate of the second point
     * @param {Number} [pt2s] - shoulder of the second point
     * @return {GPoint} the shoulder end connected to the first point
     * @private
     */
    GPathBase.AnchorPoints.prototype._getShoulderPoint = function (pt1x, pt1y, pt1s, pt2x, pt2y, pt2s) {
        var dist = GMath.ptDist(pt1x, pt1y, pt2x, pt2y);
        var sptdst;
        var p1s, p2s;
        if (pt1s == null || pt1s <= 0) {
            p1s = 0;
        } else {
            p1s = pt1s;
        }
        if (pt2s == null || pt2s <= 0) {
            p2s = 0;
        } else {
            p2s = pt2s;
        }
        var len = p1s + p2s;
        if (len <= 0) {
            return null;
        }
        if (dist >= len) {
            sptdst = p1s;
        } else {
            sptdst = dist * p1s / len;
        }
        return GMath.getPointAtLength(pt1x, pt1y, pt2x, pt2y, sptdst);
    };

    /**
     * Returns a right shoulder point for the passed point, using the second passed point as a near point at right
     * @param {GPathBase.AnchorPoint} [curPt] the current anchor point for which shoulder is needed
     * @param {GPathBase.AnchorPoint} [nextPt] an anchor point to be use as a near point at right
     * @param {Boolean} maxLen - if true, instead of a real shoulder point, return shoulder point maximal position
     * @returns {GPoint} a left shoulder point
     */
    GPathBase.AnchorPoints.prototype._getRightShoulderPoint = function (curPt, nextPt, maxLen) {
        // define corner end
        var hx = null;
        var hy = null;
        if (curPt.$hrx != null) {
            hx = curPt.$hrx;
            hy = curPt.$hry;
        } else if (nextPt.$hlx != null) {
            hx = nextPt.$hlx;
            hy = nextPt.$hly;
        }
        var pt;
        if (hx != null) {
            if (maxLen) {
                pt = new GPoint(hx, hy);
            } else {
                pt = GMath.getPointAtLength(curPt.$x, curPt.$y, hx, hy, curPt.$cr);
            }
        } else {
            if (maxLen) {
                pt = new GPoint(nextPt.$x, nextPt.$y);
            } else {
                pt = this._getShoulderPoint(curPt.$x, curPt.$y, curPt.$cr, nextPt.$x, nextPt.$y, nextPt.$cl);
            }
        }
        return pt;
    };

    /**
     * Returns a left shoulder point for the passed point, using the second passed point as a near point at left
     * @param {GPathBase.AnchorPoint} [curPt] the current anchor point for which shoulder is needed
     * @param {GPathBase.AnchorPoint} [prevPt] an anchor point to be use as a near point at left
     * @param {Boolean} maxLen - if true, instead of a real shoulder point, return shoulder point maximal position
     * @returns {GPoint} a left shoulder point
     */
    GPathBase.AnchorPoints.prototype._getLeftShoulderPoint = function (curPt, prevPt, maxLen) {
        // define corner end
        var hx = null;
        var hy = null;
        if (curPt.$hlx != null) {
            hx = curPt.$hlx;
            hy = curPt.$hly;
        } else if (prevPt.$hrx != null) {
            hx = prevPt.$hrx;
            hy = prevPt.$hry;
        }
        var pt;
        if (hx != null) {
            if (maxLen) {
                pt = new GPoint(hx, hy);
            } else {
                pt = GMath.getPointAtLength(curPt.$x, curPt.$y, hx, hy, curPt.$cl);
            }
        } else {
            if (maxLen) {
                pt = new GPoint(prevPt.$x, prevPt.$y);
            } else {
                pt = this._getShoulderPoint(curPt.$x, curPt.$y, curPt.$cl, prevPt.$x, prevPt.$y, prevPt.$cr);
            }
        }
        return pt;
    };

    /**
     * Calculate and adds vertices for anchor point
     * Anchor point type is taken into account only if styled corner is needed
     * @param {GVertexContainer} target the target vertex container to put vertices into
     * @param {GPathBase.AnchorPoint} [curPt] the current anchor point, used as a main source for segment and corner vertices
     * @param {GPathBase.AnchorPoint} [prevPt] the previous anchor point, used to correct vertices according to corner type
     * @param {GPathBase.AnchorPoint} [nextPt] the next anchor point, used to correct vertices according to corner type
     * @param {Boolean} [styled] used to indicate if styled corner is needed
     * @private
     */
    GPathBase.AnchorPoints.prototype._addMiddleVertices = function (target, curPt, prevPt, nextPt, styled) {
        var hLen, dirLen;
        var h2x = null;
        var h2y = null;
        var pt, pt2;
        var hx = null;
        var hy = null;

        // define first and second handle coordinates if exist
        if (curPt.$hlx != null && curPt.$hly != null && prevPt.$hrx != null && prevPt.$hry != null) {
            hx = prevPt.$hrx;
            hy = prevPt.$hry;
            h2x = curPt.$hlx;
            h2y = curPt.$hly;
        } else if (curPt.$hlx != null && curPt.$hly != null) {
            hx = curPt.$hlx;
            hy = curPt.$hly;
        } else if (prevPt.$hrx != null && prevPt.$hry != null) {
            hx = prevPt.$hrx;
            hy = prevPt.$hry;
        }

        // define curve end point and other corner points if applicable
        if (!styled ||
            curPt.$tp == GPathBase.AnchorPoint.Type.Asymmetric ||
            curPt.$tp == GPathBase.AnchorPoint.Type.Connector ||
            curPt.$tp == GPathBase.AnchorPoint.Type.Symmetric ||
            curPt.$tp == GPathBase.AnchorPoint.Type.Mirror ||
            // shoulders are not defined or zero
            !curPt.$cl || !curPt.$cr) {
            // No any specific corner with shoulders

            if (hx == null) {
                target.addVertex(GVertex.Command.Line, curPt.$x, curPt.$y);
            } else if (h2x == null) {
                target.addVertex(GVertex.Command.Curve, curPt.$x, curPt.$y);
                target.addVertex(GVertex.Command.Curve, hx, hy);
            } else {
                target.addVertex(GVertex.Command.Curve2, curPt.$x, curPt.$y);
                target.addVertex(GVertex.Command.Curve2, hx, hy);
                target.addVertex(GVertex.Command.Curve2, h2x, h2y);
            }
        } else { // corner with shoulders
            if (hx == null) {
                pt = this._getShoulderPoint(curPt.$x, curPt.$y, curPt.$cl, prevPt.$x, prevPt.$y, prevPt.$cr);
                target.addVertex(GVertex.Command.Line, pt.getX(), pt.getY());
            } else if (h2x == null) {
                pt = GMath.getPointAtLength(curPt.$x, curPt.$y, hx, hy, curPt.$cl);
                target.addVertex(GVertex.Command.Curve, pt.getX(), pt.getY());
                target.addVertex(GVertex.Command.Curve, hx, hy);
            } else {
                pt = GMath.getPointAtLength(curPt.$x, curPt.$y, h2x, h2y, curPt.$cl);
                target.addVertex(GVertex.Command.Curve2, pt.getX(), pt.getY());
                target.addVertex(GVertex.Command.Curve2, hx, hy);
                target.addVertex(GVertex.Command.Curve2, h2x, h2y);
            }

            pt2 = this._getRightShoulderPoint(curPt, nextPt);

            this._addCornerToVertices(
                target, pt.getX(), pt.getY(), pt2.getX(), pt2.getY(), curPt.$x, curPt.$y, curPt.$tp);
        }
    };

    /**
     * Adds extra (corner) vertices to _vertices
     * @param {GVertexContainer} target the target vertex container to put vertices into
     * @param {Number} [pt1x] x coordinate of a corner start point
     * @param {Number} [pt1y] y coordinate of a corner start point
     * @param {Number} [pt2x] x coordinate of a corner end point
     * @param {Number} [pt2y] y coordinate of a corner end point
     * @param {Number} [edgePtx] x coordinate of a corner anchor point
     * @param {Number} [edgePty] y coordinate of a corner anchor point
     * @param {Number} [edgePtType] a type of of a corner anchor point
     * @private
     */
    GPathBase.AnchorPoints.prototype._addCornerToVertices = function (target, pt1x, pt1y, pt2x, pt2y, edgePtx, edgePty, edgePtType) {

        var endPtX, endPtY, chunk1X, chunk1Y, chunk2X, chunk2Y;
        var edgeForInsetX, edgeForInsetY;
        var edgeForArcX, edgeForArcY;

        if (pt1x == pt2x && pt1y == pt2y) {
            if (edgePtx != pt1x || edgePty != pt1y) {
                target.addVertex(GVertex.Command.Line, edgePtx, edgePty);
                target.addVertex(GVertex.Command.Line, pt2x, pt2y);
            }
            return;
        }

        if (pt1x == edgePtx && pt1y == edgePty || pt2x == edgePtx && pt2y == edgePty) {
            target.addVertex(GVertex.Command.Line, pt2x, pt2y);
            return;
        }

        if (edgePtType == GPathBase.CornerType.Rounded ||
            edgePtType == GPathBase.CornerType.InverseRounded) {
            if ((pt1x == pt2x && pt1x == edgePtx) || (pt1y == pt2y && pt1y == edgePty)) {
                target.addVertex(GVertex.Command.Curve, pt2x, pt2y);
                target.addVertex(GVertex.Command.Curve, edgePtx, edgePty);
            } else {
                if (edgePtType == GPathBase.CornerType.Rounded) {
                    edgeForArcX = edgePtx;
                    edgeForArcY = edgePty;
                } else { // edgePtType == GPathBase.AnchorPoint.Type.InverseRounded
                    edgeForArcX = pt1x + pt2x - edgePtx;
                    edgeForArcY = pt1y + pt2y - edgePty;
                }
                target.addVertex(GVertex.Command.Curve2, pt2x, pt2y);
                target.addVertex(GVertex.Command.Curve2,
                    pt1x + (edgeForArcX - pt1x) * GPathBase.AnchorPoint.BEST_CIRCLE_COEFF,
                    pt1y + (edgeForArcY - pt1y) * GPathBase.AnchorPoint.BEST_CIRCLE_COEFF);
                target.addVertex(GVertex.Command.Curve2,
                    pt2x + (edgeForArcX - pt2x) * GPathBase.AnchorPoint.BEST_CIRCLE_COEFF,
                    pt2y + (edgeForArcY - pt2y) * GPathBase.AnchorPoint.BEST_CIRCLE_COEFF);
            }
        } else if (edgePtType == GPathBase.CornerType.Fancy) {
            chunk1X = (pt2x - edgePtx) / 3;
            chunk1Y = (pt2y - edgePty) / 3;
            chunk2X = (edgePtx - pt1x) / 3;
            chunk2Y = (edgePty - pt1y) / 3;

            endPtX = pt1x + 2 * chunk1X;
            endPtY = pt1y + 2 * chunk1Y;
            target.addVertex(GVertex.Command.Line, endPtX, endPtY);

            endPtX += 2 * chunk2X;
            endPtY += 2 * chunk2Y;
            target.addVertex(GVertex.Command.Line, endPtX, endPtY);

            endPtX -= chunk1X;
            endPtY -= chunk1Y;
            target.addVertex(GVertex.Command.Line, endPtX, endPtY);

            endPtX -= chunk2X;
            endPtY -= chunk2Y;
            target.addVertex(GVertex.Command.Line, endPtX, endPtY);

            endPtX += 2 * chunk1X;
            endPtY += 2 * chunk1Y;
            target.addVertex(GVertex.Command.Line, endPtX, endPtY);

            endPtX += 2 * chunk2X;
            endPtY += 2 * chunk2Y;
            target.addVertex(GVertex.Command.Line, endPtX, endPtY);

        } else if (edgePtType == GPathBase.CornerType.Bevel) {
            target.addVertex(GVertex.Command.Line, pt2x, pt2y);

        } else if (edgePtType == GPathBase.CornerType.Inset) {
            edgeForInsetX = pt1x + pt2x - edgePtx;
            edgeForInsetY = pt1y + pt2y - edgePty;

            target.addVertex(GVertex.Command.Line, edgeForInsetX, edgeForInsetY);
            target.addVertex(GVertex.Command.Line, pt2x, pt2y);

        } else {   // use GPathBase.AnchorPoint.Type.Asymmetric for all the unsupported types
            target.addVertex(GVertex.Command.Line, edgePtx, edgePty);
            target.addVertex(GVertex.Command.Line, pt2x, pt2y);
        }
    };

    /**
     * Adds path end vertices to the _vertices container, used to finish path
     * This function is supposed to be called only when the path is NOT closed
     * @param {GVertexContainer} target the target vertex container to put vertices into
     * @param {GTransform} transform - a transformation to apply to anchor points before generating vertices
     * @private
     */
    GPathBase.AnchorPoints.prototype._addPathEndVertices = function (target, transform) {
        var hx, hy;
        var endPt = this.getLastChild();
        var prevPt = endPt.getPrevious();

        if (transform) {
            endPt = endPt._getTransformedCopy(transform);
            prevPt = prevPt._getTransformedCopy(transform);
        }

        if (endPt.$hlx != null && endPt.$hly != null && prevPt.$hrx != null && prevPt.$hry != null) {
            target.addVertex(GVertex.Command.Curve2, endPt.$x, endPt.$y);
            target.addVertex(GVertex.Command.Curve2, prevPt.$hrx, prevPt.$hry);
            target.addVertex(GVertex.Command.Curve2, endPt.$hlx, endPt.$hly);
        } else if ((endPt.$hlx == null || endPt.$hly == null) && (prevPt.$hrx == null || prevPt.$hry == null)) {
            target.addVertex(GVertex.Command.Line, endPt.$x, endPt.$y);
        } else {
            if (endPt.$hlx != null && endPt.$hly != null) {
                hx = endPt.$hlx;
                hy = endPt.$hly;
            } else {
                hx = prevPt.$hrx;
                hy = prevPt.$hry;
            }
            target.addVertex(GVertex.Command.Curve, endPt.$x, endPt.$y);
            target.addVertex(GVertex.Command.Curve, hx, hy);
        }
    };

    /** @override */
    GPathBase.AnchorPoints.prototype._handleChange = function (change, args) {
        var path = this._parent;

        if (path) {
            var prevPt, nextPt;
            var anchorPoint = args;
            var hx, hy;

            if (change == GNode._Change.BeforeChildInsert) {
                if (this.getParent()) {
                    this.getParent().beginUpdate();
                }
            } else if (change == GNode._Change.AfterChildInsert) {
                prevPt = this.getPreviousPoint(anchorPoint);
                if (prevPt && prevPt.$hrx != null && anchorPoint.$tp == GPathBase.AnchorPoint.Type.Connector) {
                    hx = anchorPoint.$x + (prevPt.$x - anchorPoint.$x) * GPathBase.AnchorPoint.HANDLE_COEFF;
                    hy = anchorPoint.$y + (prevPt.$y - anchorPoint.$y) * GPathBase.AnchorPoint.HANDLE_COEFF;
                    if (!GMath.isEqualEps(anchorPoint.$x - hx, 0) || !GMath.isEqualEps(anchorPoint.$y - hy, 0)) {
                        anchorPoint.setProperties(['hlx', 'hly'], [hx, hy]);
                    }
                }

                nextPt = this.getNextPoint(anchorPoint);
                if (nextPt && nextPt.$hlx != null && anchorPoint.$tp == GPathBase.AnchorPoint.Type.Connector) {
                    hx = anchorPoint.$x + (nextPt.$x - anchorPoint.$x) * GPathBase.AnchorPoint.HANDLE_COEFF;
                    hy = anchorPoint.$y + (nextPt.$y - anchorPoint.$y) * GPathBase.AnchorPoint.HANDLE_COEFF;
                    if (!GMath.isEqualEps(anchorPoint.$x - hx, 0) || !GMath.isEqualEps(anchorPoint.$y - hy, 0)) {
                        anchorPoint.setProperties(['hrx', 'hry'], [hx, hy]);
                    }
                }

                if (anchorPoint.$ah ||
                    anchorPoint.$tp == GPathBase.AnchorPoint.Type.Connector) {

                    anchorPoint._invalidateCalculations();
                }
                this._invalidateLeft(prevPt);
                this._invalidateRight(nextPt);

                if (this.getParent()) {
                    this.getParent().endUpdate();
                }
            } else if (change == GNode._Change.BeforeChildRemove) {
                if (this.getParent()) {
                    this.getParent().beginUpdate();
                }
                this._dirtyPrev = this.getPreviousPoint(anchorPoint);
                this._dirtyNext = this.getNextPoint(anchorPoint);
            } else if (change == GNode._Change.AfterChildRemove) {
                if (this._dirtyPrev) {
                    this._invalidateLeft(this._dirtyPrev);
                }
                if (this._dirtyNext) {
                    this._invalidateRight(this._dirtyNext);
                }

                if (this.getParent()) {
                    this.getParent().endUpdate();
                }
            }
        }

        if (path && (change == GNode._Change.AfterChildInsert || change == GNode._Change.AfterChildRemove)) {
            // Notify path parent about the change
            path._notifyChange(GElement._Change.PrepareGeometryUpdate);
            path._verticesDirty = true;
            path._notifyChange(GElement._Change.FinishGeometryUpdate);
        }

        GNode.prototype._handleChange.call(this, change, args);
    };

    /**
     * Get next point from given source point
     * @param {GPathBase.AnchorPoint} source
     * @private
     */
    GPathBase.AnchorPoints.prototype.getNextPoint = function (source) {
        var nextPt = source ? source.getNext() : null;
        if (!nextPt && this._parent && this._parent.$closed && source == this.getLastChild()) {
            nextPt = this.getFirstChild();
        }
        return nextPt;
    };

    /**
     * Get previous point from given source point
     * @param {GPathBase.AnchorPoint} source
     * @private
     */
    GPathBase.AnchorPoints.prototype.getPreviousPoint = function (source) {
        var prevPt = source ? source.getPrevious() : null;
        if (!prevPt && this._parent && this._parent.$closed && source == this.getFirstChild()) {
            prevPt = this.getLastChild();
        }
        return prevPt;
    };

    /**
     * Get last related point from given source point
     * @param {GPathBase.AnchorPoint} source
     * @private
     */
    GPathBase.AnchorPoints.prototype.getLastRelatedPoint = function (source) {
        var lastRelPt = source;
        var nextPt = this.getNextPoint(source);
        if (nextPt) {
            lastRelPt = nextPt;
            if (nextPt.$tp == GPathBase.AnchorPoint.Type.Symmetric || nextPt.$tp == GPathBase.AnchorPoint.Type.Mirror) {
                var nextnextPt = this.getNextPoint(nextPt);
                if (nextnextPt && nextnextPt.$ah && nextnextPt != source) {
                    lastRelPt = nextnextPt;
                }
            }
        }

        return lastRelPt;
    };

    /**
     * Get first related point from given source point
     * @param {GPathBase.AnchorPoint} source
     * @private
     */
    GPathBase.AnchorPoints.prototype.getFirstRelatedPoint = function (source) {
        var firstRelPt = source;
        var prevPt = this.getPreviousPoint(source);
        if (prevPt) {
            firstRelPt = prevPt;
            if (prevPt.$tp == GPathBase.AnchorPoint.Type.Symmetric || prevPt.$tp == GPathBase.AnchorPoint.Type.Mirror) {
                var prevprevPt = this.getPreviousPoint(prevPt);
                if (prevprevPt && prevprevPt.$ah && prevprevPt != source) {
                    firstRelPt = prevprevPt;
                }
            }
        }

        return firstRelPt;
    };

    /** @override */
    GPathBase.AnchorPoints.prototype.toString = function () {
        return "[Object GPathBase.AnchorPoints]";
    };

    // -----------------------------------------------------------------------------------------------------------------
    // GPathBase Class
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * @type {GVertexContainer}
     * @private
     */
    GPathBase.prototype._vertices = null;

    /**
     * @type {boolean}
     * @private
     */
    GPathBase.prototype._verticesDirty = false;

    /**
     * @type {GPathBase.AnchorPoints}
     * @private
     */
    GPathBase.prototype._anchorPoints = null;

    /** @override */
    GPathBase.prototype.rewindVertices = function (index) {
        if (this._verticesDirty || this._vertices == null || this._vertices.getCount() == 0) {
            this._vertices.clearVertices();
            this._getAnchorPoints()._generateVertices(this._vertices, this.$trf, true);
            this._verticesDirty = false;
        }
        return this._vertices.rewindVertices(index);
    };

    /** @override */
    GPathBase.prototype.readVertex = function (vertex) {
        return this._vertices.readVertex(vertex);
    };

    /**
     * Creates a new empty anchor points set, and returns the old anchor points
     * @returns {GPathBase.AnchorPoints} old anchor points
     */
    GPathBase.prototype.clearAnchorPoints = function () {
        var anchorPoints = this._anchorPoints;
        this._anchorPoints._removalAllowed = true;
        var next = this._anchorPoints.getNext(true);
        this.removeChild(this._anchorPoints);
        this._anchorPoints = new GPathBase.AnchorPoints();
        this.insertChild(this._anchorPoints, next);
        this._anchorPoints._removalAllowed = false;
        return anchorPoints;
    };


    /** @override */
    GPathBase.prototype._isEvenOddFill = function () {
        return !!this.$evenodd;
    };

    /** @override */
    GPathBase.prototype._calculateOrigGeometryBBox = function () {
        var vertices = new GVertexContainer();
        this._getAnchorPoints()._generateVertices(vertices, null, false);
        return ifVertexInfo.calculateBounds(vertices, true);
    };

    /** @override */
    GPathBase.prototype._handleChange = function (change, args) {
        this._handleVisualChangeForProperties(change, args, GPathBase.VisualProperties);

        if (change === GNode._Change.Store) {
            this.storeProperties(args, GPathBase.VisualProperties);
        } else if (change === GNode._Change.Restore) {
            this.restoreProperties(args, GPathBase.VisualProperties);
        } else if (change === GNode._Change.AfterPropertiesChange) {
            // Special handling when changing closed status of path
            if (args.properties.indexOf('closed') >= 0) {
                var points = this._getAnchorPoints();
                if (points) {
                    points._invalidateRight(points.getFirstChild());
                    points._invalidateLeft(points.getLastChild());
                }
                this._verticesDirty = true;
            } else if (args.properties.indexOf('trf') >= 0) {
                this._verticesDirty = true;
            }
        } else if (change === GNode._Change.ParentAttached || change === GNode._Change.ParentDetach) {
            if (this._anchorPoints) {
                this._anchorPoints._detachFromParent(this);
                if (change === GNode._Change.ParentAttached) {
                    this._anchorPoints._attachToParent(this);
                }
            }
        }

        GShape.prototype._handleChange.call(this, change, args);
    };

    /**
     * @returns {GPathBase.AnchorPoints}
     * @private
     */
    GPathBase.prototype._getAnchorPoints = function () {
        return this._anchorPoints;
    };

    /** @override */
    GPathBase.prototype.toString = function () {
        return "[GPathBase]";
    };

    _.GPathBase = GPathBase;
})(this);