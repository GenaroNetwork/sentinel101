<template>
  <div id="app">
    <h1>Genaro Sharer 排行</h1>
    <Join />
    <Statistics />
    <Farmer />
  </div>
</template>

<script>
import Join from './components/Join.vue'
import Statistics from './components/Statistics.vue'
import Farmer from './components/Farmer.vue'

export default {
  name: 'app',
  components: {
    Join,
    Statistics,
    Farmer
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
