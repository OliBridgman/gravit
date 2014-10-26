(function () {
    gDevelopment.tests.push({
        title: 'Place SVG',
        test: function () {
            vex.dialog.prompt({
                message: 'Enter SVG String',
                callback: function (value) {
                    if (value) {
                        var doc = gApp.getActiveDocument();
                        var page = doc.getScene().getActivePage();
                        var editor = doc.getEditor();
                        GIO.read('test.svg', value, function (node) {
                            if (node) {
                                if (node instanceof GElement) {
                                    editor.insertElements([node], true, true);
                                    // TODO: find the reason of the issue with bbox when group from only compound path is inserted
                                    // and then remove the below temporal fix for the issue
                                    if (node instanceof GGroup) {
                                        var groupChildren = node.getChildren();
                                        for (var j = 0; j < groupChildren.length; ++j) {
                                            var child = groupChildren[j];
                                            child.setFlag(GNode.Flag.Selected);
                                            child.removeFlag(GNode.Flag.Selected);
                                        }
                                    }
                                } else {
                                    doc.getScene().getActiveLayer().appendChild(node);
                                }
                            }
                        }, {
                            baseWidth: page.getProperty('w'),
                            baseHeight: page.getProperty('h')
                        });
                    }
                }
            });
        }
    });
})();
