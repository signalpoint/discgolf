var holding_disc = false,
    b2Vec2 = Box2D.Common.Math.b2Vec2,
    b2AABB = Box2D.Collision.b2AABB,
    b2Body = Box2D.Dynamics.b2Body,
    b2MouseJointDef = Box2D.Dynamics.Joints.b2MouseJointDef,
    selectedBody,
    mousePVec,
    isMouseDown = false,
    mouseX,
    mouseY,
    mouseJoint;

// default a actor state for the logic
discState = gamvas.ActorState.extend({
    onKeyDown: function(keyCode) {
        if (keyCode = gamvas.key.SPACE) {
            this.fireGun();
        }
    },
    fireGun: function() {
        var speed = 0;
        var force = 0;
        var vel = this.actor.body.GetLinearVelocity();
        var jump_impulse = 0;

        var st = gamvas.state.getCurrentState();
        
        var desiredVel = null;

        if (gamvas.key.isPressed(gamvas.key.SPACE)) {
            jump_impulse = this.actor.body.GetMass() * (-5 - vel.y);
            console.log(jump_impulse);
        }
        else if (gamvas.key.isPressed(gamvas.key.LEFT)) {
            this.actor.setAwake(true);
            desiredVel = -5;
        }
        else if (gamvas.key.isPressed(gamvas.key.RIGHT)) {
            this.actor.setAwake(true);
            desiredVel = 5;
        }
        else {
          desiredVel = 0;
        }

        var velChange = desiredVel - vel.x;
        var impulse = this.actor.body.GetMass() * velChange; 
        this.actor.body.ApplyImpulse(new Box2D.Common.Math.b2Vec2(impulse, jump_impulse), this.actor.body.GetWorldCenter());
    },
    update: function(t){
        if (isMouseDown && !mouseJoint) {
            var body = getBody(mouseX, mouseY, this.actor);
            console.log(this.actor.fixture);
            if (selectedBody != null) {
                var md = new b2MouseJointDef();
                md.bodyA = gamvas.physics.getWorld().GetGroundBody();
                md.bodyB = body;
                md.target.Set(gamvas.physics.toWorld(mouseX), gamvas.physics.toWorld(mouseY));
                md.collideConnected = true;
                md.maxForce = 300.0 * body.GetMass();
                mouseJoint = gamvas.physics.getWorld().CreateJoint(md);
                selectedBody.SetAwake(true);
            }
        }
        if (mouseJoint) {
            if (isMouseDown) {
                mouseJoint.SetTarget(new b2Vec2(gamvas.physics.toWorld(mouseX), gamvas.physics.toWorld(mouseY)));
            } else {
                gamvas.physics.getWorld().DestroyJoint(mouseJoint);
                mouseJoint = null;
            }
        }
    },
    doCollide: function (o) {
        if (o.type == 'nothing') {
            return false;
        }
        return true;
    }
});

// A class for our Disc physics objects.
discActor = gamvas.Actor.extend({
    create: function(name, x, y, t) {
      /*this._super(name, x, y);
      var st = gamvas.state.getCurrentState();
      this.setFile(st.resource.getImage('circle.png'));
      // Set physics properties before creating the actual physics collision
      // object.
      this.restitution = 0.4;
      this.bodyCircle(this.position.x, this.position.y, 16, gamvas.physics.DYNAMIC);
      // Create and set the state of the disc.
      this.addState(new discState('resting'));
      this.setState('resting');*/
      var st = gamvas.state.getCurrentState();
        this._super(name, x, y);
        //this.setFile(st.letters[t]);
        this.setFile(st.resource.getImage('circle.png'));
        this.restitution = 0.5;
        this.density = 1.0;
        this.restitution = 0.2;
        this.setCenter(32, 32);
        this.type = t;
        this.layer = 4;
        this.addState(new discState('simple'), true);
        //this.bodyRect(this.position.x, this.position.y, 64, 64, gamvas.physics.DYNAMIC);
        this.bodyCircle(this.position.x, this.position.y, 16, gamvas.physics.DYNAMIC);
        this.body.ApplyImpulse(new b2Vec2((Math.random() - 0.5) * 30, 0), this.body.GetWorldCenter());
        this.body.SetAngularVelocity((-0.6 + Math.random()) * 30);
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
        draw: function(t) {
            // move/rotate the camera
            /*if (gamvas.key.isPressed(gamvas.key.LEFT)) {
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
            }*/
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
        mouseX = x;
        mouseY = y;
        isMouseDown = true;
        // Left button.
        /*if (b == gamvas.mouse.LEFT) {
          var disc_position = disc_get_position(this.actors.disc);    
          // Did this click take place on the disc?
          if (x >= disc_position.x1 &&
              y >= disc_position.y1 &&
              x <= disc_position.x2 &&
              y <= disc_position.y2
          ) {
            // Pick up the disc (hold it), and stop gravity from acting upon it.
            holding_disc = true;
            //this.actors.disc.density = 0;
            //console.log(this.actors.disc.body.ApplyForce);
            //gamvas.physics.setGravity(new gamvas.Vector2D(0, 0));
            
          }
        }*/
      },
      
      onMouseUp: function(b, x, y) {
        isMouseDown = false;
        if (mouseJoint) {
            gamvas.physics.getWorld().DestroyJoint(mouseJoint);
            mouseJoint = null;
        }
        // If holding disc and then release disc.
        /*if (holding_disc && b == gamvas.mouse.LEFT) {
          // Throw disc and restart gravity.
          holding_disc = false;
          //gamvas.physics.setGravity(new gamvas.Vector2D(0, 9.8));
        }*/
      },
      
      // mousedown event handler
      onMouseMove: function(x, y, event) {
        mouseX = x;
        mouseY = y;
        /*if (holding_disc) {
          // Move the disc to the mouse coordinates (relative to the canvas).
          this.actors.disc.setPosition(
            x - document.getElementById('gameCanvas').width/2,
            y - document.getElementById('gameCanvas').height/2
          );
        }*/
      },
      
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
            
            //this.player = new myActor('player');
            //this.registerInputEvents(this.player);
 
            // Create the disc.
            this.addActor(new discActor('disc', 0, 0));
            this.registerInputEvents(this.actors.disc);
 
            // Create the walls.
            this.addActor(new wallActor('ground', 0, 230, 640, 20));
            this.addActor(new wallActor('leftWall', -310, 0, 20, 480));
            this.addActor(new wallActor('rightWall', 310, 0, 20, 480));
            this.addActor(new wallActor('top', 0, -230, 640, 20));
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

function getBody(x, y, actor) {
    mousePVec = new b2Vec2(gamvas.physics.toWorld(x), gamvas.physics.toWorld(y));
    var aabb = new b2AABB();
    aabb.lowerBound.Set(x - 0.001, y - 0.001);
    aabb.upperBound.Set(x + 0.001, y + 0.001);
    selectedBody = null;
    gamvas.physics.getWorld().QueryAABB(getBodyCB(actor.fixture), aabb);
    return selectedBody;
}

function getBodyCB(fixture) {
    if(fixture.GetBody().GetType() != b2Body.b2_staticBody) {
        if(fixture.GetShape().TestPoint(fixture.GetBody().GetTransform(), mousePVec)) {
            selectedBody = fixture.GetBody();
            return false;
        }
    }
    return true;
}

