<template>
  <Dialog
    :open="equipmentShow"
    class="z-[100]"
  >
    <DialogOverlay class="fixed inset-0 z-[100] bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
    <DialogContent
      class="w-fit z-[100] rounded-lg p-2"
      @escapeKeyDown.prevent
      @closeAutoFocus.prevent
    >
      <VisuallyHidden>
        <DialogHeader>
          <DialogTitle></DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
      </VisuallyHidden>
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
          v-for="stat in equipment.statsTransform"
        >
          {{ stat.label }}+{{ ["critRate","critDmg","atkSpd","vamp"].includes(stat.key)?dealFloatFixed(stat.value):stat.value }}{{ stat.unit }}
        </p>
        <div class="flex my-2">
          <Button
            variant="outline"
            class="hover:bg-[hsl(var(--foreground))] hover:text-[hsl(var(--background))] hover:transition-all text-base border-white mr-2"
            v-show="equipmentType==='Equip'"
            @click="equipOrUnequipEquipment('equip',equipment)"
          >
            装备
          </Button>
          <Button
            variant="outline"
            class="hover:bg-[hsl(var(--foreground))] hover:text-[hsl(var(--background))] hover:transition-all text-base border-white mr-2"
            v-show="equipmentType==='Unequip'"
            @click="equipOrUnequipEquipment('unequip',equipment)"
          >
            脱下
          </Button>
          <Button
            variant="outline"
            class="text-[#fde047] hover:bg-[hsl(var(--foreground))] hover:text-[hsl(var(--background))] hover:transition-all text-base border-white mr-2"
            @click="saleEquipmentShow(equipment)"
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
          <Button
            variant="outline"
            class="hover:bg-[hsl(var(--foreground))] hover:text-[hsl(var(--background))] hover:transition-all text-base border-white"
            @click="closeEquipmentShow"
          >
            关闭
          </Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>

<script setup>
import {
  DialogOverlay,
} from 'radix-vue';
import { Button } from '@/components/ui/button'
import { nFormatter } from "../lib/utils";
import {
  // components
  Dialog, DialogContent, DialogHeader, DialogTitle, VisuallyHidden, DialogDescription
} from '../lib/import'
const props = defineProps({
  equipmentType: { type: String, default: 'Equip' },
  equipment: { type: Object, default: null },
  equipmentShow: { type: Boolean, required: true },
  getRarityLabel: { type: Function, required: true },
  getRarityColor: { type: Function, required: true },
  dealFloatFixed: { type: Function, required: true },
});
const emits = defineEmits([
  'closeEquipmentShow',
  'equipOrUnequipEquipment',
  'equipmentSale',
]);

const closeEquipmentShow = () => {
  emits('closeEquipmentShow');
};

const saleEquipmentShow = (equipment) => {
  emits('equipmentSale', equipment.raw.id, 'click');
};

const equipOrUnequipEquipment = (type, equipment) => {
  emits('equipOrUnequipEquipment', type, equipment.raw.id);
};
</script>
