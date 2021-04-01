// parameters
let position_scl, color_scl;
let pos_tolerance, life_tolerance;
let max_vel, min_life, max_life, max_weight;
let circle_groups, line_groups;
let border;

// constants
let PI = Math.PI;
let TWO_PI = 2 * PI;
let HALF_PI = PI / 2;

// main function
$(document).ready(() => {
  let canvas, ctx, s;
  // canvas selector
  canvas = $("#sketch")[0];

  // inject canvas in page
  if (canvas.getContext) {
    ctx = canvas.getContext("2d", { alpha: false });
    s = new Sketch(canvas, ctx);
    s.run();
  }

  // wait for sketch load
  if (s != undefined) {
    // handle clicks
    $(canvas).click(() => {
      s.click();
    });

    // handle keypress
    $(document).keypress((e) => {
      if (e.originalEvent.keyCode == 13) {
        // enter
        s.save();
      }
    });
  }

});

class Sketch {
  constructor(canvas, ctx, fps) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.setFps(fps);
  }

  setFps(fps) {
    // set fps
    this.fps = fps || 60;
    // keep track of time to handle fps
    this.then = performance.now();
    // time between frames
    this.fps_interval = 1 / this.fps;
  }

  run() {
    // reset frame counter
    this.frame_count = 0;
    // bootstrap the sketch
    this.setup();
    // anti alias
    this.ctx.imageSmoothingQuality = "high";
    this.timeDraw();
  }

  timeDraw() {
    // request another frame
    window.requestAnimationFrame(this.timeDraw.bind(this));
    let diff;
    diff = performance.now() - this.then;
    if (diff < this.fps_interval) {
      // not enough time has passed, so we request next frame and give up on this render
      return;
    }

    // updated last frame rendered time
    this.then = performance.now();
    // now draw
    this.ctx.save();
    this.draw();
    this.ctx.restore();
    // update frames counter
    this.frame_count++;
  }

  background(color) {
    // reset background
    // reset canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.restore();
    // set background
    this.ctx.fillStyle = color;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  click() {
    this.setup();
  }

  save() {
    let filename;
    filename = this._seed + ".png";
    let link;
    link = $("<a></a>");
    $("body").append(link);
    // set filename
    $(link).attr("download", filename);
    // add link
    $(link).attr("href", this.canvas.toDataURL("image/png"));
    // click on it
    $(link)[0].click();
    // remove it
    $(link).remove();

  }

  _createFreeParticles(density) {
    // particle boundaries
    let width, height;
    width = this.canvas.width * (1 - 2 * border);
    height = this.canvas.height * (1 - 2 * border);
    let number;
    number = width * height * density;
    // create particles
    for (let i = 0; i < number; i++) {
      // hue interval is different for each particle
      let hue_interval;
      hue_interval = random(127, 180);
      // create and push new particle
      let new_p;
      new_p = new Particle(width, height, this._hue_offset, hue_interval);
      this._particles.push(new_p);
    }
  }

  _createCircleParticles(groups) {
    // particle boundaries
    let width, height;
    width = this.canvas.width * (1 - 2 * border);
    height = this.canvas.height * (1 - 2 * border);
    for (let i = 0; i < groups; i++) {
      // center of the circular group
      let cx, cy, r;
      cx = random_interval(width / 2, width / 4);
      cy = random_interval(height / 2, height / 4);
      r = random_interval(width / 8, width / 16);
      // hue interval and offset of the group
      let circle_hue_interval;
      circle_hue_interval = random_interval(75, 40);
      let circle_hue_offset;
      circle_hue_offset = random_interval(this._hue_offset, 40);
      // number of particles in the circle, is proportional to its size
      let circle_particles_num;
      circle_particles_num = PI * Math.pow(r, 2) * 0.1;
      for (let j = 0; j < circle_particles_num; j++) {
        // create and push new particle
        let new_p;
        new_p = new CircleParticle(cx, cy, r, circle_hue_offset, circle_hue_interval);
        this._particles.push(new_p);
      }
    }
  }

  _createLineParticles(groups) {
    // particle boundaries
    let width, height;
    width = this.canvas.width * (1 - 2 * border);
    height = this.canvas.height * (1 - 2 * border);
    for (let i = 0; i < groups; i++) {
      // keep generating new coordinates until minimum length is reached
      // line length
      let line_length;
      // start and end coordinates
      let x0, y0, x1, y1;
      do {
        // generate random coordinates
        x0 = random(width);
        x1 = random(width);
        y0 = random(height);
        y1 = random(height);
        // calculate length of line
        line_length = Math.sqrt(Math.pow(x1 - x0, 2) + Math.pow(y1 - y0, 2));
      } while (line_length < width / 10 || line_length < height / 10);
      // hue interval of the group
      let line_hue_interval;
      line_hue_interval = random_interval(75, 40);
      let line_hue_offset;
      line_hue_offset = random_interval(this._hue_offset, 40);
      // number of particles is proportional to the line length
      let line_particles_num;
      line_particles_num = line_length * 1.75;
      for (let j = 0; j < line_particles_num; j++) {
        // create and push new particle
        let new_p;
        new_p = new LineParticle(x0, y0, x1, y1, width, height, line_hue_offset, line_hue_interval);
        this._particles.push(new_p);
      }
    }
  }

  _initParameters() {
    // set parameters
    border = 0.15;
    position_scl = random_interval(0.002, 0.001);
    color_scl = random_interval(0.0005, 0.00025);
    max_vel = random(1, 3);
    min_life = 50;
    max_life = random(80, 120);
    circle_groups = 0;
    line_groups = 0;
    this._hue_offset = random(360);
    this._particle_density = 0.15;

    pos_tolerance = this.canvas.width / 10;
    life_tolerance = max_life / 10;
  }

  setup() {
    // set seed
    this._seed = parseInt(Date.now() / 1e6);
    // init noise
    noise.seed(this._seed);
    // set parameters
    this._initParameters();
    // create particles
    this._particles = [];
    this._createFreeParticles(this._particle_density);
    this._createCircleParticles(circle_groups);
    this._createLineParticles(line_groups);
    // reset background - antique white
    this.background("#FDF5EB");
  }

  draw() {
    if (this._particles.length > 0) {
      // calculate canvas displacement due to border
      let x_displacement, y_displacement;
      x_displacement = this.canvas.width * border;
      y_displacement = this.canvas.height * border;

      this.ctx.save();
      this.ctx.translate(x_displacement, y_displacement);
      // draw main particles
      this._particles.forEach((p, i) => {
        p.show(this.ctx);
        p.move();

        if (p.replaceable) {
          p.reset();
        }
      });
      // remove dead particles
      this._particles = this._particles.filter(p => !p.dead);
      this.ctx.restore();
    } else {
      console.log("DONE");
    }
  }
}

// ease percentage
const ease = (x) => {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
};

// random (0-1) with no parameter, less than b with one parameter, between a and b with two parameters
const random = (a, b) => {
  if (a == undefined && b == undefined) return Math.random();
  else if (b == undefined) return Math.random() * a;
  else if (a != undefined && b != undefined) return Math.random() * (b - a) + a;
};

// random between average-interval and average+interval
const random_interval = (average, interval) => {
  return average + (Math.random() * 2 - 1) * interval;
};

// get noise for position
const getNoise = (x, y, z) => {
  let n;
  if (z === undefined) n = (1 + noise.simplex2(x, y)) / 2;
  else n = (1 + noise.simplex3(x, y, z)) / 2;
  return n;
};