(function (_) {

    /**
     * A general-purpose data structure for holding a list of rectangular
     * regions that need to be repainted, with intelligent coalescing.
     *
     * IFDirtyList will unify two regions A and B if the smallest rectangle
     * enclosing both A and B occupies no more than epsilon + Area_A +
     * Area_B. Failing this, if two corners of A fall within B, A will be
     * shrunk to exclude the union of A and B.
     *
     * @class IFDirtyList
     * @constructor
     * @version 1.0
     */
    function IFDirtyList() {
    }

    /**
     * Global IFDirtyList options
     * @type {Object}
     */
    IFDirtyList.options = {
        /**
         * Maximum area to when to merge dirty regions
         * @type {Number}
         * @version 1.0
         */
        epsilon: 50 * 50,

        /**
         * Size of buffer hold for dirty rectangles
         * @type {Number}
         * @version 1.0
         */
        bufferSize: 10
    };

    //------------------------------------------------------------------------------------------------------------------
    // IFDirtyList.Matcher Class
    //------------------------------------------------------------------------------------------------------------------
    /**
     * The matcher is a consolidated result from a flushed dirty list
     * @class IFDirtyList.Matcher
     * @constructor
     * @version 1.0
     */
    IFDirtyList.Matcher = function () {
    };

    /**
     * @type {IFRect}
     * @private
     */
    IFDirtyList.Matcher.prototype._unitedArea = null;

    /**
     * @type {Array}
     * @private
     */
    IFDirtyList.Matcher.prototype._rects = null;

    /**
     * Called to test whether a given rectangle is within the dirty area(s)
     * @param {IFRect} test [x, y, w, h] the rect to test against
     * @return {Boolean} true if rect is within the dirty area(s), false if not
     * @version 1.0
     */
    IFDirtyList.Matcher.prototype.isDirty = function (test) {
        // Quick check against the overall area
        if (this._unitedArea && !this._unitedArea.intersectsRect(test)) {
            return false;
        }

        // Check against each saved rect now
        if (this._rects && this._rects.length > 0) {
            for (var i = 0; i < this._rects.length; ++i) {
                var rect = this._rects[i];
                if (rect.intersectsRect(test)) {
                    return true;
                }
            }
        }

        return false;
    };

    /**
     * Transform all dirty rectangles in this matcher with a given transformation
     * @param {IFTransform} transform
     * @version 1.0
     */
    IFDirtyList.Matcher.prototype.transform = function (transform) {
        if (this._unitedArea) {
            this._unitedArea = transform.mapRect(this._unitedArea);
        }

        if (this._rects && this._rects.length > 0) {
            for (var i = 0; i < this._rects.length; ++i) {
                this._rects[i] = transform.mapRect(this._rects[i]);
            }
        }
    };

    /**
     * Clips all dirty rectangles into a given clip area
     * or if there're no dirties, will add the clip area as
     * united dirty area
     * @param {IFRect} clipArea
     */
    IFDirtyList.Matcher.prototype.clip = function (clipArea) {
        if (this._rects && this._rects.length > 0) {
            if (this._unitedArea) {
                this._unitedArea = clipArea.intersected(this._unitedArea);
            }

            for (var i = 0; i < this._rects.length; ++i) {
                this._rects[i] = clipArea.intersected(this._rects[i]);
            }
        } else {
            this._unitedArea = clipArea;
            this._rects = [clipArea];
        }
    };

    /**
     * Returns an array of dirty rectangles within this matcher
     * @return {Array} array of dirty rects in this matcher, may be null
     * @version 1.0
     */
    IFDirtyList.Matcher.prototype.getDirtyRectangles = function () {
        return this._rects;
    };

    //------------------------------------------------------------------------------------------------------------------
    // IFDirtyList Class
    //------------------------------------------------------------------------------------------------------------------

    /**
     * The actual area where dirty regions may take place. Anything
     * outside of this area will be ignored
     * @type {IFRect}
     * @private
     */
    IFDirtyList.prototype._area = null;

    /**
     * The dirty regions (each one is an int[4])
     * @private
     */
    IFDirtyList.prototype._dirties = null;

    /**
     * The number of dirty regions
     * @private
     */
    IFDirtyList.prototype._numDirties = 0;


    /**
     * Assigns the active area for dirty regions. Anything
     * outside of this area will be ignored as well as it is ensured
     * that all dirty regions are bound to the area so that their
     * coordintes will never lay outside this area. Note that if
     * there're already dirty rectangles they'll be cut to fit
     * within the new area.
     * @param {IFRect} area
     */
    IFDirtyList.prototype.setArea = function (area) {
        this._area = area;
    };

    /**
     * Returns the currently active area
     * @return {IFRect}
     * @version 1.0
     */
    IFDirtyList.prototype.getArea = function () {
        return this._area;
    };

    /**
     * Add a new rectangle to the dirty list; returns false if the
     * region fell completely within an existing rectangle or set of
     * rectangles (ie did not expand the dirty area) or if it was not
     * within the active area. Note that this will actually round
     * the input values to integers, first, means that the actualy
     * dirty array maybe up to 1px bigger on each side then the input.
     *
     * @param {Number} x the dirty rectangle's x-position
     * @param {Number} y the dirty rectangle's y-position
     * @param {Number} w the dirty rectangle's width
     * @param {Number} h the dirty rectangle's height
     * @return {Boolean}
     * @version 1.0
     */
    IFDirtyList.prototype.dirty = function (x, y, w, h) {

        // Fix coordinates, first
        var tmp_x = Math.floor(x);
        var tmp_y = Math.floor(y);
        w = Math.ceil(x + w) - tmp_x;
        h = Math.ceil(y + h) - tmp_y;
        x = tmp_x;
        y = tmp_y;

        if (this._area) {
            // Check if this._area is outside the active area
            if (!this._area.intersectsRectXYWH(x, y, w, h)) {
                return false;
            }

            // Normalize coords to not go beyond our area
            if (x < this._area.getX()) x = this._area.getX();
            if (y < this._area.getY()) y = this._area.getY();
            if (x + w > this._area.getX() + this._area.getWidth()) w = this._area.getX() + this._area.getWidth() - x;
            if (y + h > this._area.getY() + this._area.getHeight()) h = this._area.getY() + this._area.getHeight() - y;
        }

        if (this._dirties == null) {
            this._dirties = new Array(IFDirtyList.options.bufferSize);
        } else if (this._numDirties == this._dirties.length) {
            this._dirties.length += IFDirtyList.options.bufferSize;
        }

        // we attempt the "lossless" combinations first
        for (var i = 0; i < this._numDirties; i++) {
            var cur = this._dirties[i];

            // new region falls completely within existing region
            if (x >= cur[0] && y >= cur[1] && x + w <= cur[0] + cur[2] && y + h <= cur[1] + cur[3]) {
                return false;

                // existing region falls completely within new region
            } else if (x <= cur[0] && y <= cur[1] && x + w >= cur[0] + cur[2] && y + h >= cur[1] + cur[3]) {
                this._dirties[i][2] = 0;
                this._dirties[i][3] = 0;

                // left end of new region falls within existing region
            } else if (x >= cur[0] && x < cur[0] + cur[2] && y >= cur[1] && y + h <= cur[1] + cur[3]) {
                w = x + w - (cur[0] + cur[2]);
                x = cur[0] + cur[2];
                i = -1;
                continue;

                // right end of new region falls within existing region
            } else if (x + w > cur[0] && x + w <= cur[0] + cur[2] && y >= cur[1] && y + h <= cur[1] + cur[3]) {
                w = cur[0] - x;
                i = -1;
                continue;

                // top end of new region falls within existing region
            } else if (x >= cur[0] && x + w <= cur[0] + cur[2] && y >= cur[1] && y < cur[1] + cur[3]) {
                h = y + h - (cur[1] + cur[3]);
                y = cur[1] + cur[3];
                i = -1;
                continue;

                // bottom end of new region falls within existing region
            } else if (x >= cur[0] && x + w <= cur[0] + cur[2] && y + h > cur[1] && y + h <= cur[1] + cur[3]) {
                h = cur[1] - y;
                i = -1;
                continue;

                // left end of existing region falls within new region
            } else if (this._dirties[i][0] >= x && this._dirties[i][0] < x + w && this._dirties[i][1] >= y && this._dirties[i][1] + this._dirties[i][3] <= y + h) {
                this._dirties[i][2] = this._dirties[i][2] - (x + w - this._dirties[i][0]);
                this._dirties[i][0] = x + w;
                i = -1;
                continue;

                // right end of existing region falls within new region
            } else if (this._dirties[i][0] + this._dirties[i][2] > x && this._dirties[i][0] + this._dirties[i][2] <= x + w &&
                this._dirties[i][1] >= y && this._dirties[i][1] + this._dirties[i][3] <= y + h) {
                this._dirties[i][2] = x - this._dirties[i][0];
                i = -1;
                continue;

                // top end of existing region falls within new region
            } else if (this._dirties[i][0] >= x && this._dirties[i][0] + this._dirties[i][2] <= x + w && this._dirties[i][1] >= y && this._dirties[i][1] < y + h) {
                this._dirties[i][3] = this._dirties[i][3] - (y + h - this._dirties[i][1]);
                this._dirties[i][1] = y + h;
                i = -1;
                continue;

                // bottom end of existing region falls within new region
            } else if (this._dirties[i][0] >= x && this._dirties[i][0] + this._dirties[i][2] <= x + w &&
                this._dirties[i][1] + this._dirties[i][3] > y && this._dirties[i][1] + this._dirties[i][3] <= y + h) {
                this._dirties[i][3] = y - this._dirties[i][1];
                i = -1;
                continue;
            }

        }

        // then we attempt the "lossy" combinations
        for (var i = 0; i < this._numDirties; i++) {
            var cur = this._dirties[i];
            if (w > 0 && h > 0 && cur[2] > 0 && cur[3] > 0 &&
                ((Math.max(x + w, cur[0] + cur[2]) - Math.min(x, cur[0])) *
                    (Math.max(y + h, cur[1] + cur[3]) - Math.min(y, cur[1])) <
                    w * h + cur[2] * cur[3] + IFDirtyList.options.epsilon)) {
                var a = Math.min(cur[0], x);
                var b = Math.min(cur[1], y);
                var c = Math.max(x + w, cur[0] + cur[2]) - Math.min(cur[0], x);
                var d = Math.max(y + h, cur[1] + cur[3]) - Math.min(cur[1], y);
                this._dirties[i][2] = 0;
                this._dirties[i][3] = 0;
                return this.dirty(a, b, c, d);
            }
        }

        this._dirties[this._numDirties++] = [x, y, w, h];
        return true;
    };

    /**
     * Flushes this dirty list which means that a matcher with dirty
     * regions gets returned and the dirty list gets cleaned.
     * @return {IFDirtyList.Matcher} null if there's nothing dirty or a valid matcher
     * @version 1.0
     */
    IFDirtyList.prototype.flush = function () {

        var matcher = null;
        if (this._numDirties > 0) {
            matcher = new IFDirtyList.Matcher();

            matcher._rects = new Array(this._numDirties);
            var index = 0;
            for (var i = 0; i < this._numDirties; ++i) {
                var rect = this._dirties[i];
                if (rect && rect[2] > 0 && rect[3] > 0) {
                    var newRect = new IFRect(rect[0], rect[1], rect[2], rect[3]);
                    matcher._rects[index++] = newRect;
                    if (matcher._unitedArea == null) {
                        matcher._unitedArea = newRect;
                    } else {
                        matcher._unitedArea = matcher._unitedArea.united(newRect);
                    }
                }
            }
            matcher._rects.length = index;
            if (matcher._rects.length == 0) {
                matcher = null;
            }
        }

        this.reset();

        return matcher;
    };

    /**
     * Simply reset this dirty list
     * @version 1.0
     */
    IFDirtyList.prototype.reset = function () {
        if (this._numDirties > 0) {
            // Clear ourself
            this._dirties.length = IFDirtyList.options.bufferSize;
            this._numDirties = 0;
        }
    };

    /** @override */
    IFDirtyList.prototype.toString = function () {
        return "[Object IFDirtyList]";
    };

    _.IFDirtyList = IFDirtyList;
})(this);