const percentages = { // 升级时的选项
  "hp": { label: '生命值', value: 10, key: "hp" },
  "atk": { label: '攻击力', value: 8, key: "atk" },
  "def": { label: '防御力', value: 8, key: "def" },
  "atkSpd": { label: '攻击速度', value: 3, key: "atkSpd" },
  "vamp": { label: '吸血', value: 0.5, key: "vamp" },
  "critRate": { label: '暴击率', value: 1, key: "critRate" },
  "critDmg": { label: '暴击伤害', value: 6, key: "critDmg" }
};

const skills = [
  { value: "Remnant Razor", label: "残刃剃刀" },
  { value: "Titan's Will", label: "泰坦意志" },
  { value: "Devastator", label: "毁灭者" },
  { value: "Rampager", label: "狂暴者" },
  { value: "Blade Dance", label: "剑舞" },
  { value: "Paladin's Heart", label: "圣骑之心" },
  { value: "Aegis Thorns", label: "荆棘之盾" },
]

const skillsDesc = {
  "Remnant Razor": "攻击对敌人造成额外8%敌人当前生命值的伤害。",
  "Titan's Will": "攻击时额外造成你最大生命值5%的伤害。",
  "Devastator": "造成30%以上的伤害，但你失去30%的基础攻击速度。",
  "Rampager": "Increase attack by 5 after each hit. Stack resets after battle.",
  "Blade Dance": "每次命中后增加攻击速度。战斗后堆叠重置。",
  "Paladin's Heart": "你受到的伤害永久减少25%。",
  "Aegis Thorns": "敌人会收到他们造成的伤害的15%。"
}

// 前缀描述名字的数组
const prefixNames = [
  "英勇的", "智慧的", "神秘的", "强大的", "敏捷的",
  "勇敢的", "聪明的", "奇特的", "无敌的", "迅捷的",
  "机智的", "神秘莫测的", "无畏的", "精明的", "灵活的",
  "坚不可摧的", "狡猾的", "威严的", "灵动的", "迅疾的",
  "无敌的", "果敢的", "谨慎的", "敏锐的", "顽强的",
  "英勇无畏的", "聪明绝顶的", "神秘莫测的", "强大无比的", "敏捷如风的",
  "勇敢无惧的", "机智过人的", "奇特无比的", "无敌于世的", "迅捷无比的",
  "机敏过人的", "神秘莫测的", "无畏无惧的", "精明无比的", "灵活无比的",
  "坚不可摧的", "狡猾无比的", "威严无比的", "灵动无比的", "迅疾无比的"
];

// 名字数组
const names = [
  "艾琳", "布林", "克里夫", "达伦", "艾丽丝",
  "弗雷德", "格蕾丝", "哈罗德", "伊丽莎白", "杰克",
  "凯莉", "莱昂内尔", "梅根", "尼古拉斯", "奥利维亚",
  "保罗", "琪雅", "瑞安", "莎拉", "汤姆",
  "乌苏拉", "维克托", "温蒂", "西蒙", "尤娜",
  "泽维尔", "阿曼达", "本杰明", "卡洛斯", "黛安娜",
  "埃里克", "弗朗西丝", "乔治", "海伦", "伊恩",
  "詹妮弗", "肯尼思", "劳拉", "迈克尔", "纳塔莉",
  "奥利弗", "帕特里夏", "奎因", "罗伯特", "苏珊",
  "特伦特", "薇薇安", "威廉", "西奥多", "雅各布"
];

export {
  prefixNames,
  names,
  skills,
  skillsDesc,
  percentages,
}