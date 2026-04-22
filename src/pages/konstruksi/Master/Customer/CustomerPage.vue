<template>
  <q-page class="bg-grey-2 q-pa-md q-pa-md-lg font-pro">
    <!-- VIEW 1: DAFTAR CUSTOMER -->
    <template v-if="!showDetail">
      <!-- HEADER SECTION -->
      <div class="row items-center justify-between q-mb-xl animate-fade">
        <div class="col-12 col-md-8">
          <div class="text-h4 text-weight-bolder text-indigo-10 leading-tight">
            Database Customer
            <span class="text-h5 text-weight-light text-grey-6 block q-mt-xs"
              >Klien & Rekanan Bisnis</span
            >
          </div>
          <div class="text-subtitle1 text-grey-7 q-mt-sm">
            Manajemen informasi klien terpusat dengan sistem dokumen hybrid.
          </div>
        </div>
        <div class="col-12 col-md-auto q-mt-md q-mt-md-none">
          <q-btn
            v-if="canAction('buat')"
            color="indigo-10"
            icon="person_add"
            label="Registrasi Customer"
            unelevated
            rounded
            no-caps
            class="q-px-lg q-py-sm shadow-premium btn-hover"
            @click="openAddDialog"
          />
        </div>
      </div>

      <!-- SEARCH & STATS -->
      <q-card flat bordered class="q-mb-lg shadow-1 rounded-20 bg-white">
        <q-card-section class="q-py-md">
          <div class="row items-center q-col-gutter-md">
            <div class="col-12 col-md-5">
              <q-input
                v-model="filter"
                outlined
                dense
                rounded
                placeholder="Cari Nama, Email, atau Lokasi..."
                bg-color="white"
                class="search-input"
              >
                <template v-slot:prepend>
                  <q-icon name="search" color="primary" />
                </template>
                <template v-slot:append v-if="filter">
                  <q-icon name="close" @click="filter = ''" class="cursor-pointer" />
                </template>
              </q-input>
            </div>
            <q-space />
            <div class="col-12 col-md-auto text-caption text-grey-6">
              Total Customer:
              <span class="text-weight-bold text-indigo-10">{{ rows.length }} Entitas</span>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- TABLE SECTION -->
      <q-card flat bordered class="rounded-20 shadow-sm overflow-hidden bg-white">
        <q-table
          :rows="rows"
          :columns="columns"
          row-key="id"
          flat
          :loading="loading"
          :filter="filter"
          binary-state-sort
          class="customer-table"
        >
          <!-- Custom Header -->
          <template v-slot:header="props">
            <q-tr :props="props" class="bg-indigo-10 text-white">
              <q-th
                v-for="col in props.cols"
                :key="col.name"
                :props="props"
                class="text-weight-bold"
              >
                {{ col.label }}
              </q-th>
            </q-tr>
          </template>

          <!-- Custom Body -->
          <template v-slot:body="props">
            <q-tr
              :props="props"
              class="hover-bg transition-all cursor-pointer"
              @click="onRowClick(null, props.row)"
            >
              <q-td key="nama">
                <div class="row items-center no-wrap">
                  <q-avatar
                    size="36px"
                    color="indigo-1"
                    text-color="indigo-10"
                    class="q-mr-md text-weight-bold shadow-sm"
                  >
                    {{ props.row.nama?.charAt(0) }}
                  </q-avatar>
                  <div>
                    <div class="text-weight-bold text-subtitle1 text-blue-grey-10">
                      {{ props.row.nama }}
                    </div>
                    <div class="text-caption text-grey-6">
                      {{ props.row.kota || 'Lokasi tidak diatur' }}
                    </div>
                  </div>
                </div>
              </q-td>
              <q-td key="email">
                <div class="text-weight-medium">{{ props.row.email }}</div>
                <div class="text-caption text-primary">{{ props.row.kontak }}</div>
              </q-td>
              <q-td key="aksi" class="text-center" @click.stop>
                <div class="row justify-center q-gutter-sm">
                  <q-btn
                    v-if="canAction('ubah')"
                    flat
                    round
                    color="blue-8"
                    icon="edit"
                    size="sm"
                    @click="openEditDialog(props.row)"
                  >
                    <q-tooltip>Edit Data</q-tooltip>
                  </q-btn>
                  <q-btn
                    v-if="canAction('hapus')"
                    flat
                    round
                    color="negative"
                    icon="delete_sweep"
                    size="sm"
                    @click="confirmHapus(props.row)"
                  >
                    <q-tooltip>Hapus Data</q-tooltip>
                  </q-btn>
                  <q-btn
                    flat
                    round
                    color="grey-6"
                    icon="chevron_right"
                    size="sm"
                    @click="onRowClick(null, props.row)"
                  />
                </div>
              </q-td>
            </q-tr>
          </template>

          <!-- Empty State -->
          <template v-slot:no-data>
            <div class="full-width row flex-center q-pa-xl text-grey-5">
              <q-icon name="people_outline" size="64px" class="q-mb-md" />
              <div class="text-h6 full-width text-center">Belum ada data customer terdaftar</div>
            </div>
          </template>
        </q-table>
      </q-card>
    </template>

    <!-- VIEW 2: DETAIL PROFIL (High End Layout) -->
    <q-dialog
      v-model="showDetail"
      maximized
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card class="bg-grey-2 column no-wrap" v-if="currentCustomer">
        <q-toolbar class="bg-indigo-10 text-white q-py-md">
          <q-btn flat round dense icon="arrow_back" v-close-popup />
          <q-toolbar-title class="text-weight-bold">PROFIL LENGKAP KLIEN</q-toolbar-title>
          <q-btn
            flat
            icon="edit"
            label="Edit Profil"
            @click="openEditFromDetail"
            v-if="canAction('ubah')"
          />
        </q-toolbar>

        <q-card-section class="col scroll q-pa-xl">
          <div class="row justify-center">
            <div class="col-12 col-lg-10">
              <!-- Profile Header Card -->
              <q-card
                flat
                bordered
                class="rounded-20 shadow-premium q-mb-xl bg-white overflow-hidden"
              >
                <div class="row">
                  <div class="col-12 col-md-4 bg-indigo-1 flex flex-center q-pa-xl">
                    <q-avatar
                      size="150px"
                      color="indigo-10"
                      text-color="white"
                      class="shadow-10 border-white-5"
                    >
                      <div class="text-h2">{{ currentCustomer.nama?.charAt(0) }}</div>
                    </q-avatar>
                  </div>
                  <div class="col-12 col-md-8 q-pa-xl">
                    <div class="text-h3 text-weight-bolder text-indigo-10 q-mb-xs uppercase">
                      {{ currentCustomer.nama }}
                    </div>
                    <div class="text-h6 text-grey-7 q-mb-lg flex items-center">
                      <q-icon name="business" class="q-mr-sm" /> Customer Terdaftar
                    </div>

                    <div class="row q-col-gutter-lg">
                      <div class="col-12 col-sm-6">
                        <div class="text-overline text-grey-6">Email Perusahaan</div>
                        <div class="text-subtitle1 text-weight-bold">
                          {{ currentCustomer.email }}
                        </div>
                      </div>
                      <div class="col-12 col-sm-6">
                        <div class="text-overline text-grey-6">Kontak Utama</div>
                        <div class="text-subtitle1 text-weight-bold">
                          {{ currentCustomer.kontak }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </q-card>

              <!-- Info Detail Grid -->
              <div class="row q-col-gutter-xl">
                <!-- Left: Identity & Address -->
                <div class="col-12 col-md-6">
                  <q-card flat bordered class="rounded-20 shadow-sm bg-white full-height">
                    <q-card-section
                      class="bg-blue-grey-1 text-blue-grey-10 text-weight-bold uppercase letter-spacing-1"
                    >
                      <q-icon name="info" class="q-mr-sm" /> Identitas & Lokasi
                    </q-card-section>
                    <q-separator />
                    <q-card-section class="q-pa-lg">
                      <div class="q-gutter-y-lg">
                        <div class="row items-center">
                          <div class="col-4 text-grey-7 text-weight-medium">No. NPWP</div>
                          <div class="col-8 text-weight-bolder text-indigo-10">
                            {{ currentCustomer.npwp || 'Tidak Tersedia' }}
                          </div>
                        </div>
                        <div class="row">
                          <div class="col-4 text-grey-7 text-weight-medium">Alamat</div>
                          <div class="col-8 text-grey-9">{{ currentCustomer.alamat || '-' }}</div>
                        </div>
                        <div class="row items-center">
                          <div class="col-4 text-grey-7 text-weight-medium">Kota / Prov</div>
                          <div class="col-8">
                            {{ currentCustomer.kota }}, {{ currentCustomer.provinsi }}
                          </div>
                        </div>
                      </div>
                    </q-card-section>
                  </q-card>
                </div>

                <!-- Right: PIC & Finance -->
                <div class="col-12 col-md-6">
                  <q-card flat bordered class="rounded-20 shadow-sm bg-white full-height">
                    <q-card-section
                      class="bg-blue-grey-1 text-blue-grey-10 text-weight-bold uppercase letter-spacing-1"
                    >
                      <q-icon name="account_balance" class="q-mr-sm" /> Finansial & PIC
                    </q-card-section>
                    <q-separator />
                    <q-card-section class="q-pa-lg">
                      <div class="q-gutter-y-lg">
                        <div class="row items-center">
                          <div class="col-4 text-grey-7 text-weight-medium">PIC Name</div>
                          <div class="col-8 text-weight-bold">
                            {{ currentCustomer.pic_nama || '-' }}
                          </div>
                        </div>
                        <div class="row items-center">
                          <div class="col-4 text-grey-7 text-weight-medium">Bank</div>
                          <div class="col-8">{{ currentCustomer.rek_bank || '-' }}</div>
                        </div>
                        <div class="row items-center">
                          <div class="col-4 text-grey-7 text-weight-medium">No. Rekening</div>
                          <div class="col-8 text-weight-bold text-primary">
                            {{ currentCustomer.rek_nomor || '-' }}
                          </div>
                        </div>
                      </div>
                    </q-card-section>
                  </q-card>
                </div>

                <!-- Bottom: Documents -->
                <div class="col-12">
                  <q-card flat bordered class="rounded-20 shadow-sm bg-white overflow-hidden">
                    <q-card-section class="bg-indigo-10 text-white text-weight-bold uppercase">
                      <q-icon name="description" class="q-mr-sm" /> Arsip Dokumen Pendukung
                    </q-card-section>
                    <q-list separator>
                      <q-expansion-item
                        v-for="(docItem, i) in currentCustomer.additional_docs"
                        :key="i"
                        icon="folder_zip"
                        :label="docItem.label"
                        header-class="text-weight-bold text-blue-grey-10"
                      >
                        <div class="q-pa-md bg-grey-3">
                          <iframe
                            :src="docItem.url || docItem.base64"
                            frameborder="0"
                            style="width: 100%; height: 500px; border-radius: 12px"
                            class="shadow-5 bg-white"
                          ></iframe>
                        </div>
                      </q-expansion-item>
                      <q-item v-if="!currentCustomer.additional_docs?.length">
                        <q-item-section class="text-center q-pa-xl text-grey-5 italic">
                          Belum ada berkas pendukung terlampir untuk klien ini.
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </q-card>
                </div>
              </div>
            </div>
          </div>
          <div class="q-py-xl"></div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- FORM DIALOG: TAMBAH / UPDATE -->
    <q-dialog
      v-model="showDialog"
      persistent
      maximized
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card class="bg-grey-2 column no-wrap">
        <q-toolbar class="bg-white text-indigo-10 q-py-md shadow-2">
          <q-btn flat round dense icon="close" v-close-popup color="grey-7" />
          <q-toolbar-title class="text-weight-bold text-center">
            {{ isEditMode ? 'PEMBARUAN DATA CUSTOMER' : 'REGISTRASI CUSTOMER BARU' }}
          </q-toolbar-title>
          <q-btn
            unelevated
            color="indigo-10"
            label="SIMPAN DATA"
            :loading="submitting"
            rounded
            class="q-px-xl text-weight-bold"
            @click="simpanCustomer"
          />
        </q-toolbar>

        <q-card-section class="col scroll q-pa-lg q-pa-md-xl">
          <div class="row justify-center">
            <div class="col-12 col-lg-10">
              <div class="row q-col-gutter-xl">
                <!-- FORM LEFT: PROFILE -->
                <div class="col-12 col-md-6">
                  <q-card flat bordered class="rounded-20 q-pa-lg bg-white shadow-1">
                    <div
                      class="text-subtitle1 text-indigo-10 text-weight-bolder q-mb-lg flex items-center"
                    >
                      <q-icon name="person" class="q-mr-sm" /> INFORMASI PROFIL
                    </div>
                    <div class="q-gutter-y-md">
                      <q-input
                        outlined
                        v-model="form.nama"
                        label="Nama Instansi / Konsumen *"
                        placeholder="Contoh: PT. Agra Abhinaya"
                        stack-label
                      />
                      <div class="row q-col-gutter-md">
                        <q-input
                          class="col-12 col-sm-6"
                          outlined
                          v-model="form.email"
                          label="Email Resmi *"
                          placeholder="office@company.com"
                          stack-label
                        />
                        <q-input
                          class="col-12 col-sm-6"
                          outlined
                          v-model="form.kontak"
                          label="No. WhatsApp / HP"
                          placeholder="08xxxx"
                          stack-label
                        />
                      </div>
                      <q-input
                        outlined
                        v-model="form.npwp"
                        label="NPWP (Nomor Pokok Wajib Pajak)"
                        mask="##.###.###.#-###.###"
                        placeholder="00.000.000.0-000.000"
                        stack-label
                      />
                      <div class="row q-col-gutter-md">
                        <q-select
                          class="col-6"
                          outlined
                          v-model="form.provinsi"
                          :options="[
                            'DKI Jakarta',
                            'Jawa Barat',
                            'Banten',
                            'Jawa Tengah',
                            'Jawa Timur',
                          ]"
                          label="Provinsi"
                          stack-label
                        />
                        <q-input
                          class="col-6"
                          outlined
                          v-model="form.kota"
                          label="Kota / Kabupaten"
                          stack-label
                        />
                      </div>
                      <q-input
                        outlined
                        v-model="form.alamat"
                        type="textarea"
                        label="Alamat Operasional Lengkap"
                        rows="3"
                        autogrow
                        stack-label
                      />
                    </div>
                  </q-card>

                  <q-card flat bordered class="rounded-20 q-pa-lg bg-white shadow-1 q-mt-lg">
                    <div
                      class="text-subtitle1 text-indigo-10 text-weight-bolder q-mb-md flex items-center"
                    >
                      <q-icon name="contact_phone" class="q-mr-sm" /> PERSON IN CHARGE (PIC)
                    </div>
                    <div class="row q-col-gutter-md">
                      <q-input
                        class="col-6"
                        outlined
                        v-model="form.pic_nama"
                        label="Nama Lengkap PIC"
                        dense
                      />
                      <q-input
                        class="col-6"
                        outlined
                        v-model="form.pic_email"
                        label="Email PIC"
                        dense
                      />
                    </div>
                  </q-card>
                </div>

                <!-- FORM RIGHT: FINANCE & DOCS -->
                <div class="col-12 col-md-6">
                  <q-card flat bordered class="rounded-20 q-pa-lg bg-white shadow-1">
                    <div
                      class="text-subtitle1 text-indigo-10 text-weight-bolder q-mb-lg flex items-center"
                    >
                      <q-icon name="account_balance" class="q-mr-sm" /> INFORMASI PERBANKAN
                    </div>
                    <div class="q-gutter-y-md">
                      <q-input
                        outlined
                        v-model="form.rek_nomor"
                        label="Nomor Rekening"
                        stack-label
                      />
                      <div class="row q-col-gutter-md">
                        <q-input
                          class="col-6"
                          outlined
                          v-model="form.rek_bank"
                          label="Nama Bank"
                          dense
                        />
                        <q-input
                          class="col-6"
                          outlined
                          v-model="form.rek_nama"
                          label="Atas Nama Rekening"
                          dense
                        />
                      </div>
                    </div>
                  </q-card>

                  <q-card flat bordered class="rounded-20 q-pa-lg bg-white shadow-1 q-mt-lg">
                    <div class="row items-center justify-between q-mb-lg">
                      <div
                        class="text-subtitle1 text-indigo-10 text-weight-bolder flex items-center"
                      >
                        <q-icon name="cloud_upload" class="q-mr-sm" /> DOKUMEN PENDUKUNG
                      </div>
                      <q-btn
                        round
                        unelevated
                        color="indigo-10"
                        icon="add"
                        size="sm"
                        @click="addDocRow"
                      />
                    </div>

                    <div
                      v-for="(item, index) in form.additional_docs"
                      :key="index"
                      class="q-mb-md q-pa-sm bg-grey-1 rounded-borders border-dashed"
                    >
                      <div class="row q-col-gutter-sm items-center">
                        <div class="col-5">
                          <q-input
                            outlined
                            dense
                            v-model="item.label"
                            placeholder="Nama Berkas (ex: SIUP)"
                            bg-color="white"
                          />
                        </div>
                        <div class="col-5">
                          <q-file
                            outlined
                            dense
                            v-model="item.fileObj"
                            label="Pilih File"
                            bg-color="white"
                          >
                            <template v-slot:prepend
                              ><q-icon name="attach_file" size="xs"
                            /></template>
                            <template v-slot:append v-if="item.url || item.base64">
                              <q-icon name="check_circle" color="positive" size="xs" />
                            </template>
                          </q-file>
                        </div>
                        <div class="col-2 text-right">
                          <q-btn
                            flat
                            round
                            dense
                            color="negative"
                            icon="delete"
                            size="sm"
                            @click="removeDocRow(index)"
                          />
                        </div>
                      </div>
                    </div>

                    <div
                      v-if="!form.additional_docs.length"
                      class="text-center q-pa-md text-grey-5 dashed-box"
                    >
                      Klik ikon plus untuk melampirkan berkas
                    </div>
                  </q-card>
                </div>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <div class="q-py-xl"></div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useQuasar } from 'quasar'
import { db, storage } from 'src/boot/firebase'
import {
  collection,
  onSnapshot,
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
const loading = ref(true)
const submitting = ref(false)
const showDialog = ref(false)
const showDetail = ref(false)
const isEditMode = ref(false)
const filter = ref('')
const currentCustomer = ref(null)
const userData = ref(null)

let unsubUser = null
let unsubCustomer = null

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
  { name: 'email', align: 'left', label: 'KONTAK & EMAIL', field: 'email', sortable: true },
  { name: 'aksi', align: 'center', label: 'AKSI', field: 'aksi' },
]

const canAction = (actionType) => {
  if (authStore.user?.role === 'Super Admin') return true
  if (!userData.value?.permissions_detail) return false
  const modulePerm = userData.value.permissions_detail.find((m) => m.id === 'konstruksi')
  if (!modulePerm || !modulePerm.isActive) return false
  const targetId = '_konstruksi_marketing_customer'
  const menu = modulePerm.menus.find((m) => m.id === targetId)
  return menu ? menu[actionType] || false : false
}

const processHybridUpload = async (file, pathName) => {
  if (!file) return null
  // Max size 500KB untuk hybrid (simpan as base64), selebihnya upload ke storage
  if (file.size <= 512000) {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result)
    })
  } else {
    const sRef = storageRef(storage, `customers/docs/${Date.now()}_${pathName}`)
    const snap = await uploadBytes(sRef, file)
    return await getDownloadURL(snap.ref)
  }
}

const addDocRow = () =>
  form.value.additional_docs.push({ label: '', url: '', base64: '', fileObj: null })
const removeDocRow = (i) => form.value.additional_docs.splice(i, 1)

const simpanCustomer = async () => {
  if (!form.value.nama) {
    $q.notify({ type: 'warning', message: 'Nama Instansi wajib diisi' })
    return
  }

  $q.loading.show({ message: 'Sedang memproses data...' })
  submitting.value = true

  try {
    for (let item of form.value.additional_docs) {
      if (item.fileObj) {
        const result = await processHybridUpload(item.fileObj, item.label || 'Doc')
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
    $q.notify({ type: 'positive', message: 'Database klien berhasil diperbarui!', position: 'top' })
  } catch (e) {
    console.error(e)
    $q.notify({ type: 'negative', message: 'Gagal sinkronisasi ke server: ' + e.message })
  } finally {
    $q.loading.hide()
    submitting.value = false
  }
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

const openEditFromDetail = () => {
  form.value = JSON.parse(JSON.stringify(currentCustomer.value))
  isEditMode.value = true
  showDetail.value = false
  showDialog.value = true
}

const confirmHapus = (r) => {
  $q.dialog({
    title: 'Konfirmasi Penghapusan',
    message: `Apakah Anda yakin ingin menghapus data customer ${r.nama}? Tindakan ini permanen.`,
    cancel: { label: 'Batal', flat: true, color: 'grey-7' },
    ok: { label: 'Hapus Klien', color: 'negative', unelevated: true, rounded: true },
    persistent: true,
  }).onOk(async () => {
    try {
      await deleteDoc(doc(db, 'customer', r.id))
      $q.notify({ icon: 'delete', message: 'Data klien telah dihapus dari sistem.' })
      // eslint-disable-next-line no-unused-vars
    } catch (e) {
      $q.notify({ color: 'negative', message: 'Gagal menghapus data.' })
    }
  })
}

onMounted(() => {
  // 1. Pantau Hak Akses User Real-time
  const userEmail = authStore.user?.email
  if (userEmail) {
    const qUser = query(collection(db, 'karyawan'), where('email', '==', userEmail))
    unsubUser = onSnapshot(qUser, (snapshot) => {
      if (!snapshot.empty) userData.value = snapshot.docs[0].data()
    })
  }

  // 2. Ambil Data Customer Real-time
  const qCustomer = query(collection(db, 'customer'), orderBy('createdAt', 'desc'))
  unsubCustomer = onSnapshot(
    qCustomer,
    (snap) => {
      rows.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      loading.value = false
    },
    (err) => {
      console.error('Firestore Listen Error:', err)
      loading.value = false
    },
  )
})

onUnmounted(() => {
  if (unsubUser) unsubUser()
  if (unsubCustomer) unsubCustomer()
})
</script>

<style scoped>
.font-pro {
  font-family:
    'Inter',
    -apple-system,
    sans-serif;
}
.rounded-20 {
  border-radius: 20px;
}
.shadow-premium {
  box-shadow: 0 10px 30px rgba(25, 118, 210, 0.15);
}
.border-dashed {
  border: 2px dashed #e0e0e0;
}
.dashed-box {
  border: 2px dashed #e0e0e0;
  border-radius: 12px;
}

.customer-table :deep(thead tr th) {
  position: sticky;
  top: 0;
  z-index: 1;
}
.btn-hover:hover {
  filter: brightness(1.1);
  transform: scale(1.02);
  transition: 0.3s;
}
.hover-bg:hover {
  background-color: rgba(25, 118, 210, 0.03) !important;
}
.transition-all {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.animate-fade {
  animation: fadeIn 0.8s ease-out;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.letter-spacing-1 {
  letter-spacing: 1px;
}
.border-white-5 {
  border: 5px solid white;
}
.search-input :deep(.q-field__control) {
  border-radius: 30px;
}
</style>
