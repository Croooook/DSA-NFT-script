const axios = require("axios");
const ethers = require("ethers");

const dotenv = require("dotenv").config();
const { request, gql } = require("graphql-request");
const BigNumber = require("bignumber.js");
const alchemy_key = `https://polygon-mainnet.g.alchemy.com/v2/9VPZHrKVkuzR6gAqaUZi6SpOlBZobRcO`;

let stakerabi = require("./staker-abi");
let addr_staker = "0xe34139463bA50bD61336E0c446Bd8C0867c6fE65".toLowerCase();
let provider = new ethers.providers.JsonRpcProvider(alchemy_key);
let staker_contract = new ethers.Contract(addr_staker, stakerabi, provider);

let liqabi = require("./liquidity-abi.json");
let addr_liq = "0x878C410028E3830f1Fe03C428FF95012111Ae1f1".toLowerCase();
let liq_contract = new ethers.Contract(addr_liq, liqabi, provider);

let poolabi = require("./pool-abi.json");
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
                      tickLower
                      tickUpper
                  }
              }
              `,
    });
    console.log(Object.values(res.data.data.positions).length);

    if (Object.values(res.data.data.positions).length === 0) break;
    const datas1 = Object.values(res.data.data.positions);

    for (let data of datas1) {
      const poolContract = new ethers.Contract(data.pool, poolabi);
      const slot0 = await poolContract.slot0();
      const currentSqrtX96 = slot0[0];

      if (data.owner.toLowerCase() == addr_staker) {
        let nft_owner = await staker_contract.deposits(data.id);
        if (dsa_accounts.get(nft_owner.owner.toLowerCase()) == 1) {
          data.owner = nft_owner.owner.toLowerCase();
          response.push(data);
        }
      } else if (dsa_accounts.get(data.owner.toLowerCase()) == 1) {
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

function calculateSqrtPriceX96(tickLower, tickUpper) {
  if (!lowerTick || lowerTick == 0) throw new Error("lowerTick not defined");
  if (!upperTick || upperTick == 0) throw new Error("upperTick not defined");

  const lowerPrice = 1.0001 ** Number(lowerTick);
  const upperPrice = 1.0001 ** Number(upperTick);

  const lowerSqrtPriceX36 = Math.round(Math.sqrt(lowerPrice) * 2 ** 36);
  const upperSqrtPriceX36 = Math.round(Math.sqrt(upperPrice) * 2 ** 36);

  const lowerSqrtPriceX96 = new BigNumber(
    lowerSqrtPriceX36.toString()
  ).multipliedBy(x60);
  const upperSqrtPriceX96 = new BigNumber(
    upperSqrtPriceX36.toString()
  ).multipliedBy(x60);
  return [lowerSqrtPriceX96, upperSqrtPriceX96];
}

async function _getAmounts(
  liquidityContract,
  currentSqrtPriceX96,
  lowerTick,
  upperTick,
  liquidity
) {
  let [lowerSqrtPriceX96, upperSqrtPriceX96] = calculateSqrtPriceX96(
    lowerTick,
    upperTick
  );

  let { amount0, amount1 } = await liquidityContract.getAmountsForLiquidity(
    currentSqrtPriceX96,
    lowerSqrtPriceX96,
    upperSqrtPriceX96,
    liquidity
  );

  const tokenPrices = await axios.get(
    "https://api.instadapp.io/defi/polygon/prices"
  );

  const price0 =
    tokenPrices[
      Object.keys(tokenPrices).find(
        (a) => a.toLowerCase() === token0.toLowerCase()
      )
    ];
  const price1 =
    tokenPrices[
      Object.keys(tokenPrices).find(
        (a) => a.toLowerCase() === token1.toLowerCase()
      )
    ];

  amount0Y = amount0Y
    .multipliedBy(1e18)
    .dividedBy(10 ** decimals0)
    .multipliedBy(price0);
  amount1Y = amount1Y
    .multipliedBy(1e18)
    .dividedBy(10 ** decimals1)
    .multipliedBy(price1);

  const token0USD = amount0
    .multipliedBy(price0)
    .dividedBy(10 ** decimals0)
    .toString();
  const token1USD = amount1
    .multipliedBy(price1)
    .dividedBy(10 ** decimals1)
    .toString();

  const totalAmountInUSD = BigNumber.sum(token0USD, token1USD);
  return [new BigNumber(amount0.toString()), new BigNumber(amount1.toString())];
}

main();
