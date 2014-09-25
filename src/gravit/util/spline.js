var CubicSpline, MonotonicCubicSpline;
MonotonicCubicSpline = function() {
    function MonotonicCubicSpline(x, y) {
        var alpha, beta, delta, dist, i, m, n, tau, to_fix, _i, _j, _len, _len2, _ref, _ref2, _ref3, _ref4;
        n = x.length;
        delta = [];
        m = [];
        alpha = [];
        beta = [];
        dist = [];
        tau = [];
        for (i = 0, _ref = n - 1; (0 <= _ref ? i < _ref : i > _ref); (0 <= _ref ? i += 1 : i -= 1)) {
            delta[i] = (y[i + 1] - y[i]) / (x[i + 1] - x[i]);
            if (i > 0) {
                m[i] = (delta[i - 1] + delta[i]) / 2;
            }
        }
        m[0] = delta[0];
        m[n - 1] = delta[n - 2];
        to_fix = [];
        for (i = 0, _ref2 = n - 1; (0 <= _ref2 ? i < _ref2 : i > _ref2); (0 <= _ref2 ? i += 1 : i -= 1)) {
            if (delta[i] === 0) {
                to_fix.push(i);
            }
        }
        for (_i = 0, _len = to_fix.length; _i < _len; _i++) {
            i = to_fix[_i];
            m[i] = m[i + 1] = 0;
        }
        for (i = 0, _ref3 = n - 1; (0 <= _ref3 ? i < _ref3 : i > _ref3); (0 <= _ref3 ? i += 1 : i -= 1)) {
            alpha[i] = m[i] / delta[i];
            beta[i] = m[i + 1] / delta[i];
            dist[i] = Math.pow(alpha[i], 2) + Math.pow(beta[i], 2);
            tau[i] = 3 / Math.sqrt(dist[i]);
        }
        to_fix = [];
        for (i = 0, _ref4 = n - 1; (0 <= _ref4 ? i < _ref4 : i > _ref4); (0 <= _ref4 ? i += 1 : i -= 1)) {
            if (dist[i] > 9) {
                to_fix.push(i);
            }
        }
        for (_j = 0, _len2 = to_fix.length; _j < _len2; _j++) {
            i = to_fix[_j];
            m[i] = tau[i] * alpha[i] * delta[i];
            m[i + 1] = tau[i] * beta[i] * delta[i];
        }
        this.x = x.slice(0, n);
        this.y = y.slice(0, n);
        this.m = m;
    }
    MonotonicCubicSpline.prototype.interpolate = function(x) {
        var h, h00, h01, h10, h11, i, t, t2, t3, y, _ref;
        for (i = _ref = this.x.length - 2; (_ref <= 0 ? i <= 0 : i >= 0); (_ref <= 0 ? i += 1 : i -= 1)) {
            if (this.x[i] <= x) {
                break;
            }
        }
        h = this.x[i + 1] - this.x[i];
        t = (x - this.x[i]) / h;
        t2 = Math.pow(t, 2);
        t3 = Math.pow(t, 3);
        h00 = 2 * t3 - 3 * t2 + 1;
        h10 = t3 - 2 * t2 + t;
        h01 = -2 * t3 + 3 * t2;
        h11 = t3 - t2;
        y = h00 * this.y[i] + h10 * h * this.m[i] + h01 * this.y[i + 1] + h11 * h * this.m[i + 1];
        return y;
    };
    return MonotonicCubicSpline;
}();
CubicSpline = function() {
    function CubicSpline(x, a, d0, dn) {
        var b, c, clamped, d, h, i, k, l, n, s, u, y, z, _ref;
        if (!((x != null) && (a != null))) {
            return;
        }
        clamped = (d0 != null) && (dn != null);
        n = x.length - 1;
        h = [];
        y = [];
        l = [];
        u = [];
        z = [];
        c = [];
        b = [];
        d = [];
        k = [];
        s = [];
        for (i = 0; (0 <= n ? i < n : i > n); (0 <= n ? i += 1 : i -= 1)) {
            h[i] = x[i + 1] - x[i];
            k[i] = a[i + 1] - a[i];
            s[i] = k[i] / h[i];
        }
        if (clamped) {
            y[0] = 3 * (a[1] - a[0]) / h[0] - 3 * d0;
            y[n] = 3 * dn - 3 * (a[n] - a[n - 1]) / h[n - 1];
        }
        for (i = 1; (1 <= n ? i < n : i > n); (1 <= n ? i += 1 : i -= 1)) {
            y[i] = 3 / h[i] * (a[i + 1] - a[i]) - 3 / h[i - 1] * (a[i] - a[i - 1]);
        }
        if (clamped) {
            l[0] = 2 * h[0];
            u[0] = 0.5;
            z[0] = y[0] / l[0];
        } else {
            l[0] = 1;
            u[0] = 0;
            z[0] = 0;
        }
        for (i = 1; (1 <= n ? i < n : i > n); (1 <= n ? i += 1 : i -= 1)) {
            l[i] = 2 * (x[i + 1] - x[i - 1]) - h[i - 1] * u[i - 1];
            u[i] = h[i] / l[i];
            z[i] = (y[i] - h[i - 1] * z[i - 1]) / l[i];
        }
        if (clamped) {
            l[n] = h[n - 1] * (2 - u[n - 1]);
            z[n] = (y[n] - h[n - 1] * z[n - 1]) / l[n];
            c[n] = z[n];
        } else {
            l[n] = 1;
            z[n] = 0;
            c[n] = 0;
        }
        for (i = _ref = n - 1; (_ref <= 0 ? i <= 0 : i >= 0); (_ref <= 0 ? i += 1 : i -= 1)) {
            c[i] = z[i] - u[i] * c[i + 1];
            b[i] = (a[i + 1] - a[i]) / h[i] - h[i] * (c[i + 1] + 2 * c[i]) / 3;
            d[i] = (c[i + 1] - c[i]) / (3 * h[i]);
        }
        this.x = x.slice(0, n + 1);
        this.a = a.slice(0, n);
        this.b = b;
        this.c = c.slice(0, n);
        this.d = d;
    }
    CubicSpline.prototype.derivative = function() {
        var c, d, s, x, _i, _j, _len, _len2, _ref, _ref2, _ref3;
        s = new this.constructor();
        s.x = this.x.slice(0, this.x.length);
        s.a = this.b.slice(0, this.b.length);
        _ref = this.c;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            c = _ref[_i];
            s.b = 2 * c;
        }
        _ref2 = this.d;
        for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
            d = _ref2[_j];
            s.c = 3 * d;
        }
        for (x = 0, _ref3 = this.d.length; (0 <= _ref3 ? x < _ref3 : x > _ref3); (0 <= _ref3 ? x += 1 : x -= 1)) {
            s.d = 0;
        }
        return s;
    };
    CubicSpline.prototype.interpolate = function(x) {
        var deltaX, i, y, _ref;
        for (i = _ref = this.x.length - 1; (_ref <= 0 ? i <= 0 : i >= 0); (_ref <= 0 ? i += 1 : i -= 1)) {
            if (this.x[i] <= x) {
                break;
            }
        }
        deltaX = x - this.x[i];
        y = this.a[i] + this.b[i] * deltaX + this.c[i] * Math.pow(deltaX, 2) + this.d[i] * Math.pow(deltaX, 3);
        return y;
    };
    return CubicSpline;
}();