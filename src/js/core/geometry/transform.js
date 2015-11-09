(function (_) {

    /**
     * A 2d affine transform, if no parameters are given then
     * this constructos an identity matrix. Note that this class is immutable.
     * @class GTransform
     * @constructor
     * @version 1.0
     */
    function GTransform(sx, shy, shx, sy, tx, ty) {
        this._sx = typeof sx === 'number' ? sx : 1.0;
        this._shy = typeof shy === 'number' ? shy : 0.0;
        this._shx = typeof shx === 'number' ? shx : 0.0;
        this._sy = typeof sy === 'number' ? sy : 1.0;
        this._tx = typeof tx === 'number' ? tx : 0.0;
        this._ty = typeof ty === 'number' ? ty : 0.0;
    }

    /**
     * Serializes a transformation into it's most simple form
     * @returns {Array} serialized array or empty array for identity
     */
    GTransform.serialize = function (transform) {
        if (!transform.isIdentity()) {
            return transform.getMatrix();
        } else {
            return [];
        }
    };

    /**
     * Deserializes a transformation from an array
     * @param {Array} serialized array to deserialize from
     * @return {GTransform}
     */
    GTransform.deserialize = function (array) {
        if (array && array.length >= 6) {
            return new GTransform(array[0], array[1], array[2], array[3], array[4], array[5]);
        } else {
            return new GTransform();
        }
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
            return GMath.isEqualEps(left._sx, right._sx) && GMath.isEqualEps(left._shy, right._shy) &&
                GMath.isEqualEps(left._shx, right._shx) && GMath.isEqualEps(left._sy, right._sy) &&
                GMath.isEqualEps(left._tx, right._tx) && GMath.isEqualEps(left._ty, right._ty);
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
     * @return {Boolean} whether this transform reprsents an identity matrix or not
     * @version 1.0
     */
    GTransform.prototype.isIdentity = function () {
        return GMath.isEqualEps(this._sx, 1.0) && GMath.isEqualEps(this._shy, 0.0) &&
            GMath.isEqualEps(this._shx, 0.0) && GMath.isEqualEps(this._sy, 1.0) &&
            GMath.isEqualEps(this._tx, 0.0) && GMath.isEqualEps(this._ty, 0.0);
    };

    /**
     * @return {Boolean} whether this is a valid transform or not
     * @version 1.0
     */
    GTransform.prototype.isValid = function () {
        return Math.abs(this._sx) > GMath.defaultEps && Math.abs(this._sy) > GMath.defaultEps;
    };

    /**
     * Returns the underlying matrix [sx, shy, shx, sy, tx, ty]
     * @returns {Array}
     */
    GTransform.prototype.getMatrix = function () {
        return [this._sx, this._shy, this._shx, this._sy, this._tx, this._ty];
    };

    /**
     * Returns the determinant of the matrix
     * @returns {Number}
     */
    GTransform.prototype.getDeterminant = function () {
        return this._sx * this._sy - this._shy * this._shx;
    };

    /**
     * Returns the reciprocal of the determinant of the matrix
     * @returns {Number}
     */
    GTransform.prototype.getDeterminantReciprocal = function () {
        return 1.0 / (this._sx * this._sy - this._shy * this._shx);
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
        var x = 0.707106781 * this._sx + 0.707106781 * this._shx;
        var y = 0.707106781 * this._shy + 0.707106781 * this._sy;
        return Math.sqrt(x * x + y * y);
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