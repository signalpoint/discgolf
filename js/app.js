var b2Vec2 = Box2D.Common.Math.b2Vec2,
    b2AABB = Box2D.Collision.b2AABB,
    b2Body = Box2D.Dynamics.b2Body,
    b2MouseJointDef = Box2D.Dynamics.Joints.b2MouseJointDef,
    selectedBody,
    mousePVec,
    isMouseDown = false,
    mouseX,
    mouseY,
    mouseJoint,
    destroyArray = [],
    currentLevel = null,
    totalLetters,
    doneLetters,
    start,
    inTime,
    back,
    levelDone = true,
    language = {
        start: 'Start',
        next: 'Next',
        about: 'About'
    },
    configuration = {
        hardmode: 1
    };

 WebFontConfig = {
    google: { families: [ 'Oregano::latin' ] }
  };
  (function() {
    var wf = document.createElement('script');
    wf.src = ('https:' == document.location.protocol ? 'https' : 'http') +
      '://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js';
    wf.type = 'text/javascript';
    wf.async = 'true';
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(wf, s);
  })();



   explosionEmitter = gamvas.ParticleEmitter.extend({
       // overwrite constructor
       create: function (name, x, y, img, anim) {
           // call super constructor
           this._super(name, x, y, img, anim);

           // load the fire image, centered
           var st = gamvas.state.getCurrentState();
           var fireimg = st.particles[Math.floor(Math.random() * 4)];
           fireimg.setCenter(16, 16);
           this.setImage(fireimg);

           // stop after 25 particles are emitted
           this.setParticleLimit(25);

           // emit 300 particles per second with the limit of 25
           // this emitter will emit 1/12 of a second
           this.setParticleRate(1000);

           // emitt in all directions
           this.setRotationRange(2 * Math.PI);

           // set random rotation
           this.setParticleRotationRange(2 * Math.PI);
           // continue rotation in a slow speed
           this.setParticleRotationVelocityRange(0.5);
           // emit with 100-200 pixels per second (150 + range of +/- 50)
           this.setParticleSpeed(400);
           this.setParticleSpeedRange(50);
           // fade quickly in to alpha of 0.4, then slowly out to 0
           this.setAlphaTable([[0.0, 0.0], [0.01, 1.0], [1.5, 0.0]]);
           // quickly scale to 70% size, then at 70% lifetime get 100% size
           // the rest 30% until death, scale to zero
           this.setScaleTable([[0.0, 0.0], [0.01, 0.7], [0.7, 1.0], [1.0, 0.0]]);

           // lifetime between 0.3-0.7 seconds
           this.setParticleLifeTime(0.8);
           this.setParticleLifeTimeRange(0.2);

     //      this.setActive(false);
           this.layer = 10;
       },

       draw: function (t) {
           // update the smoke emitters position to our fire emitters
           //this.smoke.setPosition(this.position.x, this.position.y);
           // draw smoke
           //this.smoke.draw(t);
           // call super draw function (aka draw fire on top of smoke)
           this._super(t);
       },

       reset: function (kill) {
           // overwrite the emitters reset function to reset ourself ...
           this._super(kill);
           // ... and our smoke emitter
           //this.smoke.reset(kill);
       }
   });



   tile = gamvas.Actor.extend({
       create: function (name, x, y, w, h) {
           this._super(name, x, y);
           var st = gamvas.state.getCurrentState();
           this.restitution = 0.3;
           this.type = 'floor';
           this.bodyRect(this.position.x, this.position.y, w, h, gamvas.physics.STATIC);
       }
   });

   buttonBehavior = gamvas.ActorState.extend({
       onMouseDown: function (button, x, y) {
           if (this.actor.fixture.GetShape().TestPoint(this.actor.fixture.GetBody().GetTransform(), new b2Vec2(gamvas.physics.toWorld(x), gamvas.physics.toWorld(y)))) {
               if (this.actor.name == 'start') {
                   currentLevel = 'hippo';
                   gamvas.state.setState('loading');
               }
               if (this.actor.name == 'next') {
                   st = gamvas.state.getCurrentState();
                   currentLevel = st.levels[currentLevel].next;
                   gamvas.state.setState('loading');
               }
               if (this.actor.name == 'about') {
                   st = gamvas.state.getCurrentState();
                   gamvas.state.setState('about');
               }
               if (this.actor.name == 'back') {
                   st = gamvas.state.getCurrentState();
                   gamvas.state.setState('menu');
               }
               if (this.actor.name == 'fb') {
                   FB.ui(
                  {
                      method: 'feed',
                      name: 'HTML5 Game Engine "Gamvas" Demo',
                      caption: 'HTML5 Game Engine "Gamvas" Demo',
                      description: (
                      'Small game written on HTML5 game engine Gamvas. ' +
                      'Gamvas has integrated Box2D physics engine, and greate particles system.'
                   ),
                      link: 'http://game.devx.lt',
                      picture: 'http://game.devx.lt/assets/animals/menu-image.jpg'
                  }
                )
               }
           }
       },
       doCollide: function () {
           return false;
       }
   });

button = gamvas.Actor.extend({
    create: function (name, x, y, w, h) {
        this._super(name, x, y);
        var st = gamvas.state.getCurrentState();
        this.type = 'button';
        this.setCenter(Math.round(w / 2), Math.round(h / 2));
        if (this.name == 'start') {
            this.setFile(st.resource.getImage('assets/gui/button.png'));
        }
        if (this.name == 'about') {
            this.setFile(st.resource.getImage('assets/gui/button.png'));
        }

        if (this.name == 'fb') {
            this.setFile(st.resource.getImage('assets/gui/fb.png'));
        }
        if (this.name == 'next') {
            this.setFile(st.resource.getImage('assets/gui/button.png'));
        }
        this.layer = 8;
        this.addState(new buttonBehavior('sample_behave'), true);
        this.bodyRect(this.position.x, this.position.y, w, h, gamvas.physics.STATIC);
    }
});

container = gamvas.Actor.extend({
    create: function(name, x, y, t) {
        var st = gamvas.state.getCurrentState(),
                image_name = t + 'b.png';
        this._super(name, x, y);
        this.type = ['container', t];
        this.setCenter(29, 29);
        if (configuration.hardmode)
            this.setFile(st.resource.getImage('assets/raw.png'));
        else
            this.setFile(st.resource.getImage('assets/alphabet_n/' + image_name));
        this.layer = 2;
        this.bodyRect(this.position.x, this.position.y, 64, 64, gamvas.physics.KINEMATIC);
    }
});

boxBehavior = gamvas.ActorState.extend({
    update: function (t) {
        if (isMouseDown && !mouseJoint) {
            var body = getBody(mouseX, mouseY, this.actor);
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
        if (o.type[0] == 'container') {
            if (o.type[1] == this.actor.type) {
                var d = Math.sqrt(Math.pow(this.actor.position.x - o.position.x, 2) + Math.pow(this.actor.position.y - o.position.y, 2));
                if (d < 40) {
                    if (isMouseDown && mouseJoint) {
                        doneLetters++;
                        gamvas.physics.getWorld().DestroyJoint(mouseJoint);
                        mouseJoint = null;
                        o.type = 'nothing';
                        destroyArray.push(o);
                        st = gamvas.state.getCurrentState();
                        o.setFile(st.resource.getImage('assets/alphabet/' + this.actor.type + 'w.png'));

                        var wp = st.camera.toWorld(o.position.x, o.position.y);
                        var emitter = new explosionEmitter('boom', wp.x, wp.y);
                        st.addActor(emitter);
                        st.removeActor(this.actor);
                    }
                }
            }
            return false;
        }
        return true;
    }
});

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
box = gamvas.Actor.extend({
    create: function (name, x, y, t) {
        var st = gamvas.state.getCurrentState();
        this._super(name, x, y);
        this.setFile(st.letters[t]);
        this.restitution = 0.5;
        this.density = 1.0;
        this.restitution = 0.2;
        this.setCenter(32, 32);
        this.type = t;
        this.layer = 4;
        this.addState(new boxBehavior('simple'), true);
        this.bodyRect(this.position.x, this.position.y, 64, 64, gamvas.physics.DYNAMIC);
        this.body.ApplyImpulse(new b2Vec2((Math.random() - 0.5) * 30, 0), this.body.GetWorldCenter());
        this.body.SetAngularVelocity((-0.6 + Math.random()) * 30);

        //this.setFixedRotation(true);
    }
});

staticBoxBehavior = gamvas.ActorState.extend({
   onCollide: function(){
       return false;
   } 
});

staticBox = gamvas.Actor.extend({
    init: function(name, x, y) {
        var st = gamvas.state.getCurrentState();
        this._super(name, x, y);
        this.setFile(st.resource.getImage('assets/box.png'));
        this.setCenter(32, 32);
        this.layer = 2;
        //this.type = 'staticbox';
        //this.addState(new staticBoxBehavior('simple'), true);
        //this.bodyRect(this.position.x, this.position.y, 48, 48, gamvas.physics.STATIC);
    }
});

background = gamvas.Actor.extend({
    create: function (name, x, y) {
        var st = gamvas.state.getCurrentState();
        this._super(name, x, y);
        if (st.name == 'menu')
            this.setFile(st.resource.getImage('assets/animals/menu-image.jpg'));
        else {
            this.setFile(st.levels[currentLevel].background);
        }
        this.layer = 0;
    }
});

character = gamvas.Actor.extend({
    create: function (name, x, y) {
        var st = gamvas.state.getCurrentState();
        this._super(name, x, y);
        this.setCenter(128, 128);
        this.setFile(st.levels[currentLevel].image);
        this.layer = 3;
    }
});

menuState = gamvas.State.extend({
    init: function () {
        gamvas.physics.resetWorld(0, 9.81, true);
        var d = gamvas.getCanvasDimension();
        gamvas.physics.pixelsPerMeter = 128;
        this.camera.setPosition(d.w / 2, d.h / 2);
    },
    enter: function () {
        this.startButton = new button('start', 400, 340, 155, 48);
        this.fbButton = new button('fb', 30, 450, 42, 42);
        this.aboutButton = new button('about', 400, 400, 155, 48);
        this.addActor(new background('menu-background', 0, 0, 'menu-image.jpg'));
        this.addActor(this.startButton);
        this.registerInputEvents(this.startButton);
        this.addActor(this.fbButton);
        this.registerInputEvents(this.fbButton);
        this.addActor(this.aboutButton);
        this.registerInputEvents(this.aboutButton);
        //this.modeButton = new button('mode', )
    },
    draw: function (t) {
        this.c.fillStyle = '#4f391e';
        this.c.font = 'bold 40px Oregano';
        this.c.textAlign = 'center';
        this.c.shadowColor = "#ffffff";
        this.c.shadowOffsetX = 2;
        this.c.shadowOffsetY = 1;
        this.c.shadowBlur = blur;
        this.c.fillText(language.start, 400, 350);
        this.c.fillText(language.about, 400, 410);
        //gamvas.physics.drawDebug();
    }
});

game_window = gamvas.Actor.extend({
    create: function(name, x, y) {
        var st = gamvas.state.getCurrentState();
        this._super(name, x, y);
        this.setCenter(160, 92);
        this.setFile(st.resource.getImage('assets/gui/window.png'));
        this.layer = 5;
    }      
});

loadingState = gamvas.State.extend({
    enter: function () {
        for (var i = 0; i < destroyArray.length; i++) {
            gamvas.state._states['level'].removeActor(destroyArray[i]);
        }
        destroyArray = [];
        isMouseDown = false;
        doneLetters = 0;
        gamvas.state._states['level'].eventActors = [];
        gamvas.state.setState('level');
    }
});

mainState = gamvas.State.extend({
    init: function () {
        this.particles = assets.loadParticles();
        this.letters = assets.loadLetters();
        this.levels = assets.loadLevels();
    },
    enter: function () {
        gamvas.physics.resetWorld(0, 9.81, true);
        var d = gamvas.getCanvasDimension();
        levelDone = false;
        this.camera.setPosition(d.w / 2, d.h / 2);
        this.addActor(new background('main_background', 0, 0));
        var ground = new tile('ground', 400, 480, 800, 2),
            cieling = new tile('cieling', 400, 0, 800, 2),
            wall1 = new tile('wall1', 0, 240, 2, 480),
            wall2 = new tile('wall2', 800, 240, 2, 480);

        this.addActor(wall1);
        this.addActor(wall2);
        this.addActor(ground);
        this.addActor(cieling);

        var level = this.levels[currentLevel];
        total = level.text.length,
            totalLength = (total * 74) - 10,
            margin = ((800 - totalLength) / 2) + 37,
            word = level.text.split(''),
            c = 0,
            used = [];
        totalLetters = total;
        doneLetters = 0;

        for (var i = 0; i < level.text.length; i++) {
            this.box = new box(level.text + 'box' + i, margin + (74 * Math.floor((Math.random() * level.text.length) + 1)), 100, word[i]);
            this.addActor(this.box);
            this.addActor(new container(level.text + 'container' + i, margin + (74 * i), 100, word[i]));
        }

        this.addActor(new character(level.text, 400, 300));
        destroyArray.push(level.text);
        this.window = new game_window('score', 400, 240);
        this.next = new button('next', 400, 300, 155, 48);
        destroyArray.push('score');
        destroyArray.push('next');
        inTime = 0;
    },
    onMouseDown: function (button, x, y) {
        mouseX = x;
        mouseY = y;
        isMouseDown = true;
    },
    onMouseUp: function () {
        isMouseDown = false;
        if (mouseJoint) {
            gamvas.physics.getWorld().DestroyJoint(mouseJoint);
            mouseJoint = null;
        }
    },
    onMouseMove: function (x, y) {
        mouseX = x;
        mouseY = y;
    },
    draw: function (t) {
        if (doneLetters == totalLetters && levelDone) {
            this.c.fillStyle = '#ff6631';
            this.c.font = 'bold 40px Oregano';
            this.c.textAlign = 'center';
            this.c.fillText(inTimeW, 400, 240);
            this.c.fillText(language.next, 400, 310);

            this.c.fillStyle = '#333';
            this.c.font = 'bold 24px Oregano';
            this.c.textAlign = 'center';
            this.c.fillText('Level Complete: ' + this.levels[currentLevel].text, 400, 173);
        }

        //gamvas.physics.drawDebug();
    },
    update: function (t) {
        inTime += t;
        if (doneLetters == totalLetters && !levelDone) {
            levelDone = true;
            inTimeW = Math.round(inTime) + ' sec.';
            isMouseDown = false;
            this.addActor(this.window);
            this.addActor(this.next);
            this.registerInputEvents(this.next);
        }
    }
});

gamvas.event.addOnLoad(function () {
    gamvas.state.addState(new menuState('menu'));
    gamvas.state.addState(new mainState('level'));
    gamvas.state.addState(new loadingState('loading'));
    gamvas.state.addState(new aboutState('about'));
    gamvas.start('game', true);
});
