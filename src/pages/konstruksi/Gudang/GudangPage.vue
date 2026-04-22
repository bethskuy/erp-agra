<template>
  <q-page class="bg-grey-2 q-pa-md font-pro">
    <!-- Header Section -->
    <div class="row items-center q-mb-md">
      <div class="col">
        <div class="text-h5 text-weight-bold text-primary text-uppercase letter-spacing-1">
          Manajemen Gudang
        </div>
        <div class="text-caption text-grey-7 text-uppercase">
          {{ selectedGudang ? 'Detail Stok: ' + selectedGudang.nama : 'Daftar Lokasi Gudang' }}
        </div>
      </div>
      <div class="col-auto" v-if="selectedGudang">
        <q-btn
          flat
          icon="arrow_back"
          label="Kembali"
          @click="selectedGudang = null"
          color="grey-7"
        />
      </div>
    </div>

    <!-- Gudang Selector Grid (Muncul saat belum pilih gudang) -->
    <q-card v-if="!selectedGudang" flat bordered class="rounded-borders shadow-1">
      <q-list separator>
        <q-item
          clickable
          v-ripple
          @click="selectGudang({ id: 'UTAMA', nama: 'Gudang Utama' })"
          class="q-py-md"
        >
          <q-item-section avatar>
            <q-avatar color="indigo-1" text-color="indigo-10" icon="warehouse" />
          </q-item-section>
          <q-item-section>
            <q-item-label class="text-weight-bold text-subtitle1">GUDANG UTAMA</q-item-label>
            <q-item-label caption>Pusat penyimpanan material utama perusahaan</q-item-label>
          </q-item-section>
          <q-item-section side><q-icon name="chevron_right" /></q-item-section>
        </q-item>

        <q-item
          v-for="p in listProyek"
          :key="p.id"
          clickable
          v-ripple
          @click="selectGudang({ id: p.id, nama: 'Gudang ' + (p.nama_proyek || p.nama) })"
          class="q-py-md"
        >
          <q-item-section avatar>
            <q-avatar color="blue-1" text-color="primary" icon="construction" />
          </q-item-section>
          <q-item-section>
            <q-item-label class="text-weight-bold text-subtitle1"
              >GUDANG {{ p.nama_proyek || p.nama }}</q-item-label
            >
            <q-item-label caption>Lokasi Proyek: {{ p.lokasi || 'Aktif' }}</q-item-label>
          </q-item-section>
          <q-item-section side><q-icon name="chevron_right" /></q-item-section>
        </q-item>
      </q-list>
    </q-card>

    <!-- Detail Stok Gudang (Muncul setelah gudang dipilih) -->
    <div v-else>
      <div class="row q-gutter-sm q-mb-lg items-center">
        <q-btn
          unelevated
          color="primary"
          icon="analytics"
          label="Stok Opname"
          :to="`/konstruksi/gudang/opname/${selectedGudang.id}`"
          class="rounded-borders"
        />

        <q-btn-dropdown
          unelevated
          color="primary"
          icon="sync_alt"
          label="Transaksi"
          class="rounded-borders"
        >
          <q-list style="min-width: 180px">
            <q-item clickable v-ripple to="/konstruksi/gudang/transaksi">
              <q-item-section avatar><q-icon name="history" size="xs" /></q-item-section>
              <q-item-section>Riwayat Transaksi</q-item-section>
            </q-item>
            <q-separator />
            <q-item clickable v-ripple :to="`/konstruksi/gudang/masuk/${selectedGudang.id}`">
              <q-item-section avatar
                ><q-icon name="login" color="green" size="xs"
              /></q-item-section>
              <q-item-section>Barang Masuk</q-item-section>
            </q-item>
            <q-item clickable v-ripple :to="`/konstruksi/gudang/keluar/${selectedGudang.id}`">
              <q-item-section avatar><q-icon name="logout" color="red" size="xs" /></q-item-section>
              <q-item-section>Barang Keluar</q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>

        <q-space />

        <q-btn
          unelevated
          color="indigo-10"
          icon="add_box"
          label="Tambah Stok"
          @click="openAddStokDialog"
          class="rounded-borders px-lg"
        />
      </div>

      <q-card flat bordered class="rounded-borders shadow-1 bg-white">
        <q-table
          :title="'Inventaris: ' + selectedGudang.nama"
          :rows="stokBarang"
          :columns="columns"
          row-key="id"
          :filter="filter"
          flat
          class="no-shadow"
        >
          <template v-slot:top-right>
            <q-input
              outlined
              dense
              v-model="filter"
              placeholder="Cari Barang..."
              class="bg-white rounded-borders"
              style="width: 250px"
            >
              <template v-slot:append><q-icon name="search" /></template>
            </q-input>
          </template>

          <template v-slot:body-cell-stok="props">
            <q-td :props="props">
              <q-badge
                :color="props.value > 10 ? 'green-7' : 'orange-9'"
                class="q-px-sm q-py-xs text-weight-bold"
              >
                {{ props.value }}
              </q-badge>
            </q-td>
          </template>
        </q-table>
      </q-card>
    </div>

    <!-- DIALOG TAMBAH STOK (FULL SCREEN / MAXIMIZED) -->
    <q-dialog
      v-model="dialogStok"
      persistent
      maximized
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card class="column bg-grey-2">
        <!-- Header Dialog -->
        <q-card-section class="row items-center bg-indigo-10 text-white q-py-md shrink">
          <q-btn icon="close" flat round dense v-close-popup class="q-mr-md" />
          <div class="text-h6 text-weight-bold">Form Tambah Stok Barang</div>
          <q-space />
          <!-- Tombol Simpan Data di Header Dihapus Sesuai Permintaan -->
        </q-card-section>

        <!-- Body Scrollable -->
        <q-scroll-area class="col q-pa-md">
          <div class="row justify-center q-pt-lg">
            <div class="col-12 col-md-8 col-lg-6">
              <!-- Card Kontainer Form -->
              <q-card flat bordered class="rounded-borders q-pa-lg bg-white shadow-1">
                <q-form ref="stokFormRef" @submit="simpanStok" class="q-gutter-y-lg">
                  <div class="row items-center q-gutter-sm">
                    <q-icon name="info" color="grey-6" size="sm" />
                    <div class="text-subtitle1 text-weight-bold text-grey-8">Informasi Lokasi</div>
                  </div>

                  <q-input
                    filled
                    dense
                    :model-value="selectedGudang?.nama"
                    label="Gudang Tujuan"
                    readonly
                    bg-color="grey-1"
                  >
                    <template v-slot:prepend><q-icon name="warehouse" /></template>
                  </q-input>

                  <q-separator />

                  <div class="row items-center q-gutter-sm">
                    <q-icon name="shopping_cart" color="grey-6" size="sm" />
                    <div class="text-subtitle1 text-weight-bold text-grey-8">Pilih Item Barang</div>
                  </div>

                  <div class="row q-col-gutter-md">
                    <!-- Filter Kategori -->
                    <div class="col-12 col-sm-6">
                      <q-select
                        filled
                        v-model="formStok.kategori"
                        :options="kategoriOptions"
                        label="Pilih Kategori"
                        option-label="nama"
                        option-value="id"
                        emit-value
                        map-options
                        @update:model-value="onKategoriChange"
                        :rules="[(val) => !!val || 'Kategori wajib dipilih']"
                      >
                        <template v-slot:prepend
                          ><q-icon name="category" color="primary"
                        /></template>
                      </q-select>
                    </div>

                    <!-- Pilih Barang -->
                    <div class="col-12 col-sm-6">
                      <q-select
                        filled
                        v-model="formStok.barang"
                        :options="filteredBarangOptions"
                        label="Cari Nama Barang"
                        option-label="nama_barang"
                        option-value="id"
                        :disable="!formStok.kategori"
                        use-input
                        @filter="filterBarang"
                        @update:model-value="onBarangChange"
                        :rules="[(val) => !!val || 'Barang wajib dipilih']"
                      >
                        <template v-slot:prepend
                          ><q-icon name="inventory" color="primary"
                        /></template>
                        <template v-slot:no-option>
                          <q-item
                            ><q-item-section class="text-grey"
                              >Barang tidak ditemukan</q-item-section
                            ></q-item
                          >
                        </template>
                      </q-select>
                    </div>
                  </div>

                  <div class="row q-col-gutter-md items-start">
                    <div class="col-12 col-sm-6">
                      <q-input
                        filled
                        v-model.number="formStok.jumlah"
                        type="number"
                        label="Jumlah Tambahan"
                        :rules="[
                          (val) => (val !== null && val !== undefined) || 'Wajib diisi',
                          (val) => val > 0 || 'Minimal 1',
                        ]"
                        class="text-h6"
                      >
                        <template v-slot:append>
                          <q-badge
                            color="grey-2"
                            text-color="grey-9"
                            class="q-pa-sm text-weight-bold"
                          >
                            {{ formStok.satuan || '-' }}
                          </q-badge>
                        </template>
                      </q-input>
                    </div>

                    <div class="col-12 col-sm-6">
                      <div
                        v-if="formStok.barang"
                        class="bg-blue-1 q-pa-md rounded-borders border-dashed"
                      >
                        <div class="row items-center justify-between">
                          <div class="text-caption text-grey-7">Stok Saat Ini:</div>
                          <div class="text-h6 text-primary text-weight-bolder">
                            {{ currentStokValue }} {{ formStok.satuan }}
                          </div>
                        </div>
                      </div>
                      <div
                        v-else
                        class="text-caption text-grey-6 text-center q-pa-md border-dashed rounded-borders"
                      >
                        Pilih barang untuk melihat stok terkini
                      </div>
                    </div>
                  </div>

                  <q-input
                    filled
                    v-model="formStok.keterangan"
                    type="textarea"
                    label="Catatan atau Keterangan Tambahan"
                    rows="3"
                    placeholder="Contoh: Pengadaan dari pusat, Sisa proyek A, dll."
                  />

                  <div class="row justify-end q-mt-xl">
                    <q-btn flat label="Batalkan" color="grey-7" v-close-popup class="q-mr-sm" />
                    <q-btn
                      unelevated
                      label="Simpan Stok"
                      color="indigo-10"
                      type="submit"
                      :loading="loadingSimpan"
                      padding="10px 30px"
                      class="rounded-borders"
                    />
                  </div>
                </q-form>
              </q-card>

              <div class="q-py-xl"></div>
            </div>
          </div>
        </q-scroll-area>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { db } from 'src/boot/firebase'
import {
  collection,
  query,
  where,
  onSnapshot,
  getDocs,
  addDoc,
  serverTimestamp,
  updateDoc,
  doc,
} from 'firebase/firestore'
import { useQuasar } from 'quasar'

// Initialization
const $q = useQuasar()
const listProyek = ref([])
const selectedGudang = ref(null)
const stokBarang = ref([])
const filter = ref('')
const stokFormRef = ref(null)

// Master Data & Dialog Refs
const dialogStok = ref(false)
const loadingSimpan = ref(false)
const kategoriOptions = ref([])
const masterBarang = ref([])
const filteredBarangOptions = ref([])
const currentStokValue = ref(0)

const formStok = ref({
  kategori: null,
  barang: null,
  jumlah: null,
  satuan: '',
  keterangan: '',
})

const columns = [
  { name: 'nama', label: 'NAMA BARANG', field: 'nama_barang', align: 'left', sortable: true },
  { name: 'stok', label: 'STOK FISIK', field: 'jumlah', align: 'center', sortable: true },
  { name: 'satuan', label: 'SATUAN', field: 'satuan', align: 'center' },
]

// Logic Functions
const selectGudang = (gudang) => {
  selectedGudang.value = gudang
}

const fetchMasterData = async () => {
  try {
    const catSnap = await getDocs(collection(db, 'kategori_barang'))
    kategoriOptions.value = catSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

    const barSnap = await getDocs(collection(db, 'barang'))
    masterBarang.value = barSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  } catch (err) {
    console.error('Gagal mengambil data master:', err)
  }
}

const fetchProyek = async () => {
  try {
    const snap = await getDocs(collection(db, 'proyek'))
    listProyek.value = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  } catch (err) {
    console.error('Gagal mengambil data proyek:', err)
  }
}

const openAddStokDialog = async () => {
  formStok.value = { kategori: null, barang: null, jumlah: null, satuan: '', keterangan: '' }
  currentStokValue.value = 0
  await fetchMasterData()
  dialogStok.value = true
}

const onKategoriChange = (val) => {
  formStok.value.barang = null
  filteredBarangOptions.value = masterBarang.value.filter((b) => b.id_kategori === val)
}

const filterBarang = (val, update) => {
  if (val === '') {
    update(() => {
      filteredBarangOptions.value = masterBarang.value.filter(
        (b) => b.id_kategori === formStok.value.kategori,
      )
    })
    return
  }
  update(() => {
    const needle = val.toLowerCase()
    filteredBarangOptions.value = masterBarang.value.filter(
      (b) =>
        b.id_kategori === formStok.value.kategori &&
        b.nama_barang.toLowerCase().indexOf(needle) > -1,
    )
  })
}

const onBarangChange = (val) => {
  if (val) {
    formStok.value.satuan = val.satuan || ''
    const existing = stokBarang.value.find((s) => s.id_barang === val.id)
    currentStokValue.value = existing ? existing.jumlah : 0
  } else {
    formStok.value.satuan = ''
    currentStokValue.value = 0
  }
}

const simpanStok = async () => {
  if (!selectedGudang.value || !formStok.value.barang) return

  loadingSimpan.value = true
  try {
    const idGudang = selectedGudang.value.id
    const idBarang = formStok.value.barang.id
    const namaBarang = formStok.value.barang.nama_barang
    const tambahan = Number(formStok.value.jumlah)

    // 1. Update atau Create record stok_barang
    const qStok = query(
      collection(db, 'stok_barang'),
      where('id_gudang', '==', idGudang),
      where('id_barang', '==', idBarang),
    )
    const stokSnap = await getDocs(qStok)

    if (!stokSnap.empty) {
      const stokDoc = stokSnap.docs[0]
      await updateDoc(doc(db, 'stok_barang', stokDoc.id), {
        jumlah: Number(stokDoc.data().jumlah) + tambahan,
        updated_at: serverTimestamp(),
      })
    } else {
      await addDoc(collection(db, 'stok_barang'), {
        id_gudang: idGudang,
        id_barang: idBarang,
        nama_barang: namaBarang,
        jumlah: tambahan,
        satuan: formStok.value.satuan,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      })
    }

    // 2. Catat riwayat di transaksi_gudang
    await addDoc(collection(db, 'transaksi_gudang'), {
      id_gudang: idGudang,
      id_barang: idBarang,
      nama_barang: namaBarang,
      tipe: 'MASUK',
      jumlah: tambahan,
      keterangan: formStok.value.keterangan || 'Penambahan stok manual',
      tanggal: serverTimestamp(),
    })

    $q.notify({
      color: 'positive',
      message: 'Stok berhasil diperbarui',
      icon: 'check_circle',
      position: 'top',
    })

    dialogStok.value = false
  } catch (error) {
    console.error('Error saving stock:', error)
    $q.notify({
      color: 'negative',
      message: 'Gagal menyimpan stok: ' + error.message,
      position: 'top',
    })
  } finally {
    loadingSimpan.value = false
  }
}

// Watchers
watch(selectedGudang, (newVal) => {
  if (unsubscribeStok) unsubscribeStok()
  if (newVal) {
    const q = query(collection(db, 'stok_barang'), where('id_gudang', '==', newVal.id))
    unsubscribeStok = onSnapshot(
      q,
      (snapshot) => {
        stokBarang.value = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      },
      (err) => {
        console.error('Error listening to stock:', err)
      },
    )
  }
})

let unsubscribeStok = null

onMounted(fetchProyek)
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
.rounded-borders {
  border-radius: 12px;
}
.letter-spacing-1 {
  letter-spacing: 1px;
}
.px-lg {
  padding-left: 20px;
  padding-right: 20px;
}
.border-dashed {
  border: 2px dashed #e0e0e0;
}
.shrink {
  flex: 0 0 auto;
}
</style>
