<script lang="ts" setup>
import {
  Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Icon } from '@iconify/vue'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import {
  HoverCard, HoverCardContent, HoverCardTrigger,
} from '@/components/ui/hover-card'
import { onMounted, ref, watchEffect, computed } from 'vue'
import { useColorMode } from '@vueuse/core'

const mode = useColorMode()
const toggleState = ref(false)
watchEffect(() => {
  mode.value = toggleState.value ? 'light' : 'dark'
})
const selectVal = ref('Common')
const menuBackpackOpen = ref(false)
const gameCfgOpen = ref(false)
const menuCfgOpen = ref(false)
const equipmentCategoriesFilterList = [
  { value: 'All', label: '全部', color: '#C1BCBC' },
  { value: 'Common', label: '普通', color: '#ffffff' },
  { value: 'Uncommon', label: '罕见', color: '#1eff00' },
  { value: 'Rare', label: '稀有', color: '#0070dd' },
  { value: 'Epic', label: '史诗', color: '#a335ee' },
  { value: 'Legendary', label: '传说', color: '#ffd700' },
  { value: 'Heirloom', label: '神器', color: '#e30b5c' },
]

const defaultValue = 'autoCombat'


const selectValItem = computed(() => equipmentCategoriesFilterList.find(e => e.value === selectVal.value))
const handleOpenBackpackCfg = () => {
  selectVal.value = 'Common'
  menuBackpackOpen.value = true
}
const handleOpenMenuCfg = () => {
  menuCfgOpen.value = true
}
onMounted(() => {
  mode.value = 'dark'
})

</script>

<template>
  <div class="container mx-auto flex flex-col h-screen w-[40rem] max-w-screen-sm">
    <div class="flex justify-between items-center border mt-4 mb-3 h-fit w-full rounded-lg py-1">
      <p class="playerIcon grow ml-2 flex">
        <Icon
          icon="basil:user-solid"
          class="!size-6 mr-1"
        />
        <span class="pr-2">UserName</span>
        <span>等级 3</span>
      </p>
      <p class="grow flex flex-col">
        <span class="py-0.5">经验值</span>
        <span class="pb-0.5">236/331（22.22%）</span>
      </p>
      <p class="grow flex text-center">
        <Icon
          icon="mdi:gold"
          class="!size-6 mr-1"
        />
        <span>999</span>
      </p>
      <p class="grow-0 mx-1 top-panel-menu-button hover-button">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger as="Icon">
              <Icon
                icon="jam:backpack-f"
                class="!size-6 border-none"
                @click="handleOpenBackpackCfg"
              />
            </TooltipTrigger>
            <TooltipContent>
              <p>背包</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <Dialog v-model:open.sync="menuBackpackOpen">
          <DialogContent class="w-fit">
            <DialogHeader>
              <DialogTitle>背包</DialogTitle>
            </DialogHeader>
            <div class="flex flex-col items-center space-x-2">
              <div class="flex items-center">
                <div class="text-center px-4 cursor-pointer border rounded-lg hover:bg-[hsl(var(--foreground))] hover:text-[hsl(var(--background))] hover:transition-all  mx-0 min-w-fit py-1 text-base flex  flex-col items-center">
                  <Icon
                    icon="hugeicons:sale-tag-01"
                    class="!size-6 mr-1"
                  />
                  <di class="">出售
                  </di>
                </div>
                <Select v-model="selectVal">
                  <SelectTrigger class="w-[180px] ml-3">
                    <SelectValue
                      :style="`color:${selectValItem.color}`"
                      class="flex items-center"
                      placeholder="Select a fruit"
                    >
                      <Icon
                        icon="lsicon:filter-outline"
                        class="!size-6 mr-2"
                      />
                      <span>{{ selectValItem.label }}</span>
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
                class="flex items-center text-sm leading-6 hover:bg-white/20 rounded-sm"
                v-for="i in 600"
              >
                <Icon
                  icon="mdi:gold"
                  class="!size-4 mx-3"
                />
                <span>传家宝链甲</span>
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
                        />
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <p>卸下全部装备</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </CardTitle>
              </CardHeader>
              <CardContent class="grid grid-cols-3 gap-2 px-4 pb-4">
                <HoverCard
                  v-for="i in 6"
                  :key="i"
                >
                  <HoverCardTrigger as-child>
                    <div class="text-center py-2 border rounded-lg cursor-pointer">
                      <Icon
                        icon="game-icons:broadsword"
                        class="!size-6 inline-block"
                      />
                    </div>
                  </HoverCardTrigger>
                  <HoverCardContent class="w-80">
                    <div class="flex justify-between space-x-4">
                      <div class="space-y-1">
                        <h4 class="text-sm font-semibold">
                          @vuejs
                        </h4>
                        <p class="text-sm">
                          Progressive JavaScript framework for building modern web interfaces.
                        </p>
                        <div class="flex items-center pt-2">
                          <span class="text-xs text-muted-foreground">
                            Joined January 2014
                          </span>
                        </div>
                      </div>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              </CardContent>
            </Card>
          </DialogContent>
        </Dialog>
      </p>
      <p class="grow-0 mr-2 top-panel-menu-button hover-button">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger as="Icon">
              <Icon
                icon="fluent:list-rtl-16-filled"
                class="!size-6 border-none"
                @click="handleOpenMenuCfg"
              />
            </TooltipTrigger>
            <TooltipContent>
              <p>菜单</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <Dialog v-model:open.sync="menuCfgOpen">
          <DialogContent class="w-fit">
            <DialogHeader>
              <DialogTitle>菜单</DialogTitle>
            </DialogHeader>
            <div class="flex flex-col items-center space-x-2">
              <div class="hover-menu-button w-full align-middle">
                <Icon
                  icon="basil:user-solid"
                  class="!size-6 border-none inline-block"
                />
                UserName
              </div>
              <div class="hover-menu-button w-full">
                本轮游戏
              </div>
              <Dialog v-model:open.sync="gameCfgOpen">
                <DialogContent class="w-60">
                  <DialogHeader>
                    <DialogTitle>游戏设置</DialogTitle>
                  </DialogHeader>
                  <div class="flex flex-col items-center space-x-2">
                    <Accordion
                      type="single"
                      class="w-full"
                      collapsible
                      :default-value="defaultValue"
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
                          <div>普通怪</div>
                          <div>守层BOSS</div>
                          <div>精英BOSS</div>
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
                          <div>藏宝室宝箱</div>
                          <div>战斗宝箱</div>
                          <div>祝福雕像 or 等级</div>
                          <div>祝福雕像 or 等级</div>
                          <div>升级 Buff</div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>
                </DialogContent>
              </Dialog>
              <div
                class="hover-menu-button w-full"
                @click="gameCfgOpen = true"
              >
                设置
              </div>
              <div class="hover-menu-button w-full">
                导出/导入 存档
              </div>
              <div class="hover-menu-button w-full">
                放弃
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </p>
    </div>
    <div class="flex mb-3 h-fit w-full">
      <div class="mid-panel-box mr-3">
        <div class="mid-panel-title">属性</div>
        <div class="flex my-1">
          <Icon
            icon="typcn:heart-full-outline"
            class="!size-6 mr-1"
          />
          <span>生命值：</span>
        </div>
        <div class="flex my-1">
          <Icon
            icon="game-icons:rune-sword"
            class="!size-6 mr-1"
          />
          <span>攻击：</span>
        </div>
        <div class="flex my-1">
          <Icon
            icon="game-icons:breastplate"
            class="!size-6 mr-1"
          />
          <span>防御：</span>
        </div>
        <div class="flex my-1">
          <Icon
            icon="game-icons:blade-fall"
            class="!size-6 mr-1"
          />
          <span>攻击速度：</span>
        </div>
        <div class="flex my-1">
          <Icon
            icon="game-icons:charm"
            class="!size-6 mr-1"
          />
          <span>吸血：</span>
        </div>
        <div class="flex my-1">
          <Icon
            icon="game-icons:zeus-sword"
            class="!size-6 mr-1"
          />
          <span>暴击率：</span>
        </div>
        <div class="flex my-1">
          <Icon
            icon="game-icons:gooey-sword"
            class="!size-6 mr-1"
          />
          <span>暴击伤害：</span>
        </div>
      </div>
      <div class="mid-panel-box">
        <div class="mid-panel-title">属性加成</div>
        <div class="flex my-1">
          <Icon
            icon="typcn:heart-full-outline"
            class="!size-6 mr-1"
          />
          <span>生命值+</span>
        </div>
        <div class="flex my-1">
          <Icon
            icon="game-icons:rune-sword"
            class="!size-6 mr-1"
          />
          <span>攻击+</span>
        </div>
        <div class="flex my-1">
          <Icon
            icon="game-icons:breastplate"
            class="!size-6 mr-1"
          />
          <span>防御+</span>
        </div>
        <div class="flex my-1">
          <Icon
            icon="game-icons:blade-fall"
            class="!size-6 mr-1"
          />
          <span>攻击速度+</span>
        </div>
        <div class="flex my-1">
          <Icon
            icon="game-icons:charm"
            class="!size-6 mr-1"
          />
          <span>吸血+</span>
        </div>
        <div class="flex my-1">
          <Icon
            icon="game-icons:zeus-sword"
            class="!size-6 mr-1"
          />
          <span>暴击率+</span>
        </div>
        <div class="flex my-1">
          <Icon
            icon="game-icons:gooey-sword"
            class="!size-6 mr-1"
          />
          <span>暴击伤害+</span>
        </div>
      </div>
    </div>
    <div class="flex justify-between mb-3 h-fit w-full">
      <div class="py-2">00:00:00</div>
      <div class="py-2">层数 1</div>
      <div class="py-2">房间 1</div>
      <div>
        <Button
          variant="secondary"
          class="hover:bg-[hsl(var(--foreground))] hover:text-[hsl(var(--background))] hover:transition-all text-base"
        >
          探索
        </Button>
      </div>
    </div>
    <!-- <div class="flex-1 border mb-2 rounded-lg"></div> -->
    <ScrollArea class="flex-1 mb-2 rounded-lg border p-4">
      Jokester began sneaking into the castle in the middle of the night and leaving
      jokes all over the place: under the king's pillow, in his soup, even in the
      royal toilet. The king was furious, but he couldn't seem to stop Jokester. And
      then, one day, the people of the kingdom discovered that the jokes left by
      Jokester were so funny that they couldn't help but laugh. And once they
      started laughing, they couldn't stop.
      Jokester began sneaking into the castle in the middle of the night and leaving
      jokes all over the place: under the king's pillow, in his soup, even in the
      royal toilet. The king was furious, but he couldn't seem to stop Jokester. And
      then, one day, the people of the kingdom discovered that the jokes left by
      Jokester were so funny that they couldn't help but laugh. And once they
      started laughing, they couldn't stop.
      Jokester began sneaking into the castle in the middle of the night and leaving
      jokes all over the place: under the king's pillow, in his soup, even in the
      royal toilet. The king was furious, but he couldn't seem to stop Jokester. And
      then, one day, the people of the kingdom discovered that the jokes left by
      Jokester were so funny that they couldn't help but laugh. And once they
      started laughing, they couldn't stop.
      Jokester began sneaking into the castle in the middle of the night and leaving
      jokes all over the place: under the king's pillow, in his soup, even in the
      royal toilet. The king was furious, but he couldn't seem to stop Jokester. And
      then, one day, the people of the kingdom discovered that the jokes left by
      Jokester were so funny that they couldn't help but laugh. And once they
      started laughing, they couldn't stop.
      Jokester began sneaking into the castle in the middle of the night and leaving
      jokes all over the place: under the king's pillow, in his soup, even in the
      royal toilet. The king was furious, but he couldn't seem to stop Jokester. And
      then, one day, the people of the kingdom discovered that the jokes left by
      Jokester were so funny that they couldn't help but laugh. And once they
      started laughing, they couldn't stop.
      Jokester began sneaking into the castle in the middle of the night and leaving
      jokes all over the place: under the king's pillow, in his soup, even in the
      royal toilet. The king was furious, but he couldn't seem to stop Jokester. And
      then, one day, the people of the kingdom discovered that the jokes left by
      Jokester were so funny that they couldn't help but laugh. And once they
      started laughing, they couldn't stop.
      Jokester began sneaking into the castle in the middle of the night and leaving
      jokes all over the place: under the king's pillow, in his soup, even in the
      royal toilet. The king was furious, but he couldn't seem to stop Jokester. And
      then, one day, the people of the kingdom discovered that the jokes left by
      Jokester were so funny that they couldn't help but laugh. And once they
      started laughing, they couldn't stop.
      Jokester began sneaking into the castle in the middle of the night and leaving
      jokes all over the place: under the king's pillow, in his soup, even in the
      royal toilet. The king was furious, but he couldn't seem to stop Jokester. And
      then, one day, the people of the kingdom discovered that the jokes left by
      Jokester were so funny that they couldn't help but laugh. And once they
      started laughing, they couldn't stop.
      Jokester began sneaking into the castle in the middle of the night and leaving
      jokes all over the place: under the king's pillow, in his soup, even in the
      royal toilet. The king was furious, but he couldn't seem to stop Jokester. And
      then, one day, the people of the kingdom discovered that the jokes left by
      Jokester were so funny that they couldn't help but laugh. And once they
      started laughing, they couldn't stop.
      Jokester began sneaking into the castle in the middle of the night and leaving
      jokes all over the place: under the king's pillow, in his soup, even in the
      royal toilet. The king was furious, but he couldn't seem to stop Jokester. And
      then, one day, the people of the kingdom discovered that the jokes left by
      Jokester were so funny that they couldn't help but laugh. And once they
      started laughing, they couldn't stop.
    </ScrollArea>
  </div>
</template>