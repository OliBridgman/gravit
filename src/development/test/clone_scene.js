(function () {
    gDevelopment.tests.push({
        title: 'Clone Scene',
        test: function () {
            var sceneCode = IFNode.serialize(gApp.getActiveDocument().getScene());
            var blob = JSON.parse(sceneCode);
            var scene = new IFScene();
            if (!scene.restore(blob)) {
                throw new Error('Failure.');
            }

            gApp.addDocument(scene, 'Cloned Scene');
        }
    });
})();
