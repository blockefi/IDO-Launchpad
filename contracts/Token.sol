// SPDX-License-Identifier: UNLICENSED



pragma solidity ^0.8.1;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/proxy/utils/Initializable.sol";


//a mock contract
contract Token is ERC20, Ownable, Initializable {
    uint8 decimalsToken;

    constructor(string memory name_, string memory symbol_)
        ERC20(name_, symbol_)
    {
        decimalsToken = 18;
    }  
    
    function mint(address account, uint256 amount) external onlyOwner {
        _mint(account, amount);
    }

    function changeDecimals(uint8 _decimals) external {
        decimalsToken = _decimals;
    }

    function decimals() public view virtual override returns (uint8) {
        return decimalsToken;
    }
}
