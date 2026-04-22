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

          <!-- Custom Grid untuk Mobile -->
          <template v-slot:item="props">
            <div class="q-pa-xs col-xs-12 col-sm-6">
              <q-card
                flat
                bordered
                class="q-pa-sm shadow-1 hover-bg transition-all"
                @click="viewDetail(props.row)"
              >
                <q-card-section>
                  <div class="row items-center no-wrap">
                    <q-avatar color="indigo-1" text-color="primary" size="40px" class="q-mr-md">
                      {{ props.row.nama?.charAt(0) }}
                    </q-avatar>
                    <div class="col overflow-hidden">
                      <div class="text-weight-bold text-subtitle1 ellipsis">
                        {{ props.row.nama }}
                      </div>
                      <div class="text-caption text-grey-7">{{ props.row.nik }}</div>
                    </div>
                    <div class="col-auto">
                      <q-badge color="blue-1" text-color="blue-grey-10" class="text-weight-bold">
                        {{ props.row.jabatan }}
                      </q-badge>
                    </div>
                  </div>
                </q-card-section>

                <q-separator />

                <q-card-actions align="right">
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
                  <q-btn
                    flat
                    round
                    color="grey-7"
                    icon="chevron_right"
                    size="sm"
                    @click="viewDetail(props.row)"
                  />
                </q-card-actions>
              </q-card>
            </div>
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
                  @click="deleteKaryawan(props.row, $event)"
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
                  <q-card flat bordered class="rounded-borders q-pa-md q-pa-md-lg">
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
                        label="NIK (Otomatis)"
                        readonly
                        bg-color="grey-1"
                        dense
                      />
                      <q-input
                        class="col-12"
                        outlined
                        v-model="form.nama"
                        label="Nama Lengkap"
                        placeholder="Sesuai KTP"
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

                  <q-card flat bordered class="rounded-borders q-pa-md q-pa-md-lg q-mt-lg">
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

                <!-- Akses & Foto -->
                <div class="col-12 col-md-5">
                  <q-card flat bordered class="rounded-borders q-pa-md q-pa-md-lg">
                    <div
                      class="text-subtitle1 text-md-h6 q-mb-md text-blue-grey-10 flex items-center"
                    >
                      <q-icon name="admin_panel_settings" color="primary" class="q-mr-sm" /> Hak
                      Akses
                    </div>
                    <div class="row q-col-gutter-sm bg-grey-1 q-pa-sm rounded-borders">
                      <q-checkbox
                        v-for="mod in modulList"
                        :key="mod.id"
                        v-model="form.akses"
                        :val="mod.aksesKey"
                        :label="mod.name"
                        class="col-6"
                        color="primary"
                        dense
                      />
                    </div>

                    <div
                      class="q-mt-lg text-subtitle1 text-md-h6 q-mb-sm text-blue-grey-10 flex items-center"
                    >
                      <q-icon name="image" color="primary" class="q-mr-sm" /> Foto Profil
                    </div>
                    <q-file
                      outlined
                      v-model="fotoFile"
                      label="Pilih Foto"
                      accept="image/*"
                      class="q-mb-md"
                      dense
                    >
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
import { ref, onMounted } from 'vue'
import { db, auth, storage } from 'src/boot/firebase'
import { collection, addDoc, updateDoc, doc, onSnapshot, deleteDoc } from 'firebase/firestore'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { useQuasar } from 'quasar'

// STATE
const $q = useQuasar()
const currentView = ref('list')
const filter = ref('')
const selectedKaryawan = ref(null)
const showDialog = ref(false)
const loadingSimpan = ref(false)
const karyawanList = ref([])
const jabatanOptions = ref([])
const modulList = ref([])
const docList = ref([{ name: '', file: null }])
const fotoFile = ref(null)

const form = ref({
  id: null,
  nik: '',
  nama: '',
  kotaLahir: '',
  tglLahir: '',
  tglMasuk: '',
  alamat: '',
  jabatan: '',
  email: '',
  password: '',
  akses: [],
})

// HELPER UNTUK LOAD SCRIPT DARI CDN
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
    console.error('Gagal memuat library ekspor:', err)
  }
}

// ACTIONS
const viewDetail = (data) => {
  selectedKaryawan.value = data
  currentView.value = 'detail'
}

const editKaryawan = (data) => {
  form.value = { ...data, password: '' }
  docList.value = data.docUrls ? [...data.docUrls] : [{ name: '', file: null }]
  showDialog.value = true
}

const openDialog = () => {
  form.value = {
    id: null,
    nik: 'KRY-' + Date.now().toString().slice(-6),
    nama: '',
    email: '',
    password: '',
    akses: [],
  }
  docList.value = [{ name: '', file: null }]
  showDialog.value = true
}

const deleteKaryawan = (row, e) => {
  if (e) e.stopPropagation()
  if (!row || !row.id) return

  $q.dialog({
    title: 'Konfirmasi Hapus',
    message: `Apakah Anda yakin ingin menghapus data karyawan ${row.nama}? Tindakan ini tidak dapat dibatalkan.`,
    cancel: { label: 'Batal', flat: true, color: 'grey-7' },
    ok: { label: 'Ya, Hapus', color: 'negative', unelevated: true, rounded: true },
    persistent: true,
  }).onOk(async () => {
    try {
      await deleteDoc(doc(db, 'karyawan', row.id))
      $q.notify({ type: 'positive', message: 'Data karyawan berhasil dihapus' })
    } catch (err) {
      $q.notify({ type: 'negative', message: 'Gagal menghapus: ' + err.message })
    }
  })
}

const saveKaryawan = async () => {
  if (!form.value.nama || !form.value.jabatan) {
    $q.notify({ type: 'warning', message: 'Nama dan Jabatan wajib diisi' })
    return
  }

  $q.loading.show({ message: 'Sedang memproses data...' })
  loadingSimpan.value = true

  try {
    let fotoUrl = form.value.fotoUrl || null
    if (fotoFile.value) {
      const fRef = storageRef(storage, `karyawan/avatars/${Date.now()}_${fotoFile.value.name}`)
      await uploadBytes(fRef, fotoFile.value)
      fotoUrl = await getDownloadURL(fRef)
    }

    let docUrls = []
    for (let d of docList.value) {
      if (d.file) {
        const sRef = storageRef(storage, `karyawan/docs/${Date.now()}_${d.file.name}`)
        await uploadBytes(sRef, d.file)
        docUrls.push({ name: d.name, url: await getDownloadURL(sRef) })
      } else if (d.url) {
        docUrls.push(d)
      }
    }

    // eslint-disable-next-line no-unused-vars
    const { id, password, ...formData } = form.value

    if (id) {
      await updateDoc(doc(db, 'karyawan', id), {
        ...formData,
        fotoUrl,
        docUrls,
      })
    } else {
      if (!form.value.email || !form.value.password) {
        throw new Error('Email dan Password wajib diisi untuk karyawan baru')
      }
      const cred = await createUserWithEmailAndPassword(auth, form.value.email, form.value.password)
      await addDoc(collection(db, 'karyawan'), {
        ...formData,
        fotoUrl,
        docUrls,
        uid: cred.user.uid,
      })
    }
    $q.notify({ type: 'positive', message: 'Data karyawan berhasil disimpan!' })
    showDialog.value = false
  } catch (e) {
    console.error('SAVE ERROR:', e)
    $q.notify({ type: 'negative', message: 'Terjadi Kesalahan: ' + e.message })
  } finally {
    $q.loading.hide()
    loadingSimpan.value = false
  }
}

// EXPORT FUNCTIONS
const exportToExcel = () => {
  try {
    if (!window.XLSX) {
      $q.notify({ color: 'warning', message: 'Library Excel sedang dimuat, tunggu sebentar...' })
      return
    }

    const headerRow1 = ['AGRA ABHINAYA PERKASA']
    const headerRow2 = ['LAPORAN DATABASE KARYAWAN']
    const headerRow3 = [`Dicetak pada: ${new Date().toLocaleString()}`]
    const emptyRow = ['']
    const tableHeader = [
      'NIK',
      'Nama Karyawan',
      'Jabatan',
      'Email',
      'No. HP',
      'Alamat',
      'Tanggal Masuk',
    ]
    const dataRows = karyawanList.value.map((k) => [
      k.nik || '-',
      k.nama || '-',
      k.jabatan || '-',
      k.email || '-',
      k.hp || '-',
      k.alamat || '-',
      k.tglMasuk || '-',
    ])
    const finalData = [headerRow1, headerRow2, headerRow3, emptyRow, tableHeader, ...dataRows]
    const ws = window.XLSX.utils.aoa_to_sheet(finalData)
    ws['!cols'] = [
      { wch: 15 },
      { wch: 35 },
      { wch: 20 },
      { wch: 30 },
      { wch: 18 },
      { wch: 45 },
      { wch: 15 },
    ]
    ws['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 6 } },
      { s: { r: 2, c: 0 }, e: { r: 2, c: 6 } },
    ]
    const wb = window.XLSX.utils.book_new()
    window.XLSX.utils.book_append_sheet(wb, ws, 'Database Karyawan')
    window.XLSX.writeFile(wb, `Database_Karyawan_AGRA_${Date.now()}.xlsx`)
    $q.notify({ color: 'positive', message: 'Excel berhasil diexport', icon: 'check' })
  } catch (e) {
    console.error(e)
    $q.notify({ color: 'negative', message: 'Gagal export excel.' })
  }
}

const exportToPDF = () => {
  try {
    const jspdf = window.jspdf
    if (!jspdf) {
      $q.notify({ color: 'warning', message: 'Library PDF sedang dimuat, tunggu sebentar...' })
      return
    }
    const doc = new jspdf.jsPDF()
    doc.setFontSize(20)
    doc.setTextColor(25, 118, 210)
    doc.text('AGRA ABHINAYA PERKASA', 105, 20, { align: 'center' })
    doc.setFontSize(14)
    doc.setTextColor(100)
    doc.text('LAPORAN DATABASE KARYAWAN', 105, 30, { align: 'center' })
    doc.setDrawColor(200)
    doc.line(15, 35, 195, 35)
    doc.setFontSize(10)
    doc.text(`Dicetak pada: ${new Date().toLocaleString()}`, 15, 42)
    const tableData = karyawanList.value.map((k) => [k.nik, k.nama, k.jabatan, k.hp, k.email])
    doc.autoTable({
      head: [['NIK', 'Nama Karyawan', 'Jabatan', 'No. HP', 'Email']],
      body: tableData,
      startY: 50,
      headStyles: { fillColor: [25, 118, 210], fontSize: 10 },
      styles: { fontSize: 9, cellPadding: 3 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    })
    doc.save('Database_Karyawan_AGRA.pdf')
    $q.notify({ color: 'positive', message: 'PDF berhasil dibuat', icon: 'picture_as_pdf' })
  } catch (e) {
    console.error(e)
    $q.notify({ color: 'negative', message: 'Gagal export PDF.' })
  }
}

const exportSinglePDF = (k) => {
  try {
    const jspdf = window.jspdf
    if (!jspdf) return
    const doc = new jspdf.jsPDF()
    doc.setFontSize(22)
    doc.setTextColor(25, 118, 210)
    doc.text('PROFIL KARYAWAN AGRA', 105, 20, { align: 'center' })
    doc.setDrawColor(25, 118, 210)
    doc.setLineWidth(1)
    doc.line(15, 25, 195, 25)
    doc.setFontSize(12)
    doc.setTextColor(50)
    doc.text(`Nama: ${k.nama}`, 20, 40)
    doc.text(`NIK: ${k.nik}`, 20, 50)
    doc.text(`Jabatan: ${k.jabatan}`, 20, 60)
    doc.text(`Email: ${k.email}`, 20, 70)
    doc.text(`Telepon: ${k.hp}`, 20, 80)
    doc.text(`Alamat: ${k.alamat}`, 20, 90)
    doc.save(`Profil_${k.nama}.pdf`)
    // eslint-disable-next-line no-unused-vars
  } catch (e) {
    $q.notify({ color: 'negative', message: 'Gagal cetak profil' })
  }
}

// FETCH DATA
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
.hover-bg:hover {
  background-color: rgba(25, 118, 210, 0.03) !important;
}
.cursor-pointer {
  cursor: pointer;
}
.border-subtle {
  border: 1px solid rgba(0, 0, 0, 0.05);
}
.uppercase-tracking {
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-weight: 700;
  font-size: 0.65rem;
}
@media (min-width: 600px) {
  .uppercase-tracking {
    font-size: 0.75rem;
  }
}
.border-white-5 {
  border: 5px solid white;
}
.transition-all {
  transition: all 0.3s ease;
}
.shrink {
  flex: 0 0 auto;
}
.karyawan-table :deep(thead tr th) {
  position: sticky;
  top: 0;
  z-index: 1;
}
/* Menghilangkan shadow grid q-table bawaan agar lebih rapi */
.karyawan-table :deep(.q-table__grid-content) {
  padding: 8px;
}
</style>
