<template>
  <q-page class="q-pa-md bg-grey-2">
    <!-- Header Khusus Project -->
    <div class="row items-center q-mb-md">
      <div>
        <div class="text-h5 text-weight-bold text-teal-10">Proses Packing Staywire</div>
        <div class="text-subtitle2 text-primary">Project: PT. Kiyokuni Teknologi</div>
      </div>
      <q-space />
      <q-btn color="teal-10" icon="add" label="Mulai Batch Packing Baru" @click="showForm = true" />
    </div>

    <!-- Daftar Antrian Packing -->
    <div class="row q-col-gutter-md">
      <div v-for="item in packingList" :key="item.id" class="col-12 col-md-4">
        <q-card class="shadow-sm rounded-borders">
          <q-card-section class="bg-teal-9 text-white">
            <div class="row items-center no-wrap">
              <div class="col">
                <div class="text-h6">{{ item.noBatch }}</div>
                <div class="text-caption">Ref PO: {{ item.noPO }}</div>
              </div>
              <q-badge color="white" text-color="teal-10" class="text-bold">
                {{ item.progress }}%
              </q-badge>
            </div>
          </q-card-section>

          <q-card-section>
            <div class="text-subtitle2 q-mb-xs">Status Flow (5 Steps):</div>
            <q-linear-progress
              :value="item.progress / 100"
              color="teal"
              class="q-mb-md"
              size="10px"
              stripe
            />

            <q-list dense>
              <q-item v-for="step in item.steps" :key="step.nama" class="q-px-none">
                <q-item-section avatar>
                  <q-icon
                    :name="step.completed ? 'check_circle' : 'radio_button_unchecked'"
                    :color="step.completed ? 'positive' : 'grey-5'"
                    size="20px"
                  />
                </q-item-section>
                <q-item-section :class="step.completed ? 'text-teal-10 text-bold' : 'text-grey-7'">
                  {{ step.nama }}
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>

          <q-separator />

          <q-card-actions align="right">
            <q-btn
              flat
              color="primary"
              label="Input Hasil & QC"
              icon="edit_note"
              @click="openDetail(item.id)"
            />
          </q-card-actions>
        </q-card>
      </div>
    </div>

    <!-- Dialog Start New Batch -->
    <q-dialog v-model="showForm" persistent>
      <q-card style="min-width: 450px">
        <q-card-section>
          <div class="text-h6 text-teal-10 text-weight-bold">Rilis Produksi Staywire</div>
        </q-card-section>

        <q-card-section class="q-gutter-md">
          <q-select
            v-model="selectedPO"
            :options="poOptions"
            label="Pilih PO Customer (Kiyokuni)"
            outlined
            dense
            emit-value
            map-options
            @update:model-value="syncData"
          />
          <q-input
            v-model="form.noBatch"
            label="Nomor Batch Produksi"
            outlined
            dense
            placeholder="Contoh: BATCH-001"
          />
          <q-input
            v-model.number="form.qtyTarget"
            type="number"
            label="Qty Target Packing"
            outlined
            dense
          />
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Batal" v-close-popup />
          <q-btn color="teal-10" label="Buka Jalur Produksi" @click="startProduction" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { db } from 'src/boot/firebase'
import { collection, addDoc, onSnapshot, query, orderBy, getDocs } from 'firebase/firestore'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const router = useRouter()
const showForm = ref(false)
const packingList = ref([])
const poOptions = ref([])
const selectedPO = ref(null)

const form = ref({
  po_id: '',
  noPO: '',
  noBatch: '',
  qtyTarget: 0,
  progress: 0,
  project: 'PT. Kiyokuni Teknologi',
})

// Fungsi memproses data awal
const loadData = async () => {
  const poSnap = await getDocs(collection(db, 'purchase_orders_customer'))
  poOptions.value = poSnap.docs.map((d) => ({ label: d.data().noPO, value: d.id, data: d.data() }))

  onSnapshot(query(collection(db, 'produksi_staywire'), orderBy('created_at', 'desc')), (snap) => {
    packingList.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  })
}

const syncData = (val) => {
  const po = poOptions.value.find((p) => p.value === val)
  if (po) {
    form.value.po_id = val
    form.value.noPO = po.data.noPO
    form.value.qtyTarget = po.data.qty
  }
}

const startProduction = async () => {
  $q.loading.show()
  try {
    // 5 Tahapan sesuai revisi.jpeg
    const stepsData = [
      { nama: 'Check Pin Go No Go', completed: false },
      { nama: 'Check Hole', completed: false },
      { nama: 'Check Tapping', completed: false },
      { nama: 'Visual Check', completed: false },
      { nama: 'Packing', completed: false },
    ]

    await addDoc(collection(db, 'produksi_staywire'), {
      ...form.value,
      steps: stepsData,
      created_at: new Date(),
    })

    $q.notify({ type: 'positive', message: 'Batch Produksi Berhasil Dibuka' })
    showForm.value = false
  } catch (e) {
    console.error(e)
  } finally {
    $q.loading.hide()
  }
}

const openDetail = (id) => router.push(`/manufaktur/proses-packing/${id}`)

onMounted(loadData)
</script>
