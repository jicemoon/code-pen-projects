Utl = {};
Utl.random = function (min, max) {
    return min + Math.random() * (max - min);
};
Utl.distance = function (p1, p2) {
    return Math.hypot(p1.x - p2.x, p1.y - p2.y);
};

let canvas = document.createElement("canvas");
let ctx = canvas.getContext("2d");
document.getElementById("canvas_container").appendChild(canvas);

let W = (canvas.width = 250),
    H = (canvas.height = 300);

let pointer = {
    pos: {
        x: 0,
        y: 0
    },
    active: false,
    drag: false
};

// events
document.addEventListener("pointerdown", event => pointerDown(event), false);
document.addEventListener("pointerup", event => pointerUp(event), false);
document.addEventListener("pointermove", event => pointerMove(event), false);

let zoom = 2;
canvas.style.width = W * zoom + "px";
canvas.style.height = H * zoom + "px";

function updatePointerPosition(event) {
    pointer.pos.x = (event.pageX - canvas.offsetLeft) / zoom;
    pointer.pos.y = (event.pageY - canvas.offsetTop) / zoom;
}

function pointerMove(event) {
    updatePointerPosition(event);
}

function pointerDown(event) {
    pointer.active = true;
    updatePointerPosition(event);
}

function pointerUp(event) {
    pointer.active = false;
    pointer.drag = false;
}

// colors
let background_color = "#ededed";
let dot_color = "#222";

let hair_color = {
    brown: ["#504444", "#2c222b", "#2c222b"],
    ginger: ["#8d4a42", "#b6523a", "#b6523a"],
    medium_grey: ["#ad9590", "#b7a69e", "#d6c4c2"],
    cookie_monster: ["#00adef", "#5cd2ff"]
};
let current_hair_color = "brown";

for (var value in hair_color) {
    let option = document.createElement("option");
    option.value = value;
    option.text = value;
    document.getElementById("hair_color_list").appendChild(option);
}

function changeHairColor(value) {
    current_hair_color = value;
}

function getHairColor() {
    let random_id_color = Math.floor(
        Utl.random(0, hair_color[current_hair_color].length)
    );
    return hair_color[current_hair_color][random_id_color];
}

let gravity = 0.2;
let friction = 0.96;
let stiffness = 1;
let bounce = 0.2;
let hair_number = 100;
let hair_length = 100;
let divisions = 5;

function generateFluff() {
    fluff = new FluffyBall(W / 2, H / 2, 10, hair_number, hair_length, divisions);
}

function changeHairDivision(input_value) {
    divisions = parseFloat(input_value);
}

function changeHairNumber(input_value) {
    hair_number = parseFloat(input_value);
}

function changeHairLength(input_value) {
    hair_length = parseFloat(input_value);
}

function changeGravity(input_value) {
    gravity = parseFloat(input_value);
}

function changeFriction(input_value) {
    friction = parseFloat(input_value);
}

function changeStiffness(input_value) {
    stiffness = parseFloat(input_value);
}

class Point {
    constructor(x, y) {
        this.pos = {
            x: x,
            y: y
        };
        this.old_pos = {
            x: x,
            y: y
        };
        this.pinned = false;
    }
}

class Hair {
    constructor(parent, start_angle, length, divisions) {
        this.parent = parent;
        this.start_angle = start_angle;
        this.pos = {};
        this.pos.x =
            this.parent.pos.x + this.parent.rayon * Math.cos(this.start_angle);
        this.pos.y =
            this.parent.pos.y + this.parent.rayon * Math.sin(this.start_angle);
        this.thickness = Utl.random(0.2, 0.6);
        this.color = getHairColor();
        this.divisions = divisions;
        this.length = length * Utl.random(1.2, 0.4);
        this.segments_length = this.length / this.divisions;
        this.points = [];
        this.sticks = [];
        this.generateHair();
    }
    generateHair() {
        for (let i = 0; i < this.divisions; i++) {
            let set_x =
                this.pos.x + Math.cos(this.start_angle) * (this.segments_length * i);
            let set_y =
                this.pos.y + Math.sin(this.start_angle) * (this.segments_length * i);
            this.points.push(new Point(set_x, set_y));
        }
        this.points[0].pinned = true;
        this.points[0].pos = this.pos;
        for (let i = 0; i < this.points.length - 1; i++) {
            this.sticks.push({
                p0: this.points[i],
                p1: this.points[i + 1],
                length: this.segments_length
            });
        }
    }
    renderPoints() {
        ctx.fillStyle = this.color;
        for (let i = 0; i < this.points.length; i++) {
            ctx.beginPath();
            ctx.arc(Math.round(this.points[i].pos.x), Math.round(this.points[i].pos.y), 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    renderSticks() {
        ctx.lineWidth = this.thickness;
        ctx.strokeStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(this.points[0].pos.x, this.points[0].pos.y);
        let compte = 1;
        for (compte; compte < this.divisions - 2; compte++) {
            var xc = (this.points[compte].pos.x + this.points[compte + 1].pos.x) / 2;
            var yc = (this.points[compte].pos.y + this.points[compte + 1].pos.y) / 2;
            ctx.quadraticCurveTo(
                this.points[compte].pos.x,
                this.points[compte].pos.y,
                xc,
                yc
            );
        }
        ctx.quadraticCurveTo(
            this.points[compte].pos.x,
            this.points[compte].pos.y,
            this.points[compte + 1].pos.x,
            this.points[compte + 1].pos.y
        );
        ctx.stroke();
    }
    updatePoints() {
        for (var i = 0; i < this.points.length; i++) {
            var p = this.points[i];
            if (!p.pinned) {
                var vx = (p.pos.x - p.old_pos.x) * friction,
                    vy = (p.pos.y - p.old_pos.y) * friction;

                p.old_pos.x = p.pos.x;
                p.old_pos.y = p.pos.y;
                p.pos.x += vx;
                p.pos.y += vy;

                p.pos.x += Math.cos(this.start_angle) * (stiffness / i) * 0.4;
                p.pos.y += Math.sin(this.start_angle) * (stiffness / i) * 0.4;

                p.pos.y += gravity;

                if (p.pos.x > W) {
                    p.pos.x = W;
                    p.old_pos.x = p.pos.x + vx * bounce;
                } else if (p.pos.x < 0) {
                    p.pos.x = 0;
                    p.old_pos.x = p.pos.x + vx * bounce;
                }
                if (p.pos.y > H) {
                    p.pos.y = H;
                    p.old_pos.y = p.pos.y + vy * bounce;
                } else if (p.pos.y < 0) {
                    p.pos.y = 0;
                    p.old_pos.y = p.pos.y + vy * bounce;
                }
            }
        }
    }
    updateSticks() {
        for (let i = 0; i < this.sticks.length; i++) {
            let s = this.sticks[i],
                dx = s.p1.pos.x - s.p0.pos.x,
                dy = s.p1.pos.y - s.p0.pos.y,
                distance = Math.sqrt(dx * dx + dy * dy),
                difference = s.length - distance,
                percent = difference / distance / 2,
                offsetX = dx * percent,
                offsetY = dy * percent;

            if (!s.p0.pinned) {
                s.p0.pos.x -= offsetX;
                s.p0.pos.y -= offsetY;
            }
            if (!s.p1.pinned) {
                s.p1.pos.x += offsetX;
                s.p1.pos.y += offsetY;
            }
        }
    }

    render() {
        this.pos.x =
            this.parent.pos.x + this.parent.rayon * Math.cos(this.start_angle);
        this.pos.y =
            this.parent.pos.y + this.parent.rayon * Math.sin(this.start_angle);
        // update
        this.updatePoints();
        for (var i = 0; i < 5; i++) {
            this.updateSticks();
        }
        // render
        this.renderSticks();
        //this.renderPoints();
    }
}

class FluffyBall {
    constructor(x, y, rayon, hair_density, length, divisions) {
        this.pos = {
            x: x,
            y: y
        };
        this.color = getHairColor();
        this.rayon = rayon || 20;
        this.hair_density = hair_density || 40;
        this.length = length;
        this.divisions = divisions;
        this.fur = [];
        this.generateFur();
    }
    generateFur() {
        for (let i = 0; i < this.hair_density; i++) {
            this.fur.push(
                new Hair(this, Utl.random(0, Math.PI * 2), this.length, this.divisions)
            );
        }
    }
    render() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, this.rayon + 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();

        for (let i = 0; i < this.fur.length; i++) {
            this.fur[i].render();
        }
    }
}

//let testHair = new Hair(W/2,H/2,Utl.random(0,Math.PI*2),200,6);

generateFluff();

function clearCanvas() {
    ctx.fillStyle = background_color;
    ctx.fillRect(0, 0, W, H);
}

function RenderLoop() {
    if (
        (pointer.active && Utl.distance(pointer.pos, fluff.pos) < fluff.rayon) ||
        pointer.drag
    ) {
        pointer.drag = true;
        fluff.pos.x = pointer.pos.x;
        fluff.pos.y = pointer.pos.y;
    }
    clearCanvas();
    fluff.render();
    requestAnimationFrame(RenderLoop);
}
// When ready, launch the loop !
RenderLoop();