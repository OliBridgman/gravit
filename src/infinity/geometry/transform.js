(function (_) {

    /**
     * A 2d affine transform, if no parameters are given then
     * this constructos an identity matrix. Note that this class is immutable.
     * @class GTransform
     * @constructor
     * @version 1.0
     */
    function GTransform(sx, shy, shx, sy, tx, ty) {
        this._sx = sx ? sx : 1.0;
        this._shy = shy ? shy : 0.0;
        this._shx = shx ? shx : 0.0;
        this._sy = sy ? sy : 1.0;
        this._tx = tx ? tx : 0.0;
        this._ty = ty ? ty : 0.0;
    }

    /**
     * Serializes a transformation into it's most simple form
     * @returns {Array} serialized array or empty array for identity
     */
    GTransform.serialize = function (transform) {
        var result = [];
        if (!gMath.isEqualEps(transform._sx, 1.0) || !gMath.isEqualEps(transform._sy, 1.0)) {
            result = result.concat(['S'], transform._sx, transform._sy);
        }
        if (!gMath.isEqualEps(transform._shx, 0.0) || !gMath.isEqualEps(transform._shy, 0.0)) {
            result = result.concat(['H'], transform._shx, transform._shy);
        }
        if (!gMath.isEqualEps(transform._tx, 0.0) || !gMath.isEqualEps(transform._ty, 0.0)) {
            result = result.concat(['T'], transform._tx, transform._ty);
        }
        return result;
    };

    /**
     * Deserializes a transformation from an array
     * @param {Array} serialized array to deserialize from
     * @return {GTransform}
     */
    GTransform.deserialize = function (array) {
        // 0 = SX,SY | 1 = SHX,SHY | 2 = TX,TY
        var sx = 1, shy = 0, shx = 0, sy = 1, tx = 0, ty = 1;
        var mode = -1;
        var index = 0;
        while (index < array.length) {
            if (typeof array[index] === 'string') {
                if (array[index] === 'S') {
                    mode = 0;
                } else if (array[index] === 'H') {
                    mode = 1;
                } else if (array[index] === 'T') {
                    mode = 2;
                } else {
                    throw new Error("Broken transform integrity.");
                }
                index += 1;
            } else {
                switch (mode) {
                    case 0:
                        sx = array[index];
                        sy = array[index + 1];
                        break;
                    case 1:
                        shx = array[index];
                        shy = array[index + 1];
                        break;
                    case 2:
                        tx = array[index];
                        ty = array[index + 1];
                        break;
                    default:
                        throw new Error("Broken transform integrity.");
                }
                index += 2;
            }
        }

        return new GTransform(sx, shy, shx, sy, tx, ty);
    };

    /**
     * Compare two transforms for equality by their matrix. Also takes care of null parameters
     * @param {GTransform} left left side transform
     * @param {GTransform} right right side transform
     * @return {Boolean} true if left and right are equal (also if they're null!)
     * @version 1.0
     */
    GTransform.equals = function (left, right) {
        if (left && left == right) {
            return true;
        } else if (left && right) {
            return gMath.isEqualEps(left._sx, right._sx) && gMath.isEqualEps(left._shy, right._shy) &&
                gMath.isEqualEps(left._shx, right._shx) && gMath.isEqualEps(left._sy, right._sy) &&
                gMath.isEqualEps(left._tx, right._tx) && gMath.isEqualEps(left._ty, right._ty);
        } else {
            return false;
        }
    };

    /**
     * Horizontal scale
     * @type Number
     * @version 1.0
     */
    GTransform.prototype._sx;

    /**
     * Vertical shear
     * @type Number
     * @version 1.0
     */
    GTransform.prototype._shy;

    /**
     * Horizontal shear
     * @type Number
     * @version 1.0
     */
    GTransform.prototype._shx;

    /**
     * Vertical scale
     * @type Number
     * @version 1.0
     */
    GTransform.prototype._sy;

    /**
     * Horiontal offset
     * @type Number
     * @version 1.0
     */
    GTransform.prototype._tx;

    /**
     * Vertical offset
     * @type Number
     * @version 1.0
     */
    GTransform.prototype._ty;

    /**
     * Clone this instance
     * @returns {GTransform}
     */
    GTransform.prototype.clone = function () {
        return new GTransform(this._sx, this._shy, this._shx, this._sy, this._tx, this._ty);
    };

    /**
     * @return {Boolean} whether this transform reprsents an identity matrix or not
     * @version 1.0
     */
    GTransform.prototype.isIdentity = function () {
        return gMath.isEqualEps(this._sx, 1.0) && gMath.isEqualEps(this._shy, 0.0) &&
            gMath.isEqualEps(this._shx, 0.0) && gMath.isEqualEps(this._sy, 1.0) &&
            gMath.isEqualEps(this._tx, 0.0) && gMath.isEqualEps(this._ty, 0.0);
    };

    /**
     * @return {Boolean} whether this is a valid transform or not
     * @version 1.0
     */
    GTransform.prototype.isValid = function () {
        return Math.abs(this._sx) > gMath.defaultEps && Math.abs(this._sy) > gMath.defaultEps;
    };

    /**
     * Returns the underlying matrix [sx, shy, shx, sy, tx, ty]
     * @returns {Array}
     */
    GTransform.prototype.getMatrix = function () {
        return [this._sx, this._shy, this._shx, this._sy, this._tx, this._ty];
    };

    /**
     * Returns the translation this transformation
     * @return {GPoint}
     */
    GTransform.prototype.getTranslation = function () {
        return new GPoint(this._tx, this._ty);
    };

    /**
     * Returns the scale factor of this transformation
     * @return {Number}
     */
    GTransform.prototype.getScaleFactor = function () {
        return Math.sqrt(this._sx * this._sx + this._shy * this._shy)
    };

    /**
     * Returns the rotation factor of this transformation in radians
     * @return {Number}
     */
    GTransform.prototype.getRotationFactor = function () {
        return Math.atan2(this._shx, this._sx);
    };

    /**
     * Returns a new, multiplied transformation
     * @param {GTransform} other
     * @return {GTransform}
     */
    GTransform.prototype.multiplied = function (other) {
        var sx = this._sx, shy = this._shy, shx = this._shx,
            sy = this._sy, tx = this._tx, ty = this._ty;

        var t0 = sx * other._sx + shy * other._shx;
        var t2 = shx * other._sx + sy * other._shx;
        var t4 = tx * other._sx + ty * other._shx + other._tx;
        shy = sx * other._shy + shy * other._sy;
        sy = shx * other._shy + sy * other._sy;
        ty = tx * other._shy + ty * other._sy + other._ty;
        sx = t0;
        shx = t2;
        tx = t4;
        return new GTransform(sx, shy, shx, sy, tx, ty);
    };

    /**
     * Returns a new, pre-multiplied transformation
     * @param {GTransform} other
     * @return {GTransform}
     */
    GTransform.prototype.preMultiplied = function (other) {
        var sx = other._sx * this._sx + other._shy * this._shx;
        var shy = other._sx * this._shy + other._shy * this._sy;
        var sy = other._shx * this._shy + other._sy * this._sy;
        var shx = other._shx * this._sx + other._sy * this._shx;
        var tx = other._tx * this._sx + other._ty * this._shx + this._tx;
        var ty = other._tx * this._shy + other._ty * this._sy + this._ty;
        return new GTransform(sx, shy, shx, sy, tx, ty);
    };

    /**
     * Returns a new, inverted transformation
     * @return {GTransform}
     */
    GTransform.prototype.inverted = function () {
        var sx = this._sx, sy = this._sy,
            shx = this._shx, shy = this._shy,
            tx = this._tx, ty = this._ty;

        var d = 1.0 / (sx * sy - shy * shx);

        var t0 = sy * d;
        sy = sx * d;
        shy = -shy * d;
        shx = -shx * d;

        var t4 = -tx * t0 - ty * shx;
        ty = -tx * shy - ty * sy;

        sx = t0;
        tx = t4;

        return new GTransform(sx, shy, shx, sy, tx, ty);
    };

    /**
     * Returns a new, rotated transformation
     * @param {Number} angle in radians
     * @return {GTransform}
     */
    GTransform.prototype.rotated = function (angle) {
        return this.multiplied(new GTransform(Math.cos(angle), Math.sin(angle), -Math.sin(angle), Math.cos(angle), 0.0, 0.0));
    };

    /**
     * Add translation to this transform and return the result
     * @return {GTransform} this transform with translation applied
     * @version 1.0
     */
    GTransform.prototype.translated = function (tx, ty) {
        return this.multiplied(new GTransform(1.0, 0.0, 0.0, 1.0, tx, ty));
    };

    /**
     * Returns a new, scaled transformation
     * @param {Number} sx
     * @param {Number} sy
     * @return {GTransform}
     */
    GTransform.prototype.scaled = function (sx, sy) {
        if (!sy) sy = sx;
        return this.multiplied(new GTransform(sx, 0.0, 0.0, sy, 0.0, 0.0));
    };

    /**
     * Returns a new, skewed transformation
     * @param {Number} sx
     * @param {Number} sy
     * @return {GTransform}
     */
    GTransform.prototype.skewed = function (sx, sy) {
        return this.multiplied(new GTransform(1.0, Math.tan(sy), Math.tan(sx), 1.0, 0.0, 0.0));
    };

    /**
     * Map a vertex with x/y-coordinates to this transformation
     * @param {Object} vertex the vertex to map and modify. Note that is is
     * expected that the vertex has two properties called "x" and "y"!
     * @version 1.0
     */
    GTransform.prototype.map = function (vertex) {
        if (!this.isIdentity()) {
            var x = vertex.x;
            vertex.x = x * this._sx + vertex.y * this._shx + this._tx;
            vertex.y = x * this._shy + vertex.y * this._sy + this._ty;
        }
    };

    /**
     * Map a point into this transformation
     * @param {GPoint} point the point to map
     * @return {GPoint} a new point mapped into this transformation
     * @version 1.0
     */
    GTransform.prototype.mapPoint = function (point) {
        // If identity nothing to transform so return
        if (this.isIdentity()) {
            return point;
        }

        var px = point.getX();
        var py = point.getY();

        var x = px * this._sx + py * this._shx + this._tx;
        var y = px * this._shy + py * this._sy + this._ty;
        return new GPoint(x, y);
    };

    /**
     * Map a rectangle into this transformation
     * @param {GRect} rect the rectangle to map
     * @return {GRect} a new rect mapped into this transformation
     * @version 1.0
     */
    GTransform.prototype.mapRect = function (rect) {
        // If identity nothing to transform so return
        if (this.isIdentity() || rect == null) {
            return rect;
        }

        var p1 = rect.getSide(GRect.Side.TOP_LEFT);
        var p2 = rect.getSide(GRect.Side.TOP_RIGHT);
        var p3 = rect.getSide(GRect.Side.BOTTOM_RIGHT);
        var p4 = rect.getSide(GRect.Side.BOTTOM_LEFT);

        return GRect.fromPoints(this.mapPoint(p1), this.mapPoint(p2), this.mapPoint(p3), this.mapPoint(p4));
    };

    /** @override */
    GTransform.prototype.toString = function () {
        return "[Object GTransform(sx=" + this._sx.toString() + ", shy=" + this._shy.toString() +
            ", shx=" + this._shx.toString() + ", sx=" + this._sx.toString() + ", tx=" + this._tx.toString() + ", ty=" + this._ty.toString() + ")]";
    };

    _.GTransform = GTransform;
})(this);