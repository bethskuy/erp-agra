<template>
  <q-page class="bg-blue-grey-1 q-pa-md q-pa-md-lg font-pro">
    <template v-if="currentView === 'list'">
      <!-- HEADER DATABASE -->
      <div class="row items-center justify-between q-mb-md q-mb-md-lg">
        <div class="col-12 col-md-auto q-mb-md q-mb-md-none">
          <div class="text-h5 text-md-h4 text-weight-bolder text-blue-grey-10">
            Database Karyawan
          </div>
          <div class="text-caption text-md-subtitle2 text-grey-7">
            Manajemen data dan profil karyawan AGRA
          </div>
        </div>

        <div class="col-12 col-md-auto row q-gutter-sm no-wrap-md">
          <!-- Tombol Export -->
          <q-btn-dropdown
            outline
            color="blue-grey-8"
            label="Export"
            icon="download"
            rounded
            class="col col-md-auto"
          >
            <q-list>
              <q-item clickable v-ripple @click="exportToExcel">
                <q-item-section avatar>
                  <q-icon name="description" color="green-8" />
                </q-item-section>
                <q-item-section>Excel (.xlsx)</q-item-section>
              </q-item>
              <q-item clickable v-ripple @click="exportToPDF">
                <q-item-section avatar>
                  <q-icon name="picture_as_pdf" color="red-8" />
                </q-item-section>
                <q-item-section>PDF (.pdf)</q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>

          <q-btn
            color="primary"
            label="Tambah"
            icon="add"
            @click="openDialog"
            unelevated
            rounded
            class="col col-md-auto shadow-3"
          />
        </div>
      </div>

      <!-- FILTER & SEARCH AREA -->
      <q-card flat bordered class="q-mb-md shadow-1 rounded-borders">
        <q-card-section class="q-py-sm">
          <div class="row items-center q-col-gutter-sm q-col-gutter-md-md">
            <div class="col-12 col-md-5">
              <q-input
                v-model="filter"
                outlined
                dense
                rounded
                placeholder="Cari NIK, Nama, atau Jabatan..."
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
            <div class="col-12 col-md-auto text-center text-md-right text-caption text-grey-6">
              Total:
              <span class="text-weight-bold text-primary">{{ karyawanList.length }}</span> Karyawan
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- TABLE LIST KARYAWAN -->
      <q-card flat bordered class="shadow-2 rounded-borders overflow-hidden">
        <q-table
          :rows="karyawanList"
          :columns="columns"
          row-key="id"
          flat
          :filter="filter"
          binary-state-sort
          class="karyawan-table"
          :grid="$q.screen.lt.md"
        >
          <!-- Custom Header untuk Desktop -->
          <template v-slot:header="props">
            <q-tr :props="props" class="bg-blue-grey-10 text-white">
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

          <!-- Row Desktop -->
          <template v-slot:body="props">
            <q-tr :props="props" class="hover-bg transition-all">
              <q-td
                key="nik"
                :props="props"
                class="cursor-pointer text-weight-medium"
                @click="viewDetail(props.row)"
              >
                {{ props.row.nik }}
              </q-td>
              <q-td
                key="nama"
                :props="props"
                class="cursor-pointer text-weight-bold"
                @click="viewDetail(props.row)"
              >
                {{ props.row.nama }}
              </q-td>
              <q-td
                key="jabatan"
                :props="props"
                class="cursor-pointer"
                @click="viewDetail(props.row)"
              >
                <q-badge
                  color="blue-1"
                  text-color="blue-grey-10"
                  class="q-px-sm q-py-xs text-weight-bold shadow-sm border-subtle"
                >
                  {{ props.row.jabatan }}
                </q-badge>
              </q-td>

              <q-td key="actions" :props="props" auto-width>
                <q-btn
                  flat
                  round
                  color="blue-8"
                  icon="edit"
                  size="sm"
                  @click.stop="editKaryawan(props.row)"
                />
                <q-btn
                  flat
                  round
                  color="negative"
                  icon="delete"
                  size="sm"
                  @click.stop="deleteKaryawan(props.row, $event)"
                />
              </q-td>
            </q-tr>
          </template>

          <template v-slot:no-data>
            <div class="full-width row flex-center q-pa-xl text-grey-6">
              <q-icon name="sentiment_dissatisfied" size="48px" class="q-mr-sm" />
              <div class="text-h6">Data tidak ditemukan</div>
            </div>
          </template>
        </q-table>
      </q-card>
    </template>

    <!-- TAMPILAN DETAIL KARYAWAN -->
    <template v-else-if="currentView === 'detail'">
      <div class="row items-center q-mb-md">
        <q-btn
          flat
          icon="arrow_back"
          label="Kembali"
          @click="currentView = 'list'"
          color="blue-grey-8"
          rounded
        />
        <q-space />
        <q-btn
          flat
          icon="print"
          color="primary"
          :label="$q.screen.gt.xs ? 'Cetak Profil' : ''"
          @click="exportSinglePDF(selectedKaryawan)"
        />
      </div>

      <div class="row justify-center">
        <q-card
          flat
          bordered
          style="width: 100%; max-width: 900px"
          class="rounded-borders shadow-3"
        >
          <q-card-section
            class="row q-pa-md q-pa-md-xl items-center q-col-gutter-lg q-col-gutter-md-xl"
          >
            <div class="col-12 col-md-4 text-center">
              <q-avatar
                :size="$q.screen.lt.md ? '120px' : '180px'"
                class="shadow-10 border-white-5"
              >
                <img :src="selectedKaryawan.fotoUrl || 'https://cdn.quasar.dev/img/avatar.png'" />
              </q-avatar>
              <div class="q-mt-md">
                <q-badge color="blue-grey-10" class="q-px-md q-py-xs text-weight-bold">
                  {{ selectedKaryawan.nik }}
                </q-badge>
              </div>
            </div>

            <div class="col-12 col-md-8 text-center text-md-left">
              <div class="text-h4 text-md-h3 text-weight-bolder text-blue-grey-10 q-mb-xs">
                {{ selectedKaryawan.nama }}
              </div>
              <div
                class="text-subtitle1 text-md-h6 text-primary text-weight-medium q-mb-lg flex flex-center flex-md-start items-center"
              >
                <q-icon name="work" class="q-mr-sm" />
                {{ selectedKaryawan.jabatan }}
              </div>

              <div class="row q-col-gutter-y-md text-left text-body2 text-md-body1">
                <div class="col-12 col-sm-6">
                  <div class="text-caption text-grey-7 uppercase-tracking">Email</div>
                  <div class="text-weight-medium ellipsis">{{ selectedKaryawan.email || '-' }}</div>
                </div>
                <div class="col-12 col-sm-6">
                  <div class="text-caption text-grey-7 uppercase-tracking">Telepon</div>
                  <div class="text-weight-medium">{{ selectedKaryawan.hp || '-' }}</div>
                </div>
                <div class="col-12 col-sm-6">
                  <div class="text-caption text-grey-7 uppercase-tracking">Tgl Lahir</div>
                  <div class="text-weight-medium">
                    {{ selectedKaryawan.kotaLahir || '-' }}, {{ selectedKaryawan.tglLahir || '-' }}
                  </div>
                </div>
                <div class="col-12 col-sm-6">
                  <div class="text-caption text-grey-7 uppercase-tracking">Mulai Kerja</div>
                  <div class="text-weight-medium">{{ selectedKaryawan.tglMasuk || '-' }}</div>
                </div>
              </div>
            </div>
          </q-card-section>

          <q-separator />

          <q-card-section class="q-pa-md q-pa-md-xl bg-grey-1">
            <div class="row q-col-gutter-lg q-col-gutter-md-xl">
              <div class="col-12 col-md-6">
                <div
                  class="text-subtitle1 text-weight-bold q-mb-sm q-mb-md-md text-blue-grey-10 flex items-center"
                >
                  <q-icon name="home" color="blue-grey-4" class="q-mr-sm" /> Alamat Domisili
                </div>
                <div class="text-body2 text-md-body1 text-grey-9 leading-relaxed">
                  {{ selectedKaryawan.alamat || 'Tidak ada data alamat.' }}
                </div>
              </div>
              <div class="col-12 col-md-6">
                <div
                  class="text-subtitle1 text-weight-bold q-mb-sm q-mb-md-md text-blue-grey-10 flex items-center"
                >
                  <q-icon name="security" color="blue-grey-4" class="q-mr-sm" /> Hak Akses Sistem
                </div>
                <div class="row q-gutter-xs q-gutter-md-sm">
                  <q-chip
                    v-for="akses in selectedKaryawan.akses"
                    :key="akses"
                    color="white"
                    text-color="primary"
                    class="shadow-sm border-subtle"
                    dense
                  >
                    <q-icon name="check_circle" size="xs" color="primary" class="q-mr-xs" />
                    {{ akses }}
                  </q-chip>
                  <div v-if="!selectedKaryawan.akses?.length" class="text-grey-6 italic">
                    - Belum ada hak akses -
                  </div>
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </template>

    <!-- DIALOG INPUT/EDIT KARYAWAN (FULLSCREEN) -->
    <q-dialog
      v-model="showDialog"
      persistent
      maximized
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card class="bg-grey-2 column no-wrap">
        <q-toolbar class="bg-white text-blue-grey-10 q-pa-md shadow-2 shrink">
          <q-btn flat v-close-popup icon="close" round color="grey-7" />
          <q-toolbar-title class="text-weight-bold text-subtitle1 text-md-h6">
            {{ form.id ? 'Perbarui Data' : 'Registrasi Baru' }}
          </q-toolbar-title>
          <q-btn
            :label="$q.screen.gt.xs ? 'SIMPAN DATA KARYAWAN' : 'SIMPAN'"
            @click="saveKaryawan"
            unelevated
            rounded
            class="text-white shadow-6 q-px-md q-px-md-xl"
            style="background: linear-gradient(135deg, #1976d2 0%, #0d47a1 100%); font-weight: 700"
          />
        </q-toolbar>

        <q-scroll-area class="col q-pa-md q-pa-md-xl">
          <div class="row justify-center">
            <div class="col-12 col-lg-10">
              <div class="row q-col-gutter-lg q-col-gutter-md-xl">
                <!-- Data Personal -->
                <div class="col-12 col-md-7">
                  <q-card flat bordered class="rounded-borders q-pa-md q-pa-md-lg bg-white">
                    <div
                      class="text-subtitle1 text-md-h6 q-mb-md text-blue-grey-10 flex items-center"
                    >
                      <q-icon name="person" color="primary" class="q-mr-sm" /> Informasi Personal
                    </div>
                    <div class="row q-col-gutter-md">
                      <q-input
                        class="col-12"
                        outlined
                        v-model="form.nik"
                        label="NIK"
                        readonly
                        bg-color="grey-1"
                        dense
                      />
                      <q-input
                        class="col-12"
                        outlined
                        v-model="form.nama"
                        label="Nama Lengkap"
                        dense
                      />
                      <q-input
                        class="col-12 col-sm-6"
                        outlined
                        v-model="form.hp"
                        label="No Handphone"
                        dense
                      />
                      <q-select
                        class="col-12 col-sm-6"
                        outlined
                        v-model="form.jabatan"
                        :options="jabatanOptions"
                        label="Jabatan"
                        emit-value
                        map-options
                        dense
                      />
                      <q-input
                        class="col-6"
                        outlined
                        v-model="form.kotaLahir"
                        label="Tempat Lahir"
                        dense
                      />
                      <q-input
                        class="col-6"
                        outlined
                        v-model="form.tglLahir"
                        type="date"
                        stack-label
                        label="Tgl Lahir"
                        dense
                      />
                      <q-input
                        class="col-12"
                        outlined
                        v-model="form.tglMasuk"
                        type="date"
                        stack-label
                        label="Mulai Kerja"
                        dense
                      />
                      <q-input
                        class="col-12"
                        outlined
                        v-model="form.alamat"
                        type="textarea"
                        label="Alamat Lengkap"
                        autogrow
                        dense
                      />
                    </div>
                  </q-card>

                  <q-card flat bordered class="rounded-borders q-pa-md q-pa-md-lg q-mt-lg bg-white">
                    <div
                      class="text-subtitle1 text-md-h6 q-mb-md text-blue-grey-10 flex items-center"
                    >
                      <q-icon name="vpn_key" color="primary" class="q-mr-sm" /> Akun Sistem
                    </div>
                    <div class="row q-col-gutter-md">
                      <q-input
                        class="col-12 col-sm-6"
                        outlined
                        v-model="form.email"
                        label="Email Login"
                        :readonly="!!form.id"
                        dense
                      />
                      <q-input
                        class="col-12 col-sm-6"
                        outlined
                        v-model="form.password"
                        label="Password"
                        type="password"
                        dense
                      />
                    </div>
                  </q-card>
                </div>

                <!-- Akses & Media -->
                <div class="col-12 col-md-5">
                  <q-card flat bordered class="rounded-borders q-pa-md q-pa-md-lg bg-white">
                    <div
                      class="text-subtitle1 text-md-h6 q-mb-md text-blue-grey-10 flex items-center"
                    >
                      <q-icon name="admin_panel_settings" color="primary" class="q-mr-sm" /> Hak
                      Akses
                    </div>

                    <!-- PERBAIKAN DROPDOWN: MENGGUNAKAN uniqueDivisionOptions AGAR TIDAK DOUBLE -->
                    <div class="q-mt-sm">
                      <q-select
                        outlined
                        v-model="form.akses"
                        :options="uniqueDivisionOptions"
                        option-label="name"
                        option-value="aksesKey"
                        emit-value
                        map-options
                        multiple
                        use-chips
                        stack-label
                        label="Pilih Divisi / Bidang Bisnis *"
                        placeholder="Klik untuk memilih..."
                        dense
                        bg-color="grey-1"
                        :rules="[(val) => (val && val.length > 0) || 'Pilih minimal satu divisi']"
                      >
                        <template v-slot:prepend>
                          <q-icon name="business_center" color="primary" />
                        </template>
                      </q-select>
                    </div>

                    <div
                      class="q-mt-lg text-subtitle1 text-md-h6 q-mb-sm text-blue-grey-10 flex items-center"
                    >
                      <q-icon name="image" color="primary" class="q-mr-sm" /> Foto Profil
                    </div>
                    <q-file outlined v-model="fotoFile" label="Pilih Foto" accept="image/*" dense>
                      <template v-slot:prepend><q-icon name="cloud_upload" /></template>
                    </q-file>

                    <div
                      class="q-mt-lg text-subtitle1 text-md-h6 q-mb-sm text-blue-grey-10 flex items-center"
                    >
                      <q-icon name="attach_file" color="primary" class="q-mr-sm" /> Dokumen
                    </div>
                    <div
                      v-for="(item, index) in docList"
                      :key="index"
                      class="row q-col-gutter-xs q-mb-xs items-center"
                    >
                      <q-input class="col-5" outlined v-model="item.name" label="Nama" dense />
                      <q-file class="col-5" outlined v-model="item.file" label="File" dense />
                      <div class="col-2 text-right">
                        <q-btn
                          color="negative"
                          icon="delete"
                          @click="docList.splice(index, 1)"
                          dense
                          flat
                          round
                          size="sm"
                        />
                      </div>
                    </div>
                    <q-btn
                      color="primary"
                      label="Tambah Dokumen"
                      icon="add_circle"
                      @click="docList.push({ name: '', file: null })"
                      outline
                      size="sm"
                      class="full-width q-mt-sm rounded-borders"
                    />
                  </q-card>
                </div>
              </div>
            </div>
          </div>
        </q-scroll-area>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { db, auth, storage } from 'src/boot/firebase'
// eslint-disable-next-line no-unused-vars
import { collection, addDoc, updateDoc, doc, onSnapshot, deleteDoc } from 'firebase/firestore'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const currentView = ref('list')
const filter = ref('')
const selectedKaryawan = ref(null)
const showDialog = ref(false)
// eslint-disable-next-line no-unused-vars
const loadingSimpan = ref(false)
const karyawanList = ref([])
const jabatanOptions = ref([])
const modulList = ref([])
const docList = ref([{ name: '', file: null }])
const fotoFile = ref(null)

const form = ref({ id: null, nik: '', nama: '', jabatan: '', email: '', password: '', akses: [] })

/**
 * LOGIKA KRUSIAL: MENCEGAH DATA DOUBLE DI DROPDOWN
 * Menggunakan Map() untuk memastikan hanya ada SATU entri per aksesKey
 */
const uniqueDivisionOptions = computed(() => {
  const uniqueMap = new Map()

  modulList.value.forEach((mod) => {
    const key = mod.aksesKey?.toLowerCase()
    const name = mod.name?.toLowerCase()

    // Filter hanya departemen utama
    const isTarget =
      key === 'manufaktur' ||
      key === 'konstruksi' ||
      name?.includes('manufacture') ||
      name?.includes('konstruksi')

    // Jika data valid dan belum ada di Map, masukkan. Jika sudah ada, abaikan (Anti-Double)
    if (isTarget && mod.aksesKey && !uniqueMap.has(mod.aksesKey)) {
      uniqueMap.set(mod.aksesKey, {
        name: name?.includes('manufacture') || key === 'manufaktur' ? 'Manufaktur' : 'Konstruksi',
        aksesKey: mod.aksesKey,
      })
    }
  })

  return Array.from(uniqueMap.values())
})

// HELPER LIBRARY EKSTERNAL
const loadScript = (src) => {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve()
    const script = document.createElement('script')
    script.src = src
    script.onload = resolve
    script.onerror = reject
    document.head.appendChild(script)
  })
}

const loadExternalLibraries = async () => {
  try {
    await Promise.all([
      loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'),
      loadScript('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js'),
    ])
    await loadScript(
      'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.25/jspdf.plugin.autotable.min.js',
    )
  } catch (err) {
    console.error('Lib Error:', err)
  }
}

// ACTIONS
const viewDetail = (data) => {
  selectedKaryawan.value = data
  currentView.value = 'detail'
}
const editKaryawan = (data) => {
  form.value = { ...data, password: '' }
  showDialog.value = true
}
const openDialog = () => {
  form.value = { id: null, nik: 'KRY-' + Date.now().toString().slice(-6), akses: [] }
  showDialog.value = true
}

const saveKaryawan = async () => {
  if (!form.value.nama || !form.value.akses.length) {
    $q.notify({ type: 'warning', message: 'Lengkapi Nama dan Hak Akses' })
    return
  }
  $q.loading.show()
  try {
    let fotoUrl = form.value.fotoUrl || null
    if (fotoFile.value) {
      const fRef = storageRef(storage, `karyawan/avatars/${Date.now()}_${fotoFile.value.name}`)
      await uploadBytes(fRef, fotoFile.value)
      fotoUrl = await getDownloadURL(fRef)
    }
    // eslint-disable-next-line no-unused-vars
    const { id, password, ...formData } = form.value
    if (id) {
      await updateDoc(doc(db, 'karyawan', id), { ...formData, fotoUrl })
    } else {
      const cred = await createUserWithEmailAndPassword(auth, form.value.email, form.value.password)
      await addDoc(collection(db, 'karyawan'), { ...formData, fotoUrl, uid: cred.user.uid })
    }
    showDialog.value = false
    $q.notify({ type: 'positive', message: 'Berhasil!' })
  } catch (e) {
    $q.notify({ type: 'negative', message: e.message })
  } finally {
    $q.loading.hide()
  }
}

const exportToExcel = () => {
  if (!window.XLSX) return
  const data = karyawanList.value.map((k) => [k.nik, k.nama, k.jabatan, k.email])
  const ws = window.XLSX.utils.aoa_to_sheet([['NIK', 'NAMA', 'JABATAN', 'EMAIL'], ...data])
  const wb = window.XLSX.utils.book_new()
  window.XLSX.utils.book_append_sheet(wb, ws, 'Data')
  window.XLSX.writeFile(wb, `Karyawan_AGRA.xlsx`)
}

const exportToPDF = () => {
  const jspdf = window.jspdf
  if (!jspdf) return
  const doc = new jspdf.jsPDF()
  doc.text('DATABASE KARYAWAN AGRA', 105, 20, { align: 'center' })
  const tableData = karyawanList.value.map((k) => [k.nik, k.nama, k.jabatan])
  doc.autoTable({ head: [['NIK', 'NAMA', 'JABATAN']], body: tableData, startY: 30 })
  doc.save('Karyawan_AGRA.pdf')
}

const exportSinglePDF = (k) => {
  const jspdf = window.jspdf
  if (!jspdf) return
  const doc = new jspdf.jsPDF()
  doc.setFontSize(20).text('PROFIL KARYAWAN', 20, 20)
  doc.setFontSize(12).text([`Nama: ${k.nama}`, `NIK: ${k.nik}`, `Jabatan: ${k.jabatan}`], 20, 40)
  doc.save(`Profil_${k.nama}.pdf`)
}

onMounted(async () => {
  await loadExternalLibraries()
  onSnapshot(collection(db, 'karyawan'), (s) => {
    karyawanList.value = s.docs.map((d) => ({ ...d.data(), id: d.id }))
  })
  onSnapshot(collection(db, 'jabatan'), (s) => {
    jabatanOptions.value = s.docs.map((d) => ({
      label: d.data().namaJabatan,
      value: d.data().namaJabatan,
    }))
  })
  onSnapshot(collection(db, 'modul'), (s) => {
    modulList.value = s.docs.map((d) => ({ id: d.id, ...d.data() }))
  })
})

const columns = [
  { name: 'nik', label: 'NIK', field: 'nik', align: 'left', sortable: true },
  { name: 'nama', label: 'NAMA KARYAWAN', field: 'nama', align: 'left', sortable: true },
  { name: 'jabatan', label: 'JABATAN / POSISI', field: 'jabatan', align: 'left', sortable: true },
  { name: 'actions', label: 'AKSI', field: 'id', align: 'right' },
]
</script>

<style scoped>
.font-pro {
  font-family: 'Inter', sans-serif;
}
.rounded-borders {
  border-radius: 12px;
}
.hover-bg:hover {
  background-color: rgba(25, 118, 210, 0.03) !important;
}
.border-white-5 {
  border: 5px solid white;
}
.karyawan-table :deep(thead tr th) {
  position: sticky;
  top: 0;
  z-index: 1;
  background: #263238;
  color: white;
}
</style>
