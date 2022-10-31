import {ethers, hardhatArguments} from 'hardhat';
import * as Config from './config';

async function main() {
    await Config.initConfig();
    const network =hardhatArguments.network ? hardhatArguments.network : 'dev';
    const [deployer] = await ethers.getSigners();
    console.log('deploy from address: ', deployer.address);

    const Beat = await ethers.getContractFactory("Beat");
    const beat = await Beat.deploy();
    console.log('Beat address: ', beat.address);
    Config.setConfig(network + '.Beat', beat.address);

    await Config.updateConfig();
}

main().then(() => process.exit(0))
    .catch(err => {
        console.error(err);
        process.exit(1);
});