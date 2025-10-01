import {
  AdaptiveCubicBezierBuilder as CBuilder,
  AdaptiveQuadraticBezierBuilder as QBuilder,
} from "../index.js";

import {
  background,
  drawBezierCurve,
  initCanvas2D,
  drawBezierPoints,
} from "./helpers.mjs";

const quadCurve = {
  P0: [-300, 0],
  P1: [0, 500],
  P2: [300, 200],
};

const cubicCurve = {
  P0: [-300, 0],
  P1: [400, 300],
  P2: [-100, 60],
  P3: [300, 10],
};

const ctx = initCanvas2D(1024, 1024);

const cb = new CBuilder();
const qb = new QBuilder();

const quadPoints = qb.flatten(quadCurve.P0, quadCurve.P1, quadCurve.P2);

const cubicPoints = cb.flatten(
  cubicCurve.P0,
  cubicCurve.P1,
  cubicCurve.P2,
  cubicCurve.P3
);

const quadColor = "lime";
const cubicColor = "cyan";
const pointsColor = "red";
const textColor = "white";

function draw() {
  background(0, 0, 0, ctx);

  ctx.lineWidth = 3;
  ctx.shadowBlur = 12;
  ctx.font = "24px serif";

  ctx.strokeStyle = quadColor;
  ctx.translate(ctx.canvas.width / 2, ctx.canvas.height / 2 - 400);
  ctx.shadowColor = quadColor;
  drawBezierCurve(ctx, quadPoints);
  ctx.shadowColor = pointsColor;
  ctx.fillStyle = pointsColor;
  drawBezierPoints(ctx, 3, quadPoints);
  ctx.fillStyle = textColor;
  ctx.shadowColor = textColor;
  ctx.fillText("Quadratic Curve", -60, 380);

  ctx.strokeStyle = cubicColor;
  ctx.translate(0, 600);
  ctx.fillText("Cubic Curve", -50, 210);
  ctx.shadowColor = cubicColor;
  drawBezierCurve(ctx, cubicPoints);
  ctx.fillStyle = pointsColor;
  ctx.shadowColor = pointsColor;
  drawBezierPoints(ctx, 3, cubicPoints);
}

draw();
