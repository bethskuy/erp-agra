<template>
  <q-page class="departemen-detail-page bg-grey-2 q-pa-md q-pa-md-lg font-pro">
    <div class="row items-center justify-between q-mb-xl animate-fade">
      <div class="col-12 col-md-8">
        <div class="row items-center no-wrap q-mb-sm">
          <q-btn
            flat
            round
            color="green-10"
            icon="arrow_back"
            class="bg-white shadow-1 q-mr-md"
            to="/manufaktur/departemen"
          />
          <div class="col">
            <div class="text-h4 text-weight-bolder text-green-10 leading-tight">
              {{ departemenTitle }}
              <span class="text-h5 text-weight-light text-grey-6 block q-mt-xs">
                Detail Produksi Departemen
              </span>
            </div>
          </div>
        </div>
        <div class="text-subtitle1 text-grey-7 q-mt-sm">
          Input hasil produksi, pantau PO berjalan, dan ajukan permintaan barang untuk departemen
          manufacturing.
        </div>
      </div>

      <div class="col-12 col-md-auto q-mt-md q-mt-md-none">
        <div class="row q-gutter-sm items-center">
          <q-chip
            v-if="unreadQcRejectNotifications.length"
            square
            color="negative"
            text-color="white"
            icon="notifications_active"
            class="text-weight-bold"
          >
            {{ unreadQcRejectNotifications.length }} Barang Reject QC
          </q-chip>
          <q-chip
            square
            color="green-1"
            text-color="green-10"
            icon="corporate_fare"
            class="text-weight-bold"
          >
            {{ departemenKode || 'MANUFACTURING' }}
          </q-chip>
        </div>
      </div>
    </div>

    <div class="row q-col-gutter-sm q-mb-lg items-center">
      <div class="col-12 col-sm-auto">
        <q-btn
          unelevated
          color="green-1"
          text-color="green-10"
          icon="shopping_basket"
          label="Permintaan Barang"
          rounded
          no-caps
          class="full-width q-px-lg shadow-1 text-weight-bold"
          @click="openPermintaanDialog"
        />
      </div>
      <div class="col-12 col-sm-auto">
        <q-btn
          unelevated
          color="green-10"
          icon="post_add"
          label="Input Produksi"
          rounded
          no-caps
          class="full-width q-px-lg shadow-2 text-weight-bold"
          @click="openProduksiDialog"
        />
      </div>
      <div class="col-12 col-sm-auto">
        <q-btn-dropdown
          unelevated
          color="white"
          text-color="green-10"
          icon="ios_share"
          label="Export Data"
          rounded
          no-caps
          class="full-width q-px-lg shadow-1 text-weight-bold"
        >
          <q-list style="min-width: 180px" class="q-pa-sm">
            <q-item clickable v-ripple class="rounded-borders" @click="exportExcel">
              <q-item-section avatar>
                <q-icon name="table_view" color="green-10" />
              </q-item-section>
              <q-item-section class="text-weight-bold">Excel</q-item-section>
            </q-item>
            <q-item clickable v-ripple class="rounded-borders" @click="exportPdf">
              <q-item-section avatar>
                <q-icon name="picture_as_pdf" color="negative" />
              </q-item-section>
              <q-item-section class="text-weight-bold">PDF</q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </div>
    </div>

    <q-card flat bordered class="filter-card q-mb-md bg-white">
      <q-card-section class="row items-center q-col-gutter-md">
        <div class="col-12 col-md-auto">
          <q-btn-dropdown unelevated color="green-10" icon="account_tree" label="Departemen" no-caps>
            <q-list dense>
              <q-item clickable v-close-popup @click="departmentViewTab = 'planning'">
                <q-item-section avatar><q-icon name="event_note" color="primary" /></q-item-section>
                <q-item-section>Planning Produksi</q-item-section>
                <q-item-section side>
                  <q-badge color="primary">{{ planningBaruCount }}</q-badge>
                </q-item-section>
              </q-item>
              <q-item clickable v-close-popup @click="departmentViewTab = 'reject-qc'">
                <q-item-section avatar><q-icon name="report_problem" color="negative" /></q-item-section>
                <q-item-section>Barang Reject QC</q-item-section>
                <q-item-section side>
                  <q-badge color="negative">{{ activeRejectQcRows.length }}</q-badge>
                </q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
        </div>
        <div class="col">
          <q-tabs
            v-model="departmentViewTab"
            dense
            align="left"
            active-color="green-10"
            indicator-color="green-10"
            class="text-grey-7"
          >
            <q-tab name="planning" icon="event_note" label="Planning Produksi" />
            <q-tab name="reject-qc" icon="report_problem" label="Barang Reject QC">
              <q-badge v-if="activeRejectQcRows.length" color="negative" floating>
                {{ activeRejectQcRows.length }}
              </q-badge>
            </q-tab>
          </q-tabs>
        </div>
      </q-card-section>
    </q-card>

    <div v-show="departmentViewTab === 'planning'" class="q-mb-lg">
      <q-card flat bordered class="planning-section-card bg-white">
        <q-card-section class="row items-center">
          <q-icon name="event_note" color="primary" size="sm" class="q-mr-sm" />
          <div class="text-subtitle1 text-weight-bolder text-green-10">Planning Produksi</div>
          <q-space />
          <q-badge color="primary" class="text-weight-bold">{{ activePlanningRows.length }}</q-badge>
        </q-card-section>
        <q-separator />
        <q-table
          :rows="activePlanningRows"
          :columns="planningColumns"
          row-key="id"
          flat
          :loading="planningLoading"
          :pagination="{ rowsPerPage: 8 }"
        >
          <template #body="props">
            <q-tr :props="props">
              <q-td key="nomor_planning" :props="props" class="text-weight-bolder text-green-10">
                {{ props.row.nomor_planning || props.row.no_planning || '-' }}
                <div class="text-caption text-grey-6">{{ props.row.project_id || props.row.project_name || '-' }}</div>
              </q-td>
              <q-td key="customer" :props="props">{{ props.row.customer_nama || props.row.customer || '-' }}</q-td>
              <q-td key="produk" :props="props">
                <div class="text-weight-bold">{{ props.row.nama_produk || props.row.item_produksi || '-' }}</div>
                <div class="text-caption text-grey-6">{{ props.row.kode_produk || '-' }}</div>
              </q-td>
              <q-td key="qty_target" :props="props" class="text-right text-weight-bold">
                {{ formatNumber(props.row.qty_target || props.row.qty) }} {{ props.row.satuan || '' }}
              </q-td>
              <q-td key="deadline" :props="props">{{ formatDate(props.row.deadline) }}</q-td>
              <q-td key="prioritas" :props="props">
                <q-badge :color="priorityColor(props.row.priority || props.row.prioritas)" class="text-weight-bold">
                  {{ normalizePriority(props.row.priority || props.row.prioritas) }}
                </q-badge>
              </q-td>
              <q-td key="status_planning" :props="props">
                <q-badge :color="planningStatusColor(props.row.status_planning || props.row.status)" class="text-weight-bold">
                  {{ props.row.status_planning || props.row.status || '-' }}
                </q-badge>
              </q-td>
              <q-td key="aksi" :props="props" class="text-center">
                <div class="row justify-center q-gutter-xs no-wrap">
                  <q-btn
                    v-if="canStartPlanning(props.row)"
                    dense
                    unelevated
                    color="green-10"
                    icon="play_arrow"
                    label="Mulai"
                    no-caps
                    @click="startPlanningStep(props.row)"
                  />
                  <q-btn
                    dense
                    unelevated
                    color="positive"
                    icon="check_circle"
                    :label="hasNextPlanningRoute(props.row) ? 'Teruskan' : 'Selesai'"
                    no-caps
                    @click="finishPlanningStep(props.row)"
                  />
                </div>
              </q-td>
            </q-tr>
          </template>
          <template #no-data>
            <div class="full-width row flex-center text-grey-7 q-pa-lg">
              <q-icon name="event_note" size="24px" class="q-mr-sm" />
              Belum ada planning produksi untuk departemen ini.
            </div>
          </template>
        </q-table>
      </q-card>
    </div>

    <div v-show="departmentViewTab === 'reject-qc'" class="q-mb-lg">
      <q-card flat bordered class="planning-section-card bg-white">
        <q-card-section class="row items-center">
          <q-icon name="report_problem" color="negative" size="sm" class="q-mr-sm" />
          <div>
            <div class="text-subtitle1 text-weight-bolder text-green-10">Barang Reject QC</div>
            <div class="text-caption text-grey-7">Barang reject/rework dari QC Produksi untuk diproses ulang departemen.</div>
          </div>
          <q-space />
          <q-badge color="negative" class="text-weight-bold">{{ activeRejectQcRows.length }}</q-badge>
        </q-card-section>
        <q-separator />
        <q-table
          :rows="activeRejectQcRows"
          :columns="rejectQcColumns"
          row-key="id"
          flat
          :loading="rejectQcLoading"
          :pagination="{ rowsPerPage: 8 }"
        >
          <template #body="props">
            <q-tr :props="props">
              <q-td key="reference" :props="props" class="text-weight-bolder text-green-10">
                {{ rejectReference(props.row) }}
              </q-td>
              <q-td key="nama_produk" :props="props">
                <div class="text-weight-bold">{{ props.row.nama_produk || props.row.produk || '-' }}</div>
                <div class="text-caption text-grey-6">{{ props.row.kode_produk || '-' }}</div>
              </q-td>
              <q-td key="qty_reject" :props="props" class="text-right">
                <q-badge color="negative" class="q-px-sm q-py-xs">{{ formatNumber(props.row.qty_reject) }}</q-badge>
              </q-td>
              <q-td key="qty_rework" :props="props" class="text-right">
                <q-badge color="purple-7" class="q-px-sm q-py-xs">{{ formatNumber(props.row.qty_rework) }}</q-badge>
              </q-td>
              <q-td key="alasan_reject" :props="props">
                <div class="reject-note">{{ props.row.alasan_reject || props.row.catatan_qc || '-' }}</div>
              </q-td>
              <q-td key="tanggal_qc" :props="props">{{ formatDate(props.row.tanggal_qc || props.row.tanggal_reject) }}</q-td>
              <q-td key="status_rework" :props="props">
                <q-badge :color="rejectStatusColor(props.row.status_rework)" class="text-weight-bold">
                  {{ rejectStatusLabel(props.row.status_rework) }}
                </q-badge>
              </q-td>
              <q-td key="aksi" :props="props" class="text-center">
                <div class="row justify-center q-gutter-xs no-wrap">
                  <q-btn
                    v-if="canProcessRejectQc(props.row)"
                    dense
                    unelevated
                    color="purple-7"
                    icon="restart_alt"
                    label="Proses Rework"
                    no-caps
                    :loading="processingRejectQcId === props.row.id"
                    @click="processRejectQc(props.row)"
                  />
                  <q-btn
                    v-if="canSendRejectQc(props.row)"
                    dense
                    unelevated
                    color="green-10"
                    icon="fact_check"
                    label="Kirim Ulang ke QC"
                    no-caps
                    :loading="processingRejectQcId === props.row.id"
                    @click="sendRejectQcAgain(props.row)"
                  />
                </div>
              </q-td>
            </q-tr>
          </template>
          <template #no-data>
            <div class="full-width row flex-center text-grey-7 q-pa-lg">
              <q-icon name="report_problem" size="24px" class="q-mr-sm" />
              Belum ada barang reject QC aktif.
            </div>
          </template>
        </q-table>
      </q-card>
    </div>

    <q-card flat bordered class="filter-card q-mb-md bg-white">
      <q-card-section>
        <div class="row q-col-gutter-md items-center">
          <div class="col-12 col-md-7">
            <q-input
              v-model="search"
              outlined
              dense
              rounded
              debounce="250"
              placeholder="Cari tanggal, nomor PO, status, satuan..."
              bg-color="white"
              class="search-input"
            >
              <template #prepend>
                <q-icon name="search" color="green-10" />
              </template>
              <template #append v-if="search">
                <q-icon name="close" class="cursor-pointer" @click="search = ''" />
              </template>
            </q-input>
          </div>
          <div class="col-12 col-md-auto">
            <q-chip dense color="green-10" text-color="white" class="text-weight-bold q-px-md">
              {{ filteredRows.length }} DATA PRODUKSI
            </q-chip>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <q-card flat bordered class="table-card rounded-20 bg-white">
      <q-table
        :rows="filteredRows"
        :columns="columns"
        row-key="id"
        flat
        binary-state-sort
        :loading="loading"
        :pagination="{ rowsPerPage: 10 }"
        class="produksi-table"
      >
        <template #header="props">
          <q-tr :props="props" class="bg-green-10 text-white">
            <q-th v-for="col in props.cols" :key="col.name" :props="props" class="text-weight-bold">
              {{ col.label }}
            </q-th>
          </q-tr>
        </template>

        <template #body-cell-tanggal="props">
          <q-td :props="props">
            <div class="text-weight-bold text-green-10">{{ formatDate(props.row.tanggal) }}</div>
          </q-td>
        </template>

        <template #body-cell-nama_produk="props">
          <q-td :props="props">
            <div class="text-weight-bold text-green-10">{{ props.row.nama_produk || '-' }}</div>
            <div class="text-caption text-grey-6">{{ props.row.kode_produk || '-' }}</div>
          </q-td>
        </template>

        <template #body-cell-qty_po="props">
          <q-td :props="props" class="text-right">
            {{ formatNumber(props.row.qty_po ?? props.row.total_po) }}
          </q-td>
        </template>

        <template #body-cell-qty_hasil_jadi="props">
          <q-td :props="props" class="text-right">
            <q-chip dense color="green-1" text-color="green-10" class="text-weight-bold">
              {{ formatNumber(props.row.qty_hasil_jadi) }}
            </q-chip>
          </q-td>
        </template>

        <template #body-cell-status_produksi="props">
          <q-td :props="props">
            <q-chip
              dense
              square
              text-color="white"
              :color="statusColor(props.row.status_produksi)"
              class="status-chip"
            >
              {{ props.row.status_produksi || '-' }}
            </q-chip>
          </q-td>
        </template>

        <template #body-cell-aksi="props">
          <q-td :props="props" @click.stop>
            <q-btn
              flat
              round
              dense
              color="negative"
              icon="delete"
              @click="confirmDelete(props.row)"
            >
              <q-tooltip>Hapus data produksi</q-tooltip>
            </q-btn>
          </q-td>
        </template>

        <template #no-data>
          <div class="full-width row flex-center q-pa-xl text-grey-6">
            <q-icon name="precision_manufacturing" size="42px" class="q-mr-sm" />
            Belum ada data produksi untuk departemen ini.
          </div>
        </template>
      </q-table>
    </q-card>

    <q-dialog
      v-model="produksiDialog"
      persistent
      maximized
      transition-show="slide-up"
      transition-hide="slide-down"
      backdrop-filter="blur(4px)"
    >
      <q-card class="produksi-dialog-card bg-grey-2 column no-wrap">
        <q-toolbar class="produksi-dialog-toolbar bg-white text-green-10 shadow-2 shrink">
          <q-btn flat round dense icon="close" color="grey-7" @click="closeProduksiDialog" />
          <q-toolbar-title class="produksi-dialog-title text-weight-bold text-center">
            INPUT PRODUKSI DEPARTEMEN
          </q-toolbar-title>
          <q-btn
            unelevated
            color="green-10"
            icon="save"
            label="Simpan Data"
            rounded
            no-caps
            class="produksi-save-desktop q-px-lg text-weight-bold shadow-3"
            :loading="savingProduksi"
            :disable="savingProduksi"
            @click="handleSaveProduksiClick"
          />
        </q-toolbar>

        <q-card-section class="produksi-dialog-body col scroll">
          <div class="produksi-form-shell">
            <q-form ref="produksiFormRef" class="produksi-form" @submit.prevent="handleSaveProduksiClick">
              <q-card flat bordered class="produksi-form-card bg-white">
                <q-card-section class="produksi-form-section">
                  <div class="row items-center q-mb-md">
                    <q-avatar
                      size="40px"
                      color="green-1"
                      text-color="green-10"
                      icon="precision_manufacturing"
                      class="q-mr-sm"
                    />
                    <div class="col">
                      <div class="text-subtitle1 text-weight-bolder text-green-10">
                        Form Hasil Produksi
                      </div>
                      <div class="text-caption text-grey-7">
                        Data ditarik dari Planning Produksi dan schedule.
                      </div>
                    </div>
                  </div>

                  <div class="row q-col-gutter-md produksi-input-grid">
                    <div class="col-12 col-md-6">
                      <q-input
                        v-model="produksiForm.tanggal"
                        dense
                        outlined
                        type="date"
                        label="Tanggal"
                        stack-label
                        :rules="[required]"
                      />
                    </div>

                    <div class="col-12 col-md-6">
                      <q-select
                        v-model="produksiForm.source_obj"
                        :options="productionSourceOptions"
                        option-label="label"
                        option-value="value"
                        dense
                        outlined
                        use-input
                        input-debounce="250"
                        label="Planning Produksi / Schedule"
                        :loading="planningLoading"
                        :rules="[required]"
                        @filter="filterProductionSource"
                        @update:model-value="handleProductionSourceSelected"
                      >
                        <template #prepend>
                          <q-icon name="assignment_turned_in" color="green-10" />
                        </template>
                        <template #option="scope">
                          <q-item v-bind="scope.itemProps">
                            <q-item-section>
                              <q-item-label class="text-weight-bold">
                                {{ scope.opt.label }}
                              </q-item-label>
                              <q-item-label caption>
                                {{ scope.opt.typeLabel }} - {{ scope.opt.customer_nama || '-' }} -
                                {{ scope.opt.nama_produk || '-' }} - Qty {{ formatNumber(scope.opt.qty_target) }}
                              </q-item-label>
                            </q-item-section>
                          </q-item>
                        </template>
                      </q-select>
                    </div>

                    <div class="col-12 col-md-6">
                      <q-input v-model="produksiForm.nomor_po" dense outlined label="Nomor Planning" readonly>
                        <template #prepend>
                          <q-icon name="receipt_long" color="green-10" />
                        </template>
                      </q-input>
                    </div>

                    <div class="col-12 col-md-6">
                      <q-input v-model="produksiForm.customer_nama" dense outlined label="Customer" readonly>
                        <template #prepend>
                          <q-icon name="business" color="green-10" />
                        </template>
                      </q-input>
                    </div>

                    <div class="col-12 col-md-6">
                      <q-input
                        :model-value="formatNumber(produksiForm.qty_po)"
                        dense
                        outlined
                        label="Qty Target"
                        readonly
                        :rules="[() => requiredNumber(produksiForm.qty_po)]"
                      >
                        <template #prepend>
                          <q-icon name="format_list_numbered" color="green-10" />
                        </template>
                      </q-input>
                    </div>

                    <div class="col-12 col-md-6">
                      <q-input v-model="produksiForm.nama_produk" dense outlined label="Produk" readonly>
                        <template #prepend>
                          <q-icon name="inventory" color="green-10" />
                        </template>
                      </q-input>
                    </div>

                    <div class="col-12 col-md-6">
                      <q-input
                        v-model.number="produksiForm.qty_hasil_jadi"
                        dense
                        outlined
                        type="number"
                        min="0"
                        label="Qty Hasil Hari Ini"
                        :rules="[requiredNumber]"
                      />
                    </div>

                    <div class="col-12 col-md-6">
                      <q-input v-model="produksiForm.satuan" dense outlined label="Satuan" readonly>
                        <template #prepend>
                          <q-icon name="straighten" color="green-10" />
                        </template>
                      </q-input>
                    </div>

                    <div class="col-12 col-md-6">
                      <q-select
                        v-model="produksiForm.status_produksi"
                        :options="statusProduksiOptions"
                        dense
                        outlined
                        label="Status Produksi"
                        :rules="[required]"
                      />
                    </div>

                    <div class="col-12">
                      <q-input
                        :model-value="departemenTitle"
                        dense
                        outlined
                        label="Departemen"
                        readonly
                      >
                        <template #prepend>
                          <q-icon name="corporate_fare" color="green-10" />
                        </template>
                      </q-input>
                    </div>

                    <div class="col-12">
                      <q-input
                        v-model.trim="produksiForm.catatan"
                        dense
                        outlined
                        type="textarea"
                        autogrow
                        label="Catatan"
                      />
                    </div>
                  </div>
                </q-card-section>
              </q-card>

              <q-card flat bordered class="produksi-form-card bg-white q-mt-md">
                <q-card-section>
                  <div class="row q-col-gutter-md">
                    <div class="col-6 col-md-3">
                      <div class="metric-label">Total Progress</div>
                      <div class="metric-value">{{ formatNumber(projectedTotalProduced) }}</div>
                    </div>
                    <div class="col-6 col-md-3">
                      <div class="metric-label">Sisa Qty</div>
                      <div class="metric-value">{{ formatNumber(projectedRemainingQty) }}</div>
                    </div>
                    <div class="col-12 col-md-6">
                      <div class="row items-center justify-between q-mb-xs">
                        <div class="metric-label">Progress</div>
                        <div class="text-weight-bold text-green-10">{{ projectedProgressPercent }}%</div>
                      </div>
                      <q-linear-progress
                        rounded
                        size="12px"
                        color="green-10"
                        track-color="green-1"
                        :value="projectedProgressPercent / 100"
                      />
                    </div>
                  </div>
                </q-card-section>
              </q-card>

              <q-card flat bordered class="produksi-form-card bg-white q-mt-md">
                <q-card-section class="row items-center">
                  <div>
                    <div class="text-subtitle1 text-weight-bolder text-green-10">Histori Produksi</div>
                    <div class="text-caption text-grey-7">Data realtime dari histori produksi sumber terpilih.</div>
                  </div>
                  <q-space />
                  <q-badge color="green-10" class="text-weight-bold">
                    {{ selectedProductionHistoryRows.length }}
                  </q-badge>
                </q-card-section>
                <q-separator />
                <q-table
                  :rows="selectedProductionHistoryRows"
                  :columns="productionHistoryColumns"
                  row-key="id"
                  flat
                  dense
                  :pagination="{ rowsPerPage: 5 }"
                >
                  <template #body-cell-qty_hasil_jadi="props">
                    <q-td :props="props" class="text-right text-weight-bold">
                      {{ formatNumber(props.row.qty_hasil_hari_ini || props.row.qty_hasil_jadi) }}
                    </q-td>
                  </template>
                  <template #body-cell-progress_percent="props">
                    <q-td :props="props">
                      <q-linear-progress
                        rounded
                        size="9px"
                        color="green-10"
                        track-color="green-1"
                        :value="Number(props.row.progress_percent || 0) / 100"
                      />
                      <div class="text-caption text-right">{{ Number(props.row.progress_percent || 0) }}%</div>
                    </q-td>
                  </template>
                  <template #no-data>
                    <div class="full-width row flex-center text-grey-7 q-pa-md">
                      Belum ada histori produksi untuk sumber ini.
                    </div>
                  </template>
                </q-table>
              </q-card>
            </q-form>
          </div>
        </q-card-section>

        <div class="produksi-save-mobile">
          <q-btn
            unelevated
            color="green-10"
            icon="save"
            label="Simpan Data"
            no-caps
            class="full-width text-weight-bold"
            :loading="savingProduksi"
            :disable="savingProduksi"
            @click="handleSaveProduksiClick"
          />
        </div>
      </q-card>
    </q-dialog>

    <q-dialog
      v-model="permintaanDialog"
      persistent
      maximized
      transition-show="slide-up"
      transition-hide="slide-down"
      backdrop-filter="blur(4px)"
    >
      <q-card class="bg-grey-2 column no-wrap">
        <q-toolbar class="bg-white text-green-10 q-py-md shadow-2 shrink">
          <q-btn flat round dense icon="close" color="grey-7" @click="closePermintaanDialog" />
          <q-toolbar-title class="text-weight-bold text-center">
            PERMINTAAN BARANG DEPARTEMEN
          </q-toolbar-title>
          <q-btn
            unelevated
            color="green-10"
            icon="save"
            label="Simpan Permintaan"
            rounded
            no-caps
            class="q-px-xl text-weight-bold shadow-3"
            :loading="savingPermintaan"
            @click="permintaanFormRef?.submit()"
          />
        </q-toolbar>

        <q-card-section class="col scroll q-pa-lg q-pa-md-xl">
          <div class="row justify-center">
            <div class="col-12 col-xl-10">
              <q-form ref="permintaanFormRef" @submit.prevent="savePermintaanBarang">
                <q-card flat bordered class="rounded-20 bg-white shadow-1 q-pa-lg q-pa-md-xl">
                  <div class="row items-center q-mb-lg">
                    <q-avatar
                      size="48px"
                      color="green-1"
                      text-color="green-10"
                      icon="shopping_basket"
                      class="q-mr-md"
                    />
                    <div>
                      <div class="text-h6 text-weight-bolder text-green-10">
                        Form Permintaan Barang
                      </div>
                      <div class="text-caption text-grey-7">
                        PO approved, customer, barang, kategori, dan satuan ditarik realtime dari
                        master data manufacturing.
                      </div>
                    </div>
                  </div>

                  <div class="row q-col-gutter-lg">
                    <div class="col-12 col-md-4">
                      <q-input
                        v-model="permintaanForm.tanggal"
                        outlined
                        type="date"
                        label="Tanggal"
                        stack-label
                        :rules="[required]"
                      />
                    </div>

                    <div class="col-12 col-md-8">
                      <q-select
                        v-model="permintaanForm.nomor_po_obj"
                        :options="approvedPoOptions"
                        option-label="label"
                        option-value="value"
                        outlined
                        use-input
                        input-debounce="250"
                        label="Nomor PO Approved"
                        :loading="poOptionsLoading"
                        :rules="[required]"
                        @filter="filterApprovedPo"
                        @update:model-value="handlePermintaanPoSelected"
                      >
                        <template #prepend>
                          <q-icon name="receipt_long" color="green-10" />
                        </template>
                        <template #option="scope">
                          <q-item v-bind="scope.itemProps">
                            <q-item-section>
                              <q-item-label class="text-weight-bold">
                                {{ scope.opt.label }}
                              </q-item-label>
                              <q-item-label caption>
                                {{ scope.opt.customerName || '-' }} - Produk:
                                {{ scope.opt.nama_produk || '-' }} - Qty:
                                {{ formatNumber(scope.opt.qty_po) }}
                              </q-item-label>
                            </q-item-section>
                          </q-item>
                        </template>
                      </q-select>
                    </div>

                    <div class="col-12 col-md-6">
                      <q-select
                        v-model="permintaanForm.customer_obj"
                        :options="customerOptions"
                        option-label="label"
                        option-value="value"
                        outlined
                        use-input
                        input-debounce="250"
                        label="Customer"
                        :loading="customerOptionsLoading"
                        :readonly="!!permintaanForm.nomor_po_obj"
                        :rules="[required]"
                        @filter="filterCustomers"
                      >
                        <template #prepend>
                          <q-icon name="business" color="green-10" />
                        </template>
                      </q-select>
                    </div>

                    <div class="col-12 col-md-6">
                      <q-select
                        v-model="permintaanForm.barang_obj"
                        :options="barangOptions"
                        option-label="label"
                        option-value="value"
                        outlined
                        use-input
                        input-debounce="250"
                        label="Nama Barang"
                        :loading="barangOptionsLoading"
                        :rules="[required]"
                        @filter="filterBarang"
                        @update:model-value="handleBarangSelected"
                      >
                        <template #prepend>
                          <q-icon name="inventory_2" color="green-10" />
                        </template>
                        <template #option="scope">
                          <q-item v-bind="scope.itemProps">
                            <q-item-section>
                              <q-item-label class="text-weight-bold">
                                {{ scope.opt.label }}
                              </q-item-label>
                              <q-item-label caption>
                                {{ scope.opt.kategori || '-' }} - {{ scope.opt.satuan || '-' }}
                              </q-item-label>
                            </q-item-section>
                          </q-item>
                        </template>
                      </q-select>
                    </div>

                    <div class="col-12 col-md-6">
                      <q-select
                        v-model="permintaanForm.kategori_obj"
                        :options="kategoriBarangOptions"
                        option-label="label"
                        option-value="value"
                        outlined
                        use-input
                        input-debounce="250"
                        label="Kategori Barang"
                        :loading="kategoriBarangOptionsLoading"
                        :readonly="!!permintaanForm.barang_obj"
                        :rules="[required]"
                        @filter="filterKategoriBarang"
                      >
                        <template #prepend>
                          <q-icon name="category" color="green-10" />
                        </template>
                      </q-select>
                    </div>

                    <div class="col-12 col-md-3">
                      <q-input
                        v-model.number="permintaanForm.qty"
                        outlined
                        type="number"
                        label="Qty"
                        :rules="[requiredNumber]"
                      />
                    </div>

                    <div class="col-12 col-md-3">
                      <q-select
                        v-model="permintaanForm.satuan_obj"
                        :options="satuanOptions"
                        option-label="label"
                        option-value="value"
                        outlined
                        use-input
                        input-debounce="250"
                        label="Satuan"
                        :loading="satuanOptionsLoading"
                        :readonly="!!permintaanForm.barang_obj"
                        :rules="[required]"
                        @filter="filterSatuan"
                      >
                        <template #prepend>
                          <q-icon name="straighten" color="green-10" />
                        </template>
                      </q-select>
                    </div>

                    <div class="col-12">
                      <q-input
                        :model-value="departemenTitle"
                        outlined
                        label="Tujuan Departemen"
                        readonly
                      >
                        <template #prepend>
                          <q-icon name="corporate_fare" color="green-10" />
                        </template>
                      </q-input>
                    </div>

                    <div class="col-12">
                      <q-input
                        v-model.trim="permintaanForm.keterangan"
                        outlined
                        type="textarea"
                        autogrow
                        label="Keterangan"
                        placeholder="Catatan kebutuhan barang untuk departemen..."
                      />
                    </div>
                  </div>
                </q-card>
              </q-form>

              <q-card flat bordered class="rounded-20 bg-white shadow-1 q-mt-lg overflow-hidden">
                <q-card-section class="row items-center justify-between q-pa-md">
                  <div>
                    <div class="text-subtitle1 text-weight-bolder text-green-10">
                      Riwayat Permintaan Departemen
                    </div>
                    <div class="text-caption text-grey-7">
                      Data realtime dari collection manufactur_permintaan_barang.
                    </div>
                  </div>
                  <q-chip dense color="green-10" text-color="white" class="text-weight-bold">
                    {{ filteredPermintaanRows.length }} REQUEST
                  </q-chip>
                </q-card-section>
                <q-separator />
                <q-table
                  :rows="filteredPermintaanRows"
                  :columns="permintaanColumns"
                  row-key="id"
                  flat
                  binary-state-sort
                  :loading="permintaanRowsLoading"
                  :pagination="{ rowsPerPage: 6 }"
                >
                  <template #header="props">
                    <q-tr :props="props" class="bg-green-10 text-white">
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

                  <template #body-cell-tanggal="props">
                    <q-td :props="props">
                      {{ formatDate(props.row.tanggal) }}
                    </q-td>
                  </template>

                  <template #body-cell-nomor_surat="props">
                    <q-td :props="props">
                      <div class="text-weight-bold text-green-10">
                        {{ props.row.nomor_surat || '-' }}
                      </div>
                    </q-td>
                  </template>

                  <template #body-cell-qty="props">
                    <q-td :props="props" class="text-right">
                      {{ formatNumber(props.row.qty) }}
                    </q-td>
                  </template>

                  <template #body-cell-status="props">
                    <q-td :props="props">
                      <q-chip dense square color="orange-9" text-color="white">
                        {{ props.row.status || 'pending' }}
                      </q-chip>
                    </q-td>
                  </template>

                  <template #body-cell-aksi="props">
                    <q-td :props="props" class="text-center">
                      <q-btn
                        flat
                        round
                        dense
                        color="green-10"
                        icon="visibility"
                        @click="openSuratPreview(props.row)"
                      >
                        <q-tooltip>Preview surat</q-tooltip>
                      </q-btn>
                      <q-btn
                        flat
                        round
                        dense
                        color="primary"
                        icon="print"
                        @click="printSurat(props.row)"
                      >
                        <q-tooltip>Cetak surat</q-tooltip>
                      </q-btn>
                      <q-btn
                        flat
                        round
                        dense
                        color="negative"
                        icon="picture_as_pdf"
                        @click="exportSuratPdf(props.row)"
                      >
                        <q-tooltip>Export PDF</q-tooltip>
                      </q-btn>
                    </q-td>
                  </template>
                </q-table>
              </q-card>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog
      v-model="suratPreviewDialog"
      maximized
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card class="bg-grey-2 column no-wrap">
        <q-toolbar class="bg-white text-green-10 q-py-md shadow-2 shrink">
          <q-btn flat round dense icon="close" color="grey-7" @click="suratPreviewDialog = false" />
          <q-toolbar-title class="text-weight-bold text-center">
            PREVIEW SURAT PERMINTAAN BARANG
          </q-toolbar-title>
          <q-btn
            unelevated
            color="green-10"
            icon="print"
            label="Cetak"
            rounded
            no-caps
            class="q-px-lg text-weight-bold"
            @click="printSurat(selectedSurat)"
          />
          <q-btn
            unelevated
            color="negative"
            icon="picture_as_pdf"
            label="PDF"
            rounded
            no-caps
            class="q-ml-sm q-px-lg text-weight-bold"
            @click="exportSuratPdf(selectedSurat)"
          />
        </q-toolbar>

        <q-card-section class="col scroll q-pa-md q-pa-md-xl">
          <div class="row justify-center">
            <div class="col-12 col-lg-9 col-xl-8">
              <div class="surat-preview bg-white shadow-2" v-html="selectedSuratHtml"></div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <div class="q-py-xl"></div>
  </q-page>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { date, useQuasar } from 'quasar'
import { useRoute } from 'vue-router'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import { db } from 'src/boot/firebase'

const $q = useQuasar()
const route = useRoute()

const rows = ref([])
const planningRows = ref([])
const knownPlanningIds = ref(new Set())
const notificationRows = ref([])
const rejectQcRows = ref([])
const departmentViewTab = ref('planning')
const loading = ref(true)
const planningLoading = ref(true)
const rejectQcLoading = ref(true)
const search = ref('')
const departemen = ref(null)
const produksiDialog = ref(false)
const permintaanDialog = ref(false)
const suratPreviewDialog = ref(false)
const savingProduksi = ref(false)
const savingPermintaan = ref(false)
const processingRejectQcId = ref(null)
const produksiFormRef = ref(null)
const permintaanFormRef = ref(null)
const satuanRawOptions = ref([])
const satuanOptions = ref([])
const customerRawOptions = ref([])
const customerOptions = ref([])
const approvedPoRawOptions = ref([])
const approvedPoOptions = ref([])
const produkRawOptions = ref([])
const produkOptions = ref([])
const barangRawOptions = ref([])
const barangOptions = ref([])
const kategoriBarangRawOptions = ref([])
const kategoriBarangOptions = ref([])
const permintaanRows = ref([])
const selectedSurat = ref(null)
const satuanOptionsLoading = ref(true)
const customerOptionsLoading = ref(true)
const poOptionsLoading = ref(true)
const produkOptionsLoading = ref(true)
const barangOptionsLoading = ref(true)
const kategoriBarangOptionsLoading = ref(true)
const permintaanRowsLoading = ref(true)
let unsubscribeProduksi = null
let unsubscribePlanning = null
let unsubscribeSatuanOptions = null
let unsubscribeCustomerOptions = null
let unsubscribePoOptions = null
let unsubscribeProdukOptions = null
let unsubscribeBarangOptions = null
let unsubscribeKategoriBarangOptions = null
let unsubscribePermintaanRows = null
let unsubscribeDepartmentNotifications = null
let unsubscribeRejectQcRows = null

const statusProduksiOptions = ['Proses', 'Finished', 'Tertunda', 'Batal']

const PRODUKSI_COLLECTION = 'manufactur_departemen_produksi'
const PERMINTAAN_BARANG_COLLECTION = 'manufactur_permintaan_barang'
const MASTER_DEPARTEMEN_COLLECTION = 'manufactur_master_departemen'
const MASTER_SATUAN_COLLECTION = 'manufactur_master_satuan'
const MASTER_CUSTOMER_COLLECTION = 'manufacturing_customers'
const MASTER_BARANG_COLLECTION = 'manufactur_master_barang'
const KATEGORI_BARANG_COLLECTION = 'manufactur_master_kategori_barang'
const MASTER_PRODUK_COLLECTION = 'master_produk'
const PO_CUSTOMER_COLLECTION = 'manufacturing_po_customer'
const RUNNING_NUMBER_COLLECTION = 'manufactur_running_number'
const PLANNING_COLLECTION = 'mf_production_planning'
const DEPARTEMENT_NOTIFICATION_COLLECTION = 'manufactur_departemen_notifications'
const REWORK_QUEUE_COLLECTION = 'produksi_rework_queue'
const QC_COLLECTION = 'qc_produksi_manufaktur'

const produksiCollection = collection(db, PRODUKSI_COLLECTION)
const permintaanBarangCollection = collection(db, PERMINTAAN_BARANG_COLLECTION)

const unreadQcRejectNotifications = computed(() =>
  notificationRows.value.filter((item) => item.type === 'qc_reject' && item.is_read !== true),
)

const normalizeRejectStatus = (status) => String(status || '').trim().toLowerCase()

const activeRejectQcRows = computed(() =>
  rejectQcRows.value.filter((row) => !['selesai'].includes(normalizeRejectStatus(row.status_rework))),
)

const mapOption = (itemDoc, labelKeys = ['nama']) => {
  const data = itemDoc.data()
  const label =
    labelKeys.map((key) => data[key]).find((value) => value !== undefined && value !== null) ||
    data.nama ||
    itemDoc.id

  return {
    id: itemDoc.id,
    value: itemDoc.id,
    label,
    ...data,
  }
}

const listenCollectionOptions = (collectionName, orderField, callback, errorCallback, labelKeys) =>
  onSnapshot(
    query(collection(db, collectionName), orderBy(orderField)),
    (snapshot) => callback(snapshot.docs.map((itemDoc) => mapOption(itemDoc, labelKeys))),
    errorCallback,
  )

const normalizeComparable = (value) =>
  String(value ?? '')
    .trim()
    .toLowerCase()

const productionRowMatchesDepartment = (row, departemenIdValue, departemenNameValue, departemenCodeValue) => {
  const targetId = normalizeComparable(departemenIdValue)
  const targetName = normalizeComparable(departemenNameValue)
  const targetCode = normalizeComparable(departemenCodeValue)
  const rowDepartmentValues = [
    row.departemen_id,
    row.current_departemen_id,
    row.departemen?.id,
    row.departemen?.value,
    row.tujuan_departemen?.id,
    row.departemen_nama,
    row.nama_departemen,
    row.current_departemen_nama,
    row.departemen_asal,
    row.departemen?.nama_departemen,
    row.departemen?.nama,
    row.departemen?.label,
    row.tujuan_departemen?.nama_departemen,
    row.departemen_kode,
    row.kode_departemen,
    row.departemen?.kode_departemen,
    row.tujuan_departemen?.kode_departemen,
    typeof row.departemen === 'string' ? row.departemen : '',
  ].map(normalizeComparable)

  if (targetId && rowDepartmentValues.includes(targetId)) return true
  if (targetName && rowDepartmentValues.includes(targetName)) return true
  if (targetCode && rowDepartmentValues.includes(targetCode)) return true

  return !targetId && !targetName && !targetCode
}

const listenManufacturingDepartemenProduksi = (departemenIdValue, callback, errorCallback) =>
  onSnapshot(
    query(collection(db, PRODUKSI_COLLECTION), orderBy('created_at', 'desc')),
    (snapshot) => {
      const nextRows = snapshot.docs
        .map((itemDoc) => ({ id: itemDoc.id, ...itemDoc.data() }))
        .filter((row) =>
          productionRowMatchesDepartment(
            row,
            departemenIdValue,
            departemenTitle.value,
            departemenKode.value,
          ),
        )

      callback(nextRows)
    },
    errorCallback,
  )

const cleanFirestorePayload = (value) => {
  if (Array.isArray(value)) return value.map(cleanFirestorePayload)
  if (value && typeof value === 'object' && Object.getPrototypeOf(value) === Object.prototype) {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, itemValue]) => itemValue !== undefined)
        .map(([key, itemValue]) => [key, cleanFirestorePayload(itemValue)]),
    )
  }
  return value
}

const createManufacturingDepartemenProduksi = (payload) =>
  addDoc(produksiCollection, cleanFirestorePayload({
    ...payload,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  })).then((docRef) => docRef.id)

const updateManufacturingDepartemenProduksi = (id, payload) =>
  updateDoc(doc(db, PRODUKSI_COLLECTION, id), cleanFirestorePayload({
    ...payload,
    updated_at: serverTimestamp(),
  })).then(() => id)

const saveManufacturingDepartemenProduksi = (id, payload) =>
  id ? updateManufacturingDepartemenProduksi(id, payload) : createManufacturingDepartemenProduksi(payload)

const deleteManufacturingDepartemenProduksi = (id) => deleteDoc(doc(db, PRODUKSI_COLLECTION, id))

const getManufacturingMasterDepartemen = async (id) => {
  const snapshot = await getDoc(doc(db, MASTER_DEPARTEMEN_COLLECTION, id))
  if (!snapshot.exists()) return null
  return { id: snapshot.id, ...snapshot.data() }
}

const updateManufacturingPlanningProduksi = (planningId, payload) =>
  updateDoc(doc(db, PLANNING_COLLECTION, planningId), cleanFirestorePayload({
    ...payload,
    updated_at: serverTimestamp(),
  }))

const planningMatchesDepartemen = (row, departemenIdValue) => {
  const mappedSchedules = planningScheduleRows(row, false).filter(scheduleHasDepartment)
  if (mappedSchedules.length) {
    return mappedSchedules.some((schedule) =>
      scheduleMatchesDepartment(
        schedule,
        departemenIdValue,
        departemenTitle.value,
        departemenKode.value,
      ),
    )
  }

  if (row.all_departemen || row.routing_mode === 'all') {
    return Array.isArray(row.route_departemen)
      ? row.route_departemen.some((item) => item.id === departemenIdValue)
      : true
  }

  if (Array.isArray(row.route_departemen) && row.route_departemen.length) {
    return row.current_departemen_id === departemenIdValue
  }

  return (
    row.departemen_id === departemenIdValue ||
    row.tujuan_departemen?.id === departemenIdValue ||
    row.departemen_nama === departemenTitle.value
  )
}

const listenManufacturingDepartemenPlanning = (departemenIdValue, callback, errorCallback) =>
  onSnapshot(
    query(collection(db, PLANNING_COLLECTION), orderBy('created_at', 'desc')),
    (snapshot) => {
      const mappedRows = snapshot.docs
        .map((planningDoc) => ({ id: planningDoc.id, ...planningDoc.data() }))
        .filter((row) => planningMatchesDepartemen(row, departemenIdValue))
      callback(mappedRows)
    },
    errorCallback,
  )

const listenDepartmentNotifications = (departemenIdValue, callback, errorCallback) => {
  if (!departemenIdValue) {
    callback([])
    return () => {}
  }

  return onSnapshot(
    query(collection(db, DEPARTEMENT_NOTIFICATION_COLLECTION), where('departemen_id', '==', departemenIdValue)),
    (snapshot) => {
      callback(snapshot.docs.map((notificationDoc) => ({ id: notificationDoc.id, ...notificationDoc.data() })))
    },
    errorCallback,
  )
}

const listenRejectQcRows = (departemenIdValue, callback, errorCallback) => {
  if (!departemenIdValue) {
    callback([])
    return () => {}
  }

  return onSnapshot(
    query(collection(db, REWORK_QUEUE_COLLECTION), orderBy('tanggal_reject', 'desc')),
    (snapshot) => {
      callback(
        snapshot.docs
          .map((reworkDoc) => ({ id: reworkDoc.id, ...reworkDoc.data() }))
          .filter((row) =>
            productionRowMatchesDepartment(
              row,
              departemenIdValue,
              departemenTitle.value,
              departemenKode.value,
            ),
          ),
      )
    },
    errorCallback,
  )
}

const listenManufacturingSatuanOptions = (callback, errorCallback) =>
  listenCollectionOptions(MASTER_SATUAN_COLLECTION, 'nama', callback, errorCallback, ['nama'])

const listenManufacturingCustomerOptions = (callback, errorCallback) =>
  onSnapshot(
    query(collection(db, MASTER_CUSTOMER_COLLECTION), where('module', '==', 'manufacturing')),
    (snapshot) =>
      callback(
        snapshot.docs
          .map((itemDoc) => mapOption(itemDoc, ['nama', 'nama_customer', 'customerName']))
          .filter((item) => item.module === 'manufacturing')
          .sort((a, b) => String(a.label || '').localeCompare(String(b.label || ''))),
      ),
    errorCallback,
  )

const listenManufacturingBarangOptions = (callback, errorCallback) =>
  listenCollectionOptions(MASTER_BARANG_COLLECTION, 'nama', callback, errorCallback, [
    'nama',
    'nama_barang',
    'nama_material',
  ])

const listenManufacturingKategoriBarangOptions = (callback, errorCallback) =>
  listenCollectionOptions(KATEGORI_BARANG_COLLECTION, 'nama', callback, errorCallback, ['nama'])

const listenManufacturingMasterProdukOptions = (callback, errorCallback) =>
  onSnapshot(
    query(collection(db, MASTER_PRODUK_COLLECTION), orderBy('nama_produk')),
    (snapshot) =>
      callback(
        snapshot.docs.map((itemDoc) => {
          const data = itemDoc.data()
          return {
            id: itemDoc.id,
            value: itemDoc.id,
            label: data.nama_produk || data.nama || itemDoc.id,
            ...data,
          }
        }),
      ),
    errorCallback,
  )

const listenManufacturingApprovedPoOptions = (callback, errorCallback) =>
  onSnapshot(
    query(collection(db, PO_CUSTOMER_COLLECTION), where('status', '==', 'Approved')),
    (snapshot) =>
      callback(
        snapshot.docs.map((poDoc) => {
          const data = poDoc.data()
          const nomorPo = data.nomor || data.nomor_po || data.no_po || poDoc.id
          return {
            id: poDoc.id,
            value: poDoc.id,
            label: nomorPo,
            nomor: nomorPo,
            customerName:
              data.customerName ||
              data.customer_nama ||
              data.customer?.nama ||
              data.customer ||
              '',
            customer_id: data.customer_id || data.customer?.id || null,
            produk_id: data.produk_id || data.produk?.id || null,
            kode_produk: data.kode_produk || data.produk?.kode_produk || '',
            nama_produk:
              data.nama_produk ||
              data.produk?.nama_produk ||
              data.produk?.nama ||
              data.produk ||
              '',
            qty_po: Number(data.qty_po || data.qty || data.total_qty || data.qty_target || 0),
            total_po: Number(data.total_po || data.total_estimasi || data.total || 0),
            satuan: data.satuan || data.produk?.satuan || '',
            ...data,
          }
        }),
      ),
    errorCallback,
  )

const sanitizeKodeDepartemen = (value) =>
  String(value || 'MFG')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 12) || 'MFG'

const getSpbDateParts = (value) => {
  const rawDate = value ? new Date(value) : new Date()
  const safeDate = Number.isNaN(rawDate.getTime()) ? new Date() : rawDate
  return {
    bulan: date.formatDate(safeDate, 'MM'),
    tahun: date.formatDate(safeDate, 'YYYY'),
  }
}

const createManufacturingPermintaanBarang = async (payload) => {
  const kodeDepartemen = sanitizeKodeDepartemen(payload.tujuan_departemen?.kode_departemen)
  const { bulan, tahun } = getSpbDateParts(payload.tanggal)
  const counterId = `SPB_${kodeDepartemen}_${tahun}_${bulan}`
  const counterRef = doc(db, RUNNING_NUMBER_COLLECTION, counterId)
  const suratRef = doc(permintaanBarangCollection)

  return runTransaction(db, async (transaction) => {
    const counterSnapshot = await transaction.get(counterRef)
    const nextNumber = Number(counterSnapshot.data()?.last_number || 0) + 1
    const nomorSurat = `SPB-${kodeDepartemen}/${bulan}/${tahun}/${String(nextNumber).padStart(4, '0')}`

    transaction.set(
      counterRef,
      {
        last_number: nextNumber,
        updated_at: serverTimestamp(),
      },
      { merge: true },
    )
    transaction.set(suratRef, {
      ...payload,
      nomor_surat: nomorSurat,
      status: 'Pending',
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    })

    return {
      id: suratRef.id,
      nomor_surat: nomorSurat,
    }
  })
}

const listenManufacturingPermintaanBarang = (callback, errorCallback) =>
  onSnapshot(
    query(permintaanBarangCollection, orderBy('created_at', 'desc')),
    (snapshot) => callback(snapshot.docs.map((itemDoc) => ({ id: itemDoc.id, ...itemDoc.data() }))),
    errorCallback,
  )

const today = () => date.formatDate(new Date(), 'YYYY-MM-DD')

const emptyProduksiForm = () => ({
  tanggal: today(),
  source_obj: null,
  source_type: '',
  source_id: '',
  planning_obj: null,
  nomor_po_obj: null,
  customer_obj: null,
  produk_obj: null,
  nomor_po: '',
  customer_nama: '',
  produk_id: null,
  kode_produk: '',
  nama_produk: '',
  qty_po: null,
  total_po: null,
  qty_hasil_jadi: null,
  satuan_obj: null,
  satuan: '',
  status_produksi: 'Proses',
  catatan: '',
})

const emptyPermintaanForm = () => ({
  tanggal: today(),
  nomor_po_obj: null,
  customer_obj: null,
  barang_obj: null,
  kategori_obj: null,
  qty: null,
  satuan_obj: null,
  keterangan: '',
})

const produksiForm = ref(emptyProduksiForm())
const permintaanForm = ref(emptyPermintaanForm())

const departemenId = computed(() => route.params.id || route.query.departemen_id || '')
const departemenTitle = computed(
  () =>
    departemen.value?.nama_departemen ||
    route.query.nama_departemen ||
    route.query.departemen ||
    'Departemen Manufacturing',
)
const departemenKode = computed(() => departemen.value?.kode_departemen || route.query.kode || '')

const departemenPayload = computed(() => ({
  id: departemenId.value || null,
  kode_departemen: departemenKode.value || '',
  nama_departemen: departemenTitle.value,
}))

const columns = [
  { name: 'tanggal', label: 'Tanggal', field: 'tanggal', align: 'left', sortable: true },
  { name: 'customer_nama', label: 'Customer', field: 'customer_nama', align: 'left', sortable: true },
  { name: 'nomor_po', label: 'Nomor Planning', field: 'nomor_po', align: 'left', sortable: true },
  { name: 'nama_produk', label: 'Master Produk', field: 'nama_produk', align: 'left', sortable: true },
  { name: 'qty_po', label: 'Qty Target', field: 'qty_po', align: 'right', sortable: true },
  {
    name: 'qty_hasil_jadi',
    label: 'Qty Hasil Jadi',
    field: 'qty_hasil_jadi',
    align: 'right',
    sortable: true,
  },
  { name: 'satuan', label: 'Satuan', field: 'satuan', align: 'center', sortable: true },
  {
    name: 'status_produksi',
    label: 'Status Produksi',
    field: 'status_produksi',
    align: 'left',
    sortable: true,
  },
  { name: 'aksi', label: 'Aksi', field: 'aksi', align: 'center' },
]

const productionHistoryColumns = [
  { name: 'tanggal', label: 'Tanggal', field: 'tanggal', align: 'left', sortable: true },
  {
    name: 'qty_hasil_jadi',
    label: 'Qty Hari Ini',
    field: (row) => row.qty_hasil_hari_ini || row.qty_hasil_jadi,
    align: 'right',
    sortable: true,
  },
  { name: 'total_hasil_produksi', label: 'Total', field: 'total_hasil_produksi', align: 'right', sortable: true },
  { name: 'sisa_qty', label: 'Sisa', field: 'sisa_qty', align: 'right', sortable: true },
  { name: 'progress_percent', label: 'Progress', field: 'progress_percent', align: 'left', sortable: true },
  { name: 'status_produksi', label: 'Status', field: 'status_produksi', align: 'left', sortable: true },
  { name: 'catatan', label: 'Catatan', field: 'catatan', align: 'left' },
]

const planningColumns = [
  { name: 'nomor_planning', label: 'Nomor Planning', field: 'nomor_planning', align: 'left', sortable: true },
  { name: 'customer', label: 'Customer', field: 'customer_nama', align: 'left', sortable: true },
  { name: 'produk', label: 'Produk', field: 'nama_produk', align: 'left', sortable: true },
  { name: 'qty_target', label: 'Qty Target', field: 'qty_target', align: 'right', sortable: true },
  { name: 'deadline', label: 'Deadline', field: 'deadline', align: 'left', sortable: true },
  { name: 'prioritas', label: 'Prioritas', field: 'prioritas', align: 'center', sortable: true },
  { name: 'status_planning', label: 'Status Planning', field: 'status_planning', align: 'center', sortable: true },
  { name: 'aksi', label: 'Aksi', field: 'aksi', align: 'center' },
]

const rejectQcColumns = [
  { name: 'reference', label: 'Reference', field: 'reference', align: 'left', sortable: true },
  { name: 'nama_produk', label: 'Produk', field: 'nama_produk', align: 'left', sortable: true },
  { name: 'qty_reject', label: 'Qty Reject', field: 'qty_reject', align: 'right', sortable: true },
  { name: 'qty_rework', label: 'Qty Rework', field: 'qty_rework', align: 'right', sortable: true },
  { name: 'alasan_reject', label: 'Alasan Reject', field: 'alasan_reject', align: 'left', sortable: true },
  { name: 'tanggal_qc', label: 'Tanggal QC', field: 'tanggal_qc', align: 'left', sortable: true },
  { name: 'status_rework', label: 'Status Rework', field: 'status_rework', align: 'left', sortable: true },
  { name: 'aksi', label: 'Aksi', field: 'aksi', align: 'center' },
]

const permintaanColumns = [
  { name: 'nomor_surat', label: 'Nomor Surat', field: 'nomor_surat', align: 'left', sortable: true },
  { name: 'tanggal', label: 'Tanggal', field: 'tanggal', align: 'left', sortable: true },
  { name: 'nomor_po', label: 'PO', field: 'nomor_po', align: 'left', sortable: true },
  { name: 'customer_nama', label: 'Customer', field: 'customer_nama', align: 'left', sortable: true },
  { name: 'nama_barang', label: 'Barang', field: 'nama_barang', align: 'left', sortable: true },
  {
    name: 'kategori_barang',
    label: 'Kategori',
    field: 'kategori_barang',
    align: 'left',
    sortable: true,
  },
  { name: 'qty', label: 'Qty', field: 'qty', align: 'right', sortable: true },
  { name: 'satuan', label: 'Satuan', field: 'satuan', align: 'center', sortable: true },
  { name: 'status', label: 'Status', field: 'status', align: 'left', sortable: true },
  { name: 'aksi', label: 'Surat', field: 'aksi', align: 'center' },
]

const required = (val) => !!val || 'Field wajib diisi'
const toFiniteNumber = (value) => {
  if (value === null || value === undefined || value === '') return 0
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}
const requiredNumber = (val) => {
  if (val === null || val === undefined || val === '') return 'Nilai wajib diisi'
  return Number.isFinite(Number(val)) && Number(val) > 0 ? true : 'Nilai harus berupa angka lebih dari 0'
}

const departmentMatches = (row) => {
  return productionRowMatchesDepartment(
    row,
    departemenId.value,
    departemenTitle.value,
    departemenKode.value,
  )
}

const filteredRows = computed(() => {
  const term = search.value.toLowerCase().trim()

  return rows.value.filter((row) => {
    const matchesDepartment = departmentMatches(row)
    const matchesSearch =
      !term ||
      [
        row.tanggal,
        row.customer_nama,
        row.nomor_po,
        row.nama_produk,
        row.kode_produk,
        row.qty_po,
        row.qty_hasil_jadi,
        row.satuan,
        row.status_produksi,
      ]
        .join(' ')
        .toLowerCase()
        .includes(term)

    return matchesDepartment && matchesSearch
  })
})

const currentPlanningRouteStep = (row) =>
  Array.isArray(row.route_departemen)
    ? row.route_departemen.find((item) => item.id === departemenId.value)
    : null

const isPlanningActiveForCurrentDepartemen = (row) => {
  const status = normalizeComparable(row.status_planning || row.planning_status || row.status)
  if (['selesai', 'finished', 'done', 'cancelled', 'batal'].includes(status)) return false

  const routeStep = currentPlanningRouteStep(row)
  const mappedSchedules = planningScheduleRows(row, false)
  if (mappedSchedules.some((schedule) => scheduleHasDepartment(schedule))) {
    return mappedSchedules.some((schedule) => scheduleMatchesDepartment(schedule))
  }
  if (row.all_departemen || row.routing_mode === 'all') {
    return !['Selesai', 'Finished', 'Diteruskan'].includes(routeStep?.status)
  }

  if (Array.isArray(row.route_departemen) && row.route_departemen.length) {
    return row.current_departemen_id === departemenId.value
  }

  return true
}

const normalizePriority = (priority) => {
  const normalized = String(priority || '').trim().toLowerCase()
  if (normalized === 'urgent') return 'Urgent'
  if (normalized === 'high') return 'High'
  if (normalized === 'low') return 'Low'
  return 'Medium'
}

const priorityRank = (priority) => {
  const normalized = normalizePriority(priority)
  if (normalized === 'Urgent') return 0
  if (normalized === 'High') return 1
  if (normalized === 'Medium') return 2
  return 3
}

const deadlineTime = (value) => {
  if (!value) return Number.MAX_SAFE_INTEGER
  const rawDate = typeof value.toDate === 'function' ? value.toDate() : new Date(value)
  const time = rawDate.getTime()
  return Number.isNaN(time) ? Number.MAX_SAFE_INTEGER : time
}

const comparePlanningWorkload = (a, b) => {
  const priorityDiff = priorityRank(a.priority || a.prioritas) - priorityRank(b.priority || b.prioritas)
  if (priorityDiff !== 0) return priorityDiff

  const deadlineDiff = deadlineTime(a.deadline) - deadlineTime(b.deadline)
  if (deadlineDiff !== 0) return deadlineDiff

  return String(a.nomor_planning || a.no_planning || a.id || '').localeCompare(
    String(b.nomor_planning || b.no_planning || b.id || ''),
  )
}

const activePlanningRows = computed(() =>
  planningRows.value.filter(isPlanningActiveForCurrentDepartemen).sort(comparePlanningWorkload),
)

const planningBaruCount = computed(
  () =>
    planningRows.value.filter((row) => {
      const routeStep = currentPlanningRouteStep(row)
      const routeIsNew = row.all_departemen || row.routing_mode === 'all' ? routeStep?.is_new !== false : row.is_new !== false
      return routeIsNew && isPlanningActiveForCurrentDepartemen(row)
    }).length,
)

const productionSourceMatches = (row, source) => {
  if (!source) return false
  const matchesItem = !source.item_id || !row.item_id || row.item_id === source.item_id
  const matchesSchedule = !source.schedule_key || row.schedule_key === source.schedule_key
  if (source.type === 'planning') {
    return row.planning_id === source.id && matchesItem && matchesSchedule
  }
  return false
}

const selectedProductionHistoryRows = computed(() => {
  const source = produksiForm.value.source_obj
  if (!source) return []
  return rows.value.filter((row) => departmentMatches(row) && productionSourceMatches(row, source))
})

const producedQtyBeforeInput = computed(() =>
  selectedProductionHistoryRows.value.reduce(
    (total, row) => total + toFiniteNumber(row.qty_hasil_hari_ini || row.qty_hasil_jadi),
    0,
  ),
)

const currentInputQty = computed(() => toFiniteNumber(produksiForm.value.qty_hasil_jadi))

const targetQty = computed(() => toFiniteNumber(produksiForm.value.qty_po))

const projectedTotalProduced = computed(() => producedQtyBeforeInput.value + currentInputQty.value)

const projectedRemainingQty = computed(() => Math.max(targetQty.value - projectedTotalProduced.value, 0))

const projectedProgressPercent = computed(() => {
  if (!targetQty.value) return 0
  return Math.min(100, Math.round((projectedTotalProduced.value / targetQty.value) * 100))
})

const syncProductionRowState = (row) => {
  if (!row?.id) return
  const index = rows.value.findIndex((item) => item.id === row.id)
  if (index >= 0) {
    rows.value.splice(index, 1, { ...rows.value[index], ...row })
    return
  }
  rows.value = [{ ...row }, ...rows.value]
}

const normalizeProductionItem = (item = {}, index = 0) => {
  const qty = toFiniteNumber(item.qty ?? item.quantity ?? item.qty_target ?? item.qty_po)
  const harga = toFiniteNumber(item.harga ?? item.price ?? item.harga_satuan ?? item.unit_price)
  const namaProduk =
    item.nama_produk ||
    item.nama_barang ||
    item.deskripsi ||
    item.produk ||
    item.product ||
    `Item ${index + 1}`

  return {
    ...item,
    item_id: item.item_id || item.id || `item-${index + 1}`,
    nama_produk: namaProduk,
    deskripsi: item.deskripsi || namaProduk,
    qty,
    satuan: item.satuan || item.unit || 'Unit',
    harga,
    subtotal: toFiniteNumber(item.subtotal ?? item.total ?? qty * harga),
    produk_id: item.produk_id || item.product_id || item.id_produk || null,
    kode_produk: item.kode_produk || item.kode_barang || '',
  }
}

const itemNameOf = (item = {}) =>
  item.itemName ||
  item.item_name ||
  item.product_name ||
  item.nama_produk ||
  item.nama_barang ||
  item.name ||
  item.deskripsi ||
  item.product ||
  ''

const departmentFieldsOf = (source = {}) => {
  const nestedDepartment =
    source.department ||
    source.departemen ||
    source.tujuan_departemen ||
    source.department_obj ||
    source.departemen_obj ||
    {}

  return {
    department_id:
      source.departmentId ||
      source.department_id ||
      source.departemen_id ||
      source.department_key ||
      nestedDepartment.id ||
      nestedDepartment.value ||
      '',
    department_name:
      source.departmentName ||
      source.department_name ||
      source.departemen_nama ||
      source.nama_departemen ||
      source.departemen_terkait ||
      source.group_name ||
      source.nama_group ||
      source.tahapan ||
      source.nama_tahapan ||
      (typeof source.department === 'string' ? source.department : '') ||
      (typeof source.departemen === 'string' ? source.departemen : '') ||
      nestedDepartment.nama_departemen ||
      nestedDepartment.name ||
      nestedDepartment.label ||
      '',
    department_code:
      source.departmentCode ||
      source.department_code ||
      source.departemen_kode ||
      source.kode_departemen ||
      nestedDepartment.kode_departemen ||
      nestedDepartment.code ||
      '',
  }
}

const scheduleItemMapping = (schedule = {}, planning = {}) => {
  const scheduleItemId = String(schedule.item_id || schedule.itemId || '')
  const scheduleItemName = normalizeComparable(
    schedule.itemName || schedule.product_name || schedule.product,
  )
  const candidates = [
    ...(Array.isArray(planning.schedule_document?.items) ? planning.schedule_document.items : []),
    ...(Array.isArray(planning.items) ? planning.items : []),
    ...(Array.isArray(planning.products) ? planning.products : []),
  ]

  return candidates.find((item) => {
    const itemId = String(item.itemId || item.item_id || item.id || item.product_id || '')
    const itemName = normalizeComparable(itemNameOf(item))
    return (
      (scheduleItemId && itemId && scheduleItemId === itemId) ||
      (scheduleItemName && itemName && scheduleItemName === itemName)
    )
  })
}

const normalizeScheduleRow = (schedule = {}, index = 0, planning = {}) => {
  const planningId = planning.id || planning.planning_id || ''
  const directDepartment = departmentFieldsOf(schedule)
  const mappedDepartment = departmentFieldsOf(scheduleItemMapping(schedule, planning) || {})

  return {
    key: schedule.key || `${planningId}_${schedule.date || index + 1}`,
    item_id: schedule.item_id || schedule.itemId || '',
    day: Number(schedule.day || index + 1),
    date: schedule.date || schedule.scheduleDate || '',
    target_qty: toFiniteNumber(schedule.target_qty ?? schedule.target_quantity ?? schedule.qty),
    actual_qty: toFiniteNumber(schedule.actual_qty ?? schedule.actual_quantity),
    status: schedule.status || 'not_started',
    customer: schedule.customer || '',
    product: schedule.product || schedule.product_name || schedule.itemName || '',
    department_id: directDepartment.department_id || mappedDepartment.department_id,
    department_name: directDepartment.department_name || mappedDepartment.department_name,
    department_code: directDepartment.department_code || mappedDepartment.department_code,
  }
}

const scheduleHasDepartment = (schedule = {}) =>
  Boolean(schedule.department_id || schedule.department_name || schedule.department_code)

const scheduleMatchesDepartment = (
  schedule = {},
  departmentIdValue = departemenId.value,
  departmentNameValue = departemenTitle.value,
  departmentCodeValue = departemenKode.value,
) => {
  const targetValues = [departmentIdValue, departmentNameValue, departmentCodeValue]
    .map(normalizeComparable)
    .filter(Boolean)
  const scheduleValues = [
    schedule.departmentId,
    schedule.department_id,
    schedule.departemen_id,
    schedule.departmentName,
    schedule.department_name,
    schedule.departemen_nama,
    schedule.departmentCode,
    schedule.department_code,
    schedule.departemen_kode,
  ]
    .map(normalizeComparable)
    .filter(Boolean)

  return targetValues.some((value) => scheduleValues.includes(value))
}

const buildScheduleDocument = (planning = {}, schedules = []) => {
  const normalizedSchedules = schedules.map((schedule, index) =>
    normalizeScheduleRow(schedule, index, planning),
  )
  const sourceItems = Array.isArray(planning.items) && planning.items.length
    ? planning.items
    : Array.isArray(planning.products)
      ? planning.products
      : []
  const normalizedItems = sourceItems.map((item, index) => {
    const normalizedItem = normalizeProductionItem(item, index)
    const itemId = normalizedItem.item_id || `item-${index + 1}`
    const itemName = normalizedItem.nama_produk
    const itemSchedules = normalizedSchedules.filter(
      (schedule) =>
        (schedule.item_id && String(schedule.item_id) === String(itemId)) ||
        String(schedule.product || '').trim().toLowerCase() === String(itemName || '').trim().toLowerCase(),
    )
    const orderedQty = toFiniteNumber(normalizedItem.qty)
    const producedByDepartment = itemSchedules.reduce((departments, schedule) => {
      const key = normalizeComparable(
        schedule.department_id || schedule.department_name || schedule.department_code || 'unassigned',
      )
      departments.set(key, Number(departments.get(key) || 0) + toFiniteNumber(schedule.actual_qty))
      return departments
    }, new Map())
    const actualProduced = Math.max(0, ...producedByDepartment.values())
    const remainingQty = Math.max(orderedQty - actualProduced, 0)
    const progressPercentage = orderedQty > 0
      ? Math.min(100, (actualProduced / orderedQty) * 100)
      : 0

    return {
      itemId,
      itemName,
      departments: Array.from(
        new Map(
          itemSchedules.map((schedule) => [
            schedule.department_id || schedule.department_name || schedule.department_code,
            {
              departmentId: schedule.department_id,
              departmentName: schedule.department_name,
              departmentCode: schedule.department_code,
            },
          ]),
        ).values(),
      ),
      orderedQty,
      targetPerDay: itemSchedules.length
        ? Math.max(...itemSchedules.map((schedule) => toFiniteNumber(schedule.target_qty)))
        : 0,
      actualProduced,
      remainingQty,
      progressPercentage,
      status: actualProduced >= orderedQty && orderedQty > 0 ? 'completed' : actualProduced > 0 ? 'in_progress' : 'not_started',
    }
  })
  const daysByKey = new Map()

  normalizedSchedules.forEach((schedule) => {
    const key = `${planning.id}_${schedule.date || schedule.day}`
    if (!daysByKey.has(key)) {
      daysByKey.set(key, {
        key,
        day: schedule.day,
        date: schedule.date,
        totalDailyTarget: 0,
        totalActualProduced: 0,
        itemBreakdown: [],
      })
    }
    const day = daysByKey.get(key)
    day.totalDailyTarget += toFiniteNumber(schedule.target_qty)
    day.totalActualProduced += toFiniteNumber(schedule.actual_qty)
    day.itemBreakdown.push({
      itemId: schedule.item_id,
      itemName: schedule.product,
      departmentId: schedule.department_id,
      departmentName: schedule.department_name,
      departmentCode: schedule.department_code,
      dailyTarget: toFiniteNumber(schedule.target_qty),
      actualProduced: toFiniteNumber(schedule.actual_qty),
      status: schedule.status,
      scheduleKey: schedule.key,
    })
  })

  const totalOrderedQty = normalizedItems.reduce((sum, item) => sum + item.orderedQty, 0)
  const totalProducedAllDays = normalizedItems.reduce((sum, item) => sum + item.actualProduced, 0)
  const remainingQty = Math.max(totalOrderedQty - totalProducedAllDays, 0)
  const progressPercentage = totalOrderedQty > 0
    ? Math.min(100, (totalProducedAllDays / totalOrderedQty) * 100)
    : 0

  return {
    planningId: planning.id || planning.planning_id || '',
    customer: planning.customer_name || planning.customer_nama || planning.customer || '',
    totalDays: Math.max(1, ...normalizedSchedules.map((schedule) => Number(schedule.day || 0))),
    totalOrderedQty,
    totalProducedAllDays,
    remainingQty,
    progressPercentage,
    status: progressPercentage >= 100 ? 'done' : progressPercentage > 0 ? 'in_progress' : 'not_started',
    items: normalizedItems,
    days: Array.from(daysByKey.values()).sort((a, b) => Number(a.day || 0) - Number(b.day || 0)),
  }
}

const planningScheduleRows = (planning = {}, filterCurrentDepartment = true) =>
  (Array.isArray(planning.production_schedule) ? planning.production_schedule : [])
    .map((schedule, index) => normalizeScheduleRow(schedule, index, planning))
    .filter(
      (schedule) =>
        !filterCurrentDepartment ||
        !scheduleHasDepartment(schedule) ||
        scheduleMatchesDepartment(schedule),
    )
    .filter((schedule) => schedule.target_qty > 0)

const normalizeProductionSource = (type, row, item = null, itemIndex = 0, schedule = null) => {
  const selectedItem = item ? normalizeProductionItem(item, itemIndex) : null
  const typeLabel = schedule ? 'Planning Schedule' : 'Planning Produksi'
  const nomorPo =
    row.nomor_planning ||
    row.no_planning ||
    row.planning_number ||
    row.nomor_po ||
    row.no_so ||
    row.nomor ||
    row.nomor_approved ||
    row.label ||
    ''
  const nomorRef =
    row.nomor_planning ||
    row.no_planning ||
    row.planning_number ||
    row.nomor ||
    row.nomor_approved ||
    row.id
  const customerNama = row.customer_nama || row.customerName || row.nama_customer || row.customer?.nama || row.customer || ''
  const namaProduk = schedule?.product || selectedItem?.nama_produk || row.nama_produk || row.item_produksi || row.produk?.nama_produk || row.produk?.nama || ''
  const qtyTarget = schedule
    ? toFiniteNumber(schedule.target_qty)
    : toFiniteNumber(selectedItem?.qty || row.qty_target || row.qty_po || row.qty || row.total_qty)
  const satuan = selectedItem?.satuan || row.satuan || row.produk?.satuan || ''
  const scheduleSuffix = schedule?.date ? ` - ${formatDate(schedule.date)}` : ''

  return {
    id: row.id,
    value: `${type}:${row.id}${selectedItem?.item_id ? `:${selectedItem.item_id}` : ''}${schedule?.key ? `:${schedule.key}` : ''}`,
    type,
    typeLabel,
    schedule_key: schedule?.key || '',
    schedule_date: schedule?.date || '',
    schedule_day: schedule?.day || null,
    department_id: schedule?.department_id || departemenId.value || '',
    department_name: schedule?.department_name || departemenTitle.value || '',
    department_code: schedule?.department_code || departemenKode.value || '',
    item_id: schedule?.item_id || selectedItem?.item_id || row.item_id || null,
    item_index: itemIndex,
    label: `${typeLabel} - ${nomorRef}${scheduleSuffix}${namaProduk ? ` - ${namaProduk}` : ''}`,
    item: row,
    nomor_ref: nomorRef,
    nomor_po: nomorPo,
    customer_id: row.customer_id || row.customer?.id || null,
    customer_nama: customerNama,
    produk_id: selectedItem?.produk_id || row.produk_id || row.produk?.id || null,
    kode_produk: selectedItem?.kode_produk || row.kode_produk || row.produk?.kode_produk || '',
    nama_produk: namaProduk,
    qty_target: qtyTarget,
    total_po: toFiniteNumber(selectedItem?.subtotal || row.total_po || row.total_estimasi || row.total),
    satuan,
    harga: toFiniteNumber(selectedItem?.harga),
    subtotal: toFiniteNumber(selectedItem?.subtotal),
  }
}

const allProductionSourceOptions = computed(() => [
  ...activePlanningRows.value.flatMap((row) => {
    const schedules = planningScheduleRows(row)
    if (schedules.length) {
      return schedules.map((schedule) => normalizeProductionSource('planning', row, null, 0, schedule))
    }
    return [normalizeProductionSource('planning', row)]
  }),
])

const productionSourceOptions = ref([])

watch(
  allProductionSourceOptions,
  (options) => {
    productionSourceOptions.value = options
  },
  { immediate: true },
)

const filteredPermintaanRows = computed(() =>
  permintaanRows.value.filter((row) => {
    if (!departemenId.value) {
      return (
        row.tujuan_departemen?.nama_departemen === departemenTitle.value ||
        row.tujuan_departemen === departemenTitle.value
      )
    }

    return (
      row.tujuan_departemen?.id === departemenId.value ||
      row.departemen_id === departemenId.value ||
      row.tujuan_departemen === departemenTitle.value
    )
  }),
)

const notify = (type, message) => {
  $q.notify({ type, message, position: 'top-right', timeout: 2200 })
}

const rejectStatusLabel = (status) => {
  const normalized = normalizeRejectStatus(status)
  if (normalized === 'menunggu_rework') return 'Menunggu Rework'
  if (normalized === 'diproses_ulang') return 'Diproses Ulang'
  if (normalized === 'pending_qc_ulang') return 'Pending QC Ulang'
  if (normalized === 'selesai') return 'Selesai'
  return status || 'Menunggu Rework'
}

const rejectStatusColor = (status) => {
  const normalized = normalizeRejectStatus(status)
  if (normalized === 'menunggu_rework') return 'negative'
  if (normalized === 'diproses_ulang') return 'purple-7'
  if (normalized === 'pending_qc_ulang') return 'orange-9'
  if (normalized === 'selesai') return 'positive'
  return 'blue-grey-6'
}

const rejectReference = (row = {}) =>
  row.nomor_planning || row.no_planning || row.planning_number || row.reference || '-'

const canProcessRejectQc = (row) => normalizeRejectStatus(row.status_rework) === 'menunggu_rework'
const canSendRejectQc = (row) => normalizeRejectStatus(row.status_rework) === 'diproses_ulang'

const updateRejectMonitoringProduction = async (row, payload) => {
  if (!row.production_source_id) return
  const productionRef = doc(db, PRODUKSI_COLLECTION, row.production_source_id)
  const productionSnap = await getDoc(productionRef)
  if (!productionSnap.exists()) return
  await updateDoc(productionRef, {
    ...payload,
    updated_at: serverTimestamp(),
  })
}

const processRejectQc = async (row) => {
  if (!row?.id) return
  processingRejectQcId.value = row.id
  try {
    await updateDoc(doc(db, REWORK_QUEUE_COLLECTION, row.id), {
      status_rework: 'diproses_ulang',
      processed_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    })
    await updateRejectMonitoringProduction(row, {
      status_produksi: 'rework',
      status: 'rework',
      status_rework: 'diproses_ulang',
    })
    notify('positive', 'Barang reject QC mulai diproses rework.')
  } catch (error) {
    console.error('[Departemen Reject QC] Gagal proses rework', { row, error })
    notify('negative', 'Gagal memproses rework.')
  } finally {
    processingRejectQcId.value = null
  }
}

const buildQcUlangPayload = (row) => ({
  rework_queue_id: row.id,
  production_source_id: row.production_source_id || '',
  source_type: 'rework',
  reference: rejectReference(row),
  nomor_planning: row.nomor_planning || row.no_planning || row.planning_number || '',
  nama_produk: row.nama_produk || row.produk || '',
  produk: row.produk || row.nama_produk || '',
  kode_produk: row.kode_produk || '',
  produk_id: row.produk_id || '',
  departemen_asal: row.departemen_asal || departemenTitle.value,
  departemen_id: row.departemen_id || departemenId.value || '',
  qty_produksi: Number(row.qty_rework || row.qty_reject || 0),
  qty_passed: 0,
  qty_rework: 0,
  qty_reject: 0,
  satuan: row.satuan || 'Unit',
  catatan_rework: row.alasan_reject || row.catatan_qc || '',
  status_qc: 'pending_qc',
  status_rework: 'pending_qc_ulang',
  created_at: serverTimestamp(),
  updated_at: serverTimestamp(),
})

const sendRejectQcAgain = async (row) => {
  if (!row?.id) return
  processingRejectQcId.value = row.id
  try {
    const qcRef = await addDoc(collection(db, QC_COLLECTION), buildQcUlangPayload(row))
    await updateDoc(doc(db, REWORK_QUEUE_COLLECTION, row.id), {
      status_rework: 'pending_qc_ulang',
      qc_ulang_id: qcRef.id,
      sent_to_qc_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    })
    await updateRejectMonitoringProduction(row, {
      status_produksi: 'pending_qc',
      status: 'pending_qc',
      status_qc: 'pending_qc',
      status_rework: 'pending_qc_ulang',
      qc_ulang_id: qcRef.id,
    })
    notify('positive', 'Barang rework dikirim ulang ke QC Produksi.')
  } catch (error) {
    console.error('[Departemen Reject QC] Gagal kirim ulang ke QC', { row, error })
    notify('negative', 'Gagal mengirim ulang ke QC.')
  } finally {
    processingRejectQcId.value = null
  }
}

const formatDate = (value) => {
  if (!value) return '-'
  const rawDate = typeof value.toDate === 'function' ? value.toDate() : new Date(value)
  if (Number.isNaN(rawDate.getTime())) return value
  return date.formatDate(rawDate, 'DD MMM YYYY')
}

const formatNumber = (value) => Number(value || 0).toLocaleString('id-ID')

const escapeHtml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')

const getSuratHtml = (row) => {
  const safeRow = row || {}
  const tujuanDepartemen =
    safeRow.tujuan_departemen?.nama_departemen || safeRow.tujuan_departemen || departemenTitle.value
  const kodeDepartemen =
    safeRow.tujuan_departemen?.kode_departemen || safeRow.kode_departemen || departemenKode.value || '-'

  return `
    <div class="surat-document">
      <div class="surat-header">
        <div>
          <div class="surat-brand">AGRA ERP</div>
          <div class="surat-company">Manufacturing Management System</div>
        </div>
        <div class="surat-meta">
          <div>Surat Permintaan Barang</div>
          <strong>${escapeHtml(safeRow.nomor_surat || '-')}</strong>
        </div>
      </div>

      <div class="surat-title">SURAT PERMINTAAN BARANG KE GUDANG</div>

      <div class="surat-info-grid">
        <div>
          <span>Tanggal</span>
          <strong>${escapeHtml(formatDate(safeRow.tanggal))}</strong>
        </div>
        <div>
          <span>Nomor PO</span>
          <strong>${escapeHtml(safeRow.nomor_po || '-')}</strong>
        </div>
        <div>
          <span>Customer</span>
          <strong>${escapeHtml(safeRow.customer_nama || safeRow.customer?.nama || '-')}</strong>
        </div>
        <div>
          <span>Departemen</span>
          <strong>${escapeHtml(tujuanDepartemen)} (${escapeHtml(kodeDepartemen)})</strong>
        </div>
      </div>

      <table class="surat-table">
        <thead>
          <tr>
            <th>No</th>
            <th>Nama Barang</th>
            <th>Kategori</th>
            <th>Qty</th>
            <th>Satuan</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>1</td>
            <td>${escapeHtml(safeRow.nama_barang || '-')}</td>
            <td>${escapeHtml(safeRow.kategori_barang || '-')}</td>
            <td class="text-right">${escapeHtml(formatNumber(safeRow.qty))}</td>
            <td>${escapeHtml(safeRow.satuan || '-')}</td>
            <td>${escapeHtml(safeRow.status || 'pending')}</td>
          </tr>
        </tbody>
      </table>

      <div class="surat-note">
        <span>Keterangan</span>
        <p>${escapeHtml(safeRow.keterangan || '-')}</p>
      </div>

      <div class="surat-signatures">
        <div>
          <span>Requester</span>
          <div class="signature-line"></div>
          <strong>${escapeHtml(tujuanDepartemen)}</strong>
        </div>
        <div>
          <span>Gudang</span>
          <div class="signature-line"></div>
          <strong>Warehouse</strong>
        </div>
      </div>
    </div>
  `
}

const selectedSuratHtml = computed(() => getSuratHtml(selectedSurat.value))

const statusColor = (status) => {
  if (status === 'Selesai' || status === 'Finished') return 'positive'
  if (status === 'Proses') return 'primary'
  if (status === 'Tertunda') return 'orange-9'
  if (status === 'Batal') return 'negative'
  return 'grey-7'
}

const priorityColor = (priority) => {
  const normalized = normalizePriority(priority)
  if (normalized === 'Urgent') return 'negative'
  if (normalized === 'High') return 'orange-9'
  if (normalized === 'Medium') return 'blue-grey-7'
  return 'green-8'
}

const planningStatusColor = (status) => {
  if (status === 'Selesai' || status === 'Finished') return 'positive'
  if (status === 'On Progress') return 'primary'
  if (status === 'Scheduled') return 'indigo-7'
  if (status === 'Draft') return 'orange-9'
  return 'blue-grey-6'
}

const filterByLabel = (options, needle) => {
  const term = String(needle || '').toLowerCase()
  if (!term) return options
  return options.filter((option) =>
    [
      option.label,
      option.nama,
      option.nama_barang,
      option.nama_customer,
      option.customerName,
      option.customer_nama,
      option.nomor,
      option.nomor_ref,
      option.typeLabel,
      option.kode_produk,
      option.nama_produk,
      option.kategori,
      option.satuan,
    ]
      .join(' ')
      .toLowerCase()
      .includes(term),
  )
}

const filterSatuan = (val, update) => {
  update(() => {
    satuanOptions.value = filterByLabel(satuanRawOptions.value, val)
  })
}

const filterCustomers = (val, update) => {
  update(() => {
    customerOptions.value = filterByLabel(customerRawOptions.value, val)
  })
}

const filterApprovedPo = (val, update) => {
  update(() => {
    approvedPoOptions.value = filterByLabel(approvedPoRawOptions.value, val)
  })
}

const filterProductionSource = (val, update) => {
  update(() => {
    productionSourceOptions.value = filterByLabel(allProductionSourceOptions.value, val)
  })
}

const filterBarang = (val, update) => {
  update(() => {
    barangOptions.value = filterByLabel(barangRawOptions.value, val)
  })
}

const filterKategoriBarang = (val, update) => {
  update(() => {
    kategoriBarangOptions.value = filterByLabel(kategoriBarangRawOptions.value, val)
  })
}

const findCustomerFromPo = (po) => {
  if (!po) return null

  const poCustomerId = po.customer_id || po.customerId || po.id_customer
  if (poCustomerId) {
    const byId = customerRawOptions.value.find((customer) => customer.id === poCustomerId)
    if (byId) return byId
  }

  const customerName = String(po.customerName || po.customer_nama || po.kepada_yth || '').trim()
  if (!customerName) return null

  return (
    customerRawOptions.value.find(
      (customer) => String(customer.label || '').toLowerCase() === customerName.toLowerCase(),
    ) || null
  )
}

const findProdukFromPo = (po) => {
  if (!po) return null

  const produkId = po.produk_id || po.product_id
  if (produkId) {
    const byId = produkRawOptions.value.find((produk) => produk.id === produkId)
    if (byId) return byId
  }

  const kodeProduk = String(po.kode_produk || po.kode_barang || '').trim()
  if (kodeProduk) {
    const byCode = produkRawOptions.value.find(
      (produk) => String(produk.kode_produk || '').toLowerCase() === kodeProduk.toLowerCase(),
    )
    if (byCode) return byCode
  }

  const produkName = String(po.nama_produk || po.produk || po.nama_barang || '').trim()
  if (!produkName) return null

  return (
    produkRawOptions.value.find(
      (produk) => String(produk.label || produk.nama_produk || '').toLowerCase() === produkName.toLowerCase(),
    ) || null
  )
}

const findSatuanFromValue = (value) => {
  const satuanValue = String(value || '').trim()
  if (!satuanValue) return null

  return (
    satuanRawOptions.value.find(
      (satuan) =>
        satuan.id === satuanValue ||
        String(satuan.label || satuan.nama || '').toLowerCase() === satuanValue.toLowerCase(),
    ) || {
      id: satuanValue,
      label: satuanValue,
      value: satuanValue,
      nama: satuanValue,
    }
  )
}

const sourceToOption = (source) => source || null

const applyProductionSource = (source) => {
  const selected = sourceToOption(source)
  if (!selected) return

  const customerOption =
    (selected.customer_nama
      ? { id: selected.customer_id || selected.customer_nama, label: selected.customer_nama, nama: selected.customer_nama }
      : null)
  const produkOption =
    (selected.nama_produk
      ? {
          id: selected.produk_id || selected.nama_produk,
          label: selected.nama_produk,
          nama_produk: selected.nama_produk,
          kode_produk: selected.kode_produk || '',
          satuan: selected.satuan || '',
        }
      : null)
  const satuanOption = findSatuanFromValue(selected.satuan || produkOption?.satuan)
  const planningOption = selected.item || null

  produksiForm.value.source_type = selected.type
  produksiForm.value.source_id = selected.id
  produksiForm.value.planning_obj = planningOption
  produksiForm.value.nomor_po_obj = null
  produksiForm.value.customer_obj = customerOption
  produksiForm.value.produk_obj = produkOption
  produksiForm.value.satuan_obj = satuanOption
  produksiForm.value.nomor_po = selected.nomor_ref || selected.nomor_po || ''
  produksiForm.value.customer_nama = selected.customer_nama || customerOption?.label || customerOption?.nama || ''
  produksiForm.value.produk_id = selected.produk_id || produkOption?.id || null
  produksiForm.value.kode_produk = selected.kode_produk || produkOption?.kode_produk || ''
  produksiForm.value.nama_produk = selected.nama_produk || produkOption?.label || produkOption?.nama_produk || ''
  produksiForm.value.qty_po = Number(selected.qty_target || 0)
  produksiForm.value.total_po = Number(selected.total_po || 0)
  produksiForm.value.satuan = selected.satuan || satuanOption?.label || satuanOption?.nama || ''
  produksiForm.value.qty_hasil_jadi = null
  produksiForm.value.status_produksi = 'Proses'
}

const handleProductionSourceSelected = (source) => {
  applyProductionSource(source)
}

const buildUpdatedRoute = (planning, status, extra = {}) =>
  (Array.isArray(planning.route_departemen) ? planning.route_departemen : []).map((item, index) =>
    item.id === departemenId.value
      ? {
          ...item,
          status,
          is_new: false,
          updated_at: new Date().toISOString(),
          ...extra,
        }
      : {
          ...item,
          urutan: item.urutan || index + 1,
        },
  )

const canStartPlanning = (planning) => {
  const status = planning.status_planning || planning.status
  if (['Selesai', 'Finished'].includes(status)) return false
  const step = currentPlanningRouteStep(planning)
  if (!step && status === 'On Progress') return false
  return !['Proses', 'Selesai', 'Finished', 'Diteruskan'].includes(step?.status)
}

const hasNextPlanningRoute = (planning) => {
  if (planning.all_departemen || planning.routing_mode === 'all') return false
  const route = Array.isArray(planning.route_departemen) ? planning.route_departemen : []
  if (!route.length) return false
  const currentIndex = Math.max(0, Number(planning.current_route_index || 0))
  return currentIndex < route.length - 1
}

const startPlanningStep = async (planning) => {
  try {
    if (!planning?.id) {
      notify('warning', 'Dokumen planning tidak valid.')
      return
    }
    const route = buildUpdatedRoute(planning, 'Proses')
    await updateManufacturingPlanningProduksi(planning.id, {
      route_departemen: route,
      status_planning: 'On Progress',
      status: 'On Progress',
      is_new: false,
    })
    notify('positive', 'Planning produksi mulai diproses.')
  } catch (error) {
    console.error(error)
    notify('negative', 'Gagal memperbarui status planning.')
  }
}

const finishPlanningStep = async (planning, metricsPayload = {}, options = {}) => {
  const silent = options.silent === true
  if (!planning?.id) {
    if (!silent) notify('warning', 'Dokumen planning tidak valid.')
    return
  }

  const route = buildUpdatedRoute(planning, 'Selesai', { finished_at: new Date().toISOString() })
  const currentIndex = Math.max(0, Number(planning.current_route_index || 0))
  const nextIndex = currentIndex + 1
  const nextDepartemen = route[nextIndex]
  const isAllMode = planning.all_departemen || planning.routing_mode === 'all'

  if (nextDepartemen && !isAllMode) {
    route[nextIndex] = {
      ...nextDepartemen,
      status: 'Menunggu Produksi',
      is_new: true,
    }
  }

  const allDone = isAllMode
    ? route.every((item) => ['Selesai', 'Finished'].includes(item.status))
    : !nextDepartemen

  try {
    await updateManufacturingPlanningProduksi(planning.id, {
      route_departemen: route,
      current_route_index: nextDepartemen && !isAllMode ? nextIndex : currentIndex,
      current_departemen_id: nextDepartemen && !isAllMode ? nextDepartemen.id : planning.current_departemen_id || departemenId.value,
      current_departemen_nama:
        nextDepartemen && !isAllMode
          ? nextDepartemen.nama_departemen
          : planning.current_departemen_nama || departemenTitle.value,
      departemen_id: nextDepartemen && !isAllMode ? nextDepartemen.id : planning.departemen_id || departemenId.value,
      status_planning: allDone ? 'Selesai' : 'On Progress',
      status: allDone ? 'Selesai' : 'On Progress',
      is_new: nextDepartemen && !isAllMode,
      ...metricsPayload,
    })
    if (!silent) {
      notify('positive', nextDepartemen && !isAllMode ? 'Planning diteruskan ke departemen berikutnya.' : 'Planning produksi selesai.')
    }
  } catch (error) {
    console.error(error)
    if (!silent) notify('negative', 'Gagal menyelesaikan planning produksi.')
    if (silent) throw error
  }
}

const findKategoriFromBarang = (barang) => {
  if (!barang) return null
  const kategoriValue = String(barang.kategori || barang.kategori_barang || '').trim()
  if (!kategoriValue) return null

  return (
    kategoriBarangRawOptions.value.find(
      (kategori) =>
        kategori.id === kategoriValue ||
        String(kategori.label || kategori.nama || '').toLowerCase() === kategoriValue.toLowerCase(),
    ) || {
      id: kategoriValue,
      label: kategoriValue,
      value: kategoriValue,
      nama: kategoriValue,
    }
  )
}

const findSatuanFromBarang = (barang) => {
  if (!barang) return null
  return findSatuanFromValue(barang.satuan || barang.unit)
}

const handlePermintaanPoSelected = (po) => {
  permintaanForm.value.customer_obj = findCustomerFromPo(po)

  if (po && !permintaanForm.value.customer_obj) {
    notify('warning', 'Customer pada PO belum cocok dengan Master Customer manufacturing.')
  }
}

const handleBarangSelected = (barang) => {
  permintaanForm.value.kategori_obj = findKategoriFromBarang(barang)
  permintaanForm.value.satuan_obj = findSatuanFromBarang(barang)

  if (barang && !permintaanForm.value.kategori_obj) {
    notify('warning', 'Kategori barang belum tersedia di Master Kategori Barang manufacturing.')
  }
  if (barang && !permintaanForm.value.satuan_obj) {
    notify('warning', 'Satuan barang belum tersedia di Master Satuan manufacturing.')
  }
}

const openProduksiDialog = () => {
  produksiForm.value = emptyProduksiForm()
  productionSourceOptions.value = allProductionSourceOptions.value
  produksiDialog.value = true
}

const closeProduksiDialog = () => {
  produksiDialog.value = false
  produksiForm.value = emptyProduksiForm()
}

const openPermintaanDialog = () => {
  permintaanForm.value = emptyPermintaanForm()
  permintaanDialog.value = true
}

const closePermintaanDialog = () => {
  permintaanDialog.value = false
  permintaanForm.value = emptyPermintaanForm()
}

const handleSaveProduksiClick = async () => {
  if (savingProduksi.value) return

  const isValid = await produksiFormRef.value?.validate?.()
  if (!isValid) {
    notify('warning', 'Lengkapi data input produksi terlebih dahulu.')
    return
  }

  await saveProduction()
}

const saveProduction = async () => {
  savingProduksi.value = true
  let productionHistorySaved = false
  try {
    const selectedSource = produksiForm.value.source_obj
    if (!selectedSource) {
      notify('warning', 'Pilih Planning Produksi atau schedule terlebih dahulu.')
      return
    }

    const selectedPlanning = produksiForm.value.planning_obj
    const selectedCustomer = produksiForm.value.customer_obj
    const selectedProduk = produksiForm.value.produk_obj
    const selectedSatuan = produksiForm.value.satuan_obj
    const qtyHariIniRaw = produksiForm.value.qty_hasil_jadi
    const qtyHariIni = toFiniteNumber(qtyHariIniRaw)
    const qtyTarget = toFiniteNumber(produksiForm.value.qty_po)
    const totalSebelumnya = selectedProductionHistoryRows.value.reduce(
      (total, row) => total + toFiniteNumber(row.qty_hasil_hari_ini || row.qty_hasil_jadi),
      0,
    )
    const totalHasil = totalSebelumnya + qtyHariIni
    const sisaQty = Math.max(qtyTarget - totalHasil, 0)
    const progressPercent = qtyTarget > 0 ? Math.min(100, Math.round((totalHasil / qtyTarget) * 100)) : 0
    const isFinished = qtyTarget > 0 && totalHasil >= qtyTarget
    const finalStatus = isFinished ? 'Finished' : 'Proses'

    if (qtyHariIniRaw === null || qtyHariIniRaw === undefined || qtyHariIniRaw === '') {
      notify('warning', 'Qty hasil hari ini wajib diisi.')
      return
    }

    if (!Number.isFinite(Number(qtyHariIniRaw)) || qtyHariIni <= 0) {
      notify('warning', 'Qty hasil hari ini wajib berupa angka lebih dari 0.')
      return
    }

    if (!departemenId.value) {
      notify('warning', 'Departemen tidak valid.')
      return
    }

    const productionPayload = {
      tanggal: produksiForm.value.tanggal,
      source_type: selectedSource.type,
      source_id: selectedSource.id,
      source_label: selectedSource.label,
      item_id: selectedSource.item_id || null,
      item_index: selectedSource.item_index ?? null,
      schedule_key: selectedSource.schedule_key || '',
      schedule_date: selectedSource.schedule_date || '',
      schedule_day: selectedSource.schedule_day || null,
      planning_id: selectedPlanning?.id || null,
      nomor_planning: selectedPlanning?.nomor_planning || selectedPlanning?.no_planning || '',
      nomor_po: produksiForm.value.nomor_po || selectedSource.nomor_ref || '',
      po_id: null,
      customer: {
        id: selectedCustomer?.id || null,
        nama: produksiForm.value.customer_nama || selectedCustomer?.label || selectedCustomer?.nama || '',
      },
      customer_id: selectedCustomer?.id || null,
      customer_nama: produksiForm.value.customer_nama || selectedCustomer?.label || selectedCustomer?.nama || '',
      produk: {
        id: produksiForm.value.produk_id || selectedProduk?.id || null,
        kode_produk: produksiForm.value.kode_produk || selectedProduk?.kode_produk || '',
        nama_produk: produksiForm.value.nama_produk || selectedProduk?.label || selectedProduk?.nama_produk || '',
      },
      produk_id: produksiForm.value.produk_id || selectedProduk?.id || null,
      kode_produk: produksiForm.value.kode_produk || selectedProduk?.kode_produk || '',
      nama_produk: produksiForm.value.nama_produk || selectedProduk?.label || selectedProduk?.nama_produk || '',
      qty_po: qtyTarget,
      qty_target: qtyTarget,
      total_po: toFiniteNumber(produksiForm.value.total_po),
      qty_hasil_hari_ini: qtyHariIni,
      qty_hasil_jadi: qtyHariIni,
      total_hasil_sebelumnya: totalSebelumnya,
      total_hasil_produksi: totalHasil,
      total_progress: totalHasil,
      sisa_qty: sisaQty,
      progress_percent: progressPercent,
      satuan: produksiForm.value.satuan || selectedSatuan?.label || selectedSatuan?.nama || '',
      satuan_id: selectedSatuan?.id || null,
      status_produksi: finalStatus,
      catatan: produksiForm.value.catatan || '',
      departemen: departemenPayload.value,
      departemen_id: departemenId.value || null,
      departemen_nama: departemenTitle.value,
      departemen_kode: departemenKode.value || '',
      current_departemen_id: departemenId.value || null,
      current_departemen_nama: departemenTitle.value,
      nama_departemen: departemenTitle.value,
      kode_departemen: departemenKode.value || '',
    }

    let savedProductionId = null
    try {
      savedProductionId = await saveManufacturingDepartemenProduksi(null, productionPayload)
      productionHistorySaved = true
    } catch (error) {
      console.error('Gagal menyimpan histori produksi departemen:', error)
      notify('negative', 'Gagal menyimpan data produksi.')
      return
    }

    try {
      const savedProductionSnapshot = await getDoc(doc(db, PRODUKSI_COLLECTION, savedProductionId))
      const savedProductionRow = savedProductionSnapshot.exists()
        ? { id: savedProductionSnapshot.id, ...savedProductionSnapshot.data() }
        : {
            id: savedProductionId,
            ...productionPayload,
          }
      syncProductionRowState(savedProductionRow)
    } catch (error) {
      console.error('Histori produksi tersimpan, tetapi refresh row lokal gagal:', error)
      syncProductionRowState({
        id: savedProductionId,
        ...productionPayload,
      })
    }

    const progressPayload = {
      status_produksi: finalStatus,
      qty_hasil_jadi: totalHasil,
      total_progress: totalHasil,
      sisa_qty: sisaQty,
      progress_percent: progressPercent,
    }
    const updatedSchedules = selectedSource.schedule_key
      ? (Array.isArray(selectedPlanning?.production_schedule)
          ? selectedPlanning.production_schedule
          : []
        ).map((schedule, index) => {
          const normalizedSchedule = normalizeScheduleRow(schedule, index, selectedPlanning || {})
          if (normalizedSchedule.key !== selectedSource.schedule_key) return schedule
          return {
            ...schedule,
            key: normalizedSchedule.key,
            actual_qty: totalHasil,
            status: isFinished ? 'done' : 'in_progress',
            updated_at: new Date().toISOString(),
          }
        })
      : []
    const scheduleDocument = updatedSchedules.length
      ? buildScheduleDocument(selectedPlanning, updatedSchedules)
      : null
    const scheduleProgressPayload = scheduleDocument
      ? {
          production_schedule: updatedSchedules,
          schedule_document: scheduleDocument,
          progress: scheduleDocument.progressPercentage,
          progress_percent: scheduleDocument.progressPercentage,
          total_progress: scheduleDocument.totalProducedAllDays,
          sisa_qty: scheduleDocument.remainingQty,
        }
      : {}
    const isPlanningFinished = scheduleDocument
      ? scheduleDocument.progressPercentage >= 100
      : isFinished

    try {
      if (selectedPlanning?.id) {
        if (isPlanningFinished) {
          await finishPlanningStep(
            selectedPlanning,
            {
              progress: progressPercent,
              ...progressPayload,
              ...scheduleProgressPayload,
            },
            { silent: true },
          )
        } else {
          await updateManufacturingPlanningProduksi(selectedPlanning.id, {
            status_planning: 'On Progress',
            status: 'On Progress',
            progress: progressPercent,
            ...progressPayload,
            ...scheduleProgressPayload,
            is_new: false,
          })
        }
      }
    } catch (error) {
      console.error('Histori produksi tersimpan, tetapi update progress planning gagal:', error)
    }

    try {
      closeProduksiDialog()
    } catch (error) {
      console.error('Histori produksi tersimpan, tetapi close/reset dialog gagal:', error)
    }

    notify(
      'positive',
      `Data produksi berhasil disimpan. Total progress ${formatNumber(totalHasil)} dari ${formatNumber(qtyTarget)}.`,
    )
  } catch (error) {
    if (productionHistorySaved) {
      console.error('Histori produksi sudah tersimpan, tetapi proses lanjutan gagal:', error)
      notify('positive', 'Data produksi berhasil disimpan.')
      return
    }

    console.error('Gagal menyimpan produksi departemen:', error)
    notify('negative', 'Gagal menyimpan data produksi.')
  } finally {
    savingProduksi.value = false
  }
}

const savePermintaanBarang = async () => {
  savingPermintaan.value = true
  try {
    const selectedPo = permintaanForm.value.nomor_po_obj
    const selectedCustomer = permintaanForm.value.customer_obj
    const selectedBarang = permintaanForm.value.barang_obj
    const selectedKategori = permintaanForm.value.kategori_obj
    const selectedSatuan = permintaanForm.value.satuan_obj

    const result = await createManufacturingPermintaanBarang({
      tanggal: permintaanForm.value.tanggal,
      nomor_po: selectedPo?.nomor || selectedPo?.label || '',
      po_id: selectedPo?.id || null,
      customer: {
        id: selectedCustomer?.id || null,
        nama: selectedCustomer?.label || selectedCustomer?.nama || '',
      },
      customer_id: selectedCustomer?.id || null,
      customer_nama: selectedCustomer?.label || selectedCustomer?.nama || '',
      barang_id: selectedBarang?.id || null,
      nama_barang: selectedBarang?.label || selectedBarang?.nama || selectedBarang?.nama_barang || '',
      kategori_barang_id: selectedKategori?.id || null,
      kategori_barang: selectedKategori?.label || selectedKategori?.nama || '',
      qty: Number(permintaanForm.value.qty),
      satuan_id: selectedSatuan?.id || null,
      satuan: selectedSatuan?.label || selectedSatuan?.nama || '',
      tujuan_departemen: departemenPayload.value,
      departemen_id: departemenId.value || null,
      keterangan: permintaanForm.value.keterangan || '',
    })
    closePermintaanDialog()
    notify('positive', `Surat permintaan barang ${result.nomor_surat} berhasil disimpan.`)
  } catch (error) {
    console.error(error)
    notify('negative', 'Gagal menyimpan permintaan barang.')
  } finally {
    savingPermintaan.value = false
  }
}

const confirmDelete = (row) => {
  $q.dialog({
    title: 'Hapus Data Produksi',
    message: `Hapus data produksi planning ${row.nomor_po || '-'}?`,
    cancel: true,
    persistent: true,
    ok: { label: 'Hapus', color: 'negative', unelevated: true },
  }).onOk(async () => {
    $q.loading.show({ message: 'Menghapus data produksi...' })
    try {
      await deleteManufacturingDepartemenProduksi(row.id)
      notify('positive', 'Data produksi berhasil dihapus.')
    } catch (error) {
      console.error(error)
      notify('negative', 'Gagal menghapus data produksi.')
    } finally {
      $q.loading.hide()
    }
  })
}

const openSuratPreview = (row) => {
  selectedSurat.value = row
  suratPreviewDialog.value = true
}

const openSuratPrintWindow = (row, title) => {
  if (!row) {
    notify('warning', 'Pilih surat permintaan barang terlebih dahulu.')
    return
  }

  const printWindow = window.open('', '_blank')
  if (!printWindow) {
    notify('negative', 'Popup browser diblokir. Izinkan popup untuk cetak atau export PDF.')
    return
  }

  printWindow.document.write(`
    <html>
      <head>
        <title>${escapeHtml(title)} ${escapeHtml(row.nomor_surat || '')}</title>
        <style>
          * { box-sizing: border-box; }
          body { font-family: Arial, sans-serif; color: #1f2937; margin: 0; padding: 24px; background: #ffffff; }
          .surat-document { max-width: 900px; margin: 0 auto; border: 1px solid #d1d5db; padding: 28px; }
          .surat-header { display: flex; justify-content: space-between; gap: 16px; border-bottom: 3px solid #14532d; padding-bottom: 16px; }
          .surat-brand { font-size: 28px; font-weight: 800; color: #14532d; letter-spacing: 0; }
          .surat-company { color: #4b5563; font-size: 12px; margin-top: 3px; }
          .surat-meta { text-align: right; font-size: 12px; color: #4b5563; }
          .surat-meta strong { display: block; color: #111827; font-size: 15px; margin-top: 6px; }
          .surat-title { text-align: center; font-size: 18px; font-weight: 800; margin: 24px 0; color: #111827; }
          .surat-info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px 16px; margin-bottom: 22px; }
          .surat-info-grid div { border: 1px solid #e5e7eb; padding: 10px 12px; min-height: 58px; }
          .surat-info-grid span, .surat-note span, .surat-signatures span { display: block; color: #6b7280; font-size: 11px; text-transform: uppercase; margin-bottom: 5px; }
          .surat-info-grid strong { font-size: 13px; color: #111827; }
          .surat-table { width: 100%; border-collapse: collapse; font-size: 12px; }
          .surat-table th { background: #14532d; color: #ffffff; padding: 10px; text-align: left; }
          .surat-table td { border: 1px solid #d1d5db; padding: 10px; }
          .text-right { text-align: right; }
          .surat-note { border: 1px solid #e5e7eb; padding: 12px; margin-top: 16px; min-height: 70px; }
          .surat-note p { margin: 0; }
          .surat-signatures { display: grid; grid-template-columns: repeat(2, 1fr); gap: 80px; margin-top: 52px; text-align: center; }
          .signature-line { border-bottom: 1px solid #111827; height: 70px; margin-bottom: 10px; }
          @media print {
            body { padding: 0; }
            .surat-document { border: 0; max-width: none; }
          }
        </style>
      </head>
      <body>${getSuratHtml(row)}</body>
    </html>
  `)
  printWindow.document.close()
  printWindow.focus()
  printWindow.print()
}

const printSurat = (row) => {
  openSuratPrintWindow(row, 'Cetak Surat Permintaan Barang')
}

const exportSuratPdf = (row) => {
  openSuratPrintWindow(row, 'Export PDF Surat Permintaan Barang')
}

const exportRows = computed(() =>
  filteredRows.value.map((row, index) => ({
    no: index + 1,
    tanggal: formatDate(row.tanggal),
    customer_nama: row.customer_nama || '-',
    nomor_po: row.nomor_po || '-',
    nama_produk: row.nama_produk || '-',
    qty_po: Number(row.qty_po ?? row.total_po ?? 0),
    qty_hasil_jadi: Number(row.qty_hasil_jadi || 0),
    satuan: row.satuan || '-',
    status_produksi: row.status_produksi || '-',
  })),
)

const exportExcel = () => {
  if (!exportRows.value.length) {
    notify('warning', 'Tidak ada data untuk diexport.')
    return
  }

  const rowsHtml = exportRows.value
    .map(
      (row) => `
        <tr>
          <td>${row.no}</td>
          <td>${row.tanggal}</td>
          <td>${row.customer_nama}</td>
          <td>${row.nomor_po}</td>
          <td>${row.nama_produk}</td>
          <td>${row.qty_po}</td>
          <td>${row.qty_hasil_jadi}</td>
          <td>${row.satuan}</td>
          <td>${row.status_produksi}</td>
        </tr>
      `,
    )
    .join('')

  const html = `
    <html>
      <head><meta charset="utf-8" /></head>
      <body>
        <h3>Data Produksi ${departemenTitle.value}</h3>
        <table border="1">
          <thead>
            <tr>
              <th>No</th>
              <th>Tanggal</th>
              <th>Customer</th>
              <th>Nomor Planning</th>
              <th>Master Produk</th>
              <th>Qty Target</th>
              <th>Qty Hasil Jadi</th>
              <th>Satuan</th>
              <th>Status Produksi</th>
            </tr>
          </thead>
          <tbody>${rowsHtml}</tbody>
        </table>
      </body>
    </html>
  `

  const blob = new Blob([html], { type: 'application/vnd.ms-excel' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `Data_Produksi_${departemenTitle.value.replace(/\s+/g, '_')}_${Date.now()}.xls`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

const exportPdf = () => {
  if (!exportRows.value.length) {
    notify('warning', 'Tidak ada data untuk diexport.')
    return
  }

  const rowsHtml = exportRows.value
    .map(
      (row) => `
        <tr>
          <td>${row.no}</td>
          <td>${row.tanggal}</td>
          <td>${row.customer_nama}</td>
          <td>${row.nomor_po}</td>
          <td>${row.nama_produk}</td>
          <td style="text-align:right">${formatNumber(row.qty_po)}</td>
          <td style="text-align:right">${formatNumber(row.qty_hasil_jadi)}</td>
          <td>${row.satuan}</td>
          <td>${row.status_produksi}</td>
        </tr>
      `,
    )
    .join('')

  const printWindow = window.open('', '_blank')
  if (!printWindow) {
    notify('negative', 'Popup browser diblokir. Izinkan popup untuk export PDF.')
    return
  }

  printWindow.document.write(`
    <html>
      <head>
        <title>Data Produksi ${departemenTitle.value}</title>
        <style>
          body { font-family: Arial, sans-serif; color: #1f2937; padding: 24px; }
          h2 { color: #14532d; margin-bottom: 4px; }
          .subtitle { color: #6b7280; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; }
          th { background: #14532d; color: white; padding: 9px; text-align: left; }
          td { border: 1px solid #d1d5db; padding: 8px; }
        </style>
      </head>
      <body>
        <h2>Data Produksi ${departemenTitle.value}</h2>
        <div class="subtitle">Export ${date.formatDate(new Date(), 'DD MMM YYYY HH:mm')}</div>
        <table>
          <thead>
            <tr>
              <th>No</th>
              <th>Tanggal</th>
              <th>Customer</th>
              <th>Nomor Planning</th>
              <th>Master Produk</th>
              <th>Qty Target</th>
              <th>Qty Hasil Jadi</th>
              <th>Satuan</th>
              <th>Status Produksi</th>
            </tr>
          </thead>
          <tbody>${rowsHtml}</tbody>
        </table>
      </body>
    </html>
  `)
  printWindow.document.close()
  printWindow.focus()
  printWindow.print()
}

onMounted(async () => {
  loading.value = true

  try {
    if (departemenId.value) {
      departemen.value = await getManufacturingMasterDepartemen(departemenId.value)
    }
  } catch (error) {
    console.error(error)
    notify('warning', 'Master departemen tidak ditemukan, memakai data dari route.')
  }

  unsubscribePlanning = listenManufacturingDepartemenPlanning(
    departemenId.value,
    (nextRows) => {
      const previousIds = knownPlanningIds.value
      const nextIds = new Set(nextRows.map((row) => row.id))
      const hasNewIncoming = nextRows.some((row) => row.is_new !== false && !previousIds.has(row.id))

      planningRows.value = nextRows
      knownPlanningIds.value = nextIds
      planningLoading.value = false

      if (previousIds.size > 0 && hasNewIncoming) {
        notify('info', 'Planning Produksi Baru Diterima')
      }
    },
    (error) => {
      console.error(error)
      planningLoading.value = false
      notify('negative', 'Gagal memuat planning produksi realtime.')
    },
  )

  unsubscribeProduksi = listenManufacturingDepartemenProduksi(
    departemenId.value,
    (nextRows) => {
      rows.value = nextRows
      loading.value = false
    },
    (error) => {
      console.error(error)
      loading.value = false
      notify('negative', 'Gagal memuat data produksi realtime.')
    },
  )

  unsubscribeSatuanOptions = listenManufacturingSatuanOptions(
    (options) => {
      satuanRawOptions.value = options
      satuanOptions.value = options
      satuanOptionsLoading.value = false

      if (produksiForm.value.nomor_po_obj && !produksiForm.value.satuan_obj) {
        produksiForm.value.satuan_obj =
          findSatuanFromValue(produksiForm.value.nomor_po_obj?.satuan) ||
          findSatuanFromValue(produksiForm.value.produk_obj?.satuan)
      }
    },
    (error) => {
      console.error(error)
      satuanOptionsLoading.value = false
      notify('negative', 'Gagal memuat master satuan manufacturing.')
    },
  )

  unsubscribeCustomerOptions = listenManufacturingCustomerOptions(
    (options) => {
      customerRawOptions.value = options
      customerOptions.value = options
      customerOptionsLoading.value = false

      if (produksiForm.value.nomor_po_obj && !produksiForm.value.customer_obj) {
        produksiForm.value.customer_obj = findCustomerFromPo(produksiForm.value.nomor_po_obj)
      }
    },
    (error) => {
      console.error(error)
      customerOptionsLoading.value = false
      notify('negative', 'Gagal memuat master customer manufacturing.')
    },
  )

  unsubscribeProdukOptions = listenManufacturingMasterProdukOptions(
    (options) => {
      produkRawOptions.value = options
      produkOptions.value = options
      produkOptionsLoading.value = false

      if (produksiForm.value.nomor_po_obj && !produksiForm.value.produk_obj) {
        produksiForm.value.produk_obj = findProdukFromPo(produksiForm.value.nomor_po_obj)
        if (!produksiForm.value.satuan_obj) {
          produksiForm.value.satuan_obj = findSatuanFromValue(produksiForm.value.produk_obj?.satuan)
        }
      }
    },
    (error) => {
      console.error(error)
      produkOptionsLoading.value = false
      notify('negative', 'Gagal memuat Master Produk manufacturing.')
    },
  )

  unsubscribePoOptions = listenManufacturingApprovedPoOptions(
    (options) => {
      approvedPoRawOptions.value = options
      approvedPoOptions.value = options
      poOptionsLoading.value = false
    },
    (error) => {
      console.error(error)
      poOptionsLoading.value = false
      notify('negative', 'Gagal memuat PO approved manufacturing.')
    },
  )

  unsubscribeBarangOptions = listenManufacturingBarangOptions(
    (options) => {
      barangRawOptions.value = options
      barangOptions.value = options
      barangOptionsLoading.value = false

      if (permintaanForm.value.barang_obj) {
        handleBarangSelected(permintaanForm.value.barang_obj)
      }
    },
    (error) => {
      console.error(error)
      barangOptionsLoading.value = false
      notify('negative', 'Gagal memuat master barang manufacturing.')
    },
  )

  unsubscribeKategoriBarangOptions = listenManufacturingKategoriBarangOptions(
    (options) => {
      kategoriBarangRawOptions.value = options
      kategoriBarangOptions.value = options
      kategoriBarangOptionsLoading.value = false

      if (permintaanForm.value.barang_obj) {
        permintaanForm.value.kategori_obj = findKategoriFromBarang(permintaanForm.value.barang_obj)
      }
    },
    (error) => {
      console.error(error)
      kategoriBarangOptionsLoading.value = false
      notify('negative', 'Gagal memuat kategori barang manufacturing.')
    },
  )

  unsubscribePermintaanRows = listenManufacturingPermintaanBarang(
    (nextRows) => {
      permintaanRows.value = nextRows
      permintaanRowsLoading.value = false
    },
    (error) => {
      console.error(error)
      permintaanRowsLoading.value = false
      notify('negative', 'Gagal memuat permintaan barang realtime.')
    },
  )

  unsubscribeDepartmentNotifications = listenDepartmentNotifications(
    departemenId.value,
    (nextRows) => {
      notificationRows.value = nextRows
    },
    (error) => {
      console.error(error)
      notify('negative', 'Gagal memuat notifikasi departemen.')
    },
  )

  unsubscribeRejectQcRows = listenRejectQcRows(
    departemenId.value,
    (nextRows) => {
      rejectQcRows.value = nextRows
      rejectQcLoading.value = false
    },
    (error) => {
      console.error(error)
      rejectQcLoading.value = false
      notify('negative', 'Gagal memuat barang reject QC.')
    },
  )
})

onUnmounted(() => {
  if (unsubscribePlanning) unsubscribePlanning()
  if (unsubscribeProduksi) unsubscribeProduksi()
  if (unsubscribeSatuanOptions) unsubscribeSatuanOptions()
  if (unsubscribeCustomerOptions) unsubscribeCustomerOptions()
  if (unsubscribePoOptions) unsubscribePoOptions()
  if (unsubscribeProdukOptions) unsubscribeProdukOptions()
  if (unsubscribeBarangOptions) unsubscribeBarangOptions()
  if (unsubscribeKategoriBarangOptions) unsubscribeKategoriBarangOptions()
  if (unsubscribePermintaanRows) unsubscribePermintaanRows()
  if (unsubscribeDepartmentNotifications) unsubscribeDepartmentNotifications()
  if (unsubscribeRejectQcRows) unsubscribeRejectQcRows()
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

.filter-card,
.table-card,
.detail-dialog {
  border-color: rgba(15, 60, 45, 0.1);
}

.table-card {
  overflow: hidden;
}

.planning-section-card {
  border-color: rgba(15, 60, 45, 0.1);
  border-radius: 8px;
  min-height: 280px;
}

.planning-card-list {
  max-height: 360px;
  overflow-y: auto;
  position: relative;
}

.planning-inbox-card {
  border-color: rgba(15, 60, 45, 0.12);
  border-radius: 8px;
}

.detail-dialog {
  width: min(96vw, 820px);
  max-width: 96vw;
  border-radius: 8px;
}

.shrink {
  flex: 0 0 auto;
}

.produksi-dialog-card {
  overflow-x: hidden;
}

.produksi-dialog-toolbar {
  min-height: 52px;
  padding: 6px 10px;
}

.produksi-dialog-title {
  font-size: 15px;
  line-height: 1.2;
}

.produksi-dialog-body {
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
  padding: 14px;
  padding-bottom: calc(84px + env(safe-area-inset-bottom, 0px));
}

.produksi-form-shell {
  margin: 0 auto;
  max-width: 1100px;
  width: 100%;
}

.produksi-form,
.produksi-form-card {
  width: 100%;
}

.produksi-form-card {
  border-color: rgba(15, 60, 45, 0.1);
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(15, 60, 45, 0.06);
  overflow: hidden;
}

.produksi-form-section {
  padding: 16px;
}

.produksi-input-grid {
  align-items: flex-start;
}

.produksi-form-card :deep(.q-field) {
  width: 100%;
}

.produksi-form-card :deep(.q-field__control) {
  min-height: 42px;
}

.produksi-form-card :deep(.q-field__marginal) {
  height: 42px;
}

.produksi-form-card :deep(.q-field__bottom) {
  min-height: 18px;
  padding-top: 3px;
}

.produksi-form-card :deep(.q-field--with-bottom) {
  padding-bottom: 12px;
}

.produksi-save-mobile {
  background: rgba(255, 255, 255, 0.96);
  border-top: 1px solid rgba(15, 60, 45, 0.1);
  bottom: 0;
  box-shadow: 0 -8px 24px rgba(15, 60, 45, 0.12);
  display: none;
  left: 0;
  padding: 10px 14px calc(10px + env(safe-area-inset-bottom, 0px));
  position: fixed;
  right: 0;
  z-index: 10;
}

.status-chip {
  min-width: 86px;
  justify-content: center;
}

.metric-label {
  color: #667085;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.4px;
  text-transform: uppercase;
}

.metric-value {
  color: #1b5e20;
  font-size: 22px;
  font-weight: 900;
  line-height: 1.1;
  margin-top: 4px;
}

.search-input :deep(.q-field__control) {
  border-radius: 30px;
}

.produksi-table :deep(thead tr th) {
  position: sticky;
  top: 0;
  z-index: 1;
}

.surat-preview {
  min-height: 760px;
  padding: 28px;
  overflow-x: auto;
}

.surat-preview :deep(.surat-document) {
  max-width: 900px;
  margin: 0 auto;
  border: 1px solid #d1d5db;
  padding: 28px;
  color: #1f2937;
}

.surat-preview :deep(.surat-header) {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  border-bottom: 3px solid #14532d;
  padding-bottom: 16px;
}

.surat-preview :deep(.surat-brand) {
  font-size: 28px;
  font-weight: 800;
  color: #14532d;
}

.surat-preview :deep(.surat-company),
.surat-preview :deep(.surat-meta),
.surat-preview :deep(.surat-info-grid span),
.surat-preview :deep(.surat-note span),
.surat-preview :deep(.surat-signatures span) {
  color: #6b7280;
}

.surat-preview :deep(.surat-meta) {
  text-align: right;
  font-size: 12px;
}

.surat-preview :deep(.surat-meta strong) {
  display: block;
  color: #111827;
  font-size: 15px;
  margin-top: 6px;
}

.surat-preview :deep(.surat-title) {
  text-align: center;
  font-size: 18px;
  font-weight: 800;
  margin: 24px 0;
  color: #111827;
}

.surat-preview :deep(.surat-info-grid) {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px 16px;
  margin-bottom: 22px;
}

.surat-preview :deep(.surat-info-grid div) {
  border: 1px solid #e5e7eb;
  min-height: 58px;
  padding: 10px 12px;
}

.surat-preview :deep(.surat-info-grid span),
.surat-preview :deep(.surat-note span),
.surat-preview :deep(.surat-signatures span) {
  display: block;
  font-size: 11px;
  margin-bottom: 5px;
  text-transform: uppercase;
}

.surat-preview :deep(.surat-table) {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}

.surat-preview :deep(.surat-table th) {
  background: #14532d;
  color: #ffffff;
  padding: 10px;
  text-align: left;
}

.surat-preview :deep(.surat-table td) {
  border: 1px solid #d1d5db;
  padding: 10px;
}

.surat-preview :deep(.text-right) {
  text-align: right;
}

.surat-preview :deep(.surat-note) {
  border: 1px solid #e5e7eb;
  margin-top: 16px;
  min-height: 70px;
  padding: 12px;
}

.surat-preview :deep(.surat-note p) {
  margin: 0;
}

.reject-note {
  max-width: 260px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.surat-preview :deep(.surat-signatures) {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 80px;
  margin-top: 52px;
  text-align: center;
}

.surat-preview :deep(.signature-line) {
  border-bottom: 1px solid #111827;
  height: 70px;
  margin-bottom: 10px;
}

@media (max-width: 700px) {
  .produksi-dialog-toolbar {
    min-height: 48px;
    padding: 4px 8px;
  }

  .produksi-dialog-title {
    font-size: 13px;
  }

  .produksi-save-desktop {
    display: none;
  }

  .produksi-save-mobile {
    display: block;
  }

  .produksi-dialog-body {
    padding: 10px;
    padding-bottom: calc(78px + env(safe-area-inset-bottom, 0px));
  }

  .produksi-form-section {
    padding: 12px;
  }

  .produksi-form-card {
    border-radius: 10px;
  }

  .surat-preview {
    padding: 12px;
  }

  .surat-preview :deep(.surat-document) {
    padding: 16px;
  }

  .surat-preview :deep(.surat-header),
  .surat-preview :deep(.surat-info-grid),
  .surat-preview :deep(.surat-signatures) {
    grid-template-columns: 1fr;
  }

  .surat-preview :deep(.surat-header) {
    display: grid;
  }

  .surat-preview :deep(.surat-meta) {
    text-align: left;
  }
}

.block {
  display: block;
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
</style>
