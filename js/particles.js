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
