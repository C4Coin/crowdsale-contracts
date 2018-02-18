## other notes.

### Terms

  - Price per share approx. `$54`
  - Nature of securities `Equity`
  - Closing Date `May 30 (Ideally)`
  - Amount of securities offered `Approx 55,000`

### Implied Terms
  - Statement as to the number of days left in the campaign `probably 30 but TBD`
  - Offering goal `$2.5M`

### Non-terms

* didn't come across as super relevant right now. Closing soon can appear on May 23 perhaps, one week before close.

### Releasing of funds and delayed founder liquidity-

  - both of these concerns are alleviated by the corporate structure.

      1. Invested funds must be used for intended purposes or shareholders can sue us, thereby alleviating the risk of immediately releasing funds.
      2. We have delayed liquidity in the sense that the company won't own a `premine`, so if we don't continue to perform valuable work for the network, people won't agree to pay our fee on block rewards and fork.

  - Authorized, but unissued shares can be held in an address owned by the company.
  - We do have to differentiate between never issued and repurchased tokens (treasury shares), however.

      Perhaps just another multisig wallet.

  - Price per share is denominated in USD.
  - CO2KN, INC will announce its own exchange rate at some point close to the auction.
  - So, no need for an oracle. This is optimal because the IRS sees each transaction of ETH as a sale. So it's not viewed as one transaction of ETH for Equity, it's seen as USD for equity and then cash for ETH.
  - Nature of securities takes the following values: `equity`, `debt`, `convertible`, etc.
  - 'Closing soon' can probably be posted a week before close.

## also need to record

* Name of the shareholder;
* Complete mailing address of the stock shareholder including contact number;
* Stock certificate number;
* The total number of shares outstanding;
* The date the shares were purchased;
* How much the person paid per share (consideration/monetary value);
* The class of shares;
* Why the shares were transferred.

### implementation

* The `shareholder name`, their `mailing address`, and `contact number` MUST all be stored in an off-chain database and the content hashed, and the `hash` associated with the address.
* The total number of shares outstanding is the difference between a cap and `token.totalSupply()` and is rightly a function of the `CrowdsaleContract`.
* The date the share was purchased is a property of the block the purchase was processed in so there is no need to store it in the token. However the user database might wish to record that information as well for convenience.
* The price the user paid is a function of the ETH price per Token (which can change during the crowdsale) and ETH price at that point (which can also be set in the `CrowdsaleContract`) and the number of ETH spent, which the `CrowdsaleContract` also knows and which is returned in the transaction receipt.
* With regard to the certificate number, the token should record the certificate numbers, either algorithmically if possible, or else it will need to be generated offchain and imported in bulk when the certificates themselves are issued.
* A certificate might represent more than one share, in which case it will need to record a range of inputs in the form of an encoded bytes array.
* as shares are traded a script needs to pull Transfer events from the global blockchain and keep the off-chain records up to date, either in real-time, or in an ad-hoc way.  This should be the job of the Crowdsale Admin website.

### Questions and Scenarios.

1. When someone buys a Token does that mean they have bought a specific Stock with a specific certificate number, or does it mean they've bought the right to be issued a stock certificate?

    scenario: Token Buys Share immediately.
    scenario: Token Buys rights to a share, when the crowdsale is finished.

2. If I buy 100 Tokens would that result in the issuance of 100 certificates, or one certificate with 100 shares on it.

    scenario: One token = one certificate = one share.
    scenario: One token = one certificate has many shares.

3. Certificates will take their numbers from what's in the blockchain or else will use numbers generated externally.

    scenario: Certificate numbers come from the blockchain.
    scenatio: Certificate numbers are generated externally.

a) `Token Buys Share immediately` && `One token = one certificate = one share` && `Certificate numbers come from the blockchain`

* Lift most of `ERC721` but override the `transfer`, `transferFrom` and `mint` functions so they retain the `value` params from `ERC20`, and under the hood behave like ERC721 tokens instead, to a `transfer(0x..., 10)` would transfer 10 Tokens.  This should be enough to retain compatability with ERC20.
* A person's address sends ETH to the `CrowdsaleContract` and a `Token` is minted for them.
* Each `Token` needs to be issued one at a time by the Crowdsale visa the `mint` function.
* When a `Token` is minted for an address, the `tokenId`, ie a sequential issuance number starting from some `issuanceOffset`, is associated with that address. Then we can say, some time in the future, that address `0xnnnnn` owns Tokens `1`, `5`, and `33` (lets say)
* The `tokenIds` are used as the certificate numbers for the associated share certificates.
* It is the `CrowdsaleContract`'s job to create the `tokenId`, representing the certificate number associated with it and pass that information into each `Token` when it is `mint`ed. It's the job of the script requesting the minting process to listen for the appropriate `Minted` event coming from the CrowdsaleContract carrying back that same `tokenId` for checking purposes, then recording the transaction receipt with the users' other data in the offchain-database.
* There is an external script that requested the minting be done for some address, and awaits the tokenIds from the `Minted` event, which it records against the user in a list of owned certificate numbers.

b) `Token Buys Share immediately` && `One token = one certificate = one share` && `Certificate numbers are generated externally`

Same as (a) but with the following exceptions.

* The `tokenIds` are the certificate numbers of the associated share certificates.
* It is the script calling the `CrowdsaleContract`'s job to create the `tokenId`, based upon the certificate number associated with it and pass that information into The `CrowdsaleContract` with the owner address, and subsequently on to each `Token` when it is `mint`ed. It's a good idea to make the script requesting the minting process to listen for the appropriate `Minted` event coming from the CrowdsaleContract carrying back that same `tokenId` for checking purposes, then recording the fact it's been added to the blockchain with the users' other data in the offchain-database.
* There is an external script that requested the minting be done for some address, and awaits the tokenIds from the `Minted` event, which it records against the user in a list of owned certificate numbers.

c) `Token Buys Share immediately` && `One token = one certificate has many shares` && `Certificate numbers come from the blockchain`

Same as (a) but with the following exceptions.

* extend (a) with a base mapping of `shareNumbers` to `tokenIds`, and mapping of `tokenIds` to an array of `shareNumbers`.
* When a `Token` is minted for an address, the `tokenId` is provided by the CrowdsaleContract but the share number range needs to be provided as an encoded bytes array looking like `[1,2,53, 1000..5000, 6750]`. The CrowdsaleContract needs to turn this into individual `shareIds`.
* The `tokenIds` are used as the certificate numbers for the associated share certificates which include share ranges.
* It is the `CrowdsaleContract`'s job to create the `tokenId`, representing the certificate number associated with it and pass that information into each `Token` when it is `mint`ed. It's the job of the script requesting the minting process to provide the share ranges and listen for the appropriate `Minted` event coming from the CrowdsaleContract carrying back that same `tokenId` for checking purposes, then recording the transaction receipt with the users' other data in the offchain-database.
* Each `Token` maps to a certificate with a number, that in turn describes a share range. The Tokens need to be issued one at a time by the Crowdsale visa the `mint` function.
* There is an external script that requested the minting be done for some address, and awaits the tokenIds from the `Minted` event, which it records against the user in a list of owned certificate numbers.
* In this case the owner could sell individual shares somehow, say offchain, and the range would need to be updated from offchain, in which case the Token would need a `transferShare(uint shareId) public onlyShareholder` function and an `onlyShareholder` modifier.

d) `Token Buys Share immediately` && `One token = one certificate has many shares` && `Certificate numbers are generated externally`

Same as (c) but the external script injects both the share range and handle the certificate numbers like in (b)

e) `Token Buys rights to a share, when the crowdsale is finished.` && `One token = one certificate = one share` && `Certificate numbers come from the blockchain`

You'd do this if you want to ensure a minimum cap is reached before issuing stock.

* same as (a) but don't actually do the `Transfers` in the `mint` function until the `finalise()` function is called.

f) `Token Buys rights to a share, when the crowdsale is finished.` && `One token = one certificate = one share` && `Certificate numbers are generated externally`

* same as (b) but don't actually do the `Transfers` in the `mint` function until the `finalise()` function is called.

g) `Token Buys rights to a share, when the crowdsale is finished.` && `One token = one certificate has many shares` && `Certificate numbers come from the blockchain`

* same as (c) but don't actually do the `Transfers` in the `mint` function until the `finalise()` function is called.

h) `Token Buys rights to a share, when the crowdsale is finished.` && `One token = one certificate has many shares` && `Certificate numbers are generated externally`

* same as (d) but don't actually do the `Transfers` in the `mint` function until the `finalise()` function is called.
