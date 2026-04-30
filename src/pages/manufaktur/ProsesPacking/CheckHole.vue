<template>
  <q-page class="q-pa-md bg-grey-2">
    <div class="row items-center q-mb-md">
      <q-btn icon="arrow_back" flat round dense to="/manufaktur/proses-packing/check-pin" class="q-mr-sm" />
      <div>
        <div class="text-h5 text-weight-bold text-teal-10">Step 2: Check Hole</div>
        <div class="text-subtitle2 text-grey-7">Project: PT. Kiyokuni Teknologi</div>
      </div>
    </div>

    <div class="row q-col-gutter-md">
      <div class="col-12 col-md-6">
        <q-card class="shadow-sm">
          <q-card-section class="bg-teal-7 text-white">Input Hasil Cek Hole (Lubang)</q-card-section>
          <q-card-section class="q-gutter-y-md">
            <q-input v-model="form.noBatch" label="Nomor Batch / Lot" outlined dense readonly />
            <div class="row q-col-gutter-sm">
              <q-input v-model.number="form.qty_ok" type="number" label="QTY OK" outlined color="positive" class="col-6" />
              <q-input v-model.number="form.qty_ng" type="number" label="QTY NG" outlined color="negative" class="col-6" />
            </div>
          </q-card-section>
          <q-card-actions align="right" class="q-pa-md">
            <q-btn color="teal-10" icon="send" label="Lanjut ke Step 3 (Tapping)" @click="submitToNext" />
          </q-card-actions>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()
const form = ref({ noBatch: 'AUTO-FROM-STEP1', qty_ok: 0, qty_ng: 0 })
const submitToNext = () => router.push('/manufaktur/proses-packing/check-tapping')
</script>
