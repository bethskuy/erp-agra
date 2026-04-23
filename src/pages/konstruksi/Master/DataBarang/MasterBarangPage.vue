<template>
  <q-page class="bg-grey-2 q-pa-md q-pa-md-lg font-pro">
    <!-- HEADER SECTION -->
    <div class="row items-center justify-between q-mb-xl animate-fade">
      <div class="col-12 col-md-8">
        <div class="text-h4 text-weight-bolder text-indigo-10 leading-tight">
          Master Barang & Material
          <span class="text-h5 text-weight-light text-grey-6 block q-mt-xs"
            >Inventaris & Logistik Proyek</span
          >
        </div>
        <div class="text-subtitle1 text-grey-7 q-mt-sm">
          Kelola katalog material, peralatan, dan aset proyek PT AGRA secara tersentralisasi.
        </div>
      </div>
      <div class="col-12 col-md-auto q-mt-md q-mt-md-none">
        <q-btn
          v-if="canAction('buat')"
          color="indigo-10"
          icon="add_box"
          label="Tambah Barang Baru"
          unelevated
          rounded
          no-caps
          class="q-px-lg q-py-sm shadow-premium btn-hover"
          @click="openAddDialog"
        />
      </div>
    </div>

    <!-- SEARCH & SUMMARY CARD -->
    <q-card flat bordered class="q-mb-lg shadow-1 rounded-20 bg-white">
      <q-card-section class="q-py-md">
        <div class="row items-center q-col-gutter-md">
          <div class="col-12 col-md-5">
            <q-input
              v-model="filter"
              outlined
              dense
              rounded
              placeholder="Cari Nama Barang, Kode, atau Merk..."
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
            Total Katalog:
            <span class="text-weight-bold text-indigo-10">{{ rows.length }} Item Terdaftar</span>
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
        class="barang-table"
      >
        <!-- Custom Header -->
        <template v-slot:header="props">
          <q-tr :props="props" class="bg-indigo-10 text-white">
            <q-th v-for="col in props.cols" :key="col.name" :props="props" class="text-weight-bold">
              {{ col.label }}
            </q-th>
          </q-tr>
        </template>

        <!-- Custom Body -->
        <template v-slot:body="props">
          <q-tr :props="props" class="hover-bg transition-all">
            <q-td key="kode" class="text-weight-medium text-grey-7">{{ props.row.kode }}</q-td>
            <q-td key="nama">
              <div class="column">
                <div class="text-weight-bold text-subtitle2 text-blue-grey-10">
                  {{ props.row.nama }}
                </div>
                <div class="text-caption text-primary text-weight-medium">
                  {{ props.row.merk || 'No Brand' }}
                </div>
              </div>
            </q-td>
            <q-td key="unit" class="text-center">
              <q-badge outline color="blue-grey-4" class="text-weight-bold q-px-sm">
                {{ props.row.unit }}
              </q-badge>
            </q-td>
            <q-td key="harga" class="text-right text-weight-bolder text-indigo-10">
              Rp {{ Number(props.row.harga_beli).toLocaleString() }}
            </q-td>
            <q-td key="kategori">
              <q-chip
                dense
                color="indigo-1"
                text-color="indigo-10"
                icon="category"
                class="text-weight-bold"
              >
                {{ props.row.kategori }}
              </q-chip>
            </q-td>
            <q-td key="aksi" class="text-center">
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
                  <q-tooltip>Edit Item</q-tooltip>
                </q-btn>
                <q-btn
                  v-if="canAction('hapus')"
                  flat
                  round
                  color="negative"
                  icon="delete_outline"
                  size="sm"
                  @click="hapusBarang(props.row)"
                >
                  <q-tooltip>Hapus Item</q-tooltip>
                </q-btn>
                <q-badge
                  v-if="!canAction('ubah') && !canAction('hapus')"
                  color="grey-2"
                  text-color="grey-6"
                  label="No Access"
                />
              </div>
            </q-td>
          </q-tr>
        </template>

        <template v-slot:no-data>
          <div class="full-width row flex-center q-pa-xl text-grey-5">
            <q-icon name="inventory_2" size="64px" class="q-mb-md" />
            <div class="text-h6 full-width text-center">Item belum tersedia dalam katalog</div>
          </div>
        </template>
      </q-table>
    </q-card>

    <!-- FORM DIALOG (TAMBAH/EDIT) -->
    <q-dialog
      v-model="showDialog"
      persistent
      maximized
      transition-show="slide-up"
      transition-hide="slide-down"
      backdrop-filter="blur(4px)"
    >
      <q-card class="bg-grey-2 column no-wrap">
        <q-toolbar class="bg-white text-indigo-10 q-py-md shadow-2">
          <q-btn flat round dense icon="close" v-close-popup color="grey-7" />
          <q-toolbar-title class="text-weight-bold text-center">
            {{ isEditMode ? 'PEMBARUAN DATA BARANG' : 'REGISTRASI BARANG BARU' }}
          </q-toolbar-title>
          <q-btn
            unelevated
            color="indigo-10"
            label="SIMPAN ITEM"
            :loading="submitting"
            rounded
            class="q-px-xl text-weight-bold shadow-3"
            @click="simpanBarang"
          />
        </q-toolbar>

        <q-card-section class="col scroll q-pa-lg q-pa-md-xl">
          <div class="row justify-center">
            <div class="col-12 col-lg-10">
              <div class="row q-col-gutter-xl">
                <!-- FORM LEFT: IDENTITAS -->
                <div class="col-12 col-md-7">
                  <q-card flat bordered class="rounded-20 q-pa-lg bg-white shadow-1">
                    <div
                      class="text-subtitle1 text-indigo-10 text-weight-bolder q-mb-lg flex items-center"
                    >
                      <q-icon name="branding_watermark" class="q-mr-sm" /> IDENTITAS & SPESIFIKASI
                    </div>
                    <div class="q-gutter-y-md">
                      <div class="row q-col-gutter-md">
                        <q-input
                          class="col-12 col-sm-6"
                          outlined
                          v-model="form.kode"
                          label="Kode Internal"
                          placeholder="Auto-generate"
                          :readonly="isEditMode"
                          stack-label
                        />
                        <q-input
                          class="col-12 col-sm-6"
                          outlined
                          v-model="form.merk"
                          label="Merk / Brand"
                          placeholder="Contoh: Holcim, Jayaboard"
                          stack-label
                        />
                      </div>

                      <q-input
                        outlined
                        v-model="form.nama"
                        label="Nama Barang / Material *"
                        placeholder="Contoh: Semen Portland 50Kg"
                        stack-label
                        autofocus
                      />

                      <div class="row q-col-gutter-md q-mt-sm">
                        <div class="col-12 col-sm-6">
                          <div class="row items-center no-wrap">
                            <q-select
                              class="col"
                              outlined
                              v-model="form.unit"
                              :options="optionsSatuan"
                              label="Satuan (Unit)"
                              stack-label
                            />
                            <q-btn
                              flat
                              round
                              color="primary"
                              icon="add_circle"
                              class="q-ml-xs"
                              @click="quickAddSatuan"
                            >
                              <q-tooltip>Tambah Unit</q-tooltip>
                            </q-btn>
                          </div>
                        </div>
                        <div class="col-12 col-sm-6">
                          <div class="row items-center no-wrap">
                            <q-select
                              class="col"
                              outlined
                              v-model="form.kategori"
                              :options="optionsKategori"
                              label="Kategori Barang"
                              stack-label
                            />
                            <q-btn
                              flat
                              round
                              color="primary"
                              icon="add_circle"
                              class="q-ml-xs"
                              @click="quickAddKategori"
                            >
                              <q-tooltip>Tambah Kategori</q-tooltip>
                            </q-btn>
                          </div>
                        </div>
                      </div>
                    </div>
                  </q-card>
                </div>

                <!-- FORM RIGHT: HARGA & INFO -->
                <div class="col-12 col-md-5">
                  <q-card flat bordered class="rounded-20 q-pa-lg bg-white shadow-1">
                    <div
                      class="text-subtitle1 text-indigo-10 text-weight-bolder q-mb-lg flex items-center"
                    >
                      <q-icon name="payments" class="q-mr-sm" /> ESTIMASI BIAYA
                    </div>
                    <div class="q-gutter-y-md">
                      <q-input
                        outlined
                        v-model.number="form.harga_beli"
                        type="number"
                        label="Harga Beli Terakhir (Rp)"
                        prefix="Rp "
                        stack-label
                        class="text-h6 text-weight-bold"
                      />

                      <q-banner dense class="bg-blue-1 text-blue-9 rounded-borders q-pa-md q-mt-md">
                        <template v-slot:avatar><q-icon name="info" color="blue-9" /></template>
                        <div class="text-caption leading-relaxed">
                          Data satuan dan kategori yang Anda tambahkan di sini akan otomatis sinkron
                          ke seluruh sistem pengadaan.
                        </div>
                      </q-banner>
                    </div>
                  </q-card>

                  <!-- Preview Box -->
                  <div class="q-mt-lg q-pa-lg bg-indigo-1 rounded-20 border-dashed text-center">
                    <div class="text-overline text-indigo-10">Preview Item</div>
                    <div class="text-h6 text-weight-bolder">{{ form.nama || 'Nama Item' }}</div>
                    <div class="text-caption text-indigo-7">
                      {{ form.kode || 'BRG-XXXXX' }} • {{ form.unit || '-' }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="q-py-xl"></div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <div class="q-py-xl"></div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useQuasar } from 'quasar'
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  onSnapshot,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from 'src/boot/firebase'
import { useAuthStore } from 'src/stores/auth'

const $q = useQuasar()
const authStore = useAuthStore()
const filter = ref('')
const showDialog = ref(false)
const isEditMode = ref(false)
const loading = ref(true)
const submitting = ref(false)
const userData = ref(null)
let unsubscribeUser = null

const formDefault = { kode: '', nama: '', unit: null, harga_beli: 0, kategori: null, merk: '' }
const form = ref({ ...formDefault })
const rows = ref([])
const optionsSatuan = ref([])
const optionsKategori = ref([])

const columns = [
  { name: 'kode', align: 'left', label: 'KODE ITEM', field: 'kode', sortable: true },
  { name: 'nama', align: 'left', label: 'NAMA & MERK', field: 'nama', sortable: true },
  { name: 'unit', align: 'center', label: 'SATUAN', field: 'unit' },
  { name: 'harga', align: 'right', label: 'HARGA ESTIMASI', field: 'harga_beli', sortable: true },
  { name: 'kategori', align: 'left', label: 'KATEGORI', field: 'kategori', sortable: true },
  { name: 'aksi', align: 'center', label: 'KELOLA', field: 'aksi' },
]

const canAction = (actionType) => {
  if (authStore.user?.role === 'Super Admin') return true
  if (!userData.value?.permissions_detail) return false
  const modulePerm = userData.value.permissions_detail.find((m) => m.id === 'konstruksi')
  if (!modulePerm || !modulePerm.isActive) return false
  const targetId = '_konstruksi_master_barang-list'
  const menu = modulePerm.menus.find((m) => m.id === targetId)
  return menu ? menu[actionType] || false : false
}

const fetchReferences = async () => {
  try {
    const snapSatuan = await getDocs(query(collection(db, 'master_satuan'), orderBy('nama', 'asc')))
    optionsSatuan.value = snapSatuan.docs.map((d) => d.data().nama)

    const snapKategori = await getDocs(
      query(collection(db, 'kategori_barang'), orderBy('nama', 'asc')),
    )
    optionsKategori.value = snapKategori.docs.map((d) => d.data().nama)
  } catch (error) {
    console.error('Fetch Refs Error:', error)
  }
}

const quickAddSatuan = () => {
  $q.dialog({
    title: 'Tambah Satuan Baru',
    message: 'Masukkan nama/simbol satuan (Contoh: Kg, m3, Pcs)',
    prompt: { vModel: '', type: 'text' },
    cancel: { label: 'Batal', flat: true, color: 'grey-7' },
    ok: { label: 'Simpan', color: 'indigo-10', unelevated: true, rounded: true },
    persistent: true,
  }).onOk(async (data) => {
    if (!data) return
    try {
      await addDoc(collection(db, 'master_satuan'), {
        nama: data,
        keterangan: '-',
        createdAt: serverTimestamp(),
      })
      await fetchReferences()
      form.value.unit = data
      $q.notify({ color: 'positive', message: `Satuan ${data} berhasil ditambahkan` })
      // eslint-disable-next-line no-unused-vars
    } catch (e) {
      $q.notify({ color: 'negative', message: 'Gagal menambah satuan' })
    }
  })
}

const quickAddKategori = () => {
  $q.dialog({
    title: 'Tambah Kategori Baru',
    message: 'Masukkan nama kategori barang',
    prompt: { vModel: '', type: 'text' },
    cancel: { label: 'Batal', flat: true, color: 'grey-7' },
    ok: { label: 'Simpan', color: 'indigo-10', unelevated: true, rounded: true },
    persistent: true,
  }).onOk(async (data) => {
    if (!data) return
    try {
      await addDoc(collection(db, 'kategori_barang'), {
        nama: data,
        keterangan: '-',
        createdAt: serverTimestamp(),
      })
      await fetchReferences()
      form.value.kategori = data
      $q.notify({ color: 'positive', message: `Kategori ${data} berhasil ditambahkan` })
      // eslint-disable-next-line no-unused-vars
    } catch (e) {
      $q.notify({ color: 'negative', message: 'Gagal menambah kategori' })
    }
  })
}

const fetchBarang = async () => {
  loading.value = true
  try {
    const q = query(collection(db, 'master_barang'), orderBy('nama', 'asc'))
    const snap = await getDocs(q)
    rows.value = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  const userEmail = authStore.user?.email
  if (userEmail) {
    const qUser = query(collection(db, 'karyawan'), where('email', '==', userEmail))
    unsubscribeUser = onSnapshot(qUser, (snapshot) => {
      if (!snapshot.empty) userData.value = snapshot.docs[0].data()
    })
  }
  fetchBarang()
  fetchReferences()
})

onUnmounted(() => {
  if (unsubscribeUser) unsubscribeUser()
})

const openAddDialog = () => {
  isEditMode.value = false
  form.value = { ...formDefault }
  showDialog.value = true
}
const openEditDialog = (data) => {
  isEditMode.value = true
  form.value = { ...data }
  showDialog.value = true
}

const simpanBarang = async () => {
  if (!form.value.nama) {
    $q.notify({ color: 'negative', message: 'Nama Barang wajib diisi' })
    return
  }
  submitting.value = true
  try {
    const payload = { ...form.value, updatedAt: serverTimestamp() }
    if (isEditMode.value) {
      const docRef = doc(db, 'master_barang', form.value.id)
      delete payload.id
      await updateDoc(docRef, payload)
    } else {
      if (!payload.kode) payload.kode = 'BRG-' + Date.now().toString().slice(-6)
      payload.createdAt = serverTimestamp()
      await addDoc(collection(db, 'master_barang'), payload)
    }
    showDialog.value = false
    fetchBarang()
    $q.notify({ type: 'positive', message: 'Katalog barang diperbarui!', position: 'top' })
    // eslint-disable-next-line no-unused-vars
  } catch (e) {
    $q.notify({ color: 'negative', message: 'Terjadi kesalahan sistem' })
  } finally {
    submitting.value = false
  }
}

const hapusBarang = (data) => {
  $q.dialog({
    title: 'Konfirmasi Penghapusan',
    message: `Apakah Anda yakin ingin menghapus "${data.nama}" dari katalog? Tindakan ini permanen.`,
    cancel: { label: 'Batal', flat: true, color: 'grey-7' },
    ok: { label: 'Ya, Hapus', color: 'negative', unelevated: true, rounded: true },
    persistent: true,
  }).onOk(async () => {
    try {
      await deleteDoc(doc(db, 'master_barang', data.id))
      fetchBarang()
      $q.notify({ icon: 'delete', message: 'Item telah dihapus' })
    } catch (e) {
      console.error(e)
    }
  })
}
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

.barang-table :deep(thead tr th) {
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

.search-input :deep(.q-field__control) {
  border-radius: 30px;
}
.block {
  display: block;
}
.leading-relaxed {
  line-height: 1.6;
}
</style>
