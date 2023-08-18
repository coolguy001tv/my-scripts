
const connections = process.env.JD_PIN_NAMES;
let connectionArr = [];
if(connections){
    try{
        connectionArr = JSON.parse(connections);
    }catch (e){
        console.log(`JD_PIN_NAMES 解析异常`,e);
    }
}


const getNickName = function(pin){
    const theOne = connectionArr.find(one=>one.key===pin);
    if(theOne){
        return theOne.name;
    }
    return '';
}

module.exports = {
    getNickName,
}
