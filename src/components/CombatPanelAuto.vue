<template>
  <AlertDialog :open="combatOpen">
    <AlertDialogOverlay class="fixed inset-0 z-[50] bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
    <AlertDialogContent
      class="md:w-[400px] mobile:w-full z-[50] rounded-lg"
      @escapeKeyDown.prevent
      @openAutoFocus.prevent
    >
      <VisuallyHidden>
        <AlertDialogHeader>
          <AlertDialogTitle></AlertDialogTitle>
          <AlertDialogDescription>
          </AlertDialogDescription>
        </AlertDialogHeader>
      </VisuallyHidden>
      <div>
        <div class="text-center mb-1.5 text-base">{{currEnemy.name}} 等级 {{ currEnemy.lvl }}</div>
        <div class="relative h-4 bg-slate-400 rounded-md mx-2 mb-2">
          <div
            class="absolute z-[0] h-full bg-red-600 rounded-md transition-all"
            :style="`width: ${currEnemy.stats.hpPercent}%;`"
          ></div>
          <span class="absolute text-xs z-1 left-1">{{currEnemy.stats.hp}}/{{ currEnemy.stats.hpMax }}（{{ currEnemy.stats.hpPercent }}%）</span>
        </div>
        <img
          :src="getImageUrl(`${currEnemy.image.name}${currEnemy.image.type}`)"
          alt="Photo by Drew Beamer"
          class="rounded-md object-cover mx-auto h-40 mb-4 block"
        >
        <div class="border rounded-md p-2 mb-2">
          <p class="mb-1">{{ gameMain.player.name }} 等级 {{ gameMain.player.lvl }}（{{gameMain.player.exp.expPercent}}%）</p>
          <div class="relative h-4 bg-slate-400 rounded-md mb-1">
            <div
              class="absolute z-[0] h-full bg-red-600 rounded-md transition-all"
              :style="`width: ${gameMain.player.stats.hpPercent}%;`"
            ></div>
            <span class="absolute text-xs z-1 left-1">{{gameMain.player.stats.hp}}/{{ gameMain.player.stats.hpMax }}（{{ gameMain.player.stats.hpPercent }}%）</span>
          </div>
          <div class="relative h-1 bg-slate-400 rounded-md mb-2">
            <div
              class="absolute z-[0] h-full bg-purple-600 rounded-md"
              :style="`width: ${gameMain.player.exp.expPercent}%;`"
            ></div>
          </div>
        </div>
      </div>
    </AlertDialogContent>
  </AlertDialog>
</template>

<script setup>
import { inject, ref, computed } from 'vue'
import {
  AlertDialogOverlay,
} from 'radix-vue';
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogFooter, AlertDialogDescription
} from '@/components/ui/alert-dialog'
import { VisuallyHidden, ScrollArea } from '../lib/import'
import { Button } from '@/components/ui/button'

const gameMain = inject('gameMain')

const isHovered = ref(false)

const props = defineProps({
  combatOpen: { type: Boolean, required: true },
  currEnemy: { type: [Object, null], required: true },
  getRarityLabel: { type: Function, required: true },
  getRarityColor: { type: Function, required: true },
  dealFloatFixed: { type: Function, required: true },
});

const getImageUrl = (path) => {
  const url = `/public/${path}`
  const baseUrl = new URL(import.meta.env.BASE_URL, import.meta.url).href
  return baseUrl + url
}
</script>