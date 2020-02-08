
//Values in address in decimal
var address1=0;
var address2=0;
var address3=0;
var address4=0;

//Converted bit
var bin=0;

//IEE754 32 bit single precession float
var sign=0;
var exponent=0;
var mantissa=0;

//Result
var result=0;

function calculateFloat(){
    for(i=1;i<33;i++){
        if(i==1){
            sign=Math.pow((-1),(getValue(i)));
        }else if(i>1 && i<10){
            var positionValue=9-i;
            exponent=exponent+((getValue(i))*Math.pow(2,positionValue));
        }else if(i>9 && i<33){
            var positionValue=i-9;
            mantissa=mantissa+((getValue(i))*Math.pow(2,-positionValue));
        }
    }
    result=sign*Math.pow(2,(exponent-127))*(1+mantissa);
}

//1-32
function getValue(position){ 
    position=position-1;
    var frontZero=32-bin.length;

    if(position<frontZero){
        return 0;
    }else{
        var realPosition=position-frontZero;
        return bin[realPosition];
    }
}


function calculateFloat32(add1,add2,add3,add4,callback){
    address1=add1;
    address2=add2;
    address3=add3;
    address4=add4;

    var val=0;

    //get binary
    val=add1<<8;
    val=val|add2;
    val=val<<8;
    val=val|add3;
    val=val<<8;
    val=val|add4;
    bin=(val).toString(2)

    calculateFloat();

    //console.log(result);
    //return result;
    if(callback){
        callback(result)
    }
	
	address1=0;
    address2=0;
    address3=0;
    address4=0;
	bin=0;
	result=0
	sign=0;
	exponent=0;
	mantissa=0;
	
}

module.exports={calculateFloat32}