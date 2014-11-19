(function () {
    gDevelopment.tests.push({
        title: 'Clone Scene',
        test: function () {
            var sceneCode = GNode.serialize(gApp.getActiveDocument().getScene());
            var blob = JSON.parse(sceneCode);
            var scene = GNode.restore(blob);
            gApp.addDocument(scene, 'Cloned Scene');
        }
    });
})();
