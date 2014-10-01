(function (_) {

    /**
     * A polygon shape
     * @class IFMegaPath
     * @extends IFShape
     * @constructor
     */
    function IFMegaPath() {
        IFShape.call(this);

        // Add anchor paths
        this._anchorPaths = new IFMegaPath.AnchorPaths();
        this.appendChild(this._anchorPaths);
        this._anchorPaths._setScene(this._scene);
        this._anchorPaths._removalAllowed = false;
    }

    IFNode.inherit("megapath", IFMegaPath, IFShape);

    // -----------------------------------------------------------------------------------------------------------------
    // IFMegaPath.AnchorPaths Class
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * @class IFMegaPath.AnchorPaths
     * @extends IFNode
     * @mixes IFNode.Container
     * @constructor
     */
    IFMegaPath.AnchorPaths = function () {
    };
    IFObject.inheritAndMix(IFMegaPath.AnchorPaths, IFNode, [IFNode.Container]);

    /**
     * Used to disallow anchor paths removal
     * @type {Boolean}
     * @private
     */
    IFMegaPath.AnchorPaths.prototype._removalAllowed = false;

    /** @override */
    IFMegaPath.AnchorPaths.prototype.validateInsertion = function (parent, reference) {
        return parent instanceof IFMegaPath;
    };

    /** @override */
    IFMegaPath.AnchorPaths.prototype.validateRemoval = function () {
        return this._removalAllowed ? this._removalAllowed : false;
    };

    /**
     * Serializes all points into a stream array
     * @return {Array<*>}
     */
    IFMegaPath.AnchorPaths.prototype.serialize = function () {
        var stream = [];
        for (var pt = this.getFirstChild(); pt !== null; pt = pt.getNext()) {
            stream.push(IFNode.serialize(pt));
        }
        return stream;
    };

    /**
     * Deserializes all points from a stream array
     * @param {Array<*>} stream
     */
    IFMegaPath.AnchorPaths.prototype.deserialize = function (stream) {
        for (var i = 0; i < stream.length; ++i) {
            //var pt = new IFPath();
            var pt = IFNode.deserialize(stream[i]);
            this.appendChild(pt);
        }
    };

    IFMegaPath.AnchorPaths.prototype._handleChange = function (change, args) {
        var megaPath = this._parent;

        if (megaPath  && (change == IFElement._Change.ChildGeometryUpdate)) {
            // Notify MegaPath parent about the change
            megaPath._notifyChange(IFElement._Change.PrepareGeometryUpdate);
            megaPath.rewindVertices(0);
            megaPath._notifyChange(IFElement._Change.FinishGeometryUpdate);
        }

        IFNode.prototype._handleChange.call(this, change, args);
    };


    /** @override */
    IFMegaPath.AnchorPaths.prototype.toString = function () {
        return "[Object IFMegaPath.AnchorPaths]";
    };

    // -----------------------------------------------------------------------------------------------------------------
    // IFMegaPath Class
    // -----------------------------------------------------------------------------------------------------------------

    IFMegaPath.prototype._anchorPaths = null;
    IFMegaPath.prototype._currentPath = null;

    /** @override */
    IFMegaPath.prototype.rewindVertices = function (index) {
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
    IFMegaPath.prototype.readVertex = function (vertex) {
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
     * Return the anchor paths of the mega-path
     * @returns {IFMegaPath.AnchorPaths}
     */
    IFMegaPath.prototype.getAnchorPaths = function () {
        return this._anchorPaths;
    };

    /** @override */
    IFMegaPath.prototype._handleChange = function (change, args) {
        if (change == IFNode._Change.AfterFlagChange) {
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
        if (change === IFNode._Change.Store) {
            args.paths = this._anchorPaths.serialize();
        } else if (change === IFNode._Change.Restore) {
            if (args.hasOwnProperty('paths')) {
                this._anchorPaths.deserialize(args.paths);
            }
        }
        IFShape.prototype._handleChange.call(this, change, args);
    };

    /** @override */
    IFMegaPath.prototype.setTransform = function (transform) {
        this.setProperty('trf', transform);
        for (var pt = this._anchorPaths.getFirstChild(); pt != null; pt = pt.getNext()) {
            pt.setTransform(transform);
        }
    };

    /** @override */
    IFMegaPath.prototype.transform = function (transform) {
        if (transform && !transform.isIdentity()) {
            this.setProperty('trf', this.$trf ? this.$trf.multiplied(transform) : transform);
            for (var pt = this._anchorPaths.getFirstChild(); pt != null; pt = pt.getNext()) {
                pt.transform(transform);
            }
        }
    };

    /** @override */
 /*   IFMegaPath.prototype.hitTest = function (location, transform, acceptor, stacked, level, tolerance, force) {
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
    IFMegaPath.prototype.toString = function () {
        return "[IFMegaPath]";
    };

    _.IFMegaPath = IFMegaPath;
})(this);
