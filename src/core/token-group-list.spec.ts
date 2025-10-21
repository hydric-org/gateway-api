import { tokenGroupList } from './token-group-list';
import { tokenList } from './token-list';

describe('TokenGroupList', () => {
  it('should return the correct token group list', () => {
    const expectedList = [
      {
        id: 'group-1',
        name: 'USD Stablecoins',
        tokens: tokenList.filter((token) =>
          new Set([
            '3', // USDT
            '4', // USDC
            '7', // DAI
            '25', // USDS
            '26', // USDe
            '27', // USDD
            '28', // TUSD
            '29', // frxUSD
            '30', // LUSD
            '31', // DOLA
            '32', // USDP
            '33', // FDUSD
            '34', // PYUSD
            '35', // USDY
            '36', // GHO
            '37', // AUSD
            '68', // RLUSD
            '76', // rUSDC
            '77', // USDHL
            '78', // hbUSDT
            '79', // feUSD
            '80', // thBILL
            '85', // USDbC
            '88', // msUSD
            '90', // USD+
            '91', // USD₮0
            '20', // USD1
            '94', // mUSD
            '95', // USDH
            '100', // USDai
            '110', // USDtb
            '111', // USDf
            '112', // USDG
            '113', // USD0
            '114', // USR
            '115', // satUSD
            '116', // XUSD
            '117', // reUSD
            '118', // USDA
          ]).has(token.id!),
        ),
      },
      {
        id: 'group-2',
        name: 'BTC Pegged Tokens',
        tokens: tokenList.filter((token) =>
          new Set([
            '5', // WBTC
            '8', // TBTC
            '38', // FBTC
            '6', // cbBTC
            '19', // BTCB
            '9', // LBTC
            '21', // SolvBTC
            '39', // uniBTC
            '40', // BBTC
            '41', // kBTC
            '42', // EBTC
            '43', // teleBTC
            '44', // 21BTC
            '72', // UBTC
            '83', // hbBTC
            '119', // Unichain Bridged WBTC
          ]).has(token.id!),
        ),
      },
      {
        id: 'group-3',
        name: 'ETH Pegged Tokens',
        tokens: tokenList.filter((token) =>
          new Set([
            '1', // ETH
            '2', // WETH
            '45', // wstETH
            '46', // WBETH
            '47', // weETH
            '48', // rETH
            '49', // rsETH
            '50', // wrsETH
            '51', // mETH
            '52', // lsETH
            '53', // ezETH
            '54', // osETH
            '55', // ETHx
            '56', // cbETH
            '57', // sfrxETH
            '58', // frxETH
            '59', // pufETH
            '60', // xPufETH
            '61', // rswETH
            '62', // swETH
            '63', // woETH
            '64', // oETH
            '65', // superOETH
            '66', // pzETH
            '67', // ankrETH
            '73', // UETH
          ]).has(token.id!),
        ),
      },
      {
        id: 'group-4',
        name: 'HYPE Pegged Tokens',
        tokens: tokenList.filter((token) =>
          new Set([
            '69', // HYPE
            '70', // stHYPE
            '71', // wstHYPE
            '74', // kHYPE
            '75', // LHYPE
            '103', // Wormhole Bridged HYPE
            '104', // beHYPE
            '105', // vkHYPE
            '106', // sHYPE
            '107', // mHYPE
            '108', // liquidHYPE
            '109', // hbHYPE
          ]).has(token.id!),
        ),
      },
    ];

    expect(tokenGroupList).toEqual(expectedList);
  });

  it('should not have repeated group ids', () => {
    const groupIds = tokenGroupList.map((group) => group.id);

    expect(groupIds.length).toEqual(new Set(groupIds).size);
  });

  it('should not have repeated tokens in the same group', () => {
    tokenGroupList.forEach((group) => {
      const tokens = group.tokens.map((token) => token.id);

      expect(tokens.length).toEqual(new Set(tokens).size);
    });
  });
});
