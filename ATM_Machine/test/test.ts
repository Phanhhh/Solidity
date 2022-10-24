import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract } from '@ethersproject/contracts';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import * as chai from 'chai';
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
import { keccak256 } from 'ethers/lib/utils';
import { describe, it } from "node:test";

//// Helper function to avoid parse unit in Ethers
function parseEther(amount: Number) {
    return ethers.utils.parseUnits(amount.toString(), 18);
}

describe("Vault", function () {
    let owner: SignerWithAddress,
        alice: SignerWithAddress,
        bob: SignerWithAddress,
        carol: SignerWithAddress;

    let vault: Contract;
    let token: Contract;

    beforeEach(async () => {
        await ethers.provider.send("hardhat_reset", []);

        // Get address of each onwer account
        [owner, alice, bob, carol] = await ethers.getSigners();

        // deploy Vault contract with Account Owner
        const Vault = await ethers.getContractFactory("Vault", owner);
        vault = await Vault.deploy();
        
        //Deploy Token Beat with Account Owner
        const Token = await ethers.getContractFactory("Beat", owner);
        token = await Token.deploy();

        // Call function setToken to set Token for Vault contract
        await vault.setToken(token.address);
    });

    ////********* HAPPY PATH  *****////////
    ///Check deposit into the Vault
    it("Should deposit into the Vault", async () => {
        // Transfer token from the Vault contract to Alice address
        await token.transfer(alice.address, parseEther(1 * 10**6));
        
        // Token approve: User Alice allow for the Vault contract could use balance of Alice's token.
        await token.connect(alice).approve(vault.address,token.balanceOf(alice.address));

        // The Vault contract deposit token of Alice to the Vault
        await vault.connect(alice).deposit(parseEther(500 * 10**2));

        // Check Vault have balance as balance deposit by Alice
        expect(await token.balanceOf(vault.address)).equal(parseEther(500 * 10**3));
    });

    /// Check Withdraw from the Vault
    it("Should withdraw from the Vault", async () => {
        // Grant withdraw role ti Bob
        let WITHDRAWER_ROLE = keccak256(Buffer.from("WITHDRAWER_ROLE")).toString();
        await vault.grantRole(WITHDRAWER_ROLE, bob.address);
        
        // Set Vault function: Set withdraw enable and maximum withdraw amount
        await vault.setWithdrawEnable(true);
        await vault.setMaxWithdrawAmount(parseEther(1 * 10**6));

        // Alice deposit into the Vault
        await token.transfer(alice.address, parseEther(1 * 10**6));
        await token.connect(alice).approve(vault.address,token.balanceOf(alice.address));
        await vault.connect(alice).deposit(parseEther(500 * 10**3));

        // Bob withdraw into Alice address
        await token.connect(bob).withdraw(parseEther(300 * 10**3), alice.address);

        expect(await token.balanceOf(vault.address)).equal(parseEther(200 * 10**3));
        expect(await token.balanceOf(alice.address)).equal(parseEther(800 * 10**3));
    });

    //// UNHAPPY PATH
    
})