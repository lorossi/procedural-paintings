// parameters
let position_scl, color_scl;
let recording = false;
let auto = false;
let counter = 0;

// objects
let rand;

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

  _antique_background() {
    // add back color
    this.background("hsla(33, 82%, 96%, 1)");
    // add noise
    let scl;
    scl = 4;
    let offset;
    offset = rand.random(100000);
    let background_scl;
    background_scl = 0.003;
    for (let x = 0; x < this.canvas.width; x += scl) {
      for (let y = 0; y < this.canvas.height; y += scl) {
        let n, bri, alpha;
        n = getNoise(x * background_scl, y * background_scl, offset);
        bri = n * 30 + 50;
        alpha = 0.2;
        this.ctx.fillStyle = `hsla(45, 40%, ${bri}%, ${alpha})`;
        this.ctx.fillRect(x, y, scl, scl);
      }
    }
  }

  click() {
    this.setup();
  }

  save() {
    let filename, link;
    filename = this._title + ".png";
    link = document.createElement("a");
    link.download = filename;
    link.href = this.canvas.toDataURL("image/png");
    document.body.appendChild(link);

    link.click();
    document.body.removeChild(link);
  }

  _createFreeParticles(brushes) {
    // particle boundaries
    let width, height;
    width = this.canvas.width * (1 - 2 * this._border);
    height = this.canvas.height * (1 - 2 * this._border);
    let free_particles_num;
    free_particles_num = width * height * this._sq_pixel_density;
    // create particles
    for (let i = 0; i < brushes; i++) {
      let particles = [];
      // hue interval is different for each particle brush
      let free_particles_hue_offset;
      free_particles_hue_offset = rand.randomInterval(this._hue_offset, 80);
      let free_particles_hue_interval;
      free_particles_hue_interval = rand.random(140, 180);
      for (let j = 0; j < free_particles_num; j++) {
        // create and push new particle
        let x, y;
        x = rand.random(width);
        y = rand.random(height);
        let new_p;
        new_p = new Particle(x, y, width, height, free_particles_hue_offset, free_particles_hue_interval, 2);
        particles.push(new_p);
      }

      this._brushes.push(particles);
    }
  }

  _createCircleParticles(brushes) {
    // particle boundaries
    let width, height;
    width = this.canvas.width * (1 - 2 * this._border);
    height = this.canvas.height * (1 - 2 * this._border);
    for (let i = 0; i < brushes; i++) {
      let particles = [];
      // center of the circular brush
      let cx, cy, r;
      cx = rand.randomInterval(width / 2, width / 4);
      cy = rand.randomInterval(height / 2, height / 4);
      r = rand.randomInterval(width / 6, width / 16);
      // hue interval and offset of the brush
      let circle_hue_interval;
      circle_hue_interval = rand.randomInterval(75, 40);
      let circle_hue_offset;
      circle_hue_offset = rand.randomInterval(this._hue_offset, 40);
      // number of particles in the circle, is proportional to its size
      let circle_particles_num;
      circle_particles_num = PI * Math.pow(r, 2) * this._sq_pixel_density;
      for (let j = 0; j < circle_particles_num; j++) {
        // create and push new particle
        let rho, theta;
        rho = rand.random(0, r);
        theta = rand.random(TWO_PI);
        let x, y;
        x = cx + rho * Math.cos(theta);
        y = cy + rho * Math.sin(theta);
        let new_p;
        new_p = new Particle(x, y, width, height, circle_hue_offset, circle_hue_interval);
        particles.push(new_p);
      }

      this._brushes.push(particles);
    }
  }

  _createLineParticles(brushes) {
    // particle boundaries
    let width, height;
    width = this.canvas.width * (1 - 2 * this._border);
    height = this.canvas.height * (1 - 2 * this._border);
    let line_border;
    line_border = 0.05 * width;
    for (let i = 0; i < brushes; i++) {
      // keep generating new coordinates until minimum length is reached
      // line length
      let line_length;
      // start and end coordinates
      let x0, y0, x1, y1;
      do {
        // generate rand.random coordinates
        x0 = rand.random(line_border, width - line_border);
        x1 = rand.random(line_border, width - line_border);
        y0 = rand.random(line_border, height - line_border);
        y1 = rand.random(line_border, height - line_border);
        // calculate length of line
        line_length = Math.sqrt(Math.pow(x1 - x0, 2) + Math.pow(y1 - y0, 2));
      } while (line_length < Math.min(width, height) / 4 || line_length > Math.max(width, height) / 2);
      // hue interval and offset of the brush
      let line_hue_interval;
      line_hue_interval = rand.randomInterval(20, 60);
      let line_hue_offset;
      line_hue_offset = rand.randomInterval(this._hue_offset, 20);
      // number of particles is proportional to the line length
      let line_particles_num;
      line_particles_num = line_length * this._linear_pixel_density;

      let particles = [];
      for (let j = 0; j < line_particles_num; j++) {
        let t;
        t = rand.random();
        let x, y;
        x = x0 + t * (x1 - x0);
        y = y0 + t * (y1 - y0);
        // create and push new particle
        let new_p;
        new_p = new Particle(x, y, width, height, line_hue_offset, line_hue_interval, 0.5, 3);
        particles.push(new_p);
      }

      this._brushes.push(particles);
    }
  }

  _createPolygonParticles(brushes, sides, rotated) {
    sides = sides || 3;
    rotated = rotated || true;

    // particle boundaries
    let width, height;
    width = this.canvas.width * (1 - 2 * this._border);
    height = this.canvas.height * (1 - 2 * this._border);
    for (let i = 0; i < brushes; i++) {
      // hue interval and offset of the brush
      let polygon_hue_interval;
      polygon_hue_interval = rand.randomInterval(20, 60);
      let polygon_hue_offset;
      polygon_hue_offset = rand.randomInterval(this._hue_offset, 20);
      let cx, cy, r, phi;
      cx = rand.randomInterval(width / 2, width / 3);
      cy = rand.randomInterval(height / 2, height / 3);
      r = rand.randomInterval(width / 6, width / 16);
      if (rotated) {
        phi = rand.random(TWO_PI);
      } else {
        phi = 0;
      }

      let side_length;
      side_length = 2 * r * Math.sin(PI / sides);
      let side_points;
      side_points = side_length * this._linear_pixel_density;
      let particles = [];
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
          t = k / side_points;
          let x, y;
          x = x0 + t * (x1 - x0);
          y = y0 + t * (y1 - y0);
          let new_p;
          new_p = new Particle(x, y, width, height, polygon_hue_offset, polygon_hue_interval, 0.75);
          particles.push(new_p);
        }
      }

      this._brushes.push(particles);
    }
  }

  _createSolidPolygonParticles(brushes, sides, rotated) {
    sides = sides || 3;
    rotated = rotated || true;

    // particle boundaries
    let width, height;
    width = this.canvas.width * (1 - 2 * this._border);
    height = this.canvas.height * (1 - 2 * this._border);
    for (let i = 0; i < brushes; i++) {
      // hue interval and offset of the brush
      let polygon_hue_interval;
      polygon_hue_interval = rand.randomInterval(20, 60);
      let polygon_hue_offset;
      polygon_hue_offset = rand.randomInterval(this._hue_offset, 20);
      let cx, cy, r, phi;
      cx = rand.randomInterval(width / 2, width / 3);
      cy = rand.randomInterval(height / 2, height / 3);
      r = rand.randomInterval(width / 4, width / 8);
      if (rotated) {
        phi = rand.random(TWO_PI);
      } else {
        phi = 0;
      }

      let particles = [];
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
        // semi perimeter
        let p;
        p = r + side_length / 2;
        let triangle_area;
        // heron's formula
        triangle_area = Math.sqrt(p * (p - r) * (p - r) * (p - side_length));
        let triangle_points;
        triangle_points = triangle_area * this._sq_pixel_density;
        for (let k = 0; k < triangle_points; k++) {
          let s, t;
          s = rand.random();
          t = rand.random();
          // point between start and end (belongs to the border)
          let xp, yp;
          xp = x0 + s * (x1 - x0);
          yp = y0 + s * (y1 - y0);
          // point between center and border 
          let x, y;
          x = cx + t * (xp - cx);
          y = cy + t * (yp - cy);
          let new_p;
          new_p = new Particle(x, y, width, height, polygon_hue_offset, polygon_hue_interval);
          particles.push(new_p);
        }
      }
      this._brushes.push(particles);
    }
  }

  _createThickPolygonParticles(brushes, sides, rotated, thickness) {
    sides = sides || 3;
    rotated = rotated || true;
    thickness = thickness || rand.random(0.3, 0.6);

    // particle boundaries
    let width, height;
    width = this.canvas.width * (1 - 2 * this._border);
    height = this.canvas.height * (1 - 2 * this._border);

    for (let i = 0; i < brushes; i++) {
      // hue interval and offset of the brush
      let polygon_hue_interval;
      polygon_hue_interval = rand.randomInterval(20, 60);
      let polygon_hue_offset;
      polygon_hue_offset = rand.randomInterval(this._hue_offset, 20);
      let cx, cy, r, phi;
      cx = width / 2;
      cy = height / 2;
      r = rand.randomInterval(width / 3, width / 16);
      if (rotated) {
        phi = rand.random(TWO_PI);
      } else {
        phi = 0;
      }

      let particles = [];
      for (let j = 0; j < sides; j++) {
        let start, end;
        start = j / sides * TWO_PI + phi - HALF_PI;
        end = (j + 1) / sides * TWO_PI + phi - HALF_PI;
        let x0, y0, x1, y1;
        x0 = cx + r * Math.cos(start);
        y0 = cy + r * Math.sin(start);
        x1 = cx + r * Math.cos(end);
        y1 = cy + r * Math.sin(end);
        let side_length;
        side_length = Math.sqrt(Math.pow(x1 - x0, 2) + Math.pow(y1 - y0, 2));
        let side_points;
        side_points = side_length * this._linear_pixel_density;
        let p;
        // semi perimeter
        p = r + side_length / 2;
        let triangle_area;
        // heron's formula
        triangle_area = Math.sqrt(p * (p - r) * (p - r) * (p - side_length));
        let triangle_points;
        triangle_points = triangle_area * this._sq_pixel_density;
        for (let k = 0; k < triangle_points; k++) {
          let s, t;
          s = rand.random();
          t = rand.random(1 - thickness, 1);
          // point between start and end (belongs to the border)
          let xp, yp;
          xp = x0 + s * (x1 - x0);
          yp = y0 + s * (y1 - y0);
          // point between center and border 
          let x, y;
          x = cx + t * (xp - cx);
          y = cy + t * (yp - cy);
          let new_p;
          new_p = new Particle(x, y, width, height, polygon_hue_offset, polygon_hue_interval, 1, 2);
          particles.push(new_p);
        }
      }
      this._brushes.push(particles);
    }
  }

  _initParameters() {
    // get seed
    this._seed = Date.now();
    // init noise
    noise.seed(this._seed);
    // init rand.random
    rand = new Random();
    rand.seed(this._seed);

    // set parameters
    position_scl = rand.randomInterval(0.002, 0.001);
    color_scl = rand.randomInterval(0.0005, 0.00025);

    this._border = 0.1;
    this._hue_offset = rand.random(360);
    this._sq_pixel_density = 0.1;
    this._linear_pixel_density = 1.5;
    this._ended = false;
    this._max_particles_on_screen = 2500;

    this._free_brushes = 0;
    this._circle_brushes = 0;
    this._line_brushes = 0;
    this._polygon_brushes = 0;
    this._solid_polygon_brushes = 0;
    this._thick_polygon_brushes = 0;
    // to get the title, take the seed (current epoch), remove the
    // last 3 digits (the msec) and shuffle it
    // since the seed is set, the result will be deterministic
    let title;
    title = this._seed.toString().slice(0, 10);
    this._title = string_shuffle(title);

    let mode;

    if (!auto) {
      mode = rand.randomInt(6);
    } else {
      mode = counter;
    }

    switch (mode) {
      case 0:
        this._free_brushes = rand.randomInt(4, 7);
        break;
      case 1:
        this._circle_brushes = rand.randomInt(4, 7);
        break;
      case 2:
        this._line_brushes = rand.randomInt(4, 7);
        break;
      case 3:
        this._polygon_brushes = rand.randomInt(3, 7);
        this._polygon_sides = rand.randomInt(5, 7);
        break;
      case 4:
        this._solid_polygon_brushes = rand.randomInt(4, 7);
        this._polygon_sides = rand.randomInt(5, 7);
        break;
      case 5:
        this._thick_polygon_brushes = rand.randomInt(3, 5);
        this._polygon_sides = rand.randomInt(4, 7);
        this._polygon_thickness = rand.random(0.1, 0.75);
    }

    this._polygons_rotation = true;

    this._show_title = true;

    if (recording) {
      this._capturer = new CCapture({
        framerate: this.fps,
        verbose: true,
        format: 'png',
        motionBlurFrames: true,
        name: this._title,
        autoSaveTime: 60,
      });

      this._capturer.start();
    }
  }

  _draw_title() {
    // background is more or less rgb(240,232,210) - #f0e8d2
    // its complementary color would be (about) #2b240e
    let text_size;

    text_size = 40;
    this.ctx.fillStyle = "#2b240648";
    this.ctx.font = `${text_size}px Plantin-Italic`;
    this.ctx.textAlign = "left";
    this.ctx.textBaseline = "top";
    this.ctx.fillText(this._title, text_size / 2, text_size / 2);

    text_size = 20;
    this.ctx.fillStyle = "#2b240e64";
    this.ctx.font = `${text_size}px Plantin-Italic`;
    this.ctx.textBaseline = "bottom";
    this.ctx.textAlign = "right";
    this.ctx.fillText("Lorenzo Rossi", this.canvas.height - text_size / 2, this.canvas.width - text_size / 2);
  }

  setup() {
    // set parameters
    this._initParameters();
    // create particles
    this._brushes = [];

    this._createFreeParticles(this._free_brushes);
    this._createCircleParticles(this._circle_brushes);
    this._createLineParticles(this._line_brushes);
    this._createPolygonParticles(this._polygon_brushes, this._polygon_sides, this._polygons_rotation);
    this._createSolidPolygonParticles(this._solid_polygon_brushes, this._polygon_sides, this._polygons_rotation);
    this._createThickPolygonParticles(this._thick_polygon_brushes, this._polygon_sides, this._polygons_rotation, this._polygon_thickness);
    // reset background - antique white with random noise
    this._antique_background();
    // draw title
    if (this._show_title) {
      this._draw_title();
    }
  }

  draw() {
    if (this._brushes.length > 0) {
      // calculate canvas displacement due to this._border
      let x_displacement, y_displacement;
      x_displacement = this.canvas.width * this._border;
      y_displacement = this.canvas.height * this._border;

      for (let b = 0; b < this._brushes.length; b++) {
        this.ctx.save();
        this.ctx.translate(x_displacement, y_displacement);

        for (let p = 0; p < this._brushes[b].length && p < this._max_particles_on_screen; p++) {
          let particle;
          particle = this._brushes[b][p];
          particle.show(this.ctx);
          particle.move();

          if (particle.replaceable) particle.reset();
        }

        this.ctx.restore();

        this._brushes[b] = this._brushes[b].filter(p => !p.dead);
        if (this._brushes[b].length == 0) this._brushes.splice(b, 1);

      }

      if (recording) {
        this._capturer.capture(this.canvas);
      }

    } else if (!this._ended) {
      this._ended = true;

      if (recording) {
        this._capturer.stop();
        this._capturer.save();
        counter++;
        if (counter >= 6) {
          recording = false;
          console.log("Recording done!");
        } else {
          this._initParameters();
        }
      }
    }
  }
}

// ease number in range 0-1
const ease = x => {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
};

// get noise for position, either 2D or 3D. Must be scaled
// beforehand
const getNoise = (x, y, z) => {
  let n;
  if (z === undefined) n = (1 + noise.simplex2(x, y)) / 2;
  else n = (1 + noise.simplex3(x, y, z)) / 2;
  return n;
};

// shuffle array
const array_shuffle = arr => {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand.randomInt(i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
};

// shuffle string
const string_shuffle = string => {
  let arr;
  arr = string.split("");
  array_shuffle(arr);
  arr = arr.join("");
  return arr;
};