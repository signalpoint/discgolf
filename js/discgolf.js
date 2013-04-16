helloState = gamvas.State.extend({
        // define the draw function which gets a
        // parameter t, which holds the time in seconds
        // since the last redraw
        draw: function(t) {
            // every state has this.c, which is the 2D context of the canvas
            // set our draw color to white
            this.c.fillStyle = '#fff';
            // pick some nice font
            this.c.font = 'bold 20px sans-serif';
            // our text should be drawn centered
            this.c.textAlign = 'center';
            // draw the text (note that every state has a default
            // camera that points to position 0/0)
            this.c.fillText("Hello World!", 0, 0);
        }
});

// run the following code when the page is loaded
gamvas.event.addOnLoad(function() {
    // add our state
    gamvas.state.addState(new helloState('helloworld'));
    // start the game on the canvas with id gameCanvas
    gamvas.start('gameCanvas');
});
