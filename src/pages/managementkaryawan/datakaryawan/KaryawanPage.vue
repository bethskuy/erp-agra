<template>
  <q-page class="bg-grey-2 q-pa-lg">
    <div class="row items-center justify-between q-mb-md">
      <div>
        <div class="text-h5 text-weight-bold text-blue-grey-9">Data Karyawan</div>
      </div>
      <q-btn
        color="blue-grey-9"
        icon="add"
        label="Tambah Karyawan"
        @click="openDialog"
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

    <q-dialog v-model="showDialog" persistent maximized>
      <q-card>
        <q-toolbar class="bg-blue-grey-9 text-white">
          <q-toolbar-title>{{ form.id ? 'Edit' : 'Tambah' }} Data Karyawan</q-toolbar-title>
          <q-btn flat v-close-popup icon="close" />
        </q-toolbar>

        <q-card-section>
          <q-form @submit="saveKaryawan" class="q-gutter-md">
            <q-input outlined v-model="form.nik" label="NIK" required />
            <q-input outlined v-model="form.nama" label="Nama Lengkap" required />
            <q-input
              outlined
              v-model="form.email"
              label="Email Login"
              :readonly="!!form.id"
              required
            />
            <q-input
              outlined
              v-model="form.password"
              label="Password (Isi jika baru)"
              type="password"
            />
            <q-select
              outlined
              v-model="form.role"
              :options="['Admin', 'Super Admin', 'Staff']"
              label="Role"
            />

            <div class="text-subtitle2">Hak Akses Modul:</div>
            <div class="row q-gutter-sm">
              <q-checkbox v-model="form.akses" val="konstruksi" label="Konstruksi" />
              <q-checkbox v-model="form.akses" val="absensi" label="Absensi" />
              <q-checkbox v-model="form.akses" val="manufaktur" label="Manufaktur" />
            </div>

            <q-btn
              label="Simpan Data"
              type="submit"
              color="primary"
              unelevated
              :loading="loading"
            />
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { db, auth } from 'src/boot/firebase'
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const loading = ref(false)
const showDialog = ref(false)
const karyawanList = ref([])
const form = ref({ id: null, nik: '', nama: '', email: '', password: '', role: 'Staff', akses: [] })

const columns = [
  { name: 'nik', label: 'NIK', field: 'nik', align: 'left' },
  { name: 'nama', label: 'NAMA', field: 'nama', align: 'left' },
  { name: 'email', label: 'EMAIL', field: 'email', align: 'left' },
  { name: 'actions', label: 'AKSI', field: 'actions', align: 'center' },
]

const openDialog = () => {
  form.value = { id: null, nik: '', nama: '', email: '', password: '', role: 'Staff', akses: [] }
  showDialog.value = true
}

// FUNGSI UTAMA YANG DIPERBAIKI
const saveKaryawan = async () => {
  loading.value = true
  try {
    const dataToSave = {
      nik: form.value.nik,
      nama: form.value.nama,
      email: form.value.email,
      role: form.value.role,
      akses: form.value.akses,
    }

    if (form.value.id) {
      // MODE EDIT: HANYA update database, JANGAN panggil createUser
      await updateDoc(doc(db, 'karyawan', form.value.id), dataToSave)
      $q.notify({ type: 'positive', message: 'Data berhasil diupdate!' })
    } else {
      // MODE TAMBAH: Panggil createUser
      const cred = await createUserWithEmailAndPassword(auth, form.value.email, form.value.password)
      await addDoc(collection(db, 'karyawan'), { ...dataToSave, uid: cred.user.uid })
      $q.notify({ type: 'positive', message: 'Karyawan berhasil ditambah!' })
    }
    showDialog.value = false
  } catch (e) {
    // Menangkap error jika user sudah ada atau masalah lain
    $q.notify({ type: 'negative', message: 'Error: ' + e.message })
  } finally {
    loading.value = false
  }
}

const editKaryawan = (data) => {
  form.value = { ...data, id: data.id }
  showDialog.value = true
}

const deleteKaryawan = async (id) => {
  if (confirm('Hapus data ini?')) await deleteDoc(doc(db, 'karyawan', id))
}

onMounted(() => {
  onSnapshot(collection(db, 'karyawan'), (s) => {
    karyawanList.value = s.docs.map((d) => ({ id: d.id, ...d.data() }))
  })
})
</script>
