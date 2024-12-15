<template>
  <Dialog :open="gameMain.player.selectedStats.length>0">
    <DialogOverlay class="fixed inset-0 z-[60] bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
    <DialogContent
      class="md:w-[400px] mobile:w-full mobile:w-3/5 rounded-lg z-[120] p-4"
      @escapeKeyDown.prevent
      @openAutoFocus.prevent
    >
      <DialogHeader>
        <DialogTitle class="text-3xl text-center font-normal">升级了！</DialogTitle>
        <VisuallyHidden>
          <DialogDescription></DialogDescription>
        </VisuallyHidden>
      </DialogHeader>
      <div
        class="flex items-center flex-col"
        v-if="gameMain.player.selectedStats.length>0"
      >
        <div class="flex flex-row items-center justify-between w-full mb-2">
          <span class="inline-block">剩余：{{gameMain.player.selectedStats.length}}</span>
          <Button
            variant="outline"
            class="hover:bg-[hsl(var(--foreground))] hover:text-[hsl(var(--background))] hover:transition-all text-base border-white"
            @click="handleRellGenerateLvlStats"
          >
            重来 {{ rerolls }} / {{ gameMain.player.rerolls }}
          </Button>
        </div>
        <div class="flex items-center flex-col w-full space-y-4">
          <Button
            v-for="(lvlStats,idx) in gameMain.player.selectedStats[0]"
            :key="lvlStats"
            variant="outline"
            class="hover:bg-[hsl(var(--foreground))] hover:text-[hsl(var(--background))] hover:transition-all text-base border-white w-full flex flex-col h-fit space-y-0 gap-0"
            @click="chooseLvlStats(idx)"
          >
            <p class="text-xl block">{{lvlUpPercent[lvlStats].label}}提升</p>
            <p class="block">提高 {{lvlUpPercent[lvlStats].label}} 加成 {{lvlUpPercent[lvlStats].value}}%</p>
          </Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>

<script setup>
import {
  DialogOverlay,
} from 'radix-vue';
import {
  // components
  Dialog, DialogContent, DialogHeader, DialogTitle, VisuallyHidden, DialogDescription,
  // functions
  generateLvlStats, handleSelectedLvlStat
} from '../lib/import'
import { percentages } from '../config/player'
import { Button } from '@/components/ui/button'
import { inject, ref, onMounted } from 'vue'
const gameMain = inject('gameMain')
const lvlUpPercent = ref(percentages)
let rerolls = ref(2)
const props = defineProps({
  levelUpOpen: { type: Boolean, required: true },
});

const handleRellGenerateLvlStats = () => {
  if (rerolls.value > 0 && gameMain.value.player.selectedStats) {
    gameMain.value.player.selectedStats[0] = generateLvlStats()
    rerolls.value--
  }
}

const chooseLvlStats = (id) => {
  rerolls.value = gameMain.value.player.rerolls
  handleSelectedLvlStat(gameMain.value, id)
}

onMounted(() => {
  rerolls.value = gameMain.value.player.rerolls
})

</script>