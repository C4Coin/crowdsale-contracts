# crowdsale-contracts

[![Greenkeeper badge](https://badges.greenkeeper.io/C4Coin/crowdsale-contracts.svg)](https://greenkeeper.io/)

Smart contracts for C4Coin's forthcoming crowdsale

* `develop` — [![CircleCI](https://circleci.com/gh/C4Coin/crowdsale-contracts/tree/develop.svg?style=svg)](https://circleci.com/gh/C4Coin/crowdsale-contracts/tree/develop) [![codecov](https://codecov.io/gh/C4Coin/crowdsale-contracts/branch/develop/graph/badge.svg)](https://codecov.io/gh/C4Coin/crowdsale-contracts)
* `master` — [![CircleCI](https://circleci.com/gh/C4Coin/crowdsale-contracts/tree/master.svg?style=svg)](https://circleci.com/gh/C4Coin/crowdsale-contracts/tree/master) [![codecov](https://codecov.io/gh/C4Coin/crowdsale-contracts/branch/master/graph/badge.svg)](https://codecov.io/gh/C4Coin/crowdsale-contracts)

## Overview

It is proposed that C4Coin will launch an ERC20 Token compatible with Delaware General Corporation law, where each issued token corresponds to a unit of stock in the company.

### Covering Legislation

Ref: [Delaware State Senate, 149th General Assembly, Senate Bill No. 69: An act to Amend Title 8 of the Delaware Code Relating to the General Corporation Law.](https://legis.delaware.gov/json/BillDetail/GenerateHtmlDocument?legislationId=25730&legislationTypeId=1&docTypeId=2&legislationName=SB69)

> Section 1.  Sections 1, 2, 5, 6, 7, 11 and 36 of this Act amend Sections 151(f), 202(a), 219(a), 219(c), 224, 232(c) and 364 of Title 8, respectively.  *Amendments to Sections 219, 224 and 232 and related provisions are intended to provide specific statutory authority for Delaware corporations to use networks of electronic databases (examples of which are described currently as “distributed ledgers” or a “blockchain”) for the creation and maintenance of corporate records, including the corporation’s stock ledger.* Section 219(c), as amended, now includes a definition of “stock ledger.” Section 224, as amended, requires that the stock ledger serve three functions contemplated by the Delaware General Corporation Law: it must enable the corporation to prepare the list of stockholders specified in Sections 219 and 220; it must record the information specified in Sections 156, 159, 217(a) and 218; and, as required by Section 159, it must record transfers of stock as governed by Article 8 of subtitle I of Title 6. Sections 151, 202 and 364 are also amended to clarify that the notices given to holders of uncertificated shares pursuant to those sections may be given by electronic transmission.

_Emphasis added_

### Requirements

The token will allow for the creation and maintenance of corporate records, and as such has the following high-level requirements.

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
* https://legis.delaware.gov/json/BillDetail/GenerateHtmlDocument?legislationId=25730&legislationTypeId=1&docTypeId=2&legislationName=SB69

## Crowdsale Details

### Terms required by the SEC

1. Terms (As defined by the SEC):

    - Price per share

        Priced in USD denominated cents with a fixed ETH to USD conversion rate determined by the company at the start of the crowdsale, and which can be updated at any time by the company.

    - Nature of securities

        Equity

    - Closing date

        See Crowdsale Parameters below.

    - Amount of securities offered

        See Crowdsale Parameters below.

2. Implied Terms

    - Statement as to the number of days left in the campaign

        To be displayed on the Crowdsale web page, calculated based on current date vs crowdsale end date.

    - Offering goal in dollars

        To be displayed on the Crowdsale web page, calculated based on crowdsale cap and conversion rate.

3. Non-Terms
    - Minimum investment

        Both to be displayed on the Crowdsale web page, as defined in the crowdsale contract in terms of minimum number of Tokens purchasable.

    - Date when minimum is reached

        To be displayed on the Crowdsale web page, based on data from the Crowdsale contract.

    - Number of investors

        To be displayed on the Crowdsale web page, based on data from the Token contract.

    - Amount raised

        To be displayed on the Crowdsale web page, based on data from the Token and Crowdsale contracts.
        The Token contract will know the number of tokens issued `totalSupply()` and the crowdsale will know the USD to ETH conversion price.  When a Token is minted an event must be emitted that records the USD to ETH conversion price at the time of minting.

    - The words “Closing Soon”

        Will be displayed on the crowdsale website 7 days prior to closing.

### Crowdsale

* Everything will be a constant for the duration of the sale.
* There will not be any phases, discount structures for early / pre-commitments etc.
* The token's name is `CO2KN, INC Shares (indivisible)`
* The token's symbol is `CTKN`
* Crowdsale period

    * start date `2018-05-01`
    * end date `2018-05-30`

  * No maximum individual cap
  * Minimum participation is 1 token.

* Overall cap to be set on deployment of the crowdsale contract (cap both tokens, i.e. shares to be available via Tier 1 Regulation A+ fundraise, and also a fundraise cap set in USD cents.)
* Fundraising goal to be set on deployment of the crowdsale contract in USD cents.
* The conversion rate between ETH and tokens (set when the contract is deployed but able to be changed by the company.)

#### To be completed.

* Maximum number of participants. (see [DEV-145](https://c4coin.atlassian.net/browse/DEV-145))
* ERC884 token implementation (see [DEV-142](https://c4coin.atlassian.net/browse/DEV-142))
* Currently the crowdsale's admin functions can only be invoked by the contract owner.  It may be beneficial to allow a range of whitelisted admins to invoke those functions.  (Discussion in [DEV-146](https://c4coin.atlassian.net/browse/DEV-146))

## Development

The smart contracts are being implemented in Solidity `0.4.19`.

### Development Prerequisites

* [NodeJS](htps://nodejs.org), version 9.6.1 or better (I use [`nvm`](https://github.com/creationix/nvm) to manage Node versions — `brew install nvm`.)
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
