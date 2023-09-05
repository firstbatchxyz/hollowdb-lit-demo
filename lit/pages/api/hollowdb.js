import axios from "axios";

const axiosClient = axios.create({
  baseURL: `http://127.0.0.1:5000`,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "localhost:5000",
  },
});
export const contractTxId = '<CONTRACT_TX_ID>';


export function put(
    key,
    encryptedSymmetricKey,
    encryptedData,
    accessControlConditions
) {
  const data = {
    encryptedSymmetricKey: encryptedSymmetricKey,
    encryptedData: encryptedData,
    accessControlConditions: accessControlConditions,
  };
  const payload = {
    key: key,
    value: data,
  };
  console.log("payload: ", payload);
  return axiosClient.post("/encrypt/put", payload);
}

export function get(key) {
  return axiosClient.get("/encrypt/get/" + key);
}


