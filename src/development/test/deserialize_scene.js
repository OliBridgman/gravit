(function () {
    gDevelopment.tests.push({
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
    });
})();
