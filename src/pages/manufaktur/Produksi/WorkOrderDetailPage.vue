<template>
  <q-page class="bg-grey-2 q-pa-lg">

    <!-- HEADER -->
    <div class="row items-center justify-between q-mb-lg">
      <div>
        <div class="text-h4 text-weight-bold text-teal-10">
          {{ wo.kode }}
        </div>
        <div class="text-subtitle2 text-grey-6">
          {{ wo.produk }}
        </div>
      </div>

      <div class="row q-gutter-sm">
        <q-btn color="primary" label="Start" icon="play_arrow" @click="startProduction" />
        <q-btn color="positive" label="Finish" icon="check" @click="finishProduction" />
        <q-btn flat icon="arrow_back" @click="$router.back()" />
      </div>
    </div>

    <!-- INFO -->
    <q-card class="q-mb-lg">
      <q-card-section class="row justify-between">
        <div>
          <div class="text-subtitle2">Jumlah Order</div>
          <div class="text-h6">{{ wo.jumlah }}</div>
        </div>

        <div>
          <div class="text-subtitle2">Progress</div>
          <div class="text-h6 text-teal">{{ progress }}%</div>
        </div>

        <div>
          <q-badge :color="getStatusColor(status)">
            {{ status }}
          </q-badge>
        </div>
      </q-card-section>

      <q-linear-progress :value="progress / 100" color="teal" size="12px" />
    </q-card>

    <!-- INPUT HASIL -->
    <q-card class="q-mb-lg">
      <q-card-section class="row items-center q-gutter-md">
        <q-input v-model.number="inputHasil" type="number" label="Jumlah Hasil" style="width: 200px" />
        <q-input v-model="inputKeterangan" label="Keterangan" style="width: 300px" />

        <q-btn color="primary" icon="add" label="Input Hasil" @click="tambahHasil" />
      </q-card-section>
    </q-card>

    <!-- TABS -->
    <q-tabs v-model="tab" class="text-teal">
      <q-tab name="result" label="Production Result" />
      <q-tab name="steps" label="Production Steps" />
      <q-tab name="timeline" label="Timeline" />
    </q-tabs>

    <q-separator />

    <q-tab-panels v-model="tab" animated>

      <!-- RESULT -->
      <q-tab-panel name="result">
        <q-table :rows="results" :columns="resultColumns" row-key="id" />
      </q-tab-panel>

      <!-- STEPS -->
      <q-tab-panel name="steps">
        <q-table :rows="steps" :columns="stepColumns" row-key="id">
          <template v-slot:body-cell-status="props">
            <q-td>
              <q-badge :color="getStatusColor(props.row.status)">
                {{ props.row.status }}
              </q-badge>
            </q-td>
          </template>

          <!-- 🔥 tombol DONE -->
          <template v-slot:body-cell-action="props">
            <q-td>
              <q-btn
                dense flat icon="check" color="positive"
                @click="markStepDone(props.row)"
              />
            </q-td>
          </template>
        </q-table>
      </q-tab-panel>

      <!-- TIMELINE -->
      <q-tab-panel name="timeline">
        <q-timeline color="teal">
          <q-timeline-entry
            v-for="log in logs"
            :key="log.id"
            :title="log.activity"
            :subtitle="formatDate(log.created_at)"
          >
            {{ log.description }}
          </q-timeline-entry>
        </q-timeline>
      </q-tab-panel>

    </q-tab-panels>

  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

// FIREBASE
import { db } from 'src/boot/firebase'
import {
  doc,
  getDoc,
  collection,
  addDoc,
  updateDoc,
  onSnapshot
} from 'firebase/firestore'

const route = useRoute()

const wo = ref({})
const results = ref([])
const steps = ref([])
const logs = ref([])

const progress = ref(0)
const status = ref('Pending')
const tab = ref('result')

const inputHasil = ref(0)
const inputKeterangan = ref('')

// ================= REALTIME =================
const listenData = () => {
  const id = route.params.id

  onSnapshot(collection(db, 'production_results'), (snap) => {
    results.value = snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .filter(r => r.work_order_id === id)
    hitungProgress()
  })

  onSnapshot(collection(db, 'production_steps'), (snap) => {
    steps.value = snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .filter(s => s.work_order_id === id)
  })

  onSnapshot(collection(db, 'production_logs'), (snap) => {
    logs.value = snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .filter(l => l.work_order_id === id)
  })
}

// ================= LOAD WO =================
const loadWO = async () => {
  const id = route.params.id
  const woSnap = await getDoc(doc(db, 'work_orders', id))
  wo.value = woSnap.data()
}

// ================= PROGRESS =================
const hitungProgress = () => {
  const totalHasil = results.value.reduce((sum, r) => sum + Number(r.jumlah_hasil || 0), 0)

  if (wo.value.jumlah > 0) {
    progress.value = Math.min(100, Math.round((totalHasil / wo.value.jumlah) * 100))
  }

  if (progress.value === 0) status.value = 'Pending'
  else if (progress.value < 100) status.value = 'Proses'
  else status.value = 'Selesai'
}

// ================= TAMBAH HASIL =================
const tambahHasil = async () => {
  if (!inputHasil.value || inputHasil.value <= 0) return

  const total = results.value.reduce((s, r) => s + Number(r.jumlah_hasil || 0), 0)

  if (total + inputHasil.value > wo.value.jumlah) {
    alert('Over produksi!')
    return
  }

  await addDoc(collection(db, 'production_results'), {
    work_order_id: route.params.id,
    jumlah_hasil: inputHasil.value,
    keterangan: inputKeterangan.value,
    created_at: new Date(),
  })

  await addDoc(collection(db, 'production_logs'), {
    work_order_id: route.params.id,
    activity: 'Input Result',
    description: `Tambah ${inputHasil.value}`,
    created_at: new Date(),
  })

  inputHasil.value = 0
  inputKeterangan.value = ''
}

// ================= STEP DONE =================
const markStepDone = async (step) => {
  await updateDoc(doc(db, 'production_steps', step.id), {
    status: 'Selesai'
  })

  await addDoc(collection(db, 'production_logs'), {
    work_order_id: route.params.id,
    activity: 'Step Done',
    description: `${step.nama_step} selesai`,
    created_at: new Date(),
  })
}

// ================= ACTION =================
const startProduction = async () => {
  await addDoc(collection(db, 'production_logs'), {
    work_order_id: route.params.id,
    activity: 'Start',
    description: 'Produksi dimulai',
    created_at: new Date(),
  })
}

const finishProduction = async () => {
  await addDoc(collection(db, 'production_logs'), {
    work_order_id: route.params.id,
    activity: 'Finish',
    description: 'Produksi selesai',
    created_at: new Date(),
  })
}

// ================= UTIL =================
const formatDate = (d) => {
  if (!d) return '-'
  return new Date(d.seconds * 1000).toLocaleString()
}

const getStatusColor = (s) => {
  if (s === 'Pending') return 'grey'
  if (s === 'Proses') return 'orange'
  if (s === 'Selesai') return 'positive'
}

// ================= LOAD =================
onMounted(async () => {
  await loadWO()
  listenData()
})
</script>
