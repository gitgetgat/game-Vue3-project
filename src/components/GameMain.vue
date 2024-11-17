<script lang="ts" setup>
import { onMounted, ref, watchEffect } from 'vue'
import { useColorMode } from '@vueuse/core'
import { Button } from '@/components/ui/button'
import { Icon } from '@iconify/vue'
const mode = useColorMode()
const toggleState = ref(false)
watchEffect(() => {
  mode.value = toggleState.value ? 'light' : 'dark'
})
onMounted(() => {
  mode.value = 'dark'
})

</script>

<template>
  <div class="container mx-auto flex flex-col h-screen w-[40rem] max-w-screen-sm">
    <div class="flex justify-between items-center border mt-4 mb-4 h-fit w-full rounded-lg">
      <div class="flex-1">
        <div class="playerIcon"></div>
        <div class="playerName"></div>
        <div class="playerLevel"></div>
      </div>
      <div class="flex-1"></div>
      <div class="flex-1"></div>
      <div class="shrink-0">
        <Icon
          icon="solar:hamburger-menu-bold"
          class="!size-8"
        />
      </div>
    </div>
    <div class="flex mt-4 mb-4 h-fit w-full">
      <div class="flex-1 border rounded-lg mr-3"></div>
      <div class="flex-1 border rounded-lg"></div>
    </div>
  </div>
</template>