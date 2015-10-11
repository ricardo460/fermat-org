var processes = [{
    name: 'Generacion Asset en Wallet Factory',
    description: '',
    steps: [{
        type: 'start',
        title: 'Bitcoin Wallet',
        desc: 'long getAvailableBalance()\nObtiene el balance actual de los bitcoins para habilitar el boton de publicar calculando el monto total de los bitcoins a necesitar para enviar los assets\nMonto Total: (Cantidad de Assets * Valor Unitario) + fee',
        suprlay: null,
        platfrm: 'DAP',
        layer: null,
        comp: 'wallet factory sub app',
        next: [1]
    }, {
        type: 'activity',
        title: 'Asset Issuing Transaction',
        desc: 'void issueAsset(DigitalAsset, amount, blockchainNetworkType)\nInicia la transacción de IssueAsset pasando el DigitalAsset y la cantidad de assets a generar',
        suprlay: null,
        platfrm: 'DAP',
        layer: null,
        comp: 'wallet factory sub app',
        next: [2]
    }, {
        type: 'activity',
        title: 'Bitcoin Wallet',
        desc: 'long getAvailableBalance()\nObtiene el balance actual de los bitcoins para habilitar el boton de publicar calculando el monto total de los bitcoins a necesitar para enviar los assets\nMonto Total: (Cantidad de Assets * Valor Unitario) + fee',
        suprlay: null,
        platfrm: 'DAP',
        layer: null,
        comp: 'Asset Issuing Transaction',
        next: [3]
    }, {
        type: 'activity',
        title: 'Asset CryptoVault',
        desc: 'CryptoAddress getNewAssetVaultCryptoAddress(BlockchainAddress)\nLa asset vault entrega una direccio bitcoin que es registrada en el Address Book. Esta direccion es la Genesis Address',
        suprlay: null,
        platfrm: 'DAP',
        layer: null,
        comp: 'Asset Issuing Transaction',
        next: [4, 5]
    }, {
        type: 'preparation',
        title: 'Address Book',
        desc: 'NA\nRegistra la GenesisAddress en el address book para detectar luego el ingreso del bitcoin',
        suprlay: null,
        platfrm: 'DAP',
        layer: null,
        comp: 'Asset CryptoVault',
        next: []
    }, {
        type: 'activity',
        title: 'Asset Issuing Transaction',
        desc: 'private bool isDigitalAssetComplete()\nMe aseguro que el DigitalAsset esta completo antes de generar el hash del mismo y formar el objeto DigitalAssetMetadata',
        suprlay: null,
        platfrm: 'DAP',
        layer: null,
        comp: 'Asset Issuing Transaction',
        next: [6]
    }, {
        type: 'activity',
        title: 'Outgoing Intra Actor',
        desc: 'public String sendCrypto(String walletPublicKey, CryptoAddress destinationAddress, String op_Return, long cryptoAmount, String description, String senderPublicKey, String receptorPublicKey, Actors senderActorType, Actors receptorActorType, ReferenceWallet referenceWallet)\nHago el envio de los bitcoins a traves del Outgoing Intra Actor Transaction. El mismo va a generar una transaccion bitcoin y me va a devolver el hash de la misma. Este hash es la genesis transaction que debo ingresar en el DigitalAssetMetadata',
        suprlay: null,
        platfrm: 'DAP',
        layer: null,
        comp: 'Asset Issuing Transaction',
        next: [7]
    }, {
        type: 'activity',
        title: '',
        desc: 'Genero y persisto el objeto DigitalAssetMetadata, que forma la "mitad" del asset',
        suprlay: null,
        platfrm: 'DAP',
        layer: null,
        comp: 'Asset Issuing Transaction',
        next: [3, 8]
    }, {
        type: 'preparation',
        title: 'cloud',
        desc: '',
        suprlay: null,
        platfrm: null,
        layer: null,
        comp: null,
        next: [9]
    }, {
        type: 'activity',
        title: 'Incoming Crypto',
        desc: 'NA\nDetecta la llegada de Bitcoins a la GenesisAddress y dispara el evento de IncomingCryptoDigitalAssetOnCryptoNetwork',
        suprlay: null,
        platfrm: 'DAP',
        layer: null,
        comp: 'Asset Issuing Transaction',
        next: [10]
    }, {
        type: 'activity',
        title: 'Issuer AssetWallet',
        desc: 'bookCredit(DigitalAssetMetadata)\nGenera un credito en el book balance de la Issuer Asset Wallet y persiste el DigitalAssetMetadata en la Issuer Wallet',
        suprlay: null,
        platfrm: 'DAP',
        layer: null,
        comp: 'Asset Issuing Transaction',
        next: [11]
    }, {
        type: 'activity',
        title: 'Incoming Crypto',
        desc: 'NA\nDetecta la llegada de Bitcoins a la GenesisAddress y dispara el evento de IncomingCryptoDigitalAssetOnBlockChain',
        suprlay: null,
        platfrm: 'DAP',
        layer: null,
        comp: 'Asset Issuing Transaction',
        next: [12]
    }, {
        type: 'end',
        title: 'Issuer AssetWallet',
        desc: 'availableCredit(DigitalAssetMetadata)\nGenera un credito en el available balance de la Issuer Asset Wallet',
        suprlay: null,
        platfrm: 'DAP',
        layer: null,
        comp: 'Asset Issuing Transaction',
        next: []
    }]
}];