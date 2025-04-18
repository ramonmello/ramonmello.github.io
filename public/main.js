const canvas = document.getElementById("gameCanvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const gl = canvas.getContext("webgl");
if (!gl) {
  alert("WebGL is not supported in this browser.");
}
gl.clearColor(0.0, 0.0, 0.0, 1.0);
gl.viewport(0, 0, canvas.width, canvas.height);

let vertexShaderSource = "";
let fragmentShaderSource = "";
let program;
let positionAttributeLocation,
  resolutionUniformLocation,
  translationUniformLocation,
  rotationUniformLocation,
  colorUniformLocation;
let positionBuffer;

let ship;
let projectiles = [];
let asteroids = [];
let explosions = [];
let asteroidsDestroyed = 0;

const keys = {
  ArrowUp: false,
  ArrowLeft: false,
  ArrowRight: false,
  Space: false,
  KeyW: false,
  KeyA: false,
  KeyD: false,
};

let spacePressed = false;
let spaceWasPressed = false;

async function loadShaders() {
  try {
    const [vertexResponse, fragmentResponse] = await Promise.all([
      fetch("shaders/vertex.glsl"),
      fetch("shaders/fragment.glsl"),
    ]);

    vertexShaderSource = await vertexResponse.text();
    fragmentShaderSource = await fragmentResponse.text();
  } catch (error) {
    console.error("Error loading shaders:", error);
  }
}

function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("Error compiling shader:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function initShaders() {
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = createShader(
    gl,
    gl.FRAGMENT_SHADER,
    fragmentShaderSource
  );

  program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error("Error linking program:", gl.getProgramInfoLog(program));
  }

  positionAttributeLocation = gl.getAttribLocation(program, "a_position");
  resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");
  translationUniformLocation = gl.getUniformLocation(program, "u_translation");
  rotationUniformLocation = gl.getUniformLocation(program, "u_rotation");
  colorUniformLocation = gl.getUniformLocation(program, "u_color");

  positionBuffer = gl.createBuffer();
}

function initInputControls() {
  document.addEventListener("keydown", (event) => {
    if (keys.hasOwnProperty(event.code)) {
      keys[event.code] = true;

      if (event.code === "Space" && !spaceWasPressed) {
        spacePressed = true;
        spaceWasPressed = true;
      }
    }
  });

  document.addEventListener("keyup", (event) => {
    if (keys.hasOwnProperty(event.code)) {
      keys[event.code] = false;
      if (event.code === "Space") {
        spacePressed = false;
        spaceWasPressed = false;
      }
    }
  });

  window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
  });
}

class Projectile {
  constructor(x, y, rotation, speed = 5) {
    this.position = { x, y };
    this.velocity = {
      x: -Math.sin(rotation) * speed,
      y: Math.cos(rotation) * speed,
    };
    this.lifeTime = 0;
    this.maxLifeTime = 120;
    this.wrapped = false;
    this.vertices = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
  }

  update() {
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
    this.lifeTime++;

    if (this.position.x < 0) {
      this.position.x = canvas.width;
      this.wrapped = true;
    }
    if (this.position.x > canvas.width) {
      this.position.x = 0;
      this.wrapped = true;
    }
    if (this.position.y < 0) {
      this.position.y = canvas.height;
      this.wrapped = true;
    }
    if (this.position.y > canvas.height) {
      this.position.y = 0;
      this.wrapped = true;
    }

    if (this.wrapped) {
      const extraLifeTime = 30;
      return this.lifeTime > this.maxLifeTime + extraLifeTime;
    }
    return this.lifeTime > this.maxLifeTime;
  }

  draw() {
    gl.useProgram(program);

    gl.uniform2f(resolutionUniformLocation, canvas.width, canvas.height);
    gl.uniform2f(translationUniformLocation, this.position.x, this.position.y);
    gl.uniform1f(rotationUniformLocation, 0);
    gl.uniform4f(colorUniformLocation, 1, 1, 1, 1);

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
}

class ShipTrail {
  constructor(x, y, rotation, opacity) {
    this.position = { x, y };
    this.rotation = rotation;
    this.opacity = opacity;
    this.vertices = new Float32Array([0, 22.5, -7.5, -15, 7.5, -15]);
  }

  draw() {
    gl.useProgram(program);

    gl.uniform2f(resolutionUniformLocation, canvas.width, canvas.height);
    gl.uniform2f(translationUniformLocation, this.position.x, this.position.y);
    gl.uniform1f(rotationUniformLocation, this.rotation);
    gl.uniform4f(colorUniformLocation, 1, 1, 1, this.opacity);

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
}

class Explosion {
  constructor(x, y) {
    this.position = { x, y };
    this.lifeTime = 0;
    this.maxLifeTime = 60;
    this.particles = [];
    this.numParticles = 20;

    for (let i = 0; i < this.numParticles; i++) {
      const angle = (Math.PI * 2 * i) / this.numParticles;
      const speed = 1 + Math.random() * 2;
      this.particles.push({
        x: 0,
        y: 0,
        velocity: {
          x: Math.cos(angle) * speed,
          y: Math.sin(angle) * speed,
        },
        size: 2 + Math.random() * 3,
      });
    }
  }

  update() {
    this.lifeTime++;

    this.particles.forEach((particle) => {
      particle.x += particle.velocity.x;
      particle.y += particle.velocity.y;
      particle.velocity.x *= 0.95;
      particle.velocity.y *= 0.95;
    });

    return this.lifeTime >= this.maxLifeTime;
  }

  draw() {
    gl.useProgram(program);
    const opacity = 1 - this.lifeTime / this.maxLifeTime;

    this.particles.forEach((particle) => {
      const vertices = new Float32Array([
        -particle.size,
        -particle.size,
        particle.size,
        -particle.size,
        -particle.size,
        particle.size,
        particle.size,
        particle.size,
      ]);

      gl.uniform2f(resolutionUniformLocation, canvas.width, canvas.height);
      gl.uniform2f(
        translationUniformLocation,
        this.position.x + particle.x,
        this.position.y + particle.y
      );
      gl.uniform1f(rotationUniformLocation, 0);
      gl.uniform4f(colorUniformLocation, 1, 1, 1, opacity);

      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
      gl.enableVertexAttribArray(positionAttributeLocation);
      gl.vertexAttribPointer(
        positionAttributeLocation,
        2,
        gl.FLOAT,
        false,
        0,
        0
      );

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    });
  }
}

class Ship {
  constructor(x, y) {
    this.position = { x, y };
    this.velocity = { x: 0, y: 0 };
    this.rotation = 0;
    this.acceleration = 0.1;
    this.maxSpeed = 3;
    this.rotationSpeed = 0.05;
    this.friction = 0.99;
    this.lastShot = 0;
    this.shotCooldown = 15;
    this.isDestroyed = false;

    this.trailPositions = [];
    this.maxTrailLength = 10;
    this.trailUpdateCounter = 0;
    this.trailUpdateInterval = 4;

    this.vertices = new Float32Array([0, 22.5, -7.5, -15, 7.5, -15]);
  }

  update() {
    if (this.isDestroyed) {
      return;
    }

    // Ship rotation
    if (keys.ArrowLeft || keys.KeyA) this.rotation -= this.rotationSpeed;
    if (keys.ArrowRight || keys.KeyD) this.rotation += this.rotationSpeed;

    // Thrust and friction
    if (keys.ArrowUp || keys.KeyW) {
      this.velocity.x -= Math.sin(this.rotation) * this.acceleration;
      this.velocity.y += Math.cos(this.rotation) * this.acceleration;

      const speed = Math.hypot(this.velocity.x, this.velocity.y);
      if (speed > this.maxSpeed) {
        this.velocity.x = (this.velocity.x / speed) * this.maxSpeed;
        this.velocity.y = (this.velocity.y / speed) * this.maxSpeed;
      }
    } else {
      this.velocity.x *= this.friction;
      this.velocity.y *= this.friction;
      if (Math.abs(this.velocity.x) < 0.01) this.velocity.x = 0;
      if (Math.abs(this.velocity.y) < 0.01) this.velocity.y = 0;
    }

    // Update position
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    // Boundary check
    if (this.position.x < 0) this.position.x = canvas.width;
    if (this.position.x > canvas.width) this.position.x = 0;
    if (this.position.y < 0) this.position.y = canvas.height;
    if (this.position.y > canvas.height) this.position.y = 0;

    this.lastShot++;
    this.updateTrail();
  }

  updateTrail() {
    this.trailUpdateCounter++;

    if (this.trailUpdateCounter >= this.trailUpdateInterval) {
      this.trailUpdateCounter = 0;

      this.trailPositions.unshift({
        x: this.position.x,
        y: this.position.y,
        rotation: this.rotation,
      });

      if (this.trailPositions.length > this.maxTrailLength) {
        this.trailPositions.pop();
      }
    }
  }

  shoot() {
    if (this.lastShot >= this.shotCooldown) {
      const tipX = this.position.x - Math.sin(this.rotation) * 22.5;
      const tipY = this.position.y + Math.cos(this.rotation) * 22.5;
      const projectile = new Projectile(tipX, tipY, this.rotation);
      this.lastShot = 0;
      return projectile;
    }
    return null;
  }

  destroy() {
    if (this.isDestroyed) return;
    this.isDestroyed = true;
    this.trailPositions = [];
    explosions.push(new Explosion(this.position.x, this.position.y));
  }

  respawn() {
    this.isDestroyed = false;
    this.position = { x: canvas.width / 2, y: canvas.height / 2 };
    this.velocity = { x: 0, y: 0 };
    this.rotation = 0;
  }

  draw() {
    if (this.isDestroyed) return;

    gl.useProgram(program);

    gl.uniform2f(resolutionUniformLocation, canvas.width, canvas.height);
    gl.uniform2f(translationUniformLocation, this.position.x, this.position.y);
    gl.uniform1f(rotationUniformLocation, this.rotation);
    gl.uniform4f(colorUniformLocation, 1, 1, 1, 1);

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
}

class Asteroid {
  constructor(x, y, size = 30) {
    this.position = { x, y };
    this.size = size;
    this.rotation = Math.random() * Math.PI * 2;
    this.rotationSpeed = (Math.random() - 0.5) * 0.02;

    const speed = 0.5 + Math.random() * 1;
    const angle = Math.random() * Math.PI * 2;
    this.velocity = {
      x: Math.cos(angle) * speed,
      y: Math.sin(angle) * speed,
    };

    this.vertices = this.generateVertices();
  }

  generateVertices() {
    const vertices = [];
    const numPoints = 8;
    const angleStep = (Math.PI * 2) / numPoints;

    for (let i = 0; i < numPoints; i++) {
      const angle = i * angleStep;
      const radius = this.size * (0.8 + Math.random() * 0.4);
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      vertices.push(x, y);
    }

    return new Float32Array(vertices);
  }

  update() {
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
    this.rotation += this.rotationSpeed;

    if (this.position.x < -this.size)
      this.position.x = canvas.width + this.size;
    if (this.position.x > canvas.width + this.size)
      this.position.x = -this.size;
    if (this.position.y < -this.size)
      this.position.y = canvas.height + this.size;
    if (this.position.y > canvas.height + this.size)
      this.position.y = -this.size;
  }

  draw() {
    gl.useProgram(program);

    gl.uniform2f(resolutionUniformLocation, canvas.width, canvas.height);
    gl.uniform2f(translationUniformLocation, this.position.x, this.position.y);
    gl.uniform1f(rotationUniformLocation, this.rotation);
    gl.uniform4f(colorUniformLocation, 0.8, 0.8, 0.8, 1);

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

    gl.drawArrays(gl.LINE_LOOP, 0, this.vertices.length / 2);
  }
}

function checkCollision(ship, asteroid) {
  const dx = ship.position.x - asteroid.position.x;
  const dy = ship.position.y - asteroid.position.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  const shipRadius = 15;
  return distance < shipRadius + asteroid.size;
}

function checkProjectileAsteroidCollision(projectile, asteroid) {
  const dx = projectile.position.x - asteroid.position.x;
  const dy = projectile.position.y - asteroid.position.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  const projectileRadius = 1;
  return distance < projectileRadius + asteroid.size;
}

function createAsteroidOutsideCanvas() {
  const side = Math.floor(Math.random() * 4);
  let x, y;

  switch (side) {
    case 0: // top
      x = Math.random() * canvas.width;
      y = -30;
      break;
    case 1: // right
      x = canvas.width + 30;
      y = Math.random() * canvas.height;
      break;
    case 2: // bottom
      x = Math.random() * canvas.width;
      y = canvas.height + 30;
      break;
    case 3: // left
      x = -30;
      y = Math.random() * canvas.height;
      break;
  }

  return new Asteroid(x, y);
}

function updateAsteroidCounter() {
  const counterElement = document.getElementById("asteroidCounter");
  counterElement.textContent = `Score: ${asteroidsDestroyed}`;
}

function showGameOver() {
  const gameOverMessage = document.getElementById("gameOverMessage");
  if (gameOverMessage.style.display !== "block") {
    const gameOverScore = document.getElementById("gameOverScore");
    gameOverScore.textContent = `Score: ${asteroidsDestroyed}`;
    gameOverMessage.style.display = "block";
  }
}

function updateGame() {
  ship.update();

  if (spacePressed) {
    const newProjectile = ship.shoot();
    if (newProjectile) {
      projectiles.push(newProjectile);
    }
    spacePressed = false;
  }

  projectiles = projectiles.filter((proj) => !proj.update());
  asteroids.forEach((asteroid) => asteroid.update());
  explosions = explosions.filter((explosion) => !explosion.update());

  if (!ship.isDestroyed) {
    for (const asteroid of asteroids) {
      if (checkCollision(ship, asteroid)) {
        ship.destroy();
        break;
      }
    }
  }

  for (let i = projectiles.length - 1; i >= 0; i--) {
    const projectile = projectiles[i];
    let projectileHit = false;

    for (let j = asteroids.length - 1; j >= 0; j--) {
      const asteroid = asteroids[j];

      if (
        checkProjectileAsteroidCollision(projectile, asteroid) &&
        !ship.isDestroyed
      ) {
        projectiles.splice(i, 1);
        projectileHit = true;

        explosions.push(
          new Explosion(asteroid.position.x, asteroid.position.y)
        );
        asteroids.splice(j, 1);
        asteroidsDestroyed++;
        updateAsteroidCounter();

        asteroids.push(createAsteroidOutsideCanvas());
        asteroids.push(createAsteroidOutsideCanvas());

        break;
      }
    }

    if (projectileHit) break;
  }

  if (ship.isDestroyed) {
    showGameOver();
  }
}

function renderGame() {
  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  if (ship.trailPositions.length > 0) {
    ship.trailPositions.forEach((pos, index) => {
      const opacity = 0.3 - index / ship.trailPositions.length;
      const trail = new ShipTrail(pos.x, pos.y, pos.rotation, opacity);
      trail.draw();
    });
  }

  asteroids.forEach((asteroid) => asteroid.draw());
  ship.draw();
  projectiles.forEach((proj) => proj.draw());
  explosions.forEach((explosion) => explosion.draw());
}

function gameLoop() {
  updateGame();
  renderGame();
  requestAnimationFrame(gameLoop);
}

function initGame() {
  initInputControls();
  initShaders();

  ship = new Ship(canvas.width / 2, canvas.height / 2);

  for (let i = 0; i < 5; i++) {
    asteroids.push(createAsteroidOutsideCanvas());
  }

  updateAsteroidCounter();

  const playAgainButton = document.getElementById("playAgainButton");
  playAgainButton.addEventListener("click", resetGame);

  gameLoop();
}

function resetGame() {
  const gameOverMessage = document.getElementById("gameOverMessage");
  gameOverMessage.style.display = "none";

  asteroidsDestroyed = 0;
  updateAsteroidCounter();

  projectiles = [];
  asteroids = [];
  explosions = [];

  ship = new Ship(canvas.width / 2, canvas.height / 2);

  for (let i = 0; i < 5; i++) {
    asteroids.push(createAsteroidOutsideCanvas());
  }
}

async function startGame() {
  try {
    await loadShaders();
    initGame();
  } catch (error) {
    console.error("Failed to launch the game: ", error);
  }
}

startGame();
