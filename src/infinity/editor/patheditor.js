(function (_) {
    /**
     * An editor for a path
     * @param {GXPath} path the path this editor works on
     * @class GXPathEditor
     * @extends GXPathBaseEditor
     * @constructor
     */
    function GXPathEditor(path) {
        GXPathBaseEditor.call(this, path);

        // Add all selected anchor points into our part selection if there're any
        var selectedAnchorPoints = path.getAnchorPoints().queryAll(':selected');
        for (var i = 0; i < selectedAnchorPoints.length; ++i) {
            if (!this._partSelection) {
                this._partSelection = [];
            }
            this._partSelection.push({type: GXPathEditor.PartType.Point, point: selectedAnchorPoints[i]});
        }
    };
    GObject.inherit(GXPathEditor, GXPathBaseEditor);
    GXElementEditor.exports(GXPathEditor, GXPath);

    /**
     * Type of path an editor part
     * @enum
     */
    GXPathEditor.PartType = {
        Segment: 1,
        Point: 2,
        LeftHandle: 3,
        RightHandle: 4,
        LeftShoulder: 5,
        RightShoulder: 6
    };

    /**
     * Type of additional data of segment part
     * @enum
     */
    GXPathEditor.SegmentData = {
        HitRes : 1,
        Handles: 2
    };

    // -----------------------------------------------------------------------------------------------------------------
    // GXPathEditor Class
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * Mapping of source point indices (key) to preview point indices (value)
     * @type {*}
     * @private
     */
    GXPathEditor.prototype._sourceIndexToPreviewIndex = null;

    /** @override */
    GXPathEditor.prototype.getBBox = function (transform) {
        var bbox = GXPathBaseEditor.prototype.getBBox.call(this, transform);
        if (this._showAnnotations()) {
            // Pre-multiply internal transformation if any
            if (this._transform) {
                transform = transform.multiplied(this._transform);
            }

            var _addToBBox = function (other) {
                if (other && !other.isEmpty()) {
                    bbox = bbox ? bbox.united(other) : other;
                }
            };

            this._iteratePoints(true, function (args) {
                // Handles
                if (args.leftHandlePosition) {
                    _addToBBox(this._getAnnotationBBox(transform, args.leftHandlePosition, true));
                }
                if (args.rightHandlePosition) {
                    _addToBBox(this._getAnnotationBBox(transform, args.rightHandlePosition, true));
                }

                // Shoulders
                if (args.leftShoulderPosition) {
                    _addToBBox(this._getAnnotationBBox(transform, args.leftShoulderPosition, true));
                }
                if (args.rightShoulderPosition) {
                    _addToBBox(this._getAnnotationBBox(transform, args.rightShoulderPosition, true));
                }

                // Point
                _addToBBox(this._getAnnotationBBox(transform, args.position, true));
            }.bind(this));

            return bbox;
        } else {
            return bbox;
        }
    };


    /** @override */
    GXPathEditor.prototype.movePart = function (partId, partData, position, ratio) {
        this.requestInvalidation();
        this._createPathPreviewIfNecessary(partId.point);

        switch (partId.type) {
            case GXPathEditor.PartType.LeftHandle:
                this._movePreviewPointCoordinates(partId.point, 'hlx', 'hly', position, ratio);
                break;
            case GXPathEditor.PartType.RightHandle:
                this._movePreviewPointCoordinates(partId.point, 'hrx', 'hry', position, ratio);
                break;
            case GXPathEditor.PartType.LeftShoulder:
            case GXPathEditor.PartType.RightShoulder:
                this._movePreviewPointShoulders(partId, position, ratio);
                break;
        }

        this.requestInvalidation();
    };

    /** @override */
    GXPathEditor.prototype.resetPartMove = function (partId, partData) {
        this.releasePathPreview();
        this.requestInvalidation();
    };

    /** @override */
    GXPathEditor.prototype.applyPartMove = function (partId, partData) {
        switch (partId.type) {
            case GXPathEditor.PartType.LeftHandle:
                this._assignPreviewPointPropertiesToSourcePoint(partId.point, ['hlx', 'hly', 'ah']);
                break;
            case GXPathEditor.PartType.RightHandle:
                this._assignPreviewPointPropertiesToSourcePoint(partId.point, ['hrx', 'hry', 'ah']);
                break;
            case GXPathEditor.PartType.LeftShoulder:
                this._assignPreviewPointPropertiesToSourcePoint(partId.point, ['cl']);
                break;
            case GXPathEditor.PartType.RightShoulder:
                this._assignPreviewPointPropertiesToSourcePoint(partId.point, ['cr']);
                break;
        }
        this.resetPartMove(partId, partData);
    };

    /** @override */
    GXPathEditor.prototype.transform = function (transform, partId, partData) {
        if (this._partSelection && this._partSelection.length > 0) {
            this.requestInvalidation();
            this._createPathPreviewIfNecessary();

            // If current partId is a segment, move segment and other selected points
            // like freehand does, otherwise move all selected points
            // including the ones from segments

            // Iterate selection and transform all anchor points
            for (var i = 0; i < this._partSelection.length; ++i) {
                var selectedPartId = this._partSelection[i];
                //if (selectedPartId.point) {

                    if (selectedPartId.type === GXPathEditor.PartType.Point) {
                        var selectedPoint = selectedPartId.point;
                        this._transformPreviewPointCoordinates(selectedPoint, 'x', 'y', transform);

                        // Make sure to transform handles as well if not auto-handles are set
                        if (!selectedPoint.getProperty('ah')) {
                            if (selectedPoint.getProperty('hlx') != null && selectedPoint.getProperty('hly') != null) {
                                this._transformPreviewPointCoordinates(selectedPoint, 'hlx', 'hly', transform);
                            }
                            if (selectedPoint.getProperty('hrx') != null && selectedPoint.getProperty('hry') != null) {
                                this._transformPreviewPointCoordinates(selectedPoint, 'hrx', 'hry', transform);
                            }
                        }
                    } else if (selectedPartId.type === GXPathEditor.PartType.Segment &&
                            this._partIdAreEqual(selectedPartId, partId) &&
                            partData.type == GXPathEditor.SegmentData.Handles) {

                        var apLeftPreview = this.getPathPointPreview(selectedPartId.apLeft);
                        var apRightPreview = this.getPathPointPreview(selectedPartId.apRight);
                        var dPt = transform.getTranslation();
                        var apL = new GPoint(apLeftPreview.getProperty('x'), apLeftPreview.getProperty('y'));
                        var apR = new GPoint(apRightPreview.getProperty('x'), apRightPreview.getProperty('y'));

                        if (!partData.fixedHDirLpt && !partData.fixedHDirRpt){
                            // TODO: honor internal path transform here
                            var newTransform = transform.translated(
                                -dPt.getX() + dPt.getX() * partData.cL, -dPt.getY() + dPt.getY() * partData.cL);

                            this._transformPreviewPointCoordinates(
                                selectedPartId.apLeft, 'hrx', 'hry', newTransform, partData.apLhr);

                            var newTransform = transform.translated(
                                -dPt.getX() + dPt.getX() * partData.cR, -dPt.getY() + dPt.getY() * partData.cR);

                            this._transformPreviewPointCoordinates(
                                selectedPartId.apRight, 'hlx', 'hly', newTransform, partData.apRhl);
                        } else if (partData.fixedHDirLpt && partData.fixedHDirRpt) {
                            // dx = k1 * H1.x + k2 * H2.x
                            // dy = k1 * H1.y + k2 * H2.y
                            // H1 = coeff1 * dh1, H2 = coeff2 * dh2, k1, k2 - ?

                            var dx = dPt.getX();
                            var dy = dPt.getY();
                            var dh1 = partData.apLhr.subtract(apL);
                            var dh2 = partData.apRhl.subtract(apR);
                            var h1x = partData.cL * dh1.getX();
                            var h1y = partData.cL * dh1.getY();
                            var h2x = partData.cR * dh2.getX();
                            var h2y = partData.cR * dh2.getY();
                            var kPair = gMath.solveLinear2Pseudo(h1x, h2x, dx, h1y, h2y, dy);
                            if (kPair === null) { // don't modify handles
                                kPair = new GPoint(0, 0);
                            }

                            var newTransform = transform.translated(
                                -dPt.getX() + dh1.getX() * kPair.getX(),
                                -dPt.getY() + dh1.getY() * kPair.getX());

                            this._transformPreviewPointCoordinates(
                                selectedPartId.apLeft, 'hrx', 'hry', newTransform, partData.apLhr);

                            var newTransform = transform.translated(
                                -dPt.getX() + dh2.getX() * kPair.getY(),
                                -dPt.getY() + dh2.getY() * kPair.getY());

                            this._transformPreviewPointCoordinates(
                                selectedPartId.apRight, 'hlx', 'hly', newTransform, partData.apRhl);
                        } else {
                            // For one new handle and one existed:
                            //      Exact policy of FreeHand looks to be buggy and is not defined, lets try this:
                            // 1. Convert second-order Bezier curve into third-order Bezier curve so that zero
                            //      zero movement don't change the curve :
                            //      CP0 = QP0, CP1 = QP0 + 2/3*(QP1 - QP0), CP2 = QP2 - 2/3*(QP1 - QP2), CP3 = QP2
                            // 2. Make the projection of movement into existing handle with the coefficient 1 / (a1 + a2)
                            //       to the pre-existing handle (let's consider CP1)
                            //       for curve CP = (1-t)^3*CP0 + 3*(1-t)^2*t*CP1 + 3*(1-t)*t^2*CP2 + t^3*CP3 =
                            //       = a0*CP0 + a1*CP1 + a2*CP2 + a3*CP3
                            //       CP1' = CP1 + 1/(a1+a2)*pr_CP1(dx, dy)
                            // 3. Then the second handle should go into:
                            //       CP2' = CP2 +
                            //  + (1/a2 * dx - a1/(a2*(a1 + a2)) * pr_CP1x, 1/a2 * dy - a1/(a2*(a1 + a2)) * pr_CP1y)

                            // Setting the described way CP1' and CP2' will make what is needed: CP' = CP + (dx, dy)

                            var dx = dPt.getX();
                            var dy = dPt.getY();
                            var tmpC = 1 / (partData.cL + partData.cR);

                            if (partData.fixedHDirLpt && !partData.fixedHDirRpt) {
                                var prPt = gMath.getVectorProjection(apL.getX(), apL.getY(),
                                    partData.apLhr.getX(), partData.apLhr.getY(),
                                    apL.getX() + dx, apL.getY() + dy);
                                var prDPt = prPt.subtract(apL);

                                var dh1x = tmpC * prDPt.getX();
                                var dh1y = tmpC * prDPt.getY();
                                var dh2x = dx / partData.cR - partData.cL / partData.cR * dh1x;
                                var dh2y = dy / partData.cR - partData.cL / partData.cR * dh1y;
                            } else { // !partData.fixedHDirLpt && partData.fixedHDirRpt
                                var prPt = gMath.getVectorProjection(apR.getX(), apR.getY(),
                                    partData.apRhl.getX(), partData.apRhl.getY(),
                                    apR.getX() + dx, apR.getY() + dy);
                                var prDPt = prPt.subtract(apR);
                                var dh2x = tmpC * prDPt.getX();
                                var dh2y = tmpC * prDPt.getY();
                                var dh1x = dx / partData.cL - partData.cR / partData.cL * dh2x;
                                var dh1y = dy / partData.cL - partData.cR / partData.cL * dh2y;
                            }
                            var newTransform = transform.translated(-dPt.getX() + dh1x, -dPt.getY() + dh1y);

                            this._transformPreviewPointCoordinates(
                                selectedPartId.apLeft, 'hrx', 'hry', newTransform, partData.apLhr);

                            var newTransform = transform.translated(-dPt.getX() + dh2x, -dPt.getY() + dh2y);

                            this._transformPreviewPointCoordinates(
                                selectedPartId.apRight, 'hlx', 'hly', newTransform, partData.apRhl);
                        }
                    }
               //}
            }

            this.requestInvalidation();
        } else {
            GXPathBaseEditor.prototype.transform.call(this, transform, partId, partData);
        }
    };

    /** @override */
    GXPathEditor.prototype.resetTransform = function () {
        this.releasePathPreview();

        // Need to invalidate if not having the outline flag
        // which will be removed in the super call and make
        // the invalidation, instead
        if (!this.hasFlag(GXElementEditor.Flag.Outline)) {
            this.requestInvalidation();
        }

        GXPathBaseEditor.prototype.resetTransform.call(this);
    };

    /** @override */
    GXPathEditor.prototype.applyTransform = function (element) {
        if (this._partSelection && this._partSelection.length > 0) {
            var newSelection = [];
            // Iterate selection and apply changes in preview anchor points
            for (var i = 0; i < this._partSelection.length; ++i) {
                var part = this._partSelection[i];
                if (part.type === GXPathEditor.PartType.Point) {
                    this._transferPreviewProperties(part.point, element);
                    newSelection.push(part);
                } else if (part.type === GXPathEditor.PartType.Segment) {
                    this._transferPreviewProperties(part.apLeft, element);
                    this._transferPreviewProperties(part.apRight, element);
                    // Update now _partSelection to contain segment end points instead of segment itself
                    newSelection.push({type: GXPathEditor.PartType.Point, point: part.apLeft});
                    newSelection.push({type: GXPathEditor.PartType.Point, point: part.apRight});
                }
            }
            this.resetTransform();
            this.updatePartSelection(false, newSelection);
        } else {
            GXPathBaseEditor.prototype.applyTransform.call(this, element);
        }
    };

    /** @override */
    GXPathEditor.prototype.subSelectDragStartAction = function (partInfo) {
        if (partInfo.editor !== this) {
            return null;
        }

        // When Path point is started to be moved with subselect, the options are:
        // a) if a point was not selected - it gets selected and drag it
        // b) if a point was selected and didn't have right handle - create right handle
        // c) if a point was selected and had the right handle, but not the left handle - create the left handle
        // d) if a point was selected and had both handles - drag the point together with other selected points

        var newPartInfo = partInfo;
        if (!partInfo.isolated && partInfo.id.type == GXPathEditor.PartType.Point) {
            var aPt = partInfo.id.point;
            var hlx = aPt.getProperty('hlx');
            var hly = aPt.getProperty('hly');
            var hrx = aPt.getProperty('hrx');
            var hry = aPt.getProperty('hry');
            // check option a)
            if (!partInfo.data.apSelected || !aPt.hasFlag(GXNode.Flag.Selected)) {
                // anchor point should be already selected, but it was not so at the moment of getting the part info

                if (!aPt.hasFlag(GXNode.Flag.Selected)) { // might be some error, select a point
                    this.selectOnePoint(aPt);
                }
                newPartInfo = new GXElementEditor.PartInfo(
                    this, {type: GXPathEditor.PartType.Point, point: aPt}, {apSelected: true}, isolated, selectable);
            } else if (hlx === null || hly === null || hrx === null || hry === null) { // option b) or c)
                this.requestInvalidation();
                this._createPathPreviewIfNecessary(aPt);
                var previewPoint = this.getPathPointPreview(aPt);
                if (!previewPoint) {   // might be some error
                    newPartInfo = null;
                } else {
                    var partType = null;
                    var isolated = true; // all is isolated except points
                    var selectable = false; // only point is selectable

                    if (hrx === null || hry === null) {
                        // option b)
                        partType = GXPathEditor.PartType.RightHandle;
                        previewPoint.setProperties(
                            ['ah', 'hrx', 'hry'], [false, aPt.getProperty('x'), aPt.getProperty('y')]);
                    } else { // hlx === null || hly === null
                        // option c)
                        partType = GXPathEditor.PartType.LeftHandle;
                        previewPoint.setProperties(
                            ['ah', 'hlx', 'hly'], [false, aPt.getProperty('x'), aPt.getProperty('y')]);
                    }

                    newPartInfo = new GXElementEditor.PartInfo(
                        this, {type: partType, point: aPt}, {apSelected: true}, isolated, selectable);

                    this.updatePartSelection(true, [newPartInfo.id]);
                }
            } // else option d) - NOOP
        } else if (partInfo.id.type == GXPathEditor.PartType.Segment) {
            var pathHitResult = partInfo.data.hitRes;
            var apLeft = partInfo.id.apLeft;
            var apRight = partInfo.id.apRight;
            if (apLeft && apRight) {
                this.requestInvalidation();
                this._createPathPreviewIfNecessary();
                var apLeftPreview = this.getPathPointPreview(apLeft);
                var apRightPreview = this.getPathPointPreview(apRight);
                if (!apLeftPreview || !apRightPreview) {   // might be some error
                    newPartInfo = null;
                } else {
                    var apLeftX = apLeft.getProperty('x');
                    var apLeftY = apLeft.getProperty('y');
                    var apRightX = apRight.getProperty('x');
                    var apRightY = apRight.getProperty('y');

                    if ((apLeft.getProperty('hrx') === null || apLeft.getProperty('hry') === null) &&
                        (apRight.getProperty('hlx') === null || apRight.getProperty('hly') === null)) {

                        // When Path segment is drag with SubSelect Tool:
                        // If handles are newly created:
                        //      both handles should have the overall length 2/3 from segment length
                        //      a mouse point should divide the distance between handle points in the same proportion as between segment ends
                        //      after movement starts handle end points move synchronously
                        //      after movement starts mouse position defines a point through which should go curve tangent line,
                        // which oriented the same as original segment
                        // To get newly created handles:
                        //      for catch point between handles y position: hdy = dy (mouse) * 4 / 3
                        //      for catch point between handles x position: hdx = dx * 4 / 3

                        var handlesDx = (apRightX - apLeftX) / 3;
                        var handlesDy = (apRightY - apLeftY) / 3;
                        var leftHDx = handlesDx * pathHitResult.slope;
                        var rightHDx = handlesDx - leftHDx;
                        var leftHDy = handlesDy * pathHitResult.slope;
                        var rightHDy = handlesDy - leftHDy;
                        var hrx = pathHitResult.x - leftHDx;
                        var hry = pathHitResult.y - leftHDy;

                        apLeftPreview.setProperties(['ah', 'hrx', 'hry'],
                            [false, pathHitResult.x - leftHDx, pathHitResult.y - leftHDy]);

                        var hlx = pathHitResult.x + rightHDx;
                        var hly = pathHitResult.y + rightHDy;
                        apRightPreview.setProperties(['ah', 'hlx', 'hly'],
                            [false, pathHitResult.x + rightHDx, pathHitResult.y + rightHDy]);
                        this.requestInvalidation();

                        newPartInfo = new GXElementEditor.PartInfo(
                            this, {type: GXPathEditor.PartType.Segment, point: null, apLeft: apLeft, apRight: apRight},
                            {type: GXPathEditor.SegmentData.Handles,
                                cL : 4 / 3, apLhr: new GPoint(hrx, hry), fixedHDirLpt: false,
                                cR : 4 / 3, apRhl : new GPoint(hlx, hly), fixedHDirRpt: false},
                            null, false, true);

                    } else if (apLeft.getProperty('hrx') === null || apLeft.getProperty('hry') === null) {
                        // For one new handle and one existed:
                        //      Exact policy of FreeHand looks to be buggy and is not defined, lets try this:
                        // 1. Convert second-order Bezier curve into third-order Bezier curve so that zero
                        //      zero movement don't change the curve :
                        //      CP0 = QP0, CP1 = QP0 + 2/3*(QP1 - QP0), CP2 = QP2 + 2/3*(QP1 - QP2), CP3 = QP2
                        // 2. Make the projection of movement into existing handle with the coefficient 1 / (a1 + a2)
                        //       to the pre-existing handle (let's consider CP1)
                        //       for curve CP = (1-t)^3*CP0 + 3*(1-t)^2*t*CP1 + 3*(1-t)*t^2*CP2 + t^3*CP3 =
                        //       = a0*CP0 + a1*CP1 + a2*CP2 + a3*CP3
                        //       CP1' = CP1 + 1/(a1+a2)*pr_CP1(dx, dy)
                        // 3. Then the second handle should go into:
                        //       CP2' = CP2 + (1/a2 * dx - a1/(a2*(a1 + a2)) * pr_CP1x, 1/a2 * dy - a1/(a2*(a1 + a2)) * pr_CP1y)
                        // Setting the described way CP1' and CP2' will make what is needed: CP' = CP + (dx, dy)

                        var hlx = apRightPreview.getProperty('hlx');
                        var hly = apRightPreview.getProperty('hly');
                        var hrx = apLeftX + 2 / 3 * (hlx - apLeftX);
                        var hry = apLeftY + 2 / 3 * (hly - apLeftY);
                        hlx = apRightX + 2 / 3 * (hlx - apRightX);
                        hly = apRightY + 2 / 3 * (hly - apRightY);
                        apLeftPreview.setProperties(['ah', 'hrx', 'hry'], [false, hrx, hry]);
                        apRightPreview.setProperties(['ah', 'hlx', 'hly'], [false, hlx, hly]);
                        this.requestInvalidation();

                        newPartInfo = new GXElementEditor.PartInfo(
                            this, {type: GXPathEditor.PartType.Segment, point: null, apLeft: apLeft, apRight: apRight},
                            {type: GXPathEditor.SegmentData.Handles,
                                cL : 3 * (1 - pathHitResult.slope) * (1 - pathHitResult.slope) * pathHitResult.slope,
                                apLhr: new GPoint(hrx, hry), fixedHDirLpt: false,
                                cR : 3 * pathHitResult.slope * pathHitResult.slope * (1 - pathHitResult.slope),
                                apRhl : new GPoint(hlx, hly), fixedHDirRpt: true},
                            false, true);
                    } else if (apRight.getProperty('hlx') === null || apRight.getProperty('hly') === null) {
                        var hrx = apLeftPreview.getProperty('hrx');
                        var hry = apLeftPreview.getProperty('hry');
                        var hlx = apRightX + 2 / 3 * (hrx - apRightX);
                        var hly = apRightY + 2 / 3 * (hry - apRightY);
                        hrx = apLeftX + 2 / 3 * (hrx - apLeftX);
                        hry = apLeftY + 2 / 3 * (hry - apLeftY);
                        apLeftPreview.setProperties(['ah', 'hrx', 'hry'], [false, hrx, hry]);
                        apRightPreview.setProperties(['ah', 'hlx', 'hly'], [false, hlx, hly]);
                        this.requestInvalidation();

                        newPartInfo = new GXElementEditor.PartInfo(
                            this, {type: GXPathEditor.PartType.Segment, point: null, apLeft: apLeft, apRight: apRight},
                            {type: GXPathEditor.SegmentData.Handles,
                                cL : 3 * (1 - pathHitResult.slope) * (1 - pathHitResult.slope) * pathHitResult.slope,
                                apLhr: new GPoint(hrx, hry), fixedHDirLpt: true,
                                cR : 3 * pathHitResult.slope * pathHitResult.slope * (1 - pathHitResult.slope),
                                apRhl : new GPoint(hlx, hly), fixedHDirRpt: false},
                            false, true);
                    } else { // both handles exist
                        // If both handles existed before, their orientation remains
                        // B(t) = (1-t)^3*B0 + 3*(1-t)^2*t*B1 + 3*(1-t)*t^2*B2 + t^3*B3
                        // dB(t) = 3*(1-t)^2*t*dB1 + 3*(1-t)*t^2*dB2
                        // dx = a1 * dB1.x + a2 * dB2.x
                        // dy = a1 * dB1.y + a2 * dB2.y
                        //
                        // dx = (k1 * a1 * h1 +  k2 * a2 * h2).x
                        // dy = (k1 * a1 * h1 + k2 * a2 * h2).y

                        apLeftPreview.setProperty('ah', false);
                        apRightPreview.setProperty('ah', false);
                        this.requestInvalidation();
                        var hrx = apLeftPreview.getProperty('hrx');
                        var hry = apLeftPreview.getProperty('hry');
                        var hlx = apRightPreview.getProperty('hlx');
                        var hly = apRightPreview.getProperty('hly');

                        newPartInfo = new GXElementEditor.PartInfo(
                            this, {type: GXPathEditor.PartType.Segment, point: null, apLeft: apLeft, apRight: apRight},
                            {type: GXPathEditor.SegmentData.Handles,
                                cL : 3 * (1 - pathHitResult.slope) * (1 - pathHitResult.slope) * pathHitResult.slope,
                                apLhr: new GPoint(hrx, hry), fixedHDirLpt: true,
                                cR : 3 * pathHitResult.slope * pathHitResult.slope * (1 - pathHitResult.slope),
                                apRhl : new GPoint(hlx, hly), fixedHDirRpt: true},
                            false, true);
                    }
                }
            } else {
                newPartInfo = null;
            }
        }

        return newPartInfo;
    };

    /** @override */
    GXPathEditor.prototype._detach = function () {
        // Ensure to de-select all selected anchor points when detaching
        for (var anchorPoint = this._element.getAnchorPoints().getFirstChild(); anchorPoint != null; anchorPoint = anchorPoint.getNext()) {
            anchorPoint.removeFlag(GXNode.Flag.Selected);
        }

        GXPathBaseEditor.prototype._detach.call(this);
    };

    /**
     * Hit-test anchor point's annotation
     * @param {GXPathBase.AnchorPoint} anchorPt - anchor point to hit-test
     * @param {GPoint} location
     * @param {GTransform} transform - a transformation to apply to anchor point's coordinates before hit-testing
     * @param {Boolean} strict - indicates when pick distance should not be used for anchor point hit-testing
     * @returns {boolean} the result of hit-test
     */
    GXPathEditor.prototype.hitAnchorPoint = function (anchorPt, location, transform, strict) {
        var res = false;
        if (anchorPt) {
            var transformToApply = this._element.getProperty('transform');
            if (transform) {
                transformToApply = transformToApply ? transformToApply.multiplied(transform) : transform;
            }
            if (strict) {
                res = this._getAnnotationBBox(
                        transformToApply, new GPoint(anchorPt.getProperty('x'), anchorPt.getProperty('y')), true)
                    .containsPoint(location);
            } else {
                var pickDist = this._element.getScene() ? this._element.getScene().getProperty('pickDist') / 2 : 1.5;
                res = this._getAnnotationBBox(
                        transformToApply, new GPoint(anchorPt.getProperty('x'), anchorPt.getProperty('y')), true)
                    .expanded(pickDist, pickDist, pickDist, pickDist)
                    .containsPoint(location);
            }
        }
        return res;
    };

    /** @override */
    GXPathEditor.prototype._getPartInfoAt = function (location, transform) {
        if (this._showAnnotations()) {
            var pickDist = this._element.getScene() ? this._element.getScene().getProperty('pickDist') / 2 : 1.5;
            var _isInAnnotationBBox = function (position, smallAnnotation) {
                if (position) {
                    return this._getAnnotationBBox(transform, position, smallAnnotation)
                        .expanded(pickDist, pickDist, pickDist, pickDist).containsPoint(location);
                } else {
                    return false;
                }
            }.bind(this);

            var result = null;

            this._iteratePoints(false, function (args) {
                var partType = null;
                var isolated = true; // all is isolated except points
                var selectable = false; // only point is selectable

                if (_isInAnnotationBBox(args.rightHandlePosition, true)) {
                    partType = GXPathEditor.PartType.RightHandle;
                } else if (_isInAnnotationBBox(args.leftHandlePosition, true)) {
                    partType = GXPathEditor.PartType.LeftHandle;
                } else if (_isInAnnotationBBox(args.rightShoulderPosition, true)) {
                    partType = GXPathEditor.PartType.RightShoulder;
                } else if (_isInAnnotationBBox(args.leftShoulderPosition, true)) {
                    partType = GXPathEditor.PartType.LeftShoulder;
                } else if (_isInAnnotationBBox(args.position, true)) {
                    partType = GXPathEditor.PartType.Point;
                    isolated = false;
                    selectable = true;
                }

                if (partType) {
                    result = new GXElementEditor.PartInfo(
                        this, {type: partType, point: args.anchorPoint},
                        {apSelected: args.anchorPoint.hasFlag(GXNode.Flag.Selected)}, isolated, selectable);
                    return true;
                }
            }.bind(this));

            if (result) {
                return result;
            } else if (this.hasFlag(GXElementEditor.Flag.Detail)) {
                // In detail mode we're able to select segments so hit test for one here
                var pathHitResult = this._element.detailHitTest(location, transform, false);
                if (pathHitResult) {
                    var hitRes = pathHitResult.data;
                    var apLeft = this._element.getAnchorPoints().getChildByIndex(hitRes.segment - 1);
                    var apRight = apLeft ? this._element.getAnchorPoints().getNextPoint(apLeft) : null;
                    return new GXElementEditor.PartInfo(
                        this, {type: GXPathEditor.PartType.Segment, point: null, apLeft : apLeft, apRight: apRight},
                        {type: GXPathEditor.SegmentData.HitRes, hitRes: pathHitResult.data}, false, true);
                }
                return null;
            }
        }

        return null;
    };

    /** @override */
    GXPathEditor.prototype._paintCustom = function (transform, context) {
        if (this._showAnnotations()) {
            this._iteratePoints(true, function (args) {
                // Paint handle(s)
                if (args.leftHandlePosition) {
                    this._paintHandle(transform, context, args.position, args.leftHandlePosition);
                }
                if (args.rightHandlePosition) {
                    this._paintHandle(transform, context, args.position, args.rightHandlePosition);
                }

                // Paint shoulders
                if (args.leftShoulderPosition) {
                    this._paintAnnotation(context, transform, args.leftShoulderPosition, GXElementEditor.Annotation.Diamond, false, true);
                }
                if (args.rightShoulderPosition) {
                    this._paintAnnotation(context, transform, args.rightShoulderPosition, GXElementEditor.Annotation.Diamond, false, true);
                }

                // Paint point annotation
                this._paintAnnotation(context, transform, args.position, args.annotation, args.anchorPoint.hasFlag(GXNode.Flag.Selected), true);
            }.bind(this));
        }
    };

    /** @override */
    GXPathEditor.prototype._partIdAreEqual = function (a, b) {
        var eqs = (a.type === b.type);
        if (eqs && a.type == GXPathEditor.PartType.Point) {
            eqs = (a.point === b.point);
        } else if (eqs && a.type == GXPathEditor.PartType.Segment) {
            eqs = (a.apLeft === b.apLeft && a.apRight == b.apRight);
        }
        return eqs;
    };

    /** @override */
    GXPathEditor.prototype._updatePartSelection = function (selection) {
        this.requestInvalidation();

        var newSelection = this._filterSelection(selection);

        // Iterate existing selection if any and deselect all anchor points
        // that are no longer in the new selection
        if (this._partSelection) {
            for (var i = 0; i < this._partSelection.length; ++i) {
                var part = this._partSelection[i];
                var isInNewSelection = false;

                if (newSelection) {
                    for (var k = 0; k < newSelection.length; ++k) {
                        if (newSelection[k].point === part.point && part.point ||
                            part.type == GXPathEditor.PartType.Segment && part.type == newSelection[k].type &&
                            part.apLeft == newSelection[k].apLeft && part.apRight == newSelection[k].apRight) {
                            isInNewSelection = true;
                            break;
                        }
                    }
                }

                if (!isInNewSelection) {
                    if (part.point) {
                        part.point.removeFlag(GXNode.Flag.Selected);
                    } else if (part.type == GXPathEditor.PartType.Segment) {
                        part.apLeft.removeFlag(GXNode.Flag.Selected);
                        part.apRight.removeFlag(GXNode.Flag.Selected);
                    }
                }
            }
        }

        // Iterate new selection if any and select all anchor points
        if (newSelection) {
            for (var i = 0; i < newSelection.length; ++i) {
                var part = newSelection[i];
                if (part.point) {
                    part.point.setFlag(GXNode.Flag.Selected);
                } else if (part.type == GXPathEditor.PartType.Segment) {
                    part.apLeft.setFlag(GXNode.Flag.Selected);
                    part.apRight.setFlag(GXNode.Flag.Selected);
                }
            }
        }

        this._partSelection = newSelection;
        this.requestInvalidation();
    };

    /**
     * Paint a handle
     * @param {GTransform} transform
     * @param {GXPaintContext} context
     * @param {GPoint} from
     * @param {GPoint} to
     * @private
     */
    GXPathEditor.prototype._paintHandle = function (transform, context, from, to) {
        var lineFrom = from;
        var lineTo = to;
        if (transform) {
            lineFrom = transform.mapPoint(from);
            lineTo = transform.mapPoint(to);
        }
        context.canvas.strokeLine(lineFrom.getX(), lineFrom.getY(), lineTo.getX(), lineTo.getY(), 1, context.selectionOutlineColor);
        this._paintAnnotation(context, transform, to, GXElementEditor.Annotation.Circle, false, true);
    };

    /**
     * Iterate all point annotations
     * @param {Boolean} paintElement whether to take the paint element for iteration
     * or not (which will then take the source element}
     * @param {Function(args: {{type: GXPathBase.AnchorPoint.Type|GXPathBase.CornerType, anchorPoint: GXPathBase.AnchorPoint,
     * position: GPoint, annotation: GXElementEditor.Annotation, leftHandlePosition: GPoint, rightHandlePosition: GPoint,
     * leftShoulderPosition: GPoint, rightShoulderPosition: GPoint)}})} iterator may return true for stopping iteration
     * @private
     */
    GXPathEditor.prototype._iteratePoints = function (paintElement, iterator) {
        var element = paintElement ? this.getPaintElement() : this._element;
        var anchorPoints = element.getAnchorPoints();
        var transform = element.getProperty('transform');

        for (var anchorPoint = anchorPoints.getFirstChild(); anchorPoint != null; anchorPoint = anchorPoint.getNext()) {
            var previousPt = anchorPoints.getPreviousPoint(anchorPoint);
            var nextPt = anchorPoints.getNextPoint(anchorPoint);
            var type = anchorPoint.getProperty('tp');
            var position = new GPoint(anchorPoint.getProperty('x'), anchorPoint.getProperty('y'));

            var itArgs = {
                type: type,
                anchorPoint: anchorPoint,
                position: position,
                annotation: GXElementEditor.Annotation.Rectangle,
                leftHandlePosition: null,
                rightHandlePosition: null,
                leftShoulderPosition: null,
                rightShoulderPosition: null
            };

            if (anchorPoint.hasFlag(GXNode.Flag.Selected)) {
                if (type === GXPathBase.AnchorPoint.Type.Connector) {
                    itArgs.annotation = GXElementEditor.Annotation.Diamond;
                } else if (type === GXPathBase.AnchorPoint.Type.Smooth) {
                    itArgs.annotation = GXElementEditor.Annotation.Circle;
                }
            }

            if (anchorPoint.hasFlag(GXNode.Flag.Selected) || (previousPt && previousPt.hasFlag(GXNode.Flag.Selected))) {
                var pt = new GPoint(anchorPoint.getProperty('hlx'), anchorPoint.getProperty('hly'));
                if (pt.getX() !== null && pt.getY() !== null) {
                    itArgs.leftHandlePosition = pt;
                }
            }

            if (anchorPoint.hasFlag(GXNode.Flag.Selected) || (nextPt && nextPt.hasFlag(GXNode.Flag.Selected))) {
                var pt = new GPoint(anchorPoint.getProperty('hrx'), anchorPoint.getProperty('hry'));
                if (pt.getX() !== null && pt.getY() !== null) {
                    itArgs.rightHandlePosition = pt;
                }
            }

            if (anchorPoint.hasFlag(GXNode.Flag.Selected) &&
                type !== GXPathBase.AnchorPoint.Type.Regular &&
                type !== GXPathBase.AnchorPoint.Type.Smooth &&
                type !== GXPathBase.AnchorPoint.Type.Connector) {

                var cl = anchorPoint.getProperty('cl');
                if (cl) {
                    var pt = anchorPoint.getLeftShoulderPoint();
                    if (pt && pt.getX() !== null && pt.getY() !== null) {
                        itArgs.leftShoulderPosition = pt;
                    }
                }

                var cr = anchorPoint.getProperty('cr');
                if (cr) {
                    var pt = anchorPoint.getRightShoulderPoint();
                    if (pt && pt.getX() !== null && pt.getY() !== null) {
                        itArgs.rightShoulderPosition = pt;
                    }
                }
            }

            if (transform) {
                var newPosition = transform.mapPoint(itArgs.position);

                if (itArgs.leftHandlePosition) {
                    itArgs.leftHandlePosition = transform.mapPoint(itArgs.leftHandlePosition);
                }

                if (itArgs.rightHandlePosition) {
                    itArgs.rightHandlePosition = transform.mapPoint(itArgs.rightHandlePosition);
                }

                // TODO: discuss
                // We do not apply this transform to shoulders when generating vertices, so should not apply here
                // directly, instead we should re-generate shoulders for modified anchor points,
                // as when generating vertices.
                // As the applied transform is an element's internal transform, which is the same for all points,
                // let's use the following workaround here
                if (itArgs.leftShoulderPosition) {
                    itArgs.leftShoulderPosition =
                        //transform.mapPoint(itArgs.leftShoulderPosition); // incorrect!
                        //itArgs.leftShoulderPosition.subtract(itArgs.position).add(newPosition); // also incorrect!
                        anchorPoint.getLeftShoulderPointTransformed(transform);
                }

                if (itArgs.rightShoulderPosition) {
                    itArgs.rightShoulderPosition =
                        //transform.mapPoint(itArgs.rightShoulderPosition);
                        //itArgs.rightShoulderPosition.subtract(itArgs.position).add(newPosition);
                        anchorPoint.getRightShoulderPointTransformed(transform);
                }

                itArgs.position = newPosition;
            }

            if (iterator(itArgs) === true) {
                break;
            }
        }
    };

    /**
     * Returns path preview
     * @param {Boolean} full - indicates if full path preview is needed
     * @param {GXPathBase.AnchorPoint} selectedAnchorPoint - the point for which preview is needed; may be null
     * @returns {GXPath}
     */
    GXPathEditor.prototype.getPathPreview = function (full, selectedAnchorPoint) {
        this.requestInvalidation();
        if (full) {
            this.extendPreviewToFull();
        } else {
            this._createPathPreviewIfNecessary(selectedAnchorPoint);
        }
        this.requestInvalidation();
        return this._elementPreview;
    };

    /**
     * Returns path reference
     * @returns {GXPath}
     */
    GXPathEditor.prototype.getPath = function () {
        return this._element;
    };

    /**
     * Indicates how many points and which are selected
     * @enum
     */
    GXPathEditor.PointsSelectionType = {
        No : 'N',
        First : 'F',
        Last : 'L',
        Middle : 'M',
        Several: 'S'
    };

    /**
     * Checks how many points and which are selected
     * @returns {GXPathEditor.PointsSelectionType}
     */
    GXPathEditor.prototype.getPointsSelectionType = function () {
        var selType = GXPathEditor.PointsSelectionType.No;
        if (this._partSelection) {
            if (this._partSelection.length > 1) {
                selType = GXPathEditor.PointsSelectionType.Several;
            } else if (this._partSelection[0].point.hasFlag(GXNode.Flag.Selected)) {
                var pt = this._partSelection[0].point;
                if (pt === this._element.getAnchorPoints().getLastChild()) {
                    selType = GXPathEditor.PointsSelectionType.Last;
                } else if (pt === this._element.getAnchorPoints().getFirstChild()) {
                    selType = GXPathEditor.PointsSelectionType.First;
                } else {
                    selType = GXPathEditor.PointsSelectionType.Middle;
                }
            }
        }

        return selType;
    };

    /**
     * Updates _partSelection with one selected point
     * @param {GXPathBase.AnchorPoint} anchorPt - a point to select
     */
    GXPathEditor.prototype.selectOnePoint = function(anchorPt) {
        this.updatePartSelection(false, [{type: GXPathEditor.PartType.Point, point: anchorPt}]);
    };

    /**
     * Changes indices of preview points to some value. Useful when new points are added into preview,
     * when these points are not in main path yet
     * @param {Number} shiftVal - preview indices shift value
     * @param {Number} shiftFrom - update indices starting from shiftFrom source path index. May be null, then 0 is used
     * @param {Number} shiftTo - update indices up to shiftTo source path index. May be null,
     * then indices will be updated up to table end
     */
    GXPathEditor.prototype.shiftPreviewTable = function (shiftVal, shiftFrom, shiftTo) {
        shiftFrom = shiftFrom != null ? shiftFrom : 0;
        shiftTo = shiftTo != null ? shiftTo : this._sourceIndexToPreviewIndex.length - 1;
        for (var i= shiftFrom ; i < shiftTo ; ++i) {
            this._sourceIndexToPreviewIndex[i] += shiftVal;
        }
    };

    /**
     * Used to extend preview to full path, when partial preview is getting not enough in some cases
     */
    GXPathEditor.prototype.extendPreviewToFull = function () {
        this._createPathPreviewIfNecessary();
        var sourceAnchorPoints = this._element.getAnchorPoints();
        var previewAnchorPoints = this._elementPreview.getAnchorPoints();
        var firstPreviewPtOrig = previewAnchorPoints.getFirstChild();
        var ap = sourceAnchorPoints.getFirstChild();
        var idx = 0;
        var hasPreview = (this._sourceIndexToPreviewIndex[idx] != null);
        var previewIdx = hasPreview ? this._sourceIndexToPreviewIndex[idx] : 0;
        while (!hasPreview && ap) {
            var previewAnchorPoint = new GXPathBase.AnchorPoint();
            previewAnchorPoint.transferProperties(ap, [GXPathBase.AnchorPoint.GeometryProperties]);
            if (ap.hasFlag(GXNode.Flag.Selected)) {
                previewAnchorPoint.setFlag(GXNode.Flag.Selected);
            }

            // use noEvent = true here, because recalculations in the middle of path copying makes incorrect copy
            previewAnchorPoints.insertChild(previewAnchorPoint, firstPreviewPtOrig, true);
            this._sourceIndexToPreviewIndex[idx] = previewIdx;
            ap = ap.getNext();
            ++idx;
            ++previewIdx;
            hasPreview = (this._sourceIndexToPreviewIndex[idx] != null);
        }
        var num = idx - 0;
        while (hasPreview && ap) {
            this._sourceIndexToPreviewIndex[idx] += num;
            previewIdx = this._sourceIndexToPreviewIndex[idx];
            ap = ap.getNext();
            ++idx;
            hasPreview = (this._sourceIndexToPreviewIndex[idx] != null);
        }
        ++previewIdx;
        while (!hasPreview && ap) {
            var previewAnchorPoint = new GXPathBase.AnchorPoint();
            previewAnchorPoint.transferProperties(ap, [GXPathBase.AnchorPoint.GeometryProperties]);
            if (ap.hasFlag(GXNode.Flag.Selected)) {
                previewAnchorPoint.setFlag(GXNode.Flag.Selected);
            }

            // use noEvent = true here, because recalculations in the middle of path copying makes incorrect copy
            previewAnchorPoints.appendChild(previewAnchorPoint, true);
            this._sourceIndexToPreviewIndex[idx] = previewIdx;
            ap = ap.getNext();
            ++idx;
            ++previewIdx;
            hasPreview = (this._sourceIndexToPreviewIndex[idx] != null);
        }
        // There may be one more hasPreview block, but it should not be updated in this case,
        // as this is the beginning of preview

        this._elementPreview.transferProperties(this._element, [GXShape.GeometryProperties, GXPath.GeometryProperties]);
    };

    /**
     * Create path preview if not yet existent.
     * @param {GXPathBase.AnchorPoint} [selectedAnchorPoint] if provided then this point
     * will be taken as the only selected one, if this is not provided, the selected
     * anchor points will be taken from the source path. Defaults to null if not provided.
     * @return {GXPath} the path preview
     * @private
     */
    GXPathEditor.prototype._createPathPreviewIfNecessary = function (selectedAnchorPoint) {
        if (!this._elementPreview) {
            this._sourceIndexToPreviewIndex = {};

            this._elementPreview = new GXPath();
            this._elementPreview.transferProperties(this._element, [GXShape.GeometryProperties, GXPath.GeometryProperties]);

            var _anchorPointIsSelected = function (anchorPoint) {
                return (selectedAnchorPoint && anchorPoint === selectedAnchorPoint) || (!selectedAnchorPoint && anchorPoint.hasFlag(GXNode.Flag.Selected));
            };

            var sourceAnchorPoints = this._element.getAnchorPoints();
            var previewAnchorPoints = this._elementPreview.getAnchorPoints();

            // Create our anchor points. We'll ensure to only create the piece of the path
            // that includes selected anchor points so for most of the time we'll be working
            // on an optimized path preview that doesn't require whole redrawing of the path
            // TODO: make later on support for multiple pieces of the path as in FreeHand
            var firstSelPoint = null;
            var lastSelPoint = null;
            var prevPt, nextPt;
            var relPt;
            for (var anchorPoint = sourceAnchorPoints.getFirstChild();
                 anchorPoint != null && (!firstSelPoint || !lastSelPoint);
                 anchorPoint = anchorPoint.getNext()) {

                prevPt = sourceAnchorPoints.getPreviousPoint(anchorPoint);
                nextPt = sourceAnchorPoints.getNextPoint(anchorPoint);

                if (!firstSelPoint) {
                    if (!prevPt && _anchorPointIsSelected(anchorPoint)) {
                        firstSelPoint = anchorPoint;
                    } else {
                        if (!_anchorPointIsSelected(anchorPoint) && nextPt && _anchorPointIsSelected(nextPt)) {
                            // relPt may be == anchorPoint or == prevPt depending on properties of these points
                            relPt = sourceAnchorPoints.getFirstRelatedPoint(nextPt);
                            if (!_anchorPointIsSelected(relPt) &&
                                    (!sourceAnchorPoints.getPreviousPoint(relPt) ||
                                    !_anchorPointIsSelected(sourceAnchorPoints.getPreviousPoint(relPt)))) {
                                firstSelPoint = relPt;
                            }
                        }
                    }
                }

                if (!lastSelPoint) {
                    if (!nextPt && _anchorPointIsSelected(anchorPoint)) {
                        lastSelPoint = anchorPoint;
                    } else {
                        if (!_anchorPointIsSelected(anchorPoint) && prevPt && _anchorPointIsSelected(prevPt)) {
                            // relPt may be == anchorPoint or == nextPt depending on properties of these points
                            relPt = sourceAnchorPoints.getLastRelatedPoint(prevPt);
                            if (!_anchorPointIsSelected(relPt) &&
                                    (!sourceAnchorPoints.getNextPoint(relPt) ||
                                    !_anchorPointIsSelected(sourceAnchorPoints.getNextPoint(relPt)))) {

                                lastSelPoint = relPt;
                            }
                        }
                    }
                }
            }

            if (firstSelPoint && !lastSelPoint ||
                !firstSelPoint && lastSelPoint ||
                firstSelPoint && lastSelPoint && firstSelPoint === lastSelPoint) {

                firstSelPoint = null;
                lastSelPoint = null;
            }

            // Ensure no selected points between lastSelPoint and firstSelPoint
            if (firstSelPoint && lastSelPoint) {
                var noSelected = true;
                // we can start from lastSelPoint and continue until path end or firstSelPoint for both
                // open and closed paths, as for open path there will be no selected points before the firstSelPoint
                // due to the way how we calculated firstSelPoint
                for (var anchorPoint = sourceAnchorPoints.getNextPoint(lastSelPoint);
                     anchorPoint && anchorPoint != firstSelPoint && noSelected;
                     anchorPoint = sourceAnchorPoints.getNextPoint(anchorPoint)) {
                    if (_anchorPointIsSelected(anchorPoint)) {
                        noSelected = false;
                        firstSelPoint = null;
                        lastSelPoint = null;
                    }
                }
            }

            // If there're no valid selection points then take the whole path instead
            firstSelPoint = firstSelPoint ? firstSelPoint : sourceAnchorPoints.getFirstChild();
            var finished = false;
            var anchorPoint = firstSelPoint;
            while (!finished) {
                var previewAnchorPoint = new GXPathBase.AnchorPoint();
                previewAnchorPoint.transferProperties(anchorPoint, [GXPathBase.AnchorPoint.GeometryProperties]);
                if (_anchorPointIsSelected(anchorPoint)) {
                    previewAnchorPoint.setFlag(GXNode.Flag.Selected);
                }

                // use noEvent = true here, because recalculations in the middle of path copying makes incorrect copy
                previewAnchorPoints.appendChild(previewAnchorPoint, true);

                // Add index mappings
                var sourceIndex = sourceAnchorPoints.getIndexOfChild(anchorPoint);
                var previewIndex = previewAnchorPoints.getIndexOfChild(previewAnchorPoint);
                this._sourceIndexToPreviewIndex[sourceIndex] = previewIndex;

                if (anchorPoint == lastSelPoint) {
                    finished = true;
                }
                anchorPoint = sourceAnchorPoints.getNextPoint(anchorPoint);
                if (!anchorPoint || anchorPoint == firstSelPoint) {
                    finished = true;
                }
            }

            this._elementPreview.transferProperties(this._element, [GXShape.GeometryProperties, GXPath.GeometryProperties]);
            if (firstSelPoint.getProperty('ah') || lastSelPoint && lastSelPoint.getProperty('ah')) {
                this.extendPreviewToFull();
            } else {
                // Don't make the path closed if we've created a partial preview only
                if (this._elementPreview.getProperty('closed') && lastSelPoint) {
                    this._elementPreview.setProperty('closed', false);
                }
            }
        }
        return this._elementPreview;
    };

    /**
     * Release a path preview if there was any
     * @private
     */
    GXPathEditor.prototype.releasePathPreview = function () {
        this._elementPreview = null;
        this._sourceIndexToPreviewIndex = null;
    };

    /**
     * Returns a mapping of a source point to it's preview point
     * @param {GXPathBase.AnchorPoint} sourcePoint
     */
    GXPathEditor.prototype.getPathPointPreview = function (sourcePoint) {
        var sourceIndex = sourcePoint.getParent().getIndexOfChild(sourcePoint);
        var previewIndex = this._sourceIndexToPreviewIndex[sourceIndex];
        return this._elementPreview.getAnchorPoints().getChildByIndex(previewIndex);
    };

    /**
     * Returns the combined transformation of the path internal transformation with the supplied
     * @param {GTransform}transform
     * @returns {GTransform}
     */
    GXPathEditor.prototype.getTransformFromNative = function (transform) {
        var transformToNewPos = this._element.getProperty('transform');
        if (transform) {
            transformToNewPos = transformToNewPos ? transformToNewPos.multiplied(transform) : transform;
        }
        if (!transformToNewPos) {
            transformToNewPos = new GTransform();
        }
        return transformToNewPos;
    };

    /**
     * Moves single anchor point to a new position. The anchor point should not necessary have source point.
     * This function may be used for both preview or original path points. If the original path has a transform,
     * then it is used without any concern, if preview or original path point is moving.
     * @param {GXPathBase.AnchorPoint} anchorPoint - an anchor point to move to new position
     * @param {GPoint} newPosition - new point's position
     * @param {GTransform} transform - transformation to be applied to path points to make their coordinate system
     * the same in which new position is specified
     * @param {GXPathBase.AnchorPoint} origPoint - if present, this anchor point is used as a source point instead of
     * anchor point itself. Useful when dragging an existing point to not lose it's handles accuracy.
     */
    GXPathEditor.prototype.movePoint = function (anchorPoint, newPosition, transform, origPoint) {
        var transformToNewPos = this.getTransformFromNative(transform);
        var transformToNative = transformToNewPos.inverted();

        var newNativePos = transformToNative.mapPoint(newPosition);

        if (anchorPoint.getProperty('ah')) {
            anchorPoint.setProperties(['x', 'y'], [newNativePos.getX(), newNativePos.getY()]);
        } else {
            var srcPt = origPoint ? origPoint : anchorPoint;
            var hlx = srcPt.getProperty('hlx');
            var hly = srcPt.getProperty('hly');
            var hrx = srcPt.getProperty('hrx');
            var hry = srcPt.getProperty('hry');
            if (hlx != null && hly != null || hrx != null && hry != null) {
                var origPos = transformToNewPos.mapPoint(
                    new GPoint(srcPt.getProperty('x'), srcPt.getProperty('y')));
                var dx = newPosition.getX() - origPos.getX();
                var dy = newPosition.getY() - origPos.getY();

                if (hlx != null && hly != null) {
                    var pt = transformToNative.mapPoint(
                        transformToNewPos.mapPoint(new GPoint(hlx, hly)).translated(dx, dy));
                    hlx = pt.getX();
                    hly = pt.getY();
                }
                if (hrx != null && hry != null) {
                    var pt = transformToNative.mapPoint(
                        transformToNewPos.mapPoint(new GPoint(hrx, hry)).translated(dx, dy));
                    hrx = pt.getX();
                    hry = pt.getY();
                }
            }
            anchorPoint.setProperties(['x', 'y', 'hlx', 'hly', 'hrx', 'hry'],
                [newNativePos.getX(), newNativePos.getY(), hlx, hly, hrx, hry]);
        }
    };

    /**
     * Move coordinate properties of a preview point
     * @param {GXPathBase.AnchorPoint} sourcePoint
     * @param {String} xProperty
     * @param {String} yProperty
     * @param {GPoint} position
     * @param {Boolean} ratio
     * @private
     */
    GXPathEditor.prototype._movePreviewPointCoordinates = function (sourcePoint, xProperty, yProperty, position, ratio) {
        var pathTransform = this._element.getProperty('transform');
        var sourcePosition = new GPoint(sourcePoint.getProperty(xProperty), sourcePoint.getProperty(yProperty));

        if (pathTransform) {
            sourcePosition = pathTransform.mapPoint(sourcePosition);
        }

        this._transformPreviewPointCoordinates(sourcePoint, xProperty, yProperty,
            new GTransform(1, 0, 0, 1, position.getX() - sourcePosition.getX(), position.getY() - sourcePosition.getY()));
    };

    /**
     * Transform coordinate properties of a preview point
     * @param {GXPathBase.AnchorPoint} sourcePoint
     * @param {String} xProperty
     * @param {String} yProperty
     * @param {GTransform} transform
     * @param {GPoint} sourcePos if present, used for source position
     * @private
     */
    GXPathEditor.prototype._transformPreviewPointCoordinates = function (sourcePoint, xProperty, yProperty, transform, sourcePos) {
        var pathTransform = this._element.getProperty('transform');

        var previewPoint = this.getPathPointPreview(sourcePoint);
        if (previewPoint) {
            if (sourcePos) {
                var sourcePosition = sourcePos;
            } else {
                // Map source point with transformation and apply it to preview point
                var sourcePosition = new GPoint(sourcePoint.getProperty(xProperty), sourcePoint.getProperty(yProperty));
            }

            var transformToApply = transform;
            if (pathTransform) {
                transformToApply = transform.multiplied(pathTransform.inverted());
                transformToApply = pathTransform.multiplied(transformToApply);
            }
            var previewPosition = transformToApply.mapPoint(sourcePosition);

            var propertiesToSet = [xProperty, yProperty];
            var valuesToSet = [previewPosition.getX(), previewPosition.getY()];

            // If we're modifying handle coordinates then set auto-handles to false
            if (xProperty === 'hlx' || xProperty === 'hrx' || yProperty === 'hly' || yProperty === 'hry') {
                propertiesToSet.push('ah');
                valuesToSet.push(false);
            }

            // Assign properties now
            previewPoint.setProperties(propertiesToSet, valuesToSet);
        }
    };

    /**
     * Calculates and set the new values of shoulders making the projection of new mouse position to shoulder vector
     * @param {{type: partType, point: args.anchorPoint}} partId
     * @param {GPoint} position - destination position
     * @param {Boolean} ratio - if true, modify both shoulders the same way
     * @private
     */
    GXPathEditor.prototype._movePreviewPointShoulders = function (partId, position, ratio) {
        var pathTransform = this._element.getProperty('transform');
        var sourcePosition = new GPoint(partId.point.getProperty('x'), partId.point.getProperty('y'));

        var shoulderPt;

        if (pathTransform) {
            if (partId.type == GXPathEditor.PartType.LeftShoulder) {
                shoulderPt = partId.point.getLeftShoulderPointTransformed(pathTransform);
            } else { // right shoulder
                shoulderPt = partId.point.getRightShoulderPointTransformed(pathTransform);
            }
            sourcePosition = pathTransform.mapPoint(sourcePosition);
        } else {
            if (partId.type == GXPathEditor.PartType.LeftShoulder) {
                shoulderPt = partId.point.getLeftShoulderPoint();
            } else { // right shoulder
                shoulderPt = partId.point.getRightShoulderPoint();
            }
        }

        var newShoulderPt = gMath.getVectorProjection(sourcePosition.getX(), sourcePosition.getY(),
            shoulderPt.getX(), shoulderPt.getY(), position.getX(), position.getY(), true);

        var newVal = gMath.ptDist(newShoulderPt.getX(), newShoulderPt.getY(),
            sourcePosition.getX(), sourcePosition.getY());

        var previewPoint = this.getPathPointPreview(partId.point);
        // TODO: discuss:
        // We do not apply pathTransform to shoulders when generating vertices,
        // assign new value directly to previewPoint without any further transforms
        if (ratio) {
            previewPoint.setProperties(['cl', 'cr'], [newVal, newVal]);
        } else if (partId.type == GXPathEditor.PartType.LeftShoulder) {
            previewPoint.setProperty('cl', newVal);
        } else { // right shoulder
            previewPoint.setProperty('cr', newVal);
        }
    };

    /**
     * Assign a given set of preview point to source point
     * @param {GXPathBase.AnchorPoint} sourcePoint
     * @param {Array<String>} properties
     * @private
     */
    GXPathEditor.prototype._assignPreviewPointPropertiesToSourcePoint = function (sourcePoint, properties) {
        var previewPoint = this.getPathPointPreview(sourcePoint);
        if (previewPoint) {
            // Simply assign preview position back to source
            sourcePoint.setProperties(properties, previewPoint.getProperties(properties));
        }
    };

    /**
     * Assign all geometry properties of preview point to corresponding point of an element
     * @param {GXPathBase.AnchorPoint} point - a point to use for finding preview point
     * @param {GXElement} element the element to which point to apply the transformation,
     * might be different than the one this editor works on. This will be never null.
     * @private
     */
    GXPathEditor.prototype._transferPreviewProperties = function (point, element) {
        // Work with indices as element might not be ourself
        var mySourceIndex = this._element.getAnchorPoints().getIndexOfChild(point);
        var elSourcePoint = element.getAnchorPoints().getChildByIndex(mySourceIndex);
        var previewPoint = this.getPathPointPreview(elSourcePoint);
        if (previewPoint) {
            elSourcePoint.transferProperties(previewPoint, [GXPathBase.AnchorPoint.GeometryProperties]);
        }
    };

    /**
     * Filters selection to not include separatly points, which are already included as some segment end-points
     * @param {Array<*>} selection the part selection to be filtered
     * @returns {Array<*>} the new filtered selection
     * @private
     */
    GXPathEditor.prototype._filterSelection = function (selection) {
        if (!selection) {
            return null;
        }
        var newSelection = [];
        var isInNewSelection;
        for (var i = 0; i < selection.length; ++i) {
            if (selection[i].type != GXPathEditor.PartType.Point) {
                newSelection.push(selection[i]);
            } else {
                isInNewSelection = true;
                for (var k = 0; k < selection.length; ++k) {
                    if (selection[k].type == GXPathEditor.PartType.Segment &&
                            (selection[i].point == selection[k].apLeft || selection[i].point == selection[k].apRight)) {

                        isInNewSelection = false;
                        break;
                    }
                }
                if (isInNewSelection) {
                    newSelection.push(selection[i]);
                }
            }
        }
        return newSelection;
    };

    /** @override */
    GXPathEditor.prototype.toString = function () {
        return "[Object GXPathEditor]";
    };

    _.GXPathEditor = GXPathEditor;
})(this);