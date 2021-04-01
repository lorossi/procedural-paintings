// MOVE ALL OF THESE INTO THE CLASS FFS
// parameters
let position_scl, color_scl;
let pos_tolerance, life_tolerance;
let max_vel, min_life, max_life, max_weight, max_resets;
let particles_number, circle_groups, max_refills;
let time_moving;
let border;

// internal variables
let particles, circle_particles, hue_offset, refills, seed;

// constants
let PI = Math.PI;
let TWO_PI = 2 * PI;
let HALF_PI = PI / 2;



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

    this._resets = 0;
    this._x = random(width);
    this._y = random(height);

    this.reset();
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
    this._life--;
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

  reset() {
    // reset particle to starting position
    this._resets++;
    // add some randomness
    this._seed = random(0, 5 * position_scl);

    this._pos = new Vector(this._x, this._y);
    this._prev_pos = this._pos.copy();
    // reset everything
    this._sat_min = random_interval(80, 5);
    this._bri_min = random_interval(40, 5);
    this._max_life = max_life;
    // reset life, hue and width
    let n;
    n = getNoise(this._pos.x * color_scl, this._pos.y * color_scl, 1000 + this._seed);
    this._life = n * (this._max_life - min_life) + min_life;
    n = getNoise(this._pos.x * color_scl, this._pos.y * color_scl, 2000);
    this._hue = n * this._hue_interval;
    n = getNoise(this._pos.x * color_scl, this._pos.y * color_scl, 3000 + this._seed);
    this._weight = n * (max_weight - 1) + 1;

    if (time_moving) {
      this._d_hue += 360 * (this.frame_count / 6000);
      this._d_theta += TWO_PI * (this.frame_count / 12000);
    }

  }

  // get if particle is alive
  get resettable() {
    return this._pos.x < 0 - pos_tolerance ||
      this._pos.x > this._width + pos_tolerance ||
      this._pos.y < 0 - pos_tolerance ||
      this._pos.y > this._height + pos_tolerance ||
      this._life < -life_tolerance;
  }

  // get number of resets
  get resets() {
    return this._resets;
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

  // get if particle is alive
  get resettable() {
    let r;
    r = this._pos.copy().sub(this._center).mag();
    return r > this._radius + pos_tolerance * 4 ||
      this._life < -life_tolerance * 4;
  }

  get dead() {
    return this._resets > max_resets;
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
    filename = seed + ".png";
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
      new_p = new Particle(width, height, hue_offset, hue_interval);
      particles.push(new_p);
    }
  }

  createCircleParticles(groups) {
    for (let i = 0; i < groups; i++) {
      let cx, cy, r;
      cx = random_interval(this.canvas.width / 2, this.canvas.width / 4);
      cy = random_interval(this.canvas.height / 2, this.canvas.height / 4);
      r = random(this.canvas.width / 16, this.canvas.width / 8);
      let hue_interval;
      hue_interval = random_interval(10, 5);
      let circle_particles_num = PI * Math.pow(r, 2) / (this.canvas.width * this.canvas.height) * particles_number * 2;
      for (let j = 0; j < circle_particles_num; j++) {
        let new_part;
        new_part = new CircleParticle(cx, cy, r, hue_offset, hue_interval);
        circle_particles.push(new_part);
      }
    }
  }

  setup() {
    // init noise
    noise.seed(seed);
    // set parameters
    border = 0.1;
    position_scl = random_interval(0.0015, 0.001);
    color_scl = random_interval(0.0005, 0.00025);
    max_vel = random(1, 3);
    min_life = 40;
    max_life = random_interval(100, 25);
    max_weight = 5;
    max_resets = 2;
    max_refills = 1e6;
    particles_number = 25000;
    circle_groups = 5;
    time_moving = false;
    hue_offset = random(360);

    pos_tolerance = this.canvas.width / 10;
    life_tolerance = max_life / 10;
    // set seed
    seed = parseInt(Date.now() / 1e6);
    // create particles
    particles = [];
    circle_particles = [];

    refills = 0;
    this.createParticles(particles_number);
    this.createCircleParticles(circle_groups);
    // reset background - antique white
    this.background("#fffeef");
  }

  draw() {
    let x_displacement, y_displacement;
    x_displacement = this.canvas.width * border;
    y_displacement = this.canvas.height * border;

    this.ctx.save();
    this.ctx.translate(x_displacement, y_displacement);

    particles.forEach((p, i) => {
      p.show(this.ctx);
      p.move();

      if (p.resettable) {
        p.reset();
      }
    });

    circle_particles.forEach((p, i) => {
      p.show(this.ctx);
      p.move();

      if (p.resettable) {
        p.reset();
      }
    });
    this.ctx.restore();


    particles = particles.filter(p => !p.dead);
    circle_particles = circle_particles.filter(p => !p.dead);
    // difference in particles
    let particles_diff;
    particles_diff = particles_number - particles.length;

    if (particles_diff > 0 && refills < max_refills) {
      refills += particles_diff;
      this.createParticles(particles_diff);
      console.log(refills);
    }

    if (circle_particles.length == 0) {
      this.createCircleParticles(circle_groups);
    }

    if (refills > max_refills) {
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