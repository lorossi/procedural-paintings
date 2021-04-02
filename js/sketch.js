// parameters
let position_scl, color_scl;

// constants
let PI = Math.PI;
let TWO_PI = 2 * PI;
let HALF_PI = PI / 2;

// Sketch class
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

  antique_background() {
    // add back color
    this.background("hsla(33, 82%, 96%, 1)");
    // add noise
    let scl;
    scl = 4;
    let background_scl;
    background_scl = 0.005;
    for (let x = 0; x < this.canvas.width; x += scl) {
      for (let y = 0; y < this.canvas.height; y += scl) {
        let n, bri, alpha;
        n = getNoise(x * background_scl, y * background_scl, 10000);
        bri = n * (100 - 90) + 90;
        n = getNoise(x * background_scl, y * background_scl, 20000);
        alpha = n * (0.4 - 0.1) + 0.1;

        this.ctx.fillStyle = `hsla(33, 82%, ${bri}%, ${alpha})`;
        this.ctx.fillRect(x, y, scl, scl);
      }
    }
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

  _createFreeParticles(groups) {
    // particle boundaries
    let width, height;
    width = this.canvas.width * (1 - 2 * this._border);
    height = this.canvas.height * (1 - 2 * this._border);
    let free_particles_num;
    free_particles_num = width * height * 0.01;
    // create particles
    for (let i = 0; i < groups; i++) {
      // hue interval is different for each particle group
      let free_particles_hue_offset;
      free_particles_hue_offset = random_interval(this._hue_offset, 20);
      let free_particles_hue_interval;
      free_particles_hue_interval = random(127, 180);
      for (let j = 0; j < free_particles_num; j++) {
        // create and push new particle
        let x, y;
        x = random(width);
        y = random(height);
        let new_p;
        new_p = new Particle(x, y, width, height, free_particles_hue_offset, free_particles_hue_interval);
        this._particles.push(new_p);
      }
    }
  }

  _createCircleParticles(groups) {
    // particle boundaries
    let width, height;
    width = this.canvas.width * (1 - 2 * this._border);
    height = this.canvas.height * (1 - 2 * this._border);
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
      circle_particles_num = PI * Math.pow(r, 2) * 0.04;
      for (let j = 0; j < circle_particles_num; j++) {
        // create and push new particle
        let rho, theta;
        rho = random(0, r);
        theta = random(TWO_PI);
        let x, y;
        x = cx + rho * Math.cos(theta);
        y = cy + rho * Math.sin(theta);
        let new_p;
        new_p = new Particle(x, y, width, height, circle_hue_offset, circle_hue_interval);
        this._particles.push(new_p);
      }
    }
  }

  _createLineParticles(groups) {
    // particle boundaries
    let width, height;
    width = this.canvas.width * (1 - 2 * this._border);
    height = this.canvas.height * (1 - 2 * this._border);
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
      } while (line_length < width / 8 || line_length < height / 8);
      // hue interval and offset of the group
      let line_hue_interval;
      line_hue_interval = random_interval(50, 10);
      let line_hue_offset;
      line_hue_offset = random_interval(this._hue_offset, 10);
      // number of particles is proportional to the line length
      let line_particles_num;
      line_particles_num = line_length;
      for (let j = 0; j < line_particles_num; j++) {
        let t;
        t = random();
        let x, y;
        x = x0 + t * (x1 - x0);
        y = y0 + t * (y1 - y0);
        // create and push new particle
        let new_p;
        //new_p = new LineParticle(x0, y0, x1, y1, width, height, line_hue_offset, line_hue_interval);
        new_p = new Particle(x, y, width, height, line_hue_offset, line_hue_interval);
        this._particles.push(new_p);
      }
    }
  }

  _createPolygonParticles(groups, sides, rotated) {
    sides = sides || 3;
    rotated = rotated || false;

    // particle boundaries
    let width, height;
    width = this.canvas.width * (1 - 2 * this._border);
    height = this.canvas.height * (1 - 2 * this._border);
    for (let i = 0; i < groups; i++) {
      // hue interval and offset of the group
      let polygon_hue_interval;
      polygon_hue_interval = random_interval(50, 10);
      let polygon_hue_offset;
      polygon_hue_offset = random_interval(this._hue_offset, 10);
      let cx, cy, r, phi;
      cx = random_interval(width / 2, width / 3);
      cy = random_interval(height / 2, height / 3);
      r = random_interval(width / 6, width / 16);
      if (rotated) {
        phi = random(TWO_PI);
      } else {
        phi = 0;
      }

      let side_length;
      side_length = 2 * r * Math.sin(PI / sides);
      let side_points;
      side_points = side_length;
      for (let j = 0; j < sides; j++) {
        let start, end;
        start = j / sides * TWO_PI + phi;
        end = (j + 1) / sides * TWO_PI + phi;
        let x0, y0, x1, y1;
        x0 = cx + r * Math.cos(start);
        y0 = cy + r * Math.sin(start);
        x1 = cx + r * Math.cos(end);
        y1 = cy + r * Math.sin(end);

        for (let k = 0; k < side_points; k++) {
          let t;
          t = random();
          let x, y;
          x = x0 + t * (x1 - x0);
          y = y0 + t * (y1 - y0);
          let new_p;
          new_p = new Particle(x, y, width, height, polygon_hue_offset, polygon_hue_interval);
          this._particles.push(new_p);
        }
      }
    }
  }

  _createSolidPolygonParticles(groups, sides, rotated) {
    sides = sides || 3;
    rotated = rotated || false;

    // particle boundaries
    let width, height;
    width = this.canvas.width * (1 - 2 * this._border);
    height = this.canvas.height * (1 - 2 * this._border);
    for (let i = 0; i < groups; i++) {
      // hue interval and offset of the group
      let polygon_hue_interval;
      polygon_hue_interval = random_interval(50, 10);
      let polygon_hue_offset;
      polygon_hue_offset = random_interval(this._hue_offset, 10);
      let cx, cy, r, phi;
      cx = random_interval(width / 2, width / 3);
      cy = random_interval(height / 2, height / 3);
      r = random_interval(width / 4, width / 8);
      if (rotated) {
        phi = random(TWO_PI);
      } else {
        phi = 0;
      }
      let center;
      center = new Vector(cx, cy);

      for (let j = 0; j < sides; j++) {
        let start, end;
        start = j / sides * TWO_PI + phi;
        end = (j + 1) / sides * TWO_PI + phi;
        let x0, y0, x1, y1;
        x0 = cx + r * Math.cos(start);
        y0 = cy + r * Math.sin(start);
        x1 = cx + r * Math.cos(end);
        y1 = cy + r * Math.sin(end);
        let side_length;
        side_length = Math.sqrt(Math.pow(x1 - x0, 2) + Math.pow(y1 - y0, 2));
        let p;
        // semi perimeter
        p = r + side_length / 2;
        let triangle_area;
        // heron's formula
        triangle_area = Math.sqrt(p * (p - r) * (p - r) * (p - side_length));
        let triangle_points;
        triangle_points = triangle_area * 0.04;
        for (let k = 0; k < triangle_points; k++) {
          let s, t;
          s = random();
          t = random();
          let xp, yp;
          xp = x0 + s * (x1 - x0);
          yp = y0 + s * (y1 - y0);
          let x, y;
          x = cx + t * (xp - cx);
          y = cy + t * (yp - cy);
          let new_p;
          new_p = new Particle(x, y, width, height, polygon_hue_offset, polygon_hue_interval);
          this._particles.push(new_p);
        }
      }
    }
  }

  _initParameters() {
    // set seed
    this._seed = parseInt(Date.now() / 1e6);
    // init noise
    noise.seed(this._seed);

    // set parameters
    position_scl = random_interval(0.002, 0.001);
    color_scl = random_interval(0.0005, 0.00025);

    this._border = 0.15;
    this._hue_offset = random(360);

    // change THESE to make things work
    let auto;
    auto = false;

    if (auto) {
      let mode;
      mode = random_int(0, 5);
      switch (mode) {
        case 0:
          this._free_groups = random_int(2, 5);
          break;
        case 1:
          this._circle_groups = random_int(4, 10);
          break;
        case 2:
          this._line_groups = random_int(8, 13);
          break;
        case 3:
          this._polygon_groups = random_int(3, 6);
          this._polygon_sides = random_int(3, 7);
          break;
        case 4:
          this._solid_polygon_groups = random_int(3, 6);
          this._polygon_sides = random_int(3, 7);
      }
    } else {
      this._free_groups = 0;
      this._circle_groups = 0;
      this._line_groups = 0;
      this._polygon_groups = 0;
      this._solid_polygon_groups = 0;
    }

  }

  setup() {
    // set parameters
    this._initParameters();
    // create particles
    this._particles = [];
    this._createFreeParticles(this._free_groups);
    this._createCircleParticles(this._circle_groups);
    this._createLineParticles(this._line_groups);
    this._createPolygonParticles(this._polygon_groups, this._polygon_sides);
    this._createSolidPolygonParticles(this._solid_polygon_groups, this._polygon_sides);
    // reset background - antique white
    this.antique_background();
  }

  draw() {
    if (this._particles.length > 0) {
      // calculate canvas displacement due to this._border
      let x_displacement, y_displacement;
      x_displacement = this.canvas.width * this._border;
      y_displacement = this.canvas.height * this._border;

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

// random (0-1) with no parameter, (0, b) with one parameter, (a, b) with two parameters
const random = (a, b) => {
  if (a == undefined && b == undefined) return random(0, 1);
  else if (b == undefined) return random(0, a);
  else if (a != undefined && b != undefined) return Math.random() * (b - a) + a;
};

// random in range[a, b]
const random_int = (a, b) => {
  return parseInt(random(a, b + 1));
};

// random in (average-interval, average+interval)
const random_interval = (average, interval) => {
  return average + (Math.random() * 2 - 1) * interval;
};

const random_int_interval = (average, interval) => {
  return parseInt(random_interval(average, interval));
};


// get noise for position
const getNoise = (x, y, z) => {
  let n;
  if (z === undefined) n = (1 + noise.simplex2(x, y)) / 2;
  else n = (1 + noise.simplex3(x, y, z)) / 2;
  return n;
};