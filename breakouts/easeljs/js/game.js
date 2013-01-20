(function() {

    /**
     * Main object
     * @type {Object}
     */
    var Game = {
        /**
         * EaselJS stage from canvas
         * @type {createjs.Stage}
         */
        stage: null,

        /**
         * Text that shows loading of the game
         * @type {createjs.Text}
         */
        loadingIndicator: null,

        /**
         * Loads and holds assets
         * @type {createjs.Preloader}
         */
        loader: null,

        /**
         * Reference to the current level
         * @type {Level}
         */
        currentLevel: null,

        /**
         * Application starter function
         */
        initialize: function() {
            Game.stage = new createjs.Stage('stage');

            Game.loadAssets();
        },

        /**
         * Load game assets and show loading indicator
         * @return {[type]} [description]
         */
        loadAssets: function() {
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

            Game.loadingIndicator = new createjs.Text("Loading 0%", "30px Arial", '#000');
            Game.loadingIndicator.x = 150;
            Game.loadingIndicator.y = 200;
            Game.stage.addChild(Game.loadingIndicator);

            Game.loader = new createjs.PreloadJS();

            Game.loader.onProgress = handleProgress;

            Game.loader.onComplete = handleComplete;

            Game.loader.loadManifest(manifest);

            /**
             * Avoids boring type
             * @return {Array} manifest for audio files
             */
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

            function handleProgress() {
                Game.loadingIndicator.text = "Loading " + Math.floor(event.loaded * 100) + "%";
                Game.stage.update();
            }

            function handleComplete() {
                Game.stage.removeAllChildren();

                //
                Game.currentLevel = new Level(1);

                Game.updateLoop();
            }
        },

        updateLoop: function() {
            createjs.Ticker.addListener(Game.tick);
            createjs.Ticker.useRAF = true;
            createjs.Ticker.setFPS(60);
        },

        tick: function(elapsedTime) {
          Game.stage.update();
        }
    };

    var Bricks = function(tileImage) {
        var bricksSpriteSheet = new createjs.SpriteSheet({
            images: [tileImage],
            frames: {
                width: 32,
                height: 16
            },
            animations: {
                blue: 0,
                blueDying: [0, 5],
                orange: 6,
                orangeDying: [6, 11],
                red: 12,
                redDying: [12, 17],
                green: 18,
                greenDying: [18, 23]
            }
        });
        this.sprite = new createjs.BitmapAnimation(bricksSpriteSheet);
    };

    var Ball = function(tileImage) {
        var ballSpriteSheet = new createjs.SpriteSheet({
            images: [tileImage],
            frames: {
                width: 16,
                height: 16
            },
            animations: {
                ball: {
                    frames: [51, 52, 53, 54, 55],
                    frequency: 2
                }
            }
        });
        this.sprite = new createjs.BitmapAnimation(ballSpriteSheet);
    };

    var Paddle = function(tileImage) {
        var paddleSpriteSheet = new createjs.SpriteSheet({
            images: [tileImage],
            frames: [
                [0, 64, 48, 16],
                [0, 80, 32, 16]
            ],
            animations: {
                normal: 0,
                small: 1
            }
        });
        this.sprite = new createjs.BitmapAnimation(paddleSpriteSheet);
    };

    var Level = function(levelNumber) {
        this.number = levelNumber - 1;

        /**
         * There can be several `Ball`s at the same time
         * @type {Array}
         */
        this.balls = [];

        /**
         * Every `Brick` physically present in the level
         * @type {Array}
         */
        this.bricks = [];

        /**
         * The `Paddle` controlled by the player
         * @type {Paddle}
         */
        this.paddle = null;

        this.create();

    };

    Level.levelsMap = [
        [{
            color: "green",
            x: 118,
            y: 77
        }, {
            color: "orange",
            x: 150,
            y: 77
        }, {
            color: "green",
            x: 182,
            y: 77
        }, {
            color: "orange",
            x: 54,
            y: 93
        }, {
            color: "blue",
            x: 86,
            y: 93
        }, {
            color: "green",
            x: 118,
            y: 93
        }, {
            color: "green",
            x: 150,
            y: 93
        }, {
            color: "green",
            x: 182,
            y: 93
        }, {
            color: "blue",
            x: 214,
            y: 93
        }, {
            color: "orange",
            x: 246,
            y: 93
        }, {
            color: "blue",
            x: 86,
            y: 109
        }, {
            color: "blue",
            x: 118,
            y: 109
        }, {
            color: "blue",
            x: 150,
            y: 109
        }, {
            color: "blue",
            x: 182,
            y: 109
        }, {
            color: "blue",
            x: 214,
            y: 109
        }]
    ];

    /**
     * Create and displays the graphics and game objects for a level
     * @return {Level} itsel for chaining
     */
    Level.prototype.create = function() {
        var tileImage = Game.loader.getResult("tiles").result;

        // Adding a ball to the stage
        var ball = new Ball(tileImage);
        ball.sprite.gotoAndStop("ball");
        ball.sprite.x = 50;
        ball.sprite.y = 250;
        Game.stage.addChild(ball.sprite);
        this.balls.push(ball);

        // Adding bricks to the stage
        var bricks = new Bricks(tileImage);
        Level.levelsMap[this.number].forEach(function(brickInfo) {
            bricks.sprite.gotoAndStop(brickInfo.color);
            bricks.sprite.x = brickInfo.x;
            bricks.sprite.y = brickInfo.y;
            Game.stage.addChild(bricks.sprite);
            this.bricks.push(bricks.sprite);
            bricks.sprite = bricks.sprite.clone();
        }, this);

        // Adding the paddle
        var paddle = new Paddle(tileImage);
        paddle.sprite.gotoAndStop("normal");
        paddle.sprite.x = Game.stage.canvas.width / 2 - 32;
        paddle.sprite.y = 368;
        Game.stage.addChild(paddle.sprite);
        this.paddle = paddle;

        return this;
    };

    window.addEventListener('load', Game.initialize);

})();