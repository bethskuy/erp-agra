<template>
  <q-page class="bg-grey-2 q-pa-md q-pa-md-lg font-pro">
    <div class="row items-center justify-between q-mb-lg">
      <div class="col-12 col-md-8">
        <div class="text-h4 text-weight-bolder text-teal-10 leading-tight">
          Master Pekerjaan
          <span class="text-h5 text-weight-light text-grey-6 block q-mt-xs">
            Routing Biaya Manufaktur
          </span>
        </div>
        <div class="text-subtitle1 text-grey-7 q-mt-sm">
          Standarisasi pekerjaan produksi, jasa pendukung, satuan, dan akun biaya manufaktur.
        </div>
      </div>
      <div class="col-12 col-md-auto q-mt-md q-mt-md-none">
        <q-btn
          v-if="canAction('buat')"
          unelevated
          color="teal-10"
          icon="add"
          label="Tambah Pekerjaan"
          no-caps
          class="q-px-lg q-py-sm shadow-premium"
          @click="openAddDialog"
        />
      </div>
    </div>

    <q-card flat bordered class="q-mb-md rounded-8 bg-white">
      <q-card-section class="q-py-sm">
        <div class="row items-center q-col-gutter-md">
          <div class="col-12 col-md-5">
            <q-input
              v-model="filter"
              outlined
              dense
              debounce="250"
              placeholder="Cari pekerjaan, tipe, satuan, atau COA..."
              bg-color="white"
            >
              <template #prepend><q-icon name="search" color="teal-10" /></template>
              <template #append v-if="filter">
                <q-icon name="close" class="cursor-pointer" @click="filter = ''" />
              </template>
            </q-input>
          </div>
          <div class="col-12 col-md-3">
            <q-select
              v-model="statusFilter"
              outlined
              dense
              :options="statusOptions"
              emit-value
              map-options
              label="Filter Status"
              bg-color="white"
            />
          </div>
          <q-space />
          <div class="col-12 col-md-auto text-caption text-grey-7">
            Total:
            <span class="text-weight-bold text-teal-10">{{ filteredRows.length }} Data</span>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <q-card flat bordered class="rounded-8 bg-white overflow-hidden">
      <q-table
        :rows="filteredRows"
        :columns="columns"
        row-key="id"
        flat
        dense
        :loading="loading"
        :filter="filter"
        binary-state-sort
        class="erp-compact-table"
      >
        <template #header="props">
          <q-tr :props="props" class="bg-teal-10 text-white">
            <q-th v-for="col in props.cols" :key="col.name" :props="props">
              {{ col.label }}
            </q-th>
          </q-tr>
        </template>

        <template #body-cell-status_aktif="props">
          <q-td :props="props">
            <q-chip
              dense
              square
              :color="props.row.status_aktif === 'Aktif' ? 'green-1' : 'grey-3'"
              :text-color="props.row.status_aktif === 'Aktif' ? 'green-9' : 'grey-7'"
              :icon="props.row.status_aktif === 'Aktif' ? 'check_circle' : 'pause_circle'"
            >
              {{ props.row.status_aktif }}
            </q-chip>
          </q-td>
        </template>

        <template #body-cell-updatedAt="props">
          <q-td :props="props">
            <div class="text-caption text-grey-8">{{ formatDate(props.row.updatedAt) }}</div>
            <div class="text-caption text-grey-6">{{ props.row.updatedBy || '-' }}</div>
          </q-td>
        </template>

        <template #body-cell-aksi="props">
          <q-td :props="props" class="q-gutter-xs text-center">
            <q-btn
              v-if="canAction('ubah')"
              flat
              round
              color="blue-8"
              icon="edit"
              size="sm"
              @click="openEditDialog(props.row)"
            />
            <q-btn
              v-if="canAction('hapus')"
              flat
              round
              color="negative"
              icon="delete_outline"
              size="sm"
              @click="hapusPekerjaan(props.row)"
            />
          </q-td>
        </template>
      </q-table>
    </q-card>

    <q-dialog v-model="showDialog" persistent transition-show="scale" transition-hide="scale">
      <q-card style="width: 520px; max-width: 95vw; border-radius: 8px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6 text-teal-10 text-weight-bold">
            {{ isEditMode ? 'Edit Data Pekerjaan' : 'Tambah Data Pekerjaan' }}
          </div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-separator class="q-my-md" />

        <q-card-section class="q-pa-md q-gutter-y-md">
          <q-select outlined dense v-model="form.tipe" :options="tipeOptions" label="Tipe" />
          <q-input outlined dense v-model="form.nama" label="Nama Pekerjaan *" autofocus />
          <q-select
            outlined
            dense
            v-model="form.satuan"
            :options="satuanOptions"
            use-input
            fill-input
            input-debounce="0"
            label="Satuan"
          />
          <q-input outlined dense v-model.number="form.harga" type="number" label="Harga" />
          <q-input outlined dense v-model="form.coa_inventori" label="COA Inventori" />
          <q-input outlined dense v-model="form.coa_hpp" label="COA HPP" />
          <q-select
            outlined
            dense
            v-model="form.status_aktif"
            :options="['Aktif', 'Nonaktif']"
            label="Status"
          />
        </q-card-section>

        <q-card-actions align="right" class="bg-white q-pa-md q-gutter-sm">
          <q-btn flat label="Batal" color="grey-7" v-close-popup no-caps />
          <q-btn
            unelevated
            label="Simpan"
            color="teal-10"
            :loading="submitting"
            @click="simpanPekerjaan"
            no-caps
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import { db } from 'src/boot/firebase'
import { useAuthStore } from 'src/stores/auth'

const COLLECTION_NAME = 'manufactur_master_pekerjaan'

const $q = useQuasar()
const authStore = useAuthStore()
const filter = ref('')
const statusFilter = ref('Semua')
const showDialog = ref(false)
const isEditMode = ref(false)
const loading = ref(true)
const submitting = ref(false)
const rows = ref([])
const userData = ref(null)
let unsubRows = null
let unsubUser = null

const formDefault = {
  id: null,
  tipe: 'Pekerjaan',
  nama: '',
  satuan: null,
  harga: 0,
  coa_inventori: '',
  coa_hpp: '',
  status_aktif: 'Aktif',
}
const form = ref({ ...formDefault })

const tipeOptions = ['Pekerjaan', 'Jasa', 'Lainnya']
const satuanOptions = ['Pcs', 'Unit', 'Set', 'Kg', 'Meter', 'Jam', 'Lot']
const statusOptions = [
  { label: 'Semua Status', value: 'Semua' },
  { label: 'Aktif', value: 'Aktif' },
  { label: 'Nonaktif', value: 'Nonaktif' },
]

const columns = [
  { name: 'nama', align: 'left', label: 'PEKERJAAN', field: 'nama', sortable: true },
  { name: 'tipe', align: 'left', label: 'TIPE', field: 'tipe', sortable: true },
  { name: 'satuan', align: 'center', label: 'SATUAN', field: 'satuan' },
  {
    name: 'harga',
    align: 'right',
    label: 'HARGA',
    field: 'harga',
    sortable: true,
    format: (val) => `Rp ${(val || 0).toLocaleString('id-ID')}`,
  },
  { name: 'status_aktif', align: 'center', label: 'STATUS', field: 'status_aktif' },
  { name: 'updatedAt', align: 'left', label: 'AUDIT', field: 'updatedAt' },
  { name: 'aksi', align: 'center', label: 'AKSI', field: 'aksi' },
]

const filteredRows = computed(() => {
  if (statusFilter.value === 'Semua') return rows.value
  return rows.value.filter((row) => row.status_aktif === statusFilter.value)
})

const canAction = (actionType) => {
  if (authStore.user?.role === 'Super Admin') return true
  if (!userData.value?.permissions_detail) return false
  const modulePerm = userData.value.permissions_detail.find((m) => m.id === 'manufaktur')
  if (!modulePerm || !modulePerm.isActive) return false
  const menu = modulePerm.menus.find((m) => m.id === '_manufaktur_master_pekerjaan')
  return menu ? menu[actionType] || false : false
}

const auditUser = () => authStore.user?.email || authStore.user?.nama || 'system'

const formatDate = (value) => {
  if (!value) return '-'
  const date = typeof value.toDate === 'function' ? value.toDate() : new Date(value)
  return date.toLocaleString('id-ID')
}

const openAddDialog = () => {
  isEditMode.value = false
  form.value = { ...formDefault }
  showDialog.value = true
}

const openEditDialog = (data) => {
  isEditMode.value = true
  form.value = { ...formDefault, ...data }
  showDialog.value = true
}

const simpanPekerjaan = async () => {
  if (!form.value.nama) {
    $q.notify({ color: 'negative', message: 'Nama Pekerjaan wajib diisi!' })
    return
  }

  submitting.value = true
  try {
    const payload = {
      tipe: form.value.tipe,
      nama: form.value.nama,
      satuan: form.value.satuan,
      harga: Number(form.value.harga || 0),
      coa_inventori: form.value.coa_inventori || '',
      coa_hpp: form.value.coa_hpp || '',
      status_aktif: form.value.status_aktif || 'Aktif',
      updatedAt: serverTimestamp(),
      updatedBy: auditUser(),
    }

    if (isEditMode.value) {
      await updateDoc(doc(db, COLLECTION_NAME, form.value.id), payload)
      $q.notify({ color: 'positive', message: 'Data pekerjaan diperbarui' })
    } else {
      await addDoc(collection(db, COLLECTION_NAME), {
        ...payload,
        createdAt: serverTimestamp(),
        createdBy: auditUser(),
      })
      $q.notify({ color: 'positive', message: 'Data pekerjaan ditambahkan' })
    }
    showDialog.value = false
  } catch (error) {
    console.error(error)
    $q.notify({ color: 'negative', message: 'Gagal menyimpan data: ' + error.message })
  } finally {
    submitting.value = false
  }
}

const hapusPekerjaan = (data) => {
  $q.dialog({
    title: 'Hapus Pekerjaan',
    message: `Yakin ingin menghapus ${data.nama}?`,
    cancel: true,
    ok: { color: 'negative', unelevated: true, label: 'Hapus' },
  }).onOk(async () => {
    await deleteDoc(doc(db, COLLECTION_NAME, data.id))
    $q.notify({ icon: 'delete', message: 'Data pekerjaan dihapus' })
  })
}

onMounted(() => {
  const email = authStore.user?.email
  if (email) {
    const qUser = query(collection(db, 'karyawan'), where('email', '==', email))
    unsubUser = onSnapshot(qUser, (snap) => {
      userData.value = snap.empty ? null : snap.docs[0].data()
    })
  }

  const qRows = query(collection(db, COLLECTION_NAME), orderBy('nama', 'asc'))
  unsubRows = onSnapshot(
    qRows,
    (snap) => {
      rows.value = snap.docs.map((item) => ({ id: item.id, ...item.data() }))
      loading.value = false
    },
    (error) => {
      console.error(error)
      loading.value = false
    },
  )
})

onUnmounted(() => {
  if (unsubRows) unsubRows()
  if (unsubUser) unsubUser()
})
</script>

<style scoped>
.font-pro {
  font-family:
    'Inter',
    -apple-system,
    sans-serif;
}
.rounded-8 {
  border-radius: 8px;
}
.shadow-premium {
  box-shadow: 0 10px 30px rgba(0, 77, 64, 0.15);
}
.erp-compact-table :deep(thead tr th) {
  position: sticky;
  top: 0;
  z-index: 1;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0;
}
.erp-compact-table :deep(tbody td) {
  height: 38px;
}
.block {
  display: block;
}
.leading-tight {
  line-height: 1.1;
}
</style>
