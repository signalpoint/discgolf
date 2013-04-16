var holding_disc = false;

// A class for our Disc physics objects.
discActor = gamvas.Actor.extend({
    create: function(name, x, y) {
      this._super(name, x, y);
      var st = gamvas.state.getCurrentState();
      this.setFile(st.resource.getImage('circle.png'));
      // set physics properties... before...
      this.restitution = 0.4;
      // ... creating the actual physics collision object
      this.bodyCircle(this.position.x, this.position.y, 16);
    }
});

// create our collision objects
wallActor = gamvas.Actor.extend({
        create: function(name, x, y, w, h) {
            this._super(name, x, y);
            var st = gamvas.state.getCurrentState();
            // check if we are a horizontal box or a vertical
            if (w>h) {
                this.setFile(st.resource.getImage('horizontal.png'));
            } else {
                this.setFile(st.resource.getImage('vertical.png'));
            }
            // create a static (non moving) rectangle
            this.bodyRect(this.position.x, this.position.y, w, h, gamvas.physics.STATIC);
        }
});

mainState = gamvas.State.extend({
        init: function() {
            // set how many pixels are considered 1m, this is a very
            // important setting on how realistic the sim looks
            // try to orient it on your objects and how long they
            // would be in real life
            gamvas.physics.pixelsPerMeter = 128;
 
            // disable object sleeping (third parameter is false)
            var w = gamvas.physics.resetWorld(0, 9.8, false);
            this.counter = 0;
            this.addObjects = [];
 
            // Create the disc.
            this.addActor(new discActor('disc', 0, 0));
 
            // Create the walls.
            this.addActor(new wallActor('ground', 0, 230, 640, 20));
            this.addActor(new wallActor('leftWall', -310, 0, 20, 480));
            this.addActor(new wallActor('rightWall', 310, 0, 20, 480));
            this.addActor(new wallActor('top', 0, -230, 640, 20));
        },
 
        draw: function(t) {
            // move/rotate the camera
            if (gamvas.key.isPressed(gamvas.key.LEFT)) {
                this.camera.rotate(-0.7*Math.PI*t);
            }
            if (gamvas.key.isPressed(gamvas.key.RIGHT)) {
                this.camera.rotate(0.7*Math.PI*t);
            }
            if (gamvas.key.isPressed(gamvas.key.UP)) {
                if (this.camera.zoomFactor < 1.5) {
                    this.camera.zoom(0.7*t);
                }
            }
            if (gamvas.key.isPressed(gamvas.key.DOWN)) {
                if (this.camera.zoomFactor > 0.1) {
                    this.camera.zoom(-0.7*t);
                }
            }
            var r = this.camera.rotation;
 
            
            if (!holding_disc) {
              // get a vector (note: we use positive 9.8 as our gravity
              // as our y coordinate runs down the screen)
              var vec = new gamvas.Vector2D(0, 9.8);
              // rotate this vector around the negative rotation
              // of the camera and set it as new gravity vector
              // this way our camera will be 'the world' and objects
              // will alwas fall down along the cameras y axis
              gamvas.physics.setGravity(vec.rotate(-r));
            }
 
            // you should always add physics object in your draw
            // function and not in your event functions, as events
            // can take place all the time and it could lead to
            // flickering and other problems adding objects in
            // event handlers
            while (this.addObjects.length > 0) {
                // get the current and remove it from the array
                var curr = this.addObjects.shift();
                console.log(this.addObjects.length);
 
                // randomize object type
                //
                // note for object creation:
                //
                // all actors need a unique name, so we use a counter
                //
                // also note that events can take place at any time
                // for the simplicity of the tutorial we create our
                // objects here, in real life you should add your
                // spawn new circular object
                this.addActor(new discActor('mousegenerated'+this.counter, curr.x, curr.y));
                this.counter++;
            }
        },
 
      onMouseDown: function(b, x, y) {
        // Left button.
        if (b == gamvas.mouse.LEFT) {
          var disc_position = disc_get_position(this.actors.disc);    
          // Did this click take place on the disc?
          if (x >= disc_position.x1 &&
              y >= disc_position.y1 &&
              x <= disc_position.x2 &&
              y <= disc_position.y2
          ) {
            // Pick up the disc (hold it), and stop gravity from acting upon it.
            holding_disc = true;
            gamvas.physics.setGravity(new gamvas.Vector2D(0, 0));
          }
        }
      },
      
      onMouseUp: function(b, x, y) {
        // If holding disc and then release disc.
        if (holding_disc && b == gamvas.mouse.LEFT) {
          // Throw disc and restart gravity.
          holding_disc = false;
          console.log(this.actors.disc.body);
          gamvas.physics.setGravity(new gamvas.Vector2D(x, 9.8));
        }
      },
      
      // mousedown event handler
      onMouseMove: function(x, y, event) {
        if (holding_disc) {
          // Move the disc to the mouse coordinates (relative to the canvas).
          this.actors.disc.setPosition(
            x - document.getElementById('gameCanvas').width/2,
            y - document.getElementById('gameCanvas').height/2
          );
        }
      },
});
 
// prevent the browser from scrolling on keyboard input
//gamvas.config.preventKeyEvents = true;
 
// fire up our game
gamvas.event.addOnLoad(function() {
    gamvas.state.addState(new mainState('mainState'));
    gamvas.start('gameCanvas', true);
});

function disc_get_position(disc) {
  // The disc position is relative to the center of the canvas, so its
  // x, y position is not relative to the top left corner of the canvas
  // (like the mouse click is). So we need to figure out its relative
  // positiong by factoring in the width and height of the canvas, and
  // the width of the disc (radius*2).
  var disc_x1 = disc.position.x +
    document.getElementById('gameCanvas').width/2 -
    disc.center.x;
  var disc_y1 = disc.position.y +
    document.getElementById('gameCanvas').height/2 -
    disc.center.y;
  var disc_x2 = disc_x1 + disc.center.x*2;
  var disc_y2 = disc_y1 + disc.center.y*2;
  return {
    x1:disc_x1,
    y1:disc_y1,
    x2:disc_x2,
    y2:disc_y2
  };
}
