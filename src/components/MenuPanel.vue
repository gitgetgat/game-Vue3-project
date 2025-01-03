<template>
  <Dialog :open="menuCfgOpen">
    <DialogOverlay class="fixed inset-0 z-[50] bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
    <DialogContent
      class="w-fit rounded-lg"
      @escapeKeyDown.prevent
      @closeAutoFocus.prevent
      @openAutoFocus.prevent
    >
      <DialogClose
        class="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
        @click="closeMenuCfgOpen"
      >
        <X class="w-4 h-4" />
      </DialogClose>
      <DialogHeader>
        <DialogTitle>菜单</DialogTitle>
        <VisuallyHidden>
          <DialogDescription></DialogDescription>
        </VisuallyHidden>
      </DialogHeader>
      <div class="flex flex-col items-center space-x-2">
        <div
          class="hover-menu-button w-full align-middle"
          @click="userStasticOpen=true"
        >
          <Icon
            icon="basil:user-solid"
            class="!size-6 border-none inline-block"
          />
          {{gameMain.player.name}}
        </div>
        <div class="hover-menu-button w-full">
          本轮游戏
        </div>
        <div
          class="hover-menu-button w-full"
          @click="gameCfgOpen = true"
        >
          设置
        </div>
        <div
          class="hover-menu-button w-full"
          @click="openImportDataPanel"
        >
          导出/导入 存档
        </div>
      </div>
    </DialogContent>
  </Dialog>
  <Dialog :open="gameCfgOpen">
    <DialogOverlay class="fixed inset-0 z-[100] bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
    <DialogContent
      class="w-60 rounded-lg z-[100]"
      @escapeKeyDown.prevent
      @openAutoFocus.prevent
      @closeAutoFocus.prevent
    >
      <DialogClose
        class="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
        @click="gameCfgOpen=false"
      >
        <X class="w-4 h-4" />
      </DialogClose>
      <DialogHeader>
        <DialogTitle>游戏设置</DialogTitle>
        <VisuallyHidden>
          <DialogDescription></DialogDescription>
        </VisuallyHidden>
      </DialogHeader>
      <div class="flex flex-col items-center space-x-2">
        <div class="flex items-center justify-between w-full mb-1.5">
          <Label class="text-base">
            <Icon
              icon="game-icons:entry-door"
              class="!size-4 border-none inline-block mr-1.5 ml-1"
            />自动进程
          </Label>
          <Switch
            v-model:checked="gameMain.auto.progress"
            class="h-4 w-8"
          />
        </div>
        <Accordion
          type="single"
          class="w-full"
          collapsible
          :default-value="gameCfgDefaultVal"
        >
          <AccordionItem
            class="border-none"
            key="autoCombat"
            value="autoCombat"
          >
            <AccordionTrigger class="hover:no-underline py-1.5">
              <div class="inline-block">
                <Icon
                  icon="game-icons:crossed-sabres"
                  class="!size-4 border-none inline-block mr-1.5"
                />自动战斗
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div class="flex items-center space-x-2 justify-between">
                <Label>精英 BOSS</Label>
                <Switch
                  v-model:checked.sync="gameMain.auto.specialBossCombat"
                  class="h-4 w-8"
                />
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem
            class="border-none"
            key="autoPickup"
            value="autoPickup"
          >
            <AccordionTrigger class="hover:no-underline py-1.5">
              <div class="inline-block">
                <Icon
                  icon="game-icons:card-pickup"
                  class="!size-4 border-none inline-block mr-1.5"
                />自动拾取
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div class="flex items-center space-x-2 justify-between mb-2">
                <Label>藏宝室宝箱</Label>
                <Switch
                  v-model:checked.sync="gameMain.auto.chest"
                  id="airplane-mode"
                  class="h-4 w-8"
                />
              </div>
              <div class="flex items-center space-x-2 justify-between mb-2">
                <Label>祝福雕像</Label>
                <Switch
                  v-model:checked.sync="gameMain.auto.blessingY"
                  id="airplane-mode"
                  class="h-4 w-8"
                />
              </div>
              <div class="flex items-center space-x-2 justify-between mb-2">
                <Label>灾厄雕像</Label>
                <Switch
                  v-model:checked.sync="gameMain.auto.blessingN"
                  id="airplane-mode"
                  class="h-4 w-8"
                />
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem
            class="border-none"
            key="buffLevel"
            value="buffLevel"
          >
            <AccordionTrigger class="hover:no-underline py-1.5">
              <div class="inline-block">
                <Icon
                  icon="ic:round-move-up"
                  class="!size-4 border-none inline-block mr-1.5"
                />升级 Buff 优先级
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <VueDraggable
                ref="el"
                v-model="gameMain.auto.percentages"
                :animation="150"
                ghostClass="ghost"
                class="flex flex-col gap-2 p-1 w-full h-fit m-auto rounded"
              >
                <div
                  v-for="item in gameMain.auto.percentages"
                  :key="item.key"
                  class="cursor-move h-fit rounded px-1 py-0.5 hover:bg-[hsl(var(--foreground))] hover:text-[hsl(var(--background))]"
                >
                  <Icon
                    icon="nimbus:drag-dots"
                    class="!size-4 border-none inline-block mr-1.5"
                  />{{ item.label }} +{{ item.value }}%
                </div>
              </VueDraggable>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </DialogContent>
  </Dialog>
  <Dialog v-model:open="userStasticOpen">
    <DialogOverlay class="fixed inset-0 z-[120] bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
    <DialogContent
      class="w-fit rounded-lg z-[120]"
      @escapeKeyDown.prevent
      @openAutoFocus.prevent
      @closeAutoFocus.prevent
    >
      <DialogHeader>
        <DialogTitle>统计</DialogTitle>
        <VisuallyHidden>
          <DialogDescription></DialogDescription>
        </VisuallyHidden>
      </DialogHeader>
      <div class="flex flex-col items-start space-y-1">
        <div>{{ gameMain.player.name }} 等级 {{ gameMain.player.lvl }}</div>
        <div>击杀: {{ gameMain.player.kills }}</div>
        <div>死亡: {{ gameMain.player.deaths }}</div>
        <div>游戏时长: {{ dealPlaytime }}</div>
      </div>
    </DialogContent>
  </Dialog>
</template>

<script setup>
import dayjs from "dayjs"
import {
  VueDraggable
} from "vue-draggable-plus";
import {
  DialogOverlay,
} from 'radix-vue';
import { Button } from '@/components/ui/button'
import { nFormatter } from "../lib/utils";
import {
  // components
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose, VisuallyHidden, DialogDescription, X, Icon, Label, Switch, Accordion, AccordionContent, AccordionItem, AccordionTrigger, NumberField, NumberFieldContent, NumberFieldDecrement, NumberFieldIncrement, NumberFieldInput, closeInventory, percentages
} from '../lib/import'
import { ref, computed, inject } from 'vue'
const gameMain = inject('gameMain')
const gameCfgOpen = ref(false) // 游戏设置是否打开
const userStasticOpen = ref(false) // 游戏设置是否打开

const percentagesList = ref(percentages)
// 设置面板 begin
const gameCfgDefaultVal = 'autoCombat' // 默认展开的设置面板
// 设置面板 end

const props = defineProps({
  menuCfgOpen: { type: Boolean, required: true },
  dataImportExportOpen: { type: Boolean, required: true },
});
const emits = defineEmits([
  'update:menuCfgOpen',
  'update:dataImportExportOpen'
]);

const closeMenuCfgOpen = () => {
  emits('update:menuCfgOpen', false);
  closeInventory(gameMain.value)
};

const openImportDataPanel = () => {
  emits('update:dataImportExportOpen', true);
};

const dealPlaytime = computed(() => {
  return dayjs(gameMain.value.player.playtime * 1000 + (new Date().getTimezoneOffset()) * 60 * 1000).format('HH:mm:ss')
})
</script>
<style scoped>
.ghost {
  opacity: 0.5;
  background: #c8ebfb;
}
</style>