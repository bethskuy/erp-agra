<template>
  <q-page class="bg-grey-2 q-pa-md">
    <div class="row items-center q-mb-md">
      <div class="col">
        <div class="text-h5 text-weight-bold text-primary text-uppercase">Data Barang</div>
        <div class="text-caption text-grey-7">Kelola material, alat, dan inventaris proyek.</div>
      </div>
      <div class="col-auto">
        <!-- Tombol Tambah: Hanya muncul jika punya izin 'buat' -->
        <q-btn
          v-if="canAction('buat')"
          unelevated
          color="primary"
          icon="add"
          label="Tambah Barang"
          no-caps
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
        :filter="filter"
        :loading="loading"
      >
        <template v-slot:top-right>
          <q-input outlined dense debounce="300" v-model="filter" placeholder="Cari barang...">
            <template v-slot:append><q-icon name="search" /></template>
          </q-input>
        </template>

        <!-- KOLOM AKSI: Proteksi izin 'ubah' dan 'hapus' -->
        <template v-slot:body-cell-aksi="props">
          <q-td :props="props" class="q-gutter-xs text-center">
            <!-- Tombol Edit: Muncul jika izin 'ubah' true -->
            <q-btn
              v-if="canAction('ubah')"
              flat
              round
              color="blue"
              icon="edit"
              size="sm"
              @click="openEditDialog(props.row)"
            />
            <!-- Tombol Delete: Muncul jika izin 'hapus' true -->
            <q-btn
              v-if="canAction('hapus')"
              flat
              round
              color="negative"
              icon="delete"
              size="sm"
              @click="hapusBarang(props.row)"
            />
            <!-- Tampilan jika tidak ada akses aksi sama sekali -->
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

    <q-dialog
      v-model="showDialog"
      persistent
      maximized
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card class="bg-white column no-wrap">
        <q-toolbar class="bg-white text-grey-9 q-py-md bordered">
          <q-toolbar-title class="text-weight-bold text-center">
            {{ isEditMode ? 'Edit Data Barang' : 'Tambah Barang Baru' }}
          </q-toolbar-title>
          <q-btn flat round dense icon="close" v-close-popup />
        </q-toolbar>

        <q-card-section class="col scroll q-pa-none">
          <div class="row justify-center q-pt-xl q-px-md">
            <div class="col-12 col-md-8 col-lg-6 q-gutter-y-lg">
              <div class="row q-col-gutter-md">
                <div class="col-12 col-sm-6">
                  <div class="label-req">Kode Barang</div>
                  <q-input
                    outlined
                    dense
                    v-model="form.kode"
                    placeholder="Auto generate"
                    bg-color="white"
                    :readonly="isEditMode"
                  />
                </div>
                <div class="col-12 col-sm-6">
                  <div class="label-req">Merk</div>
                  <q-input
                    outlined
                    dense
                    v-model="form.merk"
                    placeholder="Contoh: Holcim, Toyota"
                    bg-color="white"
                  />
                </div>
              </div>

              <div>
                <div class="label-req">Nama Barang <span class="text-negative">*</span></div>
                <q-input
                  outlined
                  dense
                  v-model="form.nama"
                  placeholder="Masukkan nama lengkap barang..."
                  bg-color="white"
                  autofocus
                />
              </div>

              <div class="row q-col-gutter-md">
                <div class="col-12 col-sm-6">
                  <div class="label-req">Satuan (Unit)</div>
                  <q-select
                    outlined
                    dense
                    v-model="form.unit"
                    :options="optionsSatuan"
                    label="Pilih Satuan"
                    bg-color="white"
                  >
                    <template v-slot:after>
                      <q-btn
                        round
                        dense
                        flat
                        color="primary"
                        icon="add_circle"
                        @click="quickAddSatuan"
                      >
                        <q-tooltip>Tambah Satuan Baru</q-tooltip>
                      </q-btn>
                    </template>
                  </q-select>
                </div>

                <div class="col-12 col-sm-6">
                  <div class="label-req">Kategori Barang</div>
                  <q-select
                    outlined
                    dense
                    v-model="form.kategori"
                    :options="optionsKategori"
                    label="Pilih Kategori"
                    bg-color="white"
                  >
                    <template v-slot:after>
                      <q-btn
                        round
                        dense
                        flat
                        color="primary"
                        icon="add_circle"
                        @click="quickAddKategori"
                      >
                        <q-tooltip>Tambah Kategori Baru</q-tooltip>
                      </q-btn>
                    </template>
                  </q-select>
                </div>
              </div>

              <div>
                <div class="label-req">Estimasi Harga Beli (Rp)</div>
                <q-input
                  outlined
                  dense
                  v-model.number="form.harga_beli"
                  type="number"
                  bg-color="white"
                  prefix="Rp"
                />
              </div>

              <q-banner dense class="bg-blue-1 text-blue-9 rounded-borders q-pa-md">
                <template v-slot:avatar><q-icon name="info" color="blue-9" /></template>
                Data ini akan otomatis muncul di tabel Satuan dan Kategori Barang.
              </q-banner>

              <div class="row items-center justify-end q-gutter-x-md q-pt-lg q-pb-xl">
                <q-btn
                  flat
                  label="Batal"
                  color="grey-7"
                  v-close-popup
                  class="q-px-lg btn-radius"
                  no-caps
                />
                <q-btn
                  unelevated
                  color="primary"
                  label="Simpan Data"
                  :loading="submitting"
                  @click="simpanBarang"
                  class="q-px-xl btn-radius text-weight-bold shadow-2"
                  no-caps
                />
              </div>
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
const loading = ref(false)
const submitting = ref(false)
const userData = ref(null)
let unsubscribeUser = null

const formDefault = { kode: '', nama: '', unit: null, harga_beli: 0, kategori: null, merk: '' }
const form = ref({ ...formDefault })
const rows = ref([])
const optionsSatuan = ref([])
const optionsKategori = ref([])

const columns = [
  { name: 'kode', align: 'left', label: 'KODE', field: 'kode', sortable: true },
  { name: 'nama', align: 'left', label: 'NAMA BARANG', field: 'nama', sortable: true },
  { name: 'unit', align: 'center', label: 'UNIT', field: 'unit' },
  {
    name: 'harga',
    align: 'right',
    label: 'HARGA BELI',
    field: 'harga_beli',
    format: (val) => `Rp ${Number(val).toLocaleString()}`,
  },
  { name: 'kategori', align: 'left', label: 'KATEGORI', field: 'kategori' },
  { name: 'aksi', align: 'center', label: 'AKSI', field: 'aksi' },
]

/**
 * LOGIKA SATPAM: Mengecek izin aksi granular (buat, ubah, hapus)
 * ID Target untuk List Barang adalah _konstruksi_master_barang-list
 */
const canAction = (actionType) => {
  if (authStore.user?.role === 'Super Admin') return true
  if (!userData.value?.permissions_detail) return false

  const modulePerm = userData.value.permissions_detail.find((m) => m.id === 'konstruksi')
  if (!modulePerm || !modulePerm.isActive) return false

  // ID Menu: _konstruksi_master_barang-list (sesuai generator rute di AksesPage)
  const targetId = '_konstruksi_master_barang-list'
  const menu = modulePerm.menus.find((m) => m.id === targetId)

  if (!menu) return false
  return menu[actionType] || false
}

// --- 1. FETCH DATA REFERENSI ---
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

// --- 2. QUICK ADD SATUAN ---
const quickAddSatuan = () => {
  $q.dialog({
    title: 'Tambah Satuan Baru',
    message: 'Masukkan nama/simbol satuan (Contoh: Kg, m3, Pcs)',
    prompt: { vModel: '', type: 'text' },
    cancel: true,
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
      $q.notify({ color: 'positive', message: `Satuan ${data} ditambahkan` })
      // eslint-disable-next-line no-unused-vars
    } catch (e) {
      $q.notify({ color: 'negative', message: 'Gagal tambah satuan' })
    }
  })
}

// --- 3. QUICK ADD KATEGORI ---
const quickAddKategori = () => {
  $q.dialog({
    title: 'Tambah Kategori Baru',
    message: 'Masukkan nama kategori barang',
    prompt: { vModel: '', type: 'text' },
    cancel: true,
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
      $q.notify({ color: 'positive', message: `Kategori ${data} ditambahkan` })
      // eslint-disable-next-line no-unused-vars
    } catch (e) {
      $q.notify({ color: 'negative', message: 'Gagal tambah kategori' })
    }
  })
}

// --- 4. CRUD BARANG ---
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
  // 1. Pantau Hak Akses User secara Real-time
  const userEmail = authStore.user?.email
  if (userEmail) {
    const qUser = query(collection(db, 'karyawan'), where('email', '==', userEmail))
    unsubscribeUser = onSnapshot(qUser, (snapshot) => {
      if (!snapshot.empty) {
        userData.value = snapshot.docs[0].data()
      }
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
    $q.notify({ color: 'negative', message: 'Nama harus diisi' })
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
    $q.notify({ color: 'positive', message: 'Berhasil!' })
  } catch (e) {
    console.error(e)
  } finally {
    submitting.value = false
  }
}

const hapusBarang = (data) => {
  $q.dialog({ title: 'Hapus', message: `Hapus ${data.nama}?`, cancel: true }).onOk(async () => {
    try {
      await deleteDoc(doc(db, 'master_barang', data.id))
      fetchBarang()
    } catch (e) {
      console.error(e)
    }
  })
}
</script>

<style scoped>
.rounded-borders {
  border-radius: 8px;
}
.label-req {
  font-size: 13px;
  font-weight: 600;
  color: #444;
  margin-bottom: 6px;
}
.bordered {
  border-bottom: 1px solid #ececec;
}
.btn-radius {
  border-radius: 6px;
}
</style>
