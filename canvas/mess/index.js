var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
'floor|random|round|abs|sqrt|PI|atan2|sin|cos|pow|max|min|hypot'
.split('|')
    .forEach(function (p) {
        window[p] = Math[p];
    });
var TAU = PI * 2;

function r(n) {
    return random() * n;
}

function rrng(lo, hi) {
    return lo + r(hi - lo);
}

function rint(lo, hi) {
    return lo + floor(r(hi - lo + 1));
}

function choose(args) {
    return args[rint(0, args.length - 1)];
}
/*---------------------------------------------------------------------------*/
var W, H, frame, time, DPR;

function dpr(n) {
    return DPR * n;
}

function resize() {
    var w = innerWidth;
    var h = innerHeight;
    DPR = devicePixelRatio || 1;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    W = canvas.width = w * DPR;
    H = canvas.height = h * DPR;
}

function loop(t) {
    frame = requestAnimationFrame(loop);
    draw();
    time++;
}

function pause() {
    cancelAnimationFrame(frame);
    frame = frame ? null : requestAnimationFrame(loop);
}

function reset() {
    cancelAnimationFrame(frame);
    resize();
    ctx.clearRect(0, 0, W, H);
    init();
    time = 0;
    frame = requestAnimationFrame(loop);
}
/*---------------------------------------------------------------------------*/
function Vector(x, y) {
    this.x = x;
    this.y = y;
}
Vector.add = function (a, b) {
    return new Vector(a.x + b.x, a.y + b.y);
};
Vector.sub = function (a, b) {
    return new Vector(a.x - b.x, a.y - b.y);
};
Vector.mul = function (a, n) {
    return new Vector(a.x * n, a.y * n);
};
Vector.div = function (a, n) {
    return new Vector(a.x / n, a.y / n);
};
Vector.prototype.clone = function () {
    return new Vector(this.x, this.y);
};
Vector.prototype.add = function (other) {
    this.x += other.x;
    this.y += other.y;
    return this;
};
Vector.prototype.sub = function (other) {
    this.x -= other.x;
    this.y -= other.y;
    return this;
};
Vector.prototype.mul = function (n) {
    this.x *= n;
    this.y *= n;
    return this;
};
Vector.prototype.div = function (n) {
    this.x /= n;
    this.y /= n;
    return this;
};
Vector.prototype.mag = function () {
    var x = this.x,
        y = this.y;
    return sqrt(x * x + y * y);
};
Vector.prototype.normalize = function () {
    return this.div(this.mag());
};
Vector.prototype.constrain = function (n) {
    var m = this.mag();
    return m > n ? this.mul(n / m) : this;
};
Vector.prototype.zero = function () {
    this.x = 0;
    this.y = 0;
};

function vec(x, y) {
    return new Vector(x, y);
}
/*---------------------------------------------------------------------------*/
function Particle(max, loc) {
    this.loc = loc;
    this.vel = vec(0, 0);
    this.max = max;
    this.acc = vec(0, 0);
    //this.relocate();
}
Particle.prototype.relocate = function () {
    this.loc = vec(rrng(L, R), rrng(T, B));
    var t = r(TAU);
    var m = this.max;
    this.vel = vec(m * cos(t), m * sin(t));
};
Particle.prototype.applyForce = function (force) {
    this.acc.add(force);
};
Particle.prototype.follow = function (field) {
    var desired = field.forceAt(this.loc);
    var steer = Vector.sub(desired, this.vel);
    this.applyForce(steer.constrain(this.max * 0.8));
};
Particle.prototype.seekFriend = function () {
    var desired = Vector.sub(this.friend.loc, this.loc);
    var steer = Vector.sub(desired, this.vel);
    this.applyForce(steer.constrain(this.max * 0.35));
};
Particle.prototype.move = function (draw) {
    if (draw) {
        ctx.moveTo(this.loc.x, this.loc.y);
        this.vel.add(this.acc).constrain(this.max);
        this.loc.add(this.vel);
        ctx.lineTo(this.loc.x, this.loc.y);
    } else {
        this.vel.add(this.acc).constrain(this.max);
        this.loc.add(this.vel);
    }
    this.acc.zero();
    if (this.loc.x < L) {
        this.loc.x = L;
        this.vel.x *= -1;
    }
    if (this.loc.y < T) {
        this.loc.y = T;
        this.vel.y *= -1;
    }
    if (this.loc.x > R) {
        this.loc.x = R;
        this.vel.x *= -1;
    }
    if (this.loc.y > B) {
        this.loc.y = B;
        this.vel.y *= -1;
    }
};
/*---------------------------------------------------------------------------*/
function Field(x, y, w, h, res) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.res = res;
    this.forces = [];
    this.imax = ~~(w / res);
    this.jmax = ~~(h / res);
    for (var i = 0; i <= w / res; i++) {
        this.forces[i] = [];
        for (var j = 0; j <= h / res; j++) {
            var t = r(TAU);
            var m = r(dpr(5));
            this.forces[i][j] = vec(cos(t), sin(t)).mul(m);
        }
    }
}
Field.prototype = {
    forceAt: function (v) {
        var i = ~~((v.x - this.x) / this.res);
        var j = ~~((v.y - this.y) / this.res);
        i = max(i, 0);
        i = min(i, this.imax);
        j = max(j, 0);
        j = min(j, this.jmax);
        return this.forces[i][j];
    },
    reset: function () {
        for (var i = 0; i <= this.imax; i++) {
            for (var j = 0; j <= this.jmax; j++) {
                var t = r(TAU);
                var m = r(dpr(5));
                this.forces[i][j] = vec(cos(t), sin(t)).mul(m);
            }
        }
    },
    perturb: function (n) {
        var ii, jj, t;
        for (; n > 0; n--) {
            ii = rint(0, this.imax);
            jj = rint(0, this.jmax);
            t = r(TAU);
            this.forces[ii][jj] = vec(cos(t), sin(t)).mul(r(dpr(5)));
        }
    },
    draw: function () {
        var res = this.res;
        ctx.save();
        for (var i = 0; i <= this.imax; i++) {
            for (var j = 0; j <= this.jmax; j++) {
                var force = Vector.mul(this.forces[i][j], dpr(3));
                var x = this.x + i * res + res / 2;
                var y = this.y + j * res + res / 2;
                ctx.moveTo(x, y);
                ctx.lineTo(x + force.x, y + force.y);
            }
        }
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.stroke();
        ctx.restore();
    }
};
/*---------------------------------------------------------------------------*/
var P, particles;
var L, R;
var field;

function init() {
    L = W / 2 - dpr(300);
    R = W / 2 + dpr(300);
    T = H / 2 - dpr(300);
    B = H / 2 + dpr(300);
    P = 14000;
    particles = new Array(P);
    var n = dpr(150);
    for (var i = 0; i < P; i++) {
        //    var y = H/2-dpr(300)+i;
        var t = r(TAU);
        particles[i] = new Particle(dpr(3), vec(W / 2 + n * cos(t), H / 2 + n * sin(t)));
    }
    for (i = 1; i < P; i++) {
        particles[i].friend = particles[i - 1];
    }
    particles[0].friend = particles[P - 1];
    field = new Field(L, T, dpr(600), dpr(600), dpr(10));
    ctx.strokeStyle = black;
    ctx.fillStyle = white;
}
var black = 'rgba(0, 0, 0, 0.4)';
var white = 'rgba(255, 255, 255, 0.1)';

function draw() {
    //if (time % 120 === 0) {
    //field.reset();
    //}
    field.perturb(20);
    ctx.fillRect(0, 0, W, H);
    ctx.beginPath();
    for (var i = 0; i < P; i++) {
        var p = particles[i];
        p.follow(field);
        p.seekFriend();
        p.move(true);
    }
    /*ctx.moveTo(particles[0].loc.x, particles[0].loc.y);
    for (var i = 0; i < P; i++) {
      var f = particles[i].friend;
      ctx.lineTo(f.loc.x, f.loc.y);
    }*/
    ctx.stroke();
}
/*---------------------------------------------------------------------------*/
document.onclick = pause;
document.ondblclick = reset;
reset();