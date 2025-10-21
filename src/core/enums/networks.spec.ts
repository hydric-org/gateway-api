import { Networks, NetworksUtils } from './networks';

describe('NetworksEnumTest', () => {
  it('should return false if the passed chainId is not a valid mapped network', () => {
    expect(NetworksUtils.isValidChainId(907987)).toBe(false);
  });

  it('should return true if the passed chainId is not valid & mapped network', () => {
    expect(NetworksUtils.isValidChainId(11155111)).toBe(true);
  });

  it("should return true if the passed chainId is in the enum's values", () => {
    expect(NetworksUtils.isValidChainId(11155111)).toBe(true);
    expect(NetworksUtils.isValidChainId(534352)).toBe(true);
    expect(NetworksUtils.isValidChainId(1)).toBe(true);
    expect(NetworksUtils.isValidChainId(130)).toBe(true);
    expect(NetworksUtils.isValidChainId(999)).toBe(true);
    expect(NetworksUtils.isValidChainId(8453)).toBe(true);
    expect(NetworksUtils.isValidChainId(9745)).toBe(true);

    // expect(NetworksUtils.isValidChainId(56)).toBe(true);
  });

  it("should return the network if the passed chainId is in the enum's values", () => {
    expect(NetworksUtils.networkFromChainId(11155111)).toBe(Networks.SEPOLIA);
    expect(NetworksUtils.networkFromChainId(534352)).toBe(Networks.SCROLL);
    expect(NetworksUtils.networkFromChainId(1)).toBe(Networks.ETHEREUM);
    expect(NetworksUtils.networkFromChainId(130)).toBe(Networks.UNICHAIN);
    expect(NetworksUtils.networkFromChainId(999)).toBe(Networks.HYPER_EVM);
    expect(NetworksUtils.networkFromChainId(8453)).toBe(Networks.BASE);
    expect(NetworksUtils.networkFromChainId(9745)).toBe(Networks.PLASMA);
    // expect(NetworksUtils.networkFromChainId(56)).toBe(Networks.BNB);
  });

  it("should throw when calling 'networkFromChainId' with a non mapped chainId", () => {
    expect(() => NetworksUtils.networkFromChainId(18257612678190)).toThrow();
  });

  it('should return false if the passed chainId is not in the enum', () => {
    expect(NetworksUtils.isValidChainId(82791865)).toBe(false);
  });

  it('should return if the network is a testnet', () => {
    expect(NetworksUtils.isTestnet(Networks.ETHEREUM)).toBe(false);
    expect(NetworksUtils.isTestnet(Networks.SEPOLIA)).toBe(true);
    expect(NetworksUtils.isTestnet(Networks.SCROLL)).toBe(false);
    expect(NetworksUtils.isTestnet(Networks.BASE)).toBe(false);
    expect(NetworksUtils.isTestnet(Networks.HYPER_EVM)).toBe(false);
    expect(NetworksUtils.isTestnet(Networks.UNICHAIN)).toBe(false);
    expect(NetworksUtils.isTestnet(Networks.PLASMA)).toBe(false);
    // expect(NetworksUtils.isTestnet(Networks.BNB)).toBe(false);
  });

  it('should return the correct address for the wrapped native token', () => {
    expect(NetworksUtils.wrappedNativeAddress(Networks.ETHEREUM)).toBe('0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2');
    expect(NetworksUtils.wrappedNativeAddress(Networks.SEPOLIA)).toBe('0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14');
    expect(NetworksUtils.wrappedNativeAddress(Networks.SCROLL)).toBe('0x5300000000000000000000000000000000000004');
    expect(NetworksUtils.wrappedNativeAddress(Networks.BASE)).toBe('0x4200000000000000000000000000000000000006');
    expect(NetworksUtils.wrappedNativeAddress(Networks.HYPER_EVM)).toBe('0x5555555555555555555555555555555555555555');
    expect(NetworksUtils.wrappedNativeAddress(Networks.UNICHAIN)).toBe('0x4200000000000000000000000000000000000006');
    expect(NetworksUtils.wrappedNativeAddress(Networks.PLASMA)).toBe('0x6100e367285b01f48d07953803a2d8dca5d19873');
    // expect(NetworksUtils.wrappedNativeAddress(Networks.BNB)).toBe(
    //   '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
    // );
  });
});
