/*
 * Copyright (C) 2016
 * Created by missingdays
 * Distributed under terms of the MIT license.
 */
var canvas = new fabric.Canvas("c");
var center = [300, 300];
var radius = 250;
canvas.setHeight(center[0] * 2);
canvas.setWidth(center[1] * 2);
// Number of circles
var n = 200;
var circlesCoords = [];
var circles = [];
var lines = [];
var options = {
    factor: 0,
    speed: 0.1,
    stopped: false,
};
var inputFactor = document.getElementById("factor");
var inputSpeed = document.getElementById("speed");
function makeLine(coords) {
    return new fabric.Line(coords, {
        fill: "#FF6B35",
        stroke: "#FF6B35",
        strokeWidth: 1,
        selectable: false
    });
}
function makeCircle(left, top) {
    return new fabric.Circle({
        left: left - 2,
        top: top - 2,
        strokeWidth: 1,
        radius: 2,
        fill: "#fff",
        stroke: "#777"
    });
}
function init() {
    canvas.clear();
    for (var i = 0; i < n; i++) {
        var left = center[0] + radius * Math.cos(i * 2 * Math.PI / n);
        var top = center[1] + radius * Math.sin(i * 2 * Math.PI / n);
        circlesCoords.push([left, top]);
        var circle = makeCircle(left, top);
        circles.push(circle);
    }
    for (var i = 1; i < n; i++) {
        lines.push(makeLine([0, 0, 0, 0]));
    }
    canvas.add.apply(canvas, circles);
    canvas.add.apply(canvas, lines);
}
/*
 * c is a factor of multiplication
 */
function redraw(c) {
    for (var i = 0; i < n - 1; i++) {
        var x1 = circlesCoords[i][0];
        var y1 = circlesCoords[i][1];
        var x2 = circlesCoords[Math.floor(c * i) % n][0];
        var y2 = circlesCoords[Math.floor(c * i) % n][1];
        var line = lines[i];
        line.set("x1", x1);
        line.set("x2", x2);
        line.set("y1", y1);
        line.set("y2", y2)
    }
    canvas.renderAll();
}
function nextFrame(timestamp) {
    if (options.stopped) {
        return;
    }
    setFactor();
    setSpeed();
    options.factor += options.speed;
    redraw(options.factor);
    requestAnimationFrame(nextFrame);
    inputFactor.value = options.factor;
}
function play() {
    if (options.stopped) {
        options.stopped = false;
        requestAnimationFrame(nextFrame);
    }
}
function stop() {
    options.stopped = true;
}
function setFactor() {
    options.factor = parseFloat(inputFactor.value);
    redraw(options.factor);
}
function setSpeed() {
    options.speed = parseFloat(inputSpeed.value);
}
init();
requestAnimationFrame(nextFrame);