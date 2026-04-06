<script setup lang="ts">
import { ref, onUnmounted, onMounted, computed } from 'vue';
import { useQuasar } from 'quasar';

declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext;
  }
}

const props = defineProps<{
  disabled?: boolean;
}>();

const emit = defineEmits<{
  (e: 'record-complete', blob: Blob): void;
}>();

const $q = useQuasar();

const isRecording = ref(false);
const isMounted = ref(false);

onMounted(() => {
  isMounted.value = true;
});

const recordingTime = ref(0);
const timerInterval = ref<NodeJS.Timeout | null>(null);
const mediaRecorder = ref<MediaRecorder | null>(null);
const audioChunks = ref<Blob[]>([]);

// Audio Visualizer
const canvasRef = ref<HTMLCanvasElement | null>(null);
const audioContext = ref<AudioContext | null>(null);
const analyser = ref<AnalyserNode | null>(null);
const animationFrame = ref<number | null>(null);

const formattedTime = computed(() => {
  const mins = Math.floor(recordingTime.value / 60);
  const secs = recordingTime.value % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
});

async function startRecording() {
  if (props.disabled || isRecording.value) return;
  
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioChunks.value = [];
    
    // Setup Audio Visualizer
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    audioContext.value = new AudioContextClass();
    analyser.value = audioContext.value.createAnalyser();
    const source = audioContext.value.createMediaStreamSource(stream);
    source.connect(analyser.value);
    analyser.value.fftSize = 256;
    drawWaveform();

    const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
      ? 'audio/webm;codecs=opus' 
      : (MediaRecorder.isTypeSupported('audio/mp4') ? 'audio/mp4' : '');

    mediaRecorder.value = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);

    mediaRecorder.value.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        audioChunks.value.push(event.data);
      }
    };

    mediaRecorder.value.onstop = () => {
      const type = mimeType || 'audio/webm';
      const audioBlob = new Blob(audioChunks.value, { type });
      if (recordingTime.value >= 1 && audioBlob.size > 0) {
        emit('record-complete', audioBlob);
      }
      stream.getTracks().forEach(track => track.stop());
      stopVisualizer();
    };

    mediaRecorder.value.start(500);
    isRecording.value = true;
    recordingTime.value = 0;
    
    timerInterval.value = setInterval(() => {
      recordingTime.value++;
      if (recordingTime.value >= 600) {
        stopRecording();
      }
    }, 1000);

    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
  } catch (err) {
    console.error('Error accessing microphone:', err);
    $q.notify({ type: 'negative', message: 'Microphone access denied' });
  }
}

function drawWaveform() {
  if (!canvasRef.value || !analyser.value) return;
  
  const canvas = canvasRef.value;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const bufferLength = analyser.value.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  const draw = () => {
    if (!isRecording.value) return;
    animationFrame.value = requestAnimationFrame(draw);
    analyser.value!.getByteFrequencyData(dataArray);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const barWidth = (canvas.width / bufferLength) * 2.5;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      const barHeight = (dataArray[i] ?? 0 / 255) * canvas.height;
      
      // Use Primary color for wave
      ctx.fillStyle = $q.dark.isActive ? '#3b82f6' : '#2563eb';
      ctx.fillRect(x, (canvas.height - barHeight) / 2, barWidth, barHeight);

      x += barWidth + 1;
    }
  };

  draw();
}

function stopVisualizer() {
  if (animationFrame.value) cancelAnimationFrame(animationFrame.value);
  if (audioContext.value) void audioContext.value.close();
  audioContext.value = null;
  analyser.value = null;
}

function stopRecording() {
  if (mediaRecorder.value && mediaRecorder.value.state !== 'inactive') {
    mediaRecorder.value.stop();
  }
  cleanup();
}

function cancelRecording() {
  if (mediaRecorder.value && mediaRecorder.value.state !== 'inactive') {
    mediaRecorder.value.onstop = null;
    mediaRecorder.value.stop();
  }
  cleanup();
  $q.notify({ message: 'Recording cancelled', timeout: 1000, position: 'bottom' });
}

function cleanup() {
  if (timerInterval.value) {
    clearInterval(timerInterval.value);
    timerInterval.value = null;
  }
  isRecording.value = false;
  stopVisualizer();
}

onUnmounted(() => {
  stopRecording();
});

defineExpose({
  startRecording,
  stopRecording,
  cancelRecording
});
</script>

<template>
  <div class="voice-recorder-container">
    <!-- Recording Overlay -->
    <Teleport to="#chat-input-row" v-if="isMounted">
      <transition
        enter-active-class="animated fadeIn"
        leave-active-class="animated fadeOut"
      >
        <div v-if="isRecording" class="recording-overlay row items-center no-wrap q-px-sm shadow-2">
          <q-icon name="mic" color="negative" class="blink q-mr-sm" size="20px" />
          <div class="text-weight-bold text-negative q-mr-md" style="min-width: 35px">{{ formattedTime }}</div>
          
          <div class="col relative-position flex flex-center overflow-hidden" style="height: 30px">
            <canvas ref="canvasRef" width="200" height="30" class="waveform-canvas"></canvas>
          </div>

          <div class="row items-center no-wrap">
            <q-btn flat round dense color="negative" icon="delete" @click="cancelRecording" size="sm" class="q-mr-xs" />
            <q-btn round flat color="positive" icon="send" @click="stopRecording" />
          </div>
        </div>
      </transition>
    </Teleport>

    <!-- Trigger Button - Just Click to Start -->
    <q-btn
      v-if="!isRecording"
      @click="startRecording"
      flat round dense
      icon="mic"
      color="grey-7"
      :disable="disabled"
      class="mic-btn"
    >
      <q-tooltip>Click to record</q-tooltip>
    </q-btn>
  </div>
</template>

<style scoped>
.voice-recorder-container {
  display: flex;
  align-items: center;
  position: relative;
}

.recording-overlay {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  top: 0;
  background: white;
  z-index: 105;
  border-radius: 8px; /* Slightly more square like the input */
  display: flex;
  align-items: center;
  padding: 0 12px;
}

.body--dark .recording-overlay {
  background: #1e1e1e;
}

.blink {
  animation: blink-animation 1s steps(5, start) infinite;
}

@keyframes blink-animation {
  to { visibility: hidden; }
}

.waveform-canvas {
  width: 100%;
  height: 100%;
}

.mic-btn {
  transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.mic-btn:hover {
  color: var(--q-primary) !important;
}
</style>
