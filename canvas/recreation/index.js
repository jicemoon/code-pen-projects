var w = c.width = window.innerWidth,
    h = c.height = window.innerHeight,
    center = {
        x: w / 2,
        y: h / 2
    },
    count = 8,
    slider = document.getElementById('nc-slider'),
    ctx = c.getContext('2d'),
    frame = 0,
    T = Math.PI * 2,
    circleRadius = 60,
    mainCircleRadius = (Math.min(w, h) - circleRadius * 2 - 10) / 2;

ctx.strokeStyle = 'white';
ctx.lineWidth = 1;

function anim() {
    window.requestAnimationFrame(anim);

    ctx.fillRect(0, 0, w, h);

    count = parseInt(slider.value);
    frame += 0.04;

    circleRadius = Math.min(h, w) / count

    var mainCircleRadDist = T / count;

    var pointArray = [];

    ctx.beginPath();
    for (var i = 0; i < count; ++i) {
        var rad = mainCircleRadDist * i;
        var x = Math.cos(rad) * mainCircleRadius + center.x;
        var y = Math.sin(rad) * mainCircleRadius + center.y;

        ctx.moveTo(x + circleRadius, y);
        ctx.arc(x, y, circleRadius, 0, T);

        pointArray.push(point(x, y,
            frame + 2 * rad,
            circleRadius))
    }

    for (var i = 0; i < count; ++i) {
        for (var j = i + 1; j < count; ++j) {
            var p1 = pointArray[i],
                p2 = pointArray[j];

            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
        }
    }

    ctx.stroke();
    ctx.closePath();
}
anim();

function point(cx, cy, rad, radius) {
    return {
        x: cx + Math.cos(rad) * radius,
        y: cy + Math.sin(rad) * radius
    }
}