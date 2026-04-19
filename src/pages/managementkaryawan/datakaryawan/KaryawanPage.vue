<template>
  <q-page class="bg-blue-grey-1 q-pa-lg">
    <div class="row items-center justify-between q-mb-lg">
      <div>
        <div class="text-h4 text-weight-bolder text-blue-grey-10">Database Karyawan</div>
        <div class="text-grey-7">Kelola data personal dan sistem akses</div>
      </div>
      <q-btn
        color="primary"
        label="Tambah Karyawan"
        icon="add"
        @click="openDialog"
        size="md"
        unelevated
        rounded
        class="q-px-lg shadow-3"
      />
    </div>

    <q-card flat bordered class="rounded-borders overflow-hidden shadow-2">
      <q-table :rows="karyawanList" :columns="columns" row-key="id" flat />
    </q-card>

    <q-dialog
      v-model="showDialog"
      persistent
      maximized
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card class="bg-grey-1">
        <q-toolbar class="bg-white text-blue-grey-10 q-pa-md shadow-1">
          <q-toolbar-title class="text-h6 text-weight-bold"
            >Form Registrasi Karyawan</q-toolbar-title
          >
          <q-btn flat v-close-popup icon="close" round color="negative" />
        </q-toolbar>

        <q-card-section class="q-pa-xl">
          <div class="row q-col-gutter-xl">
            <div class="col-12 col-md-6">
              <div class="text-subtitle2 text-weight-bold q-mb-md text-primary flex items-center">
                <q-icon name="person_outline" class="q-mr-sm" size="sm" /> DATA IDENTITAS
              </div>
              <div class="row q-col-gutter-md bg-white q-pa-lg rounded-borders shadow-1">
                <q-input
                  class="col-12"
                  outlined
                  rounded
                  v-model="form.nik"
                  label="NIK (Auto)"
                  readonly
                  bg-color="grey-2"
                />
                <q-input class="col-12" outlined rounded v-model="form.nama" label="Nama Lengkap" />
                <q-select
                  class="col-12"
                  outlined
                  rounded
                  v-model="form.jabatan"
                  :options="jabatanOptions"
                  label="Jabatan"
                  emit-value
                  map-options
                />
                <q-input
                  class="col-6"
                  outlined
                  rounded
                  v-model="form.kotaLahir"
                  label="Kota Lahir"
                />
                <q-input
                  class="col-6"
                  outlined
                  rounded
                  v-model="form.tglLahir"
                  type="date"
                  stack-label
                  label="Tgl Lahir"
                />
                <q-input
                  class="col-12"
                  outlined
                  rounded
                  v-model="form.tglMasuk"
                  type="date"
                  stack-label
                  label="Tgl Masuk"
                />
                <q-input class="col-12" outlined rounded v-model="form.email" label="Email Login" />
                <q-input
                  class="col-12"
                  outlined
                  rounded
                  v-model="form.password"
                  label="Password Login"
                  type="password"
                />
                <q-input
                  class="col-12"
                  outlined
                  rounded
                  v-model="form.alamat"
                  type="textarea"
                  label="Alamat Lengkap"
                  autogrow
                />
              </div>
            </div>

            <div class="col-12 col-md-6">
              <div class="text-subtitle2 text-weight-bold q-mb-md text-primary flex items-center">
                <q-icon name="admin_panel_settings" class="q-mr-sm" size="sm" /> HAK AKSES & DOKUMEN
              </div>
              <div class="bg-white q-pa-lg rounded-borders shadow-1">
                <div class="text-weight-bold q-mb-sm text-grey-9">Pilih Modul Aktif:</div>
                <div class="row q-col-gutter-sm q-mb-lg">
                  <div v-for="mod in modulList" :key="mod.id" class="col-6">
                    <q-checkbox
                      v-model="form.akses"
                      :val="mod.aksesKey"
                      :label="mod.name"
                      color="primary"
                    />
                  </div>
                </div>

                <div class="text-weight-bold q-mb-sm text-grey-9">Foto Profil:</div>
                <q-file
                  outlined
                  rounded
                  v-model="fotoFile"
                  label="Pilih Foto"
                  accept="image/*"
                  class="q-mb-md"
                />

                <div class="text-weight-bold q-mb-sm text-grey-9">Dokumen Pendukung:</div>
                <div
                  v-for="(item, index) in docList"
                  :key="index"
                  class="row q-col-gutter-sm q-mb-sm"
                >
                  <q-input
                    class="col-4"
                    outlined
                    rounded
                    v-model="item.name"
                    label="Nama File"
                    dense
                  />
                  <q-file
                    class="col-6"
                    outlined
                    rounded
                    v-model="item.file"
                    label="Pilih File"
                    dense
                  />
                  <q-btn
                    class="col-2"
                    color="negative"
                    icon="delete"
                    @click="docList.splice(index, 1)"
                    dense
                    flat
                    round
                  />
                </div>
                <q-btn
                  color="secondary"
                  label="+ Tambah Dokumen"
                  @click="docList.push({ name: '', file: null })"
                  outline
                  rounded
                  class="full-width q-mt-sm"
                />
              </div>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-xl">
          <q-btn label="Batal" flat v-close-popup size="lg" class="q-px-xl text-grey-8" />
          <q-btn
            label="Simpan Data"
            color="primary"
            @click="saveKaryawan"
            size="lg"
            unelevated
            rounded
            :loading="loading"
            class="q-px-xl shadow-4"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { db, auth, storage } from 'src/boot/firebase'
import { collection, addDoc, updateDoc, doc, onSnapshot } from 'firebase/firestore'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const loading = ref(false)
const showDialog = ref(false)
const karyawanList = ref([])
const jabatanOptions = ref([])
const modulList = ref([])
const docList = ref([{ name: '', file: null }])
const fotoFile = ref(null)
const form = ref({
  id: null,
  nik: '',
  nama: '',
  kotaLahir: '',
  tglLahir: '',
  tglMasuk: '',
  alamat: '',
  jabatan: '',
  email: '',
  password: '',
  akses: [],
})

let unsubKaryawan, unsubJabatan, unsubModul

watch(
  () => form.value.jabatan,
  (newVal) => {
    if (newVal === 'Super Admin') {
      form.value.akses = modulList.value.map((m) => m.aksesKey)
    } else if (!form.value.id) {
      form.value.akses = []
    }
  },
)

const columns = [
  { name: 'nik', label: 'NIK', field: 'nik', align: 'left' },
  { name: 'nama', label: 'NAMA', field: 'nama', align: 'left' },
  { name: 'jabatan', label: 'JABATAN', field: 'jabatan', align: 'left' },
  { name: 'actions', label: 'AKSI', field: 'actions', align: 'center' },
]

const openDialog = () => {
  form.value = {
    id: null,
    nik: 'KRY-' + Date.now().toString().slice(-6),
    nama: '',
    kotaLahir: '',
    tglLahir: '',
    tglMasuk: '',
    alamat: '',
    jabatan: '',
    email: '',
    password: '',
    akses: [],
  }
  docList.value = [{ name: '', file: null }]
  fotoFile.value = null
  showDialog.value = true
}

const saveKaryawan = async () => {
  loading.value = true
  try {
    let fotoUrl = null
    if (fotoFile.value) {
      const fRef = storageRef(storage, 'karyawan/foto/' + Date.now() + fotoFile.value.name)
      await uploadBytes(fRef, fotoFile.value)
      fotoUrl = await getDownloadURL(fRef)
    }

    let docUrls = []
    for (const item of docList.value) {
      if (item.file) {
        const sRef = storageRef(storage, 'karyawan/docs/' + Date.now() + item.file.name)
        await uploadBytes(sRef, item.file)
        docUrls.push({ name: item.name, url: await getDownloadURL(sRef) })
      }
    }

    const data = { ...form.value, fotoUrl, docUrls }
    if (form.value.id) {
      await updateDoc(doc(db, 'karyawan', form.value.id), data)
    } else {
      const cred = await createUserWithEmailAndPassword(auth, form.value.email, form.value.password)
      await addDoc(collection(db, 'karyawan'), { ...data, uid: cred.user.uid })
    }
    $q.notify({ type: 'positive', message: 'Data Tersimpan!' })
    showDialog.value = false
  } catch (e) {
    $q.notify({ type: 'negative', message: e.message })
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  unsubKaryawan = onSnapshot(
    collection(db, 'karyawan'),
    (s) => (karyawanList.value = s.docs.map((d) => ({ id: d.id, ...d.data() }))),
  )
  unsubJabatan = onSnapshot(
    collection(db, 'jabatan'),
    (s) =>
      (jabatanOptions.value = s.docs.map((d) => ({
        label: d.data().namaJabatan,
        value: d.data().namaJabatan,
      }))),
  )
  unsubModul = onSnapshot(
    collection(db, 'modul'),
    (s) => (modulList.value = s.docs.map((d) => ({ id: d.id, ...d.data() }))),
  )
})

onUnmounted(() => {
  if (unsubKaryawan) unsubKaryawan()
  if (unsubJabatan) unsubJabatan()
  if (unsubModul) unsubModul()
})
</script>
