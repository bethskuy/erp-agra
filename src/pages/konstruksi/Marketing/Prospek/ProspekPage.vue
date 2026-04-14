<template>
  <q-page class="bg-grey-2 q-pa-md">
    <div class="row items-center q-mb-md">
      <div class="col">
        <div class="text-h5 text-weight-bold text-primary text-uppercase">Data Prospek</div>
        <div class="text-caption text-grey-7">Manajemen database calon klien untuk marketing.</div>
      </div>
      <div class="col-auto">
        <q-btn
          unelevated
          color="primary"
          icon="add"
          label="Tambah Prospek"
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
        :loading="loading"
        :filter="filter"
        class="my-sticky-header-table"
      >
        <template v-slot:top-right>
          <q-input outlined dense debounce="300" v-model="filter" placeholder="Cari prospek...">
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
        </template>

        <template v-slot:body-cell-aksi="props">
          <q-td :props="props" class="q-gutter-xs text-center">
            <q-btn flat round color="blue" icon="edit" size="sm" @click="openEditDialog(props.row)">
              <q-tooltip>Edit Data</q-tooltip>
            </q-btn>
            <q-btn
              flat
              round
              color="negative"
              icon="delete"
              size="sm"
              @click="confirmHapus(props.row)"
            >
              <q-tooltip>Hapus Data</q-tooltip>
            </q-btn>
          </q-td>
        </template>

        <template v-slot:no-data>
          <div class="full-width row flex-center q-gutter-sm q-pa-lg text-grey-6">
            <q-icon size="2em" name="sentiment_dissatisfied" />
            <span>Belum ada data prospek...</span>
          </div>
        </template>
      </q-table>
    </q-card>

    <q-dialog v-model="showDialog" persistent>
      <q-card style="width: 500px; max-width: 90vw" class="rounded-borders">
        <q-toolbar class="bg-primary text-white">
          <q-toolbar-title class="text-weight-bold">
            {{ isEditMode ? 'Edit Prospek' : 'Tambah Prospek Baru' }}
          </q-toolbar-title>
          <q-btn flat round dense icon="close" v-close-popup />
        </q-toolbar>

        <q-card-section class="q-gutter-md q-pt-lg">
          <div class="label-req">Nama Klien / Perusahaan <span class="text-negative">*</span></div>
          <q-input
            outlined
            v-model="form.nama"
            placeholder="Contoh: PT. Maju Jaya"
            dense
            bg-color="white"
          />

          <div class="label-req">No. WhatsApp / HP</div>
          <q-input outlined v-model="form.kontak" placeholder="0812..." dense bg-color="white" />

          <div class="label-req">Alamat Email</div>
          <q-input
            outlined
            v-model="form.email"
            placeholder="email@perusahaan.com"
            dense
            bg-color="white"
          />

          <div class="label-req">Alamat Lengkap</div>
          <q-input
            outlined
            v-model="form.alamat"
            type="textarea"
            placeholder="Ketik alamat lengkap klien..."
            dense
            rows="3"
            bg-color="white"
          />
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md bg-grey-1">
          <q-btn flat label="Batal" color="grey-7" v-close-popup no-caps />
          <q-btn
            unelevated
            color="primary"
            :label="isEditMode ? 'Perbarui' : 'Simpan Data'"
            :loading="submitting"
            class="q-px-lg btn-radius"
            @click="simpanProspek"
            no-caps
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from 'src/boot/firebase'

const $q = useQuasar()
const rows = ref([])
const loading = ref(false)
const submitting = ref(false)
const showDialog = ref(false)
const isEditMode = ref(false)
const filter = ref('')

const formDefault = {
  id: null,
  nama: '',
  kontak: '',
  email: '',
  alamat: '',
}
const form = ref({ ...formDefault })

const columns = [
  { name: 'nama', align: 'left', label: 'NAMA KLIEN', field: 'nama', sortable: true },
  { name: 'kontak', align: 'left', label: 'KONTAK / WA', field: 'kontak' },
  { name: 'email', align: 'left', label: 'EMAIL', field: 'email' },
  { name: 'aksi', align: 'center', label: 'AKSI', field: 'aksi' },
]

// --- FETCH DATA DARI FIRESTORE ---
const fetchData = async () => {
  loading.value = true
  try {
    const q = query(collection(db, 'prospek'), orderBy('createdAt', 'desc'))
    const snap = await getDocs(q)
    // PENTING: Map id agar bisa diedit/hapus
    rows.value = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }))
  } catch (e) {
    console.error('Fetch Error:', e)
    $q.notify({ color: 'negative', message: 'Gagal memuat data' })
  } finally {
    loading.value = false
  }
}

onMounted(fetchData)

// --- FORM LOGIC ---
const openAddDialog = () => {
  isEditMode.value = false
  form.value = { ...formDefault }
  showDialog.value = true
}

const openEditDialog = (row) => {
  isEditMode.value = true
  // Kloning data agar tidak merubah tabel secara langsung
  form.value = { ...row }
  showDialog.value = true
}

const simpanProspek = async () => {
  if (!form.value.nama) {
    $q.notify({ color: 'negative', message: 'Nama Prospek wajib diisi!' })
    return
  }

  submitting.value = true
  try {
    const payload = {
      nama: form.value.nama,
      kontak: form.value.kontak || '',
      email: form.value.email || '',
      alamat: form.value.alamat || '',
      updatedAt: serverTimestamp(),
    }

    if (isEditMode.value && form.value.id) {
      // PROSES UPDATE
      await updateDoc(doc(db, 'prospek', form.value.id), payload)
      $q.notify({ color: 'positive', message: 'Data prospek berhasil diperbarui' })
    } else {
      // PROSES SIMPAN BARU
      payload.createdAt = serverTimestamp()
      await addDoc(collection(db, 'prospek'), payload)
      $q.notify({ color: 'positive', message: 'Prospek baru berhasil disimpan' })
    }
    showDialog.value = false
    fetchData()
  } catch (e) {
    console.error('Save Error:', e)
    $q.notify({ color: 'negative', message: 'Terjadi kesalahan sistem' })
  } finally {
    submitting.value = false
  }
}

const confirmHapus = (row) => {
  $q.dialog({
    title: 'Konfirmasi Hapus',
    message: `Apakah Anda yakin ingin menghapus prospek "${row.nama}"?`,
    cancel: true,
    persistent: true,
    ok: { color: 'negative', label: 'Hapus', unelevated: true },
    // eslint-disable-next-line no-dupe-keys
    cancel: { color: 'grey-7', flat: true },
  }).onOk(async () => {
    try {
      await deleteDoc(doc(db, 'prospek', row.id))
      $q.notify({ color: 'positive', message: 'Data prospek telah dihapus' })
      fetchData()
      // eslint-disable-next-line no-unused-vars
    } catch (e) {
      $q.notify({ color: 'negative', message: 'Gagal menghapus data' })
    }
  })
}
</script>

<style scoped>
.label-req {
  font-size: 12px;
  font-weight: 700;
  color: #555;
  margin-bottom: 2px;
  text-transform: uppercase;
}
.btn-radius {
  border-radius: 8px;
}
.rounded-borders {
  border-radius: 12px;
}
.bordered-bottom {
  border-bottom: 1px solid #e0e0e0;
}
</style>
