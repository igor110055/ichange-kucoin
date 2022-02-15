module.exports = (number , DecimalNumber)=>{
    console.log(number)
    number = number.toString();
    DecimalNumber = DecimalNumber.toString();
    const numberDecimal = number.split('.');
    const decimalLength = DecimalNumber.split('.')[1].length;
    return Number(numberDecimal[0] + "." +  numberDecimal[1].slice(0 , decimalLength))
}