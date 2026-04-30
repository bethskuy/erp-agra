<template>
  <q-page class="q-pa-md bg-grey-2">
    <!-- Header Step 1 -->
    <div class="row items-center q-mb-md">
      <q-btn icon="arrow_back" flat round dense to="/manufaktur/proses-packing" class="q-mr-sm" />
      <div>
        <div class="text-h5 text-weight-bold text-teal-10">Step 1: Check Pin Go No Go</div>
        <div class="text-subtitle2 text-grey-7">Project: PT. Kiyokuni Teknologi</div>
      </div>
      <q-space />
      <q-badge color="teal-10" label="PROSES AWAL" class="q-pa-sm" />
    </div>

    <div class="row q-col-gutter-md">
      <!-- Input Area -->
      <div class="col-12 col-md-6">
        <q-card class="shadow-sm">
          <q-card-section class="bg-teal-7 text-white">
            <div class="text-subtitle1">Input Hasil Cek Pin</div>
          </q-card-section>

          <q-card-section class="q-gutter-y-md">
            <q-input v-model="form.noBatch" label="Nomor Batch / Lot" outlined dense placeholder="Contoh: LOT-001" />

            <div class="row q-col-gutter-sm">
              <q-input
                v-model.number="form.qty_ok"
                type="number"
                label="QTY PASSED (OK)"
                outlined
                color="positive"
                class="col-6"
              />
              <q-input
                v-model.number="form.qty_ng"
                type="number"
                label="QTY REJECT (NG)"
                outlined
                color="negative"
                class="col-6"
              />
            </div>

            <q-select
              v-model="form.alatUkur"
              :options="['Pin Gauge A', 'Pin Gauge B', 'Custom Gauge']"
              label="Alat Ukur yang Digunakan"
              outlined
              dense
            />
          </q-card-section>

          <q-card-actions align="right" class="q-pa-md">
            <q-btn color="teal-10" icon="send" label="Oper ke Step 2 (Check Hole)" @click="submitToNextStep" />
          </q-card-actions>
        </q-card>
      </div>

      <!-- Pedoman QC Area -->
      <div class="col-12 col-md-6">
        <q-card class="shadow-sm border-teal">
          <q-card-section class="text-bold text-teal-10">
            <q-icon name="info" /> Standar Pengecekan Pin:
          </q-card-section>
          <q-card-section class="text-caption">
            <ul>
              <li>Pastikan Pin Go masuk dengan lancar.</li>
              <li>Pastikan Pin No-Go tidak bisa masuk sama sekali.</li>
              <li>Cek kebersihan area pin dari gram atau sisa oli.</li>
            </ul>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { db } from 'src/boot/firebase'
import { collection, addDoc } from 'firebase/firestore'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'

const $q = useQuasar()
const router = useRouter()

const form = ref({
  noBatch: '',
  qty_ok: 0,
  qty_ng: 0,
  alatUkur: '',
  step_name: 'Check Pin Go No Go'
})

const submitToNextStep = async () => {
  if (form.value.qty_ok <= 0) {
    $q.notify({ type: 'warning', message: 'Input QTY OK dulu bang!' })
    return
  }

  $q.loading.show()
  try {
    // Simpan hasil step 1 ke database
    await addDoc(collection(db, 'produksi_steps_history'), {
      ...form.value,
      timestamp: new Date(),
      next_step: 'Check Hole'
    })

    $q.notify({ type: 'positive', message: 'Step 1 Selesai! Lanjut ke Check Hole' })

    // Setelah simpan, otomatis arahkan ke file step berikutnya
    router.push('/manufaktur/proses-packing/check-hole')
  } catch (e) {
    console.error(e)
  } finally {
    $q.loading.hide()
  }
}
</script>
