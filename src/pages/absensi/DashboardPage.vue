<template>
  <q-page padding>
    <div class="row justify-center q-pt-lg">
      <q-card class="col-12 col-md-6 shadow-2">
        <q-card-section class="bg-primary text-white text-center">
          <div class="text-h6">Pusat Absensi Karyawan</div>
          <div class="text-subtitle2">Silakan pilih status kehadiran Anda</div>
        </q-card-section>

        <q-card-section class="q-pa-xl text-center">
          <div class="row q-col-gutter-lg justify-center">
            <div class="col-6">
              <q-btn
                stack
                color="positive"
                icon="login"
                label="Masuk"
                class="full-width q-py-md"
                @click="simpanAbsen('Masuk')"
              />
            </div>
            <div class="col-6">
              <q-btn
                stack
                color="negative"
                icon="logout"
                label="Keluar"
                class="full-width q-py-md"
                @click="simpanAbsen('Keluar')"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
const simpanAbsen = (tipe) => {
  alert('Anda mencoba melakukan absen: ' + tipe)
}
</script>
