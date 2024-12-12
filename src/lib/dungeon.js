import { generateRandomEnemy } from "./enemy.js";
import { createEquipmentPrint } from "./equipment.js";
import { nFormatter, randomizeNum, randomizeDecimal } from "./utils.js";
import { playerLoadStats } from "./player.js"
import { startCombat, addCombatLog } from "./combat.js"
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
    console.log('---', map.status.exploring && !map.status.event, map.action);
    map.action++;
    let choices;
    let eventRoll;
    // let eventTypes = ["blessing", "curse", "treasure", "enemy", "enemy", "nothing", "nothing", "nothing", "nothing", "monarch"];
    let eventTypes = ["treasure"];
    if (map.action > 2 && map.action < 6) {
      eventTypes.push("nextroom");
    } else if (map.action > 5) {
      eventTypes = ["nextroom"];
    }
    const event = eventTypes[Math.floor(Math.random() * eventTypes.length)];

    switch (event) {
      case "nextroom":
        map.status.event = true;
        // choices = `
        //             <div class="decision-panel">
        //                 <button id="choice1">Enter</button>
        //                 <button id="choice2">Ignore</button>
        //             </div>`;
        if (map.progress.room == map.progress.roomLimit) {
          addDungeonLog(map, '找到了 BOOS 房间的门');
        } else {
          addDungeonLog(map, '找到了普通房间的门');
        }
        if (gameMain.auto.progress) {
          setTimeout(() => {
            chooseNextroomEvent(gameMain)
          }, 3000);
        } else {
          gameMain.map.status.eventType = 'nextroom'
        }
        // document.querySelector("#choice1").onclick = function () {
        //   sfxConfirm.play();
        //   if (dungeon.progress.room == dungeon.progress.roomLimit) {
        //     guardianBattle();
        //   } else {
        //     eventRoll = randomizeNum(1, 3);
        //     if (eventRoll == 1) {
        //       incrementRoom();
        //       mimicBattle("door");
        //       addDungeonLog("You moved to the next floor.");
        //     } else if (eventRoll == 2) {
        //       incrementRoom();
        //       choices = `
        //                         <div class="decision-panel">
        //                             <button id="choice1">Open the chest</button>
        //                             <button id="choice2">Ignore</button>
        //                         </div>`;
        //       addDungeonLog(`You moved to the next room and found a treasure chamber. There is a <i class="fa fa-toolbox"></i>Chest inside.`, choices);
        //       document.querySelector("#choice1").onclick = function () {
        //         chestEvent();
        //       }
        //       document.querySelector("#choice2").onclick = function () {
        //         dungeon.action = 0;
        //         ignoreEvent();
        //       };
        //     } else {
        //       dungeon.status.event = false;
        //       incrementRoom();
        //       addDungeonLog("You moved to the next room.");
        //     }
        //   }
        // };
        // document.querySelector("#choice2").onclick = function () {
        //   dungeon.action = 0;
        //   ignoreEvent();
        // };
        break;
      case "treasure":
        map.status.event = true;
        // choices = `
        //             <div class="decision-panel">
        //                 <button id="choice1">Open the chest</button>
        //                 <button id="choice2">Ignore</button>
        //             </div>`;
        addDungeonLog(map, `你发现了一个宝库。里面有一个宝箱。`);
        // 打开宝箱或者忽略
        // document.querySelector("#choice1").onclick = function () {
        //   chestEvent();
        // }
        // document.querySelector("#choice2").onclick = function () {
        //   ignoreEvent();
        // };

        if (gameMain.auto.progress) {
          if (gameMain.auto.chest) {
            chestEvent(gameMain);
          } else {
            setTimeout(() => {
              map.status.event = false;
            }, 3000);
          }
        } else {
          gameMain.map.status.eventType = 'treasure'
        }
        break;
      case "nothing":
        gameMain.map.status.eventType = ''
        nothingEvent(map);
        break;
      case "enemy":
        map.status.event = true;
        // choices = `
        //             <div class="decision-panel">
        //                 <button id="choice1">Engage</button>
        //                 <button id="choice2">Flee</button>
        //             </div>`;
        const enemy = generateRandomEnemy(undefined, map);
        console.log('enemy', enemy);
        map.enemyBattleList.push(enemy);
        addDungeonLog(map, `你遭遇了 ${enemy.name}。`);
        player.inCombat = true;
        // 进入战斗或者逃跑
        // document.querySelector("#choice1").onclick = function () {
        //   engageBattle();
        // }
        // document.querySelector("#choice2").onclick = function () {
        //   fleeBattle();
        // }

        setTimeout(() => {
          map.status.event = false;
        }, 3000);
        break;
      case "blessing":
        eventRoll = randomizeNum(1, 2);
        if (eventRoll == 1) {
          map.status.event = true;
          blessingValidation(player);
          let cost = getBlessingCost(player);
          // choices = `
          //               <div class="decision-panel">
          //                   <button id="choice1">Offer</button>
          //                   <button id="choice2">Ignore</button>
          //               </div>`;
          addDungeonLog(map, `您发现了一座祝福神龛。您是否想奉献 ${nFormatter(cost)} 以获得祝福？(祝福 Lv.${player.blessing})`);
          // document.querySelector("#choice1").onclick = function () {
          //   if (player.gold < cost) {
          //     sfxDeny.play();
          //     addDungeonLog("You don't have enough gold.");
          //   } else {
          //     player.gold -= cost;
          //     sfxConfirm.play();
          //     statBlessing();
          //   }
          //   dungeon.status.event = false;
          // }
          // document.querySelector("#choice2").onclick = function () {
          //   ignoreEvent();
          // };

          setTimeout(() => {
            map.status.event = false;
          }, 3000);
        } else {
          gameMain.map.status.eventType = ''
          nothingEvent(map);
        }
        break;
      case "curse":
        console.log('你发现了诅咒神龛');
        // eventRoll = randomizeNum(1, 3);
        // if (eventRoll == 1) {
        //   dungeon.status.event = true;
        //   let curseLvl = Math.round((dungeon.settings.enemyScaling - 1) * 10);
        //   let cost = curseLvl * (10000 * (curseLvl * 0.5)) + 5000;
        //   choices = `
        //                     <div class="decision-panel">
        //                         <button id="choice1">Offer</button>
        //                         <button id="choice2">Ignore</button>
        //                     </div>`;
        //   addDungeonLog(`<span class="Heirloom">You found a Cursed Totem. Do you want to offer <i class="fas fa-coins" style="color: #FFD700;"></i><span class="Common">${nFormatter(cost)}</span>? This will strengthen the monsters but will also improve the loot quality. (Curse Lv.${curseLvl})</span>`, choices);
        //   document.querySelector("#choice1").onclick = function () {
        //     if (player.gold < cost) {
        //       sfxDeny.play();
        //       addDungeonLog("You don't have enough gold.");
        //     } else {
        //       player.gold -= cost;
        //       sfxConfirm.play();
        //       cursedTotem(curseLvl);
        //     }
        //     dungeon.status.event = false;
        //   }
        //   document.querySelector("#choice2").onclick = function () {
        //     ignoreEvent();
        //   };
        // } else {
        //   nothingEvent();
        // }
        break;
      case "monarch":
        console.log('你发现了一个神秘的房间。里面似乎有什么东西在沉睡。');
      // eventRoll = randomizeNum(1, 7);
      // if (eventRoll == 1) {
      //   dungeon.status.event = true;
      //   choices = `
      //                     <div class="decision-panel">
      //                         <button id="choice1">Enter</button>
      //                         <button id="choice2">Ignore</button>
      //                     </div>`;
      //   addDungeonLog(`<span class="Heirloom">You found a mysterious chamber. It seems like there is something sleeping inside.</span>`, choices);
      //   document.querySelector("#choice1").onclick = function () {
      //     specialBossBattle();
      //   }
      //   document.querySelector("#choice2").onclick = function () {
      //     ignoreEvent();
      //   };
      // } else {
      //   nothingEvent();
      // }
    }
  }
}

// 创建初始地图
const initialDungeonLoad = (gameMain) => {
  let map = null
  if (false && localStorage.getItem("mapData") !== null) {
    map = JSON.parse(localStorage.getItem("mapData"));
    map.status = {
      exploring: false,
      paused: true,
      event: false,
    };
    // updateDungeonLog();
  } else {
    map = generateBasicMap();
  }
  loadDungeonProgress(map);

  map.dungeonAction = "休息中";
  map.dungeonActivity = "探索";
  gameMain.map = map;
  gameMain.map.dungeonTimer = setInterval(() => {
    dungeonEvent(gameMain)
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
  if (player.inCombat) {
    startCombat(gameMain);
  } else {
  }
  if (player.stats.hp == 0) {
    progressReset(gameMain);
  }
  initialDungeonLoad(gameMain);
  playerLoadStats(gameMain);
}


// Resets the progress back to start
const progressReset = (gameMain) => {
  gameMain.player.stats.hp = gameMain.player.stats.hpMax;
  gameMain.player.lvl = 1;
  gameMain.player.blessing = 1;
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
  gameMain.player.inCombat = false;
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
  gameMain.combat.combatBacklog.length = 0;
  saveData();
}

// 启动和暂停地图状态
const dungeonToggleStartPause = (map) => {
  dungeonStartPause(map)
}

// 启动和暂停地图状态
const dungeonStartPause = (map) => {
  if (!map.status.paused) {
    // sfxPause.play();

    map.dungeonAction = "休息中";
    map.dungeonActivity = "探索";
    map.status.exploring = false;
    map.status.paused = true;
  } else {
    // sfxUnpause.play();

    map.dungeonAction = "探索中";
    map.dungeonActivity = "休息";
    map.status.exploring = true;
    map.status.paused = false;
  }
}

// 计算当前运行的总时间和总游戏时间
const dungeonCounter = (gameMain) => {
  gameMain.player.playtime++;
  gameMain.map.statistics.runtime++;
  gameMain.dungeonTime += 1000;
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

      // document.querySelector("#choice1").onclick = function () {
      //   chestEvent();
      // }
      // document.querySelector("#choice2").onclick = function () {
      //   dungeon.action = 0;
      //   ignoreEvent();
      // };
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
  gameMain.map.status.eventType = "enemy"
  addDungeonLog(map, `你遭遇了 ${enemy.name}。`);
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
  // showCombatInfo();
  startCombat(gameMain);
  addCombatLog(gameMain, `Floor Guardian ${enemy.name} is blocking your way.`);
  addDungeonLog(map, "你进入了下一层。");
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
    } else {
      createEquipmentPrint("dungeon", gameMain);
    }
    map.status.event = false;
    gameMain.map.status.eventType = ''
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


// Calculates Gold Drop
const goldDrop = (gameMain) => {
  const { map, player } = gameMain;
  let goldValue = randomizeNum(50, 500) * map.progress.floor;
  addDungeonLog(map, `你找到了 <svg style="color:#fde047" class="inline-block mx-2" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="m1 22l1.5-5h7l1.5 5zm12 0l1.5-5h7l1.5 5zm-7-7l1.5-5h7l1.5 5zm17-8.95l-3.86 1.09L18.05 11l-1.09-3.86l-3.86-1.09l3.86-1.09l1.09-3.86l1.09 3.86z" /></svg><span class="mr-2" style="color:#fde047">${nFormatter(goldValue)}</span>黄金.`);
  player.gold += goldValue;
  playerLoadStats(gameMain);
}

const getBlessingCost = (player) => {
  return player.blessing * (500 * (player.blessing * 0.5)) + 750;
}
const offerBlessingEvent = (player, map) => {
  let cost = getBlessingCost(player);
  if (player.gold < cost) {
    // sfxDeny.play();
    addDungeonLog(map, "你的金币不够。");
  } else {
    player.gold -= cost;
    // sfxConfirm.play();
    statBlessing(player);
  }
  map.status.event = false;
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
export const continueExploring = (gameMain) => {
  if (!gameMain.inventoryOpen && !gameMain.map.status.paused) {
    gameMain.dungeon.status.exploring = true;
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
  offerBlessingEvent
}