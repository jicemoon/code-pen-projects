! function (Math) {
    var Arm = function (x, y, num, len) {

        this.length = len;
        this.num = num;
        this.x = new Float32Array(num);
        this.y = new Float32Array(num);
        this.sx = ((resolutionX / 2) - x) / 600;
        this.sy = ((resolutionY / 2) - y) / 600;

        for (var i = 0; i < num; i++) {
            this.x[i] = x;
            this.y[i] = y;
            y += len;
        }

    };

    Arm.prototype.ik = function (p0, p1) {

        var xDis = this.x[p0] - this.x[p1];
        var yDis = this.y[p0] - this.y[p1];
        var dist = Math.sqrt(xDis * xDis + yDis * yDis);
        this.x[p0] = this.x[p1] + xDis / dist * this.length;
        this.y[p0] = this.y[p1] + yDis / dist * this.length;

    };

    Arm.prototype.anim = function () {

        var i = this.num - 1;
        this.x[i] += (pointer.x - this.x[i]) * 0.5;
        this.y[i] += (pointer.y - this.y[i]) * 0.5;

        while (--i) this.ik(i, i + 1);
        i = 0;
        while (++i < this.num) {
            this.ik(i, i - 1);
            this.x[i] -= this.sx;
            this.y[i] += this.sy;
        }

        ctx.beginPath();
        i = 0;
        while (++i < this.num) ctx.lineTo(this.x[i], this.y[i]);
        ctx.strokeStyle = "#654";
        ctx.stroke();

    };

    var run = function () {

        requestAnimationFrame(run);
        ctx.clearRect(0, 0, resolutionX, resolutionY);
        ctx.globalCompositeOperation = 'lighter';
        for (var i = 0, len = arms.length; i < len; i++) {
            arms[i].anim();
        }

    };

    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    document.body.appendChild(canvas);
    var resolutionX = canvas.width = canvas.offsetWidth / 1;
    var resolutionY = canvas.height = canvas.offsetHeight / 1;

    var pointer = {
        x: resolutionX / 2,
        y: resolutionY / 2,
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
    var r = Math.min(resolutionX, resolutionY) / 2.5;
    for (var i = 0; i < 360; i += 1) {
        arms.push(
            new Arm(
                1 + resolutionX * 0.5 + Math.cos(i * Math.PI / 180) * r,
                1 + resolutionY * 0.5 + Math.sin(i * Math.PI / 180) * r,
                50,
                r / 20
            )
        );
    }

    run();

}(Math);