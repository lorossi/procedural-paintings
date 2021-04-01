// Particle class
class Particle {
  constructor(width, height, hue_offset, hue_interval) {
    this._width = width;
    this._height = height;
    this._hue_offset = hue_offset;
    this._hue_interval = hue_interval;

    this._max_life = 100;
    this._min_life = 150;
    this._max_weight = 2;
    this._life_factor = 1;
    this._max_vel = 2;
    let max_dist;
    max_dist = Math.sqrt(Math.pow(width / 2, 2) + Math.pow(height / 2, 2));
    this._pos_tolerance = max_dist / 20;

    this._resets = 0;
    this._max_resets = 5;

    this._x = random(width);
    this._y = random(height);

    this.reset();
  }

  reset() {
    // reset particle to starting position
    this._resets++;
    // add some randomness
    this._seed = random_interval(0, 10 * position_scl);
    this._pos = new Vector(this._x, this._y);
    this._prev_pos = this._pos.copy();
    // reset everything
    this._sat_min = random_interval(80, 5);
    this._bri_min = random_interval(40, 5);
    // reset hue, weight and life
    let n;
    n = getNoise(this._pos.x * color_scl, this._pos.y * color_scl, 2000);
    this._hue = n * this._hue_interval;
    n = getNoise(this._pos.x * color_scl, this._pos.y * color_scl, 3000 + this._seed);
    this._weight = n * (this._max_weight - 0.5) + 0.5;
    n = getNoise(this._pos.x * color_scl, this._pos.y * color_scl, 4000 + this._seed);
    this._life = n * (this._max_life - this._min_life) + this._min_life;
    // compute tolerances
    this._life_tolerance = this._max_life / 20;
  }

  move() {
    // generate angle and module of velocity
    let n, rho, theta;
    n = getNoise(this._pos.x * position_scl, this._pos.y * position_scl, 5000 + this._seed);
    rho = n * (this._max_vel - 1) + 1;
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
    let hue, sat, bri, alpha;
    hue = (this._hue + this._hue_offset);
    sat = (1 - eased) * (100 - this._sat_min) + this._sat_min;
    bri = (1 - eased) * (50 - this._bri_min) + this._bri_min;
    alpha = eased;

    if (hue < 0) hue += 360;
    else if (hue > 360) hue -= 360;

    if (sat < 0) sat = 0;
    else if (sat > 100) sat = 100;

    if (bri < 0) bri = 0;
    else if (bri > 100) bri = 100;

    if (alpha < 0) alpha = 0;
    else if (alpha > 1) alpha = 1;

    console.log(hue, sat, bri);

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
    return this._pos.x < -this._pos_tolerance ||
      this._pos.x > this._width + this._pos_tolerance ||
      this._pos.y < -this._pos_tolerance ||
      this._pos.y > this._height + this._pos_tolerance ||
      this._life < -this._life_tolerance;
  }

  // check if particle is dead
  get dead() {
    return this._resets > this._max_resets + 1;
  }
}

class CircleParticle extends Particle {
  constructor(cx, cy, radius, hue_offset, hue_interval) {
    super();
    this._hue_offset = hue_offset;
    this._hue_interval = hue_interval;
    this._pos_tolerance = radius / 40;

    this._center = new Vector(cx, cy);
    let rho, phi;
    rho = random(0, radius);
    phi = random(0, TWO_PI);
    let starting_pos;
    starting_pos = new Vector.fromAngle2D(phi).setMag(rho).add(this._center);
    this._x = starting_pos.x;
    this._y = starting_pos.y;
    this.reset();
  }
}

class LineParticle extends Particle {
  constructor(x0, y0, x1, y1, width, height, hue_offset, hue_interval) {
    super();
    this._width = width;
    this._height = height;
    this._hue_offset = hue_offset;
    this._hue_interval = hue_interval;

    let length;
    length = Math.sqrt(Math.pow(x1 - x0, 2) + Math.pow(y1 - y0, 2));
    this._pos_tolerance = length / 40;

    let t;
    t = random();
    this._x = x0 + t * (x1 - x0);
    this._y = y0 + t * (y1 - y0);

    this.reset();
  }
}