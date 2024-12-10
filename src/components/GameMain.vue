<script lang="ts" setup>
import {
  Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
} from '@/components/ui/card'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Icon } from '@iconify/vue'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import {
  HoverCard, HoverCardContent, HoverCardTrigger,
} from '@/components/ui/hover-card'
import {
  NumberField, NumberFieldContent, NumberFieldDecrement, NumberFieldIncrement, NumberFieldInput,
} from '@/components/ui/number-field'
import { initialDungeonLoad, dungeonToggleStartPause, chestEvent, fleeBattle, engageBattle, endBattle, ignoreEvent, chooseNextroomEvent } from "../lib/dungeon"
import { playerLoadStats } from "../lib/player";
import { nFormatter } from "../lib/utils";
import { equipmentRarityList } from "../config/equipment"
import { X } from 'lucide-vue-next';
import { onMounted, ref, watchEffect, computed } from 'vue'
import { useColorMode } from '@vueuse/core'
import dayjs from 'dayjs'

// 装备稀有度
const equipmentCategoriesFilterList = equipmentRarityList

// loading
let gameMainLoading = ref(true)

const mode = useColorMode()
const toggleState = ref(false)
watchEffect(() => {
  mode.value = toggleState.value ? 'light' : 'dark'
})
const equipmentSelectVal = ref('Common') // 背包-装备类型下拉筛选
const equipmentSelectItem = computed(() => equipmentCategoriesFilterList.find(e => e.value === equipmentSelectVal.value)) // 背包-装备类型下拉筛选选中项
const menuBackpackOpen = ref(false) // 背包是否打开
const gameCfgOpen = ref(false) // 游戏设置是否打开
const menuCfgOpen = ref(false) // 菜单是否打开
const combatOpen = ref(false) // 战斗窗口是否打开
// 设置面板 begin
const gameCfgDefaultVal = 'autoCombat' // 默认展开的设置面板
// 设置面板 end

// 地图计时器
const dungeonTime = computed(() => dayjs(gameMain.value.dungeonTime + (new Date().getTimezoneOffset()) * 60 * 1000).format('HH:mm:ss'))

// 当前敌人
const currEnemy = computed(() => gameMain.value.map && gameMain.value.map.enemyBattleList.length && gameMain.value.combat.enemyCurrId >= 0 ? gameMain.value.map.enemyBattleList[gameMain.value.combat.enemyCurrId] : null)


let gameMain = ref({
  dungeonTime: 0,// 总游戏时长
  map: null,
  playerDead: false,
  enemyDead: false,
  inventoryOpen: false,
  player: {
    name: "Soda",
    lvl: 1,
    stats: { // 最终所有属性总价成
      hp: null,
      hpMax: null,
      atk: null,
      def: null,
      pen: null,
      atkSpd: null,
      vamp: null,
      critRate: null,
      critDmg: null
    },
    baseStats: { // 基础属性值（含开具加点以后）
      hp: 500,
      atk: 100,
      def: 50,
      pen: 0,
      atkSpd: 0.6,
      vamp: 0,
      critRate: 0,
      critDmg: 50
    },
    equippedStats: { // 装备栏属性总加成
      hp: 0,
      atk: 0,
      def: 0,
      pen: 0,
      atkSpd: 0,
      vamp: 0,
      critRate: 0,
      critDmg: 0,
      hpPct: 0,
      atkPct: 0,
      defPct: 0,
      penPct: 0,
    },
    bonusStats: { // 地图当前获取的增益总加成
      hp: 0,
      atk: 0,
      def: 0,
      atkSpd: 0,
      vamp: 0,
      critRate: 0,
      critDmg: 0
    },
    exp: {
      expCurr: 0, // 当前获取的总经验值
      expMax: 100, // 升到最新一级所需要的总经验值
      expCurrLvl: 0, // 当前等级超出的经验值
      expMaxLvl: 100, // 当前等级升级新一级所需要的经验值
      lvlGained: 0 // 一次性升了多少级，有可能经验很多连升多级
    },
    inventory: { // 仓库
      consumables: [],
      equipment: [], // 存放装备仓库
      equipmentLimit: 30 // 存放装备仓库数量限制
    },
    equipped: [], // 装备栏
    equippedLimit: 6, // 装备栏数量限制
    gold: 0, // 金币数
    playtime: 0, // 游戏时长
    kills: 0, // 杀死的怪物数
    deaths: 0, // 死亡次数
    inCombat: false // 是否在战斗中
  },
  combat: {
    combatSeconds: 0,
    combatTimer: null,
    enemyCurrId: -1,
    combatBacklog: [],
    combatLoot: [],
  },
  auto: {
    progress: false, // 自动进程
    enemyCombat: false, // 普通怪自动战斗
    floorEnemyCombat: false, // 守层boos自动战斗
    bossCombat: false, // 精英boss自动战斗
    chest: false, // 藏宝室宝箱自动拾取
    combatChest: false, // 战斗宝箱自动拾取
    blessingY: false, // 祝福雕像自动购买
    blessingN: false, // 灾厄雕像自动购买
  },
})
// 获取装备稀有度名称
const getRarityLabel = (val) => {
  return equipmentCategoriesFilterList.find(e => e.value === val).label
}
// 获取装备稀有度颜色
const getRarityColor = (val) => {
  return equipmentCategoriesFilterList.find(e => e.value === val).color
}

// 开始/暂停 地图探索
const handleDungeonToggleStartPause = () => {
  dungeonToggleStartPause(gameMain.value.map)
}

// 背包按钮
const handleOpenBackpackCfg = () => {
  equipmentSelectVal.value = 'Common'
  menuBackpackOpen.value = true
}
// 菜单按钮
const handleOpenMenuCfg = () => {
  menuCfgOpen.value = true
}
// 打开宝箱
const handleOpenChest = () => {
  if (gameMain.value.map.status.eventType === 'treasure') {
    chestEvent(gameMain.value)
  }
}
// 进入战斗
const handleEngageBattle = () => {
  console.log('handleEngageBattle eventType', gameMain.value.map.status.eventType);
  combatOpen.value = true
  gameMain.value.combat.enemyCurrId = 0
  engageBattle(gameMain.value)
}
// 进入门
const handleChooseNextroomEvent = () => {
  if (gameMain.value.map.status.eventType === 'nextroom') {
    chooseNextroomEvent(gameMain.value)
  }
}
// 逃避战斗
const handleFleeBattle = () => {
  fleeBattle(gameMain.value)
}
// 结束战斗
const handleEndBattle = () => {
  // 将装备收到未满的背包
  gameMain.value.combat.combatLoot.forEach(item => {
    if (gameMain.value.player.inventory.equipment.length < gameMain.value.player.inventory.equipmentLimit) {
      gameMain.value.player.inventory.equipment.push(JSON.stringify(item.raw))
    }
  });
  handleIgnoreEndBattle()
}
// 结束战斗
const handleIgnoreEndBattle = () => {
  endBattle(gameMain.value)
  combatOpen.value = false
}
// 忽略事件
const handleIgnoreEvent = () => {
  if (gameMain.value.map.status.eventType === 'nextroom') {
    gameMain.value.map.action = 0;
    ignoreEvent(gameMain.value.map)
  } else if (gameMain.value.map.status.eventType === 'treasure') {
    gameMain.value.map.action = 0;
    ignoreEvent(gameMain.value.map)
  }
}

// 清空地图日志
const handleClearMapLog = () => {
  gameMain.value.map.backlog = gameMain.value.map.backlog.slice(-1)
}
const dealFloatFixed = (val, fixed = 2) => {
  return parseFloat(val.toFixed(fixed))
}


onMounted(() => {
  mode.value = 'dark'
  // 创建并加载地图
  let map = initialDungeonLoad(gameMain.value)
  // 加载玩家属性
  playerLoadStats(gameMain.value)
  // 在没有初始界面时测试用，手动将生命值赋值最大
  gameMain.value.player.stats.hp = gameMain.value.player.stats.hpMax

  console.log('gameMain', gameMain);


  gameMainLoading.value = false
  combatOpen.value = true
})

</script>

<template>
  <div
    v-if="gameMainLoading"
    class="flex flex-col space-y-3 p-3 h-screen"
  >
    <Skeleton class="h-12 min-w-screen-sm md:w-[40rem]" />
    <div class="flex space-x-4">
      <Skeleton class="flex-1 rounded-xl h-64" />
      <Skeleton class="flex-1 rounded-xl h-64" />
    </div>
    <Skeleton class="h-12 min-w-screen-sm md:w-[40rem]" />
    <Skeleton class="flex-1 min-w-screen-sm md:w-[40rem]" />
  </div>
  <div
    v-else
    class="container mx-auto flex flex-col h-screen  min-w-screen-sm md:w-[40rem]"
  >
    <div class="flex justify-between items-center border mt-4 mb-3 h-fit w-full rounded-lg py-1">
      <div class="ml-2 mobile:grow flex mobile:flex-col md:flex-row md:items-center md:grow">
        <p class="playerIcon grow ml-2 flex">
          <Icon
            icon="basil:user-solid"
            class="!size-6 mr-1"
          />
          <span class="pr-2">{{gameMain.player.name}}</span>
          <span>等级 {{gameMain.player.lvl}}</span>
        </p>
        <p class="grow flex mobile:flex-row mobile:items-center  sm:flex-col sm:items-start">
          <span class="py-0.5 mobile:mr-1.5">经验值</span>
          <span class="pb-0.5">{{gameMain.player.exp.expCurr}}/{{gameMain.player.exp.expMax}}（{{gameMain.player.exp.expPercent}}%）</span>
        </p>
      </div>
      <p class="grow flex text-center">
        <Icon
          icon="mdi:gold"
          class="!size-6 mr-1"
        />
        <span>{{nFormatter(gameMain.player.gold)}}</span>
      </p>
      <p class="grow-0 mx-1 top-panel-menu-button hover-button">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger as="Icon">
              <Icon
                icon="jam:backpack-f"
                class="!size-6 border-none"
                @click="handleOpenBackpackCfg"
              />
            </TooltipTrigger>
            <TooltipContent>
              <p>背包</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <Dialog v-model:open.sync="menuBackpackOpen">
          <DialogContent
            class="w-fit"
            @escapeKeyDown.prevent
            @closeAutoFocus.prevent
          >
            <DialogHeader>
              <DialogTitle>背包</DialogTitle>
            </DialogHeader>
            <div class="flex flex-col items-center space-x-2">
              <div class="flex items-center">
                <div class="text-center px-4 cursor-pointer border rounded-lg hover:bg-[hsl(var(--foreground))] hover:text-[hsl(var(--background))] hover:transition-all  mx-0 min-w-fit py-1 text-base flex  flex-col items-center">
                  <Icon
                    icon="hugeicons:sale-tag-01"
                    class="!size-6 mr-1"
                  />
                  <di class="">出售
                  </di>
                </div>
                <Select v-model="equipmentSelectVal">
                  <SelectTrigger class="w-[180px] ml-3">
                    <SelectValue
                      :style="`color:${equipmentSelectItem.color}`"
                      class="flex items-center"
                      placeholder="Select a fruit"
                    >
                      <Icon
                        icon="lsicon:filter-outline"
                        class="!size-6 mr-2"
                      />
                      <span>{{ equipmentSelectItem.label }}</span>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem
                        v-for="item in equipmentCategoriesFilterList"
                        :value="item.value"
                        :key="item.value"
                        :style="`color:${item.color}`"
                      >
                        {{item.label}}
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <ScrollArea class="flex-1 mb-2 rounded-lg  min-h-60 max-h-60 w-64">
              <div
                class="flex items-center text-sm leading-6 hover:bg-white/20 rounded-sm"
                v-for="i in gameMain.player.inventory.equipment"
              >
                <Icon
                  icon="mdi:gold"
                  class="!size-4 mx-3"
                />
                <span>传家宝链甲</span>
              </div>
            </ScrollArea>
            <Card class="w-64">
              <CardHeader class="px-4 pt-4 pb-2">
                <CardTitle class="flex justify-between items-center">
                  <span class="text-sm">装备</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger as="Icon">
                        <Icon
                          icon="icon-park-outline:clear"
                          class="!size-6 ml-2 p-1 rounded-lg cursor-pointer border-none hover-button"
                        />
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <p>卸下全部装备</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </CardTitle>
              </CardHeader>
              <CardContent class="grid grid-cols-3 gap-2 px-4 pb-4">
                <HoverCard
                  v-for="i in 6"
                  :key="i"
                >
                  <HoverCardTrigger as-child>
                    <div class="text-center py-2 border rounded-lg cursor-pointer">
                      <Icon
                        icon="game-icons:broadsword"
                        class="!size-6 inline-block"
                      />
                    </div>
                  </HoverCardTrigger>
                  <HoverCardContent class="w-80">
                    <div class="flex justify-between space-x-4">
                      <div class="space-y-1">
                        <h4 class="text-sm font-semibold">
                          @vuejs
                        </h4>
                        <p class="text-sm">
                          Progressive JavaScript framework for building modern web interfaces.
                        </p>
                        <div class="flex items-center pt-2">
                          <span class="text-xs text-muted-foreground">
                            Joined January 2014
                          </span>
                        </div>
                      </div>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              </CardContent>
            </Card>
            <DialogClose class="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
              <X class="w-4 h-4" />
            </DialogClose>
          </DialogContent>
        </Dialog>
      </p>
      <p class="grow-0 mr-2 top-panel-menu-button hover-button">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger as="Icon">
              <Icon
                icon="fluent:list-rtl-16-filled"
                class="!size-6 border-none"
                @click="handleOpenMenuCfg"
              />
            </TooltipTrigger>
            <TooltipContent>
              <p>菜单</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <Dialog v-model:open.sync="menuCfgOpen">
          <DialogContent
            class="w-fit"
            @escapeKeyDown.prevent
            @closeAutoFocus.prevent
          >
            <DialogClose class="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
              <X class="w-4 h-4" />
              <span class="sr-only">Close</span>
            </DialogClose>
            <DialogHeader>
              <DialogTitle>菜单</DialogTitle>
            </DialogHeader>
            <div class="flex flex-col items-center space-x-2">
              <div class="hover-menu-button w-full align-middle">
                <Icon
                  icon="basil:user-solid"
                  class="!size-6 border-none inline-block"
                />
                {{gameMain.player.name}}
              </div>
              <div class="hover-menu-button w-full">
                本轮游戏
              </div>
              <Dialog v-model:open.sync="gameCfgOpen">
                <DialogContent
                  class="w-60"
                  @escapeKeyDown.prevent
                  @closeAutoFocus.prevent
                >
                  <DialogClose class="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                    <X class="w-4 h-4" />
                    <span class="sr-only">Close</span>
                  </DialogClose>
                  <DialogHeader>
                    <DialogTitle>游戏设置</DialogTitle>
                  </DialogHeader>
                  <div class="flex flex-col items-center space-x-2">
                    <div class="flex items-center justify-between w-full">
                      <Label class="text-base">
                        <Icon
                          icon="game-icons:entry-door"
                          class="!size-4 border-none inline-block mr-1.5 ml-1"
                        />自动进程
                      </Label>
                      <Switch
                        v-model:checked.sync="gameMain.auto.progress"
                        class="h-4 w-8"
                      />
                    </div>
                    <Accordion
                      type="single"
                      class="w-full"
                      collapsible
                      :default-value="gameCfgDefaultVal"
                    >
                      <AccordionItem
                        class="border-none"
                        key="autoCombat"
                        value="autoCombat"
                      >
                        <AccordionTrigger class="hover:no-underline py-1.5">
                          <div class="inline-block">
                            <Icon
                              icon="game-icons:crossed-sabres"
                              class="!size-4 border-none inline-block mr-1.5"
                            />自动战斗
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div class="flex items-center space-x-2 justify-between mb-2">
                            <Label>普通怪</Label>
                            <Switch
                              v-model:checked.sync="gameMain.auto.enemyCombat"
                              class="h-4 w-8"
                            />
                          </div>
                          <div class="flex items-center space-x-2 justify-between mb-2">
                            <Label>守层 BOSS</Label>
                            <Switch
                              v-model:checked.sync="gameMain.auto.floorEnemyCombat"
                              class="h-4 w-8"
                            />
                          </div>
                          <div class="flex items-center space-x-2 justify-between">
                            <Label>精英 BOSS</Label>
                            <Switch
                              v-model:checked.sync="gameMain.auto.bossCombat"
                              class="h-4 w-8"
                            />
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem
                        class="border-none"
                        key="autoPickup"
                        value="autoPickup"
                      >
                        <AccordionTrigger class="hover:no-underline py-1.5">
                          <div class="inline-block">
                            <Icon
                              icon="game-icons:card-pickup"
                              class="!size-4 border-none inline-block mr-1.5"
                            />自动拾取
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div class="flex items-center space-x-2 justify-between mb-2">
                            <Label>藏宝室宝箱</Label>
                            <Switch
                              v-model:checked.sync="gameMain.auto.chest"
                              id="airplane-mode"
                              class="h-4 w-8"
                            />
                          </div>
                          <div class="flex items-center space-x-2 justify-between mb-2">
                            <Label>战斗宝箱</Label>
                            <Switch
                              v-model:checked.sync="gameMain.auto.combatChest"
                              id="airplane-mode"
                              class="h-4 w-8"
                            />
                          </div>
                          <div class="flex items-center space-x-2 justify-between mb-2">
                            <Label>祝福雕像</Label>
                            <Switch
                              v-model:checked.sync="gameMain.auto.blessingY"
                              id="airplane-mode"
                              class="h-4 w-8"
                            />
                          </div>
                          <div class="flex items-center space-x-2 justify-between mb-2">
                            <Label>灾厄雕像</Label>
                            <Switch
                              v-model:checked.sync="gameMain.auto.blessingN"
                              id="airplane-mode"
                              class="h-4 w-8"
                            />
                          </div>
                          <div class="flex items-center space-x-2 justify-between">
                            <Label>升级 Buff</Label>
                            <Switch
                              id="airplane-mode"
                              class="h-4 w-8"
                            />
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem
                        class="border-none"
                        key="buffLevel"
                        value="buffLevel"
                      >
                        <AccordionTrigger class="hover:no-underline py-1.5">
                          <div class="inline-block">
                            <Icon
                              icon="game-icons:gooey-eyed-sun"
                              class="!size-4 border-none inline-block mr-1.5"
                            />buff 等级
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <NumberField
                            :default-value="0"
                            :min="0"
                            class="flex items-center justify-between"
                          >
                            <Label>祝福雕像</Label>
                            <NumberFieldContent>
                              <NumberFieldDecrement />
                              <NumberFieldInput class="w-24" />
                              <NumberFieldIncrement />
                            </NumberFieldContent>
                          </NumberField>
                          <NumberField
                            :default-value="0"
                            :min="0"
                            class="flex items-center justify-between"
                          >
                            <Label>灾厄雕像</Label>
                            <NumberFieldContent>
                              <NumberFieldDecrement />
                              <NumberFieldInput class="w-24" />
                              <NumberFieldIncrement />
                            </NumberFieldContent>
                          </NumberField>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>
                </DialogContent>
              </Dialog>
              <div
                class="hover-menu-button w-full"
                @click="gameCfgOpen = true"
              >
                设置
              </div>
              <div class="hover-menu-button w-full">
                导出/导入 存档
              </div>
              <div class="hover-menu-button w-full">
                放弃
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </p>
    </div>
    <div class="flex mb-3 h-fit w-full">
      <div class="mid-panel-box mr-3">
        <div class="mid-panel-title">属性</div>
        <div class="flex my-1 items-center">
          <Icon
            icon="typcn:heart-full-outline"
            class="sm:!size-6 mr-1 mobile:!size-5"
          />
          <span class="mobile:text-sm sm:text-base">生命值：{{nFormatter(gameMain.player.stats.hp)}}/{{nFormatter(gameMain.player.stats.hpMax)}}（{{gameMain.player.stats.hpPercent}}%）</span>
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
          <span class="mobile:text-sm sm:text-base">攻击速度：{{gameMain.player.stats.atkSpd}}</span>
        </div>
        <div class="flex my-1">
          <Icon
            icon="game-icons:charm"
            class="sm:!size-6 mr-1 mobile:!size-5"
          />
          <span class="mobile:text-sm sm:text-base">吸血：{{gameMain.player.stats.vamp}}%</span>
        </div>
        <div class="flex my-1">
          <Icon
            icon="game-icons:zeus-sword"
            class="sm:!size-6 mr-1 mobile:!size-5"
          />
          <span class="mobile:text-sm sm:text-base">暴击率：{{gameMain.player.stats.critRate}}%</span>
        </div>
        <div class="flex my-1">
          <Icon
            icon="game-icons:gooey-sword"
            class="sm:!size-6 mr-1 mobile:!size-5"
          />
          <span class="mobile:text-sm sm:text-base">暴击伤害：{{gameMain.player.stats.critDmg}}%</span>
        </div>
      </div>
      <div class="mid-panel-box">
        <div class="mid-panel-title">属性加成</div>
        <div class="flex my-1">
          <Icon
            icon="typcn:heart-full-outline"
            class="sm:!size-6 mr-1 mobile:!size-5"
          />
          <span class="mobile:text-sm sm:text-base">生命值+{{gameMain.player.bonusStats.atk}}%</span>
        </div>
        <div class="flex my-1">
          <Icon
            icon="game-icons:rune-sword"
            class="sm:!size-6 mr-1 mobile:!size-5"
          />
          <span class="mobile:text-sm sm:text-base">攻击+{{gameMain.player.bonusStats.atk}}%</span>
        </div>
        <div class="flex my-1">
          <Icon
            icon="game-icons:breastplate"
            class="sm:!size-6 mr-1 mobile:!size-5"
          />
          <span class="mobile:text-sm sm:text-base">防御+{{gameMain.player.bonusStats.def}}%</span>
        </div>
        <div class="flex my-1">
          <Icon
            icon="game-icons:blade-fall"
            class="sm:!size-6 mr-1 mobile:!size-5"
          />
          <span class="mobile:text-sm sm:text-base">攻击速度+{{gameMain.player.bonusStats.atkSpd}}%</span>
        </div>
        <div class="flex my-1">
          <Icon
            icon="game-icons:charm"
            class="sm:!size-6 mr-1 mobile:!size-5"
          />
          <span class="mobile:text-sm sm:text-base">吸血+{{gameMain.player.bonusStats.vamp}}%</span>
        </div>
        <div class="flex my-1">
          <Icon
            icon="game-icons:zeus-sword"
            class="sm:!size-6 mr-1 mobile:!size-5"
          />
          <span class="mobile:text-sm sm:text-base">暴击率+{{gameMain.player.bonusStats.critRate}}%</span>
        </div>
        <div class="flex my-1">
          <Icon
            icon="game-icons:gooey-sword"
            class="sm:!size-6 mr-1 mobile:!size-5"
          />
          <span class="mobile:text-sm sm:text-base">暴击伤害+{{gameMain.player.bonusStats.critDmg}}%</span>
        </div>
      </div>
    </div>
    <div class="flex justify-between mb-3 h-fit w-full">
      <div class="py-2">{{dungeonTime}}</div>
      <div class="py-2">层数 {{ gameMain.map.progress.floor }}</div>
      <div class="py-2">房间 {{ gameMain.map.progress.room }}</div>
      <div>
        <Button
          variant="secondary"
          class="hover:bg-[hsl(var(--foreground))] hover:text-[hsl(var(--background))] hover:transition-all text-base"
          @click="handleDungeonToggleStartPause"
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
    <!-- <div class="flex-1 border mb-2 rounded-lg"></div> -->
    <ScrollArea class="flex-1 mb-2 rounded-lg border p-4 relative">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger
            as="Icon"
            class="absolute right-4"
          >
            <Icon
              icon="icon-park-outline:clear"
              class="!size-6 ml-2 p-1 rounded-lg cursor-pointer border-none hover-button "
              @click="handleClearMapLog"
            />
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>清空日志</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <div
        class="mb-1.5 flex items-center align-middle"
        v-for="(msg,idx) in gameMain.map.backlog"
        :key="idx"
        v-html="msg"
      >
      </div>
      <div
        class="flex space-x-2 px-1"
        v-if="gameMain.map.status.event"
      >
        <Button
          v-if="['enemy'].includes(gameMain.map.status.eventType)"
          variant="outline"
          class="hover:bg-[hsl(var(--foreground))] hover:text-[hsl(var(--background))] hover:transition-all text-base border-white"
          @click="handleEngageBattle"
        >
          战斗
        </Button>
        <Button
          v-if="
          ['treasure'].includes(gameMain.map.status.eventType)"
          variant="outline"
          class="hover:bg-[hsl(var(--foreground))] hover:text-[hsl(var(--background))] hover:transition-all text-base border-white"
          @click="handleOpenChest"
        >
          打开箱子
        </Button>
        <Button
          v-if="['nextroom'].includes(gameMain.map.status.eventType)"
          variant="outline"
          class="hover:bg-[hsl(var(--foreground))] hover:text-[hsl(var(--background))] hover:transition-all text-base border-white"
          @click="handleChooseNextroomEvent"
        >
          进入
        </Button>
        <Button
          v-if="['enemy'].includes(gameMain.map.status.eventType)"
          variant="outline"
          class="hover:bg-[hsl(var(--foreground))] hover:text-[hsl(var(--background))] hover:transition-all text-base border-white"
          @click="handleFleeBattle"
        >
          逃跑
        </Button>
        <Button
          v-if="['treasure','nextroom'].includes(gameMain.map.status.eventType)"
          variant="outline"
          class="hover:bg-[hsl(var(--foreground))] hover:text-[hsl(var(--background))] hover:transition-all text-base border-white"
          @click="handleIgnoreEvent"
        >
          忽略
        </Button>
      </div>
    </ScrollArea>
  </div>
  <AlertDialog
    v-if="currEnemy || gameMain.player.inCombat"
    v-model:open="combatOpen"
  >
    <AlertDialogContent
      class="w-[400px]"
      @escapeKeyDown.prevent
      @openAutoFocus.prevent
    >
      <div>
        <div class="text-center mb-1.5 text-base">{{currEnemy.name}} 等级 {{ currEnemy.lvl }}</div>
        <div class="relative h-4 bg-slate-400 rounded-md mx-2 mb-2">
          <div
            class="absolute z-[0] h-full bg-red-600 rounded-md transition-all"
            :style="`width: ${currEnemy.stats.hpPercent}%;`"
          ></div>
          <span class="absolute text-xs z-1 left-1">{{currEnemy.stats.hp}}/{{ currEnemy.stats.hpMax }}（{{ currEnemy.stats.hpPercent }}%）</span>
        </div>
        <!-- <Skeleton class="h-40 w-40 mx-auto rounded-xl mb-4" /> -->
        <img
          src="../../public/wolf_winter.png"
          alt="Photo by Drew Beamer"
          class="rounded-md object-cover mx-auto h-40 w-40 mb-4 block"
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
        <ScrollArea class="border rounded-md p-2 h-[260px]">
          <div
            class="mb-2 flex items-center align-middle"
            v-for="(msg,idx) in gameMain.combat.combatBacklog"
            :key="idx"
            v-html="msg"
          >
          </div>
          <div
            v-for="equipment in gameMain.combat.combatLoot"
            :key="equipment.id"
            class="border rounded-lg p-1.5 mb-2"
          >
            <p :style="`color:${getRarityColor(equipment.rarity)}`"><span v-html="equipment.icon"></span><span class="font-bold">{{ getRarityLabel(equipment.rarity) }}的{{ equipment.category.label }}</span></p>
            <p class="mx-1">等级 {{ equipment.lvl }} 品阶 {{ equipment.tier }}</p>
            <p
              class="mx-1"
              v-for="stat in equipment.statsTransform"
            >
              {{ stat.label }}+{{ ["critRate","critDmg","atkSpd","vamp"].includes(stat.key)?dealFloatFixed(stat.value):stat.value }}{{ stat.unit }}
            </p>
          </div>
          <Button
            v-if="gameMain.enemyDead"
            variant="outline"
            class="hover:bg-[hsl(var(--foreground))] hover:text-[hsl(var(--background))] hover:transition-all text-base border-white"
            @click="handleEndBattle"
          >
            领取
          </Button>
          <Button
            v-if="gameMain.enemyDead"
            variant="outline"
            class="hover:bg-[hsl(var(--foreground))] hover:text-[hsl(var(--background))] hover:transition-all text-base border-white"
            @click="handleIgnoreEndBattle"
          >
            忽略
          </Button>
          <Button
            v-if="gameMain.playerDead"
            variant="outline"
            class="hover:bg-[hsl(var(--foreground))] hover:text-[hsl(var(--background))] hover:transition-all text-base border-white"
            @click="handleEndBattle"
          >
            重开
          </Button>
        </ScrollArea>
      </div>
    </AlertDialogContent>
  </AlertDialog>
</template>