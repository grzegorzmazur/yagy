/*
 * Plot3D - simple 3d plotting
 *
 * Copyright (c) 2014 Grzegorz Mazur, Marta Noga
 *
 * Licensed under the MIT license:
 *   http://www.opensource.org/licenses/mit-license.php
 */

function Plot3D(series, w, h) {
    var self = this;
    
    var data = [];
    
    for (var s = 0; s < series.length; ++s)
        data.push(series[s]["data"]);

    self.xmin = data[0][0][0];
    self.xmax = data[0][0][0];

    self.ymin = data[0][0][1];
    self.ymax = data[0][0][1];

    self.zmin = data[0][0][2];
    self.zmax = data[0][0][2];

    for (var s = 0; s < series.length; ++s) {
        for (var i = 1; i < data[s].length; ++i) {
            if (data[s][i][0] < self.xmin)
                self.xmin = data[s][i][0];
            if (data[s][i][0] > self.xmax)
                self.xmax = data[s][i][0];
            if (data[s][i][1] < self.ymin)
                self.ymin = data[s][i][1];
            if (data[s][i][1] > self.ymax)
                self.ymax = data[s][i][1];
            if (data[s][i][2] < self.zmin)
                self.zmin = data[s][i][2];
            if (data[s][i][2] > self.zmax)
                self.zmax = data[s][i][2];
        }
    }

    if (self.zmin == self.zmax) {
        self.zmin -= 1;
        self.zmax += 1;
    }

    self.size = 500;

    self.xscale = self.size / (self.xmax - self.xmin);
    self.yscale = self.size / (self.ymax - self.ymin);
    self.zscale = self.size / (self.zmax - self.zmin);

    self.xoffset = -self.size / 2;
    self.yoffset = -self.size / 2;
    self.zoffset = -self.size / 2;

    self.scene = new THREE.Scene();

    self.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 2000);
    self.camera.position.z = 1000;

    for (var s = 0; s < series.length; ++s) {
        var geometry = new THREE.Geometry();

        for (var i = 0; i < data[s].length - 2; ++i) {
            var p0 = data[s][i];
            var p1 = data[s][i + 1];

            if (p0[0] !== p1[0])
                continue;

            var p2 = null;
            var p3 = null;

            for (var j = i + 2; j < data[s].length; ++j) {
                if (p2 === null && data[s][j][1] == p0[1])
                    p2 = data[s][j];

                if (p3 === null && data[s][j][1] == p1[1])
                    p3 = data[s][j];

                if (p2 !== null && p3 !== null)
                    break;
            }

            if (p2 === null)
                continue;

            geometry.vertices.push(self.g2w(p0[0], p0[1], p0[2]));
            geometry.vertices.push(self.g2w(p1[0], p1[1], p1[2]));
            geometry.vertices.push(self.g2w(p2[0], p2[1], p2[2]));

            geometry.faces.push(new THREE.Face3(geometry.vertices.length - 3, geometry.vertices.length - 2, geometry.vertices.length - 1));

            if (p3 === null)
                continue;

            geometry.vertices.push(self.g2w(p3[0], p3[1], p3[2]));

            geometry.faces.push(new THREE.Face3(geometry.vertices.length - 1, geometry.vertices.length - 2, geometry.vertices.length - 3));
        }

        var material = new THREE.MeshBasicMaterial({
            color: 0xff0000,
            wireframe: true,
            side: THREE.DoubleSide
        });
        var mesh = new THREE.Mesh(geometry, material);

        self.scene.add(mesh);
    }
    
    material = new THREE.LineBasicMaterial({color: 0x000000});
    geometry = new THREE.Geometry();

    geometry.vertices.push(new THREE.Vector3(-self.size / 2, -self.size / 2, -self.size / 2));
    geometry.vertices.push(new THREE.Vector3(self.size / 2, -self.size / 2, -self.size / 2));

    var line = new THREE.Line(geometry, material);

    self.scene.add(line);

    geometry = new THREE.Geometry();

    geometry.vertices.push(new THREE.Vector3(-self.size / 2, -self.size / 2, -self.size / 2));
    geometry.vertices.push(new THREE.Vector3(-self.size / 2, self.size / 2, -self.size / 2));

    line = new THREE.Line(geometry, material);

    self.scene.add(line);

    geometry = new THREE.Geometry();

    geometry.vertices.push(new THREE.Vector3(-self.size / 2, -self.size / 2, -self.size / 2));
    geometry.vertices.push(new THREE.Vector3(-self.size / 2, -self.size / 2, self.size / 2));

    var line = new THREE.Line(geometry, material);

    self.scene.add(line);

    var x_params = self.axis_params(self.xmin, self.xmax);

    for (var t = x_params.b; t <= x_params.e; t += x_params.d) {
        var tb = self.g2w(t, self.ymin, self.zmin);
        tb.y = -self.size / 2;
        tb.z = -self.size / 2;
        var te = tb.clone();
        te.y += self.size / 50;
        geometry = new THREE.Geometry();
        geometry.vertices.push(tb);
        geometry.vertices.push(te);
        te = tb.clone();
        te.z += self.size / 50;
        geometry.vertices.push(tb);
        geometry.vertices.push(te);
        var line = new THREE.Line(geometry, material);
        self.scene.add(line);

        var tn = new Number(t);
        var l = self.label(tn.toFixed(2));
        l.position.set(tb.x, -self.size / 2, -self.size / 2);
        self.scene.add(l);
    }

    var y_params = self.axis_params(self.ymin, self.ymax);

    for (var t = y_params.b; t <= y_params.e; t += y_params.d) {
        var tb = self.g2w(self.xmin, t, self.zmin);
        tb.x = -self.size / 2;
        tb.z = -self.size / 2;
        var te = tb.clone();
        te.x += self.size / 50;
        geometry = new THREE.Geometry();
        geometry.vertices.push(tb);
        geometry.vertices.push(te);
        te = tb.clone();
        te.z += self.size / 50;
        geometry.vertices.push(tb);
        geometry.vertices.push(te);
        var line = new THREE.Line(geometry, material);
        self.scene.add(line);

        if (t != y_params.b) {
            var tn = new Number(t);
            var l = self.label(tn.toFixed(2));
            l.position.set(-self.size / 2, tb.y, -self.size / 2);
            self.scene.add(l);
        }
    }

    var z_params = self.axis_params(self.zmin, self.zmax);

    for (var t = z_params.b; t <= z_params.e; t += z_params.d) {
        var tb = self.g2w(self.xmin, self.ymin, t);
        tb.x = -self.size / 2;
        tb.y = -self.size / 2;
        var te = tb.clone();
        te.x += self.size / 50;
        geometry = new THREE.Geometry();
        geometry.vertices.push(tb);
        geometry.vertices.push(te);
        te = tb.clone();
        te.y += self.size / 50;
        geometry.vertices.push(tb);
        geometry.vertices.push(te);
        var line = new THREE.Line(geometry, material);
        self.scene.add(line);

        var tn = new Number(t);
        var l = self.label(tn.toFixed(2));
        l.position.set(-self.size / 2, -self.size / 2, tb.z + 40);
        self.scene.add(l);
    }

    self.renderer = new THREE.WebGLRenderer();
    self.renderer.setClearColor(0xffffff, 1);
    self.renderer.setSize(w, h);
}

Plot3D.prototype.g2w = function (x, y, z) {
    return new THREE.Vector3((x - this.xmin) * this.xscale + this.xoffset,  (y - this.ymin) * this.yscale + this.yoffset, (z - this.zmin) * this.zscale + this.zoffset);
}


Plot3D.prototype.axis_params = function (min, max) {
    var delta = max - min;

    var scale = Math.pow(10, Math.floor((Math.round(Math.log(delta) / Math.LN10 * 1e6) / 1e6) - 1));
    var b = Math.ceil(min / scale) * scale;
    var e = Math.floor(max / scale) * scale;
    var d = Math.floor((e - b) / (10 * scale)) * scale;

    return { b: b, e: e, d: d };
}

Plot3D.prototype.label = function (text) {
    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');
    var font_size = 256;
    context.font = "normal " + font_size + "px Arial";

    var text_width = context.measureText(text).width;
    var text_height = 200;

    canvas.width = text_width;

    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillStyle = "#000000";
    context.fillText(text, text_width / 2, text_height / 2);

    var texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;

    var material = new THREE.SpriteMaterial({
        map: texture,
        useScreenCoordinates: false,
        transparent: true
    });

    var sprite = new THREE.Sprite(material);
    sprite.scale.set(text_width / text_height * font_size, font_size, 1);

    return sprite;
}