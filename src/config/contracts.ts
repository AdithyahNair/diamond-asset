export const CONTRACT_ADDRESSES = {
  mainnet: "0x41a5D2AF36A98cC2b29b7a950025aE18A44548D8",
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
