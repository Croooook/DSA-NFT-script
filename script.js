const axios = require("axios");
const ethers = require("ethers");

const dotenv = require("dotenv").config();
const { request, gql } = require("graphql-request");

const alchemy_key = `https://polygon-mainnet.g.alchemy.com/v2/9VPZHrKVkuzR6gAqaUZi6SpOlBZobRcO`;

let stakerabi = require("./staker-abi");
let addr_staker = "0xe34139463bA50bD61336E0c446Bd8C0867c6fE65".toLowerCase();
let provider = new ethers.providers.JsonRpcProvider(alchemy_key);
let staker_contract = new ethers.Contract(addr_staker, stakerabi, provider);

let liqabi = require("./liquidity-abi.json");
let addr_liq = "0x878C410028E3830f1Fe03C428FF95012111Ae1f1".toLowerCase();
let liq_contract = new ethers.Contract(addr_liq , liqabi , provider);


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
 
console.log(dsa_accounts.get("0x4dee144e4d60ad8ae3e4b53e09669349dc0e23da"));
  

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
      
      if (data.owner.toLowerCase() == addr_staker ) {
        let nft_owner = await staker_contract.deposits(data.id);
          if(dsa_accounts.get(nft_owner.owner.toLowerCase()) == 1){
            data.owner = nft_owner.owner.toLowerCase();
            response.push(data);
    }
      }
      else if (dsa_accounts.get(data.owner.toLowerCase()) == 1) {
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
