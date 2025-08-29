<template>
  <div class="solver-page">
    <Solver />
  </div>
</template>

<script>
import Solver from '../components/Solver.vue'

export default {
  name: 'SolverPage',
  components: {
    Solver
  }
}
</script>

<style scoped>
.solver-page {
  width: 100%;
  min-height: 100vh;
}
</style>