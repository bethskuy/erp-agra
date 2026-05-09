<template>
  <q-page class="bg-grey-2 q-pa-md q-pa-md-lg font-pro">
    <!-- HEADER SECTION -->
    <div class="row items-center justify-between q-mb-xl animate-fade">
      <div class="col-12 col-md-8">
        <div class="text-h4 text-weight-bolder text-teal-10 leading-tight">
          Kategori Barang
          <span class="text-h5 text-weight-light text-grey-6 block q-mt-xs"
            >Klasifikasi & Pengelompokan</span
          >
        </div>
        <div class="text-subtitle1 text-grey-7 q-mt-sm">
          Kelola parameter pengelompokan material untuk mempermudah manajemen inventaris Proyek.
        </div>
      </div>
      <div class="col-12 col-md-auto q-mt-md q-mt-md-none">
        <q-btn
          v-if="canAction('buat')"
          color="teal-10"
          icon="add_circle_outline"
          label="Tambah Kategori"
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
              placeholder="Cari nama atau deskripsi kategori..."
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
            Total Kategori:
            <span class="text-weight-bold text-teal-10">{{ rows.length }} Grup</span>
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
        class="kategori-table"
      >
        <!-- Custom Header -->
        <template v-slot:header="props">
          <q-tr :props="props" class="bg-teal-10 text-white">
            <q-th v-for="col in props.cols" :key="col.name" :props="props" class="text-weight-bold">
              {{ col.label }}
            </q-th>
          </q-tr>
        </template>

        <!-- Custom Body -->
        <template v-slot:body="props">
          <q-tr :props="props" class="hover-bg transition-all">
            <q-td key="nama">
              <div class="row items-center no-wrap">
                <q-avatar
                  size="32px"
                  color="teal-1"
                  text-color="teal-10"
                  icon="folder"
                  class="q-mr-md"
                />
                <div class="text-weight-bold text-subtitle2 text-blue-grey-10 text-uppercase">
                  {{ props.row.nama }}
                </div>
              </div>
            </q-td>
            <q-td key="keterangan" class="text-grey-7">
              {{ props.row.keterangan || '-' }}
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
                  <q-tooltip>Ubah Kategori</q-tooltip>
                </q-btn>
                <q-btn
                  v-if="canAction('hapus')"
                  flat
                  round
                  color="negative"
                  icon="delete_sweep"
                  size="sm"
                  @click="hapusKategori(props.row)"
                >
                  <q-tooltip>Hapus Kategori</q-tooltip>
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

        <!-- No Data State -->
        <template v-slot:no-data>
          <div class="full-width row flex-center q-pa-xl text-grey-5">
            <q-icon name="low_priority" size="64px" class="q-mb-md" />
            <div class="text-h6 full-width text-center">Belum ada pengelompokan kategori</div>
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
        <q-toolbar class="bg-white text-teal-10 q-py-md shadow-2">
          <q-btn flat round dense icon="close" v-close-popup color="grey-7" />
          <q-toolbar-title class="text-weight-bold text-center">
            {{ isEditMode ? 'EDIT DATA KATEGORI' : 'TAMBAH KATEGORI BARU' }}
          </q-toolbar-title>
          <q-btn
            unelevated
            color="teal-10"
            label="SIMPAN DATA"
            :loading="submitting"
            rounded
            class="q-px-xl text-weight-bold shadow-3"
            @click="simpanKategori"
          />
        </q-toolbar>

        <q-card-section class="col scroll q-pa-lg q-pa-md-xl">
          <div class="row justify-center">
            <div class="col-12 col-md-8 col-lg-6">
              <q-card flat bordered class="rounded-20 q-pa-xl bg-white shadow-1">
                <div
                  class="text-subtitle1 text-teal-10 text-weight-bolder q-mb-lg flex items-center"
                >
                  <q-icon name="inventory" class="q-mr-sm" /> INFORMASI KATEGORI
                </div>

                <div class="q-gutter-y-lg">
                  <div>
                    <div class="label-req">
                      Nama Kategori Barang <span class="text-negative">*</span>
                    </div>
                    <q-input
                      outlined
                      v-model="form.nama"
                      placeholder="Contoh: Semen, Kayu, Besi, Perkakas..."
                      bg-color="white"
                      autofocus
                      class="text-weight-bold"
                    />
                  </div>

                  <div>
                    <div class="label-req">Keterangan / Deskripsi</div>
                    <q-input
                      outlined
                      v-model="form.keterangan"
                      type="textarea"
                      rows="4"
                      placeholder="Berikan penjelasan singkat mengenai kategori barang ini..."
                      bg-color="white"
                    />
                  </div>

                  <q-banner dense class="bg-blue-1 text-blue-9 rounded-borders q-pa-md q-mt-md">
                    <template v-slot:avatar>
                      <q-icon name="info" color="blue-9" />
                    </template>
                    <div class="text-caption leading-relaxed">
                      Kategori ini digunakan untuk mempermudah tim logistik dalam memfilter laporan
                      stok dan pengadaan barang Proyek.
                    </div>
                  </q-banner>
                </div>
              </q-card>

              <div class="q-py-xl"></div>
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

const formDefault = { nama: '', keterangan: '' }
const form = ref({ ...formDefault })
const rows = ref([])

const columns = [
  { name: 'nama', align: 'left', label: 'NAMA KATEGORI', field: 'nama', sortable: true },
  { name: 'keterangan', align: 'left', label: 'DESKRIPSI / KETERANGAN', field: 'keterangan' },
  { name: 'aksi', align: 'center', label: 'KELOLA', field: 'aksi' },
]

const canAction = (actionType) => {
  if (authStore.user?.role === 'Super Admin') return true
  if (!userData.value?.permissions_detail) return false
  const modulePerm = userData.value.permissions_detail.find((m) => m.id === 'manufaktur')
  if (!modulePerm || !modulePerm.isActive) return false
  const targetId = '_manufaktur_master_barang-kategori'
  const menu = modulePerm.menus.find((m) => m.id === targetId)
  return menu ? menu[actionType] || false : false
}

const fetchKategori = async () => {
  if (!db) return
  loading.value = true
  try {
    const q = query(collection(db, 'manufactur_master_kategori_barang'), orderBy('nama', 'asc'))
    const querySnapshot = await getDocs(q)
    rows.value = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  } catch (error) {
    console.error(error)
    $q.notify({ color: 'negative', message: 'Gagal sinkron data cloud' })
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
  fetchKategori()
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

const simpanKategori = async () => {
  if (!form.value.nama) {
    $q.notify({ color: 'negative', message: 'Nama kategori wajib diisi' })
    return
  }
  submitting.value = true
  try {
    if (isEditMode.value) {
      await updateDoc(doc(db, 'manufactur_master_kategori_barang', form.value.id), {
        nama: form.value.nama,
        keterangan: form.value.keterangan || '',
        status_aktif: form.value.status_aktif || 'Aktif',
        updatedAt: serverTimestamp(),
        updatedBy: authStore.user?.email || authStore.user?.nama || 'system',
      })
    } else {
      await addDoc(collection(db, 'manufactur_master_kategori_barang'), {
        nama: form.value.nama,
        keterangan: form.value.keterangan || '',
        status_aktif: form.value.status_aktif || 'Aktif',
        createdAt: serverTimestamp(),
        createdBy: authStore.user?.email || authStore.user?.nama || 'system',
        updatedBy: authStore.user?.email || authStore.user?.nama || 'system',
      })
    }
    showDialog.value = false
    fetchKategori()
    $q.notify({ type: 'positive', message: 'Kategori berhasil diperbarui!', position: 'top' })
  } catch (error) {
    console.error(error)
  } finally {
    submitting.value = false
  }
}

const hapusKategori = (data) => {
  $q.dialog({
    title: 'Konfirmasi Hapus',
    message: `Apakah Anda yakin ingin menghapus kategori "${data.nama}"? Tindakan ini dapat memengaruhi relasi data barang.`,
    cancel: { label: 'Batal', flat: true, color: 'grey-7' },
    ok: { label: 'Hapus', color: 'negative', unelevated: true, rounded: true },
    persistent: true,
  }).onOk(async () => {
    try {
      await deleteDoc(doc(db, 'manufactur_master_kategori_barang', data.id))
      fetchKategori()
      $q.notify({ icon: 'delete', message: 'Kategori telah dihapus' })
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
  box-shadow: 0 10px 30px rgba(0, 77, 64, 0.15);
}

.kategori-table :deep(thead tr th) {
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
  background-color: rgba(0, 77, 64, 0.04) !important;
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

.label-req {
  font-size: 13px;
  font-weight: 700;
  color: #444;
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
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
