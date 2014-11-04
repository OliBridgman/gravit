(function (_) {

    /**
     * A polygon shape
     * @class GCompoundPath
     * @extends GShape
     * @constructor
     */
    function GCompoundPath(evenOdd) {
        GShape.call(this);

        this._setDefaultProperties(GCompoundPath.VisualProperties);
        if (!!evenOdd) {
            this.$evenodd = evenOdd;
        }

        // Add anchor paths
        this._anchorPaths = new GCompoundPath.AnchorPaths();
        this.appendChild(this._anchorPaths);
        this._anchorPaths._setScene(this._scene);
        this._anchorPaths._removalAllowed = false;
    }

    GNode.inherit("compoundpath", GCompoundPath, GShape);

    /**
     * The visual properties of a compound path with their default values
     */
    GCompoundPath.VisualProperties = {
        /** Even-Odd fill */
        evenodd: false
    };

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

        if (compoundPath) {
            switch (change) {
                case GNode._Change.BeforeChildRemove:
                case GNode._Change.BeforeChildInsert:
                    compoundPath._notifyChange(GElement._Change.PrepareGeometryUpdate);
                    break;

                case GNode._Change.AfterChildRemove:
                case GNode._Change.AfterChildInsert:
                    compoundPath.rewindVertices(0);
                    compoundPath._notifyChange(GElement._Change.FinishGeometryUpdate);
                    break;

                case GElement._Change.ChildGeometryUpdate:
                    compoundPath._notifyChange(GElement._Change.PrepareGeometryUpdate);
                    compoundPath.rewindVertices(0);
                    compoundPath._notifyChange(GElement._Change.FinishGeometryUpdate);
                    break;
            }
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
        this._handleVisualChangeForProperties(change, args, GCompoundPath.VisualProperties);
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
            this.storeProperties(args, GCompoundPath.VisualProperties);
            args.paths = this._anchorPaths.serialize();
        } else if (change === GNode._Change.Restore) {
            this.restoreProperties(args, GCompoundPath.VisualProperties);
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
        this.beginUpdate();
        try {
            GShape.prototype.transform.call(this, transform);
            if (transform && !transform.isIdentity()) {
                for (var pt = this._anchorPaths.getFirstChild(); pt != null; pt = pt.getNext()) {
                    pt.transform(transform);
                }
            }
        } finally {
            this.endUpdate();
        }
    };

    /** @override */
    GCompoundPath.prototype._calculateGeometryBBox = function () {
        // Sum up our anchor pathes
        var result = null;
        for (var node = this._anchorPaths.getFirstChild(); node != null; node = node.getNext()) {
            var childBBox = node.getGeometryBBox();
            if (childBBox && !childBBox.isEmpty()) {
                result = result ? result.united(childBBox) : childBBox;
            }
        }
        return result ? result : null;
    };

    /** @override */
    GCompoundPath.prototype._isEvenOddFill = function () {
        return !!this.$evenodd;
    };

    /** @override */
    GCompoundPath.prototype.toString = function () {
        return "[GCompoundPath]";
    };

    _.GCompoundPath = GCompoundPath;
})(this);
