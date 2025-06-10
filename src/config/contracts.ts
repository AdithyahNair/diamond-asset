export const CONTRACT_ADDRESSES = {
  mainnet: "0xb069a4df5c599c0ba4c155a16e10fd3ba843176f",
  sepolia: "0x2d6B119cBcaB787cE7a4D3e3b2670Be540685855",
};

export const getContractAddress = (networkId: string | number) => {
  switch (networkId) {
    case 1:
    case "1":
    case "mainnet":
      return CONTRACT_ADDRESSES.mainnet;
    case 11155111:
    case "11155111":
    case "sepolia":
      return CONTRACT_ADDRESSES.sepolia;
    default:
      throw new Error(`Unsupported network ID: ${networkId}`);
  }
};
