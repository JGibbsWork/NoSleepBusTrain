require('dotenv').config();
const axios = require('axios');

function sortTrain(trains) {
    let south = [];
    let north = [];
    trains.forEach(train => {
        if(train.destNm === 'Loop' || train.destNm === '95th/Dan Ryan') south.push(minutesAway(train.arrT))
        else north.push(minutesAway(train.arrT))
    })
    const result = {south: south.slice(0,4), north: north.slice(0,4)};
    return result;
}

function sortBuses(buses){
    let busEast = [];
    let busWest = [];
    buses.forEach(bus => {
        if(bus.rtdir === 'Eastbound') busEast.push(bus.prdctdn)
            else busWest.push(bus.prdctdn)
    })
    const result = {east: busEast.slice(0,4), west: busWest.slice(0,4)};
    return result;
}

function minutesAway(time) {
    let now = new Date();
    let arrival = new Date(time);
    let diff = arrival - now;
    let minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return minutes.toString();
}

async function getBus() {
    try {
        const response = await axios.get(`https://www.ctabustracker.com/bustime/api/v3/getpredictions?key=${process.env.BUS_KEY}&rt=77&stpid=17379&format=json`)
        return sortBuses(response.data['bustime-response'].prd);
    } catch (err) {
        console.error('Error fetching bus data:', err);
    }
}

async function getRedLine() {
    try {
        const response = await axios.get(`http://lapi.transitchicago.com/api/1.0/ttarrivals.aspx?key=${process.env.TRAIN_KEY}&mapid=41320&rt=Red&outputType=JSON`)
        return sortTrain(response.data.ctatt.eta);
    } catch (err) {
        console.error('Error fetching red line data:', err);
    }
}

async function getBrownLine() {
    try {    
        const response = await axios.get(`http://lapi.transitchicago.com/api/1.0/ttarrivals.aspx?key=${process.env.TRAIN_KEY}&mapid=41320&rt=brn&outputType=JSON`)
        return sortTrain(response.data.ctatt.eta);
    } catch (err) {
        console.error('Error fetching brown line data:', err);
    }
}

async function doAll() {
    const buses = await getBus();
    const red = await getRedLine();
    const brown = await getBrownLine();
    const result = {buses: buses, red: red, brown: brown};
    return await result;
}

module.exports = doAll;