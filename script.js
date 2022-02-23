const axios = require("axios");
const ethers = require("ethers");

const dotenv = require("dotenv").config();
const { request, gql } = require("graphql-request");

const alchemy_key = `https://polygon-mainnet.g.alchemy.com/v2/9VPZHrKVkuzR6gAqaUZi6SpOlBZobRcO`;

let stakerabi = require("./staker-abi");
let addr_staker = "0xe34139463bA50bD61336E0c446Bd8C0867c6fE65";
let provider = new ethers.providers.JsonRpcProvider(alchemy_key);
let staker_contract = new ethers.Contract(addr_staker, stakerabi, provider);

const main = async () => {
  let nft_owner = await staker_contract.deposits("62542");
  console.log(nft_owner.owner);
  var thresh = ``;
  var result;

  //var ctr=1;
  const dsa_accounts = new Map();
  let URL = "https://api.thegraph.com/subgraphs/name/croooook/dsa-accounts";
  while (true) {
    result = await axios.post(URL, {
      query:
        `
            {
                logAccountCreateds(first: 1000, where: {id_gt:"` +
        thresh +
        `"}){
                    id
                    account
                    owner
                  }
            }
            `,
    });

    if (Object.values(result.data.data.logAccountCreateds).length === 0) break;
    let datas = Object.values(result.data.data.logAccountCreateds);
    for (let data of datas) {
      dsa_accounts.set(String(data.account), 1);
    }
    thresh =
      result.data.data.logAccountCreateds[
        Object.values(result.data.data.logAccountCreateds).length - 1
      ].id;
  }
  //   dsa_accounts.sort()
console.log(dsa_accounts.get("0x3BfA7256e986C96A2826364C66dB0f7f6DFc9716"));
  

  thresh = `0`;
  URL =
    "https://api.thegraph.com/subgraphs/name/thrilok209/instadapp-uniswap-v3";

  response = [];
  while (true) {
    const res = await axios.post(URL, {
      query:
        `
              {
                  positions(first: 1000, where: {id_gt:"` +
        thresh +
        `"  }){
                      id
                      owner
                      pool
                      liquidity
                  }
              }
              `,
    });
    console.log(Object.values(res.data.data.positions).length);

    if (Object.values(res.data.data.positions).length === 0) break;
    const datas1 = Object.values(res.data.data.positions);

    for (let data of datas1) {
      let nft_owner = await staker_contract.deposits(data.id);
      if (data.owner == addr_staker && dsa_accounts.get(nft_owner.owner) == 1) {
        data.owner = nft_owner.owner;
        response.push(data);
      }
      if (dsa_accounts.get(data.owner) == 1) {
        response.push(data);
      }
    }  
    thresh =
      res.data.data.positions[Object.values(res.data.data.positions).length - 1]
        .id;
    console.log(thresh);
  }
  console.log("🚀 ~ file: script.js ~ line 73 ~ main ~ response", response);
};

main();
