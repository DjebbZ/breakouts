(function() {

    var stage, preloader, ball, bricks, paddle;

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
        }

        function handleProgress(event) {
            loadingIndicator.text = "Loading " + Math.floor(event.loaded * 100) + "%";
            stage.update();
        }

        function handleComplete(event) {
            stage.removeAllChildren();

            buildSprites();
            setBackground();
            setPaddle();
            setScoreBoard();
            setBall();
            setBricks();

            startGame();
        }

        function buildSprites() {
            var tileImage = preloader.getResult("tiles").result;

            var ballSpriteSheet = new createjs.SpriteSheet({
                images: [tileImage],
                frames: { width:16, height:16 },
                animations: {
                    ball: [51, 55]
                }
            });
            ball = new createjs.BitmapAnimation(ballSpriteSheet);

            var bricksSpriteSheet = new createjs.SpriteSheet({
                images: [tileImage],
                frames: { width:32, height:16 },
                animations: {
                    blue: 0,
                    blueDying: [0,5],
                    orange: 6,
                    orangeDying: [6,11],
                    red: 12,
                    redDying: [12,17],
                    green: 18,
                    greenDying: [18,23]
                }
            });
            bricks = new createjs.BitmapAnimation(bricksSpriteSheet);

            var paddleSpriteSheet = new createjs.SpriteSheet({
                images: [tileImage],
                frames: [
                    [0,64,48,16],
                    [0,80,32,16]
                ],
                animations: {
                    normal: 0,
                    small: 1
                }
            });
            paddle = new createjs.BitmapAnimation(paddleSpriteSheet);
        }

        function setBackground() {
            var bg_image = preloader.getResult("background").result;
            var background = new createjs.Bitmap(bg_image);
            stage.addChild(background);
        }

        function setPaddle() {
            paddle.gotoAndStop("normal");
            paddle.x = stage.canvas.width / 2 - 32;
            paddle.y = 368;
            stage.addChild(paddle);
        }

        function setScoreBoard() {}

        function setBall() {
            ball.gotoAndStop("ball");
            ball.x = 50;
            ball.y = 250;
            console.log('ball', ball);
            stage.addChild(ball);
        }

        function setBricks() {
            bricks.gotoAndStop("blue");
            bricks.x = 60;
            bricks.y = 60;
            console.log("bricks", bricks);
            stage.addChild(bricks);
        }

        function startGame() {
            stage.update();
        }

        function getStageVCenter() {
            return stage.canvas.height / 2 - loadingIndicator.getMeasuredHeight() / 2;
        }

        function getStageHCenter() {
            return stage.canvas.width / 2 - loadingIndicator.getMeasuredWidth() / 2;
        }
    }

    function init() {



    }

    function tick(elapsedTime) {

        stage.update();
    }

    window.addEventListener('load', load);

})();