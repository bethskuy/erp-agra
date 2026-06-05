<template>
  <q-page class="bg-page q-pa-md font-pro relative-position">

    <!-- =====================================================================================
         VIEW 1: DAFTAR CUSTOMER
         ===================================================================================== -->
    <div v-if="viewMode === 'list'" class="animate-fade page-content-wrapper">
      <!-- HEADER SECTION -->
      <div class="row items-center justify-between q-mb-md content-relative">
        <div class="col-12 q-mb-md q-mb-md-none">
          <div class="text-h4 text-weight-bolder text-brand-primary leading-tight">
            Database Customer
            <span class="text-h5 text-weight-light text-grey-6 block q-mt-xs"
              >Klien & Rekanan Bisnis</span
            >
          </div>
          <div class="text-subtitle1 text-grey-7 q-mt-sm">
            Manajemen informasi klien terpusat dengan sistem dokumen hybrid.
          </div>
        </div>
      </div>

      <!-- SEARCH & STATS -->
      <q-card
        flat
        bordered
        class="q-mb-lg shadow-1 rounded-20 bg-white border-subtle content-relative"
      >
        <q-card-section class="q-py-md">
          <div class="row items-center justify-between q-col-gutter-md">
            <div class="col-12 col-md-4">
              <q-input
                v-model="filter"
                outlined
                dense
                rounded
                placeholder="Cari Nama, Email, atau Lokasi..."
                bg-color="white"
                class="search-input"
              >
                <template v-slot:prepend>
                  <q-icon name="search" color="brand-primary" />
                </template>
                <template v-slot:append v-if="filter">
                  <q-icon name="close" @click="filter = ''" class="cursor-pointer" />
                </template>
              </q-input>
            </div>

            <div class="col-12 col-md-auto row items-center justify-end q-col-gutter-md q-mt-sm q-mt-md-none">
              <div
                class="col-12 col-md-auto text-caption text-grey-6 text-weight-medium text-center text-md-right"
              >
                Total Customer:
                <span class="text-weight-bold text-brand-primary">{{ rows.length }} Entitas</span>
              </div>

              <!-- EXPORT DROPDOWN LIST -->
              <div class="col-12 col-sm-auto">
                <q-btn-dropdown
                  unelevated
                  color="white"
                  text-color="brand-primary"
                  icon="ios_share"
                  label="Export Data"
                  class="rounded-12 text-weight-bold shadow-2 full-width"
                >
                  <q-list class="bg-white rounded-borders q-py-sm" style="min-width: 200px">
                    <q-item clickable v-close-popup @click="exportTablePDF" class="hover-blue-btn">
                      <q-item-section avatar>
                        <q-avatar color="red-1" text-color="red-10" icon="picture_as_pdf" size="sm" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label class="text-weight-bold">Download PDF</q-item-label>
                      </q-item-section>
                    </q-item>
                    <q-separator class="q-my-sm" />
                    <q-item clickable v-close-popup @click="exportTableExcel" class="hover-blue-btn">
                      <q-item-section avatar>
                        <q-avatar color="green-1" text-color="green-10" icon="table_view" size="sm" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label class="text-weight-bold">Export Excel</q-item-label>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </q-btn-dropdown>
              </div>

              <!-- REGISTRASI CUSTOMER -->
              <div class="col-12 col-sm-auto" v-if="canAction('buat')">
                <q-btn
                  color="brand-primary"
                  icon="person_add"
                  label="Registrasi Customer"
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

      <!-- TABLE SECTION -->
      <q-card
        flat
        bordered
        class="rounded-20 shadow-sm overflow-hidden bg-white border-subtle content-relative"
      >
        <q-table
          :rows="rows"
          :columns="columns"
          row-key="id"
          flat
          :loading="loading"
          :filter="filter"
          binary-state-sort
          class="customer-table"
          :pagination="{ rowsPerPage: 10 }"
        >
          <!-- Custom Header -->
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

          <!-- Custom Body -->
          <template v-slot:body="props">
            <q-tr
              :props="props"
              class="hover-bg transition-all cursor-pointer"
              @click="openDetail(props.row)"
            >
              <q-td key="nama">
                <div class="row items-center no-wrap">
                  <q-avatar
                    size="36px"
                    color="brand-light"
                    text-color="brand-primary"
                    class="q-mr-md text-weight-bold shadow-sm"
                  >
                    {{ props.row.nama?.charAt(0) }}
                  </q-avatar>
                  <div>
                    <div
                      class="text-weight-bold text-subtitle1 text-blue-grey-10 leading-none q-mb-xs"
                    >
                      {{ props.row.nama }}
                    </div>
                    <div class="text-caption text-grey-6">
                      {{ props.row.kota || 'Lokasi tidak diatur' }}
                    </div>
                  </div>
                </div>
              </q-td>
              <q-td key="email">
                <div class="text-weight-bold text-blue-grey-9">{{ props.row.email || '-' }}</div>
                <div class="text-caption text-brand-teal text-weight-bold">
                  {{ props.row.kontak || '-' }}
                </div>
              </q-td>
              <q-td key="aksi" class="text-center" @click.stop>
                <div class="row justify-center q-gutter-xs">
                  <q-btn
                    v-if="canAction('ubah')"
                    flat
                    round
                    color="brand-primary"
                    icon="edit"
                    size="sm"
                    @click="openEditDialog(props.row)"
                  >
                    <q-tooltip>Edit Data</q-tooltip>
                  </q-btn>
                  <q-btn
                    v-if="canAction('hapus')"
                    flat
                    round
                    color="brand-danger"
                    icon="delete_sweep"
                    size="sm"
                    @click="confirmHapus(props.row)"
                  >
                    <q-tooltip>Hapus Data</q-tooltip>
                  </q-btn>
                  <q-btn
                    flat
                    round
                    color="brand-primary"
                    icon="chevron_right"
                    size="sm"
                    @click="openDetail(props.row)"
                  />
                </div>
              </q-td>
            </q-tr>
          </template>

          <!-- Empty State -->
          <template v-slot:no-data>
            <div class="full-width row flex-center q-pa-xl text-grey-5">
              <q-icon name="people_outline" size="64px" class="q-mb-md" />
              <div class="text-h6 full-width text-center">Belum ada data customer terdaftar</div>
            </div>
          </template>
        </q-table>
      </q-card>
    </div>

    <!-- =====================================================================================
         VIEW 2: FORM REGISTRASI / EDIT (VIEW SWITCHER)
         ==================================================================================== -->
    <div v-else-if="viewMode === 'form'" class="animate-fade page-content-wrapper">
      <div class="row items-center justify-between q-mb-xl">
        <div class="col-12 col-md-8 q-mb-md q-mb-md-none">
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
                {{ isEditMode ? 'PEMBARUAN DATA CUSTOMER' : 'REGISTRASI CUSTOMER BARU' }}
              </div>
              <div class="text-subtitle1 text-grey-7 q-mt-sm">
                Lengkapi formulir informasi profil, PIC, dan perbankan klien.
              </div>
            </div>
          </div>
        </div>
        <div class="col-12 col-md-4">
          <div class="row justify-end">
            <div class="col-12 col-sm-auto">
              <q-btn
                unelevated
                color="brand-primary"
                label="SIMPAN DATA"
                :loading="submitting"
                rounded
                class="full-width q-px-xl text-weight-bold shadow-premium"
                @click="simpanCustomer"
              />
            </div>
          </div>
        </div>
      </div>

      <div class="row justify-center">
        <div class="col-12 col-xl-10">
          <div class="row q-col-gutter-xl">
            <!-- FORM LEFT: PROFILE -->
            <div class="col-12 col-md-6">
              <q-card flat bordered class="rounded-20 q-pa-lg bg-white shadow-1">
                <div
                  class="text-subtitle1 text-brand-primary text-weight-bolder q-mb-lg flex items-center"
                >
                  <q-icon name="person" class="q-mr-sm" size="sm" /> INFORMASI PROFIL
                </div>
                <div class="q-gutter-y-md">
                  <q-input
                    outlined
                    v-model="form.nama"
                    label="Nama Instansi / Konsumen *"
                    placeholder="Contoh: PT. Agra Abhinaya"
                    stack-label
                    bg-color="white"
                  />
                  <div class="row q-col-gutter-md">
                    <q-input
                      class="col-12 col-sm-6"
                      outlined
                      v-model="form.email"
                      label="Email Resmi *"
                      placeholder="office@company.com"
                      stack-label
                      bg-color="white"
                    />
                    <q-input
                      class="col-12 col-sm-6"
                      outlined
                      v-model="form.kontak"
                      label="No. WhatsApp / HP"
                      placeholder="08xxxx"
                      stack-label
                      bg-color="white"
                    />
                  </div>
                  <q-input
                    outlined
                    v-model="form.npwp"
                    label="NPWP (Nomor Pokok Wajib Pajak)"
                    mask="##.###.###.#-###.###"
                    placeholder="00.000.000.0-000.000"
                    stack-label
                    bg-color="white"
                  />
                  <div class="row q-col-gutter-md">
                    <q-select
                      class="col-12 col-sm-6"
                      outlined
                      v-model="form.provinsi"
                      :options="[
                        'DKI Jakarta',
                        'Jawa Barat',
                        'Banten',
                        'Jawa Tengah',
                        'Jawa Timur',
                      ]"
                      label="Provinsi"
                      stack-label
                      bg-color="white"
                    />
                    <q-input
                      class="col-12 col-sm-6"
                      outlined
                      v-model="form.kota"
                      label="Kota / Kabupaten"
                      stack-label
                      bg-color="white"
                    />
                  </div>
                  <q-input
                    outlined
                    v-model="form.alamat"
                    type="textarea"
                    label="Alamat Operasional Lengkap"
                    rows="3"
                    autogrow
                    stack-label
                    bg-color="white"
                  />
                </div>
              </q-card>

              <q-card flat bordered class="rounded-20 q-pa-lg bg-white shadow-1 q-mt-lg">
                <div
                  class="text-subtitle1 text-brand-primary text-weight-bolder q-mb-md flex items-center"
                >
                  <q-icon name="contact_phone" class="q-mr-sm" size="sm" /> PERSON IN CHARGE (PIC)
                </div>
                <div class="row q-col-gutter-md">
                  <q-input
                    class="col-12 col-sm-6"
                    outlined
                    v-model="form.pic_nama"
                    label="Nama Lengkap PIC"
                    dense
                    bg-color="white"
                  />
                  <q-input
                    class="col-12 col-sm-6"
                    outlined
                    v-model="form.pic_email"
                    label="Email PIC"
                    dense
                    bg-color="white"
                  />
                </div>
              </q-card>
            </div>

            <!-- FORM RIGHT: FINANCE & DOCS -->
            <div class="col-12 col-md-6">
              <q-card flat bordered class="rounded-20 q-pa-lg bg-white shadow-1">
                <div
                  class="text-subtitle1 text-brand-primary text-weight-bolder q-mb-lg flex items-center"
                >
                  <q-icon name="account_balance" class="q-mr-sm" size="sm" /> INFORMASI PERBANKAN
                </div>
                <div class="q-gutter-y-md">
                  <q-input
                    outlined
                    v-model="form.rek_nomor"
                    label="Nomor Rekening"
                    stack-label
                    bg-color="white"
                  />
                  <div class="row q-col-gutter-md">
                    <q-input
                      class="col-12 col-sm-6"
                      outlined
                      v-model="form.rek_bank"
                      label="Nama Bank"
                      dense
                      bg-color="white"
                    />
                    <q-input
                      class="col-12 col-sm-6"
                      outlined
                      v-model="form.rek_nama"
                      label="Atas Nama Rekening"
                      dense
                      bg-color="white"
                    />
                  </div>
                </div>
              </q-card>

              <q-card flat bordered class="rounded-20 q-pa-lg bg-white shadow-1 q-mt-lg">
                <div class="row items-center justify-between q-mb-lg">
                  <div
                    class="text-subtitle1 text-brand-primary text-weight-bolder flex items-center"
                  >
                    <q-icon name="cloud_upload" class="q-mr-sm" size="sm" /> DOKUMEN PENDUKUNG
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

                <div
                  v-for="(item, index) in form.additional_docs"
                  :key="index"
                  class="q-mb-md q-pa-sm bg-grey-1 rounded-borders border-dashed"
                >
                  <div class="row q-col-gutter-sm items-center">
                    <div class="col-12 col-sm-5">
                      <q-input
                        outlined
                        dense
                        v-model="item.label"
                        placeholder="Nama Berkas (ex: SIUP)"
                        bg-color="white"
                      />
                    </div>
                    <div class="col-10 col-sm-5">
                      <q-file
                        outlined
                        dense
                        v-model="item.fileObj"
                        label="Pilih File"
                        bg-color="white"
                      >
                        <template v-slot:prepend><q-icon name="attach_file" size="xs" /></template>
                        <template v-slot:append v-if="item.url || item.base64">
                          <q-icon name="check_circle" color="positive" size="xs" />
                        </template>
                      </q-file>
                    </div>
                    <div class="col-2 text-right">
                      <q-btn
                        flat
                        round
                        dense
                        color="brand-danger"
                        icon="delete"
                        size="sm"
                        @click="removeDocRow(index)"
                      />
                    </div>
                  </div>
                </div>

                <div
                  v-if="!form.additional_docs.length"
                  class="text-center q-pa-md text-grey-5 dashed-box"
                >
                  Klik ikon plus (+) untuk melampirkan berkas PDF / Gambar.
                </div>
              </q-card>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- =====================================================================================
         VIEW 3: DETAIL PROFIL (VIEW SWITCHER)
         ===================================================================================== -->
    <div v-else-if="viewMode === 'detail' && currentCustomer" class="animate-fade page-content-wrapper">
      <div class="row items-center justify-between q-mb-xl">
        <div class="col-12 col-md-8 q-mb-md q-mb-md-none">
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
                PROFIL LENGKAP KLIEN
              </div>
            </div>
          </div>
        </div>
        <div class="col-12 col-md-4">
          <div class="row justify-end">
            <div class="col-12 col-sm-auto">
              <q-btn
                v-if="canAction('ubah')"
                unelevated
                color="brand-primary"
                icon="edit"
                label="Edit Profil"
                rounded
                class="full-width q-px-lg text-weight-bold shadow-1"
                @click="openEditFromDetail"
              />
            </div>
          </div>
        </div>
      </div>

      <div class="row justify-center">
        <div class="col-12 col-xl-10">
          <!-- Profile Header Card -->
          <q-card flat bordered class="rounded-20 shadow-premium q-mb-xl bg-white overflow-hidden">
            <div class="row">
              <div class="col-12 col-md-4 bg-brand-light flex flex-center q-pa-xl">
                <q-avatar
                  size="150px"
                  color="brand-primary"
                  text-color="white"
                  class="shadow-10 border-white-5 text-weight-bold text-h2"
                >
                  {{ currentCustomer.nama?.charAt(0) }}
                </q-avatar>
              </div>
              <div class="col-12 col-md-8 q-pa-xl">
                <div class="text-h3 text-weight-bolder text-brand-primary q-mb-xs uppercase">
                  {{ currentCustomer.nama }}
                </div>
                <div class="text-h6 text-grey-7 q-mb-lg flex items-center">
                  <q-icon name="business" class="q-mr-sm" /> Customer Terdaftar
                </div>

                <div class="row q-col-gutter-lg">
                  <div class="col-12 col-sm-6">
                    <div class="text-overline text-grey-6 text-bold tracking-widest">
                      Email Perusahaan
                    </div>
                    <div class="text-subtitle1 text-weight-bold text-brand-primary">
                      {{ currentCustomer.email || '-' }}
                    </div>
                  </div>
                  <div class="col-12 col-sm-6">
                    <div class="text-overline text-grey-6 text-bold tracking-widest">
                      Kontak Utama
                    </div>
                    <div class="text-subtitle1 text-weight-bold text-brand-primary">
                      {{ currentCustomer.kontak || '-' }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </q-card>

          <!-- Info Detail Grid -->
          <div class="row q-col-gutter-xl">
            <!-- Left: Identity & Address -->
            <div class="col-12 col-md-6">
              <q-card flat bordered class="rounded-20 shadow-sm bg-white full-height">
                <q-card-section
                  class="bg-brand-light text-brand-primary text-weight-bold uppercase tracking-widest font-11"
                >
                  <q-icon name="info" class="q-mr-sm" /> Identitas & Lokasi
                </q-card-section>
                <q-separator />
                <q-card-section class="q-pa-lg">
                  <div class="q-gutter-y-lg">
                    <div class="row items-center border-bottom-subtle q-pb-sm">
                      <div class="col-4 text-slate-500 font-medium">No. NPWP</div>
                      <div class="col-8 text-weight-bold text-slate-800">
                        {{ currentCustomer.npwp || 'Tidak Tersedia' }}
                      </div>
                    </div>
                    <div class="row border-bottom-subtle q-pb-sm">
                      <div class="col-4 text-slate-500 font-medium">Alamat</div>
                      <div class="col-8 text-slate-700 font-medium leading-relaxed">
                        {{ currentCustomer.alamat || '-' }}
                      </div>
                    </div>
                    <div class="row items-center">
                      <div class="col-4 text-slate-500 font-medium">Kota / Prov</div>
                      <div class="col-8 text-weight-bold text-slate-800">
                        {{ currentCustomer.kota || '-' }}, {{ currentCustomer.provinsi || '-' }}
                      </div>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <!-- Right: PIC & Finance -->
            <div class="col-12 col-md-6">
              <q-card flat bordered class="rounded-20 shadow-sm bg-white full-height">
                <q-card-section
                  class="bg-brand-light text-brand-primary text-weight-bold uppercase tracking-widest font-11"
                >
                  <q-icon name="account_balance" class="q-mr-sm" /> Finansial & PIC
                </q-card-section>
                <q-separator />
                <q-card-section class="q-pa-lg">
                  <div class="q-gutter-y-lg">
                    <div class="row items-center border-bottom-subtle q-pb-sm">
                      <div class="col-4 text-grey-7 text-weight-medium">PIC Name</div>
                      <div class="col-8 text-weight-bold text-brand-primary uppercase">
                        {{ currentCustomer.pic_nama || '-' }}
                      </div>
                    </div>
                    <div class="row items-center border-bottom-subtle q-pb-sm">
                      <div class="col-4 text-grey-7 text-weight-medium">Bank</div>
                      <div class="col-8 text-weight-bold uppercase">
                        {{ currentCustomer.rek_bank || '-' }}
                      </div>
                    </div>
                    <div class="row items-center">
                      <div class="col-4 text-grey-7 text-weight-medium">No. Rekening</div>
                      <div class="col-8 text-weight-bold text-brand-primary text-subtitle1">
                        {{ currentCustomer.rek_nomor || '-' }}
                      </div>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <!-- Bottom: Documents -->
            <div class="col-12">
              <q-card flat bordered class="rounded-20 shadow-sm bg-white overflow-hidden q-mb-xl">
                <q-card-section
                  class="bg-brand-primary text-white text-weight-bold uppercase tracking-widest font-11"
                >
                  <q-icon name="description" class="q-mr-sm" /> Arsip Dokumen Pendukung
                </q-card-section>
                <q-list separator>
                  <q-expansion-item
                    v-for="(docItem, i) in currentCustomer.additional_docs"
                    :key="i"
                    icon="folder_zip"
                    :label="docItem.label || 'Dokumen ' + (i + 1)"
                    header-class="text-weight-bold text-blue-grey-10"
                  >
                    <div class="q-pa-md bg-grey-3">
                      <div class="row justify-end q-mb-sm">
                        <q-btn
                          color="brand-primary"
                          icon="open_in_new"
                          label="Buka / Unduh"
                          unelevated
                          rounded
                          size="sm"
                          @click="openLink(docItem.url || docItem.base64)"
                        />
                      </div>
                      <iframe
                        v-if="!isImage(docItem.url || docItem.base64)"
                        :src="docItem.url || docItem.base64"
                        frameborder="0"
                        style="width: 100%; height: 500px; border-radius: 12px"
                        class="shadow-5 bg-white"
                      ></iframe>
                      <div v-else class="text-center bg-white shadow-5 rounded-12 q-pa-md">
                        <img
                          :src="docItem.url || docItem.base64"
                          style="max-width: 100%; max-height: 500px; object-fit: contain"
                        />
                      </div>
                    </div>
                  </q-expansion-item>
                  <q-item v-if="!currentCustomer.additional_docs?.length">
                    <q-item-section class="text-center q-pa-xl text-grey-5 italic">
                      Belum ada berkas pendukung terlampir untuk klien ini.
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-card>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- =====================================================================================
         HIDDEN AREA FOR PDF LIST EXPORT (BERWARNA & RAPI)
         ===================================================================================== -->
    <div style="position: absolute; top: -9999px; left: -9999px; width: 297mm; z-index: -1">
      <div id="table-pdf-export" class="landscape-paper">
        <div
          style="
            border-bottom: 3px solid #36ada3;
            padding-bottom: 15px;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
          "
        >
          <div
            style="
              background-color: #36ada3;
              color: white;
              border-radius: 8px;
              padding: 12px;
              margin-right: 15px;
            "
          >
            <q-icon name="corporate_fare" size="32px" />
          </div>
          <div>
            <div
              style="
                font-size: 24px;
                font-weight: 900;
                color: #36ada3;
                text-transform: uppercase;
                letter-spacing: 1px;
              "
            >
              Database Klien Resmi
            </div>
            <div style="font-size: 12px; color: #666; margin-top: 4px">
              Diekspor pada: {{ new Date().toLocaleString('id-ID') }} | Agra Abhinaya Perkasa
            </div>
          </div>
        </div>

        <table class="pdf-export-table" style="width: 100%; border-collapse: collapse">
          <thead>
            <tr>
              <th style="width: 5%; text-align: center">NO</th>
              <th style="width: 25%; text-align: left">NAMA PERUSAHAAN</th>
              <th style="width: 25%; text-align: left">EMAIL / KONTAK</th>
              <th style="width: 25%; text-align: left">ALAMAT LENGKAP</th>
              <th style="width: 20%; text-align: left">KOTA / PROV</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, idx) in rows" :key="idx">
              <td style="text-align: center; font-weight: bold">{{ idx + 1 }}</td>
              <td
                style="
                  text-align: left;
                  font-weight: bold;
                  color: #36ada3;
                  text-transform: uppercase;
                "
              >
                {{ row.nama || '-' }}
              </td>
              <td style="text-align: left">
                <div>{{ row.email || '-' }}</div>
                <div style="color: #666; font-size: 10px; margin-top: 3px">
                  Ph: {{ row.kontak || '-' }}
                </div>
              </td>
              <td style="text-align: left; font-size: 10px">{{ row.alamat || '-' }}</td>
              <td style="text-align: left; font-weight: bold">{{ row.kota || '-' }}</td>
            </tr>
            <tr v-if="rows.length === 0">
              <td
                colspan="5"
                style="text-align: center; padding: 20px; color: #888; font-style: italic"
              >
                Tidak ada data.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useQuasar } from 'quasar'
import { db, storage } from 'src/boot/firebase'
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  where,
  serverTimestamp,
} from 'firebase/firestore'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import { useAuthStore } from 'src/stores/auth'
import html2pdf from 'html2pdf.js'

const $q = useQuasar()
const authStore = useAuthStore()

// State
const rows = ref([])
const loading = ref(true)
const submitting = ref(false)
const isEditMode = ref(false)
const filter = ref('')
const viewMode = ref('list') // Switcher mode: 'list', 'form', 'detail'

const currentCustomer = ref(null)
const userData = ref(null)

let unsubUser = null
let unsubCustomer = null

const formDefault = {
  id: null,
  nama: '',
  email: '',
  kontak: '',
  npwp: '',
  provinsi: null,
  kota: '',
  alamat: '',
  pic_nama: '',
  pic_email: '',
  rek_nomor: '',
  rek_bank: '',
  rek_nama: '',
  additional_docs: [],
}
const form = ref({ ...formDefault })

const columns = [
  { name: 'nama', align: 'left', label: 'NAMA CUSTOMER', field: 'nama', sortable: true },
  { name: 'email', align: 'left', label: 'KONTAK & EMAIL', field: 'email', sortable: true },
  { name: 'aksi', align: 'center', label: 'AKSI', field: 'id' },
]

const canAction = (actionType) => {
  if (authStore.user?.role === 'Super Admin') return true
  if (!userData.value?.permissions_detail) return false
  const modulePerm = userData.value.permissions_detail.find((m) => m.id === 'konstruksi')
  if (!modulePerm || !modulePerm.isActive) return false
  const targetId = '_konstruksi_marketing_customer'
  const menu = modulePerm.menus.find((m) => m.id === targetId)
  return menu ? menu[actionType] || false : false
}

// Logic View Switcher
const openAddDialog = () => {
  isEditMode.value = false
  form.value = JSON.parse(JSON.stringify(formDefault))
  viewMode.value = 'form'
  window.scrollTo(0, 0)
}

const openEditDialog = (row) => {
  isEditMode.value = true
  form.value = JSON.parse(JSON.stringify(row))
  viewMode.value = 'form'
  window.scrollTo(0, 0)
}

const openDetail = (row) => {
  currentCustomer.value = row
  viewMode.value = 'detail'
  window.scrollTo(0, 0)
}

const openEditFromDetail = () => {
  form.value = JSON.parse(JSON.stringify(currentCustomer.value))
  isEditMode.value = true
  viewMode.value = 'form'
  window.scrollTo(0, 0)
}

const processHybridUpload = async (file, pathName) => {
  if (!file) return null
  if (file.size <= 512000) {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result)
    })
  } else {
    const sRef = storageRef(storage, `customers/docs/${Date.now()}_${pathName}`)
    const snap = await uploadBytes(sRef, file)
    return await getDownloadURL(snap.ref)
  }
}

const addDocRow = () =>
  form.value.additional_docs.push({ label: '', url: '', base64: '', fileObj: null })
const removeDocRow = (i) => form.value.additional_docs.splice(i, 1)

const simpanCustomer = async () => {
  if (!form.value.nama) {
    $q.notify({ type: 'warning', message: 'Nama Instansi wajib diisi' })
    return
  }

  $q.loading.show({ message: 'Sedang memproses data...' })
  submitting.value = true

  try {
    for (let item of form.value.additional_docs) {
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

    const payload = JSON.parse(JSON.stringify(form.value))
    payload.updatedAt = serverTimestamp()
    const docId = payload.id
    delete payload.id

    if (isEditMode.value) {
      await updateDoc(doc(db, 'customer', docId), payload)
    } else {
      payload.createdAt = serverTimestamp()
      await addDoc(collection(db, 'customer'), payload)
    }

    viewMode.value = 'list'
    $q.notify({
      html: true,
      message:
        '<div class="text-weight-bold text-subtitle1 q-mb-none leading-none">Sinkronisasi Berhasil!</div><div class="text-caption q-mt-xs" style="opacity: 0.85">Data profil klien telah tersimpan di database.</div>',
      color: 'positive',
      icon: 'task_alt',
      position: 'top',
      timeout: 4000,
      progress: true,
      classes: 'rounded-12 shadow-premium q-pl-md q-pr-lg q-py-sm border-white-2',
      actions: [{ icon: 'close', color: 'white', round: true, size: 'sm', dense: true }],
    })
  } catch (error) {
    console.error('Error saat menyimpan customer:', error)
    $q.notify({ type: 'negative', message: 'Gagal sinkronisasi ke server.' })
  } finally {
    $q.loading.hide()
    submitting.value = false
  }
}

const confirmHapus = (r) => {
  $q.dialog({
    title: '<span class="text-weight-bold text-red">Konfirmasi Hapus</span>',
    message: `Apakah Anda yakin ingin menghapus data customer <b>${r.nama}</b>? Tindakan ini permanen.`,
    html: true,
    cancel: { label: 'Batal', flat: true, color: 'grey-7' },
    ok: { label: 'Hapus Klien', color: 'negative', unelevated: true, rounded: true },
    persistent: true,
  }).onOk(async () => {
    try {
      await deleteDoc(doc(db, 'customer', r.id))
      $q.notify({
        html: true,
        message:
          '<div class="text-weight-bold text-subtitle1 q-mb-none leading-none">Data Terhapus!</div><div class="text-caption q-mt-xs" style="opacity: 0.85">Informasi klien telah ditarik secara permanen dari sistem.</div>',
        color: 'negative',
        icon: 'delete_forever',
        position: 'top',
        timeout: 4000,
        progress: true,
        classes: 'rounded-12 shadow-premium q-pl-md q-pr-lg q-py-sm border-white-2',
        actions: [{ icon: 'close', color: 'white', round: true, size: 'sm', dense: true }],
      })
    } catch (error) {
      console.error('Error saat menghapus:', error)
      $q.notify({ color: 'negative', message: 'Gagal menghapus data.' })
    }
  })
}

// == FILE VERIFICATION & LINK OPENERS ==
const isImage = (url) => {
  if (!url) return false
  return (
    url.match(/\.(jpeg|jpg|gif|png|webp)$/i) != null ||
    url.includes('alt=media') ||
    url.startsWith('data:image/')
  )
}

const openLink = (url) => {
  if (!url) {
    $q.notify({ type: 'warning', message: 'Dokumen tidak tersedia.' })
    return
  }
  if (url.startsWith('data:')) {
    try {
      const arr = url.split(',')
      const mime = arr[0].match(/:(.*?);/)[1]
      const bstr = atob(arr[1])
      let n = bstr.length
      const u8arr = new Uint8Array(n)
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n)
      }
      const blob = new Blob([u8arr], { type: mime })
      const blobUrl = URL.createObjectURL(blob)

      const link = document.createElement('a')
      link.href = blobUrl
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      setTimeout(() => URL.revokeObjectURL(blobUrl), 2000)
    } catch (error) {
      console.error('Error parsing base64:', error)
      $q.notify({ type: 'negative', message: 'Gagal memproses file internal.' })
    }
  } else {
    const link = document.createElement('a')
    link.href = url
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}

// ============================================================================
// EXPORT TO PDF & EXCEL FUNCTIONALITIES
// ============================================================================
const exportTablePDF = () => {
  const element = document.getElementById('table-pdf-export')
  if (!element) return

  const opt = {
    margin: [10, 10, 10, 10],
    filename: `List_Customer_${Date.now()}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, letterRendering: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' },
  }

  $q.loading.show({ message: 'Generate PDF List Klien...' })
  html2pdf()
    .set(opt)
    .from(element)
    .save()
    .then(() => $q.loading.hide())
}

const exportTableExcel = () => {
  try {
    const thStyle =
      'background-color: #36ADA3; color: #ffffff; font-weight: bold; border: 1px solid #cbd5e1; padding: 12px; text-align: left; text-transform: uppercase;'
    const tdStyle =
      'border: 1px solid #cbd5e1; padding: 10px; vertical-align: top; font-family: sans-serif;'

    let tableHtml =
      '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">'
    tableHtml += '<head><meta charset="utf-8"></head><body>'
    tableHtml +=
      '<h2 style="color: #36ADA3; margin-bottom: 5px; font-family: sans-serif;">Database Customer Resmi</h2>'
    tableHtml +=
      '<p style="margin-top: 0; font-family: sans-serif; color: #64748b;">Tanggal Ekspor: ' +
      new Date().toLocaleString('id-ID') +
      ' | PT Agra Abhinaya Perkasa</p><br>'
    tableHtml += '<table style="border-collapse: collapse; width: 100%; font-family: sans-serif;">'
    tableHtml += '<thead><tr>'
    tableHtml += `<th style="${thStyle}">No</th>`
    tableHtml += `<th style="${thStyle}">Nama Perusahaan</th>`
    tableHtml += `<th style="${thStyle}">Email Korespondensi</th>`
    tableHtml += `<th style="${thStyle}">Nomor Kontak</th>`
    tableHtml += `<th style="${thStyle}">NPWP</th>`
    tableHtml += `<th style="${thStyle}">Alamat Kantor</th>`
    tableHtml += `<th style="${thStyle}">Kota</th>`
    tableHtml += `<th style="${thStyle}">Provinsi</th>`
    tableHtml += `<th style="${thStyle}">Nama PIC</th>`
    tableHtml += '</tr></thead><tbody>'

    rows.value.forEach((r, idx) => {
      tableHtml += `
        <tr>
          <td style="${tdStyle} text-align: center;">${idx + 1}</td>
          <td style="${tdStyle} font-weight: bold; color: #36ADA3;">${r.nama || '-'}</td>
          <td style="${tdStyle}">${r.email || '-'}</td>
          <td style="${tdStyle} mso-number-format:'@';">${r.kontak || '-'}</td>
          <td style="${tdStyle} mso-number-format:'@';">${r.npwp || '-'}</td>
          <td style="${tdStyle}">${r.alamat || '-'}</td>
          <td style="${tdStyle}">${r.kota || '-'}</td>
          <td style="${tdStyle}">${r.provinsi || '-'}</td>
          <td style="${tdStyle}">${r.pic_nama || '-'}</td>
        </tr>
      `
    })

    tableHtml += '</tbody></table></body></html>'
    const blob = new Blob([tableHtml], { type: 'application/vnd.ms-excel' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `Data_Customer_${Date.now()}.xls`
    link.click()
    URL.revokeObjectURL(url)

    $q.notify({ type: 'positive', message: 'Daftar Klien Berhasil Diekspor!' })
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: 'Gagal mengekspor data ke Excel.' })
  }
}

onMounted(() => {
  // 1. Pantau Hak Akses User Real-time
  const userEmail = authStore.user?.email
  if (userEmail) {
    const qUser = query(collection(db, 'karyawan'), where('email', '==', userEmail))
    unsubUser = onSnapshot(qUser, (snapshot) => {
      if (!snapshot.empty) userData.value = snapshot.docs[0].data()
    })
  }

  // 2. Ambil Data Customer Real-time
  const qCustomer = query(collection(db, 'customer'), orderBy('createdAt', 'desc'))
  unsubCustomer = onSnapshot(
    qCustomer,
    (snap) => {
      rows.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      loading.value = false
    },
    (err) => {
      console.error('Firestore Listen Error:', err)
      loading.value = false
    },
  )
})

onUnmounted(() => {
  if (unsubUser) unsubUser()
  if (unsubCustomer) unsubCustomer()
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900&display=swap');

/* ===== BRAND COLOR PALETTE ===== */
:root {
  --brand-primary: #36ada3;
  --brand-primary-dark: #1e6e69;
  --brand-primary-light: #e0f5f4;
  --brand-primary-mid: #b2e5e2;
  --brand-danger: #ad3640;
  --brand-danger-dark: #7a2028;
  --brand-danger-light: #f7e0e1;
  --page-bg: #f0fafa;
}

/* Quasar color overrides via CSS */
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

/* Override Quasar btn colors */
.q-btn[color='brand-primary'],
.bg-brand-primary.q-btn {
  background-color: #36ada3 !important;
  color: white !important;
}

.font-pro {
  font-family:
    'Plus Jakarta Sans',
    -apple-system,
    sans-serif;
}
.relative-position {
  position: relative;
}
.content-relative {
  position: relative;
  z-index: 1;
}

/* =======================================================================
   BACKGROUND ANIMATION CSS
   ======================================================================= */
.bg-animation-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 0;
  pointer-events: none; /* Supaya ikon di background tidak bisa di-klik & tidak ganggu tabel */
}

.floating-icon {
  position: absolute;
  color: #ad3640;
  opacity: 0.35; /* Ditingkatkan agar warna lebih tebal dan jelas */
  bottom: -150px;
  animation: floatUp infinite linear;
}

/* Posisi dan durasi random agar terlihat organik */
.i-1 {
  left: 10%;
  font-size: 80px;
  animation-duration: 25s;
  animation-delay: 0s;
}
.i-2 {
  left: 25%;
  font-size: 120px;
  animation-duration: 30s;
  animation-delay: 5s;
}
.i-3 {
  left: 45%;
  font-size: 60px;
  animation-duration: 22s;
  animation-delay: 2s;
}
.i-4 {
  left: 60%;
  font-size: 100px;
  animation-duration: 28s;
  animation-delay: 8s;
}
.i-5 {
  left: 80%;
  font-size: 70px;
  animation-duration: 26s;
  animation-delay: 4s;
}
.i-6 {
  left: 90%;
  font-size: 150px;
  animation-duration: 35s;
  animation-delay: 1s;
}
.i-7 {
  left: 5%;
  font-size: 90px;
  animation-duration: 20s;
  animation-delay: 12s;
}
.i-8 {
  left: 75%;
  font-size: 110px;
  animation-duration: 32s;
  animation-delay: 10s;
}
.i-9 {
  left: 35%;
  font-size: 130px;
  animation-duration: 27s;
  animation-delay: 15s;
}
.i-10 {
  left: 50%;
  font-size: 85px;
  animation-duration: 24s;
  animation-delay: 7s;
}

@keyframes floatUp {
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 0.25;
  }
  50% {
    opacity: 0.4;
  }
  100% {
    transform: translateY(-120vh) rotate(360deg);
    opacity: 0;
  }
}

.rounded-20 {
  border-radius: 20px;
}
.rounded-12 {
  border-radius: 12px;
}
.shadow-premium {
  box-shadow: 0 10px 30px rgba(54, 173, 163, 0.2);
}
.border-dashed {
  border: 2px dashed #e0e0e0;
}
.dashed-box {
  border: 2px dashed #e0e0e0;
  border-radius: 12px;
}
.border-subtle {
  border: 1px solid rgba(0, 0, 0, 0.05);
}
.border-bottom-subtle {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.customer-table :deep(thead tr th) {
  position: sticky;
  top: 0;
  z-index: 1;
}
.btn-hover:hover {
  filter: brightness(1.1);
  transform: scale(1.02);
  transition: 0.3s;
}
.hover-bg:hover {
  background-color: rgba(54, 173, 163, 0.06) !important;
}
.transition-all {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}
.hover-blue-btn:hover {
  background-color: #e0f5f4 !important;
  color: #1e6e69 !important;
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

.letter-spacing-1 {
  letter-spacing: 1px;
}
.border-white-5 {
  border: 5px solid white;
}
.border-white-2 {
  border: 2px solid rgba(255, 255, 255, 0.4);
}
.search-input :deep(.q-field__control) {
  border-radius: 30px;
}

/* Responsivitas untuk teks jumlah customer di HP */
@media (max-width: 599px) {
  .sm-text-left {
    text-align: left !important;
    margin-top: 8px;
  }
}

/* =======================================================================
   TABLE PDF EXPORT STYLES (LANDSCAPE)
   ======================================================================= */
.landscape-paper {
  background: white;
  width: 297mm;
  min-height: 210mm;
  padding: 10mm 15mm;
  margin: 0;
  color: #1a1a1a;
  font-family: Arial, sans-serif;
  box-sizing: border-box;
}
.pdf-export-table {
  width: 100%;
  border-collapse: collapse;
  font-family: 'Inter', Arial, sans-serif;
  margin-top: 10px;
}
.pdf-export-table th {
  background-color: #36ada3 !important;
  color: #ffffff !important;
  padding: 10px;
  font-size: 11px;
  border: 1px solid #36ada3;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
.pdf-export-table td {
  padding: 10px;
  font-size: 10px;
  border: 1px solid #e0e0e0;
  color: #1e293b;
  vertical-align: top;
}

@media print {
  body {
    background: white !important;
  }
  .no-print {
    display: none !important;
  }
}

/* ===== QUASAR COMPONENT DEEP OVERRIDES ===== */
/* Primary buttons and elements */
:deep(.q-btn[color='brand-primary']) {
  background: #36ada3 !important;
  color: white !important;
}
:deep(.q-btn--unelevated.q-btn[color='brand-primary']) {
  background: #36ada3 !important;
}
:deep(.q-avatar[color='brand-primary']) {
  background-color: #36ada3 !important;
  color: white !important;
}
:deep(.q-avatar[color='brand-light']) {
  background-color: #e0f5f4 !important;
  color: #1e6e69 !important;
}
:deep(.q-btn[color='brand-danger']) {
  color: #ad3640 !important;
}
:deep(.q-btn--flat[color='brand-danger']) {
  color: #ad3640 !important;
}
:deep(.q-btn--flat[color='brand-primary']) {
  color: #36ada3 !important;
}
:deep(.q-icon[color='brand-primary']),
:deep(.q-field__prepend .q-icon) {
  color: #36ada3 !important;
}
:deep(.q-expansion-item .q-item__section--avatar .q-icon) {
  color: #36ada3 !important;
}
:deep(.q-field--focused .q-field__control) {
  border-color: #36ada3 !important;
}
:deep(.q-field--focused .q-field__label) {
  color: #36ada3 !important;
}
:deep(.q-linear-progress__track--light) {
  background: #b2e5e2 !important;
}
:deep(.q-linear-progress__model--determinate) {
  background: #36ada3 !important;
}

</style>
