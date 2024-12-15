// 装备功能类型
const equipmentAttributesList = ["Damage", "Defense"]

// 装备类型
const equipmentCategoriesList = {
  Weapon: [ // 武器
    { label: "剑", value: "Sword" },
    { label: "斧头", value: "Axe" },
    { label: "锤", value: "Hammer" },
    { label: "匕首", value: "Dagger" },
    { label: "连枷", value: "Flail" },
    { label: "镰", value: "Scythe" },
  ],
  Armor: [ // 盔甲
    { label: "板甲", value: "Plate" },
    { label: "链甲", value: "Chain" },
    { label: "皮衣", value: "Leather" },
  ],
  Shield: [ // 盾
    { label: "塔盾", value: "Tower" },
    { label: "风筝盾", value: "Kite" },
    { label: "圆盾", value: "Buckler" },
  ],
  Helmet: [ // 头盔
    { label: "荣耀之盔", value: "Great Helm" },
    { label: "巨盔", value: "Horned Helm" },
  ],
};

// 生成随机装备稀有度
const rarityChances = {
  "Common": { rarity: 0.7, loopCount: 2 }, // 常见的
  "Uncommon": { rarity: 0.2, loopCount: 3 }, // 罕见
  "Rare": { rarity: 0.04, loopCount: 4 }, // 稀有的
  "Epic": { rarity: 0.03, loopCount: 5 }, // 史诗
  "Legendary": { rarity: 0.02, loopCount: 6 }, // 传奇
  "Heirloom": { rarity: 0.01, loopCount: 8 } // 传家宝
};

const equipmentRarityList = [
  { value: 'All', label: '全部', color: '#C1BCBC' },
  { value: 'Common', label: '普通', color: '#ffffff' },
  { value: 'Uncommon', label: '罕见', color: '#1eff00' },
  { value: 'Rare', label: '稀有', color: '#0070dd' },
  { value: 'Epic', label: '史诗', color: '#a335ee' },
  { value: 'Legendary', label: '传说', color: '#ffd700' },
  { value: 'Heirloom', label: '神器', color: '#e30b5c' },
]

const equipmentIcons = {
  "Sword": '<svg class="inline-block mx-1" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 512 512"><path fill="currentColor" d="M50.348 19.37c-.616.02-1.23.066-1.852.16h-.002c-17.38 2.646-29.2 14.79-29.2 36.208c35.305 18.283 66.755 42.684 85.85 85.266L64.85 199.406l25.697 25.114c7.188-14.017 15.388-27.635 25.113-40.883l68.33-67.746c14.346-10.816 28.963-20.67 44.385-28.615L203.26 62.162l-61.906 42.633C103.76 87.532 75.44 61.048 56.088 19.53c-2.035 0-3.892-.21-5.74-.16m164.18 97.23c-5.02 3.18-10.268 6.81-15.632 10.8l60.284 60.252l-40.946 6.702l-43.068-42.05l-46.137 43.094l.275.295c-3.707 4.943-7.09 9.848-10.035 14.645l255.986 255.85l116.955 20.496L469.7 371.64L214.526 116.6zm-39.647 61.543l37.054 36.177l21.148-3.46l6.56 39.745l-46.695 6.95l-49.8-49.774l31.734-29.637zm100.58 25.783l88.198 88.152l-15.986 36.54l-33.373-33.175l-61.554 21.877L209.402 274l51.768-7.705l-9.645-58.453zm102.39 102.338l74.603 74.564l16.193 82.752l-35.314-6.19l-7.635-51.206l-63.808-63.432l15.96-36.488zm-68.38 10.73l98.657 98.074l5.803 38.922l-29.635-5.193l-116.91-116.846l42.084-14.956z"/></svg>',
  "Axe": '<svg class="inline-block mx-1" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 512 512"><path fill="currentColor" d="M284.736 29.215q-3.502-.023-7.035.049c-32.975.664-67.786 7.496-98.318 21.232c-34.895 15.698-64.057 40.163-79.979 74.672c-15 32.512-18.36 74.591-2.508 128.285a201 201 0 0 1 13.502-5.59c-9.866-43.961-5.617-80.245 8.301-109.01c15.464-31.958 42.464-54.15 72.95-68.302c30.484-14.153 64.583-20.494 95.738-20.95q2.92-.042 5.804-.019c22.847.186 43.814 3.494 60.614 9.836c7.12-3.36 13.61-6.894 18.914-10.852c-20.447-11.111-49.38-18.154-81.016-19.212a258 258 0 0 0-6.967-.14zm8.293 38.373q-2.67-.029-5.379.012c-28.88.421-60.75 6.43-88.421 19.277s-51.013 32.303-64.327 59.818c-11.852 24.495-16.052 55.773-7.242 95.895c12.372-2.904 23.747-3.494 33.565-1.195c9.93 2.325 18.916 9.147 21.732 19.312c.306 1.106.52 2.235.701 3.373l102.203-102.203c-11.857-18.99-15.828-34.784-12.218-48.416c4.005-15.125 16.44-24.638 30.048-31.797c7.436-3.912 15.487-7.412 23.547-10.8c-10.343-1.974-21.956-3.15-34.209-3.276m83.057 68.326l-48.508 9.701l-34.242 34.242h38.807v38.805l34.242-34.242zm87.348 3.367c-3.956 5.301-7.489 11.788-10.848 18.905c6.876 18.213 10.179 41.335 9.812 66.427c-.455 31.155-6.796 65.254-20.949 95.739s-36.344 57.485-68.303 72.949c-28.764 13.918-65.048 18.167-109.01 8.3a201 201 0 0 1-5.59 13.503c53.695 15.852 95.774 12.492 128.286-2.508c34.51-15.922 58.974-45.084 74.672-79.979s22.379-75.376 21.142-112.32c-1.058-31.637-8.1-60.569-19.212-81.016m-22.297 45.48c-3.39 8.06-6.89 16.112-10.801 23.548c-7.159 13.608-16.672 26.043-31.797 30.048c-13.632 3.61-29.425-.361-48.416-12.218L247.92 328.342c1.138.181 2.267.395 3.373.701c10.165 2.816 16.987 11.802 19.312 21.732c2.3 9.818 1.709 21.193-1.195 33.565c40.122 8.81 71.4 4.61 95.895-7.242c27.515-13.314 46.971-36.656 59.818-64.327s18.856-59.542 19.277-88.421c.208-14.228-1.004-27.742-3.263-39.588zm-160.528 13.096v33.534h33.534v-33.534zm-18 12.727l-34.244 34.244l-9.699 48.506l48.506-9.7l34.244-34.243h-38.807zm-57.19 57.19l-37.034 37.035l38.806 38.806l37.036-37.035l-48.508 9.701zm-49.76 49.761l-25.925 25.922l38.809 38.809l25.922-25.924zm-38.651 38.65L16 457.194V496h38.807l101.007-101.008z"/></svg>',
  "Hammer": '<svg class="inline-block mx-1" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 512 512"><path fill="currentColor" d="m266.033 32.42l-85.238 85.238v19.799L285.832 32.42zm41.528 3.728L184.523 159.186l168.291 168.29L475.852 204.44L307.56 36.15zm172.02 190.02L374.542 331.205h19.799l85.238-85.238v-19.799zm-239.903 13.627l-9.9 9.9l32.527 32.528l9.9-9.9zm-22.627 22.627l-23.528 23.527h47.055zm-41.528 41.527l-27.255 27.256h65.054l27.256-27.256zm-45.255 45.256l-27.254 27.254h65.054l27.254-27.254zm-27.254 45.254l23.527 23.527l23.527-23.527zm-21.729 3.728l-9.898 9.899l32.527 32.527l9.898-9.898l-32.527-32.527zm-38.767 18.899l-7.504 22.512l37.388 37.388l22.512-7.504v-12.414L54.93 417.086z"/></svg>',
  "Dagger": '<svg class="inline-block mx-1 origin-center rotate-90" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 512 512"><path fill="currentColor" d="M62.936 16.73L19.72 59.95c1.622 12.54 7.583 26.894 19.39 41.904l65.974-65.973C90.058 24.2 75.52 18.26 62.937 16.73zM96.1 71.295L74.895 92.5c6.34 11.07 15.39 23.783 26.533 36.965l25.197-36.94c-10.865-8.725-21.27-15.93-30.525-21.23M258.627 88.26l19.406 19.408L112.15 273.55l-19.408-19.405l34.88 101.255l54.08-12.298l-51.913-51.91l165.884-165.883l51.908 51.907l12.3-54.08zm-117.682 16.435L114.25 143.83a382 382 0 0 0 8.125 8.385a384 384 0 0 0 3.92 3.863l38.05-28.486c-2.757-2.94-5.6-5.883-8.532-8.817a379 379 0 0 0-14.868-14.08m35.877 36.903l-36.564 27.37c9.672 8.487 19.167 15.894 28.04 22.005l26.266-26.266c-5.07-7.363-11.01-15.144-17.742-23.11zm101.34 27.652l-22.967 22.967c54.55 55.23 93.45 99.893 117.893 132.922c13.023 17.596 21.977 31.83 27.18 43.22c2.6 5.695 4.322 10.65 4.923 15.554c.603 4.903-.024 10.743-4.266 15.025c-4.243 4.28-10.11 4.957-15.014 4.373c-4.905-.585-9.854-2.296-15.54-4.887c-11.375-5.182-25.592-14.118-43.183-27.135c-33.02-24.434-77.71-63.365-133.044-118.02l-21.457 21.457c78.36 65.017 223.158 187.35 324.5 219.406c-36.243-99.91-155.985-246.05-219.024-324.883zm-36.183 36.184l-34.623 34.62c54.882 54.197 99.09 92.638 130.948 116.214c16.98 12.565 30.55 20.932 39.812 25.152c3.486 1.588 6.076 2.39 8.057 2.863c-.476-2-1.294-4.627-2.906-8.158c-4.244-9.292-12.63-22.88-25.202-39.87c-23.586-31.868-61.997-76.044-116.087-130.82z"/></svg>',
  "Flail": '<svg class="inline-block mx-1" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 512 512"><path fill="currentColor" d="M157.536 14.885c-7.895.044-15.766 1.753-22.812 5.17c-4.184 2.029-7.855 5.023-10.563 8.752a28 28 0 0 0-1.691-.154a29.2 29.2 0 0 0-6.975.447c-17.601 3.257-33.382 16.254-39.95 32.906c-2.143 5.435-2.662 11.442-1.198 17.084a29.5 29.5 0 0 0-2.957 3c-11.604 13.63-15.65 33.67-10.24 50.733c1.583 4.995 4.47 9.524 8.437 12.898c-2.69 17.558 4.225 36.588 17.59 48.29a29.2 29.2 0 0 0 5.42 3.751c-.262 1.3-.447 2.62-.532 3.95c-.018.296-.027.593-.04.89l17.913 13.006c-1.439-4.37-2.164-8.83-1.906-12.881c.039-.603.21-1.275.434-1.963a25 25 0 0 0 5.133-1.256a24.9 24.9 0 0 0 8.812-5.455c.722.272 1.374.593 1.893.965c9.29 6.664 16.246 21.344 15.52 32.754c-.14 2.171-1.658 5.117-3.317 7.127l13.277 9.64c3.611-4.449 5.64-10.014 6.006-15.75v-.001c1.137-17.864-7.615-36.34-22.16-46.772a29.5 29.5 0 0 0-3.46-2.125c.105-.485.203-.97.282-1.46c2.811-17.362-3.828-36.227-16.834-48.065c5.324-11.395 6.711-24.748 3.522-36.854c10.306-4.818 19.168-12.943 24.71-22.842c11.981 4.36 25.644 4.433 37.575.032a56 56 0 0 0 2.931 5.078l13.428-9.36a46 46 0 0 1-2.615-4.746c3.486-4.089 5.759-9.222 6.078-15.058a25 25 0 0 0-1.025-8.578c.343-.017.686-.038 1.039-.034c2.075.025 4.237.408 5.635 1.184c4.699 2.608 9.076 7.045 12.472 12.191l13.42-9.353c-4.674-6.927-10.88-12.807-18.127-16.828c-4.101-2.277-8.706-3.563-13.355-3.614a25.1 25.1 0 0 0-11.176 2.479a30 30 0 0 0-1.727-1.182c-7.58-4.76-16.473-7.419-25.484-7.912a56 56 0 0 0-3.383-.084m.649 16.342c6.538.098 13.14 1.586 18.27 4.371c-2.127 4.294-3.062 9.132-2.811 13.955a50 50 0 0 0 .675 5.93c-8.186 2.972-19.017 2.822-27.59-.203c.267-6.107-1.486-12.277-5.712-17.408a25 25 0 0 0-1.584-1.739c.746-.721 1.524-1.32 2.271-1.681c3.858-1.87 8.551-2.914 13.42-3.168a46 46 0 0 1 3.06-.057zm-38.817 13.512c.308 7.11 3.59 13.374 8.541 17.947c-4.046 6.89-11.205 13.193-18.701 16.664c-3.338-3.21-7.55-5.557-12.482-6.553a25 25 0 0 0-3.684-.466a25 25 0 0 0-3.143.035c-.082-1.663.063-3.302.532-4.49c4.194-10.636 16.732-20.964 27.974-23.044c.3-.055.626-.08.963-.093m114.418 14.7l-36.834 25.67l25.776 36.643l36.832-25.67zM83.382 92.705c5.295 4.06 11.868 5.706 18.35 5.195c1.827 7.68.695 17.308-2.631 25.191a25.2 25.2 0 0 0-5.455-.306c-2.372.128-4.77.597-7.147 1.453a24.9 24.9 0 0 0-9.102 5.719c-.433-.67-.797-1.34-.996-1.967c-3.423-10.803-.291-26.531 6.98-35.285zm185.385 16.464l-36.836 25.67l202.152 287.389c16.044-4.381 26.872-13.822 36.592-26.014zm-164.315 34.653c7.388 8.012 11.88 21.705 10.205 32.052a7 7 0 0 1-.26 1.018a24.96 24.96 0 0 0-14.027 6.602c-1.042-.424-1.983-.932-2.654-1.52c-7.666-6.711-12.853-19.574-12.602-30.283c7.402.23 14.248-2.858 19.338-7.87zm109.809 56.125l-32.358 40.008c11.434 1.45 22.812 4.794 33.713 10.152zm-132.4 14.802l21.052 90.711c21.548 5.7 50.394-10.025 53.865-35.427l-22.441-16.56c.142-.024.285-.04.428-.065l-32.147-23.342L81.86 214.75zm85.683 36.325c-4.88.042-9.731.462-14.512 1.242c5.45 3.805 8.178 5.902 16.334 11.348l-.215 3.914c-1.938 37.127-42.47 59.73-73.384 48.263l-3.032-1.119l-.73-3.152l-3.865-16.63a97 97 0 0 0-4.916 8.67C59.58 350.683 78.51 407.838 125.57 431.476a97 97 0 0 0 7.399 3.336l-11.721-24.957l-1.377-2.938l1.693-2.744c14.587-23.775 48.909-33.238 74.975-20.308a53.1 53.1 0 0 1 16.385 12.63l2.15 2.43l-.877 3.131l-8.863 32.09c20.149-8.492 37.491-23.932 48.094-45.041a96 96 0 0 0 6.7-17.32l-5.167 3.894l-2.572 1.944l-3.05-1.084c-31.07-11.03-47.65-54.369-25.32-84.094l2.526-2.303l2.63-.094l16.755 1.028c-8.716-12.248-20.463-22.612-34.85-29.838l-.002-.002c-14.001-7.033-28.896-10.29-43.535-10.162zm-94.865 46.79l-55.323 3.005l44.358 33.937a106.8 106.8 0 0 1 10.785-36.582l.182-.36zm159.24 4.385c-13.636 21.718-1.562 52.29 18.627 61.733l74.324-56.08zm-60.53 88.221c-14.845.025-29.662 6.595-37.786 17.46l41.896 89.187l26.195-94.899c-3.215-3.134-6.79-5.678-10.668-7.513c-6.134-2.905-12.888-4.246-19.636-4.235zm89.089 10.707a106.5 106.5 0 0 1-25.391 29.09l51.707 20.29zM80.27 407.553l-21.922 55.942l51.3-27.373a106.4 106.4 0 0 1-29.378-28.569m399.925 2.195c-9.482 10.994-21.087 20.68-36.472 26.184l14.078 20.014c17.865-2.03 29.077-10.407 36.842-25.658z"/></svg>',
  "Scythe": '<svg class="inline-block mx-1" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 512 512"><path fill="currentColor" d="M296.625 25.406c-63.794.388-135.81 14.683-206.03 32.844c-3.472 34.08 2.226 68.906 14.03 104.25C181.175 75.936 393.65 44.825 486.72 128C456.02 50.466 384.046 24.874 296.624 25.406zM65.655 61.438L27.906 71c5.643 78.022 28.546 132.393 60.44 174.47c-16.54 10.348-40.693 19.673-68.782 26.843c5.664 6.597 14.25 16.18 30.53 18.53c24.846-4.33 39.912-14.982 53.75-26.593c76.24 85.145 190.22 118.955 253.126 224.22l49.436-.126C290.996 275.316 81.01 364.804 65.656 61.438z"/></svg>',
  "Plate": '<svg class="inline-block mx-1" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 512 512"><path fill="currentColor" d="M260.375 19.656c-38.78 0-73.995 3.935-100.5 12.407c-13.253 4.235-24.39 9.556-32.813 16.78c-8.42 7.226-14.124 17.087-14.124 28.094c0 4.472.917 8.784 2.53 12.876c3.433 52.216-35.145 118.26-77.28 151.406c9.894 50.565 32.645 102.465 66.53 149.81c39.964 32.405 91.668 49.857 144.282 52.314v-33.75c-16.175-.15-31.88-.668-44.5-1.594l1.375-18.625c11.96.878 27.288 1.356 43.125 1.5V350.97c-15.294.57-29.984 2.542-41.063 5.936l-5.5-17.875c13.523-4.142 29.83-6.512 46.563-7.155v-33.5c-4.892.263-9.767.762-14.594 1.438c-28.855 1.45-53.472 5.125-75.906 10.593l-.22-.28c28.03-20.89 64.05-31.314 100.064-31.313c36.015 0 72.034 10.425 100.062 31.312l-.125.188c-22.516-5.463-47.247-9.113-76.25-10.532c-4.746-.656-9.533-1.148-14.342-1.405v33.5c16.734.643 33.04 3.013 46.562 7.156l-5.47 17.876c-11.084-3.396-25.787-5.366-41.092-5.937v39.905c15.843-.144 31.16-.622 43.125-1.5L312.188 408c-12.627.927-28.317 1.445-44.5 1.594v34c54.5-1.12 108.566-18.29 150.187-51.47c35.375-47.383 58.567-98.53 68.5-148.405c-43.943-32.66-85.096-102.138-80.344-156c1.132-3.463 1.75-7.065 1.75-10.782c0-11.008-5.67-20.87-14.092-28.094s-19.59-12.546-32.844-16.782c-26.506-8.47-61.687-12.406-100.47-12.406zm0 18.688c37.48 0 71.312 4.03 94.78 11.53c11.736 3.752 20.793 8.394 26.345 13.157c5.552 4.765 7.594 8.92 7.594 13.907c0 2.495-.582 5.05-1.875 7.688c-36.805-16.793-82.838-25.218-128.876-25.22c-44.633 0-89.28 7.903-125.5 23.69c-.83-2.1-1.22-4.145-1.22-6.157c0-4.99 2.042-9.143 7.595-13.907c5.55-4.762 14.608-9.404 26.343-13.155c23.47-7.5 57.334-11.53 94.812-11.53zm-2.03 40.468c41.273 0 82.56 6.716 115.186 20.188c-5.193 3.626-11.645 7.13-19.155 10.28c-23.424 9.827-56.93 16.22-94 16.22s-70.607-6.393-94.03-16.22c-8.22-3.446-15.152-7.322-20.564-11.31c32.202-12.77 72.385-19.16 112.563-19.158m-35.908 63.25a319 319 0 0 0 19.22 1.625c.814 5.004 1.705 10.514 2.624 16.688c2.72 18.253 5.47 39.27 5.47 52.875c0 15.196-5.87 28.974-16.03 39.594c-10.163 10.62-24.316 18.284-41.25 23.28c-18.763 5.537-41.102 7.852-66.032 6.72c-23.82-3.486-42.194-13.06-59.97-27.656c48.897 11.737 91.53 11.613 120.72 3c14.638-4.32 25.797-10.72 33.03-18.282c7.235-7.56 10.845-16.048 10.845-26.656c0-10.86-2.608-32.175-5.282-50.125a1238 1238 0 0 0-3.343-21.063zm71.688.47c-.946 5.705-2.108 12.72-3.28 20.593c-2.675 17.95-5.283 39.265-5.283 50.125c0 10.608 3.61 19.096 10.844 26.656s18.393 13.962 33.03 18.28c29.11 8.59 71.588 8.735 120.314-2.905c-17.762 14.562-36.125 24.13-59.938 27.595c-24.778 1.092-46.988-1.242-65.656-6.75c-16.935-4.997-31.088-12.66-41.25-23.28s-16.03-24.4-16.03-39.595c0-13.606 2.78-34.622 5.5-52.875c.905-6.08 1.788-11.517 2.593-16.47a324 324 0 0 0 19.155-1.374zm121.25 274.655c-88.88 60.702-217.204 60.827-306.25.375l-2.375 39.188c6.073 8.603 23.877 18.598 49.406 25.094c27.31 6.95 62.423 10.798 98.313 11.125c35.888.326 72.623-2.834 103.374-9.47c28.162-6.078 51.078-15.495 63.47-26.03l-5.94-40.283z"/></svg>',
  "Chain": '<svg class="inline-block mx-1" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 512 512"><path fill="currentColor" d="M156.7 25.83L89 39.38c-.1 58.57-1.74 119.32-43.49 167.22C104.4 246.5 189 260.7 247 248.8v-99L108.3 88.22l7.4-16.44L256 134.2l140.3-62.42l7.4 16.44L265 149.8v99c58 11.9 142.6-2.3 201.5-42.2c-41.8-47.9-43.4-108.65-43.5-167.22l-67.7-13.55c-12.9 13.88-20.6 28.15-32.9 40.53C308.9 79.78 289.5 89 256 89s-52.9-9.22-66.4-22.64c-12.3-12.38-20-26.65-32.9-40.53M53.88 232.9C75.96 281 96.07 336.6 102.7 392.8l65 22.8c4.2-52.7 28.2-104 63.7-146.1c-55.1 6.3-122.7-5.8-177.52-36.6m404.22 0c-54.8 30.8-122.4 42.9-177.5 36.6c35.5 42.1 59.5 93.4 63.7 146.1l65.2-22.9c6.6-56.8 26.6-111.8 48.6-159.8M256 269c-40.5 43.1-67.7 97.9-70.7 152.7l61.7 21.6V336h18v107.3l61.7-21.6c-3.1-54.8-30.2-109.6-70.7-152.7m151.7 143.4L297 451.1v18.8l110.2-44.1c.1-4.5.3-8.9.5-13.4m-303.3.1c.3 4.5.4 8.9.5 13.4l110.1 44v-18.7zM279 457.4l-23 8.1l-23-8v19.6l23 9.2l23-9.2z"/></svg>',
  "Leather": '<svg class="inline-block mx-1" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 512 512"><path fill="currentColor" d="M144.1 40.28c-24.1-.1-47.24 3.34-67.2 8.33c-15.97 3.99-29.92 8.98-40.69 13.88c-5.21 2.36-9.66 4.78-13.2 6.95c9.88 8.36 25.58 20.31 42.11 30.76c22.13 14.1 47.08 25.4 59.08 25.4c5.2 0 11.6-2.8 18.3-8.6s13.5-14.4 19.3-24.08c9.7-16.2 16.6-35.75 18.6-49.63c-12.2-1.96-24.3-3.01-36.3-3.01m223.8 0c-12 0-24.1 1.05-36.3 3.01c2 13.88 8.9 33.43 18.6 49.63c5.8 9.68 12.6 18.28 19.3 24.08s13.1 8.6 18.3 8.6c12 0 36.9-11.3 59.1-25.4c16.5-10.45 32.2-22.4 42.1-30.76c-3.6-2.17-8-4.58-13.2-6.95C465 57.6 451 52.6 435.1 48.61c-20-4.99-43.1-8.43-67.2-8.33m-169.3 3.78c-.6 5.65-1.9 11.62-3.6 17.74c19.1 5.18 40.1 7.68 61 7.68c21 0 41.9-2.5 61-7.69c-1.7-6.11-3-12.08-3.6-17.73c-17.6 4.86-37.5 7.42-57.4 7.42s-39.8-2.56-57.4-7.42m130.5 47.92L233 139.7l14.4 86.2l71.1 14.2c11.7-13.7 26.8-28.5 38.3-45.4c11-16.2 18.5-33.6 17.2-53.8c-5.8-2.3-11.3-6-16.3-10.3c-8.7-7.6-16.4-17.5-22.9-28.4c-2-3.27-3.9-6.75-5.7-10.22m-11.3 24.82l30 30.3l.5 2.7c3 15.8-2.6 29.6-9.7 40.1c-7.2 10.6-15.9 18.8-20.5 24.7l-3.5 4.3l-50.5-10.3l-10-59.9l57.9-28.9zm-154.6 4.8c-2.8 3.3-5.8 6.3-8.9 9c-3.2 2.8-6.6 5.2-10.1 7.2c-3.2 44.7-8.5 90.5-15.8 133.9c6.2-2.6 12.9-6.1 19.9-10.4c7.2-45.8 12.2-93.6 14.9-139.7m151 17.2l-40.1 20.1l5.8 34.5l27.8 5.7c5.4-6.2 11.3-12.4 16-19.2c5.2-7.7 8.1-15.4 7.1-24.4zm59.6 62.9c-.7 1-1.4 2.1-2.1 3.1c-4.3 6.2-8.9 12.1-13.5 17.7c6.8 53.2 16.5 105.2 29.1 150.3h18.5c-14.3-49.9-25-110-32-171.1m-146 16.8c-19.6 19.4-39.2 36.8-57.9 50c-19.8 14-38.4 23.9-56.1 26.3L102 371.1c13.6-3.6 33.4-12.8 55.1-26.7c28.4-18.1 60.8-43.5 92-72c8.1-7.5 16.2-15.2 24-23l-41.5-8.3zm.8 139.4L216 383.2l14.6 88.5h50.8l14.6-88.5l-12.6-25.3zm-125.9 32.9l12 47.9h92.2l-8-47.9zm210.4 0l-8 47.9h92.2l12-47.9z"/></svg>',
  "Tower": '<svg class="inline-block mx-1" xmlns="http://www.w3.org/2000/svg" width="20" height="24" viewBox="0 0 1280 1536"><path fill="currentColor" d="M1088 832V192H640v1137q119-63 213-137q235-184 235-360m192-768v768q0 86-33.5 170.5t-83 150t-118 127.5T919 1383t-121 77.5t-89.5 49.5t-42.5 20q-12 6-26 6t-26-6q-16-7-42.5-20t-89.5-49.5t-121-77.5t-126.5-103t-118-127.5t-83-150T0 832V64q0-26 19-45T64 0h1152q26 0 45 19t19 45"/></svg>',
  "Kite": '<svg class="inline-block mx-1" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 512 512"><path fill="currentColor" d="M473.605 88.081c-1.352-.137-135.958-14.259-199.218-68.251L269.9 16h-27.8l-4.488 3.83C174.464 73.727 39.744 87.944 38.4 88.081L24 89.532V104c0 89.133 14.643 165.443 43.523 226.813c38.105 80.973 100.1 133.669 184.267 156.623l4.21 1.148l4.21-1.148c84.165-22.954 146.162-75.65 184.267-156.623C473.357 269.443 488 193.133 488 104V89.532Zm-17.735 30.032q-.237 12.789-.948 25.887H272V57.915c59.921 39.567 149.024 55.322 183.87 60.198M272 320h142.266a288 288 0 0 1-23.366 40H272Zm0-32v-40h167.9a403 403 0 0 1-13.236 42.884V288Zm0-72v-40h180.378c-1.4 13.307-3.256 26.682-5.639 40ZM56.13 118.113c34.846-4.876 123.949-20.631 183.87-60.2v392.311C94.012 398.389 58.492 245.387 56.13 118.113M272 450.224V392h92.347c-24.298 24.7-54.639 44.836-92.347 58.224"/></svg>',
  "Buckler": '<svg class="inline-block mx-1" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="m11.998 2l.118.007l.059.008l.061.013l.111.034a1 1 0 0 1 .217.112l.104.082l.255.218a11 11 0 0 0 7.189 2.537l.342-.01a1 1 0 0 1 1.005.717a13 13 0 0 1-9.208 16.25a1 1 0 0 1-.502 0A13 13 0 0 1 2.54 5.718a1 1 0 0 1 1.005-.717a11 11 0 0 0 7.531-2.527l.263-.225l.096-.075a1 1 0 0 1 .217-.112l.112-.034a1 1 0 0 1 .119-.021zM12 9a2 2 0 0 0-1.995 1.85L10 11l.005.15A2 2 0 0 0 11 12.731V14.5l.007.117A1 1 0 0 0 13 14.5l.001-1.768A2 2 0 0 0 12 9"/></svg>',
  "Great Helm": '<svg class="inline-block mx-1" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 512 512"><path fill="currentColor" d="M267.9 330.5h-23.8L232 289.6l-63.8-19.8l1 39.4l41.9 47.3l16.1-14.3L239.4 484L130.2 361.8l19.4-58.2l-10.4-125.2l23.1-9.8c18.4 71.3 73.1 96.4 73.1 96.4l20.6-28.9l20.6 28.9s54.7-25.1 73.1-96.4l23.1 9.8l-10.4 125.2l19.4 58.2L272.6 484l12.2-141.8l16.1 14.3l41.9-47.3l1-39.4l-63.8 19.8zm125.8 64.8L318.9 472l56.8-28l6.1 24l51.6-36zm-275.4 0l74.8 76.7l-56.8-28l-6.1 24l-51.6-36zm266.5-117.7L486 219.3C506 31 432.4 18.7 360.5 58.7c0 0 114.1-27.7 66.1 109.4l-35.8 14.7zm-257.6 0L25.96 219.3C6 31 79.61 18.7 151.5 58.7c0 0-114.14-27.7-66.12 109.4l35.82 14.7zM256 125.9l67.5 41.8s-3.2 35-42.4 64.7L256 180.7l-25.1 51.7c-39.2-29.7-42.4-64.7-42.4-64.7z"/></svg>',
  "Horned Helm": '<svg class="inline-block mx-1" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 512 512"><path fill="currentColor" d="M258.094 18.5c-74.34 0-138.073 62.498-156.188 148.438c52.758-7.697 102.23-22.044 153.938-45.094l4.125-1.813l3.967 2.064c49.424 25.667 97.648 41.026 150.657 46.406c-17.66-86.744-81.71-150-156.5-150zm1.28 122.156c-57.41 25.148-112.883 39.993-172.53 47c6.724 32.847 6.91 65.935-.5 98.938c89.29 41.602 231.648 43.154 340.594-.125c-10.762-32.516-11.727-65.66-1.188-98.408c-59.03-4.235-112.628-20.06-166.375-47.406zm-13.5 33.125h18.72v127.75h-18.72V173.78zm-58.78 11.19h18.687v101.655h-18.686V184.97zm115.72 0H321.5v101.655h-18.688V184.97zm-171.72 14.905h18.687v79.28h-18.686zm227.72 0H377.5v79.28h-18.688v-79.28zm38.748 116.75c-14.302 4.282-28.96 7.873-43.78 10.844l-19.22 64.06c26.114-17.337 48.002-43.31 63-74.905zm-277.53 2.875c13.95 28.257 33.448 51.85 56.562 68.53l-17.688-58.905c-13.397-2.61-26.387-5.826-38.875-9.625zm213.156 11.656c-51.63 8.175-104.745 8.588-153.72 1.438l20.845 69.5c18 8.52 37.49 13.187 57.78 13.187c18.588 0 36.507-3.92 53.22-11.124zm-195.5 47.156c-19.436 21.562-36.416 44.367-48.594 72.157c70.233-8.736 133.743 14.684 168.03 50.75c39.684-35.607 103.71-55.685 170.876-44.25c-15.08-29.372-33.32-51.982-53.938-74c-31.187 31.75-71.53 51-115.968 51c-46.568 0-88.65-21.142-120.406-55.658z"/></svg>',
}

const equipmentAttr2Label = {
  hp: { label: '生命值', unit: '' },
  atk: { label: '攻击', unit: '' },
  def: { label: '防御', unit: '' },
  atkSpd: { label: '攻击速度', unit: '%' },
  vamp: { label: '吸血', unit: '%' },
  critRate: { label: '暴击率', unit: '%' },
  critDmg: { label: '暴击伤害', unit: '%' },
}


export {
  equipmentAttributesList,
  equipmentCategoriesList,
  equipmentRarityList,
  equipmentAttr2Label,
  rarityChances,
  equipmentIcons
}