// parameters
let position_scl, color_scl;
let pos_tolerance, life_tolerance;
let max_vel, min_life, max_life, max_weight, max_resets;
let particles_number, circle_groups, line_groups, max_refills;
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

// Particle class
class Particle {
  constructor(width, height, hue_offset, hue_interval) {
    this._width = width;
    this._height = height;
    this._hue_offset = hue_offset;
    this._hue_interval = hue_interval;

    this._max_life = max_life;
    this._min_life = min_life;
    this._life = random(this._min_life, this._max_life);
    this._life_factor = 1;

    this._resets = 0;
    this._x = random(width);
    this._y = random(height);

    this.reset();
  }

  reset() {
    // reset particle to starting position
    this._resets++;
    // add some randomness
    this._seed = random(0, 5 * position_scl);
    this._pos = new Vector(this._x, this._y);
    this._prev_pos = this._pos.copy();
    // reset everything
    this._sat_min = random_interval(80, 10);
    this._bri_min = random_interval(30, 10);
    // reset hue and weight
    let n;
    n = getNoise(this._pos.x * color_scl, this._pos.y * color_scl, 2000);
    this._hue = n * this._hue_interval;
    n = getNoise(this._pos.x * color_scl, this._pos.y * color_scl, 3000 + this._seed);
    this._weight = n * (max_weight - 1) + 1;
  }

  move() {
    // generate angle and module of velocity
    let n, rho, theta;
    n = getNoise(this._pos.x * position_scl, this._pos.y * position_scl, 5000 + this._seed);
    rho = n * max_vel;
    n = getNoise(this._pos.x * position_scl, this._pos.y * position_scl, 6000 + this._seed);
    theta = n * TWO_PI;
    // create velocity vector
    let vel;
    vel = new Vector.fromAngle2D(theta).setMag(rho);
    // keep track of older position
    this._prev_pos = this._pos.copy();
    // add velocity to position
    this._pos.add(vel);
    // decrease life
    this._life -= this._life_factor;
  }

  show(ctx) {
    // calculate and ease percent for modulation
    let percent;
    percent = this._life / this._max_life;
    let eased;
    eased = ease(percent);

    // calculate color (hue, saturation, brightness, alpha)
    let hue, sat, bri;
    hue = (this._hue + this._hue_offset);
    sat = (1 - eased) * (100 - this._sat_min) + this._sat_min;
    bri = (1 - eased) * (100 - this._bri_min) + this._bri_min;

    if (hue < 0) hue += 360;
    else if (hue > 360) hue -= 360;

    if (sat < 0) sat = 0;
    else if (sat > 100) sat = 100;

    if (bri < 0) bri = 0;
    else if (bri > 100) bri = 100;

    let alpha;
    alpha = eased;
    if (alpha < 0) alpha = 0;
    else if (alpha > 1) alpha = 1;

    // calculate stroke weight
    let weight;
    weight = eased * this._weight;
    // set style
    ctx.strokeStyle = `hsla(${hue},${sat}%,${bri}%,${alpha})`;
    ctx.lineWidth = weight;
    // actually draw line between old and current point
    ctx.beginPath();
    ctx.moveTo(this._prev_pos.x, this._prev_pos.y);
    ctx.lineTo(this._pos.x, this._pos.y);
    ctx.stroke();
  }

  // get if particle has to be replaced
  get replaceable() {
    return this._pos.x < 0 - pos_tolerance ||
      this._pos.x > this._width + pos_tolerance ||
      this._pos.y < 0 - pos_tolerance ||
      this._pos.y > this._height + pos_tolerance ||
      this._life < -life_tolerance;
  }

  // check if particle is dead
  get dead() {
    return this._resets > max_resets;
  }
}

class CircleParticle extends Particle {
  constructor(cx, cy, radius, hue_offset, hue_interval) {
    super();

    this._center = new Vector(cx, cy);
    this._radius = radius;
    this._hue_offset = hue_offset;
    this._hue_interval = hue_interval;

    this._resets = 0;

    let rho, phi;
    rho = random(0, this._radius);
    phi = random(0, TWO_PI);
    let pos;
    pos = new Vector.fromAngle2D(phi).setMag(rho).add(this._center);
    this._x = pos.x;
    this._y = pos.y;
    this.reset();
  }

  // get if particle has to be replaced
  get replaceable() {
    let r;
    r = this._pos.copy().sub(this._center).mag();
    return r > this._radius + pos_tolerance ||
      this._life < -life_tolerance;
  }
}

class LineParticle extends Particle {
  constructor(x0, y0, x1, y1, width, height, hue_offset, hue_interval) {
    super();
    this._life_factor = 0.4;
    this._hue_offset = hue_offset;
    this._hue_interval = hue_interval;
    this._width = width;
    this._height = height;

    let t;
    t = random();
    this._x = x0 + t * (x1 - x0);
    this._y = y0 + t * (y1 - y0);
    this._start = new Vector(this._x, this._y);
    this._length = Math.sqrt(Math.pow(x1 - x0, 2) + Math.pow(y1 - y0, 2));
    this.reset();
  }
}


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

  createParticles(number) {
    // create particles
    for (let i = 0; i < number; i++) {
      let hue_interval;
      hue_interval = random(127, 180);

      let width, height;
      width = this.canvas.width * (1 - 2 * border);
      height = this.canvas.height * (1 - 2 * border);

      let new_p;
      new_p = new Particle(width, height, this._hue_offset, hue_interval);
      this._particles.push(new_p);
    }
  }

  createCircleParticles(groups) {
    for (let i = 0; i < groups; i++) {
      let cx, cy, r;
      cx = random_interval(this.canvas.width / 2, this.canvas.width / 8);
      cy = random_interval(this.canvas.height / 2, this.canvas.height / 8);
      r = random_interval(this.canvas.width / 6, this.canvas.width / 16);
      let circle_hue_interval;
      circle_hue_interval = random_interval(10, 5);
      let circle_particles_num;
      circle_particles_num = PI * Math.pow(r, 2) / (this.canvas.width * this.canvas.height) * particles_number * 3;
      for (let j = 0; j < circle_particles_num; j++) {
        let new_part;
        new_part = new CircleParticle(cx, cy, r, this._hue_offset, circle_hue_interval);
        this._circle_particles.push(new_part);
      }
    }
  }

  createLineParticles(groups) {
    for (let i = 0; i < groups; i++) {
      let width, height;
      width = this.canvas.width * (1 - 2 * border);
      height = this.canvas.height * (1 - 2 * border);
      let x0, y0, x1, y1;
      x0 = random(width);
      x1 = random(width);
      y0 = random(height);
      y1 = random(height);
      let line_length;
      line_length = Math.sqrt(Math.pow(x1 - x0, 2) + Math.pow(y1 - y0, 2));
      let line_hue_interval;
      line_hue_interval = random_interval(75, 40);
      let line_particles_num;
      line_particles_num = line_length * 1.75;
      for (let j = 0; j < line_particles_num; j++) {
        let new_part;
        new_part = new LineParticle(x0, y0, x1, y1, width, height, this._hue_offset, line_hue_interval);
        this._line_particles.push(new_part);
      }
    }
  }

  _initParameters() {
    // set parameters
    border = 0.15;
    position_scl = random_interval(0.002, 0.001);
    color_scl = random_interval(0.0005, 0.00025);
    max_vel = random(1, 3);
    min_life = random(40, 50);
    max_life = random(80, 120);
    max_weight = 5;
    max_resets = 3;
    particles_number = 0;
    max_refills = 100000;
    circle_groups = 0;
    line_groups = 8;
    this._hue_offset = random(360);

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
    this._circle_particles = [];
    this._line_particles = [];
    // reset end conditions
    this._particles_ended = false;
    this._groups_ended = false;
    this._refills = 0;
    // create particles
    this.createParticles(particles_number);
    this.createCircleParticles(circle_groups);
    this.createLineParticles(line_groups);
    // reset background - antique white
    this.background("#FDF5EB");
  }

  draw() {
    let x_displacement, y_displacement;
    x_displacement = this.canvas.width * border;
    y_displacement = this.canvas.height * border;

    this.ctx.save();
    this.ctx.translate(x_displacement, y_displacement);

    if (!this._particles_ended) {

      this._particles.forEach((p, i) => {
        p.show(this.ctx);
        p.move();

        if (p.replaceable) {
          p.reset();
        }
      });

      this._particles = this._particles.filter(p => !p.dead);

      let particles_diff;
      particles_diff = particles_number - this._particles.length;

      if (particles_diff > 0) {
        this._refills += particles_diff;
        this.createParticles(particles_diff);
        console.log({ particles_diff: particles_diff, refills: this._refills, max_refills: max_refills });
      }

    } else if (!this._groups_ended) {
      this._circle_particles.forEach((p, i) => {
        p.show(this.ctx);
        p.move();

        if (p.replaceable) {
          p.reset();
        }
      });
      this._circle_particles = this._circle_particles.filter(p => !p.dead);

      this._line_particles.forEach((p, i) => {
        p.show(this.ctx);
        p.move();

        if (p.replaceable) {
          p.reset();
        }
      });
      this._line_particles = this._line_particles.filter(p => !p.dead);
    }
    this.ctx.restore();

    // difference in particles
    if ((this._refills > max_refills || this._particles.length == 0) && !this._particles_ended) {
      this._particles_ended = true;
      this._groups_ended = false;
      this.createCircleParticles(circle_groups);
    }

    if (this._particles_ended && !this._groups_ended && this._circle_particles.length == 0 && this._line_particles.length == 0) {
      this._groups_ended = true;
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