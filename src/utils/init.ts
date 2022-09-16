import { sendMessageToFrameParent } from "./lit";
import LitNodeClient from "./litNodeClient";

export const litJsSdkLoadedInALIT = () => {
  try {
    window.localStorage.getItem("test");
  } catch (e) {
    console.log(
      "Could not use localstorage in a Lit. This usually means we are stuck in the opensea sandbox."
    );
    (window as any).sandboxed = true;
    setTimeout(function () {
      if (typeof document !== "undefined") {
        document.dispatchEvent(new Event("lit-ready"));
      }
    }, 1000);
    return;
  }
  // @ts-expect-error TS(2554): Expected 1 arguments, but got 2.
  sendMessageToFrameParent({ command: "LIT_SYN" }, "*");
  setTimeout(function () {
    if (!(window as any).useLitPostMessageProxy) {
        // console.log(
        //   "inside lit - no parent frame lit node connection.  connecting ourselves."
        // );
        // we're on our own with no parent frame.  initiate our own connection to lit nodes
        // @ts-expect-error TS(2554): Expected 1 arguments, but got 0.
        const litNodeClient = new LitNodeClient();
        litNodeClient.connect();
        (window as any).litNodeClient = litNodeClient;
    }
    else {
        // console.log(
        //   "inside lit - parent frame is connected to lit nodes.  using that."
        // );
    }
}, 1000);
};
