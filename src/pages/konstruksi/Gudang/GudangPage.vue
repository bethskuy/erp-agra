<template>
  <q-page class="bg-grey-2 q-pa-md q-pa-md-lg font-pro">
    <!-- HEADER SECTION -->
    <div class="row items-center justify-between q-mb-xl animate-fade">
      <div class="col-12 col-md-8">
        <div class="text-h4 text-weight-bolder text-indigo-10 leading-tight">
          Manajemen Gudang
          <span class="text-h5 text-weight-light text-grey-6 block q-mt-xs">
            {{
              selectedGudang
                ? 'Detail Inventaris: ' + selectedGudang.nama
                : 'Pusat Logistik & Stok Proyek'
            }}
          </span>
        </div>
        <div class="text-subtitle1 text-grey-7 q-mt-sm">
          Monitoring ketersediaan material secara real-time di seluruh titik distribusi.
        </div>
      </div>
      <div class="col-12 col-md-auto q-mt-md q-mt-md-none" v-if="selectedGudang">
        <q-btn
          flat
          rounded
          icon="arrow_back"
          label="Kembali ke Daftar Gudang"
          @click="selectedGudang = null"
          color="indigo-10"
          class="bg-white shadow-1"
        />
      </div>
    </div>

    <!-- VIEW 1: GUDANG SELECTOR GRID -->
    <div v-if="!selectedGudang" class="row q-col-gutter-lg animate-fade-up">
      <!-- Gudang Utama Card -->
      <div class="col-12 col-sm-6 col-md-4">
        <q-card
          flat
          bordered
          class="gudang-card rounded-20 cursor-pointer transition-all hover-shadow"
          @click="selectGudang({ id: 'UTAMA', nama: 'Gudang Utama' })"
        >
          <q-card-section class="q-pa-lg text-center">
            <q-avatar
              size="80px"
              color="indigo-1"
              text-color="indigo-10"
              icon="warehouse"
              class="q-mb-md shadow-2"
            />
            <div class="text-h6 text-weight-bolder text-indigo-10 uppercase">Gudang Utama</div>
            <div class="text-caption text-grey-6 q-mt-sm">
              Pusat penyimpanan material inti & alat berat perusahaan.
            </div>
          </q-card-section>
          <q-separator inset />
          <q-card-section class="bg-indigo-10 text-white text-center q-py-sm">
            <div class="text-caption text-weight-bold tracking-widest">PILIH LOKASI</div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Proyek Gudang Cards -->
      <div v-for="p in listProyek" :key="p.id" class="col-12 col-sm-6 col-md-4">
        <q-card
          flat
          bordered
          class="gudang-card rounded-20 cursor-pointer transition-all hover-shadow"
          @click="selectGudang({ id: p.id, nama: 'Gudang ' + (p.nama_proyek || p.nama) })"
        >
          <q-card-section class="q-pa-lg text-center">
            <q-avatar
              size="80px"
              color="blue-1"
              text-color="primary"
              icon="construction"
              class="q-mb-md shadow-2"
            />
            <div class="text-h6 text-weight-bolder text-blue-grey-10 uppercase ellipsis">
              Gudang {{ p.nama_proyek || p.nama }}
            </div>
            <div class="text-caption text-grey-7 q-mt-sm ellipsis-2-lines">
              Lokasi: {{ p.lokasi || 'Proyek Aktif' }}
            </div>
          </q-card-section>
          <q-separator inset />
          <q-card-section class="bg-primary text-white text-center q-py-sm">
            <div class="text-caption text-weight-bold tracking-widest">DETAIL LOGISTIK</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- VIEW 2: DETAIL STOK GUDANG -->
    <div v-else class="animate-fade">
      <!-- Action Bar -->
      <div class="row q-gutter-md q-mb-lg items-center">
        <q-btn
          unelevated
          color="primary"
          icon="analytics"
          label="Stok Opname"
          :to="`/konstruksi/gudang/opname/${selectedGudang.id}`"
          rounded
          class="q-px-lg shadow-2"
        />

        <q-btn-dropdown
          unelevated
          color="white"
          text-color="primary"
          icon="sync_alt"
          label="Transaksi Stok"
          rounded
          class="shadow-1 q-px-lg"
        >
          <q-list style="min-width: 200px" class="q-pa-sm">
            <q-item clickable v-ripple to="/konstruksi/gudang/transaksi" class="rounded-borders">
              <q-item-section avatar><q-icon name="history" color="primary" /></q-item-section>
              <q-item-section class="text-weight-medium">Riwayat Transaksi</q-item-section>
            </q-item>
            <q-separator spaced />
            <q-item
              clickable
              v-ripple
              :to="`/konstruksi/gudang/masuk/${selectedGudang.id}`"
              class="rounded-borders bg-green-1 text-green-10 q-mb-xs"
            >
              <q-item-section avatar><q-icon name="add_circle" /></q-item-section>
              <q-item-section class="text-weight-bold">Barang Masuk</q-item-section>
            </q-item>
            <q-item
              clickable
              v-ripple
              :to="`/konstruksi/gudang/keluar/${selectedGudang.id}`"
              class="rounded-borders bg-red-1 text-red-10"
            >
              <q-item-section avatar><q-icon name="remove_circle" /></q-item-section>
              <q-item-section class="text-weight-bold">Barang Keluar</q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>

        <q-btn-dropdown
          unelevated
          color="indigo-1"
          text-color="indigo-10"
          icon="shopping_basket"
          label="Permintaan Barang"
          rounded
          class="shadow-1 q-px-lg"
        >
          <q-list style="min-width: 280px" class="q-pa-sm">
            <q-item
              clickable
              v-ripple
              to="/konstruksi/gudang/permintaan/list"
              class="rounded-borders q-mb-xs"
            >
              <q-item-section avatar><q-icon name="assignment" color="indigo-10" /></q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-bold text-indigo-10"
                  >Daftar Permintaan</q-item-label
                >
                <q-item-label caption>Pantau antrean request dari gudang lain</q-item-label>
              </q-item-section>
              <q-item-section side v-if="pendingRequestCount > 0">
                <q-badge color="red" rounded label="New" />
              </q-item-section>
            </q-item>
            <q-separator spaced />
            <q-item
              clickable
              v-ripple
              :to="`/konstruksi/gudang/permintaan-antar/${selectedGudang.id}`"
              class="rounded-borders q-mb-xs"
            >
              <q-item-section avatar><q-icon name="swap_horiz" color="orange-9" /></q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-bold">Permintaan Antar Gudang</q-item-label>
                <q-item-label caption>Request mutasi stok dari gudang lain</q-item-label>
              </q-item-section>
            </q-item>
            <q-item
              clickable
              v-ripple
              :to="`/konstruksi/gudang/purchase-request/${selectedGudang.id}`"
              class="rounded-borders"
            >
              <q-item-section avatar
                ><q-icon name="shopping_cart_checkout" color="primary"
              /></q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-bold">Purchase Request (PR)</q-item-label>
                <q-item-label caption>Pengajuan pembelian material baru</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>

        <q-space />

        <q-btn
          unelevated
          color="indigo-10"
          icon="post_add"
          label="Input Stok Manual"
          @click="openAddStokDialog"
          rounded
          class="q-px-lg shadow-premium btn-hover"
        />
      </div>

      <!-- TABLE INVENTARIS -->
      <q-card flat bordered class="rounded-20 shadow-sm overflow-hidden bg-white">
        <q-table
          :rows="stokBarang"
          :columns="columns"
          row-key="id"
          :filter="filter"
          flat
          binary-state-sort
          class="gudang-table"
        >
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

          <template v-slot:top-right>
            <q-input
              outlined
              dense
              rounded
              v-model="filter"
              placeholder="Cari item di gudang ini..."
              class="search-input"
              style="width: 300px"
              bg-color="white"
            >
              <template v-slot:prepend><q-icon name="search" color="primary" /></template>
            </q-input>
          </template>

          <template v-slot:body-cell-stok="props">
            <q-td :props="props" class="text-center">
              <q-chip
                :color="props.value > 10 ? 'green-1' : 'orange-1'"
                :text-color="props.value > 10 ? 'green-10' : 'orange-10'"
                class="text-weight-bolder q-px-md"
                :icon="props.value > 10 ? 'check_circle' : 'warning'"
              >
                {{ props.value }}
              </q-chip>
            </q-td>
          </template>

          <template v-slot:no-data>
            <div class="full-width row flex-center q-pa-xl text-grey-5">
              <q-icon name="inventory_2" size="64px" class="q-mb-md" />
              <div class="text-h6 full-width text-center italic">Gudang ini masih kosong</div>
            </div>
          </template>
        </q-table>
      </q-card>
    </div>

    <!-- DIALOG TAMBAH STOK MANUAL (FIXED CASACADING) -->
    <q-dialog
      v-model="dialogStok"
      persistent
      maximized
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card class="bg-grey-2 column no-wrap">
        <q-toolbar class="bg-white text-indigo-10 q-py-md shadow-2">
          <q-btn flat round dense icon="close" v-close-popup color="grey-7" />
          <q-toolbar-title class="text-weight-bold text-center"
            >PENYESUAIAN STOK MANUAL</q-toolbar-title
          >
          <q-btn
            unelevated
            color="indigo-10"
            label="SIMPAN DATA"
            rounded
            class="q-px-xl text-weight-bold shadow-3"
            @click="stokFormRef.submit()"
          />
        </q-toolbar>

        <q-scroll-area class="col q-pa-lg q-pa-md-xl">
          <div class="row justify-center">
            <div class="col-12 col-md-8 col-lg-6">
              <q-card flat bordered class="rounded-20 q-pa-xl bg-white shadow-1">
                <q-form ref="stokFormRef" @submit="simpanStok" class="q-gutter-y-lg">
                  <div class="text-subtitle1 text-indigo-10 text-weight-bolder flex items-center">
                    <q-icon name="location_on" class="q-mr-sm" /> KONFIRMASI PENYIMPANAN
                  </div>

                  <q-input
                    filled
                    v-model="selectedGudang.nama"
                    label="Lokasi Gudang"
                    readonly
                    bg-color="indigo-1"
                    class="text-weight-bold"
                  />

                  <q-separator class="q-my-md" />

                  <div class="text-subtitle1 text-indigo-10 text-weight-bolder flex items-center">
                    <q-icon name="inventory" class="q-mr-sm" /> SELEKSI ITEM & JUMLAH
                  </div>

                  <div class="row q-col-gutter-md">
                    <!-- Kategori: Menggunakan option-value="nama" agar sinkron dengan Master Barang -->
                    <div class="col-12">
                      <q-select
                        outlined
                        v-model="formStok.kategori"
                        :options="kategoriOptions"
                        label="Filter Berdasarkan Kategori"
                        option-label="nama"
                        option-value="nama"
                        emit-value
                        map-options
                        @update:model-value="onKategoriChange"
                        :rules="[(val) => !!val || 'Pilih kategori terlebih dahulu']"
                      />
                    </div>

                    <!-- Nama Barang: Memfilter berdasarkan Nama Kategori yang dipilih -->
                    <div class="col-12">
                      <q-select
                        outlined
                        v-model="formStok.barang"
                        :options="filteredBarangOptions"
                        label="Pilih Nama Barang"
                        option-label="display_name"
                        option-value="id"
                        :disable="!formStok.kategori"
                        use-input
                        @filter="filterBarang"
                        @update:model-value="onBarangChange"
                        :rules="[(val) => !!val || 'Pilih barang yang akan ditambah']"
                      >
                        <template v-slot:no-option>
                          <q-item
                            ><q-item-section class="text-grey text-caption"
                              >Tidak ada barang dalam kategori ini</q-item-section
                            ></q-item
                          >
                        </template>
                      </q-select>
                    </div>
                  </div>

                  <div class="row q-col-gutter-md items-center">
                    <div class="col-12 col-sm-6">
                      <q-input
                        outlined
                        v-model.number="formStok.jumlah"
                        type="number"
                        label="Kuantitas Tambahan"
                        prefix="+"
                        class="text-h5 text-weight-bolder text-indigo-10"
                        :rules="[(val) => !!val || 'Wajib diisi', (val) => val > 0 || 'Minimal 1']"
                      >
                        <template v-slot:append>
                          <q-badge
                            color="blue-1"
                            text-color="primary"
                            class="q-pa-sm text-weight-bold uppercase"
                          >
                            {{ formStok.satuan || 'UNIT' }}
                          </q-badge>
                        </template>
                      </q-input>
                    </div>

                    <div class="col-12 col-sm-6">
                      <div
                        v-if="formStok.barang"
                        class="bg-indigo-1 q-pa-md rounded-borders border-dashed-indigo text-center"
                      >
                        <div class="text-caption text-grey-7">Stok Saat Ini</div>
                        <div class="text-h6 text-indigo-10 text-weight-bolder">
                          {{ currentStokValue }} {{ formStok.satuan }}
                        </div>
                      </div>
                    </div>
                  </div>

                  <q-input
                    outlined
                    v-model="formStok.keterangan"
                    type="textarea"
                    label="Catatan / Alasan Penyesuaian"
                    rows="3"
                    placeholder="Contoh: Sisa material proyek..."
                  />
                </q-form>
              </q-card>
            </div>
          </div>
        </q-scroll-area>
      </q-card>
    </q-dialog>

    <div class="q-py-xl"></div>
  </q-page>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
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
  orderBy,
} from 'firebase/firestore'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const listProyek = ref([])
const selectedGudang = ref(null)
const stokBarang = ref([])
const filter = ref('')
const stokFormRef = ref(null)

const dialogStok = ref(false)
const kategoriOptions = ref([])
const masterBarang = ref([])
const filteredBarangOptions = ref([])
const currentStokValue = ref(0)
const pendingRequestCount = ref(0)

const formStok = ref({ kategori: null, barang: null, jumlah: null, satuan: '', keterangan: '' })

let unsubPermintaan = null
let unsubStok = null

const columns = [
  {
    name: 'nama',
    label: 'IDENTITAS MATERIAL',
    field: 'nama_barang',
    align: 'left',
    sortable: true,
  },
  { name: 'stok', label: 'KUANTITAS FISIK', field: 'jumlah', align: 'center', sortable: true },
  { name: 'satuan', label: 'SATUAN', field: 'satuan', align: 'center' },
]

const selectGudang = (gudang) => {
  selectedGudang.value = gudang
  window.scrollTo(0, 0)
}

const fetchMasterData = async () => {
  try {
    // Ambil Kategori
    const catSnap = await getDocs(query(collection(db, 'kategori_barang'), orderBy('nama', 'asc')))
    kategoriOptions.value = catSnap.docs.map((d) => ({ id: d.id, ...d.data() }))

    // Ambil Master Barang dengan Merk untuk Tampilan Dropdown
    const barSnap = await getDocs(query(collection(db, 'master_barang'), orderBy('nama', 'asc')))
    masterBarang.value = barSnap.docs.map((d) => {
      const data = d.data()
      return {
        id: d.id,
        nama_barang: data.nama,
        merk: data.merk || '',
        id_kategori: data.kategori, // Biasanya berisi nama kategori di master_barang
        satuan: data.unit,
        display_name: `${data.nama} ${data.merk ? '- ' + data.merk : ''}`,
      }
    })
  } catch (err) {
    console.error(err)
  }
}

const fetchProyek = async () => {
  try {
    const snap = await getDocs(collection(db, 'proyek'))
    listProyek.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  } catch (err) {
    console.error(err)
  }
}

const openAddStokDialog = async () => {
  formStok.value = { kategori: null, barang: null, jumlah: null, satuan: '', keterangan: '' }
  currentStokValue.value = 0
  $q.loading.show({ message: 'Menyiapkan database barang...' })
  await fetchMasterData()
  $q.loading.hide()
  dialogStok.value = true
}

const onKategoriChange = (val) => {
  formStok.value.barang = null
  formStok.value.satuan = ''
  currentStokValue.value = 0
  // Memfilter barang berdasarkan Nama Kategori (String)
  filteredBarangOptions.value = masterBarang.value.filter((b) => b.id_kategori === val)
}

const filterBarang = (val, update) => {
  update(() => {
    const needle = val.toLowerCase()
    filteredBarangOptions.value = masterBarang.value.filter(
      (b) =>
        b.id_kategori === formStok.value.kategori &&
        b.display_name.toLowerCase().indexOf(needle) > -1,
    )
  })
}

const onBarangChange = (val) => {
  if (val) {
    formStok.value.satuan = val.satuan || ''
    const existing = stokBarang.value.find((s) => s.id_barang === val.id)
    currentStokValue.value = existing ? existing.jumlah : 0
  }
}

const simpanStok = async () => {
  if (!selectedGudang.value || !formStok.value.barang) return

  $q.loading.show({ message: 'Mensinkronisasi stok...' })
  try {
    const idGudang = selectedGudang.value.id
    const idBarang = formStok.value.barang.id
    const namaBarang = formStok.value.barang.display_name
    const tambahan = Number(formStok.value.jumlah)

    const qStok = query(
      collection(db, 'stok_barang'),
      where('id_gudang', '==', idGudang),
      where('id_barang', '==', idBarang),
    )
    const stokSnap = await getDocs(qStok)

    if (!stokSnap.empty) {
      await updateDoc(doc(db, 'stok_barang', stokSnap.docs[0].id), {
        jumlah: Number(stokSnap.docs[0].data().jumlah) + tambahan,
        updated_at: serverTimestamp(),
      })
    } else {
      await addDoc(collection(db, 'stok_barang'), {
        id_gudang: idGudang,
        id_barang: idBarang,
        nama_barang: formStok.value.barang.nama_barang,
        jumlah: tambahan,
        satuan: formStok.value.satuan,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      })
    }

    await addDoc(collection(db, 'aktivitas'), {
      id_gudang: idGudang,
      nama_barang: namaBarang,
      tipe: 'MASUK',
      jumlah: tambahan,
      keterangan: formStok.value.keterangan || 'Penambahan stok manual',
      timestamp: serverTimestamp(),
    })

    $q.notify({ type: 'positive', message: 'Stok berhasil diperbarui!', position: 'top' })
    dialogStok.value = false
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Gagal: ' + error.message })
  } finally {
    $q.loading.hide()
  }
}

const listenPermintaan = () => {
  if (unsubPermintaan) unsubPermintaan()
  const q = query(collection(db, 'permintaan_barang'), where('status', '==', 'Pending'))
  unsubPermintaan = onSnapshot(q, (snap) => {
    pendingRequestCount.value = snap.size
  })
}

watch(selectedGudang, (newVal) => {
  if (unsubStok) unsubStok()
  if (newVal) {
    unsubStok = onSnapshot(
      query(collection(db, 'stok_barang'), where('id_gudang', '==', newVal.id)),
      (snap) => {
        stokBarang.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      },
    )
  }
})

onMounted(() => {
  fetchProyek()
  listenPermintaan()
})

onUnmounted(() => {
  if (unsubPermintaan) unsubPermintaan()
  if (unsubStok) unsubStok()
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
.hover-shadow:hover {
  transform: translateY(-8px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1) !important;
}
.transition-all {
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}
.border-dashed-indigo {
  border: 2px dashed #e8eaf6;
  border-radius: 12px;
}

.gudang-table :deep(thead tr th) {
  position: sticky;
  top: 0;
  z-index: 1;
}
.btn-hover:hover {
  filter: brightness(1.1);
  transform: scale(1.02);
  transition: 0.3s;
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
.animate-fade-up {
  animation: fadeInUp 0.8s ease-out forwards;
}
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.tracking-widest {
  letter-spacing: 0.15em;
}
.block {
  display: block;
}
.uppercase {
  text-transform: uppercase;
}
.search-input :deep(.q-field__control) {
  border-radius: 30px;
}
</style>
