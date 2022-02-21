const axios = require("axios");
const ethers = require("ethers");

const dotenv = require("dotenv").config();

const main = async () => {
  var thresh = ``;
  var result;
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
      dsa_accounts.push(data.owner);
    }
    thresh =
      result.data.data.logAccountCreateds[
        Object.values(result.data.data.logAccountCreateds).length - 1
      ].id;
  }

  thresh = ``;
  URL =
    "https://api.thegraph.com/subgraphs/id/QmW9Vn8uHdTr3nq99VbKgxVDC3siaHfmvR2MpkEsbF5wXV";

  while (true) {
    const res = await axios.post(URL, {
      query:
        `
            {
                positions(where: {id_gt:"` +
        thresh +
        `" owner_in: ${dsa_accounts}){
                    id
                    owner
                    pool
                }
            }
            `,
    });
    if (Object.values(!res.data.data || res.data.data.positions.length) === 0)
      break;
    datas1 = Object.values(res.data.data.positions);
    thresh =
      res.data.data.positions[Object.values(res.data.data.positions).length - 1]
        .id;
  }
};

main();
