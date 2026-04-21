<template>
  <q-page class="bg-grey-2 q-pa-md font-pro">
    <div class="row items-center q-mb-md">
      <div class="col">
        <div class="text-h5 text-weight-bold text-primary text-uppercase">Database Customer</div>
        <div class="text-caption text-grey-7">
          Kelola data klien dengan sistem dokumen dinamis (Hybrid Storage).
        </div>
      </div>
      <div class="col-auto">
        <!-- Tombol Tambah: Hanya muncul jika punya izin 'buat' -->
        <q-btn
          v-if="canAction('buat')"
          unelevated
          color="primary"
          icon="person_add"
          label="Tambah Customer"
          class="btn-radius shadow-2"
          @click="openAddDialog"
        />
      </div>
    </div>

    <q-card flat bordered class="rounded-borders shadow-1">
      <q-table
        :rows="rows"
        :columns="columns"
        row-key="id"
        flat
        :loading="loading"
        :filter="filter"
        class="customer-table"
        @row-click="onRowClick"
      >
        <template v-slot:top-right>
          <q-input outlined dense debounce="300" v-model="filter" placeholder="Cari data...">
            <template v-slot:append><q-icon name="search" /></template>
          </q-input>
        </template>
        <template v-slot:body-cell-aksi="props">
          <q-td :props="props" class="q-gutter-xs text-center" @click.stop>
            <!-- Tombol Edit: Hanya muncul jika punya izin 'ubah' -->
            <q-btn
              v-if="canAction('ubah')"
              flat
              round
              color="blue"
              icon="edit"
              size="sm"
              @click="openEditDialog(props.row)"
            />
            <!-- Tombol Delete: Hanya muncul jika punya izin 'hapus' -->
            <q-btn
              v-if="canAction('hapus')"
              flat
              round
              color="negative"
              icon="delete"
              size="sm"
              @click="confirmHapus(props.row)"
            />
            <!-- Indikator jika tidak ada akses aksi -->
            <q-badge
              v-if="!canAction('ubah') && !canAction('hapus')"
              color="grey-3"
              text-color="grey-7"
              label="No Action"
            />
          </q-td>
        </template>
      </q-table>
    </q-card>

    <!-- Modal Form Tambah/Edit -->
    <q-dialog v-model="showDialog" persistent maximized transition-show="slide-up">
      <q-card class="bg-grey-1 column no-wrap">
        <q-toolbar class="bg-white text-grey-9 q-py-md bordered-bottom">
          <q-btn flat round dense icon="close" v-close-popup />
          <q-toolbar-title class="text-weight-bold text-center uppercase">
            {{ isEditMode ? 'Update Data Customer' : 'Tambah Konsumen Baru' }}
          </q-toolbar-title>
          <div style="width: 48px"></div>
        </q-toolbar>

        <q-card-section class="col scroll q-pa-xl">
          <div class="row justify-center">
            <div class="col-12 col-lg-10">
              <div class="row q-col-gutter-xl">
                <div class="col-12 col-md-6">
                  <div class="text-subtitle2 text-primary text-bold q-mb-sm uppercase">
                    Informasi Umum
                  </div>
                  <div class="row q-col-gutter-sm q-mb-lg">
                    <div class="col-12">
                      <div class="label-form">Nama Konsumen *</div>
                      <q-input
                        outlined
                        dense
                        v-model="form.nama"
                        placeholder="PT. XXXXX"
                        bg-color="white"
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <div class="label-form">Email *</div>
                      <q-input outlined dense v-model="form.email" bg-color="white" />
                    </div>
                    <div class="col-12 col-md-6">
                      <div class="label-form">No. HP</div>
                      <q-input outlined dense v-model="form.kontak" bg-color="white" />
                    </div>
                    <div class="col-12">
                      <div class="label-form">NPWP (No. Kartu)</div>
                      <q-input
                        outlined
                        dense
                        v-model="form.npwp"
                        mask="##.###.###.#-###.###"
                        bg-color="white"
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <div class="label-form">Provinsi</div>
                      <q-select
                        outlined
                        dense
                        v-model="form.provinsi"
                        :options="[
                          'DKI Jakarta',
                          'Jawa Barat',
                          'Banten',
                          'Jawa Tengah',
                          'Jawa Timur',
                        ]"
                        bg-color="white"
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <div class="label-form">Kota</div>
                      <q-input outlined dense v-model="form.kota" bg-color="white" />
                    </div>
                    <div class="col-12">
                      <div class="label-form">Alamat Lengkap</div>
                      <q-input
                        outlined
                        dense
                        v-model="form.alamat"
                        type="textarea"
                        rows="2"
                        bg-color="white"
                      />
                    </div>
                  </div>
                  <div class="text-subtitle2 text-primary text-bold q-mb-sm uppercase">
                    Penanggung Jawab
                  </div>
                  <div class="row q-col-gutter-sm">
                    <div class="col-12 col-md-6">
                      <div class="label-form">Nama PIC</div>
                      <q-input outlined dense v-model="form.pic_nama" bg-color="white" />
                    </div>
                    <div class="col-12 col-md-6">
                      <div class="label-form">Email PIC</div>
                      <q-input outlined dense v-model="form.pic_email" bg-color="white" />
                    </div>
                  </div>
                </div>

                <div class="col-12 col-md-6">
                  <div class="text-subtitle2 text-primary text-bold q-mb-sm uppercase">
                    Informasi Perbankan
                  </div>
                  <div class="row q-col-gutter-sm q-mb-lg">
                    <div class="col-12">
                      <div class="label-form">No. Rekening</div>
                      <q-input outlined dense v-model="form.rek_nomor" bg-color="white" />
                    </div>
                    <div class="col-12 col-md-6">
                      <div class="label-form">Nama Bank</div>
                      <q-input outlined dense v-model="form.rek_bank" bg-color="white" />
                    </div>
                    <div class="col-12 col-md-6">
                      <div class="label-form">Atas Nama</div>
                      <q-input outlined dense v-model="form.rek_nama" bg-color="white" />
                    </div>
                  </div>

                  <div class="text-subtitle2 text-primary text-bold q-mb-sm uppercase">
                    Berkas & Dokumen Terlampir
                  </div>
                  <q-card flat bordered class="bg-white q-pa-md rounded-borders">
                    <div class="row items-center justify-between q-mb-md">
                      <div class="text-caption text-grey-7 italic">
                        Tambahkan NPWP, K3, atau berkas lainnya di sini.
                      </div>
                      <q-btn
                        round
                        unelevated
                        color="primary"
                        icon="add"
                        size="sm"
                        @click="addDocRow"
                      />
                    </div>

                    <div
                      v-for="(item, index) in form.additional_docs"
                      :key="index"
                      class="row q-col-gutter-sm items-center q-mb-sm"
                    >
                      <div class="col-5">
                        <q-input
                          outlined
                          dense
                          v-model="item.label"
                          placeholder="Nama Dokumen"
                          bg-color="grey-1"
                        />
                      </div>
                      <div class="col-5">
                        <q-file
                          outlined
                          dense
                          v-model="item.fileObj"
                          label="Pilih File"
                          bg-color="grey-1"
                        >
                          <template v-slot:append><q-icon name="attach_file" size="xs" /></template>
                        </q-file>
                        <div
                          v-if="item.url || item.base64"
                          class="text-caption text-green text-italic"
                        >
                          ✔ File tersimpan
                        </div>
                      </div>
                      <div class="col-auto">
                        <q-btn
                          round
                          flat
                          dense
                          color="negative"
                          icon="delete"
                          size="sm"
                          @click="removeDocRow(index)"
                        />
                      </div>
                    </div>
                  </q-card>

                  <div class="row justify-end q-mt-xl">
                    <q-btn
                      unelevated
                      color="primary"
                      label="SIMPAN DATA CUSTOMER"
                      :loading="submitting"
                      class="btn-radius q-px-xl shadow-2"
                      @click="simpanCustomer"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Modal Profil/Detail -->
    <q-dialog v-model="showDetail" maximized transition-show="slide-up">
      <q-card class="bg-grey-2 column no-wrap" v-if="currentCustomer">
        <q-toolbar class="bg-primary text-white q-py-md">
          <q-btn flat round dense icon="arrow_back" v-close-popup />
          <q-toolbar-title class="text-center uppercase text-bold"
            >Profil Lengkap Customer</q-toolbar-title
          >
        </q-toolbar>

        <q-card-section class="col scroll q-pa-xl">
          <div class="row justify-center q-col-gutter-lg">
            <div class="col-12 col-md-10 col-lg-8">
              <q-card flat bordered class="q-pa-lg q-mb-md bg-white shadow-1 text-center">
                <div class="text-h3 text-weight-bolder text-primary uppercase q-mb-xs">
                  {{ currentCustomer.nama }}
                </div>
                <div class="text-grey-7 text-subtitle1">
                  {{ currentCustomer.email }} | {{ currentCustomer.kontak }}
                </div>
              </q-card>

              <div class="row q-col-gutter-md q-mb-md">
                <div class="col-12 col-md-6">
                  <q-card flat bordered class="bg-white full-height q-pa-md">
                    <div class="text-bold text-primary q-mb-sm uppercase">Identitas & Alamat</div>
                    <q-separator q-mb-md />
                    <div class="q-gutter-y-sm">
                      <div class="row">
                        <div class="col-4 text-grey-7">NPWP</div>
                        <div class="col-8 text-weight-bold">{{ currentCustomer.npwp || '-' }}</div>
                      </div>
                      <div class="row">
                        <div class="col-4 text-grey-7">Alamat</div>
                        <div class="col-8">{{ currentCustomer.alamat || '-' }}</div>
                      </div>
                      <div class="row">
                        <div class="col-4 text-grey-7">Kota</div>
                        <div class="col-8">
                          {{ currentCustomer.kota || '-' }}, {{ currentCustomer.provinsi || '-' }}
                        </div>
                      </div>
                    </div>
                  </q-card>
                </div>
                <div class="col-12 col-md-6">
                  <q-card flat bordered class="bg-white full-height q-pa-md">
                    <div class="text-bold text-primary q-mb-sm uppercase">PIC & Bank</div>
                    <q-separator q-mb-md />
                    <div class="q-gutter-y-sm">
                      <div class="row">
                        <div class="col-4 text-grey-7">Nama PIC</div>
                        <div class="col-8 text-weight-bold">
                          {{ currentCustomer.pic_nama || '-' }}
                        </div>
                      </div>
                      <div class="row">
                        <div class="col-4 text-grey-7">Email PIC</div>
                        <div class="col-8">{{ currentCustomer.pic_email || '-' }}</div>
                      </div>
                      <div class="row">
                        <div class="col-4 text-grey-7">Bank</div>
                        <div class="col-8">{{ currentCustomer.rek_bank || '-' }}</div>
                      </div>
                      <div class="row">
                        <div class="col-4 text-grey-7">Rekening</div>
                        <div class="col-8">
                          {{ currentCustomer.rek_nomor || '-' }} (an.
                          {{ currentCustomer.rek_nama || '-' }})
                        </div>
                      </div>
                    </div>
                  </q-card>
                </div>
              </div>

              <q-card flat bordered class="bg-white shadow-1">
                <q-card-section class="text-bold uppercase text-primary"
                  >Berkas Dokumen Terlampir</q-card-section
                >
                <q-separator />
                <q-list separator>
                  <q-expansion-item
                    v-for="(docItem, i) in currentCustomer.additional_docs"
                    :key="i"
                    icon="folder"
                    :label="docItem.label"
                    header-class="text-weight-bold"
                  >
                    <iframe
                      :src="docItem.url || docItem.base64"
                      frameborder="0"
                      style="width: 100%; height: 600px"
                    ></iframe>
                  </q-expansion-item>
                  <q-item
                    v-if="
                      !currentCustomer.additional_docs ||
                      currentCustomer.additional_docs.length === 0
                    "
                  >
                    <q-item-section class="text-center text-grey-6 italic q-pa-md"
                      >Belum ada dokumen yang diunggah.</q-item-section
                    >
                  </q-item>
                </q-list>
              </q-card>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useQuasar } from 'quasar'
// eslint-disable-next-line no-unused-vars
import { db, auth, storage } from 'src/boot/firebase'
import {
  collection,
  onSnapshot,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  where,
  serverTimestamp,
} from 'firebase/firestore'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import { useAuthStore } from 'src/stores/auth'

const $q = useQuasar()
const authStore = useAuthStore()
const rows = ref([])
const loading = ref(false)
const submitting = ref(false)
const showDialog = ref(false)
const showDetail = ref(false)
const isEditMode = ref(false)
const filter = ref('')
const currentCustomer = ref(null)
const userData = ref(null)
let unsubscribeUser = null

const formDefault = {
  id: null,
  nama: '',
  email: '',
  kontak: '',
  npwp: '',
  provinsi: null,
  kota: '',
  alamat: '',
  pic_nama: '',
  pic_email: '',
  rek_nomor: '',
  rek_bank: '',
  rek_nama: '',
  additional_docs: [],
}
const form = ref({ ...formDefault })

const columns = [
  { name: 'nama', align: 'left', label: 'NAMA CUSTOMER', field: 'nama', sortable: true },
  { name: 'email', align: 'left', label: 'EMAIL', field: 'email' },
  { name: 'aksi', align: 'center', label: 'AKSI', field: 'aksi' },
]

/**
 * LOGIKA SATPAM: Mengecek izin aksi granular (buat, ubah, hapus)
 */
const canAction = (actionType) => {
  if (authStore.user?.role === 'Super Admin') return true
  if (!userData.value?.permissions_detail) return false

  const modulePerm = userData.value.permissions_detail.find((m) => m.id === 'konstruksi')
  if (!modulePerm || !modulePerm.isActive) return false

  // ID Target: _konstruksi_marketing_customer
  const targetId = '_konstruksi_marketing_customer'
  const menu = modulePerm.menus.find((m) => m.id === targetId)

  if (!menu) return false
  return menu[actionType] || false
}

// LOGIC HYBRID STORAGE
const processHybridUpload = async (file, pathName) => {
  if (!file) return null
  if (file.size <= 512000) {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result)
    })
  } else {
    const sRef = storageRef(storage, `customers/${Date.now()}_${pathName}`)
    const snap = await uploadBytes(sRef, file)
    return await getDownloadURL(snap.ref)
  }
}

const addDocRow = () =>
  form.value.additional_docs.push({ label: '', url: '', base64: '', fileObj: null })
const removeDocRow = (i) => form.value.additional_docs.splice(i, 1)

const simpanCustomer = async () => {
  if (!form.value.nama) return
  submitting.value = true
  try {
    for (let item of form.value.additional_docs) {
      if (item.fileObj) {
        const result = await processHybridUpload(item.fileObj, item.label)
        if (result.startsWith('http')) {
          item.url = result
          item.base64 = ''
        } else {
          item.base64 = result
          item.url = ''
        }
        delete item.fileObj
      }
    }
    const payload = JSON.parse(JSON.stringify(form.value))
    payload.updatedAt = serverTimestamp()
    const docId = payload.id
    delete payload.id
    if (isEditMode.value) {
      await updateDoc(doc(db, 'customer', docId), payload)
    } else {
      payload.createdAt = serverTimestamp()
      await addDoc(collection(db, 'customer'), payload)
    }
    showDialog.value = false
    fetchData()
    $q.notify({ type: 'positive', message: 'Data Berhasil Disimpan!' })
  } catch (e) {
    console.error(e)
    $q.notify({ color: 'negative', message: 'Gagal Simpan!' })
  } finally {
    submitting.value = false
  }
}

const fetchData = async () => {
  loading.value = true
  const snap = await getDocs(query(collection(db, 'customer'), orderBy('createdAt', 'desc')))
  rows.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  loading.value = false
}

const onRowClick = (e, row) => {
  currentCustomer.value = row
  showDetail.value = true
}
const openAddDialog = () => {
  isEditMode.value = false
  form.value = JSON.parse(JSON.stringify(formDefault))
  showDialog.value = true
}
const openEditDialog = (row) => {
  isEditMode.value = true
  form.value = JSON.parse(JSON.stringify(row))
  showDialog.value = true
}
const confirmHapus = (r) => {
  $q.dialog({
    title: 'Hapus',
    message: `Hapus ${r.nama}?`,
    cancel: true,
    ok: { color: 'negative' },
  }).onOk(async () => {
    await deleteDoc(doc(db, 'customer', r.id))
    fetchData()
  })
}

onMounted(() => {
  // 1. Pantau Hak Akses User Real-time
  const userEmail = authStore.user?.email
  if (userEmail) {
    const qUser = query(collection(db, 'karyawan'), where('email', '==', userEmail))
    unsubscribeUser = onSnapshot(qUser, (snapshot) => {
      if (!snapshot.empty) {
        userData.value = snapshot.docs[0].data()
      }
    })
  }

  // 2. Ambil Data Customer
  fetchData()
})

onUnmounted(() => {
  if (unsubscribeUser) unsubscribeUser()
})
</script>

<style scoped>
.label-form {
  font-size: 12px;
  font-weight: 600;
  color: #444;
  margin-bottom: 4px;
}
.btn-radius {
  border-radius: 8px;
}
.rounded-borders {
  border-radius: 12px;
}
.customer-table :deep(tbody tr) {
  cursor: pointer;
  transition: 0.2s;
}
.customer-table :deep(tbody tr:hover) {
  background-color: #f0f4f8 !important;
}
</style>
