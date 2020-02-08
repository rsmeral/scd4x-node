#SCD30 Sensor Module

SCD30 Sensor Module library to get CO2, temperature and humidity via I2C.
Works well with Raspberry-Pi

##Usage

```
const scd30=require('SCD30');

//To get Data from sensor

//Check sensor is ready 
scd30.isDataReady(function(err,isReady){
	if(err==null){
		if(isReady){
			//Data is ready to read
			scd30.getValues(function(err,co2,temperature,humidity){
				if(err==null){
					console.log(co2);		
					console.log(temperature);
					console.log(humidity);
				}
			});
		}else{
			//Data is not ready to read
		}
	}
});
	
```

###Additional function

```
//start continuous measuring
scd30.startContinuousMeasurement(function(err){});

//start continuous measuring
scd30.stopContinuousMeasurement(function(err){});


/*Enable automatic self calibration mode
	To activate self calibartion:	enable=true
	To deisable self calibration:	enable=false	
*/
scd30.setAutomaticSelfCalibration(enable,function(err){
});



```


