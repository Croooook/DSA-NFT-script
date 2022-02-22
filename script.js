const axios = require("axios");
const ethers = require("ethers");

const dotenv = require("dotenv").config();
import { request, gql } from 'graphql-request'

const main = async () => {
  var thresh = ``;
  var result;
  let response = []
  //var ctr=1;
  const dsa_accounts = [];
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
      dsa_accounts.push(String(data.owner));
    }
    thresh =
      result.data.data.logAccountCreateds[
        Object.values(result.data.data.logAccountCreateds).length - 1
      ].id;
  }
console.log(dsa_accounts.slice(0, 100))
  thresh = ``;
  URL =
    "https://api.thegraph.com/subgraphs/name/thrilok209/instadapp-uniswap-v3";
  let i = 0;
  let end = dsa_accounts.length
  
  while (true) {
    const res = await axios.post(URL, {
      query:
        `
            {
                positions(first: 1000, where: {id_gt:"` +
                thresh +
                `"  owner_in : ${dsa_accounts.slice(i, i + 1000)}}){
                    id
                    owner
                    pool
                }
            }
            `,
    });

    if(i > end) break
    i += 1000;
    const res1= await request (getGraphUrl(URL),query)
    // console.log(res.data)
    if (!res.data.data) continue;
    if (!res.data.data.positions) continue;

    datas1 = res.data.data.positions;
    console.log("🚀 ~ file: script.js ~ line 62 ~ main ~ datas1", datas1)
    response = response.concat(datas1)
    thresh =
      res.data.data.positions[Object.values(res.data.data.positions).length - 1]
        .id;
  }
};

main();
