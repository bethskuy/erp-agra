<template>
  <q-page class="bg-grey-2 q-pa-md q-pa-lg-lg font-pro">
    <div class="page-content-wrapper">
      <!-- =====================================================================================
         VIEW 1: LIST PENGAJUAN (DASHBOARD)
         ===================================================================================== -->
      <div v-if="viewMode === 'list'" class="animate-fade">
        <!-- HEADER SECTION -->
        <div class="row items-center justify-between q-mb-lg animate-fade no-print">
          <div class="col-12 col-md-8">
            <div class="text-h4 text-weight-bolder text-brand-primary leading-tight">
              Form Pengajuan Dana
              <span class="text-h5 text-weight-light text-grey-6 block q-mt-xs"
                >Form Pengajuan Pembayaran Operasional & Vendor</span
              >
            </div>
            <div class="text-subtitle1 text-grey-7 q-mt-sm">
              Buat permohonan pencairan dana baru secara mandiri dan pantau status persetujuannya di
              sini.
            </div>
          </div>
          <div class="col-12 col-md-auto q-mt-md q-mt-md-none">
            <q-btn
              v-if="canCreate"
              unelevated
              color="brand-primary"
              icon="add"
              label="BUAT PENGAJUAN BARU"
              @click="openAddForm"
              rounded
              class="q-px-lg text-weight-bold shadow-premium btn-hover full-width md:auto"
            />
          </div>
        </div>

        <!-- SUMMARY CARDS / KPI -->
        <div class="row q-col-gutter-lg q-mb-lg animate-fade-up no-print items-stretch">
          <!-- Card 1: TOTAL PENGAJUAN -->
          <div class="col-12 col-sm-6 col-md-3">
            <q-card
              flat
              class="kpi-card rounded-20 card-brand-gradient text-white transition-all hover-shadow h-full flex column justify-center"
            >
              <q-card-section class="row items-center no-wrap q-pa-lg">
                <div class="col">
                  <div class="text-overline text-white kpi-label tracking-widest q-mb-xs">
                    TOTAL PENGAJUAN
                  </div>
                  <div class="text-h5 text-weight-black q-mt-xs">
                    {{ rows.length }}
                  </div>
                </div>
                <div class="kpi-icon-wrap q-pa-md rounded-borders flex flex-center">
                  <q-icon name="request_page" color="white" size="32px" />
                </div>
              </q-card-section>
              <div class="q-px-lg q-pb-md">
                <div class="kpi-bar-track">
                  <div class="kpi-bar-fill bg-white" style="width: 100%"></div>
                </div>
              </div>
            </q-card>
          </div>

          <!-- Card 2: MENUNGGU APPROVAL -->
          <div class="col-12 col-sm-6 col-md-3">
            <q-card
              flat
              class="kpi-card rounded-20 card-orange-gradient text-white transition-all hover-shadow h-full flex column justify-center"
            >
              <q-card-section class="row items-center no-wrap q-pa-lg">
                <div class="col">
                  <div class="text-overline text-white kpi-label tracking-widest q-mb-xs">
                    MENUNGGU APPROVAL
                  </div>
                  <div class="text-h5 text-weight-black q-mt-xs">
                    {{ countByStatus('Pending') }}
                  </div>
                </div>
                <div class="kpi-icon-wrap q-pa-md rounded-borders flex flex-center">
                  <q-icon name="hourglass_empty" color="white" size="32px" />
                </div>
              </q-card-section>
              <div class="q-px-lg q-pb-md">
                <div class="kpi-bar-track">
                  <div class="kpi-bar-fill bg-white" style="width: 100%"></div>
                </div>
              </div>
            </q-card>
          </div>

          <!-- Card 3: SIAP CAIR / APPROVED -->
          <div class="col-12 col-sm-6 col-md-3">
            <q-card
              flat
              class="kpi-card rounded-20 card-green-gradient text-white transition-all hover-shadow h-full flex column justify-center"
            >
              <q-card-section class="row items-center no-wrap q-pa-lg">
                <div class="col">
                  <div class="text-overline text-white kpi-label tracking-widest q-mb-xs">
                    SIAP CAIR (APPROVED)
                  </div>
                  <div class="text-h5 text-weight-black q-mt-xs">
                    {{ countByStatus('Approved') }}
                  </div>
                </div>
                <div class="kpi-icon-wrap q-pa-md rounded-borders flex flex-center">
                  <q-icon name="verified" color="white" size="32px" />
                </div>
              </q-card-section>
              <div class="q-px-lg q-pb-md">
                <div class="kpi-bar-track">
                  <div class="kpi-bar-fill bg-white" style="width: 100%"></div>
                </div>
              </div>
            </q-card>
          </div>

          <!-- Card 4: DANA DIAJUKAN -->
          <div class="col-12 col-sm-6 col-md-3">
            <q-card
              flat
              class="kpi-card rounded-20 card-blue-gradient text-white transition-all hover-shadow h-full flex column justify-center"
            >
              <q-card-section class="row items-center no-wrap q-pa-lg">
                <div class="col">
                  <div class="text-overline text-white kpi-label tracking-widest q-mb-xs">
                    DANA DIAJUKAN
                  </div>
                  <div class="text-h5 text-weight-black q-mt-xs">
                    Rp {{ formatCompact(totalDanaPending) }}
                  </div>
                </div>
                <div class="kpi-icon-wrap q-pa-md rounded-borders flex flex-center">
                  <q-icon name="account_balance" color="white" size="32px" />
                </div>
              </q-card-section>
              <div class="q-px-lg q-pb-md">
                <div class="kpi-bar-track">
                  <div class="kpi-bar-fill bg-white" style="width: 100%"></div>
                </div>
              </div>
            </q-card>
          </div>
        </div>

        <!-- FILTER & SEARCH BAR -->
        <q-card flat class="rounded-20 border-subtle q-mb-lg bg-white shadow-1 no-print">
          <q-card-section class="row items-center q-col-gutter-md">
            <div class="col-12 col-md-4">
              <q-input
                outlined
                dense
                v-model="searchQuery"
                placeholder="Cari No. Request, Vendor..."
                class="search-input"
                bg-color="white"
                clearable
              >
                <template v-slot:prepend>
                  <q-icon name="search" color="grey-6" />
                </template>
              </q-input>
            </div>
            <div class="col-12 col-md-3">
              <q-select
                outlined
                dense
                v-model="statusFilter"
                :options="['ALL', 'Pending', 'Approved', 'Rejected', 'Cair']"
                label="Filter Status"
                bg-color="white"
                emit-value
                map-options
              />
            </div>
            <q-space />
            <div class="col-auto text-grey-6 text-caption text-weight-medium">
              Menampilkan {{ filteredRows.length }} dari {{ rows.length }} pengajuan
            </div>
          </q-card-section>
        </q-card>

        <!-- DATA TABLE -->
        <q-card flat class="rounded-20 border-subtle bg-white shadow-1 overflow-hidden">
          <q-table
            flat
            :rows="filteredRows"
            :columns="columns"
            row-key="id"
            :loading="loading"
            class="finance-table"
            :pagination="{ rowsPerPage: 10 }"
          >
            <template v-slot:body="props">
              <q-tr :props="props" class="hover-bg cursor-pointer" @click="openDetail(props.row)">
                <!-- NO. REQUEST & REF -->
                <q-td key="request" :props="props">
                  <div class="text-weight-bolder text-brand-primary text-subtitle2">
                    {{ props.row.no_request }}
                  </div>
                  <div class="text-caption text-grey-6">
                    Ref: {{ props.row.tagihan_nomor_invoice || props.row.tagihan_kode || '-' }}
                  </div>
                </q-td>

                <!-- VENDOR / PENERIMA -->
                <q-td key="vendor" :props="props">
                  <div class="text-weight-bold text-grey-9">{{ props.row.vendor_nama }}</div>
                  <div class="text-caption text-grey-6 font-10">
                    {{ props.row.rek_bank }} - {{ props.row.rek_nomor }} (a/n
                    {{ props.row.rek_nama }})
                  </div>
                </q-td>

                <!-- PEMOHON -->
                <q-td key="pemohon" :props="props">
                  <div class="text-weight-medium">{{ props.row.pembuat_nama }}</div>
                  <div class="text-caption text-grey-5 font-10">{{ props.row.pembuat_email }}</div>
                </q-td>

                <!-- NOMINAL DIAJUKAN -->
                <q-td key="nominal" :props="props" class="text-right">
                  <div class="text-weight-bolder text-brand-primary text-subtitle2">
                    Rp {{ (props.row.nominal || 0).toLocaleString('id-ID') }}
                  </div>
                </q-td>

                <!-- TGL PENGAJUAN -->
                <q-td key="timeline" :props="props" class="text-center">
                  <div class="text-weight-bold text-grey-8 font-11">
                    {{ formatDateIndo(props.row.tanggal_pengajuan) }}
                  </div>
                  <div class="text-caption text-negative font-10">
                    Target: {{ formatDateIndo(props.row.tanggal_dibutuhkan) }}
                  </div>
                </q-td>

                <!-- STATUS -->
                <q-td key="status" :props="props" class="text-center">
                  <q-chip
                    dense
                    :color="getStatusColor(props.row.status).bg"
                    :text-color="getStatusColor(props.row.status).text"
                    class="text-weight-bold font-10 uppercase q-ma-none shadow-sm q-px-sm"
                  >
                    <q-icon
                      :name="getStatusColor(props.row.status).icon"
                      size="xs"
                      class="q-mr-xs"
                    />
                    {{ props.row.status }}
                  </q-chip>
                </q-td>

                <!-- AKSI -->
                <q-td key="aksi" :props="props" class="text-center" @click.stop>
                  <div class="row justify-center q-gutter-xs">
                    <q-btn
                      flat
                      round
                      color="brand-primary"
                      icon="visibility"
                      size="sm"
                      @click="openDetail(props.row)"
                    >
                      <q-tooltip>Detail</q-tooltip>
                    </q-btn>
                    <q-btn
                      v-if="
                        canCreate &&
                        props.row.status === 'Pending' &&
                        (props.row.pembuat_email === authStore.user?.email || isSuperAdmin)
                      "
                      flat
                      round
                      color="blue-8"
                      icon="edit"
                      size="sm"
                      @click="openEditForm(props.row)"
                    >
                      <q-tooltip>Edit</q-tooltip>
                    </q-btn>
                    <q-btn
                      v-if="
                        canDelete &&
                        props.row.status === 'Pending' &&
                        (props.row.pembuat_email === authStore.user?.email || isSuperAdmin)
                      "
                      flat
                      round
                      color="negative"
                      icon="delete_outline"
                      size="sm"
                      @click="confirmHapus(props.row)"
                    >
                      <q-tooltip>Hapus</q-tooltip>
                    </q-btn>
                  </div>
                </q-td>
              </q-tr>
            </template>
            <template v-slot:no-data>
              <div class="full-width row flex-center q-pa-xl text-grey-5">
                <q-icon name="request_quote" size="64px" class="q-mb-md opacity-50" />
                <div class="text-h6 full-width text-center">
                  Data pengajuan Anda belum tersedia.
                </div>
              </div>
            </template>
          </q-table>
        </q-card>
      </div>

      <!-- =====================================================================================
         VIEW 2: FORM ENTRY PENGAJUAN (FORM MODE)
         ===================================================================================== -->
      <div v-else-if="viewMode === 'form'" class="animate-fade">
        <div class="row items-center justify-between q-mb-xl no-print">
          <div class="col-12 col-md-8">
            <div class="row items-center no-wrap">
              <q-btn
                flat
                round
                color="brand-primary"
                icon="arrow_back"
                @click="viewMode = 'list'"
                class="q-mr-md bg-white shadow-1"
              />
              <div>
                <div class="text-h4 text-weight-bolder text-brand-primary leading-tight uppercase">
                  {{ isEditMode ? 'Edit Pengajuan Anda' : 'Buat Pengajuan Baru' }}
                </div>
                <div class="text-subtitle1 text-grey-7 q-mt-sm">
                  Isi formulir pencairan dana untuk pembayaran tagihan vendor atau kebutuhan
                  operasional.
                </div>
              </div>
            </div>
          </div>
          <div class="col-12 col-md-auto q-mt-md q-mt-md-none text-center">
            <q-btn
              unelevated
              color="brand-primary"
              icon="send"
              label="KIRIM PENGAJUAN"
              @click="simpanPengajuan"
              :loading="submitting"
              rounded
              class="q-px-xl text-weight-bold shadow-premium w-full md:w-auto"
            />
          </div>
        </div>

        <div class="row justify-center">
          <div class="col-12 col-xl-10">
            <div class="row q-col-gutter-lg">
              <!-- KOLOM KIRI (METODE & DETAIL PENERIMA) -->
              <div class="col-12 col-md-6">
                <q-card flat bordered class="rounded-20 q-mb-lg bg-white shadow-1">
                  <q-card-section
                    class="bg-brand-light q-py-sm text-brand-primary text-weight-bold flex items-center border-bottom-subtle"
                  >
                    <q-icon name="settings_suggest" class="q-mr-xs" size="sm" /> 1. METODE &
                    REFERENSI
                  </q-card-section>
                  <q-card-section class="q-pa-lg q-gutter-y-md">
                    <div class="row q-col-gutter-md">
                      <div class="col-12 col-md-6">
                        <div class="label-req q-mb-xs">No. Request (Auto)</div>
                        <q-input
                          outlined
                          dense
                          v-model="form.no_request"
                          readonly
                          bg-color="grey-2"
                          class="text-weight-bold text-brand-primary"
                        />
                      </div>
                    </div>

                    <!-- PROYEK, SPK & BOQ SELECTORS -->
                    <div class="q-gutter-y-md q-mt-sm">
                      <div>
                        <div class="label-req q-mb-xs text-brand-primary">Referensi Proyek</div>
                        <q-select
                          outlined
                          dense
                          v-model="form.proyek_id"
                          :options="allProyek"
                          option-label="nama"
                          option-value="id"
                          emit-value
                          map-options
                          placeholder="Pilih Proyek..."
                          bg-color="white"
                          color="brand-primary"
                          clearable
                          @update:model-value="onProyekSelect"
                        >
                          <template v-slot:selected-item="scope">
                            <q-item-section>
                              <q-item-label>{{ scope.opt.nama }}</q-item-label>
                            </q-item-section>
                          </template>
                          <template v-slot:option="scope">
                            <q-item v-bind="scope.itemProps">
                              <q-item-section>
                                <q-item-label>{{ scope.opt.nama }}</q-item-label>
                              </q-item-section>
                            </q-item>
                          </template>
                        </q-select>
                      </div>

                      <div v-if="form.proyek_id">
                        <div class="label-req q-mb-xs text-brand-primary">
                          Pilih SPK (Bisa Lebih dari 1)
                        </div>
                        <q-select
                          outlined
                          dense
                          multiple
                          v-model="form.selected_spk"
                          :options="currentSpkOptions"
                          option-label="nomor_spk"
                          option-value="id"
                          emit-value
                          map-options
                          placeholder="Pilih SPK..."
                          bg-color="white"
                          color="brand-primary"
                          clearable
                          use-chips
                        >
                          <template v-slot:option="scope">
                            <q-item v-bind="scope.itemProps">
                              <q-item-section>
                                <q-item-label class="text-weight-bold">
                                  {{
                                    scope.opt.nomor_spk ||
                                    scope.opt.nama_kontrak ||
                                    `SPK: ${scope.opt.id}`
                                  }}
                                </q-item-label>
                                <q-item-label caption>{{
                                  scope.opt.nama_kontrak || scope.opt.id
                                }}</q-item-label>
                              </q-item-section>
                            </q-item>
                          </template>
                          <template v-slot:selected-item="scope">
                            <q-item-section>
                              <q-item-label>{{
                                scope.opt.nomor_spk ||
                                scope.opt.nama_kontrak ||
                                `SPK: ${scope.opt.id}`
                              }}</q-item-label>
                            </q-item-section>
                          </template>
                        </q-select>
                      </div>

                      <div
                        v-if="
                          form.selected_spk && form.selected_spk.length && form.spk_boq_selection
                        "
                      >
                        <div class="label-req q-mb-xs text-brand-primary">
                          Pilih Detail BOQ per SPK
                        </div>
                        <div class="q-gutter-y-md">
                          <div
                            v-for="(spkId, idx) in form.selected_spk"
                            :key="idx"
                            class="bg-grey-1 q-pa-md rounded-12"
                          >
                            <div class="text-weight-bold text-brand-primary q-mb-sm">
                              {{ getSpkById(spkId)?.nomor_spk || 'SPK' }} -
                              {{ getSpkById(spkId)?.nama_kontrak || '' }}
                            </div>
                            <template v-if="form.spk_boq_selection[spkId]">
                              <div class="label-req q-mb-xs">Pilih Kategori BOQ</div>
                              <q-select
                                outlined
                                dense
                                multiple
                                emit-value
                                map-options
                                v-model="form.spk_boq_selection[spkId].selected_groups"
                                :options="getSpkBoqGroups(spkId)"
                                option-label="title"
                                option-value="title"
                                placeholder="Pilih Kategori..."
                                bg-color="white"
                                color="brand-primary"
                                clearable
                                use-chips
                                use-input
                              />
                              <div
                                v-if="form.spk_boq_selection[spkId].selected_groups.length"
                                class="q-mt-md"
                              >
                                <div class="label-req q-mb-xs">Pilih Item BOQ</div>
                                <div class="q-gutter-y-sm">
                                  <div
                                    v-for="(groupTitle, gIdx) in form.spk_boq_selection[spkId]
                                      .selected_groups"
                                    :key="gIdx"
                                    class="bg-white q-pa-sm rounded-8"
                                  >
                                    <div class="text-weight-bold text-caption q-mb-xs">
                                      {{ groupTitle }}
                                    </div>
                                    <q-select
                                      outlined
                                      dense
                                      multiple
                                      emit-value
                                      map-options
                                      v-model="
                                        form.spk_boq_selection[spkId].selected_items_by_group[
                                          groupTitle
                                        ]
                                      "
                                      :options="getSpkBoqGroupItems(spkId, groupTitle)"
                                      option-label="deskripsi"
                                      option-value="deskripsi"
                                      placeholder="Pilih Item..."
                                      bg-color="white"
                                      color="brand-primary"
                                      clearable
                                      use-chips
                                      use-input
                                    />
                                  </div>
                                </div>
                              </div>
                            </template>
                          </div>
                        </div>
                      </div>
                    </div>
                  </q-card-section>
                </q-card>

                <!-- REKENING PENERIMA -->
                <q-card flat bordered class="rounded-20 q-mb-lg bg-white shadow-1">
                  <q-card-section
                    class="bg-brand-light q-py-sm text-brand-primary text-weight-bold flex items-center border-bottom-subtle"
                  >
                    <q-icon name="account_balance" class="q-mr-xs" size="sm" /> 2. REKENING PENERIMA
                  </q-card-section>
                  <q-card-section class="q-pa-lg q-gutter-y-md">
                    <div>
                      <div class="label-req q-mb-xs">Nama Penerima / Vendor *</div>
                      <q-input
                        outlined
                        dense
                        v-model="form.vendor_nama"
                        bg-color="white"
                        class="text-weight-bold uppercase"
                        :readonly="form.tipe_pengajuan === 'Tagihan Supplier'"
                      />
                    </div>
                    <div class="row q-col-gutter-md">
                      <div class="col-12 col-md-4">
                        <div class="label-req q-mb-xs">Bank *</div>
                        <q-input
                          outlined
                          dense
                          v-model="form.rek_bank"
                          bg-color="white"
                          placeholder="Contoh: BCA"
                          class="uppercase text-weight-bold"
                        />
                      </div>
                      <div class="col-12 col-md-8">
                        <div class="label-req q-mb-xs">Nomor Rekening *</div>
                        <q-input
                          outlined
                          dense
                          v-model="form.rek_nomor"
                          bg-color="white"
                          placeholder="12345..."
                          class="text-weight-bold text-primary"
                        />
                      </div>
                      <div class="col-12">
                        <div class="label-req q-mb-xs">Atas Nama Rekening *</div>
                        <q-input
                          outlined
                          dense
                          v-model="form.rek_nama"
                          bg-color="white"
                          placeholder="Sesuai buku tabungan"
                          class="uppercase"
                        />
                      </div>
                    </div>
                  </q-card-section>
                </q-card>
              </div>

              <!-- KOLOM KANAN (NOMINAL & KETERANGAN) -->
              <div class="col-12 col-md-6">
                <q-card flat bordered class="rounded-20 bg-white shadow-1 overflow-hidden q-mb-lg">
                  <q-card-section
                    class="bg-brand-primary q-py-sm text-white text-weight-bold flex items-center border-bottom-subtle"
                  >
                    <q-icon name="payments" class="q-mr-xs" size="sm" /> 3. NOMINAL & JADWAL
                  </q-card-section>

                  <q-card-section class="q-pa-lg q-gutter-y-md">
                    <div>
                      <div class="label-req q-mb-xs">Nominal Pengajuan (Rp) *</div>
                      <q-input
                        outlined
                        dense
                        type="number"
                        v-model.number="form.nominal"
                        bg-color="white"
                        class="text-weight-bold text-h5 text-brand-primary"
                        prefix="Rp"
                      />
                      <div
                        class="text-caption text-negative q-mt-xs font-bold"
                        v-if="form.tipe_pengajuan === 'Tagihan Supplier' && form.tagihan_obj"
                      >
                        Sisa Hutang Max: Rp
                        {{ (form.tagihan_obj.sisa_tagihan || 0).toLocaleString('id-ID') }}
                      </div>
                    </div>

                    <div class="row q-col-gutter-md">
                      <div class="col-12 col-md-6">
                        <div class="label-req q-mb-xs">Tgl Pengajuan *</div>
                        <q-input
                          outlined
                          dense
                          type="date"
                          v-model="form.tanggal_pengajuan"
                          bg-color="white"
                        />
                      </div>
                      <div class="col-12 col-md-6">
                        <div class="label-req q-mb-xs text-negative">
                          Tgl Dibutuhkan (Target Cair) *
                        </div>
                        <q-input
                          outlined
                          dense
                          type="date"
                          v-model="form.tanggal_dibutuhkan"
                          bg-color="white"
                        />
                      </div>
                    </div>

                    <div>
                      <div class="label-req q-mb-xs">Tujuan Pembayaran / Keterangan *</div>
                      <q-input
                        outlined
                        dense
                        type="textarea"
                        rows="4"
                        v-model="form.keterangan"
                        bg-color="white"
                        placeholder="Deskripsikan untuk apa dana ini..."
                      />
                    </div>
                  </q-card-section>
                </q-card>

                <!-- DOKUMEN LAMPIRAN -->
                <q-card flat bordered class="rounded-20 bg-white shadow-1">
                  <q-card-section
                    class="bg-brand-light q-py-sm text-brand-primary text-weight-bold flex items-center border-bottom-subtle"
                  >
                    <q-icon name="attach_file" class="q-mr-xs" size="sm" /> 4. DOKUMEN LAMPIRAN
                  </q-card-section>
                  <q-card-section class="q-pa-lg">
                    <div class="row items-center justify-between q-mb-md">
                      <div class="text-caption text-grey-7">
                        Upload bukti pendukung (Kwitansi, Memo, dll).
                      </div>
                      <q-btn
                        round
                        unelevated
                        color="brand-primary"
                        icon="add"
                        size="sm"
                        @click="addDocRow"
                      />
                    </div>
                    <div class="bg-brand-light q-pa-sm rounded-12 border-dashed">
                      <div
                        v-for="(item, index) in form.lampiran"
                        :key="index"
                        class="q-mb-sm q-pa-sm bg-white rounded-borders shadow-1"
                      >
                        <div class="row q-col-gutter-sm items-center">
                          <div class="col-12 col-md-5">
                            <q-input
                              outlined
                              dense
                              v-model="item.label"
                              placeholder="ex: Bukti Transfer"
                            />
                          </div>
                          <div class="col-12 col-md-6">
                            <q-file outlined dense v-model="item.fileObj" label="Pilih File">
                              <template v-slot:prepend
                                ><q-icon name="attach_file" size="xs"
                              /></template>
                              <template v-slot:append v-if="item.url || item.base64"
                                ><q-icon name="check_circle" color="positive" size="xs"
                              /></template>
                            </q-file>
                          </div>
                          <div class="col-12 col-md-1 text-center">
                            <q-btn
                              flat
                              round
                              dense
                              color="negative"
                              icon="delete"
                              size="sm"
                              @click="removeDocRow(index)"
                            />
                          </div>
                        </div>
                      </div>
                      <div
                        v-if="!form.lampiran.length"
                        class="text-center q-pa-md text-grey-5 italic"
                      >
                        Belum ada dokumen lampiran.
                      </div>
                    </div>
                  </q-card-section>
                </q-card>
              </div>
            </div>
          </div>
        </div>
        <div class="q-py-xl"></div>
      </div>

      <!-- =====================================================================================
         VIEW 3: DETAIL PENGAJUAN (READ ONLY)
         ===================================================================================== -->
      <div v-else-if="viewMode === 'detail' && selectedData" class="animate-fade q-pb-xl">
        <!-- TOP ACTION BAR -->
        <div class="row items-center justify-between q-mb-xl no-print">
          <div class="row items-center no-wrap">
            <q-btn
              flat
              round
              color="brand-primary"
              icon="arrow_back"
              @click="viewMode = 'list'"
              class="q-mr-md bg-white shadow-1"
            />
            <div>
              <div class="text-overline text-grey-6 text-bold tracking-widest q-mb-xs leading-none">
                DETAIL PENGAJUAN SAYA
              </div>
              <div class="text-h5 text-weight-bolder text-brand-primary leading-tight uppercase">
                {{ selectedData.no_request }}
              </div>
            </div>
          </div>
          <div class="row items-center q-gutter-sm">
            <q-chip
              dense
              :color="getStatusColor(selectedData.status).bg"
              :text-color="getStatusColor(selectedData.status).text"
              class="text-weight-bold text-subtitle2 uppercase q-py-md q-px-md shadow-sm"
            >
              <q-icon :name="getStatusColor(selectedData.status).icon" size="sm" class="q-mr-xs" />
              STATUS: {{ selectedData.status }}
            </q-chip>
          </div>
        </div>

        <div class="row q-col-gutter-lg justify-center">
          <!-- LEFT COLUMN: DETAIL CONTENT -->
          <div class="col-12 col-md-7 col-xl-8">
            <q-card flat bordered class="rounded-20 bg-white shadow-1 q-mb-lg overflow-hidden">
              <q-card-section
                class="bg-brand-light q-py-md text-brand-primary text-weight-bold flex items-center border-bottom-subtle"
              >
                <q-icon name="info" class="q-mr-xs" size="sm" /> Informasi Pengajuan & Referensi
              </q-card-section>
              <q-card-section class="q-pa-lg">
                <table class="detail-table">
                  <tbody>
                    <tr>
                      <td>Metode Pengajuan</td>
                      <td>{{ selectedData.tipe_pengajuan }}</td>
                    </tr>
                    <tr>
                      <td>Referensi Proyek</td>
                      <td>{{ selectedData.proyek_nama || '-' }}</td>
                    </tr>
                    <tr v-if="selectedData.selected_spk && selectedData.selected_spk.length">
                      <td>SPK Terkait</td>
                      <td>{{ formatSpkBoqText(selectedData) }}</td>
                    </tr>
                    <tr>
                      <td>Pembuat Pengajuan</td>
                      <td>{{ selectedData.pembuat_nama }} ({{ selectedData.pembuat_email }})</td>
                    </tr>
                    <tr>
                      <td>Tanggal Pengajuan</td>
                      <td>{{ formatDateIndo(selectedData.tanggal_pengajuan) }}</td>
                    </tr>
                    <tr>
                      <td>Tanggal Dibutuhkan</td>
                      <td>{{ formatDateIndo(selectedData.tanggal_dibutuhkan) }}</td>
                    </tr>
                  </tbody>
                </table>
              </q-card-section>
            </q-card>

            <!-- VENDOR & PAYMENT ACCOUNT DETAILS -->
            <q-card flat bordered class="rounded-20 bg-white shadow-1 q-mb-lg overflow-hidden">
              <q-card-section
                class="bg-brand-light q-py-md text-brand-primary text-weight-bold flex items-center border-bottom-subtle"
              >
                <q-icon name="account_balance" class="q-mr-xs" size="sm" /> Rekening Penerima /
                Vendor
              </q-card-section>
              <q-card-section class="q-pa-lg">
                <table class="detail-table">
                  <tbody>
                    <tr>
                      <td>Nama Penerima / Vendor</td>
                      <td class="text-brand-primary text-weight-bolder">
                        {{ selectedData.vendor_nama }}
                      </td>
                    </tr>
                    <tr>
                      <td>Nama Bank</td>
                      <td>{{ selectedData.rek_bank }}</td>
                    </tr>
                    <tr>
                      <td>Nomor Rekening</td>
                      <td class="text-primary text-weight-bolder">{{ selectedData.rek_nomor }}</td>
                    </tr>
                    <tr>
                      <td>Atas Nama Rekening</td>
                      <td>{{ selectedData.rek_nama }}</td>
                    </tr>
                  </tbody>
                </table>
              </q-card-section>
            </q-card>

            <!-- DETAILS / DESCRIPTION -->
            <q-card flat bordered class="rounded-20 bg-white shadow-1 q-mb-lg overflow-hidden">
              <q-card-section
                class="bg-brand-light q-py-md text-brand-primary text-weight-bold flex items-center border-bottom-subtle"
              >
                <q-icon name="description" class="q-mr-xs" size="sm" /> Deskripsi Keperluan /
                Keterangan
              </q-card-section>
              <q-card-section class="q-pa-lg text-grey-8 leading-relaxed font-13">
                {{ selectedData.keterangan || 'Tidak ada keterangan.' }}
              </q-card-section>
            </q-card>
          </div>

          <!-- RIGHT COLUMN: FINANCIAL DETAILS & ATTACHMENTS -->
          <div class="col-12 col-md-5 col-xl-4">
            <!-- NOMINAL CARD -->
            <q-card
              flat
              class="rounded-20 q-mb-lg card-brand-gradient text-white overflow-hidden text-center q-py-xl"
            >
              <div class="text-overline tracking-widest text-white opacity-80">
                NOMINAL YANG DIAJUKAN
              </div>
              <div class="text-h3 text-weight-black q-mt-sm">
                Rp {{ (selectedData.nominal || 0).toLocaleString('id-ID') }}
              </div>
              <div class="text-caption text-white opacity-70 q-mt-md">
                Status Pengajuan: <strong class="text-uppercase">{{ selectedData.status }}</strong>
              </div>
            </q-card>

            <!-- ATTACHMENT CARD -->
            <q-card flat bordered class="rounded-20 bg-white shadow-1 overflow-hidden">
              <q-card-section
                class="bg-brand-light q-py-md text-brand-primary text-weight-bold flex items-center border-bottom-subtle"
              >
                <q-icon name="attach_file" class="q-mr-xs" size="sm" /> Lampiran Bukti Pendukung
              </q-card-section>
              <q-card-section class="q-pa-lg">
                <q-list separator v-if="selectedData.lampiran && selectedData.lampiran.length">
                  <q-item
                    v-for="(doc, dIdx) in selectedData.lampiran"
                    :key="dIdx"
                    clickable
                    v-ripple
                    @click="openLink(doc.url || doc.base64)"
                    class="rounded-borders hover-bg q-py-sm"
                  >
                    <q-item-section avatar>
                      <q-avatar
                        color="brand-pale"
                        text-color="brand-primary"
                        icon="description"
                        size="md"
                      />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label class="text-weight-bold font-12 text-grey-8">{{
                        doc.label || `Dokumen ${dIdx + 1}`
                      }}</q-item-label>
                      <q-item-label caption class="font-10 text-grey-5"
                        >Klik untuk membuka berkas</q-item-label
                      >
                    </q-item-section>
                    <q-item-section side>
                      <q-icon name="open_in_new" size="xs" color="grey-6" />
                    </q-item-section>
                  </q-item>
                </q-list>
                <div v-else class="text-center text-grey-5 italic q-py-md">
                  Tidak ada dokumen lampiran pendukung.
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { db, storage } from 'src/boot/firebase'
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  where,
  getDocs,
} from 'firebase/firestore'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'src/stores/auth'

const $q = useQuasar()
const authStore = useAuthStore()

// ============================================================================
// PERMISSIONS / ROLES SYSTEM
// ============================================================================
const userData = ref(null)
let unsubUser = null

const SUPER_ROLES = ['super admin', 'superadmin', 'direktur', 'owner']

const isSuperAdmin = computed(() => {
  if (userData.value?.is_super_admin === true) return true
  const jabatan = (userData.value?.jabatan || '').toLowerCase().trim()
  if (jabatan && SUPER_ROLES.includes(jabatan)) return true
  const roleFromAuth = (authStore.user?.role || '').toLowerCase().trim()
  if (roleFromAuth && SUPER_ROLES.includes(roleFromAuth)) return true
  return false
})

/**
 * Cari permission detail untuk menu 'finance/form-pengajuan' dari permissions_detail
 * yang disimpan oleh AksesPage ke field karyawan di Firestore.
 * ID menu di-generate dari path: `_konstruksi_finance/form-pengajuan`
 */
const getMenuPermission = computed(() => {
  if (isSuperAdmin.value) {
    return { lihat: true, buat: true, ubah: true, hapus: true, approve: true }
  }
  const detail = userData.value?.permissions_detail
  if (!detail || !Array.isArray(detail)) {
    // Jika belum dikonfigurasi di AksesPage, izinkan aksi dasar (buat pengajuan sendiri)
    return { lihat: true, buat: true, ubah: true, hapus: false, approve: false }
  }
  // Cari modul konstruksi
  const konstruksiModul = detail.find((m) => m.id === 'konstruksi')
  if (!konstruksiModul || !konstruksiModul.isActive) {
    return { lihat: false, buat: false, ubah: false, hapus: false, approve: false }
  }
  // Cari menu form-pengajuan
  // AksesPage menggunakan: `${route.path}_${child.path}`.replace(/\//g, '_')
  // Untuk /konstruksi + finance/form-pengajuan → '_konstruksi_finance_form-pengajuan'
  const menuEntry = konstruksiModul.menus?.find(
    (menu) =>
      menu.id === '_konstruksi_finance_form-pengajuan' ||
      menu.id?.includes('form-pengajuan') ||
      menu.id?.includes('form_pengajuan'),
  )
  if (!menuEntry) {
    // Menu belum dikonfigurasi — izinkan buat pengajuan sendiri secara default
    return { lihat: true, buat: true, ubah: true, hapus: false, approve: false }
  }
  return {
    lihat: menuEntry.lihat ?? false,
    buat: menuEntry.buat ?? false,
    ubah: menuEntry.ubah ?? false,
    hapus: menuEntry.hapus ?? false,
    approve: menuEntry.approve ?? false,
  }
})

const canCreate = computed(() => getMenuPermission.value.buat)
const canDelete = computed(() => getMenuPermission.value.hapus)

// ============================================================================
// STATE
// ============================================================================
const viewMode = ref('list')
const loading = ref(true)
const submitting = ref(false)
const isEditMode = ref(false)

const rows = ref([])
const searchQuery = ref('')
const statusFilter = ref('ALL')
const selectedData = ref(null)

const allSpk = ref([])
const allProyek = ref([])
const allSupplier = ref([])

let unsubRequests = null
let unsubAllSpk = null

const formDefault = {
  id: null,
  no_request: '',
  tipe_pengajuan: 'Manual',
  tagihan_obj: null,
  tagihan_id: null,
  tagihan_nomor_invoice: '',
  tagihan_kode: '',
  proyek_id: null,
  proyek_nama: '',
  selected_spk: [],
  spk_boq_selection: {},
  vendor_nama: '',
  rek_bank: '',
  rek_nomor: '',
  rek_nama: '',
  nominal: 0,
  tanggal_pengajuan: new Date().toISOString().substr(0, 10),
  tanggal_dibutuhkan: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().substr(0, 10),
  keterangan: '',
  status: 'Pending',
  lampiran: [],
}
const form = ref({ ...formDefault })

// ============================================================================
// COLUMNS CONFIGURATION
// ============================================================================

const columns = [
  {
    name: 'request',
    align: 'left',
    label: 'NO. REQUEST & REF',
    field: 'no_request',
    sortable: true,
  },
  {
    name: 'vendor',
    align: 'left',
    label: 'VENDOR / PENERIMA',
    field: 'vendor_nama',
    sortable: true,
  },
  { name: 'pemohon', align: 'left', label: 'PEMOHON', field: 'pembuat_nama', sortable: true },
  { name: 'nominal', align: 'right', label: 'NOMINAL DIAJUKAN', field: 'nominal', sortable: true },
  {
    name: 'timeline',
    align: 'center',
    label: 'TGL PENGAJUAN',
    field: 'tanggal_pengajuan',
    sortable: true,
  },
  { name: 'status', align: 'center', label: 'STATUS', field: 'status', sortable: true },
  { name: 'aksi', align: 'center', label: 'AKSI', field: 'id' },
]

const fetchRequests = () => {
  // Bersihkan listener lama jika ada
  if (unsubRequests) {
    unsubRequests()
    unsubRequests = null
  }

  loading.value = true
  rows.value = []

  const userEmail = authStore.user?.email
  if (!userEmail) {
    loading.value = false
    return
  }

  let q
  if (isSuperAdmin.value) {
    // Super Admin: lihat semua pengajuan yang berasal dari Form Pengajuan
    q = query(
      collection(db, 'finance_pengajuan_pembayaran'),
      where('source', '==', 'form_pengajuan'),
    )
  } else {
    // User biasa: hanya lihat pengajuan milik sendiri yang dari Form Pengajuan
    q = query(
      collection(db, 'finance_pengajuan_pembayaran'),
      where('source', '==', 'form_pengajuan'),
      where('pembuat_email', '==', userEmail),
    )
  }

  unsubRequests = onSnapshot(q, (snapshot) => {
    rows.value = snapshot.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .sort((a, b) => {
        const tA = a.createdAt?.toMillis?.() || 0
        const tB = b.createdAt?.toMillis?.() || 0
        return tB - tA
      })
    loading.value = false
  })
}

watch(isSuperAdmin, () => {
  fetchRequests()
})

onMounted(async () => {
  // Fetch logged in karyawan details
  const userEmail = authStore.user?.email
  if (userEmail) {
    const qUser = query(collection(db, 'karyawan'), where('email', '==', userEmail))
    let initialFetchDone = false
    unsubUser = onSnapshot(qUser, (snapshot) => {
      if (!snapshot.empty) {
        userData.value = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() }
        // fetchRequests pertama kali setelah userData siap
        if (!initialFetchDone) {
          initialFetchDone = true
          fetchRequests()
        }
      }
    })
  } else {
    // Jika tidak ada email (jarang terjadi), tetap panggil fetchRequests
    fetchRequests()
  }

  // Fetch projects list
  try {
    const snapProj = await getDocs(collection(db, 'proyek'))
    allProyek.value = snapProj.docs.map((d) => ({ id: d.id, nama: d.data().nama, ...d.data() }))
  } catch (error) {
    console.error('Error fetching proyek:', error)
  }

  // Fetch suppliers list
  try {
    const snapSupp = await getDocs(collection(db, 'suppliers'))
    allSupplier.value = snapSupp.docs.map((d) => ({ id: d.id, ...d.data() }))
  } catch (error) {
    console.error('Error fetching suppliers:', error)
  }

  // Fetch SPK
  unsubAllSpk = onSnapshot(collection(db, 'spk_customer'), (snap) => {
    allSpk.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  })
})

onUnmounted(() => {
  if (unsubRequests) unsubRequests()
  if (unsubUser) unsubUser()
  if (unsubAllSpk) unsubAllSpk()
})

// ============================================================================
// COMPUTED / FILTERS
// ============================================================================
const filteredRows = computed(() => {
  let res = rows.value
  if (statusFilter.value !== 'ALL') {
    res = res.filter((r) => r.status === statusFilter.value)
  }
  if (searchQuery.value) {
    const lower = searchQuery.value.toLowerCase()
    res = res.filter(
      (r) =>
        r.no_request?.toLowerCase().includes(lower) ||
        r.vendor_nama?.toLowerCase().includes(lower) ||
        r.tagihan_nomor_invoice?.toLowerCase().includes(lower) ||
        r.pembuat_nama?.toLowerCase().includes(lower),
    )
  }
  return res
})

const countByStatus = (status) => rows.value.filter((r) => r.status === status).length

const totalDanaPending = computed(() =>
  rows.value.filter((r) => r.status === 'Pending').reduce((sum, r) => sum + (r.nominal || 0), 0),
)

// ============================================================================
// SPK / BOQ HELPERS
// ============================================================================
const getSpkById = (id) => {
  const targetId = typeof id === 'object' && id !== null ? id.id : id
  return allSpk.value.find((s) => s.id === targetId)
}

const formatSpkBoqText = (row) => {
  if (!row) return '-'
  const parts = []
  if (row.proyek_nama) {
    parts.push(`Proyek: ${row.proyek_nama}`)
  }
  if (row.selected_spk && row.selected_spk.length > 0) {
    row.selected_spk.forEach((spkId) => {
      const spk = getSpkById(spkId)
      const spkLabel = spk ? spk.nomor_spk || spk.nama_kontrak || spkId : spkId
      let spkPart = `SPK: ${spkLabel}`

      const selection = row.spk_boq_selection?.[spkId]
      if (selection && selection.selected_groups && selection.selected_groups.length > 0) {
        const boqParts = []
        selection.selected_groups.forEach((groupTitle) => {
          const items = selection.selected_items_by_group?.[groupTitle]
          if (items && items.length > 0) {
            const itemTexts = items.map((itemObj) => {
              return typeof itemObj === 'object' && itemObj !== null
                ? itemObj.deskripsi || itemObj
                : itemObj
            })
            boqParts.push(`${groupTitle} (${itemTexts.join(', ')})`)
          } else {
            boqParts.push(groupTitle)
          }
        })
        spkPart += ` [BOQ: ${boqParts.join('; ')}]`
      }
      parts.push(spkPart)
    })
  }
  return parts.length > 0 ? parts.join(' | ') : '-'
}

const currentSpkOptions = computed(() => {
  if (!form.value.proyek_id) return []

  const targetProjId =
    typeof form.value.proyek_id === 'object' && form.value.proyek_id !== null
      ? form.value.proyek_id.id
      : form.value.proyek_id

  return allSpk.value.filter((s) => {
    const spkProjId = s.projectId || s.proyek_id || s.proyek || s.proyekId
    const spkProjIdString =
      typeof spkProjId === 'object' && spkProjId !== null ? spkProjId.id : spkProjId
    return spkProjIdString === targetProjId
  })
})

const getSpkBoqGroups = (spkId) => {
  const spk = getSpkById(spkId)
  if (!spk || !spk.groups) return []
  return spk.groups
}

const getSpkBoqGroupItems = (spkId, groupTitle) => {
  const spk = getSpkById(spkId)
  if (!spk || !spk.groups) return []
  const group = spk.groups.find((g) => g.title === groupTitle)
  return group?.items?.filter((i) => !i.is_header) || []
}

const onProyekSelect = (proyekId) => {
  form.value.selected_spk = []
  form.value.spk_boq_selection = {}

  if (proyekId) {
    const matchedProyek = allProyek.value.find((p) => p.id === proyekId)
    form.value.proyek_nama = matchedProyek ? matchedProyek.nama : ''
  } else {
    form.value.proyek_nama = ''
  }
}

watch(
  () => form.value.selected_spk,
  (newVal) => {
    if (!form.value.spk_boq_selection) {
      form.value.spk_boq_selection = {}
    }
    if (newVal && Array.isArray(newVal)) {
      newVal.forEach((spkId) => {
        const idString = typeof spkId === 'object' && spkId !== null ? spkId.id : spkId
        if (!form.value.spk_boq_selection[idString]) {
          form.value.spk_boq_selection[idString] = {
            selected_groups: [],
            selected_items_by_group: {},
          }
        }
      })
    }
  },
  { immediate: true, deep: true },
)

watch(
  () => form.value.spk_boq_selection,
  (newVal) => {
    if (!newVal) return
    Object.keys(newVal).forEach((spkId) => {
      const spkSelection = newVal[spkId]
      if (spkSelection && spkSelection.selected_groups) {
        if (!spkSelection.selected_items_by_group) {
          spkSelection.selected_items_by_group = {}
        }
        spkSelection.selected_groups.forEach((groupTitle) => {
          if (!spkSelection.selected_items_by_group[groupTitle]) {
            spkSelection.selected_items_by_group[groupTitle] = []
          }
        })
      }
    })
  },
  { deep: true },
)

// ============================================================================
// FORM EVENT HANDLERS & NAVIGATION
// ============================================================================
const generateNoRequest = async () => {
  try {
    const snap = await getDocs(collection(db, 'finance_pengajuan_pembayaran'))
    const count = snap.size + 1
    const padded = count.toString().padStart(3, '0')
    const year = new Date().getFullYear()
    const month = ('0' + (new Date().getMonth() + 1)).slice(-2)
    return `REQ/${year}${month}/${padded}`
  } catch (error) {
    console.error('Gagal men-generate nomor request:', error)
    const padded = (rows.value.length + 1).toString().padStart(3, '0')
    const year = new Date().getFullYear()
    const month = ('0' + (new Date().getMonth() + 1)).slice(-2)
    return `REQ/${year}${month}/${padded}`
  }
}

const openAddForm = async () => {
  isEditMode.value = false
  form.value = JSON.parse(JSON.stringify(formDefault))
  form.value.no_request = await generateNoRequest()
  form.value.tipe_pengajuan = 'Manual'
  viewMode.value = 'form'
}

const openEditForm = (row) => {
  isEditMode.value = true
  form.value = { ...JSON.parse(JSON.stringify(row)) }
  viewMode.value = 'form'
}

const openDetail = (row) => {
  selectedData.value = row
  viewMode.value = 'detail'
  window.scrollTo(0, 0)
}

// ============================================================================
// ATTACHMENT / FILE UPLOAD
// ============================================================================
const addDocRow = () => form.value.lampiran.push({ label: '', url: '', base64: '', fileObj: null })
const removeDocRow = (i) => form.value.lampiran.splice(i, 1)

const processHybridUpload = async (file, pathName) => {
  if (!file) return null
  if (file.size <= 512000) {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result)
    })
  } else {
    const sRef = storageRef(storage, `finance/pengajuan/${Date.now()}_${pathName}`)
    const snap = await uploadBytes(sRef, file)
    return await getDownloadURL(snap.ref)
  }
}

// ============================================================================
// SAVE / SUBMIT / DELETE DATA
// ============================================================================
const updateTagihanStatus = async (tagihanId, status) => {
  if (tagihanId) {
    try {
      await updateDoc(doc(db, 'finance_tagihan', tagihanId), {
        status: status,
        updatedAt: serverTimestamp(),
      })
    } catch (e) {
      console.error(`Gagal update tagihan status by ID ${tagihanId}:`, e)
    }
  }
}

const simpanPengajuan = async () => {
  if (
    !form.value.vendor_nama ||
    !form.value.rek_bank ||
    !form.value.rek_nomor ||
    !form.value.nominal
  ) {
    $q.notify({
      type: 'warning',
      position: 'top',
      icon: 'edit_note',
      message: 'Data belum lengkap!',
      caption: 'Lengkapi Nama Vendor, Bank, No Rekening, dan Nominal.',
      timeout: 3500,
    })
    return
  }

  if (
    form.value.tipe_pengajuan === 'Tagihan Supplier' &&
    (!form.value.tagihan_id || !form.value.tagihan_nomor_invoice)
  ) {
    $q.notify({
      type: 'warning',
      position: 'top',
      icon: 'receipt_long',
      message: 'Tagihan belum dipilih!',
      caption: 'Anda memilih metode Tarik Tagihan. Harap pilih Tagihan Supplier.',
      timeout: 3500,
    })
    return
  }

  submitting.value = true
  $q.loading.show({ message: 'Memproses pengajuan dana...' })

  try {
    for (let item of form.value.lampiran) {
      if (item.fileObj) {
        const result = await processHybridUpload(item.fileObj, item.label || 'Doc')
        if (result.startsWith('http')) {
          item.url = result
          item.base64 = ''
        } else {
          item.base64 = result
          item.url = ''
        }
        delete item.fileObj
      }
    }

    const payload = {
      source: 'form_pengajuan',
      no_request: form.value.no_request,
      tipe_pengajuan: form.value.tipe_pengajuan,
      tagihan_id: form.value.tagihan_id || null,
      tagihan_nomor_invoice: form.value.tagihan_nomor_invoice || '',
      tagihan_kode: form.value.tagihan_kode || '',
      proyek_id: form.value.proyek_id || null,
      proyek_nama: form.value.proyek_nama || '',
      selected_spk: form.value.selected_spk || [],
      spk_boq_selection: form.value.spk_boq_selection || {},
      vendor_nama: form.value.vendor_nama,
      rek_bank: form.value.rek_bank,
      rek_nomor: form.value.rek_nomor,
      rek_nama: form.value.rek_nama,
      nominal: form.value.nominal,
      tanggal_pengajuan: form.value.tanggal_pengajuan,
      tanggal_dibutuhkan: form.value.tanggal_dibutuhkan,
      keterangan: form.value.keterangan,
      lampiran: form.value.lampiran,
      status: form.value.status,
      updatedAt: serverTimestamp(),
      approver_read: false,
      creator_read: true,
      realizer_read: false,
      realized_approved_read: true,
    }

    if (isEditMode.value) {
      payload.status = 'Pending'
      payload.approver_read = false
      await updateDoc(doc(db, 'finance_pengajuan_pembayaran', form.value.id), payload)
    } else {
      payload.createdAt = serverTimestamp()
      payload.status = 'Draft'
      payload.pembuat_id = authStore.user?.uid || ''
      payload.pembuat_email = authStore.user?.email || ''
      payload.pembuat_nama = authStore.user?.nama || 'User'
      await addDoc(collection(db, 'finance_pengajuan_pembayaran'), payload)
    }

    $q.notify({
      type: 'positive',
      position: 'top',
      icon: 'save',
      message: 'Pengajuan berhasil disimpan sebagai Draft!',
      caption: 'Klik tombol Ajukan pada list untuk mengajukan ke atasan.',
      timeout: 4000,
    })
    viewMode.value = 'list'
  } catch (error) {
    console.error(error)
    $q.notify({
      type: 'negative',
      position: 'top',
      icon: 'error',
      message: 'Terjadi kesalahan sistem.',
      caption: 'Gagal mengirim pengajuan. Hubungi administrator.',
      timeout: 4000,
    })
  } finally {
    submitting.value = false
    $q.loading.hide()
  }
}

const confirmHapus = (row) => {
  $q.dialog({
    title: 'Hapus Pengajuan',
    message: `Apakah Anda yakin ingin menghapus pengajuan request ${row.no_request} secara permanen?`,
    cancel: true,
    ok: { color: 'negative', label: 'Hapus', unelevated: true },
  }).onOk(async () => {
    try {
      if (row.tipe_pengajuan === 'Tagihan Supplier' && row.tagihan_id) {
        await updateTagihanStatus(row.tagihan_id, 'Draft')
      }
      await deleteDoc(doc(db, 'finance_pengajuan_pembayaran', row.id))
      $q.notify({
        type: 'positive',
        position: 'top',
        icon: 'delete_forever',
        message: 'Pengajuan berhasil dihapus.',
        timeout: 2500,
      })
    } catch (e) {
      console.error(e)
      $q.notify({
        type: 'negative',
        position: 'top',
        message: 'Gagal menghapus data pengajuan.',
      })
    }
  })
}

// ============================================================================
// UTILITIES
// ============================================================================
const formatDateIndo = (d) => {
  if (!d) return '-'
  return new Date(d).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

const formatCompact = (num) => {
  if (!num) return '0'
  if (num >= 1000000000) return (num / 1000000000).toFixed(2).replace(/\.00$/, '') + ' M'
  if (num >= 1000000) return (num / 1000000).toFixed(2).replace(/\.00$/, '') + ' Jt'
  return num.toLocaleString('id-ID')
}

const getStatusColor = (status) => {
  switch (status) {
    case 'Pending':
      return { bg: 'orange-1', text: 'text-orange-9', icon: 'hourglass_empty' }
    case 'Approved':
      return { bg: 'green-1', text: 'text-positive', icon: 'verified' }
    case 'Rejected':
      return { bg: 'red-1', text: 'text-negative', icon: 'cancel' }
    case 'Cair':
      return { bg: 'blue-1', text: 'text-primary', icon: 'payments' }
    default:
      return { bg: 'grey-2', text: 'text-grey-8', icon: 'info' }
  }
}

const openLink = (url) => {
  if (!url) {
    $q.notify({
      type: 'warning',
      position: 'top',
      icon: 'link_off',
      message: 'Lampiran tidak ditemukan.',
    })
    return
  }
  window.open(url, '_blank')
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
.font-pro {
  font-family: 'Plus Jakarta Sans', sans-serif;
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
.border-subtle {
  border: 1px solid rgba(0, 0, 0, 0.05);
}
.border-bottom-subtle {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}
.border-dashed {
  border: 2px dashed #e0e0e0;
}

/* =============================================
   GRADIENT KPI CARDS (Vibrant Teal / Warm orange / Emerald / Azure Blue)
   ============================================= */
.card-brand-gradient {
  background: linear-gradient(135deg, #36ada3 0%, #1e6e69 100%) !important;
  box-shadow: 0 8px 24px rgba(54, 173, 163, 0.35) !important;
}
.card-orange-gradient {
  background: linear-gradient(135deg, #fb8c00 0%, #e65100 100%) !important;
  box-shadow: 0 8px 24px rgba(230, 81, 0, 0.35) !important;
}
.card-green-gradient {
  background: linear-gradient(135deg, #43a047 0%, #1b5e20 100%) !important;
  box-shadow: 0 8px 24px rgba(27, 94, 32, 0.35) !important;
}
.card-blue-gradient {
  background: linear-gradient(135deg, #0288d1 0%, #01579b 100%) !important;
  box-shadow: 0 8px 24px rgba(1, 87, 155, 0.35) !important;
}

.kpi-card {
  border: 1px solid rgba(255, 255, 255, 0.12);
  transition: all 0.3s ease;
}
.kpi-label {
  font-size: 10px;
  letter-spacing: 0.12em;
  opacity: 0.9;
}
.kpi-icon-wrap {
  background: rgba(255, 255, 255, 0.15) !important;
  border-radius: 12px !important;
  min-width: 56px;
  text-align: center;
}
.kpi-bar-track {
  height: 6px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
  overflow: hidden;
}
.kpi-bar-fill {
  height: 100%;
  background: white;
}

.finance-table :deep(thead tr th) {
  position: sticky;
  top: 0;
  z-index: 1;
  font-weight: 800;
  font-size: 11px;
  letter-spacing: 0.5px;
  padding: 16px;
  background-color: #36ada3 !important;
  color: #ffffff !important;
}
.hover-bg:hover {
  background-color: rgba(54, 173, 163, 0.03) !important;
}
.transition-all {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}
.hover-shadow:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.2) !important;
}
.btn-hover:hover {
  filter: brightness(1.1);
  transform: scale(1.02);
  transition: 0.3s;
}

.animate-fade {
  animation: fadeIn 0.5s ease-out;
}
.animate-fade-up {
  animation: fadeUp 0.5s ease-out both;
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
@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.label-req {
  font-size: 11px;
  font-weight: 800;
  color: #444;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}
.search-input :deep(.q-field__control) {
  border-radius: 30px;
}
.custom-toggle {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-weight: 600;
}
.h-full {
  height: 100%;
}
.font-11 {
  font-size: 11px;
}
.font-10 {
  font-size: 10px;
}
.font-12 {
  font-size: 12px;
}
.font-13 {
  font-size: 13px;
}
.tracking-widest {
  letter-spacing: 0.15em;
}
.leading-relaxed {
  line-height: 1.6;
}

.detail-table {
  width: 100%;
  border-collapse: collapse;
}
.detail-table td {
  padding: 12px 0;
  font-size: 13px;
  border-bottom: 1px solid #f5f5f5;
}
.detail-table tr:last-child td {
  border-bottom: none;
}
.detail-table td:first-child {
  width: 40%;
  color: #666;
  font-weight: 500;
}
.detail-table td:last-child {
  color: #111;
  font-weight: 700;
}
</style>
