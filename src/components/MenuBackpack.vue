<template>
  <AlertDialog :open="menuBackpackOpen">
    <AlertDialogOverlay class="fixed inset-0 z-[50] bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
    <AlertDialogContent
      class="w-fit"
      @escapeKeyDown.prevent
      @closeAutoFocus.prevent
    >
      <AlertDialogHeader>
        <AlertDialogTitle>背包</AlertDialogTitle>
        <VisuallyHidden>
          <AlertDialogDescription></AlertDialogDescription>
        </VisuallyHidden>
      </AlertDialogHeader>
      <div class="flex flex-col items-center space-x-2">
        <div class="flex items-center">
          <div
            class="text-center px-4 cursor-pointer border rounded-lg hover:bg-[hsl(var(--foreground))] hover:text-[hsl(var(--background))] hover:transition-all  mx-0 min-w-fit py-1 text-base flex  flex-col items-center"
            @click="backEquipmentList.length>0&&(saleCategoryEquipmentOpen=true)"
          >
            <Icon
              icon="hugeicons:sale-tag-01"
              class="!size-6 mr-1"
            />
            <div class="">出售
            </div>
          </div>
          <Select v-model="equipmentSelectVal">
            <SelectTrigger class="w-[180px] ml-3">
              <SelectValue
                :style="`color:${equipmentSelectItem.color}`"
                class="flex items-center"
                placeholder="Select a fruit"
              >
                <Icon
                  icon="lsicon:filter-outline"
                  class="!size-6 mr-2"
                />
                <span>{{ equipmentSelectItem.label }}</span>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem
                  v-for="item in equipmentCategoriesFilterList"
                  :value="item.value"
                  :key="item.value"
                  :style="`color:${item.color}`"
                >
                  {{item.label}}
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
      <ScrollArea class="flex-1 mb-2 rounded-lg  min-h-60 max-h-60 w-64">
        <div
          class="flex items-center text-sm leading-6 hover:bg-white/20 rounded-md py-1 cursor-pointer"
          v-for="equipment in backEquipmentList"
          :style="`color:${getRarityColor(equipment.rarity)}`"
          @click="handleEquipmentShow(equipment)"
        >
          <span
            v-html="
                equipment.icon"
            class="mr-1"
          ></span>
          <span>{{ getRarityLabel(equipment.rarity) }}的{{ equipment.category.label }}</span>
        </div>
      </ScrollArea>
      <Card class="w-64">
        <CardHeader class="px-4 pt-4 pb-2">
          <CardTitle class="flex justify-between items-center">
            <span class="text-sm">装备</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger as="Icon">
                  <Icon
                    icon="icon-park-outline:clear"
                    class="!size-6 ml-2 p-1 rounded-lg cursor-pointer border-none hover-button"
                    @click="handleUnequipAll"
                  />
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>卸下全部装备</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardTitle>
        </CardHeader>
        <CardContent
          v-if="gameMain.player.equipped.length"
          class="grid grid-cols-3 gap-4 px-4 pb-4"
        >
          <HoverCard
            v-for="equipment in gameMain.player.equipped"
            :key="equipment.id"
          >
            <HoverCardTrigger as-child>
              <div
                class="text-center py-2 border rounded-lg cursor-pointer"
                :style="`color:${getRarityColor(equipment.rarity)};border-color:${getRarityColor(equipment.rarity)}`"
                @click="handleEquipmentShow(equipment,!isMobile,true)"
              >
                <span v-html="getIcon(equipment.category.value)"></span>
              </div>
            </HoverCardTrigger>
            <HoverCardContent
              class="w-fit"
              v-if="!isMobile"
            >
              <div
                class="flex flex-col"
                v-if="equipment"
              >
                <div
                  class="text-lg mb-2"
                  :style="`color:${getRarityColor(equipment.rarity)}`"
                >
                  <span
                    v-html="equipment.icon"
                    class="mr-1"
                  ></span>
                  <span>{{ getRarityLabel(equipment.rarity) }}的{{ equipment.category.label }}</span>
                </div>
                <p class="mx-1 text-xs font-bold">等级 {{ equipment.lvl }} 品阶 {{ equipment.tier }}</p>
                <p
                  class="mx-1 text-sm"
                  v-for="stat in getEquipmentStatsTransform(equipment.stats)"
                >
                  {{ stat.label }}+{{ ["critRate","critDmg","atkSpd","vamp"].includes(stat.key)?dealFloatFixed(stat.value):stat.value }}{{ stat.unit }}
                </p>
                <div class="flex my-2">
                  <Button
                    variant="outline"
                    class="hover:bg-[hsl(var(--foreground))] hover:text-[hsl(var(--background))] hover:transition-all text-base border-white mr-2"
                    @click="equipOrUnequipEquipment('unequip',equipment.id)"
                  >
                    脱下
                  </Button>
                  <Button
                    variant="outline"
                    class="text-[#fde047] hover:bg-[hsl(var(--foreground))] hover:text-[hsl(var(--background))] hover:transition-all text-base border-white mr-2"
                    @click="saleEquipmentShow(equipment.id,'hover')"
                  >
                    <svg
                      class="inline-block"
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                    >
                      <path
                        fill="currentColor"
                        d="m1 22l1.5-5h7l1.5 5zm12 0l1.5-5h7l1.5 5zm-7-7l1.5-5h7l1.5 5zm17-8.95l-3.86 1.09L18.05 11l-1.09-3.86l-3.86-1.09l3.86-1.09l1.09-3.86l1.09 3.86z"
                      />
                    </svg><span>{{ equipment.value }}</span>
                  </Button>
                </div>
              </div>
            </HoverCardContent>
          </HoverCard>
        </CardContent>
        <CardContent
          v-else
          class="text-center text-sm"
        >未装备</CardContent>
      </Card>
      <div
        @click="closeMenuBackpack"
        class="absolute right-4 top-4 cursor-pointer rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
      >
        <X class="w-4 h-4" />
      </div>
    </AlertDialogContent>
  </AlertDialog>
  <AlertDialog
    :open="saleCategoryEquipmentOpen"
    class="z-[101]"
  >
    <AlertDialogOverlay class="fixed inset-0 z-[101] bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
    <AlertDialogContent
      class="w-fit rounded-lg z-[101] p-2"
      @escapeKeyDown.prevent
    >
      <VisuallyHidden>
        <AlertDialogHeader>
          <AlertDialogTitle></AlertDialogTitle>
          <AlertDialogDescription></AlertDialogDescription>
        </AlertDialogHeader>
      </VisuallyHidden>
      <div>
        <div>
          出售全部
          <span
            :style="`color:${equipmentSelectItem.color}`"
            class="text-lg font-bold"
          >{{ equipmentSelectItem.label }}</span> 装备？
        </div>
        <div class="flex items-center justify-center space-x-2">
          <Button
            variant="outline"
            class="hover:bg-[hsl(var(--foreground))] hover:text-[hsl(var(--background))] hover:transition-all text-base border-white"
            @click="saleCategoryEquipmentOpen=false"
          >
            取消
          </Button>
          <Button
            variant="outline"
            class="hover:bg-[hsl(var(--foreground))] hover:text-[hsl(var(--background))] hover:transition-all text-base border-white"
            @click="handleSaleAllEquipment"
          >
            出售
          </Button>
        </div>
      </div>
    </AlertDialogContent>
  </AlertDialog>
</template>

<script setup>
import {
  AlertDialogOverlay,
} from 'radix-vue';
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogFooter, AlertDialogDescription
} from '@/components/ui/alert-dialog'
import {
  Icon, ScrollArea, X, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
  Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue,
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, HoverCard, HoverCardContent, HoverCardTrigger, VisuallyHidden, equipmentRarityList, sellAll, unequipAll, equipmentIcon, equipmentStatsTransform, closeInventory
} from '../lib/import'
import { Button } from '@/components/ui/button'
import { ref, computed, inject } from 'vue'
const gameMain = inject('gameMain')
const props = defineProps({
  menuBackpackOpen: { type: Boolean, required: true },
  isMobile: { type: Boolean, required: true },
  getRarityLabel: { type: Function, required: true },
  getRarityColor: { type: Function, required: true },
  dealFloatFixed: { type: Function, required: true },
});
const emits = defineEmits([
  'update:menuBackpackOpen',
  'equipOrUnequipEquipment',
  'handleEquipmentShow',
  'equipmentSale',
]);
// 装备稀有度
const equipmentCategoriesFilterList = equipmentRarityList
const saleCategoryEquipmentOpen = ref(false)
const equipmentSelectVal = ref('All') // 背包-装备类型下拉筛选
const equipmentSelectItem = computed(() => equipmentCategoriesFilterList.find(e => e.value === equipmentSelectVal.value)) // 背包-装备类型下拉筛选选中项

// 装备列表
const backEquipmentList = computed(() => {
  return gameMain.value.player.inventory.equipment.map(ele => {
    const equipment = JSON.parse(ele)
    return {
      raw: equipment,
      category: equipment.category,
      rarity: equipment.rarity,
      lvl: equipment.lvl,
      tier: equipment.tier,
      icon: equipmentIcon(equipment.category.value),
      stats: equipment.stats,
      value: equipment.value,
      statsTransform: equipmentStatsTransform(equipment.stats),
    }
  }).filter(ele => equipmentSelectVal.value === 'All' ? true : ele.rarity === equipmentSelectVal.value)
})
// 出售所有装备
const handleSaleAllEquipment = () => {
  sellAll(gameMain.value, equipmentSelectVal.value)
  saleCategoryEquipmentOpen.value = false
}
const getIcon = (val) => {
  return equipmentIcon(val)
}

const getEquipmentStatsTransform = (val) => {
  return equipmentStatsTransform(val)
}

// 卸下全部
const handleUnequipAll = () => {
  unequipAll(gameMain.value)
}

const saleEquipmentShow = (id, mode) => {
  emits('equipmentSale', id, mode);
};
const handleEquipmentShow = (item, isHover = false, isTrans = false) => {
  emits('handleEquipmentShow', item, isHover, isTrans);
};
const equipOrUnequipEquipment = (type, id) => {
  emits('equipOrUnequipEquipment', type, id);
};
const closeMenuBackpack = () => {
  emits('update:menuBackpackOpen', false);
  closeInventory(gameMain.value)
};
</script>

<style lang="scss" scoped></style>
