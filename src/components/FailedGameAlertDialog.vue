<template>
  <AlertDialog :open="menuQuitOpen">
    <AlertDialogOverlay class="fixed inset-0 z-[50] bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
    <AlertDialogContent
      class="w-fit mobile:w-3/5 rounded-lg"
      @escapeKeyDown.prevent
    >
      <AlertDialogHeader>
        <AlertDialogTitle>是否放弃本局游戏？</AlertDialogTitle>
        <VisuallyHidden>
          <AlertDialogDescription></AlertDialogDescription>
        </VisuallyHidden>
      </AlertDialogHeader>
      <AlertDialogFooter class="flex items-center flex-row justify-around">
        <Button
          variant="outline"
          class="hover:bg-[hsl(var(--foreground))] hover:text-[hsl(var(--background))] hover:transition-all text-base border-white"
          @click="closeEquipmentShow"
        >
          取消
        </Button>
        <Button
          variant="outline"
          class="hover:bg-[hsl(var(--foreground))] hover:text-[hsl(var(--background))] hover:transition-all text-base border-white"
          @click="handleFailedGame"
        >
          放弃
        </Button>
      </AlertDialogFooter>
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
  menuQuitOpen: { type: Boolean, required: true },
});
const emits = defineEmits([
  'update:menuQuitOpen',
  'failedGame',
]);

const closeEquipmentShow = () => {
  emits('update:menuQuitOpen', false);
};
const handleFailedGame = () => {
  emits('failedGame');
}

</script>