const {v4 : uuidv4} = require('uuid');

module.exports = (usersCodes)=>{
    const generateCode = ()=>{
        const linkId = uuidv4();
        if(usersCodes.includes(linkId)){
           return generateCode()
        }else{
            return linkId
        }
    }

    return generateCode()
}