<script setup lang="ts">
import { useRoute, useRouter } from "vue-router"

const route = useRoute()
const router = useRouter()

const status = route.query.status

setTimeout(() => {
  router.push("/auth")
}, 4000)
</script>

<template>
  <section class="container">

    <h2 v-if="status === 'success'">
      Email verified successfully
      You will be redirected to login page in a couple of seconds (in case not, click the button below)
    </h2>

    <h2 v-if="status === 'error'">
      Verification link is invalid or expired
    </h2>

    <p v-if="status === 'success'">
      Your account has been verified. You can now login.
    </p>

    <p v-if="status === 'error'">
      Please request a new verification email.
    </p>

    <button @click="$router.push('/auth')">
      Go to login
    </button>

  </section>
</template>