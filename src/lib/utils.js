import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}


/**
 * 生成指定范围内的随机整数
 * @param {number} min - 随机数范围的最小值（包含在范围内）
 * @param {number} max - 随机数范围的最大值（包含在范围内）
 * @returns {number} - 在指定范围内的随机整数
 */
export const randomizeNum = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.round(Math.floor(Math.random() * (max - min + 1)) + min);
}


// 获取两个数字之间的随机小数
export const randomizeDecimal = (min, max) => {
  return Math.random() * (max - min) + min;
}

export const nFormatter = (num) => {
  let lookup = [
    { value: 1, symbol: "" },
    { value: 1e3, symbol: "k" },
    { value: 1e6, symbol: "M" },
    { value: 1e9, symbol: "B" },
    { value: 1e12, symbol: "T" },
    { value: 1e15, symbol: "P" },
    { value: 1e18, symbol: "E" }
  ];
  let rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
  let item = lookup.slice().reverse().find(function (item) {
    return num >= item.value;
  });
  return item ? (num / item.value).toFixed(2).replace(rx, "$1") + item.symbol : "0";
}

// 将所有数据保存到本地存储
export const saveData = (gameMain) => {
  const gameMainData = JSON.stringify(gameMain);
  localStorage.setItem("gameMain", gameMainData);
}