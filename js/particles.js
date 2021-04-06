// Particle class
class Particle {
  constructor(x, y, width, height, hue_offset, hue_interval, life_factor, max_resets) {
    this._width = width;
    this._height = height;
    this._hue_offset = hue_offset;
    this._hue_interval = hue_interval;

    if (life_factor === undefined) {
      this._life_factor = 1;
    } else {
      this._life_factor = life_factor;
    }

    if (max_resets === undefined) {
      this._max_resets = 3;
    } else {
      this._max_resets = max_resets;
    }

    this._max_life = 150;
    this._min_life = 125;
    this._max_weight = 2.5;
    this._max_vel = 3;
    this._wrap_around = false;

    this._resets = 0;

    this._x = x;
    this._y = y;

    this.reset();
  }

  reset() {
    // reset particle to starting position
    this._resets++;
    // add some randomness
    this._seed = rand.randomInterval(0, 5 * position_scl);
    this._pos = new Vector(this._x, this._y);
    this._prev_pos = this._pos.copy();
    // reset everything
    this._sat_min = rand.randomInterval(30, 5);
    this._bri_max = rand.randomInterval(85, 5);
    // reset hue, weight and life
    let n;
    n = getNoise(this._pos.x * color_scl, this._pos.y * color_scl, 2000);
    this._hue = n * this._hue_interval;
    n = getNoise(this._pos.x * color_scl, this._pos.y * color_scl, 3000 + this._seed);
    this._weight = n * (this._max_weight - 0.5) + 0.5;
    n = getNoise(this._pos.x * color_scl, this._pos.y * color_scl, 4000 + this._seed);
    this._life = n * (this._max_life - this._min_life) + this._min_life;
    // compute tolerances
    this._life_tolerance = rand.random(this._max_life / 10);
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

    if (this._wrap_around) {
      if (this._pos.x < 0) {
        this._pos.x = this._width;
        this._prev_pos = this._pos.copy();
      }
      else if (this._pos.x > this._width) {
        this._pos.x = 0;
        this._prev_pos = this._pos.copy();
      }

      if (this._pos.y < 0) {
        this._pos.y = this._height;
        this._prev_pos = this._pos.copy();
      }
      else if (this._pos.y > this._height) {
        this._pos.y = 0;
        this._prev_pos = this._pos.copy();
      }
    }

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
    bri = (1 - eased) * (this._bri_max - 50) + 50;
    alpha = eased;

    this._wrap_variable(hue, 0, 360);
    this._force_variable(sat);
    this._force_variable(bri);
    this._force_variable(alpha);

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

  _wrap_variable(x, min = 0, max = 100) {
    while (x < min) { x += (max - min); }
    while (x > max) { x -= (max - min); }
    return x;
  }

  _force_variable(x, min = 0, max = 100) {
    if (x > max) x = max;
    else if (x < min) x = min;
    return x;
  }

  // get if particle has to be replaced
  get replaceable() {
    return this._pos.x < 0 ||
      this._pos.x > this._width ||
      this._pos.y < 0 ||
      this._pos.y > this._height ||
      this._life < 0;
  }

  // check if particle is dead
  get dead() {
    return this._resets > this._max_resets + 1;
  }
}
