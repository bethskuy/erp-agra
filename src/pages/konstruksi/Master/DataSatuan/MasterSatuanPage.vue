<template>
  <q-page class="bg-grey-2 q-pa-md">
    <div class="row items-center q-mb-md">
      <div class="col">
        <div class="text-h5 text-weight-bold text-primary text-uppercase">Data Satuan</div>
        <div class="text-caption text-grey-7">
          Kelola daftar satuan ukuran material dan jasa (Unit of Measurement) di Cloud Firestore.
        </div>
      </div>
      <div class="col-auto">
        <!-- Tombol Tambah: Hanya muncul jika punya izin 'buat' -->
        <q-btn
          v-if="canAction('buat')"
          unelevated
          color="primary"
          icon="add"
          label="Tambah Satuan"
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
          <q-input outlined dense debounce="300" v-model="filter" placeholder="Cari satuan...">
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
              @click="confirmHapus(props.row)"
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

    <!-- Modal Form Tambah/Edit -->
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
            {{ isEditMode ? 'Edit Satuan Ukuran' : 'Tambah Satuan Ukuran Baru' }}
          </q-toolbar-title>
          <q-btn flat round dense icon="close" v-close-popup />
        </q-toolbar>

        <q-card-section class="col scroll q-pa-none">
          <div class="row justify-center q-pt-xl q-px-md">
            <div class="col-12 col-md-8 col-lg-6 q-gutter-y-lg">
              <div>
                <div class="label-req">
                  Simbol / Nama Satuan <span class="text-negative">*</span>
                </div>
                <q-input
                  outlined
                  dense
                  v-model="form.nama"
                  placeholder="Contoh: m3, Kg, Sack, Ls..."
                  bg-color="white"
                  autofocus
                />
              </div>

              <div>
                <div class="label-req">Keterangan Panjang</div>
                <q-input
                  outlined
                  dense
                  v-model="form.keterangan"
                  placeholder="Contoh: Meter Kubik, Kilogram, Lump Sum..."
                  bg-color="white"
                />
              </div>

              <q-banner dense class="bg-blue-1 text-blue-9 rounded-borders q-pa-md">
                <template v-slot:avatar>
                  <q-icon name="info" color="blue-9" />
                </template>
                Satuan ini akan digunakan sebagai pilihan Unit (Uom) pada Master Barang dan AHSP.
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
                  @click="simpanKeFirestore"
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

const formDefault = { id: null, nama: '', keterangan: '' }
const form = ref({ ...formDefault })
const rows = ref([])

const columns = [
  { name: 'nama', align: 'left', label: 'SIMBOL / SATUAN', field: 'nama', sortable: true },
  { name: 'keterangan', align: 'left', label: 'KETERANGAN', field: 'keterangan', sortable: true },
  { name: 'aksi', align: 'center', label: 'AKSI', field: 'aksi' },
]

/**
 * LOGIKA SATPAM: Mengecek izin aksi granular (buat, ubah, hapus)
 * ID Target untuk Data Satuan: _konstruksi_master_satuan
 */
const canAction = (actionType) => {
  if (authStore.user?.role === 'Super Admin') return true
  if (!userData.value?.permissions_detail) return false

  const modulePerm = userData.value.permissions_detail.find((m) => m.id === 'konstruksi')
  if (!modulePerm || !modulePerm.isActive) return false

  // ID Menu disesuaikan dengan generator rute: _konstruksi_master_satuan
  const targetId = '_konstruksi_master_satuan'
  const menu = modulePerm.menus.find((m) => m.id === targetId)

  if (!menu) return false
  return menu[actionType] || false
}

// --- AMBIL DATA ---
const loadData = async () => {
  loading.value = true
  try {
    const q = query(collection(db, 'master_satuan'), orderBy('nama', 'asc'))
    const snapshot = await getDocs(q)
    rows.value = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    }))
  } catch (error) {
    console.error('Fetch Error:', error)
    $q.notify({ color: 'negative', message: 'Gagal muat data cloud' })
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

  // 2. Tarik Data Satuan
  loadData()
})

onUnmounted(() => {
  if (unsubscribeUser) unsubscribeUser()
})

const openAddDialog = () => {
  isEditMode.value = false
  form.value = { ...formDefault }
  showDialog.value = true
}

const openEditDialog = (row) => {
  isEditMode.value = true
  form.value = { ...row }
  showDialog.value = true
}

// --- SIMPAN ---
const simpanKeFirestore = async () => {
  if (!form.value.nama) {
    $q.notify({ color: 'negative', message: 'Nama Satuan wajib diisi!' })
    return
  }

  submitting.value = true
  try {
    if (isEditMode.value) {
      const docRef = doc(db, 'master_satuan', form.value.id)
      const updateData = {
        nama: form.value.nama,
        keterangan: form.value.keterangan,
        updatedAt: serverTimestamp(),
      }
      await updateDoc(docRef, updateData)
      $q.notify({ color: 'positive', message: 'Satuan diperbarui' })
    } else {
      await addDoc(collection(db, 'master_satuan'), {
        nama: form.value.nama,
        keterangan: form.value.keterangan,
        createdAt: serverTimestamp(),
      })
      $q.notify({ color: 'positive', message: 'Satuan disimpan ke cloud' })
    }
    showDialog.value = false
    loadData()
  } catch (error) {
    console.error('Save Error:', error)
    $q.notify({ color: 'negative', message: 'Gagal simpan ke cloud' })
  } finally {
    submitting.value = false
  }
}

// --- HAPUS ---
const confirmHapus = (row) => {
  $q.dialog({
    title: 'Konfirmasi Hapus',
    message: `Hapus satuan <b>${row.nama}</b> dari database?`,
    html: true,
    cancel: true,
    ok: { label: 'Hapus', color: 'negative', unelevated: true },
  }).onOk(async () => {
    try {
      await deleteDoc(doc(db, 'master_satuan', row.id))
      $q.notify({ color: 'positive', message: 'Data berhasil dihapus' })
      loadData()
    } catch (error) {
      console.error('Delete Error:', error)
      $q.notify({ color: 'negative', message: 'Gagal menghapus data' })
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
