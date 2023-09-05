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

- You need also sign in from [here](https://developer.hollowdb.xyz/sign-in) to HollowDB dashboard to get your  `Api_Key`, `Database_Name`, `ContractTxId` that you will use in demo. 
<br/>
<br/>
    **`ContractTxId`:** change in path [lit/pages/api/hollowdb.js](https://github.com/firstbatchxyz/hollowdb-lit-demo/blob/387416ebf8aade941709a6aaeb8701e2d1bf7e60/lit/pages/api/hollowdb.js#L11) with the key found in [here](https://developer.hollowdb.xyz)\
    **`ApiKeys`:** change in path [server/src/client/client.ts](https://github.com/firstbatchxyz/hollowdb-lit-demo/blob/387416ebf8aade941709a6aaeb8701e2d1bf7e60/server/src/client/client.ts#L15C15-L15C15) with the key found in [here](https://developer.hollowdb.xyz/api-keys)\
    **`DatabaseName`:** change in path [server/src/client/client.ts](https://github.com/firstbatchxyz/hollowdb-lit-demo/blob/387416ebf8aade941709a6aaeb8701e2d1bf7e60/server/src/client/client.ts#L16) with the key found in [here](https://developer.hollowdb.xyz)
  <br/>
  <br/>
- You also need to have 2 different node version to run this demo. To do that first install `nvm` according to instructions in [here](https://dev.to/saanchitapaul/install-nvm-node-version-manager-inside-zsh-34ke) and then you open 2 different terminal windows (after running the `yarn install` for both `server/` and `lit/` folders). Now you should be able to use 2 different node version via running `nvm use <node_version>` in two different terminal windows (Lit protocol uses v16, on the server side you can use v18).
