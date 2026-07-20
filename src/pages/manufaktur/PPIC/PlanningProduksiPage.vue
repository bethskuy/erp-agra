<template>
  <q-page class="planning-page font-pro">
    <!-- ═══════ HEADER ═══════ -->
    <div class="planning-header">
      <div class="header-content">
        <div class="header-left">
          <div class="header-badge">PPIC MODULE</div>
          <h1 class="header-title">Planning Produksi</h1>
          <p class="header-subtitle">Planning produksi dari project manufaktur ke departemen manufacturing</p>
        </div>
        <div class="header-right">
          <q-btn
            unelevated
            no-caps
            class="btn-generate"
            icon="add_circle"
            label="Generate Planning"
            @click="openCreateDialog"
          />
        </div>
      </div>
    </div>

    <!-- ═══════ SUMMARY CARDS ═══════ -->
    <div class="stats-grid">
      <div v-for="card in summaryCards" :key="card.title" class="summary-card-wrap">
        <div class="glass-card summary-card">
          <div class="summary-icon-wrap">
            <q-icon :name="card.icon" size="26px" color="white" />
          </div>
          <div class="summary-info">
            <div class="summary-label">{{ card.title }}</div>
            <div class="summary-value">{{ card.value }}</div>
          </div>
          <div class="summary-glow"></div>
        </div>
      </div>
    </div>

    <!-- ═══════ TABS ═══════ -->
    <div class="glass-card tabs-card">
      <q-tabs
        v-model="activeSection"
        align="left"
        class="planning-tabs"
        active-color="white"
        indicator-color="cyan"
        narrow-indicator
      >
        <q-tab name="planning" no-caps>
          <div class="tab-content">
            <q-icon name="assignment" size="20px" />
            <span>Planning</span>
          </div>
        </q-tab>
        <q-tab name="schedule" no-caps>
          <div class="tab-content">
            <q-icon name="event_note" size="20px" />
            <span>Schedule</span>
          </div>
        </q-tab>
      </q-tabs>
    </div>

    <!-- ═══════ TAB PANELS ═══════ -->
    <q-tab-panels v-model="activeSection" animated keep-alive class="bg-transparent tab-panels-wrap">

      <!-- ──── PLANNING PANEL ──── -->
      <q-tab-panel name="planning" class="q-pa-none">

        <!-- Search / Filter Bar -->
        <div class="glass-card filter-card">
          <div class="filter-bar">
            <div class="filter-search">
              <q-input
                v-model="search"
                dense
                rounded
                standout="bg-transparent"
                debounce="250"
                placeholder="Cari planning, project, customer, produk, atau departemen..."
                class="search-input"
                input-class="text-white"
              >
                <template #prepend>
                  <q-icon name="search" color="cyan" />
                </template>
              </q-input>
            </div>
            <div class="filter-select">
              <q-select
                v-model="statusFilter"
                :options="statusFilterOptions"
                dense
                rounded
                standout="bg-transparent"
                emit-value
                map-options
                label="Filter Status"
                class="filter-input"
                label-color="grey-6"
                input-class="text-white"
                popup-content-class="dark-dropdown"
              />
            </div>
            <div class="filter-select">
              <q-select
                v-model="priorityFilter"
                :options="priorityFilterOptions"
                dense
                rounded
                standout="bg-transparent"
                emit-value
                map-options
                label="Filter Prioritas"
                class="filter-input"
                label-color="grey-6"
                input-class="text-white"
                popup-content-class="dark-dropdown"
              />
            </div>
            <div class="filter-reset">
              <q-btn
                flat
                round
                icon="refresh"
                class="btn-reset"
                @click="resetFilter"
              >
                <q-tooltip>Reset filter</q-tooltip>
              </q-btn>
            </div>
          </div>
        </div>

        <!-- Main Planning Table -->
        <div class="glass-card table-card">
          <div class="planning-table-wrapper">
            <q-table
            :rows="filteredRows"
            :columns="columns"
            row-key="id"
            flat
            binary-state-sort
            :loading="loading"
            :pagination="{ rowsPerPage: 10 }"
            class="planning-table"
            color="cyan"
            table-header-class="planning-thead"
          >
            <template #top v-if="errorMessage">
              <q-banner rounded class="full-width error-banner">
                <template #avatar>
                  <q-icon name="error" color="red-4" />
                </template>
                {{ errorMessage }}
              </q-banner>
            </template>

            <template #header="props">
              <q-tr :props="props" class="planning-thead-row">
                <q-th v-for="col in props.cols" :key="col.name" :props="props" class="table-head">
                  {{ col.label }}
                </q-th>
              </q-tr>
            </template>

            <template #body="props">
              <q-tr :props="props" class="planning-row">
                <!-- Planning Number -->
                <q-td key="project_id" :props="props">
                  <div class="cell-planning-number">
                    {{ props.row.planning_number || props.row.no_planning || props.row.nomor_planning || props.row.project_id || props.row.id }}
                  </div>
                  <div class="cell-sub">
                    {{ props.row.project_id || props.row.project_number || '-' }}
                  </div>
                </q-td>

                <!-- Customer -->
                <q-td key="customer" :props="props">
                  <div class="cell-customer">{{ props.row.customer_name || props.row.customer_nama || props.row.customer || '-' }}</div>
                </q-td>

                <!-- Products (expandable chips) -->
                <q-td key="products" :props="props">
                  <div
                    class="product-summary"
                    role="button"
                    tabindex="0"
                    @click="toggleProductDetails(props.row)"
                    @keyup.enter="toggleProductDetails(props.row)"
                    @keyup.space.prevent="toggleProductDetails(props.row)"
                  >
                    <div class="product-chips">
                      <div
                        v-for="product in visibleProductSummaryRows(props.row)"
                        :key="product.key"
                        class="product-chip"
                      >
                        <q-icon name="inventory_2" size="14px" class="chip-icon" />
                        <span class="chip-name">{{ product.product_name }}</span>
                        <span class="chip-qty">{{ formatNumber(product.quantity) }} pcs</span>
                      </div>
                      <div v-if="hiddenProductCount(props.row)" class="product-chip product-chip-more">
                        +{{ hiddenProductCount(props.row) }} more
                      </div>
                    </div>
                    <div class="product-toggle">
                      <q-icon
                        :name="isProductExpanded(props.row) ? 'keyboard_arrow_up' : 'keyboard_arrow_down'"
                        size="18px"
                        color="cyan"
                      />
                      <span class="product-count">{{ productDetailRows(props.row).length }} item</span>
                    </div>
                  </div>
                </q-td>

                <!-- Department Progress -->
                <q-td key="department_progress" :props="props">
                  <div class="dept-progress-wrap">
                    <template v-if="departmentProgressSummaryRows(props.row).length">
                      <div
                        v-for="department in departmentProgressSummaryRows(props.row)"
                        :key="department.department_id"
                        class="dept-progress-item"
                      >
                        <div class="dept-row">
                          <span class="dept-name">{{ department.department_name }}</span>
                          <span class="dept-pct">{{ formatPercent(department.progress_percent) }}%</span>
                        </div>
                        <div class="dept-bar-wrap">
                          <q-linear-progress
                            rounded
                            size="6px"
                            :value="department.progress_percent / 100"
                            :color="progressColor(department.progress_percent)"
                            track-color="grey-10"
                            class="dept-bar"
                          />
                        </div>
                        <div class="dept-qty">
                          {{ formatNumber(department.actual_qty) }} / {{ formatNumber(department.target_qty) }}
                        </div>
                      </div>
                    </template>
                    <div v-else class="dept-empty">
                      <q-icon name="pending" size="16px" color="grey-7" />
                      <span>Belum ada progress</span>
                    </div>
                  </div>
                </q-td>

                <!-- Overall Planning Progress -->
                <q-td key="progress" :props="props">
                  <div class="dept-progress-item">
                    <div class="dept-row">
                      <span class="dept-name">Overall</span>
                      <span class="dept-pct">{{ formatPercent(props.row.progress) }}%</span>
                    </div>
                    <q-linear-progress
                      rounded
                      size="8px"
                      :value="Number(props.row.progress || 0) / 100"
                      :color="progressColor(props.row.progress)"
                      track-color="grey-10"
                    />
                    <div class="dept-qty">
                      {{ formatNumber(props.row.total_produced) }} /
                      {{ formatNumber(props.row.quantity) }}
                    </div>
                  </div>
                </q-td>

                <!-- Quantity -->
                <q-td key="quantity" :props="props">
                  <div class="cell-qty">
                    {{ formatNumber(props.row.quantity) }}
                    <span class="cell-unit">{{ props.row.satuan }}</span>
                  </div>
                </q-td>

                <!-- Deadline -->
                <q-td key="deadline" :props="props">
                  <div class="cell-deadline">
                    <q-icon name="schedule" size="14px" class="q-mr-xs" />
                    {{ formatDate(props.row.deadline) }}
                  </div>
                </q-td>

                <!-- Priority -->
                <q-td key="prioritas" :props="props">
                  <q-select
                    :model-value="normalizePlanningPriority(props.row.priority || props.row.prioritas)"
                    :options="priorityOptions"
                    dense
                    borderless
                    emit-value
                    map-options
                    options-dense
                    hide-bottom-space
                    dropdown-icon="expand_more"
                    :loading="prioritySavingId === props.row.id"
                    :class="[
                      'priority-badge',
                      'priority-select-inline',
                      `priority-${normalizePlanningPriority(props.row.priority || props.row.prioritas).toLowerCase()}`,
                    ]"
                    @update:model-value="(priority) => updatePlanningPriority(props.row, priority)"
                  />
                </q-td>

                <!-- Status -->
                <q-td key="status" :props="props">
                  <div :class="['status-pill', `status-${(props.row.planning_status || props.row.status || '').replace(/\s/g, '_')}`]">
                    {{ formatPlanningStatus(props.row.planning_status || props.row.status) }}
                  </div>
                </q-td>

                <!-- Action -->
                <q-td key="action" :props="props" class="text-center">
                  <div class="action-wrap">
                    <q-btn
                      v-if="!props.row.is_generated"
                      unelevated
                      dense
                      no-caps
                      class="btn-action-generate"
                      icon="playlist_add_check"
                      label="Generate"
                      @click="openGenerateDialog(props.row)"
                    >
                      <q-tooltip>Buat draft planning dari master project</q-tooltip>
                    </q-btn>
                    <q-btn
                      v-if="props.row.is_generated"
                      flat
                      round
                      dense
                      class="btn-action-approve"
                      icon="route"
                      @click="openEditRoutingDialog(props.row)"
                    >
                      <q-tooltip>Edit routing department</q-tooltip>
                    </q-btn>
                    <q-btn
                      v-if="props.row.is_generated"
                      flat
                      round
                      dense
                      class="btn-action-approve"
                      icon="event_repeat"
                      @click="openScheduleForPlanning(props.row)"
                    >
                      <q-tooltip>Regenerate schedule</q-tooltip>
                    </q-btn>
                    <q-btn
                      v-if="props.row.is_generated"
                      flat
                      round
                      dense
                      class="btn-action-approve"
                      icon="task_alt"
                      :disable="isApprovedPlanning(props.row)"
                      @click="approvePlanning(props.row)"
                    >
                      <q-tooltip>Approve planning</q-tooltip>
                    </q-btn>
                  </div>
                </q-td>
              </q-tr>

              <!-- Expanded Product Detail -->
              <q-tr v-if="isProductExpanded(props.row)" :props="props" class="product-detail-row">
                <q-td colspan="100%">
                  <div class="product-detail-panel">
                    <div class="detail-grid">
                      <div
                        v-for="product in productDetailRows(props.row)"
                        :key="product.key"
                        class="detail-product-card"
                      >
                        <div class="detail-product-icon">
                          <q-icon name="inventory_2" size="20px" color="cyan" />
                        </div>
                        <div class="detail-product-info">
                          <div class="detail-product-name">{{ product.product_name }}</div>
                          <div class="detail-product-qty">{{ formatNumber(product.quantity) }} {{ product.unit }}</div>
                        </div>
                      </div>
                      <div v-if="!productDetailRows(props.row).length" class="detail-empty">
                        Detail produk belum tersedia dari master project.
                      </div>
                    </div>
                  </div>
                </q-td>
              </q-tr>
            </template>

            <template #no-data>
              <div class="no-data-wrap">
                <q-icon name="event_note" size="48px" color="grey-8" />
                <div class="no-data-text">Belum ada project atau planning produksi</div>
                <div class="no-data-hint">Klik "Generate Planning" untuk memulai</div>
              </div>
            </template>
            </q-table>
          </div>
        </div>
      </q-tab-panel>

      <!-- ──── SCHEDULE PANEL ──── -->
      <q-tab-panel name="schedule" class="q-pa-none">
        <div class="glass-card filter-card">
          <div class="filter-bar schedule-filter">
            <div class="filter-search" style="flex: 2;">
              <q-select
                v-model="selectedSchedulePlanning"
                :options="schedulePlanningOptions"
                dense
                rounded
                standout="bg-transparent"
                use-input
                input-debounce="200"
                label="Pilih planning untuk schedule"
                class="filter-input"
                label-color="grey-6"
                input-class="text-white"
                popup-content-class="dark-dropdown"
                @filter="filterSchedulePlanning"
              />
            </div>
            <div class="filter-actions">
              <q-btn
                unelevated
                no-caps
                class="btn-generate btn-schedule"
                icon="event_repeat"
                label="Generate Schedule"
                :disable="!selectedScheduleRow"
                :loading="scheduleSaving"
                @click="generateScheduleForPlanning(selectedScheduleRow)"
              />
              <div class="workload-chip">
                <q-icon name="speed" size="16px" />
                <span>Workload: <strong>{{ formatNumber(selectedScheduleWorkload) }}</strong></span>
              </div>
            </div>
          </div>
        </div>

        <div class="glass-card table-card">
          <div class="workload-header">
            <div class="workload-title">
              <q-icon name="inventory_2" size="22px" color="cyan" />
              <span>Item Schedule Breakdown</span>
            </div>
            <div class="workload-chip workload-chip-sm">
              {{ selectedScheduleItems.length }} item
            </div>
          </div>
          <div class="planning-table-wrapper">
            <q-table
              :rows="selectedScheduleItems"
              :columns="scheduleItemColumns"
              row-key="itemId"
              flat
              binary-state-sort
              :pagination="{ rowsPerPage: 0 }"
              hide-pagination
              class="planning-table"
              color="cyan"
            >
              <template #header="props">
                <q-tr :props="props" class="planning-thead-row">
                  <q-th v-for="col in props.cols" :key="col.name" :props="props" class="table-head">
                    {{ col.label }}
                  </q-th>
                </q-tr>
              </template>

              <template #body-cell-progressPercentage="props">
                <q-td :props="props">
                  <div style="min-width: 150px;">
                    <q-linear-progress
                      :value="progressValue(props.row)"
                      :color="props.row.status === 'completed' ? 'positive' : 'cyan'"
                      track-color="grey-8"
                      rounded
                      size="10px"
                    />
                    <div class="text-caption text-grey-4 q-mt-xs">
                      {{ Number(props.row.progressPercentage || 0).toFixed(1) }}%
                    </div>
                  </div>
                </q-td>
              </template>

              <template #no-data>
                <div class="no-data-wrap">
                  <q-icon name="inventory_2" size="48px" color="grey-8" />
                  <div class="no-data-text">Belum ada breakdown item schedule</div>
                </div>
              </template>
            </q-table>
          </div>
        </div>

        <div class="glass-card table-card" style="margin-top: 20px;">
          <div class="workload-header">
            <div class="workload-title">
              <q-icon name="view_day" size="22px" color="cyan" />
              <span>Daily Schedule Breakdown</span>
            </div>
            <div class="workload-chip workload-chip-sm">
              {{ selectedScheduleDays.length }} hari
            </div>
          </div>
          <div class="planning-table-wrapper">
            <q-table
              :rows="selectedScheduleDays"
              :columns="scheduleDayColumns"
              row-key="key"
              flat
              binary-state-sort
              :pagination="{ rowsPerPage: 0 }"
              hide-pagination
              class="planning-table"
              color="cyan"
            >
              <template #header="props">
                <q-tr :props="props" class="planning-thead-row">
                  <q-th v-for="col in props.cols" :key="col.name" :props="props" class="table-head">
                    {{ col.label }}
                  </q-th>
                </q-tr>
              </template>

              <template #body-cell-itemBreakdown="props">
                <q-td :props="props">
                  <div class="detail-grid">
                    <div
                      v-for="item in props.row.itemBreakdown"
                      :key="item.itemId"
                      class="detail-product-card"
                    >
                      <div class="detail-product-info">
                        <div class="detail-product-name">{{ item.itemName }}</div>
                        <div class="detail-product-qty">
                          Target {{ formatNumber(item.dailyTarget) }}
                          | Produced {{ formatNumber(item.actualProduced) }}
                        </div>
                      </div>
                    </div>
                  </div>
                </q-td>
              </template>

              <template #no-data>
                <div class="no-data-wrap">
                  <q-icon name="event_busy" size="48px" color="grey-8" />
                  <div class="no-data-text">Belum ada breakdown schedule harian</div>
                </div>
              </template>
            </q-table>
          </div>
        </div>

        <div class="glass-card table-card" style="margin-top: 20px;">
          <div class="workload-header">
            <div class="workload-title">
              <q-icon name="calendar_month" size="22px" color="cyan" />
              <span>Daily Item Schedule</span>
            </div>
            <div class="workload-chip workload-chip-sm">
              {{ selectedScheduleRows.length }} baris
            </div>
          </div>
          <div class="planning-table-wrapper">
            <q-table
            :rows="selectedScheduleRows"
            :columns="scheduleColumns"
            row-key="key"
            flat
            binary-state-sort
            :pagination="{ rowsPerPage: 0 }"
            hide-pagination
            class="planning-table"
            color="cyan"
          >
            <template #header="props">
              <q-tr :props="props" class="planning-thead-row">
                <q-th v-for="col in props.cols" :key="col.name" :props="props" class="table-head">
                  {{ col.label }}
                </q-th>
              </q-tr>
            </template>

            <template #body-cell-target_qty="props">
              <q-td :props="props">
                <q-input
                  v-model.number="props.row.target_qty"
                  dense
                  rounded
                  standout="bg-transparent"
                  type="number"
                  min="0"
                  class="schedule-input"
                  input-class="text-white text-center"
                  @blur="saveScheduleRow(props.row)"
                />
              </q-td>
            </template>

            <template #body-cell-actual_qty="props">
              <q-td :props="props">
                <q-input
                  v-model.number="props.row.actual_qty"
                  dense
                  rounded
                  standout="bg-transparent"
                  type="number"
                  min="0"
                  class="schedule-input"
                  input-class="text-white text-center"
                  @blur="saveScheduleRow(props.row)"
                />
              </q-td>
            </template>

            <template #body-cell-status="props">
              <q-td :props="props">
                <q-select
                  v-model="props.row.status"
                  dense
                  rounded
                  standout="bg-transparent"
                  emit-value
                  map-options
                  :options="scheduleStatusOptions"
                  class="schedule-input"
                  input-class="text-white"
                  popup-content-class="dark-dropdown"
                  @update:model-value="saveScheduleRow(props.row)"
                />
              </q-td>
            </template>

            <template #no-data>
              <div class="no-data-wrap">
                <q-icon name="event_busy" size="48px" color="grey-8" />
                <div class="no-data-text">Pilih planning, lalu generate schedule</div>
              </div>
            </template>
            </q-table>
          </div>
        </div>

        <!-- Daily Workload -->
        <div class="glass-card table-card" style="margin-top: 20px;">
          <div class="workload-header">
            <div class="workload-title">
              <q-icon name="insights" size="22px" color="cyan" />
              <span>Daily Workload</span>
            </div>
            <div class="workload-chip workload-chip-sm">
              {{ dailyWorkloadRows.length }} hari
            </div>
          </div>
          <div class="planning-table-wrapper">
            <q-table
            :rows="dailyWorkloadRows"
            :columns="dailyWorkloadColumns"
            row-key="date"
            flat
            dense
            binary-state-sort
            :pagination="{ rowsPerPage: 10 }"
            class="planning-table"
            color="cyan"
          >
            <template #header="props">
              <q-tr :props="props" class="planning-thead-row workload-thead">
                <q-th v-for="col in props.cols" :key="col.name" :props="props" class="table-head">
                  {{ col.label }}
                </q-th>
              </q-tr>
            </template>
            </q-table>
          </div>
        </div>
      </q-tab-panel>
    </q-tab-panels>

    <!-- ═══════ DIALOG ═══════ -->
    <q-dialog v-model="formDialog" persistent maximized transition-show="fade" transition-hide="fade">
      <q-card class="planning-dialog">
        <q-card-section class="dialog-header row items-center justify-between">
          <div>
            <div class="dialog-title">{{ formTitle }}</div>
            <div class="dialog-subtitle">Data planning tersinkron realtime ke departemen tujuan.</div>
          </div>
          <q-btn flat round dense icon="close" class="text-grey-4" v-close-popup />
        </q-card-section>

        <q-form class="planning-dialog-form" @submit.prevent="savePlanning">
          <q-card-section class="planning-dialog-body">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-4">
                <q-input
                  v-model="form.no_planning"
                  outlined
                  dense
                  readonly
                  label="Nomor Planning"
                  class="dialog-input"
                  label-color="grey-5"
                  input-class="text-white"
                  :rules="[(val) => !!val || 'No planning wajib diisi']"
                />
              </div>
              <div class="col-12 col-md-4">
                <q-select
                  v-model="form.approved_obj"
                  :options="approvedOptions"
                  outlined
                  dense
                  use-input
                  input-debounce="200"
                  label="Project / Item Project"
                  class="dialog-input"
                  label-color="grey-5"
                  input-class="text-white"
                  :loading="loadingProjects"
                  :rules="[(val) => !!val || 'Project wajib dipilih']"
                  popup-content-class="dark-dropdown"
                  :readonly="!!editingId"
                  @filter="filterApproved"
                  @update:model-value="handleApprovedSelected"
                />
              </div>
              <div class="col-12 col-md-4">
                <q-select
                  v-model="form.status_planning"
                  :options="statusOptions"
                  outlined
                  dense
                  label="Status Planning"
                  class="dialog-input"
                  label-color="grey-5"
                  input-class="text-white"
                  popup-content-class="dark-dropdown"
                  :rules="[(val) => !!val || 'Status wajib dipilih']"
                />
              </div>
              <div class="col-12 col-md-4">
                <q-input
                  v-model="form.assigned_ic"
                  outlined
                  dense
                  label="IC / PIC Planning"
                  class="dialog-input"
                  label-color="grey-5"
                  input-class="text-white"
                />
              </div>

              <div class="col-12 col-md-6">
                <q-input
                  v-model="form.customer_nama"
                  outlined
                  dense
                  readonly
                  label="Customer"
                  class="dialog-input"
                  label-color="grey-5"
                  input-class="text-white"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-select
                  v-model="form.departemen_obj"
                  :options="departemenOptions"
                  outlined
                  dense
                  multiple
                  use-chips
                  label="Departemen Tujuan / Routing Produksi"
                  class="dialog-input"
                  label-color="grey-5"
                  input-class="text-white"
                  :loading="loadingDepartemen"
                  :rules="[(val) => (Array.isArray(val) ? val.length > 0 : !!val) || 'Departemen tujuan wajib dipilih']"
                  popup-content-class="dark-dropdown"
                  @update:model-value="handleDepartemenSelected"
                />
              </div>

              <div class="col-12 col-md-6">
                <q-input
                  v-model="form.nama_produk"
                  outlined
                  dense
                  readonly
                  label="Produk"
                  class="dialog-input"
                  label-color="grey-5"
                  input-class="text-white"
                />
              </div>
              <div class="col-12 col-md-3">
                <q-input
                  v-model.number="form.qty_target"
                  outlined
                  dense
                  type="number"
                  min="0"
                  readonly
                  label="Qty Target"
                  class="dialog-input"
                  label-color="grey-5"
                  input-class="text-white"
                  :rules="[(val) => Number(val) > 0 || 'Qty wajib lebih dari 0']"
                />
              </div>
              <div class="col-12 col-md-3">
                <q-input v-model="form.satuan" outlined dense readonly label="Satuan"
                  class="dialog-input" label-color="grey-5" input-class="text-white"
                />
              </div>

              <div class="col-12 col-md-6">
                <q-input v-model="form.deadline" outlined dense type="date" label="Deadline"
                  class="dialog-input" label-color="grey-5" input-class="text-white"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-select
                  v-model="form.prioritas"
                  :options="priorityOptions"
                  outlined
                  dense
                  label="Prioritas"
                  class="dialog-input"
                  label-color="grey-5"
                  input-class="text-white"
                  popup-content-class="dark-dropdown"
                />
              </div>
              <div class="col-12">
                <q-input
                  v-model="form.catatan"
                  outlined
                  dense
                  type="textarea"
                  label="Catatan"
                  autogrow
                  class="dialog-input"
                  label-color="grey-5"
                  input-class="text-white"
                />
              </div>
            </div>
          </q-card-section>

          <q-card-actions align="right" class="dialog-footer q-pa-md">
            <q-btn flat no-caps label="Batal" class="text-grey-4" v-close-popup />
            <q-btn
              unelevated
              no-caps
              class="btn-generate"
              icon="playlist_add_check"
              label="Generate Planning"
              type="submit"
              :loading="submitting"
            />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  writeBatch,
} from 'firebase/firestore'
import { db } from 'src/boot/firebase'

const $q = useQuasar()
const PLANNING_COLLECTION = 'mf_production_planning'
const MASTER_PROJECT_COLLECTION = 'mf_projects'
const PROJECT_ITEMS_COLLECTION = 'mf_project_items'
const PROJECT_MONITORING_COLLECTION = 'mf_project_monitoring'
const DEPARTMENT_PRODUCTION_COLLECTION = 'manufactur_departemen_produksi'
const MASTER_PRODUK_COLLECTION = 'master_produk'
const MASTER_DEPARTEMEN_COLLECTION = 'manufactur_master_departemen'
const DEPARTEMENT_NOTIFICATION_COLLECTION = 'manufactur_departemen_notifications'

const search = ref('')
const statusFilter = ref('all')
const priorityFilter = ref('all')
const activeSection = ref('planning')
const formDialog = ref(false)
const selectedSchedulePlanning = ref(null)
const editingId = ref(null)
const rows = ref([])
const planningRows = ref([])
const departmentProgressRows = ref([])
const expandedProductRowIds = ref(new Set())
const departemenRows = ref([])
const masterProjectRows = ref([])
const produkRows = ref([])
const filteredProjectOptions = ref([])
const loading = ref(true)
const loadingDepartemen = ref(true)
const loadingProjects = ref(true)
const submitting = ref(false)
const scheduleSaving = ref(false)
const prioritySavingId = ref('')
const errorMessage = ref('')
let unsubscribePlanning = null
let unsubscribeDepartmentProgress = null
let unsubscribeDepartemen = null
let unsubscribeProjects = null
let unsubscribeProduk = null

const statusOptions = ['not_started', 'planned', 'approved', 'in_progress', 'done']
const priorityOptions = ['Low', 'Medium', 'High', 'Urgent']
const scheduleStatusOptions = [
  { label: 'Not Started', value: 'not_started' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Done', value: 'done' },
]

const planningCollection = collection(db, PLANNING_COLLECTION)

const listenPlanningProduksi = (callback, errorCallback) =>
  onSnapshot(
    query(planningCollection, orderBy('created_at', 'desc')),
    (snapshot) =>
      callback(snapshot.docs.map((planningDoc) => ({ id: planningDoc.id, ...planningDoc.data() }))),
    errorCallback,
  )

const listenDepartmentProgress = (callback, errorCallback) =>
  onSnapshot(
    collection(db, DEPARTMENT_PRODUCTION_COLLECTION),
    (snapshot) => callback(aggregateDepartmentProductionRows(snapshot.docs.map((progressDoc) => ({ id: progressDoc.id, ...progressDoc.data() })))),
    errorCallback,
  )

const createPlanningFromProject = async (project, payload) => {
  const batch = writeBatch(db)
  const planningRef = doc(planningCollection)

  batch.set(planningRef, {
    ...payload,
    planning_id: planningRef.id,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  })

  batch.update(doc(db, MASTER_PROJECT_COLLECTION, project.master_project_doc_id), {
    planning_status: 'planned',
    planning_id: planningRef.id,
    planning_status_updated_at: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  await batch.commit()
  return planningRef
}

const mapDepartemen = (departemenDoc) => {
  const data = departemenDoc.data()

  return {
    id: departemenDoc.id,
    value: departemenDoc.id,
    label: `${data.nama_departemen || departemenDoc.id}${data.kode_departemen ? ` - ${data.kode_departemen}` : ''}`,
    ...data,
  }
}

const listenMasterDepartemen = (callback, errorCallback) =>
  onSnapshot(
    query(collection(db, MASTER_DEPARTEMEN_COLLECTION), orderBy('nama_departemen', 'asc')),
    (snapshot) =>
      callback(
        snapshot.docs
          .map(mapDepartemen)
          .filter((item) => String(item.status || 'Aktif').toLowerCase() !== 'nonaktif'),
      ),
    errorCallback,
  )

const listenMasterProjectSources = (callback, errorCallback) =>
  {
    const snapshots = {
      projects: [],
      items: [],
      monitoring: [],
    }

    const emit = () => callback(buildMasterProjectPlanningSources(snapshots))
    const handleError = (error) => {
      if (errorCallback) errorCallback(error)
    }

    const unsubscribeMasterProjects = onSnapshot(collection(db, MASTER_PROJECT_COLLECTION), (snapshot) => {
      snapshots.projects = snapshot.docs.map((projectDoc) => ({
        id: projectDoc.id,
        ...projectDoc.data(),
        __collection: MASTER_PROJECT_COLLECTION,
      }))
      emit()
    }, handleError)

    const unsubscribeProjectItems = onSnapshot(collection(db, PROJECT_ITEMS_COLLECTION), (snapshot) => {
      snapshots.items = snapshot.docs.map((itemDoc) => ({
        id: itemDoc.id,
        ...itemDoc.data(),
        __collection: PROJECT_ITEMS_COLLECTION,
      }))
      emit()
    }, handleError)

    const unsubscribeMonitoring = onSnapshot(collection(db, PROJECT_MONITORING_COLLECTION), (snapshot) => {
      snapshots.monitoring = snapshot.docs.map((monitoringDoc) => ({
        id: monitoringDoc.id,
        ...monitoringDoc.data(),
        __collection: PROJECT_MONITORING_COLLECTION,
      }))
      emit()
    }, handleError)

    return () => {
      unsubscribeMasterProjects()
      unsubscribeProjectItems()
      unsubscribeMonitoring()
    }
  }

const listenMasterProduk = (callback, errorCallback) =>
  onSnapshot(
    query(collection(db, MASTER_PRODUK_COLLECTION), orderBy('nama_produk', 'asc')),
    (snapshot) =>
      callback(
        snapshot.docs
          .map((produkDoc) => ({ id: produkDoc.id, value: produkDoc.id, ...produkDoc.data() }))
          .filter((item) => String(item.status || 'Aktif').toLowerCase() !== 'nonaktif'),
      ),
    errorCallback,
  )

const aggregateDepartmentProductionRows = (productionRows = []) => {
  const grouped = new Map()

  productionRows.forEach((row) => {
    const planningId = planningIdOf(row)
    if (!planningId) return

    const department = normalizeDepartment({
      department_id: row.department_id || row.departemen_id || row.current_departemen_id,
      department_name:
        row.department_name ||
        row.departemen_nama ||
        row.nama_departemen ||
        row.current_departemen_nama ||
        row.departemen?.nama_departemen,
    })
    if (!department?.department_id) return

    const productName = row.product_name || row.nama_produk || row.produk?.nama_produk || row.produk || ''
    const key = [planningId, department.department_id, normalizeLookupKey(productName)].join('__')
    const previous = grouped.get(key) || {
      id: key,
      project_id: row.project_id || '',
      planning_id: planningId,
      product_name: productName,
      department_id: department.department_id,
      department_name: department.department_name,
      target_qty: 0,
      actual_qty: 0,
    }

    grouped.set(key, {
      ...previous,
      project_id: previous.project_id || row.project_id || '',
      product_name: previous.product_name || productName,
      target_qty: Math.max(
        Number(previous.target_qty || 0),
        Number(row.target_qty ?? row.qty_target ?? row.qty_po ?? row.total_qty ?? 0),
      ),
      actual_qty:
        Number(previous.actual_qty || 0) +
        Number(row.qty_hasil_hari_ini ?? row.qty_hasil_jadi ?? row.actual_qty ?? row.actual_quantity ?? 0),
    })
  })

  return Array.from(grouped.values())
}

const statusFilterOptions = [
  { label: 'Semua Status', value: 'all' },
  { label: 'Not Started', value: 'not_started' },
  { label: 'Planned', value: 'planned' },
  { label: 'Approved', value: 'approved' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Done', value: 'done' },
]

const priorityFilterOptions = [
  { label: 'Semua Prioritas', value: 'all' },
  ...priorityOptions.map((priority) => ({ label: priority, value: priority })),
]

const scheduleColumns = [
  { name: 'day', align: 'right', label: 'Hari', field: 'day', sortable: true },
  { name: 'date', align: 'left', label: 'Tanggal', field: 'date', sortable: true },
  { name: 'customer', align: 'left', label: 'Customer', field: 'customer', sortable: true },
  { name: 'department_name', align: 'left', label: 'Department', field: 'department_name', sortable: true },
  { name: 'product', align: 'left', label: 'Item', field: 'product', sortable: true },
  { name: 'target_qty', align: 'right', label: 'Daily Target', field: 'target_qty', sortable: true },
  { name: 'actual_qty', align: 'right', label: 'Produced', field: 'actual_qty', sortable: true },
  { name: 'status', align: 'left', label: 'Status', field: 'status', sortable: true },
]

const scheduleItemColumns = [
  { name: 'itemName', align: 'left', label: 'Item', field: 'itemName', sortable: true },
  { name: 'departmentName', align: 'left', label: 'Department', field: 'departmentName', sortable: true },
  { name: 'orderedQty', align: 'right', label: 'Ordered', field: 'orderedQty', format: (value) => Number(value || 0).toLocaleString('id-ID'), sortable: true },
  { name: 'targetPerDay', align: 'right', label: 'Daily Target', field: 'targetPerDay', format: (value) => Number(value || 0).toLocaleString('id-ID'), sortable: true },
  { name: 'actualProduced', align: 'right', label: 'Produced', field: 'actualProduced', format: (value) => Number(value || 0).toLocaleString('id-ID'), sortable: true },
  { name: 'remainingQty', align: 'right', label: 'Remaining', field: 'remainingQty', format: (value) => Number(value || 0).toLocaleString('id-ID'), sortable: true },
  { name: 'progressPercentage', align: 'left', label: 'Progress', field: 'progressPercentage', sortable: true },
]

const scheduleDayColumns = [
  { name: 'day', align: 'right', label: 'Day', field: 'day', sortable: true },
  { name: 'date', align: 'left', label: 'Date', field: 'date', sortable: true },
  { name: 'totalDailyTarget', align: 'right', label: 'Total Daily Target', field: 'totalDailyTarget', format: (value) => Number(value || 0).toLocaleString('id-ID'), sortable: true },
  { name: 'totalActualProduced', align: 'right', label: 'Total Produced', field: 'totalActualProduced', format: (value) => Number(value || 0).toLocaleString('id-ID'), sortable: true },
  { name: 'itemBreakdown', align: 'left', label: 'Item Breakdown', field: 'itemBreakdown' },
]

const dailyWorkloadColumns = [
  { name: 'day', align: 'right', label: 'Day', field: 'day', sortable: true },
  { name: 'date', align: 'left', label: 'Date', field: 'date', sortable: true },
  { name: 'customers', align: 'left', label: 'Customer Load', field: 'customers', sortable: true },
  { name: 'total_target_qty', align: 'right', label: 'Total Target Qty', field: 'total_target_qty', sortable: true },
  { name: 'total_actual_qty', align: 'right', label: 'Total Actual Qty', field: 'total_actual_qty', sortable: true },
]

const generatePlanningNumber = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const countThisMonth = planningRows.value.filter((row) =>
    String(row.no_planning || row.nomor_planning || '').includes(`PLN-MFG/${year}${month}`),
  ).length
  return `PLN-MFG/${year}${month}/${String(countThisMonth + 1).padStart(4, '0')}`
}

const defaultForm = () => ({
  no_planning: generatePlanningNumber(),
  nomor_planning: generatePlanningNumber(),
  approved_obj: null,
  project_id: '',
  project_name: '',
  project_item_id: '',
  project_monitoring_id: '',
  no_so: '',
  project: '',
  customer: '',
  customer_id: '',
  customer_nama: '',
  item_produksi: '',
  produk_id: '',
  kode_produk: '',
  nama_produk: '',
  qty: null,
  qty_target: null,
  satuan: 'Unit',
  tanggal_planning: '',
  deadline: '',
  departemen_obj: null,
  departemen_id: '',
  departemen_nama: '',
  departemen_kode: '',
  assigned_ic: '',
  ic: '',
  all_departemen: false,
  routing_mode: 'single',
  route_departemen: [],
  current_route_index: 0,
  current_departemen_id: '',
  current_departemen_nama: '',
  prioritas: 'Medium',
  priority: 'Medium',
  status: 'not_started',
  status_planning: 'not_started',
  planning_status: 'not_started',
  progress: 0,
  catatan: '',
})

const form = ref(defaultForm())

const columns = [
  {
    name: 'project_id',
    align: 'left',
    label: 'Planning Number',
    field: 'project_id',
    sortable: true,
  },
  { name: 'customer', align: 'left', label: 'Customer', field: 'customer_name', sortable: true },
  { name: 'products', align: 'left', label: 'Products', field: 'products' },
  { name: 'department_progress', align: 'left', label: 'Department Progress', field: 'department_progress' },
  { name: 'progress', align: 'left', label: 'Planning Progress', field: 'progress', sortable: true },
  { name: 'quantity', align: 'right', label: 'Quantity', field: 'quantity', sortable: true },
  { name: 'deadline', align: 'left', label: 'Deadline', field: 'deadline', sortable: true },
  { name: 'prioritas', align: 'center', label: 'Priority', field: 'priority', sortable: true },
  { name: 'status', align: 'center', label: 'Status', field: 'status', sortable: true },
  { name: 'action', align: 'center', label: 'Action' },
]

const filteredRows = computed(() => {
  const keyword = search.value.trim().toLowerCase()

  return rows.value.filter((row) => {
    const rowStatus = row.planning_status || row.status_planning || row.status
    const matchesStatus = statusFilter.value === 'all' || rowStatus === statusFilter.value
    const matchesPriority =
      priorityFilter.value === 'all' ||
      normalizePlanningPriority(row.priority || row.prioritas) === priorityFilter.value
    const matchesSearch =
      !keyword ||
      [
        row.project_id,
        row.project_number,
        row.project_name,
        row.customer_name,
        row.customer,
        formatProducts(row.products),
        formatDepartmentProgress(row),
        row.tujuan_departemen?.nama_departemen,
        formatPlanningStatus(rowStatus),
        rowStatus,
        row.priority,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword))

    return matchesStatus && matchesPriority && matchesSearch
  })
})

const generatedPlanningRows = computed(() => rows.value.filter((row) => row.is_generated))

const schedulePlanningRows = computed(() =>
  generatedPlanningRows.value.filter((row) =>
    ['planned', 'approved', 'in_progress', 'done'].includes(normalizeStatus(row.planning_status || row.status)),
  ),
)

const mapSchedulePlanningOption = (row) => ({
  label: `${planningNumber(row)} - ${row.customer_name || row.customer_nama || row.customer || '-'} - ${formatNumber(row.quantity)} ${row.satuan || 'Unit'}`,
  value: planningIdOf(row),
  item: row,
})

const schedulePlanningOptions = ref([])

const refreshSchedulePlanningOptions = (needle = '') => {
  const searchText = normalizeText(needle)
  schedulePlanningOptions.value = schedulePlanningRows.value
    .filter((row) => {
      if (!searchText) return true
      return [
        planningNumber(row),
        row.project_id,
        row.customer_name,
        formatProducts(row.products),
        row.deadline,
      ]
        .filter(Boolean)
        .some((value) => normalizeText(value).includes(searchText))
    })
    .map(mapSchedulePlanningOption)
}

const filterSchedulePlanning = (value, update) => {
  update(() => refreshSchedulePlanningOptions(value || ''))
}

const selectedScheduleRow = computed(() => {
  const planningId = selectedSchedulePlanning.value?.value
  if (!planningId) return null
  return generatedPlanningRows.value.find((row) => planningIdOf(row) === planningId) || null
})

const selectedScheduleRows = computed(() => normalizeScheduleRows(selectedScheduleRow.value))

const selectedScheduleItems = computed(() => normalizeScheduleItems(selectedScheduleRow.value))

const selectedScheduleDays = computed(() => normalizeScheduleDays(selectedScheduleRow.value))

const selectedScheduleWorkload = computed(() =>
  selectedScheduleItems.value.reduce((sum, item) => sum + Number(item.orderedQty || 0), 0),
)

const allScheduleRows = computed(() =>
  generatedPlanningRows.value.flatMap((planning) => normalizeScheduleRows(planning)),
)

const dailyWorkloadRows = computed(() => {
  const rowsByDate = new Map()
  allScheduleRows.value.forEach((row) => {
    const key = row.date || ''
    if (!key) return
    if (!rowsByDate.has(key)) {
      rowsByDate.set(key, {
        day: row.day,
        date: key,
        customerLoads: new Map(),
        total_target_qty: 0,
        total_actual_qty: 0,
      })
    }

    const item = rowsByDate.get(key)
    const customerKey = row.customer || '-'
    item.customerLoads.set(
      customerKey,
      Number(item.customerLoads.get(customerKey) || 0) + Number(row.target_qty || 0),
    )
    item.total_target_qty += Number(row.target_qty || 0)
    item.total_actual_qty += Number(row.actual_qty || 0)
  })

  return Array.from(rowsByDate.values())
    .map((row) => ({
      day: row.day,
      date: row.date,
      customers: Array.from(row.customerLoads.entries())
        .map(([customer, qty]) => `${customer}: ${formatNumber(qty)}`)
        .join(' | '),
      total_target_qty: row.total_target_qty,
      total_actual_qty: row.total_actual_qty,
    }))
    .sort((a, b) => String(a.date).localeCompare(String(b.date)))
})

const productQuantityMap = (planning = {}) => {
  const quantities = new Map()
  productDetailRows(planning).forEach((product) => {
    const key = normalizeLookupKey(product.product_name)
    if (!key) return
    quantities.set(key, Number(product.quantity || 0))
  })
  return quantities
}

const validateScheduleTargets = (planning = {}, scheduleRows = []) => {
  const originalQuantities = productQuantityMap(planning)
  const totalsByProductDepartment = new Map()

  scheduleRows.forEach((row) => {
    const productKey = row.product_key || normalizeLookupKey(row.product_name || row.product)
    const departmentKeyValue = normalizeLookupKey(
      row.department_id || row.department_name || row.department_code || 'unassigned',
    )
    if (!productKey) return
    const key = `${productKey}__${departmentKeyValue}`
    totalsByProductDepartment.set(
      key,
      Number(totalsByProductDepartment.get(key) || 0) + Number(row.target_qty || 0),
    )
  })

  for (const [key, originalQty] of originalQuantities.entries()) {
    const productTotals = Array.from(totalsByProductDepartment.entries())
      .filter(([scheduleKey]) => scheduleKey.startsWith(`${key}__`))
    if (!productTotals.length) {
      return `Schedule ${key} belum memiliki department tujuan.`
    }
    const invalidTotal = productTotals.find(([, scheduledQty]) => scheduledQty !== Number(originalQty || 0))
    if (invalidTotal) {
      const productName = productDetailRows(planning).find((product) => normalizeLookupKey(product.product_name) === key)?.product_name || key
      return `Total target schedule ${productName} per department harus sama dengan qty master project (${formatNumber(originalQty)}). Saat ini ${formatNumber(invalidTotal[1])}.`
    }
  }

  return ''
}

const rebalanceScheduleRows = (planning = {}, scheduleRows = [], editedRow = {}) => {
  const productKey = editedRow.product_key || normalizeLookupKey(editedRow.product_name || editedRow.product)
  const editedDepartmentKey = normalizeLookupKey(
    editedRow.department_id || editedRow.department_name || editedRow.department_code || 'unassigned',
  )
  if (!productKey) return scheduleRows

  const originalQty = Number(productQuantityMap(planning).get(productKey) || 0)
  const currentTotal = scheduleRows
    .filter((row) =>
      (row.product_key || normalizeLookupKey(row.product_name || row.product)) === productKey &&
      normalizeLookupKey(row.department_id || row.department_name || row.department_code || 'unassigned') === editedDepartmentKey,
    )
    .reduce((sum, row) => sum + Number(row.target_qty || 0), 0)
  const diff = currentTotal - originalQty
  if (diff === 0) return scheduleRows

  const adjustmentIndex = scheduleRows.findIndex(
    (row) =>
      row.key !== editedRow.key &&
      (row.product_key || normalizeLookupKey(row.product_name || row.product)) === productKey &&
      normalizeLookupKey(row.department_id || row.department_name || row.department_code || 'unassigned') === editedDepartmentKey &&
      Number(row.target_qty || 0) - diff >= 0,
  )
  if (adjustmentIndex < 0) return scheduleRows

  return scheduleRows.map((row, index) =>
    index === adjustmentIndex
      ? {
          ...row,
          target_qty: Number(row.target_qty || 0) - diff,
        }
      : row,
  )
}

const summaryCards = computed(() => [
  {
    title: 'Total Planning',
    value: rows.value.length,
    icon: 'business_center',
    color: 'green-10',
  },
  {
    title: 'Not Started',
    value: rows.value.filter((row) => (row.planning_status || row.status) === 'not_started').length,
    icon: 'assignment_turned_in',
    color: 'blue-grey-7',
  },
  {
    title: 'Approved',
    value: rows.value.filter((row) => (row.planning_status || row.status) === 'approved').length,
    icon: 'assignment',
    color: 'teal-8',
  },
  {
    title: 'Done',
    value: rows.value.filter((row) => (row.planning_status || row.status) === 'done').length,
    icon: 'fiber_new',
    color: 'positive',
  },
])

const formTitle = computed(() => editingId.value ? 'Edit Routing Planning Produksi' : 'Generate Planning Produksi')

const departemenOptions = computed(() =>
  [
    {
      label: 'ALL DEPARTEMEN',
      value: '__ALL_DEPARTEMEN__',
      item: {
        id: '__ALL_DEPARTEMEN__',
        nama_departemen: 'ALL DEPARTEMEN',
        kode_departemen: 'ALL',
      },
    },
    ...departemenRows.value.map((item) => ({
      label: item.label,
      value: item.id,
      item,
    })),
  ],
)

const approvedOptions = computed(() => filteredProjectOptions.value)

const normalizeText = (value) =>
  String(value || '')
    .trim()
    .toLowerCase()

const getProjectRefId = (row = {}) => {
  const value = row.project_id ?? row.projectId ?? row.proyek_id ?? row.proyekId ?? row.project
  if (value && typeof value === 'object') {
    return value.id || value.value || value.project_id || value.projectId || ''
  }
  return value || row.id || ''
}

const getProjectName = (row = {}, fallback = '') =>
  row.project_name ||
  row.projectName ||
  row.proyek_nama ||
  row.nama_project ||
  row.nama_proyek ||
  row.nama ||
  row.name ||
  row.nomor_project ||
  fallback ||
  ''

const getProjectNumber = (row) =>
  row.nomor_project ||
  row.nomor_monitoring ||
  row.nomor ||
  row.reference_no ||
  row.project_name ||
  row.id

const getProjectItems = (row) =>
  (Array.isArray(row.items) && row.items.length
    ? row.items
    : [
        {
          deskripsi: row.nama_produk || row.produk?.nama_produk || row.produk,
          name: row.name || row.nama_produk || row.produk?.nama_produk || row.produk,
          nama_produk: row.nama_produk || row.name || row.produk?.nama_produk || row.produk,
          qty: row.qty_target || row.qty_po || row.qty || row.quantity || row.total_quantity,
          satuan: row.satuan || row.produk?.satuan,
          kode_produk: row.kode_produk || row.produk?.kode_produk,
          produk_id: row.produk_id || row.produk?.id,
        },
      ]
  ).map((item, index) => {
    const qty = Number(item.qty ?? item.quantity ?? item.qty_target ?? item.qty_po ?? 0)
    const harga = Number(item.harga ?? item.price ?? item.harga_satuan ?? item.unit_price ?? 0)
    const namaProduk =
      item.nama_produk ||
      item.name ||
      item.nama_barang ||
      item.deskripsi ||
      item.produk ||
      item.product ||
      `Item ${index + 1}`

    return {
      ...item,
      item_id: item.item_id || item.id || `item-${index + 1}`,
      product_name: item.product_name || namaProduk,
      nama_produk: namaProduk,
      deskripsi: item.deskripsi || namaProduk,
      qty,
      satuan: item.satuan || item.unit || 'Unit',
      harga,
      subtotal: Number(item.subtotal ?? item.total ?? qty * harga),
      produk_id: item.produk_id || item.product_id || item.id_produk || null,
      kode_produk: item.kode_produk || item.kode_barang || '',
      project_id: item.project_id || row.project_id || row.projectId || row.proyek_id || '',
      project_name: item.project_name || row.project_name || row.projectName || row.proyek_nama || '',
      project_item_id: item.project_item_id || item.item_id || item.id || '',
      project_monitoring_id: item.project_monitoring_id || row.project_monitoring_id || '',
      department_id: item.departmentId || item.department_id || item.departemen_id || item.department_key || item.departemen?.id || item.department?.id || '',
      department_name: item.departmentName || item.department_name || item.departemen_nama || item.nama_departemen || item.departemen_terkait || item.group_name || item.nama_group || item.tahapan || item.nama_tahapan || (typeof item.departemen === 'string' ? item.departemen : '') || (typeof item.department === 'string' ? item.department : '') || item.departemen?.nama_departemen || item.department?.name || '',
      department_code: item.departmentCode || item.department_code || item.departemen_kode || item.kode_departemen || item.departemen?.kode_departemen || item.department?.code || '',
    }
  })

const flattenMonitoringItems = (monitoring) => {
  const groups = Array.isArray(monitoring.groups) ? monitoring.groups : []
  const groupItems = groups.flatMap((group) =>
    (Array.isArray(group.items) ? group.items : []).map((item) => ({
      ...item,
      group_id: group.id || group.group_id || group.name || '',
      group_name: group.name || group.nama_group || group.label || '',
    })),
  )
  if (groupItems.length) return groupItems
  if (Array.isArray(monitoring.items) && monitoring.items.length) return monitoring.items
  if (Array.isArray(monitoring.item_pekerjaan) && monitoring.item_pekerjaan.length) {
    return monitoring.item_pekerjaan
  }
  return []
}

const normalizeStatus = (status) => String(status || '').trim().toLowerCase()

const isReadyProjectStatus = (status) => {
  if (!status) return true
  const normalized = normalizeStatus(status)
  return ['approved', 'approve', 'ready', 'aktif', 'active', 'project active', 'not_started'].includes(normalized)
}

const isPlanningGenerated = (project, generatedProjectIds) =>
  ['planned', 'approved', 'in_progress', 'done'].includes(normalizeStatus(project.planning_status)) ||
  generatedProjectIds.has(getProjectRefId(project)) ||
  generatedProjectIds.has(project.id)

const normalizePlanningRow = (planning, sourceProject = {}) => {
  const projectId = planning.project_id || getProjectRefId(sourceProject) || planning.source_document_id || planning.id
  const sourceProducts = Array.isArray(sourceProject.products) && sourceProject.products.length
    ? sourceProject.products
    : Array.isArray(planning.products)
      ? planning.products
      : []
  const sourceItems = Array.isArray(sourceProject.items) && sourceProject.items.length
    ? sourceProject.items
    : Array.isArray(planning.items)
      ? planning.items
      : []
  const products = sourceProducts.length ? buildProducts(sourceProducts) : buildProducts(sourceItems)
  const mergedPlanning = {
    ...planning,
    ...sourceProject,
    id: planning.id,
    planning_id: planning.planning_id || planning.id,
    project_id: projectId,
    status: planning.status,
    assigned_departments: planning.assigned_departments || [],
    products,
    items: sourceItems,
    is_generated: true,
  }
  const progressMetrics = planningProgressMetrics(mergedPlanning)
  const progress = progressMetrics.progress
  const planningStatus = normalizePlanningStatus(planning.planning_status || planning.status_planning || planning.status, progress)

  return {
    ...mergedPlanning,
    id: planning.id,
    is_generated: true,
    planning_id: planning.planning_id || planning.id,
    project_id: projectId,
    project_name: sourceProject.project_name || planning.project_name || planning.project || '-',
    customer_name:
      sourceProject.customer_name ||
      planning.customer_name ||
      planning.customer_nama ||
      planning.customer ||
      '',
    products,
    items: sourceItems,
    quantity: products.reduce((sum, product) => sum + Number(product.quantity || 0), 0),
    satuan: sourceProject.satuan || planning.satuan || 'Unit',
    deadline: planning.deadline || sourceProject.deadline || '',
    priority: normalizePlanningPriority(planning.priority || planning.prioritas || sourceProject.priority),
    planning_status: planningStatus,
    status: planningStatus,
    production_schedule: Array.isArray(planning.production_schedule) ? planning.production_schedule : [],
    schedule_document:
      planning.schedule_document && typeof planning.schedule_document === 'object'
        ? planning.schedule_document
        : null,
    progress,
    total_produced: progressMetrics.totalProduced,
    remaining_quantity: progressMetrics.remainingQty,
  }
}

const buildProducts = (items) =>
  items.map((item, index) => {
    const productName =
      item.product_name ||
      item.name ||
      item.nama_produk ||
      item.nama_barang ||
      item.nama_item ||
      item.pekerjaan ||
      item.deskripsi ||
      item.name ||
      `Item Project ${index + 1}`
    return {
      item_id: item.item_id || item.id || item.project_item_id || `item-${index + 1}`,
      product_id: item.produk_id || item.product_id || item.id_produk || '',
      product_code: item.kode_produk || item.kode_barang || '',
      product_name: productName,
      name: productName,
      quantity: Number(item.qty ?? item.quantity ?? item.total_quantity ?? item.qty_target ?? item.volume ?? item.target ?? 0),
      unit: item.satuan || item.unit || 'Unit',
      department_id: item.departmentId || item.department_id || item.departemen_id || item.department_key || item.departemen?.id || item.department?.id || '',
      department_name: item.departmentName || item.department_name || item.departemen_nama || item.nama_departemen || item.departemen_terkait || item.group_name || item.nama_group || item.tahapan || item.nama_tahapan || (typeof item.departemen === 'string' ? item.departemen : '') || (typeof item.department === 'string' ? item.department : '') || item.departemen?.nama_departemen || item.department?.name || '',
      department_code: item.departmentCode || item.department_code || item.departemen_kode || item.kode_departemen || item.departemen?.kode_departemen || item.department?.code || '',
    }
  })

const buildMasterProjectPlanningSources = ({ projects, items, monitoring }) => {
  const itemsByProjectId = new Map()
  const monitoringByProjectId = new Map()

  items.forEach((item) => {
    const projectId = getProjectRefId(item)
    if (!itemsByProjectId.has(projectId)) itemsByProjectId.set(projectId, [])
    itemsByProjectId.get(projectId).push(item)
  })

  monitoring.forEach((monitoringRow) => {
    const projectId = getProjectRefId(monitoringRow)
    if (!monitoringByProjectId.has(projectId)) monitoringByProjectId.set(projectId, [])
    monitoringByProjectId.get(projectId).push(monitoringRow)
  })

  return projects
    .filter((project) =>
      isReadyProjectStatus(
        project.status ||
          project.project_status ||
          project.status_project ||
          project.approval_status ||
          project.approvalStatus,
      ),
    )
    .map((project) => {
      const projectId = getProjectRefId(project)
      const projectName = getProjectName(project, projectId)
      const relatedMonitoring = monitoringByProjectId.get(projectId) || []
      const readyMonitoring = relatedMonitoring.find((item) => isReadyProjectStatus(item.status)) || relatedMonitoring[0] || {}
      const sourceItems = [
        ...(itemsByProjectId.get(projectId) || []),
        ...relatedMonitoring.flatMap(flattenMonitoringItems),
      ]
      const normalizedItems = sourceItems.length ? sourceItems : [project]
      const products = buildProducts(normalizedItems)
      const quantity = products.reduce((sum, item) => sum + Number(item.quantity || 0), 0)

      return {
        ...project,
        id: project.id,
        is_generated: false,
        master_project_doc_id: project.id,
        master_project_status:
          project.status ||
          project.project_status ||
          project.status_project ||
          project.approval_status ||
          project.approvalStatus ||
          '',
        status: 'not_started',
        planning_status: 'not_started',
        project_id: projectId,
        project_name: projectName,
        project_number: project.nomor_project || project.nomor || readyMonitoring.nomor_monitoring || projectId,
        customer_id: project.customer_id || project.customer?.id || readyMonitoring.customer_id || '',
        customer_name:
          project.customer_name ||
          project.customer_nama ||
          project.konsumen ||
          project.customer?.nama ||
          readyMonitoring.customer_nama ||
          readyMonitoring.konsumen ||
          '',
        products,
        quantity,
        satuan: products[0]?.unit || project.satuan || 'Unit',
        deadline: project.deadline || project.tgl_akhir || readyMonitoring.deadline || readyMonitoring.tgl_akhir || '',
        priority: normalizePlanningPriority(project.priority || project.prioritas || readyMonitoring.priority || readyMonitoring.prioritas),
        progress: 0,
        project_monitoring_id: readyMonitoring.id || '',
        source_collection: MASTER_PROJECT_COLLECTION,
        source_document_id: project.id,
        related_monitoring_ids: relatedMonitoring.map((item) => item.id).filter(Boolean),
        items: getProjectItems({ ...project, items: normalizedItems }),
      }
    })
}

const syncPlanningRows = () => {
  const sourceByProjectId = new Map()
  masterProjectRows.value.forEach((project) => {
    sourceByProjectId.set(project.project_id, project)
    sourceByProjectId.set(project.id, project)
    sourceByProjectId.set(project.master_project_doc_id, project)
  })
  const generatedRows = planningRows.value.map((planning) =>
    normalizePlanningRow(planning, sourceByProjectId.get(planning.project_id)),
  )
  const generatedProjectIds = new Set(generatedRows.map((planning) => planning.project_id).filter(Boolean))
  const candidateRows = masterProjectRows.value.filter(
    (project) => !isPlanningGenerated(project, generatedProjectIds),
  )

  rows.value = [...generatedRows, ...candidateRows]
  filteredProjectOptions.value = candidateRows.map(mapApprovedOption)
  refreshSchedulePlanningOptions()
}

const findMasterProduk = (item) => {
  const produkId = item.produk_id || item.product_id || item.id_produk
  if (produkId) {
    const byId = produkRows.value.find((produk) => produk.id === produkId)
    if (byId) return byId
  }

  const kodeProduk = normalizeText(item.kode_produk || item.kode_barang)
  if (kodeProduk) {
    const byCode = produkRows.value.find((produk) => normalizeText(produk.kode_produk) === kodeProduk)
    if (byCode) return byCode
  }

  const namaProduk = normalizeText(item.nama_produk || item.produk || item.deskripsi || item.nama_barang)
  if (!namaProduk) return null
  return produkRows.value.find(
    (produk) => normalizeText(produk.nama_produk || produk.nama || produk.label) === namaProduk,
  )
}

const mapApprovedOption = (row) => {
  const items = getProjectItems(row)
  const existingPlanning = planningRows.value.find(
    (planning) =>
      planning.project_id === row.project_id ||
      planning.project_id === row.id ||
      planning.source_document_id === row.id,
  )
  return {
    label: `${row.project_id || row.id} - ${row.project_name || '-'}${items.length > 1 ? ` +${items.length - 1} item` : ''}${existingPlanning ? ' (routing tersedia)' : ''}`,
    value: row.id,
    item: row,
    existingPlanning,
  }
}

const refreshApprovedOptions = (needle = '') => {
  const searchText = normalizeText(needle)
  filteredProjectOptions.value = masterProjectRows.value
    .filter((row) => {
      return (
        !searchText ||
        [
          row.project_id,
          row.project_number,
          row.project_name,
          row.customer_name,
          formatProducts(row.products),
        ]
          .filter(Boolean)
          .some((value) => normalizeText(value).includes(searchText))
      )
    })
    .map(mapApprovedOption)
}

const filterApproved = (value, update) => {
  update(() => refreshApprovedOptions(value || ''))
}

const findDepartemenOption = (id, name) =>
  departemenOptions.value.find((option) => option.value === id) ||
  departemenOptions.value.find((option) => option.item.nama_departemen === name)

const normalizeDepartemenSelection = (selection) => {
  const selectedOptions = (Array.isArray(selection) ? selection : selection ? [selection] : []).filter(Boolean)
  const isAllSelected = selectedOptions.some((option) => option.value === '__ALL_DEPARTEMEN__')
  const baseOptions = isAllSelected
    ? departemenRows.value.map((item) => ({ label: item.label, value: item.id, item }))
    : selectedOptions.filter((option) => option.value !== '__ALL_DEPARTEMEN__')

  const seen = new Set()
  const route = baseOptions
    .map((option, index) => {
      const item = option?.item || option
      const id = item?.id || item?.value || option?.value || ''
      if (!id || seen.has(id)) return null
      seen.add(id)
      return {
        id,
        value: id,
        nama_departemen: item?.nama_departemen || item?.label || option?.label || '',
        kode_departemen: item?.kode_departemen || '',
        label: option?.label || item?.nama_departemen || item?.label || '',
        urutan: index + 1,
        status: index === 0 ? 'Menunggu Produksi' : 'Menunggu Routing',
        is_new: index === 0,
      }
    })
    .filter(Boolean)

  return { isAllSelected, route }
}

const handleDepartemenSelected = (option) => {
  const { isAllSelected, route } = normalizeDepartemenSelection(option)
  const firstDepartemen = route[0] || null

  form.value.all_departemen = isAllSelected
  form.value.routing_mode = isAllSelected ? 'all' : route.length > 1 ? 'routing' : 'single'
  form.value.route_departemen = route
  form.value.current_route_index = 0
  form.value.current_departemen_id = isAllSelected ? '' : firstDepartemen?.id || ''
  form.value.current_departemen_nama = isAllSelected ? 'ALL DEPARTEMEN' : firstDepartemen?.nama_departemen || ''
  form.value.departemen_id = isAllSelected ? '' : firstDepartemen?.id || ''
  form.value.departemen_nama = isAllSelected
    ? 'ALL DEPARTEMEN'
    : route.map((item) => item.nama_departemen).join(' -> ')
  form.value.departemen_kode = isAllSelected ? 'ALL' : firstDepartemen?.kode_departemen || ''
}

const routingPayload = (route = []) =>
  route.map((department, index) => ({
    departmentId: department.id || department.department_id || department.value || '',
    departmentName:
      department.nama_departemen ||
      department.department_name ||
      department.departemen_nama ||
      department.label ||
      '',
    departmentCode:
      department.kode_departemen ||
      department.department_code ||
      department.departemen_kode ||
      '',
    sequence: index + 1,
  }))

const normalizeDepartment = (department = {}) => {
  const departmentId =
    department.departmentId ||
    department.department_id ||
    department.departemen_id ||
    department.id ||
    department.value ||
    department.department_key ||
    department.kode_departemen ||
    ''
  const departmentName =
    department.departmentName ||
    department.department_name ||
    department.department_label ||
    department.departemen_nama ||
    department.nama_departemen ||
    department.name ||
    department.label ||
    ''
  const departmentCode =
    department.departmentCode ||
    department.department_code ||
    department.departemen_kode ||
    department.kode_departemen ||
    department.code ||
    ''

  if (!departmentId && !departmentName && !departmentCode) return null

  return {
    department_id: String(departmentId).trim(),
    department_name: String(departmentName).trim(),
    department_code: String(departmentCode).trim(),
  }
}

const masterDepartmentFor = (department = {}) => {
  const normalized = normalizeDepartment(department)
  if (!normalized) return null

  const sourceValues = [
    normalized.department_id,
    normalized.department_name,
    normalized.department_code,
  ]
    .map(normalizeLookupKey)
    .filter(Boolean)

  const master = departemenRows.value.find((item) => {
    const masterValues = [
      item.id,
      item.value,
      item.nama_departemen,
      item.label,
      item.kode_departemen,
    ]
      .map(normalizeLookupKey)
      .filter(Boolean)
    return sourceValues.some((value) => masterValues.includes(value))
  })

  if (!master) return null
  return {
    department_id: String(master.id || master.value || '').trim(),
    department_name: String(master.nama_departemen || master.label || '').trim(),
    department_code: String(master.kode_departemen || '').trim(),
  }
}

const uniqueDepartments = (departments = []) => {
  const seen = new Set()
  return departments
    .map(masterDepartmentFor)
    .filter((department) => {
      if (!department) return false
      const key = normalizeLookupKey(
        department.department_id || department.department_code || department.department_name,
      )
      if (!key || seen.has(key)) return false
      seen.add(key)
      return true
    })
}

const assignedDepartmentsFor = (row = {}) => {
  const explicitDepartments = [
    ...(Array.isArray(row.assigned_departments) ? row.assigned_departments : []),
    ...(Array.isArray(row.route_departemen) ? row.route_departemen : []),
    ...(Array.isArray(row.target_departemen) ? row.target_departemen : []),
    ...(Array.isArray(row.routing) ? row.routing : []),
  ]

  if (row.tujuan_departemen?.id || row.tujuan_departemen?.nama_departemen) {
    explicitDepartments.push(row.tujuan_departemen)
  }

  if (row.departemen_id || row.departemen_nama) {
    explicitDepartments.push({
      department_id: row.departemen_id,
      department_name: row.departemen_nama,
    })
  }

  return uniqueDepartments(explicitDepartments)
}

const itemDepartment = (item = {}, planning = {}) => {
  const nestedDepartment =
    item.department ||
    item.departemen ||
    item.tujuan_departemen ||
    item.department_obj ||
    item.departemen_obj ||
    {}
  const rawDepartmentId =
      item.departmentId ||
      item.department_id ||
      item.departemen_id ||
      item.department_key ||
      item.departemen_terkait_id ||
      nestedDepartment.id ||
      nestedDepartment.value ||
      ''
  const rawDepartmentName =
      item.departmentName ||
      item.department_name ||
      item.departemen_nama ||
      item.nama_departemen ||
      item.departemen_terkait ||
      item.department_label ||
      item.group_name ||
      item.nama_group ||
      item.tahapan ||
      item.nama_tahapan ||
      (typeof item.departemen === 'string' ? item.departemen : '') ||
      (typeof item.department === 'string' ? item.department : '') ||
      nestedDepartment.nama_departemen ||
      nestedDepartment.name ||
      nestedDepartment.label ||
      ''
  const rawDepartmentCode =
      item.departmentCode ||
      item.department_code ||
      item.departemen_kode ||
      item.kode_departemen ||
      nestedDepartment.kode_departemen ||
      nestedDepartment.code ||
      ''
  const hasExplicitDepartment = Boolean(rawDepartmentId || rawDepartmentName || rawDepartmentCode)
  const rawDepartment = hasExplicitDepartment
    ? normalizeDepartment({
        department_id: rawDepartmentId,
        department_name: rawDepartmentName,
        department_code: rawDepartmentCode,
      })
    : null
  const explicitValues = [
    rawDepartment?.department_id,
    rawDepartment?.department_name,
    rawDepartment?.department_code,
  ]
    .map(normalizeLookupKey)
    .filter(Boolean)
  const matchedMaster = departemenRows.value.find((department) => {
    const masterValues = [
      department.id,
      department.value,
      department.nama_departemen,
      department.label,
      department.kode_departemen,
    ]
      .map(normalizeLookupKey)
      .filter(Boolean)
    return explicitValues.some((value) => masterValues.includes(value))
  })

  if (matchedMaster && explicitValues.length) {
    return masterDepartmentFor(matchedMaster)
  }
  if (explicitValues.length) return null

  const assignedDepartments = assignedDepartmentsFor(planning)
  return assignedDepartments.length === 1 ? assignedDepartments[0] : null
}

const handleApprovedSelected = (option) => {
  const project = option?.item || option
  if (!project) return
  const existingPlanning =
    option?.existingPlanning ||
    planningRows.value.find(
      (planning) =>
        planning.project_id === project.project_id ||
        planning.project_id === project.id ||
        planning.source_document_id === project.id,
    )

  const selectedItem = getProjectItems(project)[0] || {}
  const produk = findMasterProduk(selectedItem)

  form.value.project_id = project.project_id || getProjectRefId(project)
  form.value.project_name = project.project_name || getProjectName(project, form.value.project_id)
  form.value.project_item_id = selectedItem.project_item_id || project.project_item_id || selectedItem.item_id || ''
  form.value.project_monitoring_id = project.project_monitoring_id || selectedItem.project_monitoring_id || ''
  form.value.no_so = project.project_number || getProjectNumber(project)
  form.value.project = form.value.project_name
  form.value.customer_id = project.customer_id || ''
  form.value.customer_nama = project.customer_name || project.customer_nama || project.customer || ''
  form.value.customer = form.value.customer_nama
  form.value.produk_id = produk?.id || selectedItem.produk_id || project.produk_id || ''
  form.value.kode_produk = produk?.kode_produk || selectedItem.kode_produk || project.kode_produk || ''
  form.value.nama_produk =
    produk?.nama_produk ||
    produk?.nama ||
    selectedItem.nama_produk ||
    selectedItem.deskripsi ||
    formatProducts(project.products) ||
    ''
  form.value.item_produksi = form.value.nama_produk
  form.value.qty_target = Number(project.quantity || selectedItem.qty || 0)
  form.value.qty = form.value.qty_target
  form.value.satuan = produk?.satuan || selectedItem.satuan || project.satuan || 'Unit'
  form.value.prioritas = normalizePlanningPriority(project.priority || project.prioritas)
  form.value.priority = form.value.prioritas
  form.value._source_project = project

  const departemenOption = findDepartemenOption(
    project.departemen_id || project.tujuan_departemen?.id,
    project.departemen_nama || project.tujuan_departemen?.nama_departemen,
  )
  if (departemenOption) {
    form.value.departemen_obj = [departemenOption]
    handleDepartemenSelected([departemenOption])
  }

  if (existingPlanning) {
    editingId.value = existingPlanning.id
    form.value.no_planning = planningNumber(existingPlanning)
    form.value.nomor_planning = planningNumber(existingPlanning)
    form.value.status_planning =
      existingPlanning.planning_status ||
      existingPlanning.status_planning ||
      existingPlanning.status ||
      'planned'
    form.value.departemen_obj = departmentOptionsForPlanning(existingPlanning)
    handleDepartemenSelected(form.value.departemen_obj)
  }
}

const buildPayload = () => {
  const existingPlanning = editingId.value
    ? planningRows.value.find((planning) => planning.id === editingId.value) || {}
    : {}
  const statusPlanning = existingPlanning.planning_status || existingPlanning.status_planning || existingPlanning.status || 'planned'
  const sourceProject = form.value._source_project || form.value.approved_obj?.item || {}
  const products = productDetailRows(sourceProject)
  const quantity = products.reduce((sum, product) => sum + Number(product.quantity || 0), 0)
  const priority = normalizePlanningPriority(form.value.prioritas || form.value.priority)

  return {
    planning_number: form.value.no_planning,
    no_planning: form.value.no_planning,
    nomor_planning: form.value.no_planning,
    project_id: form.value.project_id,
    project_name: form.value.project_name || sourceProject.project_name || '',
    customer_id: form.value.customer_id || sourceProject.customer_id || '',
    customer_nama: form.value.customer_nama || sourceProject.customer_name || '',
    customer_name: form.value.customer_nama || sourceProject.customer_name || '',
    products,
    items: Array.isArray(sourceProject.items) ? sourceProject.items : [],
    quantity,
    qty_target: quantity,
    satuan: products[0]?.unit || form.value.satuan || 'Unit',
    deadline: form.value.deadline || sourceProject.deadline || '',
    priority,
    prioritas: priority,
    isUrgent: priority === 'Urgent',
    status: statusPlanning,
    status_planning: statusPlanning,
    planning_status: statusPlanning,
    assigned_departments: uniqueDepartments(form.value.route_departemen || []),
    routing: routingPayload(form.value.route_departemen || []),
    assigned_ic: form.value.assigned_ic || form.value.ic || '',
    all_departemen: form.value.all_departemen,
    routing_mode: form.value.routing_mode,
    route_departemen: form.value.route_departemen || [],
    current_route_index: form.value.current_route_index || 0,
    current_departemen_id: form.value.current_departemen_id || '',
    current_departemen_nama: form.value.current_departemen_nama || '',
    departemen_id: form.value.departemen_id || '',
    departemen_nama: form.value.departemen_nama || '',
    departemen_kode: form.value.departemen_kode || '',
  }
}

const notifyUrgentDepartments = async (planningRef, payload) => {
  if (normalizePlanningPriority(payload.priority) !== 'Urgent') return

  const departments = uniqueDepartments(payload.route_departemen || payload.assigned_departments || [])
  await Promise.all(
    departments.map((department) =>
      addDoc(collection(db, DEPARTEMENT_NOTIFICATION_COLLECTION), {
        type: 'planning_urgent',
        priority: 'Urgent',
        planning_id: planningRef.id,
        planning_number: payload.nomor_planning || payload.no_planning || planningRef.id,
        departemen_id: department.department_id,
        departemen_nama: department.department_name,
        message: `Planning urgent ${payload.nomor_planning || payload.no_planning || planningRef.id} perlu diprioritaskan.`,
        is_read: false,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      }),
    ),
  )
}

const updatePlanningPriority = async (row, selectedPriority) => {
  const priority = normalizePlanningPriority(selectedPriority)
  const isUrgent = priority === 'Urgent'
  const wasUrgent = row.isUrgent === true

  prioritySavingId.value = row.id
  try {
    await updateDoc(doc(db, PLANNING_COLLECTION, row.id), {
      priority,
      prioritas: priority,
      isUrgent,
      updated_at: serverTimestamp(),
    })

    if (isUrgent && !wasUrgent) {
      await notifyUrgentDepartments({ id: row.id }, { ...row, priority, prioritas: priority, isUrgent })
    }

    $q.notify({ type: 'positive', message: 'Priority planning berhasil diperbarui' })
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: 'Gagal memperbarui priority planning' })
  } finally {
    prioritySavingId.value = ''
  }
}

const openCreateDialog = () => {
  editingId.value = null
  form.value = defaultForm()
  refreshApprovedOptions()
  formDialog.value = true
}

const openGenerateDialog = (row) => {
  editingId.value = null
  form.value = defaultForm()
  form.value.approved_obj = mapApprovedOption(row)
  handleApprovedSelected(form.value.approved_obj)
  formDialog.value = true
}

const departmentOptionsForPlanning = (row = {}) =>
  assignedDepartmentsFor(row)
    .map((department) =>
      departemenOptions.value.find((option) => {
        const values = [
          option.value,
          option.item?.id,
          option.item?.nama_departemen,
          option.item?.kode_departemen,
        ].map(normalizeLookupKey)
        return [
          department.department_id,
          department.department_name,
          department.department_code,
        ]
          .map(normalizeLookupKey)
          .some((value) => value && values.includes(value))
      }),
    )
    .filter(Boolean)

const openEditRoutingDialog = (row) => {
  editingId.value = row.id
  form.value = {
    ...defaultForm(),
    ...row,
    no_planning: planningNumber(row),
    nomor_planning: planningNumber(row),
    approved_obj: mapApprovedOption({
      ...row,
      master_project_doc_id: row.source_document_id || row.project_id || row.id,
    }),
    status_planning: row.planning_status || row.status_planning || row.status || 'planned',
    prioritas: normalizePlanningPriority(row.priority || row.prioritas),
    assigned_ic: row.assigned_ic || row.ic || '',
    customer_nama: row.customer_name || row.customer_nama || row.customer || '',
    nama_produk: formatProducts(row.products),
    qty_target: Number(row.quantity || row.qty_target || 0),
    _source_project:
      masterProjectRows.value.find(
        (project) =>
          project.project_id === row.project_id ||
          project.id === row.source_document_id ||
          project.master_project_doc_id === row.source_document_id,
      ) || row,
  }
  form.value.departemen_obj = departmentOptionsForPlanning(row)
  handleDepartemenSelected(form.value.departemen_obj)
  formDialog.value = true
}

const openScheduleForPlanning = (row) => {
  selectedSchedulePlanning.value = mapSchedulePlanningOption(row)
  refreshSchedulePlanningOptions()
  activeSection.value = 'schedule'
}

const savePlanning = async () => {
  submitting.value = true
  try {
    const payload = buildPayload()
    const project = form.value._source_project || form.value.approved_obj?.item

    if (!editingId.value && !project?.master_project_doc_id) {
      $q.notify({ type: 'warning', message: 'Pilih master project yang valid.' })
      return
    }

    if (editingId.value) {
      await updateDoc(doc(db, PLANNING_COLLECTION, editingId.value), {
        ...payload,
        updated_at: serverTimestamp(),
      })
      await notifyUrgentDepartments({ id: editingId.value }, payload)
      $q.notify({ type: 'positive', message: 'Routing planning berhasil diperbarui. Generate ulang schedule untuk menerapkan routing baru.' })
      formDialog.value = false
      return
    }

    const planningRef = await createPlanningFromProject(project, payload)
    await notifyUrgentDepartments(planningRef, payload)
    $q.notify({ type: 'positive', message: 'Planning produksi berhasil digenerate' })

    formDialog.value = false
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: 'Gagal menyimpan planning produksi' })
  } finally {
    submitting.value = false
  }
}

const planningNumber = (row = {}) =>
  row.planning_number || row.no_planning || row.nomor_planning || planningIdOf(row) || '-'

const isApprovedPlanning = (row = {}) =>
  normalizeStatus(row.planning_status || row.status_planning || row.status) === 'approved'

const approvePlanning = async (row) => {
  if (!row?.id || isApprovedPlanning(row)) return

  try {
    await updateDoc(doc(db, PLANNING_COLLECTION, row.id), {
      status: 'approved',
      approved_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    })
    $q.notify({ type: 'positive', message: 'Planning produksi berhasil diapprove' })
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: 'Gagal approve planning produksi' })
  }
}

const planningIdOf = (row = {}) => row.planning_id || row.id || row.source_document_id || ''

const toDateInputValue = (value) => {
  if (!value) return ''
  const date = value?.toDate ? value.toDate() : new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const addDays = (date, days) => {
  const nextDate = new Date(date)
  nextDate.setDate(nextDate.getDate() + days)
  return nextDate
}

const normalizeScheduleRows = (planning = {}) => {
  if (!planning) return []
  const planningId = planningIdOf(planning)
  return (Array.isArray(planning.production_schedule) ? planning.production_schedule : [])
    .map((row, index) => {
      const department = masterDepartmentFor({
        department_id: row.departmentId || row.department_id || row.departemen_id || '',
        department_name: row.departmentName || row.department_name || row.departemen_nama || '',
        department_code: row.departmentCode || row.department_code || row.departemen_kode || '',
      })
      return {
        key: row.key || `${planningId}_${row.product_key || normalizeLookupKey(row.product_name || row.product)}_${row.date || index + 1}`,
        planning_id: planningId,
        item_id: row.item_id || row.itemId || '',
        day: Number(row.day || row.day_number || index + 1),
        day_number: Number(row.day_number || row.day || index + 1),
        date: row.date || '',
        customer: row.customer || planning.customer_name || planning.customer_nama || planning.customer || '',
        department_id: department?.department_id || '',
        department_name: department?.department_name || '',
        department_code: department?.department_code || '',
        product_key: row.product_key || normalizeLookupKey(row.product_name || row.product),
        product_name: row.product_name || row.product || '',
        product: row.product || row.product_name || '',
        target_qty: Number(row.target_qty ?? row.target_quantity ?? 0),
        actual_qty: Number(row.actual_qty ?? row.actual_quantity ?? 0),
        status: row.status || 'not_started',
      }
    })
    .sort((a, b) => {
      const dayDiff = Number(a.day || 0) - Number(b.day || 0)
      if (dayDiff !== 0) return dayDiff
      return String(a.product_name || a.product).localeCompare(String(b.product_name || b.product))
    })
}

const buildScheduleDays = (scheduleRows = [], planningId = '') => {
  const days = new Map()

  scheduleRows.forEach((row) => {
    const day = Number(row.day || row.day_number || 0)
    const date = row.date || ''
    const key = `${planningId}_${date || day}`
    if (!days.has(key)) {
      days.set(key, {
        key,
        day,
        date,
        totalDailyTarget: 0,
        totalActualProduced: 0,
        itemBreakdown: [],
      })
    }

    const scheduleDay = days.get(key)
    const dailyTarget = Math.max(0, Number(row.target_qty ?? row.target_quantity ?? 0))
    const actualProduced = Math.max(0, Number(row.actual_qty ?? row.actual_quantity ?? 0))
    scheduleDay.totalDailyTarget += dailyTarget
    scheduleDay.totalActualProduced += actualProduced
    scheduleDay.itemBreakdown.push({
      itemId: row.item_id || row.itemId || row.product_key || '',
      itemName: row.product_name || row.product || '',
      departmentId: row.department_id || row.departmentId || '',
      departmentName: row.department_name || row.departmentName || '',
      departmentCode: row.department_code || row.departmentCode || '',
      dailyTarget,
      actualProduced,
      status: row.status || 'not_started',
      scheduleKey: row.key || '',
    })
  })

  return Array.from(days.values()).sort((a, b) => {
    const dayDiff = Number(a.day || 0) - Number(b.day || 0)
    return dayDiff || String(a.date).localeCompare(String(b.date))
  })
}

const normalizeScheduleDays = (planning = {}) => {
  if (!planning) return []
  const scheduleRows = normalizeScheduleRows(planning)
  if (scheduleRows.length) return buildScheduleDays(scheduleRows, planningIdOf(planning))

  return (Array.isArray(planning.schedule_document?.days) ? planning.schedule_document.days : [])
    .map((day, index) => ({
      key: day.key || `${planningIdOf(planning)}_${day.date || day.day || index + 1}`,
      day: Number(day.day || index + 1),
      date: day.date || '',
      totalDailyTarget: Number(day.totalDailyTarget ?? day.total_daily_target ?? 0),
      totalActualProduced: Number(day.totalActualProduced ?? day.total_actual_produced ?? 0),
      itemBreakdown: (Array.isArray(day.itemBreakdown) ? day.itemBreakdown : []).map((item) => {
        const department = masterDepartmentFor({
          department_id: item.departmentId || item.department_id || '',
          department_name: item.departmentName || item.department_name || '',
          department_code: item.departmentCode || item.department_code || '',
        })
        return {
          itemId: item.itemId || item.item_id || '',
          itemName: item.itemName || item.item_name || '',
          departmentId: department?.department_id || '',
          departmentName: department?.department_name || '',
          departmentCode: department?.department_code || '',
          dailyTarget: Number(item.dailyTarget ?? item.daily_target ?? 0),
          actualProduced: Number(item.actualProduced ?? item.actual_produced ?? 0),
          status: item.status || 'not_started',
          scheduleKey: item.scheduleKey || item.schedule_key || '',
        }
      }),
    }))
    .sort((a, b) => Number(a.day || 0) - Number(b.day || 0))
}

const calculateScheduleItemProgress = (item = {}) => {
  const orderedQty = Math.max(0, Number(item.orderedQty ?? item.ordered_qty ?? 0))
  const actualProduced = Math.max(0, Number(item.actualProduced ?? item.actual_produced ?? 0))
  const remainingQty = Math.max(orderedQty - actualProduced, 0)
  const progressPercentage =
    orderedQty > 0 ? Math.min(100, (actualProduced / orderedQty) * 100) : 0

  return {
    ...item,
    orderedQty,
    actualProduced,
    remainingQty,
    progressPercentage,
    status: actualProduced >= orderedQty && orderedQty > 0 ? 'completed' : actualProduced > 0 ? 'in_progress' : 'not_started',
  }
}

const normalizeScheduleItems = (planning = {}) => {
  if (!planning) return []

  const storedItems = Array.isArray(planning.schedule_document?.items)
    ? planning.schedule_document.items
    : []
  const scheduleRows = normalizeScheduleRows(planning)
  const products = productDetailRows(planning)

  return products.map((product, index) => {
    const itemId = product.item_id || product.key || `item-${index + 1}`
    const productKey = normalizeLookupKey(product.product_name)
    const storedItem = storedItems.find(
      (item) =>
        String(item.itemId || item.item_id || '') === String(itemId) ||
        normalizeLookupKey(item.itemName || item.item_name) === productKey,
    )
    const itemScheduleRows = scheduleRows.filter(
      (row) =>
        (row.item_id && String(row.item_id) === String(itemId)) ||
        normalizeLookupKey(row.product_name || row.product) === productKey,
    )
    const actualFromRows = itemScheduleRows.reduce(
      (departments, row) => {
        const departmentKeyValue = normalizeLookupKey(
          row.department_id || row.department_name || row.department_code || 'unassigned',
        )
        departments.set(
          departmentKeyValue,
          Number(departments.get(departmentKeyValue) || 0) + Math.max(0, Number(row.actual_qty || 0)),
        )
        return departments
      },
      new Map(),
    )
    const actualProduced = itemScheduleRows.length
      ? Math.max(0, ...actualFromRows.values())
      : Number(storedItem?.actualProduced ?? storedItem?.actual_produced ?? 0)
    const totalDays = Math.max(
      1,
      Number(planning.schedule_document?.totalDays || storedItem?.totalDays || itemScheduleRows.length || 1),
    )
    const itemDepartments = uniqueDepartments(
      Array.isArray(storedItem?.departments) && storedItem.departments.length
        ? storedItem.departments
        : itemScheduleRows.map((row) => ({
          department_id: row.department_id,
          department_name: row.department_name,
          department_code: row.department_code,
        })),
    )

    return calculateScheduleItemProgress({
      itemId,
      itemName: product.product_name,
      unit: product.unit,
      departments: itemDepartments,
      departmentName: itemDepartments.map((department) => department.department_name).join(', '),
      orderedQty: Number(storedItem?.orderedQty ?? storedItem?.ordered_qty ?? product.quantity ?? 0),
      targetPerDay: Number(
        storedItem?.targetPerDay ??
          storedItem?.target_per_day ??
          Math.ceil(Number(product.quantity || 0) / totalDays),
      ),
      actualProduced,
    })
  })
}

const generateScheduleData = (planning = {}) => {
  const deadlineValue = toDateInputValue(planning.deadline)
  const products = productDetailRows(planning).filter((product) => Number(product.quantity || 0) > 0)
  if (!products.length || !deadlineValue) return null

  const startDate = new Date()
  startDate.setHours(0, 0, 0, 0)
  const endDate = new Date(`${deadlineValue}T00:00:00`)
  const totalDays = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / 86400000))
  const customer = planning.customer_name || planning.customer_nama || planning.customer || ''
  const planningId = planningIdOf(planning)
  const assignedDepartments = assignedDepartmentsFor(planning)

  const items = products.map((product, index) => {
    const explicitDepartment = itemDepartment(product, planning)
    const departments = assignedDepartments.length
      ? assignedDepartments
      : explicitDepartment
        ? [explicitDepartment]
        : []
    return calculateScheduleItemProgress({
      itemId: product.item_id || product.key || `item-${index + 1}`,
      itemName: product.product_name,
      unit: product.unit,
      departments,
      departmentName: departments.map((department) => department.department_name).join(', '),
      orderedQty: Math.max(0, Number(product.quantity || 0)),
      targetPerDay: Math.ceil(Math.max(0, Number(product.quantity || 0)) / totalDays),
      actualProduced: 0,
    })
  })
  const unmappedItems = items.filter((item) => !item.departments.length)
  if (unmappedItems.length) {
    return {
      error: `Department item belum lengkap: ${unmappedItems.map((item) => item.itemName).join(', ')}.`,
      scheduleRows: [],
      scheduleDocument: null,
    }
  }

  const scheduleRows = products.flatMap((product, productIndex) => {
    const productQty = Math.max(0, Number(product.quantity || 0))
    const dailyTarget = Math.ceil(productQty / totalDays)
    const productKey = normalizeLookupKey(product.product_name || product.key)
    const itemId = product.item_id || product.key || `item-${productIndex + 1}`
    const explicitDepartment = itemDepartment(product, planning)
    const targetDepartments = assignedDepartments.length
      ? assignedDepartments
      : explicitDepartment
        ? [explicitDepartment]
        : []

    return targetDepartments.flatMap((department) => Array.from({ length: totalDays }, (_, index) => {
      const date = toDateInputValue(addDays(startDate, index))
      const remainingQuantity = Math.max(0, productQty - dailyTarget * index)
      const targetQty = Math.min(dailyTarget, remainingQuantity)
      return {
        key: `${planningId}_${productKey}_${normalizeLookupKey(department.department_id)}_${date}`,
        planningId,
        planning_id: planningId,
        item_id: itemId,
        itemName: product.product_name,
        day: index + 1,
        day_number: index + 1,
        date,
        scheduleDate: date,
        customer,
        departmentId: department?.department_id || '',
        departmentName: department?.department_name || '',
        departmentCode: department?.department_code || '',
        department_id: department?.department_id || '',
        department_name: department?.department_name || '',
        department_code: department?.department_code || '',
        product_key: productKey,
        product_name: product.product_name,
        product: product.product_name,
        qty: targetQty,
        target_qty: targetQty,
        actual_qty: 0,
        status: 'not_started',
      }
    }).filter((row) => row.target_qty > 0))
  })

  return {
    scheduleRows,
    scheduleDocument: {
      planningId,
      customer,
      totalDays,
      totalOrderedQty: items.reduce((sum, item) => sum + Number(item.orderedQty || 0), 0),
      totalProducedAllDays: 0,
      remainingQty: items.reduce((sum, item) => sum + Number(item.orderedQty || 0), 0),
      progressPercentage: 0,
      status: 'not_started',
      items,
      days: buildScheduleDays(scheduleRows, planningId),
    },
  }
}

const generateScheduleForPlanning = async (planning) => {
  if (!planning?.id) return
  const scheduleData = generateScheduleData(planning)
  if (scheduleData?.error) {
    $q.notify({ type: 'warning', message: scheduleData.error })
    return
  }
  if (!scheduleData?.scheduleRows.length) {
    $q.notify({ type: 'warning', message: 'Quantity dan deadline wajib tersedia untuk generate schedule.' })
    return
  }

  scheduleSaving.value = true
  try {
    await updateDoc(doc(db, PLANNING_COLLECTION, planning.id), {
      production_schedule: scheduleData.scheduleRows,
      schedule_document: scheduleData.scheduleDocument,
      schedule_generated_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    })
    $q.notify({ type: 'positive', message: 'Schedule produksi berhasil digenerate' })
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: 'Gagal generate schedule produksi' })
  } finally {
    scheduleSaving.value = false
  }
}

const saveScheduleRow = async (row) => {
  const planning = selectedScheduleRow.value
  if (!planning?.id || !row?.key) return

  const editedScheduleRows = normalizeScheduleRows(planning).map((item) =>
    item.key === row.key
      ? {
          ...item,
          target_qty: Number(row.target_qty || 0),
          actual_qty: Number(row.actual_qty || 0),
          status: row.status || 'not_started',
        }
      : item,
  )
  const nextScheduleRows = rebalanceScheduleRows(planning, editedScheduleRows, row)

  const validationError = validateScheduleTargets(planning, nextScheduleRows)
  if (validationError) {
    $q.notify({ type: 'warning', message: validationError })
    return
  }

  try {
    const scheduleItems = normalizeScheduleItems({
      ...planning,
      production_schedule: nextScheduleRows,
    })
    const totalDays = Math.max(
      1,
      Number(planning.schedule_document?.totalDays || 0),
      ...nextScheduleRows.map((scheduleRow) => Number(scheduleRow.day || 0)),
    )
    const progressMetrics = planningProgressMetrics({
      ...planning,
      production_schedule: nextScheduleRows,
    })
    const nextPlanningStatus =
      progressMetrics.progress >= 100
        ? 'done'
        : progressMetrics.progress > 0
          ? 'in_progress'
          : planning.planning_status || planning.status || 'planned'
    await updateDoc(doc(db, PLANNING_COLLECTION, planning.id), {
      production_schedule: nextScheduleRows,
      schedule_document: {
        planningId: planningIdOf(planning),
        customer: planning.customer_name || planning.customer_nama || planning.customer || '',
        totalDays,
        totalOrderedQty: progressMetrics.totalOrderedQty,
        totalProducedAllDays: progressMetrics.totalProduced,
        remainingQty: progressMetrics.remainingQty,
        progressPercentage: progressMetrics.progress,
        status: progressMetrics.status,
        items: scheduleItems,
        days: buildScheduleDays(nextScheduleRows, planningIdOf(planning)),
      },
      progress: progressMetrics.progress,
      progress_percent: progressMetrics.progress,
      total_progress: progressMetrics.totalProduced,
      sisa_qty: progressMetrics.remainingQty,
      status: nextPlanningStatus,
      status_planning: nextPlanningStatus,
      planning_status: nextPlanningStatus,
      updated_at: serverTimestamp(),
    })
  } catch (error) {
    console.error(error)
    $q.notify({ type: 'negative', message: 'Gagal menyimpan schedule produksi' })
  }
}

const progressDepartmentId = (progress = {}) =>
  String(progress.department_id || progress.departemen_id || progress.department_key || progress.id || '').trim()

const normalizeProgressRow = (progress = {}, fallbackDepartment = {}) => {
  const department = masterDepartmentFor({
    department_id: progressDepartmentId(progress) || fallbackDepartment.department_id,
    department_name:
      progress.department_name ||
      progress.nama_departemen ||
      progress.department_label ||
      fallbackDepartment.department_name,
  })
  const targetQty = Number(progress.target_qty ?? progress.target_quantity ?? 0)
  const actualQty = Number(progress.actual_qty ?? progress.actual_quantity ?? 0)
  const progressPercent = targetQty > 0 ? Math.min(100, (actualQty / targetQty) * 100) : 0

  return {
    id: progress.id || `${progress.project_id || progress.planning_id || ''}_${progress.product_name || ''}_${department?.department_id || ''}`,
    project_id: progress.project_id || '',
    planning_id: progress.planning_id || '',
    product_name: progress.product_name || progress.nama_produk || progress.product || '',
    department_id: department?.department_id || '',
    department_name: department?.department_name || '',
    target_qty: targetQty,
    actual_qty: actualQty,
    progress_percent: progressPercent,
    status: normalizePlanningStatus(progress.status, progressPercent),
  }
}

const progressRowsForProject = (row = {}) => {
  const projectId = row.project_id || ''
  const planningId = planningIdOf(row)
  return departmentProgressRows.value.filter(
    (item) =>
      (projectId && item.project_id === projectId) ||
      (planningId && item.planning_id === planningId),
  )
}

const planningProgressMetrics = (row = {}) => {
  const products = productDetailRows(row)
  const totalOrderedQty = products.reduce(
    (sum, product) => sum + Math.max(0, Number(product.quantity || 0)),
    0,
  )
  const scheduleProduced = normalizeScheduleRows(row).reduce(
    (sum, schedule) => sum + Math.max(0, Number(schedule.actual_qty || 0)),
    0,
  )
  const productionRows = progressRowsForProject(row).map((progress) => normalizeProgressRow(progress))
  const producedByProduct = products.reduce((total, product) => {
    const productKey = normalizeLookupKey(product.product_name)
    const matchingRows = productionRows.filter(
      (progress) => normalizeLookupKey(progress.product_name) === productKey,
    )
    const producedAcrossDepartments = matchingRows.length
      ? Math.max(...matchingRows.map((progress) => Math.max(0, Number(progress.actual_qty || 0))))
      : 0
    return total + Math.min(Number(product.quantity || 0), producedAcrossDepartments)
  }, 0)
  const totalProduced = Math.min(
    totalOrderedQty,
    scheduleProduced > 0 ? scheduleProduced : producedByProduct,
  )
  const progress = totalOrderedQty > 0
    ? Math.min(100, (totalProduced / totalOrderedQty) * 100)
    : 0

  return {
    totalOrderedQty,
    totalProduced,
    remainingQty: Math.max(totalOrderedQty - totalProduced, 0),
    progress,
    status: progress >= 100 ? 'done' : progress > 0 ? 'in_progress' : 'not_started',
  }
}

const normalizePlanningStatus = (status, progress = 0) => {
  const normalized = normalizeStatus(status)
  if (progress >= 100) return 'done'
  if (progress > 0) return 'in_progress'
  if (['done', 'in_progress', 'approved', 'planned', 'not_started'].includes(normalized)) return normalized
  if (['draft', 'scheduled', 'on progress', 'selesai'].includes(normalized)) {
    if (normalized === 'selesai') return 'done'
    if (normalized === 'on progress') return 'in_progress'
    return 'planned'
  }
  return normalized || 'not_started'
}

const formatPlanningStatus = (status) => {
  const labels = {
    not_started: 'Not Started',
    planned: 'Planned',
    approved: 'Approved',
    in_progress: 'In Progress',
    done: 'Done',
  }
  return labels[normalizeStatus(status)] || status || '-'
}

const formatDepartmentProgress = (row = {}) => {
  if (!row.is_generated) return 'Belum digenerate'

  const progressRows = departmentProgressSummaryRows(row)
  if (!progressRows.length) return 'Belum ada progress departemen'

  return progressRows
    .map((item) => `${item.department_name}: ${Number(item.progress_percent || 0)}%`)
    .join(' | ')
}

const listenPlanning = () => {
  errorMessage.value = ''
  if (unsubscribePlanning) unsubscribePlanning()

  unsubscribePlanning = listenPlanningProduksi(
    (nextPlanningRows) => {
      planningRows.value = nextPlanningRows
      syncPlanningRows()
      errorMessage.value = ''
    },
    (error) => {
      console.error(error)
      loading.value = false
      errorMessage.value = 'Gagal memuat data planning produksi dari Firestore.'
      $q.notify({ type: 'negative', message: 'Gagal memuat planning produksi' })
    },
  )
}

const listenDepartmentProgressRows = () => {
  if (unsubscribeDepartmentProgress) unsubscribeDepartmentProgress()

  unsubscribeDepartmentProgress = listenDepartmentProgress(
    (nextRows) => {
      departmentProgressRows.value = nextRows
      syncPlanningRows()
    },
    (error) => {
      console.error(error)
      $q.notify({ type: 'negative', message: 'Gagal memuat progress departemen' })
    },
  )
}

const listenDepartemenOptions = () => {
  loadingDepartemen.value = true
  if (unsubscribeDepartemen) unsubscribeDepartemen()

  unsubscribeDepartemen = listenMasterDepartemen(
    (options) => {
      departemenRows.value = options
      loadingDepartemen.value = false
    },
    (error) => {
      console.error(error)
      loadingDepartemen.value = false
      $q.notify({ type: 'negative', message: 'Gagal memuat departemen manufacturing' })
    },
  )
}

const listenApprovedOptions = () => {
  loading.value = true
  loadingProjects.value = true
  if (unsubscribeProjects) unsubscribeProjects()

  unsubscribeProjects = listenMasterProjectSources(
    (nextRows) => {
      masterProjectRows.value = nextRows
      syncPlanningRows()
      loading.value = false
      loadingProjects.value = false
    },
    (error) => {
      console.error(error)
      loading.value = false
      loadingProjects.value = false
      $q.notify({ type: 'negative', message: 'Gagal memuat project manufacturing' })
    },
  )
}

const listenProdukOptions = () => {
  if (unsubscribeProduk) unsubscribeProduk()

  unsubscribeProduk = listenMasterProduk(
    (nextRows) => {
      produkRows.value = nextRows
      refreshApprovedOptions()
    },
    (error) => {
      console.error(error)
      $q.notify({ type: 'negative', message: 'Gagal memuat master produk manufacturing' })
    },
  )
}

const resetFilter = () => {
  search.value = ''
  statusFilter.value = 'all'
  priorityFilter.value = 'all'
}

const normalizePlanningPriority = (priority) => {
  const normalized = String(priority || '').trim().toLowerCase()
  if (normalized === 'urgent') return 'Urgent'
  if (normalized === 'high') return 'High'
  if (normalized === 'low') return 'Low'
  return 'Medium'
}


const formatNumber = (value) => Number(value || 0).toLocaleString('id-ID')

const progressValue = (item = {}) => Math.min(1, Math.max(0, Number(item.progressPercentage || 0) / 100))

const productRowId = (row = {}) => planningIdOf(row) || row.project_id || row.id || ''

const isProductExpanded = (row = {}) => expandedProductRowIds.value.has(productRowId(row))

const toggleProductDetails = (row = {}) => {
  const id = productRowId(row)
  if (!id) return

  const nextExpandedRows = new Set(expandedProductRowIds.value)
  if (nextExpandedRows.has(id)) {
    nextExpandedRows.delete(id)
  } else {
    nextExpandedRows.add(id)
  }
  expandedProductRowIds.value = nextExpandedRows
}

const productDetailRows = (row = {}) => {
  const sourceProducts = Array.isArray(row.products) && row.products.length
    ? row.products
    : buildProducts(getProjectItems(row))

  return sourceProducts
    .map((product, index) => {
      const productName =
        product.product_name ||
        product.nama_produk ||
        product.name ||
        product.deskripsi ||
        `Product ${index + 1}`
      return {
        key: product.product_id || product.id || product.item_id || `${productName}-${index}`,
        item_id: product.item_id || product.id || product.product_id || `item-${index + 1}`,
        product_name: productName,
        quantity: Number(product.quantity ?? product.qty ?? product.total_quantity ?? product.qty_target ?? 0),
        unit: product.unit || product.satuan || row.satuan || 'Unit',
        department_id: product.departmentId || product.department_id || product.departemen_id || product.department_key || product.departemen?.id || product.department?.id || '',
        department_name: product.departmentName || product.department_name || product.departemen_nama || product.nama_departemen || product.departemen_terkait || product.departemen?.nama_departemen || product.department?.name || '',
        department_code: product.departmentCode || product.department_code || product.departemen_kode || product.kode_departemen || product.departemen?.kode_departemen || product.department?.code || '',
      }
    })
    .filter((product) => product.product_name)
}

const visibleProductSummaryRows = (row = {}) => productDetailRows(row).slice(0, 2)

const hiddenProductCount = (row = {}) => Math.max(productDetailRows(row).length - 2, 0)

const TRACKED_DEPARTMENTS = [
  { key: 'cutting', label: 'Cutting' },
  { key: 'welding', label: 'Welding' },
  { key: 'assembly', label: 'Assembly' },
  { key: 'packing', label: 'Packing' },
]

const normalizeLookupKey = (value) =>
  String(value || '')
    .trim()
    .toLowerCase()

const departmentKey = (value) => {
  const normalized = normalizeLookupKey(value)
  return TRACKED_DEPARTMENTS.find((department) => normalized.includes(department.key))?.key || normalized
}

const fallbackDepartmentRows = () =>
  departemenRows.value.map(masterDepartmentFor).filter(Boolean)

const departmentProgressSummaryRows = (row = {}) => {
  const progressRows = progressRowsForProject(row).map((progress) => normalizeProgressRow(progress))
  const departments = assignedDepartmentsFor(row).length ? assignedDepartmentsFor(row) : fallbackDepartmentRows()
  const departmentOrderedQty = productDetailRows(row).reduce(
    (sum, product) => sum + Math.max(0, Number(product.quantity || 0)),
    0,
  )

  return departments
    .map((department) => {
      const departmentRows = progressRows.filter(
        (progress) =>
          progress.department_id === department.department_id ||
          departmentKey(progress.department_name || progress.department_id) === departmentKey(department.department_name || department.department_id),
      )
      const actualQty = departmentRows.reduce((sum, progress) => sum + Number(progress.actual_qty || 0), 0)
      const progressPercent =
        departmentOrderedQty > 0 ? Math.min(100, (actualQty / departmentOrderedQty) * 100) : 0

      return {
        department_id: department.department_id,
        department_name: department.department_name,
        target_qty: departmentOrderedQty,
        actual_qty: actualQty,
        progress_percent: progressPercent,
        status: actualQty >= departmentOrderedQty && departmentOrderedQty > 0 ? 'done' : actualQty > 0 ? 'in_progress' : 'not_started',
      }
    })
    .filter((department) => department.target_qty > 0 || department.actual_qty > 0)
}

const progressColor = (progress) => {
  if (progress >= 100) return 'green-10'
  if (progress >= 75) return 'teal-8'
  if (progress >= 40) return 'orange-9'
  return 'negative'
}

const formatPercent = (value) => {
  const numericValue = Number(value || 0)
  return Number.isInteger(numericValue) ? numericValue : numericValue.toFixed(1)
}

const formatProducts = (products = []) => {
  if (!Array.isArray(products) || !products.length) return '-'
  return products
    .map((item) => {
      const productName = item.product_name || item.name || item.nama_produk || '-'
      const quantity = Number(item.quantity ?? item.qty ?? item.total_quantity ?? item.qty_target ?? 0)
      return quantity ? `${productName} (${formatNumber(quantity)})` : productName
    })
    .join(', ')
}

const formatDate = (value) => {
  if (!value) return '-'
  const date = value?.toDate ? value.toDate() : new Date(value)
  if (Number.isNaN(date.getTime())) return '-'

  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

onMounted(() => {
  listenPlanning()
  listenDepartmentProgressRows()
  listenDepartemenOptions()
  listenProdukOptions()
  listenApprovedOptions()
})

onUnmounted(() => {
  if (unsubscribePlanning) unsubscribePlanning()
  if (unsubscribeDepartmentProgress) unsubscribeDepartmentProgress()
  if (unsubscribeDepartemen) unsubscribeDepartemen()
  if (unsubscribeProjects) unsubscribeProjects()
  if (unsubscribeProduk) unsubscribeProduk()
})
</script>

<style scoped>
/* Planning Produksi Page — Dark Premium Theme */
.font-pro {
  font-family: 'Inter', -apple-system, sans-serif;
}

.leading-tight {
  line-height: 1.15;
}

.summary-card,
.filter-card,
.table-card {
  border-color: rgba(124, 255, 79, 0.12) !important;
  border-radius: 16px;
  overflow: hidden;
}

.summary-label {
  color: #8CA3B8;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  font-family: 'Inter', sans-serif;
}

.summary-value {
  color: #FFFFFF;
  font-size: 28px;
  font-weight: 700;
  line-height: 1;
  margin-top: 5px;
  font-family: 'Inter', sans-serif;
}

.planning-table :deep(thead tr th) {
  font-size: 11px;
  letter-spacing: 0.8px;
  padding: 14px 16px;
  text-transform: uppercase;
}

.table-head {
  text-transform: uppercase;
  font-weight: 800;
}

.planning-row:hover {
  background: rgba(124, 255, 79, 0.04);
}

.product-summary {
  border-radius: 10px;
  cursor: pointer;
  min-width: 180px;
  outline: none;
  transition: box-shadow 0.15s ease;
}

.product-summary:focus-visible {
  box-shadow: 0 0 0 2px rgba(124, 255, 79, 0.35);
}

.department-progress-list {
  min-width: 280px;
  max-width: 380px;
}

.product-progress-block {
  border-bottom: 1px solid rgba(124, 255, 79, 0.08);
  padding: 6px 0;
}

.product-progress-block:last-child {
  border-bottom: 0;
}

.progress-product-name {
  color: #7CFF4F;
  font-size: 12px;
  font-weight: 800;
  max-width: 150px;
  font-family: 'Inter', sans-serif;
}

.bottleneck-badge {
  border-radius: 6px;
  font-size: 10px;
  font-weight: 800;
}

.department-progress-row {
  margin-top: 5px;
}

.department-label {
  color: #8CA3B8;
  font-size: 11px;
  font-weight: 700;
  width: 62px;
}

.department-percent {
  color: #F4F7FA;
  font-size: 11px;
  font-weight: 800;
  text-align: right;
  width: 42px;
}

.progress-qty {
  padding-left: 62px;
}

.missing-progress-line {
  background: repeating-linear-gradient(
    90deg,
    rgba(124, 255, 79, 0.2),
    rgba(124, 255, 79, 0.2) 6px,
    transparent 6px,
    transparent 10px
  );
  border-radius: 999px;
  height: 8px;
}

.product-detail-row {
  background: rgba(124, 255, 79, 0.03);
}

.product-detail-panel {
  padding: 12px 16px 16px 128px;
}

.product-detail-table {
  max-width: 520px;
}

.status-badge {
  border-radius: 8px;
  font-size: 11px;
  font-weight: 800;
  justify-content: center;
  min-width: 82px;
  padding: 5px 8px;
}

.detail-card {
  border-color: rgba(124, 255, 79, 0.12) !important;
  border-radius: 18px;
  overflow: hidden;
}

.planning-dialog {
  width: 100vw;
  max-width: 100vw;
  height: 100vh;
  max-height: 100vh;
  border-radius: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: #071826 !important;
}

.planning-dialog-form {
  min-height: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.dialog-header {
  flex: 0 0 auto;
  position: sticky;
  top: 0;
  z-index: 2;
  padding: 16px 24px;
  background: rgba(0, 209, 178, 0.08) !important;
  border-bottom: 1px solid rgba(0, 209, 178, 0.15);
}

.planning-dialog-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 24px;
}

.dialog-footer {
  flex: 0 0 auto;
  position: sticky;
  bottom: 0;
  z-index: 2;
  border-top: 1px solid rgba(124, 255, 79, 0.1);
  background: rgba(7, 24, 38, 0.95);
}

@media (max-width: 599px) {
  .dialog-header {
    align-items: flex-start;
    padding: 14px 16px;
  }

  .planning-dialog-body {
    padding: 16px;
  }

  .dialog-footer {
    gap: 8px;
  }

  .dialog-footer :deep(.q-btn) {
    flex: 1;
  }
}

.detail-label {
  color: #8CA3B8;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  margin-bottom: 4px;
  font-family: 'Inter', sans-serif;
}

.detail-value {
  color: #FFFFFF;
  font-size: 15px;
  font-weight: 700;
  font-family: 'Inter', sans-serif;
}

.note-box {
  background: rgba(124, 255, 79, 0.04);
  border: 1px solid rgba(124, 255, 79, 0.15);
  border-radius: 14px;
  color: #F4F7FA;
  padding: 14px;
}

.planning-page {
  background: #071826;
  min-height: 100vh;
  padding: 28px 32px;
}
@media (max-width: 599px) {
  .planning-page {
    padding: 16px;
  }
}

/* ═══════ HEADER ═══════ */
.planning-header {
  margin-bottom: 28px;
}
.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
}
.header-left {
  flex: 1;
  min-width: 280px;
}
.header-badge {
  display: inline-block;
  padding: 4px 14px;
  border-radius: 20px;
  background: rgba(0, 209, 178, 0.12);
  border: 1px solid rgba(0, 209, 178, 0.25);
  color: #00D1B2;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1.5px;
  margin-bottom: 10px;
}
.header-title {
  margin: 0;
  font-size: clamp(28px, 3vw, 42px);
  font-weight: 900;
  color: #F4F7FA;
  line-height: 1.1;
  text-shadow: 0 0 12px rgba(124, 255, 79, 0.18);
}
.header-subtitle {
  margin: 8px 0 0;
  font-size: 14px;
  color: #B8C7D9;
  line-height: 1.5;
  max-width: 520px;
}
.btn-generate {
  background: linear-gradient(135deg, #00D1B2 0%, #00b89c 100%);
  color: #071826;
  font-weight: 700;
  border-radius: 14px;
  padding: 10px 24px;
  font-size: 13px;
  letter-spacing: 0.3px;
  transition: all 0.3s ease;
}
.btn-generate:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 209, 178, 0.3);
}

/* ═══════ GLASS CARD ═══════ */
.glass-card {
  background: rgba(13, 34, 51, 0.7);
  border: 1px solid rgba(124, 255, 79, 0.08);
  border-radius: 18px;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}

/* ═══════ STATS GRID ═══════ */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(220px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}
.summary-card-wrap {
  width: 100%;
}
.summary-card {
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 14px;
  position: relative;
  overflow: hidden;
}
.summary-icon-wrap {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: rgba(0, 209, 178, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.summary-info {
  flex: 1;
  min-width: 0;
}
.summary-glow {
  position: absolute;
  top: -30px;
  right: -30px;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(124, 255, 79, 0.06) 0%, transparent 70%);
  pointer-events: none;
}

/* ═══════ TABS CARD ═══════ */
.tabs-card {
  margin-bottom: 20px;
  padding: 4px;
}
.planning-tabs {
  background: transparent;
}
.tab-content {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #8CA3B8;
  font-weight: 700;
}
.planning-tabs :deep(.q-tab--active) .tab-content {
  color: #00D1B2;
}

/* ═══════ FILTER BAR ═══════ */
.filter-card {
  padding: 16px 20px;
  margin-bottom: 20px;
}
.filter-bar {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}
.filter-search {
  flex: 2;
  min-width: 200px;
}
.filter-select {
  flex: 1;
  min-width: 160px;
}
.search-input :deep(.q-field__control),
.filter-input :deep(.q-field__control) {
  background: rgba(124, 255, 79, 0.04);
  border: 1px solid rgba(124, 255, 79, 0.1);
  border-radius: 14px;
}
.filter-reset {
  display: flex;
  align-items: center;
}
.btn-reset {
  color: #8CA3B8;
}
.btn-reset:hover {
  color: #00D1B2;
}

/* ═══════ TABLE WRAPPER ═══════ */
.table-card {
  margin-bottom: 20px;
  overflow: hidden;
}
.planning-table-wrapper {
  width: 100%;
  overflow-x: auto;
}
.planning-table {
  background: transparent !important;
  width: 100%;
}
.planning-table :deep(.q-table__top),
.planning-table :deep(.q-table__bottom) {
  background: transparent;
  color: #8CA3B8;
}
.planning-table :deep(.q-table__bottom) {
  border-top: 1px solid rgba(124, 255, 79, 0.06);
}
.planning-thead-row {
  background: rgba(0, 209, 178, 0.08) !important;
}
.planning-thead-row th {
  color: #EAF2FF !important;
  font-weight: 700 !important;
  letter-spacing: 0.4px;
  border-bottom: 1px solid rgba(0, 209, 178, 0.15) !important;
}
.planning-row td {
  color: #F4F7FA;
  border-bottom: 1px solid rgba(124, 255, 79, 0.04) !important;
}

/* Cell styles */
.cell-planning-number {
  color: #00D1B2;
  font-weight: 700;
  font-size: 13px;
}
.cell-sub {
  color: #8CA3B8;
  font-size: 11px;
  margin-top: 2px;
}
.cell-customer {
  color: #F4F7FA;
  font-weight: 600;
}
.cell-qty {
  color: #FFFFFF;
  font-weight: 700;
  font-size: 13px;
}
.cell-unit {
  color: #8CA3B8;
  font-size: 12px;
}
.cell-deadline {
  color: #8CA3B8;
  font-size: 12px;
  display: flex;
  align-items: center;
}

/* Priority & Status pills */
.priority-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 800;
  min-width: 72px;
}
.priority-select-inline {
  padding: 0;
  cursor: pointer;
}
.priority-select-inline :deep(.q-field__control) {
  min-height: 24px;
  height: 24px;
  padding: 0 6px 0 10px;
}
.priority-select-inline :deep(.q-field__native),
.priority-select-inline :deep(.q-field__append) {
  color: inherit;
  font-size: 11px;
  font-weight: 800;
  min-height: 24px;
}
.priority-select-inline :deep(.q-field__marginal) {
  height: 24px;
}
.priority-select-inline :deep(.q-field__native) {
  padding: 0;
}
.priority-urgent {
  background: rgba(244, 67, 54, 0.15);
  color: #EF5350;
  border: 1px solid rgba(244, 67, 54, 0.25);
}
.priority-high {
  background: rgba(255, 152, 0, 0.15);
  color: #FFA726;
  border: 1px solid rgba(255, 152, 0, 0.25);
}
.priority-medium {
  background: rgba(120, 144, 156, 0.15);
  color: #90A4AE;
  border: 1px solid rgba(120, 144, 156, 0.25);
}
.priority-low {
  background: rgba(76, 175, 80, 0.15);
  color: #66BB6A;
  border: 1px solid rgba(76, 175, 80, 0.25);
}

.status-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.3px;
  min-width: 90px;
}
.status-not_started {
  background: rgba(120, 144, 156, 0.15);
  color: #90A4AE;
  border: 1px solid rgba(120, 144, 156, 0.25);
}
.status-planned {
  background: rgba(33, 150, 243, 0.15);
  color: #42A5F5;
  border: 1px solid rgba(33, 150, 243, 0.25);
}
.status-approved {
  background: rgba(0, 209, 178, 0.15);
  color: #00D1B2;
  border: 1px solid rgba(0, 209, 178, 0.25);
}
.status-in_progress {
  background: rgba(255, 152, 0, 0.15);
  color: #FFA726;
  border: 1px solid rgba(255, 152, 0, 0.25);
}
.status-done {
  background: rgba(76, 175, 80, 0.15);
  color: #66BB6A;
  border: 1px solid rgba(76, 175, 80, 0.25);
}

/* Responsive stats */
@media (max-width: 1200px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 599px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  .filter-bar {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
