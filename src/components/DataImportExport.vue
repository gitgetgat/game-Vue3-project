<template>
  <AlertDialog :open="dataImportExportOpen">
    <AlertDialogOverlay class="fixed inset-0 z-[150] bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
    <AlertDialogContent
      class="md:w-[300px] mobile:w-full z-[150] rounded-lg"
      @escapeKeyDown.prevent
      @openAutoFocus.prevent
    >
      <AlertDialogHeader>
        <AlertDialogTitle>导入/导出 存档</AlertDialogTitle>
        <VisuallyHidden>
          <AlertDialogDescription>
          </AlertDialogDescription>
        </VisuallyHidden>
      </AlertDialogHeader>
      <div>
        <div class="flex flex-col space-y-2">
          <Input
            class="flex-1 borderh-8 inline-block h-8"
            type="text"
            v-model:modelValue="inputData"
          />
          <Button
            variant="outline"
            class="hover:bg-[hsl(var(--foreground))] hover:text-[hsl(var(--background))] hover:transition-all text-base border-white"
            @click="importDataToInit"
          >
            导入存档
          </Button>
          <div class="flex items-center space-x-2">
            <Button
              variant="outline"
              class="hover:bg-[hsl(var(--foreground))] hover:text-[hsl(var(--background))] hover:transition-all text-base border-white grow"
              @click="exportDataToCopy"
            >
              {{ btnText }}
            </Button>
            <Button
              variant="outline"
              class="hover:bg-[hsl(var(--foreground))] hover:text-[hsl(var(--background))] hover:transition-all text-base border-white"
              @click="exportDataToDownload"
            >
              <Icon
                icon="line-md:download-loop"
                class="!size-6"
              />
            </Button>
          </div>
        </div>

      </div>
      <div
        @click="closePanel"
        class="absolute right-4 top-4 cursor-pointer rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
      >
        <X class="w-4 h-4" />
      </div>
    </AlertDialogContent>
  </AlertDialog>
</template>

<script setup>
import { inject, ref } from 'vue'
import {
  AlertDialogOverlay,
} from 'radix-vue';
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogFooter, AlertDialogDescription
} from '@/components/ui/alert-dialog'
import { VisuallyHidden, ScrollArea, X, Icon, Input, computed } from '../lib/import'
import { Button } from '@/components/ui/button'

const gameMain = inject('gameMain')

const isHovered = ref(false)
const inputData = ref('')
const btnText = ref('导出存档')


const props = defineProps({
  dataImportExportOpen: { type: Boolean, required: true },
});

const emits = defineEmits([
  'update:dataImportExportOpen',
  'importToInit'
]);

const closePanel = () => {
  emits('update:dataImportExportOpen', false);
};

const exportDataToCopy = async () => {
  const utf8Bytes = new TextEncoder().encode(JSON.stringify(gameMain.value))
  const dataStr = btoa(String.fromCharCode(...utf8Bytes))
  try {
    await navigator.clipboard.writeText(dataStr);
    btnText.value = '已复制！'
    setTimeout(() => {
      btnText.value = '导出存档'
    }, 3000);
    console.log('文本已成功复制到剪贴板');
  } catch (err) {
    console.error('无法复制文本: ', err);
  }
};
const importDataToInit = () => {
  const dataStr = inputData.value
  try {
    const utf8Bytes = new Uint8Array([...atob(dataStr)].map(char => char.charCodeAt(0)));
    console.log('utf8Bytes', utf8Bytes);
    const utf8String = new TextDecoder().decode(utf8Bytes);
    console.log('utf8String', utf8String);
    const dataObject = JSON.parse(utf8String);
    console.log('dataObject', dataObject);
    console.log('文本已成功导入');
    emits('importToInit', dataObject)
    closePanel();
    inputData.value = ''
  } catch (err) {
    console.error('无法解析文本: ', err);
  }
}
const exportDataToDownload = () => {
  // 将数据转换为JSON字符串
  const utf8Bytes = new TextEncoder().encode(JSON.stringify(gameMain.value))
  const dataStr = btoa(String.fromCharCode(...utf8Bytes))
  // 创建一个Blob对象
  const blob = new Blob([dataStr], { type: 'text/plain' });
  // 创建一个URL对象
  const url = window.URL.createObjectURL(blob);
  // 创建一个<a>元素
  const a = document.createElement('a');
  a.href = url;
  // 设置下载的文件名
  a.download = 'game_data.txt';
  // 将<a>元素添加到DOM中
  document.body.appendChild(a);
  // 触发点击事件
  a.click();
  // 移除<a>元素
  document.body.removeChild(a);
  // 释放URL对象
  window.URL.revokeObjectURL(url);
}
</script>