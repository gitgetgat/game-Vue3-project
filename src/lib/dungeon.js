import { generateRandomEnemy } from "./enemy.js";
import { createEquipmentPrint } from "./equipment.js";
import { nFormatter, randomizeNum, randomizeDecimal, saveData } from "./utils.js";
import { playerLoadStats } from "./player.js"
import { startCombat, addCombatLog, recyClingAllCombatEquipments } from "./combat.js"
import { percentages } from "../config/player.js"
import { useToast } from '@/components/ui/toast/use-toast'
const { toast } = useToast()
const generateBasicMap = () => {
  return {
    name: "Basic Map", // 地图名称
    parent: "Parent Map", // 父级地图名称
    rating: 500,
    grade: "E",
    progress: { // 地图进程
      floor: 1, // 层数
      room: 1, // 房间数
      floorLimit: 100, // 层数限制
      roomLimit: 5, // 每层房间数限制
    },
    settings: {
      enemyBaseLvl: 1, // 怪物基础等级
      enemyLvlGap: 5, // 地图怪物等级差距
      enemyBaseStats: 1, //
      enemyScaling: 1.1, // 地图怪物战力膨胀系数
    },
    status: {
      exploring: false, // 是否搜索状态
      paused: true, // 是否暂停状态
      event: false, // 是否处于交互状态
      eventType: '', // 是否处于交互状态
    },
    statistics: {
      kills: 0, // 怪物击杀数
      runtime: 0, // 地图探索时间
    },
    backlog: [], // 日志输出列表
    enemyBattleList: [], // 敌人战斗列表
    action: 0, // 步数
    actionLimit: 10, // 周期性步数，限制随机行为
    dungeonAction: "", // 地图是否行动文本
    dungeonActivity: "", // 地图是否暂停文本
    dungeonTimer: null, // 地图时间循环器
    dungeonEnentTime: 1000, // 地图时间循环器时间
  };
}


// 地图事件生成
const dungeonEvent = (gameMain) => {
  // console.log('gameMain.auto', gameMain.auto);
  const { map, player } = gameMain;
  if (map.status.exploring && !map.status.event) {
    map.action++;
    let choices;
    let eventRoll;
    let eventTypes = ["blessing", "curse", "treasure", "enemy", "enemy", "nothing", "nothing", "nothing", "nothing", "monarch"];
    if (map.action > 2 && map.action < 6) {
      eventTypes.push("nextroom");
    } else if (map.action > 5) {
      eventTypes = ["nextroom"];
    }
    const event = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    console.log('event', event);

    switch (event) {
      case "nextroom":// 房间
        map.status.event = true;
        if (gameMain.auto.progress && map.progress.floor >= gameMain.auto.floorLimit && map.progress.room == map.progress.roomLimit) {
          map.progress.room = 1
        }
        if (map.progress.room == map.progress.roomLimit) {
          addDungeonLog(map, '找到了 BOOS 房间的门');
        } else {
          addDungeonLog(map, '找到了普通房间的门');
        }
        if (gameMain.auto.progress) {
          setTimeout(() => {
            chooseNextroomEvent(gameMain)
          }, 1000);
        } else {
          gameMain.map.status.eventType = 'nextroom'
        }
        break;
      case "treasure":// 宝箱
        map.status.event = true;
        addDungeonLog(map, `你发现了一个宝库。里面有一个宝箱。`);
        if (gameMain.auto.progress) {
          if (gameMain.auto.chest) {
            chestEvent(gameMain);
          } else {
            setTimeout(() => {
              map.status.event = false;
              gameMain.map.status.eventType = ''
            }, 3000);
          }
        } else {
          gameMain.map.status.eventType = 'treasure'
        }
        break;
      case "nothing":// 无事发生
        gameMain.map.status.eventType = ''
        nothingEvent(map);
        break;
      case "enemy":// 敌人
        map.status.event = true;
        const enemy = generateRandomEnemy(undefined, map);
        // console.log('enemy', enemy);
        map.enemyBattleList.push(enemy);
        addDungeonLog(map, `你遭遇了 ${enemy.name}。`);
        if (gameMain.auto.progress) {
          setTimeout(() => {
            gameMain.combat.enemyCurrId = 0
            engageBattle(gameMain)
          }, 1000);
        } else {
          gameMain.map.status.eventType = 'enemy'
        }
        break;
      case "blessing":// 祝福
        eventRoll = randomizeNum(1, 2);
        if (eventRoll == 1) {
          map.status.event = true;
          blessingValidation(player);
          let cost = getBlessingCost(player);
          addDungeonLog(map, `<span style="color:#fde047">您发现了一座祝福神龛。您是否想奉献</span> <svg style="color:#fde047" class="inline-block mx-2" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="m1 22l1.5-5h7l1.5 5zm12 0l1.5-5h7l1.5 5zm-7-7l1.5-5h7l1.5 5zm17-8.95l-3.86 1.09L18.05 11l-1.09-3.86l-3.86-1.09l3.86-1.09l1.09-3.86l1.09 3.86z" /></svg>${nFormatter(cost)} <span style="color:#fde047">以获得祝福？(祝福 Lv.${player.blessing})</span>`);
          if (gameMain.auto.progress) {
            if (gameMain.auto.blessingY) {
              offerBlessingEvent(gameMain);
            } else {
              setTimeout(() => {
                ignoreEvent(map)
              }, 1000);
            }
          } else {
            gameMain.map.status.eventType = 'blessing'
          }
        } else {
          map.status.event = false;
          gameMain.map.status.eventType = ''
          nothingEvent(map);
        }
        break;
      case "curse":// 诅咒
        eventRoll = randomizeNum(1, 3);
        if (eventRoll == 1) {
          map.status.event = true;
          let curseLvl = Math.round((map.settings.enemyScaling - 1) * 10);
          let cost = curseLvl * (10000 * (curseLvl * 0.5)) + 5000;
          addDungeonLog(map, `<span style="color:#e30b5c">您发现了一座诅咒神龛。您是否想奉献</span> <svg style="color:#fde047" class="inline-block mx-2" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="m1 22l1.5-5h7l1.5 5zm12 0l1.5-5h7l1.5 5zm-7-7l1.5-5h7l1.5 5zm17-8.95l-3.86 1.09L18.05 11l-1.09-3.86l-3.86-1.09l3.86-1.09l1.09-3.86l1.09 3.86z" /></svg>${nFormatter(cost)} <span style="color:#e30b5c">以获得诅咒？这将增强怪物的力量，同时也会提高战利品的质量。(诅咒 Lv.${curseLvl})</span>`);
          if (gameMain.auto.progress) {
            if (gameMain.auto.blessingN) {
              offerCurseEvent(gameMain);
            } else {
              setTimeout(() => {
                ignoreEvent(map)
              }, 1000);
            }
          } else {
            gameMain.map.status.eventType = 'curse'
          }
        } else {
          map.status.event = false;
          gameMain.map.status.eventType = ''
          nothingEvent(map);
        }
        break;
      case "monarch":// 超级精英怪
        eventRoll = randomizeNum(1, 7);
        if (eventRoll == 1) {
          map.status.event = true;
          addDungeonLog(map, `<span style="color:#e30b5c">你发现了一个神秘的房间。好像有什么东西在里面睡觉。</span>`);
          if (gameMain.auto.progress) {
            if (gameMain.auto.specialBossCombat) {
              specialBossBattle(gameMain);
            } else {
              setTimeout(() => {
                ignoreEvent(map)
              }, 3000);
            }
          } else {
            gameMain.map.status.eventType = 'monarch'
          }
        } else {
          map.status.event = false;
          gameMain.map.status.eventType = ''
          nothingEvent(map);
        }
    }
  }
}

// 创建初始地图
const initialDungeonLoad = (gameMain) => {
  let map = null
  if (gameMain.map) {
    // gameMain.map = JSON.parse(localStorage.getItem("mapData"));
    // gameMain.map.status = {
    //   exploring: false,
    //   paused: true,
    //   event: false,
    // };
    // updateDungeonLog();
  } else {
    map = generateBasicMap();
    gameMain.map = map;
  }
  loadDungeonProgress(gameMain.map);

  gameMain.map.dungeonAction = "休息中";
  gameMain.map.dungeonActivity = "探索";
  gameMain.map.dungeonTimer = setInterval(() => {
    dungeonEvent(gameMain)
    mapLogScorllAuto()
    combatLogScorllAuto()
  }, gameMain.map.dungeonEnentTime);
  // 玩家同时只能刷一个地图
  if (gameMain.player) gameMain.player.playTimer = setInterval(() => {
    dungeonCounter(gameMain)
  }, 1000);
  return map
}



// Start the game
export const enterDungeon = (gameMain) => {
  const { player } = gameMain;
  // if (player.inCombat) {
  //   startCombat(gameMain);
  // } else {
  // }
  if (player.stats.hp == 0) {
    progressReset(gameMain);
  }
  initialDungeonLoad(gameMain);
  playerLoadStats(gameMain);
}


// Resets the progress back to start
export const progressReset = (gameMain) => {
  gameMain.player.stats.hp = gameMain.player.stats.hpMax;
  gameMain.player.lvl = 1;
  gameMain.player.blessing = 1;
  gameMain.player.rerolls = 2;
  gameMain.player.exp = {
    expCurr: 0,
    expMax: 100,
    expCurrLvl: 0,
    expMaxLvl: 100,
    lvlGained: 0
  };
  gameMain.player.bonusStats = {
    hp: 0,
    atk: 0,
    def: 0,
    atkSpd: 0,
    vamp: 0,
    critRate: 0,
    critDmg: 0
  };
  gameMain.player.skills = [];
  gameMain.player.selectedStats = [];
  gameMain.player.inCombat = false;
  gameMain.map.enemyBattleList.length = 0;
  gameMain.map.progress.floor = 1;
  gameMain.map.progress.room = 1;
  gameMain.map.statistics.kills = 0;
  gameMain.map.backlog.length = 0;
  gameMain.map.action = 0;
  gameMain.map.statistics.runtime = 0;
  gameMain.map.status = {
    event: false,
    eventType: '',
    exploring: false,
    paused: true,
  };
  gameMain.map.settings = {
    enemyBaseLvl: 1,
    enemyLvlGap: 5,
    enemyBaseStats: 1,
    enemyScaling: 1.1,
  };
  delete gameMain.map.enemyMultipliers;
  delete gameMain.player.allocated;
  gameMain.playerDead = false;
  gameMain.combat = {
    combatSeconds: 0,
    combatTimer: null,
    enemyCurrId: -1,
    combatBacklog: [],
    combatLoot: [],
  }
  saveData(gameMain);
}

// 启动和暂停地图状态
const dungeonToggleStartPause = (gameMain) => {
  if (gameMain.playerDead) return
  dungeonStartPause(gameMain)
}

// 启动和暂停地图状态
const dungeonStartPause = (gameMain) => {
  const { map } = gameMain;
  if (!map.status.paused) {
    map.dungeonAction = "休息中";
    map.dungeonActivity = "探索";
    map.status.exploring = false;
    map.status.paused = true;
    map.status.event = false
    map.status.eventType = ''
  } else {
    map.dungeonAction = "探索中";
    map.dungeonActivity = "休息";
    map.status.exploring = true;
    map.status.paused = false;
    if (!map.status.eventType) {
      map.status.event = false
    } else {
      map.status.event = true
    }
  }
}

// 计算当前运行的总时间和总游戏时间
const dungeonCounter = (gameMain) => {
  gameMain.player.playtime++;
  gameMain.map.statistics.runtime++;
  gameMain.dungeonTime += 1000;
  saveData(gameMain)
}

// 加载楼层和房间数量
const loadDungeonProgress = (map) => {
  if (map.progress.room > map.progress.roomLimit) {
    map.progress.room = 1;
    map.progress.floor++;
  }
}

// 相应增加房间或楼层
const incrementRoom = (map) => {
  map.progress.room++;
  map.action = 0;
  loadDungeonProgress(map);
}

// 增加玩家总祝福
const blessingUp = (player) => {
  blessingValidation(player);
  player.blessing++;
}

// 验证祝福是否存在
const blessingValidation = (player) => {
  if (player.blessing == undefined) {
    player.blessing = 1;
  }
}

// 添加打印日志到记录
const addDungeonLog = (map, message) => {
  console.log('backlog new message:', message);
  if (map.backlog.length >= 100) map.backlog.slice(-1)
  map.backlog.push(message);
  // updateDungeonLog(choices);
}

// ========= 地图可选择的事件 ==========
// 选择进入房间时间
const chooseNextroomEvent = (gameMain) => {
  const { map } = gameMain;
  let eventRoll
  // sfxConfirm.play();
  if (map.progress.room == map.progress.roomLimit) {
    // 房间探索达到上限则开始守护本层 BOOS 战
    guardianBattle(gameMain);
  } else {
    eventRoll = randomizeNum(1, 3);
    if (eventRoll == 1) {
      incrementRoom(map);
      mimicBattle("door", gameMain);
      // addDungeonLog(map, "您已移至下一个房间。");
      // setTimeout(() => {
      //   map.status.event = false;
      //   map.action = 0;
      // }, 2000);
    } else if (eventRoll == 2) {
      incrementRoom(map);
      map.status.eventType = 'treasure'
      addDungeonLog(map, `你移至下一个房间并发现了一个宝藏室。里面有一个宝箱。`);
      if (gameMain.auto.progress) {
        setTimeout(() => {
          chestEvent(gameMain)
        }, 1000);
      }

    } else {
      map.status.event = false;
      map.status.eventType = ''
      incrementRoom(map);
      addDungeonLog(map, "您已移至下一个房间。");
    }
  }
}

// 模仿怪战斗事件
const mimicBattle = (type, gameMain) => {
  const { map } = gameMain;
  const enemy = generateRandomEnemy(type, map);
  console.log('enemy', enemy);
  map.enemyBattleList.push(enemy);
  // showCombatInfo();
  gameMain.map.status.event = true;
  gameMain.map.status.eventType = "enemy"
  addDungeonLog(map, `你遭遇了 ${enemy.name}。`);
  if (gameMain.auto.progress) {
    setTimeout(() => {
      gameMain.combat.enemyCurrId = 0
      engageBattle(gameMain)
    }, 1000);
  }
  // startCombat(gameMain);
  // addCombatLog(gameMain, `你遭遇了 ${enemy.name}.`);
}

// 守护者首领之战
const guardianBattle = (gameMain) => {
  const { map } = gameMain;
  incrementRoom(map);
  const enemy = generateRandomEnemy("guardian", map);
  console.log('enemy', enemy);
  map.enemyBattleList.push(enemy);
  gameMain.map.status.event = true;
  gameMain.map.status.eventType = 'enemy'
  addDungeonLog(map, `你遭遇了 ${enemy.name}。`);
  // showCombatInfo();
  // startCombat(gameMain, () => { addDungeonLog(map, "你进入了下一层。"); });
  addCombatLog(gameMain, `地牢守护者 ${enemy.name} 挡住了你的去路。`);
  if (gameMain.auto.progress) {
    setTimeout(() => {
      gameMain.combat.enemyCurrId = 0
      engageBattle(gameMain)
    }, 1000);
  }
}


// 守护者首领之战
const specialBossBattle = (gameMain) => {
  const { map } = gameMain;
  const enemy = generateRandomEnemy("sboss", map);
  console.log('enemy', enemy);
  map.enemyBattleList.push(enemy);
  gameMain.map.status.event = true;
  gameMain.map.status.eventType = 'enemy'
  addDungeonLog(map, `<span style="color:#e30b5c">地牢守护者 ${enemy.name} 醒来了。</span>`);
  // startCombat(gameMain);
  addCombatLog(gameMain, `<span style="color:#e30b5c">地牢守护者 ${enemy.name} 醒来了。</span>`);
  if (gameMain.auto.progress) {
    setTimeout(() => {
      gameMain.combat.enemyCurrId = 0
      engageBattle(gameMain)
    }, 1000);
  }
}

// 开始战斗
const engageBattle = (gameMain) => {
  let enemy = null
  if (gameMain.map.enemyBattleList.length > gameMain.combat.enemyCurrId) {
    enemy = gameMain.map.enemyBattleList[gameMain.combat.enemyCurrId]
  }
  console.log('engageBattle enemy', enemy);
  if (!enemy) return
  // showCombatInfo();
  startCombat(gameMain);
  addCombatLog(gameMain, `你遭遇了 ${enemy.name}.`);
  // updateDungeonLog();
}

// 结束战斗
const endBattle = (gameMain) => {
  gameMain.map.status.event = false;
  gameMain.enemyDead = false;
  gameMain.combat.enemyCurrId = -1;
  gameMain.combat.combatBacklog.length = 0;
  gameMain.combat.combatLoot.length = 0;
  gameMain.map.enemyBattleList.length = 0;
  gameMain.map.status.eventType = ''
}

// 回避战斗
const fleeBattle = (gameMain) => {
  const { player, map } = gameMain
  let eventRoll = randomizeNum(1, 2);
  if (eventRoll == 1) {
    // sfxConfirm.play();
    addDungeonLog(map, `你成功逃脱了。`);
    player.inCombat = false;
    map.status.event = false;
    gameMain.map.status.eventType = ''
  } else {
    let enemy = null
    if (gameMain.map.enemyBattleList.length > gameMain.combat.enemyCurrId) {
      enemy = gameMain.map.enemyBattleList[gameMain.combat.enemyCurrId]
    }
    if (!enemy) return
    addDungeonLog(map, `你逃脱失败了！`);
    addCombatLog(gameMain, `你遭遇了 ${enemy.name}.`);
    // showCombatInfo();
    startCombat(gameMain);
  }
}

// 宝箱事件随机器
const chestEvent = (gameMain) => {
  const { map } = gameMain
  // sfxConfirm.play();
  let eventRoll = randomizeNum(1, 4);
  if (eventRoll == 1) {
    mimicBattle("chest", gameMain);
  } else if (eventRoll == 2) {
    if (map.progress.floor == 1) {
      goldDrop(gameMain);
      map.status.event = false;
      gameMain.map.status.eventType = ''
    } else {
      createEquipmentPrint("dungeon", gameMain);
      gameMain.map.status.event = true;
      gameMain.map.status.eventType = 'equipment'
      if (gameMain.auto.progress) {
        setTimeout(() => {
          getMapEquipment(gameMain, toast)
        }, 1000);
      }
    }
  } else if (eventRoll == 3) {
    goldDrop(gameMain);
    map.status.event = false;
    gameMain.map.status.eventType = ''
  } else {
    addDungeonLog(map, "宝箱是空的。");
    map.status.event = false;
    gameMain.map.status.eventType = ''
  }
}

// 获取探索地图时得到的装备
const getMapEquipment = (gameMain, toastCallback) => {
  const filterList = gameMain.map.backlog.filter(e => typeof e === 'object' && e.type === 'equipment')
  if (!filterList.length) {
    toastCallback && toastCallback({
      title: '未获取到装备数据！',
      variant: 'warning',
    });
    handleIgnoreEvent()
  } else {
    const equipment = filterList[filterList.length - 1].raw
    gameMain.player.inventory.equipment.push(JSON.stringify(equipment))
    gameMain.map.status.eventType = ''
    gameMain.map.status.event = false;
  }
}

// Calculates Gold Drop
const goldDrop = (gameMain) => {
  const { map, player } = gameMain;
  let goldValue = randomizeNum(50, 500) * map.progress.floor;
  addDungeonLog(map, `你找到了<svg style="color:#fde047" class="inline-block mx-2" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="m1 22l1.5-5h7l1.5 5zm12 0l1.5-5h7l1.5 5zm-7-7l1.5-5h7l1.5 5zm17-8.95l-3.86 1.09L18.05 11l-1.09-3.86l-3.86-1.09l3.86-1.09l1.09-3.86l1.09 3.86z" /></svg><span class="mr-2" style="color:#fde047">${nFormatter(goldValue)}</span>黄金.`);
  player.gold += goldValue;
  playerLoadStats(gameMain);
}

// 获取诅咒神龛
const offerCurseEvent = (gameMain) => {
  const { player, map } = gameMain
  let curseLvl = Math.round((map.settings.enemyScaling - 1) * 10);
  let cost = curseLvl * (10000 * (curseLvl * 0.5)) + 5000;
  if (player.gold < cost) {
    addDungeonLog(map, "你的金币不够。");
  } else {
    player.gold -= cost;
    cursedTotem(gameMain);
  }
  map.status.event = false;
  gameMain.map.status.eventType = ''
}
// 叠加诅咒buff，增加怪物战力膨胀系数
const cursedTotem = (gameMain) => {
  const { map } = gameMain
  const curseLvl = Math.round((map.settings.enemyScaling - 1) * 10)
  map.settings.enemyScaling += 0.1;
  addDungeonLog(map, `<span style="color:#e30b5c">地下城中的怪物变得更强，战利品质量也提高了. (诅咒 Lv.${curseLvl} > 诅咒 Lv.${curseLvl + 1})</span>`);
  saveData(gameMain);
}
// 计算祝福升级需要的金钱
const getBlessingCost = (player) => {
  return player.blessing * (500 * (player.blessing * 0.5)) + 750;
}
// 获取祝福神龛
const offerBlessingEvent = (gameMain) => {
  const { player, map } = gameMain
  let cost = getBlessingCost(player);
  if (player.gold < cost) {
    addDungeonLog(map, "你的金币不够。");
  } else {
    player.gold -= cost;
    statBlessing(gameMain);
  }
  map.status.event = false;
  gameMain.map.status.eventType = ''
}


// 升级随机祝福buff
const statBlessing = (gameMain) => {
  const { player, map } = gameMain
  // sfxBuff.play();
  let stats = ["hp", "atk", "def", "atkSpd", "vamp", "critRate", "critDmg"];
  let buff = stats[Math.floor(Math.random() * stats.length)];
  let value;
  player.bonusStats[buff] += percentages[buff].value
  // switch (buff) {
  //   case "hp":
  //     value = 10;
  //     player.bonusStats.hp += value;
  //     break;
  //   case "atk":
  //     value = 8;
  //     player.bonusStats.atk += value;
  //     break;
  //   case "def":
  //     value = 8;
  //     player.bonusStats.def += value;
  //     break;
  //   case "atkSpd":
  //     value = 3;
  //     player.bonusStats.atkSpd += value;
  //     break;
  //   case "vamp":
  //     value = 0.5;
  //     player.bonusStats.vamp += value;
  //     break;
  //   case "critRate":
  //     value = 1;
  //     player.bonusStats.critRate += value;
  //     break;
  //   case "critDmg":
  //     value = 6;
  //     player.bonusStats.critDmg += value;
  //     break;
  // }
  addDungeonLog(map, `你从祝福中获得 ${percentages[buff].value}% 的额外 ${percentages[buff].label}。 (祝福等级 Lv.${player.blessing} > 祝福等级 Lv.${player.blessing + 1})`);
  blessingUp(player);
  playerLoadStats(gameMain);
  saveData(gameMain);
}


// ========= 非选择地图事件消息 ==========
// 不发生任何事的随机事件
const nothingEvent = (map) => {
  let message = ""
  let eventRoll = randomizeNum(1, 5);
  if (eventRoll == 1) {
    message = "您探索过了，但一无所获。"
  } else if (eventRoll == 2) {
    message = "你发现了一个空箱子。";
  } else if (eventRoll == 3) {
    message = "你发现了一具怪物的尸体。";
  } else if (eventRoll == 4) {
    message = "你发现了一具尸体。";
  } else if (eventRoll == 5) {
    message = "这个区域什么也没有。";
  }
  addDungeonLog(map, message);
}

// 忽略事件并继续探索
const ignoreEvent = (map) => {
  // sfxConfirm.play();
  map.status.event = false;
  map.status.eventType = ''
  addDungeonLog(map, "你忽略了它并决定继续前进。");
}

// 打开仓库
const openInventory = (gameMain) => {
  gameMain.map.status.exploring = false;
  gameMain.inventoryOpen = true;
}

// 关闭仓库
const closeInventory = (gameMain) => {
  gameMain.inventoryOpen = false;
  if (!gameMain.map.status.paused) {
    gameMain.map.status.exploring = true;
  }
}

// 如果库存未打开且游戏未暂停，则继续探索
const continueExploring = (gameMain) => {
  if (!gameMain.inventoryOpen && !gameMain.map.status.paused) {
    gameMain.map.status.exploring = true;
  }
}

// 地图日志自动滚动
const mapLogScorllAuto = () => {
  const parentNode = document.querySelector("#mapLog")
  if (parentNode && !parentNode.classList.contains('hover-scroll')) {
    const mapLog = Array.from(parentNode.children).find(e => e.tagName === 'DIV');
    mapLog.scrollTop = mapLog.scrollHeight;
  }
}

// 战斗日志自动滚动
const combatLogScorllAuto = () => {
  const parentNode = document.querySelector("#combatLog")
  if (parentNode && !parentNode.classList.contains('hover-scroll')) {
    const combatLog = Array.from(parentNode.children).find(e => e.tagName === 'DIV');
    combatLog.scrollTop = combatLog.scrollHeight;
  }
}

// Export and Import Save Data
const exportData = (gameMain) => {
  const exportedData = btoa(JSON.stringify(gameMain));
  return exportedData;
}

const importData = (importedData, errorCallback = null) => {
  try {
    let playerImport = JSON.parse(atob(importedData));
    if (playerImport.inventory !== undefined) {
      // sfxOpen.play();
      // defaultModalElement.style.display = "none";
      // confirmationModalElement.style.display = "flex";
      // confirmationModalElement.innerHTML = `
      //       <div class="content">
      //           <p>Are you sure you want to import this data? This will erase the current data and reset your dungeon progress.</p>
      //           <div class="button-container">
      //               <button id="import-btn">Import</button>
      //               <button id="cancel-btn">Cancel</button>
      //           </div>
      //       </div>`;
      // let confirm = document.querySelector("#import-btn");
      // let cancel = document.querySelector("#cancel-btn");
      // confirm.onclick = function () {
      //   sfxConfirm.play();
      //   player = playerImport;
      //   saveData();
      //   bgmDungeon.stop();
      //   let dimDungeon = document.querySelector('#dungeon-main');
      //   dimDungeon.style.filter = "brightness(100%)";
      //   dimDungeon.style.display = "none";
      //   menuModalElement.style.display = "none";
      //   menuModalElement.innerHTML = "";
      //   confirmationModalElement.style.display = "none";
      //   confirmationModalElement.innerHTML = "";
      //   defaultModalElement.style.display = "none";
      //   defaultModalElement.innerHTML = "";
      //   runLoad("title-screen", "flex");
      //   clearInterval(dungeonTimer);
      //   clearInterval(playTimer);
      //   progressReset();
      // }
      // cancel.onclick = function () {
      //   sfxDecline.play();
      //   confirmationModalElement.style.display = "none";
      //   confirmationModalElement.innerHTML = "";
      //   defaultModalElement.style.display = "flex";
      // }
    } else {
    }
  } catch (err) {
  }
}

export {
  initialDungeonLoad,
  dungeonToggleStartPause,
  chooseNextroomEvent,
  engageBattle,
  fleeBattle,
  endBattle,
  chestEvent,
  ignoreEvent,
  continueExploring,
  addDungeonLog,
  offerBlessingEvent,
  offerCurseEvent,
  specialBossBattle,
  exportData,
  getMapEquipment,
  openInventory,
  closeInventory,
}