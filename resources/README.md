#Breakouts -- Resources

This directory contains the resources used in the breakout implementations. If you are adding a new implementation (thank you!) then please use these resources as closely as possible.

## What's Here

These are the images, sound and other misc resource files used in the breakouts. If you are adding a new engine, just copy these files locally into that engine's directory.

### Images

![tiles.png](https://raw.github.com/city41/breakouts/master/resources/tiles.png)  
* `tiles.png` -- these are all of the graphics in the entire game. Each tile is 16x16 and some entities take up more than one tile (like the paddle and countdown numbers). The bricks include frame animations for spawning (when a level first starts) and for death (when a ball hits them). Using these frame animations is optional. If your engine offers scaling or other kinds of animations that can accomplish a similar effect, feel free to do so. For example, the [LimeJS](https://github.com/city41/breakouts/tree/master/breakouts/limejs) version has `ScaleTo` built in, and so uses that to scale the bricks up and down. But the [ImpactJS](https://github.com/city41/breakouts/tree/master/breakouts/impactjs) and [CraftyJS](https://github.com/city41/breakouts/tree/master/breakouts/craftyjs) versions use the frame animation as frame animation is the only type they natively support. For the ball animation, please use the frames here and animate it that way.  

![logo.png](https://raw.github.com/city41/breakouts/master/resources/logo.png)  
* `logo.png` --  This is the main logo for the game, used on the main menu, game over and game won screens. Using the title that is baked into this image is optional. Some engines offer nice text rendering support, and so they cut the image off at the title and render their own.

### Audio

These audio files are in the `sfx` directory and provided in mp3, ogg and wav format. Generally that should account for all browsers. These sound effects were generated using [cfxr](http://thirdcog.eu/apps/cfxr) which is the Mac port of [sfxr](http://www.drpetter.se/project_sfxr.html).

* `brickDeath` -- played whenever the ball hits a brick and destroys it
* `countdownBlip` -- played everytime the starting countdown ticks over to the next number 3... 2... 1...
* `powerdown` -- played whenever the player gets a powerdown
* `powerup` -- played whenever the player gets a powerup
* `recover` -- played when the powerdown wears off and the paddle returns to full size

### Tiled bmx file

* `bg.tmx` -- the tile layout for the walls and background of the game and the menu screens

Use of this file is optional. But if your engine natively supports Tiled TMX files (or can do so easily with a plugin), please use it. If your engine supports another tile format and you want to include files for that format here, no problem. Just send me a pull request or contact me and let me know.
