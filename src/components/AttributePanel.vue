<template>
  <div class="flex mb-3 h-fit w-full">
    <div class="mid-panel-box mr-3">
      <div class="mid-panel-title">属性</div>
      <div class="flex my-1 items-center">
        <Icon
          icon="typcn:heart-full-outline"
          class="sm:!size-6 mr-1 mobile:!size-5"
        />
        <span class="mobile:text-sm sm:text-base">生命值：{{nFormatter(gameMain.player.stats.hp)}}/{{nFormatter(gameMain.player.stats.hpMax)}}<span class="mobile:hidden sm:inline-block">{{'（'+gameMain.player.stats.hpPercent+'%）'}}</span></span>
      </div>
      <div class="flex my-1">
        <Icon
          icon="game-icons:rune-sword"
          class="sm:!size-6 mr-1 mobile:!size-5"
        />
        <span class="mobile:text-sm sm:text-base">攻击：{{gameMain.player.stats.atk}}</span>
      </div>
      <div class="flex my-1">
        <Icon
          icon="game-icons:breastplate"
          class="sm:!size-6 mr-1 mobile:!size-5"
        />
        <span class="mobile:text-sm sm:text-base">防御：{{gameMain.player.stats.def}}</span>
      </div>
      <div class="flex my-1">
        <Icon
          icon="game-icons:blade-fall"
          class="sm:!size-6 mr-1 mobile:!size-5"
        />
        <span class="mobile:text-sm sm:text-base">攻击速度：{{dealFloatFixed(gameMain.player.stats.atkSpd)}}</span>
      </div>
      <div class="flex my-1">
        <Icon
          icon="game-icons:charm"
          class="sm:!size-6 mr-1 mobile:!size-5"
        />
        <span class="mobile:text-sm sm:text-base">吸血：{{dealFloatFixed(gameMain.player.stats.vamp)}}%</span>
      </div>
      <div class="flex my-1">
        <Icon
          icon="game-icons:zeus-sword"
          class="sm:!size-6 mr-1 mobile:!size-5"
        />
        <span class="mobile:text-sm sm:text-base">暴击率：{{dealFloatFixed(gameMain.player.stats.critRate)}}%</span>
      </div>
      <div class="flex my-1">
        <Icon
          icon="game-icons:gooey-sword"
          class="sm:!size-6 mr-1 mobile:!size-5"
        />
        <span class="mobile:text-sm sm:text-base">暴击伤害：{{dealFloatFixed(gameMain.player.stats.critDmg)}}%</span>
      </div>
    </div>
    <div class="mid-panel-box">
      <div class="mid-panel-title">属性加成</div>
      <div class="flex my-1">
        <Icon
          icon="typcn:heart-full-outline"
          class="sm:!size-6 mr-1 mobile:!size-5"
        />
        <span class="mobile:text-sm sm:text-base">生命值+{{dealFloatFixed(gameMain.player.bonusStats.hp)}}%</span>
      </div>
      <div class="flex my-1">
        <Icon
          icon="game-icons:rune-sword"
          class="sm:!size-6 mr-1 mobile:!size-5"
        />
        <span class="mobile:text-sm sm:text-base">攻击+{{dealFloatFixed(gameMain.player.bonusStats.atk)}}%</span>
      </div>
      <div class="flex my-1">
        <Icon
          icon="game-icons:breastplate"
          class="sm:!size-6 mr-1 mobile:!size-5"
        />
        <span class="mobile:text-sm sm:text-base">防御+{{dealFloatFixed(gameMain.player.bonusStats.def)}}%</span>
      </div>
      <div class="flex my-1">
        <Icon
          icon="game-icons:blade-fall"
          class="sm:!size-6 mr-1 mobile:!size-5"
        />
        <span class="mobile:text-sm sm:text-base">攻击速度+{{dealFloatFixed(gameMain.player.bonusStats.atkSpd)}}%</span>
      </div>
      <div class="flex my-1">
        <Icon
          icon="game-icons:charm"
          class="sm:!size-6 mr-1 mobile:!size-5"
        />
        <span class="mobile:text-sm sm:text-base">吸血+{{dealFloatFixed(gameMain.player.bonusStats.vamp)}}%</span>
      </div>
      <div class="flex my-1">
        <Icon
          icon="game-icons:zeus-sword"
          class="sm:!size-6 mr-1 mobile:!size-5"
        />
        <span class="mobile:text-sm sm:text-base">暴击率+{{dealFloatFixed(gameMain.player.bonusStats.critRate)}}%</span>
      </div>
      <div class="flex my-1">
        <Icon
          icon="game-icons:gooey-sword"
          class="sm:!size-6 mr-1 mobile:!size-5"
        />
        <span class="mobile:text-sm sm:text-base">暴击伤害+{{dealFloatFixed(gameMain.player.bonusStats.critDmg)}}%</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Icon, nFormatter } from '../lib/import'
import { inject } from 'vue'
const gameMain = inject('gameMain')

const props = defineProps({
  dealFloatFixed: { type: Function, required: true },
});
</script>

