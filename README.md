## Settings for Teltonika devices

#### System parameters
- *Sleep Mode (ID=102)*: **0** - for disable sleep mode
- *Saving/Sending without time synchronization (ID=107)*: 1 records can be saved and sent to server without time synchronization. 

#### Records parameters

- *Sorting (ID=1002)*: 1 - arranging data starting from oldest
- *Open Link Timeout (ID=1000)*: 60 - keep 60 seconds after fix

#### GSM parameters

- *GPRS content activation (ID=2000)*: 1 - use GPRS
- *Domain (ID=2004)*: d1.vinchain.io
- *Target Server Port (ID=2005)*: 16500
- *Protocol (ID=2006)*: 0 - TCP

#### SMS/Call settings

- *SMS Login (ID=3003)*: ???
- *SMS Password (ID=3004)*: ???


#### Data Acquisition Modes parameters

##### Home Network GSM operator code “Vehicle on STOP” parameters
- *Send Period (ID=10005)*: 10

##### Home Network GSM operator code “Vehicle MOVING” parameters
- *Send Period (ID=10055)*: 10


## Composite SMS

102:0;107:1;1002:1;1000:60;2000:1;2006:0;10005:10;10055:10;2004:5.61.36.138;2005:16500
