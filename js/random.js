class Random {
  constructor() {
    this._a = 0;
    this._b = 0;
    this._c = 0;
    this._d = 0;
  }

  seed(d) {
    this._a = 0x9E3779B9;
    this._b = 0x243F6A88;
    this._c = 0xB7E15162;
    this._d = d || Date.now();
    for (let i = 0; i < 20; i++) {
      this._random_internal();
    }
  }

  random(a, b) {
    if (a == undefined && b == undefined) return this.random(0, 1);
    else if (b == undefined) return this.random(0, a);
    else if (a != undefined && b != undefined) return this._random_internal() * (b - a) + a;
  }

  randomInt(a, b) {
    return Math.floor(this.random(a, b));
  }

  randomInterval(average, interval) {
    average = average || 0.5;
    interval = interval || 0.5;
    return average + (this._random_internal() * 2 - 1) * interval;
  }

  _random_internal() {
    this._a >>>= 0; this._b >>>= 0; this._c >>>= 0; this._d >>>= 0;
    let t = (this._a + this._b) | 0;
    this._a = this._b ^ this._b >>> 9;
    this._b = this._c + (this._c << 3) | 0;
    this._c = (this._c << 21 | this._c >>> 11);
    this._d = this._d + 1 | 0;
    t = t + this._d | 0;
    this._c = this._c + t | 0;
    return (t >>> 0) / 4294967296;

  }
}