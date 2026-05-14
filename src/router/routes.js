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
        path: 'admin/catatan',
        name: 'absensi-admin-catatan',
        component: () => import('pages/absensi/adminabsensi/CatatanAbsensiPage.vue'),
      },
      {
        path: 'admin/persetujuan',
        name: 'absensi-admin-persetujuan',
        component: () => import('pages/absensi/adminabsensi/PersetujuanCutiPage.vue'),
      },
      {
        path: 'admin/pemberitahuan',
        name: 'absensi-admin-pemberitahuan',
        component: () => import('pages/absensi/adminabsensi/PemberitahuanUmumPage.vue'),
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
      {
        path: 'manual',
        name: 'absensi-manual',
        component: () => import('pages/absensi/AbsensiManualPage.vue'),
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

      // --- SECTION 1: SALES ---
      {
        path: 'sales/po-customer',
        name: 'manufaktur-po-customer',
        component: () => import('pages/manufaktur/sales/POCustomerPage.vue'),
      },

      // --- SECTION 2: PPIC ---
      {
        path: 'ppic/planning-produksi',
        name: 'manufaktur-ppic-planning-produksi',
        component: () => import('pages/manufaktur/PPIC/PlanningProduksiPage.vue'),
      },
      {
        path: 'ppic/jadwal-produksi',
        name: 'manufaktur-ppic-jadwal-produksi',
        component: () => import('pages/manufaktur/PPIC/JadwalProduksiPage.vue'),
      },
      {
        path: 'ppic/work-order',
        name: 'manufaktur-ppic-work-order',
        component: () => import('pages/manufaktur/PPIC/WorkOrderPage.vue'),
      },
      {
        path: 'ppic/material-requirement',
        name: 'manufaktur-ppic-material-requirement',
        component: () => import('pages/manufaktur/PPIC/MaterialRequirementPage.vue'),
      },
      {
        path: 'ppic/bill-of-material',
        name: 'manufaktur-ppic-bill-of-material',
        component: () => import('pages/manufaktur/PPIC/BillOfMaterialPage.vue'),
      },
      {
        path: 'ppic/routing-produksi',
        name: 'manufaktur-ppic-routing-produksi',
        component: () => import('pages/manufaktur/PPIC/RoutingProduksiPage.vue'),
      },

      // --- SECTION 3: PRODUKSI ---
      {
        path: 'produksi/monitoring-produksi',
        name: 'manufaktur-monitoring-produksi',
        component: () => import('pages/manufaktur/Produksi/MonitoringProduksiPage.vue'),
      },
      {
        path: 'produksi/qc-produksi',
        name: 'manufaktur-qc-produksi',
        component: () => import('pages/manufaktur/Produksi/QCProduksiPage.vue'),
      },
      {
        path: 'produksi/packing-produksi',
        name: 'manufaktur-packing-produksi',
        component: () => import('pages/manufaktur/Produksi/PackingProduksiPage.vue'),
      },
      {
        path: 'produksi/ready-delivery',
        name: 'manufaktur-ready-delivery',
        component: () => import('pages/manufaktur/Produksi/ReadyDeliveryPage.vue'),
      },
      {
        path: 'produksi/line-produksi',
        name: 'manufaktur-line-produksi',
        component: () => import('pages/manufaktur/Produksi/LineProduksiPage.vue'),
      },
      {
        path: 'produksi/proses-produksi/incoming',
        name: 'manufaktur-incoming-material',
        component: () => import('pages/manufaktur/Produksi/IncomingMaterialPage.vue'),
      },
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
      // --- SECTION 7: GUDANG MANUFAKTUR ---
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

      // taruh di children manufaktur
      // jangan ubah route lain

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
