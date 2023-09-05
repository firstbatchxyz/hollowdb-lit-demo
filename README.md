# How to use HollowDB with Lit Protocol


This is an example project using Lit Protocol and HollowDB together to create a two-sided encryption flow.

Using Lit Protocol, any data can be encrpyted and can only be decrypted if certain access control conditions are met. See the [lit protocol docs](https://developer.litprotocol.com/SDK/Explanation/encryption) for more information.

On the otherside, HollowDB allows you to store your data permamently and privately. Unlike Lit Protocol, HollowDB hides your address information and lets you update the data only by providing ZK-proofs. Read more about HollowDB [here](https://docs.hollowdb.xyz/).

Combining HollowDB with Lit Protocol gives you a two-sided encryption where both your identity and data is safe and encrypted.

## Prerequisite

We will use `hollowdb-client` package for interact with the database/contract. 
```bash
yarn add hollowdb-client
```
For the basics please look at this usage:
```js
import { HollowClient } from "hollowdb-client";

async function main() {
  const client = await HollowClient.new({
    apiKey: "YOUR_API_KEY",
    db: "Database-1",
  });

  await client.put(key, payload)
  await client.update(key, newPayload, proof);
  const result = await client.get(key);
}

main();
```
Please sign in from [here](https://developer.hollowdb.xyz/sign-in) to HollowDB dashboard to get your  `Api_Key`, `Database_Name`, `ContractTxId` that you will use in demo. 

  `ContractTxId`: change in path lit/pages/api/hollowdb.js with the key found in [here](https://developer.hollowdb.xyz)\
  `DatabaseName`: change in path server/src/client/client.ts with the key found in [here](https://developer.hollowdb.xyz)\
  `ApiKeys`:change in path server/src/client/client.ts with the key found in [here](https://developer.hollowdb.xyz/api-keys)

Also 2 different node version needed to run this demo (Lit protocol uses v16, on the server side you can use v18). To do that first install `nvm` according to instructions in [here](https://dev.to/saanchitapaul/install-nvm-node-version-manager-inside-zsh-34ke) and then you open 2 different terminal windows (after running the `yarn install` for both `server/` and `lit/` folders). Now you should be able to use 2 different node version via running `nvm use <node_version>` in two different terminal windows.
