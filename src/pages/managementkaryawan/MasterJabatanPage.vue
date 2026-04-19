<template>
  <q-page class="bg-grey-2 q-pa-lg">
    <div class="row items-center justify-between q-mb-md">
      <div>
        <div class="text-h5 text-weight-bold text-blue-grey-9">Kategori Jabatan / Role</div>
        <div class="text-caption text-grey-7">Kelola daftar jabatan yang tersedia</div>
      </div>
      <q-btn
        color="blue-grey-9"
        icon="add"
        label="Tambah Jabatan"
        @click="openDialog()"
        unelevated
      />
    </div>

    <q-card flat bordered class="rounded-borders shadow-1">
      <q-table :rows="jabatanList" :columns="columns" row-key="id" flat>
        <template v-slot:body-cell-actions="props">
          <q-td :props="props">
            <q-btn flat round icon="edit" color="primary" @click="editJabatan(props.row)" />
            <q-btn flat round icon="delete" color="negative" @click="deleteJabatan(props.row.id)" />
          </q-td>
        </template>
      </q-table>
    </q-card>

    <q-dialog v-model="showDialog" persistent>
      <q-card style="width: 400px">
        <q-card-section>
          <div class="text-h6">{{ form.id ? 'Edit' : 'Tambah' }} Jabatan</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-form @submit="saveJabatan" class="q-gutter-md">
            <q-input
              outlined
              v-model="form.namaJabatan"
              label="Nama Jabatan / Role"
              lazy-rules
              :rules="[(val) => !!val || 'Wajib diisi']"
            />

            <div class="row justify-end q-mt-lg">
              <q-btn label="Batal" flat v-close-popup class="q-mr-sm" />
              <q-btn label="Simpan" type="submit" color="primary" unelevated :loading="loading" />
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
const loading = ref(false)
const jabatanList = ref([])
const showDialog = ref(false)
const form = ref({ id: null, namaJabatan: '' })

const columns = [
  { name: 'namaJabatan', label: 'NAMA JABATAN', field: 'namaJabatan', align: 'left' },
  { name: 'actions', label: 'AKSI', field: 'actions', align: 'center' },
]

const openDialog = () => {
  form.value = { id: null, namaJabatan: '' }
  showDialog.value = true
}

const saveJabatan = async () => {
  loading.value = true
  try {
    if (form.value.id) {
      await updateDoc(doc(db, 'jabatan', form.value.id), { namaJabatan: form.value.namaJabatan })
    } else {
      await addDoc(collection(db, 'jabatan'), { namaJabatan: form.value.namaJabatan })
    }
    $q.notify({ type: 'positive', message: 'Jabatan berhasil disimpan!' })
    showDialog.value = false
  } catch (e) {
    $q.notify({ type: 'negative', message: 'Error: ' + e.message })
  } finally {
    loading.value = false
  }
}

const editJabatan = (data) => {
  form.value = { id: data.id, namaJabatan: data.namaJabatan }
  showDialog.value = true
}

const deleteJabatan = async (id) => {
  if (confirm('Hapus jabatan ini?')) {
    await deleteDoc(doc(db, 'jabatan', id))
    $q.notify({ type: 'info', message: 'Jabatan dihapus' })
  }
}

onMounted(() => {
  onSnapshot(collection(db, 'jabatan'), (snapshot) => {
    jabatanList.value = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  })
})
</script>
