<template>
  <q-page class="bg-grey-2 q-pa-md">
    <div class="row items-center q-mb-md">
      <div class="col">
        <div class="text-h5 text-weight-bold text-primary text-uppercase">
          Penawaran Harga (Quotation)
        </div>
        <div class="text-caption text-grey-7">
          Buat surat penawaran harga resmi dengan template dokumen profesional.
        </div>
      </div>
      <div class="col-auto">
        <q-btn
          unelevated
          color="primary"
          icon="add"
          label="Buat Penawaran"
          @click="openAddDialog"
          no-caps
        />
      </div>
    </div>

    <q-card flat bordered class="rounded-borders shadow-1">
      <q-table :rows="rows" :columns="columns" row-key="id" flat :filter="filter">
        <template v-slot:top-right>
          <q-input
            outlined
            dense
            debounce="300"
            v-model="filter"
            placeholder="Cari penawaran..."
            bg-color="white"
          >
            <template v-slot:append><q-icon name="search" /></template>
          </q-input>
        </template>
        <template v-slot:body-cell-aksi="props">
          <q-td :props="props" class="q-gutter-xs text-center">
            <q-btn
              flat
              round
              color="blue"
              icon="edit"
              size="sm"
              @click="openEditDialog(props.row)"
            />
            <q-btn
              flat
              round
              color="negative"
              icon="delete"
              size="sm"
              @click="confirmHapus(props.row)"
            />
          </q-td>
        </template>
      </q-table>
    </q-card>

    <q-dialog
      v-model="showDialog"
      persistent
      maximized
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card class="bg-grey-1">
        <q-bar class="bg-primary text-white q-pa-lg" style="height: 50px">
          <div class="text-subtitle1 text-weight-bold uppercase">
            {{ isEditMode ? 'Edit Penawaran' : 'Tambah Penawaran' }}
          </div>
          <q-space />
          <q-btn dense flat icon="close" v-close-popup />
        </q-bar>

        <q-card-section class="q-pa-md scroll" style="height: calc(100vh - 50px)">
          <q-card flat bordered class="q-pa-md q-mb-md rounded-borders">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-3">
                <div class="label-ref">Nomor</div>
                <q-input
                  outlined
                  dense
                  v-model="form.no_quotation"
                  placeholder="nomor akan digenerate otomatis"
                  bg-color="white"
                  readonly
                />
              </div>
              <div class="col-12 col-md-3">
                <div class="label-ref">Tanggal</div>
                <q-input outlined dense v-model="form.tanggal" type="date" bg-color="white" />
              </div>
              <div class="col-12 col-md-3">
                <div class="label-ref">Proyek</div>
                <q-select
                  outlined
                  dense
                  v-model="form.proyek"
                  :options="['- Pilih Proyek -', 'Agra Town', 'Ruko Green']"
                  bg-color="white"
                />
              </div>
              <div class="col-12 col-md-3">
                <div class="label-ref">Kustomer</div>
                <q-select
                  outlined
                  dense
                  v-model="form.konsumen"
                  :options="['- Pilih Kustomer -', 'Andi Wijaya', 'PT. Maju']"
                  bg-color="white"
                />
              </div>
            </div>
          </q-card>

          <q-card flat bordered class="q-pa-md q-mb-md rounded-borders">
            <div class="label-ref q-mb-sm">Scope Pekerjaan</div>
            <q-input
              outlined
              dense
              v-model="form.scope"
              bg-color="white"
              placeholder="Scope Pekerjaan..."
            />
          </q-card>

          <q-card flat bordered class="q-pa-md q-mb-md rounded-borders">
            <div class="label-ref q-mb-sm text-weight-bold text-primary">ISI DOKUMEN PENAWARAN</div>

            <div class="row q-gutter-xs q-mb-md">
              <q-badge
                v-for="tag in templateTags"
                :key="tag"
                color="orange-8"
                class="q-pa-xs cursor-pointer text-weight-bold"
                @click="insertTag(tag)"
              >
                { {{ tag }} }
              </q-badge>
            </div>

            <q-editor
              v-model="form.ketentuan"
              min-height="25rem"
              class="bg-white times-font shadow-1"
              :toolbar="[
                ['bold', 'italic', 'strike', 'underline'],
                ['left', 'center', 'right', 'justify'],
                ['token', 'hr', 'link', 'custom_btn'],
                ['quote', 'unordered', 'ordered'],
                ['undo', 'redo', 'viewsource'],
              ]"
            />
          </q-card>

          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-7">
              <q-card flat bordered class="q-pa-md rounded-borders full-height bg-white shadow-1">
                <div class="label-ref q-mb-sm text-weight-bold">Catatan Internal</div>
                <q-input
                  outlined
                  v-model="form.catatan"
                  type="textarea"
                  placeholder="Catatan tambahan (tidak tampil di surat)..."
                  rows="10"
                />
              </q-card>
            </div>

            <div class="col-12 col-md-5">
              <q-card flat bordered class="q-pa-md rounded-borders bg-white shadow-1">
                <div class="q-gutter-y-sm">
                  <div class="row items-center justify-between">
                    <div class="text-grey-7 text-weight-bold">Subtotal</div>
                    <q-input
                      outlined
                      dense
                      v-model.number="form.subtotal"
                      type="number"
                      class="col-6"
                      @update:model-value="updateSummary"
                    />
                  </div>

                  <div class="row items-center q-col-gutter-sm">
                    <div class="col-3 text-grey-7">Diskon (%)</div>
                    <div class="col-3">
                      <q-input
                        outlined
                        dense
                        v-model.number="form.disc_persen"
                        type="number"
                        @update:model-value="updateSummary"
                      />
                    </div>
                    <div class="col-6">
                      <q-input
                        outlined
                        dense
                        :model-value="formatMoney(form.disc_value)"
                        prefix="Rp"
                        readonly
                        bg-color="grey-1"
                      />
                    </div>
                  </div>

                  <div class="row items-center q-col-gutter-sm">
                    <div class="col-3 text-grey-7">PPN (%)</div>
                    <div class="col-3">
                      <q-input
                        outlined
                        dense
                        v-model.number="form.ppn_persen"
                        type="number"
                        @update:model-value="updateSummary"
                      />
                    </div>
                    <div class="col-6">
                      <q-input
                        outlined
                        dense
                        :model-value="formatMoney(form.ppn_value)"
                        prefix="Rp"
                        readonly
                        bg-color="grey-1"
                      />
                    </div>
                  </div>

                  <q-separator class="q-my-md" />

                  <div class="row items-center justify-between">
                    <div class="text-h6 text-weight-bold text-grey-8 uppercase">TOTAL AKHIR</div>
                    <div class="text-h4 text-weight-bolder text-positive">
                      Rp {{ formatMoney(form.grand_total) }}
                    </div>
                  </div>
                </div>

                <div class="row justify-end q-mt-lg q-gutter-x-sm">
                  <q-btn
                    unelevated
                    label="Batal"
                    color="negative"
                    v-close-popup
                    no-caps
                    class="q-px-lg"
                  />
                  <q-btn
                    unelevated
                    label="Simpan Penawaran"
                    color="positive"
                    @click="simpanPenawaran"
                    no-caps
                    class="q-px-lg"
                  />
                </div>
              </q-card>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const filter = ref('')
const showDialog = ref(false)
const isEditMode = ref(false)

const templateTags = [
  'nomor_penawaran',
  'tanggal_penawaran',
  'nama_proyek',
  'nominal_proyek',
  'lama_proyek',
  'tanggal_mulai_proyek',
  'tanggal_selesai_proyek',
  'nama_kustomer',
  'alamat_kustomer',
]

const formDefault = {
  id: null,
  no_quotation: '',
  tanggal: '2026-04-07',
  proyek: '- Pilih Proyek -',
  konsumen: '- Pilih Kustomer -',
  scope: '',
  // TEMPLATE HTML REFERENSI
  ketentuan: `
    <div style="text-align:center">
      <span style="font-size:16px"><span style="font-family:Times New Roman,Times,serif"><strong>SURAT PENAWARAN HARGA</strong></span></span>
    </div>
    <br />
    <div style="text-align:right">
      <span style="font-size:14px"><span style="font-family:Times New Roman,Times,serif">Bandung, {tanggal_penawaran}</span></span>
    </div>
    <table border="0" cellpadding="1" cellspacing="1" style="width:100%">
      <tbody>
        <tr>
          <td style="width:15%"><span style="font-size:14px"><span style="font-family:Times New Roman,Times,serif">Nomor</span></span></td>
          <td><span style="font-size:14px"><span style="font-family:Times New Roman,Times,serif">:&nbsp;&nbsp;{nomor_penawaran}</span></span></td>
        </tr>
        <tr>
          <td><span style="font-size:14px"><span style="font-family:Times New Roman,Times,serif">Lampiran</span></span></td>
          <td><span style="font-size:14px"><span style="font-family:Times New Roman,Times,serif">:&nbsp; (1)&nbsp;Rincian Penawaran</span></span></td>
        </tr>
        <tr>
          <td><span style="font-size:14px"><span style="font-family:Times New Roman,Times,serif">Perihal</span></span></td>
          <td><span style="font-size:14px"><span style="font-family:Times New Roman,Times,serif">:&nbsp;&nbsp;{nama_proyek}</span></span></td>
        </tr>
      </tbody>
    </table>
    <br />
    <span style="font-size:14px"><span style="font-family:Times New Roman,Times,serif">Kepada Yth.,<br />
    <strong>{nama_kustomer}</strong><br />
    {alamat_kustomer}<br /><br />
    Dengan hormat,</span></span>
    <div style="text-align:justify">
      <span style="font-size:14px"><span style="font-family:Times New Roman,Times,serif">Sehubungan dengan permintaan penawaran harga untuk&nbsp;{nama_proyek} yang diajukan oleh pihak {nama_kustomer}, bersama ini kami mengajukan surat penawaran harga sebagai berikut: </span></span>
    </div>
    <ol>
      <li style="text-align:justify">
        <span style="font-size:14px"><span style="font-family:Times New Roman,Times,serif">Rincian Harga<br />
        Rincian harga proyek secara detail dilampirkan pada halaman berikutnya dengan total biaya sebesar <strong>Rp. {nominal_proyek}</strong>. </span></span>
      </li>
      <li style="text-align:justify">
        <span style="font-size:14px"><span style="font-family:Times New Roman,Times,serif">Waktu Pelaksanaan Proyek<br />
        Proyek ini akan dilakukan selama {lama_proyek} <em>hari kalender</em> dengan rencana pelaksanaan dimulai tanggal {tanggal_mulai_proyek} hingga {tanggal_selesai_proyek}.</span></span>
      </li>
    </ol>
    <div style="text-align:justify">
      <span style="font-size:14px"><span style="font-family:Times New Roman,Times,serif">Demikian penawaran harga ini kami ajukan. Untuk informasi lebih lanjut, kami siap untuk melakukan pertemuan dan diskusi lebih lanjut. Penawaran ini berlaku selama 30 <em>hari kalender</em> sejak tanggal surat penawaran ini.</span></span>
    </div>
  `,
  catatan: '',
  subtotal: 0,
  disc_persen: 0,
  disc_value: 0,
  ppn_persen: 11,
  ppn_value: 0,
  grand_total: 0,
}

const form = ref({ ...formDefault })

// --- LOGIC CALCULATE ---
const updateSummary = () => {
  const sub = form.value.subtotal || 0
  const dPersen = form.value.disc_persen || 0
  const pPersen = form.value.ppn_persen || 0

  form.value.disc_value = (sub * dPersen) / 100
  const afterDisc = sub - form.value.disc_value
  form.value.ppn_value = (afterDisc * pPersen) / 100
  form.value.grand_total = afterDisc + form.value.ppn_value
}

const formatMoney = (val) => (val || 0).toLocaleString('id-ID')

const insertTag = (tag) => {
  form.value.ketentuan += ` {${tag}} `
}

const openAddDialog = () => {
  isEditMode.value = false
  form.value = JSON.parse(JSON.stringify(formDefault))
  showDialog.value = true
}

const openEditDialog = (row) => {
  isEditMode.value = true
  form.value = JSON.parse(JSON.stringify(row))
  showDialog.value = true
}

const simpanPenawaran = () => {
  if (isEditMode.value) {
    const idx = rows.value.findIndex((r) => r.id === form.value.id)
    if (idx !== -1) rows.value[idx] = { ...form.value }
  } else {
    rows.value.unshift({ ...form.value, id: Date.now() })
  }
  $q.notify({ color: 'positive', message: 'Data Penawaran Berhasil Disimpan', icon: 'check' })
  showDialog.value = false
}

const confirmHapus = (row) => {
  $q.dialog({
    title: 'Hapus Penawaran',
    message: `Yakin ingin menghapus penawaran ${row.no_quotation}?`,
    cancel: true,
  }).onOk(() => {
    rows.value = rows.value.filter((r) => r.id !== row.id)
  })
}

// TABLE COLUMNS
const columns = [
  { name: 'no', align: 'left', label: 'NOMOR', field: 'no_quotation', sortable: true },
  { name: 'konsumen', align: 'left', label: 'KUSTOMER', field: 'konsumen', sortable: true },
  { name: 'proyek', align: 'left', label: 'PROYEK', field: 'proyek' },
  {
    name: 'total',
    align: 'right',
    label: 'TOTAL NILAI',
    field: 'grand_total',
    format: (v) => `Rp ${formatMoney(v)}`,
  },
  { name: 'aksi', align: 'center', label: 'AKSI', field: 'aksi' },
]

const rows = ref([
  {
    id: 1,
    no_quotation: 'QUO-2026-001',
    konsumen: 'Andi Wijaya',
    proyek: 'Agra Town',
    grand_total: 15000000,
    subtotal: 15000000,
    disc_persen: 0,
    ppn_persen: 0,
  },
])
</script>

<style scoped>
.rounded-borders {
  border-radius: 4px;
}
.label-ref {
  font-size: 13px;
  font-weight: 500;
  color: #444;
  margin-bottom: 4px;
}
.uppercase {
  text-transform: uppercase;
}

/* Styling Khusus Editor Agar Mirip Dokumen Formal */
.times-font {
  font-family: 'Times New Roman', Times, serif !important;
  line-height: 1.5;
}
:deep(.q-editor__content) {
  font-family: 'Times New Roman', Times, serif !important;
  font-size: 14px;
}
</style>
