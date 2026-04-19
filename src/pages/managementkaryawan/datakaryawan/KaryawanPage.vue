<template>
  <q-page class="bg-grey-2 q-pa-lg">
    <div class="row items-center justify-between q-mb-md">
      <div>
        <div class="text-h5 text-weight-bold text-blue-grey-9">Data Karyawan</div>
        <div class="text-caption text-grey-7">Kelola database & akses login</div>
      </div>
      <q-btn
        color="blue-grey-9"
        icon="add"
        label="Tambah Karyawan"
        @click="openDialog()"
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

    <q-dialog
      v-model="showDialog"
      persistent
      maximized
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card>
        <q-toolbar class="bg-blue-grey-9 text-white">
          <q-toolbar-title>{{ form.id ? 'Edit' : 'Tambah' }} Data Karyawan</q-toolbar-title>
          <q-btn flat v-close-popup icon="close" />
        </q-toolbar>

        <q-card-section class="q-pa-md">
          <q-form @submit="saveKaryawan" class="q-gutter-md">
            <div class="row q-col-gutter-md">
              <q-input class="col-12 col-md-6" outlined v-model="form.nik" label="NIK" required />
              <q-input
                class="col-12 col-md-6"
                outlined
                v-model="form.nama"
                label="Nama Lengkap"
                required
              />
              <q-input
                class="col-12 col-md-6"
                outlined
                v-model="form.email"
                label="Email Login"
                type="email"
                required
              />
              <q-select
                class="col-12 col-md-6"
                outlined
                v-model="form.role"
                :options="roleOptions"
                label="Jabatan / Role"
                emit-value
                map-options
                @update:model-value="handleRoleChange"
              />
              <q-input
                class="col-12 col-md-6"
                outlined
                v-model="form.tglLahir"
                label="Tanggal Lahir"
                type="date"
                stack-label
              />
              <q-input
                class="col-12 col-md-6"
                outlined
                v-model="form.password"
                label="Password Login"
                type="password"
              />
              <q-input
                class="col-12"
                outlined
                v-model="form.alamat"
                label="Alamat"
                type="textarea"
                rows="2"
              />
            </div>

            <div class="text-subtitle2 text-weight-bold">Hak Akses Modul:</div>
            <div class="row q-gutter-md">
              <q-checkbox v-model="form.akses" val="konstruksi" label="Konstruksi" />
              <q-checkbox v-model="form.akses" val="absensi" label="Absensi" />
              <q-checkbox v-model="form.akses" val="manufaktur" label="Manufaktur" />
            </div>

            <div class="text-subtitle2 text-weight-bold">Dokumen:</div>
            <div
              v-for="(url, idx) in form.existingDocs"
              :key="'ex-' + idx"
              class="text-primary cursor-pointer q-mb-sm"
            >
              <q-icon name="attachment" /> Dokumen {{ idx + 1 }} (Sudah Terlampir)
            </div>
            <div
              v-for="(doc, index) in form.newDokumen"
              :key="'new-' + index"
              class="row items-center q-col-gutter-sm"
            >
              <q-file
                class="col-10"
                outlined
                v-model="form.newDokumen[index]"
                label="Pilih File Baru"
                dense
              />
              <q-btn
                class="col-2"
                flat
                round
                icon="delete"
                color="negative"
                @click="form.newDokumen.splice(index, 1)"
              />
            </div>
            <q-btn
              flat
              icon="add"
              label="Tambah Dokumen"
              @click="form.newDokumen.push(null)"
              color="primary"
            />

            <div class="row justify-end q-mt-lg">
              <q-btn label="Batal" flat v-close-popup class="q-mr-sm" />
              <q-btn
                label="Simpan Data"
                type="submit"
                color="primary"
                unelevated
                :loading="loading"
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { db, storage } from 'src/boot/firebase'
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore'
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'src/stores/auth' // Pastikan import ini ada

const $q = useQuasar()
const auth = getAuth()
const authStore = useAuthStore() // Inisialisasi store
const loading = ref(false)
const showDialog = ref(false)
const karyawanList = ref([])
const roleOptions = ref([])

const form = ref({
  id: null,
  nik: '',
  nama: '',
  email: '',
  password: '',
  role: '',
  akses: [],
  existingDocs: [],
  newDokumen: [],
})

const columns = [
  { name: 'nik', label: 'NIK', field: 'nik', align: 'left' },
  { name: 'nama', label: 'NAMA', field: 'nama', align: 'left' },
  { name: 'role', label: 'JABATAN', field: 'role', align: 'left' },
  { name: 'actions', label: 'AKSI', field: 'actions', align: 'center' },
]

const handleRoleChange = (val) => {
  if (val === 'Super Admin') form.value.akses = ['konstruksi', 'absensi', 'manufaktur']
}

const openDialog = () => {
  form.value = {
    id: null,
    nik: '',
    nama: '',
    email: '',
    password: '',
    role: '',
    akses: [],
    existingDocs: [],
    newDokumen: [],
  }
  showDialog.value = true
}

const saveKaryawan = async () => {
  loading.value = true
  try {
    let uploadedUrls = [...form.value.existingDocs]
    for (let file of form.value.newDokumen) {
      if (file) {
        const fileRef = storageRef(storage, `karyawan/${Date.now()}_${file.name}`)
        await uploadBytes(fileRef, file)
        uploadedUrls.push(await getDownloadURL(fileRef))
      }
    }

    const dataToSave = {
      nik: form.value.nik,
      nama: form.value.nama,
      email: form.value.email,
      role: form.value.role,
      akses: Array.isArray(form.value.akses) ? form.value.akses : [form.value.akses],
      dokumen: uploadedUrls,
    }

    if (form.value.id) {
      // Update Data
      await updateDoc(doc(db, 'karyawan', form.value.id), dataToSave)

      // Sinkronisasi ke Pinia Store jika yang di-edit adalah user login
      if (authStore.user?.uid === form.value.id || authStore.user?.email === form.value.email) {
        authStore.setLogin(dataToSave, dataToSave.akses)
      }
      $q.notify({ type: 'positive', message: 'Data diupdate!' })
    } else {
      // Tambah Baru
      const cred = await createUserWithEmailAndPassword(auth, form.value.email, form.value.password)
      await addDoc(collection(db, 'karyawan'), { ...dataToSave, uid: cred.user.uid })
      $q.notify({ type: 'positive', message: 'Data ditambah & akun dibuat!' })
    }
    showDialog.value = false
  } catch (e) {
    $q.notify({ type: 'negative', message: e.message })
  } finally {
    loading.value = false
  }
}

const editKaryawan = (data) => {
  form.value = {
    ...data,
    id: data.id,
    existingDocs: data.dokumen || [],
    newDokumen: [],
    akses: data.akses || [],
  }
  showDialog.value = true
}

const deleteKaryawan = async (id) => {
  if (confirm('Hapus Karyawan ini?')) await deleteDoc(doc(db, 'karyawan', id))
}

onMounted(() => {
  onSnapshot(
    collection(db, 'karyawan'),
    (s) => (karyawanList.value = s.docs.map((d) => ({ id: d.id, ...d.data() }))),
  )
  onSnapshot(
    collection(db, 'jabatan'),
    (s) => (roleOptions.value = s.docs.map((d) => d.data().namaJabatan)),
  )
})
</script>
