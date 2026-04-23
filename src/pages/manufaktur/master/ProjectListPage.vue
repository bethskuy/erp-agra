<template>
  <q-page class="q-pa-md bg-grey-2">
    <div class="row items-center justify-between q-mb-md">
      <div class="row items-center">
        <q-icon name="apartment" size="md" color="indigo" class="q-mr-sm" />
        <div class="text-h5 text-teal-10 text-weight-bold">Database Proyek</div>
      </div>
      <q-btn color="indigo" icon="add" label="Proyek Baru" unelevated @click="formProject = true" />
    </div>

    <div v-if="loading" class="text-center q-pa-xl">
      <q-spinner-ios color="indigo" size="40px" />
    </div>

    <div v-else class="row q-col-gutter-md">
      <div v-for="p in proyekList" :key="p.id" class="col-12 col-md-4">
        <q-card flat bordered class="shadow-sm">
          <q-card-section class="bg-indigo text-white">
            <div class="text-subtitle2">{{ p.kode }}</div>
            <div class="text-h6">{{ p.nama }}</div>
          </q-card-section>

          <q-card-section>
            <div class="text-caption">PM: {{ p.pm }}</div>
            <div class="text-caption">Lokasi: {{ p.lokasi }}</div>
          </q-card-section>

          <q-separator />

          <q-card-actions align="right">
            <q-btn flat color="red" icon="delete" size="sm" @click="confirmDelete(p)" />
          </q-card-actions>
        </q-card>
      </div>
    </div>

    <q-dialog v-model="formProject">
      <q-card style="min-width: 350px">
        <q-card-section class="bg-indigo text-white">Input Proyek</q-card-section>
        <q-card-section class="q-gutter-sm">
          <q-input v-model="newP.kode" label="Kode" outlined dense />
          <q-input v-model="newP.nama" label="Nama Proyek" outlined dense />
          <q-input v-model="newP.pm" label="PM" outlined dense />
          <q-input v-model="newP.lokasi" label="Lokasi" outlined dense />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn v-close-popup label="Batal" flat color="grey" />
          <q-btn label="Simpan Proyek" color="indigo" unelevated @click="addProject" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { db } from 'src/boot/firebase'
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore'

const $q = useQuasar()
const loading = ref(true)
const formProject = ref(false)
const proyekList = ref([])
const newP = ref({ kode: '', nama: '', pm: '', lokasi: '', status: 'Aktif' })

onMounted(() => {
  const q = query(collection(db, 'proyek'), orderBy('createdAt', 'desc'))
  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      proyekList.value = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
      loading.value = false
    },
    (err) => {
      console.error('Firestore Error:', err)
    },
  )
  return () => unsubscribe()
})

const addProject = async () => {
  if (!newP.value.nama) return
  try {
    $q.loading.show()
    await addDoc(collection(db, 'proyek'), {
      ...newP.value,
      createdAt: serverTimestamp(),
    })
    $q.notify({ message: 'Berhasil simpan ke Cloud!', color: 'indigo' })
    formProject.value = false
    newP.value = { kode: '', nama: '', pm: '', lokasi: '', status: 'Aktif' }
  } catch (err) {
    console.error(err)
    $q.notify({ message: 'Gagal simpan', color: 'red' })
  } finally {
    $q.loading.hide()
  }
}

const confirmDelete = (p) => {
  $q.dialog({ title: 'Hapus', message: `Hapus ${p.nama}?`, cancel: true }).onOk(async () => {
    try {
      await deleteDoc(doc(db, 'proyek', p.id))
      $q.notify({ message: 'Data dihapus', color: 'black' })
    } catch (err) {
      console.error(err)
    }
  })
}
</script>
