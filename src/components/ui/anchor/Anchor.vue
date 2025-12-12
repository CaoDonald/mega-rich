<script setup lang="ts">
import { computed, type HTMLAttributes } from 'vue'

const props = defineProps<{ class?: HTMLAttributes['class'] }>()

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props

  return delegated
})
</script>
<template>
  <a
    v-bind="delegatedProps"
    class="group text-center underline block text-sm w-full items-center rounded-md border border-transparent px-2 py-1 font-semibold text-muted-foreground"
    :class="props.class"
  >
    <slot />
  </a>
</template>
