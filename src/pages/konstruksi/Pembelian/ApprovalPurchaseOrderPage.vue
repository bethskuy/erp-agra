<template>
  <q-page class="bg-blue-grey-1 q-pa-md q-pa-lg-lg font-pro">
    <!-- HEADER SECTION -->
    <div class="row items-center justify-between q-mb-xl animate-fade">
      <div>
        <div class="text-h4 text-weight-bolder text-indigo-10 tracking-tighter">
          Approval Purchase Order
        </div>
        <div class="text-subtitle1 text-grey-7">
          Otorisasi pengadaan material untuk menjaga validitas anggaran proyek.
        </div>
      </div>
      <div class="row items-center q-gutter-x-md">
        <q-badge
          color="orange-1"
          text-color="orange-9"
          class="q-pa-md rounded-12 text-weight-bold shadow-sm border-orange-thin"
        >
          <q-icon name="pending_actions" size="xs" class="q-mr-sm" />
          {{ pendingCount }} DOKUMEN MENUNGGU
        </q-badge>
      </div>
    </div>

    <!-- MAIN LIST TABLE -->
    <q-card flat class="rounded-20 shadow-2 overflow-hidden bg-white">
      <q-card-section class="q-pa-md row items-center justify-between bg-grey-1">
        <div class="text-subtitle1 text-weight-bold text-indigo-10">
          Antrean Persetujuan (Pending)
        </div>
        <div class="row items-center q-gutter-sm">
          <q-input
            v-model="filter"
            outlined
            dense
            rounded
            placeholder="Cari nomor PO..."
            bg-color="white"
            style="width: 250px"
          >
            <template v-slot:prepend><q-icon name="search" color="primary" /></template>
          </q-input>
        </div>
      </q-card-section>

      <q-table
        :rows="rowsPo"
        :columns="colsPo"
        flat
        :filter="filter"
        :loading="loading"
        class="po-approval-table"
        no-data-label="Bagus! Tidak ada antrean PO yang perlu diproses saat ini."
      >
        <template v-slot:body-cell-total="props">
          <q-td :props="props" class="text-right">
            <span class="text-weight-black text-indigo-10"
              >Rp {{ formatMoney(props.row.grand_total) }}</span
            >
          </q-td>
        </template>

        <template v-slot:body-cell-aksi="props">
          <q-td :props="props" auto-width class="text-center">
            <q-btn
              unelevated
              rounded
              color="indigo-10"
              label="Review Dokumen"
              size="sm"
              no-caps
              icon="visibility"
              class="q-px-md shadow-2"
              @click="openReview(props.row)"
            />
          </q-td>
        </template>
      </q-table>
    </q-card>

    <!-- DIALOG REVIEW PO (FULLSCREEN MODE) -->
    <q-dialog
      v-model="dialogReview"
      persistent
      maximized
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card class="bg-grey-2 column no-wrap">
        <!-- Toolbar Header -->
        <q-toolbar class="bg-indigo-10 text-white q-pa-md shadow-5 shrink">
          <q-btn flat round dense icon="arrow_back" v-close-popup class="q-mr-sm" />
          <q-toolbar-title>
            <div class="text-weight-bold">VERIFIKASI PURCHASE ORDER</div>
            <div class="text-caption opacity-70">Dokumen No: {{ selectedPo?.no_po }}</div>
          </q-toolbar-title>
          <q-space />
          <div class="gt-xs q-mr-lg">
            <div class="text-caption text-right opacity-70">Status Saat Ini</div>
            <q-badge color="orange" label="PENDING REVIEW" class="q-px-sm" />
          </div>
          <q-btn flat round dense icon="close" v-close-popup />
        </q-toolbar>

        <!-- Main Content (Scrollable Area) -->
        <q-scroll-area class="col q-pa-md q-pa-lg-xl">
          <div class="row justify-center">
            <div class="col-12 col-xl-10">
              <div class="row q-col-gutter-lg items-stretch">
                <!-- PANEL KIRI: DATA TRANSAKSI -->
                <div class="col-12 col-md-4">
                  <q-card flat bordered class="rounded-20 full-height bg-white shadow-1">
                    <q-card-section class="q-pa-lg">
                      <div class="text-overline text-primary text-bold tracking-widest q-mb-md">
                        Informasi Pemohon
                      </div>

                      <div class="q-gutter-y-lg">
                        <div class="info-box">
                          <div class="text-caption text-grey-7 uppercase font-8 text-bold">
                            Vendor / Supplier
                          </div>
                          <div class="text-h6 text-weight-bolder text-indigo-10">
                            {{ selectedPo?.supplier_nama }}
                          </div>
                        </div>

                        <div class="info-box">
                          <div class="text-caption text-grey-7 uppercase font-8 text-bold">
                            Proyek Tujuan
                          </div>
                          <div class="text-subtitle1 text-weight-bold">
                            {{ selectedPo?.proyek_nama }}
                          </div>
                        </div>

                        <div class="row q-col-gutter-sm">
                          <div class="col-6">
                            <div class="text-caption text-grey-7 uppercase font-8 text-bold">
                              Tgl Pengajuan
                            </div>
                            <div class="text-body2 text-weight-bold">{{ selectedPo?.tanggal }}</div>
                          </div>
                          <div class="col-6">
                            <div class="text-caption text-grey-7 uppercase font-8 text-bold">
                              Diterbitkan Oleh
                            </div>
                            <div class="text-body2 text-weight-bold">
                              {{ selectedPo?.issuer?.nama }}
                            </div>
                          </div>
                        </div>

                        <q-separator class="q-my-md" />

                        <div class="bg-indigo-1 q-pa-md rounded-12 border-indigo-thin">
                          <div
                            class="text-caption text-indigo-10 text-bold uppercase font-8 q-mb-xs"
                          >
                            Nilai Transaksi PO
                          </div>
                          <div class="text-h4 text-weight-black text-indigo-10">
                            Rp {{ formatMoney(selectedPo?.grand_total || 0) }}
                          </div>
                        </div>

                        <div class="q-mt-xl">
                          <div
                            class="text-caption text-weight-bold text-grey-8 q-mb-sm flex items-center"
                          >
                            <q-icon name="comment" color="primary" class="q-mr-xs" />
                            Catatan Approval / Alasan Tolak
                          </div>
                          <q-input
                            v-model="rejectReason"
                            outlined
                            type="textarea"
                            placeholder="Berikan alasan jika dokumen ditolak, atau catatan jika disetujui..."
                            bg-color="grey-1"
                            rows="4"
                            class="custom-textarea"
                          />
                        </div>
                      </div>
                    </q-card-section>
                  </q-card>
                </div>

                <!-- PANEL KANAN: RINCIAN MATERIAL (THE REAL DOCUMENT) -->
                <div class="col-12 col-md-8">
                  <q-card
                    flat
                    bordered
                    class="rounded-20 full-height bg-white shadow-1 overflow-hidden"
                  >
                    <q-toolbar class="bg-grey-1 border-bottom-subtle">
                      <q-icon name="list_alt" color="indigo-10" />
                      <q-toolbar-title class="text-subtitle2 text-weight-bold text-indigo-10">
                        RINCIAN DAFTAR BARANG & JASA
                      </q-toolbar-title>
                    </q-toolbar>

                    <q-card-section class="q-pa-none">
                      <q-markup-table flat separator="cell" class="document-table">
                        <thead>
                          <tr class="bg-blue-grey-0 text-indigo-10">
                            <th width="60">NO</th>
                            <th class="text-left">DESKRIPSI MATERIAL</th>
                            <th width="100">VOLUME</th>
                            <th width="100">UNIT</th>
                            <th width="180">HARGA SATUAN</th>
                            <th width="200" class="text-right">TOTAL HARGA</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-for="(it, idx) in selectedPo?.items" :key="idx" class="hover-row">
                            <td class="text-center text-grey-6 text-bold">{{ idx + 1 }}</td>
                            <td class="text-weight-bold">{{ it.nama_barang }}</td>
                            <td class="text-center text-indigo-10 text-bold">{{ it.qty }}</td>
                            <td class="text-center text-grey-7 uppercase font-8">
                              {{ it.satuan }}
                            </td>
                            <td class="text-right">Rp {{ formatMoney(it.harga) }}</td>
                            <td class="text-right text-weight-black text-indigo-10 bg-indigo-0">
                              Rp {{ formatMoney(it.qty * it.harga) }}
                            </td>
                          </tr>
                        </tbody>
                        <tfoot>
                          <tr class="bg-grey-1">
                            <td colspan="5" class="text-right text-bold uppercase font-10">
                              Subtotal Belanja
                            </td>
                            <td class="text-right text-bold">
                              Rp {{ formatMoney(calculatePureSubtotal()) }}
                            </td>
                          </tr>
                          <tr class="bg-grey-1" v-if="selectedPo?.diskon_p > 0">
                            <td
                              colspan="5"
                              class="text-right text-bold uppercase font-10 text-negative"
                            >
                              Diskon ({{ selectedPo?.diskon_p }}%)
                            </td>
                            <td class="text-right text-negative">
                              - Rp {{ formatMoney(calculateDiskonVal()) }}
                            </td>
                          </tr>
                          <tr class="bg-grey-1" v-if="selectedPo?.pajak_p > 0">
                            <td colspan="5" class="text-right text-bold uppercase font-10">
                              Pajak PPN ({{ selectedPo?.pajak_p }}%)
                            </td>
                            <td class="text-right">Rp {{ formatMoney(calculatePajakVal()) }}</td>
                          </tr>
                          <tr class="bg-indigo-10 text-white">
                            <td
                              colspan="5"
                              class="text-right text-weight-black uppercase tracking-widest"
                            >
                              Grand Total Akhir
                            </td>
                            <td class="text-right text-h5 text-weight-black">
                              Rp {{ formatMoney(selectedPo?.grand_total || 0) }}
                            </td>
                          </tr>
                        </tfoot>
                      </q-markup-table>

                      <div
                        class="q-pa-lg row no-wrap items-center bg-blue-1 text-primary border-top-subtle"
                      >
                        <q-icon name="verified_user" size="md" class="q-mr-md" />
                        <div>
                          <div class="text-weight-bold">Pernyataan Validasi</div>
                          <div class="text-caption">
                            Dengan menyetujui dokumen ini, Anda memberikan otorisasi kepada
                            Departemen Keuangan untuk memproses pembayaran sesuai dengan termin yang
                            berlaku kepada vendor terpilih.
                          </div>
                        </div>
                      </div>
                    </q-card-section>
                  </q-card>
                </div>
              </div>
            </div>
          </div>
        </q-scroll-area>

        <q-separator />

        <!-- Sticky Bottom Actions -->
        <q-card-actions align="right" class="q-pa-lg bg-white shadow-up-5 shrink">
          <q-btn
            flat
            label="Tinjau Nanti"
            color="grey-7"
            v-close-popup
            no-caps
            class="q-px-lg rounded-12"
          />
          <q-btn
            outline
            label="Tolak Pesanan"
            color="negative"
            icon="cancel"
            class="q-px-xl rounded-12"
            no-caps
            :loading="submitting"
            @click="processApproval('Rejected')"
          />
          <q-btn
            unelevated
            label="SETUJUI & TERBITKAN PO"
            color="positive"
            icon="check_circle"
            class="q-px-xl text-weight-black shadow-8 rounded-12"
            no-caps
            :loading="submitting"
            @click="processApproval('Approved')"
          />
        </q-card-actions>
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
  where,
  onSnapshot,
  updateDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'src/stores/auth'

const $q = useQuasar()
const authStore = useAuthStore()
const rowsPo = ref([])
const loading = ref(true)
const dialogReview = ref(false)
const selectedPo = ref(null)
const submitting = ref(false)
const rejectReason = ref('')
const filter = ref('')

let unsubPo = null

const pendingCount = computed(() => rowsPo.value.length)

const listenPendingPo = () => {
  loading.value = true
  const q = query(collection(db, 'purchase_orders'), where('status', '==', 'Pending'))
  unsubPo = onSnapshot(
    q,
    (snap) => {
      rowsPo.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      loading.value = false
    },
    (err) => {
      console.error(err)
      $q.notify({ type: 'negative', message: 'Gagal sinkronisasi Firestore' })
    },
  )
}

const openReview = (po) => {
  selectedPo.value = po
  rejectReason.value = ''
  dialogReview.value = true
}

// LOGIKA KALKULASI DETAIL
const calculatePureSubtotal = () => {
  if (!selectedPo.value) return 0
  return selectedPo.value.items.reduce((sum, it) => sum + (it.qty * it.harga || 0), 0)
}
const calculateDiskonVal = () => {
  const sub = calculatePureSubtotal()
  return sub * (selectedPo.value?.diskon_p / 100 || 0)
}
const calculatePajakVal = () => {
  const subAfterDiskon = calculatePureSubtotal() - calculateDiskonVal()
  return subAfterDiskon * (selectedPo.value?.pajak_p / 100 || 0)
}

const processApproval = async (status) => {
  if (status === 'Rejected' && !rejectReason.value) {
    $q.notify({ type: 'warning', message: 'Harap berikan alasan penolakan untuk arsip log.' })
    return
  }

  $q.dialog({
    title: `<span class="text-indigo-10 text-weight-bold">Konfirmasi Otorisasi</span>`,
    message: `Apakah Anda yakin ingin ${status === 'Approved' ? 'MENYETUJUI' : 'MENOLAK'} dokumen PO ini?`,
    html: true,
    cancel: true,
    persistent: true,
    ok: {
      unelevated: true,
      rounded: true,
      color: status === 'Approved' ? 'positive' : 'negative',
      label: 'Ya, Proses',
    },
  }).onOk(async () => {
    submitting.value = true
    try {
      const poRef = doc(db, 'purchase_orders', selectedPo.value.id)
      await updateDoc(poRef, {
        status: status,
        approvedBy: {
          id: authStore.user?.uid,
          nama: authStore.user?.nama,
          timestamp: serverTimestamp(),
        },
        reject_reason: rejectReason.value || null,
        updatedAt: serverTimestamp(),
      })

      $q.notify({
        color: status === 'Approved' ? 'positive' : 'negative',
        message: `PO Nomor ${selectedPo.value.no_po} telah ${status === 'Approved' ? 'Diterbitkan' : 'Ditolak'}!`,
        icon: status === 'Approved' ? 'check_circle' : 'cancel',
        position: 'top',
      })
      dialogReview.value = false
    } catch (e) {
      $q.notify({ type: 'negative', message: 'Gagal memproses: ' + e.message })
    } finally {
      submitting.value = false
    }
  })
}

const formatMoney = (v) => v.toLocaleString('id-ID')

onMounted(listenPendingPo)
onUnmounted(() => {
  if (unsubPo) unsubPo()
})

const colsPo = [
  { name: 'no_po', align: 'left', label: 'NOMOR PO', field: 'no_po', sortable: true },
  { name: 'proyek', align: 'left', label: 'PROYEK / LOKASI', field: 'proyek_nama' },
  { name: 'supplier', align: 'left', label: 'SUPPLIER', field: 'supplier_nama' },
  { name: 'tanggal', align: 'left', label: 'TGL AJUAN', field: 'tanggal' },
  { name: 'total', align: 'right', label: 'NILAI PO (RP)', field: 'grand_total' },
  { name: 'aksi', align: 'center', label: 'OPSI' },
]
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');

.font-pro {
  font-family: 'Plus Jakarta Sans', sans-serif;
}
.rounded-12 {
  border-radius: 12px;
}
.rounded-16 {
  border-radius: 16px;
}
.rounded-20 {
  border-radius: 20px;
}

/* Table Styling */
.po-approval-table {
  :deep(.q-table__card) {
    border-radius: 0;
    box-shadow: none;
  }
  :deep(thead tr th) {
    background-color: #f8fafd;
    color: #546e7a;
    font-weight: 800;
    font-size: 11px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    padding: 18px;
  }
  :deep(tbody tr td) {
    font-size: 13.5px;
    color: #37474f;
    padding: 12px 18px;
  }
  :deep(tbody tr:hover) {
    background-color: #f1f4f9 !important;
  }
}

/* Document Table inside Dialog */
.document-table {
  :deep(thead tr th) {
    font-weight: 800;
    font-size: 11px;
    padding: 12px;
  }
  :deep(tbody tr td) {
    font-size: 13px;
    padding: 10px;
  }
  :deep(tfoot tr td) {
    padding: 12px;
  }
}

.border-indigo-thin {
  border: 1px solid #e8eaf6;
}
.border-orange-thin {
  border: 1px solid #ffe0b2;
}
.border-bottom-subtle {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}
.border-top-subtle {
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.shrink {
  flex: 0 0 auto;
}
.font-8 {
  font-size: 9px;
}
.bg-indigo-0 {
  background-color: rgba(26, 35, 126, 0.02);
}

.hover-row:hover {
  background-color: #f8faff;
}

.animate-fade {
  animation: fadeIn 0.6s ease-out;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.custom-textarea :deep(.q-field__control) {
  border-radius: 12px;
}
</style>
