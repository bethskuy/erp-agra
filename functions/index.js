const functions = require('firebase-functions/v1')
const admin = require('firebase-admin')

admin.initializeApp()

exports.deleteAuthUser = functions.firestore
  .document('karyawan/{karyawanId}')
  // eslint-disable-next-line no-unused-vars
  .onDelete(async (snap, context) => {
    const deletedKaryawan = snap.data()
    const uid = deletedKaryawan.uid // Pastikan saat create karyawan, Anda sudah menyimpan 'uid'

    if (uid) {
      try {
        await admin.auth().deleteUser(uid)
        console.log(`User dengan UID ${uid} berhasil dihapus dari Auth.`)
      } catch (error) {
        console.error('Error menghapus user dari Auth:', error)
      }
    } else {
      console.log('Tidak ada UID ditemukan pada dokumen karyawan ini.')
    }
  })
