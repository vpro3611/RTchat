<script setup lang="ts">
import {AuthStore} from "stores/auth_store";
import {ref} from "vue";
import CreateGroupDialog from "components/CreateGroupDialog.vue";
const dialogRef = ref();
</script>

<template>
  <q-page class="flex flex-center main-welcome-page">
    <div class="text-center q-pa-lg welcome-container">
      <!-- Animated Background elements -->
      <div class="aurora-element aurora-1"></div>
      <div class="aurora-element aurora-2"></div>
      
      <div class="content-wrapper relative-position">
        <div class="icon-container q-mb-xl">
          <q-icon 
            name="forum" 
            size="120px" 
            color="primary" 
            class="welcome-icon"
          />
          <div class="icon-pulse"></div>
        </div>
        
        <h1 class="text-h3 text-weight-bold q-mb-md welcome-title">
          Welcome back, <span class="text-primary">{{AuthStore.user?.username}}</span>!
        </h1>
        
        <p class="text-h6 text-grey-7 q-mb-xl welcome-subtitle">
          Select a chat from the sidebar to start chatting,<br/>
          or create a new group to connect with others.
        </p>

        <div class="row justify-center q-gutter-md action-row">
          <q-btn
            unelevated
            rounded
            color="primary"
            icon="group_add"
            label="Create New Group"
            size="lg"
            class="action-btn"
            @click="dialogRef.openDialog()"
          />
        </div>
      </div>
    </div>

    <CreateGroupDialog ref="dialogRef" />
  </q-page>
</template>

<style scoped>
.main-welcome-page {
  background: #f8fafc;
  overflow: hidden;
  position: relative;
}

.body--dark .main-welcome-page {
  background: #0f172a;
}

.welcome-container {
  max-width: 800px;
  width: 100%;
  z-index: 1;
}

.icon-container {
  position: relative;
  display: inline-block;
}

.welcome-icon {
  position: relative;
  z-index: 2;
  filter: drop-shadow(0 10px 15px rgba(25, 118, 210, 0.2));
  animation: float 6s ease-in-out infinite;
}

.icon-pulse {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100px;
  height: 100px;
  background: rgba(25, 118, 210, 0.1);
  border-radius: 50%;
  z-index: 1;
  animation: pulse 4s ease-in-out infinite;
}

.welcome-title {
  color: #1e293b;
  letter-spacing: -0.02em;
  font-family: 'Inter', 'Roboto', sans-serif;
}

.body--dark .welcome-title {
  color: #f1f5f9;
}

.welcome-subtitle {
  line-height: 1.6;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
}

.action-row {
  margin-top: 40px;
}

.action-btn {
  padding: 12px 36px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: 600;
  text-transform: none;
  letter-spacing: 0.01em;
}

.action-btn:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px -10px rgba(25, 118, 210, 0.4);
}

/* Aurora Elements */
.aurora-element {
  position: absolute;
  width: 500px;
  height: 500px;
  filter: blur(100px);
  opacity: 0.12;
  border-radius: 50%;
  z-index: 0;
  pointer-events: none;
}

.aurora-1 {
  background: radial-gradient(circle, #1976d2 0%, transparent 70%);
  top: -150px;
  left: -150px;
  animation: move 20s infinite alternate;
}

.aurora-2 {
  background: radial-gradient(circle, #26a69a 0%, transparent 70%);
  bottom: -150px;
  right: -150px;
  animation: move 25s infinite alternate-reverse;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-15px); }
}

@keyframes pulse {
  0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.5; }
  50% { transform: translate(-50%, -50%) scale(1.5); opacity: 0.1; }
  100% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.5; }
}

@keyframes move {
  0% { transform: translate(0, 0) rotate(0deg); }
  100% { transform: translate(150px, 100px) rotate(30deg); }
}

.content-wrapper {
  z-index: 10;
}
</style>
