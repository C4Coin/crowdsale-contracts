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

* Name of the shareholder
* Complete mailing address of the stock shareholder including contact number
* Stock certificate number (aka share number)
* The total number of shares outstanding
* The date the shares were purchased
* How much the person paid per share (consideration/monetary value)
* The class of shares
* Why the shares were transferred

### implementation

* One token = one share
* The `shareholder name`, their `mailing address`, and `contact number` MUST all be stored in an off-chain database and the content hashed, and the `hash` associated with the address.
* The total number of shares outstanding is the difference between a cap and `token.totalSupply()` and is rightly a function of the `CrowdsaleContract`.
* The date the share was purchased is a property of the block the purchase was processed in so there is no need to store it in the token. However the user database might wish to record that information as well for convenience.
* The price the user paid is a function of the ETH price per Token (which can change during the crowdsale) and ETH price at that point (which can also be set in the `CrowdsaleContract`) and the number of ETH spent, which the `CrowdsaleContract` also knows and which is returned in the transaction receipt.
* Tokens can only be minted in whole numbers so `floor` the conversion and put the remainder, less some gas, into a `RefundVault`.
* Move the ETH to be turned into Tokens into the Crowdsale's `wallet`.
* Move the remainder into a `RefundVault` called `refundWallet`.
* People with refunds can claim their refunds through the Crowdsale Website.
* The class of shares will be a fixed `bytes32` constant defined when the Token contract is deployed. It needs to be a parameter of the Token's constructor.
* Why the shares were transferred is going to either be 'minting' or 'purchase'.  The Token can emit either a `Minted` or `Purchased` event in addition to the usual `Transfer` events defined by the `ERC20` standard.
* With regard to the share number, the Token contract will maintain a `mapping(address => uint[]) private shareNumbers`. When minting first happens the shareNumbers array for that address will be populated based on `totalSupply + n` for each `n` from `0` to the number of tokens minted - 1.
* as tokens are exchanged between users, the `shareNumbers` are removed from the top of the array belonging to the `from` address and added to the top of the array of the `to` address.
* The token needs a `function shareNumber(address, index) public view returns (uint)` that returns a specific share number given an address and index.
* as shares are traded a script needs to pull Transfer events from the global blockchain and keep the off-chain records up to date, either in real-time, or in an ad-hoc way.  This should be the job of the Crowdsale Admin website.

### Questions and Scenarios.

1. When someone buys a Token does that mean they have bought a specific share with a specific share number, or does it mean they've bought the right to be issued a share?

    scenario: Token Buys Share immediately.
    scenario: Token Buys rights to a share, when the crowdsale is finished.

a) `Token Buys Share immediately`

* A person's address sends ETH to the `CrowdsaleContract` and a `Token` is minted for them.
* Each `Token` is issued in blocks of `n` tokens (the amount) by the Crowdsale visa the `mint` function.
* When `Tokens` are minted for an address, the Token contract records the balance `n` and an `issuanceOffset`, giving rise to share numbers `issuanceOffset` to `issuanceOffset + n`
* These numbers are used as the share numbers for the associated shares.
* It is the `CrowdsaleContract`'s job to create the `issuanceOffset`
* It's the job of the script requesting the minting process to listen for the appropriate `Minted` event coming from the `CrowdsaleContract` then recording the transaction receipt with the users' other data in the offchain-database.

b) `Token Buys rights to a share, when the crowdsale is finished.`

You'd do this if you want to ensure a minimum cap is reached before issuing stock.

* same as (a) but don't actually do the `Transfers` in the `mint` function until the `finalise()` function is called.
