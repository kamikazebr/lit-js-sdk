"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const uint8arrays_1 = require("uint8arrays");
const version_1 = require("../version");
const utils_1 = require("../lib/utils");
const bls_sdk_1 = require("../lib/bls-sdk");
const crypto_1 = require("./crypto");
/**
 * @typedef {Object} AccessControlCondition
 * @property {string} contractAddress - The address of the contract that will be queried
 * @property {string} chain - The chain name of the chain that this contract is deployed on.  See LIT_CHAINS for currently supported chains.
 * @property {string} standardContractType - If the contract is an ERC20, ERC721, or ERC1155, please put that here
 * @property {string} method - The smart contract function to call
 * @property {Array} parameters - The parameters to use when calling the smart contract.  You can use the special ":userAddress" parameter which will be replaced with the requesting user's wallet address, verified via message signature
 * @property {Object} returnValueTest - An object containing two keys: "comparator" and "value".  The return value of the smart contract function will be compared against these.  For example, to check if someone holds an NFT, you could use "comparator: >" and "value: 0" which would check that a user has a token balance greater than zero.
 */
/**
 * @typedef {Object} EVMContractCondition
 * @property {string} contractAddress - The address of the contract that will be queried
 * @property {string} chain - The chain name of the chain that this contract is deployed on.  See LIT_CHAINS for currently supported chains.
 * @property {string} functionName - The smart contract function to call
 * @property {Array} functionParams - The parameters to use when calling the smart contract.  You can use the special ":userAddress" parameter which will be replaced with the requesting user's wallet address, verified via message signature
 * @property {Object} functionAbi - The ABI of the smart contract function to call.  This is used to encode the function parameters and decode the return value of the function.  Do not pass the entire contract ABI here.  Instead, find the function you want to call in the contract ABI and pass that function's ABI here.
 * @property {Object} returnValueTest - An object containing three keys: "key", "comparator" and "value".  The return value of the smart contract function will be compared against these.  For example, to check if someone holds an NFT, you could use "key": "", "comparator: >" and "value: 0" which would check that a user has a token balance greater than zero.  The "key" is used when the return value is a struct which contains multiple values and should be the name of the returned value from the function abi.  You must always pass "key" when using "returnValueTest", even if you pass an empty string for it, because the function only returns a single value.
 */
/**
 * @typedef {Object} SolRpcCondition
 * @property {string} method - The Solana RPC method to be called.  You can find a list here: https://docs.solana.com/developing/clients/jsonrpc-api
 * @property {Array} params - The parameters to use when making the RPC call.  You can use the special ":userAddress" parameter which will be replaced with the requesting user's wallet address, verified via message signature
 * @property {string} chain - The chain name of the chain that this contract is deployed on.  See ALL_LIT_CHAINS for currently supported chains.  On Solana, we support "solana" for mainnet, "solanaDevnet" for devnet and "solanaTestnet" for testnet.
 * @property {Object} returnValueTest - An object containing three keys: "key", "comparator" and "value".  The return value of the rpc call will be compared against these.  The "key" selector supports JSONPath syntax, so you can filter and iterate over the results.  For example, to check if someone holds an NFT with address 29G6GSKNGP8K6ATy65QrNZk4rNgsZX1sttvb5iLXWDcE, you could use "method": "GetTokenAccountsByOwner", "params": [":userAddress",{"programId":"TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"},{"encoding":"jsonParsed"}], "key": "$[?(@.account.data.parsed.info.mint == "29G6GSKNGP8K6ATy65QrNZk4rNgsZX1sttvb5iLXWDcE")].account.data.parsed.info.tokenAmount.amount", "comparator: >" and "value: 0" which would check that a user has a token balance greater than zero.  The "key" is used when the return value is an array or object which contains multiple values and should be the name of the returned value or a JSONPath item.  You must always pass "key" when using "returnValueTest", even if you pass an empty string for it, because the rpc call only returns a single value.
 */
/**
 * @typedef {Object} CosmosCondition
 * @property {string} path - The RPC URL path that will be called.  This will typically contain any parameters you need for the call.  Note that you can use the special ":userAddress" parameter which will be replaced with the requesting user's wallet address, verified via message signature.  For example, this path would be used to get the requesting user's balance: "/cosmos/bank/v1beta1/balances/:userAddress"
 * @property {string} chain - The chain name of the chain that this contract is deployed on.  See ALL_LIT_CHAINS for currently supported chains.  On Cosmos we currently support "cosmos" and "kyve"
 * @property {Object} returnValueTest - An object containing three keys: "key", "comparator" and "value".  The return value of the rpc call will be compared against these.  The "key" selector supports JSONPath syntax, so you can filter and iterate over the results.  For example, to check the balance of someone's account, you can use the key "$.balances[0].amount" which will pull out balances[0].amount from the JSON response and compare it against the "value" field according to the "comparator".  The "key" is used when the return value is an array or object which contains multiple values and should be the name of the returned value or a JSONPath item.  You must always pass "key" when using "returnValueTest", even if you pass an empty string for it, because the rpc call only returns a single value.
 */
/**
 * @typedef {Object} ResourceId
 * @property {string} baseUrl - The base url of the resource that will be authorized
 * @property {string} path - The path of the url of the resource that will be authorized
 * @property {string} orgId - The org id that the user would be authorized to belong to.  The orgId key must be present but it may contain an empty string if you don't need to store anything in it.
 * @property {string} role - The role that the user would be authorized to have.  The role key must be present but it may contain an empty string if you don't need to store anything in it.
 * @property {string} extraData - Any extra data you may want to store.  You may store stringified JSON in here, for example.  The extraData key must be present but it may contain an empty string if you don't need to store anything in it.
 */
/**
 * @typedef {Object} CallRequest
 * @property {string} to - The address of the contract that will be queried
 * @property {string} from - Optional.  The address calling the function.
 * @property {string} data - Hex encoded data to send to the contract.
 */
/**
 * A LIT node client.  Connects directly to the LIT nodes to store and retrieve encryption keys and signing requests.  Only holders of an NFT that corresponds with a LIT may store and retrieve the keys.
 * @param {Object} config
 * @param {boolean} [config.alertWhenUnauthorized=true] Whether or not to show a JS alert() when a user tries to unlock a LIT but is unauthorized.  An exception will also be thrown regardless of this option.
 * @param {number} [config.minNodeCount=6] The minimum number of nodes that must be connected for the LitNodeClient to be ready to use.
 * @param {boolean} [config.debug=true] Whether or not to show debug messages.
 */
class LitNodeClient {
    constructor(config) {
        this.config = {
            alertWhenUnauthorized: true,
            minNodeCount: 6,
            debug: true,
            bootstrapUrls: [
                "https://node2.litgateway.com:7370",
                "https://node2.litgateway.com:7371",
                "https://node2.litgateway.com:7372",
                "https://node2.litgateway.com:7373",
                "https://node2.litgateway.com:7374",
                "https://node2.litgateway.com:7375",
                "https://node2.litgateway.com:7376",
                "https://node2.litgateway.com:7377",
                "https://node2.litgateway.com:7378",
                "https://node2.litgateway.com:7379",
            ],
        };
        if (config) {
            this.config = Object.assign(Object.assign({}, this.config), config);
        }
        this.connectedNodes = new Set();
        this.serverKeys = {};
        this.ready = false;
        this.subnetPubKey = null;
        this.networkPubKey = null;
        this.networkPubKeySet = null;
        try {
            if (typeof window !== "undefined" && window && window.localStorage) {
                let configOverride = window.localStorage.getItem("LitNodeClientConfig");
                if (configOverride) {
                    configOverride = JSON.parse(configOverride);
                    // @ts-expect-error TS(2698): Spread types may only be created from object types... Remove this comment to see the full error message
                    this.config = Object.assign(Object.assign({}, this.config), configOverride);
                }
            }
        }
        catch (e) {
            console.log("Error accessing local storage", e);
        }
        // @ts-expect-error TS(7017): Element implicitly has an 'any' type because type ... Remove this comment to see the full error message
        globalThis.litConfig = this.config;
    }
    /**
     * Request a signed JWT of any solidity function call from the LIT network.  There are no prerequisites for this function.  You should use this function if you need to transmit information across chains, or from a blockchain to a centralized DB or server.  The signature of the returned JWT verifies that the response is genuine.
     * @param {Object} params
     * @param {Array.<CallRequest>} params.callRequests The call requests to make.  The responses will be signed and returned.
     * @param {string} params.chain The chain name of the chain that this contract is deployed on.  See LIT_CHAINS for currently supported chains.
     * @returns {Object} A signed JWT that proves the response to the function call is genuine. You may present this to a smart contract, or a server for authorization, and it can be verified using the verifyJwt function.
     */
    getSignedChainDataToken({ callRequests, chain }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.ready) {
                (0, utils_1.throwError)({
                    message: "LitNodeClient is not ready.  Please call await litNodeClient.connect() first.",
                    name: "LitNodeClientNotReadyError",
                    errorCode: "lit_node_client_not_ready",
                });
            }
            // we need to send jwt params iat (issued at) and exp (expiration)
            // because the nodes may have different wall clock times
            // the nodes will verify that these params are withing a grace period
            const now = Date.now();
            const iat = Math.floor(now / 1000);
            const exp = iat + 12 * 60 * 60; // 12 hours in seconds
            // ask each node to sign the content
            const nodePromises = [];
            for (const url of this.connectedNodes) {
                nodePromises.push(this.getChainDataSigningShare({
                    url,
                    callRequests,
                    chain,
                    iat,
                    exp,
                }));
            }
            const signatureShares = yield Promise.all(nodePromises);
            (0, utils_1.log)("signatureShares", signatureShares);
            const goodShares = signatureShares.filter((d) => d.signatureShare !== "");
            if (goodShares.length < this.config.minNodeCount) {
                (0, utils_1.log)(`majority of shares are bad. goodShares is ${JSON.stringify(goodShares)}`);
                if (this.config.alertWhenUnauthorized) {
                    alert("You are not authorized to receive a signature to grant access to this content");
                }
                (0, utils_1.throwError)({
                    message: `You are not authorized to recieve a signature on this item`,
                    name: "UnauthorizedException",
                    errorCode: "not_authorized",
                });
            }
            // sanity check
            if (!signatureShares.every((val, i, arr) => val.unsignedJwt === arr[0].unsignedJwt)) {
                const msg = "Unsigned JWT is not the same from all the nodes.  This means the combined signature will be bad because the nodes signed the wrong things";
                (0, utils_1.log)(msg);
                alert(msg);
            }
            // sort the sig shares by share index.  this is important when combining the shares.
            signatureShares.sort((a, b) => a.shareIndex - b.shareIndex);
            // combine the signature shares
            const pkSetAsBytes = (0, uint8arrays_1.fromString)(this.networkPubKeySet, "base16");
            (0, utils_1.log)("pkSetAsBytes", pkSetAsBytes);
            const sigShares = signatureShares.map((s) => ({
                shareHex: s.signatureShare,
                shareIndex: s.shareIndex,
            }));
            const signature = bls_sdk_1.wasmBlsSdkHelpers.combine_signatures(pkSetAsBytes, sigShares);
            (0, utils_1.log)("raw sig", signature);
            (0, utils_1.log)("signature is ", (0, uint8arrays_1.toString)(signature, "base16"));
            const unsignedJwt = (0, utils_1.mostCommonString)(signatureShares.map((s) => s.unsignedJwt));
            // convert the sig to base64 and append to the jwt
            const finalJwt = `${unsignedJwt}.${(0, uint8arrays_1.toString)(signature, "base64url")}`;
            return finalJwt;
        });
    }
    /**
     * Request a signed JWT from the LIT network.  Before calling this function, you must either create or know of a resource id and access control conditions for the item you wish to gain authorization for.  You can create an access control condition using the saveSigningCondition function.
     * @param {Object} params
     * @param {Array.<AccessControlCondition>} params.accessControlConditions The access control conditions that the user must meet to obtain this signed token.  This could be posession of an NFT, for example.  You must pass either accessControlConditions or evmContractConditions or solRpcConditions or unifiedAccessControlConditions.
     * @param {Array.<EVMContractCondition>} params.evmContractConditions  EVM Smart Contract access control conditions that the user must meet to obtain this signed token.  This could be posession of an NFT, for example.  This is different than accessControlConditions because accessControlConditions only supports a limited number of contract calls.  evmContractConditions supports any contract call.  You must pass either accessControlConditions or evmContractConditions solRpcConditions or unifiedAccessControlConditions.
     * @param {Array.<SolRpcCondition>} params.solRpcConditions  Solana RPC call conditions that the user must meet to obtain this signed token.  This could be posession of an NFT, for example.
     * @param {Array.<AccessControlCondition|EVMContractCondition|SolRpcCondition>} params.unifiedAccessControlConditions  An array of unified access control conditions.  You may use AccessControlCondition, EVMContractCondition, or SolRpcCondition objects in this array, but make sure you add a conditionType for each one.  You must pass either accessControlConditions or evmContractConditions or solRpcConditions or unifiedAccessControlConditions.
     * @param {string} params.chain The chain name of the chain that you are querying.  See ALL_LIT_CHAINS for currently supported chains.
     * @param {AuthSig} params.authSig The authentication signature that proves that the user owns the crypto wallet address that meets the access control conditions.
     * @param {ResourceId} params.resourceId The resourceId representing something on the web via a URL
     * @returns {Object} A signed JWT that proves you meet the access control conditions for the given resource id.  You may present this to a server for authorization, and the server can verify it using the verifyJwt function.
     */
    getSignedToken({ accessControlConditions, evmContractConditions, solRpcConditions, unifiedAccessControlConditions, chain, authSig, resourceId }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.ready) {
                (0, utils_1.throwError)({
                    message: "LitNodeClient is not ready.  Please call await litNodeClient.connect() first.",
                    name: "LitNodeClientNotReadyError",
                    errorCode: "lit_node_client_not_ready",
                });
            }
            // we need to send jwt params iat (issued at) and exp (expiration)
            // because the nodes may have different wall clock times
            // the nodes will verify that these params are withing a grace period
            const now = Date.now();
            const iat = Math.floor(now / 1000);
            const exp = iat + 12 * 60 * 60; // 12 hours in seconds
            let formattedAccessControlConditions;
            let formattedEVMContractConditions;
            let formattedSolRpcConditions;
            let formattedUnifiedAccessControlConditions;
            if (accessControlConditions) {
                formattedAccessControlConditions = accessControlConditions.map((c) => (0, crypto_1.canonicalAccessControlConditionFormatter)(c));
                (0, utils_1.log)("formattedAccessControlConditions", JSON.stringify(formattedAccessControlConditions));
            }
            else if (evmContractConditions) {
                formattedEVMContractConditions = evmContractConditions.map((c) => (0, crypto_1.canonicalEVMContractConditionFormatter)(c));
                (0, utils_1.log)("formattedEVMContractConditions", JSON.stringify(formattedEVMContractConditions));
            }
            else if (solRpcConditions) {
                formattedSolRpcConditions = solRpcConditions.map((c) => (0, crypto_1.canonicalSolRpcConditionFormatter)(c));
                (0, utils_1.log)("formattedSolRpcConditions", JSON.stringify(formattedSolRpcConditions));
            }
            else if (unifiedAccessControlConditions) {
                formattedUnifiedAccessControlConditions =
                    unifiedAccessControlConditions.map((c) => (0, crypto_1.canonicalUnifiedAccessControlConditionFormatter)(c));
                (0, utils_1.log)("formattedUnifiedAccessControlConditions", JSON.stringify(formattedUnifiedAccessControlConditions));
            }
            else {
                (0, utils_1.throwError)({
                    message: `You must provide either accessControlConditions or evmContractConditions or solRpcConditions or unifiedAccessControlConditions`,
                    name: "InvalidArgumentException",
                    errorCode: "invalid_argument",
                });
            }
            const formattedResourceId = (0, crypto_1.canonicalResourceIdFormatter)(resourceId);
            // ask each node to sign the content
            const nodePromises = [];
            for (const url of this.connectedNodes) {
                nodePromises.push(this.getSigningShare({
                    url,
                    accessControlConditions: formattedAccessControlConditions,
                    evmContractConditions: formattedEVMContractConditions,
                    solRpcConditions: formattedSolRpcConditions,
                    unifiedAccessControlConditions: formattedUnifiedAccessControlConditions,
                    resourceId: formattedResourceId,
                    authSig,
                    chain,
                    iat,
                    exp,
                }));
            }
            const res = yield this.handleNodePromises(nodePromises);
            if (res.success === false) {
                this.throwNodeError(res);
                return;
            }
            const signatureShares = res.values;
            (0, utils_1.log)("signatureShares", signatureShares);
            // sanity check
            if (
            // @ts-expect-error TS(2532): Object is possibly 'undefined'.
            !signatureShares.every((val, i, arr) => val.unsignedJwt === arr[0].unsignedJwt)) {
                const msg = "Unsigned JWT is not the same from all the nodes.  This means the combined signature will be bad because the nodes signed the wrong things";
                (0, utils_1.log)(msg);
                alert(msg);
            }
            // sort the sig shares by share index.  this is important when combining the shares.
            // @ts-expect-error TS(2532): Object is possibly 'undefined'.
            signatureShares.sort((a, b) => a.shareIndex - b.shareIndex);
            // combine the signature shares
            const pkSetAsBytes = (0, uint8arrays_1.fromString)(this.networkPubKeySet, "base16");
            (0, utils_1.log)("pkSetAsBytes", pkSetAsBytes);
            // @ts-expect-error TS(2532): Object is possibly 'undefined'.
            const sigShares = signatureShares.map((s) => ({
                shareHex: s.signatureShare,
                shareIndex: s.shareIndex,
            }));
            const signature = bls_sdk_1.wasmBlsSdkHelpers.combine_signatures(pkSetAsBytes, sigShares);
            (0, utils_1.log)("raw sig", signature);
            (0, utils_1.log)("signature is ", (0, uint8arrays_1.toString)(signature, "base16"));
            const unsignedJwt = (0, utils_1.mostCommonString)(
            // @ts-expect-error TS(2532): Object is possibly 'undefined'.
            signatureShares.map((s) => s.unsignedJwt));
            // convert the sig to base64 and append to the jwt
            const finalJwt = `${unsignedJwt}.${(0, uint8arrays_1.toString)(signature, "base64url")}`;
            return finalJwt;
        });
    }
    /**
     * Associated access control conditions with a resource on the web.  After calling this function, users may use the getSignedToken function to request a signed JWT from the LIT network.  This JWT proves that the user meets the access control conditions, and is authorized to access the resource you specified in the resourceId parameter of the saveSigningCondition function.
     * @param {Object} params
     * @param {Array.<AccessControlCondition>} params.accessControlConditions The access control conditions that the user must meet to obtain this signed token.  This could be posession of an NFT, for example.  You must pass either accessControlConditions or evmContractConditions or solRpcConditions or unifiedAccessControlConditions.
     * @param {Array.<EVMContractCondition>} params.evmContractConditions  EVM Smart Contract access control conditions that the user must meet to obtain this signed token.  This could be posession of an NFT, for example.  This is different than accessControlConditions because accessControlConditions only supports a limited number of contract calls.  evmContractConditions supports any contract call.  You must pass either accessControlConditions or evmContractConditions or solRpcConditions or unifiedAccessControlConditions.
     * @param {Array.<SolRpcCondition>} params.solRpcConditions  Solana RPC call conditions that the user must meet to obtain this signed token.  This could be posession of an NFT, for example.
     * @param {Array.<AccessControlCondition|EVMContractCondition|SolRpcCondition>} params.unifiedAccessControlConditions  An array of unified access control conditions.  You may use AccessControlCondition, EVMContractCondition, or SolRpcCondition objects in this array, but make sure you add a conditionType for each one.  You must pass either accessControlConditions or evmContractConditions or solRpcConditions or unifiedAccessControlConditions.
     * @param {string} params.chain The chain name of the chain that you are querying.  See ALL_LIT_CHAINS for currently supported chains.
     * @param {AuthSig} params.authSig The authentication signature that proves that the user owns the crypto wallet address that meets the access control conditions
     * @param {ResourceId} params.resourceId The resourceId representing something on the web via a URL
     * @param {boolean} params.permanent Whether or not the access control condition should be saved permanently.  If false, the access control conditions will be updateable by the creator.  If you don't pass this param, it's set to true by default.
     * @returns {boolean} Success
     */
    saveSigningCondition({ accessControlConditions, evmContractConditions, solRpcConditions, unifiedAccessControlConditions, chain, authSig, resourceId, permanant, permanent = true }) {
        return __awaiter(this, void 0, void 0, function* () {
            (0, utils_1.log)("saveSigningCondition");
            if (!this.ready) {
                (0, utils_1.throwError)({
                    message: "LitNodeClient is not ready.  Please call await litNodeClient.connect() first.",
                    name: "LitNodeClientNotReadyError",
                    errorCode: "lit_node_client_not_ready",
                });
            }
            // this is to fix my spelling mistake that we must now maintain forever lol
            if (typeof permanant !== "undefined") {
                permanent = permanant;
            }
            // hash the resource id
            const hashOfResourceId = yield (0, crypto_1.hashResourceId)(resourceId);
            const hashOfResourceIdStr = (0, uint8arrays_1.toString)(new Uint8Array(hashOfResourceId), "base16");
            let hashOfConditions;
            // hash the access control conditions
            if (accessControlConditions) {
                hashOfConditions = yield (0, crypto_1.hashAccessControlConditions)(accessControlConditions);
            }
            else if (evmContractConditions) {
                hashOfConditions = yield (0, crypto_1.hashEVMContractConditions)(evmContractConditions);
            }
            else if (solRpcConditions) {
                hashOfConditions = yield (0, crypto_1.hashSolRpcConditions)(solRpcConditions);
            }
            else if (unifiedAccessControlConditions) {
                hashOfConditions = yield (0, crypto_1.hashUnifiedAccessControlConditions)(unifiedAccessControlConditions);
            }
            else {
                (0, utils_1.throwError)({
                    message: `You must provide either accessControlConditions or evmContractConditions or solRpcConditions or unifiedAccessControlConditions`,
                    name: "InvalidArgumentException",
                    errorCode: "invalid_argument",
                });
            }
            const hashOfConditionsStr = (0, uint8arrays_1.toString)(
            // @ts-expect-error TS(2769): No overload matches this call.
            new Uint8Array(hashOfConditions), "base16");
            // create access control conditions on lit nodes
            const nodePromises = [];
            for (const url of this.connectedNodes) {
                nodePromises.push(this.storeSigningConditionWithNode({
                    url,
                    key: hashOfResourceIdStr,
                    val: hashOfConditionsStr,
                    authSig,
                    chain,
                    permanent: permanent ? 1 : 0,
                }));
            }
            const res = yield this.handleNodePromises(nodePromises);
            if (res.success === false) {
                this.throwNodeError(res);
                return;
            }
            return true;
        });
    }
    /**
     * Retrieve the symmetric encryption key from the LIT nodes.  Note that this will only work if the current user meets the access control conditions specified when the data was encrypted.  That access control condition is typically that the user is a holder of the NFT that corresponds to this encrypted data.  This NFT token address and ID was specified when this LIT was created.
     * @param {Object} params
     * @param {Array.<AccessControlCondition>} params.accessControlConditions The access control conditions that the user must meet to obtain this signed token.  This could be posession of an NFT, for example.  You must pass either accessControlConditions or evmContractConditions or solRpcConditions or unifiedAccessControlConditions.
     * @param {Array.<EVMContractCondition>} params.evmContractConditions  EVM Smart Contract access control conditions that the user must meet to obtain this signed token.  This could be posession of an NFT, for example.  This is different than accessControlConditions because accessControlConditions only supports a limited number of contract calls.  evmContractConditions supports any contract call.  You must pass either accessControlConditions or evmContractConditions or solRpcConditions or unifiedAccessControlConditions.
     * @param {Array.<SolRpcCondition>} params.solRpcConditions  Solana RPC call conditions that the user must meet to obtain this signed token.  This could be posession of an NFT, for example.
     * @param {Array.<AccessControlCondition|EVMContractCondition|SolRpcCondition>} params.unifiedAccessControlConditions  An array of unified access control conditions.  You may use AccessControlCondition, EVMContractCondition, or SolRpcCondition objects in this array, but make sure you add a conditionType for each one.  You must pass either accessControlConditions or evmContractConditions or solRpcConditions or unifiedAccessControlConditions.
     * @param {string} params.toDecrypt The ciphertext that you wish to decrypt encoded as a hex string
     * @param {string} params.chain The chain name of the chain that you are querying.  See ALL_LIT_CHAINS for currently supported chains.
     * @param {AuthSig} params.authSig The authentication signature that proves that the user owns the crypto wallet address meets the access control conditions.
     * @returns {Uint8Array} The symmetric encryption key that can be used to decrypt the locked content inside the LIT.  You should pass this key to the decryptZip function.
     */
    getEncryptionKey({ accessControlConditions, evmContractConditions, solRpcConditions, unifiedAccessControlConditions, toDecrypt, chain, authSig }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.ready) {
                (0, utils_1.throwError)({
                    message: "LitNodeClient is not ready.  Please call await litNodeClient.connect() first.",
                    name: "LitNodeClientNotReadyError",
                    errorCode: "lit_node_client_not_ready",
                });
            }
            // -- validate
            if (accessControlConditions &&
                !(0, utils_1.checkType)({
                    value: accessControlConditions,
                    allowedTypes: ["Array"],
                    paramName: "accessControlConditions",
                    functionName: "getEncryptionKey",
                }))
                return;
            if (evmContractConditions &&
                !(0, utils_1.checkType)({
                    value: evmContractConditions,
                    allowedTypes: ["Array"],
                    paramName: "evmContractConditions",
                    functionName: "getEncryptionKey",
                }))
                return;
            if (solRpcConditions &&
                !(0, utils_1.checkType)({
                    value: solRpcConditions,
                    allowedTypes: ["Array"],
                    paramName: "solRpcConditions",
                    functionName: "getEncryptionKey",
                }))
                return;
            if (unifiedAccessControlConditions &&
                !(0, utils_1.checkType)({
                    value: unifiedAccessControlConditions,
                    allowedTypes: ["Array"],
                    paramName: "unifiedAccessControlConditions",
                    functionName: "getEncryptionKey",
                }))
                return;
            if (!(0, utils_1.checkType)({
                value: toDecrypt,
                allowedTypes: ["String"],
                paramName: "toDecrypt",
                functionName: "getEncryptionKey",
            }))
                return;
            if (!(0, utils_1.checkType)({
                value: authSig,
                allowedTypes: ["Object"],
                paramName: "authSig",
                functionName: "getEncryptionKey",
            }))
                return;
            if (!(0, utils_1.checkIfAuthSigRequiresChainParam)(authSig, chain, "getEncryptionKey"))
                return;
            let formattedAccessControlConditions;
            let formattedEVMContractConditions;
            let formattedSolRpcConditions;
            let formattedUnifiedAccessControlConditions;
            if (accessControlConditions) {
                formattedAccessControlConditions = accessControlConditions.map((c) => (0, crypto_1.canonicalAccessControlConditionFormatter)(c));
                (0, utils_1.log)("formattedAccessControlConditions: ", JSON.stringify(formattedAccessControlConditions));
            }
            else if (evmContractConditions) {
                formattedEVMContractConditions = evmContractConditions.map((c) => (0, crypto_1.canonicalEVMContractConditionFormatter)(c));
                (0, utils_1.log)("formattedEVMContractConditions", JSON.stringify(formattedEVMContractConditions));
            }
            else if (solRpcConditions) {
                formattedSolRpcConditions = solRpcConditions.map((c) => (0, crypto_1.canonicalSolRpcConditionFormatter)(c));
                (0, utils_1.log)("formattedSolRpcConditions", JSON.stringify(formattedSolRpcConditions));
            }
            else if (unifiedAccessControlConditions) {
                formattedUnifiedAccessControlConditions =
                    unifiedAccessControlConditions.map((c) => (0, crypto_1.canonicalUnifiedAccessControlConditionFormatter)(c));
                (0, utils_1.log)("formattedUnifiedAccessControlConditions", JSON.stringify(formattedUnifiedAccessControlConditions));
            }
            else {
                (0, utils_1.throwError)({
                    message: `You must provide either accessControlConditions or evmContractConditions or solRpcConditions or unifiedAccessControlConditions`,
                    name: "InvalidArgumentException",
                    errorCode: "invalid_argument",
                });
            }
            // ask each node to decrypt the content
            const nodePromises = [];
            for (const url of this.connectedNodes) {
                nodePromises.push(this.getDecryptionShare({
                    url,
                    accessControlConditions: formattedAccessControlConditions,
                    evmContractConditions: formattedEVMContractConditions,
                    solRpcConditions: formattedSolRpcConditions,
                    unifiedAccessControlConditions: formattedUnifiedAccessControlConditions,
                    toDecrypt,
                    authSig,
                    chain,
                }));
            }
            const res = yield this.handleNodePromises(nodePromises);
            if (res.success === false) {
                this.throwNodeError(res);
                return;
            }
            const decryptionShares = res.values;
            (0, utils_1.log)("decryptionShares", decryptionShares);
            // sort the decryption shares by share index.  this is important when combining the shares.
            // @ts-expect-error TS(2532): Object is possibly 'undefined'.
            decryptionShares.sort((a, b) => a.shareIndex - b.shareIndex);
            // combine the decryption shares
            // set decryption shares bytes in wasm
            // @ts-expect-error TS(2532): Object is possibly 'undefined'.
            decryptionShares.forEach((s, idx) => {
                // @ts-expect-error TS(2304): Cannot find name 'wasmExports'.
                wasmExports.set_share_indexes(idx, s.shareIndex);
                const shareAsBytes = (0, uint8arrays_1.fromString)(s.decryptionShare, "base16");
                for (let i = 0; i < shareAsBytes.length; i++) {
                    // @ts-expect-error TS(2304): Cannot find name 'wasmExports'.
                    wasmExports.set_decryption_shares_byte(i, idx, shareAsBytes[i]);
                }
            });
            // set the public key set bytes in wasm
            const pkSetAsBytes = (0, uint8arrays_1.fromString)(this.networkPubKeySet, "base16");
            bls_sdk_1.wasmBlsSdkHelpers.set_mc_bytes(pkSetAsBytes);
            // set the ciphertext bytes
            const ciphertextAsBytes = (0, uint8arrays_1.fromString)(toDecrypt, "base16");
            for (let i = 0; i < ciphertextAsBytes.length; i++) {
                // @ts-expect-error TS(2304): Cannot find name 'wasmExports'.
                wasmExports.set_ct_byte(i, ciphertextAsBytes[i]);
            }
            const decrypted = bls_sdk_1.wasmBlsSdkHelpers.combine_decryption_shares(
            // @ts-expect-error TS(2532): Object is possibly 'undefined'.
            decryptionShares.length, pkSetAsBytes.length, ciphertextAsBytes.length);
            // log('decrypted is ', uint8arrayToString(decrypted, 'base16'))
            return decrypted;
        });
    }
    /**
     * Securely save the association between access control conditions and something that you wish to decrypt
     * @param {Object} params
     * @param {Array.<AccessControlCondition>} params.accessControlConditions The access control conditions that the user must meet to obtain this signed token.  This could be posession of an NFT, for example.  You must pass either accessControlConditions or evmContractConditions or solRpcConditions or unifiedAccessControlConditions.
     * @param {Array.<EVMContractCondition>} params.evmContractConditions  EVM Smart Contract access control conditions that the user must meet to obtain this signed token.  This could be posession of an NFT, for example.  This is different than accessControlConditions because accessControlConditions only supports a limited number of contract calls.  evmContractConditions supports any contract call.  You must pass either accessControlConditions or evmContractConditions or solRpcConditions or unifiedAccessControlConditions.
     * @param {Array.<SolRpcCondition>} params.solRpcConditions  Solana RPC call conditions that the user must meet to obtain this signed token.  This could be posession of an NFT, for example.
     * @param {Array.<AccessControlCondition|EVMContractCondition|SolRpcCondition>} params.unifiedAccessControlConditions  An array of unified access control conditions.  You may use AccessControlCondition, EVMContractCondition, or SolRpcCondition objects in this array, but make sure you add a conditionType for each one.  You must pass either accessControlConditions or evmContractConditions or solRpcConditions or unifiedAccessControlConditions.
     * @param {string} params.chain The chain name of the chain that you are querying.  See ALL_LIT_CHAINS for currently supported chains.
     * @param {AuthSig} params.authSig The authentication signature that proves that the user owns the crypto wallet address meets the access control conditions
     * @param {string} params.symmetricKey The symmetric encryption key that was used to encrypt the locked content inside the LIT as a Uint8Array.  You should use zipAndEncryptString or zipAndEncryptFiles to get this encryption key.  This key will be hashed and the hash will be sent to the LIT nodes.  You must pass either symmetricKey or encryptedSymmetricKey.
     * @param {Uint8Array} params.encryptedSymmetricKey The encrypted symmetric key of the item you with to update.  You must pass either symmetricKey or encryptedSymmetricKey.
     * @param {boolean} params.permanent Whether or not the access control condition should be saved permanently.  If false, the access control conditions will be updateable by the creator.  If you don't pass this param, it's set to true by default.
     * @returns {Uint8Array} The symmetricKey parameter that has been encrypted with the network public key.  Save this - you will need it to decrypt the content in the future.
     */
    saveEncryptionKey({ accessControlConditions, evmContractConditions, solRpcConditions, unifiedAccessControlConditions, chain, authSig, symmetricKey, encryptedSymmetricKey, permanant, permanent = true }) {
        return __awaiter(this, void 0, void 0, function* () {
            (0, utils_1.log)("LitNodeClient.saveEncryptionKey");
            if (!this.ready) {
                (0, utils_1.throwError)({
                    message: "LitNodeClient is not ready.  Please call await litNodeClient.connect() first.",
                    name: "LitNodeClientNotReadyError",
                    errorCode: "lit_node_client_not_ready",
                });
            }
            // -- validate
            if (accessControlConditions &&
                !(0, utils_1.checkType)({
                    value: accessControlConditions,
                    allowedTypes: ["Array"],
                    paramName: "accessControlConditions",
                    functionName: "saveEncryptionKey",
                }))
                return;
            if (evmContractConditions &&
                !(0, utils_1.checkType)({
                    value: evmContractConditions,
                    allowedTypes: ["Array"],
                    paramName: "evmContractConditions",
                    functionName: "saveEncryptionKey",
                }))
                return;
            if (solRpcConditions &&
                !(0, utils_1.checkType)({
                    value: solRpcConditions,
                    allowedTypes: ["Array"],
                    paramName: "solRpcConditions",
                    functionName: "saveEncryptionKey",
                }))
                return;
            if (unifiedAccessControlConditions &&
                !(0, utils_1.checkType)({
                    value: unifiedAccessControlConditions,
                    allowedTypes: ["Array"],
                    paramName: "unifiedAccessControlConditions",
                    functionName: "saveEncryptionKey",
                }))
                return;
            if (!(0, utils_1.checkType)({
                value: authSig,
                allowedTypes: ["Object"],
                paramName: "authSig",
                functionName: "saveEncryptionKey",
            }))
                return;
            if (!(0, utils_1.checkIfAuthSigRequiresChainParam)(authSig, chain, "saveEncryptionKey"))
                return;
            if (symmetricKey &&
                !(0, utils_1.checkType)({
                    value: symmetricKey,
                    allowedTypes: ["Uint8Array"],
                    paramName: "symmetricKey",
                    functionName: "saveEncryptionKey",
                }))
                return;
            if (encryptedSymmetricKey &&
                !(0, utils_1.checkType)({
                    value: encryptedSymmetricKey,
                    allowedTypes: ["Uint8Array"],
                    paramName: "encryptedSymmetricKey",
                    functionName: "saveEncryptionKey",
                }))
                return;
            // to fix spelling mistake
            if (typeof permanant !== "undefined") {
                permanent = permanant;
            }
            if ((!symmetricKey || symmetricKey == "") &&
                (!encryptedSymmetricKey || encryptedSymmetricKey == "")) {
                throw new Error("symmetricKey and encryptedSymmetricKey are blank.  You must pass one or the other");
            }
            if ((!accessControlConditions || accessControlConditions.length == 0) &&
                (!evmContractConditions || evmContractConditions.length == 0) &&
                (!solRpcConditions || solRpcConditions.length == 0) &&
                (!unifiedAccessControlConditions ||
                    unifiedAccessControlConditions.length == 0)) {
                throw new Error("accessControlConditions and evmContractConditions and solRpcConditions and unifiedAccessControlConditions are blank");
            }
            if (!authSig) {
                throw new Error("authSig is blank");
            }
            // encrypt with network pubkey
            let encryptedKey;
            if (encryptedSymmetricKey) {
                encryptedKey = encryptedSymmetricKey;
            }
            else {
                encryptedKey = bls_sdk_1.wasmBlsSdkHelpers.encrypt((0, uint8arrays_1.fromString)(this.subnetPubKey, "base16"), symmetricKey);
                (0, utils_1.log)("symmetric key encrypted with LIT network key: ", (0, uint8arrays_1.toString)(encryptedKey, "base16"));
            }
            // hash the encrypted pubkey
            const hashOfKey = yield crypto.subtle.digest("SHA-256", encryptedKey);
            const hashOfKeyStr = (0, uint8arrays_1.toString)(new Uint8Array(hashOfKey), "base16");
            // hash the access control conditions
            let hashOfConditions;
            // hash the access control conditions
            if (accessControlConditions) {
                hashOfConditions = yield (0, crypto_1.hashAccessControlConditions)(accessControlConditions);
            }
            else if (evmContractConditions) {
                hashOfConditions = yield (0, crypto_1.hashEVMContractConditions)(evmContractConditions);
            }
            else if (solRpcConditions) {
                hashOfConditions = yield (0, crypto_1.hashSolRpcConditions)(solRpcConditions);
            }
            else if (unifiedAccessControlConditions) {
                hashOfConditions = yield (0, crypto_1.hashUnifiedAccessControlConditions)(unifiedAccessControlConditions);
            }
            else {
                (0, utils_1.throwError)({
                    message: `You must provide either accessControlConditions or evmContractConditions or solRpcConditions or unifiedAccessControlConditions`,
                    name: "InvalidArgumentException",
                    errorCode: "invalid_argument",
                });
            }
            const hashOfConditionsStr = (0, uint8arrays_1.toString)(
            // @ts-expect-error TS(2769): No overload matches this call.
            new Uint8Array(hashOfConditions), "base16");
            // create access control conditions on lit nodes
            const nodePromises = [];
            for (const url of this.connectedNodes) {
                nodePromises.push(this.storeEncryptionConditionWithNode({
                    url,
                    key: hashOfKeyStr,
                    val: hashOfConditionsStr,
                    authSig,
                    chain,
                    permanent: permanent ? 1 : 0,
                }));
            }
            const res = yield this.handleNodePromises(nodePromises);
            if (res.success === false) {
                this.throwNodeError(res);
                return;
            }
            return encryptedKey;
        });
    }
    storeSigningConditionWithNode({ url, key, val, authSig, chain, permanent }) {
        return __awaiter(this, void 0, void 0, function* () {
            (0, utils_1.log)("storeSigningConditionWithNode");
            const urlWithPath = `${url}/web/signing/store`;
            const data = {
                key,
                val,
                authSig,
                chain,
                permanant: permanent,
            };
            return yield this.sendCommandToNode({ url: urlWithPath, data });
        });
    }
    storeEncryptionConditionWithNode({ url, key, val, authSig, chain, permanent }) {
        return __awaiter(this, void 0, void 0, function* () {
            (0, utils_1.log)("storeEncryptionConditionWithNode");
            const urlWithPath = `${url}/web/encryption/store`;
            const data = {
                key,
                val,
                authSig,
                chain,
                permanant: permanent,
            };
            return yield this.sendCommandToNode({ url: urlWithPath, data });
        });
    }
    getChainDataSigningShare({ url, callRequests, chain, iat, exp }) {
        return __awaiter(this, void 0, void 0, function* () {
            (0, utils_1.log)("getChainDataSigningShare");
            const urlWithPath = `${url}/web/signing/sign_chain_data`;
            const data = {
                callRequests,
                chain,
                iat,
                exp,
            };
            return yield this.sendCommandToNode({ url: urlWithPath, data });
        });
    }
    getSigningShare({ url, accessControlConditions, evmContractConditions, solRpcConditions, unifiedAccessControlConditions, resourceId, authSig, chain, iat, exp }) {
        return __awaiter(this, void 0, void 0, function* () {
            (0, utils_1.log)("getSigningShare");
            const urlWithPath = `${url}/web/signing/retrieve`;
            const data = {
                accessControlConditions,
                evmContractConditions,
                solRpcConditions,
                unifiedAccessControlConditions,
                resourceId,
                authSig,
                chain,
                iat,
                exp,
            };
            return yield this.sendCommandToNode({ url: urlWithPath, data });
        });
    }
    getDecryptionShare({ url, accessControlConditions, evmContractConditions, solRpcConditions, unifiedAccessControlConditions, toDecrypt, authSig, chain }) {
        return __awaiter(this, void 0, void 0, function* () {
            (0, utils_1.log)("getDecryptionShare");
            const urlWithPath = `${url}/web/encryption/retrieve`;
            const data = {
                accessControlConditions,
                evmContractConditions,
                solRpcConditions,
                unifiedAccessControlConditions,
                toDecrypt,
                authSig,
                chain,
            };
            return yield this.sendCommandToNode({ url: urlWithPath, data });
        });
    }
    handshakeWithSgx({ url }) {
        return __awaiter(this, void 0, void 0, function* () {
            const urlWithPath = `${url}/web/handshake`;
            (0, utils_1.log)(`handshakeWithSgx ${urlWithPath}`);
            const data = {
                clientPublicKey: "test",
            };
            return yield this.sendCommandToNode({ url: urlWithPath, data });
        });
    }
    sendCommandToNode({ url, data }) {
        (0, utils_1.log)(`sendCommandToNode with url ${url} and data`, data);
        return fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "lit-js-sdk-version": version_1.version,
            },
            body: JSON.stringify(data),
        }).then((response) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const isJson = (_a = response.headers
                .get("content-type")) === null || _a === void 0 ? void 0 : _a.includes("application/json");
            const data = isJson ? yield response.json() : null;
            if (!response.ok) {
                // get error message from body or default to response status
                const error = data || response.status;
                return Promise.reject(error);
            }
            return data;
        }));
    }
    handleNodePromises(promises) {
        return __awaiter(this, void 0, void 0, function* () {
            const responses = yield Promise.allSettled(promises);
            (0, utils_1.log)("responses", responses);
            const successes = responses.filter((r) => r.status === "fulfilled");
            if (successes.length >= this.config.minNodeCount) {
                return {
                    success: true,
                    values: successes.map((r) => r.value),
                };
            }
            // if we're here, then we did not succeed.  time to handle and report errors.
            const rejected = responses.filter((r) => r.status === "rejected");
            const mostCommonError = JSON.parse((0, utils_1.mostCommonString)(rejected.map((r) => JSON.stringify(r.reason))));
            (0, utils_1.log)(`most common error: ${JSON.stringify(mostCommonError)}`);
            return {
                success: false,
                error: mostCommonError,
            };
        });
    }
    throwNodeError(res) {
        if (res.error && res.error.errorCode) {
            if (res.error.errorCode === "not_authorized" &&
                this.config.alertWhenUnauthorized) {
                alert("You are not authorized to access to this content");
            }
            (0, utils_1.throwError)(Object.assign(Object.assign({}, res.error), { name: "NodeError" }));
        }
        else {
            (0, utils_1.throwError)({
                message: `There was an error getting the signing shares from the nodes`,
                name: "UnknownError",
                errorCode: "unknown_error",
            });
        }
    }
    /**
     * Connect to the LIT nodes.
     * @returns {Promise} A promise that resolves when the nodes are connected.
     */
    connect() {
        // handshake with each node
        for (const url of this.config.bootstrapUrls) {
            this.handshakeWithSgx({ url }).then((resp) => {
                this.connectedNodes.add(url);
                this.serverKeys[url] = {
                    serverPubKey: resp.serverPublicKey,
                    subnetPubKey: resp.subnetPublicKey,
                    networkPubKey: resp.networkPublicKey,
                    networkPubKeySet: resp.networkPublicKeySet,
                };
            });
        }
        return new Promise((resolve) => {
            const interval = setInterval(() => {
                if (Object.keys(this.serverKeys).length >= this.config.minNodeCount) {
                    clearInterval(interval);
                    // pick the most common public keys for the subnet and network from the bunch, in case some evil node returned a bad key
                    this.subnetPubKey = (0, utils_1.mostCommonString)(Object.values(this.serverKeys).map((keysFromSingleNode) => keysFromSingleNode.subnetPubKey));
                    this.networkPubKey = (0, utils_1.mostCommonString)(Object.values(this.serverKeys).map((keysFromSingleNode) => keysFromSingleNode.networkPubKey));
                    this.networkPubKeySet = (0, utils_1.mostCommonString)(Object.values(this.serverKeys).map((keysFromSingleNode) => keysFromSingleNode.networkPubKeySet));
                    this.ready = true;
                    (0, utils_1.log)("lit is ready");
                    if (typeof document !== "undefined") {
                        document.dispatchEvent(new Event("lit-ready"));
                    }
                    // @ts-expect-error TS(2794): Expected 1 arguments, but got 0. Did you forget to... Remove this comment to see the full error message
                    resolve();
                }
            }, 500);
        });
    }
}
exports.default = LitNodeClient;
