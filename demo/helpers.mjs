/**
 * initializes a 2D canvas and returns the context
 * @param {number} width
 * @param {number} height
 * @returns
 */
function initCanvas2D(width, height) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  document.body.append(canvas);

  return canvas.getContext("2d");
}

/**
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number[]} points
 */
function drawBezierCurve(ctx, points) {
  ctx.beginPath();
  ctx.moveTo(points[0], points[1]);
  for (let i = 2; i < points.length; i += 2) {
    const x = points[i];
    const y = points[i + 1];
    ctx.lineTo(x, y);
  }
  ctx.stroke();
}

/**
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} radius
 * @param {number[]} points
 */
function drawBezierPoints(ctx, radius, points) {
  for (let i = 0; i < points.length; i += 2) {
    const x = points[i];
    const y = points[i + 1];
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

/**
 *
 * @param {number} r red component
 * @param {number} g green component
 * @param {number} b blue component
 * @param {CanvasRenderingContext2D} ctx
 */
function background(r, g, b, ctx) {
  ctx.fillStyle = `rgb(${r} ${g} ${b})`;
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

export { background, drawBezierCurve, initCanvas2D, drawBezierPoints };
