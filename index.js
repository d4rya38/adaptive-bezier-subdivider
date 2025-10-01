/**
 * These options shouldn't generally be used, 
 * to see what each of these options mean,
 * refer to the original article
 * [here](https://agg.sourceforge.net/antigrain.com/research/adaptive_bezier/).
 * 
 * @typedef {object} QuadraticBuilderOptions
 * @property {number} [recursion=32] recursion limit
 * @property {number} [epsilon=1.1920929e-7]
 * @property {number} [pathEpsilon=1]
 * @property {number} [angleEpsilon=0.01]
 * @property {number} [angleTolerance=0]
 */

/**
 * These options shouldn't generally be used, 
 * to see what each of these options mean,
 * refer to the original article 
 * [here](https://agg.sourceforge.net/antigrain.com/research/adaptive_bezier/).
 * 
 * @typedef {object} CubicBuilderOptions
 * @property {number} [recursion=32] recursion limit
 * @property {number} [epsilon=1.1920929e-7]
 * @property {number} [pathEpsilon=1]
 * @property {number} [angleEpsilon=0.01]
 * @property {number} [angleTolerance=0]
 * @property {number} [cuspLimit=0]
 */

export class AdaptiveQuadraticBezierBuilder {
  /**@type {number} */
  recursionLimit;
  /**@type {number} */
  fltEpsilon;
  /**@type {number} */
  pathDistanceEpsilon;
  /**@type {number} */
  curveAngleToleranceEpsilon;
  /**@type {number} */
  mAngleTolerance;

  /**
   * @param {QuadraticBuilderOptions} [options={}]
   */
  constructor(options = {}) {
    this.recursionLimit = options?.recursion ?? 32;
    this.fltEpsilon = options?.epsilon ?? 1.1920929e-7;
    this.pathDistanceEpsilon = options?.pathEpsilon ?? 1;
    this.curveAngleToleranceEpsilon = options?.angleEpsilon ?? 0.01;
    this.mAngleTolerance = options?.angleTolerance || 0;
  }

  /**
   * Flattens the curve into a sequence of line segments adaptively.
   * @param {[number,number]} start Starting point of the curve.
   * @param {[number,number]} c control point of the curve.
   * @param {[number,number]} end End point of the curve.
   * @param {number} [scale=1] Applies a finer subdivsion interval if the
   * resultant points are used in a scaled context, defaults to `1`.
   * @param {number[]} [points=[]] An array to push the results to, if
   * not specified it will create a new array and return it.
   * @returns {number[]} Resultant points that forms the curve
   */
  flatten(start, c, end, scale = 1, points = []) {
    let distanceTolerance = this.pathDistanceEpsilon / scale;
    distanceTolerance *= distanceTolerance;

    const [x1, y1] = start,
      [x2, y2] = c,
      [x3, y3] = end;

    points.push(x1, y1);
    this.#recursive(x1, y1, x2, y2, x3, y3, points, distanceTolerance, 0);
    points.push(x3, y3);

    return points;
  }

  /**
   *
   * @param {number} x1
   * @param {number} y1
   * @param {number} x2
   * @param {number} y2
   * @param {number} x3
   * @param {number} y3
   * @param {number[]} points
   * @param {number} distanceTolerance
   * @param {number} level
   */
  #recursive(x1, y1, x2, y2, x3, y3, points, distanceTolerance, level) {
    if (level > this.recursionLimit) return;

    // Calculate all the mid-points of the line segments
    //----------------------
    const x12 = (x1 + x2) / 2;
    const y12 = (y1 + y2) / 2;
    const x23 = (x2 + x3) / 2;
    const y23 = (y2 + y3) / 2;
    const x123 = (x12 + x23) / 2;
    const y123 = (y12 + y23) / 2;

    let dx = x3 - x1;
    let dy = y3 - y1;
    const d = Math.abs((x2 - x3) * dy - (y2 - y3) * dx);

    if (d > this.fltEpsilon) {
      // Regular care
      //-----------------
      if (d * d <= distanceTolerance * (dx * dx + dy * dy)) {
        // If the curvature doesn't exceed the distance_tolerance value
        // we tend to finish subdivisions.
        //----------------------
        if (this.mAngleTolerance < this.curveAngleToleranceEpsilon) {
          points.push(x123, y123);
          return;
        }

        // Angle & Cusp Condition
        //----------------------
        let da = Math.abs(
          Math.atan2(y3 - y2, x3 - x2) - Math.atan2(y2 - y1, x2 - x1)
        );
        if (da >= Math.PI) da = 2 * Math.PI - da;

        if (da < this.mAngleTolerance) {
          // Finally we can stop the recursion
          //----------------------
          points.push(x123, y123);
          return;
        }
      }
    } else {
      // Collinear case
      //-----------------
      dx = x123 - (x1 + x3) / 2;
      dy = y123 - (y1 + y3) / 2;
      if (dx * dx + dy * dy <= distanceTolerance) {
        points.push(x123, y123);
        return;
      }
    }

    // Continue subdivision
    //----------------------
    this.#recursive(
      x1,
      y1,
      x12,
      y12,
      x123,
      y123,
      points,
      distanceTolerance,
      level + 1
    );
    this.#recursive(
      x123,
      y123,
      x23,
      y23,
      x3,
      y3,
      points,
      distanceTolerance,
      level + 1
    );
  }
}

export class AdaptiveCubicBezierBuilder {
  /**@type {number} */
  recursionLimit;
  /**@type {number} */
  fltEpsilon;
  /**@type {number} */
  pathDistanceEpsilon;
  /**@type {number} */
  curveAngleToleranceEpsilon;
  /**@type {number} */
  mAngleTolerance;
  /**@type {number} */
  mCuspLimit;

  /**
   * @param {CubicBuilderOptions} [options={}]
   */
  constructor(options = {}) {
    this.recursionLimit = options?.recursion ?? 32;
    this.fltEpsilon = options?.epsilon ?? 1.1920929e-7;
    this.pathDistanceEpsilon = options?.pathEpsilon ?? 1;
    this.curveAngleToleranceEpsilon = options?.angleEpsilon ?? 0.01;
    this.mAngleTolerance = options?.angleTolerance || 0;
    this.mCuspLimit = options?.cuspLimit || 0;
  }

  /**
   * Flattens the curve into a sequence of line segments adaptively.
   * @param {[number,number]} start Starting point of the curve.
   * @param {[number,number]} c1 First control point.
   * @param {[number,number]} c2 Second control point.
   * @param {[number,number]} end End point of the curve.
   * @param {number} [scale=1] Applies a finer subdivsion interval if the
   * resultant points are used in a scaled context, defaults to `1`.
   * @param {number[]} [points=[]] An array to push the results to, if
   * not specified it will create a new array and return it.
   * @returns {number[]} Resultant points that forms the curve
   */
  flatten(start, c1, c2, end, scale = 1, points = []) {
    let distanceTolerance = this.pathDistanceEpsilon / scale;
    distanceTolerance *= distanceTolerance;

    const [x1, y1] = start,
      [x2, y2] = c1,
      [x3, y3] = c2,
      [x4, y4] = end;

    points.push(x1, y1);
    this.#recursive(
      x1,
      y1,
      x2,
      y2,
      x3,
      y3,
      x4,
      y4,
      points,
      distanceTolerance,
      0
    );
    points.push(x4, y4);

    return points;
  }

  /**
   *
   * @param {number} x1
   * @param {number} y1
   * @param {number} x2
   * @param {number} y2
   * @param {number} x3
   * @param {number} y3
   * @param {number} x4
   * @param {number} y4
   * @param {number[]} points
   * @param {number} distanceTolerance
   * @param {number} level
   */
  #recursive(x1, y1, x2, y2, x3, y3, x4, y4, points, distanceTolerance, level) {
    if (level > this.recursionLimit) return;

    // Calculate all the mid-points of the line segments
    //----------------------
    const x12 = (x1 + x2) / 2;
    const y12 = (y1 + y2) / 2;
    const x23 = (x2 + x3) / 2;
    const y23 = (y2 + y3) / 2;
    const x34 = (x3 + x4) / 2;
    const y34 = (y3 + y4) / 2;
    const x123 = (x12 + x23) / 2;
    const y123 = (y12 + y23) / 2;
    const x234 = (x23 + x34) / 2;
    const y234 = (y23 + y34) / 2;
    const x1234 = (x123 + x234) / 2;
    const y1234 = (y123 + y234) / 2;

    if (level > 0) {
      // Enforce subdivision first time
      // Try to approximate the full cubic curve by a single straight line
      //------------------
      let dx = x4 - x1;
      let dy = y4 - y1;

      const d2 = Math.abs((x2 - x4) * dy - (y2 - y4) * dx);
      const d3 = Math.abs((x3 - x4) * dy - (y3 - y4) * dx);

      let da1, da2;

      if (d2 > this.fltEpsilon && d3 > this.fltEpsilon) {
        // Regular care
        //-----------------
        if ((d2 + d3) * (d2 + d3) <= distanceTolerance * (dx * dx + dy * dy)) {
          // If the curvature doesn't exceed the distanceTolerance value
          // we tend to finish subdivisions.
          //----------------------
          if (this.mAngleTolerance < this.curveAngleToleranceEpsilon) {
            points.push(x1234, y1234);
            return;
          }

          // Angle & Cusp Condition
          //----------------------
          const a23 = Math.atan2(y3 - y2, x3 - x2);
          da1 = Math.abs(a23 - Math.atan2(y2 - y1, x2 - x1));
          da2 = Math.abs(Math.atan2(y4 - y3, x4 - x3) - a23);
          if (da1 >= Math.PI) da1 = 2 * Math.PI - da1;
          if (da2 >= Math.PI) da2 = 2 * Math.PI - da2;

          if (da1 + da2 < this.mAngleTolerance) {
            // Finally we can stop the recursion
            //----------------------
            points.push(x1234, y1234);
            return;
          }

          if (this.mCuspLimit !== 0) {
            if (da1 > this.mCuspLimit) {
              points.push(x2, y2);
              return;
            }

            if (da2 > this.mCuspLimit) {
              points.push(x3, y3);
              return;
            }
          }
        }
      } else {
        if (d2 > this.fltEpsilon) {
          // p1,p3,p4 are collinear, p2 is considerable
          //----------------------
          if (d2 * d2 <= distanceTolerance * (dx * dx + dy * dy)) {
            if (this.mAngleTolerance < this.curveAngleToleranceEpsilon) {
              points.push(x1234, y1234);
              return;
            }

            // Angle Condition
            //----------------------
            da1 = Math.abs(
              Math.atan2(y3 - y2, x3 - x2) - Math.atan2(y2 - y1, x2 - x1)
            );
            if (da1 >= Math.PI) da1 = 2 * Math.PI - da1;

            if (da1 < this.mAngleTolerance) {
              points.push(x2, y2);
              points.push(x3, y3);
              return;
            }

            if (this.mCuspLimit !== 0) {
              if (da1 > this.mCuspLimit) {
                points.push(x2, y2);
                return;
              }
            }
          }
        } else if (d3 > this.fltEpsilon) {
          // p1,p2,p4 are collinear, p3 is considerable
          //----------------------
          if (d3 * d3 <= distanceTolerance * (dx * dx + dy * dy)) {
            if (this.mAngleTolerance < this.curveAngleToleranceEpsilon) {
              points.push(x1234, y1234);
              return;
            }

            // Angle Condition
            //----------------------
            da1 = Math.abs(
              Math.atan2(y4 - y3, x4 - x3) - Math.atan2(y3 - y2, x3 - x2)
            );
            if (da1 >= Math.PI) da1 = 2 * Math.PI - da1;

            if (da1 < this.mAngleTolerance) {
              points.push(x2, y2);
              points.push(x3, y3);
              return;
            }

            if (this.mCuspLimit !== 0) {
              if (da1 > this.mCuspLimit) {
                points.push(x3, y3);
                return;
              }
            }
          }
        } else {
          // Collinear case
          //-----------------
          dx = x1234 - (x1 + x4) / 2;
          dy = y1234 - (y1 + y4) / 2;
          if (dx * dx + dy * dy <= distanceTolerance) {
            points.push(x1234, y1234);
            return;
          }
        }
      }
    }

    // Continue subdivision
    //----------------------
    this.#recursive(
      x1,
      y1,
      x12,
      y12,
      x123,
      y123,
      x1234,
      y1234,
      points,
      distanceTolerance,
      level + 1
    );
    this.#recursive(
      x1234,
      y1234,
      x234,
      y234,
      x34,
      y34,
      x4,
      y4,
      points,
      distanceTolerance,
      level + 1
    );
  }
}
