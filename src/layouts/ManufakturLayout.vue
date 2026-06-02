<template>
  <q-layout
    view="lHh Lpr lFf"
    class="app-layout app-layout--manufacture"
    :data-rive-bg-src="backgroundRiveSrc"
  >
    <div class="layout-rive-bg" aria-hidden="true">
      <canvas ref="bgRiveCanvas" class="layout-rive-canvas"></canvas>
    </div>

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

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered :width="272" class="sidebar-drawer">
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
                <q-badge color="orange-9" rounded :label="pendingCount" class="animate-bounce" />
              </q-item-section>
            </q-item>
          </q-expansion-item>

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

          <q-item
            v-if="checkPermission('departemen')"
            clickable
            v-ripple
            to="/manufaktur/departemen"
            active-class="active-menu"
            class="menu-item nav-item"
          >
            <q-item-section avatar class="menu-icon">
              <q-icon name="corporate_fare" />
            </q-item-section>
            <q-item-section class="menu-text">Departemen</q-item-section>
          </q-item>

          <q-expansion-item
            v-if="checkPermission('sales/po-customer')"
            icon="shopping_cart"
            label="Sales"
            header-class="nav-group"
            expand-icon-class="nav-expand-icon"
          >
            <q-item
              clickable
              v-ripple
              to="/manufaktur/sales/po-customer"
              active-class="active-menu"
              class="submenu-item"
              dense
            >
              <q-item-section avatar class="submenu-icon"
                ><q-icon name="receipt_long" size="xs"
              /></q-item-section>
              <q-item-section class="submenu-text">PO Customer</q-item-section>
            </q-item>
          </q-expansion-item>

          <q-expansion-item
            v-if="
              hasSectionAccess([
                'ppic/planning-produksi',
                'ppic/work-order',
                'ppic/material-requirement',
                'ppic/stock-forecast',
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
              v-if="checkPermission('ppic/work-order')"
              clickable
              v-ripple
              to="/manufaktur/ppic/work-order"
              active-class="active-menu"
              class="submenu-item"
              dense
            >
              <q-item-section avatar class="submenu-icon"
                ><q-icon name="description" size="xs"
              /></q-item-section>
              <q-item-section class="submenu-text">SPK Produksi</q-item-section>
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
              <q-item-section class="submenu-text">Material Requirement</q-item-section>
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
            </q-item>
          </q-expansion-item>

          <q-expansion-item
            v-if="
              hasSectionAccess([
                'produksi/monitoring-produksi',
                'produksi/qc-produksi',
                'produksi/packing-produksi',
              ])
            "
            icon="precision_manufacturing"
            label="Produksi"
            header-class="nav-group"
            expand-icon-class="nav-expand-icon"
          >
            <q-item
              v-if="checkPermission('produksi/monitoring-produksi')"
              clickable
              v-ripple
              to="/manufaktur/produksi/monitoring-produksi"
              active-class="active-menu"
              class="submenu-item"
              dense
            >
              <q-item-section avatar class="submenu-icon"
                ><q-icon name="monitoring" size="xs"
              /></q-item-section>
              <q-item-section class="submenu-text">Monitoring Produksi</q-item-section>
            </q-item>
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

          <q-separator class="sidebar-separator" />
          <q-item-label header class="section-title">LOGISTIK & FINANCE</q-item-label>

          <q-expansion-item
            v-if="
              hasSectionAccess([
                'warehouse/incoming-material',
                'warehouse/finished-goods',
                'warehouse/bahan-mentah',
                'warehouse/bahan-jadi',
              ])
            "
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
            <q-item
              v-if="checkPermission('warehouse/bahan-mentah')"
              clickable
              v-ripple
              to="/manufaktur/warehouse/bahan-mentah"
              active-class="active-menu"
              class="submenu-item"
              dense
            >
              <q-item-section avatar class="submenu-icon"
                ><q-icon name="category" size="xs"
              /></q-item-section>
              <q-item-section class="submenu-text">Bahan Mentah</q-item-section>
            </q-item>
            <q-item
              v-if="checkPermission('warehouse/bahan-jadi')"
              clickable
              v-ripple
              to="/manufaktur/warehouse/bahan-jadi"
              active-class="active-menu"
              class="submenu-item"
              dense
            >
              <q-item-section avatar class="submenu-icon"
                ><q-icon name="inventory_2" size="xs"
              /></q-item-section>
              <q-item-section class="submenu-text">Bahan Jadi</q-item-section>
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
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { Rive, Layout, Fit, Alignment } from '@rive-app/canvas'
import { db } from 'src/boot/firebase'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { useAuthStore } from 'src/stores/auth'

const authStore = useAuthStore()
const backgroundRiveSrc = '/animations/bg.riv'
const bgRiveCanvas = ref(null)
const leftDrawerOpen = ref(false)
const pendingCount = ref(0)
const newPurchaseRequestCount = ref(0)
const userData = ref(null)
let unsub = null
let unsubPurchaseRequest = null
let unsubUser = null
let bgRive = null
let bgRivePlaybackTarget = null

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

const resizeBgRive = () => {
  bgRive?.resizeDrawingSurfaceToCanvas()
}

const startBgRive = () => {
  if (!bgRive) return

  resizeBgRive()

  const [firstAnimation] = bgRive.animationNames || []
  const [firstStateMachine] = bgRive.stateMachineNames || []
  const target = bgRivePlaybackTarget || firstStateMachine || firstAnimation

  bgRive.play(undefined, true)

  if (target) {
    bgRive.play(target, true)
  }
  if (firstStateMachine && firstStateMachine !== target) {
    bgRive.play(firstStateMachine, true)
  }

  bgRive.startRendering?.()
}

const createBackgroundRive = (playback = {}) => {
  if (!bgRiveCanvas.value || bgRive) return

  bgRive = new Rive({
    src: '/animations/bg.riv',
    canvas: bgRiveCanvas.value,
    animations: playback.animation,
    stateMachines: playback.stateMachine,
    autoplay: true,
    layout: new Layout({
      fit: Fit.Cover,
      alignment: Alignment.Center,
    }),
    onLoad: () => {
      if (!bgRive) return
      resizeBgRive()

      const [firstAnimation] = bgRive.animationNames || []
      const [firstStateMachine] = bgRive.stateMachineNames || []

      console.log('[bg.riv]', {
        activeArtboard: bgRive.activeArtboard,
        animationNames: bgRive.animationNames,
        stateMachineNames: bgRive.stateMachineNames,
      })

      if (!playback.animation && !playback.stateMachine && (firstAnimation || firstStateMachine)) {
        const nextPlayback = firstStateMachine
          ? { stateMachine: firstStateMachine }
          : { animation: firstAnimation }

        destroyBackgroundRive()
        createBackgroundRive(nextPlayback)
        return
      }

      const target =
        playback.stateMachine || playback.animation || firstStateMachine || firstAnimation
      bgRivePlaybackTarget = target || null
      startBgRive()
    },
  })
}

const destroyBackgroundRive = () => {
  window.removeEventListener('resize', resizeBgRive)
  if (!bgRive) return
  bgRive.cleanup()
  bgRive = null
  bgRivePlaybackTarget = null
}

onMounted(() => {
  createBackgroundRive()
  window.addEventListener('resize', resizeBgRive)

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

  const userEmail = authStore.user?.email
  if (userEmail) {
    const qUser = query(collection(db, 'karyawan'), where('email', '==', userEmail))
    unsubUser = onSnapshot(qUser, (snapshot) => {
      userData.value = snapshot.empty ? null : snapshot.docs[0].data()
    })
  }
})

onUnmounted(() => {
  destroyBackgroundRive()
  if (unsub) unsub()
  if (unsubPurchaseRequest) unsubPurchaseRequest()
  if (unsubUser) unsubUser()
})
</script>

<style scoped>
.app-layout {
  position: relative;
  min-height: 100vh;
  overflow-x: hidden;
  background:
    radial-gradient(circle at 12% 8%, rgba(16, 185, 129, 0.16), transparent 28%),
    radial-gradient(circle at 86% 12%, rgba(34, 211, 238, 0.12), transparent 26%),
    radial-gradient(circle at 50% 102%, rgba(6, 95, 70, 0.14), transparent 34%),
    linear-gradient(135deg, #041f1d 0%, #062f2b 42%, #0f3d35 100%);
  max-width: 100vw;
}
.app-layout--manufacture {
  isolation: isolate;
}
.layout-rive-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
}
.layout-rive-canvas {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  display: block;
  opacity: 0.16;
  pointer-events: none;
}
.app-header {
  position: relative;
  z-index: 2;
  backdrop-filter: blur(16px);
}
.app-header--manufacture {
  background:
    linear-gradient(135deg, rgba(4, 31, 28, 0.88), rgba(5, 74, 63, 0.84), rgba(8, 47, 73, 0.86)),
    radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.15), transparent 28%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 18px 42px rgba(3, 20, 28, 0.3);
  background-size: 220% 220%;
  animation: gradientMove 18s ease infinite;
}
.app-toolbar {
  min-height: 66px;
}
.app-brand {
  letter-spacing: 1.5px;
}
.app-header-actions {
  padding: 6px 10px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}
.header-icon-btn {
  transition:
    transform 180ms ease,
    background-color 180ms ease,
    box-shadow 180ms ease;
}
.header-icon-btn:hover {
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 0.12);
  box-shadow: 0 12px 22px rgba(0, 0, 0, 0.12);
}
.app-menu-panel {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(15, 23, 42, 0.08);
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.16);
  border-radius: 18px;
}
.app-page-container {
  position: relative;
  z-index: 1;
  background: transparent;
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
}
.app-page-container :deep(.q-page) {
  background: transparent !important;
  width: 100%;
  max-width: none !important;
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
:global(body:has(.app-layout--manufacture) .q-dialog__inner--minimized .q-card.master-dialog),
:global(body:has(.app-layout--manufacture) .q-dialog__inner--minimized .q-card.work-order-dialog) {
  width: min(96vw, 1120px) !important;
}
:global(body:has(.app-layout--manufacture) .q-dialog__inner--minimized .q-card.detail-dialog) {
  width: min(94vw, 920px) !important;
}
.border-bottom {
  border-bottom: 1px solid rgba(15, 23, 42, 0.06);
}
.sidebar-drawer {
  color: #eafaf4;
  transition:
    width 0.24s ease,
    transform 0.24s ease;
}
.sidebar-drawer :deep(.q-drawer) {
  color: #eafaf4;
  background: #062f2b;
  border-right: 1px solid rgba(167, 243, 208, 0.12);
  box-shadow:
    20px 0 42px rgba(2, 12, 18, 0.34),
    inset -1px 0 0 rgba(255, 255, 255, 0.05);
  transition:
    width 0.24s ease,
    transform 0.24s ease;
}
.sidebar-drawer :deep(.q-drawer__content) {
  color: #eafaf4;
  background: #062f2b;
}
.sidebar-drawer :deep(.q-list) {
  color: #eafaf4;
}
.sidebar-drawer :deep(.q-item) {
  color: #eafaf4;
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
  background: #07352f;
}
.sidebar-profile__meta {
  min-width: 0;
  line-height: 1.2;
}
.sidebar-profile__name {
  max-width: 184px;
  overflow: hidden;
  color: #f0fdf4;
  font-size: 13px;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.sidebar-profile__role {
  margin-top: 3px;
  color: rgba(167, 243, 208, 0.62);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.8px;
  text-transform: uppercase;
}
.sidebar-scroll {
  background: #062f2b;
}
.menu-list {
  padding: 10px 10px 16px;
}
.section-title {
  min-height: auto;
  margin: 10px 4px 6px;
  padding: 0 10px;
  color: #b8c7c3;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1.2px;
  line-height: 1;
}
.sidebar-separator {
  margin: 10px 8px 4px;
  background: linear-gradient(90deg, transparent, rgba(167, 243, 208, 0.14), transparent);
}
.menu-item {
  min-height: 38px;
  margin: 3px 2px;
  padding: 0 12px;
  border: 1px solid transparent;
  border-radius: 14px;
  color: #eafaf4;
  font-size: 13px;
  font-weight: 650;
  letter-spacing: 0;
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
  background: #0b473f;
  border-color: rgba(110, 231, 183, 0.28);
  color: #f4fffb;
  box-shadow:
    0 12px 26px rgba(2, 12, 18, 0.22),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
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
  color: #d6f3e9;
  font-size: 12.5px;
  font-weight: 550;
  letter-spacing: 0;
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
  color: #9bcfc1;
}
.submenu-item:hover .submenu-icon {
  color: #a7f3d0;
}
:deep(.submenu-group) {
  min-height: 34px;
  margin: 2px 2px 2px 18px;
  padding: 0 11px;
  border: 1px solid transparent;
  border-radius: 12px;
  color: #d6f3e9;
  font-size: 12.5px;
  font-weight: 650;
  letter-spacing: 0;
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
  color: #9bcfc1;
}
:deep(.submenu-group .q-item__label) {
  min-width: 0;
  overflow: hidden;
  line-height: 1.1;
  text-overflow: ellipsis;
  white-space: nowrap;
}
:deep(.q-expansion-item--expanded > .submenu-group) {
  color: #eafaf4;
  background: #0a3c35;
  border-color: rgba(110, 231, 183, 0.2);
}
:deep(.q-expansion-item--expanded > .submenu-group .q-item__section--avatar) {
  color: #a7f3d0;
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
  color: #eafaf4;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0;
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
  color: #b4e5d7;
}
:deep(.nav-group .q-item__label) {
  line-height: 1.1;
}
:deep(.nav-expand-icon) {
  color: #9bcfc1;
  font-size: 18px;
}
:deep(.q-expansion-item__content) {
  padding: 2px 0 4px;
  transition:
    max-height 0.22s ease,
    opacity 0.18s ease;
}
:deep(.q-expansion-item--expanded > .nav-group) {
  color: #f4fffb;
  background: #0a3c35;
  border-color: rgba(110, 231, 183, 0.24);
  box-shadow:
    0 12px 26px rgba(2, 12, 18, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
}
:deep(.q-expansion-item--expanded > .nav-group .q-item__section--avatar) {
  color: #a7f3d0;
}
.active-menu {
  color: white !important;
  background: #10b981 !important;
  border-color: rgba(209, 250, 229, 0.44) !important;
  border-radius: 14px !important;
  box-shadow:
    0 0 0 1px rgba(167, 243, 208, 0.08),
    0 16px 34px rgba(16, 185, 129, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.24);
  font-weight: 750;
}
.active-menu .submenu-icon,
.active-menu .menu-icon {
  color: white !important;
}
.text-overline {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.9px;
}
.animate-bounce {
  animation: bounce 2.2s infinite;
}
@keyframes gradientMove {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}
@keyframes bounce {
  0%,
  20%,
  50%,
  80%,
  100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-3px);
  }
  60% {
    transform: translateY(-2px);
  }
}

@media (max-width: 700px) {
  .app-header-actions {
    padding: 4px 6px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .app-header--manufacture {
    animation: none;
  }
}
</style>
