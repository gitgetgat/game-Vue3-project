<template>
  <AlertDialog
    :open="saleEquipmentOpen"
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
      <div v-if="equipment">
        <div class="text-base flex items-center mb-3">
          出售
          <span
            v-html="equipment.icon"
            :style="`color:${getRarityColor(equipment.rarity)}`"
          ></span>
          <span :style="`color:${getRarityColor(equipment.rarity)}`">{{ getRarityLabel(equipment.rarity) }}的{{ equipment.category.label }}</span>
        </div>
        <div class="flex items-center justify-center space-x-2">
          <Button
            variant="outline"
            class="hover:bg-[hsl(var(--foreground))] hover:text-[hsl(var(--background))] hover:transition-all text-base border-white"
            @click="closeSaleEquipment"
          >
            取消
          </Button>
          <Button
            variant="outline"
            class="hover:bg-[hsl(var(--foreground))] hover:text-[hsl(var(--background))] hover:transition-all text-base border-white"
            @click="handleSaleEquipment(equipment)"
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
import { VisuallyHidden } from '../lib/import'
import { Button } from '@/components/ui/button'
const props = defineProps({
  saleEquipmentOpen: { type: Boolean, required: false },
  equipment: { type: Object, default: null },
  getRarityLabel: { type: Function, required: true },
  getRarityColor: { type: Function, required: true },
});
const emits = defineEmits([
  'update:saleEquipmentOpen',
  'equipmentSale',
  'closeSaleEquipment',
]);

const closeSaleEquipment = () => {
  emits('closeSaleEquipment');
};
const handleSaleEquipment = (equipment) => {
  emits('equipmentSale', equipment.id || equipment.raw.id);
  emits('update:saleEquipmentOpen', false);
}

</script>