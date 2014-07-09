(function (_) {

    /**
     * A simple rect construct. Note that this class is immutable.
     * @class GRect
     * @param {Number} [x] the left-position of the rect, defaults to 0
     * @param {Number} [y] the top-position of the rect, defaults to 0
     * @param {Number} [width] the width of the rect, defaults to 0
     * @param {Number} [height] the height of the rect, defaults to 0
     * @constructor
     * @version 1.0
     */
    function GRect(x, y, width, height) {
        this._x = x ? x : 0;
        this._y = y ? y : 0;
        this._width = width ? width : 0;
        this._height = height ? height : 0;
    };

    /**
     * An enum defining a side of a rect
     * @enum
     * @version 1.0
     */
    GRect.Side = {
        /**
         * Constant defining the top-left side of a rectangle
         * @type {Number}
         * @version 1.0
         */
        TOP_LEFT: 0,

        /**
         * Constant defining the top-center side of a rectangle
         * @type {Number}
         * @version 1.0
         */
        TOP_CENTER: 1,

        /**
         * Constant defining the top-right side of a rectangle
         * @type {Number}
         */
        TOP_RIGHT: 2,

        /**
         * Constant defining the right-center side of a rectangle
         * @type {Number}
         * @version 1.0
         */
        RIGHT_CENTER: 3,

        /**
         * Constant defining the bottom-right side of a rectangle
         * @type {Number}
         * @version 1.0
         */
        BOTTOM_RIGHT: 4,

        /**
         * Constant defining the bottom-center side of a rectangle
         * @type {Number}
         * @version 1.0
         */
        BOTTOM_CENTER: 5,

        /**
         * Constant defining the bottom-left side of a rectangle
         * @type {Number}
         * @version 1.0
         */
        BOTTOM_LEFT: 6,

        /**
         * Constant defining the left-center side of a rectangle
         * @type {Number}
         * @version 1.0
         */
        LEFT_CENTER: 7,

        /**
         * Constant defining the center side of a rectangle
         * @type {Number}
         * @version 1.0
         */
        CENTER: 8
    };

    /**
     * A unit rect starting at 0,0 width an unit size of 1
     * @type {GRect}
     */
    GRect.UNIT_RECT = new GRect(0, 0, 1, 1);

    /**
     * Construct a rectangle from a set of given points. This
     * @return {GRect} a new rect enclosing all points
     * @version 1.0
     */
    GRect.fromPoints = function () {
        var minPoint = GPoint.min.apply(null, arguments);
        var maxPoint = GPoint.max.apply(null, arguments);
        return new GRect(minPoint.getX(), minPoint.getY(), maxPoint.getX() - minPoint.getX(), maxPoint.getY() - minPoint.getY());
    };

    /**
     * Compare two rects for equality by their x,y,width,height. Also takes care of null parameters
     * @param {GRect} left left side rect
     * @param {GRect} right right side rect
     * @return {Boolean} true if left and right are equal (also if they're null!)
     * @version 1.0
     */
    GRect.equals = function (left, right) {
        if (!left && left === right) {
            return true;
        } else if (left && right) {
            return ifMath.isEqualEps(left._x, right._x) && ifMath.isEqualEps(left._y, right._y) && ifMath.isEqualEps(left._width, right._width) && ifMath.isEqualEps(left._height, right._height);
        } else {
            return false;
        }
    };

    /**
     * @type Number
     * @private
     */
    GRect.prototype._x = 0;

    /**
     * @type Number
     * @private
     */
    GRect.prototype._y = 0;

    /**
     * @type Number
     * @private
     */
    GRect.prototype._width = 0;

    /**
     * @type Number
     * @private
     */
    GRect.prototype._height = 0;

    /**
     * @return {Number} the x-position of this rectangle
     * @version 1.0
     */
    GRect.prototype.getX = function () {
        return this._x;
    };

    /**
     * @return {Number} the y-position of this rectangle
     * @version 1.0
     */
    GRect.prototype.getY = function () {
        return this._y;
    };

    /**
     * @return {Number} the width of this rectangle
     * @version 1.0
     */
    GRect.prototype.getWidth = function () {
        return this._width;
    };

    /**
     * @return {Number} the height of this rectangle
     * @version 1.0
     */
    GRect.prototype.getHeight = function () {
        return this._height;
    };

    /**
     * @return {Boolean) whether this rectangle is empty or not
     * @version 1.0
     */
    GRect.prototype.isEmpty = function () {
        return (this._width <= 0. || this._height <= 0.);
    };

    /**
     * Checks whether this rectangle contains a given point
     * @param {GPoint} point the point to test for
     * @return {Boolean} true if the point is contained by this rect
     * @version 1.0
     */
    GRect.prototype.containsPoint = function (point) {
        return this.containsPointXY(point.getX(), point.getY());
    };

    /**
     * Checks whether this rectangle contains a given point
     * @param {Number} px x-coordinate of point
     * @param {Number} py y-coordinate of point
     * @return {Boolean} true if the point is contained by this rect
     * @version 1.0
     */
    GRect.prototype.containsPointXY = function (px, py) {
        var l = this._x;
        var r = this._x;
        if (this._width < 0)
            l += this._width;
        else
            r += this._width;
        if (l == r)
            return false;

        if (px < l || px > r)
            return false;

        var t = this._y;
        var b = this._y;
        if (this._height < 0)
            t += this._height;
        else
            b += this._height;
        if (t == b)
            return false;

        if (py < t || py > b)
            return false;

        return true;
    };

    /**
     * Checks whether this rectangle contains another rectangle
     * @param {GRect} rect the otherRect to test for
     * @return {Boolean} true if the otherRect is contained by this one
     * @version 1.0
     */
    GRect.prototype.containsRect = function (rect) {
        var l1 = this._x;
        var r1 = this._x;
        if (this._width < 0)
            l1 += this._width;
        else
            r1 += this._width;
        if (l1 == r1)
            return false;

        var l2 = rect._x;
        var r2 = rect._x;
        if (rect._width < 0)
            l2 += rect._width;
        else
            r2 += rect._width;
        if (l2 == r2)
            return false;

        if (l2 < l1 || r2 > r1)
            return false;

        var t1 = this._y;
        var b1 = this._y;
        if (this._height < 0)
            t1 += this._height;
        else
            b1 += this._height;
        if (t1 == b1)
            return false;

        var t2 = rect._y;
        var b2 = rect._y;
        if (rect._height < 0)
            t2 += rect._height;
        else
            b2 += rect._height;
        if (t2 == b2)
            return false;

        if (t2 < t1 || b2 > b1)
            return false;

        return true;
    };

    /**
     * Tests whether this rect intersects with another one
     * @param {GRect} rect the rect to test if it intersects with this one
     * @return {Boolean} true if both intersect, false if not
     * @see intersect, intersected
     * @version 1.0
     */
    GRect.prototype.intersectsRect = function (rect) {
        return this.intersectsRectXYWH(rect._x, rect._y, rect._width, rect._height);
    };

    /**
     * Tests whether this rect intersects with another one
     * @param {Number} x the x-position of the rect to test against
     * @param {Number} y the y-position of the rect to test against
     * @param {Number} w the width of the rect to test against
     * @param {Number} h the height of the rect to test against
     * @return {Boolean} true if both intersect, false if not
     * @see intersect, intersected
     * @version 1.0
     */
    GRect.prototype.intersectsRectXYWH = function (x, y, w, h) {
        var l1 = this._x;
        var r1 = this._x;
        if (this._width < 0)
            l1 += this._width;
        else
            r1 += this._width;
        if (l1 == r1)
            return false;

        var l2 = x;
        var r2 = x;
        if (w < 0)
            l2 += w;
        else
            r2 += w;
        if (l2 == r2)
            return false;

        if (l1 >= r2 || l2 >= r1)
            return false;

        var t1 = this._y;
        var b1 = this._y;
        if (this._height < 0)
            t1 += this._height;
        else
            b1 += this._height;
        if (t1 == b1)
            return false;

        var t2 = y;
        var b2 = y;
        if (h < 0)
            t2 += h;
        else
            b2 += h;
        if (t2 == b2)
            return false;

        if (t1 >= b2 || t2 >= b1)
            return false;

        return true;
    };

    /**
     * Returns a new copy of this rect with expandings on each side
     * @param {Number} l expand amount on the left side, negative value means shrink
     * @param {Number} t expand amount on the top side, negative value means shrink
     * @param {Number} r expand amount on the right side, negative value means shrink
     * @param {Number} b expand amount on the bottom side, negative value means shrink
     */
    GRect.prototype.expanded = function (l, t, r, b) {
        return new GRect(this._x - l, this._y - t, this._width + l + r, this._height + t + b);
    };

    /**
     * Return a new, translated rectangle
     * @param {Number} tx the horizontal translation offset
     * @param {Number} ty the vertical translation offset
     * @return {GRect} a new, translated rect
     * @version 1.0
     */
    GRect.prototype.translated = function (tx, ty) {
        return new GRect(this._x + tx, this._y + ty, this._width, this._height);
    };

    /**
     * Return a new, scaled rectangle
     * @param {Number} sx the horizontal scaling factor
     * @param {Number} sy the vertical scaling factor
     * @return {GRect} a new, scaled rectangle
     * @version 1.0
     */
    GRect.prototype.scaled = function (sx, sy) {
        return new GRect(this._x * sx, this._y * sy, this._width * sx, this._height * sy);
    };

    /**
     * Return a new, scaled rectangle around and origin point
     * @param {Number} sx the horizontal scaling factor
     * @param {Number} sy the vertical scaling factor
     * @param {GPoint} origin the origin point to scale at
     * @return {GRect} a new, scaled rect
     * @version 1.0
     */
    GRect.prototype.scaledAt = function (sx, sy, origin) {
        if (!origin) {
            return this.scaled(sx, sy);
        } else {
            return new GRect(
                (this._x - origin.getX()) * sx + origin.getX(),
                (this._y - origin.getY()) * sy + origin.getY(),
                this._width * sx, this._height * sy);
        }
    };

    /**
     * Return a new rect that unites this and the other rect
     * @param {GRect} otherRect the other rect to unite with
     * @return {GRect} an united rect
     * @version 1.0
     */
    GRect.prototype.united = function (otherRect) {
        var l1 = this._x;
        var r1 = this._x;
        if (this._width < 0)
            l1 += this._width;
        else
            r1 += this._width;
        if (l1 == r1)
            return otherRect;

        var l2 = otherRect._x;
        var r2 = otherRect._x;
        if (otherRect._width < 0)
            l2 += otherRect._width;
        else
            r2 += otherRect._width;
        if (l2 == r2)
            return this;

        var t1 = this._y;
        var b1 = this._y;
        if (this._height < 0)
            t1 += this._height;
        else
            b1 += this._height;
        if (t1 == b1)
            return otherRect;

        var t2 = otherRect._y;
        var b2 = otherRect._y;
        if (otherRect._height < 0)
            t2 += otherRect._height;
        else
            b2 += otherRect._height;
        if (t2 == b2)
            return this;

        var result = new GRect();
        result._x = Math.min(l1, l2);
        result._y = Math.min(t1, t2);
        result._width = Math.max(r1, r2) - result._x;
        result._height = Math.max(b1, b2) - result._y;
        return result;
    };

    /**
     * Return a new rect that intersects this and the other rect
     * @param {GRect} otherRect the other rect to intersect with
     * @return {GRect} an intersected rect
     * @version 1.0
     */
    GRect.prototype.intersected = function (otherRect) {
        var l1 = this._x;
        var r1 = this._x;
        if (this._width < 0)
            l1 += this._width;
        else
            r1 += this._width;
        if (l1 == r1)
            return new GRect(0, 0, 0, 0);

        var l2 = otherRect._x;
        var r2 = otherRect._x;
        if (otherRect._width < 0)
            l2 += otherRect._width;
        else
            r2 += otherRect._width;
        if (l2 == r2)
            return new GRect(0, 0, 0, 0);

        if (l1 >= r2 || l2 >= r1)
            return new GRect(0, 0, 0, 0);

        var t1 = this._y;
        var b1 = this._y;
        if (this._height < 0)
            t1 += this._height;
        else
            b1 += this._height;
        if (t1 == b1)
            return new GRect(0, 0, 0, 0);

        var t2 = otherRect._y;
        var b2 = otherRect._y;
        if (otherRect._height < 0)
            t2 += otherRect._height;
        else
            b2 += otherRect._height;
        if (t2 == b2)
            return new GRect(0, 0, 0, 0);

        if (t1 >= b2 || t2 >= b1)
            return new GRect(0, 0, 0, 0);

        var result = new GRect();
        result._x = Math.max(l1, l2);
        result._y = Math.max(t1, t2);
        result._width = Math.min(r1, r2) - result._x;
        result._height = Math.min(b1, b2) - result._y;
        return result;
    };

    /**
     * @return {GRect} a new from rect this one, aligned to integers
     * @version 1.0
     */
    GRect.prototype.toAlignedRect = function () {
        var xmin = Math.floor(this._x);
        var xmax = Math.ceil(this._x + this._width);
        var ymin = Math.floor(this._y);
        var ymax = Math.ceil(this._y + this._height);
        return new GRect(xmin, ymin, xmax - xmin, ymax - ymin);
    };

    /**
     * Returns a point for a given rectangle side
     * @param {Number} side  the side of the rectangle to get a point for
     * @return {GPoint} the point for the given side
     * @version 1.0
     */
    GRect.prototype.getSide = function (side) {
        switch (side) {
            case GRect.Side.TOP_LEFT:
                return new GPoint(this._x, this._y);
            case GRect.Side.TOP_CENTER:
                return new GPoint(this._x + this._width / 2.0, this._y);
            case GRect.Side.TOP_RIGHT:
                return new GPoint(this._x + this._width, this._y);
            case GRect.Side.RIGHT_CENTER:
                return new GPoint(this._x + this._width, this._y + this._height / 2.0);
            case GRect.Side.BOTTOM_RIGHT:
                return new GPoint(this._x + this._width, this._y + this._height);
            case GRect.Side.BOTTOM_CENTER:
                return new GPoint(this._x + this._width / 2.0, this._y + this._height);
            case GRect.Side.BOTTOM_LEFT:
                return new GPoint(this._x, this._y + this._height);
            case GRect.Side.LEFT_CENTER:
                return new GPoint(this._x, this._y + this._height / 2.0);
            case GRect.Side.CENTER:
                return new GPoint(this._x + this._width / 2.0, this._y + this._height / 2.0);
            default:
                throw new Error("Illegal Argument: " + side);
        }
    };

    /** @override */
    GRect.prototype.toString = function () {
        return "[Object GRect(x=" + this._x + ", y=" + this._y + ", width=" + this._width + ", height=" + this._height + ")]";
    };

    _.GRect = GRect;
})(this);