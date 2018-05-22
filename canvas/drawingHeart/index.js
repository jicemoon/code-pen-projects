var b = document.body;
var c = document.getElementsByTagName('canvas')[0];
var a = c.getContext('2d');

var e = []; // trails
var h = []; // heart path
var O = c.width = innerWidth;
var Q = c.height = innerHeight;
var v = 32; // num trails, num particles per trail & num nodes in heart path
var M = Math;
var R = M.random;
var C = M.cos;
var Y = 6.3; // close to 44/7 or Math.PI * 2 - 6.3 seems is close enough. 
var i = 0;
for (i = 0; i < Y; i += .2) {
    h.push([
        O / 2 + 180 * M.pow(M.sin(i), 3),
        Q / 2 + 10 * (-(15 * C(i) - 5 * C(2 * i) - 2 * C(3 * i) - C(4 * i)))
    ])
}
i = 0;
while (i < v) {
    x = R() * O;
    y = R() * Q;
    //r = R() * 50 + 200;
    //b = R() * r;
    //g = R() * b;
    H = i / v * 80 + 280;
    S = R() * 40 + 60;
    B = R() * 60 + 20;
    f = []; // create new trail
    k = 0;
    while (k < v) {
        f[k++] = { // create new particle
            x: x, // position 
            y: y,
            X: 0, // velocity
            Y: 0,
            R: (1 - k / v) + 1, // radius
            S: R() + 1, // acceleration 
            q: ~~(R() * v), // target node on heart path
            //D : R()>.5?1:-1,
            D: i % 2 * 2 - 1, // direction around heart path
            F: R() * .2 + .7, // friction
            //f : "rgba(" + ~~r + "," + ~~g + "," + ~~b + ",.1)"
            f: "hsla(" + ~~H + "," + ~~S + "%," + ~~B + "%,.1)" // colour
        }
    }
    e[i++] = f; // dots are a 2d array of trails x particles
}

function render(_) { // draw particle
    a.fillStyle = _.f;
    a.beginPath();
    a.arc(_.x, _.y, _.R, 0, Y, 1);
    a.closePath();
    a.fill();
}

function loop() {
    a.fillStyle = "rgba(0,0,0,.2)"; // clear screen
    a.fillRect(0, 0, O, Q);
    i = v;
    while (i--) {
        f = e[i]; // get worm
        u = f[0]; // get 1st particle of worm
        q = h[u.q]; // get current node on heart path
        D = u.x - q[0]; // calc distance
        E = u.y - q[1];
        G = M.sqrt((D * D) + (E * E));
        if (G < 10) { // has trail reached target node?
            if (R() > .95) { // randomly send a trail elsewhere
                u.q = ~~(R() * v);
            } else {
                if (R() > .99) u.D *= -1; // randomly change direction
                u.q += u.D;
                u.q %= v;
                if (u.q < 0) u.q += v;
            }
        }
        u.X += -D / G * u.S; // calculate velocity
        u.Y += -E / G * u.S;
        u.x += u.X; // apply velocity
        u.y += u.Y;
        render(u); // draw the first particle
        u.X *= u.F; // apply friction
        u.Y *= u.F;
        k = 0;
        while (k < v - 1) { // loop through remaining dots
            T = f[k]; // this particle
            N = f[++k]; // next particle
            N.x -= (N.x - T.x) * .7; // use zenos paradox to create trail
            N.y -= (N.y - T.y) * .7;
            render(N);
        }
    }
};
(function doit() {
    requestAnimationFrame(doit);
    loop();
}());