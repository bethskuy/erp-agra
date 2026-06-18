<template>
  <q-page class="bg-page q-pa-md font-pro relative-position">
    <div v-if="poViewMode === 'list'" class="animate-fade page-content-wrapper">
      <!-- HEADER SECTION -->
      <div class="row items-center justify-between q-mb-lg no-print">
        <div class="col-12 col-md-8">
          <div class="text-h4 text-weight-bolder text-brand-primary leading-tight">
            Approval & Pesanan Pembelian
            <span class="text-h5 text-weight-light text-grey-6 block q-mt-xs"
              >Otorisasi Purchase Request & Kendali PO</span
            >
          </div>
          <div class="text-subtitle1 text-grey-7 q-mt-sm">
            Tinjau permintaan material dari lapangan dan terbitkan Purchase Order ke Supplier.
          </div>
        </div>
        <div class="col-12 col-md-auto q-mt-md q-mt-md-none text-right">
          <div class="text-caption text-grey-6 q-mb-xs uppercase tracking-widest font-bold">
            Menunggu Otorisasi
          </div>
          <q-badge color="orange-9" class="q-px-md q-py-xs text-weight-bold shadow-2 rounded-12">
            {{ rows.filter((r) => r.status === 'Pending').length }} Purchase Request
          </q-badge>
        </div>
      </div>

      <!-- TABS NAVIGATION -->
      <div class="q-mb-lg no-print">
        <q-tabs
          v-model="activeTab"
          dense
          class="bg-white text-grey-7 shadow-1 rounded-12 p-1"
          active-color="white"
          active-bg-color="brand-primary"
          indicator-color="transparent"
          align="left"
          narrow-indicator
        >
          <q-tab
            name="pr"
            icon="list_alt"
            label="Purchase Request (PR)"
            class="rounded-12 q-px-lg text-weight-bold"
          />
          <q-tab
            name="po"
            icon="local_shipping"
            label="Purchase Order (PO)"
            class="rounded-12 q-px-lg text-weight-bold"
          />
        </q-tabs>
      </div>

      <!-- TAB PANELS -->
      <q-tab-panels v-model="activeTab" animated class="bg-transparent q-pa-none">
        <!-- ==========================================
           TAB 1: PURCHASE REQUEST (PR)
           ========================================== -->
        <q-tab-panel name="pr" class="q-pa-none">
          <q-card flat bordered class="q-mb-lg shadow-1 rounded-20 bg-white no-print border-subtle">
            <q-card-section class="q-py-md">
              <div class="row items-center justify-between q-col-gutter-md">
                <div class="col-12 col-md-5">
                  <q-input
                    v-model="filter"
                    outlined
                    dense
                    rounded
                    placeholder="Cari No. PR, Proyek, atau Pemohon..."
                    bg-color="white"
                    class="search-input"
                    color="brand-primary"
                  >
                    <template v-slot:prepend>
                      <q-icon name="search" color="brand-primary" />
                    </template>
                    <template v-slot:append v-if="filter">
                      <q-icon name="close" @click="filter = ''" class="cursor-pointer" />
                    </template>
                  </q-input>
                </div>
                <div
                  class="col-12 col-md-auto row items-center justify-end q-col-gutter-md q-mt-sm q-mt-md-none"
                >
                  <div
                    class="col-12 col-md-auto text-caption text-grey-6 text-weight-medium text-center text-md-right"
                  >
                    Total PR:
                    <span class="text-weight-bold text-brand-primary"
                      >{{ (rows || []).length }} Dokumen</span
                    >
                  </div>
                  <div class="col-12 col-sm-auto text-center text-sm-right">
                    <q-btn flat round icon="refresh" color="brand-primary" @click="fetchData" />
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>

          <q-card
            flat
            bordered
            class="rounded-20 shadow-sm overflow-hidden bg-white no-print border-subtle"
          >
            <q-table
              :rows="rows"
              :columns="columns"
              row-key="id"
              flat
              :loading="loading"
              :filter="filter"
              binary-state-sort
              class="approval-table"
            >
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

              <template v-slot:body="props">
                <q-tr
                  :props="props"
                  class="hover-bg transition-all cursor-pointer"
                  @click="openPreview(props.row)"
                >
                  <q-td key="nomor" class="text-weight-bolder text-brand-primary">
                    {{ props.row.nomor }}
                  </q-td>
                  <q-td key="proyek_nama">
                    <div class="text-weight-bold text-blue-grey-9 uppercase">
                      {{ props.row.proyek_nama || props.row.gudang_nama }}
                    </div>
                    <div class="text-caption text-grey-6 italic">
                      Oleh: {{ props.row.pemohon?.nama || props.row.requestor_nama }}
                    </div>
                    <div
                      v-if="props.row.status === 'Rejected'"
                      class="text-negative text-caption font-bold"
                    >
                      Alasan: {{ props.row.alasan_reject || '-' }}
                    </div>
                  </q-td>
                  <q-td key="total_estimasi" class="text-right text-weight-bolder">
                    <span class="text-caption text-grey-6 q-mr-xs">IDR</span>
                    {{ (props.row.total_estimasi || 0).toLocaleString() }}
                  </q-td>
                  <q-td key="status" class="text-center">
                    <q-chip
                      text-color="white"
                      size="sm"
                      class="text-weight-bold shadow-sm"
                      :color="getStatusColor(props.row.status)"
                    >
                      {{ props.row.status }}
                    </q-chip>
                  </q-td>
                  <q-td key="aksi" class="text-center" @click.stop>
                    <div class="row justify-center q-gutter-xs">
                      <template v-if="props.row.status === 'Pending'">
                        <q-btn
                          v-if="canAction('approve')"
                          unelevated
                          rounded
                          color="positive"
                          icon="check"
                          label="Approve"
                          size="sm"
                          class="q-px-md"
                          @click="handleApproval(props.row, 'Approved')"
                        />
                        <q-btn
                          v-if="canAction('approve') || canAction('ubah')"
                          outline
                          rounded
                          color="negative"
                          icon="close"
                          label="Reject"
                          size="sm"
                          class="q-px-md"
                          @click="promptReject(props.row)"
                        />
                      </template>
                      <q-btn
                        flat
                        round
                        color="grey-6"
                        icon="visibility"
                        size="sm"
                        @click="openPreview(props.row)"
                      />
                      <q-btn
                        v-if="canAction('hapus')"
                        flat
                        round
                        color="negative"
                        icon="delete_outline"
                        size="sm"
                        @click="confirmHapusPr(props.row)"
                      >
                        <q-tooltip>Hapus PR</q-tooltip>
                      </q-btn>
                    </div>
                  </q-td>
                </q-tr>
              </template>
            </q-table>
          </q-card>
        </q-tab-panel>

        <!-- ==========================================
           TAB 2: PURCHASE ORDER (PO) LIST
           ========================================== -->
        <q-tab-panel name="po" class="q-pa-none">
          <div class="animate-fade">
            <q-card
              flat
              bordered
              class="q-mb-lg shadow-1 rounded-20 bg-white no-print border-subtle"
            >
              <q-card-section class="q-py-md">
                <div class="row items-center justify-between q-col-gutter-md">
                  <div class="col-12 col-md-5">
                    <q-input
                      v-model="filterPo"
                      outlined
                      dense
                      rounded
                      placeholder="Cari Dokumen PO..."
                      bg-color="white"
                      class="search-input"
                      color="brand-primary"
                    >
                      <template v-slot:prepend>
                        <q-icon name="search" color="brand-primary" />
                      </template>
                      <template v-slot:append v-if="filterPo">
                        <q-icon name="close" @click="filterPo = ''" class="cursor-pointer" />
                      </template>
                    </q-input>
                  </div>
                  <div
                    class="col-12 col-md-auto row items-center justify-end q-col-gutter-md q-mt-sm q-mt-md-none"
                  >
                    <div
                      class="col-12 col-md-auto text-caption text-grey-6 text-weight-medium text-center text-md-right"
                    >
                      Total PO:
                      <span class="text-weight-bold text-brand-primary"
                        >{{ (poRows || []).length }} Dokumen</span
                      >
                    </div>
                    <div class="col-12 col-sm-auto" v-if="canAction('buat')">
                      <q-btn
                        color="brand-primary"
                        icon="add_circle"
                        label="Buat PO Baru"
                        unelevated
                        rounded
                        no-caps
                        class="shadow-premium btn-hover text-weight-bold q-py-sm q-px-md full-width"
                        @click="openPoForm"
                      />
                    </div>
                  </div>
                </div>
              </q-card-section>
            </q-card>

            <q-card flat bordered class="rounded-20 shadow-sm bg-white" v-if="poRows.length === 0">
              <q-card-section class="text-center q-pa-xl text-grey-6">
                <q-icon
                  name="shopping_cart_checkout"
                  size="80px"
                  class="q-mb-md opacity-50"
                  color="brand-primary"
                />
                <div class="text-h6 text-weight-bold text-brand-primary">
                  Data Purchase Order Belum Tersedia
                </div>
                <div class="text-subtitle2 q-mt-sm">
                  Silakan klik "Buat PO Baru" untuk menerbitkan pesanan ke Supplier.
                </div>
              </q-card-section>
            </q-card>

            <q-card
              flat
              bordered
              class="rounded-20 shadow-sm overflow-hidden bg-white border-subtle"
              v-else
            >
              <q-table
                :rows="poRows"
                :columns="poColumns"
                row-key="id"
                flat
                :loading="loading"
                :filter="filterPo"
                binary-state-sort
                class="approval-table"
              >
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

                <template v-slot:body="props">
                  <q-tr
                    :props="props"
                    class="hover-bg transition-all cursor-pointer"
                    @click="openPoPreview(props.row)"
                  >
                    <q-td key="nomor" class="text-weight-bolder text-brand-primary relative-position">
                      <div class="row items-center q-gutter-x-sm">
                        <span>{{ props.row.nomor }}</span>
                        <q-badge
                          v-if="props.row.po_read === false && (props.row.status === 'Approved' || props.row.status === 'Rejected')"
                          color="red"
                          label="baru"
                          class="text-weight-bold"
                          style="font-size: 10px; padding: 2px 6px; border-radius: 4px;"
                        />
                      </div>
                    </q-td>
                    <q-td key="supplier">
                      <div class="text-weight-bold text-blue-grey-9 uppercase">
                        {{ props.row.kepada_yth }}
                      </div>
                      <div class="text-caption text-grey-6 italic">
                        Proyek: {{ props.row.proyek_nama || '-' }}
                      </div>
                    </q-td>
                    <q-td key="tanggal">
                      {{ formatDateIndo(props.row.tanggal) }}
                    </q-td>
                    <q-td key="grand_total" class="text-right text-weight-bolder">
                      <span class="text-caption text-grey-6 q-mr-xs">IDR</span>
                      {{ (props.row.grand_total || 0).toLocaleString() }}
                    </q-td>

                    <!-- STATUS BADGE -->
                    <q-td key="status" class="text-center">
                      <q-chip
                        text-color="white"
                        size="sm"
                        class="text-weight-bold shadow-sm"
                        :color="getPoStatusColor(props.row.status)"
                        :icon="getPoStatusIcon(props.row.status)"
                      >
                        {{ getPoStatusLabel(props.row.status) }}
                      </q-chip>
                    </q-td>

                    <!-- AKSI -->
                    <q-td key="aksi" class="text-center" @click.stop>
                      <div class="row justify-center items-center q-gutter-xs no-wrap">
                        <!-- Lihat Detail -->
                        <q-btn
                          flat
                          round
                          color="grey-6"
                          icon="visibility"
                          size="sm"
                          @click="openPoPreview(props.row)"
                        >
                          <q-tooltip>Lihat Detail PO</q-tooltip>
                        </q-btn>

                        <!-- Edit PO -->
                        <q-btn
                          v-if="canAction('ubah') && props.row.status === 'Draft'"
                          flat
                          round
                          color="blue-8"
                          icon="edit_note"
                          size="sm"
                          @click="openEditPoForm(props.row)"
                        >
                          <q-tooltip>Edit PO</q-tooltip>
                        </q-btn>

                        <!-- Ajukan (hanya jika belum Submitted / Approved) -->
                        <q-btn
                          v-if="
                            canAction('buat') &&
                            !['Submitted', 'Approved'].includes(props.row.status)
                          "
                          unelevated
                          rounded
                          color="brand-primary"
                          icon="send"
                          label="Ajukan"
                          size="sm"
                          no-caps
                          class="q-px-sm text-weight-bold btn-hover"
                          @click="ajukanPo(props.row)"
                        >
                          <q-tooltip>Ajukan PO ke Approval</q-tooltip>
                        </q-btn>

                        <!-- Badge dihapus karena sudah ada di kolom status -->

                        <!-- Hapus -->
                        <q-btn
                          v-if="canAction('hapus')"
                          flat
                          round
                          color="negative"
                          icon="delete_outline"
                          size="sm"
                          @click="confirmHapusPo(props.row)"
                        >
                          <q-tooltip>Hapus PO</q-tooltip>
                        </q-btn>
                      </div>
                    </q-td>
                  </q-tr>
                </template>
              </q-table>
            </q-card>
          </div>
        </q-tab-panel>
      </q-tab-panels>
    </div>

    <!-- ======================================================================
         VIEW SWITCHER: FORM PEMBUATAN PURCHASE ORDER (PO)
         ====================================================================== -->
    <div v-else-if="poViewMode === 'form'" class="animate-fade page-content-wrapper">
      <div class="row items-center justify-between q-col-gutter-md q-mb-lg">
        <div class="col-12 col-md-auto row items-center no-wrap">
          <q-btn
            flat
            round
            icon="arrow_back"
            color="brand-primary"
            @click="poViewMode = 'list'"
            class="q-mr-md bg-white shadow-1 flex-shrink-0"
          />
          <div>
            <div
              class="text-h5 text-weight-black text-brand-primary uppercase letter-spacing-1 leading-tight"
            >
              Penerbitan Purchase Order
            </div>
            <div class="text-subtitle1 text-grey-7 q-mt-xs">
              Isi formulir pengadaan barang ke Supplier
            </div>
          </div>
        </div>
        <div class="col-12 col-md-auto">
          <q-btn
            unelevated
            color="brand-primary"
            icon="save"
            label="SIMPAN DOKUMEN PO"
            :loading="submitting"
            @click="savePo"
            class="rounded-20 q-px-xl text-weight-bold shadow-premium btn-hover full-width"
          />
        </div>
      </div>

      <div class="row q-col-gutter-lg">
        <!-- KOLOM KIRI: KONFIGURASI DOKUMEN & SUPPLIER -->
        <div class="col-12 col-md-5">
          <!-- Kop Surat -->
          <q-card flat bordered class="rounded-20 q-mb-lg bg-white shadow-1 border-subtle">
            <q-card-section
              class="bg-brand-light q-py-sm text-brand-primary text-weight-bold flex items-center border-bottom-subtle"
            >
              <q-icon name="apartment" class="q-mr-xs" size="sm" /> KOP SURAT PERUSAHAAN
            </q-card-section>
            <q-card-section class="q-pa-lg">
              <div class="q-gutter-y-md">
                <div>
                  <div class="label-req q-mb-xs">Logo Dokumen (Tersimpan Otomatis)</div>
                  <q-file
                    outlined
                    dense
                    v-model="tempLogoPo"
                    label="Upload Logo..."
                    accept="image/*"
                    @update:model-value="handleLogoUploadPo"
                    bg-color="white"
                    color="brand-primary"
                  >
                    <template v-slot:prepend><q-icon name="cloud_upload" /></template>
                    <template v-slot:append v-if="poForm.logoUrl"
                      ><q-avatar size="24px" class="bg-grey-2"
                        ><img :src="poForm.logoUrl" /></q-avatar
                    ></template>
                  </q-file>
                </div>
                <div>
                  <div class="label-req q-mb-xs">Nama Perusahaan</div>
                  <q-input
                    outlined
                    dense
                    v-model="poForm.nama_pt"
                    bg-color="white"
                    class="text-weight-bold"
                    color="brand-primary"
                  />
                </div>
                <div>
                  <div class="label-req q-mb-xs">Slogan / Keterangan</div>
                  <q-input
                    outlined
                    dense
                    v-model="poForm.slogan_pt"
                    bg-color="white"
                    color="brand-primary"
                  />
                </div>
              </div>
            </q-card-section>
          </q-card>

          <!-- Identitas Tujuan (Supplier) -->
          <q-card flat bordered class="rounded-20 q-mb-lg bg-white shadow-1 border-subtle">
            <q-card-section
              class="bg-brand-light q-py-sm text-brand-primary text-weight-bold flex items-center border-bottom-subtle"
            >
              <q-icon name="local_shipping" class="q-mr-xs" size="sm" /> KEPADA YTH (SUPPLIER)
            </q-card-section>
            <q-card-section class="q-pa-lg">
              <div class="q-gutter-y-md">
                <div>
                  <div class="label-req q-mb-xs text-primary">Tarik Data Master Supplier</div>
                  <q-select
                    outlined
                    dense
                    v-model="poForm.supplier"
                    :options="optSupplier"
                    option-label="nama"
                    :placeholder="poForm.supplier ? '' : 'Pilih Supplier...'"
                    bg-color="brand-light"
                    color="brand-primary"
                    use-input
                    behavior="menu"
                    @filter="filterSupplier"
                    @update:model-value="onSupplierSelect"
                  />
                </div>
                <div>
                  <div class="label-req q-mb-xs">To (Nama Perusahaan / Toko)</div>
                  <q-input
                    outlined
                    dense
                    v-model="poForm.kepada_yth"
                    bg-color="white"
                    class="text-weight-bold uppercase"
                    color="brand-primary"
                  />
                </div>
                <div>
                  <div class="label-req q-mb-xs">Address (Alamat)</div>
                  <q-input
                    outlined
                    dense
                    type="textarea"
                    rows="2"
                    v-model="poForm.alamat_supplier"
                    bg-color="white"
                    color="brand-primary"
                  />
                </div>
                <div>
                  <div class="label-req q-mb-xs">Attn (UP / Kontak Person)</div>
                  <q-input
                    outlined
                    dense
                    v-model="poForm.attn_supplier"
                    bg-color="white"
                    color="brand-primary"
                  />
                </div>
              </div>
            </q-card-section>
          </q-card>

          <!-- Referensi PR & Proyek -->
          <q-card flat bordered class="rounded-20 bg-white shadow-1 border-subtle">
            <q-card-section
              class="bg-brand-light q-py-sm text-brand-primary text-weight-bold flex items-center border-bottom-subtle"
            >
              <q-icon name="receipt_long" class="q-mr-xs" size="sm" /> DETAIL PEMBELIAN (PURCHASE
              DETAIL)
            </q-card-section>
            <q-card-section class="q-pa-lg">
              <div class="q-gutter-y-md">
                <div class="row q-col-gutter-md">
                  <div class="col-6">
                    <div class="label-req q-mb-xs">Nomor PO (Otomatis)</div>
                    <q-input
                      outlined
                      dense
                      v-model="poForm.nomor"
                      readonly
                      bg-color="grey-2"
                      class="text-weight-bold text-brand-primary"
                      color="brand-primary"
                    />
                  </div>
                  <div class="col-6">
                    <div class="label-req q-mb-xs">Tanggal Terbit PO</div>
                    <q-input
                      outlined
                      dense
                      type="date"
                      v-model="poForm.tanggal"
                      bg-color="white"
                      color="brand-primary"
                    />
                  </div>
                </div>
                <div>
                  <div class="label-req q-mb-xs text-primary">Tarik Data dari PR (Approved)</div>
                  <q-select
                    outlined
                    dense
                    v-model="poForm.referensi_pr"
                    :options="optPr"
                    option-label="nomor"
                    placeholder="Pilih PR untuk ditarik itemnya..."
                    bg-color="brand-light"
                    color="brand-primary"
                    behavior="menu"
                    @update:model-value="onPrSelect"
                  >
                    <template v-slot:option="scope">
                      <q-item v-bind="scope.itemProps">
                        <q-item-section>
                          <q-item-label class="text-weight-bold">{{
                            scope.opt.nomor
                          }}</q-item-label>
                          <q-item-label caption>{{
                            scope.opt.proyek_nama || scope.opt.gudang_nama
                          }}</q-item-label>
                        </q-item-section>
                      </q-item>
                    </template>
                  </q-select>
                </div>

                <div v-if="poForm.proyek_nama">
                  <div class="label-req q-mb-xs">Untuk Proyek / Gudang</div>
                  <q-input
                    outlined
                    dense
                    v-model="poForm.proyek_nama"
                    readonly
                    bg-color="grey-2"
                    class="text-weight-bold uppercase"
                    color="brand-primary"
                  />
                </div>

                <div v-if="poForm.no_spk">
                  <div class="label-req q-mb-xs">NO. REFF (SPK PROJECT)</div>
                  <q-input
                    outlined
                    dense
                    v-model="poForm.no_spk"
                    readonly
                    bg-color="grey-2"
                    class="text-weight-bold uppercase"
                    color="brand-primary"
                  />
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- KOLOM KANAN: DAFTAR BARANG & KETENTUAN -->
        <div class="col-12 col-md-7">
          <q-card
            flat
            bordered
            class="rounded-20 q-mb-lg bg-white shadow-1 overflow-hidden border-subtle"
          >
            <q-toolbar class="bg-brand-primary text-white q-py-sm">
              <q-icon name="list" class="q-mr-md" />
              <div class="text-weight-bold uppercase">DAFTAR PESANAN BARANG (ITEMS)</div>
              <q-space />
              <q-btn
                flat
                dense
                icon="add"
                label="Tambah Baris"
                @click="addPoItem"
                no-caps
                class="text-weight-bold rounded-12 q-px-md hover-blue-btn"
              />
            </q-toolbar>

            <q-markup-table flat separator="cell" class="po-entry-table">
              <thead class="bg-brand-light text-brand-primary">
                <tr>
                  <th width="40">NO</th>
                  <th class="text-left">ITEM DESCRIPTION</th>
                  <th width="80">QTY</th>
                  <th width="80">SATUAN</th>
                  <th width="150" class="text-right">UNIT PRICE</th>
                  <th width="150" class="text-right">AMOUNT</th>
                  <th width="40"></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, idx) in poForm.items" :key="idx">
                  <td class="text-center font-bold text-grey-6">{{ idx + 1 }}</td>
                  <td>
                    <q-input
                      borderless
                      dense
                      v-model="item.nama_barang"
                      placeholder="Nama Barang..."
                      class="text-weight-bold uppercase"
                      color="brand-primary"
                    />
                    <q-input
                      borderless
                      dense
                      v-model="item.desc"
                      placeholder="Deskripsi Tambahan (Opsional)..."
                      class="text-caption"
                      color="brand-primary"
                    />
                  </td>
                  <td>
                    <q-input
                      borderless
                      dense
                      type="number"
                      v-model.number="item.qty"
                      input-class="text-center text-weight-bold"
                      color="brand-primary"
                    />
                  </td>
                  <td>
                    <q-input
                      borderless
                      dense
                      v-model="item.satuan"
                      input-class="text-center uppercase"
                      color="brand-primary"
                    />
                  </td>
                  <td>
                    <q-input
                      borderless
                      dense
                      type="number"
                      v-model.number="item.harga_satuan"
                      input-class="text-right"
                      color="brand-primary"
                    />
                  </td>
                  <td class="text-right text-weight-bold text-brand-primary bg-brand-light">
                    Rp {{ ((item.qty || 0) * (item.harga_satuan || 0)).toLocaleString() }}
                  </td>
                  <td class="text-center">
                    <q-btn
                      flat
                      round
                      icon="delete"
                      color="negative"
                      size="xs"
                      @click="poForm.items.splice(idx, 1)"
                    />
                  </td>
                </tr>
                <tr v-if="poForm.items.length === 0">
                  <td colspan="7" class="text-center q-pa-xl text-grey-5 italic">
                    Tarik data dari PR atau klik Tambah Baris
                  </td>
                </tr>
              </tbody>
              <tfoot class="bg-grey-1" v-if="poForm.items.length > 0">
                <tr>
                  <td colspan="5" class="text-right text-weight-bold">Subtotal</td>
                  <td class="text-right text-weight-bold text-brand-primary">
                    Rp {{ calculatePoTotal().toLocaleString() }}
                  </td>
                  <td></td>
                </tr>
                <tr>
                  <td colspan="5" class="text-right text-weight-bold">
                    Biaya Mobdemob / Lainnya (Rp)
                  </td>
                  <td class="no-padding">
                    <q-input
                      borderless
                      dense
                      type="number"
                      v-model.number="poForm.mobdemob"
                      input-class="text-right text-weight-bold text-orange-9 bg-orange-1 q-px-md"
                      color="brand-primary"
                    />
                  </td>
                  <td></td>
                </tr>
                <tr class="bg-brand-primary text-white">
                  <td
                    colspan="5"
                    class="text-right text-weight-black uppercase tracking-widest text-h6"
                  >
                    Grand Total
                  </td>
                  <td class="text-right text-weight-black text-h6">
                    Rp {{ (calculatePoTotal() + (poForm.mobdemob || 0)).toLocaleString() }}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </q-markup-table>
          </q-card>

          <q-card flat bordered class="rounded-20 bg-white shadow-1 border-subtle">
            <q-card-section
              class="bg-brand-light q-py-sm text-brand-primary text-weight-bold flex items-center border-bottom-subtle"
            >
              <q-icon name="gavel" class="q-mr-xs" size="sm" /> SYARAT & KONDISI SERTA PEMBAYARAN
            </q-card-section>
            <q-card-section class="q-pa-lg">
              <div class="label-req q-mb-xs">Syarat dan Kondisi (Terms & Conditions)</div>
              <q-editor
                v-model="poForm.syarat_kondisi"
                min-height="8rem"
                flat
                bordered
                class="q-mb-md rounded-12"
              />

              <div class="label-req q-mb-xs">Sistem Pembayaran</div>
              <q-editor
                v-model="poForm.sistem_pembayaran"
                min-height="6rem"
                flat
                bordered
                class="q-mb-md rounded-12"
              />

              <div class="label-req q-mb-xs">Pesan Penutup</div>
              <q-input
                outlined
                dense
                type="textarea"
                rows="2"
                v-model="poForm.closing"
                bg-color="white"
                class="q-mb-md"
                color="brand-primary"
              />

              <div class="row q-col-gutter-md">
                <div class="col-4">
                  <div class="label-req q-mb-xs">Dibuat</div>
                  <q-input
                    outlined
                    dense
                    v-model="poForm.prepared_by"
                    bg-color="white"
                    placeholder="Nama pembuat PO..."
                    color="brand-primary"
                    class="q-mb-sm"
                  />
                  <q-input
                    outlined
                    dense
                    v-model="poForm.prepared_by_jabatan"
                    bg-color="white"
                    placeholder="Jabatan (Requestor)"
                    color="brand-primary"
                  />
                </div>
                <div class="col-4">
                  <div class="label-req q-mb-xs">Mengetahui</div>
                  <q-input
                    outlined
                    dense
                    v-model="poForm.checked_by"
                    bg-color="white"
                    placeholder="Nama..."
                    color="brand-primary"
                    class="q-mb-sm"
                  />
                  <q-input
                    outlined
                    dense
                    v-model="poForm.checked_by_jabatan"
                    bg-color="white"
                    placeholder="Jabatan (Project Manager)"
                    color="brand-primary"
                  />
                </div>
                <div class="col-4">
                  <div class="label-req q-mb-xs">Disetujui</div>
                  <q-input
                    outlined
                    dense
                    v-model="poForm.approved_by"
                    bg-color="white"
                    placeholder="Nama..."
                    color="brand-primary"
                    class="q-mb-sm"
                  />
                  <q-input
                    outlined
                    dense
                    v-model="poForm.approved_by_jabatan"
                    bg-color="white"
                    placeholder="Jabatan (Direktur)"
                    color="brand-primary"
                  />
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
      <div class="q-py-xl"></div>
    </div>

    <!-- ======================================================================
         PREVIEW DIALOG: PURCHASE REQUEST (PR)
         ====================================================================== -->
    <q-dialog v-model="showPreview" maximized transition-show="fade" transition-hide="fade">
      <q-card class="column no-wrap bg-grey-4">
        <q-card-section class="col scroll q-pa-none">
          <!-- STICKY TOOLBAR FOR RESPONSIVE SCROLL -->
          <q-toolbar
            class="bg-white text-indigo-10 q-py-sm no-print shadow-2 shrink"
            style="position: sticky; top: 0; z-index: 10; width: 100%"
          >
            <q-btn flat round dense icon="arrow_back" v-close-popup color="indigo-10" />
            <q-toolbar-title class="text-weight-bold ellipsis text-subtitle1">
              PREVIEW DOKUMEN RESMI PR
            </q-toolbar-title>
            <q-space />
            <q-btn
              v-if="selectedData?.status === 'Pending' && canAction('approve')"
              unelevated
              color="positive"
              icon="check_circle"
              :label="$q.screen.lt.sm ? 'APPROVE' : 'APPROVE DOKUMEN'"
              @click="handleApproval(selectedData, 'Approved')"
              rounded
              class="text-weight-bold shadow-4 q-mr-md"
            />
            <q-btn-group unelevated rounded class="shadow-2">
              <q-btn
                color="primary"
                icon="print"
                :label="$q.screen.lt.sm ? '' : 'Cetak'"
                @click="printPage"
                class="q-px-md font-bold"
              />
              <q-btn
                color="red-9"
                icon="picture_as_pdf"
                :label="$q.screen.lt.sm ? '' : 'PDF'"
                @click="exportToPDF"
                class="font-bold"
              />
            </q-btn-group>
          </q-toolbar>

          <div class="q-pa-md q-pa-md-xl flex flex-center preview-container">
            <div id="pr-print-area" class="letter-paper shadow-24" v-if="selectedData">
              <div class="row no-wrap items-center">
                <div v-if="selectedData.logoUrl" class="col-auto q-mr-md">
                  <img :src="selectedData.logoUrl" class="final-kop-img" />
                </div>
                <div class="col text-left">
                  <div class="final-pt-name uppercase">
                    {{ selectedData.nama_pt || 'PT AGRA ABHINAYA PERKASA' }}
                  </div>
                  <div class="final-pt-tagline italic text-grey-8">
                    {{ selectedData.slogan_pt || 'General Construction and General Supply' }}
                  </div>
                </div>
              </div>
              <div class="final-divider"></div>
              <div class="row q-mt-md q-mb-lg text-left doc-meta items-start">
                <div class="col-7">
                  <table class="meta-info-table">
                    <tr>
                      <td class="text-bold label-meta">Kepada Yth</td>
                      <td class="meta-separator">:</td>
                      <td class="text-weight-medium">
                        {{ selectedData.kepada_yth || 'Divisi Purchasing / Procurement' }}
                      </td>
                    </tr>
                    <tr>
                      <td class="text-bold label-meta">Gudang / Project</td>
                      <td class="meta-separator">:</td>
                      <td class="text-weight-bold text-indigo-10 uppercase">
                        {{ selectedData.proyek_nama || selectedData.gudang_nama || 'UMUM' }}
                      </td>
                    </tr>
                    <tr>
                      <td class="text-bold label-meta">No. Reff</td>
                      <td class="meta-separator">:</td>
                      <td>{{ selectedData.no_reff || '-' }}</td>
                    </tr>
                    <tr>
                      <td class="text-bold label-meta">Requestor</td>
                      <td class="meta-separator">:</td>
                      <td class="text-weight-medium uppercase">
                        {{ selectedData.pemohon?.nama || selectedData.requestor_nama }}
                      </td>
                    </tr>
                  </table>
                </div>
                <div class="col-5 text-right">
                  <div class="quotation-title-pro uppercase">PURCHASE REQUEST</div>
                  <div class="quotation-no-pro text-indigo-10 text-bold font-mono q-mb-md">
                    No. Pr : {{ selectedData.nomor }}
                  </div>
                  <div class="row no-wrap justify-end">
                    <div class="text-bold q-mr-md">Tanggal</div>
                    <div class="text-weight-bold">
                      : {{ selectedData.kota || 'Bekasi' }},
                      {{ formatDateIndo(selectedData.tanggal || selectedData.timestamp) }}
                    </div>
                  </div>
                </div>
              </div>
              <div
                class="doc-intro q-mb-sm text-left leading-relaxed"
                v-html="
                  selectedData.introduction ||
                  'Bersama surat ini kami mengajukan permintaan pengadaan material untuk kebutuhan proyek sebagai berikut:'
                "
              ></div>
              <table class="final-pro-table full-width">
                <thead>
                  <tr>
                    <th width="5%">NO</th>
                    <th class="text-left" width="45%">ITEM DESCRIPTION</th>
                    <th width="10%">QTY</th>
                    <th width="10%">UNIT</th>
                    <th class="text-right" width="15%">est UNIT PRICE</th>
                    <th class="text-right" width="15%">est AMOUNT</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(it, i) in selectedData.items" :key="i">
                    <td class="text-center font-bold text-grey-8">{{ i + 1 }}</td>
                    <td class="text-left uppercase text-weight-bold">
                      {{ it.nama_barang || it.deskripsi }}
                    </td>
                    <td class="text-center font-bold">{{ it.qty }}</td>
                    <td class="text-center uppercase text-weight-bold">{{ it.satuan }}</td>
                    <td class="text-right">
                      Rp {{ (it.estimasi_harga || it.est_harga || 0).toLocaleString() }}
                    </td>
                    <td class="text-right text-weight-bolder text-indigo-10">
                      Rp {{ (it.total || 0).toLocaleString() }}
                    </td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr class="row-calculation">
                    <td colspan="5" class="text-right text-bold uppercase">Subtotal Amount</td>
                    <td class="text-right text-bold text-indigo-10" style="white-space: nowrap;">
                      IDR {{ (selectedData.total_estimasi || 0).toLocaleString() }}
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
                    <td class="text-right text-white text-weight-bolder" style="font-size: 13px; white-space: nowrap;">
                      IDR {{ (selectedData.total_estimasi || 0).toLocaleString() }}
                    </td>
                  </tr>
                </tfoot>
              </table>
              <div class="terms-container text-left q-mt-lg">
                <div class="terms-header uppercase">Syarat & Kondisi :</div>
                <div
                  class="terms-content-box leading-relaxed"
                  v-html="selectedData.terms || selectedData.syarat || '-'"
                ></div>
              </div>

              <!-- CLOSING TEXT MOVED OUTSIDE -->
              <div
                class="text-closing-final q-mt-md q-mb-md text-left"
                v-html="
                  selectedData.closing || 'Demikian permintaan ini kami sampaikan, terima kasih.'
                "
              ></div>

              <div class="signature-container text-left q-mt-lg">
                <div class="row justify-end">
                  <div class="col-5 text-center">
                    <div class="q-mb-xs text-body2 uppercase tracking-widest text-bold">
                      Requestor By,
                    </div>

                    <!-- FINAL SIGNATURE & STEMPEL OVERLAY -->
                    <div class="final-sign-space flex flex-center" style="height: 90px">
                      <img
                        v-if="selectedData.stempel_url"
                        :src="selectedData.stempel_url"
                        class="img-stempel"
                      />
                      <img
                        v-if="selectedData.signatureUrl"
                        :src="selectedData.signatureUrl"
                        class="img-signature-clean"
                      />
                      <div
                        v-if="!selectedData.signatureUrl && !selectedData.stempel_url"
                        class="flex flex-center text-grey-4 italic w-full h-full"
                      >
                        Belum ada pengesahan
                      </div>
                    </div>

                    <div class="signer-name-wrapper">
                      <div class="text-signer-final text-weight-black uppercase text-indigo-10">
                        {{
                          selectedData.ttd_nama ||
                          selectedData.requestor_nama ||
                          selectedData.pemohon?.nama
                        }}
                      </div>
                    </div>
                    <div
                      class="text-role-final uppercase text-grey-8 text-caption font-bold block q-mt-xs"
                    >
                      {{ selectedData.ttd_jabatan || selectedData.requestor_jabatan || 'Staff' }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- ======================================================================
         PREVIEW DIALOG: PURCHASE ORDER (PO)
         ====================================================================== -->
    <q-dialog v-model="showPoPreview" maximized transition-show="fade" transition-hide="fade">
      <q-card class="column no-wrap bg-grey-4">
        <q-card-section class="col scroll q-pa-none">
          <!-- STICKY TOOLBAR FOR RESPONSIVE SCROLL -->
          <q-toolbar
            class="bg-white text-indigo-10 q-py-sm no-print shadow-2 shrink"
            style="position: sticky; top: 0; z-index: 10; width: 100%"
          >
            <q-btn flat round dense icon="arrow_back" v-close-popup color="indigo-10" />
            <q-toolbar-title class="text-weight-bold ellipsis text-subtitle1">
              PREVIEW PURCHASE ORDER
            </q-toolbar-title>
            <q-space />

            <!-- Status chip di toolbar preview -->
            <q-chip
              v-if="selectedPo && selectedPo.status !== 'Draft'"
              :color="getPoStatusColor(selectedPo?.status)"
              text-color="white"
              :icon="getPoStatusIcon(selectedPo?.status)"
              class="text-weight-bold q-mr-md shadow-1"
            >
              {{ getPoStatusLabel(selectedPo?.status) }}
            </q-chip>

            <!-- Tombol Ajukan di preview jika belum diajukan -->
            <q-btn
              v-if="
                selectedPo &&
                canAction('buat') &&
                !['Submitted', 'Approved'].includes(selectedPo?.status)
              "
              unelevated
              rounded
              color="brand-primary"
              icon="send"
              :label="$q.screen.lt.sm ? 'Ajukan' : 'Ajukan PO'"
              class="text-weight-bold q-px-lg q-mr-sm shadow-3 btn-hover"
              @click="ajukanPo(selectedPo)"
            />

            <q-btn
              color="red-9"
              unelevated
              rounded
              icon="picture_as_pdf"
              :label="$q.screen.lt.sm ? '' : 'PDF'"
              @click="exportPoToPDF"
              class="font-bold shadow-2 text-white"
            />
          </q-toolbar>

          <div class="q-pa-md q-pa-md-xl flex flex-center preview-container">
            <div id="po-print-area" class="letter-paper shadow-24" v-if="selectedPo">
              <div class="row no-wrap items-center">
                <div class="col-auto q-mr-md" v-if="selectedPo.logoUrl">
                  <img :src="selectedPo.logoUrl" class="final-kop-img" />
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
                  <div
                    style="
                      width: fit-content;
                      margin-left: auto;
                      display: flex;
                      flex-direction: column;
                      align-items: flex-start;
                    "
                  >
                    <div
                      class="quotation-title-pro uppercase font-13 text-indigo-10 q-mb-sm"
                      style="text-align: left;"
                    >
                      PURCHASE ORDER
                    </div>
                    <table class="meta-info-table" style="width: auto; text-align: left;">
                      <tr>
                        <td
                          class="text-bold"
                          style="
                            padding-right: 12px;
                            font-size: 12px;
                            color: #1a237e;
                            min-width: 80px;
                          "
                        >
                          No. PO
                        </td>
                        <td
                          style="padding-right: 8px; font-size: 12px; color: #1a237e; width: 10px"
                        >
                          :
                        </td>
                        <td
                          class="text-weight-bolder text-indigo-10 font-mono"
                          style="font-size: 12px"
                        >
                          {{ selectedPo.nomor }}
                        </td>
                      </tr>
                      <tr>
                        <td class="text-bold" style="padding-right: 12px; min-width: 80px">
                          Tanggal
                        </td>
                        <td style="padding-right: 8px; width: 10px">:</td>
                        <td class="text-weight-bold">{{ formatDateIndo(selectedPo.tanggal) }}</td>
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
                </tbody>
                <tfoot>
                  <tr class="row-calculation">
                    <td colspan="5" class="text-right text-bold uppercase">Subtotal Amount</td>
                    <td class="text-right text-bold text-indigo-10" style="white-space: nowrap;">
                      IDR {{ (selectedPo.total_amount || 0).toLocaleString() }}
                    </td>
                  </tr>
                  <tr class="row-calculation" v-if="selectedPo.mobdemob">
                    <td colspan="5" class="text-right text-bold uppercase">Mobdemob / Lainnya</td>
                    <td class="text-right text-bold text-indigo-10" style="white-space: nowrap;">
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
                    <td class="text-right text-white text-weight-bolder" style="font-size: 13px; white-space: nowrap;">
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

              <div class="signature-container text-left q-mt-lg">
                <div class="row justify-between text-center po-signature">
                  <div class="col-3">
                    <div class="q-mb-xs text-caption uppercase tracking-widest text-weight-bold text-grey-8" style="font-size: 11px;">
                      Dibuat,
                    </div>
                    <div class="final-sign-space flex flex-center" style="height: 60px">
                      <!-- Spacer for signature -->
                    </div>
                    <div class="signer-name-wrapper">
                      <div class="text-signer-final text-weight-bold uppercase text-indigo-10">
                        {{
                          selectedPo.prepared_by ||
                          selectedPo.requested_by ||
                          '..............................'
                        }}
                      </div>
                    </div>
                    <div
                      class="text-role-final uppercase text-grey-8 text-caption font-bold block q-mt-xs"
                    >
                      {{ selectedPo.prepared_by_jabatan || 'Requestor' }}
                    </div>
                  </div>

                  <div class="col-3">
                    <div class="q-mb-xs text-caption uppercase tracking-widest text-weight-bold text-grey-8" style="font-size: 11px;">
                      Mengetahui,
                    </div>
                    <div class="final-sign-space flex flex-center" style="height: 60px">
                      <!-- Spacer for signature -->
                    </div>
                    <div class="signer-name-wrapper">
                      <div class="text-signer-final text-weight-bold uppercase text-indigo-10">
                        {{ selectedPo.checked_by || '..............................' }}
                      </div>
                    </div>
                    <div
                      class="text-role-final uppercase text-grey-8 text-caption font-bold block q-mt-xs"
                    >
                      {{ selectedPo.checked_by_jabatan || 'Project Manager' }}
                    </div>
                  </div>

                  <div class="col-3">
                    <div class="q-mb-xs text-caption uppercase tracking-widest text-weight-bold text-grey-8" style="font-size: 11px;">
                      Disetujui,
                    </div>
                    <div class="final-sign-space flex flex-center" style="height: 60px">
                      <!-- Spacer for signature or checkmark -->
                    </div>
                    <div class="signer-name-wrapper">
                      <div class="text-signer-final text-weight-bold uppercase text-indigo-10">
                        {{ selectedPo.approved_by || '..............................' }}
                      </div>
                    </div>
                    <div
                      class="text-role-final uppercase text-grey-8 text-caption font-bold block q-mt-xs"
                    >
                      {{ selectedPo.approved_by_jabatan || 'Direktur' }}
                    </div>
                  </div>

                  <div class="col-3">
                    <div class="q-mb-xs text-caption uppercase tracking-widest text-weight-bold text-grey-8" style="font-size: 11px;">
                      Approved Supplier,
                    </div>
                    <div class="final-sign-space flex flex-center" style="height: 60px">
                      <!-- Spacer for signature supplier -->
                    </div>
                    <div class="signer-name-wrapper">
                      <div class="text-signer-final text-weight-bold uppercase text-indigo-10">
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
          </div>
        </q-card-section>
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
  doc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
  getDocs,
  setDoc,
  addDoc,
  deleteDoc,
} from 'firebase/firestore'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'src/stores/auth'
import html2pdf from 'html2pdf.js'

// ── Init ──────────────────────────────────────────────────────────────────
const $q = useQuasar()
const authStore = useAuthStore()

// State TABS & View
const activeTab = ref('pr')
const poViewMode = ref('list')

// State PR
const rows = ref([])
const loading = ref(true)
const filter = ref('')
const showPreview = ref(false)
const selectedData = ref(null)

// State PO
const filterPo = ref('')
const poRows = ref([])
const showPoPreview = ref(false)
const selectedPo = ref(null)
const submitting = ref(false)
const tempLogoPo = ref(null)
const optSupplier = ref([])
const allSupplier = ref([])

const poFormDefault = {
  logoUrl: '',
  nama_pt: 'PT AGRA ABHINAYA PERKASA',
  slogan_pt: 'General Construction and General Supply',
  nomor: '',
  kepada_yth: '',
  alamat_supplier: '',
  attn_supplier: '',
  supplier: null,
  tanggal: new Date().toISOString().substr(0, 10),
  referensi_pr: null,
  proyek_nama: '',
  no_spk: '',
  items: [],
  mobdemob: 0,
  syarat_kondisi:
    '1. Operator Ditanggung Penyedia Alat...\n2. Kontrakan Operator Disediakan Penyewa...\n3. Operator Wajib Mengikuti Arahan Dari Penyewa',
  sistem_pembayaran:
    '1. Pembayaran 30 Hari Dari INVOICE Di Terbitkan\n2. PO ini bersifat estimasi.',
  closing:
    'Kami berharap Purchase Order ini dapat memenuhi kebutuhan Kami. Jika ada pertanyaan atau klarifikasi lebih lanjut, jangan ragu untuk menghubungi kami.\nTerima kasih atas perhatiannya.',
  prepared_by: '',
  prepared_by_jabatan: '',
  requested_by: '',
  checked_by: '',
  checked_by_jabatan: '',
  approved_by: '',
  approved_by_jabatan: '',
  approved_supplier: '',
}

const poForm = ref({ ...poFormDefault })
const userData = ref(null)
const config = ref({ kopUrl: '', nama_pt: '', slogan_pt: '' })

let unsubUser = null
let unsubRows = null
let unsubPoRows = null

// ── Columns ───────────────────────────────────────────────────────────────
const columns = [
  { name: 'nomor', align: 'left', label: 'PR NUMBER', field: 'nomor', sortable: true },
  { name: 'proyek_nama', align: 'left', label: 'PROJECT / REQUESTOR', field: 'proyek_nama' },
  {
    name: 'total_estimasi',
    align: 'right',
    label: 'AMOUNT (IDR)',
    field: 'total_estimasi',
    sortable: true,
  },
  { name: 'status', align: 'center', label: 'STATUS', field: 'status' },
  { name: 'aksi', align: 'center', label: 'ACTIONS' },
]

const poColumns = [
  { name: 'nomor', align: 'left', label: 'PO NUMBER', field: 'nomor', sortable: true },
  {
    name: 'supplier',
    align: 'left',
    label: 'SUPPLIER / PROYEK',
    field: 'kepada_yth',
    sortable: true,
  },
  { name: 'tanggal', align: 'left', label: 'TANGGAL', field: 'tanggal', sortable: true },
  {
    name: 'grand_total',
    align: 'right',
    label: 'GRAND TOTAL (IDR)',
    field: 'grand_total',
    sortable: true,
  },
  { name: 'status', align: 'center', label: 'STATUS', field: 'status' },
  { name: 'aksi', align: 'center', label: 'ACTIONS' },
]

// ── Helpers ───────────────────────────────────────────────────────────────
const getStatusColor = (s) =>
  s === 'Approved'
    ? 'positive'
    : s === 'Rejected'
      ? 'negative'
      : s === 'Ordered'
        ? 'teal-10'
        : s === 'Pending'
          ? 'orange-9'
          : 'blue-grey-6'

const getPoStatusColor = (s) =>
  s === 'Approved'
    ? 'positive'
    : s === 'Rejected'
      ? 'negative'
      : s === 'Submitted'
        ? 'orange-9'
        : s === 'Ordered'
          ? 'teal-10'
          : 'blue-grey-5'

const getPoStatusIcon = (s) =>
  s === 'Approved'
    ? 'check_circle'
    : s === 'Rejected'
      ? 'cancel'
      : s === 'Submitted'
        ? 'hourglass_empty'
        : s === 'Ordered'
          ? 'local_shipping'
          : 'draft'

const getPoStatusLabel = (s) =>
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
  if (!d) return ''
  const dateObj = d?.toDate ? d.toDate() : new Date(d)
  if (isNaN(dateObj)) return ''
  return dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

// ── Permission ────────────────────────────────────────────────────────────
const canAction = (actionType) => {
  if (authStore.user?.role === 'Super Admin') return true
  if (!userData.value?.permissions_detail) return false
  const modulePerm = userData.value.permissions_detail.find((m) => m.id === 'konstruksi')
  const menu = modulePerm?.menus.find((m) => m.id === '_konstruksi_pembelian_pesanan')
  return menu ? menu[actionType] || false : false
}

// ── Computed ──────────────────────────────────────────────────────────────
const optPr = computed(() => rows.value.filter((r) => ['Approved', 'Ordered'].includes(r.status)))

// ── Fetch Data ────────────────────────────────────────────────────────────
const fetchData = async () => {
  loading.value = true
  const cSnap = await getDocs(collection(db, 'config'))
  cSnap.forEach((d) => {
    if (d.id === 'perusahaan') config.value = d.data()
  })

  const snapSupp = await getDocs(collection(db, 'suppliers'))
  allSupplier.value = snapSupp.docs.map((d) => ({ id: d.id, ...d.data() }))
  optSupplier.value = [...allSupplier.value]

  unsubRows = onSnapshot(collection(db, 'permintaan_barang'), (snap) => {
    const all = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    rows.value = all
      .filter((it) => it.tipe === 'PURCHASE_REQUEST' && it.status !== 'Draft')
      .sort((a, b) => (b.updatedAt?.seconds || 0) - (a.updatedAt?.seconds || 0))
  })

  unsubPoRows = onSnapshot(collection(db, 'purchase_order'), (snap) => {
    const all = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    poRows.value = all.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
    loading.value = false
  })
}

// ── PO Form ───────────────────────────────────────────────────────────────
const getRomanMonth = () => {
  const romans = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII']
  return romans[new Date().getMonth()]
}

const openPoForm = async () => {
  $q.loading.show()
  try {
    const snapPo = await getDocs(collection(db, 'purchase_order'))
    const nextNum = snapPo.size + 1
    const padded = nextNum.toString().padStart(3, '0')
    const roman = getRomanMonth()
    const year = new Date().getFullYear().toString().slice(-2)
    const generatedNo = `PO-${padded}/AAP/${roman}/${year}`

    poForm.value = {
      ...poFormDefault,
      logoUrl: config.value.kopUrl || '',
      nama_pt: config.value.nama_pt || poFormDefault.nama_pt,
      slogan_pt: config.value.slogan_pt || poFormDefault.slogan_pt,
      nomor: generatedNo,
      prepared_by: userData.value?.nama || authStore.user?.nama || '',
      checked_by: '',
      approved_by: '',
    }
    poViewMode.value = 'form'
  } catch (e) {
    console.error(e)
  } finally {
    $q.loading.hide()
  }
}

const openEditPoForm = (row) => {
  poForm.value = {
    ...poFormDefault,
    ...row,
    id: row.id,
  }
  poViewMode.value = 'form'
}

const handleLogoUploadPo = async (file) => {
  if (!file) return
  const reader = new FileReader()
  reader.readAsDataURL(file)
  reader.onload = async () => {
    try {
      $q.loading.show({ message: 'Menyimpan logo...' })
      poForm.value.logoUrl = reader.result
      await setDoc(doc(db, 'config', 'perusahaan'), { kopUrl: reader.result }, { merge: true })
      config.value.kopUrl = reader.result
      $q.notify({ type: 'positive', message: 'Logo berhasil disimpan permanen.' })
    } catch (e) {
      console.error(e)
    } finally {
      $q.loading.hide()
    }
  }
}

const filterSupplier = (val, update) => {
  update(() => {
    const needle = val.toLowerCase()
    optSupplier.value = allSupplier.value.filter((v) => v.nama?.toLowerCase().includes(needle))
  })
}

const onSupplierSelect = (supp) => {
  if (supp) {
    poForm.value.kepada_yth = supp.nama || ''
    poForm.value.alamat_supplier = supp.alamat || ''
    poForm.value.attn_supplier =
      supp.pic_nama || supp.pic_kontak || supp.kontak_person || supp.pic || ''
    poForm.value.approved_supplier = supp.nama || ''
  } else {
    poForm.value.kepada_yth = ''
    poForm.value.alamat_supplier = ''
    poForm.value.attn_supplier = ''
    poForm.value.approved_supplier = ''
  }
}

const onPrSelect = (prData) => {
  if (prData) {
    poForm.value.proyek_nama = prData.proyek_nama || prData.gudang_nama || ''
    poForm.value.no_spk = prData.no_reff || ''
    poForm.value.requested_by = prData.pemohon?.nama || prData.requestor_nama || ''
    poForm.value.items = prData.items.map((it) => ({
      id_barang: it.id_barang,
      nama_barang: it.nama_barang || it.deskripsi,
      desc: '',
      qty: it.qty,
      satuan: it.satuan,
      harga_satuan: it.estimasi_harga || it.est_harga || 0,
    }))
  } else {
    poForm.value.proyek_nama = ''
    poForm.value.no_spk = ''
    poForm.value.requested_by = ''
    poForm.value.items = []
  }
}

const addPoItem = () => {
  poForm.value.items.push({ nama_barang: '', desc: '', qty: 1, satuan: 'ls', harga_satuan: 0 })
}

const calculatePoTotal = () =>
  poForm.value.items.reduce((sum, item) => sum + (item.qty || 0) * (item.harga_satuan || 0), 0)

const savePo = async () => {
  if (!poForm.value.kepada_yth)
    return $q.notify({ type: 'warning', message: 'Tujuan (Kepada Yth) wajib diisi!' })

  submitting.value = true
  try {
    const payload = {
      ...poForm.value,
      requested_by: poForm.value.requested_by || '',
      approved_supplier: poForm.value.approved_supplier || '',
      no_spk: poForm.value.no_spk || '',
      total_amount: calculatePoTotal(),
      grand_total: calculatePoTotal() + (poForm.value.mobdemob || 0),
      status: 'Draft',
      updatedAt: serverTimestamp(),
    }
    if (poForm.value.referensi_pr) {
      payload.gudang_id =
        poForm.value.referensi_pr.gudang_id || poForm.value.referensi_pr.proyek_id || ''
      payload.proyek_id =
        poForm.value.referensi_pr.proyek_id || poForm.value.referensi_pr.gudang_id || ''
    }
    delete payload.supplier
    delete payload.referensi_pr
    delete payload.id // Hapus field id dari payload

    if (poForm.value.id) {
      // Mode Edit: Update existing document
      await updateDoc(doc(db, 'purchase_order', poForm.value.id), payload)
      $q.notify({ type: 'positive', message: 'Purchase Order berhasil diperbarui!' })
    } else {
      // Mode Baru: Create new document
      payload.createdAt = serverTimestamp()
      await addDoc(collection(db, 'purchase_order'), payload)
      $q.notify({ type: 'positive', message: 'Purchase Order berhasil diterbitkan!' })
    }

    poViewMode.value = 'list'
  } catch (e) {
    console.error(e)
    $q.notify({ type: 'negative', message: 'Gagal menyimpan PO.' })
  } finally {
    submitting.value = false
  }
}

// ── Ajukan PO ke Approval ─────────────────────────────────────────────────
const ajukanPo = (row) => {
  $q.dialog({
    title: 'Ajukan Purchase Order?',
    message: `PO <b>${row.nomor}</b> akan diajukan ke tim approval untuk disetujui. Lanjutkan?`,
    html: true,
    cancel: { flat: true, label: 'Batal', color: 'grey-7' },
    ok: {
      unelevated: true,
      rounded: true,
      label: 'Ya, Ajukan',
      color: 'teal-10',
      class: 'text-weight-bold btn-teal-main',
    },
  }).onOk(async () => {
    $q.loading.show({ message: 'Mengajukan PO...' })
    try {
      await updateDoc(doc(db, 'purchase_order', row.id), {
        status: 'Submitted',
        approver_read: false,
        submitted_at: serverTimestamp(),
        submitted_by: userData.value?.nama || authStore.user?.email || 'Admin',
        updatedAt: serverTimestamp(),
      })

      // Update selectedPo jika sedang di preview
      if (selectedPo.value?.id === row.id) {
        selectedPo.value = { ...selectedPo.value, status: 'Submitted' }
      }

      $q.notify({
        type: 'positive',
        message: `PO ${row.nomor} berhasil diajukan ke approval!`,
        position: 'top',
        timeout: 3500,
        icon: 'send',
      })
    } catch (e) {
      console.error(e)
      $q.notify({ type: 'negative', message: 'Gagal mengajukan PO: ' + e.message })
    } finally {
      $q.loading.hide()
    }
  })
}

// ── Hapus PO ──────────────────────────────────────────────────────────────
const confirmHapusPo = (row) => {
  $q.dialog({
    title: 'Hapus Purchase Order?',
    message: `Menghapus PO Nomor ${row.nomor} secara permanen?`,
    cancel: true,
    ok: { color: 'negative', label: 'Ya, Hapus', unelevated: true },
  }).onOk(async () => {
    try {
      await deleteDoc(doc(db, 'purchase_order', row.id))
      $q.notify({ type: 'positive', message: 'PO telah dihapus' })
    } catch (e) {
      console.error(e)
    }
  })
}

// ── Hapus PR ──────────────────────────────────────────────────────────────
const confirmHapusPr = (row) => {
  $q.dialog({
    title: 'Hapus Purchase Request?',
    message: `Menghapus PR Nomor ${row.nomor} secara permanen?`,
    cancel: true,
    ok: { color: 'negative', label: 'Ya, Hapus', unelevated: true },
  }).onOk(async () => {
    try {
      await deleteDoc(doc(db, 'permintaan_barang', row.id))
      $q.notify({ type: 'positive', message: 'PR telah dihapus' })
    } catch (e) {
      console.error(e)
      $q.notify({ type: 'negative', message: 'Gagal menghapus PR.' })
    }
  })
}

// ── Preview PO ────────────────────────────────────────────────────────────
const openPoPreview = async (row) => {
  selectedPo.value = row
  showPoPreview.value = true

  if (row.po_read === false) {
    try {
      await updateDoc(doc(db, 'purchase_order', row.id), {
        po_read: true,
      })
      row.po_read = true
    } catch (e) {
      console.error('Gagal mengupdate status baca PO:', e)
    }
  }
}

const exportPoToPDF = () => {
  $q.loading.show({ message: 'Generating Professional PO PDF...' })
  setTimeout(() => {
    const e = document.getElementById('po-print-area')
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

      const o = {
        margin: 0,
        filename: `PO_${selectedPo.value.nomor.replace(/\//g, '-')}.pdf`,
        image: { type: 'jpeg', quality: 1 },
        html2canvas: { scale: 3, useCORS: true, letterRendering: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: 'avoid-all' },
      }

      html2pdf()
        .set(o)
        .from(wrapper)
        .save()
        .then(() => {
          wrapper.parentNode.insertBefore(e, wrapper)
          wrapper.parentNode.removeChild(wrapper)
          e.setAttribute('style', originalStyle)
          if (hadShadow) e.classList.add('shadow-24')
          $q.loading.hide()
          $q.notify({ type: 'positive', message: 'PDF Berhasil Terunduh!', position: 'top' })
        })
        .catch(() => {
          wrapper.parentNode.insertBefore(e, wrapper)
          wrapper.parentNode.removeChild(wrapper)
          e.setAttribute('style', originalStyle)
          if (hadShadow) e.classList.add('shadow-24')
          $q.loading.hide()
        })
    } else {
      const o = {
        margin: 0,
        filename: `PO_${selectedPo.value.nomor.replace(/\//g, '-')}.pdf`,
        image: { type: 'jpeg', quality: 1 },
        html2canvas: { scale: 3, useCORS: true, letterRendering: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: 'avoid-all' },
      }
      html2pdf()
        .set(o)
        .from(e)
        .save()
        .then(() => {
          e.setAttribute('style', originalStyle)
          if (hadShadow) e.classList.add('shadow-24')
          $q.loading.hide()
          $q.notify({ type: 'positive', message: 'PDF Berhasil Terunduh!', position: 'top' })
        })
        .catch(() => {
          e.setAttribute('style', originalStyle)
          if (hadShadow) e.classList.add('shadow-24')
          $q.loading.hide()
        })
    }
  }, 400)
}

// ── PR Approval ───────────────────────────────────────────────────────────
const handleApproval = (row, status, alasan = null) => {
  $q.dialog({
    title: 'Konfirmasi Approval',
    message: `Lanjutkan proses dokumen ini ke status ${status}?`,
    cancel: true,
    ok: {
      color: status === 'Approved' ? 'positive' : 'negative',
      unelevated: true,
      label: 'Ya, Proses',
    },
  }).onOk(async () => {
    $q.loading.show({ message: 'Memproses Approval PR...' })
    try {
      const data = {
        status,
        requester_read: false,
        updatedAt: serverTimestamp(),
        approve_nama: userData.value?.nama || 'Admin Logistik',
        approve_jabatan: userData.value?.jabatan || 'Manager',
        approve_at: serverTimestamp(),
      }
      if (alasan) data.alasan_reject = alasan

      await updateDoc(doc(db, 'permintaan_barang', row.id), data)

      showPreview.value = false
      $q.notify({
        type: 'positive',
        message: `PR telah berhasil di-${status.toLowerCase()}.`,
      })
    } catch (e) {
      console.error(e)
      $q.notify({ type: 'negative', message: 'Gagal memproses: ' + e.message })
    } finally {
      $q.loading.hide()
    }
  })
}

const promptReject = (row) => {
  $q.dialog({
    title: 'Penolakan PR',
    message: 'Berikan alasan penolakan atau instruksi:',
    prompt: { model: '', type: 'textarea' },
    cancel: true,
    ok: { color: 'negative', label: 'Reject' },
  }).onOk((a) => handleApproval(row, 'Rejected', a))
}

const openPreview = (row) => {
  selectedData.value = row
  showPreview.value = true
}

const printPage = () => window.print()

const exportToPDF = () => {
  $q.loading.show({ message: 'Generating PDF...' })

  const element = document.getElementById('pr-print-area')
  if (!element || !selectedData.value?.nomor) {
    $q.loading.hide()
    return $q.notify({ type: 'negative', message: 'Dokumen belum siap untuk diekspor.' })
  }

  const opt = {
    margin: 0,
    filename: `PR_${selectedData.value.nomor.replace(/\//g, '-')}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      width: 794,
      windowWidth: 794,
    },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
  }

  html2pdf()
    .set(opt)
    .from(element)
    .save()
    .then(() => {
      $q.loading.hide()
      $q.notify({ type: 'positive', message: 'PDF Berhasil Terunduh!', position: 'top' })
    })
    .catch((err) => {
      $q.loading.hide()
      $q.notify({ type: 'negative', message: 'Gagal export PDF: ' + err.message })
    })
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
  if (unsubUser) unsubUser()
  if (unsubRows) unsubRows()
  if (unsubPoRows) unsubPoRows()
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
.label-req {
  font-size: 11px;
  font-weight: 800;
  color: #444;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}
.tracking-widest {
  letter-spacing: 0.12em;
}
.opacity-50 {
  opacity: 0.5;
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

/* ── Tables ── */
.approval-table :deep(thead tr th) {
  position: sticky;
  top: 0;
  z-index: 1;
  font-weight: 800;
  font-size: 11px;
  letter-spacing: 0.5px;
  padding: 16px;
}
.po-entry-table :deep(thead th) {
  padding: 12px;
  font-weight: 800;
}
.po-entry-table :deep(tbody td) {
  border-bottom: 1px solid #f0f0f0;
  padding: 8px;
}
.no-padding {
  padding: 0 !important;
}

.hover-bg:hover {
  background-color: rgba(54, 173, 163, 0.06) !important;
}
.transition-all {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}
.shadow-premium {
  box-shadow: 0 10px 30px rgba(54, 173, 163, 0.2) !important;
}
.border-bottom {
  border-bottom: 1px solid #eee;
}
.search-input :deep(.q-field__control) {
  border-radius: 30px;
}

/* ── Tabs ── */
.p-1 {
  padding: 4px;
}

/* ── Animation ── */
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

/* ════════════════════════════════════════════════
   PR PREVIEW (tetap indigo)
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
.sign-kop-img {
  height: 60px;
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
.quotation-no-pro {
  font-size: 12px;
  font-weight: 800;
  margin-top: 4px;
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
.label-grey-pro {
  color: #888;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1px;
  margin-bottom: 4px;
}
.client-name-pro {
  font-size: 18px;
  font-weight: 900;
  color: #1a237e;
  margin-bottom: 2px;
}
.text-date-pro {
  font-size: 12px;
  color: #444;
  font-weight: 700;
}
.final-pro-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
  border: 1.5px solid #1a237e;
}
.final-pro-table th {
  background: #1a237e !important;
  color: white !important;
  padding: 10px 8px;
  font-size: 10px;
  font-weight: 900;
  text-align: center;
  border: 1px solid #1a237e;
  text-transform: uppercase;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
.final-pro-table td {
  padding: 8px 10px;
  border: 1px solid #ddd;
  font-size: 12px;
  color: #111;
}
.row-calculation {
  background: #f9fafb !important;
}
.row-calculation td {
  padding: 6px 12px !important;
  border: 1px solid #ddd !important;
  font-size: 10.5px;
}
.row-grand-total {
  background: #1a237e !important;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
.row-grand-total td {
  padding: 12px 12px !important;
  color: white !important;
  border: 1px solid #1a237e !important;
  background: #1a237e;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
.terms-container {
  border: 1.5px solid #1a237e;
  margin-top: 20px;
  border-radius: 4px;
  overflow: hidden;
}
.terms-header {
  background: #1a237e;
  padding: 6px 12px;
  font-weight: 900;
  color: white;
  font-size: 10.5px;
  letter-spacing: 1px;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
  text-transform: uppercase;
}
.terms-content-box {
  padding: 8px 12px;
  font-size: 12px;
  color: #333;
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
.doc-intro {
  font-size: 12px;
}
.text-closing-final {
  font-size: 12px;
  color: #333;
}
.signature-container {
  margin-top: 40px;
}
.po-signature {
  display: flex;
  justify-content: space-between;
  width: 100%;
}
.po-signature .col-3 {
  flex: 1;
  text-align: center;
  max-width: 25%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
}
.po-signature .col-3 > * {
  align-self: center;
}
.final-sign-space {
  position: relative;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0px;
  width: 100%;
}
.signer-name-wrapper {
  margin-top: 0px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
}
.text-signer-final {
  font-size: 12px;
  font-weight: 700;
  color: #1a237e;
  display: block;
  text-align: center;
  word-wrap: break-word;
  white-space: normal;
  width: 180px;
  max-width: 180px;
  line-height: 1.25;
}
.text-role-final {
  font-size: 9.5px;
  margin-top: 2px;
  font-weight: 700;
  color: #666;
  display: block;
  text-align: center;
  line-height: 1.2;
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
/* ════════════════════════════════════════════════
   PO PREVIEW (tetap indigo)
════════════════════════════════════════════════ */
.po-print-container {
  background: white !important;
  width: 210mm;
  min-width: 210mm;
  flex-shrink: 0;
  min-height: 297mm;
  padding: 15mm 20mm;
  margin: 0 auto;
  color: #000 !important;
  font-family: Arial, Helvetica, sans-serif !important;
  line-height: 1.4;
  box-sizing: border-box;
  position: relative;
}
.po-logo {
  height: 60px;
  object-fit: contain;
}
.po-company-name {
  font-size: 20px;
  font-weight: 900;
  color: #1a237e !important;
  margin-bottom: 2px;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
.po-company-slogan {
  font-size: 11px;
  font-weight: 700;
  color: #555 !important;
  text-transform: uppercase;
}
.po-divider {
  height: 3px;
  background: #1a237e !important;
  margin: 10px 0;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
.po-title {
  font-size: 18px;
  font-weight: 900;
  color: #1a237e !important;
  letter-spacing: 1px;
  margin-bottom: 4px;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
.po-no {
  font-size: 12px;
  font-weight: 800;
  color: #000 !important;
}
.po-meta {
  font-size: 12px;
  color: #333 !important;
}
.po-meta-label {
  color: #666 !important;
  font-size: 11px;
  margin-bottom: 4px;
  text-transform: uppercase;
}

.po-table {
  border-collapse: collapse;
  width: 100%;
  margin-top: 15px;
  margin-bottom: 20px;
  border: 1px solid #ccc;
}
.po-table th {
  background: #1a237e !important;
  color: white !important;
  font-size: 11px;
  font-weight: 800;
  padding: 10px 8px;
  border: 1px solid #ccc;
  text-transform: uppercase;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
.po-table td {
  font-size: 12px;
  padding: 8px;
  border: 1px solid #ccc;
  color: #000 !important;
}
.po-table tfoot td {
  padding: 8px;
  border: 1px solid #ccc;
  font-size: 12px;
}
.po-grand-total td {
  background: #1a237e !important;
  color: white !important;
  font-size: 14px;
  font-weight: 900;
  border: 1px solid #1a237e !important;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

.po-terms-box {
  border: 1.5px solid #1a237e !important;
  border-radius: 4px;
  overflow: hidden;
  page-break-inside: avoid;
  margin-bottom: 10px;
}
.po-terms-title {
  background: #1a237e !important;
  color: white !important;
  font-size: 11px;
  font-weight: 800;
  padding: 6px 10px;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
  text-transform: uppercase;
}
.po-terms-content {
  padding: 8px 10px;
  font-size: 11px;
  color: #000 !important;
}
.po-terms-content p {
  margin: 0 0 5px 0;
}
.po-terms-content ol,
.po-terms-content ul {
  margin: 0;
  padding-left: 20px;
}
.po-signature {
  font-size: 12px;
  color: #000 !important;
  page-break-inside: avoid;
}

/* ════════════════════════════════════════════════
   PRINT
════════════════════════════════════════════════ */
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
  .letter-paper,
  .po-print-container {
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
