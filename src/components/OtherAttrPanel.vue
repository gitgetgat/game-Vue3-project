<template>
  <div class="flex items-center justify-between mb-2 h-fit w-full">
    <div class="py-2">{{dungeonTime}}</div>
    <div class="py-2"><span style="color:#fde047">祝福Lv.{{ gameMain.player.blessing }}</span> / <span style="color:#e30b5c">诅咒Lv.{{ Math.round((gameMain.map.settings.enemyScaling - 1) * 10) }}</span></div>
    <div class="py-2 flex items-center">层数 {{ gameMain.map.progress.floor }}<Popover>
        <PopoverTrigger as-child>
          <Button
            variant="ghost"
            class="hover:bg-[hsl(var(--foreground))] hover:text-[hsl(var(--background))] hover:transition-all text-base leading-none h-6 py-0 px-1 ml-1.5 rounded-lg"
          >
            <Icon
              icon="solar:settings-bold"
              class="!size-4 border-none inline-block"
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          class="w-80 z-[200]"
          @openAutoFocus.prevent
          @closeAutoFocus.prevent
        >
          <div class="flex justify-between">
            <div class="space-y-2">
              <h4 class="font-medium leading-none">
                设置探索的最高层数
              </h4>
              <p class="text-sm text-muted-foreground">
                仅在自动进程下有效
              </p>
            </div>
            <NumberField
              v-model="gameMain.auto.floorLimit"
              :min="5"
              :max="100"
            >
              <NumberFieldContent>
                <NumberFieldDecrement />
                <NumberFieldInput class="w-24" />
                <NumberFieldIncrement />
              </NumberFieldContent>
            </NumberField>
          </div>
        </PopoverContent>
      </Popover>
    </div>
    <div class="py-2">房间 {{ gameMain.map.progress.room }}</div>
    <div>
      <Button
        variant="secondary"
        class="hover:bg-[hsl(var(--foreground))] hover:text-[hsl(var(--background))] hover:transition-all text-base"
        @click="DungeonToggleStartPause"
      >
        {{ gameMain.map.dungeonAction }}
        <Icon
          v-if="gameMain.map.status.exploring"
          icon="eos-icons:three-dots-loading"
          class="!size-6 border-none inline-block"
        />
        <Icon
          v-if="gameMain.map.status.paused"
          icon="ri:rest-time-line"
          class="!size-6 border-none inline-block"
        />
      </Button>
    </div>
  </div>
</template>

<script setup>
import dayjs from 'dayjs'
import { inject, ref, computed } from 'vue'
import { Button } from '@/components/ui/button'
import { VisuallyHidden, ScrollArea, Icon, Popover, PopoverContent, PopoverTrigger, NumberField, NumberFieldContent, NumberFieldDecrement, NumberFieldIncrement, NumberFieldInput, } from '../lib/import'

// 地图计时器
const dungeonTime = computed(() => dayjs(gameMain.value.dungeonTime + (new Date().getTimezoneOffset()) * 60 * 1000).format('HH:mm:ss'))

const emits = defineEmits([
  'DungeonToggleStartPause',
]);

const gameMain = inject('gameMain')

const DungeonToggleStartPause = () => {
  emits('DungeonToggleStartPause')
}
</script>
