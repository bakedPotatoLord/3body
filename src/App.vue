<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Body } from './Body.ts'

const canvas = ref<HTMLCanvasElement | null>(null)

const cw = 400;
const ch = 400;

const numBodies = ref(30)

const G = ref(10)
const speedLimit = ref(10)
const bouncyEdge = ref(0.6)

let bodies: Body[];

function init() {
  bodies = Array(numBodies.value).fill(0).map(()=>Body.randomWithin(0, cw, 0, ch,-0, 0.0, -0.0, 0.0));
}

onMounted(() => {
  if (canvas.value) {
    const ctx = canvas.value.getContext('2d')
    canvas.value.width = cw;
    canvas.value.height = ch;

    if (ctx != null) {
      
      init();

      function draw(ctx: CanvasRenderingContext2D) {
        requestAnimationFrame(()=>{draw(ctx)});

        ctx?.clearRect(0,0,cw,ch);

        for(let body of bodies) {
          body.setConstants(G.value, speedLimit.value, bouncyEdge.value)
          body.update(bodies)
          //body.applyEdgeless(cw,ch)
          body.applyBouncyEdge(cw,ch)

          body.applySpeedLimit()
          //@ts-ignore
          body.draw(ctx)
        }
      }

      draw(ctx);

    }
  }
})

</script>

<template>
  <div class="head">
    <h1>3 Body</h1>
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

      <button @click="init()">start</button>
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
