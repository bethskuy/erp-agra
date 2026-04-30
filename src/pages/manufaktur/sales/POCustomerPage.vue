<template>
  <q-page class="q-pa-md bg-grey-2">
    <!-- Header -->
    <div class="row items-center q-mb-md">
      <div>
        <div class="text-h5 text-weight-bold text-teal-10">Purchase Order (PO) Customer</div>
        <div class="text-subtitle2 text-grey-6">Pesanan Resmi dari Customer</div>
      </div>
      <q-space />
      <q-btn color="teal-10" icon="add" label="Terima PO Baru" @click="showForm = true" />
    </div>

    <!-- Tabel -->
    <q-table
      :rows="purchaseOrders"
      :columns="columns"
      row-key="id"
      flat
      bordered
      class="bg-white"
    />

    <!-- Dialog -->
    <q-dialog v-model="showForm" persistent>
      <q-card style="min-width: 400px">
        <q-card-section class="row items-center">
          <div class="text-h6">Input PO Customer</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-gutter-md">
          <q-input v-model="form.noPO" label="Nomor PO" outlined dense />
          <q-input v-model="form.customerName" label="Nama Customer" outlined dense />
          <q-input v-model="form.produk" label="Produk" outlined dense />
          <q-input v-model.number="form.qty" type="number" label="Quantity" outlined dense />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Batal" v-close-popup />
          <q-btn color="teal-10" label="Simpan" @click="savePO" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { db } from 'src/boot/firebase'
import { collection, addDoc, onSnapshot, query, orderBy } from 'firebase/firestore'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const showForm = ref(false)
const purchaseOrders = ref([])

const form = ref({
  noPO: '',
  customerName: '',
  produk: '',
  qty: 0,
  status_prod: 'Pending',
})

const columns = [
  { name: 'no_po', label: 'No. PO', field: 'noPO', align: 'left' },
  { name: 'customer', label: 'Customer', field: 'customerName', align: 'left' },
  { name: 'produk', label: 'Produk', field: 'produk', align: 'left' },
  { name: 'qty', label: 'Qty', field: 'qty', align: 'center' },
]

const loadData = () => {
  const q = query(collection(db, 'purchase_orders_customer'), orderBy('created_at', 'desc'))
  onSnapshot(q, (snap) => {
    purchaseOrders.value = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  })
}

const savePO = async () => {
  if (!form.value.noPO) {
    $q.notify({ type: 'warning', message: 'Nomor PO wajib diisi' })
    return
  }

  $q.loading.show()
  try {
    await addDoc(collection(db, 'purchase_orders_customer'), {
      ...form.value,
      created_at: new Date(),
    })
    showForm.value = false
    $q.notify({ type: 'positive', message: 'PO Berhasil Simpan' })
  } catch (e) {
    console.error(e)
    $q.notify({ type: 'negative', message: 'Gagal Simpan' })
  } finally {
    $q.loading.hide()
  }
}

onMounted(loadData)
</script>

<style scoped></style>
