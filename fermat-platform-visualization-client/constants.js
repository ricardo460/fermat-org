var testContent = [
        "cry-plugin-crypto vault-bitcoin",
        "cry-plugin-crypto network-bitcoin",
        "cry-plugin-crypto module-actor address book",
        "cry-plugin-crypto module-wallet address book",
        "cry-plugin-crypto router-incoming crypto",


        "osa-addon-android-database system",
        "osa-addon-android-file system",
        "osa-addon-android-device connectivity",
        "osa-addon-android-device power",
        "osa-addon-android-logger",


        "pip-addon-platform service-event manager",
        "pip-addon-platform service-error manager",
        "pip-addon-platform service-location subsystem",
        "pip-addon-hardware-local device",
        "pip-addon-hardware-remote device",
        "pip-addon-user-device user",
        "pip-android-sub app-developer",
        "pip-android-sub app-sub app manager",
        "pip-plugin-actor-developer",
        "pip-plugin-identity-developer",
        "pip-plugin-module-developer",
        "pip-plugin-network service-subapp resources",


        "p2p-plugin-communication-cloud client",
        "p2p-plugin-communication-cloud server",


        "dmp-plugin-identity-intra user",
        "dmp-plugin-actor-extra user",
        "dmp-plugin-transaction incoming-devide user",
        "dmp-plugin-transaction incoming-extra user",
        "dmp-plugin-transaction incoming-intra user",
        "dmp-plugin-transaction inter-wallet",
        "dmp-plugin-transaction outgoing-devide user",
        "dmp-plugin-transaction outgoing-extra user",
        "dmp-plugin-transaction outgoing-intra user",
        "dmp-plugin-niche wallet type-bank notes wallet",
        "dmp-plugin-niche wallet type-crypto loss protected wallet",
        "dmp-plugin-niche wallet type-crypto wallet",
        "dmp-plugin-niche wallet type-discount wallet",
        "dmp-plugin-niche wallet type-fiat over crypto",
        "dmp-plugin-niche wallet type-fiat over crypto loss protected wallet",
        "dmp-plugin-niche wallet type-multi account wallet",
        "dmp-plugin-network service-bank notes",
        "dmp-plugin-network service-crypto addresses",
        "dmp-plugin-network service-money",
        "dmp-plugin-network service-intra user",
        "dmp-plugin-network service-money request",
        "dmp-plugin-network service-wallet community",
        "dmp-plugin-network service-wallet resources",
        "dmp-plugin-network service-wallet store",
        "dmp-plugin-network service-wallet statistics",
        "dmp-plugin-module-wallet factory",
        "dmp-plugin-module-wallet manager",
        "dmp-plugin-module-wallet publisher",
        "dmp-plugin-module-wallet store",
        "dmp-plugin-engine-sub app runtime",
        "dmp-plugin-engine-wallet runtime",
        "dmp-plugin-middleware-bank notes",
        "dmp-plugin-middleware-money request",
        "dmp-plugin-middleware-wallet contacts",
        "dmp-plugin-composite wallet-multi account wallet",
        "dmp-plugin-basic wallet-bitcoin wallet",
        "dmp-plugin-basic wallet-discount wallet",
        "dmp-plugin-middleware-wallet skin",
        "dmp-plugin-middleware-wallet language",
        "dmp-plugin-middleware-wallet factory",
        "dmp-plugin-middleware-wallet store",
        "dmp-plugin-middleware-wallet publisher",
        "dmp-plugin-middleware-wallet manager",
        "dmp-plugin-middleware-wallet settings",
        "dmp-addon-license-wallet",
        "dmp-android-reference-niche wallet-bitcoin-wallet",
        "dmp-android-sub app-wallet manager",
        "dmp-android-sub app-wallet store",
        "dmp-android-sub app-wallet factory",
        "dmp-android-sub app-wallet publisher",
        "dmp-android-sub app-shop manager"
    ];


//33 layers
var layers = {
    "Android" : 0,
    "Multi OS" : 1,
    "Platform Service" : 2,
    "Hardware" : 3,
    "User" : 4,
    "Plugin" : 5,
    "License" : 6,
    "Crypto Network" : 7,
    "Crypto Vault" : 8,
    "Crypto Module" : 9,
    "Crypto Router" : 10,
    "Communication" : 11,
    "Network Service" : 12,
    "Identity" : 13,
    "Asset" : 14,
    "World" : 15,
    "Wallet" : 16, //Maybe Basic Wallet
    "Composite Wallet" : 17,
    "Contract" : 18,
    "Cash Transaction" : 19,
    "Digital Money Transaction" : 20,
    "Business Transaction" : 21,
    "Request" : 22,
    "Middleware" : 23,
    "Actor" : 24,
    "Device Private Network" : 25,
    "Agent" : 26,
    "Sub App Module" : 27,
    "Wallet Module" : 28,
    "Engine" : 29,
    "Sub App" : 30,
    "Reference Niche Wallet" : 31,
    "Niche Wallet" : 32,
    "Branded Wallet" : 33,
    
    size : function(){
        var size = 0;
        
        for(var key in this){
            if(this.hasOwnProperty(key))
                size++;
        }
        
        return size;
    }
};

var groups = {
    "PIP": 0,
    "DMP": 1,
    "CRY": 2,
    "OSA": 3,
    "P2P": 4,
    
    size : function(){
        var size = 0;
        
        for(var key in this){
            if(this.hasOwnProperty(key))
                size++;
        }
        
        return size;
    }
};