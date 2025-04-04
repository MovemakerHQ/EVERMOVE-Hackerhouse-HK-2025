import { AccountInfo, NetworkInfo, WalletName, WalletInfo, Wallet, InputTransactionData, AnyRawTransaction, Types, InputGenerateTransactionOptions, AccountAuthenticator, InputSubmitTransactionData, PendingTransactionResponse, SignMessagePayload, SignMessageResponse } from '@aptos-labs/wallet-adapter-core';
export { InputTransactionData, NetworkName, Wallet, WalletName, WalletReadyState, isInAppBrowser, isMobile, isRedirectable } from '@aptos-labs/wallet-adapter-core';
import { ReactNode, FC } from 'react';

interface WalletContextState {
    connected: boolean;
    isLoading: boolean;
    account: AccountInfo | null;
    network: NetworkInfo | null;
    connect(walletName: WalletName): void;
    disconnect(): void;
    wallet: WalletInfo | null;
    wallets: ReadonlyArray<Wallet>;
    signAndSubmitTransaction(transaction: InputTransactionData): Promise<any>;
    signTransaction(transactionOrPayload: AnyRawTransaction | Types.TransactionPayload, asFeePayer?: boolean, options?: InputGenerateTransactionOptions): Promise<AccountAuthenticator>;
    submitTransaction(transaction: InputSubmitTransactionData): Promise<PendingTransactionResponse>;
    signMessage(message: SignMessagePayload): Promise<SignMessageResponse>;
    signMessageAndVerify(message: SignMessagePayload): Promise<boolean>;
}
declare function useWallet(): WalletContextState;

interface AptosWalletProviderProps {
    children: ReactNode;
    plugins: ReadonlyArray<Wallet>;
    autoConnect?: boolean;
    onError?: (error: any) => void;
}
declare const AptosWalletAdapterProvider: FC<AptosWalletProviderProps>;

export { AptosWalletAdapterProvider, AptosWalletProviderProps, useWallet };
