const axios = require("axios");
const ethers = require("ethers");

const dotenv = require("dotenv").config();
const { request, gql } = require("graphql-request");

const main = async () => {
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

    
    URL =
        "https://api.thegraph.com/subgraphs/name/thrilok209/instadapp-uniswap-v3";
    let i = 0;
    let end = dsa_accounts.length;

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
        console.log(Object.values(res.data.data.positions).length)
        
        if (Object.values(res.data.data.positions).length === 0) break;
        const datas1 = Object.values(res.data.data.positions);
        for (let data of datas1) {
            if (dsa_accounts.get(data.owner) == 1) {
                response.push(data);
            }
        }
        console.log("🚀 ~ file: script.js ~ line 73 ~ main ~ response", response);
        
        console.log(dsa_accounts.get('0xe30e4dfdbb10949c27501922f845e20cfa579f09'))
        thresh =
            res.data.data.positions[
                Object.values(res.data.data.positions).length - 1
            ].id;
        console.log(thresh);
    }
};

main();
