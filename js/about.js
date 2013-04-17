aboutState = gamvas.State.extend({
    draw: function(t){
        this.c.fillStyle = '#ff6631';
        this.c.font = 'bold 40px Oregano';
        this.c.textAlign = 'center';
        this.c.fillText("Test", 0, 0);
    }
});
