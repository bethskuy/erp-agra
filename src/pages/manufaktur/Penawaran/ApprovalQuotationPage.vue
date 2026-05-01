<template>
  <q-page class="bg-grey-2 q-pa-md q-pa-md-lg font-pro">
    <!-- HEADER SECTION -->
    <div class="row items-center justify-between q-mb-xl animate-fade no-print text-left">
      <div class="col-12 col-md-8">
        <div class="text-h4 text-weight-bolder text-teal-10 leading-tight">
          Otorisasi Penawaran (ACC)
          <span class="text-h5 text-weight-light text-grey-6 block q-mt-xs"
            >Persetujuan & Histori Quotation Manufaktur</span
          >
        </div>
      </div>

      <div class="col-12 col-md-auto q-mt-md q-mt-md-none text-right relative-position">
        <div class="text-caption text-grey-6 q-mb-xs uppercase text-weight-bold">Total Dokumen</div>
        <q-badge color="teal-10" class="q-px-md q-py-xs text-weight-bold shadow-1">
          {{ allRows.length }} Dokumen Terdata
        </q-badge>
      </div>
    </div>

    <!-- TABLE LIST (SEMUA STATUS AGAR TIDAK HILANG) -->
    <q-card flat bordered class="rounded-20 shadow-sm overflow-hidden bg-white no-print">
      <q-table
        :rows="allRows"
        :columns="columns"
        row-key="id"
        flat
        :loading="loading"
        binary-state-sort
        class="approval-table"
      >
        <template v-slot:header="props">
          <q-tr :props="props" class="bg-teal-10 text-white">
            <q-th
              v-for="col in props.cols"
              :key="col.name"
              :props="props"
              class="text-weight-bold uppercase"
            >
              {{ col.label }}
            </q-th>
          </q-tr>
        </template>

        <template v-slot:body="props">
          <q-tr
            :props="props"
            class="hover-bg transition-all cursor-pointer"
            @click="openApproval(props.row)"
          >
            <q-td key="nomor" class="text-weight-bolder text-teal-10">{{ props.row.nomor }}</q-td>
            <q-td key="nama_customer" class="text-weight-bold uppercase">{{
              props.row.nama_customer
            }}</q-td>
            <q-td key="total_harga" class="text-right text-weight-bolder">
              IDR {{ (props.row.total_harga || 0).toLocaleString() }}
            </q-td>
            <q-td key="status" class="text-center">
              <q-chip
                text-color="white"
                size="sm"
                class="text-weight-bold"
                :color="getStatusColor(props.row.status)"
              >
                {{ props.row.status }}
              </q-chip>
            </q-td>
            <q-td key="aksi" class="text-center" @click.stop>
              <!-- DETAIL MATA HANYA DI HALAMAN APPROVAL -->
              <q-btn
                flat
                round
                color="teal-10"
                icon="visibility"
                size="sm"
                @click="openApproval(props.row)"
              >
                <q-tooltip>Lihat Detail & ACC</q-tooltip>
              </q-btn>
            </q-td>
          </q-tr>
        </template>
      </q-table>
    </q-card>

    <!-- DIALOG PREVIEW DESIGN RESMI (image_496e46.png) -->
    <q-dialog v-model="showPreview" maximized transition-show="slide-up">
      <q-card class="column no-wrap bg-grey-4">
        <q-toolbar class="bg-white text-teal-10 q-py-sm shadow-2 shrink no-print">
          <q-btn flat round dense icon="arrow_back" v-close-popup color="grey-7" />
          <q-toolbar-title class="text-weight-bold uppercase">Otorisasi Dokumen</q-toolbar-title>
          <q-space />
          <!-- TOMBOL AKSI HANYA MUNCUL JIKA STATUS MASIH PENDING -->
          <div class="q-gutter-sm" v-if="selectedData?.status === 'Pending'">
            <q-btn
              unelevated
              color="negative"
              icon="close"
              label="REJECT"
              @click="updateStatus(selectedData, 'Rejected')"
              rounded
            />
            <q-btn
              unelevated
              color="positive"
              icon="verified"
              label="ACC SEKARANG"
              @click="updateStatus(selectedData, 'Approved')"
              rounded
            />
          </div>
          <q-btn
            flat
            round
            icon="print"
            color="teal-10"
            @click="printNow"
            v-if="selectedData?.status === 'Approved'"
          />
        </q-toolbar>

        <q-card-section class="col scroll flex flex-center q-pa-md">
          <div
            class="bg-white q-pa-xl shadow-2 relative-position"
            style="width: 210mm; min-height: 297mm; font-size: 13px; color: #333"
            v-if="selectedData"
          >
            <!-- KOP SURAT RESMI -->
            <div class="row items-start q-mb-md text-left no-wrap">
              <div class="col-auto">
                <img src="logo-agra.png" style="height: 65px; object-fit: contain" />
              </div>
              <div class="col q-ml-md">
                <div class="text-h6 text-weight-bolder text-teal-10 uppercase leading-none">
                  {{ selectedData.nama_pt || 'PT AGRA ABHINAYA PERKASA' }}
                </div>
                <div class="text-caption text-grey-8 leading-tight q-mt-xs">
                  Komp. Gading Terrace No. 37, Jatiwaringin, Pondok Gede, <br />
                  Kota Bekasi - Jawa Barat.
                </div>
              </div>
              <div class="col-auto text-right">
                <div class="text-h4 text-weight-thin text-teal-10 tracking-widest uppercase">
                  Quotation
                </div>
              </div>
            </div>

            <q-separator color="teal-10" size="2px" class="q-mb-xl" />

            <!-- CLIENT INFO -->
            <div class="row justify-between q-mb-xl text-left">
              <div class="col-6">
                <div class="text-weight-bold text-teal-10 q-mb-xs uppercase">KEPADA YTH :</div>
                <div class="text-h6 text-weight-bold uppercase leading-none">
                  {{ selectedData.nama_customer }}
                </div>
                <div class="text-grey-7 q-mt-sm">Di Tempat</div>
              </div>
              <div class="col-5">
                <div class="row q-mb-xs">
                  <div class="col-5 text-grey-7">Quot No.</div>
                  <div class="col-7 text-weight-bold text-right">: {{ selectedData.nomor }}</div>
                </div>
                <div class="row">
                  <div class="col-5 text-grey-7">Date</div>
                  <div class="col-7 text-weight-bold text-right">
                    : {{ formatDate(selectedData.tanggal) }}
                  </div>
                </div>
              </div>
            </div>

            <!-- TABEL PEKERJAAN BORDER HIJAU -->
            <div class="q-mb-xl">
              <table style="width: 100%; border-collapse: collapse; border: 1px solid #004d40">
                <thead>
                  <tr class="bg-teal-10 text-white">
                    <th class="q-pa-sm text-center" style="border: 1px solid white" width="40">
                      NO
                    </th>
                    <th class="q-pa-sm text-left" style="border: 1px solid white">
                      DESCRIPTION OF WORKS
                    </th>
                    <th class="q-pa-sm text-center" style="border: 1px solid white" width="60">
                      QTY
                    </th>
                    <th class="q-pa-sm text-center" style="border: 1px solid white" width="60">
                      UNIT
                    </th>
                    <th class="q-pa-sm text-right" style="border: 1px solid white" width="130">
                      UNIT PRICE
                    </th>
                    <th class="q-pa-sm text-right" style="border: 1px solid white" width="130">
                      TOTAL AMOUNT
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(it, i) in selectedData.items" :key="i">
                    <td class="q-pa-sm text-center" style="border: 1px solid #004d40">
                      {{ i + 1 }}
                    </td>
                    <td class="q-pa-sm uppercase text-left" style="border: 1px solid #004d40">
                      {{ it.deskripsi }}
                    </td>
                    <td class="q-pa-sm text-center" style="border: 1px solid #004d40">
                      {{ it.qty }}
                    </td>
                    <td class="q-pa-sm text-center uppercase" style="border: 1px solid #004d40">
                      {{ it.satuan }}
                    </td>
                    <td class="q-pa-sm text-right" style="border: 1px solid #004d40">
                      {{ (it.harga || 0).toLocaleString() }}
                    </td>
                    <td
                      class="q-pa-sm text-right text-weight-bold"
                      style="border: 1px solid #004d40"
                    >
                      {{ (it.total || 0).toLocaleString() }}
                    </td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr class="bg-grey-2">
                    <td
                      colspan="5"
                      class="q-pa-sm text-right text-weight-bold text-teal-10 uppercase"
                    >
                      Subtotal Pekerjaan
                    </td>
                    <td class="q-pa-sm text-right text-weight-bolder text-teal-10">
                      IDR {{ calculateSubtotalPreview.toLocaleString() }}
                    </td>
                  </tr>
                  <tr class="bg-teal-10 text-white">
                    <td colspan="5" class="q-pa-sm text-right text-weight-bolder uppercase">
                      Grand Total Amount
                    </td>
                    <td class="q-pa-sm text-right text-weight-bolder">
                      IDR {{ (selectedData.total_harga || 0).toLocaleString() }}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <!-- FOOTER DOKUMEN -->
            <div class="row q-col-gutter-lg q-mt-md text-left">
              <div class="col-7">
                <div class="text-weight-bold text-teal-10 q-mb-xs uppercase">
                  Syarat & Kondisi Pembayaran :
                </div>
                <div class="text-caption text-grey-9" v-html="selectedData.syarat"></div>
              </div>
              <div class="col-5 text-center">
                <div class="q-mt-sm text-weight-bold uppercase">Hormat Kami,</div>
                <div class="text-weight-bold q-mb-xl uppercase">{{ selectedData.nama_pt }}</div>

                <div class="q-mt-xl">
                  <div
                    class="text-caption text-grey-6 q-mb-xs"
                    v-if="selectedData.status === 'Pending'"
                  >
                    Belum ditandatangani
                  </div>
                  <div class="text-weight-bold text-teal-10 text-h6">
                    <u>{{ selectedData.ttd_nama }}</u>
                  </div>
                  <div class="text-caption text-grey-7">{{ selectedData.ttd_jabatan }}</div>
                </div>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { db } from 'src/boot/firebase'
import {
  collection,
  query,
  onSnapshot,
  doc,
  updateDoc,
  serverTimestamp,
  orderBy,
} from 'firebase/firestore'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const allRows = ref([])
const loading = ref(true)
const showPreview = ref(false)
const selectedData = ref(null)

const columns = [
  { name: 'nomor', align: 'left', label: 'REFERENCE NO', field: 'nomor', sortable: true },
  {
    name: 'nama_customer',
    align: 'left',
    label: 'CLIENT NAME',
    field: 'nama_customer',
    sortable: true,
  },
  {
    name: 'total_harga',
    align: 'right',
    label: 'AMOUNT (IDR)',
    field: 'total_harga',
    sortable: true,
  },
  { name: 'status', align: 'center', label: 'STATUS', field: 'status' },
  { name: 'aksi', align: 'center', label: 'APPROVE / REJECT' },
]

const calculateSubtotalPreview = computed(() => {
  if (!selectedData.value) return 0
  return selectedData.value.items.reduce((acc, it) => acc + (it.total || 0), 0)
})

const updateStatus = (row, status) => {
  $q.dialog({
    title: 'Konfirmasi Otorisasi',
    message: `Lakukan status "${status}" untuk dokumen ini?`,
    cancel: true,
    persistent: true,
    ok: { color: status === 'Approved' ? 'positive' : 'negative', label: 'Ya, Proses' },
  }).onOk(async () => {
    try {
      $q.loading.show()
      await updateDoc(doc(db, 'penawaran_manufaktur', row.id), {
        status: status,
        approvedAt: serverTimestamp(),
      })
      showPreview.value = false
      $q.notify({ type: 'positive', message: `Berhasil di-${status}!` })
    } catch (e) {
      console.error(e)
    } finally {
      $q.loading.hide()
    }
  })
}

const formatDate = (d) => {
  if (!d) return '-'
  return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

const printNow = () => {
  window.print()
}
const openApproval = (row) => {
  selectedData.value = row
  showPreview.value = true
}

// REALTIME LISTENER UNTUK SEMUA DATA (AGAR TIDAK HILANG SAAT ACC)
let unsub = null
onMounted(() => {
  // Query tanpa filter status agar data tetap ada di tabel
  const q = query(collection(db, 'penawaran_manufaktur'), orderBy('updatedAt', 'desc'))
  unsub = onSnapshot(q, (snap) => {
    allRows.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    loading.value = false
  })
})

const getStatusColor = (s) =>
  s === 'Approved' ? 'positive' : s === 'Rejected' ? 'negative' : 'orange-9'
onUnmounted(() => {
  if (unsub) unsub()
})
</script>

<style scoped>
.text-teal-10 {
  color: #004d40;
}
.bg-teal-10 {
  background-color: #004d40 !important;
}
.rounded-20 {
  border-radius: 20px;
}
.font-pro {
  font-family: 'Inter', sans-serif;
}
.hover-bg:hover {
  background-color: rgba(0, 77, 64, 0.03);
}
.leading-none {
  line-height: 1;
}
.tracking-widest {
  letter-spacing: 0.2em;
}
@media print {
  .no-print {
    display: none;
  }
}
</style>
