
export type vec2 = [number, number]

export class Body {
  public x: number
  public y: number
  private vx: number
  private vy: number
  private r: number
  public color: string
  private mass:number;

  private G = 0;
  private speedLimit = 0;
  private bounce = 0;

  public pos: vec2[] = [];

  constructor(x: number, y: number, vx: number, vy: number, r: number, color: string, mass:number) {
    this.x = x
    this.y = y
    this.vx = vx
    this.vy = vy
    this.r = r
    this.color = color
    this.mass = mass
  }

  public static randomWithin(xmin: number, xmax: number, ymin: number, ymax: number, xvMin: number, xvMax: number, yvMin: number, yvMax: number, color: string,mass =1) {
    const x = Math.random() * (xmax - xmin) + xmin
    const y = Math.random() * (ymax - ymin) + ymin
    const vx = Math.random() * (xvMax - xvMin) + xvMin
    const vy = Math.random() * (yvMax - yvMin) + yvMin
    return new Body(x, y, vx, vy, 5, color,mass)
  }

  setPosition(x: number, y: number) {
    this.x = x
    this.y = y
  }

  setVelocity(vx: number, vy: number) {
    this.vx = vx
    this.vy = vy
  }

  setConstants(G: number, speedLimit: number, bounce: number) {
    this.G = G
    this.speedLimit = speedLimit
    this.bounce = bounce
  }

  applyForce(fx: number, fy: number) {
    this.vx += fx
    this.vy += fy
  }

  getDistance(body: Body) {
    return Math.hypot(this.x - body.x, this.y - body.y);
  }

  getForce(body: Body) {

    const r = this.getDistance(body)
    if (r < 2 * this.r) return { fx: 0, fy: 0 };
    const F = -this.G* (this.mass * body.mass) / (r * r)  
    const theta = Math.atan2(this.y - body.y, this.x - body.x)
    const fx = F * Math.cos(theta)
    const fy = F * Math.sin(theta)
    return { fx, fy }

    // const dx = this.x - body.x;
    // const dy = this.y - body.y;

    // const fx = -this.G * dx / (Math.hypot(dx,dy)**3)
    // const fy = -this.G * dy / (Math.hypot(dx,dy)**3)

    // return {fx,fy}
  }

  calcGravity(bodies: Body[]) {
    for (const body of bodies) {
      if (this === body) continue
      const { fx, fy } = this.getForce(body)
      this.applyForce(fx, fy)
    }
  }
  
  updatePosition(){
    this.setPosition(this.x + this.vx, this.y + this.vy)
    this.pos.push([this.x, this.y])
  }

  draw(ctx: CanvasRenderingContext2D) {

    ctx.filter = 'blur(2px)';
    //draw as more transparent for edges
    ctx.fillStyle = this.color
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI)
    ctx.fill()
  }

  applyEdgeless(cw: number, ch: number) {
    if (this.x < 0) {
      this.x = cw;
    } else if (this.x > cw) {
      this.x = 0;
    }
    if (this.y < 0) {
      this.y = ch;
    } else if (this.y > ch) {
      this.y = 0;
    }
  }

  applyBouncyEdge(cw: number, ch: number) {
    if (this.x < 0) {
      this.vx = -this.vx * this.bounce
      this.x = 0
    } else if (this.x > cw) {
      this.vx = -this.vx * this.bounce
      this.x = cw
    }
    if (this.y < 0) {
      this.vy = -this.vy * this.bounce
      this.y = 0
    } else if (this.y > ch) {
      this.vy = -this.vy * this.bounce
      this.y = ch
    }
  }

  applySpeedLimit() {
    const v = Math.hypot(this.vx, this.vy)
    if (v > this.speedLimit) {
      this.vx = this.vx / v * this.speedLimit
      this.vy = this.vy / v * this.speedLimit
    }
  }

  isTouching(body: Body) {
    return Math.hypot(this.x - body.x, this.y - body.y) < this.r + body.r
  }

  applyElasticCollision(body: Body) {

  }

  magnitude(V: vec2): number {
    return Math.hypot(V[0], V[1]);
  }

  parallelComponent(V: vec2, DP: vec2): vec2 {
    const dpMagnitude = this.magnitude(DP); 
    const dpNormalized: vec2 = [DP[0] / dpMagnitude, DP[1] / dpMagnitude]; //ratio of x to y
    const dot = this.dotProduct(V, dpNormalized);
    return [dpNormalized[0] * dot, dpNormalized[1] * dot];
  }

  perpendicularComponent(V: vec2, DP: vec2): vec2 {
    const parallel = this.parallelComponent(V, DP);
    return [V[0] - parallel[0], V[1] - parallel[1]];
  }

  dotProduct(v1:vec2,v2:vec2){
    return v1[0]*v2[0]+v1[1]*v2[1]
  }

  getEnergy() {
    const vp = Math.hypot(this.vx, this.vy) // pixels
    const v = vp / 1000 // m/s
    return 0.5 * this.mass * v * v
  }
}