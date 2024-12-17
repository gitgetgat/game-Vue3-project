import { randomizeNum, randomizeDecimal, saveData } from "./utils.js";
import { equipmentAttributesList, equipmentCategoriesList, rarityChances, equipmentIcons, equipmentRarityList, equipmentAttr2Label } from "../config/equipment.js";
import { addCombatLog } from "./combat.js"
import { continueExploring, addDungeonLog } from "./dungeon.js"
import { playerLoadStats, calculateStats } from "./player.js"
import { v4 as uuidv4 } from 'uuid';
// 生成装备
export const createEquipment = (gameMain) => {
  const equipment = {
    category: null,// 装备类型中的分类：
    attribute: null,// 属性：攻击（Damage）或防御（Defense）
    type: null, // 装备部位：武器、盔甲、盾、头盔
    rarity: null,// 稀有程度
    lvl: null, // 装备等级
    tier: null, // 装备品阶
    value: null, // 装备售价
    stats: [],
    id: uuidv4()
  };

  // 生成随机装备属性
  const equipmentAttributes = equipmentAttributesList;
  equipment.attribute = equipmentAttributes[Math.floor(Math.random() * equipmentAttributes.length)];

  // 根据属性生成随机装备名称及类型
  if (equipment.attribute == "Damage") {
    equipment.type = "Weapon";
  } else if (equipment.attribute == "Defense") {
    const equipmentTypes = ["Armor", "Shield", "Helmet"]
    equipment.type = equipmentTypes[Math.floor(Math.random() * equipmentTypes.length)];

  }
  const equipmentCategories = equipmentCategoriesList[equipment.type];
  equipment.category = equipmentCategories[Math.floor(Math.random() * equipmentCategories.length)];

  // 生成随机稀有度
  const randomNumber = Math.random();
  let cumulativeChance = 0;

  // 累加比较设置稀有度
  for (let rarity in rarityChances) {
    cumulativeChance += rarityChances[rarity].rarity;
    if (randomNumber <= cumulativeChance) {
      equipment.rarity = rarity;
      break;
    }
  }

  // 根据装备稀有度确定循环次数
  let loopCount = rarityChances[equipment.rarity].loopCount;

  // 生成随机统计数据并将其附加到统计数据数组中
  const physicalStats = ["atk", "atkSpd", "vamp", "critRate", "critDmg"];
  const damageyStats = ["atk", "atk", "vamp", "critRate", "critDmg", "critDmg"];
  const speedyStats = ["atkSpd", "atkSpd", "atk", "vamp", "critRate", "critRate", "critDmg"];
  const defenseStats = ["hp", "hp", "def", "def", "atk"];
  const dmgDefStats = ["hp", "def", "atk", "atk", "critRate", "critDmg"];
  let statTypes;
  if (equipment.attribute == "Damage") {
    if (equipment.category.value == "Axe" || equipment.category.value == "Scythe") {
      statTypes = damageyStats;
    } else if (equipment.category.value == "Dagger" || equipment.category.value == "Flail") {
      statTypes = speedyStats;
    } else if (equipment.category.value == "Hammer") {
      statTypes = dmgDefStats;
    } else {
      statTypes = physicalStats;
    }
  } else if (equipment.attribute == "Defense") {
    statTypes = defenseStats;
  }
  let equipmentValue = 0;
  for (let i = 0; i < loopCount; i++) {
    let statType = statTypes[Math.floor(Math.random() * statTypes.length)];

    // 装备属性缩放
    const maxLvl = gameMain.map.progress.floor * gameMain.map.settings.enemyLvlGap + (gameMain.map.settings.enemyBaseLvl - 1);
    const minLvl = maxLvl - (gameMain.map.settings.enemyLvlGap - 1);
    // 设置装备等级上限为100级
    equipment.lvl = randomizeNum(minLvl, maxLvl);
    if (equipment.lvl > 100) {
      equipment.lvl = 100;
    }
    // 设置属性缩放和设备等级 10 级上限
    let enemyScaling = gameMain.map.settings.enemyScaling;
    if (enemyScaling > 2) {
      enemyScaling = 2;
    }
    let statMultiplier = (enemyScaling - 1) * equipment.lvl;
    equipment.tier = Math.round((enemyScaling - 1) * 10);
    let hpScaling = (40 * randomizeDecimal(0.5, 1.5)) + ((40 * randomizeDecimal(0.5, 1.5)) * statMultiplier);
    let atkDefScaling = (16 * randomizeDecimal(0.5, 1.5)) + ((16 * randomizeDecimal(0.5, 1.5)) * statMultiplier);
    let cdAtkSpdScaling = (3 * randomizeDecimal(0.5, 1.5)) + ((3 * randomizeDecimal(0.5, 1.5)) * statMultiplier);
    let crVampScaling = (2 * randomizeDecimal(0.5, 1.5)) + ((2 * randomizeDecimal(0.5, 1.5)) * statMultiplier);

    // 将随机数设置为相应的统计数据并增加销售价值
    let statValue;
    if (statType === "hp") {
      statValue = randomizeNum(hpScaling * 0.5, hpScaling);
      equipmentValue += statValue;
    } else if (statType === "atk") {
      statValue = randomizeNum(atkDefScaling * 0.5, atkDefScaling);
      equipmentValue += statValue * 2.5;
    } else if (statType === "def") {
      statValue = randomizeNum(atkDefScaling * 0.5, atkDefScaling);
      equipmentValue += statValue * 2.5;
    } else if (statType === "atkSpd") {
      statValue = randomizeDecimal(cdAtkSpdScaling * 0.5, cdAtkSpdScaling);
      if (statValue > 15) {
        statValue = 15 * randomizeDecimal(0.5, 1);
        loopCount++;
      }
      equipmentValue += statValue * 8.33;
    } else if (statType === "vamp") { // 吸血
      statValue = randomizeDecimal(crVampScaling * 0.5, crVampScaling);
      if (statValue > 8) {
        statValue = 8 * randomizeDecimal(0.5, 1);
        loopCount++;
      }
      equipmentValue += statValue * 20.83;
    } else if (statType === "critRate") {
      statValue = randomizeDecimal(crVampScaling * 0.5, crVampScaling);
      if (statValue > 10) {
        statValue = 10 * randomizeDecimal(0.5, 1);
        loopCount++;
      }
      equipmentValue += statValue * 20.83;
    } else if (statType === "critDmg") {
      statValue = randomizeDecimal(cdAtkSpdScaling * 0.5, cdAtkSpdScaling);
      equipmentValue += statValue * 8.33;
    }

    // 限制装备稀有度的最大统计结果
    if (equipment.rarity == "Common" && loopCount > 3) {
      loopCount--;
    } else if (equipment.rarity == "Uncommon" && loopCount > 4) {
      loopCount--;
    } else if (equipment.rarity == "Rare" && loopCount > 5) {
      loopCount--;
    } else if (equipment.rarity == "Epic" && loopCount > 6) {
      loopCount--;
    } else if (equipment.rarity == "Legendary" && loopCount > 7) {
      loopCount--;
    } else if (equipment.rarity == "Heirloom" && loopCount > 9) {
      loopCount--;
    }

    // 检查统计类型是否已存在于统计数组中
    let statExists = false;
    for (let j = 0; j < equipment.stats.length; j++) {
      if (Object.keys(equipment.stats[j])[0] == statType) {
        statExists = true;
        break;
      }
    }

    // 如果统计类型已经存在，则将值相加
    if (statExists) {
      for (let j = 0; j < equipment.stats.length; j++) {
        if (Object.keys(equipment.stats[j])[0] == statType) {
          equipment.stats[j][statType] += statValue;
          break;
        }
      }
    }

    // 如果统计类型不存在，则将新统计添加到统计数组
    else {
      equipment.stats.push({ [statType]: statValue });
    }
  }
  equipment.value = Math.round(equipmentValue * 3);
  // if (gameMain.player.inventory.equipmentLimit >= gameMain.player.inventory.equipment.length) {
  //   gameMain.player.inventory.equipment.push(JSON.stringify(equipment));
  // }

  // saveData();
  // showInventory();
  // showEquipment();

  const itemShow = {
    raw: equipment,
    category: equipment.category,
    rarity: equipment.rarity,
    lvl: equipment.lvl,
    tier: equipment.tier,
    icon: equipmentIcon(equipment.category.value),
    stats: equipment.stats,
    statsTransform: equipmentStatsTransform(equipment.stats),
    id: equipment.id
  }
  return itemShow;
}

export const equipmentStatsTransform = (stats) => {
  let statsObj = {}
  stats.forEach(e => {
    statsObj = {
      ...statsObj,
      ...e
    }
  });

  return Object.keys(statsObj).map(e => {
    return { ...equipmentAttr2Label[e], key: e, value: statsObj[e] }
  })
}

export const equipmentIcon = (equipment) => {
  return equipmentIcons[equipment]
}

// 装备/取消装备该物品的按钮

export const equipOrUnEquipment = (gameMain, type, id, toast) => {
  const { player } = gameMain;
  if (type == "equip") {
    // 从库存中移除物品并将其添加到设备中
    if (player.equipped.length >= player.equippedLimit) {
      toast({
        title: '可装备数量达到极限！',
        variant: 'warning',
      });
    } else {
      const i = player.inventory.equipment.findIndex(e => e.includes(id));
      const equipment = JSON.parse(player.inventory.equipment[i])
      // 装备物品
      player.inventory.equipment.splice(i, 1);
      player.equipped.push(equipment);
    }
  } else if (type == "unequip") {
    const i = player.equipped.findIndex(e => e.id === id);
    const equipment = player.equipped[i]
    // 从装备中移除物品并将其添加到库存中
    player.equipped.splice(i, 1);
    player.inventory.equipment.push(JSON.stringify(equipment));
  }
  playerLoadStats(gameMain);
  saveData(gameMain);
  continueExploring(gameMain);
}

// 卖装备

export const sellEquipment = (gameMain, type, id) => {
  const { player } = gameMain;
  if (type == "Equip") {
    const i = player.inventory.equipment.findIndex(e => e.includes(id))
    const equipment = JSON.parse(player.inventory.equipment[i])
    player.gold += equipment.value;
    player.inventory.equipment.splice(i, 1);
  } else if (type == "Unequip") {
    const i = player.equipped.findIndex(e => e.id === id)
    const equipment = player.equipped[i]
    player.gold += equipment.value;
    player.equipped.splice(i, 1);
  }
  playerLoadStats(gameMain);
  saveData(gameMain);
  continueExploring(gameMain);
}


export const sellAll = (gameMain, rarity) => {
  const { player } = gameMain;
  if (rarity == "All") {
    if (player.inventory.equipment.length !== 0) {
      // sfxSell.play();
      for (let i = 0; i < player.inventory.equipment.length; i++) {
        const equipment = JSON.parse(player.inventory.equipment[i]);
        player.gold += equipment.value;
        player.inventory.equipment.splice(i, 1);
        i--;
      }
      playerLoadStats(gameMain);
      saveData(gameMain);
    }
  } else {
    let rarityCheck = false;
    for (let i = 0; i < player.inventory.equipment.length; i++) {
      const equipment = JSON.parse(player.inventory.equipment[i]);
      if (equipment.rarity === rarity) {
        rarityCheck = true;
        break;
      }
    }
    if (rarityCheck) {
      for (let i = 0; i < player.inventory.equipment.length; i++) {
        const equipment = JSON.parse(player.inventory.equipment[i]);
        if (equipment.rarity === rarity) {
          player.gold += equipment.value;
          player.inventory.equipment.splice(i, 1);
          i--;
        }
      }
      playerLoadStats(gameMain);
      saveData(gameMain);
    }
  }
}

// 将装备统计数据应用于玩家
// 装备栏变化之后都要马上调这个函数
export const applyEquipmentStats = (gameMain) => {
  const { player } = gameMain;
  // 重置装备统计
  player.equippedStats = {
    hp: 0,
    atk: 0,
    def: 0,
    atkSpd: 0,
    vamp: 0,
    critRate: 0,
    critDmg: 0
  };

  for (let i = 0; i < player.equipped.length; i++) {
    const item = player.equipped[i];

    // 遍历统计数组并更新玩家统计数据
    item.stats.forEach(stat => {
      for (const key in stat) {
        player.equippedStats[key] += stat[key];
      }
    });
  }
  calculateStats(gameMain);
}

// 卸载所有装备
export const unequipAll = (gameMain) => {
  const { player } = gameMain;
  for (let i = player.equipped.length - 1; i >= 0; i--) {
    const item = player.equipped[i];
    player.equipped.splice(i, 1);
    player.inventory.equipment.push(JSON.stringify(item));
  }
  playerLoadStats(gameMain);
  saveData(gameMain);
}

export const createEquipmentPrint = (condition, gameMain, enemy = { name: '' }) => {
  let item = createEquipment(gameMain);
  let ele = equipmentRarityList.find(e => e.value === item.rarity)
  if (condition == "combat") {
    console.log('createEquipment', item);
    addCombatLog(gameMain, `${enemy.name} 掉落了 <span style="color:${ele.color}" class="ml-2">${ele.label} 的 ${item.category.label}</span>.`);
    gameMain.combat.combatLoot.push(item)
    // addCombatLog(gameMain, item)
  } else if (condition == "dungeon") {
    addDungeonLog(gameMain.map, `你得到了 <span style="color:${ele.color}" class="font-bold">${ele.label} 的 ${item.category.label}</span>.`);
    addDungeonLog(gameMain.map, { ...item, type: 'equipment' })
  }
}