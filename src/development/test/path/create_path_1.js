(function() {
    function test(scene, page, view) {
        var path = new GXPath();
        path.setProperty('closed', true);
        /*
        // path orientation 1
        var ap = new GXPathBase.AnchorPoint();
        ap.setProperties(['x', 'y', 'hrx', 'hry'], [71.2795452,261.141279, 251.140545,393.280279]);
        path.getAnchorPoints().appendChild(ap);

        var cProps = ['hlx', 'hly', 'x', 'y', 'hrx', 'hry'];

        ap = new GXPathBase.AnchorPoint();
        ap.setProperties(cProps, [250.383545,196.106279,290.383545,308.106279, 335.748545,435.129279]);
        path.getAnchorPoints().appendChild(ap);

        ap = new GXPathBase.AnchorPoint();
        ap.setProperties(cProps, [516.175545,334.176279,480.314545,207.210279, 438.309545,58.4932795]);
        path.getAnchorPoints().appendChild(ap);

        ap = new GXPathBase.AnchorPoint();
        ap.setProperties(cProps, [175.470545,-74.6727205,213.210545,51.0722795, 259.140545,204.106279]);
        path.getAnchorPoints().appendChild(ap);

        ap = new GXPathBase.AnchorPoint();
        ap.setProperties(cProps, [97.0715452,27.3492795,108.175545,132.106279, 114.280545,189.698279]);
        path.getAnchorPoints().appendChild(ap);

        ap = path.getAnchorPoints().getFirstChild();
        ap.setProperties(['hlx', 'hly'], [-108.581455,129.002279]);
        */

        // path orientation 2
        var ap = new GXPathBase.AnchorPoint();
        ap.setProperties(['x', 'y', 'hrx', 'hry'], [71.2795452,261.141279, -108.581455,129.002279]);
        path.getAnchorPoints().appendChild(ap);

        var cProps = ['hlx', 'hly', 'x', 'y', 'hrx', 'hry'];

        ap = new GXPathBase.AnchorPoint();
        ap.setProperties(cProps, [114.280545,189.698279, 108.175545,132.106279, 97.0715452,27.3492795]);
        path.getAnchorPoints().appendChild(ap);

        ap = new GXPathBase.AnchorPoint();
        ap.setProperties(cProps, [259.140545,204.106279, 213.210545,51.0722795, 175.470545,-74.6727205]);
        path.getAnchorPoints().appendChild(ap);

        ap = new GXPathBase.AnchorPoint();
        ap.setProperties(cProps, [438.309545,58.4932795, 480.314545,207.210279, 516.175545,334.176279]);
        path.getAnchorPoints().appendChild(ap);

        ap = new GXPathBase.AnchorPoint();
        ap.setProperties(cProps, [335.748545,435.129279, 290.383545,308.106279, 250.383545,196.106279]);
        path.getAnchorPoints().appendChild(ap);

        ap = path.getAnchorPoints().getFirstChild();
        ap.setProperties(['hlx', 'hly'], [251.140545,393.280279]);

        var editor = GXEditor.getEditor(scene);
        editor.insertElements([path]);

        view.zoomAll(scene.getPaintBBox(), false);
    }

    gDevelopment.tests.push({
        title: 'Create Path #1',
        category: 'Path',
        test: test
    });
})();