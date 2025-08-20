import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const ConnectWallet = ({ setProvider, setSigner, setAccount }) => {
    const [buttonText, setButtonText] = useState('Conectar Billetera');

    const connect = async () => {
        if (window.ethereum) {
            try {
                const provider = new ethers.BrowserProvider(window.ethereum);
                const accounts = await provider.send("eth_requestAccounts", []);
                const signer = await provider.getSigner();
                
                setProvider(provider);
                setSigner(signer);
                setAccount(accounts[0]);
                setButtonText(`${accounts[0].substring(0, 6)}...${accounts[0].substring(38)}`);
            } catch (error) {
                console.error("Error al conectar la billetera:", error);
            }
        } else {
            alert('Por favor, instala MetaMask.');
        }
    };

    return <button onClick={connect}>{buttonText}</button>;
};

export default ConnectWallet;