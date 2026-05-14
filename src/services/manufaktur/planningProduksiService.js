import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from 'src/boot/firebase'

const COLLECTION_NAME = 'manufaktur_planning_produksi'

const planningCollection = collection(db, COLLECTION_NAME)

export const listenPlanningProduksi = (callback, errorCallback) => {
  const planningQuery = query(planningCollection, orderBy('updated_at', 'desc'))

  return onSnapshot(
    planningQuery,
    (snapshot) => {
      const rows = snapshot.docs.map((planningDoc) => ({
        id: planningDoc.id,
        ...planningDoc.data(),
      }))

      callback(rows)
    },
    errorCallback,
  )
}

export const createPlanningProduksi = (payload) =>
  addDoc(planningCollection, {
    ...payload,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  })

export const updatePlanningProduksi = (id, payload) =>
  updateDoc(doc(db, COLLECTION_NAME, id), {
    ...payload,
    updated_at: serverTimestamp(),
  })

export const deletePlanningProduksi = (id) => deleteDoc(doc(db, COLLECTION_NAME, id))
