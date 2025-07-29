class Ship {
    constructor({track, size, text, targets, canvas, ctx}) {
        this.track = track;
        this.size = size;
        this.text = text;
        this.targets =  targets;
        this.canvas = canvas;
        this.ctx = ctx;

        this.vtx_A = {
            x: (canvas.width / 2),
            y: (canvas.height / 2) - (this.size / Math.sqrt(3))
        }
        this.vtx_B = {
            x: (canvas.width / 2) + (this.size / 2),
            y: (canvas.height / 2) + (this.size / (2 * Math.sqrt(3)))
        }
        this.vtx_C = {
            x: (canvas.width / 2) - (this.size / 2),
            y: (canvas.height / 2) + (this.size / (2 * Math.sqrt(3)))
        }
    }
    draw() {
        const ctx = this.ctx;
        const canvas = this.canvas;
        if(this.targets.length !== 0) this.track = this.targets[0];

        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(this.track);
        ctx.translate(-(canvas.width / 2), -(canvas.height / 2));

        ctx.beginPath();
        ctx.lineWidth = 4;
        ctx.lineJoin = "round";
        ctx.moveTo(this.vtx_A.x, this.vtx_A.y);
        ctx.lineTo(this.vtx_B.x, this.vtx_B.y);
        ctx.lineTo(this.vtx_C.x, this.vtx_C.y);
        ctx.closePath();

        ctx.moveTo(this.vtx_A.x, this.vtx_A.y - this.size / 3);
        ctx.lineTo(this.vtx_B.x - this.size / 4, this.vtx_B.y + this.size / 6);
        ctx.lineTo(this.vtx_C.x + this.size / 4, this.vtx_C.y + this.size / 6);
        ctx.closePath();

        ctx.strokeStyle = "#dadada";
        ctx.lineWidth = 4;
        ctx.stroke();
        ctx.fillStyle = "#333333";
        ctx.fill();

        ctx.moveTo(canvas.width / 2, canvas.height / 2);
        ctx.setLineDash([1,10]);
        ctx.lineWidth = 1;
        ctx.lineTo(canvas.width / 2, -Math.max(canvas.width / 2, canvas.height / 2));
        
        ctx.strokeStyle = "grey";
        ctx.stroke();
        ctx.fill();

        ctx.restore();

        this.writeText();
    }

    writeText() {
        const ctx = this.ctx;
        const canvas = this.canvas;
        ctx.font = "20px Monospace";
        ctx.fillStyle = "yellow";
        let wordWidth = ctx.measureText(this.text).width;
        ctx.fillText(this.text, this.vtx_A.x - wordWidth / 2, canvas.height / 2 + (this.size * 2));
    }
}

class Asteroid {
    constructor({position, track, text, canvas, ctx, game}) {
        this.x = position.x;
        this.y = position.y;
        this.track = track;
        this.text = text;
        this.canvas = canvas;
        this.ctx = ctx;
        this.game = game;
        
        this.velocity = game.asteroidVelocity;
        this.alive = true;
    }
    draw() {
        const ctx = this.ctx;
        const canvas = this.canvas;
        const game = this.game;
        this.x -= this.velocity * Math.cos(this.track * (Math.PI / 6)) * game.radius[this.track];
        this.y -= this.velocity * Math.sin(this.track * (Math.PI / 6)) * game.radius[this.track];

        if(Object.is(game.asteroids[0], this)) {
            ctx.font = game.asteroidFont.active;
        } else {
            ctx.font = game.asteroidFont.passive;
        }
        var wordWidth = ctx.measureText(this.text).width;
        ctx.beginPath();
        ctx.fillStyle = "red";
        ctx.arc(this.x + Math.floor(Math.random() * 4), 
            this.y + Math.floor(Math.random() * 4), 
            wordWidth / 2 + 6, 
            0, 
            Math.PI * 2, 
            true);
        ctx.fill();
        ctx.shadowColor = "black";
        ctx.shadowBlur = 10;
        ctx.fillStyle = "yellow";
        ctx.fillText(this.text, this.x - wordWidth / 2, this.y + 5);
        ctx.shadowBlur = 0;

        if(this.destroy === true) this.shoot();

        if(Math.abs(this.x - canvas.width / 2) < 50 && Math.abs(this.y - canvas.height / 2) < 50) {
            this.alive = false;
            game.gameOver = true;
        }
        return this.alive;
    }
    shoot() {
        const ctx = this.ctx;
        const canvas = this.canvas;
        const game = this.game;
        ctx.strokeStyle = "white";
        if(!this.projectile) {
            this.projectile = {
                x: canvas.width / 2,
                y: canvas.height / 2
            }
        }
        this.projectile.x += 0.04 * Math.cos(this.track * (Math.PI / 6)) * game.radius[this.track];
        this.projectile.y += 0.04 * Math.sin(this.track * (Math.PI / 6)) * game.radius[this.track];
        ctx.beginPath();
        ctx.arc(this.projectile.x, this.projectile.y, 2, 0, Math.PI * 2, true);
        ctx.stroke();
        ctx.strokeStyle = "white";
        
        if((canvas.width / 2 - this.x)**2 + (canvas.height / 2 - this.y)**2 <= 
            (canvas.width / 2 - this.projectile.x)**2 + (canvas.height / 2 - this.projectile.y)**2) {
            this.alive = false;
            const audio = new Audio("./lib/boom.mp3");
            audio.volume = 0.1;
            audio.play();
        }
    }
}

class TypingGame {
    
    constructor(input, canvas, words, endMainGame, difficulty) {
        this.ctx = undefined; 
        this.game = undefined;
        this.input = input;
        this.canvas = canvas;
        this.words = words;
        this.endMainGame = endMainGame;
        this.difficulty = difficulty.toLowerCase();
        canvas.height = canvas.offsetHeight;
        canvas.width = canvas.offsetWidth;
    }

    spawnAsteroid = () => {
        const game = this.game;
        const canvas = this.canvas;
        const track = Math.floor(Math.random() * 12);
        const ctx = this.ctx;
        const x = (canvas.width / 2) + (Math.cos(track * (Math.PI / 6)) * game.radius[track]);
        const y = (canvas.height / 2) + (Math.sin(track * (Math.PI / 6)) * game.radius[track]);
        const map = [3,4,5,6,7,8,9,10,11,0,1,2];
        game.asteroids.push(new Asteroid({
            position: {x, y},
            track,
            text: game.words[Math.floor(Math.random() * game.words.length)],
            canvas,
            ctx,
            game
        }));
        game.ship.targets.push(map[track] * (Math.PI / 6));
    }

    endGame = () => {
        const ctx = this.ctx;
        const canvas = this.canvas;
        const game = this.game;
        game.gameOver = true;
        ctx.fillStyle = "black";
        ctx.fillRect(0,0,canvas.width,canvas.height);
        ctx.font = "100 20px Monospace";
        ctx.lineWidth = "1";
        ctx.fillStyle = "Yellow";
        ctx.fillText("Game Over", canvas.width / 2 - ctx.measureText("Game Over").width / 2, canvas.height / 2);
        ctx.font = "100 30px Monospace";
        ctx.fillText("Score: " + game.score, 
            canvas.width / 2 - ctx.measureText("Score: " + game.score).width / 2, 
            canvas.height / 2 + 50);
        this.endMainGame(true);
        // this.game = {};
        window.cancelAnimationFrame(game.gameAnimationID);
    }

    animate = () => {
        const game = this.game;
        const canvas = this.canvas;
        const ctx = this.ctx;
        game.gameAnimationID = window.requestAnimationFrame(this.animate);
        if(game.gameOver) {
            this.endGame();
            return;
        }
        if(game.pause) {
            ctx.font = "500 30px Monospace";
            ctx.fillStyle = "black";
            ctx.fillRect(canvas.width / 2 - ctx.measureText("Paused").width / 2, 
                canvas.height / 2 - 30, ctx.measureText("Paused").width, 30);
            ctx.fillStyle = "Yellow";
            ctx.fillText("Paused", canvas.width / 2 - ctx.measureText("Paused").width / 2, canvas.height / 2);
            return;
        }
        ctx.fillStyle = "black";
        ctx.fillRect(0,0,canvas.width,canvas.height);
        game.tick++;
        
        if(game.tick === game.asteroidSpawnRate || game.asteroids.length === 0) {
            game.tick = 0;
            game.asteroidSpawnRate -= 2;
            if(game.asteroidSpawnRate === 0) game.asteroidSpawnRate = 1;
            this.spawnAsteroid();
        }
        game.ship.draw();
        let indices = [];
        for(let i = game.asteroids.length - 1; i >= 0; i--) {
            if(!game.asteroids[i].draw()) indices.push(i);
        }
        indices.forEach((index) => {
            game.asteroids.splice(index, 1);
            game.ship.targets.splice(index, 1);
        });
    };

    startGame = () => {
        const canvas = this.canvas;
        const input = this.input;
        this.ctx = canvas.getContext("2d");
        const ctx = this.ctx;
        const difficulties = {
            easy: {asteroidVelocity: 0.0015, asteroidSpawnRate: 500},
            medium: {asteroidVelocity: 0.002, asteroidSpawnRate: 400},
            hard: {asteroidVelocity: 0.003, asteroidSpawnRate: 200},
        }

        ctx.fillStyle = "black";
        ctx.fillRect(0,0,canvas.width,canvas.height);

        input.focus();

        input.value = "";
        this.game = {
            pause: false,
            asteroidFont: {
                active: "700 18px Monospace",
                passive: "200 12px Monospace"
            },
            words: ["folk","load","tree","heel","palm","soil","user","crew","pool","long","worm","card"],
            asteroidVelocity: difficulties[this.difficulty].asteroidVelocity,
            asteroidSpawnRate: difficulties[this.difficulty].asteroidSpawnRate,
            tick: 0,
            score: 0,
            gameOver: false,
            gameAnimationID: null,
            radius: [
                canvas.width / 2,
                Math.min((canvas.width / 2) / Math.cos(Math.PI / 6), (canvas.height / 2) / Math.cos(Math.PI / 3)),
                Math.min((canvas.width / 2) / Math.cos(Math.PI / 3), (canvas.height / 2) / Math.cos(Math.PI / 6)),
                canvas.height / 2,
                Math.min((canvas.width / 2) / Math.cos(Math.PI / 3), (canvas.height / 2) / Math.cos(Math.PI / 6)),
                Math.min((canvas.width / 2) / Math.cos(Math.PI / 6), (canvas.height / 2) / Math.cos(Math.PI / 3)),
                canvas.width / 2,
                Math.min((canvas.width / 2) / Math.cos(Math.PI / 6), (canvas.height / 2) / Math.cos(Math.PI / 3)),
                Math.min((canvas.width / 2) / Math.cos(Math.PI / 3), (canvas.height / 2) / Math.cos(Math.PI / 6)),
                canvas.height / 2,
                Math.min((canvas.width / 2) / Math.cos(Math.PI / 3), (canvas.height / 2) / Math.cos(Math.PI / 6)),
                Math.min((canvas.width / 2) / Math.cos(Math.PI / 6), (canvas.height / 2) / Math.cos(Math.PI / 3))
            ],
            asteroids: [],
            ship: new Ship({
                track: 0,
                size: 20,
                text: "",
                targets: [],
                canvas,
                ctx
            })
        }
        if(this.words.length > 0) {
            this.game.words = this.words;
        }
        this.animate();
    };

    // startGame();

    restart = () => {
        this.game.gameOver = false;
        window.cancelAnimationFrame(this.game.gameAnimationID);
        this.startGame();
    }

}

export default TypingGame;