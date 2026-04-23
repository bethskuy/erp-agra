<template>
  <q-page class="bg-grey-2 q-pa-lg">
    <div class="row items-center justify-between q-mb-lg">
      <div>
        <div class="row items-center">
          <q-btn
            flat
            round
            icon="arrow_back"
            color="teal-10"
            @click="$router.back()"
            class="q-mr-sm"
          />
          <div class="text-h4 text-weight-bold text-teal-10">
            {{ wo?.kode || 'Loading...' }}
          </div>
        </div>
        <div class="text-subtitle2 text-grey-6 q-ml-xl">
          Product: {{ wo?.productName || wo?.produk }}
        </div>
      </div>

      <div class="row q-gutter-sm">
        <q-btn
          color="teal-10"
          label="Start Production"
          icon="play_arrow"
          @click="startProduction"
          v-if="status === 'Pending'"
        />
        <q-btn
          color="positive"
          label="Mark as Done"
          icon="check"
          @click="finishProduction"
          v-if="status === 'Proses'"
        />
      </div>
    </div>

    <q-card flat class="q-mb-lg rounded-borders shadow-sm bg-teal-10 text-white">
      <q-card-section class="row items-center justify-between">
        <div class="row items-center">
          <q-icon name="apartment" size="md" class="q-mr-md" />
          <div>
            <div class="text-subtitle2 opacity-70">Target Project (Construction)</div>
            <div class="text-h6 text-weight-bold">
              {{ projectName || 'General Stock / No Project' }}
            </div>
          </div>
        </div>
        <q-badge outline color="white" v-if="wo?.project_id">Integrasi Aktif</q-badge>
      </q-card-section>
    </q-card>

    <q-card flat class="q-mb-lg rounded-borders shadow-sm">
      <q-card-section class="row justify-around items-center">
        <div class="text-center">
          <div class="text-subtitle2 text-grey-7">Target Order</div>
          <div class="text-h5 text-weight-bold">{{ wo?.jumlah }} Unit</div>
        </div>
        <q-separator vertical inset />
        <div class="text-center">
          <div class="text-subtitle2 text-grey-7">Progress</div>
          <div class="text-h5 text-weight-bold text-teal">{{ progress }}%</div>
        </div>
        <q-separator vertical inset />
        <div class="text-center">
          <div class="text-subtitle2 text-grey-7">Status</div>
          <div class="text-h5 text-weight-bold">
            <q-badge :color="getStatusColor(status)" class="q-pa-sm">
              {{ status }}
            </q-badge>
          </div>
        </div>
      </q-card-section>
      <q-linear-progress :value="progress / 100" color="teal" size="10px" />
    </q-card>

    <q-card flat class="q-mb-lg rounded-borders shadow-sm bg-white" v-if="status !== 'Selesai'">
      <q-card-section class="row items-center q-gutter-md">
        <div class="text-subtitle1 text-weight-bold text-teal-10">Recording Production Result:</div>
        <q-input
          outlined
          dense
          v-model.number="inputHasil"
          type="number"
          label="Jumlah Hasil"
          style="width: 150px"
        />
        <q-input
          outlined
          dense
          v-model="inputKeterangan"
          label="Catatan / QC"
          style="flex-grow: 1"
        />
        <q-btn color="teal-10" icon="add" label="Submit & Deduct Stock" @click="tambahHasil" />
      </q-card-section>
    </q-card>

    <q-card flat class="rounded-borders shadow-sm">
      <q-tabs v-model="tab" class="text-teal-10" align="left" inline-label>
        <q-tab name="components" icon="extension" label="Components (BOM)" />
        <q-tab name="result" icon="assignment_turned_in" label="Results" />
        <q-tab name="steps" icon="format_list_numbered" label="Work Steps" />
        <q-tab name="timeline" icon="history" label="Log History" />
      </q-tabs>

      <q-separator />

      <q-tab-panels v-model="tab" animated>
        <q-tab-panel name="components">
          <q-table
            :rows="bomComponents"
            :columns="compColumns"
            row-key="materialId"
            flat
            bordered
            hide-bottom
          >
            <template v-slot:body-cell-to_consume="props">
              <q-td :props="props" class="text-weight-bold">
                {{ props.row.qty * (wo?.jumlah || 1) }} {{ props.row.satuan }}
              </q-td>
            </template>
            <template v-slot:body-cell-status="props">
              <q-td :props="props">
                <q-badge
                  :color="
                    props.row.stok >= props.row.qty * (wo?.jumlah || 1) ? 'positive' : 'negative'
                  "
                >
                  {{
                    props.row.stok >= props.row.qty * (wo?.jumlah || 1)
                      ? 'Ready'
                      : 'Insufficient Stock'
                  }}
                </q-badge>
              </q-td>
            </template>
          </q-table>
        </q-tab-panel>

        <q-tab-panel name="result">
          <q-table :rows="results" :columns="resultColumns" row-key="id" flat bordered />
        </q-tab-panel>

        <q-tab-panel name="steps">
          <q-table :rows="steps" :columns="stepColumns" flat bordered>
            <template v-slot:body-cell-status="props">
              <q-td :props="props">
                <q-badge :color="getStatusColor(props.row.status)">{{ props.row.status }}</q-badge>
              </q-td>
            </template>
            <template v-slot:body-cell-action="props">
              <q-td :props="props">
                <q-btn
                  dense
                  flat
                  icon="check_circle"
                  color="positive"
                  @click="markStepDone(props.row)"
                  v-if="props.row.status !== 'Selesai'"
                />
              </q-td>
            </template>
          </q-table>
        </q-tab-panel>

        <q-tab-panel name="timeline">
          <q-timeline color="teal-10" class="q-px-md">
            <q-timeline-entry
              v-for="log in logs"
              :key="log.id"
              :title="log.activity"
              :subtitle="formatDate(log.created_at)"
              :icon="log.activity === 'Start' ? 'play_arrow' : 'history'"
            >
              {{ log.description }}
            </q-timeline-entry>
          </q-timeline>
        </q-tab-panel>
      </q-tab-panels>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import { db } from 'src/boot/firebase'
import {
  doc,
  getDoc,
  collection,
  addDoc,
  updateDoc,
  onSnapshot,
  query,
  where,
  getDocs,
  increment,
} from 'firebase/firestore'

const route = useRoute()
const $q = useQuasar()

// STATE
const wo = ref(null)
const projectName = ref('')
const results = ref([])
const steps = ref([])
const logs = ref([])
const bomComponents = ref([])
const tab = ref('components')
const inputHasil = ref(0)
const inputKeterangan = ref('')

// LOGIKA PROGRESS
const progress = computed(() => {
  if (!wo.value || !wo.value.jumlah) return 0
  const total = results.value.reduce((sum, r) => sum + Number(r.jumlah_hasil || 0), 0)
  return Math.min(100, Math.round((total / wo.value.jumlah) * 100))
})

const status = computed(() => {
  if (progress.value === 0) return 'Pending'
  if (progress.value < 100) return 'Proses'
  return 'Selesai'
})

// LOAD DATA
const loadData = async () => {
  const id = route.params.id
  if (!id) return

  const woSnap = await getDoc(doc(db, 'work_orders', id))
  if (woSnap.exists()) {
    wo.value = { id: woSnap.id, ...woSnap.data() }
    loadBOM(wo.value.productName || wo.value.produk)

    if (wo.value.project_id) {
      const projSnap = await getDoc(doc(db, 'projects', wo.value.project_id))
      if (projSnap.exists()) {
        projectName.value = projSnap.data().nama_proyek || projSnap.data().name
      }
    }
  }

  onSnapshot(
    query(collection(db, 'production_results'), where('work_order_id', '==', id)),
    (snap) => {
      results.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    },
  )

  onSnapshot(
    query(collection(db, 'production_steps'), where('work_order_id', '==', id)),
    (snap) => {
      steps.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    },
  )

  onSnapshot(query(collection(db, 'production_logs'), where('work_order_id', '==', id)), (snap) => {
    logs.value = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .sort((a, b) => b.created_at - a.created_at)
  })
}

const loadBOM = async (productName) => {
  const q = query(collection(db, 'boms'), where('productName', '==', productName))
  const snap = await getDocs(q)
  if (!snap.empty) {
    const materials = snap.docs[0].data().materials
    const list = []
    for (const m of materials) {
      const matSnap = await getDoc(doc(db, 'materials', m.materialId))
      list.push({ ...m, stok: matSnap.exists() ? matSnap.data().stok : 0 })
    }
    bomComponents.value = list
  }
}

// ACTION: INPUT HASIL & POTONG STOK
const tambahHasil = async () => {
  if (inputHasil.value <= 0) return

  $q.loading.show({ message: 'Updating Inventory...' })
  try {
    await addDoc(collection(db, 'production_results'), {
      work_order_id: route.params.id,
      jumlah_hasil: inputHasil.value,
      keterangan: inputKeterangan.value,
      created_at: new Date(),
    })

    for (const item of bomComponents.value) {
      const materialRef = doc(db, 'materials', item.materialId)
      const totalPotong = item.qty * inputHasil.value
      await updateDoc(materialRef, { stok: increment(-totalPotong) })
    }

    await addDoc(collection(db, 'production_logs'), {
      work_order_id: route.params.id,
      activity: 'Production Update',
      description: `Produced ${inputHasil.value} units. Raw materials deducted.`,
      created_at: new Date(),
    })

    inputHasil.value = 0
    inputKeterangan.value = ''
    $q.notify({ type: 'positive', message: 'Inventory Updated!' })
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: 'System Error' })
  } finally {
    $q.loading.hide()
  }
}

const markStepDone = async (step) => {
  await updateDoc(doc(db, 'production_steps', step.id), { status: 'Selesai' })
}

const startProduction = async () => {
  await addDoc(collection(db, 'production_logs'), {
    work_order_id: route.params.id,
    activity: 'Start',
    description: 'Production line activated.',
    created_at: new Date(),
  })
}

const finishProduction = async () => {
  await addDoc(collection(db, 'production_logs'), {
    work_order_id: route.params.id,
    activity: 'Finished',
    description: 'Production fully completed.',
    created_at: new Date(),
  })
  // Optional: update status WO di sini jika diperlukan
}

// UTILS
const formatDate = (d) => (d?.toDate ? d.toDate().toLocaleString() : '-')
const getStatusColor = (s) => (s === 'Selesai' ? 'positive' : s === 'Proses' ? 'orange' : 'grey')

const compColumns = [
  { name: 'nama', label: 'Component', field: 'nama', align: 'left' },
  { name: 'to_consume', label: 'To Consume', align: 'right' },
  { name: 'stok', label: 'Reserved Stock', field: 'stok', align: 'right' },
  { name: 'status', label: 'Availability', align: 'center' },
]

const resultColumns = [
  { name: 'tgl', label: 'Date', field: (row) => formatDate(row.created_at), align: 'left' },
  { name: 'jumlah', label: 'Qty', field: 'jumlah_hasil', align: 'center' },
  { name: 'ket', label: 'Notes', field: 'keterangan', align: 'left' },
]

const stepColumns = [
  { name: 'nama_step', label: 'Operation', field: 'nama_step', align: 'left' },
  { name: 'status', label: 'Status', align: 'center' },
  { name: 'action', label: 'Action', align: 'center' },
]

onMounted(loadData)
</script>

<style scoped>
.rounded-borders {
  border-radius: 12px;
}
.shadow-sm {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}
.opacity-70 {
  opacity: 0.7;
}
</style>
