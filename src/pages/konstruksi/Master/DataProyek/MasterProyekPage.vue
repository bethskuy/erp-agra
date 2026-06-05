<template>
  <q-page class="bg-page q-pa-md font-pro relative-position">
    <div class="page-content-wrapper animate-fade">

    <!-- LOCK SCREEN -->
    <template v-if="!canAction('lihat')">
      <div
        class="row flex-center q-pa-xl text-center font-pro animate-fade content-relative"
        style="min-height: 70vh"
      >
        <div
          class="col-12 col-sm-8 col-md-6 bg-white q-pa-xl rounded-20 shadow-premium border-brand-thin"
        >
          <q-avatar size="100px" color="red-1" text-color="red-10" icon="lock" class="q-mb-md" />
          <div class="text-h5 text-weight-bold text-blue-grey-10 q-mb-xs">Akses Terbatas</div>
          <div class="text-body2 text-grey-7 q-mb-lg leading-relaxed">
            Maaf, Anda tidak memiliki izin untuk melihat modul Manajemen Proyek.
          </div>
          <q-btn
            label="Kembali ke Beranda"
            color="brand-primary"
            icon="arrow_back"
            rounded
            unelevated
            no-caps
            class="text-white text-weight-bold"
            @click="$router.push('/')"
          />
        </div>
      </div>
    </template>

    <template v-else>
      <!-- ================================================================
           VIEW 1: DAFTAR PROYEK
           ================================================================ -->
      <div v-if="viewMode === 'list'" class="animate-fade content-relative">
        <div class="row items-center justify-between q-mb-xl">
          <div class="col-12 col-sm-8">
            <div class="text-h4 text-weight-bolder text-brand-primary leading-tight">
              Manajemen Proyek
              <span class="text-h5 text-weight-light text-grey-6 block q-mt-xs"
                >Daftar Kontrak &amp; Pekerjaan Aktif</span
              >
            </div>
            <div class="text-subtitle1 text-grey-7 q-mt-sm">
              Monitoring seluruh portofolio proyek konstruksi PT AGRA secara terpusat.
            </div>
          </div>
        </div>

        <q-card flat bordered class="q-mb-lg shadow-1 rounded-20 bg-white border-subtle">
          <q-card-section class="q-py-md">
            <div class="row items-center justify-between q-col-gutter-md">
              <div class="col-12 col-md-5">
                <q-input
                  v-model="filter"
                  outlined
                  dense
                  rounded
                  placeholder="Cari Nama Proyek atau Klien..."
                  bg-color="white"
                  class="search-input"
                >
                  <template v-slot:prepend><q-icon name="search" color="brand-primary" /></template>
                  <template v-slot:append v-if="filter"
                    ><q-icon name="close" @click="filter = ''" class="cursor-pointer"
                  /></template>
                </q-input>
              </div>
              <div class="col-12 col-md-auto row items-center justify-end q-col-gutter-md q-mt-sm q-mt-md-none">
                <div class="col-12 col-md-auto text-caption text-grey-6 text-weight-medium text-center text-md-right">
                  Total Proyek:
                  <span class="text-weight-bold text-brand-primary">{{ rows.length }} Record</span>
                </div>
                
                <div class="col-12 col-sm-auto" v-if="canAction('buat')">
                  <q-btn
                    color="brand-primary"
                    icon="add_circle"
                    label="Buat Proyek Baru"
                    unelevated
                    rounded
                    no-caps
                    class="shadow-premium btn-hover text-weight-bold q-py-sm q-px-md full-width"
                    @click="openAddDialog"
                  />
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <q-card
          flat
          bordered
          class="rounded-20 shadow-sm overflow-hidden bg-white border-brand-thin"
        >
          <q-table
            :rows="rows"
            :columns="columns"
            row-key="id"
            flat
            :loading="loading"
            :filter="filter"
            binary-state-sort
            class="proyek-table"
          >
            <template v-slot:header="props">
              <q-tr :props="props" class="bg-brand-primary text-white">
                <q-th
                  v-for="col in props.cols"
                  :key="col.name"
                  :props="props"
                  class="text-weight-bold"
                  >{{ col.label }}</q-th
                >
              </q-tr>
            </template>
            <template v-slot:body="props">
              <q-tr
                :props="props"
                class="hover-bg transition-all cursor-pointer"
                @click="showProjectDetail(null, props.row)"
              >
                <q-td key="nama">
                  <div class="row items-center no-wrap">
                    <q-avatar
                      size="36px"
                      color="brand-light"
                      text-color="brand-primary"
                      icon="foundation"
                      class="q-mr-md shadow-sm"
                    />
                    <div class="text-weight-bold text-subtitle1 text-blue-grey-10">
                      {{ props.row.nama }}
                    </div>
                  </div>
                </q-td>
                <q-td key="customer" class="text-blue-grey-9 text-weight-medium text-uppercase">{{
                  props.row.konsumen || '-'
                }}</q-td>
                <q-td key="total_kontrak" class="text-right">
                  <div class="text-weight-bolder text-brand-primary text-subtitle1">
                    Rp {{ formatMoney(props.row.total_omzet || 0) }}
                  </div>
                </q-td>
                <q-td key="aksi" class="text-center" @click.stop>
                  <div class="row justify-center q-gutter-xs">
                    <q-btn
                      v-if="canAction('ubah')"
                      flat
                      round
                      color="blue-8"
                      icon="edit_note"
                      size="sm"
                      @click="openEditDialog(props.row)"
                      ><q-tooltip>Edit Identitas</q-tooltip></q-btn
                    >
                    <q-btn
                      v-if="canAction('hapus')"
                      flat
                      round
                      color="negative"
                      icon="delete_sweep"
                      size="sm"
                      @click="hapusProyek(props.row)"
                      ><q-tooltip>Hapus Proyek</q-tooltip></q-btn
                    >
                    <q-btn
                      flat
                      round
                      color="grey-6"
                      icon="chevron_right"
                      size="sm"
                      @click="showProjectDetail(null, props.row)"
                    />
                  </div>
                </q-td>
              </q-tr>
            </template>
            <template v-slot:no-data>
              <div class="full-width row flex-center q-pa-xl text-grey-5">
                <q-icon name="architecture" size="64px" class="q-mb-md" />
                <div class="text-h6 full-width text-center">Belum ada proyek yang terdaftar</div>
              </div>
            </template>
          </q-table>
        </q-card>
      </div>

      <!-- ================================================================
           VIEW 2: DETAIL PROYEK & LIST SPK
           ================================================================ -->
      <div
        v-else-if="viewMode === 'detail' && currentProject"
        class="animate-fade content-relative"
      >
        <div class="row items-center q-mb-lg">
          <q-btn
            flat
            round
            icon="arrow_back"
            color="brand-primary"
            @click="viewMode = 'list'"
            class="q-mr-md bg-white shadow-1"
          />
          <div class="col">
            <div class="text-h5 text-weight-bolder text-brand-primary uppercase letter-spacing-1">
              Dashboard Proyek
            </div>
            <div class="text-caption text-grey-7">{{ currentProject.nama }}</div>
          </div>
        </div>

        <q-card
          flat
          bordered
          class="bg-white rounded-20 shadow-premium q-mb-xl overflow-hidden border-brand-thin"
        >
          <div class="row divider-container">
            <div class="col-12 col-md-4 q-pa-xl border-right-sep text-center">
              <div class="text-overline text-grey-6 text-bold tracking-widest">
                KLIEN / KONSUMEN
              </div>
              <div class="text-h5 text-brand-primary text-weight-bolder text-uppercase q-mt-sm">
                {{ currentProject.konsumen || '-' }}
              </div>
            </div>
            <div class="col-12 col-md-4 q-pa-xl border-right-sep text-center bg-brand-light">
              <div class="text-overline text-brand-primary text-bold tracking-widest">
                REALISASI OMZET
              </div>
              <div class="text-h4 text-brand-primary text-weight-black q-mt-sm">
                Rp {{ formatMoney(getOmzetProyek(currentProject.id)) }}
              </div>
            </div>
            <div class="col-12 col-md-4 q-pa-xl text-center">
              <div class="text-overline text-grey-6 text-bold tracking-widest">
                LOKASI PENGERJAAN
              </div>
              <div class="text-body1 text-weight-bold text-blue-grey-9 q-mt-sm leading-relaxed">
                {{ currentProject.alamat || 'Lokasi belum diatur' }}
              </div>
            </div>
          </div>
        </q-card>

        <div class="row items-center justify-between q-mb-md q-col-gutter-sm">
          <div
            class="col-12 col-sm-auto text-h6 text-brand-primary text-weight-bold uppercase letter-spacing-1 flex items-center"
          >
            <q-icon name="contract" class="q-mr-sm" /> Kontrak &amp; SPK Terkait
          </div>
          <div class="col-12 col-sm-auto">
            <q-btn
              v-if="canAction('buat')"
              unelevated
              color="brand-primary"
              icon="add_box"
              label="TAMBAHKAN KONTRAK"
              @click="openAddSpkDialog"
              class="full-width rounded-20 q-px-lg text-weight-bold shadow-2 text-white"
            />
          </div>
        </div>

        <q-card
          flat
          bordered
          class="rounded-20 shadow-sm overflow-hidden bg-white border-brand-thin"
        >
          <q-table :rows="listSpkProject" :columns="spkColumns" flat class="spk-table-premium">
            <template v-slot:header="props">
              <q-tr :props="props" class="bg-blue-grey-10 text-white">
                <q-th
                  v-for="col in props.cols"
                  :key="col.name"
                  :props="props"
                  class="text-weight-bold"
                  >{{ col.label }}</q-th
                >
              </q-tr>
            </template>
            <template v-slot:body="props">
              <q-tr
                :props="props"
                class="hover-bg transition-all cursor-pointer"
                @click="showSpkDetail(null, props.row)"
              >
                <q-td key="no_spk">
                  <div class="row items-center q-gutter-x-sm">
                    <span class="text-weight-bold text-brand-primary text-subtitle1">{{
                      props.row.nomor_spk
                    }}</span>
                    <q-badge
                      v-if="props.row.status === 'Approved'"
                      color="positive"
                      class="text-weight-bold text-white"
                      >APPROVED</q-badge
                    >
                  </div>
                  <div class="text-caption text-grey-7 uppercase text-weight-medium">
                    {{ props.row.nama_kontrak }}
                  </div>
                </q-td>
                <q-td key="nilai" class="text-right">
                  <div class="text-weight-black text-brand-primary text-h6">
                    Rp {{ formatMoney(props.row.nilai_total) }}
                  </div>
                </q-td>
                <q-td key="aksi" class="text-center" @click.stop>
                  <div class="row justify-center q-gutter-xs">
                    <q-btn
                      v-if="canAction('ubah')"
                      flat
                      round
                      color="blue-8"
                      icon="edit"
                      size="sm"
                      @click="editSpk(props.row)"
                    />
                    <q-btn
                      v-if="canAction('hapus')"
                      flat
                      round
                      color="negative"
                      icon="delete_outline"
                      size="sm"
                      @click="confirmDeleteSpk(props.row)"
                    />
                    <q-btn
                      flat
                      round
                      color="brand-primary"
                      icon="analytics"
                      size="sm"
                      @click="showSpkDetail(null, props.row)"
                    >
                      <q-tooltip>Lihat RAB &amp; Margin</q-tooltip>
                    </q-btn>
                  </div>
                </q-td>
              </q-tr>
            </template>
          </q-table>
        </q-card>
      </div>

      <!-- ================================================================
           VIEW 3: DETAIL SPK
           ================================================================ -->
      <div
        v-else-if="viewMode === 'spk_detail' && currentSpk"
        class="animate-fade content-relative"
      >
        <div
          v-if="currentSpk.status === 'Approved'"
          class="q-mb-md q-pa-md bg-positive text-white rounded-20 flex items-center shadow-sm"
        >
          <q-icon name="verified" size="sm" class="q-mr-md" />
          <div class="text-weight-bold text-white">
            Kontrak &amp; Analisa Harga Unit ini telah disetujui (Approved). Seluruh perubahan
            dikunci.
          </div>
        </div>

        <div class="row items-center justify-between q-mb-lg q-col-gutter-sm">
          <div class="col-12 col-md-auto row items-center">
            <q-btn
              flat
              round
              icon="arrow_back"
              color="brand-primary"
              @click="viewMode = 'detail'"
              class="q-mr-md bg-white shadow-1"
            />
            <div>
              <div class="text-h5 text-weight-black text-brand-primary uppercase letter-spacing-1">
                Data Teknis Kontrak
              </div>
              <div class="text-subtitle1 text-grey-7">
                {{ currentSpk.nomor_spk }} • {{ currentSpk.nama_kontrak }}
              </div>
            </div>
          </div>
          <div class="col-12 col-md-auto row q-col-gutter-xs justify-end">
            <div
              class="col-12 col-md-auto"
              v-if="canAction('setuju') && currentSpk.status !== 'Approved'"
            >
              <q-btn
                unelevated
                color="brand-primary"
                icon="check_circle"
                label="SETUJUI KONTRAK"
                @click="handleApproveSpk('Approved')"
                class="full-width rounded-20 q-px-lg text-weight-bold shadow-4 text-white"
              />
            </div>
            <div
              class="col-12 col-md-auto"
              v-if="canAction('setuju') && currentSpk.status === 'Approved'"
            >
              <q-btn
                unelevated
                color="warning"
                icon="undo"
                label="BATALKAN SETUJU"
                @click="handleApproveSpk('Pending')"
                class="full-width rounded-20 q-px-lg text-weight-bold shadow-4"
              />
            </div>
            <div class="col-12 col-md-auto" v-if="isEditable">
              <q-btn
                unelevated
                color="brand-primary"
                icon="save"
                label="SIMPAN PERUBAHAN"
                :loading="savingRab"
                @click="saveRabModal"
                class="full-width rounded-20 q-px-xl text-weight-bold shadow-4 text-white"
              />
            </div>
          </div>
        </div>

        <!-- SPK Info Bar -->
        <q-card
          flat
          bordered
          class="q-mb-lg bg-white rounded-20 shadow-sm border-brand-thin overflow-hidden"
        >
          <q-card-section class="row q-col-gutter-lg q-pa-lg">
            <div class="col-12 col-md-3 border-right-sep">
              <div class="text-overline text-grey-6 text-bold">REFERENSI</div>
              <div class="text-subtitle1 text-bold text-blue-grey-10">
                {{ currentSpk.nomor_spk }}
              </div>
              <div class="text-caption text-brand-primary q-mt-xs">
                Ref Quot: {{ currentSpk.no_quotation || '-' }}
              </div>
            </div>
            <div class="col-12 col-md-3 border-right-sep">
              <div class="text-overline text-grey-6 text-bold">DURASI KONTRAK</div>
              <div class="text-subtitle1 text-brand-primary text-bold">
                {{ currentSpk.durasi || '-' }}
              </div>
              <div class="text-caption text-grey-7">
                {{ currentSpk.tgl_mulai }} s/d {{ currentSpk.tgl_akhir }}
              </div>
            </div>
            <div class="col-12 col-md-6 flex items-center justify-end">
              <div class="text-right q-mr-lg">
                <div class="text-overline text-grey-6 text-bold">DOKUMEN LAMPIRAN</div>
                <div
                  v-if="currentSpk.documents?.length"
                  class="row q-gutter-xs q-mt-xs justify-end"
                >
                  <q-btn
                    v-for="(doc, dIdx) in currentSpk.documents"
                    :key="dIdx"
                    unelevated
                    color="brand-light"
                    text-color="brand-primary"
                    size="sm"
                    icon="description"
                    :label="doc.label || 'Dokumen ' + (dIdx + 1)"
                    @click="openInternalPreview(doc.url)"
                    rounded
                  />
                </div>
                <div class="text-caption text-grey-5 italic" v-else>Tidak ada lampiran</div>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- TABS -->
        <q-card
          flat
          bordered
          class="rounded-20 bg-white shadow-10 overflow-hidden border-brand-thin"
        >
          <q-tabs
            v-model="activeTab"
            dense
            class="bg-brand-primary text-white"
            active-color="white"
            indicator-color="orange-9"
            align="left"
            inline-label
            style="height: 60px"
          >
            <q-tab
              name="boq"
              label="1. Bill of Quantity (BOQ)"
              icon="format_list_numbered"
              class="q-px-xl text-weight-bold text-white"
            />
            <q-tab
              name="budget"
              label="2. Analisa Modal (RAB)"
              icon="engineering"
              class="q-px-xl text-weight-bold text-white"
            />
            <q-tab
              name="margin"
              label="3. Profit &amp; Loss Analysis"
              icon="insights"
              class="q-px-xl text-weight-bold text-white"
            />
          </q-tabs>

          <q-tab-panels v-model="activeTab" animated class="bg-grey-1">
            <!-- PANEL BOQ -->
            <q-tab-panel name="boq" class="q-pa-lg">
              <div
                v-for="(group, gIdx) in currentSpk.groups"
                :key="gIdx"
                class="q-mb-xl bg-white rounded-20 shadow-sm border-brand-primary overflow-hidden"
              >
                <q-toolbar class="bg-brand-primary text-white q-py-sm">
                  <q-icon name="list" class="q-mr-md" />
                  <q-input
                    dark
                    borderless
                    dense
                    v-model="group.title"
                    class="text-bold text-h6 col"
                    placeholder="Input Name Pekerjaan Utama..."
                    :readonly="!isEditable"
                  />
                  <q-btn
                    v-if="isEditable"
                    flat
                    round
                    icon="delete_outline"
                    color="red-3"
                    size="sm"
                    @click="currentSpk.groups.splice(gIdx, 1)"
                  />
                </q-toolbar>
                <q-markup-table flat bordered separator="cell" class="excel-grid-blue">
                  <thead>
                    <tr class="bg-brand-light text-brand-primary text-center uppercase">
                      <th width="40">H</th>
                      <th width="50">NO</th>
                      <th class="text-left">URAIAN PEKERJAAN</th>
                      <th width="80">VOL</th>
                      <th width="80">SAT</th>
                      <th width="150">HARGA JUAL</th>
                      <th width="180">TOTAL JUAL</th>
                      <th width="40"></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="(item, iIdx) in group.items"
                      :key="iIdx"
                      :class="item.is_header ? 'bg-brand-light' : ''"
                    >
                      <td class="text-center">
                        <q-checkbox
                          v-model="item.is_header"
                          dense
                          size="xs"
                          color="brand-primary"
                          :disable="!isEditable"
                          @update:model-value="handleBoqHeaderToggle(item)"
                        />
                      </td>
                      <td class="text-center text-grey-6">{{ iIdx + 1 }}</td>
                      <td class="no-padding">
                        <q-input
                          borderless
                          dense
                          v-model="item.deskripsi"
                          class="q-px-md"
                          :input-class="
                            item.is_header ? 'text-bold text-brand-primary text-subtitle2' : ''
                          "
                          placeholder="Input rincian item..."
                          :readonly="!isEditable"
                        />
                      </td>
                      <td class="no-padding">
                        <q-input
                          borderless
                          dense
                          v-model.number="item.volume"
                          type="number"
                          class="text-center text-weight-bold"
                          :disable="item.is_header || !isEditable"
                        />
                      </td>
                      <td class="no-padding">
                        <q-input
                          borderless
                          dense
                          v-model="item.satuan"
                          class="text-center uppercase text-weight-bold text-brand-primary"
                          :disable="item.is_header || !isEditable"
                        />
                      </td>
                      <td class="no-padding">
                        <q-input
                          borderless
                          dense
                          v-model.number="item.harga_satuan"
                          type="number"
                          class="text-right q-px-md text-weight-bold"
                          :disable="item.is_header || !isEditable"
                        />
                      </td>
                      <td class="text-right text-weight-bolder text-brand-primary q-px-md">
                        Rp {{ formatMoney((item.volume || 0) * (item.harga_satuan || 0)) }}
                      </td>
                      <td class="text-center">
                        <q-btn
                          v-if="isEditable"
                          flat
                          round
                          color="negative"
                          icon="remove_circle_outline"
                          size="xs"
                          @click="group.items.splice(iIdx, 1)"
                        />
                      </td>
                    </tr>
                  </tbody>
                </q-markup-table>
                <q-btn
                  v-if="isEditable"
                  flat
                  color="brand-primary"
                  icon="add"
                  label="TAMBAH RINCIAN BARIS"
                  @click="
                    group.items.push({
                      deskripsi: '',
                      volume: 1,
                      satuan: 'ls',
                      harga_satuan: 0,
                      rab_modal: [],
                    })
                  "
                  class="full-width bg-brand-light font-bold"
                />
              </div>
              <q-btn
                v-if="isEditable"
                unelevated
                color="brand-primary"
                icon="add_circle"
                label="TAMBAHKAN KATEGORI PEKERJAAN BARU"
                @click="addTableGroup(currentSpk)"
                class="full-width q-py-lg rounded-20 text-weight-black shadow-3 text-white"
              />

              <!-- ✅ GRAND TOTAL + TABEL PPN DINAMIS -->
              <div class="q-mt-xl">
                <!-- Grand Total BOQ -->
                <div
                  class="q-pa-xl bg-brand-primary text-white rounded-20 mobile-text-center desktop-text-right shadow-10 q-mb-md"
                >
                  <div class="text-overline opacity-80 uppercase tracking-widest text-weight-bold">
                    Grand Total Kontrak
                  </div>
                  <div class="text-h3 text-weight-black text-white">
                    Rp {{ formatMoney(calculateGrandTotalJual(currentSpk)) }}
                  </div>
                </div>

                <!-- ✅ TABEL PPN DINAMIS -->
                <q-card
                  flat
                  bordered
                  class="rounded-20 bg-white shadow-sm border-brand-thin overflow-hidden"
                >
                  <!-- Header PPN: Judul + Toggle Aktif/Nonaktif -->
                  <div class="row items-center justify-between q-pa-md bg-grey-1 border-bottom">
                    <div class="row items-center">
                      <q-icon name="receipt_long" color="brand-primary" size="sm" class="q-mr-sm" />
                      <span class="text-subtitle2 text-weight-bold text-brand-primary uppercase">
                        Perhitungan PPN
                      </span>
                    </div>
                    <div class="row items-center q-gutter-sm">
                      <span class="text-caption text-grey-6">
                        {{ currentSpk.ppn_aktif ? 'Aktif' : 'Nonaktif' }}
                      </span>
                      <q-toggle
                        v-model="currentSpk.ppn_aktif"
                        color="brand-primary"
                        :disable="!isEditable"
                      />
                    </div>
                  </div>

                  <div v-if="currentSpk.ppn_aktif">
                    <!-- ✅ ROW KONFIGURASI DINAMIS (Tarif PPN + DPP Nilai Lain) -->
                    <div
                      class="row items-center q-pa-md q-col-gutter-md bg-teal-1 border-bottom flex-wrap"
                    >
                      <div class="col-12 col-sm-auto row items-center no-wrap">
                        <q-icon name="tune" color="brand-primary" size="xs" class="q-mr-xs" />
                        <span class="text-caption text-grey-7 text-weight-bold uppercase q-mr-sm">
                          Konfigurasi PPN:
                        </span>
                      </div>

                      <!-- Input Tarif PPN % -->
                      <div class="col-12 col-sm-auto row items-center q-gutter-xs no-wrap">
                        <span class="text-caption text-grey-6 no-wrap">Tarif PPN</span>
                        <q-input
                          dense
                          outlined
                          v-model.number="currentSpk.ppn_persen"
                          type="number"
                          style="width: 80px"
                          bg-color="white"
                          :readonly="!isEditable"
                          min="0"
                          max="100"
                          class="ppn-config-input"
                        >
                          <template v-slot:append>
                            <span class="text-caption text-brand-primary text-weight-bold">%</span>
                          </template>
                        </q-input>
                      </div>

                      <!-- Divider -->
                      <div class="col-12 col-sm-auto text-grey-4 gt-xs">|</div>

                      <!-- Input Pembilang / Penyebut DPP Nilai Lain -->
                      <div class="col-12 col-sm-auto row items-center q-gutter-xs no-wrap">
                        <span class="text-caption text-grey-6 no-wrap">DPP Nilai Lain</span>
                        <q-input
                          dense
                          outlined
                          v-model.number="currentSpk.ppn_pembilang"
                          type="number"
                          style="width: 68px"
                          bg-color="white"
                          :readonly="!isEditable"
                          min="1"
                          class="ppn-config-input text-center"
                          input-class="text-center text-weight-bold"
                        />
                        <span class="text-subtitle1 text-grey-5 text-weight-bold">/</span>
                        <q-input
                          dense
                          outlined
                          v-model.number="currentSpk.ppn_penyebut"
                          type="number"
                          style="width: 68px"
                          bg-color="white"
                          :readonly="!isEditable"
                          min="1"
                          class="ppn-config-input text-center"
                          input-class="text-center text-weight-bold"
                        />
                        <q-btn flat round size="xs" color="grey-5" icon="help_outline">
                          <q-tooltip
                            class="bg-blue-grey-10 text-white text-caption"
                            max-width="220px"
                          >
                            DPP Nilai Lain = Jumlah (A) × Pembilang / Penyebut.<br />
                            Contoh standar: 11/12 sesuai PMK 131/2024.
                          </q-tooltip>
                        </q-btn>
                      </div>

                      <!-- Preview formula ringkas -->
                      <div class="col-12 col-sm-auto">
                        <q-chip
                          dense
                          color="brand-light"
                          text-color="brand-primary"
                          icon="functions"
                          class="text-weight-bold text-caption"
                        >
                          DPP = A × {{ currentSpk.ppn_pembilang || 11 }}/{{
                            currentSpk.ppn_penyebut || 12
                          }}
                          &nbsp;→&nbsp; PPN = DPP × {{ currentSpk.ppn_persen || 12 }}%
                        </q-chip>
                      </div>
                    </div>

                    <!-- ✅ TABEL KALKULASI DINAMIS -->
                    <q-markup-table flat separator="cell" class="ppn-table">
                      <tbody>
                        <!-- Baris A: Jumlah -->
                        <tr>
                          <td class="text-weight-bold text-grey-8 q-pa-md" style="width: 70%">
                            Jumlah (A)
                          </td>
                          <td
                            class="text-right text-weight-black text-blue-grey-10 q-pa-md text-subtitle1"
                          >
                            Rp {{ formatMoney(calculateGrandTotalJual(currentSpk)) }}
                          </td>
                        </tr>

                        <!-- Baris B: DPP Nilai Lain -->
                        <tr class="bg-grey-1">
                          <td class="text-grey-7 q-pa-md">
                            Dasar Pengenaan Pajak Nilai Lain (Jumlah ×
                            {{ currentSpk.ppn_pembilang || 11 }}/{{
                              currentSpk.ppn_penyebut || 12
                            }}) (B) = A × {{ currentSpk.ppn_pembilang || 11 }}/{{
                              currentSpk.ppn_penyebut || 12
                            }}
                          </td>
                          <td class="text-right text-weight-bold text-grey-8 q-pa-md">
                            Rp {{ formatMoney(calcDPP(currentSpk)) }}
                          </td>
                        </tr>

                        <!-- Baris C: PPN -->
                        <tr>
                          <td class="text-grey-7 q-pa-md">
                            PPN {{ currentSpk.ppn_persen || 12 }}% (C) = B ×
                            {{ currentSpk.ppn_persen || 12 }}%
                          </td>
                          <td class="text-right text-weight-bold text-orange-10 q-pa-md">
                            Rp {{ formatMoney(calcPPN(currentSpk)) }}
                          </td>
                        </tr>

                        <!-- Baris D: Total -->
                        <tr class="bg-brand-light">
                          <td class="text-weight-black text-brand-primary q-pa-md text-subtitle1">
                            Total (D) = A + C
                          </td>
                          <td
                            class="text-right text-weight-black text-brand-primary q-pa-md text-subtitle1"
                          >
                            Rp {{ formatMoney(calcTotalDenganPPN(currentSpk)) }}
                          </td>
                        </tr>
                      </tbody>
                    </q-markup-table>
                  </div>

                  <div v-else class="q-pa-lg text-center text-grey-5">
                    <q-icon name="toggle_off" size="32px" class="q-mb-xs" />
                    <div class="text-caption">Perhitungan PPN dinonaktifkan untuk kontrak ini</div>
                  </div>
                </q-card>
              </div>
            </q-tab-panel>

            <!-- PANEL RAB -->
            <q-tab-panel name="budget" class="q-pa-lg">
              <div
                v-for="(group, gIdx) in currentSpk.groups"
                :key="'r-' + gIdx"
                class="q-mb-xl bg-white rounded-20 shadow-sm border-orange overflow-hidden"
              >
                <q-toolbar class="bg-orange-10 text-white q-py-sm">
                  <q-icon name="calculate" class="q-mr-md" />
                  <div class="text-h6 text-weight-black uppercase">
                    {{ group.title }} (ANALISA MODAL)
                  </div>
                </q-toolbar>
                <q-markup-table flat bordered separator="cell" class="excel-grid-orange">
                  <thead>
                    <tr class="bg-orange-10 text-white text-center text-weight-bold">
                      <th rowspan="2" width="50">NO</th>
                      <th rowspan="2">URAIAN MODAL &amp; SUMBER DAYA</th>
                      <th colspan="7">RAB VOLUME &amp; PERHITUNGAN</th>
                      <th rowspan="2" width="160">ESTIMASI TOTAL</th>
                    </tr>
                    <tr class="bg-orange-9 text-white text-caption">
                      <th width="70">UNIT</th>
                      <th width="50">SAT</th>
                      <th width="70">PMK</th>
                      <th width="50">SAT</th>
                      <th width="70">DUR</th>
                      <th width="50">SAT</th>
                      <th width="130">HARGA SAT</th>
                    </tr>
                  </thead>
                  <tbody>
                    <template v-for="(item, iIdx) in group.items" :key="'ri-' + iIdx">
                      <tr :class="item.is_header ? 'bg-orange-2' : 'bg-orange-1'">
                        <td class="text-center font-bold">{{ iIdx + 1 }}</td>
                        <td class="q-px-md text-weight-black uppercase text-blue-grey-10">
                          {{ item.deskripsi }}
                        </td>
                        <td colspan="8" class="text-right q-px-lg">
                          <span class="text-caption text-orange-10 text-bold uppercase q-mr-sm"
                            >Modal Item:</span
                          >
                          <span class="text-h6 text-weight-black text-dark"
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
                              class="q-px-xl text-weight-medium"
                              placeholder="Uraian kebutuhan modal..."
                              :readonly="!isEditable"
                            />
                          </td>
                          <td class="no-padding text-center">
                            <q-input
                              borderless
                              dense
                              v-model.number="rab.unit"
                              type="number"
                              input-class="text-center text-weight-bold"
                              :readonly="!isEditable"
                            />
                          </td>
                          <td class="no-padding text-center">
                            <q-input
                              borderless
                              dense
                              v-model="rab.sat_unit"
                              input-class="text-center uppercase text-weight-bold text-brand-primary"
                              :readonly="!isEditable"
                            />
                          </td>
                          <td class="no-padding text-center">
                            <q-input
                              borderless
                              dense
                              v-model.number="rab.pemakaian"
                              type="number"
                              input-class="text-center text-weight-bold"
                              :readonly="!isEditable"
                            />
                          </td>
                          <td class="no-padding text-center">
                            <q-input
                              borderless
                              dense
                              v-model="rab.sat_pmk"
                              input-class="text-center text-weight-bold"
                              :readonly="!isEditable"
                            />
                          </td>
                          <td class="no-padding text-center">
                            <q-input
                              borderless
                              dense
                              v-model.number="rab.durasi"
                              type="number"
                              input-class="text-center text-weight-bold"
                              :readonly="!isEditable"
                            />
                          </td>
                          <td class="no-padding text-center">
                            <q-input
                              borderless
                              dense
                              v-model="rab.sat_dur"
                              input-class="text-center text-weight-bold"
                              :readonly="!isEditable"
                            />
                          </td>
                          <td class="no-padding">
                            <q-input
                              borderless
                              dense
                              v-model.number="rab.harga"
                              type="number"
                              class="text-right q-px-md font-bold"
                              prefix="Rp"
                              :readonly="!isEditable"
                            />
                          </td>
                          <td class="text-right q-px-md bg-grey-1 text-weight-bolder">
                            <div class="row no-wrap items-center justify-end">
                              <span>Rp {{ formatMoney(sumRabRowTotal(rab)) }}</span>
                              <q-btn
                                v-if="isEditable"
                                flat
                                round
                                color="negative"
                                icon="close"
                                size="xs"
                                class="q-ml-sm"
                                @click="item.rab_modal.splice(rIdx, 1)"
                              />
                            </div>
                          </td>
                        </tr>
                        <tr class="bg-white" v-if="isEditable">
                          <td></td>
                          <td colspan="9">
                            <q-btn
                              flat
                              color="orange-10"
                              icon="add"
                              label="TAMBAH RINCIAN MODAL"
                              size="sm"
                              @click="addRabRowComplex(item)"
                              class="text-weight-bold"
                            />
                          </td>
                        </tr>
                      </template>
                    </template>
                  </tbody>
                </q-markup-table>
              </div>
              <div
                class="q-pa-xl bg-orange-10 text-white rounded-20 mobile-text-center desktop-text-right shadow-10"
              >
                <div class="text-overline opacity-80 uppercase tracking-widest text-weight-bold">
                  Total Biaya Produksi (Modal)
                </div>
                <div class="text-h3 text-weight-black text-white">
                  Rp {{ formatMoney(calculateGrandTotalModal(currentSpk)) }}
                </div>
              </div>
            </q-tab-panel>

            <!-- PANEL MARGIN -->
            <q-tab-panel name="margin" class="q-pa-lg">
              <div class="row q-col-gutter-xl q-mb-xl animate-fade">
                <div class="col-12 col-md-4">
                  <q-card flat class="balance-prestige-card bg-white shadow-2">
                    <div class="card-accent-bar bg-brand-primary"></div>
                    <q-card-section class="q-pa-xl">
                      <div
                        class="text-overline text-brand-primary text-bold uppercase tracking-widest"
                      >
                        Revenue (Harga Jual)
                      </div>
                      <div class="text-h4 text-weight-black text-dark q-mt-sm">
                        Rp {{ formatMoney(calculateGrandTotalJual(currentSpk)) }}
                      </div>
                    </q-card-section>
                  </q-card>
                </div>
                <div class="col-12 col-md-4">
                  <q-card flat class="balance-prestige-card bg-white shadow-2">
                    <div class="card-accent-bar bg-orange-10"></div>
                    <q-card-section class="q-pa-xl">
                      <div class="text-overline text-orange-10 text-bold uppercase tracking-widest">
                        Cost of Sales (Modal)
                      </div>
                      <div class="text-h4 text-weight-black text-dark q-mt-sm">
                        Rp {{ formatMoney(calculateGrandTotalModal(currentSpk)) }}
                      </div>
                    </q-card-section>
                  </q-card>
                </div>
                <div class="col-12 col-md-4">
                  <q-card
                    flat
                    class="balance-prestige-card shadow-10"
                    :class="
                      calculateGrandTotalJual(currentSpk) - calculateGrandTotalModal(currentSpk) < 0
                        ? 'bg-red-10 text-white'
                        : 'bg-green-10 text-white'
                    "
                  >
                    <q-card-section class="q-pa-xl">
                      <div class="text-overline opacity-80 text-bold uppercase tracking-widest">
                        Gross Profit Projection
                      </div>
                      <div class="text-h3 text-weight-black q-mt-sm text-white">
                        Rp
                        {{
                          formatMoney(
                            calculateGrandTotalJual(currentSpk) -
                              calculateGrandTotalModal(currentSpk),
                          )
                        }}
                      </div>
                      <div
                        class="margin-badge-white q-mt-lg text-subtitle1 text-weight-bold text-white"
                      >
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
                    </q-card-section>
                  </q-card>
                </div>
              </div>

              <q-card
                flat
                bordered
                class="rounded-20 overflow-hidden shadow-sm bg-white border-brand-thin animate-fade-up"
              >
                <div class="q-pa-lg bg-brand-light border-bottom row items-center">
                  <q-icon name="summarize" color="brand-primary" size="md" class="q-mr-md" />
                  <div
                    class="text-h6 text-weight-black text-brand-primary uppercase letter-spacing-1"
                  >
                    Balance Sheet Per Item Pekerjaan
                  </div>
                </div>
                <q-markup-table flat bordered separator="cell" class="balance-sheet-table">
                  <thead class="bg-blue-grey-10 text-white text-bold uppercase">
                    <tr>
                      <th class="text-left">DESKRIPSI PEKERJAAN</th>
                      <th class="text-right">JUAL (A)</th>
                      <th class="text-right">MODAL (B)</th>
                      <th class="text-right">PROFIT (A-B)</th>
                      <th class="text-center">%</th>
                    </tr>
                  </thead>
                  <tbody>
                    <template v-for="(group, gIdx) in currentSpk.groups" :key="'bsg-' + gIdx">
                      <tr class="bg-brand-light text-bold">
                        <td class="text-left text-weight-black text-brand-primary">
                          {{ group.title }}
                        </td>
                        <td class="text-right text-brand-primary">
                          Rp {{ formatMoney(sumGroupJual(group)) }}
                        </td>
                        <td class="text-right text-orange-10">
                          Rp {{ formatMoney(sumGroupModal(group)) }}
                        </td>
                        <td
                          class="text-right"
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
                            class="text-bold q-px-sm text-white"
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
                        <td class="q-pl-xl text-blue-grey-9">{{ item.deskripsi }}</td>
                        <td class="text-right text-grey-6 italic">
                          Rp {{ formatMoney((item.volume || 0) * (item.harga_satuan || 0)) }}
                        </td>
                        <td class="text-right text-grey-6 italic">
                          Rp {{ formatMoney(sumRabPerItem(item)) }}
                        </td>
                        <td
                          class="text-right font-bold"
                          :class="
                            (item.volume || 0) * (item.harga_satuan || 0) - sumRabPerItem(item) < 0
                              ? 'text-red-6'
                              : 'text-green-6'
                          "
                        >
                          Rp
                          {{
                            formatMoney(
                              (item.volume || 0) * (item.harga_satuan || 0) - sumRabPerItem(item),
                            )
                          }}
                        </td>
                        <td class="text-center text-caption text-grey-5 font-bold">
                          {{
                            (item.volume || 0) * (item.harga_satuan || 0) > 0
                              ? (
                                  (((item.volume || 0) * (item.harga_satuan || 0) -
                                    sumRabPerItem(item)) /
                                    ((item.volume || 0) * (item.harga_satuan || 0))) *
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
    </template>

    <!-- ================================================================
         DIALOG SPK (MAXIMIZED)
         ================================================================ -->
    <q-dialog v-model="showAddSpk" persistent maximized transition-show="slide-up">
      <q-card class="bg-grey-2 column no-wrap relative-position">

        <q-toolbar class="bg-brand-primary text-white q-py-md shadow-4 shrink content-relative">
          <q-btn flat round icon="close" v-close-popup />
          <q-toolbar-title class="text-weight-black uppercase">
            {{ isEditSpkMode ? 'REVISI DATA KONTRAK' : 'REGISTRASI KONTRAK BARU' }}
          </q-toolbar-title>
          <q-btn
            v-if="canAction('buat') || canAction('ubah')"
            unelevated
            color="white"
            text-color="brand-primary"
            label="SIMPAN DATA"
            @click="handleSaveSpk"
            :loading="submittingSpk"
            rounded
            class="q-px-xl text-weight-black"
          />
        </q-toolbar>

        <q-scroll-area class="col q-pa-lg q-pa-md-xl content-relative">
          <div class="row justify-center">
            <div class="col-12 col-lg-10">
              <div class="row q-col-gutter-xl">
                <!-- METADATA PANEL -->
                <div class="col-12 col-md-4">
                  <q-card
                    flat
                    bordered
                    class="rounded-20 q-pa-lg bg-white shadow-1 border-brand-thin"
                  >
                    <div
                      class="text-subtitle1 text-brand-primary q-mb-lg uppercase text-weight-black border-bottom q-pb-xs"
                    >
                      <q-icon name="info" class="q-mr-xs" /> Metadata Kontrak
                    </div>
                    <div class="q-gutter-y-md">
                      <q-input
                        outlined
                        dense
                        v-model="formSpk.nomor_spk"
                        label="Nomor SPK Utama *"
                        stack-label
                        bg-color="white"
                      />
                      <q-input
                        outlined
                        dense
                        v-model="formSpk.no_quotation"
                        label="Referensi Penawaran"
                        stack-label
                      />
                      <q-input
                        outlined
                        dense
                        v-model="formSpk.nama_kontrak"
                        label="Judul Pekerjaan Kontrak"
                        stack-label
                      />
                      <div class="row q-col-gutter-sm">
                        <q-input
                          class="col-6"
                          outlined
                          dense
                          v-model="formSpk.tgl_mulai"
                          type="date"
                          label="Mulai"
                          stack-label
                          @update:model-value="autoCalculateDuration"
                        />
                        <q-input
                          class="col-6"
                          outlined
                          dense
                          v-model="formSpk.tgl_akhir"
                          type="date"
                          label="Selesai"
                          stack-label
                          @update:model-value="autoCalculateDuration"
                        />
                      </div>
                      <q-input
                        outlined
                        dense
                        v-model="formSpk.durasi"
                        label="Kalkulasi Durasi"
                        readonly
                        bg-color="brand-light"
                        class="text-weight-bold"
                      />
                    </div>

                    <!-- ✅ LAMPIRAN DIGITAL -->
                    <div
                      class="text-subtitle1 text-brand-primary q-mt-xl q-mb-lg uppercase text-weight-black"
                    >
                      <q-icon name="attach_file" class="q-mr-xs" /> Lampiran Digital
                    </div>

                    <div
                      v-for="(docItem, dIdx) in formSpk.documents || []"
                      :key="dIdx"
                      class="bg-grey-1 q-pa-md q-mb-sm rounded-20 border-dashed"
                    >
                      <div class="row items-center no-wrap q-mb-sm">
                        <q-input
                          borderless
                          dense
                          v-model="docItem.label"
                          placeholder="Nama Dokumen..."
                          class="col text-weight-bold"
                        />
                        <q-btn
                          flat
                          round
                          color="negative"
                          icon="delete_sweep"
                          size="sm"
                          @click="formSpk.documents.splice(dIdx, 1)"
                        />
                      </div>

                      <div v-if="docItem.url && !docItem.fileRaw" class="q-gutter-y-sm">
                        <div class="row items-center q-gutter-sm">
                          <q-chip
                            icon="check_circle"
                            color="positive"
                            text-color="white"
                            size="sm"
                            class="text-weight-bold"
                            removable
                            @remove="docItem.url = ''"
                          >
                            {{ docItem.label || 'File tersimpan' }}
                          </q-chip>
                          <q-btn
                            flat
                            dense
                            size="sm"
                            color="brand-primary"
                            icon="open_in_new"
                            label="Buka"
                            @click="openInternalPreview(docItem.url)"
                          />
                        </div>
                        <q-btn
                          outline
                          color="grey-6"
                          icon="swap_horiz"
                          label="Ganti File"
                          size="sm"
                          class="full-width rounded-12"
                          @click="docItem.url = ''"
                        />
                      </div>

                      <div v-else>
                        <div v-if="docItem.uploading" class="row items-center q-gutter-sm q-pa-sm">
                          <q-spinner color="brand-primary" size="sm" />
                          <span class="text-caption text-grey-7">Mengupload...</span>
                        </div>
                        <q-file
                          v-else
                          dense
                          outlined
                          v-model="docItem.fileRaw"
                          label="Pilih Berkas PDF/IMG"
                          @update:model-value="processFile(docItem)"
                          bg-color="white"
                          accept="image/*, .pdf"
                        >
                          <template v-slot:append><q-icon name="cloud_upload" /></template>
                        </q-file>
                      </div>
                    </div>

                    <q-btn
                      outline
                      color="brand-primary"
                      icon="add"
                      label="TAMBAH DOKUMEN"
                      class="full-width q-mt-md rounded-20 text-weight-bold"
                      @click="addDocumentRow"
                    />
                  </q-card>
                </div>

                <!-- BOQ PANEL -->
                <div class="col-12 col-md-8">
                  <div
                    v-for="(group, gIdx) in formSpk.groups"
                    :key="gIdx"
                    class="bg-white shadow-2 rounded-20 border-brand-primary overflow-hidden q-mb-xl"
                  >
                    <q-toolbar class="bg-brand-primary text-white q-py-sm">
                      <q-icon name="list" class="q-mr-sm" />
                      <q-input
                        dark
                        borderless
                        dense
                        v-model="group.title"
                        class="text-bold uppercase col"
                        placeholder="Grup Pekerjaan..."
                      />
                      <q-btn
                        flat
                        round
                        icon="delete_sweep"
                        size="sm"
                        color="red-3"
                        @click="formSpk.groups.splice(gIdx, 1)"
                      />
                    </q-toolbar>
                    <q-markup-table flat bordered dense class="excel-grid-blue">
                      <thead>
                        <tr class="bg-brand-light text-brand-primary text-caption font-bold">
                          <th width="40">H</th>
                          <th width="50">NO</th>
                          <th>URAIAN ITEM</th>
                          <th width="70">QTY</th>
                          <th width="70">SAT</th>
                          <th width="140">HARGA</th>
                          <th width="140">TOTAL</th>
                          <th width="40"></th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr
                          v-for="(item, iIdx) in group.items"
                          :key="iIdx"
                          :class="item.is_header ? 'bg-brand-light' : ''"
                        >
                          <td class="text-center">
                            <q-checkbox
                              v-model="item.is_header"
                              dense
                              size="xs"
                              color="brand-primary"
                            />
                          </td>
                          <td class="text-center text-grey-5">{{ iIdx + 1 }}</td>
                          <td class="no-padding">
                            <q-input
                              borderless
                              dense
                              v-model="item.deskripsi"
                              class="q-px-md"
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
                              class="text-right q-px-md"
                              :disable="item.is_header"
                            />
                          </td>
                          <td class="text-right text-bold text-brand-primary q-px-md">
                            Rp {{ formatMoney((item.volume || 0) * (item.harga_satuan || 0)) }}
                          </td>
                          <td class="text-center">
                            <q-btn
                              flat
                              round
                              icon="close"
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
                      color="brand-primary"
                      icon="add"
                      label="TAMBAH RINCIAN"
                      @click="
                        group.items.push({
                          deskripsi: '',
                          volume: 1,
                          satuan: 'ls',
                          harga_satuan: 0,
                          rab_modal: [],
                        })
                      "
                      class="full-width bg-brand-light font-bold"
                    />
                  </div>
                  <q-btn
                    outline
                    color="brand-primary"
                    icon="add_circle"
                    label="TAMBAHKAN KATEGORI PEKERJAAN"
                    @click="addTableGroup(formSpk)"
                    class="full-width q-py-lg rounded-20 text-weight-black shadow-2"
                  />
                </div>
              </div>
            </div>
          </div>
          <div class="q-py-xl"></div>
        </q-scroll-area>
      </q-card>
    </q-dialog>

    <!-- DIALOG PROJECT BASIC INFO -->
    <q-dialog v-model="showAddDialog" persistent backdrop-filter="blur(4px)">
      <q-card
        style="width: 550px; max-width: 95vw"
        class="rounded-20 shadow-24 overflow-hidden relative-position"
      >
        <q-toolbar class="bg-brand-primary text-white q-py-md content-relative">
          <q-btn flat round icon="close" v-close-popup />
          <q-toolbar-title class="text-weight-black uppercase">
            {{ isEditMode ? 'PEMBARUAN PROYEK' : 'REGISTRASI PROYEK BARU' }}
          </q-toolbar-title>
        </q-toolbar>
        <q-card-section class="q-pa-xl bg-grey-1 content-relative">
          <div class="q-gutter-y-lg">
            <q-input
              filled
              v-model="form.nama"
              label="Judul Proyek Utama *"
              bg-color="white"
              placeholder="Masukkan nama proyek..."
            />
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
              label="Customer / Klien Strategis"
              emit-value
              map-options
              bg-color="white"
            />
            <q-input
              filled
              v-model="form.alamat"
              label="Lokasi Strategis Proyek"
              type="textarea"
              rows="3"
              bg-color="white"
            />
            <q-btn
              v-if="canAction('buat') || canAction('ubah')"
              unelevated
              color="brand-primary"
              label="SIMPAN DATA PROYEK"
              @click="simpanProyek"
              class="full-width rounded-20 q-py-lg text-weight-black shadow-6 text-white"
            />
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- DIALOG PREVIEW DOKUMEN -->
    <q-dialog v-model="showDocPreview" maximized transition-show="scale" transition-hide="scale">
      <q-card class="bg-grey-10">
        <q-toolbar class="bg-brand-primary text-white shadow-2">
          <q-toolbar-title class="text-weight-bold">Peninjauan Dokumen Kontrak</q-toolbar-title>
          <q-btn flat round dense icon="close" v-close-popup />
        </q-toolbar>
        <q-card-section class="no-padding full-height" style="height: calc(100vh - 64px)">
          <iframe :src="previewUrl" width="100%" height="100%" style="border: none"></iframe>
        </q-card-section>
      </q-card>
    </q-dialog>

    <div class="q-py-xl"></div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
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
  onSnapshot,
} from 'firebase/firestore'
import { ref as sRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import { useAuthStore } from 'src/stores/auth'

const $q = useQuasar()
const authStore = useAuthStore()

// ============================================================================
// STATE
// ============================================================================
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
const filter = ref('')
const userData = ref(null)

const form = ref({ nama: '', kategori: '', konsumen: '', alamat: '' })

// ✅ formSpk dengan field PPN dinamis
const formSpk = ref({
  nomor_spk: '',
  no_quotation: '',
  nama_kontrak: '',
  tgl_mulai: '',
  tgl_akhir: '',
  durasi: '',
  groups: [],
  documents: [],
  status: 'Pending',
  ppn_aktif: false,
  ppn_persen: 12,
  ppn_pembilang: 11,
  ppn_penyebut: 12,
})
const optionsKonsumen = ref([])
const optionsKategori = ref([])

// ============================================================================
// LISTENERS
// ============================================================================
let unsubProyek = null
let unsubSpk = null
let unsubAllSpk = null
let unsubUser = null

const proyekRaw = ref([])
const allSpksCache = ref([])

const recalcOmzet = () => {
  rows.value = proyekRaw.value.map((p) => ({
    ...p,
    total_omzet: allSpksCache.value
      .filter((s) => s.projectId === p.id)
      .reduce((acc, s) => acc + (Number(s.nilai_total) || 0), 0),
  }))
}

const getOmzetProyek = (projectId) => {
  const found = rows.value.find((r) => r.id === projectId)
  return found ? found.total_omzet || 0 : 0
}

// ============================================================================
// PERMISSION
// ============================================================================
const canAction = (actionType) => {
  if (authStore.user?.role === 'Super Admin') return true
  if (!userData.value?.permissions_detail) return false
  const modulePerm = userData.value.permissions_detail.find((m) => m.id === 'konstruksi')
  if (!modulePerm || !modulePerm.isActive) return false
  const menu = modulePerm.menus.find(
    (m) => m.id.toLowerCase().includes('proyek_data') || m.id.toLowerCase().includes('proyek-data'),
  )
  if (!menu) return false
  if (actionType === 'setuju') return menu.approve || false
  return menu[actionType] || false
}

const isEditable = computed(() => canAction('ubah') && currentSpk.value?.status !== 'Approved')

// ============================================================================
// KALKULASI DASAR
// ============================================================================
const formatMoney = (v) => (v ? v.toLocaleString('id-ID') : '0')
const sumRabRowTotal = (r) =>
  (Number(r.unit) || 0) *
  (Number(r.pemakaian) || 1) *
  (Number(r.durasi) || 1) *
  (Number(r.harga) || 0)
const sumRabPerItem = (item) =>
  (item.rab_modal || []).reduce((sum, r) => sum + sumRabRowTotal(r), 0)
const sumGroupJual = (group) =>
  (group.items || []).reduce((s, i) => s + (i.volume || 0) * (i.harga_satuan || 0), 0)
const sumGroupModal = (group) => (group.items || []).reduce((s, i) => s + sumRabPerItem(i), 0)
const calculateGrandTotalJual = (spk) =>
  (spk?.groups || []).reduce((s, g) => s + sumGroupJual(g), 0)
const calculateGrandTotalModal = (spk) =>
  (spk?.groups || []).reduce((s, g) => s + sumGroupModal(g), 0)

// ============================================================================
// ✅ KALKULASI PPN DINAMIS
// ============================================================================
/**
 * Hitung DPP Nilai Lain = Grand Total Jual × (ppn_pembilang / ppn_penyebut)
 */
const calcDPP = (spk) => {
  const total = calculateGrandTotalJual(spk)
  const pembilang = Number(spk?.ppn_pembilang) || 11
  const penyebut = Number(spk?.ppn_penyebut) || 12
  if (penyebut === 0) return 0
  return Math.round((total * pembilang) / penyebut)
}

/**
 * Hitung PPN = DPP × (ppn_persen / 100)
 */
const calcPPN = (spk) => {
  const dpp = calcDPP(spk)
  const persen = Number(spk?.ppn_persen) || 12
  return Math.round(dpp * (persen / 100))
}

/**
 * Hitung Total Dengan PPN = Grand Total Jual + PPN
 */
const calcTotalDenganPPN = (spk) => {
  return Math.round(calculateGrandTotalJual(spk) + calcPPN(spk))
}

// ============================================================================
// DURASI OTOMATIS
// ============================================================================
const autoCalculateDuration = () => {
  if (!formSpk.value.tgl_mulai || !formSpk.value.tgl_akhir) return
  const start = new Date(formSpk.value.tgl_mulai)
  const end = new Date(formSpk.value.tgl_akhir)
  if (end < start) {
    formSpk.value.durasi = 'Tgl Error'
    return
  }
  let months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth())
  let days = end.getDate() - start.getDate()
  if (days < 0) {
    months -= 1
    days += new Date(end.getFullYear(), end.getMonth(), 0).getDate()
  }
  formSpk.value.durasi = `${months} Bulan ${days} Hari`
}

// ============================================================================
// PROCESS FILE
// ============================================================================
const processFile = async (docObj) => {
  const file = docObj.fileRaw
  if (!file) return
  docObj.uploading = true
  try {
    const fRef = sRef(storage, `spk_docs/${Date.now()}_${file.name}`)
    await uploadBytes(fRef, file)
    docObj.url = await getDownloadURL(fRef)
    $q.notify({ type: 'positive', message: 'File berhasil diupload', position: 'top' })
  } catch (err) {
    console.error(err)
    $q.notify({ type: 'negative', message: 'Gagal upload file', position: 'top' })
  } finally {
    docObj.uploading = false
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
  target.groups.push({ title: 'KATEGORI BARU', items: [] })
}

const addDocumentRow = () => {
  if (!formSpk.value.documents) formSpk.value.documents = []
  formSpk.value.documents.push({ label: '', fileRaw: null, url: '', uploading: false })
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

// ============================================================================
// FETCH DATA
// ============================================================================
const fetchProyek = () => {
  loading.value = true
  const qProyek = query(collection(db, 'proyek'), orderBy('createdAt', 'desc'))
  unsubProyek = onSnapshot(
    qProyek,
    (snap) => {
      proyekRaw.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      recalcOmzet()
      loading.value = false
    },
    (err) => {
      console.error('Error listen proyek:', err)
      loading.value = false
    },
  )

  unsubAllSpk = onSnapshot(
    collection(db, 'spk_customer'),
    (snap) => {
      allSpksCache.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      recalcOmzet()
    },
    (err) => {
      console.error('Error listen all SPK:', err)
    },
  )
}

const fetchSpkByProject = (pid) => {
  if (unsubSpk) unsubSpk()
  const q = query(collection(db, 'spk_customer'), where('projectId', '==', pid))
  unsubSpk = onSnapshot(q, (snap) => {
    listSpkProject.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  })
}

// ============================================================================
// VIEW ACTIONS
// ============================================================================
const showProjectDetail = (evt, row) => {
  currentProject.value = row
  viewMode.value = 'detail'
  fetchSpkByProject(row.id)
  window.scrollTo(0, 0)
}

// ✅ showSpkDetail: backward-compatible — isi default jika field PPN belum ada
const showSpkDetail = (evt, row) => {
  currentSpk.value = JSON.parse(JSON.stringify(row))
  if (currentSpk.value.ppn_aktif === undefined) currentSpk.value.ppn_aktif = false
  if (currentSpk.value.ppn_persen === undefined) currentSpk.value.ppn_persen = 12
  if (currentSpk.value.ppn_pembilang === undefined) currentSpk.value.ppn_pembilang = 11
  if (currentSpk.value.ppn_penyebut === undefined) currentSpk.value.ppn_penyebut = 12
  activeTab.value = 'boq'
  viewMode.value = 'spk_detail'
  window.scrollTo(0, 0)
}

const editSpk = (row) => {
  if (!canAction('ubah')) {
    $q.notify({ type: 'negative', message: 'Tidak ada hak akses.' })
    return
  }
  isEditSpkMode.value = true
  formSpk.value = JSON.parse(JSON.stringify(row))
  // ✅ Backward-compatible: isi default jika field PPN belum ada di data lama
  if (formSpk.value.ppn_persen === undefined) formSpk.value.ppn_persen = 12
  if (formSpk.value.ppn_pembilang === undefined) formSpk.value.ppn_pembilang = 11
  if (formSpk.value.ppn_penyebut === undefined) formSpk.value.ppn_penyebut = 12
  if (formSpk.value.documents) {
    formSpk.value.documents = formSpk.value.documents.map((d) => ({
      ...d,
      fileRaw: null,
      uploading: false,
    }))
  }
  showAddSpk.value = true
}

const confirmDeleteSpk = (row) => {
  if (!canAction('hapus')) {
    $q.notify({ type: 'negative', message: 'Tidak ada hak akses.' })
    return
  }
  $q.dialog({
    title: '<div class="text-h5 text-weight-bolder text-negative q-mb-sm">Konfirmasi Hapus</div>',
    message: `Hapus kontrak <b>${row.nomor_spk}</b> secara permanen?`,
    html: true,
    cancel: { label: 'Batal', color: 'grey-7', outline: true, rounded: true },
    ok: { label: 'Ya, Hapus', color: 'negative', unelevated: true, rounded: true },
    class: 'rounded-20 q-pa-md shadow-premium bg-white',
    persistent: true,
  }).onOk(async () => {
    try {
      await deleteDoc(doc(db, 'spk_customer', row.id))
      $q.notify({ type: 'negative', message: 'Kontrak dihapus.', position: 'top' })
    } catch (e) {
      console.error(e)
    }
  })
}

// ============================================================================
// SIMPAN SPK
// ============================================================================
const handleSaveSpk = async () => {
  if (!formSpk.value.nomor_spk) return
  submittingSpk.value = true
  try {
    const payload = JSON.parse(JSON.stringify(formSpk.value))
    if (payload.documents)
      payload.documents.forEach((d) => {
        delete d.fileRaw
        delete d.uploading
      })
    payload.nilai_total = calculateGrandTotalJual(payload)
    payload.projectId = currentProject.value.id

    if (isEditSpkMode.value) {
      await updateDoc(doc(db, 'spk_customer', payload.id), {
        ...payload,
        updatedAt: serverTimestamp(),
      })
    } else {
      payload.createdAt = serverTimestamp()
      payload.status = 'Pending'
      await addDoc(collection(db, 'spk_customer'), payload)
    }
    showAddSpk.value = false
    $q.notify({ type: 'positive', message: 'Kontrak berhasil disimpan!', position: 'top' })
  } catch (e) {
    console.error(e)
  } finally {
    submittingSpk.value = false
  }
}

// ============================================================================
// SIMPAN RAB
// ============================================================================
const saveRabModal = async () => {
  if (!canAction('ubah')) {
    $q.notify({ type: 'negative', message: 'Tidak ada hak akses.' })
    return
  }
  savingRab.value = true
  try {
    const payload = JSON.parse(JSON.stringify(currentSpk.value))
    payload.nilai_total = calculateGrandTotalJual(payload)
    const sid = payload.id
    delete payload.id
    await updateDoc(doc(db, 'spk_customer', sid), { ...payload, updatedAt: serverTimestamp() })
    $q.notify({ type: 'positive', message: 'RAB berhasil disimpan!', position: 'top' })
  } catch (e) {
    console.error(e)
  } finally {
    savingRab.value = false
  }
}

const handleApproveSpk = async (statusVal) => {
  if (!canAction('setuju')) {
    $q.notify({ type: 'negative', message: 'Tidak ada hak akses.' })
    return
  }
  $q.loading.show({
    message: statusVal === 'Approved' ? 'Menyetujui Kontrak...' : 'Membatalkan Persetujuan...',
  })
  try {
    currentSpk.value.status = statusVal
    const payload = JSON.parse(JSON.stringify(currentSpk.value))
    payload.nilai_total = calculateGrandTotalJual(payload)
    const sid = payload.id
    delete payload.id
    await updateDoc(doc(db, 'spk_customer', sid), {
      ...payload,
      status: statusVal,
      updatedAt: serverTimestamp(),
    })
    $q.notify({
      type: statusVal === 'Approved' ? 'positive' : 'warning',
      message: statusVal === 'Approved' ? 'Kontrak disetujui!' : 'Persetujuan dibatalkan.',
      position: 'top',
    })
  } catch (e) {
    console.error(e)
    $q.notify({ type: 'negative', message: 'Terjadi kesalahan' })
  } finally {
    $q.loading.hide()
  }
}

const simpanProyek = async () => {
  if (!form.value.nama) return
  const p = { ...form.value }
  try {
    if (isEditMode.value) {
      await updateDoc(doc(db, 'proyek', p.id), p)
    } else {
      p.createdAt = serverTimestamp()
      await addDoc(collection(db, 'proyek'), p)
    }
    showAddDialog.value = false
    $q.notify({ type: 'positive', message: 'Proyek berhasil disimpan!', position: 'top' })
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

// ✅ openAddSpkDialog: sertakan field PPN default
const openAddSpkDialog = () => {
  isEditSpkMode.value = false
  formSpk.value = {
    nomor_spk: '',
    no_quotation: '',
    nama_kontrak: '',
    tgl_mulai: '',
    tgl_akhir: '',
    durasi: '',
    status: 'Pending',
    ppn_aktif: false,
    ppn_persen: 12,
    ppn_pembilang: 11,
    ppn_penyebut: 12,
    groups: [
      { title: '1. PEKERJAAN PERSIAPAN', items: [] },
      { title: '2. PEKERJAAN UTAMA', items: [] },
    ],
    documents: [],
  }
  showAddSpk.value = true
}

const hapusProyek = (row) => {
  if (!canAction('hapus')) {
    $q.notify({ type: 'negative', message: 'Tidak ada hak akses.' })
    return
  }
  $q.dialog({
    title: '<div class="text-h5 text-weight-bolder text-negative q-mb-sm">Konfirmasi Hapus</div>',
    message: `Hapus proyek <b>${row.nama}</b> secara permanen?`,
    html: true,
    cancel: { label: 'Batal', color: 'grey-7', outline: true, rounded: true },
    ok: { label: 'Ya, Hapus', color: 'negative', unelevated: true, rounded: true },
    class: 'rounded-20 q-pa-md shadow-premium bg-white',
    persistent: true,
  }).onOk(async () => {
    try {
      await deleteDoc(doc(db, 'proyek', row.id))
      $q.notify({ type: 'negative', message: 'Proyek dihapus.', position: 'top' })
    } catch (e) {
      console.error(e)
    }
  })
}

// ============================================================================
// LIFECYCLE
// ============================================================================
onMounted(() => {
  fetchProyek()
  getDocs(collection(db, 'customer')).then(
    (c) => (optionsKonsumen.value = c.docs.map((d) => d.data().nama)),
  )
  getDocs(collection(db, 'kategori_proyek')).then(
    (k) => (optionsKategori.value = k.docs.map((d) => d.data().nama)),
  )
  const userEmail = authStore.user?.email
  if (userEmail) {
    const qUser = query(collection(db, 'karyawan'), where('email', '==', userEmail))
    unsubUser = onSnapshot(qUser, (snapshot) => {
      if (!snapshot.empty) userData.value = snapshot.docs[0].data()
    })
  }
})

onUnmounted(() => {
  if (unsubProyek) unsubProyek()
  if (unsubSpk) unsubSpk()
  if (unsubAllSpk) unsubAllSpk()
  if (unsubUser) unsubUser()
})

// ============================================================================
// COLUMNS
// ============================================================================
const columns = [
  { name: 'nama', align: 'left', label: 'IDENTITAS PROYEK', field: 'nama' },
  { name: 'customer', align: 'left', label: 'CLIENT / CUSTOMER', field: 'konsumen' },
  { name: 'total_kontrak', align: 'right', label: 'VALUASI OMZET', field: 'total_omzet' },
  { name: 'aksi', align: 'center', label: 'KELOLA', field: 'id' },
]
const spkColumns = [
  { name: 'no_spk', align: 'left', label: 'INFORMASI KONTRAK (SPK)', field: 'nomor_spk' },
  { name: 'nilai', align: 'right', label: 'TOTAL NILAI KONTRAK', field: 'nilai_total' },
  { name: 'aksi', align: 'center', label: 'AKSI', field: 'id' },
]
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&display=swap');

.bg-page {
  background-color: #f8fcfb;
}
.font-pro {
  font-family:
    'Plus Jakarta Sans',
    -apple-system,
    sans-serif;
}
.rounded-20 {
  border-radius: 20px;
}
.rounded-12 {
  border-radius: 12px;
}
.shadow-premium {
  box-shadow: 0 10px 30px rgba(54, 173, 163, 0.15);
}
.border-dashed {
  border: 2px dashed #e0e0e0;
}

.bg-brand-primary,
:deep(.bg-brand-primary) {
  background-color: #36ada3 !important;
}
.text-brand-primary,
:deep(.text-brand-primary) {
  color: #36ada3 !important;
}
.bg-brand-light {
  background-color: #e6f5f4 !important;
}
.text-brand-secondary {
  color: #2a8b83 !important;
}
.border-brand-thin {
  border: 2px solid #b2e5e2 !important;
}
.border-brand-primary {
  border: 1px solid #36ada3;
  border-top: 5px solid #36ada3;
}
.border-orange {
  border: 1px solid #e65100;
  border-top: 5px solid #e65100;
}
.border-right-sep {
  border-right: 1px solid rgba(0, 0, 0, 0.05);
}
.border-white-2 {
  border: 2px solid rgba(255, 255, 255, 0.4);
}
.border-subtle {
  border: 1px solid rgba(0, 0, 0, 0.05);
}
.border-bottom {
  border-bottom: 1px solid #eee;
}

@media (max-width: 599px) {
  .mobile-text-center {
    text-align: center !important;
  }
  .q-btn.full-width {
    width: 100% !important;
  }
  .divider-container > div {
    border-right: none !important;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  }
}
@media (min-width: 600px) {
  .desktop-text-right {
    text-align: right !important;
  }
}



.proyek-table :deep(thead tr th),
.spk-table-premium :deep(thead tr th) {
  position: sticky;
  top: 0;
  z-index: 1;
  font-weight: 800;
  font-size: 0.75rem;
  letter-spacing: 0.5px;
}
.btn-hover:hover {
  filter: brightness(1.1);
  transform: scale(1.02);
  transition: 0.3s;
}
.hover-bg:hover {
  background-color: #e6f5f4 !important;
}
.transition-all {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}
.letter-spacing-1 {
  letter-spacing: 1px;
}
.uppercase {
  text-transform: uppercase;
}
.block {
  display: block;
}
.leading-tight {
  line-height: 1.1;
}
.leading-relaxed {
  line-height: 1.6;
}
.no-padding {
  padding: 0 !important;
}

.excel-grid-blue :deep(thead th) {
  font-size: 0.7rem;
  font-weight: 800;
  padding: 12px;
  background: #36ada3;
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.1);
}
.excel-grid-blue :deep(td) {
  border: 1px solid #f0f0f0;
}
.excel-grid-orange :deep(thead th) {
  font-size: 0.65rem;
  font-weight: 800;
  padding: 10px;
  background: #e65100;
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.1);
}
.excel-grid-orange :deep(td) {
  border: 1px solid #fff3e0;
}

/* ✅ TABEL PPN */
.ppn-table :deep(td) {
  border-bottom: 1px solid #f0f0f0;
  font-size: 0.9rem;
}
.ppn-table :deep(tr:last-child td) {
  border-bottom: none;
}

/* ✅ Input konfigurasi PPN */
.ppn-config-input :deep(.q-field__control) {
  border-radius: 8px;
  min-height: 36px;
}
.ppn-config-input :deep(.q-field__native) {
  font-weight: 700;
  font-size: 0.9rem;
}

.balance-prestige-card {
  border-radius: 20px;
  position: relative;
  overflow: hidden;
  height: 100%;
  transition: 0.4s;
}
.balance-prestige-card:hover {
  transform: translateY(-10px);
}
.card-accent-bar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 6px;
}
.margin-badge-white {
  background: rgba(255, 255, 255, 0.15);
  padding: 8px 20px;
  border-radius: 50px;
  font-weight: 900;
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: inline-block;
}
.balance-sheet-table :deep(thead th) {
  font-size: 0.75rem;
  letter-spacing: 1px;
  padding: 15px;
}

.animate-fade {
  animation: fadeIn 0.4s ease-out;
}
.animate-fade-up {
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

.font-11 {
  font-size: 11px;
}
.font-10 {
  font-size: 10px;
}
.search-input :deep(.q-field__control) {
  border-radius: 30px;
}
.shrink {
  flex: 0 0 auto;
}
.content-relative {
  position: relative;
  z-index: 1;
}
.tracking-widest {
  letter-spacing: 0.15em;
}

/* Teal-1 bg untuk baris konfigurasi PPN */
.bg-teal-1 {
  background-color: #e0f2f1 !important;
}
</style>
