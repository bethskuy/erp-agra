<template>
  <q-page
    class="master-produksi-page q-pa-md q-pa-lg-lg"
    :class="{ 'form-workspace-page': formPageOpen }"
  >
    <template v-if="formPageOpen">
      <div class="enterprise-workspace-shell">
        <div class="form-page-header row items-start justify-between q-mb-lg">
          <div class="col">
            <q-btn
              flat
              dense
              color="green-10"
              icon="arrow_back"
              label="Kembali ke Daftar Tim"
              no-caps
              class="q-mb-md"
              @click="closeFormPage"
            />
            <div class="text-h4 text-weight-bolder text-green-10">{{ formPageTitle }}</div>
          </div>
        </div>

        <q-form class="enterprise-form-shell" @submit.prevent="saveRow">
          <q-card flat bordered class="enterprise-form-card">
            <q-card-section class="form-section-header">
              <div class="text-h6 text-weight-bold text-green-10">Informasi Tim Produksi</div>
            </q-card-section>
            <q-separator />
            <q-card-section class="q-pa-lg">
              <div class="row q-col-gutter-lg">
                <div class="col-12 col-md-6">
                  <q-input
                    v-model="form.nama_tim"
                    outlined
                    label="Nama Tim (Contoh: Tim Cutting A)"
                    :rules="[(val) => !!val || 'Wajib diisi']"
                  />
                </div>
                <div class="col-12 col-md-6">
                  <q-input
                    v-model="form.ketua_tim"
                    outlined
                    label="Nama Ketua Tim"
                    :rules="[(val) => !!val || 'Wajib diisi']"
                  />
                </div>
                <div class="col-12">
                  <q-input
                    v-model="form.anggota"
                    outlined
                    label="Daftar Anggota"
                    type="textarea"
                    rows="3"
                    hint="Pisahkan dengan koma (Contoh: Budi, Andi, Sumanto)"
                  />
                </div>
                <div class="col-12 col-md-6">
                  <q-input v-model="form.area_kerja" outlined label="Area Kerja" />
                </div>
                <div class="col-12 col-md-6">
                  <q-select
                    v-model="form.status"
                    :options="['Aktif', 'Nonaktif']"
                    outlined
                    label="Status"
                  />
                </div>
              </div>
            </q-card-section>
          </q-card>

          <q-card flat bordered class="form-action-bar q-mt-lg">
            <q-card-section class="row justify-end q-gutter-sm">
              <q-btn flat label="Batal" color="grey-7" no-caps @click="closeFormPage" />
              <q-btn
                unelevated
                label="Simpan Data Tim"
                color="green-10"
                icon="save"
                no-caps
                type="submit"
                :loading="saving"
              />
            </q-card-section>
          </q-card>
        </q-form>
      </div>
    </template>

    <template v-else>
      <div class="page-header row items-center justify-between q-mb-lg">
        <div>
          <div class="text-h4 text-weight-bolder text-green-10">Master Tim Produksi</div>
        </div>
        <q-btn
          unelevated
          rounded
          color="green-10"
          icon="add"
          label="Tambah Tim"
          no-caps
          @click="openFormPage()"
        />
      </div>

      <q-card flat bordered class="table-card">
        <q-table :rows="rows" :columns="columns" row-key="id" flat :loading="loading">
          <template #body-cell-aksi="props">
            <q-td :props="props" class="text-center">
              <q-btn
                flat
                round
                dense
                color="green-10"
                icon="edit"
                @click="openFormPage(props.row)"
              />
              <q-btn
                flat
                round
                dense
                color="negative"
                icon="delete"
                @click="confirmDelete(props.row)"
              />
            </q-td>
          </template>
        </q-table>
      </q-card>
    </template>
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
} from 'firebase/firestore'
import { db } from 'src/boot/firebase'

const COLLECTION_NAME = 'master_tim_produksi'
const $q = useQuasar()

const rows = ref([])
const loading = ref(true)
const saving = ref(false)
const formPageOpen = ref(false)
const selectedId = ref(null)
const form = ref({ nama_tim: '', ketua_tim: '', anggota: '', area_kerja: '', status: 'Aktif' })
let unsubscribeRows = null

const columns = [
  { name: 'nama_tim', label: 'Nama Tim', field: 'nama_tim', align: 'left', sortable: true },
  { name: 'ketua_tim', label: 'Ketua Tim', field: 'ketua_tim', align: 'left' },
  { name: 'anggota', label: 'Anggota', field: 'anggota', align: 'left' },
  { name: 'area_kerja', label: 'Area Kerja', field: 'area_kerja', align: 'left' },
  { name: 'aksi', label: 'Aksi', field: 'id', align: 'center' },
]

const formPageTitle = computed(() => (selectedId.value ? 'Edit Tim' : 'Tambah Tim'))

const openFormPage = (row = null) => {
  selectedId.value = row?.id || null
  form.value = row
    ? { ...row }
    : { nama_tim: '', ketua_tim: '', anggota: '', area_kerja: '', status: 'Aktif' }
  formPageOpen.value = true
}

const closeFormPage = () => {
  formPageOpen.value = false
  selectedId.value = null
  form.value = { nama_tim: '', ketua_tim: '', anggota: '', area_kerja: '', status: 'Aktif' }
}

const saveRow = async () => {
  saving.value = true
  try {
    if (selectedId.value) {
      await updateDoc(doc(db, COLLECTION_NAME, selectedId.value), {
        ...form.value,
        updated_at: serverTimestamp(),
      })
      $q.notify({ type: 'positive', message: 'Tim berhasil diperbarui.' })
    } else {
      await addDoc(collection(db, COLLECTION_NAME), {
        ...form.value,
        created_at: serverTimestamp(),
      })
      $q.notify({ type: 'positive', message: 'Tim berhasil ditambahkan.' })
    }
    closeFormPage()
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: 'Gagal menyimpan data.' })
  } finally {
    saving.value = false
  }
}

const confirmDelete = (row) => {
  // Simpan instance Quasar ke dalam variabel lokal agar pasti terbaca
  const $q_local = $q

  $q_local
    .dialog({
      title: 'Hapus',
      message: 'Hapus tim ini?',
      cancel: true,
      ok: { color: 'negative', label: 'Hapus' },
    })
    .onOk(async () => {
      try {
        await deleteDoc(doc(db, COLLECTION_NAME, row.id))
        $q_local.notify({ type: 'positive', message: 'Berhasil dihapus.' })
      } catch (err) {
        console.error('Gagal hapus:', err)
        $q_local.notify({ type: 'negative', message: 'Gagal menghapus data.' })
      }
    })
}

onMounted(() => {
  unsubscribeRows = onSnapshot(
    query(collection(db, COLLECTION_NAME), orderBy('created_at', 'desc')),
    (snap) => {
      rows.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      loading.value = false
    },
  )
})

onUnmounted(() => unsubscribeRows?.())
</script>

<style scoped>
.master-produksi-page {
  background: #f4f7f5;
  min-height: 100vh;
}
.enterprise-workspace-shell {
  width: min(100%, 1200px);
  margin: 0 auto;
}
.table-card {
  border-radius: 12px;
}
.enterprise-form-card {
  border-radius: 12px;
  background: white;
}
.form-section-header {
  background: #f8fbf8;
  padding: 15px 25px;
  border-bottom: 1px solid #eee;
}
</style>
