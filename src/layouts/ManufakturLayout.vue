<template>
  <q-layout
    view="lHh Lpr lFf"
    class="app-layout app-layout--manufacture manufactur-shell min-h-screen overflow-x-hidden"
  >
    <q-header elevated class="app-header app-header--manufacture text-white">
      <q-toolbar class="q-py-sm app-toolbar">
        <q-btn flat dense round icon="menu" @click="toggleLeftDrawer" />
        <q-toolbar-title class="text-weight-bold app-brand">
          AGRA <span class="text-weight-light">ERP</span>
        </q-toolbar-title>
        <q-space />

        <div class="q-gutter-sm row items-center no-wrap app-header-actions">
          <q-btn round flat icon="notifications" class="header-icon-btn">
            <q-badge v-if="newPurchaseRequestCount > 0" color="red" floating>
              {{ newPurchaseRequestCount }}
            </q-badge>
          </q-btn>

          <q-btn round flat icon="apps" class="header-icon-btn">
            <q-menu transition-show="scale" transition-hide="scale" :offset="[0, 15]">
              <div class="q-pa-md app-menu-panel" style="width: 320px">
                <div class="text-overline text-grey-7 q-mb-md">Modul Agra ERP</div>
                <div class="row q-col-gutter-md">
                  <div class="col-4 text-center">
                    <q-btn
                      flat
                      stack
                      color="orange-9"
                      icon="inventory_2"
                      label="Modul Aset"
                      class="full-width text-capitalize"
                      to="/aset"
                    />
                  </div>
                  <div class="col-4 text-center">
                    <q-btn
                      flat
                      stack
                      color="deep-purple"
                      icon="groups"
                      label="Karyawan"
                      class="full-width text-capitalize"
                      to="/karyawan"
                    />
                  </div>
                  <div class="col-4 text-center">
                    <q-btn
                      flat
                      stack
                      color="teal-10"
                      icon="factory"
                      label="Manufacture"
                      class="full-width text-capitalize"
                      to="/manufaktur/dashboard"
                    />
                  </div>
                  <div class="col-4 text-center">
                    <q-btn
                      flat
                      stack
                      color="green-7"
                      icon="badge"
                      label="Absensi"
                      class="full-width text-capitalize"
                      to="/absensi"
                    />
                  </div>
                  <div class="col-4 text-center">
                    <q-btn
                      stack
                      color="blue-1"
                      text-color="primary"
                      icon="engineering"
                      label="Konstruksi"
                      class="full-width text-capitalize shadow-0"
                      to="/konstruksi"
                    />
                  </div>
                </div>
                <q-separator class="q-my-md" />
                <q-btn
                  outline
                  color="primary"
                  icon="home"
                  label="Kembali ke Menu Utama"
                  class="full-width rounded-borders"
                  to="/"
                />
              </div>
            </q-menu>
          </q-btn>

          <q-btn round flat class="header-icon-btn">
            <q-avatar size="32px">
              <img src="https://cdn.quasar.dev/img/boy-avatar.png" />
            </q-avatar>
          </q-btn>
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      :width="272"
      class="sidebar-drawer manufactur-sidebar text-emerald-50"
    >
      <div class="sidebar-profile row items-center no-wrap border-bottom">
        <q-avatar size="40px" color="teal-10" text-color="white" class="text-weight-bold"
          >R</q-avatar
        >
        <div class="sidebar-profile__meta">
          <div class="sidebar-profile__name">Refqi Obeth Sudiarma...</div>
          <div class="sidebar-profile__role">Super Admin</div>
        </div>
      </div>

      <q-scroll-area style="height: calc(100% - 72px)" class="sidebar-scroll">
        <q-list class="menu-list">
          <q-item-label header class="section-title">UTAMA</q-item-label>
          <q-item
            v-if="checkPermission('dashboard')"
            clickable
            v-ripple
            to="/manufaktur/dashboard"
            active-class="active-menu"
            class="menu-item nav-item"
          >
            <q-item-section avatar class="menu-icon"><q-icon name="dashboard" /></q-item-section>
            <q-item-section class="menu-text">Dashboard</q-item-section>
          </q-item>

          <q-separator class="sidebar-separator" />

          <q-item-label header class="section-title">MARKETING SYSTEM</q-item-label>

          <q-expansion-item
            v-if="hasSectionAccess(['penawaran', 'penawaran-approval'])"
            icon="campaign"
            label="Penawaran"
            header-class="nav-group"
            expand-icon-class="nav-expand-icon"
            default-opened
          >
            <q-item
              v-if="checkPermission('penawaran')"
              clickable
              v-ripple
              to="/manufaktur/penawaran"
              active-class="active-menu"
              class="submenu-item"
              dense
            >
              <q-item-section avatar class="submenu-icon"
                ><q-icon name="description" size="xs"
              /></q-item-section>
              <q-item-section class="submenu-text">Quotation</q-item-section>
            </q-item>
            <q-item
              v-if="checkPermission('penawaran-approval')"
              clickable
              v-ripple
              to="/manufaktur/penawaran-approval"
              active-class="active-menu"
              class="submenu-item"
              dense
            >
              <q-item-section avatar class="submenu-icon"
                ><q-icon name="verified" size="xs"
              /></q-item-section>
              <q-item-section class="submenu-text">Approval Penawaran</q-item-section>
              <q-item-section side v-if="pendingCount > 0">
                <q-badge color="orange-9" rounded :label="pendingCount" />
              </q-item-section>
            </q-item>
          </q-expansion-item>

          <q-item-label header class="section-title">PEMBELIAN</q-item-label>

          <q-item
            v-if="checkPermission('ppic/pesanan-pembelian')"
            clickable
            v-ripple
            to="/manufaktur/ppic/pesanan-pembelian"
            active-class="active-menu"
            class="menu-item nav-item"
          >
            <q-item-section avatar class="menu-icon">
              <q-icon name="shopping_cart" />
            </q-item-section>
            <q-item-section class="menu-text">Pesanan Pembelian</q-item-section>
          </q-item>

          <q-item
            v-if="checkPermission('ppic/approval-po-material')"
            clickable
            v-ripple
            to="/manufaktur/ppic/approval-po-material"
            active-class="active-menu"
            class="menu-item nav-item"
          >
            <q-item-section avatar class="menu-icon">
              <q-icon name="approval" />
            </q-item-section>
            <q-item-section class="menu-text">Approval PO Material</q-item-section>
          </q-item>

          <q-item-label header class="section-title">MASTER DATA</q-item-label>

          <q-expansion-item
            icon="dataset"
            label="Master"
            header-class="nav-group"
            expand-icon-class="nav-expand-icon"
          >
            <q-list>
              <q-item
                clickable
                v-ripple
                to="/manufaktur/marketing/customer"
                active-class="active-menu"
                class="submenu-item master-child-item"
                dense
              >
                <q-item-section avatar class="submenu-icon">
                  <q-icon name="person_outline" size="xs" />
                </q-item-section>
                <q-item-section class="submenu-text">Customer</q-item-section>
              </q-item>

              <q-item
                clickable
                v-ripple
                to="/manufaktur/master/supplier"
                active-class="active-menu"
                class="submenu-item master-child-item"
                dense
              >
                <q-item-section avatar class="submenu-icon">
                  <q-icon name="local_shipping" size="xs" />
                </q-item-section>
                <q-item-section class="submenu-text">Data Supplier</q-item-section>
              </q-item>

              <q-expansion-item
                icon="inventory_2"
                label="Data Barang"
                header-class="submenu-group master-child-group"
                expand-icon-class="nav-expand-icon"
                dense
              >
                <q-list>
                  <q-item
                    clickable
                    v-ripple
                    to="/manufaktur/master/barang-list"
                    active-class="active-menu"
                    class="submenu-item master-grandchild-item"
                    dense
                  >
                    <q-item-section avatar class="submenu-icon">
                      <q-icon name="list_alt" size="xs" />
                    </q-item-section>
                    <q-item-section class="submenu-text">List Barang</q-item-section>
                  </q-item>

                  <q-item
                    clickable
                    v-ripple
                    to="/manufaktur/master/barang-kategori"
                    active-class="active-menu"
                    class="submenu-item master-grandchild-item"
                    dense
                  >
                    <q-item-section avatar class="submenu-icon">
                      <q-icon name="category" size="xs" />
                    </q-item-section>
                    <q-item-section class="submenu-text">Kategori Barang</q-item-section>
                  </q-item>

                  <q-item
                    clickable
                    v-ripple
                    to="/manufaktur/master/satuan"
                    active-class="active-menu"
                    class="submenu-item master-grandchild-item"
                    dense
                  >
                    <q-item-section avatar class="submenu-icon">
                      <q-icon name="straighten" size="xs" />
                    </q-item-section>
                    <q-item-section class="submenu-text">Data Satuan</q-item-section>
                  </q-item>
                </q-list>
              </q-expansion-item>

              <q-expansion-item
                icon="engineering"
                label="Master Produksi"
                header-class="submenu-group master-child-group"
                expand-icon-class="nav-expand-icon"
                dense
              >
                <q-list>
                  <q-item
                    clickable
                    v-ripple
                    to="/manufaktur/master-material"
                    active-class="active-menu"
                    class="submenu-item master-grandchild-item"
                    dense
                  >
                    <q-item-section avatar class="submenu-icon">
                      <q-icon name="inventory" size="xs" />
                    </q-item-section>
                    <q-item-section class="submenu-text">Master Material</q-item-section>
                  </q-item>

                  <q-item
                    clickable
                    v-ripple
                    to="/manufaktur/master/master-packing-material"
                    active-class="active-menu"
                    class="submenu-item master-grandchild-item"
                    dense
                  >
                    <q-item-section avatar class="submenu-icon">
                      <q-icon name="inventory_2" size="xs" />
                    </q-item-section>
                    <q-item-section class="submenu-text">Packing Material</q-item-section>
                  </q-item>

                  <q-item
                    clickable
                    v-ripple
                    to="/manufaktur/master/master-standard-packing-product"
                    active-class="active-menu"
                    class="submenu-item master-grandchild-item"
                    dense
                  >
                    <q-item-section avatar class="submenu-icon">
                      <q-icon name="rule" size="xs" />
                    </q-item-section>
                    <q-item-section class="submenu-text">Standard Packing Product</q-item-section>
                  </q-item>

                  <q-item
                    clickable
                    v-ripple
                    to="/manufaktur/master-produksi/tahapan-fabrikasi"
                    active-class="active-menu"
                    class="submenu-item master-grandchild-item"
                    dense
                  >
                    <q-item-section avatar class="submenu-icon">
                      <q-icon name="precision_manufacturing" size="xs" />
                    </q-item-section>
                    <q-item-section class="submenu-text">Tahapan Fabrikasi</q-item-section>
                  </q-item>

                  <q-item
                    clickable
                    v-ripple
                    to="/manufaktur/master-produksi/qc-checklist"
                    active-class="active-menu"
                    class="submenu-item master-grandchild-item"
                    dense
                  >
                    <q-item-section avatar class="submenu-icon">
                      <q-icon name="fact_check" size="xs" />
                    </q-item-section>
                    <q-item-section class="submenu-text">QC Checklist</q-item-section>
                  </q-item>

                  <q-item
                    clickable
                    v-ripple
                    to="/manufaktur/master-produksi/departemen"
                    active-class="active-menu"
                    class="submenu-item master-grandchild-item"
                    dense
                  >
                    <q-item-section avatar class="submenu-icon">
                      <q-icon name="corporate_fare" size="xs" />
                    </q-item-section>
                    <q-item-section class="submenu-text">Departemen</q-item-section>
                  </q-item>
                </q-list>
              </q-expansion-item>
            </q-list>
          </q-expansion-item>

          <q-expansion-item
            icon="inventory_2"
            label="Gudang"
            default-opened
            header-class="nav-group"
            expand-icon-class="nav-expand-icon"
          >
            <q-item
              clickable
              to="/manufaktur/gudang"
              dense
              class="submenu-item"
              active-class="active-menu"
            >
              <q-item-section avatar class="submenu-icon">
                <q-icon name="inventory_2" size="xs" />
              </q-item-section>
              <q-item-section class="submenu-text">Stok Gudang</q-item-section>
            </q-item>
          </q-expansion-item>

          <q-separator class="sidebar-separator" />
          <q-item-label header class="section-title">OPERASIONAL</q-item-label>

          <q-expansion-item
            v-if="
              hasSectionAccess([
                'produksi/project/master',
                'produksi/project/monitoring',
                'produksi/project/kategori',
              ])
            "
            icon="account_tree"
            label="Project"
            header-class="nav-group"
            expand-icon-class="nav-expand-icon"
            :default-opened="isRouteInSection(['/manufaktur/produksi/project'])"
          >
            <q-item
              v-if="checkPermission('produksi/project/master')"
              clickable
              v-ripple
              to="/manufaktur/produksi/project/master"
              active-class="active-menu"
              class="submenu-item"
              dense
            >
              <q-item-section avatar class="submenu-icon">
                <q-icon name="folder_managed" size="xs" />
              </q-item-section>
              <q-item-section class="submenu-text">Master Project</q-item-section>
            </q-item>

            <q-item
              v-if="checkPermission('produksi/project/monitoring')"
              clickable
              v-ripple
              to="/manufaktur/produksi/project/monitoring"
              active-class="active-menu"
              class="submenu-item"
              dense
            >
              <q-item-section avatar class="submenu-icon">
                <q-icon name="monitoring" size="xs" />
              </q-item-section>
              <q-item-section class="submenu-text">Monitoring Project</q-item-section>
            </q-item>

            <q-item
              v-if="checkPermission('produksi/project/kategori')"
              clickable
              v-ripple
              to="/manufaktur/produksi/project/kategori"
              active-class="active-menu"
              class="submenu-item"
              dense
            >
              <q-item-section avatar class="submenu-icon">
                <q-icon name="category" size="xs" />
              </q-item-section>
              <q-item-section class="submenu-text">Kategori Project</q-item-section>
            </q-item>
          </q-expansion-item>

          <q-expansion-item
            v-if="
              hasSectionAccess([
                'ppic/planning-produksi',
                'ppic/material-requirement',
                'ppic/stock-forecast',
                'ppic/forecast-packing-material',
                'ppic/proses-fabrikasi',
              ])
            "
            icon="assignment"
            label="PPIC"
            header-class="nav-group"
            expand-icon-class="nav-expand-icon"
          >
            <q-item
              v-if="checkPermission('ppic/planning-produksi')"
              clickable
              v-ripple
              to="/manufaktur/ppic/planning-produksi"
              active-class="active-menu"
              class="submenu-item"
              dense
            >
              <q-item-section avatar class="submenu-icon"
                ><q-icon name="assignment" size="xs"
              /></q-item-section>
              <q-item-section class="submenu-text">Planning Produksi</q-item-section>
            </q-item>
            <q-item
              v-if="checkPermission('ppic/material-requirement')"
              clickable
              v-ripple
              to="/manufaktur/ppic/material-requirement"
              active-class="active-menu"
              class="submenu-item"
              dense
            >
              <q-item-section avatar class="submenu-icon"
                ><q-icon name="inventory" size="xs"
              /></q-item-section>
              <q-item-section class="submenu-text">Permintaan Material</q-item-section>
            </q-item>
            <q-item
              v-if="checkPermission('ppic/stock-forecast')"
              clickable
              v-ripple
              to="/manufaktur/ppic/stock-forecast"
              active-class="active-menu"
              class="submenu-item"
              dense
            >
              <q-item-section avatar class="submenu-icon"
                ><q-icon name="query_stats" size="xs"
              /></q-item-section>
              <q-item-section class="submenu-text">Stock Forecast</q-item-section>
            </q-item>
            <q-item
              v-if="checkPermission('ppic/forecast-packing-material')"
              clickable
              v-ripple
              to="/manufaktur/ppic/forecast-packing-material"
              active-class="active-menu"
              class="submenu-item"
              dense
            >
              <q-item-section avatar class="submenu-icon"
                ><q-icon name="inventory_2" size="xs"
              /></q-item-section>
              <q-item-section class="submenu-text">Forecast Packing Material</q-item-section>
            </q-item>
            <!-- <q-item
              v-if="checkPermission('ppic/proses-fabrikasi')"
              clickable
              v-ripple
              to="/manufaktur/ppic/proses-fabrikasi"
              active-class="active-menu"
              class="submenu-item"
              dense
            >
              <q-item-section avatar class="submenu-icon"
                ><q-icon name="precision_manufacturing" size="xs"
              /></q-item-section>
              <q-item-section class="submenu-text">Proses Fabrikasi</q-item-section>
            </q-item> -->
          </q-expansion-item>

          <q-expansion-item
            v-if="hasSectionAccess(['departemen', 'produksi/monitoring-produksi'])"
            icon="precision_manufacturing"
            label="Produksi"
            header-class="nav-group"
            expand-icon-class="nav-expand-icon"
            :default-opened="
              isRouteInSection([
                '/manufaktur/departemen',
                '/manufaktur/produksi/monitoring-produksi',
              ])
            "
          >
            <q-item
              v-if="checkPermission('departemen')"
              clickable
              v-ripple
              to="/manufaktur/departemen"
              active-class="active-menu"
              class="submenu-item"
              dense
            >
              <q-item-section avatar class="submenu-icon">
                <q-icon name="corporate_fare" size="xs" />
              </q-item-section>
              <q-item-section class="submenu-text">Departemen</q-item-section>
              <q-item-section side v-if="activeQcRejectCount > 0">
                <q-badge color="negative" rounded class="text-weight-bold">
                  Barang Reject QC {{ activeQcRejectCount }}
                </q-badge>
              </q-item-section>
            </q-item>
            <q-item
              v-if="checkPermission('produksi/monitoring-produksi')"
              clickable
              v-ripple
              to="/manufaktur/produksi/monitoring-produksi"
              active-class="active-menu"
              class="submenu-item"
              dense
            >
              <q-item-section avatar class="submenu-icon">
                <q-icon name="book" size="xs" />
              </q-item-section>
              <q-item-section class="submenu-text">Monitoring Produksi</q-item-section>
            </q-item>
          </q-expansion-item>

          <q-expansion-item
            v-if="hasSectionAccess(['produksi/qc-produksi', 'produksi/packing-produksi'])"
            icon="fact_check"
            label="Quality Control"
            header-class="nav-group"
            expand-icon-class="nav-expand-icon"
            :default-opened="
              isRouteInSection([
                '/manufaktur/produksi/qc-produksi',
                '/manufaktur/produksi/packing-produksi',
              ])
            "
          >
            <q-item
              v-if="checkPermission('produksi/qc-produksi')"
              clickable
              v-ripple
              to="/manufaktur/produksi/qc-produksi"
              active-class="active-menu"
              class="submenu-item"
              dense
            >
              <q-item-section avatar class="submenu-icon"
                ><q-icon name="fact_check" size="xs"
              /></q-item-section>
              <q-item-section class="submenu-text">QC Produksi</q-item-section>
            </q-item>
            <q-item
              v-if="checkPermission('produksi/packing-produksi')"
              clickable
              v-ripple
              to="/manufaktur/produksi/packing-produksi"
              active-class="active-menu"
              class="submenu-item"
              dense
            >
              <q-item-section avatar class="submenu-icon"
                ><q-icon name="inventory_2" size="xs"
              /></q-item-section>
              <q-item-section class="submenu-text">Packing Produksi</q-item-section>
            </q-item>
          </q-expansion-item>

          <q-expansion-item
            v-if="hasSectionAccess(['warehouse/incoming-material', 'warehouse/finished-goods'])"
            icon="warehouse"
            label="Warehouse"
            header-class="nav-group"
            expand-icon-class="nav-expand-icon"
          >
            <q-item
              v-if="checkPermission('warehouse/incoming-material')"
              clickable
              v-ripple
              to="/manufaktur/warehouse/incoming-material"
              active-class="active-menu"
              class="submenu-item"
              dense
            >
              <q-item-section avatar class="submenu-icon"
                ><q-icon name="inventory_2" size="xs"
              /></q-item-section>
              <q-item-section class="submenu-text">Incoming Material</q-item-section>
            </q-item>
            <q-item
              v-if="checkPermission('warehouse/finished-goods')"
              clickable
              v-ripple
              to="/manufaktur/warehouse/finished-goods"
              active-class="active-menu"
              class="submenu-item"
              dense
            >
              <q-item-section avatar class="submenu-icon"
                ><q-icon name="inventory" size="xs"
              /></q-item-section>
              <q-item-section class="submenu-text">Finished Goods</q-item-section>
            </q-item>
          </q-expansion-item>

          <q-expansion-item
            v-if="checkPermission('delivery/surat-jalan')"
            icon="local_shipping"
            label="Delivery"
            header-class="nav-group"
            expand-icon-class="nav-expand-icon"
          >
            <q-item
              clickable
              v-ripple
              to="/manufaktur/delivery/surat-jalan"
              active-class="active-menu"
              class="submenu-item"
              dense
            >
              <q-item-section avatar class="submenu-icon"
                ><q-icon name="local_shipping" size="xs"
              /></q-item-section>
              <q-item-section class="submenu-text">Surat Jalan</q-item-section>
            </q-item>
          </q-expansion-item>

          <q-expansion-item
            v-if="
              hasSectionAccess([
                'finance-manufactur/invoice',
                'finance-manufactur/approval-invoice',
                'finance-manufactur/tagihan',
                'finance-manufactur/tagihan-supplier',
                'finance-manufactur/pembayaran',
                'finance-manufactur/approval-pembayaran',
                'finance-manufactur/realisasi-pembayaran',
                'finance-manufactur/pengeluaran',
                'finance-manufactur/balance-sheet',
              ])
            "
            icon="account_balance_wallet"
            label="Finance"
            header-class="nav-group"
            expand-icon-class="nav-expand-icon"
          >
            <q-item
              v-if="checkPermission('finance-manufactur/invoice')"
              clickable
              v-ripple
              to="/manufaktur/finance/invoice"
              active-class="active-menu"
              class="submenu-item"
              dense
            >
              <q-item-section avatar class="submenu-icon"
                ><q-icon name="request_quote" size="xs"
              /></q-item-section>
              <q-item-section class="submenu-text">Invoice Customer</q-item-section>
            </q-item>
            <q-item
              v-if="checkPermission('finance-manufactur/approval-invoice')"
              clickable
              v-ripple
              to="/manufaktur/finance/approval-invoice"
              active-class="active-menu"
              class="submenu-item"
              dense
            >
              <q-item-section avatar class="submenu-icon"
                ><q-icon name="verified" size="xs"
              /></q-item-section>
              <q-item-section class="submenu-text">Approval Invoice</q-item-section>
            </q-item>
            <q-item
              v-if="checkPermission('finance-manufactur/tagihan')"
              clickable
              v-ripple
              to="/manufaktur/finance/tagihan"
              active-class="active-menu"
              class="submenu-item"
              dense
            >
              <q-item-section avatar class="submenu-icon"
                ><q-icon name="timeline" size="xs"
              /></q-item-section>
              <q-item-section class="submenu-text">Monitoring Tagihan</q-item-section>
            </q-item>
            <q-item
              v-if="checkPermission('finance-manufactur/tagihan-supplier')"
              clickable
              v-ripple
              to="/manufaktur/finance/tagihan-supplier"
              active-class="active-menu"
              class="submenu-item"
              dense
            >
              <q-item-section avatar class="submenu-icon"
                ><q-icon name="receipt_long" size="xs"
              /></q-item-section>
              <q-item-section class="submenu-text">Tagihan Supplier</q-item-section>
            </q-item>
            <q-item
              v-if="checkPermission('finance-manufactur/pembayaran')"
              clickable
              v-ripple
              to="/manufaktur/finance/pembayaran"
              active-class="active-menu"
              class="submenu-item"
              dense
            >
              <q-item-section avatar class="submenu-icon"
                ><q-icon name="payments" size="xs"
              /></q-item-section>
              <q-item-section class="submenu-text">Pengajuan Pembayaran</q-item-section>
            </q-item>
            <q-item
              v-if="checkPermission('finance-manufactur/approval-pembayaran')"
              clickable
              v-ripple
              to="/manufaktur/finance/approval-pembayaran"
              active-class="active-menu"
              class="submenu-item"
              dense
            >
              <q-item-section avatar class="submenu-icon"
                ><q-icon name="fact_check" size="xs"
              /></q-item-section>
              <q-item-section class="submenu-text">Approval Pembayaran</q-item-section>
            </q-item>
            <q-item
              v-if="checkPermission('finance-manufactur/realisasi-pembayaran')"
              clickable
              v-ripple
              to="/manufaktur/finance/realisasi-pembayaran"
              active-class="active-menu"
              class="submenu-item"
              dense
            >
              <q-item-section avatar class="submenu-icon"
                ><q-icon name="account_balance" size="xs"
              /></q-item-section>
              <q-item-section class="submenu-text">Realisasi Pembayaran</q-item-section>
            </q-item>
            <q-item
              v-if="checkPermission('finance-manufactur/pengeluaran')"
              clickable
              v-ripple
              to="/manufaktur/finance/pengeluaran"
              active-class="active-menu"
              class="submenu-item"
              dense
            >
              <q-item-section avatar class="submenu-icon"
                ><q-icon name="trending_down" size="xs"
              /></q-item-section>
              <q-item-section class="submenu-text">Monitoring Pengeluaran</q-item-section>
            </q-item>
            <q-item
              v-if="checkPermission('finance-manufactur/balance-sheet')"
              clickable
              v-ripple
              to="/manufaktur/finance/balance-sheet"
              active-class="active-menu"
              class="submenu-item"
              dense
            >
              <q-item-section avatar class="submenu-icon"
                ><q-icon name="monitoring" size="xs"
              /></q-item-section>
              <q-item-section class="submenu-text">Monitoring Balance Sheet</q-item-section>
            </q-item>
          </q-expansion-item>
        </q-list>
      </q-scroll-area>
    </q-drawer>

    <q-page-container class="app-page-container">
      <router-view v-slot="{ Component, route: viewRoute }">
        <transition name="manufactur-page" mode="out-in">
          <component :is="Component" :key="viewRoute.fullPath" />
        </transition>
      </router-view>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { db } from 'src/boot/firebase'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { useAuthStore } from 'src/stores/auth'

const authStore = useAuthStore()
const route = useRoute()
const leftDrawerOpen = ref(false)
const pendingCount = ref(0)
const newPurchaseRequestCount = ref(0)
const activeQcRejectCount = ref(0)
const userData = ref(null)
let unsub = null
let unsubPurchaseRequest = null
let unsubQcReject = null
let unsubUser = null

const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

const checkPermission = (path) => {
  if (!path) return true
  return true
}

const hasSectionAccess = (menuPaths) => {
  if (authStore.user?.role === 'Super Admin') return true
  return menuPaths.some((path) => checkPermission(path))
}

const isRouteInSection = (paths) =>
  paths.some((path) => route.path === path || route.path.startsWith(`${path}/`))

onMounted(() => {
  const q = query(collection(db, 'penawaran_manufaktur'), where('status', '==', 'Pending'))
  unsub = onSnapshot(q, (snap) => {
    pendingCount.value = snap.size
  })

  const qPurchaseRequest = query(
    collection(db, 'manufactur_gudang_notifications'),
    where('type', '==', 'PR_BARU_DARI_PPIC'),
    where('is_read_gudang', '==', 0),
  )
  unsubPurchaseRequest = onSnapshot(qPurchaseRequest, (snap) => {
    newPurchaseRequestCount.value = snap.size
  })

  const qQcReject = query(
    collection(db, 'produksi_rework_queue'),
    where('status_rework', 'in', ['menunggu_rework', 'diproses_ulang', 'pending_qc_ulang']),
  )
  unsubQcReject = onSnapshot(qQcReject, (snap) => {
    activeQcRejectCount.value = snap.size
  })

  const userEmail = authStore.user?.email
  if (userEmail) {
    const qUser = query(collection(db, 'karyawan'), where('email', '==', userEmail))
    unsubUser = onSnapshot(qUser, (snapshot) => {
      userData.value = snapshot.empty ? null : snapshot.docs[0].data()
    })
  }
})

onUnmounted(() => {
  if (unsub) unsub()
  if (unsubPurchaseRequest) unsubPurchaseRequest()
  if (unsubQcReject) unsubQcReject()
  if (unsubUser) unsubUser()
})
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Poppins:wght@300;400;500;600;700&display=swap');
</style>

<style scoped>
/* ============================================================
   MANUFACTURING PREMIUM DARK THEME — Design System
   Background : #071826  |  Card: rgba(13,34,51,0.88)
   Green Neon  : #7CFF4F |  Cyan : #00D1B2
   Text        : #F4F7FA |  Muted: #8CA3B8
   ============================================================ */

.app-layout {
  position: relative;
  min-height: 100vh;
  overflow-x: hidden;
  background: #071826;
  max-width: 100vw;
}
.app-layout--manufacture {
  isolation: isolate;
}
.app-layout--manufacture::before,
.app-layout--manufacture::after {
  position: fixed;
  z-index: 0;
  width: 420px;
  height: 420px;
  border-radius: 999px;
  pointer-events: none;
  content: '';
}
.app-layout--manufacture::before {
  top: 86px;
  right: 7vw;
  background: radial-gradient(circle, rgba(124, 255, 79, 0.1), transparent 64%);
  animation: manufactur-soft-float 18s ease-in-out infinite;
}
.app-layout--manufacture::after {
  bottom: -120px;
  left: 17vw;
  background: radial-gradient(circle, rgba(0, 209, 178, 0.08), transparent 66%);
  animation: manufactur-soft-float 22s ease-in-out infinite reverse;
}
.app-header {
  position: relative;
  z-index: 2;
}
.app-header--manufacture {
  background: rgba(7, 24, 38, 0.96);
  border-bottom: 1px solid rgba(0, 209, 178, 0.18);
  box-shadow: 0 4px 32px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}
.app-toolbar {
  min-height: 66px;
}
.app-brand {
  letter-spacing: 1.5px;
  color: #F4F7FA;
  font-family: 'Inter', sans-serif;
  font-weight: 800;
}
.app-header-actions {
  padding: 6px 10px;
  border-radius: 14px;
  background: rgba(13, 34, 51, 0.6);
  border: 1px solid rgba(0, 209, 178, 0.2);
}
.header-icon-btn {
  transition:
    transform 180ms ease,
    background-color 180ms ease,
    box-shadow 180ms ease;
  color: #F4F7FA !important;
}
.header-icon-btn:hover {
  transform: translateY(-2px);
  background: rgba(124, 255, 79, 0.12);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
}
.header-icon-btn:active {
  transform: translateY(0) scale(0.96);
}
.app-menu-panel {
  background: #0d2233;
  border: 1px solid rgba(0, 209, 178, 0.2);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.5);
  border-radius: 16px;
}
.app-page-container {
  position: relative;
  z-index: 1;
  background: transparent;
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
}
.manufactur-page-enter-active,
.manufactur-page-leave-active {
  transition:
    opacity 180ms ease,
    transform 180ms ease;
}
.manufactur-page-enter-from {
  opacity: 0;
  transform: translate3d(0, 6px, 0);
}
.manufactur-page-leave-to {
  opacity: 0;
  transform: translate3d(0, -4px, 0);
}
.app-page-container :deep(.q-page) {
  background: transparent !important;
  color: #F4F7FA;
  width: 100%;
  max-width: none !important;
  font-family: 'Inter', 'Poppins', sans-serif;
}
.app-page-container :deep(.q-page > *) {
  max-width: none !important;
}
.app-page-container :deep(.container),
.app-page-container :deep(.page-container),
.app-page-container :deep(.content-container),
.app-page-container :deep(.main-container),
.app-page-container :deep(.dashboard-container) {
  width: 100% !important;
  max-width: none !important;
}
.app-page-container :deep(.q-card),
.app-page-container :deep(.q-table__container),
.app-page-container :deep(.q-table__middle),
.app-page-container :deep(.q-markup-table),
.app-page-container :deep(table) {
  max-width: 100% !important;
}
.app-page-container :deep(.q-table__container),
.app-page-container :deep(.q-table__middle) {
  width: 100% !important;
}
.app-page-container :deep(.q-table) {
  width: 100%;
}
:global(body:has(.app-layout--manufacture)),
:global(body:has(.app-layout--manufacture) #q-app) {
  overflow-x: hidden !important;
  max-width: 100vw !important;
}
:global(body:has(.app-layout--manufacture) .q-dialog__inner--minimized > div) {
  max-width: min(96vw, 1120px) !important;
}
:global(body:has(.app-layout--manufacture) .q-dialog__inner--minimized .q-card) {
  width: min(96vw, 1120px);
}
:global(body:has(.app-layout--manufacture) .q-dialog__inner--minimized .q-card.master-dialog) {
  width: min(96vw, 1120px) !important;
}
:global(body:has(.app-layout--manufacture) .q-dialog__inner--minimized .q-card.detail-dialog) {
  width: min(94vw, 920px) !important;
}
.manufactur-shell {
  color: #F4F7FA;
}
.manufactur-sidebar {
  color: #F4F7FA;
}
/* ==== CARD GLOBAL OVERRIDES ==== */
:global(body:has(.app-layout--manufacture) .manufactur-card),
:global(body:has(.app-layout--manufacture) .manufactur-filter),
:global(body:has(.app-layout--manufacture) .manufactur-table),
:global(body:has(.app-layout--manufacture) .manufactur-stat-card) {
  border: 1px solid rgba(124, 255, 79, 0.12);
  background: rgba(13, 34, 51, 0.88);
  color: #F4F7FA;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  transition:
    transform 200ms ease,
    border-color 200ms ease,
    box-shadow 200ms ease;
  will-change: transform;
}
:global(body:has(.app-layout--manufacture) .manufactur-card:hover),
:global(body:has(.app-layout--manufacture) .manufactur-stat-card:hover),
:global(body:has(.app-layout--manufacture) .q-page .q-card:hover) {
  transform: translateY(-3px);
  border-color: rgba(124, 255, 79, 0.35);
  box-shadow:
    0 20px 48px rgba(0, 0, 0, 0.45),
    0 0 0 1px rgba(124, 255, 79, 0.2),
    0 0 24px rgba(124, 255, 79, 0.08);
}
:global(body:has(.app-layout--manufacture) .manufactur-card) {
  border-radius: 16px;
}
:global(body:has(.app-layout--manufacture) .manufactur-filter) {
  border-radius: 16px;
}
:global(body:has(.app-layout--manufacture) .manufactur-table) {
  overflow: hidden;
  border-radius: 16px;
}
:global(body:has(.app-layout--manufacture) .manufactur-stat-card) {
  border-radius: 16px;
}
/* All q-card inside manufacturing → dark glass */
:global(body:has(.app-layout--manufacture) .q-page .q-card) {
  background: rgba(13, 34, 51, 0.88) !important;
  border: 1px solid rgba(124, 255, 79, 0.1);
  border-radius: 16px;
  color: #F4F7FA;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);
  transition:
    transform 200ms ease,
    border-color 200ms ease,
    box-shadow 200ms ease;
}
:global(body:has(.app-layout--manufacture) .q-page .q-card__section) {
  color: #F4F7FA;
}
/* ==== TABLE GLOBAL OVERRIDES ==== */
:global(body:has(.app-layout--manufacture) .q-page .q-table__container) {
  overflow: hidden;
  background: rgba(13, 34, 51, 0.88) !important;
  border: 1px solid rgba(124, 255, 79, 0.1);
  border-radius: 16px;
  color: #F4F7FA;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);
}
:global(body:has(.app-layout--manufacture) .q-page .q-markup-table),
:global(body:has(.app-layout--manufacture) .q-page .q-table__middle) {
  background: transparent !important;
  color: #F4F7FA;
}
:global(body:has(.app-layout--manufacture) .q-table__top),
:global(body:has(.app-layout--manufacture) .q-table__bottom) {
  background: rgba(13, 34, 51, 0.95) !important;
  color: #8CA3B8;
}
/* Table header: dark with cyan accent */
:global(body:has(.app-layout--manufacture) .q-table thead tr),
:global(body:has(.app-layout--manufacture) .q-table thead th) {
  background: rgba(0, 209, 178, 0.08) !important;
  color: #00D1B2 !important;
  font-weight: 700;
  font-size: 11px;
  letter-spacing: 0.9px;
  text-transform: uppercase;
  border-bottom: 1px solid rgba(0, 209, 178, 0.18) !important;
}
/* Table rows: dark with neon hover */
:global(body:has(.app-layout--manufacture) .q-table tbody tr) {
  background: transparent;
  border-bottom: 1px solid rgba(124, 255, 79, 0.05);
  transition: background-color 150ms ease;
}
:global(body:has(.app-layout--manufacture) .q-table tbody tr:hover) {
  background: rgba(124, 255, 79, 0.05);
}
:global(body:has(.app-layout--manufacture) .q-table tbody td) {
  color: #F4F7FA !important;
}
/* ==== INPUT GLOBAL OVERRIDES ==== */
:global(body:has(.app-layout--manufacture) .q-field--outlined .q-field__control) {
  background: rgba(13, 34, 51, 0.7) !important;
}
:global(body:has(.app-layout--manufacture) .q-field--outlined:not(.q-field--focused) .q-field__control) {
  border-color: rgba(124, 255, 79, 0.2);
}
:global(body:has(.app-layout--manufacture) .q-field--outlined.q-field--focused .q-field__control) {
  border-color: #00D1B2;
}
:global(body:has(.app-layout--manufacture) .q-field__label),
:global(body:has(.app-layout--manufacture) .q-field__native),
:global(body:has(.app-layout--manufacture) .q-field__input),
:global(body:has(.app-layout--manufacture) .q-field__prefix),
:global(body:has(.app-layout--manufacture) .q-field__suffix) {
  color: #F4F7FA;
}
:global(body:has(.app-layout--manufacture) .q-field--float .q-field__label) {
  color: #7CFF4F;
}
/* ==== DIALOG OVERRIDES ==== */
:global(body:has(.app-layout--manufacture) .q-dialog__backdrop) {
  background: rgba(7, 24, 38, 0.85) !important;
}
:global(body:has(.app-layout--manufacture) .q-dialog .q-card) {
  background: rgba(10, 28, 44, 0.98) !important;
  border: 1px solid rgba(0, 209, 178, 0.2) !important;
  color: #F4F7FA;
}
:global(body:has(.app-layout--manufacture) .q-dialog .q-toolbar) {
  background: rgba(0, 209, 178, 0.08);
  border-bottom: 1px solid rgba(0, 209, 178, 0.15);
  color: #F4F7FA;
}
:global(body:has(.app-layout--manufacture) .q-dialog .q-card__actions) {
  background: rgba(7, 24, 38, 0.5);
  border-top: 1px solid rgba(124, 255, 79, 0.1);
}
/* ==== BUTTON OVERRIDES ==== */
:global(body:has(.app-layout--manufacture) .q-btn) {
  transition:
    transform 160ms ease,
    box-shadow 180ms ease,
    background-color 180ms ease,
    filter 180ms ease;
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  letter-spacing: 0.3px;
}
:global(body:has(.app-layout--manufacture) .q-btn:not(.q-btn--flat):not(.q-btn--outline)) {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
}
:global(body:has(.app-layout--manufacture) .q-btn:hover) {
  transform: translateY(-1px);
  filter: brightness(1.1) saturate(1.1);
}
:global(body:has(.app-layout--manufacture) .q-btn:active) {
  transform: translateY(0) scale(0.97);
}
:global(body:has(.app-layout--manufacture) .q-table .q-btn:hover),
:global(body:has(.app-layout--manufacture) .q-table .q-icon:hover) {
  transform: scale(1.06);
}
/* Convert green-10 Quasar class to neon green for manufacturing */
:global(body:has(.app-layout--manufacture) .text-green-10) {
  color: #7CFF4F !important;
}
:global(body:has(.app-layout--manufacture) .q-page .bg-green-10:not(.q-table thead tr):not(.q-table thead th)) {
  background: linear-gradient(135deg, rgba(124,255,79,0.2), rgba(0,209,178,0.15)) !important;
  color: #071826 !important;
}
:global(body:has(.app-layout--manufacture) .q-table thead .bg-green-10) {
  background: rgba(0, 209, 178, 0.08) !important;
  color: #00D1B2 !important;
}
/* Unelevated green-10 buttons → neon gradient */
:global(body:has(.app-layout--manufacture) .q-btn.bg-green-10) {
  background: linear-gradient(135deg, #7CFF4F 0%, #52C41A 100%) !important;
  color: #071826 !important;
  box-shadow: 0 4px 16px rgba(124, 255, 79, 0.35) !important;
}
:global(body:has(.app-layout--manufacture) .q-btn.bg-green-10:hover) {
  box-shadow: 0 8px 24px rgba(124, 255, 79, 0.5) !important;
}
/* Flat green-10 buttons → neon text */
:global(body:has(.app-layout--manufacture) .q-btn.text-green-10) {
  color: #7CFF4F !important;
}
/* bg-white on cards → transparent (card bg handled by q-card override) */
:global(body:has(.app-layout--manufacture) .q-page .q-card.bg-white) {
  background: rgba(13, 34, 51, 0.88) !important;
}
/* grey text → muted */
:global(body:has(.app-layout--manufacture) .q-page .text-grey-7) {
  color: #8CA3B8 !important;
}
:global(body:has(.app-layout--manufacture) .q-page .text-grey-6) {
  color: #8CA3B8 !important;
}
/* app-menu-panel text */
:global(body:has(.app-layout--manufacture) .app-menu-panel .text-grey-7) {
  color: #8CA3B8 !important;
}
:global(body:has(.app-layout--manufacture) .app-menu-panel) {
  color: #F4F7FA;
}
/* ==== SKELETON ==== */
:global(body:has(.app-layout--manufacture) .q-skeleton) {
  position: relative;
  overflow: hidden;
  background: rgba(124, 255, 79, 0.05);
}
:global(body:has(.app-layout--manufacture) .q-skeleton::after) {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgba(124, 255, 79, 0.1), transparent);
  transform: translateX(-100%);
  animation: manufactur-shimmer 1.8s ease-in-out infinite;
  content: '';
}
:global(body:has(.app-layout--manufacture) .q-table__bottom--nodata) {
  min-height: 132px;
  color: #8CA3B8;
  font-weight: 600;
}
:global(body:has(.app-layout--manufacture) .q-table__bottom--nodata::before) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  margin-right: 10px;
  border-radius: 999px;
  background: rgba(124, 255, 79, 0.1);
  color: #7CFF4F;
  font-family: 'Material Icons';
  font-size: 24px;
  vertical-align: middle;
  content: 'inventory_2';
}
/* ==== SEPARATOR ==== */
:global(body:has(.app-layout--manufacture) .q-page .q-separator) {
  background: rgba(124, 255, 79, 0.1);
}
/* ==== CHIPS ==== */
:global(body:has(.app-layout--manufacture) .q-chip) {
  font-family: 'Inter', sans-serif;
  font-weight: 600;
}
/* ==== CUSTOM SCROLLBAR ==== */
:global(body:has(.app-layout--manufacture) ::-webkit-scrollbar) {
  width: 5px;
  height: 5px;
}
:global(body:has(.app-layout--manufacture) ::-webkit-scrollbar-track) {
  background: rgba(7, 24, 38, 0.3);
}
:global(body:has(.app-layout--manufacture) ::-webkit-scrollbar-thumb) {
  background: rgba(0, 209, 178, 0.3);
  border-radius: 999px;
}
:global(body:has(.app-layout--manufacture) ::-webkit-scrollbar-thumb:hover) {
  background: rgba(0, 209, 178, 0.5);
}
/* ==== TABS ==== */
:global(body:has(.app-layout--manufacture) .q-tabs) {
  color: #8CA3B8;
}
:global(body:has(.app-layout--manufacture) .q-tab--active) {
  color: #7CFF4F;
}
:global(body:has(.app-layout--manufacture) .q-tabs__indicator) {
  color: #7CFF4F;
  background: #7CFF4F;
}
/* ==== TIMELINE ==== */
:global(body:has(.app-layout--manufacture) .q-timeline__dot) {
  background: #00D1B2;
}
:global(body:has(.app-layout--manufacture) .q-timeline__line) {
  background: rgba(0, 209, 178, 0.2);
}
.border-bottom {
  border-bottom: 1px solid rgba(0, 209, 178, 0.12);
}
.sidebar-drawer {
  color: #F4F7FA;
  transition:
    width 0.24s ease,
    transform 0.24s ease;
}
.sidebar-drawer :deep(.q-drawer) {
  color: #F4F7FA;
  background: #0a1e2e;
  border-right: 1px solid rgba(0, 209, 178, 0.1);
  box-shadow: 4px 0 24px rgba(0, 0, 0, 0.4);
  transition:
    width 0.24s ease,
    transform 0.24s ease;
}
.sidebar-drawer :deep(.q-drawer__content) {
  color: #F4F7FA;
  background: #0a1e2e;
}
.sidebar-drawer :deep(.q-list) {
  color: #ffffff;
}
.sidebar-drawer :deep(.q-item) {
  color: #ffffff;
}
.sidebar-drawer :deep(.q-item__label) {
  color: inherit;
}
.sidebar-drawer :deep(.q-icon) {
  color: inherit;
}
.sidebar-profile {
  min-height: 72px;
  padding: 12px 16px;
  gap: 10px;
  background: linear-gradient(135deg, rgba(10, 30, 46, 1) 60%, rgba(0, 209, 178, 0.06));
  border-bottom: 1px solid rgba(0, 209, 178, 0.1);
}
.sidebar-profile__meta {
  min-width: 0;
  line-height: 1.2;
}
.sidebar-profile__name {
  max-width: 184px;
  overflow: hidden;
  color: #F4F7FA;
  font-size: 13px;
  font-weight: 700;
  font-family: 'Inter', sans-serif;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.sidebar-profile__role {
  margin-top: 3px;
  color: #7CFF4F;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.8px;
  text-transform: uppercase;
}
.sidebar-scroll {
  background: #0a1e2e;
}
.menu-list {
  padding: 10px 10px 16px;
}
.section-title {
  min-height: auto;
  margin: 10px 4px 6px;
  padding: 0 10px;
  color: rgba(0, 209, 178, 0.55);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1.5px;
  line-height: 1;
  font-family: 'Inter', sans-serif;
}
.sidebar-separator {
  margin: 10px 8px 4px;
  background: rgba(124, 255, 79, 0.1);
}
.menu-item {
  min-height: 38px;
  margin: 3px 2px;
  padding: 0 12px;
  border: 1px solid transparent;
  border-radius: 12px;
  color: #8CA3B8;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0;
  font-family: 'Inter', sans-serif;
  transition:
    background 0.18s ease,
    border-color 0.18s ease,
    color 0.18s ease,
    box-shadow 0.18s ease,
    transform 0.18s ease;
}
.menu-item:hover,
.submenu-item:hover,
:deep(.submenu-group:hover),
:deep(.nav-group:hover) {
  background: rgba(124, 255, 79, 0.08);
  border-color: rgba(124, 255, 79, 0.2);
  color: #F4F7FA;
  box-shadow: none;
}
.menu-item:hover,
.submenu-item:hover,
:deep(.submenu-group:hover),
:deep(.nav-group:hover) {
  transform: translateX(3px);
}
.menu-icon,
.submenu-icon {
  min-width: 30px;
  padding-right: 8px;
  color: inherit;
  align-items: center;
  justify-content: center;
}
.menu-item:hover .menu-icon,
.submenu-item:hover .submenu-icon,
:deep(.submenu-group:hover .q-item__section--avatar),
:deep(.nav-group:hover .q-item__section--avatar) {
  transform: translateX(2px) scale(1.04);
}
.menu-icon :deep(.q-icon) {
  font-size: 19px;
}
.menu-text,
.submenu-text {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.submenu-item {
  min-height: 34px;
  margin: 2px 2px 2px 18px;
  padding: 0 11px;
  border: 1px solid transparent;
  border-radius: 12px;
  color: #8CA3B8;
  font-size: 12.5px;
  font-weight: 500;
  letter-spacing: 0;
  font-family: 'Inter', sans-serif;
  transition:
    background 0.18s ease,
    border-color 0.18s ease,
    color 0.18s ease,
    box-shadow 0.18s ease,
    transform 0.18s ease;
}
.submenu-icon {
  min-width: 24px;
  padding-right: 7px;
  color: #00D1B2;
}
.submenu-icon :deep(.q-icon) {
  font-size: 16px;
}
.submenu-item:hover .submenu-icon {
  color: #7CFF4F;
}
:deep(.submenu-group) {
  min-height: 34px;
  margin: 2px 2px 2px 18px;
  padding: 0 11px;
  border: 1px solid transparent;
  border-radius: 12px;
  color: #8CA3B8;
  font-size: 12.5px;
  font-weight: 600;
  letter-spacing: 0;
  font-family: 'Inter', sans-serif;
  transition:
    background 0.18s ease,
    border-color 0.18s ease,
    color 0.18s ease,
    box-shadow 0.18s ease,
    transform 0.18s ease;
}
:deep(.submenu-group .q-item__section--avatar) {
  min-width: 24px;
  padding-right: 7px;
  color: #00D1B2;
}
:deep(.submenu-group .q-item__label) {
  min-width: 0;
  overflow: hidden;
  line-height: 1.1;
  text-overflow: ellipsis;
  white-space: nowrap;
}
:deep(.q-expansion-item--expanded > .submenu-group) {
  color: #F4F7FA;
  background: rgba(124, 255, 79, 0.06);
  border-color: rgba(124, 255, 79, 0.15);
}
:deep(.q-expansion-item--expanded > .submenu-group .q-item__section--avatar) {
  color: #7CFF4F;
}
.master-child-item {
  margin-left: 20px;
}
:deep(.master-child-group) {
  margin-left: 20px;
}
.master-grandchild-item {
  margin-left: 38px;
}
:deep(.nav-group) {
  min-height: 38px;
  margin: 3px 2px;
  padding: 0 12px;
  border: 1px solid transparent;
  border-radius: 14px;
  color: #F4F7FA;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0;
  font-family: 'Inter', sans-serif;
  transition:
    background 0.18s ease,
    border-color 0.18s ease,
    color 0.18s ease,
    box-shadow 0.18s ease,
    transform 0.18s ease;
}
:deep(.nav-group .q-item__section--avatar) {
  min-width: 30px;
  padding-right: 8px;
  color: #00D1B2;
}
:deep(.nav-group .q-item__label) {
  line-height: 1.1;
}
:deep(.nav-expand-icon) {
  color: #00D1B2;
  font-size: 18px;
}
:deep(.q-expansion-item__content) {
  padding: 2px 0 4px;
  transition:
    max-height 0.22s ease,
    opacity 0.18s ease;
}
:deep(.q-expansion-item--expanded > .nav-group) {
  color: #F4F7FA;
  background: rgba(0, 209, 178, 0.08);
  border-color: rgba(0, 209, 178, 0.2);
  box-shadow: none;
}
:deep(.q-expansion-item--expanded > .nav-group .q-item__section--avatar) {
  color: #7CFF4F;
}
.active-menu {
  color: #071826 !important;
  background: linear-gradient(135deg, #7CFF4F 0%, #00D1B2 100%) !important;
  border-color: transparent !important;
  border-radius: 12px !important;
  box-shadow:
    0 4px 20px rgba(124, 255, 79, 0.4),
    0 0 0 1px rgba(124, 255, 79, 0.25),
    0 0 30px rgba(124, 255, 79, 0.1);
  font-weight: 750;
}
.active-menu .submenu-icon,
.active-menu .menu-icon {
  color: #071826 !important;
}
.text-overline {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.9px;
}
@media (max-width: 700px) {
  .app-header-actions {
    padding: 4px 6px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .app-layout--manufacture::before,
  .app-layout--manufacture::after,
  :global(body:has(.app-layout--manufacture) .q-skeleton::after) {
    animation: none !important;
  }
  .manufactur-page-enter-active,
  .manufactur-page-leave-active,
  :global(body:has(.app-layout--manufacture) *),
  .menu-item,
  .submenu-item,
  :deep(.submenu-group),
  :deep(.nav-group) {
    transition: none !important;
  }
}
@keyframes manufactur-soft-float {
  0%,
  100% {
    opacity: 0.5;
    transform: translate3d(0, 0, 0) scale(1);
  }
  50% {
    opacity: 0.9;
    transform: translate3d(0, -14px, 0) scale(1.04);
  }
}
@keyframes manufactur-shimmer {
  100% {
    transform: translateX(100%);
  }
}
</style>
