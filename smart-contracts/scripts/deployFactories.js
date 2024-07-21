async function main() {
    const [deployer] = await ethers.getSigners();
  
    console.log("Deploying contracts with the account:", deployer.address);
  
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("Account balance:", balance.toString());
  
    // Deploy MetadataLibrary
    const MetadataLibrary = await ethers.getContractFactory("MetadataLibrary");
    const metadataLibrary = await MetadataLibrary.deploy();
    const metadataLibraryReceipt = await metadataLibrary.deploymentTransaction().wait(2);
    // console.log(metadataLibraryReceipt);
    const metadataLibraryAddress = metadataLibraryReceipt.contractAddress;
    console.log("MetadataLibrary deployed to:", metadataLibraryAddress);
  
    // Link MetadataLibrary to LP404Factory and deploy
    const LP404Factory = await ethers.getContractFactory("LP404Factory", {
      libraries: {
        MetadataLibrary: metadataLibraryAddress,
      },
    });
    const lp404Factory = await LP404Factory.deploy();
    const lp404FactoryReceipt = await lp404Factory.deploymentTransaction().wait(2);
    // console.log(metadataLibraryReceipt);
    const lp404FactoryAddress = lp404FactoryReceipt.contractAddress;
    console.log("LP404Factory deployed to:", lp404FactoryAddress);
  
    // Deploy LPNFTFactory
    const LPNFTFactory = await ethers.getContractFactory("KimLPNFTFactory");
    const lpNFTFactory = await LPNFTFactory.deploy(deployer.address, lp404FactoryAddress);
    const lpNFTFactoryReceipt = await lpNFTFactory.deploymentTransaction().wait(2);
    // console.log(metadataLibraryReceipt);
    const lpNFTFactoryAddress = lpNFTFactoryReceipt.contractAddress;
    console.log("LPNFTFactory deployed to:", lpNFTFactoryAddress);

    // Verify contracts on Mode network
    // await hre.run("verify:verify", {
    //   address: metadataLibraryAddress,
    //   contract: "contracts/extensions/lib/OnChainMetadata.sol:MetadataLibrary",
    // });

    // await hre.run("verify:verify", {
    //   address: lp404FactoryAddress,
    //   contract: "contracts/extensions/LP404Factory.sol:LP404Factory",
    //   libraries: {
    //     MetadataLibrary: metadataLibraryAddress,
    //   },
    // });

    // await hre.run("verify:verify", {
    //   address: lpNFTFactoryAddress,
    //   contract: "contracts/LPNFTFactory.sol:KimLPNFTFactory",
    //   constructorArguments: [deployer.address, lp404FactoryAddress],
    // });

  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
  