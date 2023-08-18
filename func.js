


const getNickName = function(pin){
    const connections = process.env.JD_PIN_NAMES;
    if(connections){
        try{
            const arr = JSON.parse(connections);
            const theOne = arr.find(one=>one.key===pin);
            if(theOne){
                return theOne.name;
            }
            return '';
        }catch (e){
            console.log(`JD_PIN_NAMES 解析异常`,e);
        }
    }
    return '';
}

module.exports = {
    getNickName,
}
