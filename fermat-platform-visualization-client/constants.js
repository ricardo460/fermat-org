var testContent = [
        //CRY
        "pip-plugin-crypto vault-bitcoin",
        "pip-plugin-crypto network-bitcoin",
        "pip-plugin-crypto module-actor address book",
        "pip-plugin-crypto module-wallet address book",
        "pip-plugin-crypto router-incoming crypto",

        //OSA
        "pip-addon-android-database system",
        "pip-addon-android-file system",
        "pip-addon-android-device connectivity",
        "pip-addon-android-device power",
        "pip-addon-android-logger",


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

        //P2P
        "pip-plugin-communication-cloud client",
        "pip-plugin-communication-cloud server",


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
    "Android" : 33,
    "Multi OS" : 32,
    "Platform Service" : 31,
    "Hardware" : 30,
    "User" : 29,
    "Plugin" : 28,
    "License" : 27,
    "Crypto Network" : 26,
    "Crypto Vault" : 25,
    "Crypto Module" : 24,
    "Crypto Router" : 23,
    "Communication" : 22,
    "Network Service" : 21,
    "Identity" : 20,
    "Asset" : 19,
    "World" : 18,
    "Wallet" : 17, //Maybe Basic Wallet
    "Composite Wallet" : 16,
    "Contract" : 15,
    "Cash Transaction" : 14,
    "Digital Money Transaction" : 13,
    "Business Transaction" : 12,
    "Request" : 11,
    "Middleware" : 10,
    "Actor" : 9,
    "Device Private Network" : 8,
    "Agent" : 7,
    "Sub App Module" : 6,
    "Wallet Module" : 5,
    "Engine" : 4,
    "Sub App" : 3,
    "Reference Niche Wallet" : 2,
    "Niche Wallet" : 1,
    "Branded Wallet" : 0,
    
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
    /*"CRY": 2,
    "OSA": 3,
    "P2P": 4,*/
    
    size : function(){
        var size = 0;
        
        for(var key in this){
            if(this.hasOwnProperty(key))
                size++;
        }
        
        return size - 1;
    }
};