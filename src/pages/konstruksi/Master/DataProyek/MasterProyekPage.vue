<template>
  <q-page class="bg-grey-2 q-pa-md font-pro">
    <div v-if="viewMode === 'list'">
      <div class="row items-center q-mb-md">
        <div class="col">
          <div class="text-h5 text-weight-bold text-primary text-uppercase letter-spacing-1">
            Manajemen Proyek Utama
          </div>
          <div class="text-caption text-grey-7 uppercase">Daftar proyek aktif PT AGRA.</div>
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
          <template v-slot:body-cell-total_kontrak="props">
            <q-td :props="props" class="text-right text-bold text-primary">
              Rp {{ formatMoney(props.row.total_omzet || 0) }}
            </q-td>
          </template>
          <template v-slot:body-cell-aksi="props">
            <q-td :props="props" class="text-center q-gutter-xs" @click.stop>
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
          <div class="text-h5 text-weight-bold text-indigo-10 uppercase letter-spacing-1">
            Detail Proyek
          </div>
        </div>
      </div>

      <q-card flat bordered class="bg-white rounded-borders shadow-1 q-mb-xl overflow-hidden">
        <div class="row text-center q-py-lg items-center divider-container">
          <div class="col-4 border-right-sep">
            <div class="text-caption text-grey-6 uppercase text-bold letter-spacing-1">
              Customer
            </div>
            <div
              class="text-h6 text-indigo-10 text-weight-bolder text-uppercase q-mt-xs ellipsis q-px-md"
            >
              {{ currentProject.konsumen || '-' }}
            </div>
          </div>
          <div class="col-4 border-right-sep border-left-sep">
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
          @row-click="handleRowClickSpk"
          class="cursor-pointer spk-table-premium"
        >
          <template v-slot:body-cell-no_spk="props">
            <q-td :props="props">
              <div class="text-bold text-primary">{{ props.value }}</div>
              <div class="text-caption text-grey-6">{{ props.row.nama_kontrak }}</div>
            </q-td>
          </template>
          <template v-slot:body-cell-nilai="props">
            <q-td :props="props" class="text-right text-weight-bold text-indigo text-body1">
              Rp {{ formatMoney(props.value) }}
            </q-td>
          </template>
          <template v-slot:body-cell-aksi="props">
            <q-td :props="props" class="text-center q-gutter-x-sm" @click.stop>
              <q-btn flat round color="blue" icon="edit" size="sm" @click="editSpk(props.row)" />
              <q-btn
                flat
                round
                color="negative"
                icon="delete"
                size="sm"
                @click="confirmDeleteSpk(props.row)"
              />
              <q-btn
                flat
                round
                color="indigo-10"
                icon="visibility"
                size="sm"
                @click="showSpkDetail(null, props.row)"
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
          <div class="text-h5 text-weight-bold text-indigo-10 uppercase letter-spacing-1">
            Preview Kontrak / SPK
          </div>
        </div>
      </div>

      <q-card flat bordered class="q-mb-lg bg-white shadow-1">
        <q-card-section class="row q-col-gutter-md">
          <div class="col-12 col-md-3">
            <div class="text-caption text-grey-7 uppercase text-bold">No. SPK / Kontrak</div>
            <div class="text-subtitle1 text-bold">{{ currentSpk.nomor_spk }}</div>
            <div class="text-caption text-grey-7 q-mt-sm uppercase text-bold">No. Quotation</div>
            <div class="text-body1 q-mb-md">{{ currentSpk.no_quotation || '-' }}</div>
          </div>
          <div class="col-12 col-md-3 border-left-sep">
            <div class="text-caption text-grey-7 uppercase text-bold">Nama Kontrak</div>
            <div class="text-subtitle1 text-indigo-10 text-bold">{{ currentSpk.nama_kontrak }}</div>
            <div class="text-caption text-grey-7 q-mt-sm uppercase text-bold">Durasi Pekerjaan</div>
            <div class="text-body1 text-primary text-bold">{{ currentSpk.durasi || '-' }}</div>
          </div>
          <div class="col-12 col-md-3 border-left-sep">
            <div class="text-caption text-grey-7 uppercase text-bold">Mulai Pekerjaan</div>
            <div class="text-body1">{{ currentSpk.tgl_mulai || '-' }}</div>
            <div class="text-caption text-grey-7 q-mt-sm uppercase text-bold">Akhir Pekerjaan</div>
            <div class="text-body1">{{ currentSpk.tgl_akhir || '-' }}</div>
          </div>
          <div class="col-12 col-md-3 border-left-sep">
            <div class="text-caption text-grey-7 uppercase text-bold">Lampiran Dokumen</div>
            <div v-if="currentSpk.documents?.length" class="row q-gutter-xs q-mt-xs">
              <q-btn
                v-for="(doc, dIdx) in currentSpk.documents"
                :key="dIdx"
                unelevated
                color="indigo-1"
                text-color="indigo-10"
                size="sm"
                icon="description"
                :label="doc.label"
                @click="openInternalPreview(doc.url)"
                class="btn-radius"
              />
            </div>
            <div v-else class="text-caption text-grey-5 italic">Tidak ada dokumen</div>
          </div>
        </q-card-section>
      </q-card>

      <q-card flat bordered class="rounded-borders bg-white shadow-10 overflow-hidden">
        <div class="row items-center bg-indigo-1 q-px-md q-py-sm">
          <div class="col">
            <q-tabs
              v-model="activeTab"
              dense
              class="text-indigo-9"
              active-color="indigo-10"
              indicator-color="indigo-10"
              align="left"
              narrow-indicator
              inline-label
              style="height: 50px"
            >
              <q-tab
                name="boq"
                label="1. RINCIAN BOQ"
                icon="format_list_bulleted"
                class="q-px-lg"
              />
              <q-tab
                name="budget"
                label="2. BUDGETING ANALISA HARGA (RAB)"
                icon="analytics"
                class="q-px-lg"
              />
              <q-tab
                name="margin"
                label="3. BALANCE SHEET / PROFIT"
                icon="payments"
                class="q-px-lg"
              />
            </q-tabs>
          </div>
          <div class="col-auto">
            <q-btn
              unelevated
              color="positive"
              icon="check_circle"
              label="SIMPAN PERUBAHAN"
              :loading="savingRab"
              @click="saveRabModal"
              class="btn-radius text-weight-bold q-px-lg"
              size="md"
            />
          </div>
        </div>
        <q-separator />

        <q-tab-panels v-model="activeTab" animated class="bg-grey-2">
          <q-tab-panel name="boq" class="q-pa-lg">
            <div
              v-for="(group, gIdx) in currentSpk.groups"
              :key="gIdx"
              class="q-mb-xl bg-white rounded-borders shadow-2 overflow-hidden border-indigo"
            >
              <q-toolbar class="bg-indigo-10 text-white">
                <q-input
                  dark
                  borderless
                  dense
                  v-model="group.title"
                  class="text-bold uppercase full-width"
                  placeholder="Judul Tabel..."
                />
                <q-btn
                  flat
                  round
                  icon="delete"
                  size="sm"
                  @click="currentSpk.groups.splice(gIdx, 1)"
                />
              </q-toolbar>
              <q-markup-table flat bordered separator="cell" class="excel-grid-blue">
                <thead>
                  <tr class="bg-indigo-9 text-white font-11 uppercase text-center">
                    <th style="width: 50px">NO</th>
                    <th>ITEM PEKERJAAN</th>
                    <th style="width: 80px">QTY</th>
                    <th style="width: 80px">SAT</th>
                    <th style="width: 150px">HARGA JUAL</th>
                    <th style="width: 180px">TOTAL</th>
                    <th style="width: 50px">+</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(item, iIdx) in group.items"
                    :key="'i-' + iIdx"
                    :class="item.is_header ? 'bg-indigo-1' : ''"
                  >
                    <td class="text-center">{{ iIdx + 1 }}</td>
                    <td class="no-padding">
                      <div class="row no-wrap items-center">
                        <q-checkbox
                          v-model="item.is_header"
                          dense
                          size="xs"
                          class="q-mx-xs"
                          color="indigo"
                          checked-icon="format_bold"
                          @update:model-value="handleBoqHeaderToggle(item)"
                        />
                        <q-input
                          borderless
                          dense
                          v-model="item.deskripsi"
                          class="col"
                          :input-class="item.is_header ? 'text-bold q-px-sm' : 'q-px-sm'"
                        />
                      </div>
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
                        class="text-right q-px-md"
                        :disable="item.is_header"
                      />
                    </td>
                    <td class="text-right text-bold q-px-md">
                      Rp {{ formatMoney(item.volume * item.harga_satuan) }}
                    </td>
                    <td class="text-center">
                      <q-btn
                        flat
                        round
                        color="negative"
                        icon="delete"
                        size="xs"
                        @click="group.items.splice(iIdx, 1)"
                      />
                    </td>
                  </tr>
                </tbody>
              </q-markup-table>
              <q-btn
                flat
                color="indigo"
                icon="add"
                label="TAMBAH BARIS"
                @click="
                  group.items.push({
                    deskripsi: '',
                    volume: 1,
                    satuan: 'ls',
                    harga_satuan: 0,
                    rab_modal: [],
                  })
                "
                class="full-width"
              />
            </div>
            <q-btn
              unelevated
              color="indigo"
              icon="add_circle"
              label="TAMBAHKAN TABEL BARU"
              @click="addTableGroup(currentSpk)"
              class="full-width q-py-md text-bold"
            />
            <q-card
              flat
              class="q-mt-lg bg-indigo-10 text-white q-pa-md text-right text-h5 text-bold"
            >
              GRAND TOTAL JUAL: Rp {{ formatMoney(calculateGrandTotalJual(currentSpk)) }}
            </q-card>
          </q-tab-panel>

          <q-tab-panel name="budget" class="q-pa-lg">
            <div
              v-for="(group, gIdx) in currentSpk.groups"
              :key="'r-' + gIdx"
              class="q-mb-xl bg-white rounded-borders shadow-2 overflow-hidden border-orange"
            >
              <q-toolbar class="bg-orange-10 text-white">
                <div class="text-bold uppercase">{{ group.title }} (ANALISA MODAL)</div>
              </q-toolbar>
              <q-markup-table flat bordered separator="cell" class="excel-grid-orange">
                <thead>
                  <tr class="bg-orange-10 text-white text-center">
                    <th rowspan="2" style="width: 50px">NO</th>
                    <th rowspan="2">ITEM PEKERJAAN & RINCIAN MODAL</th>
                    <th colspan="7" class="text-center">VOLUME RAB</th>
                    <th rowspan="2" style="width: 150px">TOTAL</th>
                  </tr>
                  <tr class="bg-orange-9 text-white font-10">
                    <th style="width: 60px">QTY</th>
                    <th style="width: 50px">SAT</th>
                    <th style="width: 60px">PMK</th>
                    <th style="width: 50px">SAT</th>
                    <th style="width: 60px">DUR</th>
                    <th style="width: 50px">SAT</th>
                    <th style="width: 120px">HARGA SAT</th>
                  </tr>
                </thead>
                <tbody>
                  <template v-for="(item, iIdx) in group.items" :key="'ri-' + iIdx">
                    <tr :class="item.is_header ? 'bg-orange-2 text-bold' : 'bg-orange-1 text-bold'">
                      <td class="text-center">{{ iIdx + 1 }}</td>
                      <td class="q-px-md uppercase">{{ item.deskripsi }}</td>
                      <td colspan="8" class="text-right q-px-md text-grey-8 italic">
                        Subtotal Modal Item:
                        <span class="text-bold text-dark"
                          >Rp {{ formatMoney(sumRabPerItem(item)) }}</span
                        >
                      </td>
                    </tr>
                    <template v-if="!item.is_header">
                      <tr v-for="(rab, rIdx) in item.rab_modal" :key="'rm-' + rIdx">
                        <td></td>
                        <td class="no-padding">
                          <q-input
                            borderless
                            dense
                            v-model="rab.kebutuhan"
                            class="q-px-xl"
                            placeholder="Rincian modal..."
                          />
                        </td>
                        <td class="no-padding">
                          <q-input
                            borderless
                            dense
                            v-model.number="rab.unit"
                            type="number"
                            class="text-center"
                          />
                        </td>
                        <td class="no-padding">
                          <q-input borderless dense v-model="rab.sat_unit" class="text-center" />
                        </td>
                        <td class="no-padding">
                          <q-input
                            borderless
                            dense
                            v-model.number="rab.pemakaian"
                            type="number"
                            class="text-center"
                          />
                        </td>
                        <td class="no-padding">
                          <q-input borderless dense v-model="rab.sat_pmk" class="text-center" />
                        </td>
                        <td class="no-padding">
                          <q-input
                            borderless
                            dense
                            v-model.number="rab.durasi"
                            type="number"
                            class="text-center"
                          />
                        </td>
                        <td class="no-padding">
                          <q-input borderless dense v-model="rab.sat_dur" class="text-center" />
                        </td>
                        <td class="no-padding">
                          <q-input
                            borderless
                            dense
                            v-model.number="rab.harga"
                            type="number"
                            class="text-right q-px-md"
                          />
                        </td>
                        <td class="text-right q-px-md text-grey-7">
                          <div class="row no-wrap items-center justify-end">
                            <span>Rp {{ formatMoney(sumRabRowTotal(rab)) }}</span>
                            <q-btn
                              flat
                              round
                              color="negative"
                              icon="close"
                              size="xs"
                              @click="item.rab_modal.splice(rIdx, 1)"
                            />
                          </div>
                        </td>
                      </tr>
                      <tr class="bg-white">
                        <td></td>
                        <td colspan="9">
                          <q-btn
                            flat
                            color="orange-10"
                            icon="add"
                            label="TAMBAH RINCIAN"
                            size="sm"
                            @click="addRabRowComplex(item)"
                          />
                        </td>
                      </tr>
                    </template>
                  </template>
                </tbody>
              </q-markup-table>
            </div>
            <q-card flat class="q-pa-md bg-orange-10 text-white text-right text-h5 text-bold">
              GRAND TOTAL MODAL: Rp {{ formatMoney(calculateGrandTotalModal(currentSpk)) }}
            </q-card>
          </q-tab-panel>

          <q-tab-panel name="margin" class="q-pa-lg">
            <div class="row q-col-gutter-lg q-mb-xl">
              <div class="col-12 col-md-4">
                <q-card flat class="balance-prestige-card bg-white shadow-2">
                  <div class="card-accent-bar bg-indigo-10"></div>
                  <q-card-section class="q-pa-lg">
                    <div class="row items-center justify-between">
                      <div>
                        <div
                          class="text-overline text-indigo-10 text-bold uppercase letter-spacing-1"
                        >
                          Grand Total Jual
                        </div>
                        <div class="text-h4 text-weight-bolder text-dark q-mt-sm">
                          Rp {{ formatMoney(calculateGrandTotalJual(currentSpk)) }}
                        </div>
                      </div>
                      <q-avatar
                        size="56px"
                        color="indigo-1"
                        text-color="indigo-10"
                        icon="payments"
                      />
                    </div>
                  </q-card-section>
                </q-card>
              </div>

              <div class="col-12 col-md-4">
                <q-card flat class="balance-prestige-card bg-white shadow-2">
                  <div class="card-accent-bar bg-orange-10"></div>
                  <q-card-section class="q-pa-lg">
                    <div class="row items-center justify-between">
                      <div>
                        <div
                          class="text-overline text-orange-10 text-bold uppercase letter-spacing-1"
                        >
                          Grand Total Modal
                        </div>
                        <div class="text-h4 text-weight-bolder text-dark q-mt-sm">
                          Rp {{ formatMoney(calculateGrandTotalModal(currentSpk)) }}
                        </div>
                      </div>
                      <q-avatar
                        size="56px"
                        color="orange-1"
                        text-color="orange-10"
                        icon="receipt_long"
                      />
                    </div>
                  </q-card-section>
                </q-card>
              </div>

              <div class="col-12 col-md-4">
                <q-card
                  flat
                  class="balance-prestige-card shadow-2"
                  :class="
                    calculateGrandTotalJual(currentSpk) - calculateGrandTotalModal(currentSpk) < 0
                      ? 'bg-red-10 text-white'
                      : 'bg-green-10 text-white'
                  "
                >
                  <q-card-section class="q-pa-lg">
                    <div class="row items-center justify-between">
                      <div>
                        <div class="text-overline opacity-80 text-bold uppercase letter-spacing-1">
                          Projected Gross Profit
                        </div>
                        <div class="text-h4 text-weight-bolder q-mt-sm">
                          Rp
                          {{
                            formatMoney(
                              calculateGrandTotalJual(currentSpk) -
                                calculateGrandTotalModal(currentSpk),
                            )
                          }}
                        </div>
                        <div class="margin-badge-white q-mt-md">
                          Margin:
                          {{
                            calculateGrandTotalJual(currentSpk) > 0
                              ? (
                                  ((calculateGrandTotalJual(currentSpk) -
                                    calculateGrandTotalModal(currentSpk)) /
                                    calculateGrandTotalJual(currentSpk)) *
                                  100
                                ).toFixed(2)
                              : 0
                          }}%
                        </div>
                      </div>
                      <q-avatar
                        size="56px"
                        color="white"
                        :text-color="
                          calculateGrandTotalJual(currentSpk) -
                            calculateGrandTotalModal(currentSpk) <
                          0
                            ? 'red-10'
                            : 'green-10'
                        "
                        :icon="
                          calculateGrandTotalJual(currentSpk) -
                            calculateGrandTotalModal(currentSpk) <
                          0
                            ? 'trending_down'
                            : 'trending_up'
                        "
                      />
                    </div>
                  </q-card-section>
                </q-card>
              </div>
            </div>

            <q-card flat bordered class="rounded-borders overflow-hidden shadow-2 bg-white">
              <div class="q-pa-md bg-grey-1 border-bottom row items-center">
                <q-icon name="list_alt" color="grey-8" size="sm" class="q-mr-sm" />
                <div class="text-subtitle1 text-weight-bold text-dark uppercase letter-spacing-1">
                  Rincian Laba Rugi Per Pekerjaan
                </div>
              </div>
              <q-markup-table flat bordered separator="cell" class="balance-sheet-table">
                <thead class="bg-grey-9 text-white font-bold">
                  <tr>
                    <th class="text-left">DESKRIPSI PEKERJAAN (BALANCE SHEET)</th>
                    <th class="text-right">HARGA JUAL (A)</th>
                    <th class="text-right">HARGA MODAL (B)</th>
                    <th class="text-right">MARGIN (A - B)</th>
                    <th class="text-center">MARGIN (%)</th>
                  </tr>
                </thead>
                <tbody>
                  <template v-for="(group, gIdx) in currentSpk.groups" :key="'bsg-' + gIdx">
                    <tr class="bg-grey-3 text-bold">
                      <td class="text-left text-uppercase text-indigo-10">{{ group.title }}</td>
                      <td class="text-right text-indigo-10 font-bold">
                        Rp {{ formatMoney(sumGroupJual(group)) }}
                      </td>
                      <td class="text-right text-orange-10 font-bold">
                        Rp {{ formatMoney(sumGroupModal(group)) }}
                      </td>
                      <td
                        class="text-right text-bold"
                        :class="
                          sumGroupJual(group) - sumGroupModal(group) < 0
                            ? 'text-red-10'
                            : 'text-green-10'
                        "
                      >
                        Rp {{ formatMoney(sumGroupJual(group) - sumGroupModal(group)) }}
                      </td>
                      <td class="text-center">
                        <q-badge
                          :color="
                            sumGroupJual(group) - sumGroupModal(group) < 0 ? 'red-10' : 'green-10'
                          "
                          class="text-bold q-pa-xs px-md"
                        >
                          {{
                            sumGroupJual(group) > 0
                              ? (
                                  ((sumGroupJual(group) - sumGroupModal(group)) /
                                    sumGroupJual(group)) *
                                  100
                                ).toFixed(1)
                              : 0
                          }}%
                        </q-badge>
                      </td>
                    </tr>
                    <tr v-for="(item, iIdx) in group.items" :key="'bsi-' + iIdx">
                      <td class="q-pl-xl text-grey-8">{{ item.deskripsi }}</td>
                      <td class="text-right text-grey-6 text-italic">
                        Rp {{ formatMoney(item.volume * item.harga_satuan) }}
                      </td>
                      <td class="text-right text-grey-6 text-italic">
                        Rp {{ formatMoney(sumRabPerItem(item)) }}
                      </td>
                      <td
                        class="text-right"
                        :class="
                          item.volume * item.harga_satuan - sumRabPerItem(item) < 0
                            ? 'text-red-4'
                            : 'text-green-4'
                        "
                      >
                        Rp {{ formatMoney(item.volume * item.harga_satuan - sumRabPerItem(item)) }}
                      </td>
                      <td class="text-center text-caption text-grey-7">
                        {{
                          item.volume * item.harga_satuan > 0
                            ? (
                                ((item.volume * item.harga_satuan - sumRabPerItem(item)) /
                                  (item.volume * item.harga_satuan)) *
                                100
                              ).toFixed(1)
                            : 0
                        }}%
                      </td>
                    </tr>
                  </template>
                </tbody>
              </q-markup-table>
            </q-card>
          </q-tab-panel>
        </q-tab-panels>
      </q-card>
    </div>

    <q-dialog v-model="showAddSpk" maximized transition-show="slide-up">
      <q-card class="bg-grey-1 column no-wrap">
        <q-toolbar class="bg-indigo-10 text-white q-py-md">
          <q-btn flat round icon="close" v-close-popup />
          <q-toolbar-title class="text-weight-bold uppercase">{{
            isEditSpkMode ? 'Edit Kontrak' : 'Kontrak Baru'
          }}</q-toolbar-title>
          <q-btn
            unelevated
            color="white"
            text-color="indigo-10"
            label="SIMPAN DATA"
            @click="handleSaveSpk"
            :loading="submittingSpk"
            class="btn-radius q-px-xl text-weight-bold"
          />
        </q-toolbar>

        <q-card-section class="col scroll q-pa-lg">
          <div class="row q-col-gutter-lg">
            <div class="col-12 col-lg-4">
              <q-card flat bordered class="q-pa-md bg-white border-indigo-thin">
                <div
                  class="text-subtitle2 text-indigo-10 q-mb-md uppercase font-bold border-bottom q-pb-xs"
                >
                  Informasi Kontrak
                </div>
                <div class="q-gutter-y-sm">
                  <q-input
                    outlined
                    dense
                    v-model="formSpk.nomor_spk"
                    label="Input No SPK / Kontrak *"
                  />
                  <q-input
                    outlined
                    dense
                    v-model="formSpk.no_quotation"
                    label="Input No Quotation"
                  />
                  <q-input
                    outlined
                    dense
                    v-model="formSpk.nama_kontrak"
                    label="Nama Kontrak Pekerjaan"
                  />
                  <q-input
                    outlined
                    dense
                    v-model="formSpk.tgl_mulai"
                    type="date"
                    label="Mulai"
                    stack-label
                    @update:model-value="autoCalculateDuration"
                  />
                  <q-input
                    outlined
                    dense
                    v-model="formSpk.tgl_akhir"
                    type="date"
                    label="Selesai"
                    stack-label
                    @update:model-value="autoCalculateDuration"
                  />
                  <q-input
                    outlined
                    dense
                    v-model="formSpk.durasi"
                    label="Durasi"
                    readonly
                    bg-color="blue-1"
                  />
                </div>

                <div class="text-subtitle2 text-indigo-10 q-mt-lg q-mb-sm uppercase text-bold">
                  Lampiran Dokumen
                </div>
                <div
                  v-for="(doc, dIdx) in formSpk.documents || []"
                  :key="dIdx"
                  class="bg-grey-2 q-pa-sm q-mb-sm rounded-borders border-dashed"
                >
                  <div class="row items-center no-wrap">
                    <q-input
                      borderless
                      dense
                      v-model="doc.label"
                      placeholder="Label Dokumen"
                      class="col"
                    />
                    <q-btn
                      flat
                      round
                      color="negative"
                      icon="delete"
                      size="xs"
                      @click="formSpk.documents.splice(dIdx, 1)"
                    />
                  </div>
                  <q-file
                    dense
                    flat
                    square
                    v-model="doc.fileRaw"
                    label="Pilih File"
                    class="bg-white"
                    @update:model-value="processFile(doc)"
                  >
                    <template v-slot:append><q-icon name="attach_file" /></template>
                  </q-file>
                </div>
                <q-btn
                  outline
                  color="indigo"
                  icon="add"
                  label="TAMBAH DOKUMEN"
                  class="full-width q-mt-sm"
                  @click="addDocumentRow"
                />
              </q-card>
            </div>

            <div class="col-12 col-lg-8">
              <div
                v-for="(group, gIdx) in formSpk.groups"
                :key="gIdx"
                class="bg-white shadow-1 border-indigo q-mb-lg"
              >
                <q-toolbar class="bg-indigo-10 text-white">
                  <q-input
                    dark
                    borderless
                    dense
                    v-model="group.title"
                    class="text-bold uppercase full-width"
                  />
                  <q-btn
                    flat
                    round
                    icon="delete"
                    size="sm"
                    @click="formSpk.groups.splice(gIdx, 1)"
                  />
                </q-toolbar>
                <q-markup-table flat bordered dense class="excel-grid-blue">
                  <thead>
                    <tr class="bg-indigo-9 text-white font-10">
                      <th style="width: 40px">B</th>
                      <th style="width: 50px">NO</th>
                      <th>ITEM PEKERJAAN</th>
                      <th style="width: 70px">QTY</th>
                      <th style="width: 70px">SAT</th>
                      <th style="width: 140px">HARGA JUAL</th>
                      <th style="width: 140px">TOTAL</th>
                      <th style="width: 40px"></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="(item, iIdx) in group.items"
                      :key="iIdx"
                      :class="item.is_header ? 'bg-indigo-1' : ''"
                    >
                      <td class="text-center">
                        <q-checkbox v-model="item.is_header" dense size="xs" color="indigo" />
                      </td>
                      <td class="text-center">{{ iIdx + 1 }}</td>
                      <td class="no-padding">
                        <q-input
                          borderless
                          dense
                          v-model="item.deskripsi"
                          class="q-px-sm"
                          :input-class="item.is_header ? 'text-bold' : ''"
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
                      <td class="text-right text-bold q-px-sm">
                        Rp {{ formatMoney(item.volume * item.harga_satuan) }}
                      </td>
                      <td class="text-center">
                        <q-btn
                          flat
                          round
                          icon="delete"
                          size="xs"
                          color="negative"
                          @click="group.items.splice(iIdx, 1)"
                        />
                      </td>
                    </tr>
                  </tbody>
                </q-markup-table>
                <q-btn
                  flat
                  color="indigo"
                  icon="add"
                  label="Tambah Baris Item"
                  @click="
                    group.items.push({
                      deskripsi: '',
                      volume: 1,
                      satuan: 'ls',
                      harga_satuan: 0,
                      rab_modal: [],
                    })
                  "
                  class="full-width"
                />
              </div>
              <q-btn
                outline
                color="indigo"
                icon="add_circle"
                label="TAMBAHKAN GRUP PEKERJAAN"
                @click="addTableGroup(formSpk)"
                class="full-width q-py-md text-bold"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="showAddDialog" persistent maximized shadow-2>
      <q-card class="column no-wrap shadow-2">
        <q-toolbar class="bg-indigo-10 text-white q-py-md">
          <q-btn flat round icon="close" v-close-popup />
          <q-toolbar-title class="text-weight-bold uppercase">{{
            isEditMode ? 'Edit Proyek' : 'Proyek Baru'
          }}</q-toolbar-title>
        </q-toolbar>
        <q-card-section class="col scroll q-pa-xl row justify-center bg-grey-1">
          <div class="col-12 col-md-6 q-gutter-y-lg">
            <q-input filled v-model="form.nama" label="Nama Proyek Utama *" bg-color="white" />
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
              label="Customer / Klien"
              emit-value
              map-options
              bg-color="white"
            />
            <q-input
              filled
              v-model="form.alamat"
              label="Lokasi Proyek"
              type="textarea"
              bg-color="white"
            />
            <q-btn
              unelevated
              color="indigo-10"
              label="SIMPAN PROYEK"
              @click="simpanProyek"
              class="full-width btn-radius q-py-md text-bold shadow-2"
            />
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="showDocPreview" maximized transition-show="scale" transition-hide="scale">
      <q-card class="bg-grey-10">
        <q-toolbar class="bg-indigo-10 text-white">
          <q-toolbar-title>Preview Dokumen</q-toolbar-title>
          <q-btn flat round dense icon="close" v-close-popup />
        </q-toolbar>
        <q-card-section class="no-padding full-height" style="height: calc(100vh - 50px)">
          <iframe :src="previewUrl" width="100%" height="100%" style="border: none"></iframe>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { db, storage } from 'src/boot/firebase'
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
import { ref as sRef, uploadBytes, getDownloadURL } from 'firebase/storage'

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
  no_quotation: '',
  nama_kontrak: '',
  tgl_mulai: '',
  tgl_akhir: '',
  durasi: '',
  groups: [],
  documents: [],
})
const optionsKonsumen = ref([])
const optionsKategori = ref([])

const formatMoney = (v) => (v ? v.toLocaleString('id-ID') : '0')
const sumRabRowTotal = (r) => {
  const qty = Number(r.unit) || 0
  const pemakaian = Number(r.pemakaian) || 1
  const durasi = Number(r.durasi) || 1
  const harga = Number(r.harga) || 0
  return qty * pemakaian * durasi * harga
}
const sumRabPerItem = (item) =>
  (item.rab_modal || []).reduce((sum, r) => sum + sumRabRowTotal(r), 0)
const sumGroupJual = (group) =>
  (group.items || []).reduce((s, i) => s + i.volume * i.harga_satuan, 0)
const sumGroupModal = (group) => (group.items || []).reduce((s, i) => s + sumRabPerItem(i), 0)
const calculateGrandTotalJual = (spk) =>
  (spk?.groups || []).reduce((s, g) => s + sumGroupJual(g), 0)
const calculateGrandTotalModal = (spk) =>
  (spk?.groups || []).reduce((s, g) => s + sumGroupModal(g), 0)

const autoCalculateDuration = () => {
  if (!formSpk.value.tgl_mulai || !formSpk.value.tgl_akhir) return
  const start = new Date(formSpk.value.tgl_mulai)
  const end = new Date(formSpk.value.tgl_akhir)
  if (end < start) {
    formSpk.value.durasi = 'Error: Tgl Selesai < Mulai'
    return
  }
  let months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth())
  let days = end.getDate() - start.getDate()
  if (days < 0) {
    months -= 1
    const lastMonth = new Date(end.getFullYear(), end.getMonth(), 0)
    days += lastMonth.getDate()
  }
  formSpk.value.durasi = `${months} Bulan ${days} Hari`
}

const processFile = async (docObj) => {
  const file = docObj.fileRaw
  if (!file) return
  const sizeKB = file.size / 1024
  if (sizeKB < 500) {
    const reader = new FileReader()
    reader.onload = (e) => {
      docObj.url = e.target.result
    }
    reader.readAsDataURL(file)
  } else {
    try {
      const fRef = sRef(storage, `spk_docs/${Date.now()}_${file.name}`)
      await uploadBytes(fRef, file)
      docObj.url = await getDownloadURL(fRef)
    } catch (err) {
      console.error(err)
    }
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
const addTableGroup = (target) => {
  if (!target.groups) target.groups = []
  target.groups.push({ title: 'PEKERJAAN BARU', items: [] })
}
const addDocumentRow = () => {
  if (!formSpk.value.documents) formSpk.value.documents = []
  formSpk.value.documents.push({ label: '', fileRaw: null, url: '' })
}
const addRabRowComplex = (item) => {
  if (!item.rab_modal) item.rab_modal = []
  item.rab_modal.push({
    kebutuhan: '',
    unit: 1,
    sat_unit: 'ls',
    pemakaian: 1,
    sat_pmk: 'X',
    durasi: 1,
    sat_dur: 'hr',
    harga: 0,
  })
}
const openInternalPreview = (url) => {
  previewUrl.value = url
  showDocPreview.value = true
}

const fetchProyek = async () => {
  loading.value = true
  try {
    const snap = await getDocs(query(collection(db, 'proyek'), orderBy('createdAt', 'desc')))
    rows.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    for (let p of rows.value) {
      const spkSnap = await getDocs(
        query(collection(db, 'spk_customer'), where('projectId', '==', p.id)),
      )
      p.total_omzet = spkSnap.docs.reduce((acc, curr) => acc + (curr.data().nilai_total || 0), 0)
    }
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const fetchSpkByProject = async (pid) => {
  const snap = await getDocs(query(collection(db, 'spk_customer'), where('projectId', '==', pid)))
  listSpkProject.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

const showProjectDetail = (evt, row) => {
  currentProject.value = row
  viewMode.value = 'detail'
  fetchSpkByProject(row.id)
}
const handleRowClickSpk = (evt, row) => {
  showSpkDetail(null, row)
}
const showSpkDetail = (evt, row) => {
  currentSpk.value = JSON.parse(JSON.stringify(row))
  activeTab.value = 'boq'
  viewMode.value = 'spk_detail'
}
const editSpk = (row) => {
  isEditSpkMode.value = true
  formSpk.value = JSON.parse(JSON.stringify(row))
  showAddSpk.value = true
}
const confirmDeleteSpk = (row) => {
  $q.dialog({ title: 'Hapus?', message: `Hapus ${row.nomor_spk}?`, cancel: true }).onOk(
    async () => {
      await deleteDoc(doc(db, 'spk_customer', row.id))
      fetchSpkByProject(currentProject.value.id)
    },
  )
}

const handleSaveSpk = async () => {
  if (!formSpk.value.nomor_spk) return
  submittingSpk.value = true
  try {
    const payload = JSON.parse(JSON.stringify(formSpk.value))
    if (payload.documents) payload.documents.forEach((d) => delete d.fileRaw)
    payload.nilai_total = calculateGrandTotalJual(payload)
    payload.projectId = currentProject.value.id
    if (isEditSpkMode.value)
      await updateDoc(doc(db, 'spk_customer', payload.id), {
        ...payload,
        updatedAt: serverTimestamp(),
      })
    else {
      payload.createdAt = serverTimestamp()
      await addDoc(collection(db, 'spk_customer'), payload)
    }
    showAddSpk.value = false
    await fetchSpkByProject(currentProject.value.id)
    fetchProyek()
  } catch (e) {
    console.error(e)
  } finally {
    submittingSpk.value = false
  }
}

const saveRabModal = async () => {
  savingRab.value = true
  try {
    const payload = JSON.parse(JSON.stringify(currentSpk.value))
    payload.nilai_total = calculateGrandTotalJual(payload)
    const sid = payload.id
    delete payload.id
    await updateDoc(doc(db, 'spk_customer', sid), { ...payload, updatedAt: serverTimestamp() })
    $q.notify({ type: 'positive', message: 'Tersimpan!' })
    fetchProyek()
  } catch (e) {
    console.error(e)
  } finally {
    savingRab.value = false
  }
}

const simpanProyek = async () => {
  const p = { ...form.value }
  if (isEditMode.value) await updateDoc(doc(db, 'proyek', p.id), p)
  else {
    p.createdAt = serverTimestamp()
    await addDoc(collection(db, 'proyek'), p)
  }
  showAddDialog.value = false
  fetchProyek()
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
    no_quotation: '',
    nama_kontrak: '',
    tgl_mulai: '',
    tgl_akhir: '',
    durasi: '',
    groups: [
      { title: '1. PRELIMINARY', items: [] },
      { title: '2. MAIN WORKS', items: [] },
    ],
    documents: [],
  }
  showAddSpk.value = true
}

const hapusProyek = (row) => {
  $q.dialog({ title: 'Hapus?', message: `Data hilang permanen!`, cancel: true }).onOk(async () => {
    await deleteDoc(doc(db, 'proyek', row.id))
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
  { name: 'nama', align: 'left', label: 'PROYEK', field: 'nama', classes: 'text-bold' },
  { name: 'customer', align: 'left', label: 'CUSTOMER', field: 'konsumen' },
  { name: 'total_kontrak', align: 'right', label: 'TOTAL NILAI', field: 'total_omzet' },
  { name: 'aksi', align: 'center', label: 'AKSI', field: 'id' },
]
const spkColumns = [
  {
    name: 'no_spk',
    align: 'left',
    label: 'NO. SPK / KONTRAK',
    field: 'nomor_spk',
    classes: 'text-bold text-primary',
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
.border-right-sep {
  border-right: 1px solid #eeeeee;
}

/* BALANCE SHEET CARDS */
.balance-prestige-card {
  border-radius: 16px;
  position: relative;
  overflow: hidden;
  height: 100%;
  transition: transform 0.3s ease;
}
.balance-prestige-card:hover {
  transform: translateY(-5px);
}
.card-accent-bar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
}
.margin-badge-white {
  background: rgba(255, 255, 255, 0.2);
  padding: 6px 16px;
  border-radius: 50px;
  display: inline-block;
  font-weight: 800;
  border: 1px solid rgba(255, 255, 255, 0.3);
}
.letter-spacing-1 {
  letter-spacing: 1px;
}
.border-bottom {
  border-bottom: 1px solid #e0e0e0;
}

.excel-grid-blue :deep(thead th) {
  font-size: 11px;
  font-weight: 800;
  border: 1px solid #ffffff;
  padding: 10px;
  text-align: center;
}
.excel-grid-blue :deep(td) {
  padding: 0 !important;
  border: 1px solid #e0e0e0;
}
.excel-grid-orange :deep(thead th) {
  font-size: 10px;
  font-weight: 800;
  border: 1px solid #ffffff;
  padding: 6px;
  text-align: center;
}
.excel-grid-orange :deep(td) {
  padding: 0 !important;
  border: 1px solid #f9ccac;
}
.border-indigo {
  border: 1px solid #1a237e;
  border-top: 4px solid #1a237e;
}
.border-indigo-thin {
  border: 1px solid #1a237e;
}
.border-dashed {
  border: 1px dashed #bdbdbd;
}
.no-padding {
  padding: 0 !important;
}
</style>
