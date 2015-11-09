var gDevelopment = {
    tests: [
        {
            title: 'Serialize Scene',
            test: function () {
                var jsonCode = GNode.serialize(gApp.getActiveDocument().getScene());

                vex.dialog.prompt({
                    message: 'Serialized JSON String:',
                    value: GUtil.replaceAll(jsonCode, '"', '&quot;')
                });
            }
        },
        {
            title: 'Deserialize Scene',
            test: function () {
                vex.dialog.prompt({
                    message: 'Enter JSON String',
                    callback: function (value) {
                        if (value) {
                            var blob = JSON.parse(value);
                            var scene = GNode.restore(blob);
                            gApp.addDocument(scene, 'From-String');
                        }
                    }
                });
            }
        },
        {
            title: 'Create Page',
            test: function () {
                var page = new GPage(gApp.getActiveProject());
                page.setProperties(['w', 'h'], [1000, 800]);
                gApp.addDocument(page, 'Test-Page');
            }
        },
        {
            title: 'Create Canvas',
            test: function () {
                var canvas = new GCanvas(gApp.getActiveProject());
                gApp.addDocument(canvas, 'Test-Canvas');
            }
        }
    ]
};