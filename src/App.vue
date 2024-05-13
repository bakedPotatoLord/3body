<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Body } from './Body.ts'

import type { vec2 } from './Body.ts'

const canvas = ref<HTMLCanvasElement | null>(null)
const canvas2 = ref<HTMLCanvasElement | null>(null)

const cw = 400;
const ch = 400;

const numBodies = ref(10)

const G = ref(3)
const speedLimit = ref(5)
const bouncyEdge = ref(0.6)

const ballMass = ref(1)

const kineticEnergy = ref(0)

let bodies: Body[] = [];
let ctx: CanvasRenderingContext2D;
let ctx2: CanvasRenderingContext2D;

function init(ctx: CanvasRenderingContext2D[]) {
  bodies = Array(numBodies.value).fill(0).map((_,i)=>Body.randomWithin(0, cw, 0, ch,-0, 0.0, -0.0, 0.0,`hsl(${i/numBodies.value*360}, 100%, 50%)`));

  ctx.forEach((ctx) => ctx.clearRect(0,0,cw,ch))

}

onMounted(() => {
  if (canvas.value!= null && canvas2.value) {
    ctx = <CanvasRenderingContext2D>canvas.value.getContext('2d')
    ctx2 = <CanvasRenderingContext2D>canvas2.value.getContext('2d')
    canvas.value.width = cw;
    canvas.value.height = ch;

    canvas2.value.width = cw;
    canvas2.value.height = ch;

    if (ctx != null && ctx2 != null) {
      
      init([ctx, ctx2]);

      function draw(ctx: CanvasRenderingContext2D) {
        requestAnimationFrame(()=>{draw(ctx)});

        ctx.clearRect(0,0,cw,ch);

        for(let body of bodies) {
          body.setConstants(G.value, speedLimit.value, bouncyEdge.value)
          body.calcGravity(bodies)
          //body.applyEdgeless(cw,ch)
          body.applyBouncyEdge(cw,ch)

          body.applySpeedLimit()
        }
        for(let body of bodies) {
          body.updatePosition()
          body.draw(ctx)
        }
        kineticEnergy.value = calculateEnergy(bodies)
      }

      function plotMovement(ctx: CanvasRenderingContext2D) {
        requestAnimationFrame(()=>{plotMovement(ctx)});
        for(let body of bodies) {
          ctx.strokeStyle = body.color;
          ctx.beginPath();
          ctx.moveTo(body.x, body.y)
          const pos = <vec2>body.pos.at(-2);
          ctx.lineTo(pos[0], pos[1])  
          ctx.stroke(); 
        }
      }

      //initialize anim loops
      draw(ctx);
      plotMovement(ctx2)
    }
  }
})


function calculateEnergy(arr:Body[]) {
  return arr.reduce((acc, body) => acc + body.getEnergy(), 0)
}

</script>

<template>
  <div class="head">
    <h1>{{ numBodies }} Body Simulation</h1>
  </div>
  <div class="main">
    <div class="canvas">
      <canvas ref="canvas"></canvas>
    </div>
    <div class="controls">
      <h2>Controls</h2>
      <div class="control">
        <label for="numBodies">Number of Bodies</label>
        <input id="numBodies" type="number" v-model="numBodies">
      </div>
      <div class="control">
        <label for="Big G">Big G</label>
        <input id="Big G" type="number" v-model="G" min="0" max="1000">
      </div>
      <div class="control">
        <label for="Speed Limit">Speed Limit</label>
        <input id="Speed Limit" type="number" v-model="speedLimit" min="0" max="1000">
      </div>
      <div class="control">
        <label for="EdgeBounce">Edge Bounce Friction</label>
        <input id="EdgeBounce" type="number" v-model="bouncyEdge" min="0" max="1">
      </div>

      <div class="control">
        <label for="ballMass">ball Mass (kg)</label>
        <input id="ballMass" type="number" v-model="ballMass" min="0.0000001" max="5">
      </div>


      <button @click="init([ctx, ctx2])" >start</button>

      <div class="text">
        <p>assumes that one pixel is i mm </p>
        <p>Kinetic Energy: {{ kineticEnergy.toPrecision(8) }}</p>
      </div>
    </div>
    <div class="canvas">
      <canvas ref="canvas2"></canvas>
    </div>
  </div>
</template>

<style scoped lang="scss">
  body{
    background-color: #000;
  }
  .head {
    display: flex;
    justify-content: center;
    h1 {
      color: #000;
    }
  }
  .main {
    display: flex;
    flex-direction: row;
    .canvas {
      padding: 3rem;
      canvas{
        border: 2px dashed black;
      }
    }
    .controls {
      padding: 3rem;
      display: flex;
      flex-direction: column;

      .control{
        display: flex;
        flex-direction: column;
        margin-top:0.5rem;
        margin-bottom: 0.5rem;
      }

      button{
        margin-top:0.5rem;
        margin-bottom: 0.5rem;
      }
    }
  }
</style>
