import { createEquipmentPrint } from "./equipment.js";
import { enemyLoadStats } from "./enemy.js";
import { addDungeonLog, endBattle } from "./dungeon.js";
import { playerLoadStats, playerExpGain, objectValidation } from "./player.js";
import { nFormatter, saveData } from "./utils.js";

const critDamage = ` 暴击伤害`

const normalDamage = ` 伤害`

// const combat = {
//   combatSeconds: 0,
//   combatTimer: null,
//   enemyCurrId: 0,
//   combatBacklog: []
// }

// 开始战斗
const startCombat = (gameMain, endCallback = null) => {
  const { player, map } = gameMain;
  player.inCombat = true;
  let enemy = null
  if (gameMain.map.enemyBattleList.length > gameMain.combat.enemyCurrId) {
    enemy = gameMain.map.enemyBattleList[gameMain.combat.enemyCurrId]
  }
  if (!enemy) return

  // 启动玩家和敌人攻击的计时器以及战斗计时器
  setTimeout(() => { playerAttack(gameMain, endCallback) }, (1000 / player.stats.atkSpd));
  setTimeout(() => { enemyAttack(gameMain, endCallback) }, (1000 / enemy.stats.atkSpd));

  playerLoadStats(gameMain);
  enemyLoadStats(enemy);

  map.status.event = true;

  gameMain.combat.combatTimer = setInterval(() => {
    combatCounter(gameMain)
  }, 1000);
}

// 结束战斗
const endCombat = (gameMain, endCallback = null) => {
  const { player } = gameMain;
  player.inCombat = false;
  // Skill validation
  if (player.skills.includes("Rampager")) {
    // 移除狂暴者攻击增益
    objectValidation(gameMain);
    player.baseStats.atk -= player.tempStats.atk;
    player.tempStats.atk = 0;
    saveData(gameMain);
  }
  if (player.skills.includes("Blade Dance")) {
    // 移除剑舞攻击速度增益
    objectValidation(gameMain);
    player.baseStats.atkSpd -= player.tempStats.atkSpd;
    player.tempStats.atkSpd = 0;
    saveData(gameMain);
  }

  // 停止战斗中的所有计时器
  clearInterval(gameMain.combat.combatTimer);
  gameMain.combat.combatSeconds = 0;
  if (endCallback) endCallback()
  if (gameMain.auto.progress) {
    if (gameMain.playerDead) {
      addDungeonLog(gameMain.map, `<svg class="text-red-600 inline-block" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 512 512"><path fill="currentColor" d="M226.063 24.188L222 58.718l32.688 25.626l23.75-50.03c-18.145-9.142-35.272-9.715-52.375-10.127zM166.75 61.093c-24.248 2.93-42.95 15.897-58.875 33.812h.03l96.407 62.594zM300.875 88.75l18.656 85.5l-91.092-23.875L269 233.938l-140.594-89.375c-3.966 4.875-7.7 9.97-11.22 15.28c-28.794 43.465-42.052 101.104-42.905 156.72c40.122 19.627 63.843 40.14 74.032 61.562c9.157 19.25 5.475 39.06-6.343 54.25c25.214 23.382 68.638 37.63 113.155 38.344c44.813.717 89.973-12.083 118.625-38.783c-6.033-6.937-10.412-14.346-12.5-22.437c-2.8-10.85-.952-22.554 5.188-33.28c11.757-20.542 37.646-39.263 80.062-59.69c-.88-52.663-13.855-110.235-42.5-154.405c-23.4-36.085-56.548-63.412-103.125-73.375zm-119.28 168.844c27.75 0 50.25 22.5 50.25 50.25s-22.5 50.25-50.25 50.25c-27.752 0-50.25-22.5-50.25-50.25s22.498-50.25 50.25-50.25m149.468 0c27.75 0 50.25 22.5 50.25 50.25s-22.5 50.25-50.25 50.25s-50.25-22.5-50.25-50.25s22.5-50.25 50.25-50.25m-74.75 86.125c13.74 29.005 24.652 58.023 30.062 87.03c-14.777 12.895-41.26 14.766-60.125 0c7.315-29.007 16.12-58.025 30.063-87.03"/></svg> <span class="text-red-600">你挂了!</span>`);
      gameMain.map.status.event = true;
      gameMain.map.status.eventType = ''
      gameMain.map.dungeonAction = "休息中";
      gameMain.map.dungeonActivity = "探索";
      gameMain.map.status.exploring = false;
      gameMain.map.status.paused = true;
    } else {
      setTimeout(() => {
        recyClingAllCombatEquipments(gameMain)
        endBattle(gameMain)
      }, 1000);
    }
  }
}

// 回收所有战斗所得的装备
const recyClingAllCombatEquipments = (gameMain) => {
  // 将装备收到未满的背包
  gameMain.combat.combatLoot.forEach(item => {
    if (gameMain.player.inventory.equipment.length < gameMain.player.inventory.equipmentLimit) {
      gameMain.player.inventory.equipment.push(JSON.stringify(item.raw))
    }
  });
}

// 战斗计时
const combatCounter = (gameMain) => {
  gameMain.combat.combatSeconds++;
}

// ========== Validation ==========
const hpValidation = (gameMain, endCallback = null) => {
  const { player, map } = gameMain;
  let enemy = null
  if (gameMain.map.enemyBattleList.length > gameMain.combat.enemyCurrId) {
    enemy = gameMain.map.enemyBattleList[gameMain.combat.enemyCurrId]
  }
  if (!enemy) return
  // 优先让玩家死亡，而不是敌人死亡
  if (player.stats.hp < 1) {
    player.stats.hp = 0;
    player.stats.hpPercent = "0";
    gameMain.playerDead = true;
    player.deaths++;
    addCombatLog(gameMain, `<svg class="text-red-600" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 512 512"><path fill="currentColor" d="M226.063 24.188L222 58.718l32.688 25.626l23.75-50.03c-18.145-9.142-35.272-9.715-52.375-10.127zM166.75 61.093c-24.248 2.93-42.95 15.897-58.875 33.812h.03l96.407 62.594zM300.875 88.75l18.656 85.5l-91.092-23.875L269 233.938l-140.594-89.375c-3.966 4.875-7.7 9.97-11.22 15.28c-28.794 43.465-42.052 101.104-42.905 156.72c40.122 19.627 63.843 40.14 74.032 61.562c9.157 19.25 5.475 39.06-6.343 54.25c25.214 23.382 68.638 37.63 113.155 38.344c44.813.717 89.973-12.083 118.625-38.783c-6.033-6.937-10.412-14.346-12.5-22.437c-2.8-10.85-.952-22.554 5.188-33.28c11.757-20.542 37.646-39.263 80.062-59.69c-.88-52.663-13.855-110.235-42.5-154.405c-23.4-36.085-56.548-63.412-103.125-73.375zm-119.28 168.844c27.75 0 50.25 22.5 50.25 50.25s-22.5 50.25-50.25 50.25c-27.752 0-50.25-22.5-50.25-50.25s22.498-50.25 50.25-50.25m149.468 0c27.75 0 50.25 22.5 50.25 50.25s-22.5 50.25-50.25 50.25s-50.25-22.5-50.25-50.25s22.5-50.25 50.25-50.25m-74.75 86.125c13.74 29.005 24.652 58.023 30.062 87.03c-14.777 12.895-41.26 14.766-60.125 0c7.315-29.007 16.12-58.025 30.063-87.03"/></svg> <span class="text-red-600">你挂了</span>!`);
    // document.querySelector("#battleButton").addEventListener("click", function () {
    //   sfxConfirm.play();
    //   playerDead = false;

    //   // Reset all the necessary stats and return to menu
    //   let dimDungeon = document.querySelector('#dungeon-main');
    //   dimDungeon.style.filter = "brightness(100%)";
    //   dimDungeon.style.display = "none";
    //   combatPanel.style.display = "none";
    //   runLoad("title-screen", "flex");

    //   clearInterval(dungeonTimer);
    //   clearInterval(playTimer);
    //   progressReset();
    // });
    endCombat(gameMain, endCallback);
  } else if (enemy.stats.hp < 1) {
    // Gives out all the reward and show the claim button
    enemy.stats.hp = 0;
    enemy.stats.hpPercent = "0";
    gameMain.enemyDead = true;
    player.kills++;
    map.statistics.kills++;
    addCombatLog(gameMain, `${enemy.name} 挂掉了! (<svg class="inline-block" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 16 16"><path fill="currentColor" d="M2.5 15a.5.5 0 1 1 0-1h1v-1a4.5 4.5 0 0 1 2.557-4.06c.29-.139.443-.377.443-.59v-.7c0-.213-.154-.451-.443-.59A4.5 4.5 0 0 1 3.5 3V2h-1a.5.5 0 0 1 0-1h11a.5.5 0 0 1 0 1h-1v1a4.5 4.5 0 0 1-2.557 4.06c-.29.139-.443.377-.443.59v.7c0 .213.154.451.443.59A4.5 4.5 0 0 1 12.5 13v1h1a.5.5 0 0 1 0 1zm2-13v1c0 .537.12 1.045.337 1.5h6.326c.216-.455.337-.963.337-1.5V2zm3 6.35c0 .701-.478 1.236-1.011 1.492A3.5 3.5 0 0 0 4.5 13s.866-1.299 3-1.48zm1 0v3.17c2.134.181 3 1.48 3 1.48a3.5 3.5 0 0 0-1.989-3.158C8.978 9.586 8.5 9.052 8.5 8.351z"/></svg> ${new Date(gameMain.combat.combatSeconds * 1000).toISOString().substring(14, 19)}）`);
    addCombatLog(gameMain, `你获得了 ${nFormatter(enemy.rewards.exp)} 点经验值.`)
    playerExpGain(gameMain, enemy);
    addCombatLog(gameMain, `${enemy.name} 掉落了 <svg style="color:#fde047" class="inline-block mx-2" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="m1 22l1.5-5h7l1.5 5zm12 0l1.5-5h7l1.5 5zm-7-7l1.5-5h7l1.5 5zm17-8.95l-3.86 1.09L18.05 11l-1.09-3.86l-3.86-1.09l3.86-1.09l1.09-3.86l1.09 3.86z" /></svg><span class="mr-2" style="color:#fde047">${nFormatter(enemy.rewards.gold)}</span> 黄金.`)
    player.gold += enemy.rewards.gold;
    playerLoadStats(gameMain);
    if (enemy.rewards.drop) {
      createEquipmentPrint("combat", gameMain, enemy);
    }

    // Recover 20% of players health
    player.stats.hp += Math.round((player.stats.hpMax * 20) / 100);
    playerLoadStats(gameMain);

    // // Close the battle panel
    // document.querySelector("#battleButton").addEventListener("click", function () {
    //   sfxConfirm.play();

    //   // Clear combat backlog and transition to dungeon exploration
    //   let dimDungeon = document.querySelector('#dungeon-main');
    //   dimDungeon.style.filter = "brightness(100%)";
    //   bgmDungeon.play();

    //   dungeon.status.event = false;
    //   combatPanel.style.display = "none";
    //   enemyDead = false;
    //   combatBacklog.length = 0;
    // });
    endCombat(gameMain, endCallback);
  }
}

// 玩家死亡——确认
const confirmPlayerDied = function (gameMain) {
  gameMain.playerDead = false;
  clearInterval(gameMain.map.dungeonTimer);
  clearInterval(gameMain.player.playTimer);
  progressReset(gameMain);
}

// ========== Attack Functions ==========
const playerAttack = (gameMain, endCallback = null) => {
  const { player } = gameMain;
  let enemy = null
  if (gameMain.map.enemyBattleList.length > gameMain.combat.enemyCurrId) {
    enemy = gameMain.map.enemyBattleList[gameMain.combat.enemyCurrId]
  }
  if (!enemy) return
  if (!player.inCombat) {
    return;
  }
  // if (player.inCombat) {
  //   sfxAttack.play();
  // }

  // 计算伤害并攻击敌人
  let dmgtype;
  let crit;
  let damage = player.stats.atk * (player.stats.atk / (player.stats.atk + enemy.stats.def));
  // 将伤害随机化 90% - 110%
  let dmgRange = 0.9 + Math.random() * 0.2;
  damage = damage * dmgRange;
  // 检查攻击是否造成暴击
  if (Math.floor(Math.random() * 100) < player.stats.critRate) {
    crit = true;
    dmgtype = critDamage;
    damage = Math.round(damage * (1 + (player.stats.critDmg / 100)));
  } else {
    crit = false;
    dmgtype = normalDamage;
    damage = Math.round(damage);
  }

  // 技能效果
  objectValidation(gameMain);
  if (player.skills.includes("Remnant Razor")) {
    // 攻击时会额外造成敌人当前生命值的 8%
    damage += Math.round((8 * enemy.stats.hp) / 100);
  }
  if (player.skills.includes("Titan's Will")) {
    // 攻击命中时会额外造成 5% 的最大生命值
    damage += Math.round((5 * player.stats.hpMax) / 100);
  }
  if (player.skills.includes("Devastator")) {
    // 造成 30% 的额外伤害，但失去 30% 的基本攻击速度
    damage = Math.round(damage + ((30 * damage) / 100));
  }
  if (player.skills.includes("Rampager")) {
    // 每次攻击后增加 5 点基础攻击力。战斗后堆叠重置。
    player.baseStats.atk += 5;
    objectValidation(gameMain);
    player.tempStats.atk += 5;
    saveData(gameMain);
  }
  if (player.skills.includes("Blade Dance")) {
    // 每次攻击后增加攻击速度。战斗后堆叠重置
    player.baseStats.atkSpd += 0.01;
    objectValidation(gameMain);
    player.tempStats.atkSpd += 0.01;
    saveData(gameMain);
  }

  // 吸血公式
  let lifesteal = Math.round(damage * (player.stats.vamp / 100));

  // 应用计算来对抗
  enemy.stats.hp -= damage;
  player.stats.hp += lifesteal;
  addCombatLog(gameMain, `${player.name} 对 ${enemy.name} 造成了 ` + nFormatter(damage) + `点 ${dmgtype}。`);
  hpValidation(gameMain, endCallback);
  playerLoadStats(gameMain);
  enemyLoadStats(enemy);

  // 攻击颤动动画
  // let enemySprite = document.querySelector("#enemy-sprite");
  // enemySprite.classList.add("animation-shake");
  // setTimeout(() => {
  //   enemySprite.classList.remove("animation-shake");
  // }, 200);

  // 闪烁的伤害数字
  // const dmgContainer = document.querySelector("#dmg-container");
  // const dmgNumber = document.createElement("p");
  // dmgNumber.classList.add("dmg-numbers");
  // if (crit) {
  //   dmgNumber.style.color = "gold";
  //   dmgNumber.innerHTML = nFormatter(damage) + "!";
  // } else {
  //   dmgNumber.innerHTML = nFormatter(damage);
  // }
  // dmgContainer.appendChild(dmgNumber);
  // setTimeout(() => {
  //   dmgContainer.removeChild(dmgContainer.lastElementChild);
  // }, 370);

  // 攻击计时器
  if (player.inCombat) {
    setTimeout(() => {
      if (player.inCombat) {
        playerAttack(gameMain);
      }
    }, (1000 / player.stats.atkSpd));
  }
}

const enemyAttack = (gameMain, endCallback = null) => {
  const { player } = gameMain;
  let enemy = null
  if (gameMain.map.enemyBattleList.length > gameMain.combat.enemyCurrId) {
    enemy = gameMain.map.enemyBattleList[gameMain.combat.enemyCurrId]
  }
  if (!enemy) return
  if (!player.inCombat) {
    return;
  }
  // if (player.inCombat) {
  //   sfxAttack.play();
  // }

  // 计算伤害并攻击玩家
  let dmgtype;
  let damage = enemy.stats.atk * (enemy.stats.atk / (enemy.stats.atk + player.stats.def));
  let lifesteal = Math.round(enemy.stats.atk * (enemy.stats.vamp / 100));
  // 将伤害随机化 90% - 110%
  let dmgRange = 0.9 + Math.random() * 0.2;
  damage = damage * dmgRange;
  // 检查攻击是否造成致命一击
  if (Math.floor(Math.random() * 100) < enemy.stats.critRate) {
    dmgtype = critDamage;
    damage = Math.round(damage * (1 + (enemy.stats.critDmg / 100)));
  } else {
    dmgtype = normalDamage;
    damage = Math.round(damage);
  }

  // 技能效果
  if (player.skills.includes("Paladin's Heart")) {
    // 你受到的伤害减少 25%
    damage = Math.round(damage - ((25 * damage) / 100));
  }

  // 应用计算
  player.stats.hp -= damage;
  // 守护荆棘技能
  objectValidation(gameMain);
  if (player.skills.includes("Aegis Thorns")) {
    // 敌人将受到其造成伤害的 15%
    enemy.stats.hp -= Math.round((15 * damage) / 100);
  }
  enemy.stats.hp += lifesteal;
  addCombatLog(gameMain, `${enemy.name} 对 ${player.name} 造成了 ` + nFormatter(damage) + `点 ${dmgtype}。`);
  hpValidation(gameMain, endCallback);
  playerLoadStats(gameMain);
  enemyLoadStats(enemy);

  // 伤害效果（颤动）
  // let playerPanel = document.querySelector('#playerPanel');
  // playerPanel.classList.add("animation-shake");
  // setTimeout(() => {
  //   playerPanel.classList.remove("animation-shake");
  // }, 200);

  // 攻击计时器
  if (player.inCombat) {
    setTimeout(() => {
      if (player.inCombat) {
        enemyAttack(gameMain);
      }
    }, (1000 / enemy.stats.atkSpd));
  }
}

// 在战斗积压中添加日志
const addCombatLog = (gameMain, message) => {
  gameMain.combat.combatBacklog.push(message);
  // updateCombatLog();
}

export {
  startCombat,
  addCombatLog,
  recyClingAllCombatEquipments
}