(function (_) {

    /**
     * A simple point construct. Note that this class is immutable.
     * @class IFPoint
     * @param {Number} x the x-position
     * @param {Number} y the y-position
     * @constructor
     * @version 1.0
     */
    function IFPoint(x, y) {
        this._x = x;
        this._y = y;
    }

    /**
     * Compare two points for equality by their x,y values. Also takes care of null parameters
     * @param {IFPoint} left left side point
     * @param {IFPoint} right right side point
     * @return {Boolean} true if left and right are equal (also if they're null!)
     * @version 1.0
     */
    IFPoint.equals = function (left, right) {
        if (left && left == right) {
            return true;
        } else if (left && right) {
            return IFMath.isEqualEps(left._x, right._x) && IFMath.isEqualEps(left._y, right._y);
        } else {
            return false;
        }
    };

    /**
     * Returns the minimum point for an unlimited number of point arguments
     * @return {IFPoint}
     * @version 1.0
     */
    IFPoint.min = function () {
        var result = new IFPoint(null, null);
        for (var i = 0; i < arguments.length; ++i) {
            if (result._x == null || arguments[i]._x < result._x) result._x = arguments[i]._x;
            if (result._y == null || arguments[i]._y < result._y) result._y = arguments[i]._y;
        }
        return result;
    };

    /**
     * Returns the maximum point for an unlimited number of point arguments
     * @return {IFPoint}
     * @version 1.0
     */
    IFPoint.max = function () {
        var result = new IFPoint(null, null);
        for (var i = 0; i < arguments.length; ++i) {
            if (result._x == null || arguments[i]._x > result._x) result._x = arguments[i]._x;
            if (result._y == null || arguments[i]._y > result._y) result._y = arguments[i]._y;
        }
        return result;
    };

    /**
     * @type Number
     * @private
     */
    IFPoint.prototype._x = 0;

    /**
     * @type Number
     * @private
     */
    IFPoint.prototype._y = 0;

    /**
     * @return {Number} the x-position of this point
     * @version 1.0
     */
    IFPoint.prototype.getX = function () {
        return this._x;
    };

    /**
     * @return {Number} the y-position of this point
     * @version 1.0
     */
    IFPoint.prototype.getY = function () {
        return this._y;
    };

    /**
     * Return a new subtract point
     * @param {IFPoint} other the other point to subtract from this to get a subtract
     * @return {IFPoint} a new subtract point which is this - other
     * @version 1.0
     */
    IFPoint.prototype.subtract = function (other) {
        return new IFPoint(this._x - other._x, this._y - other._y);
    };

    /**
     * Return a new addition point
     * @param {IFPoint} other the other point to add to this to get an addition
     * @return {IFPoint} a new addition point which is this + other
     * @version 1.0
     */
    IFPoint.prototype.add = function (other) {
        return new IFPoint(this._x + other._x, this._y + other._y);
    };

    /**
     * Return a new translated point
     * @param {Number} tx horizontal translation offset
     * @param {Number} ty vertical translation offset
     * @return {IFPoint} a newly translated point
     * @version 1.0
     */
    IFPoint.prototype.translated = function (tx, ty) {
        return new IFPoint(this._x + tx, this._y + ty);
    };

    /**
     * Return a new rotated point
     * @param {Number} angle the angle to rotate for
     * @return {IFPoint} a newly rotated point
     * @version 1.0
     */
    IFPoint.prototype.rotated = function (angle) {
        var cos_ = Math.cos(angle);
        var sin_ = Math.sin(angle);

        return new IFPoint(cos_ * this._x - sin_ * this._y, sin_ * this._x + cos_ * this._y);
    };

    /**
     * Return a new rotated point rotated around an origin point
     * @param {Number} angle the angle to rotate for
     * @param {IFPoint} origin the origin point to rotate around
     * @return {IFPoint} a newly rotated point
     * @version 1.0
     */
    IFPoint.prototype.rotatedAt = function (angle, origin) {
        if (!origin) {
            return this.rotated(angle);
        }

        var cos_ = Math.cos(angle);
        var sin_ = Math.sin(angle);

        return new IFPoint((cos_ * (this._x - origin._x) - sin_ * (this._y - origin._y)) + origin._x, (sin_ * (this._x - origin._x) + cos_ * (this._y - origin._y)) + origin._y);
    };

    /** @override */
    IFPoint.prototype.toString = function () {
        return "[Object IFPoint(x=" + this._x + ", y=" + this._y + "]";
    };

    _.IFPoint = IFPoint;
})(this);