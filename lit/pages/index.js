// --- UI components ( unrelated to the example )
import s from "../styles/Home.module.css";
import React, {useCallback} from "react";
import {useState} from "react";
import prettyBytes from "pretty-bytes";
import Script from "next/script";

// --- Essential libs for this example

import DropZone from "../components/DropZone";
import Completed from "../components/Completed";
import Instruction from "../components/Instruction";
import Header from "../components/Header";


import * as LitJsSdk from "@lit-protocol/lit-node-client";

import {computeKey, valueToBigInt} from "./lib/prover";
import {get, put, contractTxId} from "./api/hollowdb.js";

const arweaveJsonExample = {
    encryptedSymmetricKey: {0: 123, 1: 34, 2: "..."},
    encrpytedData: "data:application/octet-stream;...",
    accessControlConditions: ["..."],
};

const hollowdbJsonExample = {
    function: "put",
    value: {
        key: "3457924...",
        value: "n1Nssh6J_EBQD2em6BYA75PicTibOI3VOE_ZTUXdNxI",
    },
};

export default function Home() {
    // -- arweave states
    const [JWK, setJWK] = useState(null);
    const [arweaveAddress, setArweaveAddress] = useState(null);

    const [currency, setCurrency] = useState("arweave");
    const [node, setNode] = useState("http://node1.bundlr.network");

    const [file, setFile] = useState(null);
    const [fileSize, setFileSize] = useState(null);
    const [txId, setTxId] = useState(null);

    // -- lit states
    const [accessControlConditions, setAccessControlConditions] = useState(null);
    const [humanised, setHumanised] = useState(null);
    const [encryptedData, setEncryptedData] = useState(null);
    const [encryptedSymmetricKey, setEncryptedSymmetricKey] = useState(null);
    const [downloadedEncryptedData, setDownloadedEncryptedData] = useState(null);
    const [decryptedData, setDecryptedData] = useState(null);
    const [chain, setChain] = useState("ethereum");

    // -- init litNodeClient

    const litNodeClient = new LitJsSdk.LitNodeClient();
    litNodeClient.connect();

    //
    // (LIT) event: when a file is being dragged to the drop zone
    // @param { Array } accepted files callback from the input
    // @return { void }
    //
    const onDropFile = useCallback(async (acceptedFiles) => {
        const supportedFileTypes = ["image/jpeg", "image/png"];

        // Only return a single file
        const file = acceptedFiles[0];

        // -- validate:: if file type is .json
        if (!supportedFileTypes.includes(file.type)) {
            alert(
                `Incorrect file type! We only support ${supportedFileTypes.toString()} at the moment`
            );
            return;
        }

        const fileReader = new FileReader();

        fileReader.onload = async (e) => {
            const dataURL = e.target.result;

            console.log("DataURL:", dataURL);

            setFile(dataURL);

            setFileSize(prettyBytes(dataURL.length));
        };

        fileReader.readAsDataURL(file);
    }, []);

    //
    // (LIT Modal) Close share modal
    // @return { void }
    //
    const closeModal = () => {
        ACCM.ReactContentRenderer.unmount(document.getElementById("shareModal"));
    };

    //
    // (LIT Modal) Set access control conditions
    // @return { void }
    //
    const onClickSetAccessControl = () => {
        ACCM.ReactContentRenderer.render(
            ACCM.ShareModal,
            {
                sharingItem: [],
                onAccessControlConditionsSelected: async (accessControlConditions) => {
                    console.log("accessControlConditions:", accessControlConditions);

                    let humanised = await LitJsSdk.humanizeAccessControlConditions({
                        accessControlConditions:
                        accessControlConditions.accessControlConditions,
                    });

                    console.log("humanised:", humanised);

                    setAccessControlConditions(accessControlConditions);

                    setHumanised(humanised);

                    closeModal();
                },
                onClose: closeModal,
                getSharingLink: (sharingItem) => {
                },
                showStep: "ableToAccess",
            },
            document.getElementById("shareModal")
        );
    };

    //
    // (LIT) Encrypt image data
    // @return { void }
    //

    let acceptedKey = [];
    const onClickEncryptImage = async () => {
        let attempts = Math.random();
        const maxRetries = 10;
        let success = false;

        const authSig = await LitJsSdk.checkAndSignAuthMessage({ chain });
        const fileInBase64 = btoa(file);
        const { encryptedString, symmetricKey } = await LitJsSdk.encryptString(fileInBase64);
        const encryptedSymmetricKey = await litNodeClient.saveEncryptionKey({
            accessControlConditions: accessControlConditions.accessControlConditions,
            symmetricKey,
            authSig,
            chain,
        });

        const encryptedStringInDataURI = await blobToDataURI(encryptedString);
        let key = computeKey(valueToBigInt(authSig + attempts));

        // while (attempts < maxRetries && !success) {
        //     try {
        //         const response = await put(
        //             key,
        //             encryptedSymmetricKey,
        //             encryptedStringInDataURI,
        //             accessControlConditions
        //         );
        //         if (response && response.data && response.data.data && response.data.data.result) {
        //             success = true;
        //             acceptedKey.push(key);
        //             console.log("put response", response);
        //             setTxId(response.data.data.result);
        //             setEncryptedData(encryptedStringInDataURI);
        //             setEncryptedSymmetricKey(encryptedSymmetricKey);
        //         } else {
        //             attempts++;
        //             key = computeKey(valueToBigInt(authSig + attempts));
        //         }
        //     } catch (error) {
        //         attempts++;
        //         key = computeKey(valueToBigInt(authSig + attempts));
        //         if (attempts >= maxRetries) {
        //             console.error('Failed to store data after max retries:', error.message);
        //             break;
        //         }
        //     }
        // }

        while (attempts < maxRetries && !success) {
            console.log('Attempt:', attempts, 'Using key:', key);

            try {
                const response = await put(
                    key,
                    encryptedSymmetricKey,
                    encryptedStringInDataURI,
                    accessControlConditions
                );

                if (response.status === 200) {
                    success = true;
                    acceptedKey.push(key);
                    console.log('Response from put:', response);
                    setTxId(contractTxId);
                    setEncryptedData(encryptedStringInDataURI);
                    setEncryptedSymmetricKey(encryptedSymmetricKey);
                } else {
                    console.log('Put was unsuccessful, generating new key...');
                    attempts++;
                    key = computeKey(valueToBigInt(authSig + attempts));
                }
            } catch (error) {
                console.error('Error during put:', error);
                attempts++;
                key = computeKey(valueToBigInt(authSig + attempts));
            }
        }


        if (success) {
            console.log('Data stored successfully');
        } else {
            console.error('Failed to store data after all attempts');
        }
    };

    //
    // (Helper) Turn blob data to data URI
    // @param { Blob } blob
    // @return { Promise<String> } blob data in data URI
    //
    const blobToDataURI = (blob) => {
        return new Promise((resolve, reject) => {
            var reader = new FileReader();

            reader.onload = (e) => {
                var data = e.target.result;
                resolve(data);
            };
            reader.readAsDataURL(blob);
        });
    };

    //
    // (Helper) Convert data URI to blob
    // @param { String } dataURI
    // @return { Blob } blob object
    //
    const dataURItoBlob = (dataURI) => {
        console.log(dataURI);

        var byteString = window.atob(dataURI.split(",")[1]);
        var mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0];
        var ab = new ArrayBuffer(byteString.length);
        var ia = new Uint8Array(ab);
        for (var i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }

        var blob = new Blob([ab], {type: mimeString});

        return blob;
    };

    //
    // (GET) Fetch Encrypted Data
    // @return { void }
    //
    const onFetchEncryptedData = async () => {
        const downloadUrl = "https://arweave.net/" + txId; // txId has to be taken from the contract's 'Interaction Tags' field
        const authSig = await LitJsSdk.checkAndSignAuthMessage({chain});
        const key = acceptedKey[acceptedKey.length - 1];
        const response = await get(key);

        console.log("get response", response);
        const {encryptedData, encryptedSymmetricKey, accessControlConditions} =
            txId;

        setAccessControlConditions(accessControlConditions);
        setDownloadedEncryptedData(encryptedData);
    };

    //
    // (LIT) Decrypt downloaded encrypted data
    // @return { void }
    //

    const onDecryptDownloadedData = async () => {
        const authSig = await LitJsSdk.checkAndSignAuthMessage({chain});

        const symmetricKey = await litNodeClient.getEncryptionKey({
            accessControlConditions: accessControlConditions.accessControlConditions,
            // Note, below we convert the encryptedSymmetricKey from a UInt8Array to a hex string.  This is because we obtained the encryptedSymmetricKey from "saveEncryptionKey" which returns a UInt8Array.  But the getEncryptionKey method expects a hex string.
            toDecrypt: LitJsSdk.uint8arrayToString(encryptedSymmetricKey, "base16"),
            chain: chain,
            authSig,
        });

        console.log("downloadedEncryptedData", downloadedEncryptedData);

        const decryptedString = await LitJsSdk.decryptString(
            dataURItoBlob(downloadedEncryptedData),
            symmetricKey
        );

        const originalFormat = atob(decryptedString);

        console.log("Original Format:", originalFormat);

        setDecryptedData(originalFormat);
    };

    return (
        <div className={s.content}>
            {/* ----- Lit Share Modal ----- */}
            {/*
        Hidden in the background, but will appear when you click to
        set the access control conditions
      */}
            <div id="shareModal"></div>

            {/* ----- Header ----- */}
            <Header title="Here's an example of how to use HollowDB with Lit."/>

            {/* ==================== Prerequisite ==================== */}
            <h2>Prerequisite</h2>
            <div className={s.text}>
                1. You will need to have an Metamask wallet already, if not click{" "}
                <a target="_blank" rel="noreferrer" href="https://metamask.io/">
                    here
                </a>
            </div>

            {/* ==================== Encryption ==================== */}
            <h2>Encryption</h2>

            {/* ----- Step 1 ----- */}
            {
                <>
                    <Instruction
                        title="1. Select an Image to Upload"
                        subtitle="It uses the FileReader API to read the image as data URL"
                    />

                    {file == null ? (
                        <DropZone onDrop={onDropFile}/>
                    ) : (
                        <Completed title="Got your image!" subtitle={`Size: ${fileSize}`}/>
                    )}
                </>
            }

            {/* ----- Step 2 ----- */}
            {!file ? (
                ""
            ) : (
                <>
                    <Instruction
                        title="2. Set Access Control Conditions of the Image"
                        subtitle="Prepare access control conditions for lit nodes to sign later"
                    />

                    {!file || !accessControlConditions ? (
                        <button onClick={() => onClickSetAccessControl()} className={s.btn}>
                            Set Access Control Conditions
                        </button>
                    ) : (
                        <Completed
                            title="Access control conditions set!"
                            subtitle={`${humanised}`}
                        />
                    )}
                </>
            )}

            {/* ----- Step 3 ----- */}
            {!file || !accessControlConditions ? (
                ""
            ) : (
                <>
                    <Instruction
                        title="3. Encrypt Image and Upload to Arweave"
                        subtitle="Since the 'encryptString' function requires a String, we will turn the file into a string format, encrypt it and save the encryption key to lit nodes"
                    />

                    {!file || !accessControlConditions || !encryptedData ? (
                        <button onClick={() => onClickEncryptImage()} className={s.btn}>
                            Encrypt Image
                        </button>
                    ) : (
                        <Completed
                            title="Image encrypted and Uploaded to Arweave!"
                            subtitle="Encrypted key is stored to lit nodes"
                            children="uey"
                        >
                            <Instruction
                                title="This is how it looks like on HollowDB"
                                subtitle={JSON.stringify(hollowdbJsonExample, null, 100)}
                            />
                            <Instruction
                                title="This is how it looks like on Arweave"
                                subtitle={JSON.stringify(arweaveJsonExample, null, 100)}
                            />
                            <Instruction
                                title=""
                                subtitle="Everything from data to your identity is encrpyted and the data is only retrievable from the addresses set on the access control conditions"
                            />
                        </Completed>
                    )}
                </>
            )}

            {/* ==================== Decryption ==================== */}

            {/* ----- Step 4 ----- */}
            {!file || !accessControlConditions || !encryptedData || !txId ? (
                ""
            ) : (
                <>
                    <h2>Decryption</h2>

                    <Instruction
                        title="4. Fetch the Encrypted Data from HollowDB"
                        subtitle="The returned JSON data will have two of the three required parameters, accessControlConditions and encryptedSymmetricKey to retrieve the key shares from the lit nodes"
                    />

                    {!file ||
                    !accessControlConditions ||
                    !encryptedData ||
                    !downloadedEncryptedData ? (
                        <button
                            onClick={() => window.open(`https://sonar.warp.cc/?#/app/contract/${contractTxId}?network=mainnet#`, '_blank')}
                            className={s.btn}
                        >{`You can check your transaction from your contract!`}</button>
                    ) : (
                        <Completed
                            title="Encrypted Data Downloaded"
                            className={s.code}
                        ></Completed>
                    )}
                </>
            )}

            {/* ----- Step 5 ----- */}
            {!file ||
            !accessControlConditions ||
            !encryptedData ||
            !txId ||
            !downloadedEncryptedData ? (
                ""
            ) : (
                <>
                    <Instruction
                        title="5. Decrypt the Downloaded Encrypted Data"
                        subtitle="In the last step, we retrieved 'accessControlConditions' and 'encryptedSymmetricKey` as two of the required parameters to unlock the symmetric key, the last required parameter is the authentication signature from your wallet. Now that we have got all three, we will pass it to the getEncryptionKey function to get the symmetric key, and pass both symmetric key and encrypted data to the decryption function to unlock the original image"
                    />

                    {!file ||
                    !accessControlConditions ||
                    !encryptedData ||
                    !downloadedEncryptedData ||
                    !decryptedData ? (
                        <button onClick={() => onDecryptDownloadedData()} className={s.btn}>
                            {"Decrypt downloaded encrypted data"}
                        </button>
                    ) : (
                        <Completed title="Done. Data decrypted!" className={s.code}>
                            <img src={decryptedData} width="500" height="300"/>
                        </Completed>
                    )}
                </>
            )}

            {/* ----- Docs ----- */}
            {/*
        Please visit the following links for more information, or
        contact us via email, discord, twitter, etc.
      */}
            <div className={s.footer}>
                <div className={s.footer_title}>References:</div>
                <ul>
                    <li>
                        <a
                            target="_blank"
                            rel="noreferrer"
                            href="https://github.com/LIT-Protocol/lit-bundlr-example"
                        >
                            GitHub
                        </a>
                    </li>
                    <li>
                        <a
                            target="_blank"
                            rel="noreferrer"
                            href="https://docs.bundlr.network/docs/overview"
                        >
                            https://docs.bundlr.network/docs/overview
                        </a>
                    </li>
                    <li>
                        <a
                            target="_blank"
                            rel="noreferrer"
                            href="https://developer.litprotocol.com/docs/intro"
                        >
                            https://developer.litprotocol.com/docs/intro
                        </a>
                    </li>
                </ul>
            </div>

            {/* ----- Required JS libraries ----- */}
            {/*
        Unfortunately, because NextJS forbids importing CSS modules in dependencies, this library cannot be used in NextJS natively. You must use the vanilla js project above, which will work fine with NextJS.
        READ MORE HERE: https://developer.litprotocol.com/docs/LitTools/shareModal
      */}
            <Script src="https://cdn.jsdelivr.net/npm/lit-share-modal-v2-vanilla-js/dist/index.js"></Script>
        </div>
    );
}
