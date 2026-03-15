<script setup lang="ts">
import LoginPage from "pages/LoginPage.vue"
import RegisterPage from "pages/RegisterPage.vue"
</script>

<template>
  <q-page class="q-pa-xl flex flex-center">

    <div style="max-width: 900px; width:100%">

      <div class="text-h4 text-center q-mb-lg">
        Welcome
      </div>

      <div class="text-subtitle1 text-center q-mb-xl">
        Login or create an account
      </div>

      <div class="row q-col-gutter-lg">

        <div class="col-12 col-md-6">
          <q-card class="q-pa-md">
            <RegisterPage />
          </q-card>
        </div>

        <div class="col-12 col-md-6">
          <q-card class="q-pa-md">
            <LoginPage />
          </q-card>
        </div>

      </div>

    </div>

  </q-page>
</template>
