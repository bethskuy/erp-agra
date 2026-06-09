<template>
  <q-page class="bg-page q-pa-md font-pro relative-position">
    <div class="page-content-wrapper">
      <!-- ══════════════════════════════════════════════
           HEADER
           ══════════════════════════════════════════════ -->
      <div class="row items-center justify-between q-mb-xl animate-fade no-print">
        <div class="col-12">
          <div class="text-h4 text-weight-bolder text-brand-primary leading-tight">
            Approval Purchase Order
            <span class="text-h5 text-weight-light text-grey-6 block q-mt-xs">
              Otorisasi & Kendali Dokumen PO
            </span>
          </div>
          <div class="text-subtitle1 text-grey-7 q-mt-sm">
            Tinjau, setujui, atau tolak Purchase Order yang telah diajukan oleh tim pengadaan.
          </div>
        </div>
      </div>

      <!-- ══════════════════════════════════════════════
           STATS CARDS
           ══════════════════════════════════════════════ -->
      <div class="q-mb-xl no-print">
        <div class="row q-col-gutter-lg animate-fade">
          <!-- Total PO -->
          <div class="col-6 col-md-3">
            <q-card
              flat
              class="list-card rounded-16 card-brand-gradient text-white transition-all hover-shadow"
            >
              <q-card-section class="q-pa-lg">
                <div class="row items-center no-wrap">
                  <q-avatar
                    color="white"
                    text-color="brand-primary"
                    icon="description"
                    size="44px"
                    class="q-mr-md shadow-sm"
                  />
                  <div>
                    <div class="text-h5 text-weight-black text-white">
                      {{ rows.length }}
                    </div>
                    <div
                      class="text-caption text-weight-bold uppercase tracking-widest"
                      style="color: rgba(255, 255, 255, 0.85)"
                    >
                      TOTAL PO
                    </div>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>

          <!-- Menunggu -->
          <div class="col-6 col-md-3">
            <q-card
              flat
              class="list-card rounded-16 card-orange-gradient text-white transition-all hover-shadow"
            >
              <q-card-section class="q-pa-lg">
                <div class="row items-center no-wrap">
                  <q-avatar
                    color="white"
                    text-color="orange-9"
                    icon="hourglass_empty"
                    size="44px"
                    class="q-mr-md shadow-sm"
                  />
                  <div>
                    <div class="text-h5 text-weight-black text-white">
                      {{ pendingCount }}
                    </div>
                    <div
                      class="text-caption text-weight-bold uppercase tracking-widest"
                      style="color: rgba(255, 255, 255, 0.85)"
                    >
                      MENUNGGU
                    </div>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>

          <!-- Disetujui -->
          <div class="col-6 col-md-3">
            <q-card
              flat
              class="list-card rounded-16 card-green-gradient text-white transition-all hover-shadow"
            >
              <q-card-section class="q-pa-lg">
                <div class="row items-center no-wrap">
                  <q-avatar
                    color="white"
                    text-color="positive"
                    icon="check_circle"
                    size="44px"
                    class="q-mr-md shadow-sm"
                  />
                  <div>
                    <div class="text-h5 text-weight-black text-white">
                      {{ rows.filter((r) => r.status === 'Approved').length }}
                    </div>
                    <div
                      class="text-caption text-weight-bold uppercase tracking-widest"
                      style="color: rgba(255, 255, 255, 0.85)"
                    >
                      DISETUJUI
                    </div>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>

          <!-- Ditolak -->
          <div class="col-6 col-md-3">
            <q-card
              flat
              class="list-card rounded-16 card-red-gradient text-white transition-all hover-shadow"
            >
              <q-card-section class="q-pa-lg">
                <div class="row items-center no-wrap">
                  <q-avatar
                    color="white"
                    text-color="negative"
                    icon="cancel"
                    size="44px"
                    class="q-mr-md shadow-sm"
                  />
                  <div>
                    <div class="text-h5 text-weight-black text-white">
                      {{ rows.filter((r) => r.status === 'Rejected').length }}
                    </div>
                    <div
                      class="text-caption text-weight-bold uppercase tracking-widest"
                      style="color: rgba(255, 255, 255, 0.85)"
                    >
                      DITOLAK
                    </div>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>

      <!-- ══════════════════════════════════════════════
         FILTER & SEARCH BAR
         ══════════════════════════════════════════════ -->
      <q-card flat bordered class="q-mb-xl shadow-1 rounded-20 bg-white no-print border-subtle">
        <q-card-section class="q-py-md">
          <div class="row items-center justify-between q-col-gutter-md">
            <div class="col-12 col-md-5">
              <q-input
                v-model="filter"
                outlined
                dense
                rounded
                placeholder="Cari No. PO, Supplier, atau Proyek..."
                bg-color="white"
                class="search-input"
                color="brand-primary"
              >
                <template v-slot:prepend>
                  <q-icon name="search" color="brand-primary" />
                </template>
                <template v-slot:append v-if="filter">
                  <q-icon name="close" class="cursor-pointer" @click="filter = ''" />
                </template>
              </q-input>
            </div>

            <div
              class="col-12 col-md-auto flex items-center justify-center justify-md-end q-gutter-md"
            >
              <q-btn-toggle
                v-model="filterStatus"
                unelevated
                rounded
                no-caps
                toggle-color="brand-primary"
                color="white"
                text-color="grey-7"
                class="shadow-1 border-subtle"
                :options="[
                  { label: 'Semua', value: 'all' },
                  { label: 'Menunggu', value: 'Submitted' },
                  { label: 'Disetujui', value: 'Approved' },
                  { label: 'Ditolak', value: 'Rejected' },
                ]"
              />
              <q-btn flat round icon="refresh" color="brand-primary" @click="fetchData">
                <q-tooltip>Refresh Data</q-tooltip>
              </q-btn>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- ══════════════════════════════════════════════
         TABLE PO LIST
         ══════════════════════════════════════════════ -->
      <q-card
        flat
        bordered
        class="rounded-20 shadow-sm overflow-hidden bg-white border-subtle no-print"
      >
        <q-table
          :rows="filteredRows"
          :columns="columns"
          row-key="id"
          flat
          :loading="loading"
          :filter="filter"
          binary-state-sort
          class="approval-table"
          :pagination="{ rowsPerPage: 10 }"
        >
          <!-- Header -->
          <template v-slot:header="props">
            <q-tr :props="props" class="bg-brand-primary text-white">
              <q-th
                v-for="col in props.cols"
                :key="col.name"
                :props="props"
                class="text-weight-bold uppercase font-11 tracking-widest"
              >
                {{ col.label }}
              </q-th>
            </q-tr>
          </template>

          <!-- Body -->
          <template v-slot:body="props">
            <q-tr
              :props="props"
              class="hover-bg transition-all cursor-pointer"
              @click="openPreview(props.row)"
            >
              <!-- No PO -->
              <q-td key="nomor" class="text-weight-bolder text-brand-primary">
                {{ props.row.nomor }}
                <div class="text-caption text-grey-5">
                  {{ formatDateIndo(props.row.submitted_at || props.row.createdAt) }}
                </div>
              </q-td>

              <!-- Supplier / Proyek -->
              <q-td key="supplier">
                <div class="text-weight-bold text-blue-grey-9 uppercase">
                  {{ props.row.kepada_yth }}
                </div>
                <div class="text-caption text-grey-6 italic">
                  Proyek: {{ props.row.proyek_nama || '-' }}
                </div>
              </q-td>

              <!-- Pengaju -->
              <q-td key="submitted_by">
                <div class="row items-center no-wrap">
                  <q-avatar
                    size="28px"
                    color="brand-light"
                    text-color="brand-primary"
                    icon="person"
                    class="q-mr-sm"
                  />
                  <div>
                    <div class="text-weight-bold text-blue-grey-8" style="font-size: 12px">
                      {{ props.row.submitted_by || props.row.prepared_by || '-' }}
                    </div>
                    <div class="text-caption text-grey-5">Pengaju</div>
                  </div>
                </div>
              </q-td>

              <!-- Grand Total -->
              <q-td key="grand_total" class="text-right text-weight-bolder">
                <span class="text-caption text-grey-6 q-mr-xs">IDR</span>
                {{ (props.row.grand_total || 0).toLocaleString('id-ID') }}
              </q-td>

              <!-- Status -->
              <q-td key="status" class="text-center">
                <q-chip
                  text-color="white"
                  size="sm"
                  class="text-weight-bold shadow-sm"
                  :color="getStatusColor(props.row.status)"
                  :icon="getStatusIcon(props.row.status)"
                >
                  {{ getStatusLabel(props.row.status) }}
                </q-chip>
                <div
                  v-if="props.row.status === 'Rejected' && props.row.alasan_reject"
                  class="text-negative text-caption q-mt-xs"
                  style="font-size: 10px; max-width: 160px"
                >
                  {{ props.row.alasan_reject }}
                </div>
              </q-td>

              <!-- Aksi -->
              <q-td key="aksi" class="text-center" @click.stop>
                <div class="row justify-center items-center q-gutter-sm no-wrap">
                  <!-- Lihat Detail -->
                  <q-btn
                    flat
                    round
                    color="brand-primary"
                    icon="visibility"
                    size="sm"
                    @click="openPreview(props.row)"
                    class="hover-blue-btn"
                  >
                    <q-tooltip>Lihat Detail PO</q-tooltip>
                  </q-btn>

                  <!-- Approve (hanya jika status Submitted) -->
                  <q-btn
                    v-if="props.row.status === 'Submitted' && canAction('approve')"
                    unelevated
                    rounded
                    color="positive"
                    icon="check_circle"
                    :label="$q.screen.lt.sm ? '' : 'Approve'"
                    size="sm"
                    no-caps
                    class="q-px-sm text-weight-bold"
                    @click="handleApproval(props.row, 'Approved')"
                  >
                    <q-tooltip>Setujui PO</q-tooltip>
                  </q-btn>

                  <!-- Reject (hanya jika status Submitted) -->
                  <q-btn
                    v-if="props.row.status === 'Submitted' && canAction('approve')"
                    outline
                    rounded
                    color="negative"
                    icon="cancel"
                    :label="$q.screen.lt.sm ? '' : 'Tolak'"
                    size="sm"
                    no-caps
                    class="q-px-sm text-weight-bold"
                    @click="promptReject(props.row)"
                  >
                    <q-tooltip>Tolak PO</q-tooltip>
                  </q-btn>
                </div>
              </q-td>
            </q-tr>
          </template>

          <!-- Empty State -->
          <template v-slot:no-data>
            <div class="full-width row flex-center q-pa-xl text-grey-5">
              <div class="text-center">
                <q-icon name="inbox" size="64px" class="q-mb-md opacity-50" color="brand-primary" />
                <div class="text-h6 text-weight-bold text-brand-primary">Tidak Ada Data PO</div>
                <div class="text-subtitle2 q-mt-xs text-grey-6">
                  {{
                    filterStatus !== 'all'
                      ? 'Tidak ada PO dengan status ini.'
                      : 'Belum ada Purchase Order yang diajukan.'
                  }}
                </div>
              </div>
            </div>
          </template>

          <!-- Loading -->
          <template v-slot:loading>
            <q-inner-loading showing color="brand-primary" />
          </template>
        </q-table>
      </q-card>
    </div>

    <!-- ══════════════════════════════════════════════
         DIALOG: PREVIEW DETAIL PO + APPROVAL ACTION (CETAK DIHAPUS, STATUS NAVBAR DIHAPUS)
         ══════════════════════════════════════════════ -->
    <q-dialog v-model="showPreview" maximized transition-show="fade" transition-hide="fade">
      <q-card class="column no-wrap bg-grey-4 font-pro">
        <!-- Toolbar Preview (Tombol Cetak dan Status Badge Dihapus) -->
        <q-toolbar
          class="bg-white text-indigo-10 q-py-sm no-print shadow-2 shrink"
          style="position: sticky; top: 0; z-index: 10; width: 100%"
        >
          <q-btn flat round dense icon="arrow_back" v-close-popup color="indigo-10" />
          <q-toolbar-title class="text-weight-bold uppercase tracking-widest font-11 ellipsis">
            DETAIL PURCHASE ORDER
          </q-toolbar-title>
          <q-space />

          <!-- Action buttons di toolbar (hanya jika Submitted) -->
          <template v-if="selectedPo?.status === 'Submitted' && canAction('approve')">
            <q-btn
              unelevated
              rounded
              color="positive"
              icon="check_circle"
              :label="$q.screen.lt.sm ? 'Approve' : 'APPROVE'"
              :dense="$q.screen.lt.sm"
              class="text-weight-bold q-px-md q-px-sm-lg q-mr-xs q-mr-sm-sm shadow-3"
              @click="handleApproval(selectedPo, 'Approved')"
            />
            <q-btn
              outline
              rounded
              color="negative"
              icon="cancel"
              :label="$q.screen.lt.sm ? 'Tolak' : 'TOLAK'"
              :dense="$q.screen.lt.sm"
              class="text-weight-bold q-px-md q-px-sm-lg q-mr-xs q-mr-sm-md"
              @click="promptReject(selectedPo)"
            />
          </template>

          <q-btn
            color="red-9"
            icon="picture_as_pdf"
            :label="$q.screen.lt.sm ? '' : 'PDF'"
            :dense="$q.screen.lt.sm"
            @click="exportToPDF"
            unelevated
            rounded
            class="q-px-md q-px-sm-lg text-weight-bold"
          />
        </q-toolbar>

        <!-- Preview Content -->
        <q-card-section class="col scroll q-pa-md q-pa-md-xl flex flex-center preview-container">
          <div id="po-approval-print-area" class="letter-paper shadow-24" v-if="selectedPo">
            <div class="row no-wrap items-center">
              <div class="col-auto q-mr-md" v-if="selectedPo.logoUrl || 'icons/logo-agra.png'">
                <img :src="selectedPo.logoUrl || 'icons/logo-agra.png'" class="final-kop-img" />
              </div>
              <div class="col text-left">
                <div class="final-pt-name uppercase">
                  {{ selectedPo.nama_pt || 'PT AGRA ABHINAYA PERKASA' }}
                </div>
                <div class="final-pt-tagline italic text-grey-8">
                  {{ selectedPo.slogan_pt || 'General Construction and General Supply' }}
                </div>
              </div>
            </div>

            <div class="final-divider"></div>

            <div class="row q-mt-md q-mb-lg text-left text-body2 items-start">
              <div class="col-7">
                <table class="meta-info-table">
                  <tr>
                    <td class="text-bold label-meta">Kepada Yth</td>
                    <td class="meta-separator">:</td>
                    <td class="text-weight-bold text-indigo-10 uppercase">
                      {{ selectedPo.kepada_yth }}
                    </td>
                  </tr>
                  <tr>
                    <td class="text-bold label-meta">Address</td>
                    <td class="meta-separator">:</td>
                    <td class="text-weight-medium">
                      {{ selectedPo.alamat_supplier || '-' }}
                    </td>
                  </tr>
                  <tr>
                    <td class="text-bold label-meta">Attn</td>
                    <td class="meta-separator">:</td>
                    <td class="text-weight-bold">
                      {{ selectedPo.attn_supplier || '-' }}
                    </td>
                  </tr>
                </table>
              </div>
              <div class="col-5 flex justify-end text-right">
                <div style="width: fit-content; text-align: right">
                  <div class="quotation-title-pro uppercase font-13 text-indigo-10 q-mb-sm">
                    PURCHASE ORDER
                  </div>
                  <table class="meta-info-table text-left" style="width: auto; margin-left: auto">
                    <tr>
                      <td
                        class="text-bold"
                        style="padding-right: 8px; font-size: 12px; color: #1a237e"
                      >
                        No. PO
                      </td>
                      <td style="padding-right: 8px; font-size: 12px; color: #1a237e">:</td>
                      <td
                        class="text-weight-bolder text-indigo-10 font-mono"
                        style="font-size: 12px"
                      >
                        {{ selectedPo.nomor }}
                      </td>
                    </tr>
                    <tr>
                      <td class="text-bold" style="padding-right: 8px">Tanggal</td>
                      <td style="padding-right: 8px">:</td>
                      <td class="text-weight-bold">{{ formatDateIndo(selectedPo.tanggal) }}</td>
                    </tr>
                    <tr v-if="selectedPo.no_spk">
                      <td class="text-bold" style="padding-right: 8px">No. SPK</td>
                      <td style="padding-right: 8px">:</td>
                      <td class="text-weight-bold">{{ selectedPo.no_spk }}</td>
                    </tr>
                  </table>
                </div>
              </div>
            </div>

            <table class="final-pro-table full-width">
              <thead>
                <tr>
                  <th width="5%">NO</th>
                  <th class="text-left" width="45%">ITEM DESCRIPTION</th>
                  <th width="10%">QTY</th>
                  <th width="10%">SATUAN</th>
                  <th class="text-right" width="15%">UNIT PRICE</th>
                  <th class="text-right" width="15%">AMOUNT</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, i) in selectedPo.items" :key="i">
                  <td class="text-center font-bold text-grey-8">{{ i + 1 }}</td>
                  <td class="text-left text-weight-bold uppercase">
                    {{ item.nama_barang }}
                    <div
                      v-if="item.desc"
                      class="text-caption text-weight-regular text-grey-6 italic lowercase"
                    >
                      {{ item.desc }}
                    </div>
                  </td>
                  <td class="text-center font-bold">{{ item.qty }}</td>
                  <td class="text-center uppercase text-weight-bold">{{ item.satuan }}</td>
                  <td class="text-right">Rp {{ (item.harga_satuan || 0).toLocaleString() }}</td>
                  <td class="text-right text-weight-bolder text-indigo-10">
                    Rp {{ ((item.qty || 0) * (item.harga_satuan || 0)).toLocaleString() }}
                  </td>
                </tr>
                <tr v-if="!selectedPo.items || selectedPo.items.length === 0">
                  <td colspan="6" class="text-center text-grey-5 italic q-pa-lg">Tidak ada item</td>
                </tr>
              </tbody>
              <tfoot>
                <tr class="row-calculation">
                  <td colspan="5" class="text-right text-bold uppercase">Subtotal Amount</td>
                  <td class="text-right text-bold text-indigo-10">
                    IDR {{ (selectedPo.total_amount || 0).toLocaleString() }}
                  </td>
                </tr>
                <tr class="row-calculation" v-if="selectedPo.mobdemob">
                  <td colspan="5" class="text-right text-bold uppercase">Mobdemob / Lainnya</td>
                  <td class="text-right text-bold text-indigo-10">
                    IDR {{ (selectedPo.mobdemob || 0).toLocaleString() }}
                  </td>
                </tr>
                <tr class="row-grand-total">
                  <td
                    colspan="5"
                    class="text-right text-weight-bolder uppercase tracking-widest"
                    style="font-size: 13px"
                  >
                    GRAND TOTAL AMOUNT
                  </td>
                  <td class="text-right text-white text-weight-bolder" style="font-size: 13px">
                    IDR {{ (selectedPo.grand_total || 0).toLocaleString() }}
                  </td>
                </tr>
              </tfoot>
            </table>

            <div class="terms-container text-left q-mt-md" v-if="selectedPo.syarat_kondisi">
              <div class="terms-header uppercase">Syarat & Kondisi</div>
              <div
                class="terms-content-box leading-relaxed"
                v-html="selectedPo.syarat_kondisi"
              ></div>
            </div>

            <div class="terms-container text-left q-mt-sm" v-if="selectedPo.sistem_pembayaran">
              <div class="terms-header uppercase">Sistem Pembayaran</div>
              <div
                class="terms-content-box leading-relaxed"
                v-html="selectedPo.sistem_pembayaran"
              ></div>
            </div>

            <div class="text-closing-final q-mt-md q-mb-md text-left" v-if="selectedPo.closing">
              {{ selectedPo.closing }}
            </div>

            <!-- ALASAN REJECT -->
            <div
              v-if="selectedPo.status === 'Rejected' && selectedPo.alasan_reject"
              class="terms-container text-left q-mt-md"
              style="border-color: #b71c1c !important"
            >
              <div class="terms-header uppercase" style="background: #b71c1c !important">
                Alasan Penolakan
              </div>
              <div
                class="terms-content-box leading-relaxed text-red-9"
                style="color: #b71c1c !important; font-weight: bold"
              >
                {{ selectedPo.alasan_reject }}
              </div>
            </div>

            <div class="signature-container text-left q-mt-lg">
              <div class="row justify-between text-center po-signature">
                <div class="col-3">
                  <div class="q-mb-xs text-body2 uppercase tracking-widest text-bold">
                    Request By,
                  </div>
                  <div class="final-sign-space flex flex-center" style="height: 60px">
                    <!-- Spacer for signature -->
                  </div>
                  <div class="signer-name-wrapper">
                    <div class="text-signer-final text-weight-black uppercase text-indigo-10">
                      {{ selectedPo.requested_by || '..............................' }}
                    </div>
                  </div>
                  <div
                    class="text-role-final uppercase text-grey-8 text-caption font-bold block q-mt-xs"
                  >
                    Requestor
                  </div>
                </div>

                <div class="col-3">
                  <div class="q-mb-xs text-body2 uppercase tracking-widest text-bold">
                    Checked By,
                  </div>
                  <div class="final-sign-space flex flex-center" style="height: 60px">
                    <!-- Spacer for signature -->
                  </div>
                  <div class="signer-name-wrapper">
                    <div class="text-signer-final text-weight-black uppercase text-indigo-10">
                      {{ selectedPo.checked_by || '..............................' }}
                    </div>
                  </div>
                  <div
                    class="text-role-final uppercase text-grey-8 text-caption font-bold block q-mt-xs"
                  >
                    Project Manager
                  </div>
                </div>

                <div class="col-3">
                  <div class="q-mb-xs text-body2 uppercase tracking-widest text-bold">
                    Approved By,
                  </div>
                  <div class="final-sign-space flex flex-center" style="height: 60px">
                    <!-- Spacer for signature or checkmark -->
                    <div
                      v-if="selectedPo.status === 'Approved' && selectedPo.approved_by_nama"
                      class="text-positive text-weight-bold"
                      style="font-size: 11px"
                    >
                      ✓ {{ selectedPo.approved_by_nama }}
                    </div>
                  </div>
                  <div class="signer-name-wrapper">
                    <div class="text-signer-final text-weight-black uppercase text-indigo-10">
                      {{ selectedPo.approved_by || '..............................' }}
                    </div>
                  </div>
                  <div
                    class="text-role-final uppercase text-grey-8 text-caption font-bold block q-mt-xs"
                  >
                    Direktur
                  </div>
                </div>

                <div class="col-3">
                  <div class="q-mb-xs text-body2 uppercase tracking-widest text-bold">
                    Accepted By,
                  </div>
                  <div class="final-sign-space flex flex-center" style="height: 60px">
                    <!-- Spacer for signature supplier -->
                  </div>
                  <div class="signer-name-wrapper">
                    <div class="text-signer-final text-weight-black uppercase text-indigo-10">
                      {{
                        selectedPo.approved_supplier ||
                        selectedPo.kepada_yth ||
                        '..............................'
                      }}
                    </div>
                  </div>
                  <div
                    class="text-role-final uppercase text-grey-8 text-caption font-bold block q-mt-xs"
                  >
                    Supplier
                  </div>
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { db } from 'src/boot/firebase'
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  serverTimestamp,
  query,
  where,
} from 'firebase/firestore'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'src/stores/auth'
import html2pdf from 'html2pdf.js'

// ── Init ──────────────────────────────────────────────────────────────────
const $q = useQuasar()
const authStore = useAuthStore()

const rows = ref([])
const loading = ref(true)
const filter = ref('')
const filterStatus = ref('all')
const showPreview = ref(false)
const selectedPo = ref(null)
const userData = ref(null)

let unsubRows = null
let unsubUser = null

// ── Columns ───────────────────────────────────────────────────────────────
const columns = [
  { name: 'nomor', align: 'left', label: 'NO. PO', field: 'nomor', sortable: true },
  {
    name: 'supplier',
    align: 'left',
    label: 'SUPPLIER / PROYEK',
    field: 'kepada_yth',
    sortable: true,
  },
  { name: 'submitted_by', align: 'left', label: 'PENGAJU', field: 'submitted_by', sortable: true },
  {
    name: 'grand_total',
    align: 'right',
    label: 'GRAND TOTAL (IDR)',
    field: 'grand_total',
    sortable: true,
  },
  { name: 'status', align: 'center', label: 'STATUS', field: 'status', sortable: true },
  { name: 'aksi', align: 'center', label: 'AKSI' },
]

// ── Permission check ──────────────────────────────────────────────────────
const canAction = (actionType) => {
  if (authStore.user?.role === 'Super Admin') return true
  if (!userData.value?.permissions_detail) return false
  const modulePerm = userData.value.permissions_detail.find((m) => m.id === 'konstruksi')
  const menu = modulePerm?.menus.find((m) => m.id === '_konstruksi_pembelian_pesanan')
  return menu ? menu[actionType] || false : false
}

// ── Computed ─────────────────────────────────────────────────────────────
const filteredRows = computed(() => {
  if (filterStatus.value === 'all') return rows.value
  return rows.value.filter((r) => r.status === filterStatus.value)
})

const pendingCount = computed(() => rows.value.filter((r) => r.status === 'Submitted').length)

// eslint-disable-next-line no-unused-vars
const stats = computed(() => [
  {
    label: 'Total PO',
    value: rows.value.length,
    icon: 'description',
    gradientClass: 'card-brand-gradient',
  },
  {
    label: 'Menunggu',
    value: rows.value.filter((r) => r.status === 'Submitted').length,
    icon: 'hourglass_empty',
    gradientClass: 'card-orange-gradient',
  },
  {
    label: 'Disetujui',
    value: rows.value.filter((r) => r.status === 'Approved').length,
    icon: 'check_circle',
    gradientClass: 'card-green-gradient',
  },
  {
    label: 'Ditolak',
    value: rows.value.filter((r) => r.status === 'Rejected').length,
    icon: 'cancel',
    gradientClass: 'card-red-gradient',
  },
])

// ── Helpers ───────────────────────────────────────────────────────────────
const getStatusColor = (s) =>
  s === 'Approved'
    ? 'positive'
    : s === 'Rejected'
      ? 'negative'
      : s === 'Submitted'
        ? 'orange-9'
        : s === 'Ordered'
          ? 'brand-primary'
          : 'blue-grey-6'

const getStatusIcon = (s) =>
  s === 'Approved'
    ? 'check_circle'
    : s === 'Rejected'
      ? 'cancel'
      : s === 'Submitted'
        ? 'hourglass_empty'
        : s === 'Ordered'
          ? 'local_shipping'
          : 'help_outline'

const getStatusLabel = (s) =>
  s === 'Approved'
    ? 'Disetujui'
    : s === 'Rejected'
      ? 'Ditolak'
      : s === 'Submitted'
        ? 'Menunggu'
        : s === 'Ordered'
          ? 'Dipesan'
          : s || 'Draft'

const formatDateIndo = (d) => {
  if (!d) return '-'
  const dateObj = d?.toDate ? d.toDate() : new Date(d)
  if (isNaN(dateObj)) return '-'
  return dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

// ── Fetch Data ────────────────────────────────────────────────────────────
const fetchData = () => {
  loading.value = true
  if (unsubRows) unsubRows()
  unsubRows = onSnapshot(collection(db, 'purchase_order'), (snap) => {
    rows.value = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
    loading.value = false
  })
}

// ── Open Preview ──────────────────────────────────────────────────────────
const openPreview = (row) => {
  selectedPo.value = row
  showPreview.value = true
}

// ── Approval Handler ──────────────────────────────────────────────────────
const handleApproval = (row, status, alasan = null) => {
  const isApprove = status === 'Approved'

  $q.dialog({
    title: isApprove ? 'Setujui Purchase Order?' : 'Tolak Purchase Order?',
    message: isApprove
      ? `PO <b>${row.nomor}</b> akan disetujui and supplier <b>${row.kepada_yth}</b> dapat dihubungi. Lanjutkan?`
      : `PO <b>${row.nomor}</b> akan ditolak dengan alasan yang diberikan.`,
    html: true,
    cancel: { flat: true, label: 'Batal', color: 'grey-7' },
    ok: {
      unelevated: true,
      rounded: true,
      label: isApprove ? 'Ya, Setujui' : 'Ya, Tolak',
      color: isApprove ? 'positive' : 'negative',
      class: 'text-weight-bold',
    },
  }).onOk(async () => {
    $q.loading.show({ message: isApprove ? 'Menyetujui PO...' : 'Menolak PO...' })
    try {
      const payload = {
        status,
        updatedAt: serverTimestamp(),
        approved_by_nama: userData.value?.nama || authStore.user?.email || 'Admin',
        approved_by_jabatan: userData.value?.jabatan || '',
      }

      if (isApprove) {
        payload.approved_at = serverTimestamp()
      } else {
        payload.rejected_at = serverTimestamp()
        if (alasan) payload.alasan_reject = alasan
      }

      await updateDoc(doc(db, 'purchase_order', row.id), payload)

      if (selectedPo.value?.id === row.id) {
        selectedPo.value = { ...selectedPo.value, ...payload, status }
      }

      $q.notify({
        type: isApprove ? 'positive' : 'negative',
        message: isApprove
          ? `PO ${row.nomor} berhasil disetujui!`
          : `PO ${row.nomor} telah ditolak.`,
        position: 'top',
        timeout: 3500,
        icon: isApprove ? 'check_circle' : 'cancel',
      })
    } catch (e) {
      console.error(e)
      $q.notify({ type: 'negative', message: 'Gagal memproses: ' + e.message })
    } finally {
      $q.loading.hide()
    }
  })
}

// ── Reject Prompt ─────────────────────────────────────────────────────────
const promptReject = (row) => {
  $q.dialog({
    title: 'Alasan Penolakan PO',
    message: 'Berikan alasan penolakan Purchase Order ini:',
    prompt: {
      model: '',
      type: 'textarea',
      outlined: true,
      color: 'negative',
      placeholder: 'Contoh: Harga tidak sesuai RAB, supplier tidak terdaftar, dll...',
    },
    cancel: { flat: true, label: 'Batal', color: 'grey-7' },
    ok: {
      unelevated: true,
      rounded: true,
      label: 'Tolak PO',
      color: 'negative',
      class: 'text-weight-bold',
    },
  }).onOk((alasan) => {
    if (!alasan || !alasan.trim()) {
      $q.notify({ type: 'warning', message: 'Alasan penolakan wajib diisi!', position: 'top' })
      return
    }
    handleApproval(row, 'Rejected', alasan.trim())
  })
}

// ── Print & PDF ───────────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
const printPage = () => window.print()

const exportToPDF = () => {
  if (!selectedPo.value) return
  $q.loading.show({ message: 'Membuat PDF...' })
  setTimeout(() => {
    const e = document.getElementById('po-approval-print-area')
    if (!e) {
      $q.loading.hide()
      return
    }

    const hadShadow = e.classList.contains('shadow-24')
    if (hadShadow) e.classList.remove('shadow-24')

    const originalStyle = e.getAttribute('style') || ''
    e.style.minHeight = 'auto'
    e.style.boxShadow = 'none'

    const currentHeight = e.scrollHeight
    const currentWidth = e.scrollWidth
    const targetHeight = currentWidth * 1.414 - 20 // A4 Aspect Ratio with safe margin to prevent blank page overflow

    if (currentHeight > targetHeight) {
      const scaleFactor = targetHeight / currentHeight
      e.style.transform = `scale(${scaleFactor})`
      e.style.transformOrigin = 'top center'
      e.style.width = `${currentWidth}px`
      e.style.height = `${currentHeight}px`

      const wrapper = document.createElement('div')
      wrapper.style.width = `${currentWidth}px`
      wrapper.style.height = `${targetHeight}px`
      wrapper.style.overflow = 'hidden'
      wrapper.style.position = 'relative'

      e.parentNode.insertBefore(wrapper, e)
      wrapper.appendChild(e)

      const opt = {
        margin: 0,
        filename: `PO_${(selectedPo.value.nomor || 'PO').replace(/\//g, '-')}.pdf`,
        image: { type: 'jpeg', quality: 1 },
        html2canvas: { scale: 3, useCORS: true, letterRendering: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: 'avoid-all' },
      }

      html2pdf()
        .set(opt)
        .from(wrapper)
        .save()
        .then(() => {
          wrapper.parentNode.insertBefore(e, wrapper)
          wrapper.parentNode.removeChild(wrapper)
          e.setAttribute('style', originalStyle)
          if (hadShadow) e.classList.add('shadow-24')
          $q.loading.hide()
          $q.notify({ type: 'positive', message: 'PDF berhasil diunduh!', position: 'top' })
        })
        .catch(() => {
          wrapper.parentNode.insertBefore(e, wrapper)
          wrapper.parentNode.removeChild(wrapper)
          e.setAttribute('style', originalStyle)
          if (hadShadow) e.classList.add('shadow-24')
          $q.loading.hide()
        })
    } else {
      const opt = {
        margin: 0,
        filename: `PO_${(selectedPo.value.nomor || 'PO').replace(/\//g, '-')}.pdf`,
        image: { type: 'jpeg', quality: 1 },
        html2canvas: { scale: 3, useCORS: true, letterRendering: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: 'avoid-all' },
      }
      html2pdf()
        .set(opt)
        .from(e)
        .save()
        .then(() => {
          e.setAttribute('style', originalStyle)
          if (hadShadow) e.classList.add('shadow-24')
          $q.loading.hide()
          $q.notify({ type: 'positive', message: 'PDF berhasil diunduh!', position: 'top' })
        })
        .catch(() => {
          e.setAttribute('style', originalStyle)
          if (hadShadow) e.classList.add('shadow-24')
          $q.loading.hide()
        })
    }
  }, 400)
}

// ── Lifecycle ─────────────────────────────────────────────────────────────
onMounted(() => {
  fetchData()
  const email = authStore.user?.email
  if (email) {
    const q = query(collection(db, 'karyawan'), where('email', '==', email))
    unsubUser = onSnapshot(q, (s) => {
      if (!s.empty) userData.value = s.docs[0].data()
    })
  }
})

onUnmounted(() => {
  if (unsubRows) unsubRows()
  if (unsubUser) unsubUser()
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&display=swap');

.font-pro {
  font-family:
    'Inter',
    -apple-system,
    sans-serif;
}
.rounded-20 {
  border-radius: 20px;
}
.rounded-16 {
  border-radius: 16px;
}
.rounded-12 {
  border-radius: 12px;
}
.uppercase {
  text-transform: uppercase;
}
.font-10 {
  font-size: 10px;
}
.font-11 {
  font-size: 11px;
}
.font-bold {
  font-weight: bold;
}
.tracking-widest {
  letter-spacing: 0.12em;
}
.leading-tight {
  line-height: 1.2;
}
.opacity-50 {
  opacity: 0.5;
}
.shadow-premium {
  box-shadow: 0 10px 30px rgba(54, 173, 163, 0.2) !important;
}

/* ===== BRAND COLOR PALETTE ===== */

.bg-brand-primary {
  background-color: #36ada3 !important;
}
.bg-brand-light {
  background-color: #e0f5f4 !important;
}
.bg-brand-danger {
  background-color: #ad3640 !important;
}
.text-brand-primary {
  color: #36ada3 !important;
}
.text-brand-teal {
  color: #36ada3 !important;
}
.text-brand-danger {
  color: #ad3640 !important;
}
.bg-page {
  background-color: #f0fafa !important;
}

.border-subtle {
  border: 1px solid rgba(0, 0, 0, 0.05) !important;
}
.border-bottom-subtle {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05) !important;
}
.page-content-wrapper {
  padding: 0 16px;
}
@media (min-width: 768px) {
  .page-content-wrapper {
    padding: 0 24px;
  }
}

.hover-blue-btn:hover {
  background-color: #e0f5f4 !important;
  color: #1e6e69 !important;
}
.btn-hover:hover {
  filter: brightness(1.1);
  transform: scale(1.02);
  transition: 0.3s;
}

/* ── Stat cards ── */
.card-brand-gradient {
  background: linear-gradient(135deg, #36ada3 0%, #1e6e69 100%) !important;
  box-shadow: 0 8px 24px rgba(54, 173, 163, 0.35) !important;
}
.card-blue-gradient {
  background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%) !important;
  box-shadow: 0 8px 24px rgba(3, 105, 161, 0.35) !important;
}
.card-green-gradient {
  background: linear-gradient(135deg, #10b981 0%, #047857 100%) !important;
  box-shadow: 0 8px 24px rgba(4, 120, 87, 0.35) !important;
}
.card-orange-gradient {
  background: linear-gradient(135deg, #f59e0b 0%, #ff781e 100%) !important;
  box-shadow: 0 8px 24px rgba(245, 158, 11, 0.35) !important;
}
.card-red-gradient {
  background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%) !important;
  box-shadow: 0 8px 24px rgba(239, 68, 68, 0.35) !important;
}

.list-card {
  border: 1px solid rgba(255, 255, 255, 0.12);
  transition: all 0.3s ease;
}
.list-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2) !important;
}

/* ── Table ── */
.approval-table :deep(thead tr th) {
  position: sticky;
  top: 0;
  z-index: 1;
  font-weight: 800;
  font-size: 11px;
  letter-spacing: 0.5px;
  padding: 16px;
}
.approval-table :deep(tbody tr td) {
  padding: 12px 16px;
}

.hover-bg:hover {
  background-color: rgba(54, 173, 163, 0.06) !important;
}
.transition-all {
  transition: all 0.25s ease;
}

/* ── Animations ── */
.animate-fade {
  animation: fadeIn 0.5s ease-out;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ════════════════════════════════════════════════
   PO PREVIEW STYLES (MATCHING PESANANPEMBELIANPAGE.VUE)
 ════════════════════════════════════════════════ */
.letter-paper {
  background: white;
  width: 210mm;
  min-width: 210mm;
  flex-shrink: 0;
  min-height: 296mm;
  padding: 15mm 20mm;
  margin: 0 auto;
  color: #1a1a1a;
  line-height: 1.5;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}
.preview-container {
  width: 100%;
  overflow-x: auto !important;
  -webkit-overflow-scrolling: touch;
  display: flex !important;
  justify-content: flex-start !important;
}
.final-kop-img {
  height: 75px;
  width: auto;
  object-fit: contain;
}
.final-pt-name {
  font-size: 24px;
  font-weight: 900;
  color: #1a237e;
  letter-spacing: -1px;
  line-height: 1;
}
.final-pt-tagline {
  font-size: 10px;
  color: #555;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  margin-top: 2px;
}
.final-divider {
  height: 4px;
  background: #1a237e;
  margin-top: 15px;
  border-bottom: 1px solid #1a237e;
}
.quotation-title-pro {
  font-size: 20px;
  font-weight: 900;
  color: #1a237e;
  letter-spacing: 2px;
  border-bottom: 2px solid #f0f0f0;
  display: inline-block;
  padding-bottom: 2px;
}
.meta-info-table {
  border-collapse: collapse;
  width: 100%;
}
.meta-info-table td {
  padding: 3px 0;
  font-size: 12px;
  vertical-align: top;
}
.label-meta {
  width: 125px;
  color: #555;
}
.meta-separator {
  width: 15px;
  text-align: center;
}

.final-pro-table {
  border-collapse: collapse;
  width: 100%;
  margin-top: 10px;
  border: 1px solid #1a237e;
}
.final-pro-table th {
  background: #1a237e !important;
  color: white !important;
  font-size: 11px;
  font-weight: 800;
  padding: 10px 8px;
  border: 1px solid #1a237e;
  text-transform: uppercase;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
.final-pro-table td {
  padding: 8px;
  font-size: 11px;
  border: 1px solid #ccc;
  color: #000 !important;
}
.row-calculation {
  background: #f9fafb !important;
}
.row-calculation td {
  padding: 8px 12px !important;
  border: 1px solid #ccc !important;
  font-size: 11px;
}
.row-grand-total {
  background: #1a237e !important;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
.row-grand-total td {
  padding: 12px !important;
  color: white !important;
  border: 1px solid #1a237e !important;
  background: #1a237e !important;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

.terms-container {
  border: 1.5px solid #1a237e !important;
  margin-top: 20px;
  border-radius: 4px;
  overflow: hidden;
  page-break-inside: avoid;
}
.terms-header {
  background: #1a237e !important;
  padding: 8px 12px;
  font-weight: 900;
  color: white !important;
  font-size: 11px;
  letter-spacing: 1px;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
  text-transform: uppercase;
}
.terms-content-box {
  padding: 10px 12px;
  font-size: 12px;
  color: #000 !important;
}
.terms-content-box p {
  margin: 0 0 5px 0;
  font-size: inherit !important;
  color: inherit !important;
}
.terms-content-box ol,
.terms-content-box ul {
  margin: 0;
  padding-left: 20px;
}
.text-closing-final {
  font-size: 12px;
  color: #333;
}

.signature-container {
  margin-top: 30px;
  padding-top: 20px;
  page-break-inside: avoid;
  break-inside: avoid;
}
.final-sign-space {
  position: relative;
  height: 120px;
  width: 250px;
  margin: 0 auto 10px;
}
.img-stempel {
  position: absolute;
  width: 110px;
  height: auto;
  left: 50%;
  bottom: 15px;
  transform: translateX(-50%);
  z-index: 2;
  opacity: 0.95;
}
.img-signature-clean {
  position: absolute;
  max-height: 100px;
  max-width: 180px;
  left: 50%;
  bottom: 5px;
  transform: translateX(-50%);
  z-index: 1;
  mix-blend-mode: multiply;
  filter: contrast(1.1) brightness(0.95);
}

/* PO Signature Styling */
.po-signature {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: flex-start;
  width: 100%;
}
.po-signature .col-3 {
  flex: 0 0 auto;
  width: auto;
  max-width: 220px;
  padding: 0 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  min-height: 120px;
}
.po-signature .q-mb-xs {
  margin-bottom: 15px !important;
}
.po-signature .signer-name-wrapper {
  width: 180px;
  text-align: center;
  margin-bottom: 5px;
}
.po-signature .text-signer-final {
  box-sizing: border-box;
  width: 180px;
  padding-bottom: 4px;
  padding-top: 5px;
  border-bottom: 1px solid #1a237e;
  word-wrap: break-word;
  white-space: normal;
  min-height: 40px;
  font-size: 13px;
  font-weight: 900;
  color: #1a237e;
  line-height: 1.25;
  text-align: center;
}
.po-signature .text-role-final {
  margin-top: 0px !important;
  font-size: 10.5px;
  font-weight: 700;
  color: #444;
}

/* ── Print Media ── */
@media print {
  @page {
    size: A4;
    margin: 0;
  }
  body {
    background: white !important;
  }
  .no-print {
    display: none !important;
  }
  .letter-paper {
    box-shadow: none !important;
    margin: 0 !important;
    width: 210mm !important;
  }
  .final-pro-table th,
  .row-grand-total,
  .terms-header {
    background-color: #1a237e !important;
    color: white !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .row-calculation {
    background-color: #f9fafb !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  tr,
  .terms-container,
  .signature-container {
    page-break-inside: avoid;
    break-inside: avoid;
  }
}
</style>
