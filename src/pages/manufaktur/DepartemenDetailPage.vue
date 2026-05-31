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
              <q-item clickable v-close-popup @click="departmentViewTab = 'spk'">
                <q-item-section avatar><q-icon name="assignment" color="green-10" /></q-item-section>
                <q-item-section>SPK Masuk</q-item-section>
                <q-item-section side>
                  <q-badge color="orange-9">{{ spkBaruCount }}</q-badge>
                </q-item-section>
              </q-item>
              <q-item clickable v-close-popup @click="departmentViewTab = 'planning'">
                <q-item-section avatar><q-icon name="event_note" color="primary" /></q-item-section>
                <q-item-section>Planning Produksi</q-item-section>
                <q-item-section side>
                  <q-badge color="primary">{{ planningBaruCount }}</q-badge>
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
            <q-tab name="spk" icon="assignment" label="SPK Masuk" />
            <q-tab name="planning" icon="event_note" label="Planning Produksi" />
          </q-tabs>
        </div>
      </q-card-section>
    </q-card>

    <div v-show="departmentViewTab === 'spk'" class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-lg-4">
        <q-card flat bordered class="spk-section-card bg-white">
          <q-card-section class="row items-center q-pb-sm">
            <q-icon name="fiber_new" color="orange-9" size="sm" class="q-mr-sm" />
            <div class="text-subtitle1 text-weight-bolder text-green-10">SPK Masuk</div>
            <q-space />
            <q-badge color="orange-9" class="text-weight-bold">{{ spkBaruCount }}</q-badge>
          </q-card-section>
          <q-separator />
          <q-card-section class="spk-card-list">
            <q-inner-loading :showing="spkLoading" />
            <div v-if="!spkBaruRows.length && !spkLoading" class="text-grey-6 text-center q-pa-md">
              Belum ada SPK masuk.
            </div>
            <q-card v-for="spk in spkBaruRows" :key="spk.id" flat bordered class="spk-inbox-card q-mb-sm">
              <q-card-section class="q-pa-sm">
                <div class="row items-start no-wrap">
                  <div class="col">
                    <div class="text-weight-bolder text-green-10">{{ spk.nomor_spk }}</div>
                    <div class="text-caption text-grey-7">PO: {{ spk.nomor_po || '-' }}</div>
                    <div class="text-body2 text-weight-bold q-mt-xs">{{ spk.nama_produk || '-' }}</div>
                    <div class="text-caption text-grey-7">
                      {{ spk.customer_nama || '-' }} - Qty {{ formatNumber(spk.qty_target) }} {{ spk.satuan || '' }}
                    </div>
                  </div>
                  <q-chip dense color="orange-9" text-color="white">{{ spk.prioritas || 'Normal' }}</q-chip>
                </div>
                <q-btn
                  unelevated
                  dense
                  color="green-10"
                  icon="play_arrow"
                  label="Mulai Produksi"
                  no-caps
                  class="full-width q-mt-sm"
                  @click="updateSpkStatus(spk, 'On Production')"
                />
              </q-card-section>
            </q-card>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-lg-4">
        <q-card flat bordered class="spk-section-card bg-white">
          <q-card-section class="row items-center q-pb-sm">
            <q-icon name="precision_manufacturing" color="primary" size="sm" class="q-mr-sm" />
            <div class="text-subtitle1 text-weight-bolder text-green-10">Sedang Diproduksi</div>
            <q-space />
            <q-badge color="primary" class="text-weight-bold">{{ spkProduksiRows.length }}</q-badge>
          </q-card-section>
          <q-separator />
          <q-card-section class="spk-card-list">
            <div v-if="!spkProduksiRows.length && !spkLoading" class="text-grey-6 text-center q-pa-md">
              Belum ada SPK berjalan.
            </div>
            <q-card v-for="spk in spkProduksiRows" :key="spk.id" flat bordered class="spk-inbox-card q-mb-sm">
              <q-card-section class="q-pa-sm">
                <div class="text-weight-bolder text-green-10">{{ spk.nomor_spk }}</div>
                <div class="text-body2 text-weight-bold">{{ spk.nama_produk || '-' }}</div>
                <div class="text-caption text-grey-7 q-mb-sm">
                  Status: {{ spk.status }} - Hasil {{ formatNumber(spk.qty_hasil_jadi) }}/{{ formatNumber(spk.qty_target) }}
                </div>
                <div class="row q-col-gutter-sm">
                  <div class="col-6">
                    <q-btn
                      outline
                      dense
                      color="indigo-7"
                      icon="fact_check"
                      label="QC"
                      no-caps
                      class="full-width"
                      :disable="spk.status === 'QC Process'"
                      @click="updateSpkStatus(spk, 'QC Process')"
                    />
                  </div>
                  <div class="col-6">
                    <q-btn
                      unelevated
                      dense
                      color="positive"
                      icon="check_circle"
                      label="Finished"
                      no-caps
                      class="full-width"
                      @click="finishSpk(spk)"
                    />
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-lg-4">
        <q-card flat bordered class="spk-section-card bg-white">
          <q-card-section class="row items-center q-pb-sm">
            <q-icon name="task_alt" color="positive" size="sm" class="q-mr-sm" />
            <div class="text-subtitle1 text-weight-bolder text-green-10">Selesai</div>
            <q-space />
            <q-badge color="positive" class="text-weight-bold">{{ spkSelesaiRows.length }}</q-badge>
          </q-card-section>
          <q-separator />
          <q-card-section class="spk-card-list">
            <div v-if="!spkSelesaiRows.length && !spkLoading" class="text-grey-6 text-center q-pa-md">
              Belum ada SPK selesai.
            </div>
            <q-card v-for="spk in spkSelesaiRows" :key="spk.id" flat bordered class="spk-inbox-card q-mb-sm">
              <q-card-section class="q-pa-sm">
                <div class="text-weight-bolder text-green-10">{{ spk.nomor_spk }}</div>
                <div class="text-body2 text-weight-bold">{{ spk.nama_produk || '-' }}</div>
                <div class="text-caption text-grey-7">
                  Hasil {{ formatNumber(spk.qty_hasil_jadi) }}/{{ formatNumber(spk.qty_target) }} {{ spk.satuan || '' }}
                </div>
              </q-card-section>
            </q-card>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <div v-show="departmentViewTab === 'planning'" class="q-mb-lg">
      <q-card flat bordered class="spk-section-card bg-white">
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
                <div class="text-caption text-grey-6">{{ props.row.nomor_spk || '-' }}</div>
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
                <q-badge :color="priorityColor(props.row.prioritas)" class="text-weight-bold">
                  {{ props.row.prioritas || 'Medium' }}
                </q-badge>
              </q-td>
              <q-td key="status_planning" :props="props">
                <q-badge :color="planningStatusColor(props.row.status_planning || props.row.status)" class="text-weight-bold">
                  {{ props.row.status_planning || props.row.status || '-' }}
                </q-badge>
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
            @click="produksiFormRef?.submit()"
          />
        </q-toolbar>

        <q-card-section class="produksi-dialog-body col scroll">
          <div class="produksi-form-shell">
            <q-form ref="produksiFormRef" class="produksi-form" @submit.prevent="saveProduksi">
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
                        Nomor PO approved, customer, produk, qty PO, dan satuan ditarik dari master
                        data manufacturing.
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
                        v-model="produksiForm.spk_obj"
                        :options="availableSpkOptions"
                        option-label="label"
                        option-value="value"
                        dense
                        outlined
                        label="SPK Produksi"
                        :loading="spkLoading"
                        @update:model-value="handleSpkSelected"
                      >
                        <template #prepend>
                          <q-icon name="assignment" color="green-10" />
                        </template>
                      </q-select>
                    </div>

                    <div class="col-12 col-md-6">
                      <q-select
                        v-model="produksiForm.nomor_po_obj"
                        :options="approvedPoOptions"
                        option-label="label"
                        option-value="value"
                        dense
                        outlined
                        use-input
                        input-debounce="250"
                        label="Nomor PO Approved"
                        :loading="poOptionsLoading"
                        :rules="[required]"
                        @filter="filterApprovedPo"
                        @update:model-value="handlePoSelected"
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
                        v-model="produksiForm.customer_obj"
                        :options="customerOptions"
                        option-label="label"
                        option-value="value"
                        dense
                        outlined
                        use-input
                        input-debounce="250"
                        label="Customer"
                        :loading="customerOptionsLoading"
                        :readonly="!!produksiForm.nomor_po_obj"
                        :rules="[required]"
                        @filter="filterCustomers"
                      >
                        <template #prepend>
                          <q-icon name="business" color="green-10" />
                        </template>
                      </q-select>
                    </div>

                    <div class="col-12 col-md-6">
                      <q-input
                        :model-value="formatNumber(produksiForm.qty_po)"
                        dense
                        outlined
                        label="Qty PO"
                        readonly
                        :rules="[() => requiredNumber(produksiForm.qty_po)]"
                      >
                        <template #prepend>
                          <q-icon name="format_list_numbered" color="green-10" />
                        </template>
                      </q-input>
                    </div>

                    <div class="col-12 col-md-6">
                      <q-select
                        v-model="produksiForm.produk_obj"
                        :options="produkOptions"
                        option-label="label"
                        option-value="value"
                        dense
                        outlined
                        use-input
                        input-debounce="250"
                        label="Master Produk"
                        :loading="produkOptionsLoading"
                        :readonly="!!produksiForm.nomor_po_obj"
                        :rules="[required]"
                        @filter="filterProduk"
                      >
                        <template #prepend>
                          <q-icon name="inventory" color="green-10" />
                        </template>
                        <template #option="scope">
                          <q-item v-bind="scope.itemProps">
                            <q-item-section>
                              <q-item-label class="text-weight-bold">
                                {{ scope.opt.label }}
                              </q-item-label>
                              <q-item-label caption>
                                {{ scope.opt.kode_produk || '-' }} - {{ scope.opt.satuan || '-' }}
                              </q-item-label>
                            </q-item-section>
                          </q-item>
                        </template>
                      </q-select>
                    </div>

                    <div class="col-12 col-md-6">
                      <q-input
                        v-model.number="produksiForm.qty_hasil_jadi"
                        dense
                        outlined
                        type="number"
                        label="Qty Hasil Jadi"
                        :rules="[requiredNumber]"
                      />
                    </div>

                    <div class="col-12 col-md-6">
                      <q-select
                        v-model="produksiForm.satuan_obj"
                        :options="satuanOptions"
                        option-label="label"
                        option-value="value"
                        dense
                        outlined
                        use-input
                        input-debounce="250"
                        label="Satuan"
                        :loading="satuanOptionsLoading"
                        :readonly="!!produksiForm.nomor_po_obj"
                        :rules="[required]"
                        @filter="filterSatuan"
                      >
                        <template #prepend>
                          <q-icon name="straighten" color="green-10" />
                        </template>
                      </q-select>
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
                  </div>
                </q-card-section>
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
            @click="produksiFormRef?.submit()"
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
import { computed, onMounted, onUnmounted, ref } from 'vue'
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
const spkRows = ref([])
const knownSpkIds = ref(new Set())
const planningRows = ref([])
const knownPlanningIds = ref(new Set())
const departmentViewTab = ref('spk')
const loading = ref(true)
const spkLoading = ref(true)
const planningLoading = ref(true)
const search = ref('')
const departemen = ref(null)
const produksiDialog = ref(false)
const permintaanDialog = ref(false)
const suratPreviewDialog = ref(false)
const savingProduksi = ref(false)
const savingPermintaan = ref(false)
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
let unsubscribeSpk = null
let unsubscribePlanning = null
let unsubscribeSatuanOptions = null
let unsubscribeCustomerOptions = null
let unsubscribePoOptions = null
let unsubscribeProdukOptions = null
let unsubscribeBarangOptions = null
let unsubscribeKategoriBarangOptions = null
let unsubscribePermintaanRows = null

const statusProduksiOptions = ['Belum Mulai', 'Proses', 'Selesai', 'Tertunda', 'Batal']

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
const MANUFACTURING_DEPARTEMEN_COLLECTION = 'manufacturing_departemen'
const SPK_SUBCOLLECTION = 'spk'
const PLANNING_COLLECTION = 'planning_produksi_manufaktur'

const produksiCollection = collection(db, PRODUKSI_COLLECTION)
const permintaanBarangCollection = collection(db, PERMINTAAN_BARANG_COLLECTION)
const getSpkCollection = (departemenIdValue) =>
  collection(db, MANUFACTURING_DEPARTEMEN_COLLECTION, departemenIdValue, SPK_SUBCOLLECTION)

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

const listenManufacturingDepartemenProduksi = (callback, errorCallback) =>
  onSnapshot(
    query(produksiCollection, orderBy('created_at', 'desc')),
    (snapshot) => callback(snapshot.docs.map((itemDoc) => ({ id: itemDoc.id, ...itemDoc.data() }))),
    errorCallback,
  )

const createManufacturingDepartemenProduksi = (payload) =>
  addDoc(produksiCollection, {
    ...payload,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  })

const deleteManufacturingDepartemenProduksi = (id) => deleteDoc(doc(db, PRODUKSI_COLLECTION, id))

const getManufacturingMasterDepartemen = async (id) => {
  const snapshot = await getDoc(doc(db, MASTER_DEPARTEMEN_COLLECTION, id))
  if (!snapshot.exists()) return null
  return { id: snapshot.id, ...snapshot.data() }
}

const listenManufacturingDepartemenSpk = (departemenIdValue, callback, errorCallback) => {
  if (!departemenIdValue) {
    callback([])
    return () => {}
  }

  return onSnapshot(
    query(getSpkCollection(departemenIdValue), orderBy('created_at', 'desc')),
    (snapshot) =>
      callback(
        snapshot.docs.map((spkDoc) => ({
          id: spkDoc.id,
          departemen_path_id: departemenIdValue,
          ...spkDoc.data(),
        })),
      ),
    errorCallback,
  )
}

const updateManufacturingSpkProduksi = (departemenIdValue, spkId, payload) =>
  updateDoc(doc(db, MANUFACTURING_DEPARTEMEN_COLLECTION, departemenIdValue, SPK_SUBCOLLECTION, spkId), {
    ...payload,
    updated_at: serverTimestamp(),
  })

const listenManufacturingDepartemenPlanning = (departemenIdValue, callback, errorCallback) =>
  onSnapshot(
    query(collection(db, PLANNING_COLLECTION), orderBy('created_at', 'desc')),
    (snapshot) => {
      const mappedRows = snapshot.docs
        .map((planningDoc) => ({ id: planningDoc.id, ...planningDoc.data() }))
        .filter(
          (row) =>
            row.departemen_id === departemenIdValue ||
            row.tujuan_departemen?.id === departemenIdValue ||
            row.departemen_nama === departemenTitle.value,
        )
      callback(mappedRows)
    },
    errorCallback,
  )

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
  spk_obj: null,
  nomor_po_obj: null,
  customer_obj: null,
  produk_obj: null,
  qty_po: null,
  total_po: null,
  qty_hasil_jadi: null,
  satuan_obj: null,
  status_produksi: 'Proses',
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
  { name: 'nomor_po', label: 'Nomor PO', field: 'nomor_po', align: 'left', sortable: true },
  { name: 'nama_produk', label: 'Master Produk', field: 'nama_produk', align: 'left', sortable: true },
  { name: 'qty_po', label: 'Qty PO', field: 'qty_po', align: 'right', sortable: true },
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

const planningColumns = [
  { name: 'nomor_planning', label: 'Nomor Planning / SPK', field: 'nomor_planning', align: 'left', sortable: true },
  { name: 'customer', label: 'Customer', field: 'customer_nama', align: 'left', sortable: true },
  { name: 'produk', label: 'Produk', field: 'nama_produk', align: 'left', sortable: true },
  { name: 'qty_target', label: 'Qty Target', field: 'qty_target', align: 'right', sortable: true },
  { name: 'deadline', label: 'Deadline', field: 'deadline', align: 'left', sortable: true },
  { name: 'prioritas', label: 'Prioritas', field: 'prioritas', align: 'center', sortable: true },
  { name: 'status_planning', label: 'Status Planning', field: 'status_planning', align: 'center', sortable: true },
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
const requiredNumber = (val) => (Number(val) > 0 ? true : 'Nilai harus lebih dari 0')

const departmentMatches = (row) => {
  if (!departemenId.value) {
    return row.departemen?.nama_departemen === departemenTitle.value || row.departemen === departemenTitle.value
  }

  return (
    row.departemen?.id === departemenId.value ||
    row.departemen_id === departemenId.value ||
    row.departemen === departemenTitle.value
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

const spkBaruRows = computed(() =>
  spkRows.value.filter((row) => row.status === 'Menunggu Produksi'),
)

const spkProduksiRows = computed(() =>
  spkRows.value.filter((row) => ['On Production', 'QC Process'].includes(row.status)),
)

const spkSelesaiRows = computed(() => spkRows.value.filter((row) => row.status === 'Finished'))

const spkBaruCount = computed(() => spkBaruRows.value.length)

const activePlanningRows = computed(() =>
  planningRows.value.filter((row) => !['Selesai', 'Finished', 'Cancelled'].includes(row.status_planning || row.status)),
)

const planningBaruCount = computed(
  () =>
    planningRows.value.filter((row) => {
      const status = row.status_planning || row.status
      return row.is_new !== false && !['Selesai', 'Finished', 'Cancelled'].includes(status)
    }).length,
)

const availableSpkOptions = computed(() =>
  spkRows.value
    .filter((row) => row.status !== 'Finished')
    .map((row) => ({
      label: `${row.nomor_spk} - ${row.nama_produk || '-'} (${row.status})`,
      value: row.id,
      item: row,
    })),
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
  if (status === 'Selesai') return 'positive'
  if (status === 'Proses') return 'primary'
  if (status === 'Tertunda') return 'orange-9'
  if (status === 'Batal') return 'negative'
  return 'grey-7'
}

const priorityColor = (priority) => {
  if (priority === 'High') return 'negative'
  if (priority === 'Low') return 'green-8'
  return 'orange-9'
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
      option.nomor,
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

const filterProduk = (val, update) => {
  update(() => {
    produkOptions.value = filterByLabel(produkRawOptions.value, val)
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

const handlePoSelected = (po) => {
  produksiForm.value.total_po = Number(po?.total_po || po?.total_estimasi || po?.total || 0)
  produksiForm.value.qty_po = Number(po?.qty_po || po?.qty || po?.total_qty || 0)
  produksiForm.value.customer_obj = findCustomerFromPo(po)
  produksiForm.value.produk_obj = findProdukFromPo(po)
  produksiForm.value.satuan_obj =
    findSatuanFromValue(po?.satuan) || findSatuanFromValue(produksiForm.value.produk_obj?.satuan)

  if (po && !produksiForm.value.customer_obj) {
    notify('warning', 'Customer pada PO belum cocok dengan Master Customer manufacturing.')
  }
  if (po && !produksiForm.value.produk_obj) {
    notify('warning', 'Produk pada PO belum cocok dengan Master Produk manufacturing.')
  }
  if (po && !produksiForm.value.satuan_obj) {
    notify('warning', 'Satuan pada PO belum cocok dengan Master Satuan manufacturing.')
  }
}

const handleSpkSelected = (option) => {
  const spk = option?.item || option
  if (!spk) return

  const poOption =
    approvedPoRawOptions.value.find((po) => po.id === spk.po_id || po.nomor === spk.nomor_po) || {
      id: spk.po_id,
      label: spk.nomor_po,
      nomor: spk.nomor_po,
      customerName: spk.customer_nama,
      customer_id: spk.customer_id,
      produk_id: spk.produk_id,
      kode_produk: spk.kode_produk,
      nama_produk: spk.nama_produk,
      qty_po: spk.qty_target,
      satuan: spk.satuan,
    }

  produksiForm.value.nomor_po_obj = poOption
  produksiForm.value.total_po = Number(spk.total_po || 0)
  produksiForm.value.qty_po = Number(spk.qty_target || 0)
  produksiForm.value.qty_hasil_jadi = Number(spk.qty_hasil_jadi || spk.qty_target || 0)
  produksiForm.value.customer_obj =
    findCustomerFromPo(poOption) ||
    (spk.customer_nama
      ? { id: spk.customer_id || spk.customer_nama, label: spk.customer_nama, nama: spk.customer_nama }
      : null)
  produksiForm.value.produk_obj =
    findProdukFromPo(poOption) ||
    (spk.nama_produk
      ? {
          id: spk.produk_id || spk.nama_produk,
          label: spk.nama_produk,
          nama_produk: spk.nama_produk,
          kode_produk: spk.kode_produk || '',
        }
      : null)
  produksiForm.value.satuan_obj = findSatuanFromValue(spk.satuan)
  produksiForm.value.status_produksi = spk.status === 'Finished' ? 'Selesai' : 'Proses'
}

const updateSpkStatus = async (spk, status, extraPayload = {}) => {
  const departemenPathId = spk.departemen_path_id || spk.departemen_id || departemenId.value
  if (!departemenPathId || !spk?.id) return

  try {
    await updateManufacturingSpkProduksi(departemenPathId, spk.id, {
      status,
      status_pekerjaan: status,
      is_new: false,
      ...extraPayload,
    })
    notify('positive', `Status SPK ${spk.nomor_spk || ''} menjadi ${status}.`)
  } catch (error) {
    console.error(error)
    notify('negative', 'Gagal memperbarui status SPK.')
  }
}

const finishSpk = (spk) => {
  $q.dialog({
    title: 'Selesaikan SPK',
    message: `Input qty hasil jadi untuk ${spk.nomor_spk || 'SPK'}:`,
    prompt: {
      model: Number(spk.qty_hasil_jadi || spk.qty_target || 0),
      type: 'number',
    },
    cancel: true,
    persistent: true,
    ok: { label: 'Finished', color: 'positive', unelevated: true },
  }).onOk((qty) => {
    updateSpkStatus(spk, 'Finished', {
      qty_hasil_jadi: Number(qty || 0),
      finished_at: new Date().toISOString(),
    })
  })
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

const saveProduksi = async () => {
  savingProduksi.value = true
  try {
    const selectedPo = produksiForm.value.nomor_po_obj
    const selectedSpk = produksiForm.value.spk_obj?.item || produksiForm.value.spk_obj
    const selectedCustomer = produksiForm.value.customer_obj
    const selectedProduk = produksiForm.value.produk_obj
    const selectedSatuan = produksiForm.value.satuan_obj

    await createManufacturingDepartemenProduksi({
      tanggal: produksiForm.value.tanggal,
      spk_id: selectedSpk?.id || null,
      nomor_spk: selectedSpk?.nomor_spk || '',
      nomor_po: selectedPo?.nomor || selectedPo?.label || '',
      po_id: selectedPo?.id || null,
      customer: {
        id: selectedCustomer?.id || null,
        nama: selectedCustomer?.label || selectedCustomer?.nama || '',
      },
      customer_id: selectedCustomer?.id || null,
      customer_nama: selectedCustomer?.label || selectedCustomer?.nama || '',
      produk: {
        id: selectedProduk?.id || null,
        kode_produk: selectedProduk?.kode_produk || '',
        nama_produk: selectedProduk?.label || selectedProduk?.nama_produk || '',
      },
      produk_id: selectedProduk?.id || null,
      kode_produk: selectedProduk?.kode_produk || '',
      nama_produk: selectedProduk?.label || selectedProduk?.nama_produk || '',
      qty_po: Number(produksiForm.value.qty_po),
      total_po: Number(produksiForm.value.total_po),
      qty_hasil_jadi: Number(produksiForm.value.qty_hasil_jadi),
      satuan: selectedSatuan?.label || selectedSatuan?.nama || '',
      satuan_id: selectedSatuan?.id || null,
      status_produksi: produksiForm.value.status_produksi,
      departemen: departemenPayload.value,
      departemen_id: departemenId.value || null,
    })

    if (selectedSpk?.id) {
      const qtyHasil = Number(produksiForm.value.qty_hasil_jadi || 0)
      const qtyTarget = Number(selectedSpk.qty_target || produksiForm.value.qty_po || 0)
      await updateManufacturingSpkProduksi(
        selectedSpk.departemen_path_id || selectedSpk.departemen_id || departemenId.value,
        selectedSpk.id,
        {
          status: qtyTarget > 0 && qtyHasil >= qtyTarget ? 'Finished' : 'On Production',
          status_pekerjaan: qtyTarget > 0 && qtyHasil >= qtyTarget ? 'Finished' : 'On Production',
          qty_hasil_jadi: qtyHasil,
          is_new: false,
        },
      )
    }
    closeProduksiDialog()
    notify('positive', 'Data produksi berhasil disimpan.')
  } catch (error) {
    console.error(error)
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
    message: `Hapus data produksi PO ${row.nomor_po || '-'}?`,
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
              <th>Nomor PO</th>
              <th>Master Produk</th>
              <th>Qty PO</th>
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
              <th>Nomor PO</th>
              <th>Master Produk</th>
              <th>Qty PO</th>
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

  unsubscribeSpk = listenManufacturingDepartemenSpk(
    departemenId.value,
    (nextRows) => {
      const previousIds = knownSpkIds.value
      const nextIds = new Set(nextRows.map((row) => row.id))
      const hasNewIncoming = nextRows.some(
        (row) => row.status === 'Menunggu Produksi' && !previousIds.has(row.id),
      )

      spkRows.value = nextRows
      knownSpkIds.value = nextIds
      spkLoading.value = false

      if (previousIds.size > 0 && hasNewIncoming) {
        notify('info', 'SPK Baru Diterima')
      }
    },
    (error) => {
      console.error(error)
      spkLoading.value = false
      notify('negative', 'Gagal memuat SPK departemen realtime.')
    },
  )

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
})

onUnmounted(() => {
  if (unsubscribeSpk) unsubscribeSpk()
  if (unsubscribePlanning) unsubscribePlanning()
  if (unsubscribeProduksi) unsubscribeProduksi()
  if (unsubscribeSatuanOptions) unsubscribeSatuanOptions()
  if (unsubscribeCustomerOptions) unsubscribeCustomerOptions()
  if (unsubscribePoOptions) unsubscribePoOptions()
  if (unsubscribeProdukOptions) unsubscribeProdukOptions()
  if (unsubscribeBarangOptions) unsubscribeBarangOptions()
  if (unsubscribeKategoriBarangOptions) unsubscribeKategoriBarangOptions()
  if (unsubscribePermintaanRows) unsubscribePermintaanRows()
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

.spk-section-card {
  border-color: rgba(15, 60, 45, 0.1);
  border-radius: 8px;
  min-height: 280px;
}

.spk-card-list {
  max-height: 360px;
  overflow-y: auto;
  position: relative;
}

.spk-inbox-card {
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
