import { randomizeNum, randomizeDecimal } from "./utils.js";
import {
  enemyNames,
  enemyNamesFilterByType
} from "../config/enemy.js"
const generateBasicEnemy = () => {
  // Enemy 敌人
  return {
    name: null,
    type: null,
    lvl: null,
    stats: {
      hp: null, // 血量
      hpMax: null, // 最大血量
      atk: 0, // 攻击力
      def: 0, // 防御力
      atkSpd: 0,// 攻速
      vamp: 0, // 吸血
      critRate: 0, // 暴击率
      critDmg: 0 // 暴击伤害
    },
    image: {
      name: null,
      type: null,
      size: null
    },
    rewards: { // 奖励
      exp: null,
      gold: null,
      drop: null // 是否爆装备
    }
  };
}

/**
 * 生成随机敌人
 * @param {string} condition - 敌人稀有程度分类（guardian：楼层守卫怪；sboss：精英怪；chest：宝箱怪；door：模仿门怪）
 * @param {object} map - 地图对象信息
 * @returns {number} - 在指定范围内的随机整数
 */
export const generateRandomEnemy = (condition, map) => {

  const enemyTypes = [
    'Offensive', // 进攻型
    'Defensive', // 防守型
    'Balanced', // 平衡型
    'Quick', // 快速型
    'Lethal' // 致命型
  ];
  let selectedEnemies = null;
  let enemy = generateBasicEnemy() // 创建一个敌人模板

  // 生成敌人类型
  enemy.type = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];

  // 计算敌人等级
  const maxLvl = map.progress.floor * map.settings.enemyLvlGap + (map.settings.enemyBaseLvl - 1);
  const minLvl = maxLvl - (map.settings.enemyLvlGap - 1);
  if (condition == "guardian") {
    // 普通怪用最低等级
    enemy.lvl = minLvl;
  } else if (condition == "sboss") {
    // boos用最高等级
    enemy.lvl = maxLvl;
  } else {
    // 其他怪就用随机等级
    enemy.lvl = randomizeNum(minLvl, maxLvl);
  }

  // 按照敌人类型类型和敌人稀有程度分类，筛选怪物名称，怪物名称和展示图片相关
  switch (enemy.type) {
    case "Offensive":
      // 为进攻型选择名称和应用怪物数值状态
      if (condition == "guardian") {
        selectedEnemies = enemyNames.filter(name => enemyNamesFilterByType[enemy.type][condition].includes(name));
      } else if (condition == "sboss") {
        selectedEnemies = enemyNames.filter(name => enemyNamesFilterByType[enemy.type][condition].includes(name));
      } else {
        selectedEnemies = enemyNames.filter(name => enemyNamesFilterByType[enemy.type]["other"].includes(name));
      }
      enemy.name = selectedEnemies[Math.floor(Math.random() * selectedEnemies.length)];
      setEnemyStats(enemy, condition, map);
      break;
    case "Defensive":
      // 为防守型选择名称和应用怪物数值状态
      if (condition == "guardian") {
        selectedEnemies = enemyNames.filter(name => enemyNamesFilterByType[enemy.type][condition].includes(name));
      } else if (condition == "sboss") {
        selectedEnemies = enemyNames.filter(name => enemyNamesFilterByType[enemy.type][condition].includes(name));
      } else {
        selectedEnemies = enemyNames.filter(name => enemyNamesFilterByType[enemy.type]["other"].includes(name));
      }
      enemy.name = selectedEnemies[Math.floor(Math.random() * selectedEnemies.length)];
      setEnemyStats(enemy, condition, map);
      break;
    case "Balanced":
      // 为平衡型选择名称和应用怪物数值状态
      if (condition == "guardian") {
        selectedEnemies = enemyNames.filter(name => enemyNamesFilterByType[enemy.type][condition].includes(name));
      } else if (condition == "sboss") {
        selectedEnemies = enemyNames.filter(name => enemyNamesFilterByType[enemy.type][condition].includes(name));
      } else {
        selectedEnemies = enemyNames.filter(name => enemyNamesFilterByType[enemy.type]["other"].includes(name));
      }
      enemy.name = selectedEnemies[Math.floor(Math.random() * selectedEnemies.length)];
      setEnemyStats(enemy, condition, map);
      break;
    case "Quick":
      // 为快速型选择名称和应用怪物数值状态
      if (condition == "guardian") {
        selectedEnemies = enemyNames.filter(name => enemyNamesFilterByType[enemy.type][condition].includes(name));
      } else if (condition == "sboss") {
        selectedEnemies = enemyNames.filter(name => enemyNamesFilterByType[enemy.type][condition].includes(name));
      } else {
        selectedEnemies = enemyNames.filter(name => enemyNamesFilterByType[enemy.type]["other"].includes(name));
      }
      enemy.name = selectedEnemies[Math.floor(Math.random() * selectedEnemies.length)];
      setEnemyStats(enemy, condition, map);
      break;
    case "Lethal":
      // 为致命型选择名称和应用怪物数值状态
      if (condition == "guardian") {
        selectedEnemies = enemyNames.filter(name => enemyNamesFilterByType[enemy.type][condition].includes(name));
      } else if (condition == "sboss") {
        selectedEnemies = enemyNames.filter(name => enemyNamesFilterByType[enemy.type][condition].includes(name));
      } else {
        selectedEnemies = enemyNames.filter(name => enemyNamesFilterByType[enemy.type]["other"].includes(name));
      }
      enemy.name = selectedEnemies[Math.floor(Math.random() * selectedEnemies.length)];
      setEnemyStats(enemy, condition, map);
      break;
  }
  // 处理特殊怪物的名称，后需要加什么特殊的怪物可以添加
  if (condition == "chest") {
    // 宝箱怪
    enemy.name = "模仿者";
  } else if (condition == "door") {
    // 模仿门怪
    enemy.name = "大门模拟者";
  }
  setEnemyImg(enemy);
  return enemy
}


/**
 * 设置随机敌人数值
 * @param {object} enemy - 敌人基础信息
 * @param {string} condition - 敌人稀有程度分类（guardian：楼层守卫怪；sboss：精英怪；chest：宝箱怪；door：模仿门怪）
 * @param {object} map - 地图对象信息
 * @returns {number} - 在指定范围内的随机整数
 */
const setEnemyStats = (enemy, condition, map) => {
  let type = enemy.type
  if (type == "Offensive") {
    enemy.stats = {
      hp: 0,
      hpMax: randomizeNum(300, 370),
      atk: randomizeNum(70, 100),
      def: randomizeNum(20, 50),
      atkSpd: randomizeDecimal(0.2, 0.4),
      vamp: 0,
      critRate: randomizeDecimal(1, 4),
      critDmg: randomizeDecimal(6.5, 7.5)
    };
  } else if (type == "Defensive") {
    enemy.stats = {
      hp: 0,
      hpMax: randomizeNum(400, 500),
      atk: randomizeNum(40, 70),
      def: randomizeNum(40, 70),
      atkSpd: randomizeDecimal(0.1, 0.3),
      vamp: 0,
      critRate: 0,
      critDmg: 0
    };
  } else if (type == "Balanced") {
    enemy.stats = {
      hp: 0,
      hpMax: randomizeNum(320, 420),
      atk: randomizeNum(50, 80),
      def: randomizeNum(30, 60),
      atkSpd: randomizeDecimal(0.15, 0.35),
      vamp: 0,
      critRate: randomizeDecimal(0.5, 1.5),
      critDmg: randomizeDecimal(1, 3)
    };
  } else if (type == "Quick") {
    enemy.stats = {
      hp: 0,
      hpMax: randomizeNum(300, 370),
      atk: randomizeNum(50, 80),
      def: randomizeNum(30, 60),
      atkSpd: randomizeDecimal(0.35, 0.45),
      vamp: 0,
      critRate: randomizeDecimal(1, 4),
      critDmg: randomizeDecimal(3, 6)
    };
  } else if (type == "Lethal") {
    enemy.stats = {
      hp: 0,
      hpMax: randomizeNum(300, 370),
      atk: randomizeNum(70, 100),
      def: randomizeNum(20, 50),
      atkSpd: randomizeDecimal(0.15, 0.35),
      vamp: 0,
      critRate: randomizeDecimal(4, 8),
      critDmg: randomizeDecimal(6, 9)
    };
  }
  // 怪物增值系数
  if (map.enemyMultipliers == undefined) {
    map.enemyMultipliers = {
      hp: 1,
      atk: 1,
      def: 1,
      atkSpd: 1,
      vamp: 1,
      critRate: 1,
      critDmg: 1
    }
  }

  /**
   * 根据地图设置的怪物系数、怪物等级和怪物基础数值 重新 生成怪物相应数值
   * 地图的怪物系数只和诅咒相关，诅咒越高系数越高
   */
  for (const stat in enemy.stats) {
    if (["hpMax", "atk", "def"].includes(stat)) {
      enemy.stats[stat] += Math.round(enemy.stats[stat] * ((map.settings.enemyScaling - 1) * enemy.lvl));
    } else if (["atkSpd"].includes(stat)) {
      enemy.stats[stat] = 0.4;
      enemy.stats[stat] += enemy.stats[stat] * (((map.settings.enemyScaling - 1) / 4) * enemy.lvl);
    } else if (["critRate"].includes(stat)) {
      enemy.stats[stat] += enemy.stats[stat] * (((map.settings.enemyScaling - 1) / 4) * enemy.lvl);
    } else if (["critDmg"].includes(stat)) {
      enemy.stats[stat] = 50;
      enemy.stats[stat] += enemy.stats[stat] * (((map.settings.enemyScaling - 1) / 4) * enemy.lvl);
    }
  }

  // 为楼层守卫怪系数设置
  if (condition == "guardian") {
    enemy.stats.hpMax = enemy.stats.hpMax * 1.5;
    enemy.stats.atk = enemy.stats.atk * 1.3;
    enemy.stats.def = enemy.stats.def * 1.3;
    enemy.stats.critRate = enemy.stats.critRate * 1.1;
    enemy.stats.critDmg = enemy.stats.critDmg * 1.2;
  }

  // 为精英怪系数设置
  if (condition == "sboss") {
    enemy.stats.hpMax = enemy.stats.hpMax * 6;
    enemy.stats.atk = enemy.stats.atk * 2;
    enemy.stats.def = enemy.stats.def * 2;
    enemy.stats.critRate = enemy.stats.critRate * 1.1;
    enemy.stats.critDmg = enemy.stats.critDmg * 1.3;
  }

  // 根据楼层系数，再次设置敌人数值
  let floorMultiplier = (map.progress.floor / 3);
  if (floorMultiplier < 1) {
    floorMultiplier = 1;
  }
  enemy.stats.hpMax = Math.round((enemy.stats.hpMax * floorMultiplier) * map.enemyMultipliers.hp);
  enemy.stats.atk = Math.round(enemy.stats.atk * map.enemyMultipliers.atk);
  enemy.stats.def = Math.round(enemy.stats.def * map.enemyMultipliers.def);
  enemy.stats.atkSpd = enemy.stats.atkSpd * map.enemyMultipliers.atkSpd;
  enemy.stats.vamp = enemy.stats.vamp * map.enemyMultipliers.vamp;
  enemy.stats.critRate = enemy.stats.critRate * map.enemyMultipliers.critRate;
  enemy.stats.critDmg = enemy.stats.critDmg * map.enemyMultipliers.critDmg;

  // 计算怪物给予的经验值和金币
  const expYield = [];

  for (const stat in enemy.stats) {
    let statExp;
    if (["hpMax", "atk", "def"].includes(stat)) {
      statExp = enemy.stats[stat] + enemy.stats[stat] * 0.5;
    } else if (["atkSpd", "critRate", "critDmg"].includes(stat)) {
      statExp = enemy.stats[stat] + enemy.stats[stat] * 2;
    } else if (["vamp", "hp"].includes(stat)) {
      statExp = enemy.stats[stat] + enemy.stats[stat] * 1;
    }
    expYield.push(statExp);
  }

  let expCalculation = (expYield.reduce((acc, cur) => acc + cur, 0)) / 20;
  enemy.rewards.exp = Math.round(expCalculation + expCalculation * (enemy.lvl * 0.1));
  if (enemy.rewards.exp > 1000000) {
    enemy.rewards.exp = 1000000 * randomizeDecimal(0.9, 1.1);
  }
  enemy.rewards.gold = Math.round((enemy.rewards.exp * randomizeDecimal(0.9, 1.1)) * 1.5);
  // 怪物是否掉落奖励
  enemy.rewards.drop = randomizeNum(1, 3);
  if (enemy.rewards.drop == 1) {
    enemy.rewards.drop = true;
  } else {
    enemy.rewards.drop = false;
  }

  enemy.rewards.drop = true

  enemy.stats.hp = enemy.stats.hpMax;
  enemy.stats.hpPercent = 100;

  // 怪物攻速上线2.5
  if (enemy.stats.atkSpd > 2.5) {
    enemy.stats.atkSpd = 2.5;
  }

  return enemy;
}

// 设置怪物图片
const setEnemyImg = (enemy) => {
  // Apply monster image
  enemy.image.type = '.png';
  switch (enemy.name) {
    // Goblins
    case '哥布林':
      enemy.image.name = 'goblin';
      enemy.image.size = '50%';
      break;
    case '哥布林流氓':
      enemy.image.name = 'goblin_rogue';
      enemy.image.size = '50%';
      break;
    case '哥布林弓箭手':
      enemy.image.name = 'goblin_archer';
      enemy.image.size = '50%';
      break;
    case '哥布林流氓':
      enemy.image.name = 'goblin_mage';
      enemy.image.size = '50%';
      break;

    // Wolf
    case '狼':
      enemy.image.name = 'wolf';
      enemy.image.size = '50%';
      break;
    case '黑狼':
      enemy.image.name = 'wolf_black';
      enemy.image.size = '50%';
      break;
    case '冬狼':
      enemy.image.name = 'wolf_winter';
      enemy.image.size = '50%';
      break;

    // Slime
    case '史莱姆':
      enemy.image.name = 'slime';
      enemy.image.size = '50%';
      break;
    case '天使史莱姆':
      enemy.image.name = 'slime_angel';
      enemy.image.size = '50%';
      break;
    case '骑士史莱姆':
      enemy.image.name = 'slime_knight';
      enemy.image.size = '50%';
      break;
    case '十字军史莱姆':
      enemy.image.name = 'slime_crusader';
      enemy.image.size = '50%';
      break;

    // Orc
    case '兽人剑师':
      enemy.image.name = 'orc_swordsmaster';
      enemy.image.size = '50%';
      break;
    case '兽人刀斧手':
      enemy.image.name = 'orc_axe';
      enemy.image.size = '50%';
      break;
    case '兽人弓箭手':
      enemy.image.name = 'orc_archer';
      enemy.image.size = '50%';
      break;
    case '兽人法师':
      enemy.image.name = 'orc_mage';
      enemy.image.size = '50%';
      break;

    // Spider
    case '蜘蛛':
      enemy.image.name = 'spider';
      enemy.image.size = '50%';
      break;
    case '红蜘蛛':
      enemy.image.name = 'spider_red';
      enemy.image.size = '50%';
      break;
    case '绿蜘蛛':
      enemy.image.name = 'spider_green';
      enemy.image.size = '50%';
      break;

    // Skeleton
    case '骷髅弓箭手':
      enemy.image.name = 'skeleton_archer';
      enemy.image.size = '50%';
      break;
    case '骷髅剑师':
      enemy.image.name = 'skeleton_swordsmaster';
      enemy.image.size = '50%';
      break;
    case '骷髅骑士':
      enemy.image.name = 'skeleton_knight';
      enemy.image.size = '50%';
      break;
    case '骷髅法师':
      if (randomizeNum(1, 2) == 1) {
        enemy.image.name = 'skeleton_mage1';
      } else {
        enemy.image.name = 'skeleton_mage2';
      }
      enemy.image.size = '50%';
      break;
    case '骷髅海盗':
      enemy.image.name = 'skeleton_pirate';
      enemy.image.size = '50%';
      break;
    case '骷髅武士':
      enemy.image.name = 'skeleton_samurai';
      enemy.image.size = '50%';
      break;
    case '骷髅战士':
      enemy.image.name = 'skeleton_warrior';
      enemy.image.size = '50%';
      break;

    // Mimic
    case '模仿者':
      enemy.image.name = 'mimic';
      enemy.image.size = '50%';
      break;
    case '大门模拟者':
      enemy.image.name = 'mimic_door';
      enemy.image.size = '50%';
      break;

    // Bosses
    case '萨尔特，哥布林的主宰者':
      enemy.image.name = 'goblin_boss';
      enemy.image.size = '70%';
      break;
    case '女妖，骷髅王':
      enemy.image.name = 'skeleton_boss';
      enemy.image.size = '50%';
      break;
    case '熔岩蜘蛛':
      enemy.image.name = 'spider_fire';
      enemy.image.size = '50%';
      break;
    case '三头犬·托勒密奥斯':
      enemy.image.name = 'cerberus_ptolemaios';
      enemy.image.size = '50%';
      break;
    case '地狱恶犬':
      enemy.image.name = 'hellhound';
      enemy.image.size = '50%';
      break;
    case '贝特洛，不死之王':
      enemy.image.name = 'berthelot';
      enemy.image.size = '50%';
      break;
    case '史莱姆之王':
      enemy.image.name = 'slime_boss';
      enemy.image.size = '50%';
      break;
    case '癌症星座':
      enemy.image.name = 'zodiac_cancer';
      enemy.image.size = '50%';
      break;
    case '阿尔法德里尔，光之泰坦':
      enemy.image.name = 'alfadriel';
      enemy.image.size = '50%';
      break;
    case '提亚马特，龙骑士':
      enemy.image.name = 'tiamat';
      enemy.image.size = '50%';
      break;
    case '无名堕落之王':
      enemy.image.name = 'fallen_king';
      enemy.image.size = '50%';
      break;
    case '白羊座':
      enemy.image.name = 'zodiac_aries';
      enemy.image.size = '50%';
      break;
    case '发条蜘蛛':
      enemy.image.name = 'spider_boss';
      enemy.image.size = '50%';
      break;
    case '利拉德，蚁后':
      enemy.image.name = 'ant_queen';
      enemy.image.size = '50%';
      break;
    case '阿拉贡，致命之狼':
      enemy.image.name = 'wolf_boss';
      enemy.image.size = '50%';
      break;

    // Special Boss
    case '奈齐尔，蜘蛛龙':
      enemy.image.name = 'spider_dragon';
      enemy.image.size = '70%';
      break;
    case '死亡领主乌里奥特':
      enemy.image.name = 'skeleton_dragon';
      enemy.image.size = '70%';
      break;
    case '幻灵之力':
      enemy.image.name = 'firelord';
      enemy.image.size = '70%';
      break;
    case '湿婆':
      enemy.image.name = 'icemaiden';
      enemy.image.size = '70%';
      break;
    case '巨兽':
      enemy.image.name = 'behemoth';
      enemy.image.size = '70%';
      break;
    case '血术野性':
      enemy.image.name = 'bm-feral';
      enemy.image.size = '70%';
      break;
    case '桑纳托斯死神':
      enemy.image.name = 'thanatos';
      enemy.image.size = '70%';
      break;
    case '黑暗天使收割者':
      enemy.image.name = 'da-reaper';
      enemy.image.size = '70%';
      break;
    case '扎拉拉斯，龙王':
      enemy.image.name = 'zalaras';
      enemy.image.size = '70%';
      break;
  };
  return enemy
}


// 加载敌人信息
export const enemyLoadStats = (enemy) => {
  // Shows proper percentage for respective stats
  let rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
  if (enemy.stats.hp > enemy.stats.hpMax) {
    enemy.stats.hp = enemy.stats.hpMax;
  }
  enemy.stats.hpPercent = ((enemy.stats.hp / enemy.stats.hpMax) * 100).toFixed(2).replace(rx, "$1");

  // enemyHpElement.style.width = `${enemy.stats.hpPercent}%`;
  // enemyHpDamageElement.style.width = `${enemy.stats.hpPercent}%`;
}