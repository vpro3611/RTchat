<script setup lang="ts">
import { AuthStore } from "stores/auth_store"


</script>



<template>

  <q-page class="flex flex-center">

    <q-card style="width:400px">

      <q-card-section class="text-center">

        <q-avatar size="80px">
          <q-icon name="person" size="50px" />
        </q-avatar>

        <div class="text-h6 q-mt-md">
          {{ AuthStore.user?.username }}
        </div>

        <div class="text-caption text-grey">
          {{ AuthStore.user?.email }}
        </div>

      </q-card-section>

      <q-separator />

      <q-card-section v-if="AuthStore.user">

        <div class="q-mb-sm">
          <strong>ID:</strong> {{ AuthStore.user.id }}
        </div>

        <div class="q-mb-sm">
          <strong>Verified:</strong>
          {{ AuthStore.user.isVerified ? "Yes" : "No" }}
        </div>

        <div class="q-mb-sm">
          <strong>Active:</strong>
          {{ AuthStore.user.isActive ? "Yes" : "No" }}
        </div>

        <div class="q-mb-sm">
          <strong>Last seen:</strong>
          {{ new Date(AuthStore.user.lastSeenAt).toLocaleString() }}
        </div>

        <div class="q-mb-sm">
          <strong>Created at:</strong>
          {{ new Date(AuthStore.user.createdAt).toLocaleString() }}
        </div>

        <div class="q-mb-sm">
          <strong>Updated at:</strong>
          {{ new Date(AuthStore.user.updatedAt).toLocaleString() }}
        </div>

      </q-card-section>

    </q-card>

  </q-page>

</template>
