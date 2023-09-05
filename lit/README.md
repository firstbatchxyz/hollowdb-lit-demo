# How to use HollowDB with Lit Protocol

This is an example project using Lit Protocol and HollowDB together to create a two-sided encryption flow.

Using Lit Protocol, any data can be encrpyted and can only be decrypted if certain access control conditions are met. See the [lit protocol docs](https://developer.litprotocol.com/SDK/Explanation/encryption) for more information.

On the otherside, HollowDB allows you to store your data permamently and privately. Unlike Lit Protocol, HollowDB hides your address information and lets you update the data only by providing ZK-proofs. Read more about HollowDB [here](https://docs.hollowdb.xyz/).

Combining HollowDB with Lit Protocol gives you a two-sided encryption where both your identity and data is safe and encrypted.

## Prerequisite

An HollowDB server must be live with a Bundlr funded account and a HollowDB contract deployed.

- Host a HollowDB server. You can find the HollowDB Express server repo [here](https://github.com/firstbatchxyz/hollowdb-express/tree/master)
- Check this [link](https://docs.hollowdb.xyz/hollowdb/contract-operations) to see how to deploy an HollowDB contract.
- To fund a Bundlr node, refer to their [docs](https://docs.bundlr.network/developer-docs/quickstart#3-fund-your-node-to-pay-for-uploads).

Don't forget to put your wallet inside the HollowDB server after you fund a Bundlr node.
