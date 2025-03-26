/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import {
  Contract,
  ContractFactory,
  ContractTransactionResponse,
  Interface,
} from "ethers";
import type { Signer, ContractDeployTransaction, ContractRunner } from "ethers";
import type { NonPayableOverrides } from "../../common";
import type { MockUSDC, MockUSDCInterface } from "../../contracts/MockUSDC";

const _abi = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "allowance",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "needed",
        type: "uint256",
      },
    ],
    name: "ERC20InsufficientAllowance",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "balance",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "needed",
        type: "uint256",
      },
    ],
    name: "ERC20InsufficientBalance",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "approver",
        type: "address",
      },
    ],
    name: "ERC20InvalidApprover",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "receiver",
        type: "address",
      },
    ],
    name: "ERC20InvalidReceiver",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "sender",
        type: "address",
      },
    ],
    name: "ERC20InvalidSender",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
    ],
    name: "ERC20InvalidSpender",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "OwnableInvalidOwner",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "OwnableUnauthorizedAccount",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "Approval",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "Transfer",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
    ],
    name: "allowance",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "approve",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "balanceOf",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [
      {
        internalType: "uint8",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "mint",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "name",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalSupply",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "transfer",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "transferFrom",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

const _bytecode =
  "0x60806040526006600560146101000a81548160ff021916908360ff16021790555034801561002c57600080fd5b50336040518060400160405280600881526020017f55534420436f696e0000000000000000000000000000000000000000000000008152506040518060400160405280600481526020017f555344430000000000000000000000000000000000000000000000000000000081525081600390816100a99190610459565b5080600490816100b99190610459565b505050600073ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff160361012e5760006040517f1e4fbdf7000000000000000000000000000000000000000000000000000000008152600401610125919061056c565b60405180910390fd5b61013d8161014360201b60201c565b50610587565b6000600560009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16905081600560006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055508173ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e060405160405180910390a35050565b600081519050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b6000600282049050600182168061028a57607f821691505b60208210810361029d5761029c610243565b5b50919050565b60008190508160005260206000209050919050565b60006020601f8301049050919050565b600082821b905092915050565b6000600883026103057fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff826102c8565b61030f86836102c8565b95508019841693508086168417925050509392505050565b6000819050919050565b6000819050919050565b600061035661035161034c84610327565b610331565b610327565b9050919050565b6000819050919050565b6103708361033b565b61038461037c8261035d565b8484546102d5565b825550505050565b600090565b61039961038c565b6103a4818484610367565b505050565b5b818110156103c8576103bd600082610391565b6001810190506103aa565b5050565b601f82111561040d576103de816102a3565b6103e7846102b8565b810160208510156103f6578190505b61040a610402856102b8565b8301826103a9565b50505b505050565b600082821c905092915050565b600061043060001984600802610412565b1980831691505092915050565b6000610449838361041f565b9150826002028217905092915050565b61046282610209565b67ffffffffffffffff81111561047b5761047a610214565b5b6104858254610272565b6104908282856103cc565b600060209050601f8311600181146104c357600084156104b1578287015190505b6104bb858261043d565b865550610523565b601f1984166104d1866102a3565b60005b828110156104f9578489015182556001820191506020850194506020810190506104d4565b868310156105165784890151610512601f89168261041f565b8355505b6001600288020188555050505b505050505050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b60006105568261052b565b9050919050565b6105668161054b565b82525050565b6000602082019050610581600083018461055d565b92915050565b6111a9806105966000396000f3fe608060405234801561001057600080fd5b50600436106100cf5760003560e01c806370a082311161008c57806395d89b411161006657806395d89b4114610202578063a9059cbb14610220578063dd62ed3e14610250578063f2fde38b14610280576100cf565b806370a08231146101aa578063715018a6146101da5780638da5cb5b146101e4576100cf565b806306fdde03146100d4578063095ea7b3146100f257806318160ddd1461012257806323b872dd14610140578063313ce5671461017057806340c10f191461018e575b600080fd5b6100dc61029c565b6040516100e99190610dfd565b60405180910390f35b61010c60048036038101906101079190610eb8565b61032e565b6040516101199190610f13565b60405180910390f35b61012a610351565b6040516101379190610f3d565b60405180910390f35b61015a60048036038101906101559190610f58565b61035b565b6040516101679190610f13565b60405180910390f35b61017861038a565b6040516101859190610fc7565b60405180910390f35b6101a860048036038101906101a39190610eb8565b6103a1565b005b6101c460048036038101906101bf9190610fe2565b6103b7565b6040516101d19190610f3d565b60405180910390f35b6101e26103ff565b005b6101ec610413565b6040516101f9919061101e565b60405180910390f35b61020a61043d565b6040516102179190610dfd565b60405180910390f35b61023a60048036038101906102359190610eb8565b6104cf565b6040516102479190610f13565b60405180910390f35b61026a60048036038101906102659190611039565b6104f2565b6040516102779190610f3d565b60405180910390f35b61029a60048036038101906102959190610fe2565b610579565b005b6060600380546102ab906110a8565b80601f01602080910402602001604051908101604052809291908181526020018280546102d7906110a8565b80156103245780601f106102f957610100808354040283529160200191610324565b820191906000526020600020905b81548152906001019060200180831161030757829003601f168201915b5050505050905090565b6000806103396105ff565b9050610346818585610607565b600191505092915050565b6000600254905090565b6000806103666105ff565b9050610373858285610619565b61037e8585856106ae565b60019150509392505050565b6000600560149054906101000a900460ff16905090565b6103a96107a2565b6103b38282610829565b5050565b60008060008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020549050919050565b6104076107a2565b61041160006108ab565b565b6000600560009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16905090565b60606004805461044c906110a8565b80601f0160208091040260200160405190810160405280929190818152602001828054610478906110a8565b80156104c55780601f1061049a576101008083540402835291602001916104c5565b820191906000526020600020905b8154815290600101906020018083116104a857829003601f168201915b5050505050905090565b6000806104da6105ff565b90506104e78185856106ae565b600191505092915050565b6000600160008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054905092915050565b6105816107a2565b600073ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff16036105f35760006040517f1e4fbdf70000000000000000000000000000000000000000000000000000000081526004016105ea919061101e565b60405180910390fd5b6105fc816108ab565b50565b600033905090565b6106148383836001610971565b505050565b600061062584846104f2565b90507fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff8110156106a85781811015610698578281836040517ffb8f41b200000000000000000000000000000000000000000000000000000000815260040161068f939291906110d9565b60405180910390fd5b6106a784848484036000610971565b5b50505050565b600073ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff16036107205760006040517f96c6fd1e000000000000000000000000000000000000000000000000000000008152600401610717919061101e565b60405180910390fd5b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff16036107925760006040517fec442f05000000000000000000000000000000000000000000000000000000008152600401610789919061101e565b60405180910390fd5b61079d838383610b48565b505050565b6107aa6105ff565b73ffffffffffffffffffffffffffffffffffffffff166107c8610413565b73ffffffffffffffffffffffffffffffffffffffff1614610827576107eb6105ff565b6040517f118cdaa700000000000000000000000000000000000000000000000000000000815260040161081e919061101e565b60405180910390fd5b565b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff160361089b5760006040517fec442f05000000000000000000000000000000000000000000000000000000008152600401610892919061101e565b60405180910390fd5b6108a760008383610b48565b5050565b6000600560009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16905081600560006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055508173ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e060405160405180910390a35050565b600073ffffffffffffffffffffffffffffffffffffffff168473ffffffffffffffffffffffffffffffffffffffff16036109e35760006040517fe602df050000000000000000000000000000000000000000000000000000000081526004016109da919061101e565b60405180910390fd5b600073ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff1603610a555760006040517f94280d62000000000000000000000000000000000000000000000000000000008152600401610a4c919061101e565b60405180910390fd5b81600160008673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055508015610b42578273ffffffffffffffffffffffffffffffffffffffff168473ffffffffffffffffffffffffffffffffffffffff167f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b92584604051610b399190610f3d565b60405180910390a35b50505050565b600073ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff1603610b9a578060026000828254610b8e919061113f565b92505081905550610c6d565b60008060008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002054905081811015610c26578381836040517fe450d38c000000000000000000000000000000000000000000000000000000008152600401610c1d939291906110d9565b60405180910390fd5b8181036000808673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002081905550505b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff1603610cb65780600260008282540392505081905550610d03565b806000808473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600082825401925050819055505b8173ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef83604051610d609190610f3d565b60405180910390a3505050565b600081519050919050565b600082825260208201905092915050565b60005b83811015610da7578082015181840152602081019050610d8c565b60008484015250505050565b6000601f19601f8301169050919050565b6000610dcf82610d6d565b610dd98185610d78565b9350610de9818560208601610d89565b610df281610db3565b840191505092915050565b60006020820190508181036000830152610e178184610dc4565b905092915050565b600080fd5b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b6000610e4f82610e24565b9050919050565b610e5f81610e44565b8114610e6a57600080fd5b50565b600081359050610e7c81610e56565b92915050565b6000819050919050565b610e9581610e82565b8114610ea057600080fd5b50565b600081359050610eb281610e8c565b92915050565b60008060408385031215610ecf57610ece610e1f565b5b6000610edd85828601610e6d565b9250506020610eee85828601610ea3565b9150509250929050565b60008115159050919050565b610f0d81610ef8565b82525050565b6000602082019050610f286000830184610f04565b92915050565b610f3781610e82565b82525050565b6000602082019050610f526000830184610f2e565b92915050565b600080600060608486031215610f7157610f70610e1f565b5b6000610f7f86828701610e6d565b9350506020610f9086828701610e6d565b9250506040610fa186828701610ea3565b9150509250925092565b600060ff82169050919050565b610fc181610fab565b82525050565b6000602082019050610fdc6000830184610fb8565b92915050565b600060208284031215610ff857610ff7610e1f565b5b600061100684828501610e6d565b91505092915050565b61101881610e44565b82525050565b6000602082019050611033600083018461100f565b92915050565b600080604083850312156110505761104f610e1f565b5b600061105e85828601610e6d565b925050602061106f85828601610e6d565b9150509250929050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b600060028204905060018216806110c057607f821691505b6020821081036110d3576110d2611079565b5b50919050565b60006060820190506110ee600083018661100f565b6110fb6020830185610f2e565b6111086040830184610f2e565b949350505050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b600061114a82610e82565b915061115583610e82565b925082820190508082111561116d5761116c611110565b5b9291505056fea264697066735822122080e02effeeb866a2be43c92bdd2a23bcdb3269cfca460f9ff0b3dd13a001947b64736f6c634300081c0033";

type MockUSDCConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: MockUSDCConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class MockUSDC__factory extends ContractFactory {
  constructor(...args: MockUSDCConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override getDeployTransaction(
    overrides?: NonPayableOverrides & { from?: string }
  ): Promise<ContractDeployTransaction> {
    return super.getDeployTransaction(overrides || {});
  }
  override deploy(overrides?: NonPayableOverrides & { from?: string }) {
    return super.deploy(overrides || {}) as Promise<
      MockUSDC & {
        deploymentTransaction(): ContractTransactionResponse;
      }
    >;
  }
  override connect(runner: ContractRunner | null): MockUSDC__factory {
    return super.connect(runner) as MockUSDC__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): MockUSDCInterface {
    return new Interface(_abi) as MockUSDCInterface;
  }
  static connect(address: string, runner?: ContractRunner | null): MockUSDC {
    return new Contract(address, _abi, runner) as unknown as MockUSDC;
  }
}
