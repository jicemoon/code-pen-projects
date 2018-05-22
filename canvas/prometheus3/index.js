! function (Math) {
    "use strict";
    var Arm = function (x, y, num) {
        this.num = num;
        this.x = new Float32Array(num);
        this.y = new Float32Array(num);
        this.xb = new Float32Array(num);
        this.yb = new Float32Array(num);
        for (var i = 0; i < num; i++) {
            this.x[i] = this.xb[i] = x;
            this.y[i] = this.yb[i] = y;
        }
    };
    Arm.prototype.anim = function () {
        this.x[0] = pointer.x;
        this.y[0] = pointer.y;
        for (var i = 0; i < this.num - 1; i++) {
            var dx = this.x[i] - this.x[i + 1];
            var dy = this.y[i] - this.y[i + 1];
            var dist = dx * dx + dy * dy;
            dx *= 1 / (dist + 1) - 0.5;
            dy *= 1 / (dist + 1) - 0.5;
            this.x[i] += dx * 0.1;
            this.y[i] += dy * 0.1;
            this.x[i + 1] -= dx * 0.1;
            this.y[i + 1] -= dy * 0.1;
        };
        this.x[this.num - 1] = resolutionX - pointer.x;
        this.y[this.num - 1] = resolutionY - pointer.y;
        ctx.beginPath();
        for (var i = 1; i < this.num - 1; i++) {
            var tx = this.x[i];
            var ty = this.y[i];
            this.x[i] += this.x[i] - this.xb[i];
            this.y[i] += this.y[i] - this.yb[i];
            this.xb[i] = tx;
            this.yb[i] = ty;
            ctx.lineTo(tx, ty);
        }
        ctx.stroke();
    };
    var run = function () {
        requestAnimationFrame(run);
        ctx.clearRect(0, 0, resolutionX, resolutionY);
        for (var i = 0, len = arms.length; i < len; i++) {
            arms[i].anim();
        }
    };
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    document.body.appendChild(canvas);
    var resolutionX = canvas.width = canvas.offsetWidth;
    var resolutionY = canvas.height = canvas.offsetHeight;
    var pointer = {
        x: resolutionX / 1.8,
        y: resolutionY / 1.8,
        move: function (e) {
            var touchMode = e.targetTouches,
                pointer;
            if (touchMode) {
                e.preventDefault();
                pointer = touchMode[0];
            } else pointer = e;
            this.x = pointer.clientX * resolutionX / canvas.offsetWidth;
            this.y = pointer.clientY * resolutionY / canvas.offsetHeight;
        }
    };
    window.addEventListener('mousemove', pointer.move.bind(pointer), false);
    canvas.addEventListener('touchmove', pointer.move.bind(pointer), false);
    var arms = [];
    var r = 300;
    for (var i = 0; i < 360; i += 2) {
        arms.push(
            new Arm(
                1 + resolutionX * 0.5 + Math.cos(i * Math.PI / 180) * r,
                1 + resolutionY * 0.5 + Math.sin(i * Math.PI / 180) * r,
                100
            )
        );
    }
    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = "#654";
    run();
}(Math);