# crowdsale-contracts

Smart contracts for C4Coin's forthcoming crowdsale

* `develop` — [![CircleCI](https://circleci.com/gh/C4Coin/crowdsale-contracts/tree/develop.svg?style=svg)](https://circleci.com/gh/C4Coin/crowdsale-contracts/tree/develop)
* `master` — [![CircleCI](https://circleci.com/gh/C4Coin/crowdsale-contracts/tree/master.svg?style=svg)](https://circleci.com/gh/C4Coin/crowdsale-contracts/tree/master)

## Overview

It is proposed that C4Coin will launch a [Regulation A+](https://en.wikipedia.org/wiki/Regulation_A#Regulation_A+) crowdsale, granting buyers of its tokens stock in the company.

Such a crowd sale must allow for the creation and maintenance of corporate records, and as such has the following high-level requirements.

1. It must function as a `Corporations Stock ledger`.

    - definition: one or more records administered by or on behalf of the corporation in which the names of all of the corporation’s stockholders of record,  the address, the number of shares registered in the name of each such stockholder, and all issuances and transfers of stock of the corporation are recorded
    - The stock ledger shall be the only evidence as to who are the stockholders entitled by this section to examine the list required by this section or to vote in person or by proxy at any meeting of stockholders.

2. As such it must offer the following 3 functions of a `Corporations Stock ledger` (Ref: Section 224)

    1. Reporting

        It must enable the corporation to prepare the list of stockholders specified in Sections 219 and 220

    2. It must record the information specified in Sections 156, 159, 217(a) and 218

        - Partly paid shares
        - Total amount paid
        - Total amount to be paid

    3. Section 159, it must record transfers of stock as governed by Article 8 of subtitle I of Title 6.

        Sections 151, 202 and 364 are also amended to clarify that the notices given to holders of uncertificated shares pursuant to those sections may be given by electronic transmission

*note* A lot of this is undecipherable gibberish but what I can extract from here is the Token contract needs

* an array of addresses of Token owners (in addition to the mapping of addresses to balances that is a standard token contract feature)
* a mapping of addresses to hash of a JSON blob representing the address owner's verified name and address. (aka their `Identity`) Addresses not in this mapping can not have tokens transferred to them.

        {
          "name": "the stockholder's real name",
          "address": "the stockholder's residential address"
        }

    The unencrypted `Identity` must be stored in a secure company database that uses the hash as a primary key.

* The number of shares will match the number of tokens bought — one Token per share
* The records of issuances and transfers is something that's inherent to the blockchain itself.
* The contract also needs to include a pair of functions along the lines of

        function shareholderCount() external view returns (uint);
        function shareholder(uint index) external view returns (address);

    This allows the company to extract a list of all shareholders.

* There will be no 'Partly paid shares' as each Token must be paid for in full.
* Transfers of stock will be recorded as transfers of Tokens.
* When a token is transferred it can only be transferred to someone else whose address is mapped to an `Identity` record. (need to override `transfer` and `transferFrom`)

Some of this is covered by [`zeppelin-solidity/contracts/token/ERC721/ERC721Token.sol`](https://github.com/OpenZeppelin/zeppelin-solidity) but I expect a new standard could also be proposed to cover this specific scenario.

See also [ERC721 — Non-Fungable Token Standard](https://github.com/ethereum/eips/issues/721)

### Links

* https://en.wikipedia.org/wiki/Regulation_A#Regulation_A+
* https://www.nyse.com/regulation-a
* https://www.sec.gov/files/Knyazeva_RegulationA%20.pdf
* https://www.sec.gov/info/smallbus/secg/regulation-a-amendments-secg.shtml

## Development

The smart contracts are being implemented in Solidity `0.4.19`.

### Development Prerequisites

* [NodeJS](htps://nodejs.org), version 9.5+ (I use [`nvm`](https://github.com/creationix/nvm) to manage Node versions — `brew install nvm`.)
* [truffle](http://truffleframework.com/), which is a comprehensive framework for Ethereum development. `npm install -g truffle` — this should install Truffle v4.0.6 or better.  Check that with `truffle version`.
* [Access to the C4Coin Jira](https://c4coin.atlassian.net)

### Initialisation

    npm install

### Testing

#### Standalone

    npm test

or with code coverage

    npm run test:cov

#### From within Truffle

Run the `truffle` development environment

    truffle develop

then from the prompt you can run

    compile
    migrate
    test

as well as other Truffle commands. See [truffleframework.com](http://truffleframework.com) for more.

### Linting

We provide the following linting options

* `npm run lint:sol` — to lint the Solidity files, and
* `npm run lint:js` — to lint the Javascript.

## Contributing

Please see the [contributing notes](CONTRIBUTING.md).
