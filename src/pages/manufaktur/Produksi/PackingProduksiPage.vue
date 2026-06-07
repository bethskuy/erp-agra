<template>
  <q-page class="packing-page bg-grey-2 q-pa-md q-pa-lg-lg font-pro">
    <div class="row items-center justify-between q-mb-lg">
      <div class="col-12 col-md-8">
        <div class="text-h4 text-weight-bolder text-green-10 leading-tight">
          Packing Produksi
          <span class="text-h5 text-weight-light text-grey-6 block q-mt-xs">
            Industrial Packing Control
          </span>
        </div>
        <div class="text-subtitle1 text-grey-7 q-mt-sm">
          Queue hasil QC approved, partial packing, multi box, material kemasan, label traceability,
          dan handover ready delivery.
        </div>
      </div>

      <div class="col-12 col-md-auto q-mt-md q-mt-md-none" />
    </div>

    <div class="flow-strip q-mb-lg">
      <div v-for="(step, index) in flowSteps" :key="step.label" class="flow-step">
        <q-avatar :color="step.color" text-color="white" :icon="step.icon" size="34px" />
        <div class="flow-label">{{ step.label }}</div>
        <q-icon v-if="index < flowSteps.length - 1" name="chevron_right" color="grey-6" />
      </div>
    </div>

    <div class="row q-col-gutter-md q-mb-lg">
      <div v-for="card in summaryCards" :key="card.status" class="col-12 col-sm-6 col-lg">
        <q-card
          flat
          bordered
          class="summary-card bg-white cursor-pointer"
          :class="{ 'summary-card--active': statusFilter === card.status }"
          @click="statusFilter = statusFilter === card.status ? 'all' : card.status"
        >
          <q-card-section class="row items-center no-wrap">
            <q-avatar :color="card.color" text-color="white" :icon="card.icon" size="48px" />
            <div class="q-ml-md col">
              <div class="summary-label">{{ card.title }}</div>
              <div class="summary-value">{{ card.value }}</div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <q-card flat bordered class="action-card bg-white q-mb-lg">
      <q-card-section class="q-py-md">
        <div class="row q-col-gutter-sm items-center">
          <div class="col-12 col-sm-auto">
            <q-btn
              flat
              rounded
              color="green-10"
              icon="sync"
              label="Refresh"
              no-caps
              :loading="loading"
              class="full-width bg-green-1 q-px-lg touch-btn"
              @click="loadPackingRows"
            />
          </div>
          <div class="col-12 col-sm-auto">
            <q-btn
              flat
              rounded
              color="green-10"
              icon="table_view"
              label="Export Excel"
              no-caps
              class="full-width bg-green-1 q-px-lg touch-btn"
              @click="exportExcel"
            />
          </div>
          <div class="col-12 col-sm-auto">
            <q-btn
              flat
              rounded
              color="negative"
              icon="picture_as_pdf"
              label="Export PDF"
              no-caps
              class="full-width bg-red-1 q-px-lg touch-btn"
              @click="exportPdf"
            />
          </div>
          <q-space />
          <div class="col-12 col-sm-auto">
            <q-btn
              flat
              rounded
              color="blue-grey-8"
              icon="inventory"
              label="Master Packing Material"
              no-caps
              class="full-width bg-grey-2 q-px-lg touch-btn"
              to="/manufaktur/master/master-packing-material"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <q-card flat bordered class="filter-card bg-white q-mb-lg">
      <q-card-section class="q-py-md">
        <div class="row q-col-gutter-md items-center">
          <div class="col-12 col-lg-5">
            <q-input
              v-model="search"
              outlined
              dense
              rounded
              debounce="250"
              placeholder="Cari SPK, PO, produk, checker, box, atau status..."
              bg-color="white"
            >
              <template #prepend>
                <q-icon name="search" color="green-10" />
              </template>
            </q-input>
          </div>

          <div class="col-12 col-sm-6 col-lg-3">
            <q-select
              v-model="statusFilter"
              :options="statusFilterOptions"
              outlined
              dense
              rounded
              emit-value
              map-options
              label="Filter Status Packing"
              bg-color="white"
            />
          </div>

          <div class="col-12 col-sm-6 col-lg-3">
            <q-select
              v-model="poFilter"
              :options="poFilterOptions"
              outlined
              dense
              rounded
              emit-value
              map-options
              label="Filter PO"
              bg-color="white"
            />
          </div>

          <div class="col-12 col-sm-6 col-lg-3">
            <q-select
              v-model="customerFilter"
              :options="customerFilterOptions"
              outlined
              dense
              rounded
              emit-value
              map-options
              label="Filter Customer"
              bg-color="white"
            />
          </div>

          <div class="col-12 col-sm-6 col-lg-3">
            <q-select
              v-model="spkFilter"
              :options="spkFilterOptions"
              outlined
              dense
              rounded
              emit-value
              map-options
              label="Filter SPK"
              bg-color="white"
            />
          </div>

          <div class="col-12 col-sm-6 col-lg-auto row q-gutter-sm">
            <q-chip dense color="green-10" text-color="white" class="text-weight-bold q-px-md">
              {{ filteredRows.length }} PACKING
            </q-chip>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <q-card flat bordered class="table-card bg-white">
      <q-table
        :rows="filteredRows"
        :columns="columns"
        row-key="id"
        flat
        binary-state-sort
        :loading="loading"
        :pagination="{ rowsPerPage: 10 }"
        class="packing-table"
      >
        <template #loading>
          <q-inner-loading showing>
            <div class="skeleton-stack">
              <q-skeleton v-for="item in 6" :key="item" type="rect" height="42px" />
            </div>
          </q-inner-loading>
        </template>

        <template #header="props">
          <q-tr :props="props" class="bg-green-10 text-white sticky-head">
            <q-th
              v-for="col in props.cols"
              :key="col.name"
              :props="props"
              class="text-weight-bold uppercase table-head"
            >
              {{ col.label }}
            </q-th>
          </q-tr>
        </template>

        <template #body="props">
          <q-tr :props="props" class="packing-row">
            <q-td key="nomor_spk" :props="props" class="text-weight-bolder text-green-10">
              {{ props.row.nomor_spk || '-' }}
            </q-td>
            <q-td key="nomor_po" :props="props">{{ props.row.nomor_po || '-' }}</q-td>
            <q-td key="customer" :props="props">{{ props.row.customer || '-' }}</q-td>
            <q-td key="nama_produk" :props="props">
              <div class="text-weight-bold text-green-10">{{ props.row.nama_produk || '-' }}</div>
              <div class="text-caption text-grey-6">{{ props.row.kode_produk || '-' }}</div>
            </q-td>
            <q-td key="qty_approved_qc" :props="props" class="text-weight-bold">
              {{ formatNumber(props.row.qty_approved_qc) }}
            </q-td>
            <q-td key="qty_packing" :props="props" class="text-weight-bold text-positive">
              {{ formatNumber(props.row.qty_packing) }}
            </q-td>
            <q-td key="qty_sisa" :props="props" class="text-weight-bold text-orange-9">
              {{ formatNumber(qtySisa(props.row)) }}
            </q-td>
            <q-td key="jenis_packing" :props="props">{{ props.row.jenis_packing || '-' }}</q-td>
            <q-td key="jumlah_koli" :props="props" class="text-weight-bold">
              {{ formatNumber(props.row.jumlah_koli) }}
            </q-td>
            <q-td key="berat_total" :props="props">
              {{ formatNumber(props.row.berat_total) }} kg
            </q-td>
            <q-td key="checker_packing" :props="props">
              {{ props.row.checker_packing || '-' }}
            </q-td>
            <q-td key="status_packing" :props="props">
              <q-chip
                dense
                square
                text-color="white"
                :color="statusMeta(props.row.status_packing).color"
                class="status-chip"
              >
                {{ statusMeta(props.row.status_packing).label }}
              </q-chip>
              <div class="q-mt-xs">
                <q-linear-progress
                  rounded
                  size="7px"
                  :value="packingProgress(props.row) / 100"
                  :color="progressColor(props.row)"
                  track-color="green-1"
                />
              </div>
            </q-td>
            <q-td key="tanggal_packing" :props="props">
              {{ formatDateTime(props.row.tanggal_packing) }}
            </q-td>
            <q-td key="aksi" :props="props" @click.stop>
              <div class="row no-wrap justify-center q-gutter-xs">
                <q-btn
                  unelevated
                  rounded
                  dense
                  color="green-10"
                  icon="edit_note"
                  :label="canStart(props.row) ? 'Mulai Packing' : 'Edit Packing'"
                  no-caps
                  class="q-px-sm action-text-btn"
                  @click="openPackingDialog(props.row)"
                >
                  <q-tooltip>{{ canStart(props.row) ? 'Mulai Packing' : 'Edit Packing' }}</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  dense
                  color="blue-grey-8"
                  icon="qr_code_2"
                  :disable="!props.row.boxes?.length"
                  @click="openLabelDialog(props.row)"
                >
                  <q-tooltip>Cetak Label</q-tooltip>
                </q-btn>
                <q-btn
                  v-if="normalizePackingStatus(props.row.status_packing) === 'READY_DELIVERY'"
                  unelevated
                  rounded
                  dense
                  color="positive"
                  icon="warehouse"
                  label="Kirim Gudang FG"
                  no-caps
                  class="q-px-sm action-text-btn"
                  :loading="sendingFgId === props.row.id"
                  @click="sendToFgWarehouse(props.row)"
                >
                  <q-tooltip>Kirim ke Gudang Finished Goods</q-tooltip>
                </q-btn>
              </div>
            </q-td>
          </q-tr>
        </template>

        <template #no-data>
          <div class="full-width row flex-center text-grey-7 q-pa-xl">
            <q-icon name="inventory_2" size="28px" class="q-mr-sm" />
            Belum ada queue packing. Hasil QC approved akan masuk otomatis.
          </div>
        </template>
      </q-table>
    </q-card>

    <q-dialog
      v-model="showPackingDialog"
      persistent
      maximized
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card class="packing-dialog column full-height full-width">
        <q-card-section class="dialog-header row items-center no-wrap">
          <div class="col">
            <div class="text-h6 text-weight-bold">{{ dialogTitle }}</div>
            <div class="text-caption ellipsis">
              {{ form.nomor_spk || '-' }} | {{ form.nama_produk || '-' }}
            </div>
          </div>
          <q-chip dense text-color="white" :color="statusMeta(form.status_packing).color" class="q-mr-sm">
            {{ statusMeta(form.status_packing).label }}
          </q-chip>
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>

        <q-form class="column col no-wrap" @submit.prevent="savePacking">
          <q-scroll-area class="col dialog-scroll">
            <div class="q-pa-md q-pa-lg-lg">
              <div class="dialog-kpi q-mb-lg">
                <div v-for="item in dialogKpis" :key="item.label" class="dialog-kpi-item">
                  <div class="kpi-label">{{ item.label }}</div>
                  <div class="kpi-value">{{ item.value }}</div>
                </div>
              </div>

              <q-card flat bordered class="section-card q-mb-lg">
                <q-card-section class="section-title row items-center">
                  <q-icon name="fact_check" color="green-10" size="22px" class="q-mr-sm" />
                  <span>Data Packing</span>
                </q-card-section>
                <q-separator />
                <q-card-section>
                  <div class="row q-col-gutter-md">
                    <div class="col-12 col-md-4">
                      <q-input
                        v-model="form.nomor_spk"
                        outlined
                        dense
                        label="Nomor SPK"
                        readonly
                        bg-color="grey-2"
                        :rules="[(val) => !!val || 'Nomor SPK wajib diisi']"
                      />
                    </div>
                    <div class="col-12 col-md-4">
                      <q-input
                        v-model="form.nomor_po"
                        outlined
                        dense
                        readonly
                        bg-color="grey-2"
                        label="Nomor PO"
                      />
                    </div>
                    <div class="col-12 col-md-4">
                      <q-input
                        v-model="form.nama_produk"
                        outlined
                        dense
                        label="Nama Produk"
                        readonly
                        bg-color="grey-2"
                        :rules="[(val) => !!val || 'Nama produk wajib diisi']"
                      />
                    </div>
                    <div class="col-12 col-md-4">
                      <q-input
                        v-model="form.customer"
                        outlined
                        dense
                        readonly
                        bg-color="grey-2"
                        label="Customer"
                      />
                    </div>
                    <div class="col-12 col-md-4">
                      <q-input
                        v-model.number="form.qty_approved_qc"
                        outlined
                        dense
                        type="number"
                        min="0"
                        label="Qty Approved QC"
                        readonly
                        bg-color="grey-2"
                        :rules="[(val) => Number(val) > 0 || 'Qty approved wajib lebih dari 0']"
                      />
                    </div>
                    <div class="col-12 col-md-4">
                      <q-input
                        :model-value="formatNumber(form.qty_packing_existing)"
                        outlined
                        dense
                        readonly
                        bg-color="grey-2"
                        label="Qty Sudah Packing"
                      />
                    </div>
                    <div class="col-12 col-md-4">
                      <q-input
                        :model-value="formatNumber(maxInputQty)"
                        outlined
                        dense
                        readonly
                        bg-color="grey-2"
                        label="Qty Sisa Packing"
                      />
                    </div>
                    <div class="col-12 col-md-4">
                      <q-select
                        v-model="form.jenis_packing"
                        :options="jenisPackingOptions"
                        outlined
                        dense
                        label="Jenis Kemasan"
                        :rules="[(val) => !!val || 'Jenis kemasan wajib dipilih']"
                        @update:model-value="syncAutoMaterialUsage"
                      />
                    </div>
                    <div class="col-12 col-md-4">
                      <q-input
                        v-model.number="form.jumlah_koli"
                        outlined
                        dense
                        type="number"
                        min="1"
                        label="Jumlah Koli / Box"
                        :rules="[(val) => Number(val) > 0 || 'Jumlah koli wajib lebih dari 0']"
                        @update:model-value="generateBoxes"
                      />
                    </div>
                    <div class="col-12 col-md-4">
                      <q-input
                        v-model.number="form.berat_total"
                        outlined
                        dense
                        type="number"
                        min="0"
                        suffix="kg"
                        label="Berat Total"
                        :rules="[(val) => Number(val) > 0 || 'Berat total wajib diisi']"
                        @update:model-value="generateBoxes"
                      />
                    </div>
                    <div class="col-12 col-md-4">
                      <q-input
                        v-model="form.checker_packing"
                        outlined
                        dense
                        label="Checker Packing"
                        :rules="[(val) => !!val || 'Checker packing wajib diisi']"
                      />
                    </div>
                    <div class="col-12 col-md-4">
                      <q-input
                        v-model="form.tanggal_packing"
                        outlined
                        dense
                        type="date"
                        readonly
                        bg-color="grey-2"
                        label="Tanggal Packing"
                        :rules="[(val) => !!val || 'Tanggal packing wajib diisi']"
                      />
                    </div>
                    <div class="col-12 col-md-4">
                      <q-input
                        :model-value="statusMeta(autoPreviewStatus).label"
                        outlined
                        dense
                        readonly
                        bg-color="grey-2"
                        label="Lifecycle Packing Otomatis"
                      />
                    </div>
                    <div class="col-12 col-md-8">
                      <q-input v-model="form.catatan_packing" outlined dense type="textarea" autogrow label="Catatan Packing" />
                    </div>
                  </div>
                </q-card-section>
              </q-card>

              <q-card v-if="false" flat bordered class="section-card q-mb-lg">
                <q-card-section class="section-title row items-center justify-between">
                  <div>
                    <q-icon name="inventory" color="green-10" size="22px" class="q-mr-sm" />
                    <span>Material Packing</span>
                  </div>
                  <q-btn flat dense round icon="add" color="green-10" @click="addMaterialUsage">
                    <q-tooltip>Tambah material</q-tooltip>
                  </q-btn>
                </q-card-section>
                <q-separator />
                <q-card-section>
                  <div v-if="!masterMaterialOptions.length" class="empty-master">
                    Master packing material belum ada. Isi collection Firestore
                    master_packing_material agar dropdown jenis kemasan dan material aktif.
                  </div>
                  <div v-for="(usage, index) in form.material_usage" :key="index" class="material-row q-mb-sm">
                    <q-select
                      v-model="usage.material_id"
                      :options="masterMaterialOptions"
                      outlined
                      dense
                      emit-value
                      map-options
                      label="Material"
                      class="material-field"
                      @update:model-value="() => syncMaterialUsage(usage)"
                    />
                    <q-input
                      v-model.number="usage.qty"
                      outlined
                      dense
                      type="number"
                      min="0"
                      label="Qty Pakai"
                      class="qty-field"
                    />
                    <div class="stock-info">
                      Stok: {{ formatNumber(materialById(usage.material_id)?.stok) }}
                      {{ materialById(usage.material_id)?.satuan || '' }}
                    </div>
                    <q-btn flat round dense color="negative" icon="delete" @click="removeMaterialUsage(index)" />
                  </div>
                </q-card-section>
              </q-card>

              <q-card v-if="false" flat bordered class="section-card q-mb-lg">
                <q-card-section class="section-title row items-center">
                  <q-icon name="checklist" color="green-10" size="22px" class="q-mr-sm" />
                  <span>Checklist Packing</span>
                </q-card-section>
                <q-separator />
                <q-card-section>
                  <div class="row q-col-gutter-sm">
                    <div v-for="item in checklistItems" :key="item.key" class="col-12 col-sm-6 col-lg-4">
                      <q-checkbox
                        v-model="form.checklist[item.key]"
                        color="green-10"
                        :label="item.label"
                        class="check-item"
                      />
                    </div>
                  </div>
                </q-card-section>
              </q-card>

              <q-card flat bordered class="section-card q-mb-lg">
                <q-card-section class="section-title row items-center justify-between">
                  <div>
                    <q-icon name="view_in_ar" color="green-10" size="22px" class="q-mr-sm" />
                    <span>Detail Box / Koli</span>
                  </div>
                  <q-chip dense color="green-10" text-color="white">
                    Total isi: {{ formatNumber(totalBoxQty) }}
                  </q-chip>
                </q-card-section>
                <q-separator />
                <q-card-section>
                  <div class="box-grid">
                    <div v-for="box in form.boxes" :key="box.nomor_box" class="box-card">
                      <div class="row items-center justify-between q-mb-sm">
                        <div class="box-title">BOX {{ box.nomor_box }}</div>
                        <q-chip dense color="blue-grey-8" text-color="white">{{ box.barcode }}</q-chip>
                      </div>
                      <div class="row q-col-gutter-sm">
                        <div class="col-6">
                          <q-input
                            v-model.number="box.qty_isi"
                            outlined
                            dense
                            readonly
                            bg-color="grey-2"
                            type="number"
                            min="0"
                            label="Qty Isi"
                          />
                        </div>
                        <div class="col-6">
                          <q-input
                            v-model.number="box.berat"
                            outlined
                            dense
                            type="number"
                            min="0"
                            suffix="kg"
                            label="Berat"
                            @update:model-value="box.berat_manual = true"
                          />
                        </div>
                        <div class="col-12">
                          <q-input v-model="box.catatan" outlined dense readonly bg-color="grey-2" label="Catatan Box" />
                        </div>
                      </div>
                      <q-img :src="qrSvg(box)" class="qr-preview q-mt-sm" fit="contain" />
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </q-scroll-area>

          <q-card-actions align="right" class="dialog-footer bg-grey-1 q-pa-md">
            <q-btn flat color="grey-7" label="Batal" no-caps v-close-popup :class="{ 'full-width': $q.screen.lt.md }" />
            <q-btn
              unelevated
              rounded
              color="green-10"
              icon="save"
              label="Simpan Packing"
              no-caps
              type="submit"
              :loading="submitting"
              :class="{ 'full-width': $q.screen.lt.md }"
            />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>

    <q-dialog v-model="labelDialog" maximized transition-show="slide-up" transition-hide="slide-down">
      <q-card class="label-dialog column">
        <q-card-section class="dialog-header row items-center">
          <div>
            <div class="text-h6 text-weight-bold">Label Packing</div>
            <div class="text-caption">{{ labelRow?.nomor_spk || '-' }} | {{ labelRow?.nama_produk || '-' }}</div>
          </div>
          <q-space />
          <q-btn flat round dense icon="print" @click="printLabels" />
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>
        <q-scroll-area class="col">
          <div class="label-sheet">
            <div v-for="box in labelRow?.boxes || []" :key="box.barcode" class="packing-label">
              <div class="label-top">
                <div>
                  <div class="label-company">AGRA ERP MANUFAKTUR</div>
                  <div class="label-title">PACKING LABEL</div>
                </div>
                <q-img :src="qrSvg(box, labelRow)" class="label-qr" fit="contain" />
              </div>
              <div class="label-grid">
                <span>SPK</span><strong>{{ labelRow.nomor_spk || '-' }}</strong>
                <span>Produk</span><strong>{{ labelRow.nama_produk || '-' }}</strong>
                <span>Box</span><strong>{{ box.nomor_box }} / {{ labelRow.jumlah_koli || labelRow.boxes.length }}</strong>
                <span>Qty</span><strong>{{ formatNumber(box.qty_isi) }}</strong>
                <span>Berat</span><strong>{{ formatNumber(box.berat) }} kg</strong>
                <span>Barcode</span><strong>{{ box.barcode }}</strong>
              </div>
            </div>
          </div>
        </q-scroll-area>
      </q-card>
    </q-dialog>

    <div id="packing-pdf-export" class="pdf-export">
      <h2>AGRA ERP - Laporan Packing Produksi</h2>
      <p>Diekspor: {{ new Date().toLocaleString('id-ID') }}</p>
      <table>
        <thead>
          <tr>
            <th>SPK</th>
            <th>PO</th>
            <th>Produk</th>
            <th>Approved</th>
            <th>Packing</th>
            <th>Sisa</th>
            <th>Koli</th>
            <th>Berat</th>
            <th>Checker</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in filteredRows" :key="row.id">
            <td>{{ row.nomor_spk }}</td>
            <td>{{ row.nomor_po }}</td>
            <td>{{ row.nama_produk }}</td>
            <td>{{ formatNumber(row.qty_approved_qc) }}</td>
            <td>{{ formatNumber(row.qty_packing) }}</td>
            <td>{{ formatNumber(qtySisa(row)) }}</td>
            <td>{{ formatNumber(row.jumlah_koli) }}</td>
            <td>{{ formatNumber(row.berat_total) }} kg</td>
            <td>{{ row.checker_packing }}</td>
            <td>{{ statusMeta(row.status_packing).label }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </q-page>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import {
  collection,
  collectionGroup,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  where,
  writeBatch,
} from 'firebase/firestore'
import html2pdf from 'html2pdf.js'
import QRCode from 'qrcode'
import * as XLSX from 'xlsx'
import { auth, db } from 'src/boot/firebase'

const COLLECTION_NAME = 'packing_queue'
const QC_COLLECTION = 'qc_produksi_manufaktur'
const READY_DELIVERY_COLLECTION = 'ready_delivery_manufaktur'
const FG_TRANSFERS_COLLECTION = 'fg_transfers'
const FG_TRANSFER_BOXES_COLLECTION = 'fg_transfer_boxes'
const MASTER_MATERIAL_COLLECTION = 'master_packing_material'
const DETAIL_BOX_COLLECTION = 'packing_detail_box'
const MATERIAL_USAGE_COLLECTION = 'packing_material_usage'
const PO_CUSTOMER_COLLECTION = 'manufacturing_po_customer'
const SPK_SUBCOLLECTION = 'spk'

const packingStatuses = [
  { label: 'Pending Packing', value: 'PENDING_PACKING', color: 'blue-grey-6', icon: 'pending_actions' },
  { label: 'Sedang Packing', value: 'SEDANG_PACKING', color: 'orange-9', icon: 'inventory_2' },
  { label: 'Partial Packing', value: 'PARTIAL_PACKING', color: 'amber-9', icon: 'splitscreen' },
  { label: 'Ready Delivery', value: 'READY_DELIVERY', color: 'green-10', icon: 'local_shipping' },
  { label: 'Packing Selesai', value: 'PACKING_SELESAI', color: 'positive', icon: 'verified' },
]

const statusFilterOptions = [
  { label: 'Semua Status', value: 'all' },
  ...packingStatuses.map((status) => ({ label: status.label, value: status.value })),
]

const checklistItems = [
  { key: 'kemasan_tidak_rusak', label: 'Kemasan tidak rusak' },
  { key: 'label_sudah_ditempel', label: 'Label sudah ditempel' },
  { key: 'qty_sesuai', label: 'Qty sesuai' },
  { key: 'barang_aman', label: 'Barang aman' },
  { key: 'material_pelindung_terpasang', label: 'Material pelindung terpasang' },
  { key: 'barcode_tercetak', label: 'Barcode tercetak' },
]

const flowSteps = [
  { label: 'QC Approved', icon: 'verified', color: 'green-10' },
  { label: 'Packing Queue', icon: 'pending_actions', color: 'blue-grey-7' },
  { label: 'Mulai Packing', icon: 'inventory_2', color: 'orange-9' },
  { label: 'Transit FG', icon: 'move_down', color: 'green-10' },
  { label: 'Finished Goods', icon: 'warehouse', color: 'blue-grey-8' },
]

const $q = useQuasar()
const rawPackingRows = ref([])
const rows = ref([])
const qcRows = ref([])
const masterMaterials = ref([])
const loading = ref(false)
const loadingMasterMaterial = ref(true)
const submitting = ref(false)
const sendingFgId = ref('')
const search = ref('')
const statusFilter = ref('all')
const poFilter = ref('all')
const customerFilter = ref('all')
const spkFilter = ref('all')
const showPackingDialog = ref(false)
const selectedRow = ref(null)
const labelDialog = ref(false)
const labelRow = ref(null)
const qrCache = ref({})
let unsubscribePacking = null
let unsubscribeQc = null
let unsubscribeMasterMaterial = null

const baseChecklist = () =>
  Object.fromEntries(checklistItems.map((item) => [item.key, false]))

const defaultForm = () => ({
  nomor_spk: '',
  nomor_po: '',
  nama_produk: '',
  kode_produk: '',
  produk_id: '',
  customer: '',
  qty_approved_qc: 0,
  qty_reject: 0,
  departemen: '',
  departemen_asal: '',
  departemen_id: '',
  operator: '',
  tanggal_produksi: null,
  qty_packing_existing: 0,
  qty_packing_input: null,
  jenis_packing: '',
  jumlah_koli: 1,
  berat_total: null,
  checker_packing: '',
  tanggal_packing: new Date().toISOString().slice(0, 10),
  status_packing: 'PENDING_PACKING',
  catatan_packing: '',
  checklist: baseChecklist(),
  boxes: [],
  material_usage: [{ material_id: '', nama_material: '', satuan: '', qty: 1 }],
})

const form = ref(defaultForm())

const columns = [
  { name: 'nomor_spk', align: 'left', label: 'Nomor SPK', field: 'nomor_spk', sortable: true },
  { name: 'nomor_po', align: 'left', label: 'Nomor PO', field: 'nomor_po', sortable: true },
  { name: 'customer', align: 'left', label: 'Customer', field: 'customer', sortable: true },
  { name: 'nama_produk', align: 'left', label: 'Nama Produk', field: 'nama_produk', sortable: true },
  { name: 'qty_approved_qc', align: 'right', label: 'Qty Approved QC', field: 'qty_approved_qc', sortable: true },
  { name: 'qty_packing', align: 'right', label: 'Qty Sudah Packing', field: 'qty_packing', sortable: true },
  { name: 'qty_sisa', align: 'right', label: 'Qty Sisa Packing', field: 'qty_sisa' },
  { name: 'jenis_packing', align: 'left', label: 'Jenis Packing', field: 'jenis_packing' },
  { name: 'jumlah_koli', align: 'right', label: 'Jumlah Koli', field: 'jumlah_koli', sortable: true },
  { name: 'berat_total', align: 'right', label: 'Berat Total', field: 'berat_total', sortable: true },
  { name: 'checker_packing', align: 'left', label: 'Checker Packing', field: 'checker_packing' },
  { name: 'status_packing', align: 'center', label: 'Status Packing', field: 'status_packing' },
  { name: 'tanggal_packing', align: 'left', label: 'Tanggal Packing', field: 'tanggal_packing', sortable: true },
  { name: 'aksi', align: 'center', label: 'Aksi' },
]

const filteredRows = computed(() => {
  const keyword = search.value.trim().toLowerCase()
  return rows.value.filter((row) => {
    const rowStatus = normalizePackingStatus(row.status_packing)
    const matchesStatus = statusFilter.value === 'all' || rowStatus === statusFilter.value
    const matchesPo = poFilter.value === 'all' || row.nomor_po === poFilter.value
    const matchesCustomer = customerFilter.value === 'all' || row.customer === customerFilter.value
    const matchesSpk = spkFilter.value === 'all' || row.nomor_spk === spkFilter.value
    const matchesSearch =
      !keyword ||
      [
        row.nomor_spk,
        row.nomor_po,
        row.nama_produk,
        row.kode_produk,
        row.jenis_packing,
        row.checker_packing,
        row.customer,
        rowStatus,
        ...(row.boxes || []).map((box) => box.barcode),
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword))

    return matchesStatus && matchesPo && matchesCustomer && matchesSpk && matchesSearch
  })
})

const uniqueFilterOptions = (field, allLabel) => [
  { label: allLabel, value: 'all' },
  ...[...new Set(rows.value.map((row) => row[field]).filter(Boolean))]
    .sort((left, right) => String(left).localeCompare(String(right)))
    .map((value) => ({ label: value, value })),
]

const poFilterOptions = computed(() => uniqueFilterOptions('nomor_po', 'Semua PO'))
const customerFilterOptions = computed(() => uniqueFilterOptions('customer', 'Semua Customer'))
const spkFilterOptions = computed(() => uniqueFilterOptions('nomor_spk', 'Semua SPK'))

const summaryCards = computed(() =>
  packingStatuses.map((status) => ({
    ...status,
    status: status.value,
    title: status.label,
    value: rows.value.filter((row) => normalizePackingStatus(row.status_packing) === status.value).length,
  })),
)

const dialogTitle = computed(() =>
  selectedRow.value && !canStart(selectedRow.value) ? 'Edit Packing Produksi' : 'Mulai Packing Produksi',
)

const autoPreviewStatus = computed(() => resolveNextStatus())

const dialogKpis = computed(() => [
  { label: 'Nomor PO', value: form.value.nomor_po || '-' },
  { label: 'Nomor SPK', value: form.value.nomor_spk || '-' },
  { label: 'Nama Produk', value: form.value.nama_produk || '-' },
  { label: 'Customer', value: form.value.customer || '-' },
  { label: 'Qty Approved', value: formatNumber(form.value.qty_approved_qc) },
  { label: 'Qty Sudah Packing', value: formatNumber(form.value.qty_packing_existing) },
  { label: 'Qty Sisa', value: formatNumber(maxInputQty.value) },
])

const jenisPackingOptions = computed(() => {
  return masterMaterials.value
    .map((item) => item.nama_material)
    .filter(Boolean)
    .filter((value, index, array) => array.indexOf(value) === index)
})

const masterMaterialOptions = computed(() =>
  masterMaterials.value.map((item) => ({
    label: `${item.nama_material} - stok ${formatNumber(item.stok)} ${item.satuan || ''}`,
    value: item.id,
  })),
)

const selectedPackingMaterial = computed(() =>
  masterMaterials.value.find((item) => item.nama_material === form.value.jenis_packing),
)

const maxInputQty = computed(() => {
  if (!selectedRow.value?.id) return Number(form.value.qty_approved_qc || 0)
  return Math.max(0, Number(form.value.qty_approved_qc || 0) - Number(form.value.qty_packing_existing || 0))
})

const totalBoxQty = computed(() =>
  form.value.boxes.reduce((total, box) => total + Number(box.qty_isi || 0), 0),
)

const materialById = (id) => masterMaterials.value.find((item) => item.id === id)

const normalizePackingStatus = (status) => {
  const normalized = String(status || '').trim().toUpperCase()
  const aliases = {
    MENUNGGU_PACKING: 'PENDING_PACKING',
    PACKING_PROCESS: 'SEDANG_PACKING',
    PROSES_PACKING: 'SEDANG_PACKING',
    SELESAI: 'PACKING_SELESAI',
    DONE: 'PACKING_SELESAI',
  }
  return aliases[normalized] || normalized || 'PENDING_PACKING'
}

const statusMeta = (status) =>
  packingStatuses.find((item) => item.value === normalizePackingStatus(status)) || packingStatuses[0]

const stockStatus = (stock, minimumStock) => {
  const current = Number(stock || 0)
  const minimum = Number(minimumStock || 0)
  if (current <= 0 || (minimum > 0 && current <= minimum * 0.5)) return 'Kritis'
  if (minimum > 0 && current <= minimum) return 'Minimum'
  return 'Aman'
}

const approvedQtyFromQc = (row) => {
  const qcId = row?.qc_queue_id || row?.qc_id || row?.id
  const qcRow = qcRows.value.find((item) => item.id === qcId)
  return Number(qcRow?.qty_approved ?? row?.qty_approved ?? 0)
}

const normalizeQcStatus = (status) => {
  const normalized = String(status || '').trim().toLowerCase()
  if (normalized === 'qc_approved' || normalized === 'approved') return 'approved'
  if (normalized === 'selesai' || normalized === 'qc_selesai' || normalized === 'done' || normalized === 'completed') return 'selesai'
  return normalized
}

const firstFilled = (...values) => values.find((value) => String(value || '').trim()) || ''

const customerValueFrom = (row = {}) => (typeof row.customer === 'object' ? row.customer?.nama : row.customer)

const customerNameFrom = (row = {}) =>
  firstFilled(customerValueFrom(row), row.customer_nama, row.nama_customer, row.customerName, row.kepada_yth, row.konsumen)

const nomorPoFrom = (row = {}) =>
  firstFilled(row.nomor_po, row.no_po, row.po_number, row.nomor_po_customer, row.no_po_customer, row.po_customer)

const resolvePoRelation = async (relation) => {
  const sourceCollection = relation.po_source_collection || PO_CUSTOMER_COLLECTION
  const poId = relation.po_source_document_id || relation.po_id || relation.po_customer_id || relation.id_po_customer
  if ((relation.customer && relation.nomor_po) || !poId) return relation

  try {
    const poSnap = await getDoc(doc(db, sourceCollection, poId))
    if (!poSnap.exists()) return relation
    const po = poSnap.data()
    return {
      ...relation,
      nomor_po: relation.nomor_po || nomorPoFrom(po) || poSnap.id,
      customer: relation.customer || customerNameFrom(po),
      customer_id: relation.customer_id || po.customer_id || po.id_customer || po.customerId || null,
      po_id: relation.po_id || poId,
      po_source_collection: sourceCollection,
      po_source_document_id: relation.po_source_document_id || poId,
    }
  } catch (error) {
    console.error('[PackingProduksi] Gagal mengambil relasi PO Customer', { relation, error })
    return relation
  }
}

const resolveProductionRelation = async (row = {}, existingRow = {}) => {
  let relation = {
    nomor_spk: row.nomor_spk || row.no_spk || existingRow.nomor_spk || existingRow.no_spk || '',
    no_spk: row.no_spk || row.nomor_spk || existingRow.no_spk || existingRow.nomor_spk || '',
    nomor_po: nomorPoFrom(row) || nomorPoFrom(existingRow),
    customer: customerNameFrom(row) || customerNameFrom(existingRow),
    customer_id: row.customer_id || existingRow.customer_id || row.id_customer || row.customerId || null,
    po_id: row.po_id || existingRow.po_id || row.po_customer_id || row.id_po_customer || null,
    po_source_collection: row.po_source_collection || existingRow.po_source_collection || PO_CUSTOMER_COLLECTION,
    po_source_document_id:
      row.po_source_document_id ||
      existingRow.po_source_document_id ||
      row.po_id ||
      existingRow.po_id ||
      row.po_customer_id ||
      row.id_po_customer ||
      null,
  }

  if ((!relation.nomor_po || !relation.customer) && relation.nomor_spk) {
    try {
      const spkSnap = await getDocs(
        query(collectionGroup(db, SPK_SUBCOLLECTION), where('nomor_spk', '==', relation.nomor_spk)),
      )
      const spkData = spkSnap.docs[0]?.data() || {}
      relation = {
        ...relation,
        nomor_po: relation.nomor_po || nomorPoFrom(spkData),
        customer: relation.customer || customerNameFrom(spkData),
        customer_id: relation.customer_id || spkData.customer_id || spkData.id_customer || spkData.customerId || null,
        po_id: relation.po_id || spkData.po_id || spkData.po_customer_id || spkData.id_po_customer || null,
        po_source_collection: spkData.po_source_collection || relation.po_source_collection,
        po_source_document_id:
          relation.po_source_document_id ||
          spkData.po_source_document_id ||
          spkData.po_id ||
          spkData.po_customer_id ||
          spkData.id_po_customer ||
          null,
      }
    } catch (error) {
      console.error('[PackingProduksi] Gagal mengambil relasi SPK Produksi', { row, error })
    }
  }

  return resolvePoRelation(relation)
}

const isApprovedQcPackingRow = (row) => {
  if (row?.source_type === 'qc_approved' && Number(row?.qty_approved || 0) > 0) return true
  const qcId = row?.qc_queue_id || row?.qc_id || row?.id
  const qcRow = qcRows.value.find((item) => item.id === qcId)
  if (qcRow) return ['approved', 'selesai'].includes(normalizeQcStatus(qcRow.status_qc))
  return Number(row?.qty_approved || 0) > 0
}

const enrichPackingRow = (row) => {
  const qtyApproved = approvedQtyFromQc(row)
  const qtyPacking = Number(row.qty_packing || 0)
  return {
    ...row,
    nomor_po: nomorPoFrom(row),
    customer: customerNameFrom(row),
    qty_approved_qc: qtyApproved,
    qty_sisa_packing: Math.max(0, qtyApproved - qtyPacking),
  }
}

const refreshPackingRows = () => {
  rows.value = rawPackingRows.value.map((row) => enrichPackingRow(row))
}

const queuePayloadFromQc = (qcRow, relation = {}, existingRow = {}) => ({
  qc_queue_id: qcRow.id,
  production_source_id:
    qcRow.production_source_id ||
    qcRow.production_id ||
    qcRow.source_id ||
    qcRow.id ||
    '',
  nomor_spk: qcRow.nomor_spk || qcRow.no_spk || '',
  no_spk: qcRow.no_spk || qcRow.nomor_spk || '',
  nomor_po: relation.nomor_po || nomorPoFrom(qcRow),
  po_id: relation.po_id || qcRow.po_id || null,
  po_source_collection: relation.po_source_collection || qcRow.po_source_collection || PO_CUSTOMER_COLLECTION,
  po_source_document_id: relation.po_source_document_id || qcRow.po_source_document_id || relation.po_id || qcRow.po_id || null,
  nama_produk: qcRow.nama_produk || qcRow.produk || '',
  kode_produk: qcRow.kode_produk || '',
  produk_id: qcRow.produk_id || '',
  customer: relation.customer || customerNameFrom(qcRow),
  customer_nama: relation.customer || customerNameFrom(qcRow),
  customer_id: relation.customer_id || qcRow.customer_id || null,
  qty_approved_qc: approvedQtyFromQc(qcRow),
  qty_approved: approvedQtyFromQc(qcRow),
  qty_reject: Number(qcRow.qty_reject || 0),
  departemen: qcRow.departemen_asal || qcRow.departemen || qcRow.tujuan_departemen?.nama_departemen || '',
  departemen_asal: qcRow.departemen_asal || qcRow.departemen || qcRow.tujuan_departemen?.nama_departemen || '',
  departemen_id: qcRow.departemen_id || qcRow.tujuan_departemen?.id || '',
  operator: qcRow.operator || '',
  tanggal_produksi:
    qcRow.tanggal_produksi ||
    qcRow.tanggal_finish ||
    qcRow.tanggal_selesai ||
    qcRow.created_at ||
    null,
  tanggal_finish: qcRow.tanggal_finish || null,
  status_qc: 'APPROVED',
  source_type: 'qc_approved',
  queue_status: 'PACKING_QUEUE',
  ...(existingRow?.id ? {} : { created_at: serverTimestamp() }),
  updated_at: serverTimestamp(),
})

const ensurePackingQueueFromApprovedQc = async () => {
  const existingRowsById = new Map(rawPackingRows.value.map((row) => [row.id, row]))
  const approvedQcRows = qcRows.value.filter(
    (row) => ['approved', 'selesai'].includes(normalizeQcStatus(row.status_qc)) && approvedQtyFromQc(row) > 0,
  )
  const queueRowsToSync = approvedQcRows.filter((row) => {
    const existingRow = existingRowsById.get(row.id)
    return !existingRow || !existingRow.nomor_po || !existingRow.customer
  })
  if (!queueRowsToSync.length) return

  try {
    await Promise.all(
      queueRowsToSync.map(async (row) => {
        const existingRow = existingRowsById.get(row.id) || {}
        const relation = await resolveProductionRelation(row, existingRow)
        return setDoc(doc(db, COLLECTION_NAME, row.id), queuePayloadFromQc(row, relation, existingRow), { merge: true })
      }),
    )
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: 'Gagal membuat queue packing dari QC approved' })
  }
}

const refreshPackingRowsFromSnapshot = (snapshot) => {
  rawPackingRows.value = snapshot.docs.map((packingDoc) => {
    const data = packingDoc.data()
    return {
      id: packingDoc.id,
      qty_approved_qc: 0,
      qty_packing: 0,
      qty_sisa_packing: 0,
      jumlah_koli: 0,
      berat_total: 0,
      boxes: [],
      material_usage: [],
      ...data,
      status_packing: normalizePackingStatus(data.status_packing),
    }
  })
  refreshPackingRows()
}

const qtySisa = (row) =>
  Math.max(0, Number(row.qty_approved_qc || 0) - Number(row.qty_packing || 0))

const packingProgress = (row) => {
  const approved = Number(row.qty_approved_qc || 0)
  if (!approved) return 0
  return Math.min(100, Math.round((Number(row.qty_packing || 0) / approved) * 100))
}

const progressColor = (row) => {
  const value = packingProgress(row)
  if (value >= 100) return 'green-10'
  if (value >= 60) return 'green-7'
  if (value >= 30) return 'orange-9'
  return 'blue-grey-6'
}

const canStart = (row) => ['PENDING_PACKING', 'PARTIAL_PACKING'].includes(normalizePackingStatus(row.status_packing))

const formatNumber = (value) => Number(value || 0).toLocaleString('id-ID')

const formatDateTime = (value) => {
  if (!value) return '-'
  const date = value?.seconds ? new Date(value.seconds * 1000) : new Date(value)
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

const sanitizeCode = (value) =>
  String(value || '')
    .replace(/[^a-zA-Z0-9]/g, '')
    .slice(-10)
    .toUpperCase()

const todayCode = () => new Date().toISOString().slice(0, 10).replace(/-/g, '')

const generateTransferNo = (packingId) => `FGT-${todayCode()}-${sanitizeCode(packingId)}`

const generatePackingNo = (packingId) => `PKG-${todayCode()}-${sanitizeCode(packingId)}`

const buildQrPayload = (box, row = null) => ({
  transfer_id: row?.id || selectedRow.value?.id || '',
  box_id: `${row?.id || selectedRow.value?.id || ''}_${Number(box?.nomor_box || 0)}`,
  packing_id: row?.id || selectedRow.value?.id || '',
  nomor_spk: row?.nomor_spk || form.value.nomor_spk || '',
  nomor_po: row?.nomor_po || form.value.nomor_po || '',
  customer: row?.customer || form.value.customer || '',
  product: row?.nama_produk || row?.produk || form.value.nama_produk || '',
  produk: row?.nama_produk || row?.produk || form.value.nama_produk || '',
  nomor_box: Number(box?.nomor_box || 0),
  qty: Number(box?.qty_isi || 0),
  qty_box: Number(box?.qty_isi || 0),
})

const buildBarcode = (box, row = null) => {
  const payload = buildQrPayload(box, row)
  const parts = [
    'PK',
    sanitizeCode(payload.packing_id),
    sanitizeCode(payload.nomor_spk),
    sanitizeCode(payload.nomor_po),
    sanitizeCode(payload.customer),
    `B${String(payload.nomor_box).padStart(2, '0')}`,
    `Q${String(payload.qty_box).padStart(4, '0')}`,
  ].filter((part) => part && !['PK'].includes(part) || part === 'PK')

  return parts.join('-')
}

const distributeQty = (qty, boxCount) => {
  const total = Number(qty || 0)
  const count = Math.max(1, Number(boxCount || 1))
  const base = Math.floor(total / count)
  const remainder = total % count
  return Array.from({ length: count }, (_, index) => base + (index === count - 1 ? remainder : 0))
}

const generateBoxes = () => {
  const totalBox = Math.max(1, Number(form.value.jumlah_koli || 1))
  const qtyPacking = Number(form.value.qty_packing_input || 0)
  const totalWeight = Number(form.value.berat_total || 0)
  const quantities = distributeQty(qtyPacking, totalBox)
  const weightPerBox = totalWeight > 0 ? Number((totalWeight / totalBox).toFixed(2)) : 0
  form.value.boxes = Array.from({ length: totalBox }, (_, index) => {
    const nomorBox = index + 1
    const existing = form.value.boxes[index] || {}
    return {
      nomor_box: nomorBox,
      qty_isi: quantities[index],
      berat: existing.berat_manual ? Number(existing.berat || 0) : weightPerBox,
      berat_manual: !!existing.berat_manual,
      barcode: buildBarcode({ ...existing, nomor_box: nomorBox, qty_isi: quantities[index] }),
      catatan: existing.catatan || '',
    }
  })
  syncAutoMaterialUsage()
}

const normalizeCurrentBoxes = () => {
  form.value.boxes = form.value.boxes.map((box) => ({
    ...box,
    qty_isi: Number(box.qty_isi || 0),
    berat: Number(box.berat || 0),
    barcode: buildBarcode(box),
    qr_payload: JSON.stringify(buildQrPayload(box)),
  }))
}

const buildAutoMaterialUsage = () => {
  const material = selectedPackingMaterial.value
  if (!material) return []
  return [
    {
      material_id: material.id,
      nama_material: material.nama_material || '',
      satuan: material.satuan || '',
      qty: Math.max(1, Number(form.value.jumlah_koli || 1)),
    },
  ]
}

const syncAutoMaterialUsage = () => {
  form.value.material_usage = buildAutoMaterialUsage()
}

const syncMaterialUsage = (usage) => {
  const material = materialById(usage.material_id)
  usage.nama_material = material?.nama_material || ''
  usage.satuan = material?.satuan || ''
}

const addMaterialUsage = () => {
  form.value.material_usage.push({ material_id: '', nama_material: '', satuan: '', qty: 1 })
}

const removeMaterialUsage = (index) => {
  form.value.material_usage.splice(index, 1)
}

const openPackingDialog = (row = null) => {
  if (!row?.id || !isApprovedQcPackingRow(row)) {
    $q.notify({
      type: 'warning',
      message: 'Packing hanya bisa dimulai dari queue QC Produksi berstatus Approved.',
    })
    return
  }
  selectedRow.value = row
  const approvedQty = row ? approvedQtyFromQc(row) : 0
  const existingQty = Number(row?.qty_packing || 0)
  const remainingQty = Math.max(0, approvedQty - existingQty)
  form.value = {
      nomor_spk: row.nomor_spk || row.no_spk || '',
      nomor_po: row.nomor_po || '',
      nama_produk: row.nama_produk || '',
      kode_produk: row.kode_produk || '',
      produk_id: row.produk_id || '',
      customer: row.customer || '',
      qty_approved_qc: approvedQty,
      qty_reject: Number(row.qty_reject || 0),
      departemen: row.departemen || row.departemen_asal || '',
      departemen_asal: row.departemen_asal || row.departemen || '',
      departemen_id: row.departemen_id || '',
      operator: row.operator || '',
      tanggal_produksi: row.tanggal_produksi || row.tanggal_finish || null,
      qty_packing_existing: existingQty,
      qty_packing_input: remainingQty || null,
      jenis_packing: row.jenis_packing || '',
      jumlah_koli: Number(row.jumlah_koli || row.boxes?.length || 1),
      berat_total: Number(row.berat_total || 0) || null,
      checker_packing: row.checker_packing || '',
      tanggal_packing: normalizeDateInput(row.tanggal_packing) || new Date().toISOString().slice(0, 10),
      status_packing: normalizePackingStatus(row.status_packing),
      catatan_packing: row.catatan_packing || '',
      checklist: { ...baseChecklist(), ...(row.checklist || {}) },
      boxes: Array.isArray(row.boxes) ? row.boxes.map((box) => ({ ...box })) : [],
      material_usage: Array.isArray(row.material_usage) && row.material_usage.length
        ? row.material_usage.map((usage) => ({ ...usage }))
        : [{ material_id: '', nama_material: '', satuan: '', qty: Math.max(1, Number(row.jumlah_koli || 1)) }],
    }

  if (!form.value.boxes.length) generateBoxes()
  else normalizeCurrentBoxes()
  showPackingDialog.value = true
}

const normalizeDateInput = (value) => {
  if (!value) return ''
  const date = value?.seconds ? new Date(value.seconds * 1000) : new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toISOString().slice(0, 10)
}

const validatePacking = () => {
  const inputQty = Number(form.value.qty_packing_input || 0)
  if (!selectedRow.value?.id || !isApprovedQcPackingRow(selectedRow.value)) {
    return 'Packing hanya bisa disimpan dari queue QC Produksi berstatus Approved.'
  }
  if (inputQty <= 0) return 'Qty packing harus lebih dari 0.'
  if (inputQty > maxInputQty.value) return `Qty packing melebihi sisa approved QC (${formatNumber(maxInputQty.value)}).`
  if (!form.value.nomor_spk) return 'Nomor SPK dari QC wajib tersedia.'
  if (!form.value.nomor_po) return 'Nomor PO dari QC wajib tersedia.'
  if (!form.value.customer) return 'Customer dari QC wajib tersedia.'
  if (!form.value.nama_produk) return 'Nama produk dari QC wajib tersedia.'
  if (!form.value.checker_packing) return 'Checker packing wajib diisi.'
  if (Number(form.value.jumlah_koli || 0) <= 0) return 'Jumlah koli harus lebih dari 0.'
  if (Number(form.value.berat_total || 0) <= 0) return 'Berat total wajib lebih dari 0.'
  if (totalBoxQty.value !== inputQty) return 'Total qty isi box harus sama dengan qty yang dipacking.'
  const materialUsage = buildAutoMaterialUsage()
  if (!materialUsage.length) return 'Jenis kemasan wajib dipilih dari master packing material.'

  for (const usage of materialUsage) {
    const material = materialById(usage.material_id)
    if (!material) return 'Material packing wajib dipilih dari master.'
    if (Number(usage.qty || 0) <= 0) return `Qty material ${material.nama_material} wajib lebih dari 0.`
    if (Number(material.stok || 0) < Number(usage.qty || 0)) {
      return `Stok material ${material.nama_material} tidak cukup.`
    }
  }

  return ''
}

const resolveNextStatus = () => {
  const inputQty = Number(form.value.qty_packing_input || 0)
  const finalQty = Number(form.value.qty_packing_existing || 0) + inputQty
  const approved = Number(form.value.qty_approved_qc || 0)
  if (finalQty <= 0) return 'PENDING_PACKING'
  if (finalQty < approved) return 'PARTIAL_PACKING'
  return 'READY_DELIVERY'
}

const savePacking = async () => {
  const validationMessage = validatePacking()
  if (validationMessage) {
    $q.notify({ type: 'warning', message: validationMessage })
    return
  }

  submitting.value = true
  try {
    const packingRef = selectedRow.value?.id
      ? doc(db, COLLECTION_NAME, selectedRow.value.id)
      : doc(collection(db, COLLECTION_NAME))
    const packingId = packingRef.id
    const inputQty = Number(form.value.qty_packing_input || 0)
    const finalQty = Number(form.value.qty_packing_existing || 0) + inputQty
    const approvedQty = Number(form.value.qty_approved_qc || 0)
    const nextStatus = resolveNextStatus()
    const packingNo = selectedRow.value?.packing_no || generatePackingNo(packingId)
    const createdBy = auth.currentUser?.uid || form.value.checker_packing || ''
    const boxes = form.value.boxes.map((box) => ({
      ...box,
      barcode: buildBarcode(box, { id: packingId, ...form.value }),
      qr_payload: JSON.stringify(buildQrPayload(box, { id: packingId, ...form.value })),
    }))
    const materialUsage = buildAutoMaterialUsage().map((usage) => {
      const material = materialById(usage.material_id)
      return {
        material_id: usage.material_id,
        nama_material: material?.nama_material || usage.nama_material || '',
        satuan: material?.satuan || usage.satuan || '',
        qty: Number(usage.qty || 0),
      }
    })
    const payload = {
      packing_no: packingNo,
      nomor_spk: form.value.nomor_spk,
      nomor_po: form.value.nomor_po,
      nama_produk: form.value.nama_produk,
      kode_produk: form.value.kode_produk,
      produk_id: form.value.produk_id,
      customer: form.value.customer,
      qty_approved_qc: approvedQty,
      qty_approved: approvedQty,
      qty_reject: Number(form.value.qty_reject || 0),
      departemen: form.value.departemen || form.value.departemen_asal || '',
      departemen_asal: form.value.departemen_asal || form.value.departemen || '',
      departemen_id: form.value.departemen_id || '',
      operator: form.value.operator || '',
      tanggal_produksi: form.value.tanggal_produksi || null,
      qty_packing: finalQty,
      qty_sisa_packing: Math.max(0, approvedQty - finalQty),
      last_qty_packing: inputQty,
      jenis_packing: form.value.jenis_packing,
      jumlah_koli: Number(form.value.jumlah_koli || 0),
      berat_total: Number(form.value.berat_total || 0),
      checker_packing: form.value.checker_packing,
      tanggal_packing: form.value.tanggal_packing,
      status_packing: nextStatus,
      catatan_packing: form.value.catatan_packing,
      checklist: { ...form.value.checklist },
      boxes,
      material_usage: materialUsage,
      created_by: createdBy,
      updated_at: serverTimestamp(),
    }

    await runTransaction(db, async (transaction) => {
      const materialRefs = materialUsage.map((usage) => doc(db, MASTER_MATERIAL_COLLECTION, usage.material_id))
      const materialSnaps = await Promise.all(materialRefs.map((refItem) => transaction.get(refItem)))

      materialSnaps.forEach((snap, index) => {
        if (!snap.exists()) throw new Error(`Material ${materialUsage[index].nama_material} tidak ditemukan.`)
        const currentStock = Number(snap.data().stok || 0)
        if (currentStock < materialUsage[index].qty) {
          throw new Error(`Stok ${materialUsage[index].nama_material} tidak cukup.`)
        }
      })

      transaction.set(
        packingRef,
        selectedRow.value?.id ? { ...payload, source_type: 'qc_approved' } : { ...payload, created_at: serverTimestamp(), source_type: 'qc_approved' },
        { merge: true },
      )

      materialRefs.forEach((refItem, index) => {
        const materialData = materialSnaps[index].data()
        const nextStock = Number(materialData.stok || 0) - Number(materialUsage[index].qty || 0)
        transaction.update(refItem, {
          stok: nextStock,
          status_stock: stockStatus(nextStock, Number(materialData.minimum_stock || 0)),
          updated_at: serverTimestamp(),
        })
        transaction.set(doc(collection(db, MATERIAL_USAGE_COLLECTION)), {
          packing_id: packingId,
          material_id: materialUsage[index].material_id,
          material_name: materialUsage[index].nama_material,
          qty_used: Number(materialUsage[index].qty || 0),
          satuan: materialUsage[index].satuan || '',
          tanggal: serverTimestamp(),
          created_by: form.value.checker_packing || '',
          created_at: serverTimestamp(),
        })
      })
    })

    const detailBatch = writeBatch(db)
    boxes.forEach((box) => {
      detailBatch.set(doc(db, DETAIL_BOX_COLLECTION, `${packingId}_${box.nomor_box}`), {
        packing_id: packingId,
        nomor_spk: form.value.nomor_spk,
        nomor_po: form.value.nomor_po,
        customer: form.value.customer,
        nama_produk: form.value.nama_produk,
        ...box,
        updated_at: serverTimestamp(),
      })
    })
    await detailBatch.commit()

    showPackingDialog.value = false
    $q.notify({ type: 'positive', message: `Packing tersimpan: ${statusMeta(nextStatus).label}` })
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: error?.message || 'Gagal menyimpan packing produksi' })
  } finally {
    submitting.value = false
  }
}

const sendToFgWarehouse = async (row) => {
  if (!row?.id) return
  if (normalizePackingStatus(row.status_packing) !== 'READY_DELIVERY') return

  const qtyPacking = Number(row.qty_packing || 0)
  const jumlahKoli = Number(row.jumlah_koli || row.boxes?.length || 0)
  const boxes = Array.isArray(row.boxes) ? row.boxes : []
  const qrCodes = boxes.map((box) => box.qr_payload || box.barcode || '').filter(Boolean)

  if (qtyPacking <= 0) {
    $q.notify({ type: 'warning', message: 'Qty packing harus lebih dari 0.' })
    return
  }
  if (jumlahKoli <= 0) {
    $q.notify({ type: 'warning', message: 'Jumlah koli harus lebih dari 0.' })
    return
  }
  if (!boxes.length || qrCodes.length !== boxes.length) {
    $q.notify({ type: 'warning', message: 'QR code packing belum dibuat lengkap.' })
    return
  }

  sendingFgId.value = row.id
  try {
    const packingId = row.id
    const packingNo = row.packing_no || generatePackingNo(packingId)
    const transferNo = generateTransferNo(packingId)
    const createdBy = auth.currentUser?.uid || row.checker_packing || ''

    await runTransaction(db, async (transaction) => {
      const packingRef = doc(db, COLLECTION_NAME, packingId)
      const transferRef = doc(db, FG_TRANSFERS_COLLECTION, packingId)
      const transferSnap = await transaction.get(transferRef)

      if (transferSnap.exists()) throw new Error('Transfer FG sudah pernah dikirim.')

      transaction.set(
        transferRef,
        {
          id: packingId,
          transfer_no: transferNo,
          packing_id: packingId,
          packing_no: packingNo,
          spk_no: row.nomor_spk || row.no_spk || '',
          po_no: row.nomor_po || '',
          customer_name: row.customer || row.customer_name || '',
          product_id: row.produk_id || '',
          product_code: row.kode_produk || '',
          product_name: row.nama_produk || '',
          qty_sent: qtyPacking,
          qty_packing: qtyPacking,
          qty_received: 0,
          jumlah_koli: jumlahKoli,
          total_box: jumlahKoli,
          total_weight: Number(row.berat_total || 0),
          checker_packing: row.checker_packing || '',
          receiver_gudang: '',
          receiver_name: '',
          qr_codes: qrCodes,
          status: 'TRANSIT',
          transfer_status: 'TRANSIT',
          transfer_date: serverTimestamp(),
          received_date: null,
          created_by: createdBy,
          created_at: serverTimestamp(),
          updated_at: serverTimestamp(),
        },
        { merge: false },
      )

      boxes.forEach((box) => {
        const boxId = `${packingId}_${box.nomor_box}`
        transaction.set(
          doc(db, FG_TRANSFER_BOXES_COLLECTION, boxId),
          {
            transfer_id: packingId,
            transfer_no: transferNo,
            packing_id: packingId,
            packing_no: packingNo,
            box_id: boxId,
            nomor_box: Number(box.nomor_box || 0),
            barcode: box.barcode || '',
            qr_payload: box.qr_payload || '',
            spk_no: row.nomor_spk || row.no_spk || '',
            po_no: row.nomor_po || '',
            customer_name: row.customer || row.customer_name || '',
            product_id: row.produk_id || '',
            product_code: row.kode_produk || '',
            product_name: row.nama_produk || '',
            qty_isi: Number(box.qty_isi || 0),
            berat: Number(box.berat || 0),
            status: 'WAITING_SCAN',
            scanned_at: null,
            scanned_by: '',
            created_by: createdBy,
            created_at: serverTimestamp(),
            updated_at: serverTimestamp(),
          },
          { merge: true },
        )
      })

      transaction.set(
        doc(db, READY_DELIVERY_COLLECTION, packingId),
        {
          packing_id: packingId,
          packing_no: packingNo,
          nomor_spk: row.nomor_spk || row.no_spk || '',
          nomor_po: row.nomor_po || '',
          nama_produk: row.nama_produk || '',
          kode_produk: row.kode_produk || '',
          produk_id: row.produk_id || '',
          customer: row.customer || row.customer_name || '',
          qty_ready: qtyPacking,
          jumlah_koli: jumlahKoli,
          checker_delivery: row.checker_packing || '',
          status_delivery: 'SENT_TO_GUDANG',
          fg_transfer_id: packingId,
          fg_transfer_no: transferNo,
          fg_transfer_status: 'TRANSIT',
          transfer_status: 'TRANSIT',
          updated_at: serverTimestamp(),
          created_at: serverTimestamp(),
        },
        { merge: true },
      )

      transaction.update(packingRef, {
        packing_no: packingNo,
        status_packing: 'SENT_TO_GUDANG',
        fg_transfer_id: packingId,
        fg_transfer_no: transferNo,
        fg_transfer_status: 'TRANSIT',
        transfer_status: 'TRANSIT',
        sent_to_gudang_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      })
    })

    $q.notify({ type: 'positive', message: 'Barang berhasil dikirim ke Gudang Finished Goods.' })
  } catch (error) {
    console.error(error)
    $q.notify({
      type: error?.message === 'Transfer FG sudah pernah dikirim.' ? 'warning' : 'negative',
      message: error?.message || 'Gagal mengirim barang ke Gudang Finished Goods.',
    })
  } finally {
    sendingFgId.value = ''
  }
}

const qrSvg = (box, row = null) => {
  const payload = box?.qr_payload || JSON.stringify(buildQrPayload(box, row))
  if (qrCache.value[payload]) return qrCache.value[payload]

  QRCode.toDataURL(payload, {
    errorCorrectionLevel: 'M',
    margin: 1,
    width: 180,
    color: {
      dark: '#123d2a',
      light: '#ffffff',
    },
  })
    .then((url) => {
      qrCache.value = { ...qrCache.value, [payload]: url }
    })
    .catch((error) => {
      console.error('[PackingProduksi] Gagal generate QR packing', error)
    })

  return ''
}

const openLabelDialog = (row) => {
  labelRow.value = row
  labelDialog.value = true
}

const printLabels = async () => {
  await nextTick()
  window.print()
}

const exportRows = computed(() =>
  filteredRows.value.map((row) => ({
    'Nomor SPK': row.nomor_spk || '',
    'Nomor PO': row.nomor_po || '',
    Produk: row.nama_produk || '',
    'Qty Approved QC': Number(row.qty_approved_qc || 0),
    'Qty Sudah Packing': Number(row.qty_packing || 0),
    'Qty Sisa Packing': qtySisa(row),
    'Jenis Packing': row.jenis_packing || '',
    'Jumlah Koli': Number(row.jumlah_koli || 0),
    'Berat Total': Number(row.berat_total || 0),
    Checker: row.checker_packing || '',
    Status: statusMeta(row.status_packing).label,
    'Tanggal Packing': formatDateTime(row.tanggal_packing),
  })),
)

const exportExcel = () => {
  if (!exportRows.value.length) {
    $q.notify({ type: 'warning', message: 'Tidak ada data untuk diexport.' })
    return
  }
  const worksheet = XLSX.utils.json_to_sheet(exportRows.value)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Packing Produksi')
  XLSX.writeFile(workbook, `Packing_Produksi_${Date.now()}.xlsx`)
}

const exportPdf = async () => {
  if (!exportRows.value.length) {
    $q.notify({ type: 'warning', message: 'Tidak ada data untuk diexport.' })
    return
  }
  const element = document.getElementById('packing-pdf-export')
  await html2pdf()
    .set({
      filename: `Packing_Produksi_${Date.now()}.pdf`,
      margin: 8,
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' },
    })
    .from(element)
    .save()
}

const loadPackingRows = () => {
  loading.value = true
  if (unsubscribePacking) unsubscribePacking()

  const packingQuery = query(collection(db, COLLECTION_NAME), orderBy('updated_at', 'desc'))
  unsubscribePacking = onSnapshot(
    packingQuery,
    (snapshot) => {
      refreshPackingRowsFromSnapshot(snapshot)
      loading.value = false
    },
    (error) => {
      console.error(error)
      loading.value = false
      $q.notify({ type: 'negative', message: 'Gagal memuat packing produksi' })
    },
  )
}

const loadQcRows = () => {
  if (unsubscribeQc) unsubscribeQc()

  unsubscribeQc = onSnapshot(
    query(collection(db, QC_COLLECTION), orderBy('updated_at', 'desc')),
    (snapshot) => {
      qcRows.value = snapshot.docs.map((qcDoc) => ({
        id: qcDoc.id,
        qty_approved: 0,
        qty_passed: 0,
        qty_lolos: 0,
        qty_approved_qc: 0,
        ...qcDoc.data(),
      }))
      ensurePackingQueueFromApprovedQc()
      refreshPackingRows()
    },
    (error) => {
      console.error(error)
      $q.notify({ type: 'negative', message: 'Gagal memuat qty approved QC realtime' })
    },
  )
}

const loadMasterMaterial = () => {
  loadingMasterMaterial.value = true
  if (unsubscribeMasterMaterial) unsubscribeMasterMaterial()
  unsubscribeMasterMaterial = onSnapshot(
    query(collection(db, MASTER_MATERIAL_COLLECTION), orderBy('nama_material', 'asc')),
    (snapshot) => {
      masterMaterials.value = snapshot.docs
        .map((materialDoc) => ({ id: materialDoc.id, ...materialDoc.data() }))
        .filter((item) => item.aktif !== false)
      loadingMasterMaterial.value = false
    },
    (error) => {
      console.error(error)
      loadingMasterMaterial.value = false
      $q.notify({ type: 'negative', message: 'Gagal memuat master packing material' })
    },
  )
}

onMounted(() => {
  loadPackingRows()
  loadQcRows()
  loadMasterMaterial()
})

onUnmounted(() => {
  if (unsubscribePacking) unsubscribePacking()
  if (unsubscribeQc) unsubscribeQc()
  if (unsubscribeMasterMaterial) unsubscribeMasterMaterial()
})
</script>

<style scoped>
.font-pro {
  font-family:
    'Inter',
    -apple-system,
    sans-serif;
}

.leading-tight {
  line-height: 1.15;
}

.shadow-premium {
  box-shadow: 0 10px 30px rgba(27, 94, 32, 0.15);
}

.touch-btn {
  min-height: 42px;
}

.flow-strip {
  align-items: center;
  background: #ffffff;
  border: 1px solid #dfe8df;
  border-radius: 16px;
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding: 12px;
}

.flow-step {
  align-items: center;
  display: flex;
  flex: 0 0 auto;
  gap: 8px;
}

.flow-label {
  color: #344054;
  font-size: 12px;
  font-weight: 800;
  white-space: nowrap;
}

.summary-card,
.filter-card,
.table-card,
.section-card {
  border-color: #dfe8df;
  border-radius: 16px;
  overflow: hidden;
}

.summary-card {
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.summary-card:hover,
.summary-card--active {
  border-color: #1b5e20;
  box-shadow: 0 14px 30px rgba(27, 94, 32, 0.12);
  transform: translateY(-2px);
}

.summary-label,
.kpi-label,
.detail-label {
  color: #667085;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.4px;
  text-transform: uppercase;
}

.summary-value {
  color: #1b5e20;
  font-size: 30px;
  font-weight: 900;
  line-height: 1;
  margin-top: 5px;
}

.packing-table {
  max-height: 68vh;
}

.packing-table :deep(thead tr th) {
  font-size: 11px;
  letter-spacing: 0.5px;
  padding: 14px 16px;
  position: sticky;
  top: 0;
  z-index: 2;
}

.table-head {
  text-transform: uppercase;
}

.packing-row {
  transition:
    background-color 0.18s ease,
    transform 0.18s ease;
}

.packing-row:hover {
  background: rgba(27, 94, 32, 0.04);
}

.status-chip {
  border-radius: 8px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.2px;
  min-width: 126px;
  justify-content: center;
}

.skeleton-stack {
  display: grid;
  gap: 10px;
  width: min(720px, 80vw);
}

.dialog-header {
  background: #1b5e20;
  color: #ffffff;
  padding: 14px 18px;
}

.packing-dialog,
.label-dialog {
  border-radius: 0;
  height: 100%;
  max-height: 100%;
  max-width: 100%;
  width: 100%;
}

.dialog-scroll {
  min-height: 0;
}

.dialog-footer {
  bottom: 0;
  box-shadow: 0 -8px 20px rgba(15, 60, 45, 0.08);
  flex-shrink: 0;
  position: sticky;
  z-index: 2;
}

.dialog-kpi {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(5, minmax(0, 1fr));
}

.dialog-kpi-item {
  background: #ffffff;
  border: 1px solid #dfe8df;
  border-radius: 12px;
  padding: 12px;
}

.kpi-value {
  color: #1b5e20;
  font-size: 18px;
  font-weight: 900;
  line-height: 1.2;
  margin-top: 4px;
  word-break: break-word;
}

.section-title {
  color: #1b5e20;
  font-size: 14px;
  font-weight: 900;
  padding: 12px 16px;
}

.material-row {
  align-items: center;
  display: grid;
  gap: 10px;
  grid-template-columns: minmax(180px, 1fr) 140px minmax(120px, auto) 34px;
}

.stock-info {
  color: #667085;
  font-size: 12px;
  font-weight: 800;
}

.empty-master {
  background: #fff8e1;
  border: 1px solid #ffe0a3;
  border-radius: 12px;
  color: #8a5a00;
  font-weight: 700;
  padding: 12px;
}

.check-item {
  background: #f7fbf8;
  border: 1px solid #dfe8df;
  border-radius: 10px;
  min-height: 44px;
  padding: 6px 10px;
  width: 100%;
}

.box-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
}

.box-card {
  background: #f7fbf8;
  border: 1px solid #dfe8df;
  border-radius: 12px;
  padding: 12px;
}

.box-title {
  color: #1b5e20;
  font-size: 14px;
  font-weight: 900;
}

.qr-preview {
  background: #ffffff;
  border: 1px solid #dfe8df;
  border-radius: 8px;
  height: 86px;
  width: 86px;
}

.label-sheet {
  display: grid;
  gap: 14px;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  padding: 18px;
}

.packing-label {
  background: #ffffff;
  border: 2px solid #1b5e20;
  border-radius: 8px;
  color: #1f2a24;
  min-height: 220px;
  padding: 14px;
}

.label-top {
  align-items: flex-start;
  border-bottom: 2px solid #1b5e20;
  display: flex;
  justify-content: space-between;
  padding-bottom: 10px;
}

.label-company {
  color: #1b5e20;
  font-size: 13px;
  font-weight: 900;
}

.label-title {
  color: #344054;
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 1px;
}

.label-qr {
  height: 82px;
  width: 82px;
}

.label-grid {
  display: grid;
  gap: 6px 10px;
  grid-template-columns: 74px 1fr;
  margin-top: 12px;
}

.label-grid span {
  color: #667085;
  font-size: 10px;
  font-weight: 900;
  text-transform: uppercase;
}

.label-grid strong {
  color: #1f2a24;
  font-size: 12px;
  word-break: break-word;
}

.pdf-export {
  background: #ffffff;
  color: #1f2a24;
  display: none;
  padding: 18px;
}

.pdf-export table {
  border-collapse: collapse;
  width: 100%;
}

.pdf-export th {
  background: #1b5e20;
  color: #ffffff;
  font-size: 10px;
  padding: 8px;
  text-align: left;
}

.pdf-export td {
  border: 1px solid #dfe8df;
  font-size: 10px;
  padding: 7px;
}

@media (max-width: 1023px) {
  .dialog-kpi {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .dialog-footer {
    padding-bottom: max(16px, env(safe-area-inset-bottom)) !important;
  }

  .touch-btn {
    min-height: 46px;
  }
}

@media (max-width: 599px) {
  .summary-value {
    font-size: 26px;
  }

  .dialog-kpi {
    grid-template-columns: 1fr;
  }

  .material-row {
    grid-template-columns: 1fr;
  }

  .stock-info {
    padding-left: 2px;
  }

  .label-sheet {
    grid-template-columns: 1fr;
    padding: 10px;
  }
}

@media print {
  .packing-page > *:not(.q-dialog),
  .q-dialog__backdrop,
  .dialog-header,
  .dialog-footer {
    display: none !important;
  }

  .label-dialog {
    box-shadow: none !important;
  }

  .label-sheet {
    display: grid !important;
    grid-template-columns: repeat(2, 1fr);
    padding: 0;
  }

  .packing-label {
    break-inside: avoid;
  }
}
</style>
