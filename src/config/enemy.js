// 敌人名称
const enemyNames = [
  // Goblin
  'Goblin', 'Goblin Rogue', 'Goblin Mage', 'Goblin Archer',
  // Wolf
  'Wolf', 'Black Wolf', 'Winter Wolf',
  // Slime
  'Slime', 'Angel Slime', 'Knight Slime', 'Crusader Slime',
  // Orc
  'Orc Swordsmaster', 'Orc Axe', 'Orc Archer', 'Orc Mage',
  // Spider
  'Spider', 'Red Spider', 'Green Spider',
  // Skeleton
  'Skeleton Archer', 'Skeleton Swordsmaster', 'Skeleton Knight', 'Skeleton Mage', 'Skeleton Pirate', 'Skeleton Samurai', 'Skeleton Warrior',
  // Bosses
  'Zaart, the Dominator Goblin', 'Banshee, Skeleton Lord', 'Molten Spider', 'Cerberus Ptolemaios', 'Hellhound Inferni', 'Berthelot, the Undead King', 'Slime King', 'Zodiac Cancer', 'Alfadriel, the Light Titan', 'Tiamat, the Dragon Knight', 'Nameless Fallen King', 'Zodiac Aries', 'Llyrrad, the Ant Queen', 'Clockwork Spider', 'Aragorn, the Lethal Wolf',
  // Monarch
  'Naizicher, the Spider Dragon', 'Ulliot, the Deathlord', 'Ifrit', 'Shiva', 'Behemoth', 'Blood Manipulation Feral', 'Thanatos', 'Darkness Angel Reaper', 'Zalaras, the Dragon Emperor'
];

const enemyNamesFilterByType = {
  Offensive: {
    guardian: [
      'Zaart, the Dominator Goblin', 'Banshee, Skeleton Lord', 'Molten Spider', 'Berthelot, the Undead King'
    ],
    sboss: [
      'Behemoth', 'Zalaras, the Dragon Emperor'
    ],
    other: [
      'Goblin Mage', 'Goblin Archer',
      'Wolf', 'Black Wolf', 'Winter Wolf',
      'Knight Slime',
      'Orc Swordsmaster', 'Orc Axe', 'Orc Archer', 'Orc Mage',
      'Red Spider',
      'Skeleton Archer', 'Skeleton Swordsmaster', 'Skeleton Mage', 'Skeleton Pirate', 'Skeleton Samurai',
    ]
  },
  Defensive: {
    guardian: [
      'Slime King', 'Zodiac Cancer', 'Alfadriel, the Light Titan'
    ],
    sboss: [
      'Ulliot, the Deathlord',
    ],
    other: [
      'Angel Slime', 'Knight Slime', 'Crusader Slime',
      'Green Spider',
      'Skeleton Knight', 'Skeleton Warrior'
    ]
  },
  Balanced: {
    guardian: [
      'Tiamat, the Dragon Knight', 'Nameless Fallen King', 'Zodiac Aries'
    ],
    sboss: [
      'Ifrit', 'Shiva', 'Thanatos'
    ],
    other: [
      'Goblin',
      'Slime', 'Angel Slime', 'Knight Slime',
      'Orc Swordsmaster', 'Orc Axe', 'Orc Archer', 'Orc Mage',
      'Spider',
      'Skeleton Knight', 'Skeleton Warrior'
    ]
  },
  Quick: {
    guardian: [
      'Llyrrad, the Ant Queen', 'Clockwork Spider'
    ],
    sboss: [
      'Darkness Angel Reaper', 'Naizicher, the Spider Dragon'
    ],
    other: [
      'Goblin', 'Goblin Rogue', 'Goblin Archer',
      'Wolf', 'Black Wolf', 'Winter Wolf',
      'Orc Swordsmaster',
      'Spider', 'Red Spider', 'Green Spider',
      'Skeleton Swordsmaster', 'Skeleton Pirate', 'Skeleton Samurai'
    ]
  },
  Lethal: {
    guardian: [
      'Aragorn, the Lethal Wolf', 'Cerberus Ptolemaios', 'Hellhound Inferni'
    ],
    sboss: [
      'Blood Manipulation Feral'
    ],
    other: [
      'Goblin Rogue',
      'Wolf', 'Black Wolf', 'Winter Wolf',
      'Orc Swordsmaster', 'Orc Axe',
      'Red Spider',
      'Skeleton Swordsmaster', 'Skeleton Samurai'
    ]
  },
}
export {
  enemyNames,
  enemyNamesFilterByType
}