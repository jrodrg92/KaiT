import { ethers } from "hardhat"

async function main() {
    console.log("Deploying AgentVault...")

    const [deployer, signer] = await ethers.getSigners()

    console.log("Owner / deployer:", deployer.address)
    console.log("AgentRail signer:", signer.address)

    const AgentVault = await ethers.getContractFactory("AgentVault")

    const vault = await AgentVault.deploy(
        deployer.address,
        signer.address
    )

    await vault.waitForDeployment()

    const vaultAddress = await vault.getAddress()

    console.log("AgentVault deployed to:")
    console.log(vaultAddress)
}

main().catch((error) => {
    console.error(error)
    process.exitCode = 1
})