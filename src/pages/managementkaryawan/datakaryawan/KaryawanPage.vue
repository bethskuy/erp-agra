<template>
  <q-page class="bg-blue-grey-1 q-pa-lg">
    <template v-if="currentView === 'list'">
      <div class="row items-center justify-between q-mb-lg">
        <div>
          <div class="text-h4 text-weight-bolder text-blue-grey-10">Database Karyawan</div>
        </div>
        <q-btn
          color="primary"
          label="Tambah Karyawan"
          icon="add"
          @click="openDialog"
          unelevated
          rounded
          class="q-px-lg shadow-3"
        />
      </div>

      <q-card flat bordered class="shadow-2">
        <q-table :rows="karyawanList" :columns="columns" row-key="id" flat>
          <template v-slot:body="props">
            <q-tr @click="viewDetail(props.row)" class="cursor-pointer hover-bg">
              <q-td v-for="col in props.cols" :key="col.name">
                <template v-if="col.name === 'actions'">
                  <q-btn
                    flat
                    round
                    icon="edit"
                    color="primary"
                    @click.stop="editKaryawan(props.row)"
                  />
                  <q-btn
                    flat
                    round
                    icon="delete"
                    color="negative"
                    @click.stop="deleteKaryawan(props.row.id)"
                  />
                </template>
                <template v-else>{{ props.row[col.field] }}</template>
              </q-td>
            </q-tr>
          </template>
        </q-table>
      </q-card>
    </template>

    <template v-else-if="currentView === 'detail'">
      <q-btn flat icon="arrow_back" label="Kembali" @click="currentView = 'list'" class="q-mb-md" />
      <div class="bg-white q-pa-xl rounded-borders shadow-2">
        <div class="row q-col-gutter-xl">
          <div class="col-12 col-md-3 text-center">
            <q-avatar size="200px" class="shadow-4 q-mb-md"
              ><img :src="selectedKaryawan.fotoUrl"
            /></q-avatar>
            <div class="text-h4 text-weight-bold">{{ selectedKaryawan.nama }}</div>
            <div class="text-primary text-h6">{{ selectedKaryawan.jabatan }}</div>
          </div>
          <div class="col-12 col-md-9">
            <div class="text-h5 q-mb-md">Informasi Lengkap</div>
            <div class="row q-col-gutter-md">
              <div class="col-12 col-sm-6"><strong>NIK:</strong> {{ selectedKaryawan.nik }}</div>
              <div class="col-12 col-sm-6">
                <strong>Email:</strong> {{ selectedKaryawan.email }}
              </div>
              <div class="col-12 col-sm-6">
                <strong>Tgl Lahir:</strong> {{ selectedKaryawan.kotaLahir }},
                {{ selectedKaryawan.tglLahir }}
              </div>
              <div class="col-12 col-sm-6">
                <strong>Tgl Masuk:</strong> {{ selectedKaryawan.tglMasuk }}
              </div>
              <div class="col-12"><strong>Alamat:</strong> {{ selectedKaryawan.alamat }}</div>
              <div class="col-12">
                <strong>Hak Akses:</strong> {{ selectedKaryawan.akses?.join(', ') }}
              </div>
              <div class="col-12">
                <strong>Dokumen:</strong>
                <ul v-if="selectedKaryawan.docUrls?.length">
                  <li v-for="doc in selectedKaryawan.docUrls" :key="doc.url">
                    <a :href="doc.url" target="_blank">{{ doc.name }}</a>
                  </li>
                </ul>
                <span v-else>Tidak ada dokumen</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <q-dialog v-model="showDialog" persistent maximized>
      <q-card class="bg-grey-1">
        <q-toolbar class="bg-white text-blue-grey-10 q-pa-md shadow-1">
          <q-toolbar-title>{{ form.id ? 'Edit Karyawan' : 'Registrasi Karyawan' }}</q-toolbar-title>
          <q-btn flat v-close-popup icon="close" round />
        </q-toolbar>
        <q-card-section class="q-pa-xl">
          <div class="row q-col-gutter-xl">
            <div class="col-12 col-md-6">
              <div class="row q-col-gutter-md bg-white q-pa-lg rounded-borders shadow-1">
                <q-input
                  class="col-12"
                  outlined
                  rounded
                  v-model="form.nik"
                  label="NIK"
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
                <q-input
                  class="col-12"
                  outlined
                  rounded
                  v-model="form.email"
                  label="Email Login"
                  :readonly="!!form.id"
                />
                <q-input
                  class="col-12"
                  outlined
                  rounded
                  v-model="form.password"
                  label="Password (Isi jika ganti)"
                  type="password"
                />
                <q-input
                  class="col-12"
                  outlined
                  rounded
                  v-model="form.alamat"
                  type="textarea"
                  label="Alamat"
                  autogrow
                />
              </div>
            </div>
            <div class="col-12 col-md-6">
              <div class="bg-white q-pa-lg rounded-borders shadow-1">
                <div class="text-weight-bold q-mb-sm">Hak Akses:</div>
                <div class="row q-mb-md">
                  <q-checkbox
                    v-for="mod in modulList"
                    :key="mod.id"
                    v-model="form.akses"
                    :val="mod.aksesKey"
                    :label="mod.name"
                    class="col-6"
                  />
                </div>
                <q-file outlined rounded v-model="fotoFile" label="Foto Profil" class="q-mb-md" />
                <div class="text-weight-bold q-mb-sm">Dokumen:</div>
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
          <q-btn label="Batal" flat v-close-popup size="lg" />
          <q-btn
            label="SIMPAN DATA"
            @click="saveKaryawan"
            size="lg"
            unelevated
            rounded
            class="text-white shadow-6"
            style="
              background: linear-gradient(135deg, #1976d2 0%, #0d47a1 100%);
              padding: 12px 60px;
            "
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { db, auth, storage } from 'src/boot/firebase'
import { collection, addDoc, updateDoc, doc, onSnapshot, deleteDoc } from 'firebase/firestore'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const currentView = ref('list')
const selectedKaryawan = ref(null)
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

const viewDetail = (data) => {
  selectedKaryawan.value = data
  currentView.value = 'detail'
}
const editKaryawan = (data) => {
  form.value = { ...data, password: '' }
  showDialog.value = true
}

const saveKaryawan = async () => {
  loading.value = true
  try {
    let fotoUrl = form.value.fotoUrl || null
    if (fotoFile.value) {
      const fRef = storageRef(storage, 'karyawan/' + Date.now())
      await uploadBytes(fRef, fotoFile.value)
      fotoUrl = await getDownloadURL(fRef)
    }

    let docUrls = []
    for (let d of docList.value) {
      if (d.file) {
        const sRef = storageRef(storage, 'docs/' + Date.now() + d.file.name)
        await uploadBytes(sRef, d.file)
        docUrls.push({ name: d.name, url: await getDownloadURL(sRef) })
      } else if (d.url) {
        docUrls.push(d)
      }
    }

    // PERBAIKAN LOGIKA: Jika ada ID, Update saja. Jangan buat user baru.
    if (form.value.id) {
      await updateDoc(doc(db, 'karyawan', form.value.id), { ...form.value, fotoUrl, docUrls })
    } else {
      const cred = await createUserWithEmailAndPassword(auth, form.value.email, form.value.password)
      await addDoc(collection(db, 'karyawan'), {
        ...form.value,
        fotoUrl,
        docUrls,
        uid: cred.user.uid,
      })
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
  onSnapshot(
    collection(db, 'karyawan'),
    (s) => (karyawanList.value = s.docs.map((d) => ({ id: d.id, ...d.data() }))),
  )
  onSnapshot(
    collection(db, 'jabatan'),
    (s) =>
      (jabatanOptions.value = s.docs.map((d) => ({
        label: d.data().namaJabatan,
        value: d.data().namaJabatan,
      }))),
  )
  onSnapshot(
    collection(db, 'modul'),
    (s) => (modulList.value = s.docs.map((d) => ({ id: d.id, ...d.data() }))),
  )
})

const columns = [
  { name: 'nik', label: 'NIK', field: 'nik', align: 'left' },
  { name: 'nama', label: 'NAMA', field: 'nama', align: 'left' },
  { name: 'jabatan', label: 'JABATAN', field: 'jabatan', align: 'left' },
  { name: 'actions', label: 'AKSI', field: 'id', align: 'center' },
]
const openDialog = () => {
  form.value = {
    id: null,
    nik: 'KRY-' + Date.now().toString().slice(-6),
    nama: '',
    email: '',
    password: '',
    akses: [],
  }
  docList.value = [{ name: '', file: null }]
  showDialog.value = true
}
const deleteKaryawan = async (id) => {
  if (confirm('Hapus?')) await deleteDoc(doc(db, 'karyawan', id))
}
</script>

<style scoped>
.hover-bg:hover {
  background-color: #f5f5f5;
}
</style>
<!-- INI DAH BENER HANYA SAJA DETAILNYA NOOB -->
