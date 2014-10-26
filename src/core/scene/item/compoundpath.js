(function (_) {

    /**
     * A polygon shape
     * @class GCompoundPath
     * @extends GShape
     * @constructor
     */
    function GCompoundPath() {
        GShape.call(this);

        // Add anchor paths
        this._anchorPaths = new GCompoundPath.AnchorPaths();
        this.appendChild(this._anchorPaths);
        this._anchorPaths._setScene(this._scene);
        this._anchorPaths._removalAllowed = false;
    }

    GNode.inherit("compoundpath", GCompoundPath, GShape);

    // -----------------------------------------------------------------------------------------------------------------
    // GCompoundPath.AnchorPaths Class
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * @class GCompoundPath.AnchorPaths
     * @extends GNode
     * @mixes GNode.Container
     * @constructor
     */
    GCompoundPath.AnchorPaths = function () {
    };
    GObject.inheritAndMix(GCompoundPath.AnchorPaths, GNode, [GNode.Container]);

    /**
     * Used to disallow anchor paths removal
     * @type {Boolean}
     * @private
     */
    GCompoundPath.AnchorPaths.prototype._removalAllowed = false;

    /** @override */
    GCompoundPath.AnchorPaths.prototype.validateInsertion = function (parent, reference) {
        return parent instanceof GCompoundPath;
    };

    /** @override */
    GCompoundPath.AnchorPaths.prototype.validateRemoval = function () {
        return this._removalAllowed ? this._removalAllowed : false;
    };

    /**
     * Serializes all points into a stream array
     * @return {Array<*>}
     */
    GCompoundPath.AnchorPaths.prototype.serialize = function () {
        var stream = [];
        for (var pt = this.getFirstChild(); pt !== null; pt = pt.getNext()) {
            stream.push(GNode.serialize(pt));
        }
        return stream;
    };

    /**
     * Deserializes all points from a stream array
     * @param {Array<*>} stream
     */
    GCompoundPath.AnchorPaths.prototype.deserialize = function (stream) {
        for (var i = 0; i < stream.length; ++i) {
            //var pt = new GPath();
            var pt = GNode.deserialize(stream[i]);
            this.appendChild(pt);
        }
    };

    GCompoundPath.AnchorPaths.prototype._handleChange = function (change, args) {
        var compoundPath = this._parent;

        if (compoundPath  && (change == GElement._Change.ChildGeometryUpdate)) {
            // Notify compoundPath parent about the change
            compoundPath._notifyChange(GElement._Change.PrepareGeometryUpdate);
            compoundPath.rewindVertices(0);
            compoundPath._notifyChange(GElement._Change.FinishGeometryUpdate);
        }

        GNode.prototype._handleChange.call(this, change, args);
    };


    /** @override */
    GCompoundPath.AnchorPaths.prototype.toString = function () {
        return "[Object GCompoundPath.AnchorPaths]";
    };

    // -----------------------------------------------------------------------------------------------------------------
    // GCompoundPath Class
    // -----------------------------------------------------------------------------------------------------------------

    GCompoundPath.prototype._anchorPaths = null;
    GCompoundPath.prototype._currentPath = null;

    /** @override */
    GCompoundPath.prototype.rewindVertices = function (index) {
        this._currentPath = this._anchorPaths.getFirstChild();
        if (index === 0 && this._currentPath) {
            for (var pt = this._currentPath; pt != null; pt = pt.getNext()) {
                pt.rewindVertices(0);
            }
            return true;
        }

        return false;
    };

    /** @override */
    GCompoundPath.prototype.readVertex = function (vertex) {
        if (this._currentPath) {
            if (this._currentPath.readVertex(vertex)) {
                return true;
            } else {
                this._currentPath = this._currentPath.getNext();
                return this._currentPath && this._currentPath.readVertex(vertex);
            }
        }
        return false;
    };

    /**
     * Return the anchor paths of the compound path
     * @returns {GCompoundPath.AnchorPaths}
     */
    GCompoundPath.prototype.getAnchorPaths = function () {
        return this._anchorPaths;
    };

    /** @override */
    GCompoundPath.prototype._handleChange = function (change, args) {
        if (change == GNode._Change.AfterFlagChange) {
            var flagArgs = args;
            this._currentPath = this._anchorPaths.getFirstChild();
            if (flagArgs.set == true) {
                for (var pt = this._currentPath; pt != null; pt = pt.getNext()) {
                    pt.setFlag(flagArgs.flag);
                }
            } else {
                for (var pt = this._currentPath; pt != null; pt = pt.getNext()) {
                    pt.removeFlag(flagArgs.flag);
                }
            }
        }
        if (change === GNode._Change.Store) {
            args.paths = this._anchorPaths.serialize();
        } else if (change === GNode._Change.Restore) {
            if (args.hasOwnProperty('paths')) {
                this._anchorPaths.deserialize(args.paths);
            }
        }
        GShape.prototype._handleChange.call(this, change, args);
    };

    /** @override */
    GCompoundPath.prototype.setTransform = function (transform) {
        this.setProperty('trf', transform);
        for (var pt = this._anchorPaths.getFirstChild(); pt != null; pt = pt.getNext()) {
            pt.setTransform(transform);
        }
    };

    /** @override */
    GCompoundPath.prototype.transform = function (transform) {
        if (transform && !transform.isIdentity()) {
            this.setProperty('trf', this.$trf ? this.$trf.multiplied(transform) : transform);
            for (var pt = this._anchorPaths.getFirstChild(); pt != null; pt = pt.getNext()) {
                pt.transform(transform);
            }
        }
    };

    /** @override */
 /*   GCompoundPath.prototype.hitTest = function (location, transform, acceptor, stacked, level, tolerance, force) {
        if (typeof level !== 'number') level = -1; // unlimited deepness
        tolerance = tolerance || 0;

        // Quick-Test -> if location doesn't fall into our bounding-area
        // or we don't have a bounding area, then we can certainly not
        // have any hit at all. We'll however extend our paint bbox by
        // the pick distance to provide better pick-up of objects
        var paintBBox = this.getPaintBBox();
        if (!paintBBox || paintBBox.isEmpty()) {
            return null;
        }
        if (transform) {
            paintBBox = transform.mapRect(paintBBox);
        }

        if (!paintBBox.expanded(tolerance, tolerance, tolerance, tolerance).containsPoint(location)) {
            return null;
        }

        var result = null;

        // We might have a possible hit so iterate our children if any
        for (var pt = this._anchorPaths.getFirstChild(); pt != null; pt = pt.getNext()) {
            var subResult = pt.hitTest(location, transform, acceptor, stacked, level - 1, tolerance, force);
            if (subResult) {
                if (stacked) {
                    if (result) {
                        Array.prototype.push.apply(result, subResult);
                    } else {
                        result = subResult;
                    }
                } else {
                    return subResult;
                }
            }
        }

        return result;
    };      */

    /** @override */
    GCompoundPath.prototype.toString = function () {
        return "[GCompoundPath]";
    };

    _.GCompoundPath = GCompoundPath;
})(this);
