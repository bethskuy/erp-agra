<template>
  <q-page class="bg-grey-2 q-pa-md q-pa-md-lg font-pro">
    <!-- HEADER SECTION (NO-PRINT) -->
    <div class="row items-center justify-between q-mb-xl animate-fade no-print">
      <div class="col-12 col-md-8">
        <div class="row items-center no-wrap">
          <q-btn
            flat
            round
            color="indigo-10"
            icon="arrow_back"
            @click="$router.back()"
            class="q-mr-md bg-white shadow-1"
          />
          <div>
            <div class="text-h4 text-weight-bolder text-indigo-10 leading-tight">
              Daftar Permintaan
              <span class="text-h5 text-weight-light text-grey-6 block q-mt-xs"
                >Antrean Request & Otorisasi Material</span
              >
            </div>
            <div class="text-subtitle1 text-grey-7 q-mt-sm">
              Pantau dan proses seluruh permintaan mutasi stok secara real-time.
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- SUMMARY CARDS (NO-PRINT) -->
    <div class="row q-col-gutter-lg q-mb-lg animate-fade-up no-print">
      <div class="col-12 col-sm-6 col-md-3" v-for="stat in summaryStats" :key="stat.label">
        <q-card flat class="rounded-20 border-subtle bg-white transition-all hover-shadow">
          <q-card-section class="row items-center no-wrap q-pa-md">
            <div class="col">
              <div class="text-overline text-grey-6 leading-none">{{ stat.label }}</div>
              <div class="text-h4 text-weight-bolder q-mt-xs" :class="'text-' + stat.color">
                {{ stat.value }}
              </div>
            </div>
            <div
              :class="'bg-' + stat.color + '-1 q-pa-md rounded-borders'"
              style="min-width: 56px; text-align: center"
            >
              <q-icon :name="stat.icon" :color="stat.color" size="28px" />
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- SEARCH & FILTER (NO-PRINT) -->
    <q-card flat bordered class="q-mb-lg shadow-1 rounded-20 bg-white no-print">
      <q-card-section class="q-py-md">
        <div class="row items-center q-col-gutter-md">
          <div class="col-12 col-md-5">
            <q-input
              v-model="filter"
              outlined
              dense
              rounded
              placeholder="Cari data permintaan..."
              bg-color="white"
              class="search-input"
            >
              <template v-slot:prepend><q-icon name="search" color="primary" /></template>
            </q-input>
          </div>
          <q-space />
          <div class="col-12 col-md-auto row items-center q-gutter-md">
            <q-select
              v-model="statusFilter"
              :options="['Semua Status', 'Pending', 'Approved', 'Rejected', 'Completed']"
              outlined
              dense
              rounded
              bg-color="white"
              style="min-width: 160px"
              label="Filter Status"
            />

            <!-- EXPORT DROPDOWN BUTTON -->
            <q-btn-dropdown
              unelevated
              rounded
              color="indigo-10"
              icon="file_download"
              label="Export Laporan"
              class="shadow-1 font-bold q-px-md"
            >
              <q-list style="min-width: 180px">
                <q-item clickable v-ripple @click="exportListToPDF" class="q-py-md">
                  <q-item-section avatar>
                    <q-avatar color="red-1" text-color="red-9" icon="picture_as_pdf" size="sm" />
                  </q-item-section>
                  <q-item-section class="text-weight-bold text-red-9">Export PDF</q-item-section>
                </q-item>
                <q-separator />
                <q-item clickable v-ripple @click="exportListToExcel" class="q-py-md">
                  <q-item-section avatar>
                    <q-avatar color="green-1" text-color="green-9" icon="table_view" size="sm" />
                  </q-item-section>
                  <q-item-section class="text-weight-bold text-green-9"
                    >Export Excel</q-item-section
                  >
                </q-item>
              </q-list>
            </q-btn-dropdown>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- REQUEST TABLE (NO-PRINT) -->
    <q-card flat bordered class="rounded-20 shadow-sm overflow-hidden bg-white no-print">
      <q-table
        :rows="filteredRows"
        :columns="columns"
        row-key="id"
        flat
        :loading="loading"
        :filter="filter"
        binary-state-sort
        class="permintaan-table"
        :pagination="{ rowsPerPage: 10 }"
      >
        <template v-slot:header="props">
          <q-tr :props="props" class="bg-indigo-10 text-white">
            <q-th
              v-for="col in props.cols"
              :key="col.name"
              :props="props"
              class="text-weight-bold uppercase font-11"
              >{{ col.label }}</q-th
            >
          </q-tr>
        </template>
        <template v-slot:body="props">
          <q-tr
            :props="props"
            class="hover-bg transition-all cursor-pointer"
            @click="viewDetail(props.row)"
          >
            <q-td key="nomor" class="text-weight-bolder text-indigo-10">
              <div class="row items-center q-gutter-xs">
                <span>{{ props.row.nomor || 'REQ-' + props.row.id?.slice(0, 5) }}</span>
                <q-badge
                  v-if="
                    props.row.status === 'Approved' &&
                    props.row.requester_read === false &&
                    props.row.ke_gudang?.id === $route.query.warehouseId
                  "
                  color="positive"
                  class="animate-bounce-subtle"
                  >NEW</q-badge
                >
              </div>
            </q-td>
            <q-td key="tipe">
              <q-badge
                :color="props.row.tipe === 'ANTAR_GUDANG' ? 'orange-2' : 'blue-2'"
                :text-color="props.row.tipe === 'ANTAR_GUDANG' ? 'orange-10' : 'blue-10'"
                class="text-weight-bold"
              >
                {{ props.row.tipe === 'ANTAR_GUDANG' ? 'MUTASI' : 'PURCHASE' }}
              </q-badge>
            </q-td>
            <q-td key="pemohon">
              <div class="text-weight-bold text-blue-grey-9 uppercase font-12">
                {{ props.row.pemohon?.nama || 'Staff' }}
              </div>
              <div class="text-caption text-grey-6 italic">
                {{ formatDate(props.row.timestamp) }}
              </div>
            </q-td>
            <td class="text-left">
              <div class="text-weight-medium">
                {{ props.row.items?.[0]?.nama_barang || 'Multiple items' }}
                <q-badge
                  v-if="props.row.items?.length > 1"
                  color="grey-3"
                  text-color="grey-8"
                  class="q-ml-xs"
                  >+{{ props.row.items.length - 1 }}</q-badge
                >
              </div>
            </td>
            <q-td key="gudang_asal">
              <div class="row items-center no-wrap">
                <q-icon name="warehouse" color="grey-5" class="q-mr-xs" size="xs" />
                <span class="text-weight-bold">{{ props.row.dari_gudang?.nama || '-' }}</span>
              </div>
            </q-td>
            <q-td key="status" class="text-center">
              <q-chip
                :color="getStatusColor(props.row.status)"
                text-color="white"
                size="sm"
                class="text-weight-bold uppercase"
                >{{ props.row.status || 'Pending' }}</q-chip
              >
            </q-td>
            <q-td key="aksi" class="text-center" @click.stop>
              <div class="row justify-center q-gutter-sm">
                <q-btn
                  flat
                  round
                  color="indigo-10"
                  icon="visibility"
                  size="sm"
                  @click="viewDetail(props.row)"
                />
                <q-btn
                  v-if="props.row.status === 'Pending'"
                  flat
                  round
                  color="negative"
                  icon="delete_outline"
                  size="sm"
                  @click="deleteRequest(props.row)"
                />
              </div>
            </q-td>
          </q-tr>
        </template>
      </q-table>
    </q-card>

    <!-- DETAIL DIALOG -->
    <q-dialog
      v-model="showDetail"
      maximized
      transition-show="slide-up"
      transition-hide="slide-down"
      backdrop-filter="blur(8px)"
    >
      <q-card class="column no-wrap overflow-hidden bg-grey-2" v-if="selectedRequest">
        <!-- HEADER (FIXED - NO-PRINT) -->
        <q-toolbar class="bg-indigo-10 text-white q-py-md shadow-4 shrink no-print">
          <q-icon name="assignment" size="sm" class="q-mr-sm" />
          <q-toolbar-title class="text-weight-bold uppercase letter-spacing-1"
            >Lembar Otorisasi & Editor Dokumen</q-toolbar-title
          >

          <q-btn
            v-if="selectedRequest.status === 'Approved' && selectedRequest.tipe === 'ANTAR_GUDANG'"
            unelevated
            color="white"
            text-color="indigo-10"
            icon="picture_as_pdf"
            label="EXPORT TO PDF"
            class="q-mr-md text-weight-black rounded-20 shadow-2 animate-bounce-subtle"
            @click="exportToPDF"
          />

          <q-btn icon="close" flat round dense v-close-popup />
        </q-toolbar>

        <!-- AREA KONTEN (SCROLLABLE) -->
        <q-card-section class="col scroll q-pa-none q-pa-md-xl print-container">
          <!-- AREA KHUSUS CETAK SURAT JALAN (HIDDEN IN SCREEN, TARGET FOR PDF) -->
          <div style="position: absolute; left: -9999px; top: -9999px">
            <div id="sj-export-target" class="perfectionist-paper">
              <!-- Kop Surat Section -->
              <div class="row no-wrap items-center q-mb-md">
                <div class="col-auto text-left">
                  <div class="row no-wrap items-center">
                    <img
                      :src="editFields.logoUrl || 'icons/logo-agra.png'"
                      style="height: 80px; width: auto; max-width: 280px; display: block"
                      class="q-mr-md"
                    />
                    <div class="column justify-center">
                      <div class="text-pt-pro leading-none">
                        {{ editFields.nama_perusahaan || 'PT AGRA ABHINAYA PERKASA' }}
                      </div>
                      <div class="text-pt-tagline italic text-blue-grey-9">
                        {{
                          editFields.slogan_perusahaan || 'General Construction & General Supplier'
                        }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="pro-divider-thick q-mb-md"></div>

              <!-- Judul & Nomor (DIBAWAH GARIS) -->
              <div class="row justify-end q-mb-lg">
                <div class="col-auto text-right">
                  <div
                    class="text-h4 text-weight-black text-indigo-10 uppercase tracking-widest leading-none"
                  >
                    SURAT JALAN
                  </div>
                  <div class="text-subtitle1 text-weight-bold q-mt-xs">
                    No. Surat Jalan :
                    <span class="text-primary font-mono">{{ editFields.nomor_sj }}</span>
                  </div>
                </div>
              </div>

              <!-- Metadata Tujuan & Reff -->
              <div class="row q-col-gutter-xl q-mb-lg text-left" style="font-size: 13.5px">
                <div class="col-6">
                  <div class="text-weight-black uppercase q-mb-xs text-grey-8">Kepada Yth :</div>
                  <div class="text-h6 text-weight-black text-indigo-10 q-mb-xs uppercase">
                    {{ selectedRequest.ke_gudang?.nama }}
                  </div>
                  <div class="row no-wrap q-mt-xs">
                    <div class="col-auto q-mr-sm font-bold">Lokasi :</div>
                    <div class="col underline-dotted text-blue-grey-10 text-weight-bold">
                      {{ editFields.lokasi || '...........................................' }}
                    </div>
                  </div>
                  <div class="row no-wrap q-mt-sm">
                    <div class="col-auto q-mr-sm font-bold">Up :</div>
                    <div class="col underline-dotted text-blue-grey-10 text-weight-bold">
                      {{ editFields.up || '...........................................' }}
                    </div>
                  </div>
                </div>
                <div class="col-6">
                  <div class="row q-mb-xs">
                    <div class="col-5 text-weight-black italic text-grey-7">No Reff</div>
                    <div class="col-7 text-weight-bold">: {{ selectedRequest.nomor }}</div>
                  </div>
                  <div class="row q-mb-xs">
                    <div class="col-5 text-weight-black italic text-grey-7">Tanggal Kirim</div>
                    <div class="col-7">: {{ formatDate(selectedRequest.timestamp) }}</div>
                  </div>
                  <div class="row q-mb-xs">
                    <div class="col-5 text-weight-black italic text-grey-7">Ekspedisi</div>
                    <div class="col-7">: {{ editFields.ekspedisi }}</div>
                  </div>
                </div>
              </div>

              <!-- Tabel Barang (Dynamic Rows) dengan KODE -->
              <table class="perfectionist-table full-width">
                <thead>
                  <tr>
                    <th width="40">NO</th>
                    <th width="80">KODE</th>
                    <th class="text-left">ITEM DESCRIPTION</th>
                    <th width="70">Qty</th>
                    <th width="80">Satuan</th>
                    <th class="text-left">Keterangan</th>
                  </tr>
                </thead>
                <tbody>
                  <!-- MERENDER JUMLAH QTY SESUAI INPUTAN EDITOR -->
                  <tr
                    v-for="(item, i) in selectedRequest.items"
                    :key="i"
                    style="page-break-inside: avoid; break-inside: avoid"
                  >
                    <td class="text-center font-bold">{{ i + 1 }}</td>
                    <td class="text-center font-mono font-bold">
                      {{ getKodeBarang(item.id_barang) }}
                    </td>
                    <td class="text-weight-black uppercase text-left">{{ item.nama_barang }}</td>
                    <td class="text-center text-weight-black">{{ item.qty }}</td>
                    <td class="text-center uppercase font-bold">{{ item.satuan }}</td>
                    <td class="text-left text-blue-grey-8">
                      {{ editFields.itemRemarks[i] || '-' }}
                    </td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr class="bg-grey-1">
                    <td colspan="3" class="text-right text-weight-black uppercase">
                      TOTAL ITEM TERKIRIM
                    </td>
                    <td class="text-center text-weight-black text-h6">
                      {{ selectedRequest.items?.length }}
                    </td>
                    <td colspan="2"></td>
                  </tr>
                </tfoot>
              </table>

              <!-- Catatan Section -->
              <div class="q-mt-md q-mb-xl text-left">
                <div class="text-weight-black italic q-mb-xs">Catatan Khusus :</div>
                <div
                  class="q-pa-md border-black-solid"
                  style="min-height: 80px; font-size: 12px; white-space: pre-wrap; color: #333"
                >
                  {{
                    editFields.catatan_khusus || 'Barang dikirim dalam kondisi baik dan tersegel.'
                  }}
                </div>
              </div>

              <!-- Footer Signature -->
              <div class="row justify-between text-center q-mt-xl" style="font-size: 14px">
                <div class="col-3">
                  <div class="text-weight-black q-mb-xl">Petugas Gudang</div>
                  <div style="height: 60px"></div>
                  <div class="text-weight-black underline text-indigo-10 uppercase">
                    {{ selectedRequest.processedBy || 'Petugas' }}
                  </div>
                  <div class="text-caption text-bold text-grey-8 uppercase">
                    ( Gudang Pengirim )
                  </div>
                </div>
                <div class="col-3">
                  <div class="text-weight-black q-mb-xl">Bagian Pengiriman</div>
                  <div style="height: 60px"></div>
                  <div class="text-weight-black">(..............................)</div>
                  <div class="text-caption text-bold text-grey-8">Nama Driver / Kurir</div>
                </div>
                <div class="col-3">
                  <div class="text-weight-black q-mb-xl">Pihak Penerima</div>
                  <div style="height: 60px"></div>
                  <div class="text-weight-black">(..............................)</div>
                  <div class="text-caption text-bold text-grey-8 uppercase">Nama Jelas & Cap</div>
                </div>
              </div>

              <div class="q-mt-xl text-center text-grey-5 italic" style="font-size: 9px">
                Generated by AGRA ERP Perfectionist Engine v4.0.6 •
                {{ new Date().toLocaleString('id-ID') }}
              </div>
            </div>
          </div>

          <!-- TAMPILAN EDITOR DI LAYAR (NO-PRINT) -->
          <div class="row justify-center no-print animate-fade">
            <div class="col-12 col-md-11 col-lg-10">
              <!-- INFO READ RECEIPT PEMINTA -->
              <div class="text-right q-mb-sm" v-if="selectedRequest.status === 'Approved'">
                <q-chip
                  :color="selectedRequest.requester_read ? 'green-1' : 'red-1'"
                  :text-color="selectedRequest.requester_read ? 'positive' : 'negative'"
                  class="font-bold shadow-1"
                >
                  <q-avatar
                    :icon="selectedRequest.requester_read ? 'done_all' : 'mark_email_unread'"
                    :color="selectedRequest.requester_read ? 'positive' : 'negative'"
                    text-color="white"
                  />
                  {{
                    selectedRequest.requester_read
                      ? 'Telah dilihat Gudang Peminta'
                      : 'Gudang Peminta Belum Melihat Ini'
                  }}
                </q-chip>
              </div>

              <!-- PANEL KONFIGURASI SURAT JALAN -->
              <q-card
                flat
                bordered
                class="rounded-20 q-mb-xl bg-white shadow-premium border-indigo-thin overflow-hidden"
              >
                <q-card-section class="bg-indigo-1 q-pa-md row items-center">
                  <q-icon name="tune" color="indigo-10" size="sm" class="q-mr-sm" />
                  <div class="text-weight-bold text-indigo-10 uppercase letter-spacing-1">
                    Konfigurasi Ekspor Surat Jalan (PDF Editor)
                  </div>
                  <q-space />
                  <q-badge color="indigo-10" class="q-px-md q-py-xs">READY TO EXPORT</q-badge>
                </q-card-section>

                <q-card-section class="q-pa-xl">
                  <div class="row q-col-gutter-xl">
                    <div class="col-12 col-md-6 q-gutter-y-lg text-left">
                      <div>
                        <div
                          class="text-caption text-weight-bold q-mb-sm text-grey-7 uppercase tracking-widest"
                        >
                          Kop Surat / Logo PDF
                        </div>
                        <q-file
                          outlined
                          dense
                          v-model="customLogoFile"
                          label="Pilih Logo Perusahaan..."
                          accept="image/*"
                          @update:model-value="handleLogoUpload"
                          bg-color="grey-1"
                          :disable="selectedRequest.status !== 'Pending'"
                        >
                          <template v-slot:prepend
                            ><q-icon name="cloud_upload" color="primary"
                          /></template>
                        </q-file>
                      </div>

                      <q-input
                        outlined
                        v-model="editFields.nama_perusahaan"
                        label="Nama Perusahaan (Header)"
                        stack-label
                        placeholder="Masukkan Nama PT..."
                        :readonly="selectedRequest.status !== 'Pending'"
                      />
                      <q-input
                        outlined
                        v-model="editFields.slogan_perusahaan"
                        label="Slogan / Bidang Usaha"
                        stack-label
                        placeholder="General Contractor..."
                        :readonly="selectedRequest.status !== 'Pending'"
                      />

                      <q-input
                        outlined
                        v-model="editFields.nomor_sj"
                        label="No. Surat Jalan (Override)"
                        stack-label
                        bg-color="blue-grey-1"
                        :readonly="selectedRequest.status !== 'Pending'"
                      />
                    </div>

                    <div class="col-12 col-md-6 q-gutter-y-lg text-left">
                      <q-input
                        outlined
                        v-model="editFields.lokasi"
                        label="Detail Alamat Lokasi Tujuan"
                        stack-label
                        :readonly="selectedRequest.status !== 'Pending'"
                      />
                      <q-input
                        outlined
                        v-model="editFields.up"
                        label="Nama UP / Penerima (Atas Nama)"
                        stack-label
                        :readonly="selectedRequest.status !== 'Pending'"
                      />
                      <q-input
                        outlined
                        v-model="editFields.ekspedisi"
                        label="Layanan Ekspedisi"
                        stack-label
                        placeholder="Misal: Driver Internal / JNE..."
                        :readonly="selectedRequest.status !== 'Pending'"
                      />
                      <q-input
                        outlined
                        type="textarea"
                        v-model="editFields.catatan_khusus"
                        label="Catatan Tambahan Surat Jalan"
                        rows="3"
                        stack-label
                        :readonly="selectedRequest.status !== 'Pending'"
                      />
                    </div>
                  </div>
                </q-card-section>
              </q-card>

              <!-- ALUR LOGISTIK VISUAL -->
              <div
                class="row items-center justify-center q-mb-xl q-pa-xl bg-white rounded-20 shadow-sm border-subtle"
              >
                <div class="col-12 col-md-5 text-center">
                  <q-avatar
                    size="80px"
                    color="orange-1"
                    text-color="orange-10"
                    icon="warehouse"
                    class="shadow-2"
                  />
                  <div class="text-h6 q-mt-sm text-weight-bold text-orange-10">
                    {{ selectedRequest.dari_gudang?.nama }}
                  </div>
                  <div class="text-overline text-grey-7 text-weight-bold uppercase q-mt-xs">
                    (GUDANG SUMBER)
                  </div>
                </div>
                <div class="col-12 col-md-2 column items-center q-py-md">
                  <q-icon name="double_arrow" size="lg" color="indigo-10" />
                  <q-badge
                    color="grey-3"
                    text-color="indigo-10"
                    class="q-mt-sm text-weight-bold q-px-md"
                    >{{ selectedRequest.items?.length || 0 }} Items</q-badge
                  >
                </div>
                <div class="col-12 col-md-5 text-center">
                  <q-avatar
                    size="80px"
                    color="green-1"
                    text-color="green-10"
                    icon="domain_verification"
                    class="shadow-2"
                  />
                  <div class="text-h6 q-mt-sm text-weight-bold text-green-10">
                    {{ selectedRequest.ke_gudang?.nama }}
                  </div>
                  <div class="text-overline text-grey-7 text-weight-bold uppercase q-mt-xs">
                    (GUDANG PENERIMA)
                  </div>
                </div>
              </div>

              <!-- EDIT KETERANGAN & JUMLAH (QTY) ITEM -->
              <div
                class="text-h6 text-weight-bold text-blue-grey-10 q-mb-md uppercase flex items-center text-left"
              >
                <q-icon name="edit_note" class="q-mr-sm" color="indigo-10" size="md" /> Sesuaikan
                Qty & Keterangan Pengiriman
              </div>
              <q-markup-table
                flat
                bordered
                separator="horizontal"
                class="rounded-20 q-mb-xl border-subtle bg-white shadow-sm overflow-hidden"
              >
                <thead class="bg-indigo-1">
                  <tr class="text-weight-bold text-white">
                    <th class="text-left q-pa-md" width="100">KODE</th>
                    <th class="text-left q-pa-md">DESKRIPSI MATERIAL</th>
                    <th class="text-center" width="120">QTY DIKIRIM</th>
                    <th class="text-center" width="100">UNIT</th>
                    <th class="text-left">KETERANGAN TAMBAHAN (EDITABLE)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, i) in selectedRequest.items" :key="i">
                    <td class="text-left q-pa-md">
                      <q-badge
                        color="grey-3"
                        text-color="blue-grey-9"
                        class="font-mono text-weight-bold shadow-sm q-px-sm q-py-xs"
                      >
                        {{ getKodeBarang(item.id_barang) }}
                      </q-badge>
                    </td>

                    <td class="text-left q-pa-md font-bold text-blue-grey-10 uppercase">
                      {{ item.nama_barang }}
                    </td>

                    <td class="text-center" width="120">
                      <q-input
                        v-if="selectedRequest.status === 'Pending'"
                        v-model.number="selectedRequest.items[i].qty"
                        type="number"
                        dense
                        outlined
                        bg-color="white"
                        input-class="text-center text-weight-black text-indigo-10 text-h6"
                        :rules="[(val) => val > 0 || 'Min 1']"
                        hide-bottom-space
                      />
                      <div v-else class="text-h6 text-weight-black text-indigo-10">
                        {{ item.qty }}
                      </div>
                    </td>

                    <td class="text-center uppercase text-caption text-weight-bold text-grey-7">
                      {{ item.satuan }}
                    </td>
                    <td class="q-pa-none">
                      <q-input
                        v-model="editFields.itemRemarks[i]"
                        borderless
                        dense
                        class="q-px-md full-width"
                        placeholder="Ketik keterangan barang di sini..."
                        bg-color="blue-grey-1"
                        :readonly="selectedRequest.status !== 'Pending'"
                      />
                    </td>
                  </tr>
                </tbody>
              </q-markup-table>

              <div class="q-py-xl"></div>
            </div>
          </div>
        </q-card-section>

        <!-- FOOTER DIALOG (NO-PRINT) -->
        <q-separator class="no-print" />
        <q-card-actions class="bg-white q-pa-lg q-px-xl shrink no-print">
          <template v-if="selectedRequest.status === 'Pending' || !selectedRequest.status">
            <div v-if="canApproveThisRequest" class="row full-width q-col-gutter-lg justify-center">
              <div class="col-12 col-md-4">
                <q-btn
                  color="positive"
                  class="full-width text-weight-black rounded-20 q-py-lg shadow-8 btn-hover"
                  icon="verified"
                  label="SETUJUI & MUTASI STOK"
                  unelevated
                  @click="processApproval('Approved')"
                />
              </div>
              <div class="col-12 col-md-4">
                <q-btn
                  outline
                  color="negative"
                  class="full-width text-weight-bold rounded-20 q-py-lg bg-white"
                  icon="block"
                  label="TOLAK PERMINTAAN"
                  @click="processApproval('Rejected')"
                />
              </div>
            </div>
            <div v-else class="row full-width flex-center">
              <q-badge
                color="orange-1"
                text-color="orange-10"
                class="q-pa-md border-dashed-orange full-width shadow-sm"
              >
                <q-icon name="lock_person" color="orange-9" class="q-mr-sm" />
                Menunggu Otorisasi Gudang Pengirim: Petugas di
                <b>{{ selectedRequest.dari_gudang?.nama }}</b> yang berhak memberikan persetujuan.
              </q-badge>
            </div>
          </template>
          <div
            v-else
            class="row full-width items-center justify-between q-pa-md rounded-20 border-subtle bg-grey-1"
          >
            <div class="row items-center">
              <q-icon
                :name="selectedRequest.status === 'Approved' ? 'verified' : 'cancel'"
                :color="getStatusColor(selectedRequest.status)"
                size="lg"
                class="q-mr-md"
              />
              <div class="text-left">
                <div
                  class="text-h5 text-weight-black uppercase"
                  :class="'text-' + getStatusColor(selectedRequest.status)"
                >
                  DOKUMEN {{ selectedRequest.status }}
                </div>
                <div class="text-caption text-grey-7 uppercase text-weight-bold">
                  Otorisasi Selesai
                </div>
              </div>
            </div>
            <div class="text-right">
              <div class="text-subtitle2 text-grey-8">
                Divalidasi oleh: <b>{{ selectedRequest.processedBy }}</b>
              </div>
              <div class="text-caption text-grey-6 italic">
                {{ formatDate(selectedRequest.updatedAt) }}
              </div>
            </div>
          </div>
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- HIDDEN TEMPLATE UNTUK EXPORT PDF LAPORAN PERMINTAAN (SOP: PORTRAIT) -->
    <div style="display: none">
      <div id="list-print-area" class="report-paper">
        <div
          class="report-header"
          style="
            background: linear-gradient(90deg, #1a237e 0%, #3949ab 100%);
            padding: 18px;
            border-radius: 12px;
            color: white;
            display: flex;
            align-items: center;
            margin-bottom: 25px;
          "
        >
          <div
            class="report-icon"
            style="
              background-color: rgba(255, 255, 255, 0.2);
              border-radius: 8px;
              width: 45px;
              height: 45px;
              display: flex;
              align-items: center;
              justify-content: center;
              margin-right: 15px;
            "
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
          </div>
          <div>
            <h1
              class="report-title"
              style="
                margin: 0;
                font-size: 20px;
                font-weight: 900;
                letter-spacing: 0.5px;
                color: white !important;
              "
            >
              LAPORAN REKAPITULASI PERMINTAAN
            </h1>
            <div
              class="report-subtitle"
              style="
                font-size: 11px;
                font-weight: bold;
                margin-top: 3px;
                opacity: 0.9;
                color: white !important;
              "
            >
              Gudang: {{ $route.query.warehouseId ? warehouseName : 'Semua Lokasi' }} | Diekspor
              pada: {{ new Date().toLocaleString('id-ID') }}
            </div>
          </div>
        </div>

        <table
          class="report-table"
          style="
            width: 100%;
            border-collapse: collapse;
            font-size: 11px;
            margin-top: 15px;
            border: 1px solid #1a237e;
          "
        >
          <thead>
            <tr>
              <th
                style="
                  background-color: #1a237e;
                  color: white;
                  padding: 12px 6px;
                  border: 1px solid #1a237e;
                  text-align: center;
                  width: 40px;
                  font-weight: 900;
                "
              >
                NO
              </th>
              <th
                style="
                  background-color: #1a237e;
                  color: white;
                  padding: 12px 6px;
                  border: 1px solid #1a237e;
                  text-align: center;
                  width: 110px;
                  font-weight: 900;
                "
              >
                NO. REQUEST
              </th>
              <th
                style="
                  background-color: #1a237e;
                  color: white;
                  padding: 12px 6px;
                  border: 1px solid #1a237e;
                  text-align: left;
                  font-weight: 900;
                "
              >
                JENIS PERMINTAAN
              </th>
              <th
                style="
                  background-color: #1a237e;
                  color: white;
                  padding: 12px 6px;
                  border: 1px solid #1a237e;
                  text-align: left;
                  font-weight: 900;
                "
              >
                PEMOHON & TANGGAL
              </th>
              <th
                style="
                  background-color: #1a237e;
                  color: white;
                  padding: 12px 6px;
                  border: 1px solid #1a237e;
                  text-align: left;
                  font-weight: 900;
                "
              >
                GUDANG ASAL
              </th>
              <th
                style="
                  background-color: #1a237e;
                  color: white;
                  padding: 12px 6px;
                  border: 1px solid #1a237e;
                  text-align: center;
                  width: 90px;
                  font-weight: 900;
                "
              >
                STATUS
              </th>
            </tr>
          </thead>
          <tbody>
            <!-- SAKLEK ANTI-POTONG: Ditambahkan style avoid break agar baris no 8, dll tidak terpotong -->
            <tr
              v-for="(row, idx) in filteredRows"
              :key="row.id"
              :style="
                (idx % 2 !== 0 ? 'background-color: #f8f9fa;' : '') +
                ' page-break-inside: avoid; break-inside: avoid;'
              "
              class="pdf-row"
            >
              <td
                style="
                  padding: 10px 6px;
                  border: 1px solid #e0e0e0;
                  text-align: center;
                  font-weight: bold;
                "
              >
                {{ idx + 1 }}
              </td>
              <td
                style="
                  padding: 10px 6px;
                  border: 1px solid #e0e0e0;
                  font-weight: 900;
                  color: #1a237e;
                  text-align: center;
                "
              >
                {{ row.nomor || 'REQ-' + row.id?.slice(0, 5) }}
              </td>
              <td
                style="
                  padding: 10px 6px;
                  border: 1px solid #e0e0e0;
                  font-weight: bold;
                  text-transform: uppercase;
                "
              >
                {{ row.tipe === 'ANTAR_GUDANG' ? 'MUTASI STOK' : 'PURCHASE REQUEST' }}
              </td>
              <td style="padding: 10px 6px; border: 1px solid #e0e0e0">
                <div style="font-weight: bold; text-transform: uppercase; color: #333">
                  {{ row.pemohon?.nama || 'Staff' }}
                </div>
                <div style="color: #666; font-size: 10px; margin-top: 2px">
                  {{ formatDate(row.timestamp) }}
                </div>
              </td>
              <td
                style="
                  padding: 10px 6px;
                  border: 1px solid #e0e0e0;
                  font-weight: bold;
                  text-transform: uppercase;
                  color: #444;
                "
              >
                {{ row.dari_gudang?.nama || '-' }}
              </td>
              <td
                style="
                  padding: 10px 6px;
                  border: 1px solid #e0e0e0;
                  text-align: center;
                  font-weight: 900;
                  text-transform: uppercase;
                  font-size: 11px;
                "
                :style="{
                  color:
                    row.status === 'Approved' || row.status === 'Completed'
                      ? '#2e7d32'
                      : row.status === 'Rejected'
                        ? '#c62828'
                        : '#e65100',
                }"
              >
                {{ row.status || 'Pending' }}
              </td>
            </tr>
            <tr v-if="filteredRows.length === 0">
              <td
                colspan="6"
                style="
                  padding: 25px;
                  border: 1px solid #e0e0e0;
                  text-align: center;
                  font-style: italic;
                  color: #888;
                "
              >
                Tidak ada data pada filter saat ini.
              </td>
            </tr>
          </tbody>
        </table>

        <div
          style="
            margin-top: 50px;
            text-align: center;
            font-size: 9px;
            color: #888;
            font-style: italic;
          "
        >
          Dokumen ini di-generate secara otomatis oleh Sistem AGRA ERP.
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, reactive } from 'vue'
import { useRoute } from 'vue-router'
import { db } from 'src/boot/firebase'
import {
  collection,
  query,
  onSnapshot,
  orderBy,
  doc,
  getDocs,
  updateDoc,
  deleteDoc,
  where,
  serverTimestamp,
  runTransaction,
  increment,
} from 'firebase/firestore'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'src/stores/auth'
import html2pdf from 'html2pdf.js'

// --- INITIALIZATION ---
const $q = useQuasar()
const route = useRoute()
const authStore = useAuthStore()

const rows = ref([])
const loading = ref(true)
const filter = ref('')
const statusFilter = ref('Semua Status')
const showDetail = ref(false)
const selectedRequest = ref(null)
const userData = ref(null)
const customLogoFile = ref(null)

const masterBarang = ref([])

// --- CONFIGURATION SURAT JALAN (FLEKSIBEL) ---
const editFields = reactive({
  logoUrl: '',
  nama_perusahaan: 'PT AGRA ABHINAYA PERKASA',
  slogan_perusahaan: 'General Construction & General Supplier',
  nomor_sj: '',
  lokasi: '',
  up: '',
  ekspedisi: 'Internal Transfer',
  catatan_khusus: '',
  itemRemarks: [],
})

let unsubPermintaan = null
let unsubUser = null

// --- LOGIKA MENDAPATKAN KODE BARANG ---
const fetchMasterData = async () => {
  try {
    const barSnap = await getDocs(query(collection(db, 'master_barang')))
    masterBarang.value = barSnap.docs.map((d) => ({
      id: d.id,
      kode: d.data().kode || '-',
    }))
  } catch (err) {
    console.error(err)
  }
}

const getKodeBarang = (idBarang) => {
  const item = masterBarang.value.find((b) => b.id === idBarang)
  return item ? item.kode : '-'
}

// --- LOGIKA OTORISASI ---
const canApproveThisRequest = computed(() => {
  if (!selectedRequest.value || !userData.value) return false
  const contextGudangId =
    route.query.warehouseId || userData.value.id_gudang || userData.value.idGudang
  const sourceGudangId = selectedRequest.value.dari_gudang?.id
  const targetGudangId = selectedRequest.value.ke_gudang?.id
  if (contextGudangId === targetGudangId) return false
  if (contextGudangId === sourceGudangId) return true
  return authStore.user?.role === 'Super Admin'
})

const getStatusColor = (status) => {
  if (status === 'Approved' || status === 'Completed') return 'positive'
  if (status === 'Rejected') return 'negative'
  if (status === 'Pending') return 'orange-9'
  return 'grey-7'
}

const formatDate = (ts) => {
  if (!ts) return '-'
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

const fetchRequests = () => {
  loading.value = true
  const q = query(collection(db, 'permintaan_barang'), orderBy('timestamp', 'desc'))
  unsubPermintaan = onSnapshot(
    q,
    (snap) => {
      rows.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      loading.value = false
    },
    (err) => {
      console.error(err)
      loading.value = false
    },
  )
}

const fetchCurrentUser = () => {
  const email = authStore.user?.email
  if (!email) return
  const q = query(collection(db, 'karyawan'), where('email', '==', email))
  unsubUser = onSnapshot(q, (snapshot) => {
    if (!snapshot.empty) userData.value = snapshot.docs[0].data()
  })
}

// PERBAIKAN: DEEP CLONE AGAR INPUT AMAN DARI REALTIME RESET
const viewDetail = async (row) => {
  selectedRequest.value = JSON.parse(JSON.stringify(row))
  customLogoFile.value = null

  // LOGIKA READ RECEIPT (HILANGKAN NOTIF BARU) -> HANYA UNTUK GUDANG PEMINTA
  const wId = route.query.warehouseId
  if (row.status === 'Approved' && row.requester_read === false && row.ke_gudang?.id === wId) {
    try {
      await updateDoc(doc(db, 'permintaan_barang', row.id), { requester_read: true })
      selectedRequest.value.requester_read = true
    } catch (e) {
      console.error('Gagal update read receipt', e)
    }
  }

  // RESTORE CONFIGURASI SURAT JALAN JIKA SUDAH PERNAH DI-APPROVE & DISIMPAN
  if (row.surat_jalan_data) {
    Object.assign(editFields, JSON.parse(JSON.stringify(row.surat_jalan_data)))
  } else {
    const now = new Date()
    const month = (now.getMonth() + 1).toString().padStart(2, '0')
    const year = now.getFullYear()
    const random = Math.floor(1000 + Math.random() * 9000)

    editFields.logoUrl = ''
    editFields.nama_perusahaan = 'PT AGRA ABHINAYA PERKASA'
    editFields.slogan_perusahaan = 'General Construction & General Supplier'
    editFields.nomor_sj = 'SJ/AAP/' + month + '/' + year + '/' + random
    editFields.lokasi = row.ke_gudang?.nama || ''
    editFields.up = ''
    editFields.ekspedisi = 'Internal Transfer'
    editFields.catatan_khusus = ''
    editFields.itemRemarks = Array(row.items?.length || 0).fill('')
  }

  showDetail.value = true
}

const resizeImageToBase64 = (file, maxWidth = 400) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = (e) => {
      const img = new Image()
      img.src = e.target.result
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const scaleSize = maxWidth / img.width
        canvas.width = maxWidth
        canvas.height = img.height * scaleSize
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/png', 0.8))
      }
    }
    reader.onerror = (error) => reject(error)
  })
}

const handleLogoUpload = (file) => {
  if (!file) return
  resizeImageToBase64(file, 300).then((base64) => {
    editFields.logoUrl = base64
  })
}

// =============================================================================
// FIX EXPORT TO PDF & EXCEL UNTUK LIST TABLE (SOP: PORTRAIT & ANTI-CUT)
// =============================================================================
const exportListToPDF = () => {
  if (filteredRows.value.length === 0) {
    return $q.notify({ type: 'warning', message: 'Tabel kosong, tidak ada data untuk diekspor.' })
  }

  $q.loading.show({ message: 'Mengonversi Rekapitulasi (PDF Portrait)...' })
  setTimeout(() => {
    const element = document.getElementById('list-print-area')
    const opt = {
      margin: [15, 12, 15, 12], // Margin dinamis ramah A4 portrait
      filename: `Laporan_Permintaan_${Date.now()}.pdf`,
      image: { type: 'jpeg', quality: 1 },
      html2canvas: { scale: 2.5, useCORS: true, letterRendering: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }, // UBAH JADI PORTRAIT
      // CEGAH TERPOTONG: Hindari row <tr> pecah di tengah halaman
      pagebreak: { mode: ['css', 'legacy'], avoid: ['tr', '.pdf-row', 'thead', 'tbody'] },
    }
    html2pdf()
      .set(opt)
      .from(element)
      .save()
      .then(() => {
        $q.loading.hide()
        $q.notify({ type: 'positive', message: 'Laporan PDF Berhasil Diunduh!', position: 'top' })
      })
      .catch((err) => {
        console.error(err)
        $q.loading.hide()
      })
  }, 800)
}

const exportListToExcel = () => {
  const now = new Date()
  const exportDate = now.toLocaleString('id-ID')

  let html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
    <meta charset="utf-8" />
    <style>
      .table-bordered { border-collapse: collapse; width: 100%; font-family: sans-serif; font-size: 12px; }
      .table-bordered th, .table-bordered td { border: 1px solid #dddddd; padding: 8px; }
      .header-row th { background-color: #1a237e; color: #ffffff; font-weight: bold; text-align: center; }
      .title { font-size: 18px; font-weight: bold; color: #1a237e; font-family: sans-serif; }
      .subtitle { font-size: 12px; color: #333333; font-family: sans-serif; }
      .status-approved { color: #2e7d32; font-weight: bold; }
      .status-pending { color: #e65100; font-weight: bold; }
      .status-rejected { color: #c62828; font-weight: bold; }
    </style>
    </head>
    <body>
      <div class="title">LAPORAN REKAPITULASI PERMINTAAN (REQUEST)</div>
      <div class="subtitle">Diekspor pada: ${exportDate}</div>
      <br>
      <table class="table-bordered">
        <tr class="header-row">
          <th width="50">No</th>
          <th width="150">No. Request</th>
          <th width="150">Jenis Permintaan</th>
          <th width="180">Pemohon</th>
          <th width="150">Tanggal</th>
          <th width="180">Gudang Asal</th>
          <th width="120">Status</th>
        </tr>
  `

  filteredRows.value.forEach((row, idx) => {
    const statusClass =
      row.status === 'Approved' || row.status === 'Completed'
        ? 'status-approved'
        : row.status === 'Rejected'
          ? 'status-rejected'
          : 'status-pending'
    html += `
      <tr>
        <td align="center">${idx + 1}</td>
        <td style="font-weight: bold; color: #1a237e;">${row.nomor || 'REQ-' + row.id?.slice(0, 5)}</td>
        <td style="font-weight: bold;">${row.tipe === 'ANTAR_GUDANG' ? 'MUTASI STOK' : 'PURCHASE REQUEST'}</td>
        <td>${row.pemohon?.nama || 'Staff'}</td>
        <td align="center">${formatDate(row.timestamp)}</td>
        <td style="font-weight: bold;">${row.dari_gudang?.nama || '-'}</td>
        <td align="center" class="${statusClass}" style="text-transform: uppercase;">${row.status || 'Pending'}</td>
      </tr>
    `
  })

  html += `
      </table>
    </body>
    </html>
  `

  const blob = new Blob([html], { type: 'application/vnd.ms-excel' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `Laporan_Permintaan_${Date.now()}.xls`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

const exportToPDF = () => {
  const element = document.getElementById('sj-export-target')
  const fileName = editFields.nomor_sj.replace(/\//g, '-') + '.pdf'

  const opt = {
    margin: 0,
    filename: fileName,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale: 2.5,
      useCORS: true,
      letterRendering: true,
      scrollX: 0,
      scrollY: 0,
    },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    pagebreak: { mode: ['css', 'legacy'], avoid: ['tr', '.pdf-row', 'thead', 'tbody'] },
  }

  $q.loading.show({ message: 'Generating Professional PDF Document...' })

  html2pdf()
    .set(opt)
    .from(element)
    .save()
    .then(() => {
      $q.loading.hide()
      $q.notify({
        type: 'positive',
        message: 'Surat Jalan berhasil diekspor ke PDF!',
        position: 'top',
        icon: 'picture_as_pdf',
      })
    })
    .catch((err) => {
      console.error(err)
      $q.loading.hide()
      $q.notify({ type: 'negative', message: 'Gagal ekspor PDF' })
    })
}

const processApproval = async (status) => {
  if (!selectedRequest.value?.id) return
  $q.dialog({
    title: 'Konfirmasi Otorisasi',
    message:
      'Beri status "' +
      status +
      '" pada permintaan ' +
      (selectedRequest.value.nomor || 'ini') +
      '?',
    cancel: true,
    ok: {
      color: status === 'Approved' ? 'positive' : 'negative',
      unelevated: true,
      rounded: true,
      label: 'Ya, Proses',
    },
    persistent: true,
  }).onOk(async () => {
    $q.loading.show({ message: 'Memproses mutasi stok aman...' })
    try {
      const plainReq = JSON.parse(JSON.stringify(selectedRequest.value))
      const plainSuratJalanData = JSON.parse(JSON.stringify(editFields))

      if (status === 'Approved' && plainReq.tipe === 'ANTAR_GUDANG') {
        await runTransaction(db, async (transaction) => {
          for (const item of plainReq.items) {
            const idBarang = item.id_barang
            const qty = Number(item.qty)
            const sourceGudangId = plainReq.dari_gudang.id
            const destGudangId = plainReq.ke_gudang.id

            const sourceRefQuery = query(
              collection(db, 'stok_barang'),
              where('id_gudang', '==', sourceGudangId),
              where('id_barang', '==', idBarang),
            )
            const sourceSnap = await getDocs(sourceRefQuery)
            if (sourceSnap.empty)
              throw new Error(`Stok ${item.nama_barang} tidak ditemukan di gudang sumber!`)
            const sourceDoc = sourceSnap.docs[0]
            if (sourceDoc.data().jumlah < qty)
              throw new Error(
                `Stok ${item.nama_barang} kurang dari yang disetujui! (Diminta: ${qty}, Sisa: ${sourceDoc.data().jumlah})`,
              )

            const destRefQuery = query(
              collection(db, 'stok_barang'),
              where('id_gudang', '==', destGudangId),
              where('id_barang', '==', idBarang),
            )
            const destSnap = await getDocs(destRefQuery)

            transaction.update(doc(db, 'stok_barang', sourceDoc.id), {
              jumlah: increment(-qty),
              updated_at: serverTimestamp(),
            })
            if (!destSnap.empty) {
              transaction.update(doc(db, 'stok_barang', destSnap.docs[0].id), {
                jumlah: increment(qty),
                updated_at: serverTimestamp(),
              })
            } else {
              const newStokRef = doc(collection(db, 'stok_barang'))
              transaction.set(newStokRef, {
                id_gudang: destGudangId,
                id_barang: idBarang,
                nama_barang: item.nama_barang,
                jumlah: qty,
                satuan: item.satuan,
                created_at: serverTimestamp(),
              })
            }

            const logOutRef = doc(collection(db, 'aktivitas'))
            transaction.set(logOutRef, {
              id_gudang: sourceGudangId,
              nama_barang: item.nama_barang,
              tipe: 'KELUAR',
              jumlah: qty,
              satuan: item.satuan,
              no_referensi: plainReq.nomor,
              keterangan: 'Mutasi keluar ke ' + plainReq.ke_gudang.nama,
              timestamp: serverTimestamp(),
            })
            const logInRef = doc(collection(db, 'aktivitas'))
            transaction.set(logInRef, {
              id_gudang: destGudangId,
              nama_barang: item.nama_barang,
              tipe: 'MASUK',
              jumlah: qty,
              satuan: item.satuan,
              no_referensi: plainReq.nomor,
              keterangan: 'Penerimaan mutasi dari ' + plainReq.dari_gudang.nama,
              timestamp: serverTimestamp(),
            })
          }

          transaction.update(doc(db, 'permintaan_barang', plainReq.id), {
            status: 'Approved',
            items: plainReq.items,
            surat_jalan_data: plainSuratJalanData,
            requester_read: false,
            updatedAt: serverTimestamp(),
            processedBy: userData.value?.nama || 'Administrator',
          })
        })
      } else {
        await updateDoc(doc(db, 'permintaan_barang', plainReq.id), {
          status: status,
          updatedAt: serverTimestamp(),
          processedBy: userData.value?.nama || 'Administrator',
        })
      }
      $q.notify({ type: 'positive', message: 'Permintaan berhasil di-' + status + '!' })
      showDetail.value = false
    } catch (err) {
      $q.notify({ type: 'negative', message: 'Gagal: ' + err.message })
    } finally {
      $q.loading.hide()
    }
  })
}

const deleteRequest = (row) => {
  $q.dialog({
    title: 'Hapus Draft?',
    message: 'Hapus permanen permintaan nomor ' + row.nomor + '?',
    cancel: true,
    ok: { color: 'negative', label: 'Hapus' },
  }).onOk(async () => {
    try {
      await deleteDoc(doc(db, 'permintaan_barang', row.id))
      $q.notify({ message: 'Draf telah dihapus' })
    } catch (err) {
      console.error(err)
    }
  })
}

const columns = [
  { name: 'nomor', align: 'left', label: 'NO. REQUEST', field: 'nomor', sortable: true },
  { name: 'tipe', align: 'left', label: 'JENIS', field: 'tipe', sortable: true },
  { name: 'pemohon', align: 'left', label: 'PEMOHON', field: 'pemohon' },
  { name: 'item', align: 'left', label: 'ITEM', field: 'items' },
  { name: 'gudang_asal', align: 'left', label: 'SUMBER', field: 'dari_gudang' },
  { name: 'status', align: 'center', label: 'STATUS', field: 'status' },
  { name: 'aksi', align: 'center', label: 'KELOLA', field: 'id' },
]

const baseList = computed(() => {
  let list = rows.value || []
  const wId = route.query.warehouseId
  if (wId) {
    list = list.filter((r) => r.dari_gudang?.id === wId || r.ke_gudang?.id === wId)
  }
  return list
})

const summaryStats = computed(() => {
  const r = baseList.value
  return [
    { label: 'Total Request', value: r.length, icon: 'list_alt', color: 'indigo' },
    {
      label: 'Pending',
      value: r.filter((x) => x.status === 'Pending').length,
      icon: 'pending',
      color: 'orange-9',
    },
    {
      label: 'Approved',
      value: r.filter((x) => x.status === 'Approved' || x.status === 'Completed').length,
      icon: 'check_circle',
      color: 'positive',
    },
    {
      label: 'Rejected',
      value: r.filter((x) => x.status === 'Rejected').length,
      icon: 'cancel',
      color: 'negative',
    },
  ]
})

const filteredRows = computed(() => {
  let list = baseList.value
  if (statusFilter.value !== 'Semua Status') {
    list = list.filter((r) => (r.status || 'Pending') === statusFilter.value)
  }
  return list
})

onMounted(() => {
  fetchRequests()
  fetchCurrentUser()
  fetchMasterData()
})
onUnmounted(() => {
  if (unsubPermintaan) unsubPermintaan()
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
.font-mono {
  font-family: 'Courier New', Courier, monospace;
  letter-spacing: 0.5px;
}
.rounded-20 {
  border-radius: 20px;
}
.shadow-premium {
  box-shadow: 0 10px 40px rgba(25, 118, 210, 0.15);
}
.border-subtle {
  border: 1px solid rgba(0, 0, 0, 0.05);
}
.border-indigo-thin {
  border: 1px solid rgba(26, 35, 126, 0.1);
}
.border-black-solid {
  border: 1.5px solid #000;
}
.underline-dotted {
  border-bottom: 1.5px dotted #000;
}

.permintaan-table :deep(thead tr th) {
  position: sticky;
  top: 0;
  z-index: 1;
  font-weight: 800;
  font-size: 11px;
  letter-spacing: 0.5px;
}
.hover-bg:hover {
  background-color: rgba(25, 118, 210, 0.03) !important;
}
.transition-all {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}
.btn-hover:hover {
  transform: translateY(-4px);
  filter: brightness(1.1);
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

/* REPORT PDF EXPORT STYLES (HIDDEN) */
.report-paper {
  font-family: 'Inter', Helvetica, Arial, sans-serif;
  color: #333;
  padding: 10px;
  background: white;
}
.report-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 3px solid #1a237e;
  padding-bottom: 15px;
}
.report-icon {
  background-color: #1a237e;
  border-radius: 8px;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.report-title {
  margin: 0;
  color: white !important;
  font-size: 22px;
  font-weight: 900;
  letter-spacing: 0.5px;
  line-height: 1.2;
}
.report-subtitle {
  color: rgba(255, 255, 255, 0.95) !important;
  font-size: 12px;
  margin-top: 4px;
  font-weight: bold;
}
.report-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 11px;
}
.report-table th {
  background-color: #1a237e;
  color: white;
  padding: 12px;
  border: 1px solid #e0e0e0;
  text-transform: uppercase;
  font-weight: 800;
}
.report-table td {
  padding: 10px 12px;
  border: 1px solid #e0e0e0;
}
.report-table tr:nth-child(even) {
  background-color: #f8f9fa;
}

/* SAKLEK ANTI-POTONG: Instruksikan CSS agar tidak memotong baris */
.report-table tr {
  page-break-inside: avoid !important;
  break-inside: avoid !important;
  page-break-after: auto !important;
}
.pdf-row {
  page-break-inside: avoid !important;
  break-inside: avoid !important;
}

/* PERFECTIONIST PAPER STYLING (TARGET EXPORT PDF SURAT JALAN) */
.perfectionist-paper {
  background: white !important;
  width: 210mm;
  min-height: 297mm;
  padding: 15mm 15mm;
  margin: 0 auto;
  color: black !important;
  box-sizing: border-box;
  position: relative;
}

.text-pt-pro {
  font-size: 26px;
  font-weight: 900;
  color: #1a237e !important;
  letter-spacing: -1px;
}
.text-pt-tagline {
  font-size: 11.5px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #444 !important;
}
.pro-divider-thick {
  height: 4px;
  background: #000 !important;
  border-bottom: 1px solid #000 !important;
}

.perfectionist-table {
  border-collapse: collapse;
  border: 2.5px solid #000 !important;
  margin-top: 10px;
}
.perfectionist-table th,
.perfectionist-table td {
  border: 1.5px solid #000 !important;
  padding: 12px 10px;
  font-size: 13px;
  color: black !important;
}
.perfectionist-table th {
  background: #f2f2f2 !important;
  font-weight: 900;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

.search-input :deep(.q-field__control) {
  border-radius: 30px;
}
.shrink {
  flex: 0 0 auto;
}
.uppercase {
  text-transform: uppercase;
}
.underline {
  text-decoration: underline;
}
.block {
  display: block;
}
.font-11 {
  font-size: 11px;
}
.letter-spacing-1 {
  letter-spacing: 1px;
}
.tracking-widest {
  letter-spacing: 0.15em;
}
.animate-bounce-subtle {
  animation: bounceSubtle 2s infinite;
}
@keyframes bounceSubtle {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-3px);
  }
}

.no-padding {
  padding: 0 !important;
}
.border-dashed-orange {
  border: 2px dashed #ff9800;
  border-radius: 12px;
}
</style>
