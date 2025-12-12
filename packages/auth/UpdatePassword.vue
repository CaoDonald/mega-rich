<template>
  <form
    :id="`auth-${authView}`"
    @submit.prevent="handleSubmit"
    autoComplete="on"
    :style="{
      width: '100%'
    }"
  >
    <Container direction="vertical" gap="large" :appearance="appearance">
      <div>
        <Label htmlFor="password_label" :appearance="appearance">
          {{ labels?.password_label }}
        </Label>
        <Input
          id="password"
          type="password"
          name="password"
          autofocus
          :shape="appearance?.shape"
          :placeholder="labels?.password_input_placeholder"
          :appearance="appearance"
          v-model="password"
        />
      </div>

      <BrandButton
        type="submit"
        :loading="isLoading"
        :shape="appearance?.shape"
        :brand="appearance?.brand"
        :appearance="appearance"
      >
        {{ isLoading ? labels?.loading_button_label : labels?.button_label }}
      </BrandButton>
    </Container>

    <Message v-if="message" :appearance="appearance">{{ message }}</Message>

    <Message v-if="error" color="danger" :appearance="appearance">
      {{ error }}
    </Message>
  </form>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import { SupabaseClient } from '@supabase/supabase-js'

import {
  AuthViewKey,
  type Appearance,
  type AuthViewInjection,
  type AuthI18nVariables
} from '../types'
import {
  Button,
  BrandButton,
  Container,
  Input,
  Label,
  Message
} from '../ui/index'
import { injectStrict } from '../utils'

export interface UpdatePasswordProps {
  appearance?: Appearance
  supabaseClient: SupabaseClient
  i18n?: AuthI18nVariables
}

const props = withDefaults(defineProps<UpdatePasswordProps>(), {})

const password = ref('')
const error = ref('')
const message = ref('')
const isLoading = ref(false)

const { authView } = injectStrict<AuthViewInjection>(AuthViewKey)

const labels = computed(
  () => props.i18n?.[authView.value] as AuthI18nVariables['update_password']
)

const handleSubmit = async (e: Event) => {
  // console.log(props)
  error.value = ''
  message.value = ''
  isLoading.value = true
  const { error: updateError } = await props.supabaseClient.auth.updateUser({
    password: password.value
  })
  if (updateError) {
    error.value = updateError.message
  } else {
    message.value = props.i18n?.update_password?.confirmation_text as string
  }
  isLoading.value = false
}
</script>
