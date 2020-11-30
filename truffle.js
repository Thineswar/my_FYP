module.exports = {
    networks: {
        live: {
            host: "127.0.0.1",
            port: 7545,
            network_id: "5777",
            gas: 0,
            value: 0,
            gasPrice: 0,
            from: "0xeE9b6a533854b0a45F61A1BA9cA0a4752A6c639b"
        }
    },
    compilers: {
        solc: {
            version: "0.4.20"
        }
    }
};
