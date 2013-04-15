// Create the canvas
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");

// Set canvas width and height.
canvas.width = 800;
canvas.height = 600;

// Center coordinates.
var center_x = canvas.width/2;
var center_y = canvas.height/2;

// Add canvas to document body.
document.body.appendChild(canvas);

// Game variables.
var strokes = 0;

// Handle keyboard controls
var keysDown = {};

// Reset the game when the player catches a basket.
var reset = function () {

};

// Update game objects
var update = function (modifier,now,then) {

};

// Draw everything
var render = function () {
  
  // Set canvas background color.
  ctx.fillStyle="#FFFFFF";
  ctx.fillRect(0,0,canvas.width,canvas.height);

	// Score
	ctx.fillStyle = "rgb(0, 0, 0)";
	ctx.font = "24px Helvetica";
	ctx.textAlign = "left";
	ctx.textBaseline = "top";
	ctx.fillText("Strokes: " + strokes, 32, 32);

};

// The main game loop
var main = function () {
	var now = Date.now();
	var delta = now - then;

	update(delta / 1000,now,then);
	render();

	then = now;
};

// Let's play this stupid game!
reset();
var then = Date.now();
setInterval(main, 1); // Execute as fast as possible
