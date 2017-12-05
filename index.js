const converter = require('google-currency');
const got = require('got');

const options = {
    from: "EUR",
    to: "ZAR",
    amount: 1
}

async function getRates() {
    var conversionrate = await converter(options);
    var bitstampLast = await got('https://www.bitstamp.net/api/v2/ticker/btceur/');
    var lunolast = await got('https://api.mybitx.com/api/1/ticker?pair=XBTZAR');

    var x = conversionrate.converted;
    var forex = x + x * 0.04;
    var bitstamp = Number(JSON.parse(bitstampLast.body).last);
    var luno = Number(JSON.parse(lunolast.body).last_trade);

    return { bitstamp, luno, forex };

}

async function getArbitrageEstimates(amountToSpend,feePercentage) {
    var rates = await getRates();

    var bitstampBuyAmountBtc = (amountToSpend - amountToSpend * feePercentage) / rates.bitstamp;
    var lunoSaleAmountZar = rates.luno * bitstampBuyAmountBtc;

    var bitstampBuyAmountZar = rates.forex * amountToSpend;
    var diff = lunoSaleAmountZar - bitstampBuyAmountZar;
    var perc = diff * 100 / bitstampBuyAmountZar;

    console.log("Forex:", rates.forex + " ZAR/1 EUR");
    console.log("Spend:", amountToSpend + " EUR");
    console.log("Bitstamp:", rates.bitstamp + " EUR");
    console.log("Luno:", rates.luno + " ZAR");
    console.log("BTC:", bitstampBuyAmountBtc);
    console.log("ZAR:", lunoSaleAmountZar + " ZAR");
    console.log("Diff:", diff);
    console.log("Percentage:", perc);
    return { perc, diff };
}

var spend = 5000;
var fee = 0.05;
getArbitrageEstimates(spend,fee);

setInterval(async function () {

    console.log("++++++++++++++++++++++++++++")
    console.log("                            ")
    var result = await getArbitrageEstimates(spend,fee);
    if (result.diff >= 3000) {
        console.log("**********yay*************");
    }
}, 10000);

