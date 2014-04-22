(function (_) {
    /**
     * @class GXVertexOffsetter
     * @extends GXVertexSource
     * @param {GXVertexSource} source the underyling vertex source to work on
     * @param {Number} offset
     * @param {Boolean} inset
     * @param {Boolean} outset
     * @version 1.0
     * @constructor
     */
    function GXVertexOffsetter(source, offset, inset, outset) {
        this._source = source;
        this.generatePolyLine();
        this.generatePolyOffset(inset, outset);
        this.generateOffset(inset, outset);
    }

    GObject.inherit(GXVertexOffsetter, GXVertexSource);

    /**
     * @type {GXVertexSource}
     * @private
     */
    GXVertexOffsetter.prototype._source = null;

    GXVertexOffsetter.prototype._polyline = null;
    GXVertexOffsetter.prototype._polyinset = null;
    GXVertexOffsetter.prototype._polyoutset = null;
    GXVertexOffsetter.prototype._inset = null;

    GXVertexOffsetter.prototype._outset = null;

    /** @override */
    GXVertexOffsetter.prototype.rewindVertices = function (index) {
        if (index != 0) {
            return false;
        }
        if (this._inset) {
            this._inset.rewindVertices(0);
        }
        if (this._outset) {
            this._outset.rewindVertices(0);
        }
        return this._source.rewindVertices(0);
    };

    /** override */
    GXVertexOffsetter.prototype.readVertex = function (vertex) {

    };

    GXVertexOffsetter.prototype.generatePolyLine = function () {
        if (!this._source.rewindVertices(0)) {
            return;
        }

        // The following documents will be used to approximate a bezier curve with polyline
        // (a combination of linear segments and circular arcs):
        //
        // 1. Fast, precise flattening of cubic Be´zier path and offset curves
        // Thomas F. Hain,Athar L. Ahmad, Sri Venkat R. Racherla, David D. Langan, 2005
        //
        // 2. Approximation of a planar cubic Bezier spiral by circular arcs
        // D.J. Walton, D.S. Meek, 1996
        //
        // 3. Generalization of Approximation of Planar Spiral Segments by Arc Splines
        // Lan Chen, 1998
        //
        // 4. APPROXIMATION OF A CUBIC BEZIER CURVE BY CIRCULAR ARCS AND VICE VERSA
        // A. Riškus, 2006
        //
        // 5. Modeling of Bézier Curves Using a Combination of Linear and Circular Arc Approximations
        // P. Kaewsaiha, N. Dejdumrong, 2012

    };

    GXVertexOffsetter.prototype.generatePolyOffset = function (inset, outset) {
        // An offset algorithm for polyline curves
        // Xu-Zheng Liu, Jun-Hai Yong, Guo-Qin Zheng, Jia-Guang Sun, 2006

    };

    GXVertexOffsetter.prototype.generateOffset = function (inset, outset) {
        // Approximation of circular arcs and offset curves by Bezier curves of high degree
        // Young Joon Ahn, Yeon soo Kim, Youngsuk Shin, 2004
        // ...
    };

    /** @override */
    GXVertexOffsetter.prototype.toString = function () {
        return "[Object GXVertexOffsetter]";
    };

    _.GXVertexOffsetter = GXVertexOffsetter;
})(this);