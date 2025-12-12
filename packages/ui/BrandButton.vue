<template>
  <Button
    v-bind="attrs"
    :class="classNames"
    :style="appearance?.style?.button"
    :disabled="loading"
  >
    <slot></slot>
  </Button>
</template>

<script setup lang="ts">
import colors from 'tailwindcss/colors'
import { computed, useAttrs } from 'vue'
import { colord } from 'colord'
import { css } from '@stitches/core'
import { generateClassNames } from '@supabase/auth-ui-shared'

import { Appearance } from '../types'
import { Button } from '../../src/components/ui/button'

const attrs = useAttrs()

interface BrandButtonProps {
  appearance?: Appearance
  brand?: keyof typeof colors
  loading?: boolean
}

const props = withDefaults(defineProps<BrandButtonProps>(), {
  brand: 'emerald',
  loading: false
})

const classNames = computed(() => {
  const baseColor = colors[props.brand]['500']
  const hoverColor = colord(baseColor).darken(0.08).toRgbString()

  const brandButtonStyle = css({
    color: '#fff',
    backgroundColor: baseColor,
    transition: 'background-color 0.3s ease',
    '&:hover': {
      backgroundColor: hoverColor
    }
  })

  const names = generateClassNames(
    'button',
    brandButtonStyle(),
    props.appearance
  )
  return names.join(' ')
})
</script>
