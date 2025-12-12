<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '~/lib'
import { useVModel } from '@vueuse/core'
import { Appearance } from '@/types'

const props = defineProps<{
  defaultValue?: string | number
  modelValue?: string | number
  shape?: Appearance['shape']
  class?: HTMLAttributes['class']
  appearance?: Appearance
}>()

const emits = defineEmits<{
  (e: 'update:modelValue', payload: string | number): void
}>()

const modelValue = useVModel(props, 'modelValue', emits, {
  passive: true,
  defaultValue: props.defaultValue
})

const shapeVariant = {
  rounded: 'rounded-md',
  square: 'rounded-none',
  pill: 'rounded-full'
}
</script>

<template>
  <input
    v-model="modelValue"
    :style="props.appearance?.style?.input"
    :class="
      cn(
        'flex h-9 w-full border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
        props.class,
        shapeVariant[props.shape ?? 'rounded']
      )
    "
  />
</template>
