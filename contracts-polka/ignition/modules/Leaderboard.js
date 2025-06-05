// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules")

const XsollaLeaderboardModule = buildModule("XsollaLeaderboardModule", (m) => {
    //const initialSupply = m.getParameter("initialSupply", 1000000n * 10n ** 18n)

    const token = m.contract("XsollaLeaderboard", [])

    return { token }
})

module.exports = XsollaLeaderboardModule
