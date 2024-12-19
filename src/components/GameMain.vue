<script lang="ts" setup>
import {
  // vue
  onMounted, ref, watchEffect, computed, nextTick, provide,
  // components
  Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
  Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue,
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogOverlay, AlertDialogTitle, AlertDialogDescription, AlertDialogCancel, AlertDialogFooter, AlertDialogAction,
  Button, Icon, ScrollArea, Accordion, AccordionContent, AccordionItem, AccordionTrigger,
  Label, Input, Switch, Skeleton,
  NumberField, NumberFieldContent, NumberFieldDecrement, NumberFieldIncrement, NumberFieldInput, VisuallyHidden,
  Toaster, X,
  // functions
  useColorMode, useToast,
  initialDungeonLoad, dungeonToggleStartPause, chestEvent, fleeBattle, engageBattle, endBattle, ignoreEvent, chooseNextroomEvent, playerLoadStats, equipmentIcon, equipmentStatsTransform, sellAll, nFormatter, randomizeNum, objectValidation, enterDungeon, calculateStats, startCombat, saveData, progressReset, equipOrUnEquipment, sellEquipment, offerBlessingEvent, offerCurseEvent, specialBossBattle, recyClingAllCombatEquipments, getMapEquipment, openInventory,
  // config
  equipmentRarityList, skillsDesc, prefixNames, names, skills, percentages
} from '../lib/import'
import equipmentShow from './EquipmentShow.vue'
import saleEquipment from './SaleEquipment.vue'
import failedGameAlertDialog from './FailedGameAlertDialog.vue'
import AttributePanel from './AttributePanel.vue'
import CombatPanel from './CombatPanel.vue'
import CombatPanelAuto from './CombatPanelAuto.vue'
import LevelUpPanel from './LevelUpPanel.vue'
import MenuBackpack from './MenuBackpack.vue'
import GameCover from './GameCover.vue'
import MenuPanel from './MenuPanel.vue'
import DataImportExport from './DataImportExport.vue'
import dayjs from 'dayjs'

let gameMain = ref(null)
provide('gameMain', gameMain)
// toast 调用
const { toast } = useToast()
const currShowEquipment = ref(null)
const equipmentType = ref('Equip')
const saleEquipmentTriggerType = ref('')
// 装备稀有度
const equipmentCategoriesFilterList = equipmentRarityList

// loading
let gameMainLoading = ref(true)
let gameWindowLoading = ref(false)
let coverLoading = ref(true)

const mode = useColorMode()
const toggleState = ref(false)
const isHovered = ref(false)
watchEffect(() => {
  mode.value = toggleState.value ? 'light' : 'dark'
})
const skillSelectVal = ref("Titan's Will") // 背包-装备类型下拉筛选
const GameBeginSetConfigOpen = ref(false) // 初始配置菜单是否打开
const menuBackpackOpen = ref(false) // 背包是否打开
const dataImportExportOpen = ref(false) // 导入导出是否打开
const equipmentShowOpen = ref(false) // 装备展示是否打开
const menuQuitOpen = ref(false) // 放弃本局是否打开
const levelUpOpen = ref(false) // 升级窗口是否打开
const saleEquipmentOpen = ref(false) // 出售装备是否打开
const menuCfgOpen = ref(false) // 菜单是否打开
const combatOpen = ref(false) // 战斗窗口是否打开

const resetOpenCfg = () => {
  menuBackpackOpen.value = false
  menuBackpackOpen.value = false
  dataImportExportOpen.value = false
  equipmentShowOpen.value = false
  menuQuitOpen.value = false
  levelUpOpen.value = false
  saleEquipmentOpen.value = false
  menuCfgOpen.value = false
  combatOpen.value = false
}
// 地图计时器
const dungeonTime = computed(() => dayjs(gameMain.value.dungeonTime + (new Date().getTimezoneOffset()) * 60 * 1000).format('HH:mm:ss'))

// 当前敌人
const currEnemy = computed(() => gameMain.value && gameMain.value.map && gameMain.value.map.enemyBattleList.length && gameMain.value.combat.enemyCurrId >= 0 ? gameMain.value.map.enemyBattleList[gameMain.value.combat.enemyCurrId] : null)


// 技能列表
const skillsList = ref(skills)

// 技能介绍列表
const skillsDescList = ref(skillsDesc)

// 属性分配
let allocation = ref({
  name: '',
  hp: 16,
  atk: 7,
  def: 7,
  atkSpd: 10
})

// 剩余属性分配点
const openApplyDisable = computed(() => {
  return 40 - (allocation.value.hp + allocation.value.atk + allocation.value.def + allocation.value.atkSpd)
})

// 已分配属性应用数值
const openApplyStats = computed(() => {
  return {
    hp: 50 * allocation.value.hp,
    atk: 10 * allocation.value.atk,
    def: 10 * allocation.value.def,
    atkSpd: (40 + (2 * allocation.value.atkSpd)) / 100
  }
})


// 获取装备稀有度名称
const getRarityLabel = (val) => {
  return equipmentCategoriesFilterList.find(e => e.value === val).label
}
// 获取装备稀有度颜色
const getRarityColor = (val) => {
  return equipmentCategoriesFilterList.find(e => e.value === val).color
}

const generateGame = () => {
  return {
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
      selectedStats: [],// 升级时可选择的升级属性选项组
      equipped: [], // 装备栏
      equippedLimit: 6, // 装备栏数量限制
      rerolls: 2, // 可以重置选取升级属性的次数
      gold: 0, // 金币数
      blessing: 1, // 祝福
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
      progress: true, // 自动进程
      specialBossCombat: false, // 精英boss自动战斗
      chest: true, // 藏宝室宝箱自动拾取
      blessingY: true, // 祝福雕像自动购买
      blessingN: false, // 灾厄雕像自动购买
      percentages: Object.values(percentages)
    },
  }
}
// 开始/暂停 地图探索
const handleDungeonToggleStartPause = () => {
  dungeonToggleStartPause(gameMain.value)
}

// 确认放弃按钮
const handleFailedGame = (isReopen) => {
  clearInterval(gameMain.value.map.dungeonTimer);
  clearInterval(gameMain.value.player.playTimer);

  progressReset(gameMain.value);
  skillSelectVal.value = "Titan's Will"
  handleResetAttrPoints()

  menuQuitOpen.value = false
  GameBeginSetConfigOpen.value = false
  coverLoading.value = true
  gameMainLoading.value = false
  gameWindowLoading.value = false
  if (isReopen) {
    gameMain.value.player.gold = 0;
    gameMain.value.player.inventory.equipment.length = 0;
    gameMain.value.player.equipped.length = 0;
    localStorage.removeItem("gameMain");
    gameMain.value = null
  }
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
  } else if (gameMain.value.map.status.eventType === 'monarch') {
    specialBossBattle(gameMain.value)
  }
}
// 逃避战斗
const handleFleeBattle = () => {
  fleeBattle(gameMain.value)
}
// 结束战斗
const handleEndBattle = () => {
  recyClingAllCombatEquipments(gameMain.value)
  handleIgnoreEndBattle()
}
// 结束战斗
const handleIgnoreEndBattle = () => {
  endBattle(gameMain.value)
  combatOpen.value = false
}
// 忽略事件
const handleIgnoreEvent = () => {
  if (['treasure', 'equipment', 'blessing', 'curse', 'nextroom', 'monarch'].includes(gameMain.value.map.status.eventType)) {
    gameMain.value.map.action = 0;
    ignoreEvent(gameMain.value.map)
  }
}
// 出售单件装备
const handleShowSaleEquipment = (id, mode) => {
  saleEquipmentTriggerType.value = mode
  console.log('handleShowSaleEquipment', id, currShowEquipment.value);
  if (!currShowEquipment.value) {
    const item = gameMain.value.player.equipped.find(e => e.id === id)
    currShowEquipment.value = {
      // 需要转换
      raw: item,
      category: item.category,
      rarity: item.rarity,
      lvl: item.lvl,
      tier: item.tier,
      icon: equipmentIcon(item.category.value),
      stats: item.stats,
      value: item.value,
      statsTransform: equipmentStatsTransform(item.stats),
    }
  }
  equipmentShowOpen.value = false // 暂时关闭装备展示弹窗
  saleEquipmentOpen.value = true
}

// 确定出售装备
const handleConfirmSaleEquipment = (id) => {
  if (saleEquipmentTriggerType.value === 'click') {
    // 未装备
    sellEquipment(gameMain.value, 'Equip', id)
  } else if (saleEquipmentTriggerType.value === 'hover') {
    // 已装备
    sellEquipment(gameMain.value, 'Unequip', id)
  }
  saleEquipmentTriggerType.value = ''
  saleEquipmentOpen.value = false
  equipmentShowOpen.value = false
  currShowEquipment.value = null
}

// 关闭出售单间询问弹窗
const handleCloseSaleEquipment = () => {
  saleEquipmentOpen.value = false
  if (saleEquipmentTriggerType.value === 'hover') {
    equipmentShowOpen.value = false
    currShowEquipment.value = null
  } else {
    equipmentShowOpen.value = true // 重新弹出装备展示弹窗
  }

}

// 关闭装备展示弹窗
const handleCloseEquipmentShow = () => {
  equipmentShowOpen.value = false
  currShowEquipment.value = null
}
// 装备或者脱下装备
const handleEquipOrUnequipEquipment = async (type, id) => {
  equipOrUnEquipment(gameMain.value, type, id, toast)
  await nextTick()
  equipmentShowOpen.value = false
  currShowEquipment.value = null
}



const handleEquipmentShow = (item, isHover = false, isTrans = false) => {
  // 如果是hover，则不显示
  if (isHover) return
  equipmentType.value = 'Equip';
  if (isTrans) {
    equipmentType.value = 'Unequip';
    item = {
      // 需要转换
      raw: item,
      category: item.category,
      rarity: item.rarity,
      lvl: item.lvl,
      tier: item.tier,
      icon: equipmentIcon(item.category.value),
      stats: item.stats,
      value: item.value,
      statsTransform: equipmentStatsTransform(item.stats),
    }
  }
  console.log('handleEquipmentShow item', item);
  currShowEquipment.value = item
  equipmentShowOpen.value = true;
}

// 获取地图日志中的装备
const handleGetAward = () => {
  if (gameMain.value.map.status.eventType === 'equipment') {
    getMapEquipment(gameMain.value, toast)
  } else if (gameMain.value.map.status.eventType === 'blessing') {
    offerBlessingEvent(gameMain.value)
  } else if (gameMain.value.map.status.eventType === 'curse') {
    offerCurseEvent(gameMain.value)
  }


}

// 清空地图日志
const handleClearMapLog = () => {
  gameMain.value.map.backlog = gameMain.value.map.backlog.slice(-1)
}

// 关闭属性分配面板
const handleCloseAllocation = () => {
  GameBeginSetConfigOpen.value = false
  skillSelectVal.value = "Titan's Will"
  handleResetAttrPoints()
}

// 重置属性分配
const handleResetAttrPoints = () => {
  // allocation.value.name = ''
  allocation.value.hp = 16
  allocation.value.atk = 7
  allocation.value.def = 7
  allocation.value.atkSpd = 10
}

// 随机名称
const handleRandomName = () => {
  console.log(prefixNames[randomizeNum(0, prefixNames.length - 1)] + names[randomizeNum(0, names.length - 1)]);
  allocation.value.name = prefixNames[randomizeNum(0, prefixNames.length - 1)] + names[randomizeNum(0, names.length - 1)]
}
// 应用属性分配
const handleApplyAllocation = () => {
  if (!validateName()) return
  if (!gameMain.value) gameMain.value = generateGame()
  gameMain.value.player.name = allocation.value.name
  calculateStats(gameMain.value)
  gameMain.value.player.baseStats = {
    hp: openApplyStats.value.hp,
    atk: openApplyStats.value.atk,
    def: openApplyStats.value.def,
    pen: 0,
    atkSpd: openApplyStats.value.atkSpd,
    vamp: 0,
    critRate: 0,
    critDmg: 50
  }
  // 设置玩家技能
  objectValidation(gameMain.value);
  if (skillSelectVal.value == "Devastator") {
    gameMain.value.player.skills.push("Devastator");
    gameMain.value.player.baseStats.atkSpd = gameMain.value.player.baseStats.atkSpd - ((30 * gameMain.value.player.baseStats.atkSpd) / 100);
  } else {
    gameMain.value.player.skills.push(skillSelectVal.value);
  }
  // 前往地牢
  gameMain.value.player.allocated = true;
  enterDungeon(gameMain.value)
  gameMain.value.player.stats.hp = gameMain.value.player.stats.hpMax;
  playerLoadStats(gameMain.value);
  saveData(gameMain.value)
  GameBeginSetConfigOpen.value = false
  coverLoading.value = false
  gameMainLoading.value = true
  setTimeout(() => {
    gameMainLoading.value = false
    gameWindowLoading.value = true
  }, randomizeNum(1000, 3000));
}

// 验证名称
const validateName = () => {
  var format = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
  if (format.test(allocation.value.name)) {
    toast({
      title: '您的名字不能包含特殊字符！',
      variant: 'warning',
    });
    return false
  } else if (allocation.value.name.length < 3 || allocation.value.name.length > 15) {
    toast({
      title: '名字应介于3至15个字符之间！',
      variant: 'warning',
    });
    return false
  }
  return true
}

const handleMenuBackpackOpen = () => {
  menuBackpackOpen.value = true
  openInventory(gameMain.value)
}
// 显示小数
const dealFloatFixed = (val, fixed = 2) => {
  return parseFloat(val.toFixed(fixed))
}

// 初始化游戏
const initGame = () => {
  console.log(localStorage.getItem("gameMain"));
  if (localStorage.getItem("gameMain") && localStorage.getItem("gameMain") !== 'undefined') {
    gameMain.value = JSON.parse(localStorage.getItem("gameMain"))
    // console.log(localStorage.getItem("gameMain"));
    if (gameMain.value.player.allocated) {
      GameBeginSetConfigOpen.value = false
      coverLoading.value = false
      gameMainLoading.value = false
      gameWindowLoading.value = true
      enterDungeon(gameMain.value);
      if (gameMain.value.map.enemyBattleList.length && gameMain.value.combat.enemyCurrId > -1) {
        combatOpen.value = true
        if (gameMain.value.player.inCombat) {
          startCombat(gameMain.value);
        }
      }
    } else {
      GameBeginSetConfigOpen.value = false
      coverLoading.value = true
      gameMainLoading.value = false
      gameWindowLoading.value = false
    }
    // // 创建并加载地图
    // let map = initialDungeonLoad(gameMain.value)
    // // 加载玩家属性
    // playerLoadStats(gameMain.value)

    watchEffect(() => {
      if (gameMain.value) {
        if (menuBackpackOpen.value) {
          gameMain.value.map.status.exploring = false;
          gameMain.value.inventoryOpen = true;
        } else {
          gameMain.value.inventoryOpen = false;
          if (!gameMain.value.map.status.paused) {
            gameMain.value.map.status.exploring = true;
          }
        }
      }
    })

  } else {
    GameBeginSetConfigOpen.value = false
    coverLoading.value = true
    gameMainLoading.value = false
    gameWindowLoading.value = false
    gameMain.value = generateGame()
  }
  watchEffect(() => {
    if (gameMain.value && gameMain.value.player.selectedStats && gameMain.value.player.selectedStats.length > 0) {
      nextTick(() => {
        // 延迟加载，解决无法触发的问题
        levelUpOpen.value = true;
      })

    } else {
      nextTick(() => {
        // 延迟加载，解决无法触发的问题
        levelUpOpen.value = false;
      })
    }
  })
}

// 导入数据
const importToInit = (value) => {
  handleFailedGame(true)
  saveData(value)
  initGame()
  resetOpenCfg()
  GameBeginSetConfigOpen.value = false
  coverLoading.value = false
  gameMainLoading.value = true
  gameWindowLoading.value = false
  setTimeout(() => {
    gameMainLoading.value = false
    gameWindowLoading.value = true
  }, randomizeNum(1000, 3000));
}
const isMobile = ref(false)
// 计算属性，判断是否为移动端
const checkWindowSize = () => {
  const mediaQuery = window.matchMedia('(max-width: 640px)');
  isMobile.value = mediaQuery.matches || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

onMounted(() => {
  mode.value = 'dark'
  initGame()
  window.addEventListener('resize', checkWindowSize)
})

</script>

<template>
  <GameCover
    v-model:GameBeginSetConfigOpen="GameBeginSetConfigOpen"
    :coverLoading="coverLoading"
  ></GameCover>
  <!-- 属性分配面板 -->
  <AlertDialog v-model:open="GameBeginSetConfigOpen">
    <AlertDialogContent
      class="md:w-[300px] mobile:w-2/3 p-3"
      @escapeKeyDown.prevent
    >
      <div>
        <AlertDialogHeader>
          <AlertDialogTitle class="font-normal mb-2">命名 & 分配属性</AlertDialogTitle>
          <VisuallyHidden>
            <AlertDialogDescription>
            </AlertDialogDescription>
          </VisuallyHidden>
        </AlertDialogHeader>
        <div class="flex flex-col space-y-2">
          <div class="flex items-center justify-between">
            <span>名字：</span>
            <div class="ml-8 w-40 flex items-center space-x-2">
              <Input
                class="flex-1 borderh-8 inline-block h-8"
                type="text"
                v-model:modelValue="allocation.name"
              />
              <Icon
                icon="game-icons:perspective-dice-six-faces-random"
                class="sm:!size-6 mr-1 mobile:!size-5 inline-block cursor-pointer"
                @click="handleRandomName"
              />
            </div>
          </div>
          <div class="flex items-center justify-between">
            <span class="flex items-center">
              <Icon
                icon="typcn:heart-full-outline"
                class="sm:!size-6 mr-1 mobile:!size-5 inline-block"
              />生命值：{{ openApplyStats.hp }}
            </span>
            <NumberField
              v-model:modelValue="allocation.hp"
              :min="5"
            >
              <NumberFieldContent>
                <NumberFieldDecrement />
                <NumberFieldInput class="w-24" />
                <NumberFieldIncrement :disabled="!openApplyDisable" />
              </NumberFieldContent>
            </NumberField>
          </div>
          <div class="flex items-center justify-between">
            <span class="flex items-center">
              <Icon
                icon="game-icons:rune-sword"
                class="sm:!size-6 mr-1 mobile:!size-5 inline-block"
              />攻击：{{ openApplyStats.atk }}
            </span>
            <NumberField
              v-model:modelValue="allocation.atk"
              :min="5"
            >
              <NumberFieldContent>
                <NumberFieldDecrement />
                <NumberFieldInput class="w-24" />
                <NumberFieldIncrement :disabled="!openApplyDisable" />
              </NumberFieldContent>
            </NumberField>
          </div>
          <div class="flex items-center justify-between">
            <span class="flex items-center">
              <Icon
                icon="game-icons:breastplate"
                class="sm:!size-6 mr-1 mobile:!size-5 inline-block"
              />防御：{{ openApplyStats.def }}
            </span>
            <NumberField
              v-model:modelValue="allocation.def"
              :min="5"
            >
              <NumberFieldContent>
                <NumberFieldDecrement />
                <NumberFieldInput class="w-24" />
                <NumberFieldIncrement :disabled="!openApplyDisable" />
              </NumberFieldContent>
            </NumberField>
          </div>
          <div class="flex items-center justify-between">
            <span class="flex items-center">
              <Icon
                icon="game-icons:blade-fall"
                class="sm:!size-6 mr-1 mobile:!size-5 inline-block"
              />攻击速度：{{ openApplyStats.atkSpd }}
            </span>
            <NumberField
              v-model:modelValue="allocation.atkSpd"
              :min="5"
            >
              <NumberFieldContent>
                <NumberFieldDecrement />
                <NumberFieldInput class="w-24" />
                <NumberFieldIncrement :disabled="!openApplyDisable" />
              </NumberFieldContent>
            </NumberField>
          </div>
          <div class="flex items-center justify-between">
            <span>属性点：{{ openApplyDisable }}</span>
            <Button
              variant="outline"
              class="hover:bg-[hsl(var(--foreground))] hover:text-[hsl(var(--background))] hover:transition-all text-base border-white"
              @click="handleResetAttrPoints"
            >
              重置
            </Button>
          </div>
          <div class="flex items-center justify-between">
            <span>技能</span>
            <Select v-model="skillSelectVal">
              <SelectTrigger class="w-[120px] ml-3">
                <SelectValue
                  class="flex items-center"
                  placeholder="Select a fruit"
                >
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem
                    v-for="item in skillsList"
                    :value="item.value"
                    :key="item.value"
                  >
                    {{item.label}}
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div>{{ skillsDescList[skillSelectVal] }}</div>
          <Button
            variant="outline"
            class="hover:bg-[hsl(var(--foreground))] hover:text-[hsl(var(--background))] hover:transition-all text-base border-white"
            @click="handleApplyAllocation"
          >
            确定
          </Button>
        </div>
        <div
          @click="handleCloseAllocation"
          class="absolute right-4 top-4 cursor-pointer rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
        >
          <X class="w-4 h-4" />
        </div>
      </div>
    </AlertDialogContent>
  </AlertDialog>
  <!-- 加载动画 -->
  <div
    v-if="gameMainLoading"
    class="flex flex-col space-y-3 p-3 h-screen"
  >
    <Icon
      icon="svg-spinners:blocks-wave"
      class="m-auto !size-16 border-none"
    />
  </div>
  <div
    v-if="gameWindowLoading"
    class="container mx-auto flex flex-col h-screen  min-w-screen-sm md:w-[40rem]"
  >
    <div class="flex justify-between items-center border mt-4 mb-3 h-fit w-full rounded-lg py-1">
      <div class="ml-2 mobile:grow flex mobile:flex-col md:flex-row md:items-center md:grow">
        <p class="playerIcon grow flex">
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
      <p class="grow-0 top-panel-menu-button hover-button">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger as="Icon">
              <Icon
                icon="jam:backpack-f"
                class="!size-6 border-none"
                @click="handleMenuBackpackOpen"
              />
            </TooltipTrigger>
            <TooltipContent>
              <p>背包</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </p>
      <p class="grow-0 top-panel-menu-button hover-button">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger as="Icon">
              <Icon
                icon="fluent:list-rtl-16-filled"
                class="!size-6 border-none"
                @click="() => { menuCfgOpen = true; openInventory(gameMain)}"
              />
            </TooltipTrigger>
            <TooltipContent>
              <p>菜单</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <MenuPanel
          v-model:menuCfgOpen="menuCfgOpen"
          v-model:dataImportExportOpen="dataImportExportOpen"
        />
      </p>
      <p class="grow-0 mr-2 top-panel-menu-button hover-button">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger as="Icon">
              <Icon
                icon="solar:logout-3-bold"
                class="!size-6 border-none rotate-180"
                @click="menuQuitOpen = true"
              />
            </TooltipTrigger>
            <TooltipContent>
              <p>放弃本局</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </p>
    </div>
    <AttributePanel :dealFloatFixed="dealFloatFixed"></AttributePanel>
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
    <ScrollArea
      id="mapLog"
      @mouseover="isHovered = true"
      @mouseleave="isHovered = false"
      :class="{ 'hover-scroll': isHovered }"
      class="flex-1 mb-2 rounded-lg border p-4 relative"
    >
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger
            as="Icon"
            class="absolute right-4"
          >
            <Icon
              v-if="gameMain.map.backlog.length"
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
      >
        <p
          v-if="typeof msg === 'string' "
          v-html="msg"
        ></p>
        <div
          v-if="typeof msg === 'object' && msg.type ==='equipment' "
          class="border p-2 rounded-lg mx-1 my-1"
        >
          <div
            class="text-lg mb-2"
            :style="`color:${getRarityColor(msg.rarity)}`"
          >
            <span
              v-html="msg.icon"
              class="mr-1"
            ></span>
            <span>{{ getRarityLabel(msg.rarity) }}的{{ msg.category.label }}</span>
          </div>
          <p class="mx-1 text-xs font-bold">等级 {{ msg.lvl }} 品阶 {{ msg.tier }}</p>
          <p
            class="mx-1 text-sm"
            v-for="stat in msg.statsTransform"
          >
            {{ stat.label }}+{{ ["critRate","critDmg","atkSpd","vamp"].includes(stat.key)?dealFloatFixed(stat.value):stat.value }}{{ stat.unit }}
          </p>
        </div>
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
          v-if="['nextroom','monarch'].includes(gameMain.map.status.eventType)"
          variant="outline"
          class="hover:bg-[hsl(var(--foreground))] hover:text-[hsl(var(--background))] hover:transition-all text-base border-white"
          @click="handleChooseNextroomEvent"
        >
          进入
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
          v-if="['enemy'].includes(gameMain.map.status.eventType)"
          variant="outline"
          class="hover:bg-[hsl(var(--foreground))] hover:text-[hsl(var(--background))] hover:transition-all text-base border-white"
          @click="handleFleeBattle"
        >
          逃跑
        </Button>
        <Button
          v-if="['equipment','blessing','curse'].includes(gameMain.map.status.eventType)"
          variant="outline"
          class="hover:bg-[hsl(var(--foreground))] hover:text-[hsl(var(--background))] hover:transition-all text-base border-white"
          @click="handleGetAward"
        >
          获取
        </Button>
        <Button
          v-if="['treasure','nextroom','equipment','blessing','curse','monarch'].includes(gameMain.map.status.eventType)"
          variant="outline"
          class="hover:bg-[hsl(var(--foreground))] hover:text-[hsl(var(--background))] hover:transition-all text-base border-white"
          @click="handleIgnoreEvent"
        >
          忽略
        </Button>
        <Button
          v-if="gameMain.playerDead"
          variant="outline"
          class="hover:bg-[hsl(var(--foreground))] hover:text-[hsl(var(--background))] hover:transition-all text-base border-white"
          @click="handleFailedGame(false)"
        >
          重开
        </Button>
      </div>
    </ScrollArea>
  </div>
  <!-- 显示装备详情 begin -->
  <equipmentShow
    :equipmentShow="equipmentShowOpen"
    :equipment="currShowEquipment"
    :equipmentType="equipmentType"
    :getRarityLabel="getRarityLabel"
    :getRarityColor="getRarityColor"
    :dealFloatFixed="dealFloatFixed"
    @equipOrUnequipEquipment="handleEquipOrUnequipEquipment"
    @closeEquipmentShow="handleCloseEquipmentShow"
    @equipmentSale="handleShowSaleEquipment"
  />
  <!-- 显示装备详情 end -->
  <!-- 出售装备 begin -->
  <saleEquipment
    v-model:saleEquipmentOpen="saleEquipmentOpen"
    :equipment="currShowEquipment"
    :getRarityLabel="getRarityLabel"
    :getRarityColor="getRarityColor"
    @equipmentSale="handleConfirmSaleEquipment"
    @closeSaleEquipment="handleCloseSaleEquipment"
  />
  <!-- 出售装备 end -->
  <!-- 放弃本局游戏 begin -->
  <failedGameAlertDialog
    v-model:menuQuitOpen="menuQuitOpen"
    @failedGame="handleFailedGame"
  />
  <!-- 放弃本局游戏 end -->
  <!-- 战斗面板 begin -->
  <CombatPanel
    v-if="(currEnemy || (gameMain && gameMain.player.inCombat)) && !gameMain.auto.progress"
    :combatOpen="combatOpen"
    :currEnemy="currEnemy"
    :equipment="currShowEquipment"
    :getRarityLabel="getRarityLabel"
    :getRarityColor="getRarityColor"
    :dealFloatFixed="dealFloatFixed"
    @endBattle="handleEndBattle"
    @ignoreEndBattle="handleIgnoreEndBattle"
    @failedGame="handleFailedGame"
  />
  <CombatPanelAuto
    v-if="(currEnemy || (gameMain && gameMain.player.inCombat)) && (gameMain.auto.progress && !gameMain.playerDead)"
    :combatOpen="true"
    :currEnemy="currEnemy"
    :equipment="currShowEquipment"
    :getRarityLabel="getRarityLabel"
    :getRarityColor="getRarityColor"
    :dealFloatFixed="dealFloatFixed"
  />
  <!-- 战斗面板 end -->
  <!-- 升级面板 begin -->
  <LevelUpPanel
    v-if="levelUpOpen && !gameMain.auto.progress"
    :levelUpOpen="levelUpOpen"
  />
  <!-- 升级面板 end -->
  <!-- 背包 begin -->
  <MenuBackpack
    v-model:menuBackpackOpen="menuBackpackOpen"
    :isMobile="isMobile"
    :getRarityLabel="getRarityLabel"
    :getRarityColor="getRarityColor"
    :dealFloatFixed="dealFloatFixed"
    @equipOrUnequipEquipment="handleEquipOrUnequipEquipment"
    @handleEquipmentShow="handleEquipmentShow"
    @equipmentSale="handleShowSaleEquipment"
  />
  <!-- 背包 end -->
  <!-- 导入导出 begin -->
  <DataImportExport
    v-model:dataImportExportOpen="dataImportExportOpen"
    @importToInit="importToInit"
  />
  <!-- 导入导出 end -->
  <Toaster />
</template>