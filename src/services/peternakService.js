import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDoc,
} from "firebase/firestore";
import { db } from "../firebase/config";

const COLLECTION_PETERNAK = "peternak";

// CREATE
export const createPeternak = async (peternakData) => {
  try {
    console.log("createPeternak called with:", peternakData);

    const requiredFields = [
      "namaLengkap",
      "nik",
      "alamat",
      "nomorTelepon",
      "jenisKelamin",
      "statusSiklus",
      "tanggalDaftar",
      "jumlahTernakAwal",
      "targetPengembalian",
    ];

    for (const field of requiredFields) {
      if (
        peternakData[field] === undefined ||
        peternakData[field] === null ||
        peternakData[field] === ""
      ) {
        console.error(`Missing required field: ${field}`);
        throw new Error(`Field ${field} wajib diisi`);
      }
    }

    // Remove jumlahTernakSaatIni from peternak data - it will only exist in laporan
    const { jumlahTernakSaatIni, ...finalData } = peternakData;

    console.log("Final data for Firebase:", finalData);

    // Cek NIK duplikat
    const nikQuery = query(
      collection(db, COLLECTION_PETERNAK),
      where("nik", "==", peternakData.nik)
    );
    const nikSnapshot = await getDocs(nikQuery);
    if (!nikSnapshot.empty) {
      throw new Error("NIK sudah terdaftar");
    }

    const docRef = await addDoc(collection(db, COLLECTION_PETERNAK), finalData);

    console.log("Document created with ID:", docRef.id);
    return { id: docRef.id, ...finalData };
  } catch (error) {
    console.error("Error creating peternak:", error);
    throw error;
  }
};

// READ ALL
export const getAllPeternak = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTION_PETERNAK));
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error getting all peternak:", error);
    throw error;
  }
};

// READ BY ID
export const getPeternakById = async (peternakId) => {
  try {
    const peternakDoc = await getDoc(doc(db, COLLECTION_PETERNAK, peternakId));
    if (!peternakDoc.exists()) {
      throw new Error("Data peternak tidak ditemukan");
    }
    return { id: peternakDoc.id, ...peternakDoc.data() };
  } catch (error) {
    console.error("Error getting peternak by id:", error);
    throw error;
  }
};

// UPDATE
export const updatePeternak = async (peternakId, updateData) => {
  try {
    // Jika ada perubahan NIK, cek duplikat
    if (updateData.nik) {
      const nikQuery = query(
        collection(db, COLLECTION_PETERNAK),
        where("nik", "==", updateData.nik)
      );
      const nikSnapshot = await getDocs(nikQuery);
      const duplicateDoc = nikSnapshot.docs.find(
        (doc) => doc.id !== peternakId
      );
      if (duplicateDoc) {
        throw new Error("NIK sudah terdaftar");
      }
    }

    await updateDoc(doc(db, COLLECTION_PETERNAK, peternakId), updateData);
    return { id: peternakId, ...updateData };
  } catch (error) {
    console.error("Error updating peternak:", error);
    throw error;
  }
};

// DELETE
export const deletePeternak = async (peternakId) => {
  try {
    await deleteDoc(doc(db, COLLECTION_PETERNAK, peternakId));
    return { success: true };
  } catch (error) {
    console.error("Error deleting peternak:", error);
    throw error;
  }
};

export const updateStatusKinerjaOtomatis = async (
  peternakId,
  statusKinerja
) => {
  try {
    const peternakRef = doc(db, COLLECTION_PETERNAK, peternakId);
    await updateDoc(peternakRef, { statusKinerja });
    return { id: peternakId, statusKinerja };
  } catch (error) {
    console.error("Error updating status kinerja:", error);
    throw error;
  }
};
