var levels = [
        { text: 'hippo', image: 'hippopotamus.png',next: 'turtle', background: 'brown.png' },
        { text: 'turtle', image: 'turtle.png', next: 'panda', background: 'blue_brown.png' },
        { text: 'panda', image: 'panda.png', next: 'dolphin', background: 'black.png' },
        { text: 'dolphin', image: 'dolphin.png', next: 'elephant', background: 'blue.png' },
        { text: 'elephant', image: 'elephant.png', next: 'butterfly', background: 'grey.png' },
        { text: 'butterfly', image: 'butterfly.png', next: 'hippo', background: 'green.png' }
    ];
    assets = {
        loadLevels: function () {
            var st = gamvas.state.getCurrentState(),
                images = [];
            for (level in levels) {
                images[levels[level].text] = {
                    text: levels[level].text,
                    image: st.resource.getImage('assets/animals/' + levels[level].image),
                    background: st.resource.getImage('assets/animals/' + levels[level].background),
                    next: levels[level].next                    
                }
            }

            return images;
        },
        loadParticles: function () {
            var st = gamvas.state.getCurrentState(),
            particles = [
            new gamvas.Image(st.resource.getImage('assets/particles/star-1.png')),
            new gamvas.Image(st.resource.getImage('assets/particles/star-2.png')),
            new gamvas.Image(st.resource.getImage('assets/particles/star-3.png')),
            new gamvas.Image(st.resource.getImage('assets/particles/star-4.png'))
        ];
            return particles;
        },
        loadLetters: function () {
            var st = gamvas.state.getCurrentState(),
            alphabet = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'y', 'z'],
            letters = new Array();
            for (var i = 0; i < alphabet.length; i++) {
                var key = alphabet[i];
                letters[key] = st.resource.getImage('assets/alphabet/' + key + 'w.png');
            }
            return letters;
        },
        loadBackgrounds: function () {

        }

    }
