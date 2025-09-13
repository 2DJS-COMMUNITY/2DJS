window.2DJS = (function () {
  class Engine {
    constructor(canvasId, width, height) {
      this.canvas = document.getElementById(canvasId) || document.createElement("canvas");
      this.canvas.width = width;
      this.canvas.height = height;
      if (!this.canvas.parentNode) document.body.appendChild(this.canvas);
      this.ctx = this.canvas.getContext("2d");
      this.scenes = [];
      this.activeScene = null;
      this.camera = new Camera();
    }
    addScene(scene) {
      this.scenes.push(scene);
      if (!this.activeScene) this.activeScene = scene;
    }
    start() {
      const loop = () => {
        if (this.activeScene) {
          this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
          this.activeScene.update(this);
          this.activeScene.render(this.ctx, this.camera);
        }
        requestAnimationFrame(loop);
      };
      loop();
    }
  }

  class Scene {
    constructor(name) {
      this.name = name;
      this.entities = [];
      this.triggers = [];
    }
    add(entity) { this.entities.push(entity); }
    addTrigger(trigger) { this.triggers.push(trigger); }
    update(engine) {
      this.entities.forEach(e => e.update && e.update(engine));
      this.triggers.forEach(t => t.check(engine));
    }
    render(ctx, camera) {
      this.entities.forEach(e => e.render && e.render(ctx, camera));
      this.triggers.forEach(t => t.render && t.render(ctx, camera));
    }
  }

  class Camera {
    constructor() { this.x = 0; this.y = 0; this.target = null; }
    update() {
      if (this.target) { this.x = this.target.x - 200; this.y = this.target.y - 150; }
    }
  }

  class Player {
    constructor(x, y) { this.x = x; this.y = y; this.speed = 2; this.controls = {}; }
    setControls(keys) { this.controls = keys; }
    rigid() { /* stub for physics */ }
    update() {
      if (keys[this.controls.left]) this.x -= this.speed;
      if (keys[this.controls.right]) this.x += this.speed;
      if (keys[this.controls.up]) this.y -= this.speed;
    }
    render(ctx, camera) {
      ctx.fillStyle = "red";
      ctx.fillRect(this.x - camera.x, this.y - camera.y, 30, 30);
    }
  }

  class Mesh { constructor(id) { this.id = id; } load() { console.log("Loading mesh " + this.id); } }
  class Dialogue { constructor(text, lang) { this.text = text; this.lang = lang; } }
  class Trigger {
    constructor(x, y, w, h, callback) { this.x = x; this.y = y; this.w = w; this.h = h; this.callback = callback; }
    check(engine) {
      let p = engine.activeScene.entities.find(e => e instanceof Player);
      if (p && p.x >= this.x && p.x <= this.x + this.w && p.y >= this.y && p.y <= this.y + this.h) {
        this.callback();
      }
    }
    render(ctx, camera) {
      ctx.strokeStyle = "yellow";
      ctx.strokeRect(this.x - camera.x, this.y - camera.y, this.w, this.h);
    }
  }

  class UI {
    static Create(type, opts) {
      return {
        type,
        ...opts,
        render(ctx) {
          if (type === "button") {
            ctx.fillStyle = "#4cafef";
            ctx.fillRect(opts.x, opts.y, opts.width, opts.height);
            ctx.fillStyle = "#000";
            ctx.fillText(opts.text, opts.x + 10, opts.y + 25);
          }
        }
      };
    }
  }

  const keys = {};
  window.addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
  window.addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);

  return { Engine, Scene, Player, Camera, Mesh, Dialogue, Trigger, UI };
})();
