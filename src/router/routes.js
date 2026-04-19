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
      {
        path: 'pelaksanaan/spk-mandor',
        component: () => import('pages/konstruksi/Proyek/Pelaksanaan/SpkMandor/SpkMandorPage.vue'),
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
        path: 'dashboard',
        name: 'absensi-dashboard',
        component: () => import('pages/absensi/DashboardPage.vue'),
      },
      {
        path: 'riwayat',
        name: 'absensi-riwayat',
        component: () => import('pages/absensi/RiwayatPage.vue'),
      },
    ],
  },

  // 5. MODUL MANUFAKTUR
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
        path: '/management/akses/:modul',
        name: 'management-hak-akses',
        component: () => import('pages/managementkaryawan/HakAksesPage.vue'),
      },
    ],
  },

  { path: '/:catchAll(.*)*', component: () => import('pages/ErrorNotFound.vue') },
]

export default routes
