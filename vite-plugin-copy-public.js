import fs from 'fs-extra';
import path from 'path';

function copyPublicPlugin() {
  return {
    name: 'copy-public-plugin',
    closeBundle() {
      const publicDir = path.resolve(__dirname, 'src', 'assets', 'images');
      const destDir = path.resolve(__dirname, 'dist', 'public');

      // 确保目标目录存在
      fs.ensureDirSync(destDir);

      // 复制 public 目录中的所有文件到 dist/public 目录
      fs.copySync(publicDir, destDir, {
        filter: (src) => !src.includes('.DS_Store'), // 忽略 .DS_Store 文件
      });

      console.log(`Copied files from ${publicDir} to ${destDir}`);
    },
  };
}

export default copyPublicPlugin;