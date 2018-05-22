var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

var c2 = document.getElementById('lasers');
var lasers = c2.getContext('2d');

var Width, Height;
sizeCanvas();

var raf = requestAnimationFrame;

/*---------------------------------------------------------------------------*/

'floor|random|round|abs|sqrt|PI|atan2|sin|cos|pow|max|min'
.split('|')
    .forEach(function (p) {
        this[p] = Math[p];
    });
var TAU = PI * 2;

function randint(n) {
    return floor(n * random());
}

function choose() {
    return arguments[randint(arguments.length)];
}

/*---------------------------------------------------------------------------*/

var running = false;
var time = 0;

function sizeCanvas() {
    Width = canvas.width = c2.width = innerWidth;
    Height = canvas.height = c2.height = innerHeight;

    canvas.style.position = c2.style.position = 'fixed';
    canvas.style.top = c2.style.top = 0;
    canvas.style.left = c2.style.left = 0;

}

function loop() {
    draw();
    time++;
    if (running) raf(loop);
}

document.onclick = function (e) {
    running = false;
    setTimeout(function () {
        time = 0;
        reset();
        running = true;
        raf(loop);
    }, 100);
};

var mouse = {
    x: 100,
    y: 100
};
document.onmousemove = function (e) {
    mouse.x = e.pageX;
    mouse.y = e.pageY;
};

/*---------------------------------------------------------------------------*/

function Creeper(x, y, fn, depth) {
    this.x = this.x1 = x;
    this.y = this.x2 = y;
    this.fn = (fn || chooseDirection());
    this.depth = (depth || 0);
}

var directions = [
    N, N, S, S, E, E, W, W,
    NE1, NE2, NW1, NW2,
    SE1, SE2, SW1, SW2
];

function chooseDirection(fns) {
    if (fns) {
        do {
            fn = chooseDirection();
        } while (fns.indexOf(fn) > -1);
        return fn;
    }
    return directions[randint(16)];
}

Creeper.prototype.animate = function (n) {
    var pos = this.fn(this.x, this.y, n);
    this.x1 = pos.x;
    this.y1 = pos.y;
};

Creeper.prototype.spawn = function () {
    var x, y;

    switch (this.fn) {
        case N:
            x = this.x;
            y = this.y - Length;
            break;
        case S:
            x = this.x;
            y = this.y + Length;
            break;
        case E:
            x = this.x + Length;
            y = this.y;
            break;
        case W:
            x = this.x - Length;
            y = this.y;
            break;
        case NE1:
        case NE2:
            x = this.x + Length;
            y = this.y - Length;
            break;
        case NW1:
        case NW2:
            x = this.x - Length;
            y = this.y - Length;
            break;
        case SE1:
        case SE2:
            x = this.x + Length;
            y = this.y + Length;
            break;
        case SW1:
        case SW2:
            x = this.x - Length;
            y = this.y + Length;
            break;
    }

    return new Creeper(x, y, chooseDirection(), this.depth + 1);
};

function N(x, y, n) {
    return segment(x, y, x, y - Length, n);
}

function S(x, y, n) {
    return segment(x, y, x, y + Length, n);
}

function E(x, y, n) {
    return segment(x, y, x + Length, y, n);
}

function W(x, y, n) {
    return segment(x, y, x - Length, y, n);
}

function NE1(x, y, n) {
    return arc(x, y - Length, TAU / 4, 0, n, true);
}

function NE2(x, y, n) {
    return arc(x + Length, y, PI, 3 * TAU / 4, n, false);
}

function NW1(x, y, n) {
    return arc(x, y - Length, TAU / 4, TAU / 2, n, false);
}

function NW2(x, y, n) {
    return arc(x - Length, y, TAU, 3 * TAU / 4, n, true);
}

function SE1(x, y, n) {
    return arc(x, y + Length, 3 * TAU / 4, TAU, n, false);
}

function SE2(x, y, n) {
    return arc(x + Length, y, TAU / 2, TAU / 4, n, true);
}

function SW1(x, y, n) {
    return arc(x, y + Length, 3 * TAU / 4, TAU / 2, n, true);
}

function SW2(x, y, n) {
    return arc(x - Length, y, 0, TAU / 4, n, false);
}

function jitter(n) {
    return n + choose(-1, 0, 1);
}

function segment(x1, y1, x2, y2, n) {
    var dx = (x2 - x1) / FPC;
    var dy = (y2 - y1) / FPC;
    var x = x1 + n * dx;
    var y = y1 + n * dy;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + dx, y + dy);
    ctx.lineCap = 'round';
    ctx.lineWidth = Thickness;
    ctx.strokeStyle = Color;
    ctx.stroke();

    return {
        x: x + dx,
        y: y + dy
    };
}

function arc(x, y, a1, a2, n, dir) {
    var da = (a2 - a1) / FPC;
    var a = a1 + n * da;


    ctx.beginPath();
    ctx.arc(x, y, Length, a, a + da, dir);
    ctx.lineCap = 'round';
    ctx.lineWidth = Thickness;
    ctx.strokeStyle = Color;
    ctx.stroke();

    return {
        x: x + Length * cos(a + da),
        y: y + Length * sin(a + da)
    };
}

function laserTo(x, y) {
    lasers.beginPath();
    //  lasers.moveTo(floor(Width/2), floor(Height/2));
    lasers.moveTo(mouse.x, mouse.y);
    lasers.lineTo(x, y);
    lasers.closePath();
    lasers.strokeStyle = 'rgba(51, 110, 123, 0.3)';
    lasers.lineWidth = 0.3;
    lasers.stroke();

    var g = lasers.createRadialGradient(x, y, 0, x, y, 4);
    g.addColorStop(0, 'white');
    g.addColorStop(1, 'rgba(34, 49, 63, 0)');

    lasers.beginPath();
    lasers.arc(x, y, 4, 0, TAU);
    lasers.fillStyle = g;
    lasers.fill();
}

/*---------------------------------------------------------------------------*/

var creepers;

var Length = 40;
var Thickness = 1;
var Color = 'rgba(51, 110, 123, 1)';

// Frames per cycle
var FPC = 20;

function reset() {
    sizeCanvas();
    ctx.clearRect(0, 0, Width, Height);
    var x = floor(Width / 2);
    var y = floor(Height / 2);
    creepers = [new Creeper(x, y, N),
        new Creeper(x, y, S),
        new Creeper(x, y, E),
        new Creeper(x, y, W)
    ];
}

function draw() {
    var next = [];
    if (time > 0 && time % FPC === 0) {
        for (i = 0; i < creepers.length; i++) {
            var c = creepers[i];
            if (c.depth > 10) continue;
            next.push(c.spawn());
            if (random() < 0.1) next.push(c.spawn());
        }
        creepers = next;
        if (creepers.length == 0) running = false;
    }
    lasers.clearRect(0, 0, Width, Height);
    for (var i = 0; i < creepers.length; i++) {
        var c = creepers[i];
        c.animate(time % FPC);
        laserTo(c.x1, c.y1);
    }
}

reset();
running = true;
raf(loop);