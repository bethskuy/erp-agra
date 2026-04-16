<template>
  <q-page class="bg-grey-2 q-pa-md font-pro">
    <div v-if="viewMode === 'list'">
      <div class="row items-center q-mb-md">
        <div class="col">
          <div class="text-h5 text-weight-bold text-primary text-uppercase letter-spacing-1">
            Manajemen Proyek Utama
          </div>
          <div class="text-caption text-grey-7 text-weight-medium text-uppercase">
            Daftar proyek aktif PT AGRA.
          </div>
        </div>
        <div class="col-auto">
          <q-btn
            unelevated
            color="primary"
            icon="add"
            label="Buat Proyek Baru"
            class="btn-radius shadow-2 text-weight-bold"
            @click="openAddDialog"
          />
        </div>
      </div>
      <q-card flat bordered class="rounded-borders shadow-1">
        <q-table
          :rows="rows"
          :columns="columns"
          row-key="id"
          flat
          :loading="loading"
          @row-click="showProjectDetail"
        >
          <template v-slot:body-cell-jumlah_spk="props">
            <q-td :props="props" class="text-center">
              <q-badge
                color="indigo-1"
                text-color="indigo-10"
                class="q-pa-xs text-weight-bold px-md"
                >{{ props.row.spk_count || 0 }} SPK</q-badge
              >
            </q-td>
          </template>
          <template v-slot:body-cell-total_kontrak="props">
            <q-td :props="props" class="text-right text-bold text-primary text-body1">
              <span class="text-caption q-mr-xs">Rp</span
              >{{ formatMoney(props.row.total_omzet || 0) }}
            </q-td>
          </template>
          <template v-slot:body-cell-aksi="props">
            <q-td :props="props" class="q-gutter-xs text-center" @click.stop>
              <q-btn
                flat
                round
                color="indigo"
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
                @click="hapusProyek(props.row)"
              />
            </q-td>
          </template>
        </q-table>
      </q-card>
    </div>

    <div v-else-if="viewMode === 'detail' && currentProject">
      <div class="row items-center q-mb-lg">
        <q-btn
          flat
          round
          icon="arrow_back"
          color="primary"
          @click="viewMode = 'list'"
          class="q-mr-sm hover-scale"
        />
        <div class="col">
          <div class="text-h5 text-weight-bold text-indigo-10 text-uppercase letter-spacing-1">
            {{ currentProject.nama }}
          </div>
        </div>
      </div>

      <q-card flat bordered class="bg-white rounded-borders shadow-1 q-mb-xl overflow-hidden">
        <div class="row text-center q-py-lg items-center divider-container">
          <div class="col-4">
            <div class="text-caption text-grey-6 uppercase text-bold letter-spacing-1">
              Customer
            </div>
            <div
              class="text-h6 text-indigo-10 text-weight-bolder text-uppercase q-mt-xs ellipsis q-px-md"
            >
              {{ currentProject.konsumen || '-' }}
            </div>
          </div>
          <div class="col-4 border-sides">
            <div class="text-caption text-grey-6 uppercase text-bold letter-spacing-1">
              Total Omzet Proyek
            </div>
            <div class="text-h6 text-primary text-weight-bolder q-mt-xs">
              Rp {{ formatMoney(currentProject.total_omzet || 0) }}
            </div>
          </div>
          <div class="col-4">
            <div class="text-caption text-grey-6 uppercase text-bold letter-spacing-1">Lokasi</div>
            <div class="text-body1 text-weight-bold text-indigo-10 q-mt-xs ellipsis q-px-md">
              {{ currentProject.alamat || '-' }}
            </div>
          </div>
        </div>
      </q-card>

      <div class="row items-center justify-between q-mb-md">
        <div class="text-h6 text-indigo-10 text-weight-bold uppercase letter-spacing-1">
          Daftar Kontrak / SPK Customer
        </div>
        <q-btn
          unelevated
          color="primary"
          icon="add"
          label="TAMBAHKAN SPK"
          @click="openAddSpkDialog"
          class="btn-radius shadow-2 q-px-lg text-weight-bold"
        />
      </div>

      <q-card flat bordered class="rounded-borders shadow-3 overflow-hidden bg-white">
        <q-table
          :rows="listSpkProject"
          :columns="spkColumns"
          flat
          @row-click="showSpkDetail"
          class="cursor-pointer spk-table-premium"
        >
          <template v-slot:body-cell-nilai="props"
            ><q-td :props="props" class="text-right text-weight-bold text-indigo text-body1"
              >Rp {{ formatMoney(props.value) }}</q-td
            ></template
          >
          <template v-slot:body-cell-aksi="props">
            <q-td :props="props" class="q-gutter-xs text-center" @click.stop>
              <q-btn
                flat
                round
                color="blue"
                icon="edit"
                size="sm"
                @click="openEditSpkDialog(props.row)"
              />
              <q-btn
                flat
                round
                color="negative"
                icon="delete"
                size="sm"
                @click="hapusSpk(props.row)"
              />
            </q-td>
          </template>
        </q-table>
      </q-card>
    </div>

    <div v-else-if="viewMode === 'spk_detail' && currentSpk">
      <div class="row items-center q-mb-md">
        <q-btn
          flat
          round
          icon="arrow_back"
          color="primary"
          @click="viewMode = 'detail'"
          class="q-mr-md hover-scale"
        />
        <div class="col">
          <div class="text-h5 text-weight-bold text-indigo-10 text-uppercase letter-spacing-1">
            SPK: {{ currentSpk.nomor_spk }}
          </div>
        </div>
        <div class="col-auto">
          <q-btn
            unelevated
            color="positive"
            icon="check_circle"
            label="SIMPAN PERUBAHAN"
            :loading="savingRab"
            @click="saveRabModal"
            class="btn-radius q-px-xl shadow-5 text-weight-bold"
          />
        </div>
      </div>

      <q-card flat bordered class="rounded-borders bg-white shadow-10 overflow-hidden">
        <q-tabs
          v-model="activeTab"
          dense
          class="bg-indigo-1 text-indigo-9"
          active-color="indigo-10"
          indicator-color="indigo-10"
          align="left"
          narrow-indicator
          inline-label
        >
          <q-tab name="boq" label="1. RINCIAN BOQ" icon="format_list_bulleted" />
          <q-tab name="budget" label="2. BUDGETING ANALISA HARGA" icon="analytics" />
          <q-tab name="margin" label="3. ESTIMASI PROFIT" icon="payments" />
        </q-tabs>
        <q-separator />

        <q-tab-panels v-model="activeTab" animated class="bg-grey-2">
          <q-tab-panel name="boq" class="q-pa-lg">
            <div v-if="currentSpk.documents && currentSpk.documents.length > 0" class="q-mb-md">
              <div class="text-subtitle2 text-indigo-10 text-bold q-mb-sm uppercase">
                <q-icon name="attach_file" /> Dokumen Lampiran:
              </div>
              <div class="row q-gutter-sm">
                <q-btn
                  v-for="(doc, dIdx) in currentSpk.documents"
                  :key="dIdx"
                  unelevated
                  color="indigo-1"
                  text-color="indigo-10"
                  size="sm"
                  icon="description"
                  :label="doc.nama_file"
                  @click="openInternalPreview(doc.url)"
                  class="btn-radius text-bold border-indigo-thin"
                />
              </div>
            </div>
            <div class="bg-white rounded-borders shadow-2 overflow-hidden">
              <q-markup-table flat bordered separator="cell" class="boq-table-modern">
                <thead class="bg-indigo-10 text-white uppercase font-11">
                  <tr>
                    <th style="width: 60px">NO</th>
                    <th>ITEM PEKERJAAN</th>
                    <th style="width: 120px">VOL</th>
                    <th style="width: 100px">SAT</th>
                    <th class="text-right">HARGA SATUAN</th>
                    <th class="text-right" style="width: 200px">TOTAL NILAI</th>
                    <th style="width: 60px">
                      <q-btn
                        flat
                        round
                        color="white"
                        icon="add"
                        size="sm"
                        @click="addBoqItemInsideDetail"
                      />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(item, idx) in currentSpk.boq_items"
                    :key="idx"
                    :class="item.is_header ? 'bg-indigo-1' : ''"
                  >
                    <td class="text-center text-weight-bold text-indigo-10">{{ idx + 1 }}</td>
                    <td class="no-padding">
                      <q-input
                        borderless
                        dense
                        v-model="item.deskripsi"
                        :input-class="
                          item.is_header ? 'text-bold text-indigo-10 uppercase q-px-md' : 'q-px-md'
                        "
                        :readonly="item.deskripsi === 'PRELIMINARY'"
                      />
                    </td>
                    <td class="no-padding text-center">
                      <template v-if="!item.is_header"
                        ><q-input
                          borderless
                          dense
                          v-model.number="item.volume"
                          type="number"
                          class="text-center"
                      /></template>
                    </td>
                    <td class="no-padding text-center">
                      <template v-if="!item.is_header"
                        ><q-input
                          borderless
                          dense
                          v-model="item.satuan"
                          class="text-center text-uppercase"
                      /></template>
                    </td>
                    <td class="no-padding text-right">
                      <template v-if="!item.is_header"
                        ><q-input
                          borderless
                          dense
                          v-model.number="item.harga_satuan"
                          type="number"
                          class="text-right q-px-md"
                      /></template>
                    </td>
                    <td class="text-right text-bold text-indigo-10">
                      <template v-if="!item.is_header"
                        >Rp {{ formatMoney(item.volume * item.harga_satuan) }}</template
                      >
                    </td>
                    <td class="text-center">
                      <q-btn
                        flat
                        round
                        color="negative"
                        icon="remove_circle_outline"
                        size="sm"
                        @click="currentSpk.boq_items.splice(idx, 1)"
                        :disabled="item.deskripsi === 'PRELIMINARY'"
                      />
                    </td>
                  </tr>
                </tbody>
              </q-markup-table>
              <div class="q-pa-md text-right bg-indigo-10 text-white shadow-up-2">
                <span class="text-subtitle1 q-mr-lg">GRAND TOTAL NILAI KONTRAK:</span>
                <span class="text-h5 text-bold text-yellow"
                  >Rp
                  {{
                    formatMoney(
                      currentSpk.boq_items.reduce(
                        (a, b) => a + (b.is_header ? 0 : b.volume * b.harga_satuan),
                        0,
                      ),
                    )
                  }}</span
                >
              </div>
            </div>
          </q-tab-panel>

          <q-tab-panel name="budget" class="q-pa-none">
            <div
              class="q-mb-xl bg-white shadow-3 border-orange-top rounded-borders overflow-hidden mx-md mt-md"
            >
              <div
                class="bg-orange-10 text-white q-pa-md row items-center justify-between shadow-2"
              >
                <div class="row items-center">
                  <q-icon name="construction" size="24px" class="q-mr-sm" />
                  <div class="text-subtitle1 text-bold uppercase">
                    PRELIMINARY & BIAYA AWAL PROYEK
                  </div>
                </div>
              </div>
              <q-markup-table flat bordered separator="cell" dense class="excel-table-modern">
                <thead
                  class="bg-orange-1 font-10 uppercase text-weight-bold text-center text-orange-10"
                >
                  <tr>
                    <th style="width: 50px">BOLD</th>
                    <th>KOMPONEN BIAYA</th>
                    <th style="width: 80px">UNIT</th>
                    <th style="width: 80px">PMK</th>
                    <th style="width: 80px">DUR</th>
                    <th style="width: 150px">HARGA SATUAN</th>
                    <th style="width: 180px">SUBTOTAL MODAL</th>
                    <th style="width: 50px">
                      <q-btn
                        flat
                        round
                        color="orange-10"
                        icon="add"
                        size="xs"
                        @click="addPreliminaryRow"
                      />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(pre, pIdx) in currentSpk.rab_preliminary || []"
                    :key="pIdx"
                    :class="pre.is_header ? 'bg-orange-1' : ''"
                  >
                    <td class="text-center">
                      <q-checkbox
                        v-model="pre.is_header"
                        dense
                        size="xs"
                        color="orange-10"
                        checked-icon="format_bold"
                        @update:model-value="handleHeaderToggle(pre)"
                      />
                    </td>
                    <td class="no-padding">
                      <q-input
                        borderless
                        dense
                        v-model="pre.kebutuhan"
                        :input-class="
                          pre.is_header
                            ? 'text-bold text-orange-10 uppercase q-px-md'
                            : 'q-px-lg text-grey-9'
                        "
                      />
                    </td>
                    <td class="no-padding">
                      <q-input
                        borderless
                        dense
                        v-model.number="pre.unit"
                        type="number"
                        class="text-center"
                        :disable="pre.is_header"
                      />
                    </td>
                    <td class="no-padding">
                      <q-input
                        borderless
                        dense
                        v-model.number="pre.pemakaian"
                        type="number"
                        class="text-center"
                        :disable="pre.is_header"
                      />
                    </td>
                    <td class="no-padding">
                      <q-input
                        borderless
                        dense
                        v-model.number="pre.durasi"
                        type="number"
                        class="text-center"
                        :disable="pre.is_header"
                      />
                    </td>
                    <td class="no-padding">
                      <q-input
                        borderless
                        dense
                        v-model.number="pre.harga"
                        type="number"
                        class="text-right q-px-md"
                        :disable="pre.is_header"
                      />
                    </td>
                    <td
                      class="text-right text-bold q-px-md"
                      :class="pre.is_header ? 'bg-orange-2' : 'bg-grey-1 text-indigo-10'"
                    >
                      <template v-if="!pre.is_header"
                        >Rp {{ formatMoney(calculateRowTotal(pre)) }}</template
                      >
                    </td>
                    <td class="text-center">
                      <q-btn
                        flat
                        round
                        color="grey-5"
                        icon="delete"
                        size="xs"
                        @click="currentSpk.rab_preliminary.splice(pIdx, 1)"
                      />
                    </td>
                  </tr>
                </tbody>
              </q-markup-table>
              <div class="bg-orange-1 q-pa-md text-right border-top-dash">
                <span class="text-orange-9 uppercase text-bold q-mr-md font-11"
                  >Total Preliminary: </span
                ><span class="text-orange-10 text-h5 text-bold"
                  >Rp
                  {{
                    formatMoney(
                      currentSpk.rab_preliminary?.reduce((s, r) => s + calculateRowTotal(r), 0) ||
                        0,
                    )
                  }}</span
                >
              </div>
            </div>
            <div
              v-for="(boq, bIdx) in currentSpk.boq_items"
              :key="bIdx"
              class="q-mb-xl bg-white shadow-3 border-indigo-top rounded-borders overflow-hidden mx-md mt-md"
            >
              <div
                class="bg-indigo-10 text-white q-pa-md row items-center justify-between shadow-2"
              >
                <div class="row items-center">
                  <q-avatar
                    color="yellow"
                    text-color="indigo-10"
                    size="32px"
                    class="q-mr-md text-bold"
                    >{{ bIdx + 1 }}</q-avatar
                  >
                  <div class="text-subtitle1 text-bold uppercase">{{ boq.deskripsi }}</div>
                </div>
                <div class="text-h6 text-yellow text-bold text-body1">
                  JUAL: Rp {{ formatMoney(boq.volume * boq.harga_satuan) }}
                </div>
              </div>
              <q-markup-table flat bordered separator="cell" dense class="excel-table-modern">
                <thead
                  class="bg-indigo-1 font-10 uppercase text-weight-bold text-center text-indigo-10"
                >
                  <tr>
                    <th style="width: 50px">BOLD</th>
                    <th>KOMPONEN BIAYA</th>
                    <th style="width: 80px">UNIT</th>
                    <th style="width: 80px">PMK</th>
                    <th style="width: 80px">DUR</th>
                    <th style="width: 150px">HARGA SATUAN</th>
                    <th style="width: 180px">SUBTOTAL MODAL</th>
                    <th style="width: 50px">
                      <q-btn
                        flat
                        round
                        color="indigo"
                        icon="add"
                        size="xs"
                        @click="addRabRowComplex(bIdx)"
                      />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(rab, rIdx) in boq.rab_modal || []"
                    :key="rIdx"
                    :class="rab.is_header ? 'bg-indigo-1' : ''"
                  >
                    <td class="text-center">
                      <q-checkbox
                        v-model="rab.is_header"
                        dense
                        size="xs"
                        color="indigo-10"
                        checked-icon="format_bold"
                        @update:model-value="handleHeaderToggle(rab)"
                      />
                    </td>
                    <td class="no-padding">
                      <q-input
                        borderless
                        dense
                        v-model="rab.kebutuhan"
                        :input-class="
                          rab.is_header
                            ? 'text-bold text-indigo-10 uppercase q-px-md'
                            : 'q-px-lg text-indigo-9'
                        "
                      />
                    </td>
                    <td class="no-padding">
                      <q-input
                        borderless
                        dense
                        v-model.number="rab.unit"
                        type="number"
                        class="text-center"
                        :disable="rab.is_header"
                      />
                    </td>
                    <td class="no-padding">
                      <q-input
                        borderless
                        dense
                        v-model.number="rab.pemakaian"
                        type="number"
                        class="text-center"
                        :disable="rab.is_header"
                      />
                    </td>
                    <td class="no-padding">
                      <q-input
                        borderless
                        dense
                        v-model.number="rab.durasi"
                        type="number"
                        class="text-center"
                        :disable="rab.is_header"
                      />
                    </td>
                    <td class="no-padding">
                      <q-input
                        borderless
                        dense
                        v-model.number="rab.harga"
                        type="number"
                        class="text-right q-px-md"
                        :disable="rab.is_header"
                      />
                    </td>
                    <td
                      class="text-right text-bold q-px-md"
                      :class="rab.is_header ? 'bg-indigo-2' : 'bg-grey-1 text-indigo-10'"
                    >
                      <template v-if="!rab.is_header"
                        >Rp {{ formatMoney(calculateRowTotal(rab)) }}</template
                      >
                    </td>
                    <td class="text-center">
                      <q-btn
                        flat
                        round
                        color="grey-5"
                        icon="delete"
                        size="xs"
                        @click="boq.rab_modal.splice(rIdx, 1)"
                      />
                    </td>
                  </tr>
                </tbody>
              </q-markup-table>
              <div class="bg-indigo-1 q-pa-md text-right border-top-dash">
                <span class="text-indigo-7 uppercase text-bold q-mr-md font-11"
                  >Subtotal Modal: </span
                ><span class="text-negative text-h5 text-bold"
                  >Rp {{ formatMoney(sumRabPerItem(boq)) }}</span
                >
              </div>
            </div>
          </q-tab-panel>

          <q-tab-panel name="margin" class="q-pa-xl">
            <div class="row q-col-gutter-xl justify-center">
              <div class="col-12 col-md-4">
                <q-card
                  flat
                  class="profit-dashboard-card bg-indigo-10 text-white shadow-8 prestige-card"
                >
                  <q-card-section class="q-pa-lg">
                    <div class="text-overline uppercase opacity-7 text-bold letter-spacing-2">
                      Total Pendapatan (Jual)
                    </div>
                    <div class="text-h4 text-bold q-mt-sm">
                      Rp {{ formatMoney(currentSpk.nilai_total) }}
                    </div>
                  </q-card-section>
                  <q-icon name="trending_up" class="card-watermark" />
                </q-card>
              </div>
              <div class="col-12 col-md-4">
                <q-card
                  flat
                  class="profit-dashboard-card bg-red-10 text-white shadow-8 prestige-card"
                >
                  <q-card-section class="q-pa-lg">
                    <div class="text-overline uppercase opacity-7 text-bold letter-spacing-2">
                      Total Pengeluaran (Modal)
                    </div>
                    <div class="text-h4 text-bold q-mt-sm">Rp {{ formatMoney(totalModalAll) }}</div>
                  </q-card-section>
                  <q-icon name="shopping_cart" class="card-watermark" />
                </q-card>
              </div>
              <div class="col-12 col-md-4">
                <q-card
                  flat
                  class="profit-dashboard-card shadow-8 prestige-card"
                  :class="
                    currentSpk.nilai_total - totalModalAll < 0 ? 'bg-orange-10' : 'bg-green-10'
                  "
                >
                  <q-card-section class="q-pa-lg">
                    <div
                      class="text-overline uppercase opacity-7 text-bold text-white letter-spacing-2"
                    >
                      Estimasi Laba Kotor
                    </div>
                    <div class="text-h4 text-bold text-white q-mt-sm">
                      Rp {{ formatMoney(currentSpk.nilai_total - totalModalAll) }}
                    </div>
                    <div class="q-mt-lg margin-pill bg-white text-dark text-bold shadow-2">
                      Margin Profit:
                      {{
                        currentSpk.nilai_total > 0
                          ? (
                              ((currentSpk.nilai_total - totalModalAll) / currentSpk.nilai_total) *
                              100
                            ).toFixed(2)
                          : 0
                      }}%
                    </div>
                  </q-card-section>
                  <q-icon name="savings" class="card-watermark text-white" />
                </q-card>
              </div>
            </div>
          </q-tab-panel>
        </q-tab-panels>
      </q-card>
    </div>

    <q-dialog v-model="showDocPreview" maximized transition-show="scale" transition-hide="scale">
      <q-card class="bg-grey-10">
        <q-toolbar class="bg-indigo-10 text-white"
          ><q-toolbar-title>Preview Dokumen</q-toolbar-title
          ><q-btn flat round dense icon="close" v-close-popup
        /></q-toolbar>
        <q-card-section class="no-padding full-height" style="height: calc(100vh - 50px)"
          ><iframe :src="previewUrl" width="100%" height="100%" style="border: none"></iframe
        ></q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="showAddDialog" persistent maximized transition-show="slide-up">
      <q-card class="column no-wrap shadow-2">
        <q-toolbar class="bg-indigo-10 text-white q-py-md shadow-1"
          ><q-btn flat round dense icon="close" v-close-popup /><q-toolbar-title
            class="text-weight-bold text-center uppercase"
            >Registrasi Proyek Baru</q-toolbar-title
          ></q-toolbar
        >
        <q-card-section class="col scroll q-pa-xl row justify-center bg-grey-1">
          <div class="col-12 col-md-6 q-gutter-y-lg">
            <q-input filled v-model="form.nama" label="Nama Proyek *" bg-color="white" />
            <q-select
              filled
              v-model="form.kategori"
              :options="optionsKategori"
              label="Kategori Proyek *"
              emit-value
              map-options
              bg-color="white"
            />
            <q-select
              filled
              v-model="form.konsumen"
              :options="optionsKonsumen"
              label="Pilih Customer"
              emit-value
              map-options
              bg-color="white"
            />
            <q-input
              filled
              v-model="form.alamat"
              label="Lokasi"
              type="textarea"
              rows="3"
              bg-color="white"
            />
            <q-btn
              unelevated
              color="indigo-10"
              label="SIMPAN DATA PROYEK"
              @click="simpanProyek"
              class="full-width btn-radius q-py-md text-weight-bold shadow-2"
            />
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="showAddSpk" maximized transition-show="slide-up">
      <q-card class="bg-grey-1 column no-wrap">
        <q-toolbar class="bg-indigo-10 text-white q-py-md shadow-1">
          <q-btn flat round dense icon="close" v-close-popup />
          <q-toolbar-title class="text-weight-bold text-center uppercase letter-spacing-2">{{
            isEditSpkMode ? 'Edit SPK' : 'SPK Baru'
          }}</q-toolbar-title>
          <q-btn
            unelevated
            color="indigo-1"
            text-color="indigo-10"
            label="SIMPAN SPK"
            @click="handleSaveSpk"
            :loading="submittingSpk"
            class="btn-radius q-px-xl text-weight-bold"
          />
        </q-toolbar>

        <q-card-section class="col scroll q-pa-lg">
          <div class="row justify-center q-col-gutter-lg">
            <div class="col-12 col-lg-4 q-gutter-y-md">
              <q-card
                flat
                bordered
                class="q-pa-md bg-white rounded-borders shadow-1 border-indigo-thin"
              >
                <div class="text-subtitle2 text-indigo-10 q-mb-md uppercase font-bold">
                  Informasi Utama Kontrak
                </div>
                <q-input
                  outlined
                  dense
                  v-model="formSpk.nomor_spk"
                  label="Nomor SPK / Kontrak *"
                  class="q-mb-md"
                />
                <q-input
                  outlined
                  dense
                  v-model="formSpk.nomor_quotation"
                  label="Nomor Quotation"
                  class="q-mb-md"
                />
                <q-input
                  outlined
                  dense
                  v-model="formSpk.nama_kontrak"
                  label="Nama Kontrak Pekerjaan"
                  class="q-mb-md"
                />
                <q-input
                  outlined
                  dense
                  v-model="formSpk.tgl_spk"
                  type="date"
                  label="Tanggal Kontrak"
                  stack-label
                />
              </q-card>
              <q-card
                flat
                bordered
                class="bg-white rounded-borders shadow-1 overflow-hidden border-indigo-thin"
              >
                <q-toolbar class="bg-indigo-1 text-indigo-10"
                  ><q-toolbar-title class="text-subtitle2 text-bold uppercase"
                    >Lampiran</q-toolbar-title
                  ><q-btn flat round icon="add_circle" @click="addDocumentRow" size="sm"
                /></q-toolbar>
                <q-list separator>
                  <q-item v-for="(doc, dIdx) in formSpk.documents || []" :key="dIdx">
                    <q-item-section
                      ><q-input
                        borderless
                        dense
                        v-model="doc.nama_file"
                        placeholder="Nama Dokumen..."
                        class="text-bold"
                      />
                      <div class="row items-center q-gutter-x-sm">
                        <q-file
                          v-if="!doc.url"
                          dense
                          outlined
                          v-model="doc.file_raw"
                          label="Pilih File"
                          class="col"
                          accept=".pdf,.jpg,.png"
                        /><q-btn
                          v-else
                          flat
                          color="primary"
                          label="Preview"
                          icon="visibility"
                          size="sm"
                          @click="openInternalPreview(doc.url)"
                        /><q-badge v-if="doc.url" color="green" label="Terupload" />
                      </div>
                    </q-item-section>
                    <q-item-section side
                      ><q-btn
                        flat
                        round
                        color="negative"
                        icon="delete"
                        size="sm"
                        @click="formSpk.documents.splice(dIdx, 1)"
                    /></q-item-section>
                  </q-item>
                </q-list>
              </q-card>
            </div>

            <div class="col-12 col-lg-8 q-gutter-y-md">
              <q-card
                flat
                bordered
                class="bg-white rounded-borders shadow-2 overflow-hidden border-orange-top"
              >
                <q-toolbar class="bg-orange-10 text-white text-bold uppercase shadow-2"
                  >Preliminary & Biaya Awal (SPK)</q-toolbar
                >
                <q-markup-table flat bordered separator="cell" dense class="excel-table-modern">
                  <thead
                    class="bg-orange-1 text-orange-10 font-10 uppercase text-weight-bold text-center"
                  >
                    <tr>
                      <th style="width: 50px">BOLD</th>
                      <th>KOMPONEN BIAYA / DESKRIPSI</th>
                      <th style="width: 80px">QTY</th>
                      <th style="width: 80px">SAT</th>
                      <th>HARGA JUAL</th>
                      <th style="width: 150px">TOTAL</th>
                      <th style="width: 40px">-</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="(pre, pIdx) in formSpk.rab_preliminary ||
                      (formSpk.rab_preliminary = [])"
                      :key="pIdx"
                      :class="pre.is_header ? 'bg-orange-1' : ''"
                    >
                      <td class="text-center">
                        <q-checkbox
                          v-model="pre.is_header"
                          dense
                          size="xs"
                          color="orange-10"
                          checked-icon="format_bold"
                          @update:model-value="handleHeaderToggle(pre)"
                        />
                      </td>
                      <td class="no-padding">
                        <q-input
                          borderless
                          dense
                          v-model="pre.kebutuhan"
                          :input-class="
                            pre.is_header ? 'text-bold text-orange-10 uppercase q-px-sm' : 'q-px-sm'
                          "
                        />
                      </td>
                      <td class="no-padding">
                        <q-input
                          borderless
                          dense
                          v-model.number="pre.unit"
                          type="number"
                          class="text-center"
                          :disable="pre.is_header"
                        />
                      </td>
                      <td class="no-padding">
                        <q-input
                          borderless
                          dense
                          v-model="pre.satuan"
                          class="text-center"
                          :disable="pre.is_header"
                        />
                      </td>
                      <td class="no-padding">
                        <q-input
                          borderless
                          dense
                          v-model.number="pre.harga"
                          type="number"
                          class="text-right q-px-sm"
                          :disable="pre.is_header"
                        />
                      </td>
                      <td class="text-right text-bold text-indigo-10 q-px-sm">
                        <template v-if="!pre.is_header"
                          >Rp {{ formatMoney(calculateRowTotal(pre)) }}</template
                        >
                      </td>
                      <td class="text-center">
                        <q-btn
                          flat
                          round
                          color="negative"
                          icon="delete"
                          size="sm"
                          @click="formSpk.rab_preliminary.splice(pIdx, 1)"
                        />
                      </td>
                    </tr>
                  </tbody>
                </q-markup-table>
                <q-btn
                  flat
                  color="orange-10"
                  icon="add"
                  label="TAMBAH PRELIMINARY"
                  @click="addPreliminaryRowForm"
                  class="full-width q-py-sm text-bold"
                />
              </q-card>

              <q-card
                flat
                bordered
                class="bg-white rounded-borders shadow-2 overflow-hidden border-indigo-thin"
              >
                <q-toolbar class="bg-indigo-10 text-white text-bold uppercase shadow-2"
                  >Item BOQ Kontrak Pekerjaan</q-toolbar
                >
                <q-markup-table flat bordered separator="cell" dense class="excel-table-modern">
                  <thead class="bg-indigo-1 text-indigo-10 font-10 uppercase text-weight-bold">
                    <tr>
                      <th style="width: 50px">BOLD</th>
                      <th>ITEM PEKERJAAN</th>
                      <th style="width: 80px">QTY</th>
                      <th style="width: 80px">SAT</th>
                      <th>HARGA JUAL</th>
                      <th style="width: 150px">TOTAL</th>
                      <th style="width: 40px">-</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="(item, idx) in formSpk.boq_items"
                      :key="idx"
                      :class="item.is_header ? 'bg-indigo-1' : ''"
                    >
                      <td class="text-center">
                        <q-checkbox
                          v-model="item.is_header"
                          dense
                          size="xs"
                          color="indigo-10"
                          checked-icon="format_bold"
                          @update:model-value="handleBoqHeaderToggle(item)"
                        />
                      </td>
                      <td class="no-padding">
                        <q-input
                          borderless
                          dense
                          v-model="item.deskripsi"
                          :input-class="
                            item.is_header
                              ? 'text-bold text-indigo-10 uppercase q-px-sm'
                              : 'q-px-sm'
                          "
                          :readonly="item.deskripsi === 'PRELIMINARY'"
                        />
                      </td>
                      <td class="no-padding">
                        <q-input
                          borderless
                          dense
                          v-model.number="item.volume"
                          type="number"
                          class="text-center"
                          :disable="item.is_header"
                        />
                      </td>
                      <td class="no-padding">
                        <q-input
                          borderless
                          dense
                          v-model="item.satuan"
                          class="text-center uppercase"
                          :disable="item.is_header"
                        />
                      </td>
                      <td class="no-padding">
                        <q-input
                          borderless
                          dense
                          v-model.number="item.harga_satuan"
                          type="number"
                          class="text-right q-px-sm"
                          :disable="item.is_header"
                        />
                      </td>
                      <td class="text-right text-bold text-indigo-10 q-px-sm">
                        <template v-if="!item.is_header"
                          >Rp {{ formatMoney(item.volume * item.harga_satuan) }}</template
                        >
                      </td>
                      <td class="text-center">
                        <q-btn
                          flat
                          round
                          color="negative"
                          icon="delete"
                          size="sm"
                          @click="formSpk.boq_items.splice(idx, 1)"
                          :disabled="item.deskripsi === 'PRELIMINARY'"
                        />
                      </td>
                    </tr>
                  </tbody>
                </q-markup-table>
                <q-btn
                  flat
                  color="indigo-10"
                  icon="add"
                  label="TAMBAH BARIS BOQ"
                  @click="addBoqRow"
                  class="full-width q-py-md text-bold"
                />
              </q-card>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useQuasar } from 'quasar'
import { db, storage } from 'src/boot/firebase'
import { ref as sRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  serverTimestamp,
  where,
  orderBy,
} from 'firebase/firestore'

const $q = useQuasar()
const viewMode = ref('list')
const activeTab = ref('boq')
const rows = ref([])
const listSpkProject = ref([])
const currentProject = ref(null)
const currentSpk = ref(null)
const loading = ref(false)
const savingRab = ref(false)
const submittingSpk = ref(false)
const showAddDialog = ref(false)
const isEditMode = ref(false)
const showAddSpk = ref(false)
const isEditSpkMode = ref(false)
const showDocPreview = ref(false)
const previewUrl = ref('')

const form = ref({ nama: '', kategori: '', konsumen: '', alamat: '' })
const formSpk = ref({
  nomor_spk: '',
  nomor_quotation: '',
  nama_kontrak: '',
  tgl_spk: '',
  boq_items: [],
  documents: [],
  rab_preliminary: [],
})
const optionsKonsumen = ref([])
const optionsKategori = ref([])

const formatMoney = (v) => (v ? v.toLocaleString('id-ID') : '0')
const calculateRowTotal = (rab) => {
  if (rab.is_header) return 0
  const u = Number(rab.unit) || 0
  const p = rab.pemakaian === 0 || !rab.pemakaian ? 1 : Number(rab.pemakaian)
  const d = rab.durasi === 0 || !rab.durasi ? 1 : Number(rab.durasi)
  const h = Number(rab.harga) || 0
  return u * p * d * h
}
const handleHeaderToggle = (row) => {
  if (row.is_header) {
    row.unit = 0
    row.pemakaian = 0
    row.durasi = 0
    row.harga = 0
    row.satuan = ''
  } else {
    row.unit = 1
  }
}
const handleBoqHeaderToggle = (item) => {
  if (item.is_header) {
    item.volume = 0
    item.harga_satuan = 0
    item.satuan = ''
  } else {
    item.volume = 1
  }
}
const sumRabPerItem = (boq) =>
  (boq.rab_modal || []).reduce((sum, r) => sum + calculateRowTotal(r), 0)
const totalModalAll = computed(() => {
  const boqTotal = (currentSpk.value?.boq_items || []).reduce(
    (sum, boq) => sum + sumRabPerItem(boq),
    0,
  )
  const prelimTotal = (currentSpk.value?.rab_preliminary || []).reduce(
    (sum, r) => sum + calculateRowTotal(r),
    0,
  )
  return (boqTotal || 0) + (prelimTotal || 0)
})
// eslint-disable-next-line no-unused-vars
const calculateMarginPercent = (boq) => {
  const jual = boq.volume * boq.harga_satuan
  if (jual === 0) return 0
  return (((jual - sumRabPerItem(boq)) / jual) * 100).toFixed(2)
}
// eslint-disable-next-line no-unused-vars
const calculateTotalMarginPercent = computed(() => {
  const totalJual = currentSpk.value?.nilai_total || 0
  if (totalJual === 0) return 0
  return (((totalJual - totalModalAll.value) / totalJual) * 100).toFixed(2)
})

const getBase64 = (file) =>
  new Promise((res, rej) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => res(reader.result)
    reader.onerror = (e) => rej(e)
  })
const openInternalPreview = (url) => {
  previewUrl.value = url
  showDocPreview.value = true
}
const processDocuments = async (docs) => {
  const processed = []
  for (const d of docs) {
    if (d.file_raw) {
      const sizeKB = d.file_raw.size / 1024
      if (sizeKB < 500) {
        const b64 = await getBase64(d.file_raw)
        processed.push({ nama_file: d.nama_file || d.file_raw.name, url: b64 })
      } else {
        const path = `spk_docs/${Date.now()}_${d.file_raw.name}`
        const storageRef = sRef(storage, path)
        const snap = await uploadBytes(storageRef, d.file_raw)
        const url = await getDownloadURL(snap.ref)
        processed.push({ nama_file: d.nama_file || d.file_raw.name, url: url })
      }
    } else if (d.url) {
      processed.push({ nama_file: d.nama_file, url: d.url })
    }
  }
  return processed
}

const fetchProyek = async () => {
  loading.value = true
  try {
    const snap = await getDocs(query(collection(db, 'proyek'), orderBy('createdAt', 'desc')))
    const proyekData = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    const updatedRows = await Promise.all(
      proyekData.map(async (p) => {
        const spkSnap = await getDocs(
          query(collection(db, 'spk_customer'), where('projectId', '==', p.id)),
        )
        const totalOmzet = spkSnap.docs.reduce(
          (acc, curr) => acc + (curr.data().nilai_total || 0),
          0,
        )
        return { ...p, spk_count: spkSnap.size, total_omzet: totalOmzet }
      }),
    )
    rows.value = updatedRows
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const fetchSpkByProject = async (pid) => {
  const q = query(collection(db, 'spk_customer'), where('projectId', '==', pid))
  const snap = await getDocs(q)
  const spks = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  listSpkProject.value = spks
  if (currentProject.value)
    currentProject.value.total_omzet = spks.reduce((a, b) => a + (b.nilai_total || 0), 0)
}

const handleSaveSpk = async () => {
  submittingSpk.value = true
  try {
    const docs = await processDocuments(formSpk.value.documents || [])
    const payload = JSON.parse(JSON.stringify(formSpk.value))
    payload.nilai_total =
      (payload.boq_items || []).reduce(
        (s, i) => s + (i.is_header ? 0 : i.volume * i.harga_satuan),
        0,
      ) + (payload.rab_preliminary || []).reduce((s, i) => s + calculateRowTotal(i), 0)
    payload.projectId = currentProject.value.id
    payload.documents = docs.map((d) => {
      const c = { ...d }
      delete c.file_raw
      return c
    })
    if (isEditSpkMode.value) {
      await updateDoc(doc(db, 'spk_customer', payload.id), {
        ...payload,
        updatedAt: serverTimestamp(),
      })
    } else {
      payload.createdAt = serverTimestamp()
      await addDoc(collection(db, 'spk_customer'), payload)
    }
    showAddSpk.value = false
    await fetchSpkByProject(currentProject.value.id)
    await fetchProyek()
  } catch (e) {
    console.error(e)
  } finally {
    submittingSpk.value = false
  }
}

const showProjectDetail = (evt, row) => {
  currentProject.value = { ...row }
  viewMode.value = 'detail'
  fetchSpkByProject(row.id)
}
const showSpkDetail = (evt, row) => {
  currentSpk.value = JSON.parse(JSON.stringify(row))
  if (!currentSpk.value.boq_items) currentSpk.value.boq_items = []
  if (!currentSpk.value.rab_preliminary) currentSpk.value.rab_preliminary = []
  currentSpk.value.boq_items.forEach((i) => {
    if (!i.rab_modal) i.rab_modal = []
  })
  activeTab.value = 'boq'
  viewMode.value = 'spk_detail'
}

const saveRabModal = async () => {
  savingRab.value = true
  try {
    const payload = JSON.parse(JSON.stringify(currentSpk.value))
    const sid = payload.id
    delete payload.id
    payload.nilai_total =
      (payload.boq_items || []).reduce(
        (s, i) => s + (i.is_header ? 0 : i.volume * i.harga_satuan),
        0,
      ) + (payload.rab_preliminary || []).reduce((s, i) => s + calculateRowTotal(i), 0)
    await updateDoc(doc(db, 'spk_customer', sid), { ...payload, updatedAt: serverTimestamp() })
    $q.notify({ type: 'positive', message: 'Tersimpan!', position: 'top' })
    await fetchSpkByProject(currentProject.value.id)
    await fetchProyek()
  } catch (e) {
    console.error(e)
  } finally {
    savingRab.value = false
  }
}

const simpanProyek = async () => {
  try {
    const p = { ...form.value, updatedAt: serverTimestamp() }
    if (isEditMode.value) {
      await updateDoc(doc(db, 'proyek', p.id), p)
    } else {
      p.createdAt = serverTimestamp()
      await addDoc(collection(db, 'proyek'), p)
    }
    showAddDialog.value = false
    await fetchProyek()
  } catch (e) {
    console.error(e)
  }
}

const openAddDialog = () => {
  isEditMode.value = false
  form.value = { nama: '', kategori: '', konsumen: '', alamat: '' }
  showAddDialog.value = true
}
const openEditDialog = (row) => {
  isEditMode.value = true
  form.value = { ...row }
  showAddDialog.value = true
}
const openAddSpkDialog = () => {
  isEditSpkMode.value = false
  formSpk.value = {
    nomor_spk: '',
    nomor_quotation: '',
    nama_kontrak: '',
    tgl_spk: '',
    boq_items: [],
    documents: [],
    rab_preliminary: [],
  }
  showAddSpk.value = true
}
const openEditSpkDialog = (row) => {
  isEditSpkMode.value = true
  formSpk.value = JSON.parse(JSON.stringify(row))
  if (!formSpk.value.documents) formSpk.value.documents = []
  if (!formSpk.value.rab_preliminary) formSpk.value.rab_preliminary = []
  showAddSpk.value = true
}

const addBoqItemInsideDetail = () =>
  currentSpk.value.boq_items.push({
    deskripsi: '',
    volume: 1,
    satuan: 'ls',
    harga_satuan: 0,
    rab_modal: [],
    is_header: false,
  })
const addBoqRow = () =>
  formSpk.value.boq_items.push({
    deskripsi: '',
    volume: 1,
    satuan: 'ls',
    harga_satuan: 0,
    rab_modal: [],
    is_header: false,
  })
const addDocumentRow = () =>
  formSpk.value.documents.push({ nama_file: '', file_raw: null, url: null })
const addPreliminaryRow = () =>
  currentSpk.value.rab_preliminary.push({
    kebutuhan: '',
    unit: 1,
    pemakaian: '',
    durasi: '',
    harga: 0,
    is_header: false,
  })
const addPreliminaryRowForm = () =>
  formSpk.value.rab_preliminary.push({
    kebutuhan: '',
    unit: 1,
    satuan: 'ls',
    harga: 0,
    is_header: false,
  })
const addRabRowComplex = (bIdx) =>
  currentSpk.value.boq_items[bIdx].rab_modal.push({
    kebutuhan: '',
    unit: 1,
    pemakaian: '',
    durasi: '',
    harga: 0,
    is_header: false,
  })
const hapusProyek = (row) => {
  $q.dialog({ title: 'Hapus Proyek', message: `Hapus permanent?`, cancel: true }).onOk(async () => {
    await deleteDoc(doc(db, 'proyek', row.id))
    fetchProyek()
  })
}
const hapusSpk = (row) => {
  $q.dialog({ title: 'Hapus SPK', message: `Hapus permanent?`, cancel: true }).onOk(async () => {
    await deleteDoc(doc(db, 'spk_customer', row.id))
    await fetchSpkByProject(currentProject.value.id)
    fetchProyek()
  })
}

onMounted(() => {
  fetchProyek()
  getDocs(collection(db, 'customer')).then(
    (c) => (optionsKonsumen.value = c.docs.map((d) => d.data().nama)),
  )
  getDocs(collection(db, 'kategori_proyek')).then(
    (k) => (optionsKategori.value = k.docs.map((d) => d.data().nama)),
  )
})

const columns = [
  {
    name: 'nama',
    align: 'left',
    label: 'PROYEK',
    field: 'nama',
    classes: 'text-bold text-indigo-10',
  },
  { name: 'customer', align: 'left', label: 'CUSTOMER', field: 'konsumen' },
  { name: 'jumlah_spk', align: 'center', label: 'TOTAL SPK' },
  {
    name: 'total_kontrak',
    align: 'right',
    label: 'ESTIMASI OMZET',
    field: 'total_omzet',
    classes: 'text-bold text-indigo',
  },
  { name: 'aksi', align: 'center', label: 'AKSI', field: 'id' },
]
const spkColumns = [
  {
    name: 'no_spk',
    align: 'left',
    label: 'NO. SPK / KONTRAK',
    field: 'nomor_spk',
    classes: 'text-bold text-indigo-10',
  },
  { name: 'nilai', align: 'right', label: 'TOTAL NILAI', field: 'nilai_total' },
  { name: 'aksi', align: 'center', label: 'AKSI', field: 'id' },
]
</script>

<style scoped>
.font-pro {
  font-family: 'Inter', sans-serif;
}
.btn-radius {
  border-radius: 12px;
}

/* CLEAN HEADER DETAIL RESTORED */
.border-right-sep {
  border-right: 1px solid #eeeeee;
}

/* PROFIT DASHBOARD PRESTIGE RE-DESIGNED */
.profit-dashboard-card {
  border: none;
  min-height: 160px;
  border-radius: 24px;
  position: relative;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.profit-dashboard-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2) !important;
}
.card-watermark {
  position: absolute;
  bottom: -15px;
  right: -10px;
  font-size: 110px;
  opacity: 0.15;
  transform: rotate(-15deg);
}
.margin-pill {
  padding: 8px 24px;
  border-radius: 100px;
  font-size: 1.2rem;
  display: inline-block;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
}

/* TABLES & INPUTS */
.boq-table-modern :deep(thead th) {
  font-size: 13px;
  font-weight: 800;
  border-bottom: 2px solid #1a237e;
  padding: 14px;
}
.excel-table-modern :deep(td) {
  padding: 0 !important;
  border: 1px solid #e0e0e0;
}
.excel-table-modern :deep(.q-field--focused) {
  background: #e8eaf6;
}
.border-indigo-top {
  border-top: 6px solid #1a237e;
}
.border-orange-top {
  border-top: 6px solid #e65100;
}
.border-top-dash {
  border-top: 2px dashed #999;
}
.border-indigo-thin {
  border: 1px solid #1a237e;
}
.no-padding {
  padding: 0 !important;
}
.border-right {
  border-right: 1px solid #eeeeee;
}
.letter-spacing-1 {
  letter-spacing: 1px;
}
.letter-spacing-2 {
  letter-spacing: 2px;
}
.hover-scale:hover {
  transform: scale(1.15);
}
</style>
