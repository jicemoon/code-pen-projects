class DeJongAttractor {
    constructor(size, density, sensitivity, iterations) {
        this.mouseX = 0;
        this.mouseY = 0;
        this.size = size || 800;
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.canvas.height = this.size;
        this.canvas.style.width = this.canvas.style.height = this.size + 'px';
        this.canvas.style.marginTop = this.canvas.style.marginLeft = '-' + this.size / 2 + 'px';
        document.body.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');
        this.steps = 0;
        this.stopped = false;
        this.limit = 800;
        this.initDensity = density || 12;
        this.sensitivity = sensitivity || 0.02;
        this.iterations = iterations || 8000;
        this.reseed();
        this.animate();
        var button = document.getElementById('export');
        document.addEventListener('mousedown', (event) => this.pause(event), false);
        document.addEventListener('mousemove', (event) => this.record(event), false);
        document.addEventListener('mouseup', (event) => this.resume(event), false);
        button.addEventListener('click', (event) => this.exportImage(event), false);
    }
    reseed() {
        this.clear();
        this.seed();
        this.plot(1);
    }
    animate() {
        this.interval = requestAnimationFrame(() => this.animate());
        this.tick();
    }
    stopLoop() {
        clearInterval(this.interval);
    }
    tick() {
        if (this.stopped) {
            this.reseed();
        }
        this.steps += 1;
        this.plot(5);
        if (this.steps > this.limit) {
            this.stopLoop();
        }
    }
    pause(event) {
        event.preventDefault();
        if (event.target.tagName.toLowerCase() == 'canvas') {
            this.stopped = true;
            if (!this.interval) {
                this.loop();
            }
        }
    }
    record(event) {
        if (this.stopped) {
            this.mouseX = event.pageX - this.canvas.offsetLeft;
            this.mouseY = event.pageY - this.canvas.offsetTop;
        }
    }
    resume(event) {
        this.stopped = false;
        this.steps = 0;
    }
    clear() {
        this.image = this.ctx.createImageData(this.size, this.size);
        let x, y;
        // create and populate a two dimensional array
        this.density = (function (size) {
            let i, results;
            results = new Array();
            for (x = 0; x < size; x++) {
                results.push((function () {
                    let j, results1;
                    results1 = new Array();
                    for (y = 0; y < size; y++) {
                        results1.push(0);
                    }
                    return results1;
                })());
            }
            return results;
        })(this.size);
        this.maxDensity = 0;
    }
    seed() {
        this.xSeed = (this.mouseX * 2 / this.size - 1) * this.sensitivity;
        this.ySeed = (this.mouseY * 2 / this.size - 1) * this.sensitivity;
        this.x = this.size / 2;
        this.y = this.size / 2;
    }
    populate(samples) {
        var x, y, row;
        var iterations = this.iterations;
        for (let i = 0, len = samples * iterations; i < len; i++) {
            x = ((Math.sin(this.xSeed * this.y) - Math.cos(this.ySeed * this.x)) * this.size * 0.2) + this.size / 2;
            y = ((Math.sin(-this.xSeed * this.x) - Math.cos(-this.ySeed * this.y)) * this.size * 0.2) + this.size / 2;
            this.density[Math.round(x)][Math.round(y)] += this.initDensity;
            this.x = x;
            this.y = y;
        }
        this.maxDensity = Math.log(Math.max.apply(Math, (() => {
            var row, results = new Array();
            for (let i = 0, len = this.density.length; i < len; i++) {
                row = this.density[i];
                results.push(Math.max.apply(Math, row));
            }
            return results;
        }).call(this)));
    }
    plot(samples) {
        this.populate(samples);
        var data = this.image.data;
        let hexToRgb = (hex) => {
            const red = (parseInt(hex) >> 16) & 0xff;
            const green = (parseInt(hex) >> 8) & 0xff;
            const blue = (parseInt(hex)) & 0xff;
            return {
                r: red,
                g: green,
                b: blue
            }
        }
        for (let x = 0; x < this.size; x++) {
            for (let y = 0; y < this.size; y++) {
                let idx = (x * this.size + y) * 4;
                let dens = this.density[x][y];
                data[idx + 3] = 255;
                if (dens <= 0) continue;
                let light = Math.log(dens) / this.maxDensity * 255;
                let current = data[idx];
                let red = Math.min(255, hexToRgb(current).r + 255 / light);
                let green = Math.min(255, hexToRgb(current).g + 255 / light);
                let blue = Math.min(255, hexToRgb(current).b + 255 / light);
                let rgb = (red << 16 & 0xff) | (green << 8 & 0xff) | (blue & 0xff);
                let color = this.illuminate(light, rgb);
                data[idx] = red / color;
                data[idx + 1] = color / green;
                data[idx + 2] = color;
            }
        }
        this.ctx.putImageData(this.image, 0, 0);
    }
    illuminate(a, b) {
        return ((a * b) >> 7) + ((a * a) >> 8) - ((a * a * b) >> 15);
    }
    exportImage(event) {
        event.stopPropagation();
        this.ctx.fillStyle = "#333333";
        this.ctx.font = 'bold 16px Helvetica, Arial, sans-serif';
        this.ctx.textBaseline = "top";
        var textSize = this.ctx.measureText("esimov.com");
        //this.ctx.fillText("esimov.com", this.size - textSize.width - 10, 5);
        //retrieve canvas image as data URL:		
        var dataURL = this.canvas.toDataURL("image/png");
        //open a new window of appropriate size to hold the image:
        var imageWindow = window.open("", "DeJongAttractor", "left=0,top=0,width=" + this.size + ",height=" + this.size + ",toolbar=0,resizable=0");
        //write some html into the new window, creating an empty image:
        imageWindow.document.write("<title>DeJong Attractor</title>");
        imageWindow.document.write("<img id='exportImage'" +
            " alt=''" +
            " height='" + this.size + "'" +
            " width='" + this.size + "'" +
            " style='position:absolute;left:0;top:0'/>");
        imageWindow.document.close();
        //copy the image into the empty img in the newly opened window:
        var exportImage = imageWindow.document.getElementById("exportImage");
        exportImage.src = dataURL;
    }
}
(() => new DeJongAttractor(800))(window);