import { LitChainsKeys } from "../types/types.js";
import { LIT_AUTH_SIG_CHAIN_KEYS } from "./constants.js";

export const printError = (e: any) => {
  console.log("Error Stack", e.stack);
  console.log("Error Name", e.name);
  console.log("Error Message", e.message);
};

export const mostCommonString = (arr: any) => {
  return arr
    .sort(
      (a: any, b: any) =>
        arr.filter((v: any) => v === a).length - arr.filter((v: any) => v === b).length
    )
    .pop();
};

export const throwError = ({
  message,
  name,
  errorCode
}: {
  message:string,
  name:string,
  errorCode:string
}) => {
  throw new (((function(this: any) {
    this.message = message;
    this.name = name;
    this.errorCode = errorCode;
  })) as any)();
};

export const log = (...args: any[]) => {
  if (
    globalThis &&
    globalThis.litConfig &&
    globalThis.litConfig.debug === false
  ) {
    return;
  }
  args.unshift("[Lit-JS-SDK]");
  console.log(...args);
};

/**
 *
 * Get the type of a variable, could be an object instance type.
 * eg Uint8Array instance should return 'Uint8Array` as string
 * or simply a `string` or `int` type
 *
 * @param { * } value
 * @returns { String } type
 */
export const getVarType = (value: any) => {
  return Object.prototype.toString.call(value).slice(8, -1);
  // // if it's an object
  // if (value instanceof Object) {
  //   if (value.constructor.name == "Object") {
  //     return "Object";
  //   }
  //   return value.constructor.name;
  // }

  // // if it's other type, like string and int
  // return typeof value;
};

/**
 *
 *  Check if the given value is the given type
 *  If not, throw `invalidParamType` error
 *
 * @param { * } value
 * @param { Array<String> } allowedTypes
 * @param { string } paramName
 * @param { string } functionName
 * @param { boolean } throwOnError
 * @returns { Boolean } true/false
 */
export const checkType = ({
  value,
  allowedTypes,
  paramName,
  functionName,
  throwOnError = true
}: any) => {
  if (!allowedTypes.includes(getVarType(value))) {
    let message = `Expecting ${allowedTypes.join(
      " or "
    )} type for parameter named ${paramName} in Lit-JS-SDK function ${functionName}(), but received "${getVarType(
      value
    )}" type instead. value: ${
      value instanceof Object ? JSON.stringify(value) : value
    }`;

    if (throwOnError) {
      throwError({
        message,
        name: "invalidParamType",
        errorCode: "invalid_param_type",
      });
    }
    return false;
  }

  return true;
};

export const checkIfAuthSigRequiresChainParam = (
  authSig: any,
  chain: LitChainsKeys,
  functionName: any
) => {
  for (const key of LIT_AUTH_SIG_CHAIN_KEYS) {
    if (key in authSig) {
      return true;
    }
  }

  // // if we're here, then we need the chain param
  // if (
  //   !checkType({
  //     value: chain,
  //     allowedTypes: ["String"],
  //     paramName: "chain",
  //     functionName,
  //   })
  // )
  //   return false;

  return true;
};
