<template>
  <q-page class="q-pa-md bg-grey-2">
    <div class="row items-center q-mb-md">
      <q-btn icon="arrow_back" flat round dense to="/manufaktur/proses-packing/check-hole" class="q-mr-sm" />
      <div class="text-h5 text-weight-bold text-teal-10">Step 3: Check Tapping</div>
    </div>
    <q-card class="max-width-600 shadow-sm">
      <q-card-section class="q-gutter-y-md">
        <div class="row q-col-gutter-sm">
          <q-input v-model.number="form.qty_ok" type="number" label="QTY OK" outlined class="col-6" />
          <q-input v-model.number="form.qty_ng" type="number" label="QTY NG" outlined class="col-6" />
        </div>
        <q-btn color="teal-10" class="full-width" label="Oper ke Step 4 (Visual)" @click="submitToNext" />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()
const form = ref({ qty_ok: 0, qty_ng: 0 })
const submitToNext = () => router.push('/manufaktur/proses-packing/visual-check')
</script>

