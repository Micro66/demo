const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.static('public'));

const players = {};
const rooms = {};
const bullets = {};

class Player {
  constructor(id, x, y, color) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.width = 40;
    this.height = 40;
    this.color = color;
    this.speed = 5;
    this.health = 100;
    this.score = 0;
    this.direction = 'right';
    this.lastShot = 0;
    this.shootCooldown = 300;
  }

  move(direction) {
    switch(direction) {
      case 'up':
        this.y = Math.max(0, this.y - this.speed);
        break;
      case 'down':
        this.y = Math.min(600 - this.height, this.y + this.speed);
        break;
      case 'left':
        this.x = Math.max(0, this.x - this.speed);
        break;
      case 'right':
        this.x = Math.min(800 - this.width, this.x + this.speed);
        break;
    }
    this.direction = direction;
  }

  shoot() {
    const now = Date.now();
    if (now - this.lastShot < this.shootCooldown) return null;

    this.lastShot = now;
    const bullet = new Bullet(
      this.id,
      this.x + this.width / 2,
      this.y + this.height / 2,
      this.direction
    );
    return bullet;
  }

  takeDamage(damage) {
    this.health -= damage;
    return this.health <= 0;
  }
}

class Bullet {
  constructor(playerId, x, y, direction) {
    this.id = Date.now() + Math.random();
    this.playerId = playerId;
    this.x = x;
    this.y = y;
    this.direction = direction;
    this.speed = 8;
    this.damage = 20;
    this.width = 6;
    this.height = 6;
  }

  update() {
    switch(this.direction) {
      case 'up':
        this.y -= this.speed;
        break;
      case 'down':
        this.y += this.speed;
        break;
      case 'left':
        this.x -= this.speed;
        break;
      case 'right':
        this.x += this.speed;
        break;
    }

    return this.x >= 0 && this.x <= 800 && this.y >= 0 && this.y <= 600;
  }
}

io.on('connection', (socket) => {
  console.log(`Player connected: ${socket.id}`);

  socket.on('joinGame', (playerName) => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];
    const color = colors[Object.keys(players).length % colors.length];

    players[socket.id] = new Player(
      socket.id,
      Math.random() * 700 + 50,
      Math.random() * 500 + 50,
      color
    );

    players[socket.id].name = playerName || `Player${Object.keys(players).length}`;

    socket.emit('playerJoined', {
      id: socket.id,
      player: players[socket.id]
    });

    socket.broadcast.emit('playerJoined', {
      id: socket.id,
      player: players[socket.id]
    });

    socket.emit('gameState', {
      players: players,
      bullets: bullets
    });
  });

  socket.on('playerMove', (direction) => {
    if (players[socket.id]) {
      players[socket.id].move(direction);
      io.emit('playerMoved', {
        id: socket.id,
        x: players[socket.id].x,
        y: players[socket.id].y,
        direction: direction
      });
    }
  });

  socket.on('playerShoot', () => {
    if (players[socket.id]) {
      const bullet = players[socket.id].shoot();
      if (bullet) {
        bullets[bullet.id] = bullet;
        io.emit('bulletShot', bullet);
      }
    }
  });

  socket.on('disconnect', () => {
    console.log(`Player disconnected: ${socket.id}`);
    if (players[socket.id]) {
      delete players[socket.id];
      io.emit('playerLeft', socket.id);
    }
  });
});

function updateGame() {
  for (let bulletId in bullets) {
    const bullet = bullets[bulletId];
    const stillActive = bullet.update();

    if (!stillActive) {
      delete bullets[bulletId];
      io.emit('bulletRemoved', bulletId);
      continue;
    }

    for (let playerId in players) {
      const player = players[playerId];
      if (player.id !== bullet.playerId &&
          bullet.x < player.x + player.width &&
          bullet.x + bullet.width > player.x &&
          bullet.y < player.y + player.height &&
          bullet.y + bullet.height > player.y) {

        const isDead = player.takeDamage(bullet.damage);
        delete bullets[bulletId];

        io.emit('bulletRemoved', bulletId);
        io.emit('playerHit', {
          playerId: player.id,
          health: player.health,
          damage: bullet.damage
        });

        if (isDead) {
          players[bullet.playerId].score += 100;
          io.emit('playerDied', {
            playerId: player.id,
            killerId: bullet.playerId,
            score: players[bullet.playerId].score
          });

          setTimeout(() => {
            if (players[player.id]) {
              players[player.id].health = 100;
              players[player.id].x = Math.random() * 700 + 50;
              players[player.id].y = Math.random() * 500 + 50;
              io.emit('playerRespawned', {
                id: player.id,
                x: players[player.id].x,
                y: players[player.id].y,
                health: players[player.id].health
              });
            }
          }, 2000);
        }
        break;
      }
    }
  }
}

setInterval(updateGame, 1000 / 60);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Thunder III game server running on port ${PORT}`);
});