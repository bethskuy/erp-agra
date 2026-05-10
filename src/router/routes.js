const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [{ path: '', component: () => import('pages/IndexPage.vue') }],
  },
  {
    path: '/login',
    component: () => import('pages/auth/LoginPage.vue'),
  },
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
        path: 'marketing/ahsp',
        component: () => import('pages/konstruksi/Marketing/AhspPage.vue'),
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
      // --- TAMBAHAN ROUTE MONITORING PROYEK ---
      {
        path: 'master/proyek-monitoring',
        component: () => import('pages/konstruksi/Master/DataProyek/MonitoringProyekPage.vue'),
      },
      { path: 'gudang', component: () => import('pages/konstruksi/Gudang/GudangPage.vue') },
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
      // --- TAMBAHAN ROUTE FINANCE ---
      {
        path: 'finance/tagihan',
        component: () => import('pages/konstruksi/Finance/MonitoringTagihanPage.vue'),
      },
      {
        path: 'finance/tagihan-supplier',
        component: () => import('pages/konstruksi/Finance/TagihanSupplierPage.vue'),
      },
      {
        path: 'finance/pengeluaran',
        component: () => import('pages/konstruksi/Finance/MonitoringPengeluaranPage.vue'),
      },
      {
        path: 'finance/pembayaran',
        component: () => import('pages/konstruksi/Finance/PengajuanPembayaranPage.vue'),
      },
      {
        path: 'finance/approval-pembayaran',
        component: () => import('pages/konstruksi/Finance/ApprovalPembayaranPage.vue'),
      },
      {
        path: 'finance/balansheet',
        component: () => import('pages/konstruksi/Finance/MonitoringBalansheetPage.vue'),
      },
    ],
  },
  {
    path: '/absensi',
    component: () => import('layouts/AbsensiLayout.vue'),
    meta: { requiresAuth: true, modul: 'absensi' },
    children: [
      {
        path: 'admin/dashboard',
        name: 'absensi-admin-dashboard',
        component: () => import('pages/absensi/adminabsensi/AdminDashboardPage.vue'),
      },
      {
        path: 'admin/pengaturan',
        name: 'absensi-admin-pengaturan',
        component: () => import('pages/absensi/adminabsensi/PengaturanAbsensiPage.vue'),
      },
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
      {
        path: 'marketing/customer',
        name: 'manufaktur-master-customer',
        component: () => import('pages/manufaktur/Master/Customer/CustomerPage.vue'),
      },
      {
        path: 'master/supplier',
        name: 'manufaktur-master-supplier',
        component: () => import('pages/manufaktur/Master/DataSupplier/MasterSupplierPage.vue'),
      },
      {
        path: 'master/barang-list',
        name: 'manufaktur-master-barang',
        component: () => import('pages/manufaktur/Master/DataBarang/MasterBarangPage.vue'),
      },
      {
        path: 'master/barang-kategori',
        name: 'manufaktur-master-barang-kategori',
        component: () => import('pages/manufaktur/Master/DataBarang/KategoriBarangPage.vue'),
      },
      {
        path: 'master/pekerjaan',
        name: 'manufaktur-master-pekerjaan',
        component: () => import('pages/manufaktur/Master/DataPekerjaan/MasterPekerjaanPage.vue'),
      },
      {
        path: 'master/proyek-data',
        name: 'manufaktur-master-proyek',
        component: () => import('pages/manufaktur/Master/DataProyek/MasterProyekPage.vue'),
      },
      {
        path: 'master/proyek-kategori',
        name: 'manufaktur-master-proyek-kategori',
        component: () => import('pages/manufaktur/Master/DataProyek/KategoriProyekPage.vue'),
      },
      {
        path: 'master/satuan',
        name: 'manufaktur-master-satuan',
        component: () => import('pages/manufaktur/Master/DataSatuan/MasterSatuanPage.vue'),
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
      {
        path: 'sales/po-customer',
        name: 'manufaktur-po-customer',
        component: () => import('pages/manufaktur/sales/POCustomerPage.vue'),
      },
      {
        path: 'produksi/proses-produksi/incoming',
        name: 'manufaktur-incoming-material',
        component: () => import('pages/manufaktur/Produksi/IncomingMaterialPage.vue'),
      },
      {
        path: 'produksi/proses-produksi/incoming/table',
        name: 'incoming-table',
        component: () => import('pages/manufaktur/Produksi/IncomingTablePage.vue'),
      },
      {
        path: 'produksi/proses-produksi/incoming/dialog',
        name: 'incoming-dialog',
        component: () => import('pages/manufaktur/Produksi/IncomingDialog.vue'),
      },
      {
        path: 'produksi/proses-produksi/incoming/summary',
        name: 'incoming-summary',
        component: () => import('pages/manufaktur/Produksi/IncomingSummary.vue'),
      },
      {
        path: 'produksi/proses-produksi/incoming/status',
        name: 'incoming-status',
        component: () => import('pages/manufaktur/Produksi/IncomingStatusBadge.vue'),
      },
      {
        path: 'produksi/proses-produksi/material',
        name: 'incoming-material-data',
        component: () => import('pages/manufaktur/Produksi/IncomingMaterial.vue'),
      },
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
      {
        path: 'warehouse/outgoing-check',
        name: 'manufaktur-warehouse-oqc',
        component: () => import('pages/manufaktur/warehouse/outgoingcheckOQC.vue'),
      },
      {
        path: 'delivery/surat-jalan',
        name: 'manufaktur-delivery-sj',
        component: () => import('pages/manufaktur/delivery/SuratJalanPage.vue'),
      },
      {
        path: 'finance/invoice',
        name: 'manufaktur-finance-invoice',
        component: () => import('pages/manufaktur/finance/InvoiceCustomerPage.vue'),
      },
      {
        path: 'gudang',
        component: () => import('pages/manufaktur/Gudang/ManufacturGudangPage.vue'),
      },
      {
        path: 'gudang/transaksi',
        component: () => import('pages/manufaktur/Gudang/ManufacturRiwayatTransaksiPage.vue'),
      },
      {
        path: 'gudang/opname/:id',
        component: () => import('pages/manufaktur/Gudang/ManufacturOpnamePage.vue'),
      },
      {
        path: 'gudang/masuk/:id',
        component: () => import('pages/manufaktur/Gudang/ManufacturBarangMasukPage.vue'),
      },
      {
        path: 'gudang/keluar/:id',
        component: () => import('pages/manufaktur/Gudang/ManufacturBarangKeluarPage.vue'),
      },
      {
        path: 'gudang/permintaan/list',
        component: () => import('pages/manufaktur/Gudang/ManufacturListPermintaanPage.vue'),
      },
      {
        path: 'gudang/permintaan-antar/:id',
        component: () => import('pages/manufaktur/Gudang/ManufacturPermintaanAntarGudangPage.vue'),
      },
      {
        path: 'gudang/purchase-request/:id',
        component: () => import('pages/manufaktur/Gudang/ManufacturPurchaseRequestPage.vue'),
      },
      // =====================================================
      // INCOMING MATERIAL ROUTES
      // File: src/router/routes.js
      // =====================================================

      {
        path: '/manufaktur/produksi/proses-produksi/incoming',
        name: 'incoming-material',
        component: () => import('pages/manufaktur/Produksi/IncomingMaterialPage.vue'),
        meta: {
          requiresAuth: true,
          title: 'Incoming Material',
          module: 'manufaktur',
        },
      },

      {
        path: '/manufaktur/produksi/proses-produksi/incoming/table',
        name: 'incoming-table',
        component: () => import('pages/manufaktur/Produksi/IncomingTablePage.vue'),
        meta: {
          requiresAuth: true,
          title: 'Incoming Table',
          module: 'manufaktur',
        },
      },

      {
        path: '/manufaktur/produksi/proses-produksi/incoming/dialog',
        name: 'incoming-dialog',
        component: () => import('pages/manufaktur/Produksi/IncomingDialog.vue'),
        meta: {
          requiresAuth: true,
          title: 'Incoming Dialog',
          module: 'manufaktur',
        },
      },

      {
        path: '/manufaktur/produksi/proses-produksi/incoming/summary',
        name: 'incoming-summary',
        component: () => import('pages/manufaktur/Produksi/IncomingSummary.vue'),
        meta: {
          requiresAuth: true,
          title: 'Incoming Summary',
          module: 'manufaktur',
        },
      },

      {
        path: '/manufaktur/produksi/proses-produksi/incoming/status',
        name: 'incoming-status',
        component: () => import('pages/manufaktur/Produksi/IncomingStatusBadge.vue'),
        meta: {
          requiresAuth: true,
          title: 'Incoming Status',
          module: 'manufaktur',
        },
      },

      {
        path: '/manufaktur/produksi/proses-produksi/material',
        name: 'incoming-material-data',
        component: () => import('pages/manufaktur/Produksi/IncomingMaterial.vue'),
        meta: {
          requiresAuth: true,
          title: 'Incoming Material Data',
          module: 'manufaktur',
        },
      },
      // =========================
      // MANUFAKTUR MASTER ROUTES
      // =========================

      {
        path: '/manufaktur/master/customer',
        component: () => import('pages/manufaktur/Master/Customer/CustomerPage.vue'),
      },

      {
        path: '/manufaktur/master/data-barang/kategori',
        component: () => import('pages/manufaktur/Master/DataBarang/KategoriBarangPage.vue'),
      },

      {
        path: '/manufaktur/master/data-barang/master',
        component: () => import('pages/manufaktur/Master/DataBarang/MasterBarangPage.vue'),
      },

      {
        path: '/manufaktur/master/data-pekerjaan',
        component: () => import('pages/manufaktur/Master/DataPekerjaan/MasterPekerjaanPage.vue'),
      },

      {
        path: '/manufaktur/master/data-proyek/kategori',
        component: () => import('pages/manufaktur/Master/DataProyek/KategoriProyekPage.vue'),
      },

      {
        path: '/manufaktur/master/data-proyek/master',
        component: () => import('pages/manufaktur/Master/DataProyek/MasterProyekPage.vue'),
      },

      {
        path: '/manufaktur/master/data-satuan',
        component: () => import('pages/manufaktur/Master/DataSatuan/MasterSatuanPage.vue'),
      },

      {
        path: '/manufaktur/master/data-supplier',
        component: () => import('pages/manufaktur/Master/DataSupplier/MasterSupplierPage.vue'),
      },
    ],
  },
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
      { path: 'akses', component: () => import('pages/managementkaryawan/AksesPage.vue') },
    ],
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
