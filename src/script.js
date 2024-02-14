

var canvas, stage;
var hearts = [];
var heartCopies = [];
var flowerCopies = [];
var bee;
var mouseTarget;	// the display object currently under the mouse, or being dragged
var dragStarted;	// indicates whether we are currently in a drag operation
var offset;
var update = true;

var beeState = "waiting";
var beeTarget = 0;
var beeTimer = 0;


function InitGame()
{
    canvas = document.getElementById("gameCanvas");
    stage = new createjs.Stage(canvas);
    createjs.Touch.enable(stage);

    stage.enableMouseOver(10);
	stage.mouseMoveOutside = true; // keep tracking the mouse even when it leaves the canvas

	// load the source image:
    var hrt0 = new Image();
    hrt0.src = "assets/heart_0.png";
    hearts.push(hrt0);

    var hrt1 = new Image();
    hrt1.src = "assets/heart_1.png";
    hearts.push(hrt1);

    var hrt2 = new Image();
    hrt2.src = "assets/heart_2.png";
    hearts.push(hrt2);

    var hrt3 = new Image();
    hrt3.src = "assets/heart_3.png";
    hearts.push(hrt3);

    var hrt4 = new Image();
    hrt4.src = "assets/heart_4.png";
    hearts.push(hrt4);

    var hrt5 = new Image();
    hrt5.src = "assets/heart_5.png";
    hearts.push(hrt5);

    hrt5.onload = handleHeartsLoaded;

    var beeL = new Image();
    beeL.src = "assets/bee.png";
    beeL.onload = handleBeeLoaded;

	
}

function handleBeeLoaded(event)
{
    var container = new createjs.Container();
	stage.addChild(container);

    var bitmap = new createjs.Bitmap(event.target);
    container.addChild(bitmap);
    bitmap.x = canvas.width + 32;
    bitmap.y = canvas.height / 2;
    bitmap.rotation = 360 * Math.random() | 0;
    bitmap.regX = bitmap.image.width / 2 | 0;
    bitmap.regY = bitmap.image.height / 2 | 0;
    bitmap.scale = bitmap.originalScale = Math.random() * 0.4 + 0.6;
    bitmap.name = "bee";
    bitmap.cursor = "pointer";
    bee = bitmap;
}

function handleHeartsLoaded(event)
{
    var image = new Image();
	image.src = "assets/daisy.png";
	image.onload = handleImageLoad;
}

function stop() {
	createjs.Ticker.removeEventListener("tick", tick);
}

function tick(event) {
	// this set makes it so the stage only re-renders when an event handler indicates a change has happened.
	// if (update) {
	// 	update = false; // only update once
	// 	stage.update(event);
	// }
    var deltaS = event.delta / 1000;

    for (var i = 0; i < heartCopies.length; i++)
    {
        heartCopies[i].y -= 64 * deltaS;
        if (heartCopies[i].y < 0)
        {
            heartCopies.splice(i, 1);
        }
    }

    beeTimer += deltaS;
    if (beeTimer > 5)
    {
        beeTimer = 0;
        if (beeState == "waiting")
        {
            beeState = "entering";
            beeTarget = Math.floor(Math.random()*flowerCopies.length);
            bee.y = flowerCopies[beeTarget].y;
        }
        else if (beeState == "entering")
        {
            if (Math.abs(bee.x - flowerCopies[beeTarget].x) < 8)
            {
                beeState = "onFlower";
                bee.x = flowerCopies[beeTarget].x;
                bee.y = flowerCopies[beeTarget].y;
            }
        }
        else if (beeState == "onFlower")
        {
            beeState = "exiting";
        }
        else if (beeState == "exiting")
        {
            if (bee.x > canvas.width || bee.x < 0)
            {
                beeState = "waiting";
            }
        }
        console.log(beeState);
    }

    if (beeState == "entering")
    {
        if (bee.x > flowerCopies[beeTarget].x)
        {
            bee.x -= 16 * deltaS;
        }
        else 
        {
            bee.x += 16 * deltaS;
        }
    }
    else if (beeState == "exiting")
    {
        if (bee.x > flowerCopies[beeTarget].x)
        {
            bee.x += 16 * deltaS;
        }
        else 
        {
            bee.x -= 16 * deltaS;
        }
    }

    
    stage.update();
}

function addBitmap(x, y, name, image, container)
{
    var bitmap = new createjs.Bitmap(image);
    container.addChild(bitmap);
    bitmap.x = x;
    bitmap.y = y;
    bitmap.rotation = 360 * Math.random() | 0;
    bitmap.regX = bitmap.image.width / 2 | 0;
    bitmap.regY = bitmap.image.height / 2 | 0;
    bitmap.scale = bitmap.originalScale = Math.random() * 0.4 + 0.6;
    bitmap.name = name;
    bitmap.cursor = "pointer";
    flowerCopies.push(bitmap);

    bitmap.on("mousedown", function (evt) {
        this.parent.addChild(this);
        this.offset = {x: this.x - evt.stageX, y: this.y - evt.stageY};

        var rnd = 10 * Math.random() | 0;
        for (var i = 0; i < rnd; i++)
        {
            var rnd2 = 6 * Math.random() | 0;
            var bm = new createjs.Bitmap(hearts[rnd2]);
            container.addChild(bm);
            var xrand = Math.floor(Math.random() * 101) - 50;
            bm.x = this.x + xrand;
            var yrand = Math.floor(Math.random() * 101) - 50;
            bm.y = this.y + yrand;
            bm.rotation = 360 * Math.random() | 0;
            bm.regX = bm.image.width / 2 | 0;
            bm.regY = bm.image.height / 2 | 0;
            bm.scale = bm.originalScale = Math.random() * 0.4 + 0.6;
            bm.name = name;
            bm.cursor = "pointer";
            heartCopies.push(bm);
        }
    });

    // the pressmove event is dispatched when the mouse moves after a mousedown on the target until the mouse is released.
    bitmap.on("pressmove", function (evt) {
        this.x = evt.stageX + this.offset.x;
        this.y = evt.stageY + this.offset.y;
        // indicate that the stage should be updated on the next tick:
        update = true;
    });

    bitmap.on("rollover", function (evt) {
        this.scale = this.originalScale * 1.2;
        update = true;
    });

    bitmap.on("rollout", function (evt) {
        this.scale = this.originalScale;
        update = true;
    });

}

function handleImageLoad(event) {
	var image = event.target;
	var bitmap;
	var container = new createjs.Container();
	stage.addChild(container);

	// create and populate the screen with random daisies:
    addBitmap(canvas.width/2, canvas.height/2, "start", image, container);
    addBitmap(canvas.width/2 - 32, canvas.height/2 - 32, "left0", image, container);
    addBitmap(canvas.width/2 + 32, canvas.height/2 - 32, "right0", image, container);
    addBitmap(canvas.width/2 - 64, canvas.height/2 - 64, "left1", image, container);
    addBitmap(canvas.width/2 + 64, canvas.height/2 - 64, "right1", image, container);
    addBitmap(canvas.width/2 - 96, canvas.height/2 - 64, "left2", image, container);
    addBitmap(canvas.width/2 + 96, canvas.height/2 - 64, "right2", image, container);
    addBitmap(canvas.width/2 - 128, canvas.height/2 - 64, "left3", image, container);
    addBitmap(canvas.width/2 + 128, canvas.height/2 - 64, "right3", image, container);
    addBitmap(canvas.width/2 - 160, canvas.height/2 - 32, "left4", image, container);
    addBitmap(canvas.width/2 + 160, canvas.height/2 - 32, "right4", image, container);
    addBitmap(canvas.width/2 - 160, canvas.height/2 , "left5", image, container);
    addBitmap(canvas.width/2 + 160, canvas.height/2 , "right5", image, container);
    addBitmap(canvas.width/2 - 160, canvas.height/2 + 32, "left6", image, container);
    addBitmap(canvas.width/2 + 160, canvas.height/2 + 32, "right6", image, container);
    addBitmap(canvas.width/2 - 144, canvas.height/2 + 64, "left4", image, container);
    addBitmap(canvas.width/2 + 144, canvas.height/2 + 64, "right4", image, container);
    addBitmap(canvas.width/2 - 128, canvas.height/2 + 96, "left4", image, container);
    addBitmap(canvas.width/2 + 128, canvas.height/2 + 96, "right4", image, container);
    addBitmap(canvas.width/2 - 96, canvas.height/2 + 128, "left4", image, container);
    addBitmap(canvas.width/2 + 96, canvas.height/2 + 128, "right4", image, container);
    addBitmap(canvas.width/2 - 64, canvas.height/2 + 160, "left4", image, container);
    addBitmap(canvas.width/2 + 64, canvas.height/2 + 160, "right4", image, container);
    addBitmap(canvas.width/2 - 32, canvas.height/2 + 192, "left4", image, container);
    addBitmap(canvas.width/2 + 32, canvas.height/2 + 192, "right4", image, container);
    addBitmap(canvas.width/2, canvas.height/2 + 224, "right4", image, container);

    
    
	// for (var i = 0; i < 100; i++) {
	// 	bitmap = new createjs.Bitmap(image);
	// 	container.addChild(bitmap);
	// 	bitmap.x = canvas.width * Math.random() | 0;
	// 	bitmap.y = canvas.height * Math.random() | 0;
	// 	bitmap.rotation = 360 * Math.random() | 0;
	// 	bitmap.regX = bitmap.image.width / 2 | 0;
	// 	bitmap.regY = bitmap.image.height / 2 | 0;
    //     bitmap.scale = bitmap.originalScale = Math.random() * 0.4 + 0.6;
    //     bitmap.name = "bmp_" + i;
	// 	bitmap.cursor = "pointer";

	// 	// using "on" binds the listener to the scope of the currentTarget by default
	// 	// in this case that means it executes in the scope of the button.
	// 	bitmap.on("mousedown", function (evt) {
	// 		this.parent.addChild(this);
	// 		this.offset = {x: this.x - evt.stageX, y: this.y - evt.stageY};
	// 	});

	// 	// the pressmove event is dispatched when the mouse moves after a mousedown on the target until the mouse is released.
	// 	bitmap.on("pressmove", function (evt) {
	// 		this.x = evt.stageX + this.offset.x;
	// 		this.y = evt.stageY + this.offset.y;
	// 		// indicate that the stage should be updated on the next tick:
	// 		update = true;
	// 	});

	// 	bitmap.on("rollover", function (evt) {
	// 		this.scale = this.originalScale * 1.2;
	// 		update = true;
	// 	});

	// 	bitmap.on("rollout", function (evt) {
	// 		this.scale = this.originalScale;
	// 		update = true;
	// 	});

	// }

	createjs.Ticker.addEventListener("tick", tick);
}