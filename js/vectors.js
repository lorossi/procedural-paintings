/*jshint esversion: 6 */

/**
* Simple 2D and 3D vector library made in pure js.
* @version 1.0.4
* @author Lorenzo Rossi - https://www.lorenzoros.si - https://github.com/lorossi/
* @license Attribution 4.0 International (CC BY 4.0)
*/

/**
* Create a vector
* @class
* @param {number} [0] x - The x value
* @param {number} [0] y - The y value
* @param {number} [0] z - The z value
* @return {Vector} - The new vector
* @example
* v1 = new Vector(1, 4, -3);
* @example
* v2 = new Vector(3, -5);
*/
function Vector(x, y, z) {
  this.x = x || 0;
  this.y = y || 0;
  this.z = z || 0;
  return this;
}

Vector.prototype = {
  /**
  * Add a vector
  * @param {Vector} v - The vector to be added
  * @return {Vector} - The new vector
  * @example
  * v1 = new Vector(1, -4, 12);
  * v2 = new Vector(2, 9, -3);
  * v1.add(v2);
  * // v1 = Vector(3, 5, 9);
  */
  add: function (v) {
    if (v instanceof Vector) {
      this.x += v.x;
      this.y += v.y;
      this.z += v.z;
      return this;
    }
  },

  /**
  * Subract a vector
  * @param {Vector} v - The vector to be subracted
  * @return {Vector} - The new vector
  * @example
  * v1 = new Vector(10, -3, 12);
  * v2 = new Vector(7, -8, 3);
  * v1.sub(v2);
  * // v1 = Vector(3, 5, 9);
  */
  sub: function (v) {
    if (v instanceof Vector) {
      this.x -= v.x;
      this.y -= v.y;
      this.z -= v.z;
      return this;
    }
  },

  /**
  * Alias for sub
  * @alias subtract
  */
  subtract: function (v) {
    return sub(v);
  },

  /**
  * Multiply by a vector or a scalar
  * @param {Vector|number} v - The vector or scalar to be multiplied by
  * @return {Vector} - The new vector
  * @example
  * v1 = new Vector(1, 2, 3);
  * v2 = new Vector(2, 5, 0);
  * v1.mult(v2);
  * // v1 = Vector(2, 10, 0);
  * @example
  * v1 = new Vector(7, 4, 2);
  * v1.mult(3);
  * // v1 = Vector(21, 12, 6);
  */
  mult: function (v) {
    if (v instanceof Vector) {
      this.x *= v.x;
      this.y *= v.y;
      this.z *= v.z;
      return this;
    } else if (typeof (v) === "number") {
      this.x *= v;
      this.y *= v;
      this.z *= v;
      return this;
    }
  },

  /**
  * Alias for mult
  * @alias multiply
  */
  multiply: function (v) {
    return this.mult(v);
  },

  /**
  * Divide by a vector or a scalar
  * @param {Vector|number} v - The vector or scalar to be divided by
  * @return {Vector} - The new vector
  * v1 = new Vector(4, 12, 9);
  * v2 = new Vector(4, 6, 3);
  * v1.divide(v2);
  * // v1 = Vector(1, 2, 3);
  * @example
  * v1 = new Vector(9, 3, 6);
  * v1.divide(3);
  * // v1 = Vector(3, 1, 2);
  */
  divide: function (v) {
    if (v instanceof Vector) {
      this.x /= v.x;
      this.y /= v.y;
      this.z /= v.z;
      return this;
    } else if (typeof (v) === "number") {
      this.x /= v;
      this.y /= v;
      this.z /= v;
      return this;
    }
  },

  /**
  * Multiply by a  scalar
  * @param {number} s - The scalar to be multiplied by
  * @return {Vector} - The new vector
  * @example
  * v1 = new Vector(7, 4, 2);
  * v1.multiply_scalar(3);
  * // v1 = Vector(21, 12, 6);
  */
  multiply_scalar: function (s) {
    this.multiply(s);
    return this;
  },

  /**
  * Divide by a scalar
  * @param {number} s - The scalar to be divided by
  * @return {Vector} - The new vector
  * @example
  * v1 = new Vector(9, 3, 6);
  * v1.divide_scalar(3);
  * // v1 = Vector(3, 1, 2);
  */
  divide_scalar: function (s) {
    this.divide(s);
    return this;
  },

  /**
  * Return minimum component of a vector
  * @return {number} The smallest component
  * @example
  * v1 = new Vector(3, -8, 12);
  * v1.min();
  * // -8
  */
  min: function () {
    return Math.min(this.x, this.y, this.z);
  },

  /**
  * Return maximum component of a vector
  * @return {number} The biggest component
  * @example
  * v1 = new Vector(3, -8, 12);
  * v1.max();
  * // -12
  */
  max: function () {
    return Math.max(this.x, this.y, this.z);
  },

  /**
  * Dot function
  * @param {Vector} v - The vector to perform dot operation with
  * @return {Vector} - The new vector
  * @example
  * v1 = new Vector(1, 4, 3);
  * v2 = new Vector(2, -6, 9);
  * v1.dot(v2);
  * // return 5;
  */
  dot: function (v) {
    if (v instanceof Vector) {
      this.x *= v.x;
      this.y *= v.y;
      this.z *= v.z;
      return this;
    }
  },

  /**
  * Cross function
  * @param {Vector} v - The vector to perform cross operation with
  * @return {Vector} - The new vector
  * @example
  * v1 = new Vector(1, 4, 3);
  * v2 = new Vector(2, -6, 9);
  * v1.cross(v2);
  * // v1 = Vector(54, -3, -14);
  */
  cross: function (v) {
    if (v instanceof Vector) {
      this.x = this.y * v.z - this.z * v.y;
      this.y = this.z * v.x - this.x * v.z;
      this.z = this.x * v.y - this.y * v.z;
      return this;
    }
  },

  /**
  * Distance between vectors
  * @param {Vector} v - The vector whose distance will be calculated
  * @return {Vector} Return a vector containing the distance
  * @example
  * v1 = new Vector(1, 4, -3);
  * v2 = new Vector(6, -6, 7);
  * v1.dist(v2);
  * // v1 = Vector(-5, 10, -10);
  */
  dist: function (v) {
    if (v instanceof Vector) {
      return this.sub(v);
    }
  },

  /**
  * Angle between vectors
  * @param {Vector} v - The vector whose contained angle will be calcolated
  * @return {number} Return a vector containing the angle in radians
  * @example
  * v1 = new Vector(1, 4, -3);
  * v2 = new Vector(6, -6, 7);
  * v1.dist(v2);
  * // v1 = Vector(-5, 10, -10);
  */
  angleBetween: function (v) {
    if (v instanceof Vector) {
      return Math.acos(this.dot(this, v) / (this.mag() * v.mag()));
    }
  },

  /**
  * Check if two vectors are equals
  * @param {Vector} v - The vector that will be compared
  * @return {boolean} Return true or false
  * @example
  * v1 = new Vector(1, 4, -3);
  * v2 = new Vector(6, -6, 7);
  * v1.equal(v2);
  * // return false;
  */
  equals: function (v) {
    if (v instanceof Vector) {
      return (this.x == v.x && this.y == v.y && this.z == v.z);
    }
  },

  /**
  * Copy the vector into a new objecy
  * @return {Vector} The new copied vector
  * @example
  * v1 = new Vector(8, 144, -32);
  * v2 = v1.copy();
  * // v2 = Vector(8, 144, -32);
  */
  copy: function () {
    return new Vector(this.x, this.y, this.z);
  },

  /**
  * Limit the vector magnitude to a set value
  * @param {number} s - The maximum magninute
  * @return {Vector} - The new vector
  * @example
  * v1 = new Vector(2, 0, 2);
  * v1.limit(2);
  * // v1 = Vector(1.414213562373095, 0, 1.414213562373095);
  */
  limit: function (s) {
    if (typeof (s) === "number") {
      let m = this.mag();
      if (m > s) {
        this.multiply(s / m);
        return this;
      }
    }
  },

  /**
  * Set the vector magnitude
  * @param {number} s - Magnitude
  * @return {Vector} - The new vector
  * @example
  * v1 = new Vector(2, 0, 2);
  * v1.setMag(4);
  * // v1 = Vector(2.82842712474619, 0, 2.82842712474619);
  */
  setMag: function (s) {
    if (typeof (s) === "number") {
      let m = this.mag();
      this.multiply(s / m);
      return this;
    }
  },

  /**
  * Rotate a vector by an angle in randians
  * @param {number} t - The rotation angle
  * @return {Vector} - The new vector
  * @example
  * v1 = new Vector(2, 1);
  * v1.rotate(Math.PI);
  * // v1 = Vector(-2, -1, 0);
  */
  rotate: function (t) {
    if (typeof (t) === "number") {
      let x2 = Math.cos(t) * this.x - Math.sin(t) * this.y;
      let y2 = Math.sin(t) * this.x + Math.cos(t) * this.y;
      this.x = x2;
      this.y = y2;
      return this;
    }
  },

  /**
  * Normalize a vector (its magnitude will be unitary)
  * @return {Vector} - The new vector
  * @example
  * v1 = new Vector(5, 2, -4);
  * v1.normalize();
  * // v1 = Vector(0.7453559924999299, 0.29814239699997197, -0.5962847939999439);
  */
  normalize: function () {
    this.divide_scalar(this.mag());
    return this;
  },

  /**
  * Invert some (or all) components of the vector
  * @param {boolean} x - The x component
  * @param {boolean} y - The y component
  * @param {boolean} z - The z component
  * @return {Vector} - The new vector
  * @example
  * v1 = new Vector(4, -5, 7);
  * v1.invert(true, true, true);
  * // v1 = Vector(-4, 5, -7);
  * @example
  * v2 = new Vector(4, -1, -3);
  * v2.invert(true, false);
  * // v2 = Vector(-4, -1, -3);
  */
  invert: function (x, y, z) {
    if (x) {
      this.x *= -1;
    }
    if (y) {
      this.y *= -1;
    }
    if (z) {
      this.z *= -1;
    }

    if (!x && !y && !z) {
      this.x *= -1;
      this.y *= -1;
      this.z *= -1;
    }

    return this;
  },

  /**
  * Invert the x component of the vector
  * @return {Vector} - The new vector
  * @example
  * v1 = new Vector(4, -5, 7);
  * v1.invertX();
  * // v1 = Vector(-4, -5, 7);
  */
  invertX: function () {
    this.invert(true, false, false);
    return this;
  },

  /**
  * Invert the y component of the vector
  * @return {Vector} - The new vector
  * @example
  * v1 = new Vector(4, -5, 7);
  * v1.invertY();
  * // v1 = Vector(4, 5, 7);
  */
  invertY: function () {
    this.invert(false, true, false);
    return this;
  },

  /**
  * Invert the z component of the vector
  * @return {Vector} - The new vector
  * @example
  * v1 = new Vector(4, -5, 7);
  * v1.invertZ();
  * // v1 = Vector(4, -5, -7);
  */
  invertZ: function () {
    this.invert(false, false, true);
    return this;
  },

  /**
  * Calculate the vector magnitude
  * @return {number} - The vector magnitude
  * @example
  * v1 = new Vector(6, -2, -1);
  * v1.mag();
  * // return 6.4031242374328485;
  */
  mag: function () {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  },

  /**
  * Calculate the vector square magnitude
  * @return {number} The vector square magnitude
  * @example
  * v1 = new Vector(6, -2, -1);
  * v1.magSq();
  * // return 41;
  */
  magSq: function () {
    return this.x * this.x + this.y * this.y + this.z * this.z;
  },

  /**
  * Calculate the vector heading (radians) - only for 2D vectors
  * @return {number} The vector heading (radians)
  * @example
  * v1 = new Vector(3, 3);
  * v1.heading2D();
  * // return 0.7853981633974483
  */
  heading2D: function () {
    return Math.atan2(this.y, this.x);
  },

  /**
  * Return a printable string of the vector
  * @return {string} Printable string
  * @example
  * v1 = new Vector(3, 3, -4);
  * v1.toString();
  * // return "x: 3, y: 3, z: -4"
  */
  toString: function () {
    return `x: ${this.x}, y: ${this.y}, z: ${this.z}`;
  }
};

/**
* Create a 2D vector from its angle
* @param {number} [0] theta - Theta angle (radians)
* @return {Vector} - The new vector
* @example
* v1 = new Vector.fromAngle2D(2.42);
* // v1 = Vector(-0.7507546047254909,0.6605812012792007, 0);
*/
Vector.fromAngle2D = function (theta) {
  theta = theta || 0;
  return new Vector(Math.cos(theta), Math.sin(theta), 0);
};

/**
* Create a 3D vector from its angles
* @param {number} [0] theta - Theta angle (radians)
* @param {number} [0] phi - Phi angle (radians)
* @return {Vector} - The new vector
* @example
* v1 = new Vector.fromAngle2D(1.33, -2.44);
* // v1 = Vector(-0.1821516349441893, -0.6454349983343708, -0.7417778945292652);
*/
Vector.fromAngle3D = function (theta, phi) {
  theta = theta || 0;
  phi = phi || 0;
  return new Vector(Math.cos(theta) * Math.cos(phi), Math.sin(phi), Math.sin(theta) * Math.cos(phi));
};

/**
* Create a random 2D vector
* @return {Vector} - The new vector
* @example
* v1 = new Vector.random2D();
* // v1 = Vector(0.2090564102081952, -0.977903582849998, 0);
*/
Vector.random2D = function () {
  let theta = Math.random() * 2 * Math.PI;
  return new Vector.fromAngle2D(theta);
};

/**
* Create a random 3D vector
* @return {Vector} - The new vector
* @example
* v1 = new Vector.random3D();
* // v1 = Vector(-0.7651693875628326, -0.43066633476756877, 0.47858365667309205);
*/
Vector.random3D = function () {
  let theta = Math.random() * 2 * Math.PI;
  let phi = Math.random() * 2 * Math.PI;
  return new Vector.fromAngle3D(theta, phi);
};

/**
* Create a vector from an Array
* @example
* // return Vector(4, 5, 6)
* v = new Vector.fromArray([4, 5, 6])
* @example
* // return Vector(1, 7, 0)
* v = new Vector.fromArray([1, 7])
* @return {Vector} - The new vector
*/
Vector.fromArray = function (a) {
  return new Vector(a[0], a[1], a[2]);
};

/**
* Create a vector from an object
* // return Vector(1, 5, 9)
* v = new Vector.fromArray({x: 5, y: 7, z: 9})
* @example
* // return Vector(3, 0, 4)
* v = new Vector.fromArray({x: 3, z: 4})
* @return {Vector} - The new vector
*/
Vector.fromObject = function (o) {
  return new Vector(o.x, o.y, o.z);
};
