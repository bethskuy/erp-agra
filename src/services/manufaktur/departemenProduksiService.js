import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  where,
} from 'firebase/firestore'
import { db } from 'src/boot/firebase'

const PRODUKSI_COLLECTION = 'manufactur_departemen_produksi'
const PERMINTAAN_BARANG_COLLECTION = 'manufactur_permintaan_barang'
const MASTER_DEPARTEMEN_COLLECTION = 'manufactur_master_departemen'
const MASTER_SATUAN_COLLECTION = 'manufactur_master_satuan'
const MASTER_CUSTOMER_COLLECTION = 'manufactur_master_customer'
const MASTER_BARANG_COLLECTION = 'manufactur_master_barang'
const KATEGORI_BARANG_COLLECTION = 'manufactur_master_kategori_barang'
const MASTER_PRODUK_COLLECTION = 'master_produk'
const PO_CUSTOMER_COLLECTION = 'purchase_order_manufactur'
const RUNNING_NUMBER_COLLECTION = 'manufactur_running_number'

const produksiCollection = collection(db, PRODUKSI_COLLECTION)
const permintaanBarangCollection = collection(db, PERMINTAAN_BARANG_COLLECTION)

export const listenManufacturingDepartemenProduksi = (callback, errorCallback) => {
  const produksiQuery = query(produksiCollection, orderBy('created_at', 'desc'))

  return onSnapshot(
    produksiQuery,
    (snapshot) => {
      const rows = snapshot.docs.map((produksiDoc) => ({
        id: produksiDoc.id,
        ...produksiDoc.data(),
      }))

      callback(rows)
    },
    errorCallback,
  )
}

export const createManufacturingDepartemenProduksi = async (payload) =>
  addDoc(produksiCollection, {
    ...payload,
    created_at: serverTimestamp(),
  })

export const deleteManufacturingDepartemenProduksi = async (id) =>
  deleteDoc(doc(db, PRODUKSI_COLLECTION, id))

const getSpbDateParts = (tanggal) => {
  const dateValue = tanggal ? new Date(tanggal) : new Date()
  const safeDate = Number.isNaN(dateValue.getTime()) ? new Date() : dateValue

  return {
    bulan: String(safeDate.getMonth() + 1).padStart(2, '0'),
    tahun: String(safeDate.getFullYear()),
  }
}

const sanitizeKodeDepartemen = (kode) =>
  String(kode || 'MFG')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '') || 'MFG'

export const createManufacturingPermintaanBarang = async (payload) => {
  const kodeDepartemen = sanitizeKodeDepartemen(payload?.tujuan_departemen?.kode_departemen)
  const { bulan, tahun } = getSpbDateParts(payload?.tanggal)
  const counterId = `spb_dep_${kodeDepartemen}_${tahun}_${bulan}`
  const counterRef = doc(db, RUNNING_NUMBER_COLLECTION, counterId)
  const suratRef = doc(permintaanBarangCollection)

  return runTransaction(db, async (transaction) => {
    const counterDoc = await transaction.get(counterRef)
    const nextNumber = Number(counterDoc.exists() ? counterDoc.data().last_number || 0 : 0) + 1
    const runningNumber = String(nextNumber).padStart(3, '0')
    const nomorSurat = `SPB-DEP/${kodeDepartemen}/${bulan}/${tahun}/${runningNumber}`

    transaction.set(counterRef, {
      kode_departemen: kodeDepartemen,
      bulan,
      tahun,
      last_number: nextNumber,
      updated_at: serverTimestamp(),
    })

    transaction.set(suratRef, {
      ...payload,
      nomor_surat: nomorSurat,
      status: 'pending',
      created_at: serverTimestamp(),
    })

    return {
      id: suratRef.id,
      nomor_surat: nomorSurat,
    }
  })
}

export const listenManufacturingPermintaanBarang = (callback, errorCallback) => {
  const permintaanQuery = query(permintaanBarangCollection, orderBy('created_at', 'desc'))

  return onSnapshot(
    permintaanQuery,
    (snapshot) => {
      callback(
        snapshot.docs.map((permintaanDoc) => ({
          id: permintaanDoc.id,
          ...permintaanDoc.data(),
        })),
      )
    },
    errorCallback,
  )
}

export const getManufacturingMasterDepartemen = async (id) => {
  if (!id) return null

  const departemenDoc = await getDoc(doc(db, MASTER_DEPARTEMEN_COLLECTION, id))
  if (!departemenDoc.exists()) return null

  return {
    id: departemenDoc.id,
    ...departemenDoc.data(),
  }
}

export const listenManufacturingSatuanOptions = (callback, errorCallback) => {
  const satuanQuery = query(collection(db, MASTER_SATUAN_COLLECTION), orderBy('nama', 'asc'))

  return onSnapshot(
    satuanQuery,
    (snapshot) => {
      callback(
        snapshot.docs.map((satuanDoc) => ({
          id: satuanDoc.id,
          label: satuanDoc.data().nama || satuanDoc.id,
          value: satuanDoc.id,
          ...satuanDoc.data(),
        })),
      )
    },
    errorCallback,
  )
}

export const listenManufacturingCustomerOptions = (callback, errorCallback) => {
  const customerQuery = query(collection(db, MASTER_CUSTOMER_COLLECTION), orderBy('nama', 'asc'))

  return onSnapshot(
    customerQuery,
    (snapshot) => {
      callback(
        snapshot.docs.map((customerDoc) => {
          const data = customerDoc.data()
          const label = data.nama || data.nama_customer || data.customerName || customerDoc.id

          return {
            id: customerDoc.id,
            label,
            value: customerDoc.id,
            ...data,
          }
        }),
      )
    },
    errorCallback,
  )
}

export const listenManufacturingBarangOptions = (callback, errorCallback) => {
  const barangQuery = query(collection(db, MASTER_BARANG_COLLECTION), orderBy('nama', 'asc'))

  return onSnapshot(
    barangQuery,
    (snapshot) => {
      callback(
        snapshot.docs.map((barangDoc) => {
          const data = barangDoc.data()
          const label = data.nama || data.nama_barang || data.nama_material || barangDoc.id

          return {
            id: barangDoc.id,
            label,
            value: barangDoc.id,
            kategori: data.kategori || data.kategori_barang || '',
            satuan: data.unit || data.satuan || '',
            kode_barang: data.kode || data.kode_barang || '',
            ...data,
          }
        }),
      )
    },
    errorCallback,
  )
}

export const listenManufacturingKategoriBarangOptions = (callback, errorCallback) => {
  const kategoriQuery = query(collection(db, KATEGORI_BARANG_COLLECTION), orderBy('nama', 'asc'))

  return onSnapshot(
    kategoriQuery,
    (snapshot) => {
      callback(
        snapshot.docs.map((kategoriDoc) => ({
          id: kategoriDoc.id,
          label: kategoriDoc.data().nama || kategoriDoc.id,
          value: kategoriDoc.id,
          ...kategoriDoc.data(),
        })),
      )
    },
    errorCallback,
  )
}

export const listenManufacturingMasterProdukOptions = (callback, errorCallback) => {
  const produkQuery = query(collection(db, MASTER_PRODUK_COLLECTION), orderBy('nama_produk', 'asc'))

  return onSnapshot(
    produkQuery,
    (snapshot) => {
      callback(
        snapshot.docs.map((produkDoc) => {
          const data = produkDoc.data()
          const label = data.nama_produk || data.nama || produkDoc.id

          return {
            id: produkDoc.id,
            label,
            value: produkDoc.id,
            kode_produk: data.kode_produk || data.kode || '',
            nama_produk: label,
            satuan: data.satuan || data.unit || '',
            ...data,
          }
        }),
      )
    },
    errorCallback,
  )
}

export const listenManufacturingApprovedPoOptions = (callback, errorCallback) => {
  const poQuery = query(collection(db, PO_CUSTOMER_COLLECTION), where('status', '==', 'Approved'))

  return onSnapshot(
    poQuery,
    (snapshot) => {
      callback(
        snapshot.docs.map((poDoc) => {
          const data = poDoc.data()
          const nomor = data.nomor || data.noPO || data.no_po || poDoc.id
          const items = Array.isArray(data.items)
            ? data.items
            : Array.isArray(data.list_item_barang)
              ? data.list_item_barang
              : Array.isArray(data.detail_barang)
                ? data.detail_barang
                : []
          const firstItem = items[0] || {}
          const customerName =
            data.customerName ||
            data.customer_nama ||
            data.kepada_yth ||
            data.proyek_nama ||
            data.konsumen ||
            ''
          const totalPo = Number(data.total_estimasi || data.total || data.grand_total || 0)
          const qtyPo = Number(
            firstItem.qty ||
              firstItem.quantity ||
              firstItem.qty_po ||
              data.qty_po ||
              data.qty ||
              data.total_qty ||
              0,
          )
          const produkName =
            firstItem.nama_produk ||
            firstItem.nama_barang ||
            firstItem.produk ||
            firstItem.nama ||
            data.nama_produk ||
            data.produk ||
            ''

          return {
            id: poDoc.id,
            label: nomor,
            value: poDoc.id,
            nomor,
            customerName,
            customer_id: data.customer_id || data.id_customer || data.customerId || null,
            total_po: totalPo,
            qty_po: qtyPo,
            satuan: firstItem.satuan || firstItem.unit || data.satuan || '',
            produk_id: firstItem.produk_id || firstItem.product_id || data.produk_id || null,
            kode_produk: firstItem.kode_produk || firstItem.kode_barang || data.kode_produk || '',
            nama_produk: produkName,
            items,
            ...data,
          }
        }),
      )
    },
    errorCallback,
  )
}
