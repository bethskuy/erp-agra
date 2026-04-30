<template>
  <q-page class="q-pa-md bg-grey-2">
    <div class="text-h5 text-weight-bold text-teal-10 q-mb-md">Step 4: Visual Check</div>
    <q-card class="shadow-sm">
      <q-card-section>
        <p class="text-caption">Cek permukaan barang, pastikan tidak ada penyok atau karat.</p>
        <div class="row q-col-gutter-md">
          <q-input v-model.number="qty_ok" type="number" label="Visual OK" outlined class="col-6" />
          <q-input v-model.number="qty_ng" type="number" label="Visual NG" outlined class="col-6" />
        </div>
        <q-btn color="teal-10" label="Lanjut ke Final Packing" class="q-mt-md full-width" @click="next" />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()
const qty_ok = ref(0); const qty_ng = ref(0)
const next = () => router.push('/manufaktur/proses-packing/packing')
</script>

