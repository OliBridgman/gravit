/*global describe, it */
'use strict';
(function () {
    describe('GXPath', function () {
        this.bail(false);

        it('Set and get PROPERTY_CLOSED', function () {
            var path = new GXPath();
            expect(path).to.be.an('Object');

            expect(path.getProperty(GXPath.PROPERTY_CLOSED)).to.be.null;
            path.setProperty(GXPath.PROPERTY_CLOSED, true);
            expect(path.getProperty(GXPath.PROPERTY_CLOSED)).to.be.true;
            path.setProperty(GXPath.PROPERTY_CLOSED, false);
            expect(path.getProperty(GXPath.PROPERTY_CLOSED)).to.not.be.ok;
        });

        it('Updates handles of first two points and last two points when setting PROPERTY_CLOSED', function () {
            expect(1).to.be.false;
        });

        it('#getAnchorPoints returns AnchorPointContainer', function () {
            var path = new GXPath();
            var container = path.getAnchorPoints();
            expect(container.toString()).to.equal("[GXPath.AnchorPointContainer]");
        });

        it('#setCType updates corner type and shoulders length for all anchor points in the path', function () {
            var path = new GXPath();
            path.appendAnchorPoint(new GXPath.AnchorPoint(new IFPoint(10, 10), null,
                null, new IFPoint(15, 0)));
            path.appendAnchorPoint(new GXPath.AnchorPoint(new IFPoint(50, 10), null,
                new IFPoint(15, -10), new IFPoint(60, 20)));
            path.appendAnchorPoint(new GXPath.AnchorPoint(new IFPoint(50, 70)));
            path.appendAnchorPoint(new GXPath.AnchorPoint(new IFPoint(30, 100)));
            var aCTypes = [
                GXPath.AnchorPoint.CType.Regular,
                GXPath.AnchorPoint.CType.Connector,
                GXPath.AnchorPoint.CType.Smooth,
                GXPath.AnchorPoint.CType.Rounded,
                GXPath.AnchorPoint.CType.InverseRounded,
                GXPath.AnchorPoint.CType.Bevel,
                GXPath.AnchorPoint.CType.Inset,
                GXPath.AnchorPoint.CType.Fancy
            ];
            var ctype;
            var cx = 5, cy = 10;
            for (var i = 0; i < aCTypes.length; ++i, ++cx, ++cy) {
                 ctype = aCTypes[i];

                path.setCType(ctype, cx, cy);

                for (var anchorPoint = path.getAnchorPoints().getFirstChild(); anchorPoint != null;
                     anchorPoint = anchorPoint.getNext()) {

                     expect(anchorPoint.$ctype).to.be.equal(ctype);
                     if (ctype > GXPath.AnchorPoint.CType.Smooth) {
                         expect(anchorPoint.$cx).to.be.equal(cx);
                         expect(anchorPoint.$cy).to.be.equal(cy);
                     }
                }
            }
        });
        it('#setAuto updates handles to be auto or not for all anchor points in the path', function () {
            var aCTypes = [
                GXPath.AnchorPoint.CType.Regular,
                GXPath.AnchorPoint.CType.Connector,
                GXPath.AnchorPoint.CType.Smooth,
                GXPath.AnchorPoint.CType.Rounded,
                GXPath.AnchorPoint.CType.InverseRounded,
                GXPath.AnchorPoint.CType.Bevel,
                GXPath.AnchorPoint.CType.Inset,
                GXPath.AnchorPoint.CType.Fancy
            ];

            var path = new GXPath();
            for (var i = 0; i < aCTypes.length; ++i) {
                path.getAnchorPoints().appendChild(new GXPath.AnchorPoint(
                    new IFPoint(5*i, 10*i + i), aCTypes[i], new IFPoint(0, 8*i), new IFPoint(3*i, 0)));
            }

            var anchorPoint;
            for (anchorPoint = path.getAnchorPoints().getFirstChild(); anchorPoint != null;
                 anchorPoint = anchorPoint.getNext()) {

                expect(anchorPoint.$ah).to.be.false;
            }
            path.setAuto(true);
            for (anchorPoint = path.getAnchorPoints().getFirstChild(); anchorPoint != null;
                 anchorPoint = anchorPoint.getNext()) {

                expect(anchorPoint.$ah).to.be.true;
            }
            path.setAuto(false);
            for (anchorPoint = path.getAnchorPoints().getFirstChild(); anchorPoint != null;
                 anchorPoint = anchorPoint.getNext()) {

                expect(anchorPoint.$ah).to.be.false;
            }
        });
        it('#_detailHitTest makes hit-testing', function () {
            expect(1).to.be.false;
        });
        it('#insertChild insert anchor point and recalculate handles of this and two neighbour points', function () {
            expect(1).to.be.false;
        });
        it('#removeChild remove anchor point and recalculate handles of two neighbour points', function () {
            expect(1).to.be.false;
        });

        describe('AnchorPoint', function () {
            it('should construct AnchorPoint', function() {
                expect(GXPath).itself.respondTo('AnchorPoint');
                var anchorPt = new GXPath.AnchorPoint();
                expect(anchorPt).to.have.property('$x');
                expect(anchorPt).to.have.property('$y');
                expect(anchorPt).to.have.property('$hlx');
                expect(anchorPt).to.have.property('$hly');
                expect(anchorPt).to.have.property('$hrx');
                expect(anchorPt).to.have.property('$hry');
                expect(anchorPt).to.have.property('$cx');
                expect(anchorPt).to.have.property('$cy');
                expect(anchorPt).to.have.property('$ctype');
                expect(anchorPt).to.have.property('$ah');
                expect(anchorPt.$x).to.be.equal(0);
                expect(anchorPt.$y).to.be.equal(0);
                expect(anchorPt.$hlx).to.be.null;
                expect(anchorPt.$hly).to.be.null;
                expect(anchorPt.$hrx).to.be.null;
                expect(anchorPt.$hry).to.be.null;
                expect(anchorPt.$ctype).to.be.equal(GXPath.AnchorPoint.CType.Regular);
                expect(anchorPt.$cx).to.be.equal(0);
                expect(anchorPt.$cy).to.be.equal(0);
                expect(anchorPt.$ah).to.not.be.ok;

                var x = 20, y = 30.5, hlx = 40, hly = 50.5, hrx = 60, hry = 60.5, cx = 10, cy = 15;
                anchorPt = new GXPath.AnchorPoint(new IFPoint(x, y), null, null, new IFPoint(hrx, hry));

                expect(anchorPt.$x).to.be.equal(x);
                expect(anchorPt.$y).to.be.equal(y);
                expect(anchorPt.$hlx).to.be.null;
                expect(anchorPt.$hly).to.be.null;
                expect(anchorPt.$hrx).to.be.equal(hrx);
                expect(anchorPt.$hry).to.be.equal(hry);
                expect(anchorPt.$ctype).to.be.equal(GXPath.AnchorPoint.CType.Regular);

                anchorPt = new GXPath.AnchorPoint(new IFPoint(x, y), GXPath.AnchorPoint.CType.Connector,
                    new IFPoint(hlx, hly), new IFPoint(hrx, hry));

                expect(anchorPt.$hlx).to.be.equal(hlx);
                expect(anchorPt.$hly).to.be.equal(hly);
                expect(anchorPt.$hrx).to.be.equal(hrx);
                expect(anchorPt.$hry).to.be.equal(hry);
                expect(anchorPt.$ctype).to.be.equal(GXPath.AnchorPoint.CType.Connector);

                anchorPt = new GXPath.AnchorPoint(new IFPoint(x, y), GXPath.AnchorPoint.CType.Smooth, new IFPoint(hlx, hly));

                expect(anchorPt.$ctype).to.be.equal(GXPath.AnchorPoint.CType.Smooth);
                expect(anchorPt.$hlx).to.be.equal(hlx);
                expect(anchorPt.$hly).to.be.equal(hly);
                expect(anchorPt.$hrx).to.be.null;
                expect(anchorPt.$hry).to.be.null;
            });
            describe('#setProperty with GXPath.AnchorPoint.PROPERTY_CX, GXPath.AnchorPoint.PROPERTY_CY', function () {
                it('Update anchor point shoulders lengths ($cx, $cy) for all styled corners', function () {
                    var anchorPt = new GXPath.AnchorPoint();

                    var styledCTypes = [
                        GXPath.AnchorPoint.CType.Rounded,
                        GXPath.AnchorPoint.CType.InverseRounded,
                        GXPath.AnchorPoint.CType.Bevel,
                        GXPath.AnchorPoint.CType.Inset,
                        GXPath.AnchorPoint.CType.Fancy
                    ];

                    var aCType;
                    var cx = 10, cy = 15;
                    for (var i = 0; i < styledCTypes.length; ++i) {
                        aCType = styledCTypes[i];
                        anchorPt.setProperty(GXPath.AnchorPoint.PROPERTY_CTYPE, aCType);
                        expect(anchorPt.$cx).to.be.equal(0);
                        expect(anchorPt.$cy).to.be.equal(0);
                        anchorPt.setProperty(GXPath.AnchorPoint.PROPERTY_CX, cx);
                        anchorPt.setProperty(GXPath.AnchorPoint.PROPERTY_CY, cy);
                        expect(anchorPt.$cx).to.be.equal(cx);
                        expect(anchorPt.$cy).to.be.equal(cy);
                        anchorPt.setProperty(GXPath.AnchorPoint.PROPERTY_CX, 0);
                        anchorPt.setProperty(GXPath.AnchorPoint.PROPERTY_CY, 0);
                        expect(anchorPt.$cx).to.be.equal(0);
                        expect(anchorPt.$cy).to.be.equal(0);
                    }
                });
            });
            describe('#setProperty with GXPath.AnchorPoint.PROPERTY_CTYPE', function () {
                it('Update anchor point corner type ($ctype property)', function () {
                    var anchorPt = new GXPath.AnchorPoint();

                    var anchorCTypes = [
                        GXPath.AnchorPoint.CType.Connector,
                        GXPath.AnchorPoint.CType.Smooth,
                        GXPath.AnchorPoint.CType.Regular,

                        GXPath.AnchorPoint.CType.Rounded,
                        GXPath.AnchorPoint.CType.InverseRounded,
                        GXPath.AnchorPoint.CType.Bevel,
                        GXPath.AnchorPoint.CType.Inset,
                        GXPath.AnchorPoint.CType.Fancy
                    ];

                    var aCType;

                    expect(anchorPt.$ctype).to.be.equal(GXPath.AnchorPoint.CType.Regular);
                    for (var i = 0; i < anchorCTypes.length; ++i) {
                        aCType = anchorCTypes[i];
                        anchorPt.setProperty(GXPath.AnchorPoint.PROPERTY_CTYPE, aCType);
                        expect(anchorPt.$ctype).to.be.equal(aCType);
                    }
                });
                it('Recalculate handles of anchor point for Connector type: Start point - path closed', function() {
                    var path = new GXPath();
                    var x1 = 10;
                    var y1 = 0;
                    var y2 = -10;
                    var x2 = 50;
                    path.getAnchorPoints().appendChild(new GXPath.AnchorPoint(
                        new IFPoint(x1, y1), null, new IFPoint(x1, y1 + 5), new IFPoint(x1 + 5, y1)));
                    path.getAnchorPoints().appendChild(new GXPath.AnchorPoint(
                        new IFPoint(x2, y1), null, new IFPoint(40, 5), new IFPoint(60, 10)));
                    path.getAnchorPoints().appendChild(new GXPath.AnchorPoint(new IFPoint(50, 70)));
                    path.getAnchorPoints().appendChild(new GXPath.AnchorPoint(new IFPoint(x1, y2)));
                    path.setProperty(GXPath.PROPERTY_CLOSED, true);

                    var aPt = path.getAnchorPoints().getFirstChild();
                    aPt.setProperty(GXPath.AnchorPoint.PROPERTY_CTYPE, GXPath.AnchorPoint.CType.Connector);
                    expect(aPt.$hlx).to.be.equal(x1 - 5);
                    expect(aPt.$hly).to.be.equal(y1);
                    expect(aPt.$hrx).to.be.equal(x1);
                    expect(aPt.$hry).to.be.equal(y1 + 5);
                });
                it('Recalculate handles of anchor point for Connector type: Start point - path opened', function() {
                    var path = new GXPath();
                    var x1 = 10;
                    var y1 = 0;
                    var y2 = -10;
                    var x2 = 50;
                    path.getAnchorPoints().appendChild(new GXPath.AnchorPoint(
                        new IFPoint(x1, y1), null, new IFPoint(x1, y1 + 5), new IFPoint(x1 + 5, y1)));
                    path.getAnchorPoints().appendChild(new GXPath.AnchorPoint(
                        new IFPoint(x2, y1), null, new IFPoint(40, 5), new IFPoint(60, 10)));
                    path.getAnchorPoints().appendChild(new GXPath.AnchorPoint(new IFPoint(50, 70)));
                    path.getAnchorPoints().appendChild(new GXPath.AnchorPoint(new IFPoint(x1, y2)));

                    var aPt = path.getAnchorPoints().getFirstChild();
                    aPt.setProperty(GXPath.AnchorPoint.PROPERTY_CTYPE, GXPath.AnchorPoint.CType.Connector);
                    expect(aPt.$hlx).to.be.equal(x1 - 5);
                    expect(aPt.$hly).to.be.equal(y1);
                    expect(aPt.$hrx).to.be.equal(x1 + 5);
                    expect(aPt.$hry).to.be.equal(y1);
                });
                it('Recalculate handles of anchor point for Connector type: End point - path closed', function() {
                    var path = new GXPath();
                    var x1 = 10;
                    var y1 = 0;
                    var y2 = -10;
                    var x2 = 50;
                    path.getAnchorPoints().appendChild(new GXPath.AnchorPoint(new IFPoint(x1, y2)));
                    path.getAnchorPoints().appendChild(new GXPath.AnchorPoint(new IFPoint(50, 70)));
                    path.getAnchorPoints().appendChild(new GXPath.AnchorPoint(
                        new IFPoint(x2, y1), null, new IFPoint(60, 10), new IFPoint(40, 5)));
                    path.getAnchorPoints().appendChild(new GXPath.AnchorPoint(
                        new IFPoint(x1, y1), null, new IFPoint(x1 + 5, y1), new IFPoint(x1, y1 + 5)));
                    path.setProperty(GXPath.PROPERTY_CLOSED, true);

                    var aPt = path.getAnchorPoints().getLastChild();
                    aPt.setProperty(GXPath.AnchorPoint.PROPERTY_CTYPE, GXPath.AnchorPoint.CType.Connector);
                    expect(aPt.$hrx).to.be.equal(x1 - 5);
                    expect(aPt.$hry).to.be.equal(y1);
                    expect(aPt.$hlx).to.be.equal(x1);
                    expect(aPt.$hly).to.be.equal(y1 + 5);
                });
                it('Recalculate handles of anchor point for Connector type: End point - path opened', function() {
                    var path = new GXPath();
                    var x1 = 10;
                    var y1 = 0;
                    var y2 = -10;
                    var x2 = 50;
                    path.getAnchorPoints().appendChild(new GXPath.AnchorPoint(new IFPoint(x1, y2)));
                    path.getAnchorPoints().appendChild(new GXPath.AnchorPoint(new IFPoint(50, 70)));
                    path.getAnchorPoints().appendChild(new GXPath.AnchorPoint(
                        new IFPoint(x2, y1), null, new IFPoint(60, 10), new IFPoint(40, 5)));
                    path.getAnchorPoints().appendChild(new GXPath.AnchorPoint(
                        new IFPoint(x1, y1), null, new IFPoint(x1 + 5, y1), new IFPoint(x1, y1 + 5)));

                    var aPt = path.getAnchorPoints().getLastChild();
                    aPt.setProperty(GXPath.AnchorPoint.PROPERTY_CTYPE, GXPath.AnchorPoint.CType.Connector);
                    expect(aPt.$hrx).to.be.equal(x1 - 5);
                    expect(aPt.$hry).to.be.equal(y1);
                    expect(aPt.$hlx).to.be.equal(x1 + 5);
                    expect(aPt.$hly).to.be.equal(y1);
                });
                it('Recalculate handles of anchor point for Connector type: path middle point', function() {
                    var path = new GXPath();
                    var x1 = 10;
                    var y1 = 0;
                    var y2 = -10;
                    var x2 = 50;
                    path.getAnchorPoints().appendChild(new GXPath.AnchorPoint(new IFPoint(x1, y2)));
                    path.getAnchorPoints().appendChild(new GXPath.AnchorPoint(
                        new IFPoint(x1, y1), null, new IFPoint(x1, y1 + 5), new IFPoint(x1 + 5, y1)));
                    path.getAnchorPoints().appendChild(new GXPath.AnchorPoint(
                        new IFPoint(x2, y1), null, new IFPoint(40, 5), new IFPoint(60, 10)));
                    path.getAnchorPoints().appendChild(new GXPath.AnchorPoint(new IFPoint(50, 70)));

                    path.setProperty(GXPath.PROPERTY_CLOSED, true);

                    var aPt = path.getAnchorPoints().getFirstChild().getNext();
                    aPt.setProperty(GXPath.AnchorPoint.PROPERTY_CTYPE, GXPath.AnchorPoint.CType.Connector);
                    expect(aPt.$hlx).to.be.equal(x1 - 5);
                    expect(aPt.$hly).to.be.equal(y1);
                    expect(aPt.$hrx).to.be.equal(x1);
                    expect(aPt.$hry).to.be.equal(y1 + 5);
                });
                it('Recalculate (not auto-)handles of anchor point for Smooth type: Start point - path closed', function() {
                    var path = new GXPath();
                    var x1 = 10;
                    var y1 = 0;
                    var y2 = -10;
                    var x2 = 50;
                    path.getAnchorPoints().appendChild(new GXPath.AnchorPoint(
                        new IFPoint(x1, y1), null, new IFPoint(x1, y1 + 5), new IFPoint(x1 + 5, y1)));
                    path.getAnchorPoints().appendChild(new GXPath.AnchorPoint(
                        new IFPoint(x2, y1), null, new IFPoint(40, 5), new IFPoint(60, 10)));
                    path.getAnchorPoints().appendChild(new GXPath.AnchorPoint(new IFPoint(50, 70)));
                    path.getAnchorPoints().appendChild(new GXPath.AnchorPoint(new IFPoint(x1 - 10, y2)));
                    path.setProperty(GXPath.PROPERTY_CLOSED, true);

                    var aPt = path.getAnchorPoints().getFirstChild();
                    aPt.setProperty(GXPath.AnchorPoint.PROPERTY_CTYPE, GXPath.AnchorPoint.CType.Smooth);
                    expect(aPt.$hlx).to.be.equal(x1);
                    expect(aPt.$hly).to.be.equal(y1 + 5);
                    expect(aPt.$hrx).to.be.equal(x1);
                    expect(aPt.$hry).to.be.equal(y1 - 5);
                });
                it('Recalculate (not auto-)handles of anchor point for Smooth type: Start point - path opened', function() {
                    var path = new GXPath();
                    var x1 = 10;
                    var y1 = 0;
                    var y2 = -10;
                    var x2 = 50;
                    path.getAnchorPoints().appendChild(new GXPath.AnchorPoint(
                        new IFPoint(x1, y1), null, new IFPoint(x1, y1 + 5), new IFPoint(x1 + 5, y1)));
                    path.getAnchorPoints().appendChild(new GXPath.AnchorPoint(
                        new IFPoint(x2, y1), null, new IFPoint(40, 5), new IFPoint(60, 10)));
                    path.getAnchorPoints().appendChild(new GXPath.AnchorPoint(new IFPoint(50, 70)));
                    path.getAnchorPoints().appendChild(new GXPath.AnchorPoint(new IFPoint(x1 - 10, y2)));

                    var aPt = path.getAnchorPoints().getFirstChild();
                    aPt.setProperty(GXPath.AnchorPoint.PROPERTY_CTYPE, GXPath.AnchorPoint.CType.Smooth);
                    expect(aPt.$hlx).to.be.equal(x1);
                    expect(aPt.$hly).to.be.equal(y1 + 5);
                    expect(aPt.$hrx).to.be.equal(x1);
                    expect(aPt.$hry).to.be.equal(y1 - 5);
                });
                it('Recalculate (not auto-)handles of anchor point for Smooth type: End point - path closed', function() {
                    var path = new GXPath();
                    var x1 = 10;
                    var y1 = 0;
                    var y2 = -10;
                    var x2 = 50;
                    path.getAnchorPoints().appendChild(new GXPath.AnchorPoint(new IFPoint(x1 - 10, y2)));
                    path.getAnchorPoints().appendChild(new GXPath.AnchorPoint(new IFPoint(50, 70)));
                    path.getAnchorPoints().appendChild(new GXPath.AnchorPoint(
                        new IFPoint(x2, y1), null, new IFPoint(60, 10), new IFPoint(40, 5)));
                    path.getAnchorPoints().appendChild(new GXPath.AnchorPoint(
                        new IFPoint(x1, y1), null, new IFPoint(x1, y1 + 5), new IFPoint(x1 - 5, y1)));

                    path.setProperty(GXPath.PROPERTY_CLOSED, true);

                    var aPt = path.getAnchorPoints().getLastChild();
                    aPt.setProperty(GXPath.AnchorPoint.PROPERTY_CTYPE, GXPath.AnchorPoint.CType.Smooth);
                    expect(aPt.$hlx).to.be.equal(x1);
                    expect(aPt.$hly).to.be.equal(y1 + 5);
                    expect(aPt.$hrx).to.be.equal(x1);
                    expect(aPt.$hry).to.be.equal(y1 - 5);
                });
                it('Recalculate (not auto-)handles of anchor point for Smooth type: End point - path opened', function() {
                    var path = new GXPath();
                    var x1 = 10;
                    var y1 = 0;
                    var y2 = -10;
                    var x2 = 50;
                    path.getAnchorPoints().appendChild(new GXPath.AnchorPoint(new IFPoint(x1 - 10, y2)));
                    path.getAnchorPoints().appendChild(new GXPath.AnchorPoint(new IFPoint(50, 70)));
                    path.getAnchorPoints().appendChild(new GXPath.AnchorPoint(
                        new IFPoint(x2, y1), null, new IFPoint(60, 10), new IFPoint(40, 5)));
                    path.getAnchorPoints().appendChild(new GXPath.AnchorPoint(
                        new IFPoint(x1, y1), null, new IFPoint(x1, y1 + 5), new IFPoint(x1 - 5, y1)));

                    var aPt = path.getAnchorPoints().getLastChild();
                    aPt.setProperty(GXPath.AnchorPoint.PROPERTY_CTYPE, GXPath.AnchorPoint.CType.Smooth);
                    expect(aPt.$hlx).to.be.equal(x1);
                    expect(aPt.$hly).to.be.equal(y1 + 5);
                    expect(aPt.$hrx).to.be.equal(x1);
                    expect(aPt.$hry).to.be.equal(y1 - 5);

                });
                it('Recalculate (not auto-)handles of anchor point for Smooth type: path middle point', function() {
                    var path = new GXPath();
                    var x1 = 10;
                    var y1 = 0;
                    var y2 = -10;
                    var x2 = 50;
                    path.getAnchorPoints().appendChild(new GXPath.AnchorPoint(new IFPoint(x1 - 10, y2)));
                    path.getAnchorPoints().appendChild(new GXPath.AnchorPoint(
                        new IFPoint(x1, y1), null, new IFPoint(x1, y1 + 5), new IFPoint(x1 + 5, y1)));
                    path.getAnchorPoints().appendChild(new GXPath.AnchorPoint(
                        new IFPoint(x2, y1), null, new IFPoint(40, 5), new IFPoint(60, 10)));
                    path.getAnchorPoints().appendChild(new GXPath.AnchorPoint(new IFPoint(50, 70)));

                    path.setProperty(GXPath.PROPERTY_CLOSED, true);

                    var aPt = path.getAnchorPoints().getFirstChild().getNext();
                    aPt.setProperty(GXPath.AnchorPoint.PROPERTY_CTYPE, GXPath.AnchorPoint.CType.Smooth);
                    expect(aPt.$hlx).to.be.equal(x1);
                    expect(aPt.$hly).to.be.equal(y1 + 5);
                    expect(aPt.$hrx).to.be.equal(x1);
                    expect(aPt.$hry).to.be.equal(y1 - 5);

                });
            });
            describe('#setProperty with GXPath.AnchorPoint.PROPERTY_AUTO_HANDLES', function () {
                it('Updates $ah property', function () {
                    var anchorPt = new GXPath.AnchorPoint();

                    var anchorCTypes = [
                        GXPath.AnchorPoint.CType.Regular,
                        GXPath.AnchorPoint.CType.Connector,
                        GXPath.AnchorPoint.CType.Smooth,

                        GXPath.AnchorPoint.CType.Rounded,
                        GXPath.AnchorPoint.CType.InverseRounded,
                        GXPath.AnchorPoint.CType.Bevel,
                        GXPath.AnchorPoint.CType.Inset,
                        GXPath.AnchorPoint.CType.Fancy
                    ];

                    var aCType;
                    for (var i = 0; i < anchorCTypes.length; ++i) {
                        aCType = anchorCTypes[i];
                        anchorPt.setProperty(GXPath.AnchorPoint.PROPERTY_CTYPE, aCType);
                        expect(anchorPt.$ah).to.be.false;
                        anchorPt.setProperty(GXPath.AnchorPoint.PROPERTY_AUTO_HANDLES,true);
                        expect(anchorPt.$ah).to.be.true;
                        anchorPt.setProperty(GXPath.AnchorPoint.PROPERTY_AUTO_HANDLES,false);
                        expect(anchorPt.$ah).to.be.false;
                    }
                });
                it('Recalculate handles of anchor point for Smooth type: Start point - path closed', function() {
                    var path = new GXPath();
                    var x1 = 10;
                    var y1 = 0;
                    var x2 = 50;
                    var y2 = y1;
                    var x4 = x1 - 10;
                    var y4 = -10;

                    var aPt;
                    var res;
                    var ptx, pty;
                    var ccntr;
                    var offs = 0.4;
                    var dirLen, hLen;
                    var dx, dy;

                    path.getAnchorPoints().appendChild(new GXPath.AnchorPoint(
                        new IFPoint(x1, y1), GXPath.AnchorPoint.CType.Smooth,
                        new IFPoint(x1, y1 + 5), new IFPoint(x1 + 5, y1)));
                    path.getAnchorPoints().appendChild(new GXPath.AnchorPoint(
                        new IFPoint(x2, y2), null, new IFPoint(40, 5), new IFPoint(60, 10)));
                    path.getAnchorPoints().appendChild(new GXPath.AnchorPoint(new IFPoint(50, 70)));
                    path.getAnchorPoints().appendChild(new GXPath.AnchorPoint(new IFPoint(x4, y4)));
                    path.setProperty(GXPath.PROPERTY_CLOSED, true);

                    aPt = path.getAnchorPoints().getFirstChild();
                    aPt.setProperty(GXPath.AnchorPoint.PROPERTY_AUTO_HANDLES, true);

                    ccntr = gMath.getCircumcircleCenter(x4, y4, x1, y1, x2, y2);
                    dirLen = Math.sqrt(gMath.ptSqrDist(x1, y1, ccntr.getX(), ccntr.getY()));
                    dx = (y1 - ccntr.getY()) / dirLen;
                    dy = (ccntr.getX() - x1) / dirLen;
                    if (gMath.segmentSide(x1, y1, (x4 + x2)/2, (y4 + y2)/2, x4, y4) !=
                        gMath.segmentSide(x1, y1, (x4 + x2)/2, (y4 + y2)/2, x1  - dx, y1  - dy)) {
                        dx = -dx;
                        dy = -dy;
                    }

                    hLen = Math.sqrt(gMath.ptSqrDist(x1, y1, x4, y4)) * offs;

                    ptx = x1 - dx * hLen;
                    res = gMath.isEqualEps(aPt.$hlx, ptx);
                    expect(res).to.be.true;

                    pty = y1 - dy * hLen;
                    res = gMath.isEqualEps(aPt.$hly, pty);
                    expect(res).to.be.true;

                    hLen = Math.sqrt(gMath.ptSqrDist(x1, y1, x2, y2)) * offs;

                    ptx = x1 + dx * hLen;
                    res = gMath.isEqualEps(aPt.$hrx, ptx);
                    expect(res).to.be.true;

                    pty = y1 + dy * hLen;
                    res = gMath.isEqualEps(aPt.$hry, pty);
                    expect(res).to.be.true;
                });
                it('Recalculate handles of anchor point for Smooth type: Start point - path opened', function() {
                    var path = new GXPath();
                    var x1 = 10;
                    var y1 = 0;
                    var x2 = 50;

                    var aPt;
                    var res;

                    var offs = 0.4;
                    var hLen;

                    path.getAnchorPoints().appendChild(new GXPath.AnchorPoint(
                        new IFPoint(x1, y1), GXPath.AnchorPoint.CType.Smooth,
                        new IFPoint(x1, y1 + 5), new IFPoint(x1, y1 - 3)));
                    path.getAnchorPoints().appendChild(new GXPath.AnchorPoint(
                        new IFPoint(x2, y1), null, new IFPoint(40, 5), new IFPoint(60, 10)));
                    path.getAnchorPoints().appendChild(new GXPath.AnchorPoint(new IFPoint(50, 70)));
                    path.getAnchorPoints().appendChild(new GXPath.AnchorPoint(new IFPoint(x1 - 10, -10)));

                    aPt = path.getAnchorPoints().getFirstChild();
                    aPt.setProperty(GXPath.AnchorPoint.PROPERTY_AUTO_HANDLES, true);

                    hLen = (x2 - x1) * offs;

                    res = gMath.isEqualEps(aPt.$hlx, x1 - hLen);
                    expect(res).to.be.true;

                    res = gMath.isEqualEps(aPt.$hly, y1);
                    expect(res).to.be.true;

                    res = gMath.isEqualEps(aPt.$hrx, x1 + hLen);
                    expect(res).to.be.true;

                    res = gMath.isEqualEps(aPt.$hry, y1);
                    expect(res).to.be.true;
                });
                it('Recalculate handles of anchor point for Smooth type: End point - path closed', function() {
                    expect(1).to.be.false;

                });
                it('Recalculate handles of anchor point for Smooth type: End point - path opened', function() {
                    expect(1).to.be.false;

                });
                it('Recalculate handles of anchor point for Smooth type: path middle point', function() {
                    expect(1).to.be.false;

                });
                it('Recalculate handles for Regular and styled corners: Start point - path closed', function() {
                    expect(1).to.be.false;

                });
                it('Recalculate handles of Regular and styled corners: Start point - path opened', function() {
                    var path = new GXPath();
                    var x1 = 10;
                    var y1 = 0;
                    var x2 = 50;
                    var y2 = y1;
                    var x3 = 50;
                    var y3 = 70;

                    var aPt;
                    var res;
                    var ptx, pty;
                    var ccntr;
                    var offs = 0.4;
                    var dirLen, hLen;
                    var dx, dy;

                    path.getAnchorPoints().appendChild(new GXPath.AnchorPoint(
                        new IFPoint(x1, y1), null, new IFPoint(x1, y1 + 5), new IFPoint(x1, y1 - 5)));
                    path.getAnchorPoints().appendChild(new GXPath.AnchorPoint(
                        new IFPoint(x2, y2), null, new IFPoint(40, 5), new IFPoint(60, 10)));
                    path.getAnchorPoints().appendChild(new GXPath.AnchorPoint(new IFPoint(x3, y3)));
                    path.getAnchorPoints().appendChild(new GXPath.AnchorPoint(new IFPoint(x1 - 10, -10)));

                    aPt = path.getAnchorPoints().getFirstChild();
                    aPt.setProperty(GXPath.AnchorPoint.PROPERTY_AUTO_HANDLES, true);

                    ccntr = gMath.getCircumcircleCenter(x1, y1, x2, y2, x3, y3);
                    dirLen = Math.sqrt(gMath.ptSqrDist(x1, y1, ccntr.getX(), ccntr.getY()));
                    dx = (y1 - ccntr.getY()) / dirLen;
                    dy = (ccntr.getX() - x1) / dirLen;
                    if (gMath.segmentSide(x1, y1, (x2 + x3)/2, (y2 + y3)/2, x2, y2) !=
                        gMath.segmentSide(x1, y1, (x2 + x3)/2, (y2 + y3)/2, x1  + dx, y1  + dy)) {
                        dx = -dx;
                        dy = -dy;
                    }

                    hLen = Math.sqrt(gMath.ptSqrDist(x1, y1, x2, y2)) * offs;

                    ptx = x1 + dx * hLen;
                    res = gMath.isEqualEps(aPt.$hrx, ptx);
                    expect(res).to.be.true;

                    pty = y1 + dy * hLen;
                    res = gMath.isEqualEps(aPt.$hry, pty);
                    expect(res).to.be.true;

                    expect(aPt.$hlx).to.be.null;
                    expect(aPt.$hly).to.be.null;
                });
                it('Recalculate handles of Regular and styled corners: End point - path closed', function() {
                    expect(1).to.be.false;

                });
                it('Recalculate handles of Regular and styled corners: End point - path opened', function() {
                    expect(1).to.be.false;

                });
                it('Recalculate handles of Regular and styled corners: path middle point', function() {
                    expect(1).to.be.false;

                });
                it('Do not affect handles of Connector anchor points: Start point - path closed', function() {
                    var path = new GXPath();
                    var x1 = 10;
                    var y1 = 0;
                    var y2 = -10;
                    var x2 = 50;
                    path.getAnchorPoints().appendChild(new GXPath.AnchorPoint(
                        new IFPoint(x1, y1), GXPath.AnchorPoint.CType.Connector,
                        new IFPoint(x1, y1 + 5), new IFPoint(x1 + 5, y1)));
                    path.getAnchorPoints().appendChild(new GXPath.AnchorPoint(
                        new IFPoint(x2, y1), null, new IFPoint(40, 5), new IFPoint(60, 10)));
                    path.getAnchorPoints().appendChild(new GXPath.AnchorPoint(new IFPoint(50, 70)));
                    path.getAnchorPoints().appendChild(new GXPath.AnchorPoint(new IFPoint(x1, y2)));
                    path.setProperty(GXPath.PROPERTY_CLOSED, true);

                    var aPt = path.getAnchorPoints().getFirstChild();
                    aPt.setProperty(GXPath.AnchorPoint.PROPERTY_AUTO_HANDLES, true);
                    expect(aPt.$hlx).to.be.equal(x1 - 5);
                    expect(aPt.$hly).to.be.equal(y1);
                    expect(aPt.$hrx).to.be.equal(x1);
                    expect(aPt.$hry).to.be.equal(y1 + 5);
                });
                it('Do not affect handles of Connector anchor points: Start point - path opened', function() {
                    var path = new GXPath();
                    var x1 = 10;
                    var y1 = 0;
                    var y2 = -10;
                    var x2 = 50;
                    path.getAnchorPoints().appendChild(new GXPath.AnchorPoint(
                        new IFPoint(x1, y1), GXPath.AnchorPoint.CType.Connector,
                        new IFPoint(x1, y1 + 5), new IFPoint(x1 + 5, y1)));
                    path.getAnchorPoints().appendChild(new GXPath.AnchorPoint(
                        new IFPoint(x2, y1), null, new IFPoint(40, 5), new IFPoint(60, 10)));
                    path.getAnchorPoints().appendChild(new GXPath.AnchorPoint(new IFPoint(50, 70)));
                    path.getAnchorPoints().appendChild(new GXPath.AnchorPoint(new IFPoint(x1, y2)));

                    var aPt = path.getAnchorPoints().getFirstChild();
                    aPt.setProperty(GXPath.AnchorPoint.PROPERTY_AUTO_HANDLES, true);
                    expect(aPt.$hlx).to.be.equal(x1 - 5);
                    expect(aPt.$hly).to.be.equal(y1);
                    expect(aPt.$hrx).to.be.equal(x1 + 5);
                    expect(aPt.$hry).to.be.equal(y1);
                });
                it('Do not affect handles of Connector anchor points: End point - path closed', function() {
                    var path = new GXPath();
                    var x1 = 10;
                    var y1 = 0;
                    var y2 = -10;
                    var x2 = 50;
                    path.getAnchorPoints().appendChild(new GXPath.AnchorPoint(new IFPoint(x1, y2)));
                    path.getAnchorPoints().appendChild(new GXPath.AnchorPoint(new IFPoint(50, 70)));
                    path.getAnchorPoints().appendChild(new GXPath.AnchorPoint(
                        new IFPoint(x2, y1), null, new IFPoint(60, 10), new IFPoint(40, 5)));
                    path.getAnchorPoints().appendChild(new GXPath.AnchorPoint(
                        new IFPoint(x1, y1), GXPath.AnchorPoint.CType.Connector,
                        new IFPoint(x1 + 5, y1), new IFPoint(x1, y1 + 5)));
                    path.setProperty(GXPath.PROPERTY_CLOSED, true);

                    var aPt = path.getAnchorPoints().getLastChild();
                    aPt.setProperty(GXPath.AnchorPoint.PROPERTY_AUTO_HANDLES, true);
                    expect(aPt.$hrx).to.be.equal(x1 - 5);
                    expect(aPt.$hry).to.be.equal(y1);
                    expect(aPt.$hlx).to.be.equal(x1);
                    expect(aPt.$hly).to.be.equal(y1 + 5);
                });
                it('Do not affect handles of Connector anchor points: End point - path opened', function() {
                    var path = new GXPath();
                    var x1 = 10;
                    var y1 = 0;
                    var y2 = -10;
                    var x2 = 50;
                    path.getAnchorPoints().appendChild(new GXPath.AnchorPoint(new IFPoint(x1, y2)));
                    path.getAnchorPoints().appendChild(new GXPath.AnchorPoint(new IFPoint(50, 70)));
                    path.getAnchorPoints().appendChild(new GXPath.AnchorPoint(
                        new IFPoint(x2, y1), null, new IFPoint(60, 10), new IFPoint(40, 5)));
                    path.getAnchorPoints().appendChild(new GXPath.AnchorPoint(
                        new IFPoint(x1, y1), GXPath.AnchorPoint.CType.Connector,
                        new IFPoint(x1 + 5, y1), new IFPoint(x1, y1 + 5)));

                    var aPt = path.getAnchorPoints().getLastChild();
                    aPt.setProperty(GXPath.AnchorPoint.PROPERTY_AUTO_HANDLES, true);
                    expect(aPt.$hrx).to.be.equal(x1 - 5);
                    expect(aPt.$hry).to.be.equal(y1);
                    expect(aPt.$hlx).to.be.equal(x1 + 5);
                    expect(aPt.$hly).to.be.equal(y1);
                });
                it('Do not affect handles of Connector anchor points: path middle point', function() {
                    var path = new GXPath();
                    var x1 = 10;
                    var y1 = 0;
                    var y2 = -10;
                    var x2 = 50;
                    path.getAnchorPoints().appendChild(new GXPath.AnchorPoint(new IFPoint(x1, y2)));
                    path.getAnchorPoints().appendChild(new GXPath.AnchorPoint(
                        new IFPoint(x1, y1), GXPath.AnchorPoint.CType.Connector,
                        new IFPoint(x1, y1 + 5), new IFPoint(x1 + 5, y1)));
                    path.getAnchorPoints().appendChild(new GXPath.AnchorPoint(
                        new IFPoint(x2, y1), null, new IFPoint(40, 5), new IFPoint(60, 10)));
                    path.getAnchorPoints().appendChild(new GXPath.AnchorPoint(new IFPoint(50, 70)));

                    path.setProperty(GXPath.PROPERTY_CLOSED, true);

                    var aPt = path.getAnchorPoints().getFirstChild().getNext();
                    aPt.setProperty(GXPath.AnchorPoint.PROPERTY_AUTO_HANDLES, true);
                    expect(aPt.$hlx).to.be.equal(x1 - 5);
                    expect(aPt.$hly).to.be.equal(y1);
                    expect(aPt.$hrx).to.be.equal(x1);
                    expect(aPt.$hry).to.be.equal(y1 + 5);
                });
            });
            it('setting corner type Smooth when auto-handles are marked works the same as setting auto handles for Smooth corner type',
                function() {

                expect(1).to.be.false;
            });
            describe('#transform', function () {
                it('Makes shift transformation of anchor point with handles', function () {
                    expect(1).to.be.false;
                });
                it('Makes scaling of anchor point with handles and shoulders(if handles or neighbour points present)',
                    function () {
                    expect(1).to.be.false;
                });
                it('Makes rotation of anchor point with handles', function () {
                    expect(1).to.be.false;
                });
                it('Makes complex transformation of anchor point with handles and shoulders', function () {
                    expect(1).to.be.false;
                });
            });
        });

        describe('AnchorPointContainer', function () {
            describe('#appendChild', function () {
                it('should add anchorPoint to container', function () {
                    var path = new GXPath();
                    var container = path.getAnchorPoints();
                    var boxWidth = 70, boxHeight = 80, brim = 20;
                    var pathWidth = 50, pathHeight = 60, pathRadiusX = 10, pathRadiusY = 10;
                    var x = 10, y = 10;

                    var anchorPointOrig = new GXPath.AnchorPoint(
                        new IFPoint(brim, brim), null, null, new IFPoint(brim + pathWidth / 2, 0));

                    expect(container.getFirstChild(true)).to.be.null;
                    container.appendChild(anchorPointOrig);

                    var anchorPoint1 = container.getFirstChild(true);

                    expect(anchorPoint1.toString()).to.equal("[GXPath.AnchorPoint]");
                    expect(anchorPoint1.$x).to.equal(anchorPointOrig.$x);
                    expect(anchorPoint1.$y).to.equal(anchorPointOrig.$y);
                    expect(anchorPoint1.$ctype).to.equal(anchorPointOrig.$ctype);

                    anchorPointOrig = new GXPath.AnchorPoint(new IFPoint(brim + pathWidth, brim),
                        GXPath.AnchorPoint.CType.Inset,
                        new IFPoint(brim + pathWidth / 3 * 2, brim + pathHeight / 3),
                        new IFPoint(pathWidth + brim, boxHeight / 2) );

                    expect(container.getLastChild(true)).to.equal(anchorPoint1);
                    container.appendChild(anchorPointOrig);
                    var anchorPoint2 = container.getLastChild(true);
                    expect(anchorPoint2).to.not.equal(anchorPoint1);
                    expect(anchorPoint2.toString()).to.equal("[GXPath.AnchorPoint]");
                    expect(anchorPoint2.$x).to.equal(anchorPointOrig.$x);
                    expect(anchorPoint2.$y).to.equal(anchorPointOrig.$y);
                    expect(anchorPoint2.$ctype).to.equal(anchorPointOrig.$ctype);
                    expect(anchorPoint2.$hlx).to.equal(anchorPointOrig.$hlx);
                    expect(anchorPoint2.$hly).to.equal(anchorPointOrig.$hly);
                    expect(anchorPoint2.$hrx).to.equal(anchorPointOrig.$hrx);
                    expect(anchorPoint2.$hry).to.equal(anchorPointOrig.$hry);
                });
            });
            describe('#readVertex', function () {
                it('calculate styled corners from anchor points and return path vertices one by one', function() {
                    expect(1).to.be.false;
                });
            });
            describe('#appendVertices', function () {
                it('Compose anchor points from source vertices and adds to container', function() {
                    expect(1).to.be.false;
                });
                it('Updates handles of the two first and last and new points according to type', function() {
                    expect(1).to.be.false;
                });
            });
            describe('#clearVertices', function () {
                it('Remove all vertices from container', function() {
                    expect(1).to.be.false;
                });
            });
            describe('#rewindVertices', function () {
                it('Reset iterator to the first child', function() {
                    expect(1).to.be.false;
                });
            });

        });

    });
})();
