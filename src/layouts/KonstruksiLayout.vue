<template>
  <q-layout view="lHh Lpr lFf" class="bg-grey-2 layout-container">
    <q-header borderless class="bg-brand-teal text-white shadow-1 q-safe-area-top">
      <q-toolbar class="q-py-sm q-px-md">
        <q-btn
          flat
          round
          icon="menu"
          size="md"
          class="q-mr-md"
          @click="leftDrawerOpen = !leftDrawerOpen"
        />

        <q-toolbar-title class="text-weight-bolder">
          <div class="row items-center no-wrap q-ml-xs" style="margin-left: -8px">
            <div class="row items-center no-wrap text-subtitle1 text-md-h6">
              <span class="q-mr-xs tracking-tighter text-weight-bolder">AGRA</span>
              <span class="text-weight-bolder text-brand-light-text">ERP</span>
            </div>
          </div>
        </q-toolbar-title>

        <q-space />

        <!-- QUICK APP SWITCHER -->
        <q-btn flat round icon="apps" size="md" class="q-mr-md">
          <q-menu
            auto-close
            anchor="bottom right"
            self="top right"
            :offset="[0, 10]"
            class="app-launcher-menu shadow-10"
          >
            <div class="q-pa-lg bg-white" style="width: 320px; border-radius: 12px">
              <div class="text-overline q-px-sm q-pb-md text-grey-7">Modul Agra ERP</div>
              <div class="row q-col-gutter-md">
                <template v-for="app in filteredUniqueApps" :key="app.aksesKey">
                  <div class="col-4">
                    <q-btn
                      flat
                      stack
                      class="full-width app-btn"
                      :class="{ 'active-app': app.aksesKey === 'konstruksi' }"
                      no-caps
                      :to="app.path"
                    >
                      <q-icon :name="app.icon" :color="app.color || 'primary'" size="36px" />
                      <div class="app-label text-center q-mt-sm">{{ app.name }}</div>
                    </q-btn>
                  </div>
                </template>
              </div>
              <q-separator class="q-my-lg" />
              <q-btn
                outline
                color="teal-6"
                class="full-width text-weight-bold"
                icon="home"
                label="Kembali ke Menu Utama"
                to="/"
                no-caps
                rounded
              />
            </div>
          </q-menu>
        </q-btn>

        <!-- TOPBAR USER PROFILE -->
        <q-btn flat round no-caps class="q-ml-sm">
          <q-avatar
            size="38px"
            color="white"
            text-color="brand-primary"
            class="text-weight-bold shadow-1"
          >
            <img v-if="userData?.fotoUrl" :src="userData.fotoUrl" />
            <span v-else>{{ userData?.nama?.charAt(0) || 'A' }}</span>
          </q-avatar>
          <q-menu
            auto-close
            anchor="bottom right"
            self="top right"
            :offset="[0, 10]"
            class="shadow-10 rounded-12 overflow-hidden"
          >
            <q-list style="min-width: 260px" class="q-pa-sm">
              <q-item class="q-py-md">
                <q-item-section avatar>
                  <q-avatar
                    color="brand-pale"
                    text-color="brand-primary"
                    class="text-weight-bold shadow-sm"
                  >
                    <img v-if="userData?.fotoUrl" :src="userData.fotoUrl" />
                    <span v-else>{{ userData?.nama?.charAt(0) || 'A' }}</span>
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-bold text-brand-primary uppercase">
                    {{ userData?.nama || 'Administrator' }}
                  </q-item-label>
                  <q-item-label caption class="text-blue-grey-6 text-weight-medium">
                    {{ userData?.jabatan || authStore.user?.role || 'Staff User' }}
                  </q-item-label>
                </q-item-section>
              </q-item>
              <q-separator class="q-my-sm" />
              <q-item clickable v-ripple class="rounded-borders" @click="showProfileDialog = true">
                <q-item-section avatar
                  ><q-icon name="person_outline" color="blue-grey-7" size="20px"
                /></q-item-section>
                <q-item-section class="text-weight-medium">Profil Saya</q-item-section>
              </q-item>
              <q-separator class="q-my-sm" />
              <q-item
                clickable
                v-ripple
                class="rounded-borders text-negative"
                @click="handleLogout"
              >
                <q-item-section avatar><q-icon name="logout" size="20px" /></q-item-section>
                <q-item-section class="text-weight-bold">KELUAR SISTEM</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </q-toolbar>
    </q-header>

    <!-- SIDEBAR NAVIGATION -->
    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      :width="330"
      class="custom-sidebar hide-horizontal-scroll"
      elevation="2"
    >
      <div class="column fit hide-horizontal-scroll">
        <!-- USER PROFILE HEADER -->
        <div class="q-pa-lg border-bottom-soft bg-profile-header q-safe-area-top">
          <div class="row items-center q-gutter-md">
            <q-avatar
              size="54px"
              color="brand-teal"
              text-color="white"
              class="font-bold text-h6 shadow-2 profile-avatar"
            >
              <img v-if="userData?.fotoUrl" :src="userData.fotoUrl" />
              <span v-else>{{ userData?.nama?.charAt(0) || 'A' }}</span>
            </q-avatar>
            <div class="col overflow-hidden">
              <div
                class="text-weight-bolder text-subtitle1 ellipsis text-white uppercase"
                style="line-height: 1.2; font-size: 15px"
              >
                {{ userData?.nama || 'Administrator' }}
              </div>
              <div
                class="text-caption ellipsis text-uppercase tracking-widest font-bold q-mt-xs text-glow"
                style="color: rgba(255, 255, 255, 0.85); font-size: 10px; opacity: 0.95"
              >
                {{ userData?.jabatan || authStore.user?.role || 'User' }}
              </div>
            </div>
          </div>
        </div>

        <!-- MAIN SCROLLABLE MENU -->
        <q-scroll-area
          class="col clean-scroll"
          :thumb-style="thumbStyle"
          :horizontal-thumb-style="{ display: 'none', width: '0' }"
          :horizontal-bar-style="{ display: 'none', width: '0' }"
          content-style="width: 100%; overflow-x: hidden;"
          content-active-style="width: 100%; overflow-x: hidden;"
        >
          <q-list class="q-pb-xl q-pt-sm">
            <div class="sidebar-section-title">UTAMA</div>

            <q-item
              v-if="checkPermission('dashboard')"
              clickable
              v-ripple
              to="/konstruksi/dashboard"
              class="menu-item-clean"
              active-class="menu-item-active"
            >
              <q-item-section avatar><q-icon name="space_dashboard" size="22px" /></q-item-section>
              <q-item-section class="menu-text">DASHBOARD</q-item-section>
            </q-item>

            <q-expansion-item
              v-if="
                hasSectionAccess([
                  'marketing/customer',
                  'master/supplier',
                  'master/barang-list',
                  'master/barang-kategori',
                  'master/satuan',
                ])
              "
              icon="widgets"
              label="DATA MASTER"
              class="menu-expansion-clean"
              header-class="menu-expansion-header"
              expand-icon-class="text-brand-teal-icon"
              default-opened
            >
              <q-list>
                <q-expansion-item
                  v-if="hasSectionAccess(['marketing/customer', 'master/supplier'])"
                  header-class="sub-expansion-header"
                  expand-icon-class="text-brand-teal-icon"
                  dense
                  class="level-2-expansion"
                  default-opened
                >
                  <template v-slot:header>
                    <q-item-section avatar
                      ><q-icon name="groups" size="22px" class="icon-sub"
                    /></q-item-section>
                    <q-item-section class="text-weight-semibold sub-expansion-title"
                      >Data Rekanan</q-item-section
                    >
                  </template>
                  <q-list class="sub-list-container">
                    <q-item
                      v-if="checkPermission('marketing/customer')"
                      clickable
                      v-ripple
                      to="/konstruksi/marketing/customer"
                      class="level-3-item-clean"
                      active-class="sub-item-active"
                    >
                      <q-item-section avatar><q-icon name="badge" size="18px" /></q-item-section>
                      <q-item-section class="menu-text">Customer / Klien</q-item-section>
                    </q-item>
                    <q-item
                      v-if="checkPermission('master/supplier')"
                      clickable
                      v-ripple
                      to="/konstruksi/master/supplier"
                      class="level-3-item-clean"
                      active-class="sub-item-active"
                    >
                      <q-item-section avatar
                        ><q-icon name="storefront" size="18px"
                      /></q-item-section>
                      <q-item-section class="menu-text">Data Supplier</q-item-section>
                    </q-item>
                  </q-list>
                </q-expansion-item>

                <q-expansion-item
                  v-if="
                    hasSectionAccess([
                      'master/barang-list',
                      'master/barang-kategori',
                      'master/satuan',
                    ])
                  "
                  header-class="sub-expansion-header"
                  expand-icon-class="text-brand-teal-icon"
                  dense
                  class="level-2-expansion"
                  default-opened
                >
                  <template v-slot:header>
                    <q-item-section avatar
                      ><q-icon name="inventory_2" size="22px" class="icon-sub"
                    /></q-item-section>
                    <q-item-section class="text-weight-semibold sub-expansion-title"
                      >Data Barang</q-item-section
                    >
                  </template>
                  <q-list class="sub-list-container">
                    <q-item
                      v-if="checkPermission('master/barang-list')"
                      clickable
                      v-ripple
                      to="/konstruksi/master/barang-list"
                      class="level-3-item-clean"
                      active-class="sub-item-active"
                    >
                      <q-item-section avatar><q-icon name="category" size="18px" /></q-item-section>
                      <q-item-section class="menu-text">List Barang</q-item-section>
                    </q-item>
                    <q-item
                      v-if="checkPermission('master/barang-kategori')"
                      clickable
                      v-ripple
                      to="/konstruksi/master/barang-kategori"
                      class="level-3-item-clean"
                      active-class="sub-item-active"
                    >
                      <q-item-section avatar><q-icon name="layers" size="18px" /></q-item-section>
                      <q-item-section class="menu-text">Kategori Barang</q-item-section>
                    </q-item>
                    <q-item
                      v-if="checkPermission('master/satuan')"
                      clickable
                      v-ripple
                      to="/konstruksi/master/satuan"
                      class="level-3-item-clean"
                      active-class="sub-item-active"
                    >
                      <q-item-section avatar
                        ><q-icon name="straighten" size="18px"
                      /></q-item-section>
                      <q-item-section class="menu-text">Data Satuan</q-item-section>
                    </q-item>
                  </q-list>
                </q-expansion-item>
              </q-list>
            </q-expansion-item>

            <q-separator inset class="bg-grey-9 q-my-md border-separator" />
            <div class="sidebar-section-title">OPERASIONAL</div>

            <!-- MARKETING -->
            <q-expansion-item
              v-if="
                hasSectionAccess([
                  'marketing/penawaran',
                  'marketing/approval-penawaran',
                  'marketing/ahsp',
                ])
              "
              class="menu-expansion-clean"
              header-class="menu-expansion-header"
              expand-icon-class="text-brand-teal-icon"
            >
              <template v-slot:header>
                <q-item-section avatar>
                  <q-icon name="campaign" size="22px" />
                </q-item-section>
                <q-item-section class="menu-text">MARKETING</q-item-section>
                <q-item-section side v-if="totalMarketingNotifications > 0">
                  <q-badge
                    color="orange-9"
                    rounded
                    class="q-px-sm font-bold shadow-1 animate-bounce"
                  >
                    {{ totalMarketingNotifications }}
                  </q-badge>
                </q-item-section>
              </template>
              <q-list class="q-pb-sm">
                <q-item
                  v-if="checkPermission('marketing/ahsp')"
                  clickable
                  v-ripple
                  to="/konstruksi/marketing/ahsp"
                  class="level-2-item-clean"
                  active-class="sub-item-active"
                >
                  <q-item-section avatar
                    ><q-icon name="calculate" size="20px" class="icon-sub"
                  /></q-item-section>
                  <q-item-section class="menu-text">Analisa AHSP</q-item-section>
                </q-item>
                <q-item
                  v-if="checkPermission('marketing/penawaran')"
                  clickable
                  v-ripple
                  to="/konstruksi/marketing/penawaran"
                  class="level-2-item-clean"
                  active-class="sub-item-active"
                >
                  <q-item-section avatar
                    ><q-icon name="request_quote" size="20px" class="icon-sub"
                  /></q-item-section>
                  <q-item-section class="menu-text">Penawaran</q-item-section>
                  <q-item-section
                    side
                    v-if="rejectedPenawaranCount > 0 || approvedPenawaranCount > 0"
                  >
                    <div class="row items-center q-gutter-x-xs">
                      <q-badge
                        v-if="rejectedPenawaranCount > 0"
                        color="negative"
                        rounded
                        class="q-px-sm font-bold shadow-1 animate-bounce"
                        >{{ rejectedPenawaranCount }}</q-badge
                      >
                      <q-badge
                        v-if="approvedPenawaranCount > 0"
                        color="positive"
                        rounded
                        class="q-px-sm font-bold shadow-1 animate-bounce"
                        >{{ approvedPenawaranCount }}</q-badge
                      >
                    </div>
                  </q-item-section>
                </q-item>
                <q-item
                  v-if="checkPermission('marketing/approval-penawaran')"
                  clickable
                  v-ripple
                  to="/konstruksi/marketing/approval-penawaran"
                  class="level-2-item-clean"
                  active-class="sub-item-active"
                >
                  <q-item-section avatar
                    ><q-icon name="fact_check" size="20px" class="icon-sub"
                  /></q-item-section>
                  <q-item-section class="menu-text">Approval Penawaran</q-item-section>
                  <q-item-section side v-if="pendingApprovalCount > 0">
                    <q-badge
                      color="orange-9"
                      rounded
                      class="q-px-sm font-bold shadow-1 animate-bounce"
                      >{{ pendingApprovalCount }}</q-badge
                    >
                  </q-item-section>
                </q-item>
              </q-list>
            </q-expansion-item>

            <!-- PROYEK -->
            <q-expansion-item
              v-if="
                hasSectionAccess([
                  'master/proyek-data',
                  'master/proyek-monitoring',
                  'master/proyek-kategori',
                ])
              "
              icon="construction"
              label="PROYEK"
              class="menu-expansion-clean"
              header-class="menu-expansion-header"
              expand-icon-class="text-brand-teal-icon"
            >
              <q-list class="q-pb-sm">
                <q-item
                  v-if="checkPermission('master/proyek-data')"
                  clickable
                  v-ripple
                  to="/konstruksi/master/proyek-data"
                  class="level-2-item-clean"
                  active-class="sub-item-active"
                >
                  <q-item-section avatar
                    ><q-icon name="apartment" size="20px" class="icon-sub"
                  /></q-item-section>
                  <q-item-section class="menu-text">Data Proyek</q-item-section>
                </q-item>
                <q-item
                  v-if="checkPermission('master/proyek-monitoring')"
                  clickable
                  v-ripple
                  to="/konstruksi/master/proyek-monitoring"
                  class="level-2-item-clean"
                  active-class="sub-item-active"
                >
                  <q-item-section avatar
                    ><q-icon name="monitor" size="20px" class="icon-sub"
                  /></q-item-section>
                  <q-item-section class="menu-text">Monitoring Proyek</q-item-section>
                </q-item>
                <q-item
                  v-if="checkPermission('master/proyek-kategori')"
                  clickable
                  v-ripple
                  to="/konstruksi/master/proyek-kategori"
                  class="level-2-item-clean"
                  active-class="sub-item-active"
                >
                  <q-item-section avatar
                    ><q-icon name="account_tree" size="20px" class="icon-sub"
                  /></q-item-section>
                  <q-item-section class="menu-text">Kategori Proyek</q-item-section>
                </q-item>
              </q-list>
            </q-expansion-item>

            <!-- GUDANG -->
            <q-item
              v-if="checkPermission('gudang')"
              clickable
              v-ripple
              to="/konstruksi/gudang"
              class="menu-item-clean"
              active-class="menu-item-active"
            >
              <q-item-section avatar><q-icon name="warehouse" size="22px" /></q-item-section>
              <q-item-section class="menu-text">GUDANG & LOGISTIK</q-item-section>
              <q-item-section
                side
                v-if="
                  pendingMutasiCount > 0 ||
                  approvedMutasiCount > 0 ||
                  approvedPrCount > 0 ||
                  rejectedPrCount > 0
                "
              >
                <div class="row items-center q-gutter-x-xs">
                  <q-badge
                    v-if="pendingMutasiCount > 0"
                    color="negative"
                    rounded
                    class="q-px-sm font-bold shadow-1 animate-bounce"
                    title="Permintaan Mutasi Masuk"
                    ><q-icon name="move_to_inbox" size="10px" class="q-mr-xs" />{{
                      pendingMutasiCount
                    }}</q-badge
                  >
                  <q-badge
                    v-if="approvedMutasiCount > 0"
                    color="positive"
                    rounded
                    class="q-px-sm font-bold shadow-1 animate-bounce"
                    title="Barang Mutasi Datang"
                    ><q-icon name="local_shipping" size="10px" class="q-mr-xs" />{{
                      approvedMutasiCount
                    }}</q-badge
                  >
                  <q-badge
                    v-if="approvedPrCount > 0"
                    color="positive"
                    rounded
                    class="q-px-sm font-bold shadow-1 animate-bounce"
                    title="Purchase Request Disetujui"
                    ><q-icon name="done_all" size="10px" class="q-mr-xs" />{{
                      approvedPrCount
                    }}</q-badge
                  >
                  <q-badge
                    v-if="rejectedPrCount > 0"
                    color="negative"
                    rounded
                    class="q-px-sm font-bold shadow-1 animate-bounce"
                    title="Purchase Request Ditolak"
                    ><q-icon name="cancel" size="10px" class="q-mr-xs" />{{
                      rejectedPrCount
                    }}</q-badge
                  >
                </div>
              </q-item-section>
            </q-item>

            <!-- PEMBELIAN -->
            <q-expansion-item
              v-if="hasSectionAccess(['pembelian/pesanan', 'pembelian/approval-po'])"
              class="menu-expansion-clean"
              header-class="menu-expansion-header"
              expand-icon-class="text-brand-teal-icon"
            >
              <template v-slot:header>
                <q-item-section avatar>
                  <q-icon name="shopping_cart" size="22px" />
                </q-item-section>
                <q-item-section class="menu-text">PEMBELIAN</q-item-section>
                <q-item-section side v-if="totalPembelianNotifications > 0">
                  <q-badge
                    color="orange-9"
                    rounded
                    class="q-px-sm font-bold shadow-1 animate-bounce"
                  >
                    {{ totalPembelianNotifications }}
                  </q-badge>
                </q-item-section>
              </template>
              <q-list class="q-pb-sm">
                <q-item
                  v-if="checkPermission('pembelian/pesanan')"
                  clickable
                  v-ripple
                  to="/konstruksi/pembelian/pesanan"
                  class="level-2-item-clean"
                  active-class="sub-item-active"
                >
                  <q-item-section avatar
                    ><q-icon name="receipt_long" size="20px" class="icon-sub"
                  /></q-item-section>
                  <q-item-section class="menu-text">Pesanan Pembelian</q-item-section>
                  <q-item-section side v-if="pendingPrCount > 0">
                    <q-badge
                      color="orange-9"
                      rounded
                      class="q-px-sm font-bold shadow-1 animate-bounce"
                      >{{ pendingPrCount }}</q-badge
                    >
                  </q-item-section>
                </q-item>
                <q-item
                  v-if="checkPermission('pembelian/approval-po')"
                  clickable
                  v-ripple
                  to="/konstruksi/pembelian/approval-po"
                  class="level-2-item-clean"
                  active-class="sub-item-active"
                >
                  <q-item-section avatar
                    ><q-icon name="fact_check" size="20px" class="icon-sub"
                  /></q-item-section>
                  <q-item-section class="menu-text">Approval PO</q-item-section>
                  <q-item-section side v-if="pendingPoCount > 0">
                    <q-badge
                      color="orange-9"
                      rounded
                      class="q-px-sm font-bold shadow-1 animate-bounce"
                      >{{ pendingPoCount }}</q-badge
                    >
                  </q-item-section>
                </q-item>
              </q-list>
            </q-expansion-item>

            <!-- FINANCE -->
            <q-expansion-item
              v-if="
                hasSectionAccess([
                  'finance/invoice',
                  'finance/approval-invoice',
                  'finance/tagihan',
                  'finance/tagihan-supplier',
                  'finance/pengeluaran',
                  'finance/pembayaran',
                  'finance/approval-pembayaran',
                  'finance/realisasi-pembayaran',
                  'finance/balansheet',
                ])
              "
              class="menu-expansion-clean"
              header-class="menu-expansion-header"
              expand-icon-class="text-brand-teal-icon"
              default-opened
            >
              <template v-slot:header>
                <q-item-section avatar>
                  <q-icon name="account_balance_wallet" size="22px" />
                </q-item-section>
                <q-item-section class="menu-text">FINANCE</q-item-section>
                <q-item-section side v-if="totalFinanceNotifications > 0">
                  <q-badge
                    color="orange-9"
                    rounded
                    class="q-px-sm font-bold shadow-1 animate-bounce"
                  >
                    {{ totalFinanceNotifications }}
                  </q-badge>
                </q-item-section>
              </template>
              <q-list class="q-pb-sm">
                <q-item
                  v-if="checkPermission('finance/invoice')"
                  clickable
                  v-ripple
                  to="/konstruksi/finance/invoice"
                  class="level-2-item-clean"
                  active-class="sub-item-active"
                >
                  <q-item-section avatar
                    ><q-icon name="post_add" size="20px" class="icon-sub"
                  /></q-item-section>
                  <q-item-section class="menu-text">Pembuatan Invoice</q-item-section>
                  <q-item-section side v-if="approvedInvoiceCount > 0 || rejectedInvoiceCount > 0">
                    <div class="row items-center q-gutter-x-xs">
                      <q-badge
                        v-if="approvedInvoiceCount > 0"
                        color="positive"
                        rounded
                        class="q-px-sm font-bold shadow-1 animate-bounce"
                        title="Invoice Disetujui"
                        ><q-icon name="done_all" size="10px" class="q-mr-xs" />{{
                          approvedInvoiceCount
                        }}</q-badge
                      >
                      <q-badge
                        v-if="rejectedInvoiceCount > 0"
                        color="negative"
                        rounded
                        class="q-px-sm font-bold shadow-1 animate-bounce"
                        title="Invoice Direject"
                        ><q-icon name="cancel" size="10px" class="q-mr-xs" />{{
                          rejectedInvoiceCount
                        }}</q-badge
                      >
                    </div>
                  </q-item-section>
                </q-item>
                <q-item
                  v-if="checkPermission('finance/approval-invoice')"
                  clickable
                  v-ripple
                  to="/konstruksi/finance/approval-invoice"
                  class="level-2-item-clean"
                  active-class="sub-item-active"
                >
                  <q-item-section avatar
                    ><q-icon name="assignment_turned_in" size="20px" class="icon-sub"
                  /></q-item-section>
                  <q-item-section class="menu-text">Approval Invoice</q-item-section>
                  <q-item-section side v-if="pendingInvoiceApprovalCount > 0">
                    <q-badge
                      color="orange-9"
                      rounded
                      class="q-px-sm font-bold shadow-1 animate-bounce"
                      title="Invoice Menunggu Approval"
                      >{{ pendingInvoiceApprovalCount }}</q-badge
                    >
                  </q-item-section>
                </q-item>
                <q-item
                  v-if="checkPermission('finance/tagihan')"
                  clickable
                  v-ripple
                  to="/konstruksi/finance/tagihan"
                  class="level-2-item-clean"
                  active-class="sub-item-active"
                >
                  <q-item-section avatar
                    ><q-icon name="notifications_active" size="20px" class="icon-sub"
                  /></q-item-section>
                  <q-item-section class="menu-text">Monitoring Tagihan</q-item-section>
                  <q-item-section side v-if="overdueInvoiceCount > 0">
                    <q-badge
                      color="red"
                      rounded
                      class="q-px-sm font-bold shadow-1 animate-bounce"
                      title="Tagihan Jatuh Tempo"
                      ><q-icon name="warning" size="10px" class="q-mr-xs" />{{
                        overdueInvoiceCount
                      }}</q-badge
                    >
                  </q-item-section>
                </q-item>
                <q-item
                  v-if="checkPermission('finance/tagihan-supplier')"
                  clickable
                  v-ripple
                  to="/konstruksi/finance/tagihan-supplier"
                  class="level-2-item-clean"
                  active-class="sub-item-active"
                >
                  <q-item-section avatar
                    ><q-icon name="list_alt" size="20px" class="icon-sub"
                  /></q-item-section>
                  <q-item-section class="menu-text">Tagihan Supplier</q-item-section>
                  <q-item-section side v-if="rejectedTagihanSupplierCount > 0">
                    <q-badge
                      color="negative"
                      rounded
                      class="q-px-sm font-bold shadow-1 animate-bounce"
                      title="Tagihan Ditolak"
                      ><q-icon name="cancel" size="10px" class="q-mr-xs" />{{
                        rejectedTagihanSupplierCount
                      }}</q-badge
                    >
                  </q-item-section>
                </q-item>
                <q-item
                  v-if="
                    checkPermission('finance/form-pengajuan') ||
                    checkPermission('finance/pembayaran')
                  "
                  clickable
                  v-ripple
                  to="/konstruksi/finance/form-pengajuan"
                  class="level-2-item-clean"
                  active-class="sub-item-active"
                >
                  <q-item-section avatar
                    ><q-icon name="note_add" size="20px" class="icon-sub"
                  /></q-item-section>
                  <q-item-section class="menu-text">Form Pengajuan</q-item-section>
                </q-item>
                <q-item
                  v-if="checkPermission('finance/pembayaran')"
                  clickable
                  v-ripple
                  to="/konstruksi/finance/pembayaran"
                  class="level-2-item-clean"
                  active-class="sub-item-active"
                >
                  <q-item-section avatar
                    ><q-icon name="payments" size="20px" class="icon-sub"
                  /></q-item-section>
                  <q-item-section class="menu-text">Pengajuan Pembayaran</q-item-section>
                  <q-item-section
                    side
                    v-if="
                      approvedPaymentRequestCount > 0 ||
                      rejectedPaymentRequestCount > 0 ||
                      draftPaymentRequestCount > 0
                    "
                  >
                    <div class="row items-center q-gutter-x-xs">
                      <q-badge
                        v-if="draftPaymentRequestCount > 0"
                        color="grey-7"
                        rounded
                        class="q-px-sm font-bold shadow-1 animate-bounce"
                        title="Draft Belum Diajukan"
                        ><q-icon name="edit_note" size="10px" class="q-mr-xs" />{{
                          draftPaymentRequestCount
                        }}</q-badge
                      >
                      <q-badge
                        v-if="approvedPaymentRequestCount > 0"
                        color="positive"
                        rounded
                        class="q-px-sm font-bold shadow-1 animate-bounce"
                        title="Pengajuan Disetujui"
                        ><q-icon name="check_circle" size="10px" class="q-mr-xs" />{{
                          approvedPaymentRequestCount
                        }}</q-badge
                      >
                      <q-badge
                        v-if="rejectedPaymentRequestCount > 0"
                        color="negative"
                        rounded
                        class="q-px-sm font-bold shadow-1 animate-bounce"
                        title="Pengajuan Ditolak"
                        ><q-icon name="cancel" size="10px" class="q-mr-xs" />{{
                          rejectedPaymentRequestCount
                        }}</q-badge
                      >
                    </div>
                  </q-item-section>
                </q-item>
                <q-item
                  v-if="checkPermission('finance/approval-pembayaran')"
                  clickable
                  v-ripple
                  to="/konstruksi/finance/approval-pembayaran"
                  class="level-2-item-clean"
                  active-class="sub-item-active"
                >
                  <q-item-section avatar
                    ><q-icon name="gavel" size="20px" class="icon-sub"
                  /></q-item-section>
                  <q-item-section class="menu-text">Approval Pembayaran</q-item-section>
                  <q-item-section
                    side
                    v-if="pendingPaymentApprovalCount > 0 || realizedPaymentApprovalCount > 0"
                  >
                    <div class="row items-center q-gutter-x-xs">
                      <q-badge
                        v-if="pendingPaymentApprovalCount > 0"
                        color="orange-9"
                        rounded
                        class="q-px-sm font-bold shadow-1 animate-bounce"
                        title="Menunggu Persetujuan"
                        >{{ pendingPaymentApprovalCount }}</q-badge
                      >
                      <q-badge
                        v-if="realizedPaymentApprovalCount > 0"
                        color="positive"
                        rounded
                        class="q-px-sm font-bold shadow-1 animate-bounce"
                        title="Telah Direalisasi"
                        ><q-icon name="done_all" size="10px"
                      /></q-badge>
                    </div>
                  </q-item-section>
                </q-item>
                <q-item
                  v-if="checkPermission('finance/realisasi-pembayaran')"
                  clickable
                  v-ripple
                  to="/konstruksi/finance/realisasi-pembayaran"
                  class="level-2-item-clean"
                  active-class="sub-item-active"
                >
                  <q-item-section avatar
                    ><q-icon name="price_check" size="20px" class="icon-sub"
                  /></q-item-section>
                  <q-item-section class="menu-text">Realisasi Pembayaran</q-item-section>
                  <q-item-section side v-if="approvedPaymentRealizationCount > 0">
                    <q-badge
                      color="primary"
                      rounded
                      class="q-px-sm font-bold shadow-1 animate-bounce"
                      title="Siap Dicairkan"
                      >{{ approvedPaymentRealizationCount }}</q-badge
                    >
                  </q-item-section>
                </q-item>
                <q-item
                  v-if="checkPermission('finance/pengeluaran')"
                  clickable
                  v-ripple
                  to="/konstruksi/finance/pengeluaran"
                  class="level-2-item-clean"
                  active-class="sub-item-active"
                >
                  <q-item-section avatar
                    ><q-icon name="trending_down" size="20px" class="icon-sub"
                  /></q-item-section>
                  <q-item-section class="menu-text">Monitoring Pengeluaran</q-item-section>
                </q-item>
                <q-item
                  v-if="checkPermission('finance/balansheet')"
                  clickable
                  v-ripple
                  to="/konstruksi/finance/balansheet"
                  class="level-2-item-clean special-green-item q-mt-sm"
                  active-class="sub-menu-item-active-green"
                >
                  <q-item-section avatar
                    ><q-icon name="account_balance" size="20px" class="icon-sub"
                  /></q-item-section>
                  <q-item-section class="menu-text">Monitoring Balansheet</q-item-section>
                </q-item>
              </q-list>
            </q-expansion-item>

            <!-- ARSIP -->
            <q-expansion-item
              v-if="hasSectionAccess(['arsip/dokumen'])"
              icon="folder_open"
              label="ARSIP"
              class="menu-expansion-clean"
              header-class="menu-expansion-header"
              expand-icon-class="text-brand-teal-icon"
            >
              <q-list class="q-pb-sm">
                <q-item
                  v-if="checkPermission('arsip/dokumen')"
                  clickable
                  v-ripple
                  to="/konstruksi/arsip/dokumen"
                  class="level-2-item-clean"
                  active-class="sub-item-active"
                >
                  <q-item-section avatar
                    ><q-icon name="description" size="20px" class="icon-sub"
                  /></q-item-section>
                  <q-item-section class="menu-text">Dokumen Arsip</q-item-section>
                </q-item>
              </q-list>
            </q-expansion-item>

            <div style="height: 120px"></div>
          </q-list>
        </q-scroll-area>

        <!-- STICKY BOTTOM LOGOUT -->
        <div class="q-pa-md border-top-soft bg-transparent text-center">
          <q-btn
            unelevated
            class="full-width logout-btn rounded-12 text-weight-bolder"
            color="red-1"
            text-color="red-10"
            icon="logout"
            label="Keluar Sistem"
            no-caps
            @click="handleLogout"
          />
        </div>
      </div>
    </q-drawer>

    <!-- DIALOG PROFIL -->
    <q-dialog v-model="showProfileDialog" persistent backdrop-filter="blur(4px)">
      <q-card style="width: 400px; max-width: 90vw" class="rounded-20 shadow-24">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6 text-weight-bold text-brand-primary">Profil Saya</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup color="grey-7" />
        </q-card-section>
        <q-card-section class="q-pt-md">
          <div class="text-center q-mb-md relative-position">
            <q-avatar size="100px" class="shadow-2 border-brand-thin">
              <img v-if="profileForm.previewUrl" :src="profileForm.previewUrl" />
              <img v-else-if="userData?.fotoUrl" :src="userData.fotoUrl" />
              <span v-else class="bg-brand-teal text-white text-h3 font-bold">{{
                userData?.nama?.charAt(0) || 'A'
              }}</span>
            </q-avatar>
          </div>
          <div class="text-center q-mb-lg">
            <div class="text-subtitle1 text-weight-bold uppercase text-blue-grey-10">
              {{ userData?.nama }}
            </div>
            <div class="text-caption text-grey-7 font-bold uppercase tracking-widest">
              {{ userData?.jabatan || authStore.user?.role || 'Staff' }}
            </div>
          </div>
          <q-file
            v-model="profileForm.fileFoto"
            label="Ganti Foto Profil Anda"
            outlined
            dense
            accept="image/*"
            @update:model-value="onProfilePhotoSelected"
            class="q-mb-md"
            color="brand-primary"
          >
            <template v-slot:prepend><q-icon name="photo_camera" color="brand-primary" /></template>
          </q-file>
          <q-input
            v-model="profileForm.passwordBaru"
            label="Password Baru"
            placeholder="Kosongkan jika tidak ingin diubah"
            outlined
            dense
            type="password"
            color="brand-primary"
            class="q-mb-md"
          >
            <template v-slot:prepend><q-icon name="lock" color="brand-primary" /></template>
          </q-input>
        </q-card-section>
        <q-card-actions align="right" class="q-pa-md bg-grey-1 border-top-soft">
          <q-btn
            flat
            label="Batal"
            color="grey-7"
            v-close-popup
            class="rounded-8 text-weight-bold"
          />
          <q-btn
            unelevated
            color="brand-primary"
            label="Simpan Perubahan"
            class="rounded-12 text-weight-bold q-px-lg shadow-4"
            @click="updateProfileInfo"
            :loading="updatingProfile"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-page-container class="no-horizontal-scroll">
      <router-view v-slot="{ Component }">
        <transition
          enter-active-class="animated fadeIn"
          leave-active-class="animated fadeOut"
          mode="out-in"
        >
          <component :is="Component" />
        </transition>
      </router-view>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { auth, db, storage } from 'src/boot/firebase'
import { signOut, updatePassword } from 'firebase/auth'
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import { useAuthStore } from 'src/stores/auth'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const authStore = useAuthStore()
const router = useRouter()
const leftDrawerOpen = ref(false)

const showProfileDialog = ref(false)
const updatingProfile = ref(false)
const profileForm = ref({ fileFoto: null, previewUrl: '', passwordBaru: '' })

// NOTIFIKASI STATE (RAW DATA REFS)
const penawaranDocs = ref([])
const permintaanBarangDocs = ref([])
const invoiceDocs = ref([])
const monitoringTagihanDocs = ref([])
const pembayaranRequestsDocs = ref([])
const tagihanSupplierDocs = ref([])
const poDocsSize = ref(0)

// NOTIFIKASI COMPUTED COUNTS
const pendingApprovalCount = computed(() => {
  return penawaranDocs.value.filter((d) => d.status === 'Pending').length
})

const rejectedPenawaranCount = computed(() => {
  return penawaranDocs.value.filter((d) => d.status === 'Rejected' && d.marketing_read === false)
    .length
})

const approvedPenawaranCount = computed(() => {
  return penawaranDocs.value.filter((d) => d.status === 'Approved' && d.marketing_read === false)
    .length
})

const pendingMutasiCount = computed(() => {
  return permintaanBarangDocs.value.filter(
    (d) => d.tipe === 'ANTAR_GUDANG' && d.status === 'Pending',
  ).length
})

const approvedMutasiCount = computed(() => {
  return permintaanBarangDocs.value.filter(
    (d) => d.tipe === 'ANTAR_GUDANG' && d.status === 'Approved' && d.requester_read === false,
  ).length
})

const pendingPrCount = computed(() => {
  return permintaanBarangDocs.value.filter(
    (d) => d.tipe === 'PURCHASE_REQUEST' && d.status === 'Pending',
  ).length
})

const approvedPrCount = computed(() => {
  const email = authStore.user?.email
  const uid = authStore.user?.uid || authStore.user?.id
  const isAdmin = isSuperAdmin.value || authStore.user?.role === 'Admin'

  return permintaanBarangDocs.value.filter((d) => {
    if (d.tipe === 'PURCHASE_REQUEST' && d.status === 'Approved' && d.requester_read === false) {
      const isMilikku = d.pemohon?.id === uid || d.pemohon?.email === email || isAdmin
      return isMilikku
    }
    return false
  }).length
})

const rejectedPrCount = computed(() => {
  const email = authStore.user?.email
  const uid = authStore.user?.uid || authStore.user?.id
  const isAdmin = isSuperAdmin.value || authStore.user?.role === 'Admin'

  return permintaanBarangDocs.value.filter((d) => {
    if (d.tipe === 'PURCHASE_REQUEST' && d.status === 'Rejected' && d.requester_read === false) {
      const isMilikku = d.pemohon?.id === uid || d.pemohon?.email === email || isAdmin
      return isMilikku
    }
    return false
  }).length
})

const pendingInvoiceApprovalCount = computed(() => {
  return invoiceDocs.value.filter((d) => d.approval_status === 'Pending').length
})

const approvedInvoiceCount = computed(() => {
  const uid = authStore.user?.uid || authStore.user?.id
  const isAdmin = isSuperAdmin.value || authStore.user?.role === 'Admin'

  return invoiceDocs.value.filter((d) => {
    const isMyInvoice = d.creator_id === uid || d.pemohon?.id === uid || isAdmin
    return d.creator_read === false && d.approval_status === 'Approved' && isMyInvoice
  }).length
})

const rejectedInvoiceCount = computed(() => {
  const uid = authStore.user?.uid || authStore.user?.id
  const isAdmin = isSuperAdmin.value || authStore.user?.role === 'Admin'

  return invoiceDocs.value.filter((d) => {
    const isMyInvoice = d.creator_id === uid || d.pemohon?.id === uid || isAdmin
    return d.creator_read === false && d.approval_status === 'Rejected' && isMyInvoice
  }).length
})

const overdueInvoiceCount = computed(() => {
  const todayStr = new Date().toISOString().substr(0, 10)
  return monitoringTagihanDocs.value.filter((d) => {
    return d.status !== 'Lunas' && d.jatuh_tempo && d.jatuh_tempo < todayStr
  }).length
})

const pendingPaymentApprovalCount = computed(() => {
  return pembayaranRequestsDocs.value.filter(
    (d) => d.status === 'Pending' && d.approver_read !== true,
  ).length
})

const approvedPaymentRequestCount = computed(() => {
  const email = authStore.user?.email
  const uid = authStore.user?.uid || authStore.user?.id
  const isAdmin = isSuperAdmin.value || authStore.user?.role === 'Admin'

  return pembayaranRequestsDocs.value.filter((d) => {
    if (d.status === 'Cair' || d.status === 'Approved') {
      const isMyRequest =
        d.creator_id === uid ||
        d.pembuat_id === uid ||
        d.pembuat_email === email ||
        d.pemohon_id === uid ||
        d.pemohon?.id === uid ||
        d.pemohon?.email === email ||
        isAdmin
      return isMyRequest && d.creator_read !== true
    }
    return false
  }).length
})

const rejectedPaymentRequestCount = computed(() => {
  const email = authStore.user?.email
  const uid = authStore.user?.uid || authStore.user?.id
  const isAdmin = isSuperAdmin.value || authStore.user?.role === 'Admin'

  return pembayaranRequestsDocs.value.filter((d) => {
    if (d.status === 'Rejected') {
      const isMyRequest =
        d.creator_id === uid ||
        d.pembuat_id === uid ||
        d.pembuat_email === email ||
        d.pemohon_id === uid ||
        d.pemohon?.id === uid ||
        d.pemohon?.email === email ||
        isAdmin
      return isMyRequest && d.creator_read !== true
    }
    return false
  }).length
})

const draftPaymentRequestCount = computed(() => {
  const email = authStore.user?.email
  const uid = authStore.user?.uid || authStore.user?.id
  const hasAccessToAll =
    isSuperAdmin.value ||
    ['Super Admin', 'Direktur', 'Finance', 'Admin'].includes(authStore.user?.role) ||
    checkPermission('finance/pembayaran')

  return pembayaranRequestsDocs.value.filter((d) => {
    if (d.status === 'Draft') {
      const isMyRequest =
        d.creator_id === uid ||
        d.pembuat_id === uid ||
        d.pembuat_email === email ||
        d.pemohon_id === uid ||
        d.pemohon?.id === uid ||
        d.pemohon?.email === email ||
        hasAccessToAll
      return isMyRequest
    }
    return false
  }).length
})

const approvedPaymentRealizationCount = computed(() => {
  return pembayaranRequestsDocs.value.filter((d) => {
    return (d.status === 'Cair' || d.status === 'Approved') && d.realizer_read !== true
  }).length
})

const realizedPaymentApprovalCount = computed(() => {
  return pembayaranRequestsDocs.value.filter((d) => {
    return (
      (d.status === 'Realisasi' || d.status === 'Selesai' || d.status === 'Cair_Selesai') &&
      d.realized_approved_read !== true
    )
  }).length
})

const rejectedTagihanSupplierCount = computed(() => {
  return tagihanSupplierDocs.value.filter((d) => d.status === 'Ditolak' && d.creator_read === false)
    .length
})

const pendingPoCount = computed(() => poDocsSize.value)

const userData = ref(null)
const apps = ref([])
const currentAkses = ref([])

let unsubUser = null
let unsubApproval = null
let unsubApps = null
let unsubPermintaanAll = null
let unsubPoAll = null
let unsubInvoiceAll = null
let unsubMonitoringTagihan = null
let unsubPembayaranRequests = null
let unsubTagihanSupplier = null

watch(
  () => authStore.user?.email,
  (email) => {
    if (unsubUser) {
      unsubUser()
      unsubUser = null
    }
    if (email) {
      const qUser = query(collection(db, 'karyawan'), where('email', '==', email))
      unsubUser = onSnapshot(qUser, (snapshot) => {
        if (!snapshot.empty) {
          const data = snapshot.docs[0].data()
          userData.value = { id: snapshot.docs[0].id, ...data }
          currentAkses.value = data.akses || []
        }
      })
    }
  },
  { immediate: true },
)

// ============================================================================
// ✅ FIX UTAMA: isSuperAdmin — computed 3 lapis, TIDAK bergantung hanya pada
// authStore.user.role yang bisa tidak konsisten antar akun.
//
// Lapis 1: is_super_admin === true  → flag eksplisit di Firestore (paling reliable)
// Lapis 2: userData.jabatan match   → dari data Firestore realtime
// Lapis 3: authStore.user.role match → fallback dari store login
//
// Dengan computed ini, si Hafid dan akun Super Admin lain akan selalu
// terdeteksi dengan benar meskipun authStore.role-nya kosong/berbeda.
// ============================================================================
const SUPER_ROLES = ['super admin', 'superadmin', 'direktur', 'owner']

const isSuperAdmin = computed(() => {
  // Lapis 1: Cek flag is_super_admin dari Firestore (paling reliable)
  if (userData.value?.is_super_admin === true) return true

  // Lapis 2: Cek jabatan dari userData Firestore (realtime, tidak bergantung login)
  const jabatan = (userData.value?.jabatan || '').toLowerCase().trim()
  if (jabatan && SUPER_ROLES.includes(jabatan)) return true

  // Lapis 3: Fallback ke authStore role (untuk kompatibilitas)
  const roleFromAuth = (authStore.user?.role || '').toLowerCase().trim()
  if (roleFromAuth && SUPER_ROLES.includes(roleFromAuth)) return true

  return false
})

const thumbStyle = {
  right: '2px',
  borderRadius: '4px',
  backgroundColor: '#36ADA3',
  width: '5px',
  opacity: 0.5,
}

// ✅ FIX: canShow pakai isSuperAdmin computed, bukan authStore.user.role langsung
const canShow = (app) => {
  if (!authStore.user) return false
  if (isSuperAdmin.value) return true
  if (app.aksesKey === 'admin') return false
  return currentAkses.value.includes(app.aksesKey)
}

const filteredUniqueApps = computed(() => {
  const uniqueMap = new Map()
  apps.value.forEach((app) => {
    if (!uniqueMap.has(app.aksesKey) && canShow(app)) {
      uniqueMap.set(app.aksesKey, app)
    }
  })
  return Array.from(uniqueMap.values())
})

// ✅ FIX: checkPermission pakai isSuperAdmin computed
const checkPermission = (menuPath) => {
  if (isSuperAdmin.value) return true
  if (!userData.value?.permissions_detail) return false
  const modulePerm = userData.value.permissions_detail.find((m) => m.id === 'konstruksi')
  if (!modulePerm || !modulePerm.isActive) return false
  const targetId = `/konstruksi_${menuPath}`.replace(/\//g, '_')
  const menu = modulePerm.menus.find((m) => m.id === targetId)
  return menu ? menu.lihat : false
}

// ✅ FIX: hasSectionAccess pakai isSuperAdmin computed
const hasSectionAccess = (menuPaths) => {
  if (isSuperAdmin.value) return true
  return menuPaths.some((path) => checkPermission(path))
}

const handleLogout = () => {
  $q.dialog({
    title: '<span class="text-brand-primary text-weight-bold">Konfirmasi Keluar</span>',
    message: 'Apakah Anda yakin ingin mengakhiri sesi AGRA ERP ini?',
    html: true,
    cancel: true,
    ok: { unelevated: true, label: 'Ya, Keluar', color: 'negative', rounded: true },
    persistent: true,
  }).onOk(async () => {
    try {
      await signOut(auth)
      router.push('/login')
    } catch (e) {
      console.error(e)
    }
  })
}

const onProfilePhotoSelected = (file) => {
  profileForm.value.previewUrl = file ? URL.createObjectURL(file) : ''
}

const updateProfileInfo = async () => {
  updatingProfile.value = true
  try {
    let newFotoUrl = userData.value.fotoUrl
    if (profileForm.value.fileFoto) {
      const file = profileForm.value.fileFoto
      const fRef = storageRef(
        storage,
        `karyawan/avatars/${authStore.user.uid}_${Date.now()}_${file.name}`,
      )
      await uploadBytes(fRef, file)
      newFotoUrl = await getDownloadURL(fRef)
      if (newFotoUrl !== userData.value.fotoUrl && userData.value.id) {
        await updateDoc(doc(db, 'karyawan', userData.value.id), { fotoUrl: newFotoUrl })
        userData.value.fotoUrl = newFotoUrl
      }
    }
    if (profileForm.value.passwordBaru) {
      await updatePassword(auth.currentUser, profileForm.value.passwordBaru)
      if (userData.value.id) {
        await updateDoc(doc(db, 'karyawan', userData.value.id), {
          password: profileForm.value.passwordBaru,
        })
      }
    }
    $q.notify({ type: 'positive', position: 'top', message: 'Profil Anda berhasil diperbarui!' })
    showProfileDialog.value = false
    profileForm.value = { fileFoto: null, previewUrl: '', passwordBaru: '' }
  } catch (err) {
    console.error(err)
    if (err.code === 'auth/requires-recent-login') {
      $q.notify({
        type: 'negative',
        position: 'top',
        message: 'Untuk mengubah password, Anda harus logout dan login kembali terlebih dahulu.',
      })
    } else {
      $q.notify({
        type: 'negative',
        position: 'top',
        message: 'Gagal memperbarui profil: ' + err.message,
      })
    }
  } finally {
    updatingProfile.value = false
  }
}

// ============================================================================
// 🔔 REAL-TIME AUDIO & POPUP NOTIFICATIONS (WhatsApp style beep & Speech)
// ============================================================================
const playNotificationBeep = () => {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    if (!AudioContextClass) return
    const ctx = new AudioContextClass()

    // Bunyi pertama (Frekuensi tinggi, durasi singkat)
    const osc1 = ctx.createOscillator()
    const gain1 = ctx.createGain()
    osc1.type = 'sine'
    osc1.frequency.setValueAtTime(880, ctx.currentTime) // A5 note
    gain1.gain.setValueAtTime(0.1, ctx.currentTime)
    gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1)

    osc1.connect(gain1)
    gain1.connect(ctx.destination)
    osc1.start(ctx.currentTime)
    osc1.stop(ctx.currentTime + 0.1)

    // Bunyi kedua (Sedikit jeda, frekuensi lebih tinggi)
    const osc2 = ctx.createOscillator()
    const gain2 = ctx.createGain()
    osc2.type = 'sine'
    osc2.frequency.setValueAtTime(1046.5, ctx.currentTime + 0.12) // C6 note
    gain2.gain.setValueAtTime(0.1, ctx.currentTime + 0.12)
    gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25)

    osc2.connect(gain2)
    gain2.connect(ctx.destination)
    osc2.start(ctx.currentTime + 0.12)
    osc2.stop(ctx.currentTime + 0.25)
  } catch (e) {
    console.warn('Browser blocks Web Audio API autoplay before user interaction:', e)
  }
}

const speakNotification = (message) => {
  if ('speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel() // Hentikan ucapan sebelumnya agar tidak bertumpuk
      const utterance = new SpeechSynthesisUtterance(message)
      utterance.lang = 'id-ID' // Bahasa Indonesia
      utterance.rate = 1.0 // Kecepatan normal
      window.speechSynthesis.speak(utterance)
    } catch (e) {
      console.warn('Gagal memutar Speech Synthesis:', e)
    }
  }
}

const triggerNotificationEffects = (speechText) => {
  playNotificationBeep()
  setTimeout(() => {
    speakNotification(speechText)
  }, 300)
}

const showToastNotification = (title, caption, color, icon) => {
  $q.notify({
    message: title,
    caption: caption,
    color: color,
    icon: icon,
    position: 'top-right',
    timeout: 7000,
    progress: true,
    classes: 'shadow-10 rounded-12 q-py-sm border-white-2',
    actions: [{ icon: 'close', color: 'white', round: true, size: 'sm', dense: true }],
  })
}

onMounted(() => {
  unsubApps = onSnapshot(collection(db, 'modul'), (snapshot) => {
    apps.value = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
  })

  // Notifikasi Marketing
  let initialPenawaran = true
  unsubApproval = onSnapshot(collection(db, 'penawaran'), (snap) => {
    penawaranDocs.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))

    if (!initialPenawaran) {
      const myName = userData.value?.nama || authStore.user?.nama || ''
      const canApprovePenawaran = checkPermission('marketing/approval-penawaran')

      snap.docChanges().forEach((change) => {
        if (change.type === 'added' || change.type === 'modified') {
          const d = change.doc.data()

          // Cek kepemilikan
          const isMyPenawaran =
            d.ttd_nama && myName && d.ttd_nama.toLowerCase().trim() === myName.toLowerCase().trim()

          // 1. Jika Status berubah menjadi Pending (Untuk Approver)
          if (d.status === 'Pending') {
            const isNotMe =
              d.ttd_nama &&
              myName &&
              d.ttd_nama.toLowerCase().trim() !== myName.toLowerCase().trim()
            if (canApprovePenawaran && isNotMe) {
              triggerNotificationEffects(
                `Ada penawaran baru untuk klien ${d.nama_customer || ''} yang memerlukan persetujuan Anda.`,
              )
              showToastNotification(
                'Approval Penawaran',
                `Dokumen No. ${d.nomor} untuk klien ${d.nama_customer || ''} menunggu persetujuan.`,
                'orange-9',
                'gavel',
              )
            }
          }
          // 2. Jika Status berubah menjadi Approved atau Rejected (Untuk Pembuat)
          else if (isMyPenawaran && change.type === 'modified' && d.marketing_read === false) {
            if (d.status === 'Approved') {
              triggerNotificationEffects(
                `Penawaran Anda dengan nomor referensi ${d.nomor} telah disetujui.`,
              )
              showToastNotification(
                'Penawaran Disetujui',
                `Quotation ${d.nomor} untuk klien ${d.nama_customer || ''} telah disetujui.`,
                'positive',
                'check_circle',
              )
            } else if (d.status === 'Rejected') {
              triggerNotificationEffects(
                `Penawaran Anda dengan nomor referensi ${d.nomor} ditolak.`,
              )
              showToastNotification(
                'Penawaran Ditolak',
                `Quotation ${d.nomor} ditolak. Alasan: ${d.alasan_reject || 'Revisi diperlukan.'}`,
                'negative',
                'cancel',
              )
            }
          }
        }
      })
    }
    initialPenawaran = false
  })

  // Permintaan Barang
  let initialPermintaan = true
  unsubPermintaanAll = onSnapshot(collection(db, 'permintaan_barang'), (snap) => {
    permintaanBarangDocs.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))

    if (!initialPermintaan) {
      const email = authStore.user?.email
      const uid = authStore.user?.uid || authStore.user?.id
      const canApprovePr = checkPermission('pembelian/pesanan')
      const canWarehouse = checkPermission('gudang')

      snap.docChanges().forEach((change) => {
        if (change.type === 'added' || change.type === 'modified') {
          const d = change.doc.data()
          const isMyRequest = d.pemohon?.id === uid || d.pemohon?.email === email

          // A. Tipe: PURCHASE_REQUEST
          if (d.tipe === 'PURCHASE_REQUEST') {
            // 1. Pending (Untuk Purchasing)
            if (d.status === 'Pending') {
              const isNotMe = d.pemohon?.email !== email && d.pemohon?.id !== uid
              if (canApprovePr && isNotMe) {
                triggerNotificationEffects(
                  `Ada purchase request baru dari ${d.pemohon?.nama || 'karyawan'} yang memerlukan pemrosesan.`,
                )
                showToastNotification(
                  'Purchase Request Baru',
                  `PR No. ${d.nomor || ''} dari ${d.pemohon?.nama || ''} masuk.`,
                  'orange-9',
                  'shopping_cart',
                )
              }
            }
            // 2. Approved / Rejected (Untuk Pembuat/Pemohon)
            else if (isMyRequest && change.type === 'modified' && d.requester_read === false) {
              if (d.status === 'Approved') {
                triggerNotificationEffects(
                  `Purchase request Anda nomor ${d.nomor || ''} telah disetujui.`,
                )
                showToastNotification(
                  'PR Disetujui',
                  `Purchase Request ${d.nomor || ''} disetujui.`,
                  'positive',
                  'done_all',
                )
              } else if (d.status === 'Rejected') {
                triggerNotificationEffects(`Purchase request Anda nomor ${d.nomor || ''} ditolak.`)
                showToastNotification(
                  'PR Ditolak',
                  `Purchase Request ${d.nomor || ''} ditolak.`,
                  'negative',
                  'cancel',
                )
              }
            }
          }
          // B. Tipe: ANTAR_GUDANG (Mutasi)
          else if (d.tipe === 'ANTAR_GUDANG') {
            // 1. Pending (Untuk Gudang Tujuan / Staff)
            if (d.status === 'Pending') {
              const isNotMe = d.pemohon?.email !== email && d.pemohon?.id !== uid
              if (canWarehouse && isNotMe) {
                triggerNotificationEffects(`Ada permintaan mutasi barang antar gudang baru.`)
                showToastNotification(
                  'Permintaan Mutasi',
                  `Mutasi No. ${d.nomor || ''} memerlukan pemrosesan.`,
                  'orange-9',
                  'move_to_inbox',
                )
              }
            }
            // 2. Approved (Untuk Pembuat)
            else if (
              isMyRequest &&
              change.type === 'modified' &&
              d.status === 'Approved' &&
              d.requester_read === false
            ) {
              triggerNotificationEffects(`Permintaan mutasi barang Anda telah disetujui.`)
              showToastNotification(
                'Mutasi Disetujui',
                `Mutasi ${d.nomor || ''} disetujui dan siap dikirim.`,
                'positive',
                'local_shipping',
              )
            }
          }
        }
      })
    }
    initialPermintaan = false
  })

  // Invoice
  unsubInvoiceAll = onSnapshot(collection(db, 'finance_invoice_customer'), (snap) => {
    invoiceDocs.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  })

  // Monitoring Tagihan
  unsubMonitoringTagihan = onSnapshot(collection(db, 'monitoring_tagihan_spk'), (snap) => {
    monitoringTagihanDocs.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  })

  // Pembayaran
  let initialPembayaran = true
  unsubPembayaranRequests = onSnapshot(collection(db, 'finance_pengajuan_pembayaran'), (snap) => {
    pembayaranRequestsDocs.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))

    if (!initialPembayaran) {
      const uid = authStore.user?.uid || authStore.user?.id
      const email = authStore.user?.email
      const myName = (userData.value?.nama || authStore.user?.nama || '').toLowerCase().trim()
      const canApprovePembayaran = checkPermission('finance/approval-pembayaran')

      snap.docChanges().forEach((change) => {
        if (change.type === 'added' || change.type === 'modified') {
          const d = change.doc.data()

          // Cek kepemilikan
          const isMyRequest =
            d.creator_id === uid ||
            d.pembuat_id === uid ||
            d.pembuat_email === email ||
            d.pemohon_id === uid ||
            d.pemohon?.id === uid ||
            d.pemohon?.email === email

          const isMe =
            (d.pembuat_id && d.pembuat_id === uid) ||
            (d.pembuat_email && d.pembuat_email.toLowerCase().trim() === (email || '').toLowerCase().trim()) ||
            (d.creator_id && d.creator_id === uid) ||
            (d.pembuat_nama && d.pembuat_nama.toLowerCase().trim() === myName)

          const isNotMe = !isMe

          // 1. Jika Draft Baru dibuat (Untuk Staff Finance / Super Admin)
          if (change.type === 'added' && d.status === 'Draft') {
            const hasPembayaranAccess =
              isSuperAdmin.value ||
              ['Super Admin', 'Direktur', 'Finance'].includes(authStore.user?.role) ||
              checkPermission('finance/pembayaran')

            if (hasPembayaranAccess && isNotMe) {
              triggerNotificationEffects(
                `Ada draf pengajuan pembayaran baru dari ${d.pembuat_nama || 'karyawan'} senilai ${d.nominal ? d.nominal.toLocaleString('id-ID') : ''} rupiah.`,
              )
              showToastNotification(
                'Draft Pengajuan Baru',
                `Draf dari ${d.pembuat_nama || ''} dibuat.`,
                'grey-7',
                'edit_note',
              )
            }
          }
          // 2. Jika Status berubah menjadi Pending (Untuk Approver & Pembuat Request)
          else if (d.status === 'Pending' && d.approver_read !== true) {
            const submittedByMe =
              (d.submitted_email && d.submitted_email.toLowerCase().trim() === (email || '').toLowerCase().trim()) ||
              (d.submitted_by && d.submitted_by.toLowerCase().trim() === myName)

            if (!submittedByMe) {
              // A. Untuk Approver (Atasan/Super Admin)
              if (canApprovePembayaran && isNotMe) {
                triggerNotificationEffects(
                  `Ada pengajuan pembayaran baru dari ${d.pembuat_nama || 'karyawan'} senilai ${d.nominal ? d.nominal.toLocaleString('id-ID') : ''} rupiah yang memerlukan persetujuan Anda.`,
                )
                showToastNotification(
                  'Approval Pembayaran',
                  `Request ${d.no_request} dari ${d.pembuat_nama || ''} menunggu persetujuan.`,
                  'orange-9',
                  'gavel',
                )
              }
              // B. Untuk Pembuat/Pekerja (Agar tahu pengajuannya sudah diajukan oleh Finance)
              else if (isMyRequest) {
                triggerNotificationEffects(
                  `Pengajuan pembayaran Anda dengan nomor ${d.no_request} telah diajukan ke atasan.`,
                )
                showToastNotification(
                  'Pengajuan Diajukan',
                  `Request ${d.no_request} telah diajukan oleh Finance ke atasan.`,
                  'info',
                  'send',
                )
              }
            }
          }
          // 3. Jika Status berubah menjadi Approved, Rejected, atau Cair (Untuk Pembuat & Staff Finance terkait)
          else if (change.type === 'modified') {
            const hasPembayaranAccess =
              isSuperAdmin.value ||
              ['Super Admin', 'Direktur', 'Finance'].includes(authStore.user?.role) ||
              checkPermission('finance/pembayaran') ||
              isMyRequest

            if (hasPembayaranAccess) {
              const approvedByMe = d.approvedBy && d.approvedBy.toLowerCase().trim() === myName
              const rejectedByMe = d.rejectedBy && d.rejectedBy.toLowerCase().trim() === myName
              const realizedByMe = d.realizedBy && d.realizedBy.toLowerCase().trim() === myName
              const actionByMe = approvedByMe || rejectedByMe || realizedByMe

              if (!actionByMe) {
                const isUnread =
                  (isMyRequest && d.creator_read === false) ||
                  (checkPermission('finance/realisasi-pembayaran') && d.realizer_read === false) ||
                  (isSuperAdmin.value && (d.creator_read === false || d.realizer_read === false)) ||
                  (checkPermission('finance/pembayaran') && d.creator_read === false)

                if (isUnread) {
                  if (d.status === 'Approved') {
                    const speechText = isMyRequest
                      ? `Pengajuan pembayaran Anda dengan nomor ${d.no_request} telah disetujui.`
                      : `Pengajuan pembayaran nomor ${d.no_request} dari ${d.pembuat_nama || ''} telah disetujui.`
                    triggerNotificationEffects(speechText)
                    showToastNotification(
                      'Pengajuan Disetujui',
                      `Request ${d.no_request} disetujui oleh atasan.`,
                      'positive',
                      'check_circle',
                    )
                  } else if (d.status === 'Rejected') {
                    const speechText = isMyRequest
                      ? `Pengajuan pembayaran Anda dengan nomor ${d.no_request} ditolak.`
                      : `Pengajuan pembayaran nomor ${d.no_request} dari ${d.pembuat_nama || ''} ditolak.`
                    triggerNotificationEffects(speechText)
                    showToastNotification(
                      'Pengajuan Ditolak',
                      `Request ${d.no_request} ditolak. Alasan: ${d.alasan_reject || '-'}`,
                      'negative',
                      'cancel',
                    )
                  } else if (d.status === 'Cair') {
                    const speechText = isMyRequest
                      ? `Pengajuan pembayaran Anda dengan nomor ${d.no_request} telah dicairkan.`
                      : `Pengajuan pembayaran nomor ${d.no_request} dari ${d.pembuat_nama || ''} telah dicairkan.`
                    triggerNotificationEffects(speechText)
                    showToastNotification(
                      'Dana Dicairkan',
                      `Request ${d.no_request} telah direalisasikan (Cair).`,
                      'info',
                      'payments',
                    )
                  }
                }
              }
            }
          }
        }
      })
    }
    initialPembayaran = false
  })

  // Tagihan Supplier
  unsubTagihanSupplier = onSnapshot(collection(db, 'finance_tagihan'), (snap) => {
    tagihanSupplierDocs.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  })

  // Purchase Order
  let initialPo = true
  unsubPoAll = onSnapshot(
    query(collection(db, 'purchase_order'), where('status', '==', 'Submitted')),
    (snap) => {
      poDocsSize.value = snap.size

      if (!initialPo) {
        const canApprovePo = checkPermission('pembelian/approval-po')

        snap.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const d = change.doc.data()
            if (canApprovePo) {
              triggerNotificationEffects(
                `Ada purchase order baru nomor ${d.nomor || ''} yang memerlukan persetujuan Anda.`,
              )
              showToastNotification(
                'Approval PO',
                `PO No. ${d.nomor || ''} membutuhkan persetujuan.`,
                'orange-9',
                'fact_check',
              )
            }
          }
        })
      }
      initialPo = false
    },
  )
})

onUnmounted(() => {
  if (unsubUser) unsubUser()
  if (unsubApproval) unsubApproval()
  if (unsubApps) unsubApps()
  if (unsubPermintaanAll) unsubPermintaanAll()
  if (unsubInvoiceAll) unsubInvoiceAll()
  if (unsubMonitoringTagihan) unsubMonitoringTagihan()
  if (unsubPembayaranRequests) unsubPembayaranRequests()
  if (unsubTagihanSupplier) unsubTagihanSupplier()
  if (unsubPoAll) unsubPoAll()
})

const totalFinanceNotifications = computed(() => {
  let total = 0

  if (checkPermission('finance/invoice')) {
    total += approvedInvoiceCount.value + rejectedInvoiceCount.value
  }
  if (checkPermission('finance/approval-invoice')) {
    total += pendingInvoiceApprovalCount.value
  }
  if (checkPermission('finance/tagihan')) {
    total += overdueInvoiceCount.value
  }
  if (checkPermission('finance/tagihan-supplier')) {
    total += rejectedTagihanSupplierCount.value
  }
  if (checkPermission('finance/pembayaran')) {
    total +=
      approvedPaymentRequestCount.value +
      rejectedPaymentRequestCount.value +
      draftPaymentRequestCount.value
  }
  if (checkPermission('finance/approval-pembayaran')) {
    total += pendingPaymentApprovalCount.value + realizedPaymentApprovalCount.value
  }
  if (checkPermission('finance/realisasi-pembayaran')) {
    total += approvedPaymentRealizationCount.value
  }

  return total
})

const totalMarketingNotifications = computed(() => {
  let total = 0

  if (checkPermission('marketing/penawaran')) {
    total += rejectedPenawaranCount.value + approvedPenawaranCount.value
  }
  if (checkPermission('marketing/approval-penawaran')) {
    total += pendingApprovalCount.value
  }

  return total
})

const totalPembelianNotifications = computed(() => {
  let total = 0

  if (checkPermission('pembelian/pesanan')) {
    total += pendingPrCount.value
  }
  if (checkPermission('pembelian/approval-po')) {
    total += pendingPoCount.value
  }

  return total
})
</script>

<style lang="scss" scoped>
:global(body),
:global(#q-app),
.layout-container {
  overflow-x: hidden !important;
  max-width: 100vw !important;
}
.no-horizontal-scroll {
  overflow-x: hidden !important;
  max-width: 100% !important;
}

.font-bold {
  font-weight: 700;
}
.rounded-8 {
  border-radius: 8px;
}
.rounded-12 {
  border-radius: 12px;
}
.rounded-16 {
  border-radius: 16px;
}
.rounded-20 {
  border-radius: 20px;
}
.border-brand-thin {
  border: 1px solid rgba(54, 173, 163, 0.4);
}

.bg-brand-teal {
  background: linear-gradient(135deg, #36ada3 0%, #2a9089 100%) !important;
}
.text-brand-primary {
  color: #36ada3 !important;
}
.bg-brand-primary {
  background-color: #36ada3 !important;
}

.custom-sidebar,
:deep(.q-drawer),
:deep(.q-drawer__content),
:deep(.q-navigation-deck) {
  background: #ffffff !important;
  color: #2d4a48 !important;
  border-right: 2px solid rgba(54, 173, 163, 0.15) !important;
}

.bg-profile-header {
  background: linear-gradient(135deg, #36ada3 0%, #2a9089 100%) !important;
  position: relative;
  overflow: hidden;
  border-bottom: 2px solid rgba(54, 173, 163, 0.3) !important;
  padding: 24px 20px;
}

.profile-avatar {
  border: 3px solid rgba(255, 255, 255, 0.7);
  box-shadow: 0 0 12px rgba(255, 255, 255, 0.3);
  background-color: #2a9089;
  img {
    object-fit: cover;
  }
}

.text-glow {
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
}

.sidebar-section-title {
  font-size: 11px;
  font-weight: 800;
  color: #1e7a74 !important;
  letter-spacing: 2px;
  margin: 28px 0 14px 24px;
  text-shadow: none;
  position: relative;
  display: flex;
  align-items: center;
  &::before {
    content: '';
    display: inline-block;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: #ad3640;
    margin-right: 10px;
    box-shadow: 0 0 6px rgba(173, 54, 64, 0.4);
  }
}

.menu-text {
  font-weight: 600;
  letter-spacing: 0.1px;
}
.icon-sub {
  color: #36ada3 !important;
}

.menu-item-clean {
  color: #2d4a48 !important;
  margin: 8px 16px;
  border-radius: 12px;
  min-height: 52px;
  padding: 10px 18px;
  background-color: transparent !important;
  border: 1px solid transparent !important;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  :deep(.q-icon) {
    color: #36ada3 !important;
    transition: color 0.25s ease;
  }
  &:hover {
    background-color: rgba(54, 173, 163, 0.08) !important;
    color: #1e7a74 !important;
    transform: translateX(4px);
    border-color: rgba(54, 173, 163, 0.4) !important;
    box-shadow: 0 4px 15px rgba(54, 173, 163, 0.12) !important;
    :deep(.q-icon) {
      color: #36ada3 !important;
    }
  }
}

.menu-item-active {
  background: linear-gradient(135deg, #36ada3 0%, #1e6e69 100%) !important;
  color: #ffffff !important;
  font-weight: 800 !important;
  border: none !important;
  box-shadow: 0 8px 24px rgba(54, 173, 163, 0.35) !important;
  :deep(.q-icon) {
    color: #ffffff !important;
  }
  .menu-text {
    font-weight: 800;
  }
}

.menu-expansion-clean {
  background-color: rgba(54, 173, 163, 0.04) !important;
  border-radius: 12px;
  margin: 8px 16px;
  border: 1px solid rgba(54, 173, 163, 0.1) !important;
  transition: all 0.3s ease;
  :deep(.q-item) {
    border-radius: 12px;
    min-height: 52px;
    color: #2d4a48 !important;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }
  :deep(.q-item__section--avatar .q-icon) {
    color: #36ada3 !important;
  }
  :deep(.q-item:hover) {
    background-color: rgba(54, 173, 163, 0.1) !important;
    color: #1e7a74 !important;
    transform: translateX(3px);
    .q-item__section--avatar .q-icon {
      color: #36ada3 !important;
    }
  }
  &.q-expansion-item--expanded {
    border-color: rgba(54, 173, 163, 0.3) !important;
    background-color: rgba(54, 173, 163, 0.06) !important;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2) !important;
  }
}

.menu-expansion-header {
  font-size: 14px;
  font-weight: 700;
  color: #1e4a47 !important;
  text-shadow: none;
}
.sub-expansion-header {
  font-size: 13.5px;
  font-weight: 600;
  color: #2d4a48 !important;
}
.sub-expansion-title {
  color: #2d4a48 !important;
}

.level-2-expansion {
  margin-bottom: 4px;
  :deep(.q-item) {
    min-height: 48px;
    border-radius: 10px;
    color: #2d4a48 !important;
  }
}

.level-2-item-clean {
  border-radius: 10px;
  margin: 6px 14px 6px 28px;
  min-height: 46px;
  font-size: 13.5px;
  color: #2d4a48 !important;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  .icon-sub {
    color: #36ada3 !important;
  }
  &:hover {
    background-color: rgba(54, 173, 163, 0.1) !important;
    color: #1e7a74 !important;
    transform: translateX(4px);
    .icon-sub {
      color: #36ada3 !important;
    }
  }
}

.level-3-item-clean {
  border-radius: 10px;
  margin: 6px 14px 6px 44px;
  min-height: 42px;
  font-size: 13px;
  color: #3a5a57 !important;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  :deep(.q-icon) {
    color: #36ada3 !important;
    margin-right: 10px;
    transition: color 0.25s ease;
  }
  &:hover {
    background-color: rgba(54, 173, 163, 0.1) !important;
    color: #1e7a74 !important;
    transform: translateX(4px);
    :deep(.q-icon) {
      color: #36ada3 !important;
    }
  }
}

.sub-item-active {
  background-color: rgba(54, 173, 163, 0.18) !important;
  color: #ffffff !important;
  font-weight: 700 !important;
  border: 1px solid rgba(54, 173, 163, 0.5) !important;
  border-radius: 8px;
  :deep(.q-icon),
  .icon-sub {
    color: #36ada3 !important;
    opacity: 1;
    text-shadow: 0 0 8px rgba(54, 173, 163, 0.6);
  }
  .menu-text {
    font-weight: 700;
  }
  &:hover {
    background-color: rgba(54, 173, 163, 0.25) !important;
    color: #ffffff !important;
  }
}

.sub-list-container {
  padding-left: 0;
  border-left: none;
}

.border-top-soft {
  border-top: 1px solid rgba(54, 173, 163, 0.15) !important;
}

.logout-btn {
  font-weight: 700;
  font-size: 13.5px;
  background-color: rgba(173, 54, 64, 0.06) !important;
  border: 1px dashed rgba(173, 54, 64, 0.4) !important;
  color: #ad3640 !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 10px 0;
  &:hover {
    background-color: #ad3640 !important;
    color: #ffffff !important;
    border-style: solid;
    border-color: #ad3640 !important;
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(173, 54, 64, 0.3) !important;
  }
  &:active {
    transform: translateY(0);
  }
}

.notif-item {
  transition: all 0.3s ease;
  border-radius: 8px;
  margin: 4px 8px;
  border: 1px solid transparent;
  &:hover {
    background: #f8fafc;
  }
}

.animate-bounce {
  animation: bounce 1.5s infinite;
}
@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-3px);
  }
}

.special-green-item {
  background-color: rgba(34, 197, 94, 0.05) !important;
  color: #4ade80 !important;
  border: 1px solid rgba(34, 197, 94, 0.15) !important;
  border-radius: 8px;
  :deep(.q-icon) {
    color: #4ade80 !important;
    opacity: 1;
  }
  &:hover {
    background-color: rgba(34, 197, 94, 0.12) !important;
    color: #22c55e !important;
    border-color: rgba(34, 197, 94, 0.4) !important;
    :deep(.q-icon) {
      color: #22c55e !important;
    }
  }
}

.sub-menu-item-active-green {
  background: linear-gradient(135deg, #22c55e 0%, #15803d 100%) !important;
  color: #ffffff !important;
  font-weight: 800 !important;
  border: none !important;
  box-shadow: 0 8px 24px rgba(34, 197, 94, 0.3) !important;
  :deep(.q-icon) {
    color: #ffffff !important;
  }
}

.border-separator {
  height: 1px;
  background-color: rgba(255, 255, 255, 0.06) !important;
}

.hide-horizontal-scroll {
  overflow-x: hidden !important;
}
.clean-scroll :deep(.q-scrollarea__content) {
  overflow-x: hidden !important;
  width: 100% !important;
}
.clean-scroll :deep(.q-scrollarea) {
  overflow-x: hidden !important;
}
::-webkit-scrollbar:horizontal {
  display: none !important;
  height: 0 !important;
  width: 0 !important;
}
</style>
