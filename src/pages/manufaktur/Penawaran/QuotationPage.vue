<template>
  <q-page class="quotation-page q-pa-md q-pa-md-lg font-pro">
    <div class="hero-shell no-print q-mb-lg animate-fade">
      <div class="hero-glow hero-glow-a"></div>
      <div class="hero-glow hero-glow-b"></div>

      <div class="quotation-hero row items-center q-col-gutter-lg">
        <div class="col-12 col-lg-7">
          <div class="row items-center no-wrap hero-title-wrap">
            <div class="lottie-shell q-mr-md">
              <Vue3Lottie
                :animation-data="quotationAnimation"
                :height="104"
                :width="104"
                :speed="0.9"
                loop
                autoplay
              />
            </div>
            <div>
              <div class="hero-kicker">Manufacturing Commercial Control</div>
              <div class="hero-title">Manajemen Penawaran</div>
              <div class="hero-subtitle">Quotation & commercial bidding manufaktur</div>
            </div>
          </div>
        </div>

        <div class="col-12 col-lg-5">
          <div class="hero-tools row q-col-gutter-sm justify-end items-center">
            <div class="col-12 col-sm-7">
              <q-input
                v-model="filter"
                placeholder="Cari No. Penawaran atau Customer..."
                outlined
                dense
                color="white"
                class="enterprise-search"
              >
                <template v-slot:prepend>
                  <q-icon name="manage_search" />
                </template>
              </q-input>
            </div>
            <div class="col-12 col-sm-auto">
              <q-btn
                v-if="canAction('buat')"
                label="Buat Penawaran Baru"
                icon="add"
                class="hero-action-btn full-width"
                @click="openAddDialog"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="kpi-grid row q-col-gutter-md q-mb-lg no-print">
      <div class="col-12 col-sm-6 col-xl-3">
        <div class="kpi-card kpi-pending">
          <div class="kpi-label">Quotation Pending</div>
          <div class="kpi-value">{{ kpiPending }}</div>
          <div class="kpi-hint">Menunggu approval</div>
        </div>
      </div>
      <div class="col-12 col-sm-6 col-xl-3">
        <div class="kpi-card kpi-approved">
          <div class="kpi-label">Approved Count</div>
          <div class="kpi-value">{{ kpiApproved }}</div>
          <div class="kpi-hint">Sudah disetujui</div>
        </div>
      </div>
      <div class="col-12 col-sm-6 col-xl-3">
        <div class="kpi-card kpi-rejected">
          <div class="kpi-label">Rejected Count</div>
          <div class="kpi-value">{{ kpiRejected }}</div>
          <div class="kpi-hint">Ditolak atau dibatalkan</div>
        </div>
      </div>
      <div class="col-12 col-sm-6 col-xl-3">
        <div class="kpi-card kpi-total">
          <div class="kpi-label">Total Documents</div>
          <div class="kpi-value">{{ kpiTotal }}</div>
          <div class="kpi-hint">Seluruh quotation aktif</div>
        </div>
      </div>
    </div>

    <!-- TABEL DAFTAR PENAWARAN -->
    <q-card flat class="quotation-table-card rounded-20 overflow-hidden no-print">
      <q-table
        :rows="allRows"
        :columns="columns"
        row-key="id"
        flat
        :loading="loading"
        :filter="filter"
        binary-state-sort
        class="approval-table modern-table"
      >
        <template v-slot:header="props">
          <q-tr :props="props" class="table-header-row text-white">
            <q-th
              v-for="col in props.cols"
              :key="col.name"
              :props="props"
              class="text-weight-bold uppercase"
            >
              {{ col.label }}
            </q-th>
          </q-tr>
        </template>

        <template v-slot:body="props">
          <q-tr
            :props="props"
            class="quotation-row cursor-pointer"
            @click="openApproval(props.row)"
          >
            <q-td key="nomor" class="text-weight-bolder text-teal-10">{{ props.row.nomor }}</q-td>
            <q-td key="nama_customer" class="text-weight-bold uppercase">
              {{ props.row.nama_customer }}
            </q-td>
            <q-td key="total_harga" class="text-right text-weight-bolder">
              IDR {{ calculateRowTotal(props.row).toLocaleString() }}
            </q-td>
            <q-td key="status" class="text-center">
              <q-chip
                text-color="white"
                size="sm"
                class="text-weight-bold"
                :color="getStatusColor(props.row.status)"
              >
                {{ props.row.status }}
              </q-chip>
            </q-td>
            <q-td key="aksi" class="text-center" @click.stop>
              <q-btn
                v-if="canAction('hapus')"
                flat
                round
                color="red-10"
                icon="delete"
                size="sm"
                @click="deleteQuotation(props.row)"
              >
                <q-tooltip>Hapus Penawaran</q-tooltip>
              </q-btn>
            </q-td>
          </q-tr>
        </template>
      </q-table>
    </q-card>

    <!-- MODAL: ENTRY PENAWARAN HARGA -->
    <q-dialog v-model="showCreateModal" persistent maximized transition-show="slide-up">
      <q-card class="column no-wrap bg-grey-3">
        <q-toolbar class="bg-white text-teal-10 q-py-md shadow-2 shrink">
          <q-btn flat round dense icon="close" v-close-popup color="grey-7" />
          <q-toolbar-title
            class="text-center text-weight-bolder uppercase tracking-widest font-pro"
          >
            Entry Penawaran Harga
          </q-toolbar-title>
          <q-btn
            unelevated
            color="teal-10"
            label="SIMPAN PENAWARAN"
            @click="saveNewQuotation"
            class="q-px-lg rounded-10 shadow-3"
            :loading="submitting"
          />
        </q-toolbar>

        <q-card-section class="col scroll q-pa-lg text-left text-blue-grey-10">
          <div class="max-width-container mx-auto">
            <!-- SECTION 1: IDENTITAS DOKUMEN, KLIEN, & DOKUMEN PENDUKUNG -->
            <q-card flat bordered class="q-pa-lg rounded-15 bg-white q-mb-md shadow-premium">
              <div class="row items-center q-mb-md border-bottom q-pb-sm">
                <q-icon name="assignment" color="teal-10" size="sm" class="q-mr-sm" />
                <div
                  class="text-subtitle1 text-weight-bolder text-teal-10 uppercase tracking-tight"
                >
                  Identitas & Dokumen Pendukung
                </div>
              </div>

              <div class="row q-col-gutter-xl">
                <!-- Area Logo (Kiri) -->
                <div class="col-12 col-md-3">
                  <div class="text-caption q-mb-sm text-grey-7 uppercase text-weight-bolder">
                    Logo Penawaran
                  </div>
                  <div
                    class="logo-preview-box flex flex-center relative-position bg-grey-1 rounded-15 border-dashed-teal"
                  >
                    <div v-if="form.logo" class="full-width full-height flex flex-center">
                      <q-img
                        :src="form.logo"
                        ratio="16/9"
                        class="rounded-10"
                        fit="contain"
                        style="max-height: 180px"
                      />
                      <q-btn
                        round
                        dense
                        color="red"
                        icon="close"
                        size="xs"
                        class="absolute-top-right q-ma-sm"
                        @click="form.logo = null"
                      />
                    </div>
                    <div
                      v-else
                      class="column items-center cursor-pointer q-pa-xl"
                      @click="triggerLogoUpload"
                    >
                      <q-icon name="add_photo_alternate" size="xl" color="teal-2" />
                      <div class="text-caption text-grey-6 text-weight-bold q-mt-sm">
                        PILIH LOGO
                      </div>
                    </div>
                  </div>
                  <input
                    type="file"
                    id="logoUpload-v2"
                    hidden
                    accept="image/*"
                    @change="handleLogoUpload"
                  />
                </div>

                <!-- Detail Dokumen (Kanan) -->
                <div class="col-12 col-md-9">
                  <div class="row q-col-gutter-md">
                    <div class="col-12 col-md-6">
                      <div class="field-label">Nama Perusahaan Penerbit</div>
                      <q-input
                        v-model="form.nama_pt"
                        outlined
                        dense
                        readonly
                        bg-color="grey-2"
                        class="rounded-10 font-bold"
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <div class="field-label">Nomor Referensi Quotation</div>
                      <q-input
                        v-model="form.nomor"
                        outlined
                        dense
                        placeholder="016/AAP-QUOT/..."
                        class="rounded-10"
                      />
                    </div>
                    <div class="col-12">
                      <div class="field-label">Pilih Klien / Customer *</div>
                      <q-select
                        v-model="selectedCustomer"
                        outlined
                        dense
                        use-input
                        hide-selected
                        fill-input
                        :options="customerOptions"
                        placeholder="Cari atau pilih nama klien..."
                        @update:model-value="onCustomerSelect"
                        class="rounded-10"
                      >
                        <template v-slot:prepend
                          ><q-icon name="business" color="teal-10"
                        /></template>
                      </q-select>
                    </div>
                    <div class="col-12 col-md-6">
                      <div class="field-label">Lokasi Terbit</div>
                      <q-input
                        v-model="form.lokasi"
                        outlined
                        dense
                        placeholder="Contoh: Bekasi"
                        class="rounded-10"
                      />
                    </div>
                    <div class="col-12 col-md-6">
                      <div class="field-label">Tanggal Dokumen</div>
                      <q-input
                        v-model="form.tanggal"
                        type="date"
                        outlined
                        dense
                        stack-label
                        class="rounded-10"
                      />
                    </div>
                    <div class="col-12 q-mt-sm">
                      <div class="field-label text-teal-10">
                        <q-icon name="attach_file" class="q-mr-xs" /> Dokumen Pendukung (PDF, Word,
                        Excel)
                      </div>
                      <div class="row q-col-gutter-sm items-center">
                        <div class="col">
                          <q-input
                            v-model="form.file_name"
                            outlined
                            dense
                            readonly
                            bg-color="grey-1"
                            class="rounded-10"
                            placeholder="Belum ada file terpilih..."
                          >
                            <template v-slot:append>
                              <q-btn
                                flat
                                round
                                color="red"
                                icon="close"
                                size="sm"
                                v-if="form.file_data"
                                @click="removeDocument"
                              />
                            </template>
                          </q-input>
                        </div>
                        <div class="col-auto">
                          <q-btn
                            unelevated
                            color="teal-10"
                            icon="upload"
                            label="Pilih Dokumen"
                            @click="triggerDocumentUpload"
                            no-caps
                            class="rounded-10 q-px-md"
                          />
                          <input
                            type="file"
                            id="docUpload"
                            hidden
                            accept=".pdf,.doc,.docx,.xls,.xlsx"
                            @change="handleDocumentUpload"
                          />
                        </div>
                      </div>
                    </div>
                    <div class="col-12 q-mt-sm">
                      <div class="field-label text-teal-10">
                        <q-icon name="description" class="q-mr-xs" /> Catatan Tambahan / Analisa
                        Narasi
                      </div>
                      <q-editor
                        v-model="form.analisa_harga"
                        min-height="100px"
                        flat
                        bordered
                        class="rounded-10 bg-grey-1 font-pro"
                        placeholder="Tulis rincian analisa atau catatan teknis..."
                      />
                    </div>
                  </div>
                </div>
              </div>
            </q-card>

            <!-- SECTION 2: RINCIAN PEKERJAAN & MATERIAL -->
            <q-card
              flat
              bordered
              class="rounded-15 overflow-hidden bg-white q-mb-md shadow-premium"
            >
              <div class="row items-center justify-between q-pa-md bg-teal-1 border-bottom">
                <div class="row items-center">
                  <q-icon name="list_alt" color="teal-10" size="xs" class="q-mr-sm" />
                  <div class="text-subtitle2 text-weight-bolder text-teal-10 uppercase">
                    Rincian Pekerjaan & Material
                  </div>
                </div>
                <q-btn
                  label="TAMBAH PEKERJAAN"
                  icon="add"
                  color="teal-10"
                  unelevated
                  size="sm"
                  @click="addRow"
                  no-caps
                  class="rounded-10 q-px-md"
                />
              </div>

              <q-markup-table flat separator="cell" class="quot-entry-table">
                <thead class="bg-grey-2 text-teal-10">
                  <tr class="text-weight-bolder">
                    <th width="40">NO</th>
                    <th width="110">IMAGE</th>
                    <th class="text-left">DESCRIPTION OF WORKS</th>
                    <th width="80">QTY</th>
                    <th width="80">UNIT</th>
                    <th width="150">UNIT PRICE (IDR)</th>
                    <th width="180">TOTAL AMOUNT</th>
                    <th width="50"></th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in form.items" :key="index">
                    <td class="text-center text-weight-bold text-teal-10">{{ index + 1 }}</td>
                    <td class="text-center">
                      <div class="row justify-center">
                        <div v-if="item.image" class="relative-position">
                          <q-img
                            :src="item.image"
                            style="width: 70px; height: 70px"
                            class="rounded-10 border-teal shadow-1"
                            fit="cover"
                          />
                          <q-badge
                            floating
                            color="red"
                            rounded
                            class="cursor-pointer"
                            @click="item.image = null"
                            ><q-icon name="close" size="xs"
                          /></q-badge>
                        </div>
                        <q-btn
                          v-else
                          icon="add_a_photo"
                          flat
                          color="grey-4"
                          @click="triggerFileUpload(index)"
                          class="full-width q-py-md"
                        />
                        <input
                          :id="'fileInput-' + index"
                          type="file"
                          hidden
                          accept="image/*"
                          @change="handleImageUpload($event, index)"
                        />
                      </div>
                    </td>
                    <td>
                      <q-input
                        v-model="item.deskripsi"
                        dense
                        borderless
                        placeholder="Rincian item pekerjaan..."
                        autogrow
                        class="text-weight-bold text-teal-10"
                      />
                    </td>
                    <td>
                      <q-input
                        v-model.number="item.qty"
                        type="number"
                        dense
                        borderless
                        input-class="text-center font-bold"
                      />
                    </td>
                    <td>
                      <q-input
                        v-model="item.satuan"
                        dense
                        borderless
                        input-class="text-center uppercase"
                        placeholder="LS"
                      />
                    </td>
                    <td>
                      <q-input
                        v-model.number="item.harga"
                        type="number"
                        dense
                        borderless
                        prefix="Rp "
                        input-class="text-right font-bold"
                      />
                    </td>
                    <td class="text-right text-weight-bolder text-teal-10 bg-grey-1">
                      Rp
                      {{ ((Number(item.qty) || 0) * (Number(item.harga) || 0)).toLocaleString() }}
                    </td>
                    <td class="text-center">
                      <q-btn
                        icon="delete"
                        color="red-12"
                        flat
                        dense
                        @click="removeRow(index)"
                        v-if="form.items.length > 1"
                      />
                    </td>
                  </tr>
                </tbody>
              </q-markup-table>

              <div class="row justify-end q-pa-lg bg-white">
                <div class="col-12 col-md-5">
                  <div class="row items-center justify-between q-py-sm border-bottom">
                    <div class="text-weight-bold uppercase text-caption text-grey-7">
                      Subtotal Pekerjaan
                    </div>
                    <div class="text-weight-bolder text-teal-10">
                      Rp {{ subtotal.toLocaleString() }}
                    </div>
                  </div>
                  <div class="row items-center justify-between q-py-sm border-bottom">
                    <div class="text-weight-bold uppercase text-caption text-grey-7">
                      PPN / Tax (%)
                    </div>
                    <div class="row items-center no-wrap q-gutter-x-md">
                      <q-input
                        v-model.number="form.tax_rate"
                        type="number"
                        dense
                        outlined
                        bg-color="grey-1"
                        input-class="text-right text-weight-bold"
                        style="width: 70px"
                      />
                      <div class="text-weight-bold text-grey-8 text-right" style="min-width: 140px">
                        Rp {{ taxAmount.toLocaleString() }}
                      </div>
                    </div>
                  </div>
                  <div class="row items-center justify-between q-py-sm border-bottom">
                    <div class="text-weight-bold uppercase text-caption text-grey-7">
                      Lainnya / Transport
                    </div>
                    <q-input
                      v-model.number="form.biaya_lain"
                      type="number"
                      dense
                      outlined
                      bg-color="grey-1"
                      input-class="text-right font-bold"
                      style="width: 140px"
                      prefix="Rp "
                    />
                  </div>
                  <div
                    class="row items-center justify-between q-pa-md bg-teal-10 text-white rounded-10 q-mt-md shadow-premium"
                  >
                    <div class="text-h6 text-weight-bolder uppercase tracking-widest">
                      Grand Total
                    </div>
                    <div class="text-h6 text-weight-bolder">
                      Rp {{ grandTotal.toLocaleString() }}
                    </div>
                  </div>
                </div>
              </div>
            </q-card>

            <!-- SECTION 3: SYARAT & PENGESAHAN -->
            <div class="row q-col-gutter-lg text-left">
              <div class="col-12 col-md-5">
                <q-card
                  flat
                  bordered
                  class="q-pa-md rounded-15 bg-white shadow-premium full-height"
                >
                  <div
                    class="row items-center q-mb-sm text-teal-10 font-bold uppercase border-bottom q-pb-xs"
                  >
                    <q-icon name="rule" class="q-mr-sm" /> Syarat & Kondisi
                  </div>
                  <q-editor
                    v-model="form.syarat"
                    min-height="250px"
                    flat
                    bordered
                    class="rounded-10 font-pro"
                  />
                </q-card>
              </div>
              <div class="col-12 col-md-7">
                <q-card flat bordered class="q-pa-md rounded-15 bg-white shadow-premium">
                  <div
                    class="row items-center q-mb-sm text-teal-10 font-bold uppercase border-bottom q-pb-xs"
                  >
                    <q-icon name="create" class="q-mr-sm" /> Pengesahan (TTD)
                  </div>
                  <div class="text-caption text-grey-7 q-mb-xs uppercase font-bold">
                    Narasi Penutup / TTD Notes
                  </div>
                  <q-editor
                    v-model="form.ttd_notes"
                    min-height="80px"
                    flat
                    bordered
                    class="rounded-10 q-mb-md font-pro"
                  />

                  <div class="row items-center justify-between q-mb-xs">
                    <div class="text-caption text-weight-bolder text-teal-10 uppercase">
                      Penanda Tangan Digital
                    </div>
                    <q-btn
                      icon="add_circle"
                      label="TAMBAH"
                      flat
                      dense
                      color="teal-10"
                      size="sm"
                      @click="addSigner"
                    />
                  </div>
                  <q-markup-table flat bordered dense class="rounded-10 overflow-hidden">
                    <thead class="bg-grey-1 text-teal-10">
                      <tr>
                        <th width="40">NO</th>
                        <th class="text-left">NAMA LENGKAP</th>
                        <th class="text-left">JABATAN</th>
                        <th width="40"></th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(signer, idx) in form.signers" :key="idx">
                        <td class="text-center font-bold text-teal-10">{{ idx + 1 }}</td>
                        <td>
                          <q-input
                            v-model="signer.nama"
                            borderless
                            dense
                            placeholder="Nama..."
                            input-class="text-weight-bolder"
                          />
                        </td>
                        <td>
                          <q-input
                            v-model="signer.jabatan"
                            borderless
                            dense
                            placeholder="Jabatan..."
                          />
                        </td>
                        <td class="text-center">
                          <q-btn
                            icon="delete"
                            color="red"
                            flat
                            dense
                            size="sm"
                            @click="removeSigner(idx)"
                            v-if="form.signers.length > 1"
                          />
                        </td>
                      </tr>
                    </tbody>
                  </q-markup-table>
                </q-card>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- PREVIEW DIALOG (LAYOUT PROFESIONAL SESUAI GAMBAR) -->
    <q-dialog v-model="showPreview" maximized transition-show="fade">
      <q-card class="column no-wrap bg-grey-4">
        <q-toolbar class="bg-white text-teal-10 q-py-sm shadow-2 shrink no-print text-left">
          <q-btn flat round dense icon="arrow_back" v-close-popup color="grey-7" />
          <q-toolbar-title class="text-weight-bold uppercase font-pro"
            >Detail Dokumen Penawaran</q-toolbar-title
          >
          <q-space />
          <q-btn flat round icon="print" color="teal-10" @click="printNow" />
        </q-toolbar>

        <q-card-section class="col scroll flex flex-center q-pa-md">
          <div
            class="bg-white q-pa-xl shadow-2 relative-position letter-paper"
            style="width: 210mm; min-height: 297mm; font-size: 13px; color: #333; line-height: 1.5"
            v-if="selectedData"
          >
            <!-- Header Dokumen: Logo & Title -->
            <div class="row items-start justify-between q-mb-md no-wrap">
              <div class="col-auto">
                <div v-if="selectedData.logo">
                  <q-img
                    :src="selectedData.logo"
                    style="width: 140px; max-height: 90px"
                    fit="contain"
                  />
                </div>
                <q-icon v-else name="factory" color="teal-10" size="80px" />
              </div>
              <div class="col text-right">
                <div
                  class="text-h3 text-weight-thin text-teal-10 tracking-widest uppercase"
                  style="margin-top: -10px"
                >
                  Quotation
                </div>
                <div
                  class="text-weight-bolder text-blue-grey-10 q-mt-sm uppercase"
                  style="font-size: 14px"
                >
                  Nomor: {{ selectedData.nomor }}
                </div>
              </div>
            </div>

            <!-- Informasi Perusahaan Pengirim -->
            <div class="text-left q-mb-lg">
              <div class="text-h6 text-weight-bolder text-teal-10 uppercase leading-none q-mb-xs">
                {{ selectedData.nama_pt }}
              </div>
              <div class="text-caption text-grey-8 font-bold uppercase leading-tight">
                General Construction and General Supply
              </div>
              <div class="text-caption text-grey-7 leading-tight q-mt-xs">
                Komp. Gading Terrace No. 37, Jatiwaringin, Pondok Gede, <br />
                Kota Bekasi - Jawa Barat.
              </div>
            </div>

            <q-separator color="teal-10" size="2px" class="q-mb-xl" />

            <!-- Informasi Klien & Tanggal -->
            <div class="row justify-between q-mb-xl text-left">
              <div class="col-6">
                <div
                  class="text-weight-bolder text-teal-10 q-mb-sm uppercase"
                  style="font-size: 13px"
                >
                  KEPADA YTH :
                </div>
                <div class="text-h5 text-weight-bolder uppercase leading-tight text-blue-grey-10">
                  {{ selectedData.nama_customer }}
                </div>
                <div class="text-grey-7 q-mt-sm font-bold">
                  Di {{ selectedData.lokasi || 'Tempat' }}
                </div>
              </div>
              <div class="col-5 text-right font-bold text-blue-grey-9">
                <div class="row justify-end q-mb-xs">
                  <div class="text-grey-7 q-mr-md" style="width: 100px">Tanggal</div>
                  <div class="text-blue-grey-10">: {{ formatDate(selectedData.tanggal) }}</div>
                </div>
                <div class="row justify-end">
                  <div class="text-grey-7 q-mr-md" style="width: 100px">Perihal</div>
                  <div class="text-blue-grey-10">: Penawaran Harga</div>
                </div>
              </div>
            </div>

            <div class="text-left q-mb-md text-blue-grey-10">
              Bersama surat ini kami mengajukan penawaran harga untuk pekerjaan sebagai berikut:
            </div>

            <!-- Tabel Pekerjaan Utama (Gaya Bersih & Profesional) -->
            <table class="final-pro-table full-width q-mb-xl text-left">
              <thead>
                <tr class="bg-teal-10 text-white uppercase">
                  <th width="40" class="text-center">NO</th>
                  <th width="100" class="text-center">GAMBAR</th>
                  <th class="text-left">DESCRIPTION OF WORKS</th>
                  <th width="60" class="text-center">QTY</th>
                  <th width="60" class="text-center">UNIT</th>
                  <th width="140" class="text-right">UNIT PRICE</th>
                  <th width="160" class="text-right">TOTAL</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(it, i) in selectedData.items" :key="i">
                  <td class="text-center font-bold text-grey-7">{{ i + 1 }}</td>
                  <td class="text-center q-pa-sm">
                    <q-img
                      v-if="it.image"
                      :src="it.image"
                      style="width: 70px; height: 70px"
                      class="rounded-5 shadow-1 border-teal"
                      fit="cover"
                    />
                    <span v-else class="text-grey-4">-</span>
                  </td>
                  <td
                    class="text-left uppercase font-bold text-teal-10"
                    style="font-size: 12px; line-height: 1.4"
                  >
                    {{ it.deskripsi }}
                  </td>
                  <td class="text-center font-bold text-blue-grey-9">{{ it.qty }}</td>
                  <td class="text-center uppercase text-weight-medium text-blue-grey-8">
                    {{ it.satuan }}
                  </td>
                  <td class="text-right text-blue-grey-9">
                    {{ (Number(it.harga) || 0).toLocaleString() }}
                  </td>
                  <td class="text-right font-bold text-teal-10">
                    {{ ((Number(it.qty) || 0) * (Number(it.harga) || 0)).toLocaleString() }}
                  </td>
                </tr>
              </tbody>
              <tfoot class="bg-grey-1 font-bold">
                <tr>
                  <td colspan="6" class="text-right uppercase text-grey-7" style="padding: 8px">
                    Subtotal Amount
                  </td>
                  <td class="text-right text-teal-10" style="padding: 8px">
                    IDR {{ calculateRowTotal(selectedData, 'subtotal').toLocaleString() }}
                  </td>
                </tr>
                <tr v-if="selectedData.tax_rate > 0">
                  <td
                    colspan="6"
                    class="text-right uppercase text-grey-6 text-caption"
                    style="padding: 8px"
                  >
                    PPN / Tax ({{ selectedData.tax_rate }}%)
                  </td>
                  <td class="text-right text-blue-grey-8" style="padding: 8px">
                    IDR {{ calculateRowTotal(selectedData, 'tax').toLocaleString() }}
                  </td>
                </tr>
                <tr v-if="selectedData.biaya_lain > 0">
                  <td
                    colspan="6"
                    class="text-right uppercase text-grey-6 text-caption"
                    style="padding: 8px"
                  >
                    Biaya Lainnya / Transport
                  </td>
                  <td class="text-right text-blue-grey-8" style="padding: 8px">
                    IDR {{ (Number(selectedData.biaya_lain) || 0).toLocaleString() }}
                  </td>
                </tr>
                <tr class="bg-teal-10 text-white">
                  <td
                    colspan="6"
                    class="text-right uppercase tracking-widest text-weight-bolder"
                    style="padding: 12px; font-size: 14px"
                  >
                    Grand Total Amount
                  </td>
                  <td class="text-right text-weight-bolder" style="padding: 12px; font-size: 14px">
                    IDR {{ calculateRowTotal(selectedData).toLocaleString() }}
                  </td>
                </tr>
              </tfoot>
            </table>

            <!-- Syarat & Kondisi -->
            <div class="row q-col-gutter-lg text-left q-mb-xl">
              <div class="col-12">
                <div
                  class="text-weight-bolder text-teal-10 uppercase q-mb-sm font-pro"
                  style="font-size: 12px; border-bottom: 1.5px solid #004d40"
                >
                  Syarat & Kondisi Pembayaran :
                </div>
                <div
                  class="text-caption text-grey-9 custom-html-content"
                  v-html="selectedData.syarat"
                  style="line-height: 1.6"
                ></div>
              </div>
            </div>

            <!-- Penutup & Tanda Tangan -->
            <div class="row justify-between text-left items-end">
              <div class="col-7">
                <div v-if="selectedData.analisa_harga" class="q-mb-md">
                  <div
                    class="text-weight-bolder text-teal-10 uppercase q-mb-xs font-pro"
                    style="font-size: 11px"
                  >
                    Catatan Tambahan :
                  </div>
                  <div
                    class="text-caption text-grey-7 custom-html-content"
                    v-html="selectedData.analisa_harga"
                  ></div>
                </div>
                <div class="text-caption text-blue-grey-9">
                  Demikian penawaran ini kami sampaikan, atas perhatian dan kerjasamanya kami
                  ucapkan terima kasih.
                </div>
              </div>

              <div class="col-5">
                <div
                  class="text-caption text-blue-grey-10 q-mb-md custom-html-content text-center"
                  v-html="selectedData.ttd_notes"
                ></div>
                <div class="row q-col-gutter-md justify-center">
                  <div
                    v-for="(signer, idx) in selectedData.signers"
                    :key="idx"
                    class="col-6 text-center"
                  >
                    <div class="signer-box q-mt-xl">
                      <div class="q-pt-xl q-pb-xs text-weight-bolder text-teal-10">
                        <u class="block uppercase font-pro" style="font-size: 12px">{{
                          signer.nama || '( ........................ )'
                        }}</u>
                      </div>
                      <div
                        class="text-caption text-grey-7 font-bold uppercase"
                        style="font-size: 10px"
                      >
                        {{ signer.jabatan }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Footer Dokumen -->
            <div
              class="absolute-bottom q-pa-xl text-center text-grey-4 no-print"
              style="font-size: 9px; letter-spacing: 1px"
            >
              DOKUMEN INI DIHASILKAN SECARA OTOMATIS OLEH SISTEM ERP MANUFAKTUR PT AGRA ABHINAYA
              PERKASA
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { Vue3Lottie } from 'vue3-lottie'
import quotationAnimation from 'src/assets/animations/Quotation.json'
import { db } from 'src/boot/firebase'
import {
  collection,
  query,
  onSnapshot,
  doc,
  deleteDoc,
  addDoc,
  serverTimestamp,
  orderBy,
  getDocs,
  where,
} from 'firebase/firestore'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'src/stores/auth'

const $q = useQuasar()
const authStore = useAuthStore()
const FONNTE_TOKEN = 'F7DnXR9G9tfsse19hEym'
const DIRECTOR_WA = '081311921434'

const allRows = ref([])
const loading = ref(true)
const submitting = ref(false)
const filter = ref('')
const showCreateModal = ref(false)
const showPreview = ref(false)
const selectedData = ref(null)
const userData = ref(null)
const selectedCustomer = ref(null)
const customerOptions = ref([])
const kpiPending = computed(() => allRows.value.filter((row) => row.status === 'Pending').length)
const kpiApproved = computed(() => allRows.value.filter((row) => row.status === 'Approved').length)
const kpiRejected = computed(() => allRows.value.filter((row) => row.status === 'Rejected').length)
const kpiTotal = computed(() => allRows.value.length)

const formDefault = {
  nama_pt: 'PT AGRA ABHINAYA PERKASA',
  logo: null,
  nomor: '',
  nama_customer: null,
  lokasi: 'Bekasi',
  tanggal: new Date().toISOString().substr(0, 10),
  tax_rate: 11,
  biaya_lain: 0,
  analisa_harga: '',
  file_name: '',
  file_data: null,
  syarat:
    '<ul><li>Uang Muka : 30%</li><li>Sisa Pembayaran : Bertahap</li><li>Berlaku 14 Hari</li></ul>',
  ttd_notes: '<p>Hormat Kami,</p><p><b>PT AGRA ABHINAYA PERKASA</b></p>',
  signers: [{ nama: 'DINDIN NAZMUDIN AKHMAD', jabatan: 'Project Director' }],
  items: [{ image: null, deskripsi: '', qty: 1, satuan: 'LS', harga: 0 }],
}

const form = reactive({ ...formDefault })

const columns = [
  { name: 'nomor', align: 'left', label: 'REFERENCE NO', field: 'nomor', sortable: true },
  {
    name: 'nama_customer',
    align: 'left',
    label: 'CLIENT NAME',
    field: 'nama_customer',
    sortable: true,
  },
  {
    name: 'total_harga',
    align: 'right',
    label: 'AMOUNT (IDR)',
    field: 'grand_total',
    sortable: true,
  },
  { name: 'status', align: 'center', label: 'STATUS', field: 'status' },
  { name: 'aksi', align: 'center', label: 'ACTION' },
]

const subtotal = computed(() => {
  return form.items.reduce((acc, it) => acc + (Number(it.qty) || 0) * (Number(it.harga) || 0), 0)
})

const taxAmount = computed(() => subtotal.value * (Number(form.tax_rate) / 100))
const grandTotal = computed(() => subtotal.value + taxAmount.value + (Number(form.biaya_lain) || 0))

const formatDate = (d) => {
  if (!d) return '-'
  return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

const calculateRowTotal = (row, type = 'grand') => {
  if (!row || !row.items) return 0
  const sub = row.items.reduce(
    (acc, it) => acc + (Number(it.qty) || 0) * (Number(it.harga) || 0),
    0,
  )
  const tax = sub * ((Number(row.tax_rate) || 0) / 100)
  const grand = sub + tax + (Number(row.biaya_lain) || 0)
  if (type === 'subtotal') return sub
  if (type === 'tax') return tax
  return row.grand_total > 0 && type === 'grand' ? row.grand_total : grand
}

const sendQuotationWhatsAppNotification = async (quotation) => {
  try {
    const message = `[AGRA ERP]

Quotation Baru Dibuat

No Quotation:
${quotation.nomor}

Customer:
${quotation.nama_customer}

Total:
IDR ${Number(quotation.grand_total || 0).toLocaleString('id-ID')}

Status:
Pending Approval`

    const body = new FormData()
    body.append('target', DIRECTOR_WA)
    body.append('message', message)

    const response = await fetch('https://api.fonnte.com/send', {
      method: 'POST',
      headers: {
        Authorization: FONNTE_TOKEN,
      },
      body,
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Fonnte notification failed: ${response.status} ${errorText}`)
    }

    console.log('WhatsApp notification sent successfully')
  } catch (err) {
    console.error('Failed to send WhatsApp notification', err)
  }
}

const getStatusColor = (s) => {
  if (s === 'Approved') return 'positive'
  if (s === 'Rejected') return 'negative'
  return 'orange-9'
}

const canAction = (actionType) => {
  if (authStore.user?.role === 'Super Admin') return true
  if (!userData.value?.permissions_detail) return false
  const modulePerm = userData.value.permissions_detail.find((m) => m.id === 'manufaktur')
  if (!modulePerm || !modulePerm.isActive) return false
  const menu = modulePerm.menus.find((m) => m.id === '_manufaktur_penawaran')
  return menu ? menu[actionType] || false : false
}

const openAddDialog = () => {
  Object.assign(form, JSON.parse(JSON.stringify(formDefault)))
  form.nomor = `${(allRows.value.length + 1).toString().padStart(3, '0')}/AAP-QUOT/IV/2026`
  selectedCustomer.value = null
  showCreateModal.value = true
}

const openApproval = (row) => {
  selectedData.value = row
  showPreview.value = true
}

const onCustomerSelect = (val) => {
  form.nama_customer = val
}
const addRow = () => {
  form.items.push({ image: null, deskripsi: '', qty: 1, satuan: 'LS', harga: 0 })
}
const removeRow = (idx) => {
  if (form.items.length > 1) form.items.splice(idx, 1)
}
const addSigner = () => {
  form.signers.push({ nama: '', jabatan: '' })
}
const removeSigner = (idx) => {
  if (form.signers.length > 1) form.signers.splice(idx, 1)
}

const triggerLogoUpload = () => {
  document.getElementById('logoUpload-v2').click()
}
const handleLogoUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      form.logo = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

const triggerDocumentUpload = () => {
  document.getElementById('docUpload').click()
}
const handleDocumentUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    const allowedExtensions = /(\.pdf|\.doc|\.docx|\.xls|\.xlsx)$/i
    if (!allowedExtensions.exec(file.name)) {
      $q.notify({ type: 'negative', message: 'Format file tidak didukung!' })
      return
    }
    form.file_name = file.name
    const reader = new FileReader()
    reader.onload = (e) => {
      form.file_data = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

const removeDocument = () => {
  form.file_name = ''
  form.file_data = null
}
const triggerFileUpload = (index) => {
  document.getElementById('fileInput-' + index).click()
}
const handleImageUpload = (event, index) => {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      form.items[index].image = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

const saveNewQuotation = async () => {
  if (!form.nomor || !form.nama_customer) {
    $q.notify({ type: 'warning', message: 'Nomor dan Customer harus diisi!' })
    return
  }
  try {
    submitting.value = true
    $q.loading.show()
    const finalData = {
      ...JSON.parse(JSON.stringify(form)),
      subtotal: Number(subtotal.value),
      tax_amount: Number(taxAmount.value),
      grand_total: Number(grandTotal.value),
      status: 'Pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }
    await addDoc(collection(db, 'penawaran_manufaktur'), finalData)
    console.log('CALLING WHATSAPP NOTIFICATION')
    await sendQuotationWhatsAppNotification(finalData)
    showCreateModal.value = false
    $q.notify({ type: 'positive', message: 'Berhasil disimpan!' })
  } catch (err) {
    console.error(err)
  } finally {
    submitting.value = false
    $q.loading.hide()
  }
}

const deleteQuotation = (row) => {
  $q.dialog({ title: 'Konfirmasi', message: 'Hapus penawaran ini?', cancel: true }).onOk(
    async () => {
      try {
        await deleteDoc(doc(db, 'penawaran_manufaktur', row.id))
      } catch (err) {
        console.error(err)
      }
    },
  )
}

const printNow = () => {
  window.print()
}

let unsub = null
let unsubUser = null
onMounted(async () => {
  const q = query(collection(db, 'penawaran_manufaktur'), orderBy('updatedAt', 'desc'))
  unsub = onSnapshot(q, (snap) => {
    allRows.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    loading.value = false
  })
  if (authStore.user?.email) {
    const qUser = query(collection(db, 'karyawan'), where('email', '==', authStore.user.email))
    unsubUser = onSnapshot(qUser, (s) => {
      if (!s.empty) userData.value = s.docs[0].data()
    })
  }
  const cSnap = await getDocs(collection(db, 'customer'))
  if (!cSnap.empty) customerOptions.value = cSnap.docs.map((d) => d.data().nama)
})
onUnmounted(() => {
  if (unsub) unsub()
  if (unsubUser) unsubUser()
})
</script>

<style scoped>
.quotation-page {
  min-height: 100vh;
  background:
    radial-gradient(circle at 12% 8%, rgba(34, 197, 94, 0.12), transparent 28%),
    radial-gradient(circle at 84% 12%, rgba(16, 185, 129, 0.1), transparent 26%),
    radial-gradient(circle at 50% 98%, rgba(6, 95, 70, 0.08), transparent 34%),
    linear-gradient(180deg, #f4fbf7 0%, #eef6f1 46%, #f8fbfa 100%);
  color: #10231d;
}
.hero-shell {
  position: relative;
}
.quotation-hero {
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.38);
  border-radius: 28px;
  padding: 28px;
  background:
    linear-gradient(120deg, rgba(2, 83, 64, 0.98), rgba(5, 128, 91, 0.96), rgba(22, 163, 117, 0.94)),
    radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.22), transparent 28%);
  background-size: 220% 220%;
  box-shadow: 0 24px 70px rgba(4, 72, 56, 0.24);
  isolation: isolate;
  animation: gradientMove 12s ease infinite;
}
.quotation-hero::before {
  position: absolute;
  inset: 0;
  content: '';
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.08), transparent 32%);
  pointer-events: none;
}
.hero-glow {
  position: absolute;
  z-index: -1;
  width: 260px;
  height: 260px;
  border-radius: 999px;
  filter: blur(14px);
  opacity: 0.44;
  animation: glowPulse 8s ease-in-out infinite;
}
.hero-glow-a {
  top: -90px;
  left: -80px;
  background: rgba(174, 255, 211, 0.8);
}
.hero-glow-b {
  right: 6%;
  bottom: -130px;
  background: rgba(45, 212, 191, 0.7);
  animation-delay: -3s;
}
.hero-title-wrap {
  min-width: 0;
}
.lottie-shell {
  display: flex;
  width: 104px;
  min-width: 104px;
  height: 104px;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, 0.32);
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.16);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.25), 0 20px 42px rgba(0, 0, 0, 0.16);
  backdrop-filter: blur(12px);
  animation: floatIcon 4.8s ease-in-out infinite;
}
.hero-kicker {
  color: rgba(220, 252, 231, 0.84);
  font-size: 0.76rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}
.hero-title {
  margin-top: 4px;
  color: #ffffff;
  font-size: clamp(1.75rem, 2.6vw, 2.65rem);
  font-weight: 900;
  line-height: 1.05;
  text-shadow: 0 12px 32px rgba(0, 0, 0, 0.18);
}
.hero-subtitle {
  margin-top: 9px;
  max-width: 560px;
  color: rgba(236, 253, 245, 0.86);
  font-size: 1rem;
  font-weight: 500;
}
.hero-tools {
  position: relative;
  z-index: 1;
}
.enterprise-search :deep(.q-field__control) {
  height: 46px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 16px;
  color: #ffffff;
  background: rgba(255, 255, 255, 0.14);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 12px 28px rgba(0, 0, 0, 0.12);
  backdrop-filter: blur(12px);
}
.enterprise-search :deep(.q-field__native),
.enterprise-search :deep(.q-field__prepend) {
  color: #ffffff;
}
.enterprise-search :deep(.q-field__native::placeholder) {
  color: rgba(255, 255, 255, 0.72);
}
.enterprise-search :deep(.q-field__control::before),
.enterprise-search :deep(.q-field__control::after) {
  border: 0;
}
.hero-action-btn {
  min-height: 46px;
  border-radius: 16px;
  color: #064e3b;
  background: #ecfdf5;
  font-weight: 800;
  box-shadow: 0 14px 30px rgba(0, 0, 0, 0.14);
}
.kpi-card {
  position: relative;
  overflow: hidden;
  padding: 18px 18px 16px;
  border: 1px solid rgba(7, 95, 74, 0.1);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.8);
  box-shadow: 0 18px 42px rgba(15, 23, 42, 0.07);
  backdrop-filter: blur(12px);
  transition:
    transform 220ms ease,
    box-shadow 220ms ease,
    border-color 220ms ease;
}
.kpi-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 24px 52px rgba(15, 23, 42, 0.11);
}
.kpi-label {
  color: #64748b;
  font-size: 0.76rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.kpi-value {
  margin-top: 6px;
  color: #062f23;
  font-size: 2rem;
  font-weight: 900;
  line-height: 1;
}
.kpi-hint {
  margin-top: 6px;
  color: #5e6f6a;
  font-size: 0.88rem;
}
.kpi-pending .kpi-value {
  color: #b45309;
}
.kpi-approved .kpi-value {
  color: #047857;
}
.kpi-rejected .kpi-value {
  color: #dc2626;
}
.quotation-table-card {
  border: 1px solid rgba(7, 95, 74, 0.12);
  background: rgba(255, 255, 255, 0.84);
  box-shadow: 0 22px 48px rgba(15, 23, 42, 0.09);
  backdrop-filter: blur(14px);
}
.table-header-row {
  background: linear-gradient(135deg, #064e3b, #047857);
}
.modern-table :deep(.q-table tbody td) {
  height: 62px;
}
.quotation-row {
  transition:
    background-color 180ms ease,
    transform 180ms ease;
}
.quotation-row:hover {
  background: rgba(16, 185, 129, 0.08);
}
@keyframes gradientMove {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
@keyframes glowPulse {
  0%,
  100% { transform: scale(1); }
  50% { transform: scale(1.08); }
}
@keyframes floatIcon {
  0%,
  100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}
.text-teal-10 {
  color: #004d40;
}
.bg-teal-10 {
  background-color: #004d40 !important;
}
.bg-teal-1 {
  background-color: #e0f2f1;
}
.rounded-20 {
  border-radius: 20px;
}
.rounded-15 {
  border-radius: 15px;
}
.rounded-10 {
  border-radius: 10px;
}
.shadow-premium {
  box-shadow: 0 10px 30px -10px rgba(0, 77, 64, 0.1);
}
.border-dashed-teal {
  border: 2px dashed #004d4044;
}
.border-bottom {
  border-bottom: 1px solid #eee;
}
.font-pro {
  font-family: 'Inter', sans-serif;
}
.field-label {
  font-size: 11px;
  font-weight: 800;
  color: #666;
  text-transform: uppercase;
  margin-bottom: 4px;
}
.logo-preview-box {
  width: 100%;
  height: 200px;
  transition: all 0.3s ease;
}
.logo-preview-box:hover {
  background-color: #f0fdfa;
  border-color: #004d40;
}
.quot-entry-table {
  border: 1px solid #eee;
}
.quot-entry-table td {
  border: 1px solid #eee;
  padding: 4px 8px;
}

/* Final Document Styling (Preview & Print) */
.letter-paper {
  box-sizing: border-box;
  font-family: 'Inter', sans-serif;
  color: #1a202c;
}

.final-pro-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 5px;
}
.final-pro-table th,
.final-pro-table td {
  padding: 10px;
  border: 1px solid #cbd5e0;
  vertical-align: middle;
}
.final-pro-table thead th {
  border: 1.5px solid #004d40;
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 0.1em;
}

.custom-html-content :deep(ul) {
  padding-left: 20px;
  margin: 5px 0;
}
.custom-html-content :deep(p) {
  margin: 0;
}

@media print {
  @page {
    size: A4;
    margin: 0;
  }
  .no-print {
    display: none !important;
  }
  .q-dialog__inner {
    padding: 0 !important;
  }
  .letter-paper {
    width: 210mm !important;
    height: 297mm !important;
    margin: 0 !important;
    padding: 15mm !important;
    box-shadow: none !important;
    position: relative !important;
    background: white !important;
  }
}
</style>
