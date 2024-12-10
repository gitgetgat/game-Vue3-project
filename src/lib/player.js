import { percentages } from '../config/player.js'
import { applyEquipmentStats } from './equipment.js'

// 升级时可选择的升级属性选项组
let selectedStats = [];


// 玩家获取经验
export const playerExpGain = (gameMain, enemy) => {
  const { player } = gameMain;
  player.exp.expCurr += enemy.rewards.exp;
  player.exp.expCurrLvl += enemy.rewards.exp;

  while (player.exp.expCurr >= player.exp.expMax) {
    playerLvlUp(player);
  }
  // 判断是否处于升级状态
  if (player.leveled) {
    lvlupPopup(gameMain);
  }

  playerLoadStats(gameMain);
}

// 提升玩家等级
const playerLvlUp = (player) => {
  player.leveled = true; // 正在处于升级的状态

  // 计算新一级所需的经验值
  let expMaxIncrease = Math.floor(((player.exp.expMax * 1.1) + 100) - player.exp.expMax);
  if (player.lvl > 100) {
    // 100 级以后升级所需经验固定为 1000000
    expMaxIncrease = 1000000;
  }
  // 计算超出但不满最新一级的经验值
  let excessExp = player.exp.expCurr - player.exp.expMax;
  player.exp.expCurrLvl = excessExp;
  player.exp.expMaxLvl = expMaxIncrease;

  // 提高玩家等级和最大经验值
  player.lvl++;
  player.exp.lvlGained++;
  player.exp.expMax += expMaxIncrease;

  // 增加每级玩家的奖励统计数据
  player.bonusStats.hp += 4;
  player.bonusStats.atk += 2;
  player.bonusStats.def += 2;
  player.bonusStats.atkSpd += 0.15;
  player.bonusStats.critRate += 0.1;
  player.bonusStats.critDmg += 0.25;

  // 升级时额外恢复 20% 生命值
  player.stats.hp += Math.round((player.stats.hpMax * 20) / 100);
}

// 正式升级奖励弹窗
const lvlupPopup = (gameMain) => {
  // 刷新玩家数值
  playerLoadStats(gameMain);
  // 创建
  for (let i = 0; i < gameMain.player.exp.lvlGained; i++) {
    selectedStats.push(generateLvlStats());
  }

}

// 刷新玩家统计数据
export const playerLoadStats = (gameMain) => {
  const { player, playerDead } = gameMain
  // showEquipment();
  // showInventory();
  applyEquipmentStats(gameMain);

  let rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
  if (player.stats.hp > player.stats.hpMax) {
    player.stats.hp = player.stats.hpMax;
  }
  player.stats.hpPercent = Number((player.stats.hp / player.stats.hpMax) * 100).toFixed(2).replace(rx, "$1");
  player.exp.expPercent = Number((player.exp.expCurrLvl / player.exp.expMaxLvl) * 100).toFixed(2).replace(rx, "$1");

  // Generate battle info for player if in combat
  if (player.inCombat || playerDead) {
    // const playerCombatHpElement = document.querySelector('#player-hp-battle');
    // const playerHpDamageElement = document.querySelector('#player-hp-dmg');
    // const playerExpElement = document.querySelector('#player-exp-bar');
    // const playerInfoElement = document.querySelector('#player-combat-info');
    // playerCombatHpElement.innerHTML = `&nbsp${nFormatter(player.stats.hp)}/${nFormatter(player.stats.hpMax)}(${player.stats.hpPercent}%)`;
    // playerCombatHpElement.style.width = `${player.stats.hpPercent}%`;
    // playerHpDamageElement.style.width = `${player.stats.hpPercent}%`;
    // playerExpElement.style.width = `${player.exp.expPercent}%`;
    // playerInfoElement.innerHTML = `${player.name} Lv.${player.lvl} (${player.exp.expPercent}%)`;
  }

  // // Header
  // document.querySelector("#player-name").innerHTML = `<i class="fas fa-user"></i>${player.name} Lv.${player.lvl}`;
  // document.querySelector("#player-exp").innerHTML = `<p>Exp</p> ${nFormatter(player.exp.expCurr)}/${nFormatter(player.exp.expMax)} (${player.exp.expPercent}%)`;
  // document.querySelector("#player-gold").innerHTML = `<i class="fas fa-coins" style="color: #FFD700;"></i>${nFormatter(player.gold)}`;

  // // Player Stats
  // playerHpElement.innerHTML = `${nFormatter(player.stats.hp)}/${nFormatter(player.stats.hpMax)} (${player.stats.hpPercent}%)`;
  // playerAtkElement.innerHTML = nFormatter(player.stats.atk);
  // playerDefElement.innerHTML = nFormatter(player.stats.def);
  // playerAtkSpdElement.innerHTML = player.stats.atkSpd.toFixed(2).replace(rx, "$1");
  // playerVampElement.innerHTML = (player.stats.vamp).toFixed(2).replace(rx, "$1") + "%";
  // playerCrateElement.innerHTML = (player.stats.critRate).toFixed(2).replace(rx, "$1") + "%";
  // playerCdmgElement.innerHTML = (player.stats.critDmg).toFixed(2).replace(rx, "$1") + "%";

  // // Player Bonus Stats
  // document.querySelector("#bonus-stats").innerHTML = `
  //   <h4>Bonus Stats</h4>
  //   <p><i class="fas fa-heart"></i>HP+${player.bonusStats.hp.toFixed(2).replace(rx, "$1")}%</p>
  //   <p><i class="ra ra-sword"></i>ATK+${player.bonusStats.atk.toFixed(2).replace(rx, "$1")}%</p>
  //   <p><i class="ra ra-round-shield"></i>DEF+${player.bonusStats.def.toFixed(2).replace(rx, "$1")}%</p>
  //   <p><i class="ra ra-plain-dagger"></i>ATK.SPD+${player.bonusStats.atkSpd.toFixed(2).replace(rx, "$1")}%</p>
  //   <p><i class="ra ra-dripping-blade"></i>VAMP+${player.bonusStats.vamp.toFixed(2).replace(rx, "$1")}%</p>
  //   <p><i class="ra ra-lightning-bolt"></i>C.RATE+${player.bonusStats.critRate.toFixed(2).replace(rx, "$1")}%</p>
  //   <p><i class="ra ra-focused-lightning"></i>C.DMG+${player.bonusStats.critDmg.toFixed(2).replace(rx, "$1")}%</p>`;
}


// 计算玩家的属性数据
export const calculateStats = (gameMain) => {
  const { player } = gameMain;
  let equipmentAtkSpd = player.baseStats.atkSpd * (player.equippedStats.atkSpd / 100);
  let playerHpBase = player.baseStats.hp;
  let playerAtkBase = player.baseStats.atk;
  let playerDefBase = player.baseStats.def;
  let playerAtkSpdBase = player.baseStats.atkSpd;
  let playerVampBase = player.baseStats.vamp;
  let playerCRateBase = player.baseStats.critRate;
  let playerCDmgBase = player.baseStats.critDmg;

  player.stats.hpMax = Math.round((playerHpBase + playerHpBase * (player.bonusStats.hp / 100)) + player.equippedStats.hp);
  player.stats.atk = Math.round((playerAtkBase + playerAtkBase * (player.bonusStats.atk / 100)) + player.equippedStats.atk);
  player.stats.def = Math.round((playerDefBase + playerDefBase * (player.bonusStats.def / 100)) + player.equippedStats.def);
  player.stats.atkSpd = (playerAtkSpdBase + playerAtkSpdBase * (player.bonusStats.atkSpd / 100)) + equipmentAtkSpd + (equipmentAtkSpd * (player.equippedStats.atkSpd / 100));
  player.stats.vamp = playerVampBase + player.bonusStats.vamp + player.equippedStats.vamp;
  player.stats.critRate = playerCRateBase + player.bonusStats.critRate + player.equippedStats.critRate;
  player.stats.critDmg = playerCDmgBase + player.bonusStats.critDmg + player.equippedStats.critDmg;

  // 攻击速度上限为 2.5
  if (player.stats.atkSpd > 2.5) {
    player.stats.atkSpd = 2.5;
  }
}

// Generates random stats for level up popup
const generateLvlStats = () => {
  let selectedStats = [];
  let stats = ["hp", "atk", "def", "atkSpd", "vamp", "critRate", "critDmg"];
  while (selectedStats.length < 3) {
    let randomIndex = Math.floor(Math.random() * stats.length);
    if (!selectedStats.includes(stats[randomIndex])) {
      selectedStats.push(stats[randomIndex]);
    }
  }

  return selectedStats

  const loadLvlHeader = () => {
    lvlupSelect.innerHTML = `
            <h1>Level Up!</h1>
            <div class="content-head">
                <h4>Remaining: ${player.exp.lvlGained}</h4>
                <button id="lvlReroll">Reroll ${rerolls}/2</button>
            </div>
        `;
  }
  loadLvlHeader();

  const lvlReroll = document.querySelector("#lvlReroll");
  lvlReroll.addEventListener("click", function () {
    if (rerolls > 0) {
      sfxSell.play();
      rerolls--;
      loadLvlHeader();
      generateLvlStats(rerolls, percentages);
    } else {
      sfxDeny.play();
    }
  });

  try {
    for (let i = 0; i < 4; i++) {
      let button = document.createElement("button");
      button.id = "lvlSlot" + i;

      let h3 = document.createElement("h3");
      h3.innerHTML = selectedStats[i].replace(/([A-Z])/g, ".$1").replace(/crit/g, "c").toUpperCase() + " UP";
      button.appendChild(h3);

      let p = document.createElement("p");
      p.innerHTML = `Increase bonus ${selectedStats[i].replace(/([A-Z])/g, ".$1").replace(/crit/g, "c").toUpperCase()} by ${percentages[selectedStats[i]]}%.`;
      button.appendChild(p);

      // Increase the selected stat for player
      button.addEventListener("click", function () {
        sfxItem.play();
        player.bonusStats[selectedStats[i]] += percentages[selectedStats[i]];

        if (player.exp.lvlGained > 1) {
          player.exp.lvlGained--;
          generateLvlStats(2, percentages);
        } else {
          player.exp.lvlGained = 0;
          lvlupPanel.style.display = "none";
          combatPanel.style.filter = "brightness(100%)";
          leveled = false;
        }

        playerLoadStats();
        saveData();
      });

      lvlupSelect.appendChild(button);
    }
  } catch (err) { }
}

// 选择某一项升级
export const handleSelectedLvlStat = (gameMain) => {
  const { player } = gameMain;
  player.bonusStats[selectedStats[i]] += percentages[selectedStats[i]];

  if (player.exp.lvlGained > 1) {
    player.exp.lvlGained--;
  } else {
    player.exp.lvlGained = 0;
    player.leveled = false;
  }

  playerLoadStats(gameMain);
  // saveData();
}


// 校验玩家是否选择技能
export const objectValidation = (player) => {
  if (player.skills == undefined) {
    player.skills = [];
  }
  if (player.tempStats == undefined) {
    player.tempStats = {};
    player.tempStats.atk = 0;
    player.tempStats.atkSpd = 0;
  }
  // saveData();
}