<template>
  <q-page class="bg-blue-grey-1 q-pa-md q-pa-md-lg font-pro">
    <!-- HEADER SECTION -->
    <div class="row items-center justify-between q-mb-lg">
      <div class="col-12 col-md-auto q-mb-md q-mb-md-none">
        <div class="text-h4 text-weight-bolder text-blue-grey-10">Master Jabatan</div>
        <div class="text-subtitle2 text-grey-7">
          Kelola daftar jabatan dan role operasional perusahaan
        </div>
      </div>
      <q-btn
        color="primary"
        icon="add"
        label="Tambah Jabatan Baru"
        @click="openDialog()"
        unelevated
        rounded
        class="q-px-lg shadow-3"
      />
    </div>

    <!-- SEARCH & FILTER AREA -->
    <q-card flat bordered class="q-mb-md shadow-1 rounded-borders bg-white">
      <q-card-section class="q-py-sm">
        <div class="row items-center q-col-gutter-md">
          <div class="col-12 col-md-4">
            <q-input
              v-model="filter"
              outlined
              dense
              rounded
              placeholder="Cari nama jabatan..."
              bg-color="white"
            >
              <template v-slot:prepend>
                <q-icon name="search" color="primary" />
              </template>
              <template v-slot:append v-if="filter">
                <q-icon name="close" @click="filter = ''" class="cursor-pointer" />
              </template>
            </q-input>
          </div>
          <q-space class="gt-sm" />
          <div class="text-caption text-grey-6 q-pr-md">
            Total Kategori:
            <span class="text-weight-bold text-primary">{{ jabatanList.length }}</span> Role
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- TABLE SECTION -->
    <q-card flat bordered class="rounded-borders shadow-2 overflow-hidden bg-white">
      <q-table
        :rows="jabatanList"
        :columns="columns"
        row-key="id"
        flat
        :filter="filter"
        binary-state-sort
        class="jabatan-table"
      >
        <!-- Custom Header -->
        <template v-slot:header="props">
          <q-tr :props="props" class="bg-blue-grey-10 text-white">
            <q-th v-for="col in props.cols" :key="col.name" :props="props" class="text-weight-bold">
              {{ col.label }}
            </q-th>
          </q-tr>
        </template>

        <!-- Custom Row Body -->
        <template v-slot:body="props">
          <q-tr :props="props" class="hover-bg transition-all">
            <q-td key="namaJabatan" :props="props">
              <div class="row items-center no-wrap">
                <q-avatar
                  size="32px"
                  color="blue-1"
                  text-color="primary"
                  class="q-mr-md text-weight-bold"
                >
                  {{ props.row.namaJabatan?.charAt(0) }}
                </q-avatar>
                <div class="text-weight-bold text-blue-grey-9 text-subtitle1">
                  {{ props.row.namaJabatan }}
                </div>
              </div>
            </q-td>

            <q-td key="actions" :props="props" class="text-center">
              <div class="row justify-center q-gutter-sm">
                <q-btn
                  flat
                  round
                  icon="edit"
                  color="blue-8"
                  size="sm"
                  @click="editJabatan(props.row)"
                >
                  <q-tooltip>Ubah Nama Jabatan</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  icon="delete"
                  color="negative"
                  size="sm"
                  @click="deleteJabatan(props.row)"
                >
                  <q-tooltip>Hapus Jabatan</q-tooltip>
                </q-btn>
              </div>
            </q-td>
          </q-tr>
        </template>

        <!-- Empty State -->
        <template v-slot:no-data>
          <div class="full-width row flex-center q-pa-xl text-grey-5">
            <q-icon name="layers_clear" size="64px" class="q-mb-md" />
            <div class="text-h6 full-width text-center">Data jabatan belum tersedia</div>
          </div>
        </template>
      </q-table>
    </q-card>

    <!-- MODERN DIALOG FORM -->
    <q-dialog v-model="showDialog" persistent backdrop-filter="blur(4px)">
      <q-card style="width: 450px; max-width: 90vw" class="rounded-borders">
        <q-card-section class="row items-center bg-blue-grey-10 text-white q-py-md">
          <div class="text-h6 text-weight-bold">
            <q-icon :name="form.id ? 'edit' : 'add_circle'" class="q-mr-sm" />
            {{ form.id ? 'Ubah Data' : 'Tambah' }} Jabatan
          </div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pa-xl">
          <q-form @submit="saveJabatan" class="q-gutter-y-lg">
            <div class="text-subtitle2 text-grey-7">
              Silakan masukkan nama kategori jabatan yang baru untuk sistem AGRA ERP.
            </div>

            <q-input
              outlined
              v-model="form.namaJabatan"
              label="Nama Jabatan / Role"
              placeholder="Contoh: Site Manager, Supervisor, dll."
              lazy-rules
              :rules="[(val) => !!val || 'Nama jabatan tidak boleh kosong']"
              class="text-weight-medium"
              autofocus
            >
              <template v-slot:prepend><q-icon name="work_outline" color="primary" /></template>
            </q-input>

            <div class="row justify-end q-mt-xl q-gutter-sm">
              <q-btn label="Batalkan" flat color="grey-7" v-close-popup rounded class="q-px-md" />
              <q-btn
                label="Simpan Jabatan"
                type="submit"
                color="indigo-10"
                unelevated
                rounded
                :loading="loading"
                class="q-px-lg text-weight-bold"
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
import { db } from 'src/boot/firebase'
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const loading = ref(false)
const jabatanList = ref([])
const showDialog = ref(false)
const filter = ref('')
const form = ref({ id: null, namaJabatan: '' })

const columns = [
  {
    name: 'namaJabatan',
    label: 'NAMA KATEGORI JABATAN',
    field: 'namaJabatan',
    align: 'left',
    sortable: true,
  },
  { name: 'actions', label: 'AKSI PENGELOLAAN', field: 'actions', align: 'center' },
]

const openDialog = () => {
  form.value = { id: null, namaJabatan: '' }
  showDialog.value = true
}

const saveJabatan = async () => {
  loading.value = true
  try {
    if (form.value.id) {
      await updateDoc(doc(db, 'jabatan', form.value.id), {
        namaJabatan: form.value.namaJabatan,
        updated_at: new Date(),
      })
    } else {
      await addDoc(collection(db, 'jabatan'), {
        namaJabatan: form.value.namaJabatan,
        created_at: new Date(),
      })
    }
    $q.notify({
      type: 'positive',
      message: 'Data jabatan berhasil diperbarui!',
      position: 'top',
    })
    showDialog.value = false
  } catch (e) {
    $q.notify({ type: 'negative', message: 'Terjadi kesalahan: ' + e.message })
  } finally {
    loading.value = false
  }
}

const editJabatan = (data) => {
  form.value = { id: data.id, namaJabatan: data.namaJabatan }
  showDialog.value = true
}

const deleteJabatan = (row) => {
  $q.dialog({
    title: 'Konfirmasi Hapus',
    message: `Apakah Anda yakin ingin menghapus jabatan "${row.namaJabatan}"? Data yang sudah dihapus tidak dapat dikembalikan.`,
    cancel: { label: 'Batal', flat: true, color: 'grey-7' },
    ok: { label: 'Hapus Sekarang', color: 'negative', unelevated: true, rounded: true },
    persistent: true,
  }).onOk(async () => {
    try {
      await deleteDoc(doc(db, 'jabatan', row.id))
      $q.notify({
        color: 'info',
        message: 'Jabatan telah dihapus dari sistem',
        icon: 'delete',
      })
    } catch (err) {
      $q.notify({ type: 'negative', message: 'Gagal menghapus: ' + err.message })
    }
  })
}

onMounted(() => {
  onSnapshot(collection(db, 'jabatan'), (snapshot) => {
    jabatanList.value = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  })
})
</script>

<style scoped>
.font-pro {
  font-family:
    'Inter',
    -apple-system,
    Helvetica,
    Arial,
    sans-serif;
}

.jabatan-table :deep(thead tr th) {
  position: sticky;
  top: 0;
  z-index: 1;
}

.hover-bg:hover {
  background-color: rgba(25, 118, 210, 0.04) !important;
}

.transition-all {
  transition: all 0.3s ease;
}

.rounded-borders {
  border-radius: 12px;
}
</style>
