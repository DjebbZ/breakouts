(function() {

    var stage, preloader, spritesheet;

    function load() {

        var manifest = [{
            id: "tiles",
            src: "assets/tiles.png"
        }, {
            id: "logo",
            src: "assets/logo.png"
        }, {
            id: "background",
            src: "assets/bg_prerendered.png"
        }].concat(getAudioFiles());

        stage = new createjs.Stage('stage');

        var loadingIndicator = new createjs.Text("Loading 0%", "30px Arial", '#000');
        stage.addChild(loadingIndicator);

        loadingIndicator.x = getStageHCenter();
        loadingIndicator.y = getStageVCenter();

        // createjs.Ticker.addListener(tick);
        // createjs.Ticker.useRAF = true;
        // createjs.Ticker.setFPS(60);
        preloader = new createjs.PreloadJS();

        preloader.onProgress = handleProgress;

        preloader.onComplete = handleComplete;

        preloader.loadManifest(manifest);

        // Avoids boring typing 

        function getAudioFiles() {
            var filesNames = ['brickDeath', 'countDownBlip', 'powerdown', 'powerup', 'recover'];
            var extensions = ['.mp3', '.ogg', '.wav'];
            var result = [];

            filesNames.forEach(function(file) {
                extensions.forEach(function(extension) {
                    result.push({
                        id: file + extension,
                        src: 'assets/sfx/' + file + extension
                    });
                });
            });

            return result;
        };

        function handleProgress(event) {
            loadingIndicator.text = "Loading " + Math.floor(event.loaded * 100) + "%";
            stage.update();
        }

        function handleComplete(event) {
            stage.removeAllChildren();

            buildSpriteSheet();
            setBackground();
            setPlayer();
            setScoreBoard();
            setBall();
            setBricks();

            startGame();
        }

        function buildSpriteSheet() {
            var ss = new createjs.SpriteSheet({
                images: [preloader.getResult("tiles").result],
                frames: [
                    [0,64,48,16]
                ],
                animations: {
                    player: 0
                }
            });
            spritesheet = new createjs.BitmapAnimation(ss);
        }

        function setBackground() {
            var bg_image = preloader.getResult("background").result;
            var background = new createjs.Bitmap(bg_image);
            background.x = 0;
            background.y = 0;
            stage.addChild(background);
        }

        function setPlayer() {
            var player = spritesheet.gotoAndStop("player");
            player.x = getStageHCenter();
            player.y = 368;
            stage.addChild(player);
        }

        function setScoreBoard() {}

        function setBall() {}

        function setBricks() {}

        function startGame() {
            stage.update();
        }

        function getStageVCenter() {
            return stage.canvas.height / 2 - loadingIndicator.getMeasuredHeight() / 2;
        }

        function getStageHCenter() {
            return stage.canvas.width / 2 - loadingIndicator.getMeasuredWidth() / 2;
        }
    };

    function init() {



    };

    function tick(elapsedTime) {

        stage.update();
    };

    window.addEventListener('load', load);

})();