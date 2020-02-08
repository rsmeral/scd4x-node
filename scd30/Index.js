var i2c = require('i2c');
var f32=require('./IEE75432BitFloat.js');

const SCD30_ADDRESS=0x61;

var SCD30=new i2c(SCD30_ADDRESS,{device: '/dev/i2c-1'})

//callback-err,res
function isDataReady(callback){
    SCD30.write([0x02,0x02],function(err){	
        if(err){
                callback("I2C Write Error",null);
        }else{
            SCD30.read(2,function(err,res){
                if(err){
                    callback("I2C Read Error",null);
                }else{
                    var value=res[0];
                    value=value<<8;
                    value=value|res[1];
                    
                    if(value==1){
                        //Data Ready
                        callback(null,true);
                    }else{
                        //Data not ready
                        callback("I2C Read Error",false);
                    }
                }
            });
        }

	});
}

//callback function-err,co2,temp,humidity
function getValues(callback){
    var co2Concentration=0;
    var ambientTemperature=0;
    var humidity=0;

    SCD30.write([0x03,0x00],function(err){
		if(err==null){	
            SCD30.read(18,function(err,res){
                
                if(err==null){
                    //CO2 data
                    var co2_MMSB=res[0];
                    var co2_MLSB=res[1];
                    var co2_LMSB=res[3];
                    var co2_LLSB=res[4];
                    
                    //Temperature
                    var temperature_MMSB=res[6];
                    var temperature_MLSB=res[7];
                    var temperature_LMSB=res[9];
                    var temperature_LLSB=res[10];
                    
                    //humidity
                    var humidity_MMSB=res[12];
                    var humidity_MLSB=res[13];
                    var humidity_LMSB=res[15];
                    var humidity_LLSB=res[16];
                    
                    
                
                    f32.calculateFloat32(co2_MMSB,co2_MLSB,co2_LMSB,co2_LLSB,function(res){
                        console.log("CO2 concentration: "+res);
                        co2Concentration=res;
                        co2Concentration=Math.round(co2Concentration); 
                    });
                    
                    f32.calculateFloat32(temperature_MMSB,temperature_MLSB,temperature_LMSB,temperature_LLSB,function(res){
                        console.log("Temperature: "+res);
                        ambientTemperature=res;
                        ambientTemperature=ambientTemperature.toFixed(2);
                    });
                    
                    f32.calculateFloat32(humidity_MMSB,humidity_MLSB,humidity_LMSB,humidity_LLSB,function(res){
                        console.log("Humidity: "+res);
                        humidity=res;
                        humidity=Math.round(humidity);
                    });

                    callback(null,co2Concentration,ambientTemperature,humidity);
                }else{
                    callback("I2C Read Error",null,null,null);
                }
            });
        }else{
            callback("I2C Write Error",null,null,null);
        }
    });
}

function startContinuousMeasurement(callback){
	SCD30.write([0x03,0x00,0x00,0x00],function(err){
		if(err){
			callback(err);
		}else{
			callback(null);
		}
	});
}

function stopContinuousMeasurement(callback){
	SCD30.write([0x01,0x04],function(err){
		if(err){
			callback(err);
		}else{
			callback(null);
		}
	});
}

function stratContinousMeasurementWithPressure(pressure,callback){
	//need to complete
	if(pressure>=700 && pressure<=1200){
		
	}
	
}

function setMeasurementInterval(interval,callback){
}

function setAutomaticSelfCalibration(activate,callback)
	if(activate==true){
		//Activat self calibration
		SCD30.write([0x53,0x06,0x00,0x01],function(err){
			if(err){
				callback(err);
			}else{
				callback(null);
			}
		});
	}else{
		//Deactivat self calibration
		SCD30.write([0x53,0x06,0x00,0x00],function(err){
			if(err){
				callback(err);
			}else{
				callback(null);
			}
		});
	}
}

module.exports={isDataReady,getData,startContinuousMeasurement,stopContinuousMeasurement,setAutomaticSelfCalibration}
