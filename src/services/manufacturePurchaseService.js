import { db } from 'src/boot/firebase'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'

export const manufacturePurchaseEndpoints = Object.freeze({
  purchaseOrders: '/manufacture/purchase-orders',
  purchaseApprovals: '/manufacture/purchase-approvals',
})

export const manufacturePurchaseCollections = Object.freeze({
  purchaseOrders: 'mf_purchase_orders',
  purchaseOrderItems: 'mf_purchase_order_items',
  purchaseApprovals: 'mf_purchase_approvals',
})

const PURCHASE_NAMESPACE = 'manufacturePurchaseOrder'
const APPROVAL_NAMESPACE = 'manufactureApprovalPO'

const mapSnapshot = (snap) => snap.docs.map((document) => ({ id: document.id, ...document.data() }))

const sortByCreatedAtDesc = (a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)

const purchaseOrderCollection = () => collection(db, manufacturePurchaseCollections.purchaseOrders)
const purchaseOrderItemCollection = () =>
  collection(db, manufacturePurchaseCollections.purchaseOrderItems)
const purchaseApprovalCollection = () =>
  collection(db, manufacturePurchaseCollections.purchaseApprovals)

export const getPurchaseOrders = async () => {
  const scopedQuery = query(purchaseOrderCollection(), where('namespace', '==', PURCHASE_NAMESPACE))
  const snap = await getDocs(scopedQuery)
  return mapSnapshot(snap).sort(sortByCreatedAtDesc)
}

export const subscribePurchaseOrders = (onRows, onError) =>
  onSnapshot(
    query(purchaseOrderCollection(), where('namespace', '==', PURCHASE_NAMESPACE)),
    (snap) => onRows(mapSnapshot(snap).sort(sortByCreatedAtDesc)),
    onError,
  )

export const createPurchaseOrder = async (payload, items = []) => {
  const scopedPayload = {
    ...payload,
    namespace: PURCHASE_NAMESPACE,
    source_module: 'manufaktur',
    endpoint: manufacturePurchaseEndpoints.purchaseOrders,
    createdAt: payload.createdAt || serverTimestamp(),
  }

  const poRef = await addDoc(purchaseOrderCollection(), scopedPayload)

  await Promise.all(
    items.map((item, index) =>
      addDoc(purchaseOrderItemCollection(), {
        purchase_order_id: poRef.id,
        nomor: scopedPayload.nomor,
        line_no: index + 1,
        namespace: PURCHASE_NAMESPACE,
        source_module: 'manufaktur',
        ...item,
        project_id: item.project_id || scopedPayload.project_id || scopedPayload.proyek_id || '',
        project_name: item.project_name || scopedPayload.project_name || scopedPayload.proyek_nama || '',
        proyek_id: item.proyek_id || scopedPayload.project_id || scopedPayload.proyek_id || '',
        proyek_nama: item.proyek_nama || scopedPayload.project_name || scopedPayload.proyek_nama || '',
        createdAt: serverTimestamp(),
      }),
    ),
  )

  return poRef
}

export const updatePurchaseStatus = async (id, status, extraPayload = {}) => {
  const payload = {
    ...extraPayload,
    status,
    namespace: PURCHASE_NAMESPACE,
    source_module: 'manufaktur',
    updatedAt: serverTimestamp(),
  }

  await updateDoc(doc(db, manufacturePurchaseCollections.purchaseOrders, id), payload)
  return payload
}

export const approvePurchaseOrder = async (row, status, approvalPayload = {}) => {
  const updatedPayload = await updatePurchaseStatus(row.id, status, approvalPayload)

  await addDoc(purchaseApprovalCollection(), {
    purchase_order_id: row.id,
    nomor: row.nomor,
    action: status,
    namespace: APPROVAL_NAMESPACE,
    source_module: 'manufaktur',
    endpoint: manufacturePurchaseEndpoints.purchaseApprovals,
    ...approvalPayload,
    createdAt: serverTimestamp(),
  })

  return updatedPayload
}

export const deletePurchaseOrder = (id) =>
  deleteDoc(doc(db, manufacturePurchaseCollections.purchaseOrders, id))
