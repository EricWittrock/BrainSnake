export function generateID(): number {
    return Math.random()*1e12 | 0;
}

export interface PointLike {
    pos: Vec2;    
}

export class Vec2 {
    public x: number;
    public y: number;

    constructor(x: number = 0, y: number = 0) {
        this.x = x;
        this.y = y;
    }

    public copy(): Vec2 {
        return new Vec2(this.x, this.y);
    }

    public add(v: Vec2): Vec2 {
        return new Vec2(this.x + v.x, this.y + v.y);
    }

    public sub(v: Vec2): Vec2 {
        return new Vec2(this.x - v.x, this.y - v.y);
    }

    public dot(v: Vec2): number {
        return this.x*v.x + this.y*v.y;
    }

    public cross(v: Vec2): number {
        return this.x*v.y - this.y*v.x;
    }

    public rotate(radians: number): Vec2 { // rotate counter-clockwise about origin
        const cos = Math.cos(radians);
        const sin = Math.sin(radians);
        return new Vec2(this.x*cos - this.y*sin, this.x*sin+this.y*cos);
    }

    // a vector is spinning counter-clockwise about the origin, return the velocity
    public spinningVectorTipVelocity(angular_vel:number, current_rotation:number): Vec2 {
        const cos = Math.cos(current_rotation);
        const sin = Math.sin(current_rotation);
        return new Vec2(-this.x*sin - this.y*cos, this.x*cos-this.y*sin).scale(angular_vel);
    }

    public reflect(mirrorAxis: Vec2): Vec2 {
        const n = mirrorAxis.normalize();
        const d = this.dot(n);
        return this.sub(n.scale(2*d));
    }

    public length(): number {
        return Math.sqrt(this.x*this.x + this.y*this.y);
    }

    public lengthSquared(): number {
        return this.x*this.x + this.y*this.y;
    }

    public normalize(): Vec2 {
        const l = this.length();
        return new Vec2(this.x/l, this.y/l);
    }

    public perpendicular(): Vec2 { // counter-clockwise 90 degree rotation
        return new Vec2(this.y, -this.x);
    }

    public scale(s: number): Vec2 {
        return new Vec2(this.x*s, this.y*s);
    }

    public static scale(v: Vec2, s: number): void {
        v.x *= s;
        v.y *= s;
    }

    public static add(v1: Vec2, v2: Vec2): void {
        v1.x += v2.x;
        v1.y += v2.y;
    }

    public static sumAll(vectors: Vec2[]): Vec2 {
        let sum = new Vec2();
        for(let v of vectors) {
            sum.x += v.x;
            sum.y += v.y;
        }
        return sum;
    }

    public distSqTo(v: Vec2): number {
        return Math.pow(this.x - v.x, 2) + Math.pow(this.y - v.y, 2);
    }

    public distTo(v: Vec2): number {
        return Math.sqrt(Math.pow(this.x - v.x, 2) + Math.pow(this.y - v.y, 2));
    }

    public setPosFrom(v: Vec2) {
        this.x = v.x;
        this.y = v.y;
    }

    public static randVec(): Vec2 {
        return new Vec2(Math.random()*2-1, Math.random()*2-1);
    }

    public static fromRotation(radians: number): Vec2 {
        return new Vec2(Math.cos(radians), Math.sin(radians));
    }
}

export class LineSegment {
    public p1: Vec2;
    public p2: Vec2;
    constructor(p1:Vec2, p2:Vec2) {
        this.p1 = p1;
        this.p2 = p2;
    }

    public intersection(l: LineSegment): Vec2|null {
        const p = this.p1;
        const r = this.p2.sub(this.p1);
        const q = l.p1;
        const s = l.p2.sub(l.p1);
        const rxs = r.cross(s);
        const q_p = q.sub(p);
        const t = q_p.cross(s) / rxs;
        const u = q_p.cross(r) / rxs;
        if(rxs === 0) {
            if(q_p.cross(r) === 0) {
                return null; // collinear
            }else{
                return null; // parallel
            }
        }else if(t >= 0 && t <= 1 && u >= 0 && u <= 1) {
            return p.add(r.scale(t));
        }else{
            return null;
        }
    }

    public rotate(radians: number): LineSegment {
        return new LineSegment(this.p1.rotate(radians), this.p2.rotate(radians));
    }

    public translate(v: Vec2): LineSegment {
        return new LineSegment(this.p1.add(v), this.p2.add(v));
    }
}

export class Polynomial {
    public coefficients: number[];

    constructor(coefficients: number[]) {
        if(coefficients.length === 0) throw new Error("Polynomial must have at least one coefficient");
        this.coefficients = coefficients;
    }

    public evaluate(x: number): number {
        let sum = 0;
        let power = 1;
        for (let i = 0; i < this.coefficients.length; i++) {
            sum += this.coefficients[i]*power;
            power *= x;
        }
        return sum;
    }
}

export class GradientMap {
    private colors: number[][];

    constructor(colors: number[][]) {
        if(colors.length < 1) throw new Error("GradientMap must have at least one color");
        for(let i = 0; i < colors.length; i++) {
            if(colors[i].length !== 2) throw new Error("Each color must have 2 components: A color hex value and a position");
        }
        this.colors = colors.sort((a, b) => a[1] - b[1]);
    }

    public getColorAt(x: number): number {
        if(x >= 1) return this.colors[this.colors.length-1][0];
        if(x <= 0) return this.colors[0][0];
        if(this.colors.length === 1) return this.colors[0][0];

        let i = 0;
        for(; i < this.colors.length-1; i++) {
            if(this.colors[i+1][1] > x) break;
        }

        let c1 = this.colors[i][0];
        let c2 = this.colors[i+1][0];

        let t = (x - this.colors[i][1]) / (this.colors[i+1][1] - this.colors[i][1]);
        return GradientMap.lerpColor(c1, c2, t);
    }

    public static lerpColor(c1: number, c2: number, t: number): number {
        let ar = c1 >> 16, ag = c1 >> 8 & 0xff, ab = c1 & 0xff;
        let br = c2 >> 16, bg = c2 >> 8 & 0xff, bb = c2 & 0xff;
        let rr = ar + t * (br - ar);
        let rg = ag + t * (bg - ag);
        let rb = ab + t * (bb - ab);
        return (rr << 16) + (rg << 8) + rb | 0;
    }
}