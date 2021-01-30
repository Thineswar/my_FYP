module.exports = {
    networks: {
        live: {
            host: "127.0.0.1",
            port: 7545,
            network_id: "5777",
            gasPrice: 0,
            gas: 0, 
            from: "0x67D8A7361032ef0EEbD955Fb68a8BAb64A19d04C"
        }
    },
    compilers: {
        solc: {
            version: "0.4.20"
        }
    }
};


