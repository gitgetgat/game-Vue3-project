<script lang="ts" setup>
import {
  // vue
  onMounted, ref, watchEffect, computed, nextTick, provide,
  // components
  Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
  Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue,
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogOverlay, AlertDialogTitle, AlertDialogDescription, AlertDialogCancel, AlertDialogFooter, AlertDialogAction,
  Button, Icon, ScrollArea, Accordion, AccordionContent, AccordionItem, AccordionTrigger,
  Label, Input, Switch, Skeleton, HoverCard, HoverCardContent, HoverCardTrigger,
  NumberField, NumberFieldContent, NumberFieldDecrement, NumberFieldIncrement, NumberFieldInput, VisuallyHidden,
  Toaster, X,
  // functions
  useColorMode, useToast,
  initialDungeonLoad, dungeonToggleStartPause, chestEvent, fleeBattle, engageBattle, endBattle, ignoreEvent, chooseNextroomEvent, playerLoadStats, equipmentIcon, equipmentStatsTransform, sellAll, nFormatter, randomizeNum, objectValidation, enterDungeon, calculateStats, startCombat, saveData, progressReset, equipOrUnEquipment, sellEquipment, unequipAll,
  // config
  equipmentRarityList, skillsDesc, prefixNames, names, skills,
} from '../lib/import'
import equipmentShow from './EquipmentShow.vue'
import saleEquipment from './SaleEquipment.vue'
import failedGameAlertDialog from './FailedGameAlertDialog.vue'
import AttributePanel from './AttributePanel.vue'
import CombatPanel from './CombatPanel.vue'
import LevelUpPanel from './LevelUpPanel.vue'
import dayjs from 'dayjs'

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
watchEffect(() => {
  mode.value = toggleState.value ? 'light' : 'dark'
})
const equipmentSelectVal = ref('All') // 背包-装备类型下拉筛选
const skillSelectVal = ref('Remnant Razor') // 背包-装备类型下拉筛选
const equipmentSelectItem = computed(() => equipmentCategoriesFilterList.find(e => e.value === equipmentSelectVal.value)) // 背包-装备类型下拉筛选选中项
const GameBeginSetConfigOpen = ref(false) // 初始配置菜单是否打开
const menuBackpackOpen = ref(false) // 背包是否打开
const equipmentShowOpen = ref(false) // 装备展示是否打开
const menuQuitOpen = ref(false) // 放弃本局是否打开
const levelUpOpen = ref(false) // 升级窗口是否打开
const saleEquipmentOpen = ref(false) // 出售装备是否打开
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

// 装备列表
const backEquipmentList = computed(() => {
  return gameMain.value.player.inventory.equipment.map(ele => {
    const equipment = JSON.parse(ele)
    return {
      raw: equipment,
      category: equipment.category,
      rarity: equipment.rarity,
      lvl: equipment.lvl,
      tier: equipment.tier,
      icon: equipmentIcon(equipment.category.value),
      stats: equipment.stats,
      value: equipment.value,
      statsTransform: equipmentStatsTransform(equipment.stats),
    }
  }).filter(ele => equipmentSelectVal.value === 'All' ? true : ele.rarity === equipmentSelectVal.value)
})

// 技能列表
const skillsList = ref(skills)

// 技能介绍列表
const skillsDescList = ref(skillsDesc)

// 属性分配
let allocation = ref({
  name: '',
  hp: 5,
  atk: 5,
  def: 5,
  atkSpd: 5
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


const getEquipmentStatsTransform = (val) => {
  return equipmentStatsTransform(val)
}
const getIcon = (val) => {
  return equipmentIcon(val)
}
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
  equipmentSelectVal.value = 'All'
  menuBackpackOpen.value = true
}

// 确认放弃按钮
const handleFailedGame = () => {
  clearInterval(gameMain.value.map.dungeonTimer);
  clearInterval(gameMain.value.player.playTimer);
  gameMain.value.player.inventory.equipment.length = 0;
  gameMain.value.player.equipped.length = 0;
  gameMain.value.player.gold = 0;
  progressReset(gameMain.value);
  localStorage.removeItem("gameMain");
  skillSelectVal.value = 'Remnant Razor'
  handleResetAttrPoints()

  menuQuitOpen.value = false
  GameBeginSetConfigOpen.value = false
  coverLoading.value = true
  gameMainLoading.value = false
  gameWindowLoading.value = false
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
  } else if (['treasure', 'equipment'].includes(gameMain.value.map.status.eventType)) {
    gameMain.value.map.action = 0;
    ignoreEvent(gameMain.value.map)
  }
}
// 出售所有装备
const handleSaleAllEquipment = () => {
  sellAll(gameMain.value, equipmentSelectVal.value)
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

// 卸下全部
const handleUnequipAll = () => {
  unequipAll(gameMain.value)
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
const handleGetEquipment = () => {
  const filterList = gameMain.value.map.backlog.filter(e => typeof e === 'object' && e.type === 'equipment')
  if (!filterList.length) {
    toast({
      title: '未获取到装备数据！',
      variant: 'warning',
    });
    handleIgnoreEvent()
  } else {
    const equipment = filterList[filterList.length - 1].raw
    gameMain.value.player.inventory.equipment.push(JSON.stringify(equipment))
    gameMain.value.map.status.eventType = ''
    gameMain.value.map.status.event = false;
  }

}

// 清空地图日志
const handleClearMapLog = () => {
  gameMain.value.map.backlog = gameMain.value.map.backlog.slice(-1)
}

// 关闭属性分配面板
const handleCloseAllocation = () => {
  GameBeginSetConfigOpen.value = false
  skillSelectVal.value = 'Remnant Razor'
  handleResetAttrPoints()
}

// 重置属性分配
const handleResetAttrPoints = () => {
  allocation.value.name = ''
  allocation.value.hp = 5
  allocation.value.atk = 5
  allocation.value.def = 5
  allocation.value.atkSpd = 5
}

// 随机名称
const handleRandomName = () => {
  console.log(prefixNames[randomizeNum(0, prefixNames.length - 1)] + names[randomizeNum(0, names.length - 1)]);
  allocation.value.name = prefixNames[randomizeNum(0, prefixNames.length - 1)] + names[randomizeNum(0, names.length - 1)]
}
// 应用属性分配
const handleApplyAllocation = () => {
  if (!validateName()) return
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

// 显示小数
const dealFloatFixed = (val, fixed = 2) => {
  return parseFloat(val.toFixed(fixed))
}

// 初始化游戏
const initGame = () => {
  if (localStorage.getItem("gameMain")) {
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
      if (menuBackpackOpen.value) {
        gameMain.value.map.status.exploring = false;
        gameMain.value.inventoryOpen = true;
      } else {
        gameMain.value.inventoryOpen = false;
        if (!gameMain.value.map.status.paused) {
          gameMain.value.map.status.exploring = true;
        }
      }
    })

  } else {
    GameBeginSetConfigOpen.value = false
    coverLoading.value = true
    gameMainLoading.value = false
    gameWindowLoading.value = false
  }
  watchEffect(() => {
    if (gameMain.value.player.selectedStats && gameMain.value.player.selectedStats.length > 0) {
      nextTick(() => {
        console.log('asdasdasasd', gameMain.value.player.selectedStats.length);
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

// 计算属性，判断是否为移动端
const isMobile = computed(() => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
});

onMounted(() => {
  mode.value = 'dark'
  initGame()


  // console.log('gameMain', gameMain);
})

</script>

<template>
  <div
    v-if="coverLoading"
    class="flex flex-col space-y-3 p-3 h-screen cursor-pointer"
    @click="GameBeginSetConfigOpen = true"
  >
    <div class="mx-auto w-fit my-auto">
      <svg
        class="mx-auto pb-6"
        xmlns="http://www.w3.org/2000/svg"
        width="6em"
        height="6em"
        viewBox="0 0 512 512"
      >
        <path
          fill="currentColor"
          d="m220.7 25l21.9 62h23.3l24.8-62zm86.9 6.35l-17.3 43.26c25.2 4.97 51.4 14.79 74.1 27.59c16.7 9.3 31.4 20.3 42.3 32.6c6.9 7.8 12.4 16.2 15.4 25.2h45.5c-2.6-7.2-6.6-15.6-12.2-24.4c-10.4-16.4-25.9-34.3-45.2-50.74c-27.5-23.33-62.6-43.66-102.6-53.51m-103.7.13c-39.8 9.9-74.8 30.16-102.1 53.38c-19.32 16.44-34.77 34.34-45.21 50.74c-7.51 11.8-12.18 22.8-14.26 31.4h45.62c2.26-11.6 8.62-22.4 17.35-32.2c10.9-12.3 25.6-23.3 42.3-32.6c21.9-12.38 47.2-21.99 71.7-27.1zm79.5 60.25l-5.2 12.97c3.9 3 8 5.7 12.4 8.3c-21.6 8.7-48.2 18.1-69.3 15.1c.1-12.3-4.4-22.7-10.2-32.41q-9 2.43-18 5.61c6.6 11 11.9 22.5 10.2 32.2c-8.2 20-25.4 26.8-39 37.5c4.7-18.7 1.8-39.7-4.3-55.2c-1.2.7-2.4 1.3-3.6 2c-4 2.3-7.9 4.7-11.6 7.1c6.1 14.1 6.3 26.5 2.9 39.1c-7.8 23.5-22.1 39.6-37.8 55.3l-4.9 7.4v22.8c6.6-6.7 14.5-14.5 22.8-22.2c23 10.2 37.3 21.3 50.1 40.3c-25.1 18-49.1 37-72.9 56.2v23.1c56.6-45.8 113.2-90.6 181-124.2c70.3 29.6 109.9 69.4 121 121v-48.1c-7.6-12.9-17.3-24.9-28.9-36c-3.9-13.3-1.2-22.9 6.4-32.8c4.2-5.5 10.2-10.8 17.4-16l-10.1-15c-8.5 6-15.8 12.5-21.6 20c-6.1 8-10.1 17.4-11.2 27.5c-14.9-11.3-32.1-21.5-51.5-30.7c24.1-10.7 49.8-20 77.3-27.4l-10.5-15.8q-13.95 3.9-27.3 8.4c-7.4-17.4-14.1-33.8-14.6-52.2c10.1-1 19.8-3.2 29.7-3.9c-2.1-1.4-4.3-2.6-6.5-3.9c-6.8-3.8-14.1-7.4-21.6-10.6c-3.2.5-6.5 1-9.7 1.5c-12.6-4.4-22.3-9.06-31-14.92c-3.3-.78-6.6-1.46-9.9-2.05m31.2 36.87c.8 15.7 5.2 29.9 10.4 43.2l-33-8.2l2.8-31.2c5.6-1.2 12.5-2.5 19.8-3.8m-38.4 9.1l-2.4 26.6c-15.1 3-34.1 5.2-48.8 16.6c-7.2-7.1-15.3-11-24.2-13.2c7.1-6.1 13.5-13.2 17.3-22c19.8 3.3 39.3-1.3 58.1-8M401.6 178l20 30H476l20-30zM284 181.8c12.4.1 24.5 2.5 34.1 6.7c-34.8 14-66.6 31-96.4 49.6c-2.3-41 30.8-56.4 62.3-56.3M178.2 183c12.2.7 26.2 2 34.4 10.7c-11.2 16.2-9.9 38.1-7.9 55.5c-4.1 2.7-8.2 5.4-12.2 8.1c-13.3-19.4-29.1-32.6-50.6-43.2c9.6-8.7 19-16.9 26.4-23.2c3.9-3.3 7.3-6 9.9-7.9m-161.38 2l20 30h54.36l20.02-30zM425 226v213h46V226zm-384 7v206h46V233zM25 457v30h78v-30zm384 0v30h78v-30z"
        />
      </svg>
      <div class="text-4xl pb-60">随机地牢爬行者</div>
      <div class="text-center animate-flash">点击开始探索之旅！</div>
    </div>
  </div>
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
                @click="handleOpenBackpackCfg"
              />
            </TooltipTrigger>
            <TooltipContent>
              <p>背包</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <AlertDialog v-model:open="menuBackpackOpen">
          <AlertDialogOverlay class="fixed inset-0 z-[50] bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <AlertDialogContent
            class="w-fit"
            @escapeKeyDown.prevent
            @closeAutoFocus.prevent
          >
            <AlertDialogHeader>
              <AlertDialogTitle>背包</AlertDialogTitle>
              <VisuallyHidden>
                <AlertDialogDescription></AlertDialogDescription>
              </VisuallyHidden>
            </AlertDialogHeader>
            <div class="flex flex-col items-center space-x-2">
              <div class="flex items-center">
                <div
                  class="text-center px-4 cursor-pointer border rounded-lg hover:bg-[hsl(var(--foreground))] hover:text-[hsl(var(--background))] hover:transition-all  mx-0 min-w-fit py-1 text-base flex  flex-col items-center"
                  @click="handleSaleAllEquipment"
                >
                  <Icon
                    icon="hugeicons:sale-tag-01"
                    class="!size-6 mr-1"
                  />
                  <div class="">出售
                  </div>
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
                class="flex items-center text-sm leading-6 hover:bg-white/20 rounded-md py-1 cursor-pointer"
                v-for="equipment in backEquipmentList"
                :style="`color:${getRarityColor(equipment.rarity)}`"
                @click="handleEquipmentShow(equipment)"
              >
                <span
                  v-html="
                equipment.icon"
                  class="mr-1"
                ></span>
                <span>{{ getRarityLabel(equipment.rarity) }}的{{ equipment.category.label }}</span>
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
                          @click="handleUnequipAll"
                        />
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <p>卸下全部装备</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </CardTitle>
              </CardHeader>
              <CardContent
                v-if="gameMain.player.equipped.length"
                class="grid grid-cols-3 gap-4 px-4 pb-4"
              >
                <HoverCard
                  v-for="equipment in gameMain.player.equipped"
                  :key="equipment.id"
                >
                  <HoverCardTrigger as-child>
                    <div
                      class="text-center py-2 border rounded-lg cursor-pointer"
                      :style="`color:${getRarityColor(equipment.rarity)};border-color:${getRarityColor(equipment.rarity)}`"
                      @click="handleEquipmentShow(equipment,true,true)"
                    >
                      <span v-html="getIcon(equipment.category.value)"></span>
                    </div>
                  </HoverCardTrigger>
                  <HoverCardContent
                    class="w-fit"
                    v-if="!isMobile"
                  >
                    <div
                      class="flex flex-col"
                      v-if="equipment"
                    >
                      <div
                        class="text-lg mb-2"
                        :style="`color:${getRarityColor(equipment.rarity)}`"
                      >
                        <span
                          v-html="equipment.icon"
                          class="mr-1"
                        ></span>
                        <span>{{ getRarityLabel(equipment.rarity) }}的{{ equipment.category.label }}</span>
                      </div>
                      <p class="mx-1 text-xs font-bold">等级 {{ equipment.lvl }} 品阶 {{ equipment.tier }}</p>
                      <p
                        class="mx-1 text-sm"
                        v-for="stat in getEquipmentStatsTransform(equipment.stats)"
                      >
                        {{ stat.label }}+{{ ["critRate","critDmg","atkSpd","vamp"].includes(stat.key)?dealFloatFixed(stat.value):stat.value }}{{ stat.unit }}
                      </p>
                      <div class="flex my-2">
                        <Button
                          variant="outline"
                          class="hover:bg-[hsl(var(--foreground))] hover:text-[hsl(var(--background))] hover:transition-all text-base border-white mr-2"
                          @click="handleEquipOrUnequipEquipment('unequip',equipment.id)"
                        >
                          脱下
                        </Button>
                        <Button
                          variant="outline"
                          class="text-[#fde047] hover:bg-[hsl(var(--foreground))] hover:text-[hsl(var(--background))] hover:transition-all text-base border-white mr-2"
                          @click="handleShowSaleEquipment(equipment.id,'hover')"
                        >
                          <svg
                            class="inline-block"
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                          >
                            <path
                              fill="currentColor"
                              d="m1 22l1.5-5h7l1.5 5zm12 0l1.5-5h7l1.5 5zm-7-7l1.5-5h7l1.5 5zm17-8.95l-3.86 1.09L18.05 11l-1.09-3.86l-3.86-1.09l3.86-1.09l1.09-3.86l1.09 3.86z"
                            />
                          </svg><span>{{ equipment.value }}</span>
                        </Button>
                      </div>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              </CardContent>
              <CardContent
                v-else
                class="text-center text-sm"
              >未装备</CardContent>
            </Card>
            <div
              @click="()=> menuBackpackOpen = false"
              class="absolute right-4 top-4 cursor-pointer rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
            >
              <X class="w-4 h-4" />
            </div>
          </AlertDialogContent>
        </AlertDialog>
      </p>
      <p class="grow-0 top-panel-menu-button hover-button">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger as="Icon">
              <Icon
                icon="fluent:list-rtl-16-filled"
                class="!size-6 border-none"
                @click="menuCfgOpen = true"
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
    <ScrollArea class="flex-1 mb-2 rounded-lg border p-4 relative">
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
          v-if="['equipment'].includes(gameMain.map.status.eventType)"
          variant="outline"
          class="hover:bg-[hsl(var(--foreground))] hover:text-[hsl(var(--background))] hover:transition-all text-base border-white"
          @click="handleGetEquipment"
        >
          领取
        </Button>
        <Button
          v-if="['treasure','nextroom','equipment'].includes(gameMain.map.status.eventType)"
          variant="outline"
          class="hover:bg-[hsl(var(--foreground))] hover:text-[hsl(var(--background))] hover:transition-all text-base border-white"
          @click="handleIgnoreEvent"
        >
          忽略
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
    :saleEquipmentOpen="saleEquipmentOpen"
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
  <CombatPanel
    v-if="currEnemy || gameMain.player.inCombat"
    :combatOpen="combatOpen"
    :currEnemy="currEnemy"
    :equipment="currShowEquipment"
    :getRarityLabel="getRarityLabel"
    :getRarityColor="getRarityColor"
    :dealFloatFixed="dealFloatFixed"
    @endBattle="handleEndBattle"
    @ignoreEndBattle="handleIgnoreEndBattle"
    @failedGame="handleFailedGame"
  ></CombatPanel>
  <LevelUpPanel
    v-if="levelUpOpen"
    :levelUpOpen="levelUpOpen"
  ></LevelUpPanel>
  <Toaster />
</template>