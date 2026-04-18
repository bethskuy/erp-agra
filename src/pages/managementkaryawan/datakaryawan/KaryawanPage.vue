<template>
  <q-page class="bg-grey-2 q-pa-lg">
    <div class="row items-center justify-between q-mb-md">
      <div>
        <div class="text-h5 text-weight-bold text-blue-grey-9">Data Karyawan</div>
        <div class="text-caption text-grey-7">Kelola daftar seluruh karyawan Agra ERP</div>
      </div>
      <q-btn
        color="blue-grey-9"
        icon="add"
        label="Tambah Karyawan"
        @click="showDialog = true"
        unelevated
      />
    </div>

    <q-card flat bordered class="rounded-borders shadow-1">
      <q-table :rows="karyawanList" :columns="columns" row-key="id" flat>
        <template v-slot:body-cell-actions="props">
          <q-td :props="props">
            <q-btn flat round icon="edit" color="primary" @click="editKaryawan(props.row)" />
            <q-btn
              flat
              round
              icon="delete"
              color="negative"
              @click="deleteKaryawan(props.row.id)"
            />
          </q-td>
        </template>
      </q-table>
    </q-card>

    <q-dialog v-model="showDialog" persistent>
      <q-card style="width: 400px">
        <q-card-section>
          <div class="text-h6">{{ form.id ? 'Edit' : 'Tambah' }} Karyawan</div>
        </q-card-section>

        <q-card-section>
          <q-form @submit="saveKaryawan" class="q-gutter-md">
            <q-input
              outlined
              v-model="form.nama"
              label="Nama Lengkap"
              lazy-rules
              :rules="[(val) => !!val || 'Wajib diisi']"
            />
            <q-input outlined v-model="form.email" label="Email" type="email" />
            <q-input outlined v-model="form.role" label="Jabatan/Role" />

            <div class="row justify-end q-mt-lg">
              <q-btn label="Batal" flat v-close-popup class="q-mr-sm" />
              <q-btn label="Simpan" type="submit" color="primary" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { db } from 'src/boot/firebase'
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const karyawanList = ref([])
const showDialog = ref(false)
const form = ref({ id: null, nama: '', email: '', role: '' })

const columns = [
  { name: 'nama', label: 'NAMA', field: 'nama', align: 'left' },
  { name: 'email', label: 'EMAIL', field: 'email', align: 'left' },
  { name: 'role', label: 'JABATAN', field: 'role', align: 'left' },
  { name: 'actions', label: 'AKSI', field: 'actions', align: 'center' },
]

// Ambil data real-time
onMounted(() => {
  onSnapshot(collection(db, 'karyawan'), (snapshot) => {
    karyawanList.value = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  })
})

const saveKaryawan = async () => {
  try {
    if (form.value.id) {
      await updateDoc(doc(db, 'karyawan', form.value.id), { ...form.value })
    } else {
      await addDoc(collection(db, 'karyawan'), { ...form.value })
    }
    $q.notify({ type: 'positive', message: 'Data berhasil disimpan!' })
    showDialog.value = false
    form.value = { id: null, nama: '', email: '', role: '' }
  } catch (e) {
    $q.notify({ type: 'negative', message: 'Gagal simpan: ' + e.message })
  }
}

const editKaryawan = (data) => {
  form.value = { ...data }
  showDialog.value = true
}

const deleteKaryawan = async (id) => {
  if (confirm('Hapus data karyawan ini?')) {
    await deleteDoc(doc(db, 'karyawan', id))
  }
}
</script>

<style scoped>
.rounded-borders {
  border-radius: 12px;
}
</style>
