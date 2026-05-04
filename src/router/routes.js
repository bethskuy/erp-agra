const routes = [
  // 1. LANDING PAGE
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [{ path: '', component: () => import('pages/IndexPage.vue') }],
  },

  // 2. AUTHENTICATION
  {
    path: '/login',
    component: () => import('pages/auth/LoginPage.vue'),
  },

  // 3. MODUL KONSTRUKSI
  {
    path: '/konstruksi',
    component: () => import('layouts/KonstruksiLayout.vue'),
    meta: { requiresAuth: true, modul: 'konstruksi' },
    children: [
      {
        path: 'dashboard',
        component: () => import('pages/konstruksi/Dashboard/DashboardPage.vue'),
      },
      {
        path: 'marketing/customer',
        component: () => import('pages/konstruksi/Master/Customer/CustomerPage.vue'),
      },
      {
        path: 'master/supplier',
        component: () => import('pages/konstruksi/Master/DataSupplier/MasterSupplierPage.vue'),
      },
      {
        path: 'master/barang-list',
        component: () => import('pages/konstruksi/Master/DataBarang/MasterBarangPage.vue'),
      },
      {
        path: 'master/barang-kategori',
        component: () => import('pages/konstruksi/Master/DataBarang/KategoriBarangPage.vue'),
      },
      {
        path: 'master/satuan',
        component: () => import('pages/konstruksi/Master/DataSatuan/MasterSatuanPage.vue'),
      },
      {
        path: 'marketing/penawaran',
        component: () => import('pages/konstruksi/Marketing/Penawaran/PenawaranPage.vue'),
      },
      {
        path: 'marketing/approval-penawaran',
        component: () => import('pages/konstruksi/Marketing/ApprovalPenawaranPage.vue'),
      },
      {
        path: 'master/proyek-data',
        component: () => import('pages/konstruksi/Master/DataProyek/MasterProyekPage.vue'),
      },
      {
        path: 'master/proyek-kategori',
        component: () => import('pages/konstruksi/Master/DataProyek/KategoriProyekPage.vue'),
      },

      // --- GRUP NAVIGASI GUDANG & LOGISTIK ---
      {
        path: 'gudang',
        component: () => import('pages/konstruksi/Gudang/GudangPage.vue'),
      },
      {
        path: 'gudang/transaksi',
        component: () => import('pages/konstruksi/Gudang/RiwayatTransaksiPage.vue'),
      },
      {
        path: 'gudang/opname/:id',
        component: () => import('pages/konstruksi/Gudang/OpnamePage.vue'),
      },
      {
        path: 'gudang/masuk/:id',
        component: () => import('pages/konstruksi/Gudang/BarangMasukPage.vue'),
      },
      {
        path: 'gudang/keluar/:id',
        component: () => import('pages/konstruksi/Gudang/BarangKeluarPage.vue'),
      },

      // RUTE BARU UNTUK PERMINTAAN BARANG
      {
        path: 'gudang/permintaan/list',
        component: () => import('pages/konstruksi/Gudang/ListPermintaanPage.vue'),
      },
      {
        path: 'gudang/permintaan-antar/:id',
        component: () => import('pages/konstruksi/Gudang/PermintaanAntarGudangPage.vue'),
      },
      {
        path: 'gudang/purchase-request/:id',
        component: () => import('pages/konstruksi/Gudang/PurchaseRequestPage.vue'),
      },

      {
        path: 'pembelian/pesanan',
        component: () =>
          import('pages/konstruksi/Pembelian/PesananPembelian/PesananPembelianPage.vue'),
      },
    ],
  },

  // 4. MODUL ABSENSI
  {
    path: '/absensi',
    component: () => import('layouts/AbsensiLayout.vue'),
    meta: { requiresAuth: true, modul: 'absensi' },
    children: [
      {
        path: 'profil',
        name: 'absensi-profil',
        component: () => import('pages/absensi/ProfilPage.vue'),
      },
      {
        path: 'dashboard',
        name: 'absensi-dashboard',
        component: () => import('pages/absensi/DashboardPage.vue'),
      },
      {
        path: 'riwayat',
        name: 'absensi-riwayat',
        component: () => import('pages/absensi/RiwayatPage.vue'),
      },
      {
        path: 'pengajuan-izin',
        name: 'absensi-pengajuan',
        component: () => import('pages/absensi/PengajuanIzinPage.vue'),
      },
    ],
  },

  /// 5. MODUL MANUFAKTUR (AGRA ERP - CUSTOM FLOW)
  {
    path: '/manufaktur',
    component: () => import('layouts/ManufakturLayout.vue'),
    meta: { requiresAuth: true, modul: 'manufaktur' },
    children: [
      {
        path: 'dashboard',
        name: 'manufaktur-dashboard',
        component: () => import('pages/manufaktur/DashboardPage.vue'),
      },
      // --- MENU SISTEM PENAWARAN (REVISI SESUAI GAMBAR) ---
      {
        path: 'penawaran',
        name: 'PenawaranManufaktur',
        component: () => import('pages/manufaktur/Penawaran/QuotationPage.vue'),
      },
      {
        path: 'penawaran-approval',
        name: 'ApprovalPenawaranManufaktur',
        component: () => import('pages/manufaktur/Penawaran/ApprovalQuotationPage.vue'),
      },

      // --- SECTION 1: SALES ---
      {
        path: 'sales/po-customer',
        name: 'manufaktur-po-customer',
        component: () => import('pages/manufaktur/sales/POCustomerPage.vue'),
      },

      // --- SECTION 2: PROSES PRODUKSI (INCOMING) ---
      {
        path: 'produksi/proses-produksi/incoming',
        name: 'manufaktur-incoming-material',
        component: () => import('pages/manufaktur/ProsesProduksi/IncomingMaterialPage.vue'),
      },

      // --- SECTION 3: PROSES PACKING (STAYWIRE 5 STEPS) ---
      {
        path: 'proses-packing/check-pin',
        name: 'manufaktur-check-pin',
        component: () => import('pages/manufaktur/ProsesPacking/CheckPinGoNoGo.vue'),
      },
      {
        path: 'proses-packing/check-hole',
        name: 'manufaktur-check-hole',
        component: () => import('pages/manufaktur/ProsesPacking/CheckHole.vue'),
      },
      {
        path: 'proses-packing/check-tapping',
        name: 'manufaktur-check-tapping',
        component: () => import('pages/manufaktur/ProsesPacking/CheckTapping.vue'),
      },
      {
        path: 'proses-packing/visual-check',
        name: 'manufaktur-visual-check',
        component: () => import('pages/manufaktur/ProsesPacking/VisualCheck.vue'),
      },
      {
        path: 'proses-packing/packing-final',
        name: 'manufaktur-packing-final',
        component: () => import('pages/manufaktur/ProsesPacking/PackingFinal.vue'),
      },

      // --- SECTION 4: WAREHOUSE (GUDANG & OQC) ---
      {
        path: 'warehouse/outgoing-check',
        name: 'manufaktur-warehouse-oqc',
        component: () => import('pages/manufaktur/warehouse/outgoingcheckOQC.vue'),
      },

      // --- SECTION 5: DELIVERY (SURAT JALAN) ---
      {
        path: 'delivery/surat-jalan',
        name: 'manufaktur-delivery-sj',
        component: () => import('pages/manufaktur/delivery/SuratJalanPage.vue'),
      },

      // --- SECTION 6: FINANCE (INVOICE) ---
      {
        path: 'finance/invoice',
        name: 'manufaktur-finance-invoice',
        component: () => import('pages/manufaktur/finance/InvoiceCustomerPage.vue'),
      },
    ],
  },

  // 6. MODUL MANAGEMENT KARYAWAN & HAK AKSES
  {
    path: '/management-karyawan',
    component: () => import('layouts/ManagementKaryawanLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'management-karyawan-dashboard',
        component: () => import('pages/managementkaryawan/DashboardPage.vue'),
      },
      {
        path: 'karyawan',
        name: 'management-karyawan-data',
        component: () => import('pages/managementkaryawan/datakaryawan/KaryawanPage.vue'),
      },
      {
        path: 'master/jabatan',
        component: () => import('pages/managementkaryawan/MasterJabatanPage.vue'),
      },
      {
        path: 'akses',
        component: () => import('pages/managementkaryawan/AksesPage.vue'),
      },
    ],
  },

  { path: '/:catchAll(.*)*', component: () => import('pages/ErrorNotFound.vue') },
]

export default routes
